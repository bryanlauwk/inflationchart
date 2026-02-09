import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { FoodItem } from "@/hooks/useFoodPrices";

export interface ItemAnalysis {
  item: FoodItem;
  price2022: number;
  priceLatest: number;
  nominalChangePct: number;
  realChangePct: number;
}

export interface PurchasingPowerData {
  losers: ItemAnalysis[]; // real price went up (purchasing power down)
  stable: ItemAnalysis[]; // real price stayed flat or went down (subsidized)
  cpiChange: number; // cumulative CPI change %
}

export function usePurchasingPowerAnalysis() {
  return useQuery({
    queryKey: ["purchasing-power-analysis"],
    queryFn: async (): Promise<PurchasingPowerData> => {
      // Determine the latest available date dynamically
      const { data: latestRow } = await supabase
        .from("food_prices")
        .select("date")
        .neq("item", "basket")
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latestRow) throw new Error("No food price data available");

      // Use the last 3 months of data for the "latest" period
      const latestDate = new Date(latestRow.date);
      const threeMonthsAgo = new Date(latestDate);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 2);
      threeMonthsAgo.setDate(1);
      const lateCutoff = threeMonthsAgo.toISOString().split("T")[0];

      // Fetch early period (Q1 2022) and latest period averages + CPI
      const [earlyPrices, latePrices, earlyCpi, lateCpi] = await Promise.all([
        supabase
          .from("food_prices")
          .select("item, price_rm")
          .gte("date", "2022-01-01")
          .lte("date", "2022-03-31")
          .neq("item", "basket"),
        supabase
          .from("food_prices")
          .select("item, price_rm")
          .gte("date", lateCutoff)
          .neq("item", "basket"),
        supabase
          .from("indicators")
          .select("value")
          .eq("type", "CPI")
          .gte("date", "2022-01-01")
          .lte("date", "2022-03-31"),
        supabase
          .from("indicators")
          .select("value")
          .eq("type", "CPI")
          .gte("date", lateCutoff),
      ]);

      if (earlyPrices.error) throw earlyPrices.error;
      if (latePrices.error) throw latePrices.error;

      // Compute averages
      const avgByItem = (rows: { item: string; price_rm: number }[]) => {
        const sums: Record<string, { total: number; count: number }> = {};
        for (const r of rows) {
          if (!sums[r.item]) sums[r.item] = { total: 0, count: 0 };
          sums[r.item].total += r.price_rm;
          sums[r.item].count += 1;
        }
        const result: Record<string, number> = {};
        for (const [k, v] of Object.entries(sums)) {
          result[k] = v.total / v.count;
        }
        return result;
      };

      const earlyAvg = avgByItem(earlyPrices.data || []);
      const lateAvg = avgByItem(latePrices.data || []);

      // CPI averages
      const avgCpi = (rows: { value: number }[] | null) => {
        if (!rows?.length) return 100;
        return rows.reduce((s, r) => s + r.value, 0) / rows.length;
      };

      const cpiEarly = avgCpi(earlyCpi.data);
      const cpiLate = avgCpi(lateCpi.data);
      const cpiChange = ((cpiLate - cpiEarly) / cpiEarly) * 100;

      // Build analysis per item
      const items: ItemAnalysis[] = [];
      for (const item of Object.keys(earlyAvg)) {
        if (!lateAvg[item]) continue;
        const p1 = earlyAvg[item];
        const p2 = lateAvg[item];
        const nominalPct = ((p2 - p1) / p1) * 100;
        const realP1 = (p1 / cpiEarly) * 100;
        const realP2 = (p2 / cpiLate) * 100;
        const realPct = ((realP2 - realP1) / realP1) * 100;

        items.push({
          item: item as FoodItem,
          price2022: Math.round(p1 * 100) / 100,
          priceLatest: Math.round(p2 * 100) / 100,
          nominalChangePct: Math.round(nominalPct * 10) / 10,
          realChangePct: Math.round(realPct * 10) / 10,
        });
      }

      // Sort by real change descending (biggest losers first)
      items.sort((a, b) => b.realChangePct - a.realChangePct);

      // Split all items: losers = real price went up, stable = rest
      const losers = items.filter((i) => i.realChangePct > 0);
      const stable = items
        .filter((i) => i.realChangePct <= 0)
        .sort((a, b) => a.realChangePct - b.realChangePct);

      return {
        losers,
        stable,
        cpiChange: Math.round(cpiChange * 10) / 10,
      };
    },
    staleTime: 30 * 60 * 1000, // 30 min cache — this changes rarely
  });
}
