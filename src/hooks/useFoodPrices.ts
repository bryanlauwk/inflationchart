import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type FoodItem =
  | "basket"
  | "chicken"
  | "eggs"
  | "tomato"
  | "longbeans"
  | "rice"
  | "milk"
  | "kangkung"
  | "onion"
  | "sugar"
  | "cookingoil"
  | "chili"
  | "cabbage"
  | "spinach"
  | "papaya"
  | "banana"
  | "watermelon"
  | "lime";

export type TimePeriod = "1y" | "2y" | "3y" | "4y" | "all";

export interface ChartDataPoint {
  date: string;
  dateRaw: string;
  nominal: number;
  cpi: number;
  real: number;
  /** True when CPI for this month is unavailable and a fallback value was used */
  cpiFallback?: boolean;
}

export interface PriceStats {
  currentPrice: number;
  percentChange: number;
  startPrice: number;
}

// Category groupings for UI
export const ITEM_CATEGORIES = {
  staples: ["basket", "chicken", "eggs", "rice", "milk", "sugar", "cookingoil"] as FoodItem[],
  vegetables: ["tomato", "longbeans", "kangkung", "onion", "chili", "cabbage", "spinach"] as FoodItem[],
  fruits: ["papaya", "banana", "watermelon", "lime"] as FoodItem[],
};

export const ALL_ITEMS: FoodItem[] = [
  ...ITEM_CATEGORIES.staples,
  ...ITEM_CATEGORIES.vegetables,
  ...ITEM_CATEGORIES.fruits,
];

// The 10 core items that contribute to the basket composite
export const BASKET_ITEMS_LIST = [
  "chicken", "eggs", "rice", "sugar",
  "cookingoil", "tomato", "longbeans", "kangkung", "onion",
] as const;

export const BASKET_SIZE = BASKET_ITEMS_LIST.length; // 9

function getStartDate(period: TimePeriod): string {
  const now = new Date();
  if (period === "1y") {
    now.setFullYear(now.getFullYear() - 1);
  } else if (period === "2y") {
    now.setFullYear(now.getFullYear() - 2);
  } else if (period === "3y") {
    now.setFullYear(now.getFullYear() - 3);
  } else if (period === "4y") {
    now.setFullYear(now.getFullYear() - 4);
  } else {
    return "2022-01-01";
  }
  return now.toISOString().split("T")[0];
}

/**
 * Fetch all rows from a query using pagination to avoid the 1000-row limit.
 */
async function fetchAllRows<T>(
  queryBuilder: any
): Promise<T[]> {
  const results: T[] = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await queryBuilder.range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    results.push(...(data as T[]));
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return results;
}

export function useFoodPrices(item: FoodItem, period: TimePeriod) {
  return useQuery({
    queryKey: ["food-prices", item, period],
    queryFn: async (): Promise<{ chartData: ChartDataPoint[]; stats: PriceStats }> => {
      const startDate = getStartDate(period);

      // Fetch prices and CPI in parallel
      const [pricesRes, cpiRes] = await Promise.all([
        supabase
          .from("food_prices")
          .select("date, price_rm")
          .eq("item", item)
          .gte("date", startDate)
          .order("date", { ascending: true }),
        supabase
          .from("indicators")
          .select("date, value")
          .eq("type", "CPI")
          .gte("date", startDate)
          .order("date", { ascending: true }),
      ]);

      if (pricesRes.error) throw pricesRes.error;
      if (cpiRes.error) throw cpiRes.error;

      const prices = pricesRes.data || [];
      const cpiData = cpiRes.data || [];

      // Build CPI lookup by month and track the latest known CPI
      const cpiByMonth: Record<string, number> = {};
      let latestCpi = 100;
      let latestCpiMonth = "";
      for (const c of cpiData) {
        const monthKey = c.date.substring(0, 7);
        cpiByMonth[monthKey] = c.value;
        latestCpi = c.value; // ascending order, so last = latest
        latestCpiMonth = monthKey;
      }

      // Sample data to avoid too many points (max ~365 points)
      const sampleRate = Math.max(1, Math.floor(prices.length / 365));

      const chartData: ChartDataPoint[] = [];
      for (let i = 0; i < prices.length; i += sampleRate) {
        const p = prices[i];
        const monthKey = p.date.substring(0, 7);
        const hasCpi = !!cpiByMonth[monthKey];
        const cpi = hasCpi ? cpiByMonth[monthKey] : latestCpi;
        const real = Math.round((p.price_rm / cpi) * 100 * 100) / 100;

        chartData.push({
          dateRaw: p.date,
          date: new Date(p.date).toLocaleDateString("en", {
            month: "short",
            year: "2-digit",
          }),
          nominal: p.price_rm,
          cpi,
          real,
          cpiFallback: !hasCpi,
        });
      }

      // Always include the last data point
      if (prices.length > 0) {
        const last = prices[prices.length - 1];
        const lastInChart = chartData[chartData.length - 1];
        if (!lastInChart || lastInChart.dateRaw !== last.date) {
          const monthKey = last.date.substring(0, 7);
          const hasCpi = !!cpiByMonth[monthKey];
          const cpi = hasCpi ? cpiByMonth[monthKey] : latestCpi;
          chartData.push({
            dateRaw: last.date,
            date: new Date(last.date).toLocaleDateString("en", {
              month: "short",
              year: "2-digit",
            }),
            nominal: last.price_rm,
            cpi,
            real: Math.round((last.price_rm / cpi) * 100 * 100) / 100,
            cpiFallback: !hasCpi,
          });
        }
      }

      // Calculate stats
      const stats: PriceStats = {
        currentPrice: 0,
        percentChange: 0,
        startPrice: 0,
      };

      if (chartData.length > 0) {
        const first = chartData[0];
        const last = chartData[chartData.length - 1];
        stats.currentPrice = last.nominal;
        stats.startPrice = first.nominal;
        stats.percentChange =
          first.nominal > 0
            ? Math.round(((last.nominal - first.nominal) / first.nominal) * 1000) / 10
            : 0;
      }

      return { chartData, stats };
    },
    staleTime: 5 * 60 * 1000,
  });
}
