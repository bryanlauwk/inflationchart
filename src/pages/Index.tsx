import { useState } from "react";
import { PriceHeader } from "@/components/PriceHeader";
import { PriceChart } from "@/components/PriceChart";
import { PriceSidebar } from "@/components/PriceSidebar";
import { useFoodPrices } from "@/hooks/useFoodPrices";
import type { FoodItem, TimePeriod } from "@/hooks/useFoodPrices";

const Index = () => {
  const [item, setItem] = useState<FoodItem>("basket");
  const [period, setPeriod] = useState<TimePeriod>("2y");

  const { data, isLoading } = useFoodPrices(item, period);

  const chartData = data?.chartData || [];
  const stats = data?.stats || { currentPrice: 0, percentChange: 0, startPrice: 0 };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PriceHeader
        item={item}
        period={period}
        onItemChange={setItem}
        onPeriodChange={setPeriod}
      />

      <main className="mx-auto max-w-7xl p-4 md:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          <PriceChart data={chartData} loading={isLoading} />
          <PriceSidebar stats={stats} period={period} loading={isLoading} />
        </div>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground">
        Built by{" "}
        <a
          href="https://bryanlauwk.fun"
          className="text-price-red hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          @bryanlauwk
        </a>{" "}
        | Inspired by{" "}
        <a
          href="https://inflationchart.com"
          className="text-price-red hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          inflationchart.com
        </a>
      </footer>
    </div>
  );
};

export default Index;
