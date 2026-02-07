import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/lib/translations";
import type { FoodItem, PriceStats, TimePeriod } from "@/hooks/useFoodPrices";

interface HeroStatProps {
  item: FoodItem;
  period: TimePeriod;
  stats: PriceStats;
  loading?: boolean;
}

export function HeroStat({ item, period, stats, loading }: HeroStatProps) {
  const { lang } = useLanguage();

  // "Your RM100 worth of [item] from [period] now costs RM{X}"
  const inflatedCost =
    stats.startPrice > 0
      ? (stats.currentPrice / stats.startPrice) * 100
      : 100;

  const animatedCost = useCountUp(loading ? 0 : inflatedCost, 1200);
  const isUp = stats.percentChange > 0;
  const isDown = stats.percentChange < 0;

  const itemLabel = t(`item.${item}` as TranslationKey, lang);
  const periodLabel = t(`stats.since.${period}` as TranslationKey, lang);

  return (
    <motion.section
      className="py-12 md:py-20"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      key={`${item}-${period}`}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {loading ? (
          <div className="space-y-4">
            <div className="h-6 w-48 animate-pulse rounded bg-muted" />
            <div className="h-20 w-64 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <>
            <p className="text-sm tracking-wide text-muted-foreground md:text-base">
              {lang === "zh"
                ? `你${periodLabel}花 RM100 买的`
                : `Your RM100 of`}
            </p>

            <h2 className="mt-1 font-serif text-2xl font-bold text-foreground md:text-3xl">
              {itemLabel}
            </h2>

            {/* Basket methodology badge */}
            {item === "basket" && (
              <p className="mt-1.5 text-[11px] tracking-wide text-muted-foreground/70">
                {t("basket.badge", lang)}
              </p>
            )}

            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              {lang === "zh" ? "现在要花" : "now costs"}
            </p>

            <div className="mt-3 flex items-baseline gap-4">
              <span className="font-serif text-7xl font-bold tabular-nums tracking-tight text-foreground md:text-9xl">
                RM{animatedCost.toFixed(2)}
              </span>
            </div>

            <motion.div
              className="mt-4 flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${
                  isUp
                    ? "bg-price-red/10 text-price-red"
                    : isDown
                      ? "bg-price-green/10 text-price-green"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isUp ? "▲" : isDown ? "▼" : "—"}{" "}
                {Math.abs(stats.percentChange).toFixed(1)}%
              </span>
              <span className="text-sm text-muted-foreground">
                {periodLabel}
              </span>
            </motion.div>

            <p className="mt-6 max-w-md text-xs leading-relaxed text-muted-foreground/70">
              {lang === "zh"
                ? `当前每单位价格 RM${stats.currentPrice.toFixed(2)}`
                : `Current unit price RM${stats.currentPrice.toFixed(2)}`}
            </p>
          </>
        )}
      </div>
    </motion.section>
  );
}
