import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type FoodItem = "basket" | "chicken" | "eggs" | "tomato" | "longbeans" | "rice" | "milk";
export type TimePeriod = "1y" | "2y" | "all";

export interface ChartDataPoint {
  date: string;
  dateRaw: string;
  nominal: number;
  cpi: number;
  real: number;
}

export interface PriceStats {
  currentPrice: number;
  percentChange: number;
  startPrice: number;
}

function getStartDate(period: TimePeriod): string {
  const now = new Date();
  if (period === "1y") {
    now.setFullYear(now.getFullYear() - 1);
  } else if (period === "2y") {
    now.setFullYear(now.getFullYear() - 2);
  } else {
    return "2024-01-01";
  }
  return now.toISOString().split("T")[0];
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

      // Build CPI lookup by month
      const cpiByMonth: Record<string, number> = {};
      for (const c of cpiData) {
        const monthKey = c.date.substring(0, 7);
        cpiByMonth[monthKey] = c.value;
      }

      // Sample data to avoid too many points (max ~365 points)
      const sampleRate = Math.max(1, Math.floor(prices.length / 365));

      const chartData: ChartDataPoint[] = [];
      for (let i = 0; i < prices.length; i += sampleRate) {
        const p = prices[i];
        const monthKey = p.date.substring(0, 7);
        const cpi = cpiByMonth[monthKey] || 100;
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
        });
      }

      // Always include the last data point
      if (prices.length > 0) {
        const last = prices[prices.length - 1];
        const lastInChart = chartData[chartData.length - 1];
        if (!lastInChart || lastInChart.dateRaw !== last.date) {
          const monthKey = last.date.substring(0, 7);
          const cpi = cpiByMonth[monthKey] || 100;
          chartData.push({
            dateRaw: last.date,
            date: new Date(last.date).toLocaleDateString("en", {
              month: "short",
              year: "2-digit",
            }),
            nominal: last.price_rm,
            cpi,
            real: Math.round((last.price_rm / cpi) * 100 * 100) / 100,
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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
