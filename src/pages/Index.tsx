import { useState } from "react";
import { PriceHeader } from "@/components/PriceHeader";
import { PriceChart } from "@/components/PriceChart";
import { HeroStat } from "@/components/HeroStat";
import { PriceSidebar } from "@/components/PriceSidebar";
import { PurchasingPowerSummary } from "@/components/PurchasingPowerSummary";
import { HeroIllustration, SeigaihaWaves, MistBand, FooterMotifs, WashiTexture } from "@/components/BackgroundIllustration";
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
    <div className="relative min-h-screen bg-background text-foreground">
      <WashiTexture />
      <PriceHeader
        item={item}
        period={period}
        onItemChange={setItem}
        onPeriodChange={setPeriod}
      />

      {/* Hero — the "hook" with sumi-e illustration background */}
      <div className="relative">
        <HeroIllustration />
        <HeroStat
          item={item}
          period={period}
          stats={stats}
          loading={isLoading}
        />
      </div>

      {/* Seigaiha wave divider */}
      <SeigaihaWaves className="mx-auto max-w-7xl px-4 md:px-8" />

      {/* Chart + sidebar */}
      <main className="mx-auto max-w-7xl px-4 pb-16 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-10">
            <PriceChart data={chartData} loading={isLoading} />

            {/* Mist band between chart and analysis */}
            <MistBand />

            <PurchasingPowerSummary onItemSelect={setItem} />
          </div>
          <PriceSidebar
            stats={stats}
            period={period}
            loading={isLoading}
            activeItem={item}
            onItemSelect={setItem}
          />
        </div>
      </main>

      <footer className="border-t border-border/40 px-4 py-12 text-center text-xs text-muted-foreground/70">
        <FooterMotifs className="mb-6" />
        <p className="tracking-wide">
          {t("footer.builtBy", lang)}{" "}
          <a
            href="https://bryanlauwk.fun"
            className="text-primary/80 transition-colors hover:text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            @bryanlauwk
          </a>{" "}
          · {t("footer.dataBy", lang)}{" "}
          <a
            href="https://open.dosm.gov.my"
            className="text-primary/80 transition-colors hover:text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenDOSM
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Index;
