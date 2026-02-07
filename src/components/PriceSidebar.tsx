import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { CurrentPricesGrid } from "@/components/CurrentPricesGrid";
import type { PriceStats, TimePeriod, FoodItem } from "@/hooks/useFoodPrices";
import type { TranslationKey } from "@/lib/translations";

interface PriceSidebarProps {
  stats: PriceStats;
  period: TimePeriod;
  loading?: boolean;
  activeItem: FoodItem;
  onItemSelect: (item: FoodItem) => void;
}

export function PriceSidebar({ stats, period, loading, activeItem, onItemSelect }: PriceSidebarProps) {
  const { lang } = useLanguage();
  const periodLabel = t(`stats.since.${period}` as TranslationKey, lang);

  const changeColor = stats.percentChange >= 0 ? "text-price-red" : "text-price-green";
  const changeSign = stats.percentChange >= 0 ? "+" : "";

  return (
    <div className="space-y-5">
      {/* Current prices grid */}
      <CurrentPricesGrid onItemSelect={onItemSelect} activeItem={activeItem} />

      {/* Big stat card */}
      <div className="rounded-lg border border-border bg-card p-6">
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-12 w-32 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
          </div>
        ) : (
          <>
            <h2 className={`font-serif text-4xl font-bold ${changeColor}`}>
              {changeSign}{stats.percentChange.toFixed(1)}%
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t("stats.priceChanged", lang)} {changeSign}{stats.percentChange.toFixed(1)}% {periodLabel}
              。{t("stats.currentPrice", lang)}：
              <span className="font-semibold text-foreground">
                RM{stats.currentPrice.toFixed(2)}
              </span>
            </p>
          </>
        )}
      </div>

      {/* Chart explanation */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 font-serif text-sm font-bold text-foreground">
          {t("sidebar.chartExplain", lang)}
        </h3>
        <div className="space-y-2.5 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-price-green" />
            <span>
              <span className="font-medium text-foreground">{t("legend.greenLabel", lang)}</span>
              {" — "}{t("legend.green", lang)}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-price-blue" />
            <span>
              <span className="font-medium text-foreground">{t("legend.blueLabel", lang)}</span>
              {" — "}{t("legend.blue", lang)}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-price-red" />
            <span>
              <span className="font-medium text-foreground">{t("legend.redLabel", lang)}</span>
              {" — "}{t("legend.red", lang)}
            </span>
          </p>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground/80">
          {t("sidebar.explanation", lang)}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground/60 italic">
          {t("data.methodology", lang)}
        </p>
      </div>

      {/* Data sources — with proper links and attribution */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 font-serif text-sm font-bold text-foreground">
          {t("sidebar.dataSources", lang)}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("data.priceSource", lang)}{" "}
          <a
            href="https://open.dosm.gov.my/data-catalogue/pricecatcher"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {t("data.priceSourceName", lang)}
          </a>
          {t("data.priceSourceBy", lang)}{" "}
          <a
            href="https://open.dosm.gov.my"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {t("data.openDosm", lang)}
          </a>
          {t("data.priceSourceEnd", lang)}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("data.cpiSource", lang)}{" "}
          <a
            href="https://open.dosm.gov.my/data-catalogue/cpi_core"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {t("data.cpiSourceName", lang)}
          </a>
          。
        </p>
        <p className="mt-3 text-xs text-muted-foreground/70">
          {t("data.disclaimer", lang)}
        </p>
      </div>
    </div>
  );
}
