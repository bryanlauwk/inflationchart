import { motion } from "framer-motion";
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Build your scene</p>
          <h2 id="basket-editor-heading" className="mt-1 font-serif text-xl font-bold text-foreground">
            {g("editor.pickGroceries", lang)}
          </h2>
        </div>
        <motion.div
          key={basket.length}
          initial={{ scale: 0.75, rotate: -6 }}
          animate={{ scale: 1, rotate: 0 }}
          className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-bold text-primary"
        >
          {basket.length} {g("editor.itemsIn", lang)}
        </motion.div>
      </div>

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
            <motion.button
              key={cat}
              type="button"
              whileTap={{ scale: 0.94 }}
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
            </motion.button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">{g("editor.noResults", lang)}</p>
      ) : (
        <motion.ul layout className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item, index) => {
            const qty = qtyById.get(item.id) ?? 0;
            const inBasket = qty > 0;
            const unavailable = !availableItems.has(item.id);
            const name = t(`item.${item.id}` as TranslationKey, lang);

            return (
              <motion.li
                layout
                key={item.id}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.24, delay: Math.min(index * 0.025, 0.2) }}
                whileHover={{ y: -4, rotate: index % 2 === 0 ? -0.5 : 0.5 }}
                className={cn(
                  "flex flex-col rounded-xl border bg-background p-3 transition-colors",
                  inBasket ? "border-primary bg-primary/[0.04] shadow-md shadow-primary/10" : "border-border",
                )}
              >
                <div className="flex items-start gap-3">
                  <motion.div
                    animate={inBasket ? { rotate: [0, -6, 6, 0], scale: [1, 1.08, 1] } : { rotate: 0, scale: 1 }}
                    transition={{ duration: 0.35 }}
                  >
                    <GroceryThumb id={item.id} className="h-14 w-14" />
                  </motion.div>
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
                    <motion.span
                      key={qty}
                      initial={{ scale: 1.25, color: "hsl(var(--vermilion))" }}
                      animate={{ scale: 1, color: "hsl(var(--foreground))" }}
                      className="font-receipt text-base font-bold"
                    >
                      {formatQty(qty)} {item.unit}
                    </motion.span>
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
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="mt-3">
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-11 w-full text-base"
                      onClick={() => setQty(item.id, item.defaultQty)}
                    >
                      {g("editor.add", lang)} {name}
                    </Button>
                  </motion.div>
                )}
              </motion.li>
            );
          })}
        </motion.ul>
      )}

      {basket.length > 0 && (
        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{basket.length}</span>{" "}
            {g("editor.itemsIn", lang)}
          </p>
          <motion.div whileTap={{ scale: 0.96 }}>
            <Button
              type="button"
              variant="ghost"
              className="h-11 text-vermilion hover:text-vermilion"
              onClick={() => onChange([])}
            >
              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
              {g("editor.clear", lang)}
            </Button>
          </motion.div>
        </div>
      )}
    </section>
  );
}
