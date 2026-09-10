import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MonthPrice, PriceIndex } from "@/lib/basket";
import { isItemId, type ItemId } from "@/lib/catalogue";

/**
 * A month only counts as usable for an item when there are enough observed days
 * behind the average. Below this, a single stray survey day could drive the
 * whole comparison.
 */
export const MIN_OBSERVED_DAYS = 3;

export interface MonthlyDataset {
  /** month -> item -> observed average */
  prices: PriceIndex;
  /** Months with at least a few items observed, ascending. */
  months: string[];
  /** Items observed at least once. */
  items: ItemId[];
  /** Newest observed daily date across all items. */
  latestObservation: string | null;
  /** CPI (core) by month, with no gap filling. */
  cpiByMonth: Record<string, number>;
  latestCpiMonth: string | null;
  /** How many items each month has usable data for. */
  itemsPerMonth: Record<string, number>;
}

interface MonthlyRow {
  item: string;
  month: string;
  avg_price_rm: number | string;
  observed_days: number;
  first_observed: string;
  last_observed: string;
}

async function fetchAllMonthlyRows(): Promise<MonthlyRow[]> {
  const pageSize = 1000;
  const all: MonthlyRow[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await (supabase as any)
      .from("monthly_item_prices")
      .select("item, month, avg_price_rm, observed_days, first_observed, last_observed")
      .order("month", { ascending: true })
      .order("item", { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    const rows = (data ?? []) as MonthlyRow[];
    all.push(...rows);
    if (rows.length < pageSize) break;
  }
  return all;
}

export function useMonthlyPrices() {
  return useQuery<MonthlyDataset>({
    queryKey: ["monthly-prices"],
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const [rows, cpiRes] = await Promise.all([
        fetchAllMonthlyRows(),
        (supabase as any)
          .from("monthly_indicators")
          .select("month, value, type")
          .eq("type", "CPI")
          .order("month", { ascending: true }),
      ]);

      if (cpiRes.error) throw cpiRes.error;

      const prices: PriceIndex = {};
      const itemSet = new Set<ItemId>();
      const itemsPerMonth: Record<string, number> = {};
      let latestObservation: string | null = null;

      for (const row of rows) {
        if (!isItemId(row.item)) continue;
        if (row.observed_days < MIN_OBSERVED_DAYS) continue;
        const avg = Number(row.avg_price_rm);
        if (!Number.isFinite(avg) || avg <= 0) continue;

        const entry: MonthPrice = {
          avgPrice: Math.round(avg * 100) / 100,
          observedDays: row.observed_days,
          firstObserved: row.first_observed,
          lastObserved: row.last_observed,
        };

        if (!prices[row.month]) prices[row.month] = {};
        prices[row.month][row.item] = entry;
        itemSet.add(row.item);
        itemsPerMonth[row.month] = (itemsPerMonth[row.month] ?? 0) + 1;
        if (!latestObservation || row.last_observed > latestObservation) {
          latestObservation = row.last_observed;
        }
      }

      const cpiByMonth: Record<string, number> = {};
      for (const row of (cpiRes.data ?? []) as Array<{ month: string; value: number | string }>) {
        const value = Number(row.value);
        if (Number.isFinite(value) && value > 0) cpiByMonth[row.month] = value;
      }
      const cpiMonths = Object.keys(cpiByMonth).sort();

      const months = Object.keys(prices).sort();

      return {
        prices,
        months,
        items: Array.from(itemSet),
        latestObservation,
        cpiByMonth,
        latestCpiMonth: cpiMonths.length ? cpiMonths[cpiMonths.length - 1] : null,
        itemsPerMonth,
      };
    },
  });
}

/**
 * Months usable for the game: at least a handful of items observed, so a
 * comparison is not built on one lonely reading.
 */
export function usableMonths(data: MonthlyDataset | undefined, minItems = 5): string[] {
  if (!data) return [];
  return data.months.filter((m) => (data.itemsPerMonth[m] ?? 0) >= minItems);
}

/**
 * Picks sensible defaults from the ACTUAL data: the newest usable month, and a
 * comparable earlier month roughly four years back (or the earliest available).
 */
export function defaultMonthPair(months: string[]): { baseline: string; comparison: string } | null {
  if (months.length === 0) return null;
  const comparison = months[months.length - 1];
  const targetYear = Number(comparison.slice(0, 4)) - 4;
  const target = `${targetYear}-${comparison.slice(5, 7)}`;
  const earlier = months.filter((m) => m < comparison);
  if (earlier.length === 0) return { baseline: comparison, comparison };
  const baseline =
    earlier.find((m) => m >= target) ?? earlier[0];
  return { baseline, comparison };
}
