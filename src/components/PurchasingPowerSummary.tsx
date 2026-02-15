import { motion } from "framer-motion";
import { usePurchasingPowerAnalysis, type ItemAnalysis } from "@/hooks/usePurchasingPowerAnalysis";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/lib/translations";
import type { FoodItem } from "@/hooks/useFoodPrices";

interface ItemRowProps {
  item: ItemAnalysis;
  lang: "zh" | "en";
  index: number;
  isLoser: boolean;
  onItemSelect?: (item: FoodItem) => void;
}

function ItemRow({ item, lang, index, isLoser, onItemSelect }: ItemRowProps) {
  const label = t(`item.${item.item}` as TranslationKey, lang);

  return (
    <motion.button
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-secondary/50"
      initial={{ opacity: 0, x: isLoser ? -10 : 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      onClick={() => onItemSelect?.(item.item)}
    >
      {/* Terracotta dot indicator instead of emoji */}
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${
          item.realChangePct > 0 ? "bg-price-red/60" : "bg-price-green/60"
        }`}
      />
      <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground tabular-nums">
        RM{item.price2022.toFixed(2)} → RM{item.priceLatest.toFixed(2)}
      </span>
      <span
        className={`min-w-[60px] rounded-full px-2 py-0.5 text-right text-xs font-semibold tabular-nums ${
          item.realChangePct > 0
            ? "bg-price-red/10 text-price-red"
            : "bg-price-green/10 text-price-green"
        }`}
      >
        {item.realChangePct > 0 ? "▲" : "▼"} {Math.abs(item.realChangePct)}%
      </span>
    </motion.button>
  );
}

interface PurchasingPowerSummaryProps {
  onItemSelect?: (item: FoodItem) => void;
}

export function PurchasingPowerSummary({ onItemSelect }: PurchasingPowerSummaryProps) {
  const { data, isLoading } = usePurchasingPowerAnalysis();
  const { lang } = useLanguage();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border/40 bg-card p-6">
        <div className="space-y-3">
          <div className="h-5 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      className="rounded-lg border border-border/40 bg-card/80 p-5 backdrop-blur-sm md:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="mb-5">
        <h3 className="font-serif text-lg font-bold text-foreground md:text-xl">
          {t("analysis.title", lang)}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("analysis.subtitle", lang)}
          <span className="ml-1.5 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            CPI {data.cpiChange > 0 ? "+" : ""}{data.cpiChange}%
          </span>
          <span className="ml-1 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {data.itemCount} {t("analysis.itemCount", lang)}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Biggest losers */}
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-price-red">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-price-red" />
            {t("analysis.losersTitle", lang)}
          </h4>
          <div className="space-y-0.5">
            {data.losers.map((item, i) => (
              <ItemRow
                key={item.item}
                item={item}
                lang={lang}
                index={i}
                isLoser
                onItemSelect={onItemSelect}
              />
            ))}
          </div>
        </div>

        {/* Stable / subsidized */}
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-price-green">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-price-green" />
            {t("analysis.stableTitle", lang)}
          </h4>
          <div className="space-y-0.5">
            {data.stable.map((item, i) => (
              <ItemRow
                key={item.item}
                item={item}
                lang={lang}
                index={i}
                isLoser={false}
                onItemSelect={onItemSelect}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-5 border-t border-border/30 pt-4 text-[11px] leading-relaxed text-muted-foreground/50">
        {t("analysis.footnote", lang)}
      </p>
    </motion.div>
  );
}
