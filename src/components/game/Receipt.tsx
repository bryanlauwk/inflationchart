import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { g } from "@/lib/gameTranslations";
import { t, type TranslationKey } from "@/lib/translations";
import { formatMonth, formatQty, formatRM, type BasketResult } from "@/lib/basket";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Mode = "same-groceries" | "same-rm100";

interface ReceiptProps {
  result: BasketResult;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

const confetti = [
  { left: "7%", top: "14%", color: "bg-vermilion", rotate: -18 },
  { left: "18%", top: "4%", color: "bg-mustard", rotate: 12 },
  { left: "33%", top: "11%", color: "bg-teal", rotate: 35 },
  { left: "63%", top: "6%", color: "bg-primary", rotate: -25 },
  { left: "78%", top: "16%", color: "bg-vermilion", rotate: 22 },
  { left: "91%", top: "8%", color: "bg-mustard", rotate: -8 },
];

export function Receipt({ result, mode, onModeChange }: ReceiptProps) {
  const { lang } = useLanguage();

  if (result.empty) {
    return (
      <section className="rounded-2xl border border-border bg-receipt p-6 ink-border">
        <h2 className="font-serif text-xl font-bold text-foreground">{g("receipt.title", lang)}</h2>
        <p className="mt-3 text-base text-muted-foreground">{g("receipt.noneUsable", lang)}</p>
      </section>
    );
  }

  const rose = result.difference > 0;

  return (
    <motion.section
      layout
      aria-labelledby="receipt-heading"
      className="relative overflow-hidden rounded-2xl border border-border bg-receipt p-5 ink-border md:p-7"
    >
      {rose && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {confetti.map((piece, index) => (
            <motion.span
              key={index}
              className={`absolute h-2 w-5 rounded-full ${piece.color}`}
              style={{ left: piece.left, top: piece.top, rotate: piece.rotate }}
              initial={{ opacity: 0, scale: 0, y: 10 }}
              animate={{ opacity: [0, 1, 0.35], scale: [0, 1, 0.8], y: [10, -4, 0] }}
              transition={{ duration: 0.8, delay: index * 0.04 }}
            />
          ))}
        </div>
      )}

      <div className="relative">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="receipt-heading" className="font-serif text-2xl font-bold text-foreground">
            {g("receipt.title", lang)}
          </h2>
          <p className="font-receipt text-sm text-muted-foreground">
            {formatMonth(result.baselineMonth, lang)} → {formatMonth(result.comparisonMonth, lang)}
          </p>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full font-receipt text-sm">
            <caption className="sr-only">{g("receipt.title", lang)}</caption>
            <thead>
              <tr className="border-b border-dashed border-border text-left text-muted-foreground">
                <th scope="col" className="py-2 pr-2 font-bold">{g("receipt.item", lang)}</th>
                <th scope="col" className="px-2 py-2 text-right font-bold">{g("receipt.then", lang)}</th>
                <th scope="col" className="py-2 pl-2 text-right font-bold">{g("receipt.now", lang)}</th>
              </tr>
            </thead>
            <tbody>
              {result.coveredLines.map((line, index) => (
                <motion.tr
                  key={line.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.22, delay: Math.min(index * 0.035, 0.35) }}
                  className="border-b border-dotted border-border/70"
                >
                  <th scope="row" className="py-2 pr-2 text-left font-normal text-foreground">
                    {t(`item.${line.id}` as TranslationKey, lang)}{" "}
                    <span className="text-muted-foreground">
                      {formatQty(line.qty)} {line.unit}
                    </span>
                  </th>
                  <td className="px-2 py-2 text-right tabular-nums text-muted-foreground">
                    {formatRM(line.baselineCost)}
                  </td>
                  <td className="py-2 pl-2 text-right tabular-nums text-foreground">
                    {formatRM(line.comparisonCost)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-foreground/40">
                <th scope="row" className="py-3 pr-2 text-left text-base font-bold text-foreground">
                  {g("receipt.total", lang)}
                </th>
                <td className="px-2 py-3 text-right text-base font-bold tabular-nums text-muted-foreground">
                  {formatRM(result.baselineTotal)}
                </td>
                <td className="py-3 pl-2 text-right text-base font-bold tabular-nums text-foreground">
                  {formatRM(result.comparisonTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <motion.p
          key={`${result.baselineMonth}-${result.comparisonMonth}-${result.difference}`}
          initial={{ opacity: 0, y: 12, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, type: "spring", bounce: 0.35 }}
          className={cn(
            "mt-4 font-serif text-2xl font-bold",
            rose ? "text-up" : "text-down",
          )}
        >
          {g("receipt.difference", lang)}: {rose ? "+" : ""}
          {formatRM(result.difference)}
          {result.percentChange != null && (
            <span className="ml-2 text-lg font-medium text-muted-foreground">
              ({rose ? "+" : ""}
              {result.percentChange.toFixed(1)}%)
            </span>
          )}
        </motion.p>

        <div className="mt-6 rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label={g("receipt.rm100", lang)}>
            {(["same-groceries", "same-rm100"] as const).map((m) => (
              <motion.button
                key={m}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => onModeChange(m)}
                aria-pressed={mode === m}
                className={cn(
                  "min-h-11 rounded-full border px-4 text-sm font-bold transition-colors",
                  mode === m
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary",
                )}
              >
                {m === "same-groceries" ? g("receipt.modeSame", lang) : g("receipt.modeRM100", lang)}
              </motion.button>
            ))}
          </div>

          {mode === "same-groceries" ? (
            <motion.div
              key={`same-${result.rm100Equivalent}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <p className="font-serif text-4xl font-bold text-vermilion">
                {formatRM(result.rm100Equivalent)}
              </p>
              <p className="mt-1 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                {g("receipt.rm100", lang)}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {g("receipt.rm100Help", lang)}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={`share-${result.affordableShare}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <p className="font-serif text-4xl font-bold text-teal">
                {result.affordableShare != null
                  ? `${(result.affordableShare * 100).toFixed(1)}%`
                  : "—"}{" "}
                <span className="text-lg font-medium text-muted-foreground">
                  {g("receipt.affordable", lang)}
                </span>
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {g("receipt.affordableHelp", lang)}
              </p>
            </motion.div>
          )}
        </div>

        {result.uncoveredLines.length > 0 && (
          <div className="mt-5 rounded-xl border border-dashed border-border p-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              {g("receipt.missingTitle", lang)}
            </h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {result.uncoveredLines.map((line) => (
                <li
                  key={line.id}
                  className="rounded-full border border-border bg-background px-3 py-1 text-sm text-foreground"
                >
                  {t(`item.${line.id}` as TranslationKey, lang)}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {g("receipt.missingHelp", lang)}
            </p>
          </div>
        )}

        <p className="mt-4 text-xs text-muted-foreground">{g("receipt.printed", lang)}</p>
      </div>
    </motion.section>
  );
}
