import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { g } from "@/lib/gameTranslations";
import { t, type TranslationKey } from "@/lib/translations";
import { formatRM, rankContributions, type BasketResult, type PriceIndex } from "@/lib/basket";
import type { ItemId } from "@/lib/catalogue";
import { GroceryThumb } from "@/components/game/GroceryThumb";
import { PriceExplorer } from "@/components/game/PriceExplorer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChangedMostProps {
  result: BasketResult;
  prices: PriceIndex;
  months: string[];
}

export function ChangedMost({ result, prices, months }: ChangedMostProps) {
  const { lang } = useLanguage();
  const [showChart, setShowChart] = useState(false);
  const [focus, setFocus] = useState<ItemId | null>(null);

  if (result.empty) return null;

  const ranked = rankContributions(result);
  const maxAbs = Math.max(...ranked.map((l) => Math.abs(l.contribution ?? 0)), 0.01);
  const chartItems = focus ? [focus] : ranked.slice(0, 6).map((l) => l.id);

  return (
    <section
      aria-labelledby="changed-heading"
      className="rounded-2xl border border-border bg-card p-5 ink-border md:p-6"
    >
      <h2 id="changed-heading" className="font-serif text-xl font-bold text-foreground">
        {g("changed.title", lang)}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{g("changed.sub", lang)}</p>

      <ul className="mt-4 space-y-2">
        {ranked.map((line) => {
          const contribution = line.contribution ?? 0;
          const up = contribution > 0;
          const width = Math.max(4, (Math.abs(contribution) / maxAbs) * 100);
          const name = t(`item.${line.id}` as TranslationKey, lang);
          const isFocus = focus === line.id;

          return (
            <li key={line.id}>
              <button
                type="button"
                onClick={() => {
                  setFocus(isFocus ? null : line.id);
                  setShowChart(true);
                }}
                aria-pressed={isFocus}
                className={cn(
                  "flex w-full min-h-11 items-center gap-3 rounded-xl border p-2 text-left transition-colors",
                  isFocus ? "border-primary bg-primary/5" : "border-transparent hover:border-border",
                )}
              >
                <GroceryThumb id={line.id} className="h-10 w-10" />
                <span className="w-28 shrink-0 truncate text-base font-medium text-foreground">
                  {name}
                </span>
                <span className="relative h-3 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full",
                      up ? "bg-vermilion" : "bg-primary",
                    )}
                    style={{ width: `${width}%` }}
                  />
                </span>
                <span
                  className={cn(
                    "w-24 shrink-0 text-right font-receipt text-sm font-bold tabular-nums",
                    up ? "text-up" : "text-down",
                  )}
                >
                  {up ? "+" : ""}
                  {formatRM(contribution)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <Button
        type="button"
        variant="outline"
        className="mt-5 h-11 text-base"
        aria-expanded={showChart}
        onClick={() => setShowChart((v) => !v)}
      >
        {showChart ? g("changed.hide", lang) : g("changed.explore", lang)}
        <ChevronDown
          aria-hidden="true"
          className={cn("ml-2 h-4 w-4 transition-transform", showChart && "rotate-180")}
        />
      </Button>

      {showChart && (
        <div className="mt-5 border-t border-border pt-5">
          <PriceExplorer
            prices={prices}
            months={months}
            baselineMonth={result.baselineMonth}
            comparisonMonth={result.comparisonMonth}
            items={chartItems}
          />
        </div>
      )}
    </section>
  );
}
