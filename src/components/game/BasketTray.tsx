import { motion, AnimatePresence } from "framer-motion";
import { Minus, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { g } from "@/lib/gameTranslations";
import { t, type TranslationKey } from "@/lib/translations";
import { ITEM_BY_ID, type ItemId } from "@/lib/catalogue";
import {
  formatMonth,
  formatQty,
  formatRM,
  type BasketResult,
  type BasketLine,
} from "@/lib/basket";
import { GroceryThumb } from "@/components/game/GroceryThumb";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BasketTrayProps {
  basket: BasketLine[];
  result: BasketResult | null;
  onChangeQty: (id: ItemId, qty: number) => void;
  onOpenEditor: () => void;
  onReveal: () => void;
  onStartOver: () => void;
}

export function BasketTray({
  basket,
  result,
  onChangeQty,
  onOpenEditor,
  onReveal,
  onStartOver,
}: BasketTrayProps) {
  const { lang } = useLanguage();

  return (
    <aside className="flex h-full min-h-[calc(100svh-5rem)] flex-col rounded-[2rem] border-2 border-foreground/10 bg-card p-4 shadow-xl shadow-foreground/5 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Your scene</p>
          <h2 className="mt-1 font-serif text-3xl font-bold leading-none text-foreground">
            {lang === "zh" ? "你的菜篮" : "Your basket"}
          </h2>
        </div>
        <motion.div
          key={basket.length}
          initial={{ scale: 0.7, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          className="flex h-11 min-w-11 items-center justify-center rounded-full border-2 border-primary bg-primary/10 px-3 font-receipt text-lg font-bold text-primary"
        >
          {basket.length}
        </motion.div>
      </div>

      <div className="mt-5 flex-1">
        {basket.length === 0 ? (
          <div className="flex h-full min-h-[18rem] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-background/60 p-6 text-center">
            <motion.div
              animate={{ y: [0, -7, 0], rotate: [-3, 3, -3] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              className="text-6xl"
              aria-hidden="true"
            >
              🧺
            </motion.div>
            <p className="mt-4 font-serif text-xl font-bold text-foreground">
              {lang === "zh" ? "菜篮还是空的" : "Your basket is waiting"}
            </p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {lang === "zh"
                ? "点击左边插画里的杂货，或者打开编辑器开始挑选。"
                : "Tap a grocery in the illustration, or open the editor to start picking."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {basket.map((line) => {
                const item = ITEM_BY_ID[line.id];
                const name = t(`item.${line.id}` as TranslationKey, lang);
                return (
                  <motion.div
                    key={line.id}
                    layout
                    initial={{ opacity: 0, x: 18, scale: 0.94 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -18, scale: 0.94 }}
                    className="rounded-xl border border-border bg-background p-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <GroceryThumb id={line.id} className="h-11 w-11 rounded-lg" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-foreground">{name}</p>
                        <p className="font-receipt text-xs text-muted-foreground">
                          {formatQty(line.qty)} {item.unit}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                          aria-label={`${g("editor.decrease", lang)}: ${name}`}
                          onClick={() => onChangeQty(line.id, line.qty - item.step)}
                        >
                          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 w-9"
                          aria-label={`${g("editor.increase", lang)}: ${name}`}
                          onClick={() => onChangeQty(line.id, line.qty + item.step)}
                        >
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="mt-5 border-t border-dashed border-border pt-4">
        {result && !result.empty ? (
          <motion.div
            key={`${result.baselineTotal}-${result.comparisonTotal}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {formatMonth(result.comparisonMonth, lang)}
                </p>
                <p className="mt-1 font-serif text-4xl font-bold text-vermilion">
                  {formatRM(result.comparisonTotal)}
                </p>
              </div>
              <p className="pb-1 text-right font-receipt text-xs text-muted-foreground">
                {formatRM(result.baselineTotal)}
                <br />
                {formatMonth(result.baselineMonth, lang)}
              </p>
            </div>
          </motion.div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {lang === "zh" ? "加入杂货后，这里会显示价格。" : "Add groceries to see the price story."}
          </p>
        )}

        <div className="mt-4 grid gap-2">
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
            <Button type="button" onClick={onOpenEditor} variant="outline" className="h-12 w-full text-base">
              <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
              {lang === "zh" ? "编辑菜篮" : "Edit my basket"}
            </Button>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              onClick={onReveal}
              disabled={!result || result.empty}
              className={cn("h-14 w-full text-base font-bold", result && !result.empty && "shadow-lg shadow-primary/20")}
            >
              <Sparkles className="mr-2 h-5 w-5" aria-hidden="true" />
              {lang === "zh" ? "揭晓结果" : "Reveal the result"}
            </Button>
          </motion.div>
          <Button type="button" variant="ghost" className="h-10 text-sm text-muted-foreground" onClick={onStartOver}>
            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
            {g("common.startOver", lang)}
          </Button>
        </div>
      </div>
    </aside>
  );
}
