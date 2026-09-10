import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { g } from "@/lib/gameTranslations";
import { t, type TranslationKey } from "@/lib/translations";
import { formatMonth, formatRM, randomQuizPair, type PriceIndex, type QuizPair } from "@/lib/basket";
import type { ItemId } from "@/lib/catalogue";
import { GroceryThumb } from "@/components/game/GroceryThumb";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GuessGameProps {
  prices: PriceIndex;
  baselineMonth: string;
  comparisonMonth: string;
}

export function GuessGame({ prices, baselineMonth, comparisonMonth }: GuessGameProps) {
  const { lang } = useLanguage();
  const [pair, setPair] = useState<QuizPair | null>(null);
  const [picked, setPicked] = useState<ItemId | null>(null);

  const nextRound = useCallback(() => {
    setPicked(null);
    setPair(randomQuizPair(prices, baselineMonth, comparisonMonth));
  }, [prices, baselineMonth, comparisonMonth]);

  useEffect(() => {
    nextRound();
  }, [nextRound]);

  if (!pair) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5 ink-border">
        <h2 className="font-serif text-xl font-bold text-foreground">{g("quiz.title", lang)}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{g("quiz.unavailable", lang)}</p>
      </section>
    );
  }

  const revealed = picked !== null;
  const correct = revealed && (pair.tie || picked === pair.winner);

  const renderChoice = (id: ItemId, change: number) => {
    const name = t(`item.${id}` as TranslationKey, lang);
    const isWinner = pair.winner === id;
    return (
      <button
        key={id}
        type="button"
        disabled={revealed}
        onClick={() => setPicked(id)}
        aria-label={name}
        className={cn(
          "flex min-h-[7rem] flex-1 flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-colors",
          revealed
            ? isWinner
              ? "border-primary bg-primary/10"
              : "border-border bg-background opacity-80"
            : "border-border bg-background hover:border-primary",
        )}
      >
        <GroceryThumb id={id} className="h-16 w-16" />
        <span className="text-base font-bold text-foreground">{name}</span>
        {revealed && (
          <span className="font-receipt text-sm text-muted-foreground">
            {formatRM(prices[baselineMonth]?.[id]?.avgPrice ?? null)} →{" "}
            {formatRM(prices[comparisonMonth]?.[id]?.avgPrice ?? null)}
            <br />
            <span className={change >= 0 ? "text-up" : "text-down"}>
              {change >= 0 ? "+" : ""}
              {change.toFixed(1)}%
            </span>
          </span>
        )}
      </button>
    );
  };

  return (
    <section
      aria-labelledby="guess-heading"
      className="rounded-2xl border border-border bg-card p-5 ink-border md:p-6"
    >
      <h2 id="guess-heading" className="font-serif text-xl font-bold text-foreground">
        {g("quiz.title", lang)}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{g("quiz.prompt", lang)}</p>
      <p className="mt-1 font-receipt text-xs text-muted-foreground">
        {formatMonth(baselineMonth, lang)} → {formatMonth(comparisonMonth, lang)}
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        {renderChoice(pair.a, pair.changeA)}
        {renderChoice(pair.b, pair.changeB)}
      </div>

      <div aria-live="polite" className="mt-4 min-h-[2.5rem]">
        {revealed && (
          <p
            className={cn(
              "font-serif text-lg font-bold",
              pair.tie ? "text-teal" : correct ? "text-down" : "text-vermilion",
            )}
          >
            {pair.tie ? g("quiz.tie", lang) : correct ? g("quiz.correct", lang) : g("quiz.wrong", lang)}
          </p>
        )}
      </div>

      {revealed && (
        <Button type="button" className="h-11 text-base" onClick={nextRound}>
          {g("quiz.again", lang)}
        </Button>
      )}
    </section>
  );
}
