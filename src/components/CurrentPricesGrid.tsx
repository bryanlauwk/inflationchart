import { useLatestPrices } from "@/hooks/useLatestPrices";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/lib/translations";
import { ITEM_CATEGORIES } from "@/hooks/useFoodPrices";
import type { FoodItem } from "@/hooks/useFoodPrices";

interface CurrentPricesGridProps {
  onItemSelect: (item: FoodItem) => void;
  activeItem: FoodItem;
}

type CategoryKey = keyof typeof ITEM_CATEGORIES;

const CATEGORY_ORDER: CategoryKey[] = ["staples", "protein", "vegetables", "fruits"];

export function CurrentPricesGrid({ onItemSelect, activeItem }: CurrentPricesGridProps) {
  const { lang } = useLanguage();
  const { data: prices, isLoading } = useLatestPrices();

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="mb-4 font-serif text-sm font-bold text-foreground">
          {t("sidebar.currentPrices", lang)}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
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

  // Build price lookup
  const priceMap: Record<string, { price_rm: number; prev_price_rm: number | null }> = {};
  for (const p of prices) {
    priceMap[p.item] = { price_rm: p.price_rm, prev_price_rm: p.prev_price_rm };
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="mb-4 font-serif text-sm font-bold text-foreground">
        {t("sidebar.currentPrices", lang)}
      </h3>
      <div className="space-y-3">
        {CATEGORY_ORDER.map((cat) => {
          const items = ITEM_CATEGORIES[cat].filter((i) => i !== "basket" && priceMap[i]);
          if (items.length === 0) return null;

          return (
            <div key={cat}>
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {t(`category.${cat}` as TranslationKey, lang)}
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {items.map((itemKey) => {
                  const p = priceMap[itemKey];
                  if (!p) return null;
                  const label = t(`item.${itemKey}` as TranslationKey, lang);
                  const isActive = activeItem === itemKey;
                  const diff = p.prev_price_rm !== null ? p.price_rm - p.prev_price_rm : null;
                  const isUp = diff !== null && diff > 0;
                  const isDown = diff !== null && diff < 0;

                  return (
                    <button
                      key={itemKey}
                      onClick={() => onItemSelect(itemKey)}
                      className={`group rounded-md border px-2.5 py-2 text-left transition-colors ${
                        isActive
                          ? "border-primary/40 bg-primary/10"
                          : "border-border bg-card hover:border-primary/20 hover:bg-muted/50"
                      }`}
                    >
                      <p className="truncate text-[10px] leading-tight text-muted-foreground group-hover:text-foreground">
                        {label}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-foreground">
                        RM{p.price_rm.toFixed(2)}
                      </p>
                      {diff !== null && (
                        <p
                          className={`mt-0.5 text-[9px] ${
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
        })}
      </div>
    </div>
  );
}
