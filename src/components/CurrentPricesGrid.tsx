import { useLatestPrices } from "@/hooks/useLatestPrices";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/lib/translations";
import type { FoodItem } from "@/hooks/useFoodPrices";

interface CurrentPricesGridProps {
  onItemSelect: (item: FoodItem) => void;
  activeItem: FoodItem;
}

export function CurrentPricesGrid({ onItemSelect, activeItem }: CurrentPricesGridProps) {
  const { lang } = useLanguage();
  const { data: prices, isLoading } = useLatestPrices();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 font-serif text-sm font-bold text-foreground">
          {t("sidebar.currentPrices", lang)}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!prices || prices.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 font-serif text-sm font-bold text-foreground">
          {t("sidebar.currentPrices", lang)}
        </h3>
        <p className="text-xs text-muted-foreground">{t("grid.noData", lang)}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="mb-4 font-serif text-sm font-bold text-foreground">
        {t("sidebar.currentPrices", lang)}
      </h3>
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
        {prices.map((p) => {
          const itemKey = `item.${p.item}` as TranslationKey;
          const label = t(itemKey, lang);
          const isActive = activeItem === p.item;
          const diff =
            p.prev_price_rm !== null ? p.price_rm - p.prev_price_rm : null;
          const isUp = diff !== null && diff > 0;
          const isDown = diff !== null && diff < 0;

          return (
            <button
              key={p.item}
              onClick={() => onItemSelect(p.item as FoodItem)}
              className={`group rounded-md border px-3 py-2.5 text-left transition-colors ${
                isActive
                  ? "border-primary/40 bg-primary/10"
                  : "border-border bg-card hover:border-primary/20 hover:bg-muted/50"
              }`}
            >
              <p className="text-[11px] leading-tight text-muted-foreground group-hover:text-foreground">
                {label}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">
                RM{p.price_rm.toFixed(2)}
              </p>
              {diff !== null && (
                <p
                  className={`mt-0.5 text-[10px] ${
                    isUp
                      ? "text-price-red"
                      : isDown
                        ? "text-price-green"
                        : "text-muted-foreground"
                  }`}
                >
                  {isUp ? "▲" : isDown ? "▼" : "—"}{" "}
                  {Math.abs(diff).toFixed(2)}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
