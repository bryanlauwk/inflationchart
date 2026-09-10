import { useMemo, useState } from "react";
import { Minus, Plus, Search, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { g } from "@/lib/gameTranslations";
import { t, type TranslationKey } from "@/lib/translations";
import {
  CATALOGUE,
  CATEGORY_ORDER,
  ITEM_BY_ID,
  clampQty,
  type CategoryId,
  type ItemId,
} from "@/lib/catalogue";
import type { BasketLine } from "@/lib/basket";
import { formatQty } from "@/lib/basket";
import { GroceryThumb } from "@/components/game/GroceryThumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface BasketEditorProps {
  basket: BasketLine[];
  onChange: (basket: BasketLine[]) => void;
  /** Items with no usable price history at all — shown but flagged. */
  availableItems: Set<ItemId>;
}

export function BasketEditor({ basket, onChange, availableItems }: BasketEditorProps) {
  const { lang } = useLanguage();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryId | "all">("all");

  const qtyById = useMemo(() => {
    const map = new Map<ItemId, number>();
    for (const line of basket) map.set(line.id, line.qty);
    return map;
  }, [basket]);

  const setQty = (id: ItemId, qty: number) => {
    const clamped = clampQty(qty, ITEM_BY_ID[id].step);
    const without = basket.filter((l) => l.id !== id);
    onChange(clamped > 0 ? [...without, { id, qty: clamped }] : without);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOGUE.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (!q) return true;
      const en = t(`item.${item.id}` as TranslationKey, "en").toLowerCase();
      const zh = t(`item.${item.id}` as TranslationKey, "zh");
      return en.includes(q) || zh.includes(query.trim()) || item.id.includes(q);
    });
  }, [query, category]);

  return (
    <section
      aria-labelledby="basket-editor-heading"
      className="rounded-2xl border border-border bg-card p-4 ink-border md:p-6"
    >
      <h2 id="basket-editor-heading" className="font-serif text-xl font-bold text-foreground">
        {g("editor.pickGroceries", lang)}
      </h2>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={g("editor.search", lang)}
            placeholder={g("editor.searchPlaceholder", lang)}
            className="h-11 pl-9 text-base"
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label={g("editor.pickGroceries", lang)}>
          {(["all", ...CATEGORY_ORDER] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              aria-pressed={category === cat}
              className={cn(
                "min-h-11 rounded-full border px-4 text-sm font-medium transition-colors",
                category === cat
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary",
              )}
            >
              {cat === "all"
                ? lang === "zh"
                  ? "全部"
                  : "All"
                : t(`category.${cat}` as TranslationKey, lang)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">{g("editor.noResults", lang)}</p>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => {
            const qty = qtyById.get(item.id) ?? 0;
            const inBasket = qty > 0;
            const unavailable = !availableItems.has(item.id);
            const name = t(`item.${item.id}` as TranslationKey, lang);

            return (
              <li
                key={item.id}
                className={cn(
                  "flex flex-col rounded-xl border bg-background p-3 transition-colors",
                  inBasket ? "border-primary" : "border-border",
                )}
              >
                <div className="flex items-start gap-3">
                  <GroceryThumb id={item.id} className="h-14 w-14" />
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-foreground">{name}</p>
                    <p className="text-sm text-muted-foreground">
                      {lang === "zh" ? "每" : "per "}
                      {item.unit}
                      {!item.unitConfirmed && (
                        <span className="ml-1 text-xs">({g("editor.approxUnit", lang)})</span>
                      )}
                    </p>
                    {unavailable && (
                      <p className="mt-1 text-xs font-medium text-vermilion">
                        {g("editor.noHistory", lang)}
                      </p>
                    )}
                  </div>
                </div>

                {inBasket ? (
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-11 w-11"
                      aria-label={`${g("editor.decrease", lang)}: ${name}`}
                      onClick={() => setQty(item.id, qty - item.step)}
                    >
                      <Minus className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <span className="font-receipt text-base font-bold text-foreground">
                      {formatQty(qty)} {item.unit}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-11 w-11"
                      aria-label={`${g("editor.increase", lang)}: ${name}`}
                      onClick={() => setQty(item.id, qty + item.step)}
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-3 h-11 w-full text-base"
                    onClick={() => setQty(item.id, item.defaultQty)}
                  >
                    {g("editor.add", lang)} {name}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {basket.length > 0 && (
        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{basket.length}</span>{" "}
            {g("editor.itemsIn", lang)}
          </p>
          <Button
            type="button"
            variant="ghost"
            className="h-11 text-vermilion hover:text-vermilion"
            onClick={() => onChange([])}
          >
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            {g("editor.clear", lang)}
          </Button>
        </div>
      )}
    </section>
  );
}
