import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LatestPrice {
  item: string;
  price_rm: number;
  prev_price_rm: number | null;
}

export function useLatestPrices() {
  return useQuery({
    queryKey: ["latest-prices"],
    queryFn: async (): Promise<LatestPrice[]> => {
      // Get the most recent date that has data
      const { data: latestRow, error: dateErr } = await supabase
        .from("food_prices")
        .select("date")
        .order("date", { ascending: false })
        .limit(1)
        .single();

      if (dateErr || !latestRow) return [];

      const latestDate = latestRow.date;

      // Get all items for the latest date (excluding basket)
      const { data: todayPrices, error: todayErr } = await supabase
        .from("food_prices")
        .select("item, price_rm")
        .eq("date", latestDate)
        .neq("item", "basket");

      if (todayErr || !todayPrices) return [];

      // Get previous day's date
      const prevDate = new Date(latestDate);
      prevDate.setDate(prevDate.getDate() - 1);
      const prevDateStr = prevDate.toISOString().split("T")[0];

      const { data: prevPrices } = await supabase
        .from("food_prices")
        .select("item, price_rm")
        .eq("date", prevDateStr)
        .neq("item", "basket");

      const prevMap: Record<string, number> = {};
      if (prevPrices) {
        for (const p of prevPrices) {
          prevMap[p.item] = p.price_rm;
        }
      }

      return todayPrices.map((p) => ({
        item: p.item,
        price_rm: p.price_rm,
        prev_price_rm: prevMap[p.item] ?? null,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}
