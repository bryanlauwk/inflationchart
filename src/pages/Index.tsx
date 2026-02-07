import { useState } from "react";
import { Link } from "react-router-dom";
import { PriceHeader } from "@/components/PriceHeader";
import { PriceChart } from "@/components/PriceChart";
import { HeroStat } from "@/components/HeroStat";
import { PriceSidebar } from "@/components/PriceSidebar";
import { useFoodPrices } from "@/hooks/useFoodPrices";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import type { FoodItem, TimePeriod } from "@/hooks/useFoodPrices";

const Index = () => {
  const [item, setItem] = useState<FoodItem>("basket");
  const [period, setPeriod] = useState<TimePeriod>("2y");
  const { lang } = useLanguage();

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

      {/* Hero — the "hook" */}
      <HeroStat
        item={item}
        period={period}
        stats={stats}
        loading={isLoading}
      />

      {/* Chart + sidebar */}
      <main className="mx-auto max-w-7xl px-4 pb-10 md:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          <PriceChart data={chartData} loading={isLoading} />
          <PriceSidebar
            stats={stats}
            period={period}
            loading={isLoading}
            activeItem={item}
            onItemSelect={setItem}
          />
        </div>
      </main>

      <footer className="border-t border-border px-4 py-10 text-center text-xs text-muted-foreground">
        {t("footer.builtBy", lang)}{" "}
        <a
          href="https://bryanlauwk.fun"
          className="text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          @bryanlauwk
        </a>{" "}
        · {t("footer.dataBy", lang)}{" "}
        <a
          href="https://open.dosm.gov.my"
          className="text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          OpenDOSM
        </a>
        {" · "}
        <Link to="/about" className="text-primary hover:underline">
          {t("nav.about", lang)}
        </Link>
      </footer>
    </div>
  );
};

export default Index;
