import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Printer, Share2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { g } from "@/lib/gameTranslations";
import { PRESETS, type ItemId } from "@/lib/catalogue";
import {
  computeBasket,
  sanitizeBasket,
  type BasketLine,
} from "@/lib/basket";
import { decodeSelection, encodeSelection, loadStoredBasket, storeBasket } from "@/lib/share";
import {
  defaultMonthPair,
  usableMonths,
  useMonthlyPrices,
} from "@/hooks/useMonthlyPrices";
import { Welcome } from "@/components/game/Welcome";
import { BasketEditor } from "@/components/game/BasketEditor";
import { MonthPicker } from "@/components/game/MonthPicker";
import { Receipt } from "@/components/game/Receipt";
import { GuessGame } from "@/components/game/GuessGame";
import { ChangedMost } from "@/components/game/ChangedMost";
import { HowItWorks } from "@/components/game/HowItWorks";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Stage = "welcome" | "play";
type Mode = "same-groceries" | "same-rm100";

const Index = () => {
  const { lang, toggleLang } = useLanguage();
  const { data, isLoading, isError, refetch } = useMonthlyPrices();

  // Deep link is read once and never overwritten on first render.
  const initial = useRef(decodeSelection(window.location.search)).current;

  const [stage, setStage] = useState<Stage>(initial.basket.length > 0 ? "play" : "welcome");
  const [basket, setBasket] = useState<BasketLine[]>(
    initial.basket.length > 0 ? initial.basket : loadStoredBasket(),
  );
  const [baselineMonth, setBaselineMonth] = useState<string | null>(initial.baselineMonth);
  const [comparisonMonth, setComparisonMonth] = useState<string | null>(initial.comparisonMonth);
  const [mode, setMode] = useState<Mode>("same-groceries");

  const months = useMemo(() => usableMonths(data), [data]);

  // Resolve months against what actually exists, once the data lands.
  useEffect(() => {
    if (months.length === 0) return;
    const fallback = defaultMonthPair(months);
    if (!fallback) return;

    setBaselineMonth((prev) => (prev && months.includes(prev) ? prev : fallback.baseline));
    setComparisonMonth((prev) => (prev && months.includes(prev) ? prev : fallback.comparison));
  }, [months]);

  useEffect(() => {
    storeBasket(basket);
  }, [basket]);

  const availableItems = useMemo(() => new Set<ItemId>(data?.items ?? []), [data]);

  const resolvedBaseline = baselineMonth ?? months[0] ?? "";
  const resolvedComparison = comparisonMonth ?? months[months.length - 1] ?? "";

  const result = useMemo(() => {
    if (!data || !resolvedBaseline || !resolvedComparison) return null;
    return computeBasket(basket, data.prices, resolvedBaseline, resolvedComparison);
  }, [data, basket, resolvedBaseline, resolvedComparison]);

  const startPreset = useCallback((presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];
    setBasket(sanitizeBasket(preset.items));
    setStage("play");
  }, []);

  const handleShare = useCallback(async () => {
    if (!resolvedBaseline || !resolvedComparison) return;
    const query = encodeSelection(basket, resolvedBaseline, resolvedComparison);
    const url = `${window.location.origin}${window.location.pathname}?${query}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: g("hero.title", lang), text: g("share.text", lang), url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success(g("share.copied", lang));
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") return;
      toast.error(g("share.failed", lang));
    }
  }, [basket, resolvedBaseline, resolvedComparison, lang]);

  const nav = (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3"
      >
        <button
          type="button"
          onClick={() => setStage("welcome")}
          className="font-serif text-xl font-bold tracking-tight text-foreground"
        >
          {g("nav.brand", lang)}
        </button>
        <div className="flex items-center gap-3 text-sm">
          <a href="#how-it-works" className="min-h-11 px-1 py-3 text-foreground hover:text-primary">
            {g("nav.how", lang)}
          </a>
          <a
            href="https://www.bryanlauwk.fun"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden min-h-11 px-1 py-3 text-muted-foreground hover:text-primary sm:inline-block"
          >
            @bryanlauwk
          </a>
          <button
            type="button"
            onClick={toggleLang}
            aria-label={g("nav.langLabel", lang)}
            className="min-h-11 rounded-full border border-border px-4 py-2 font-medium text-foreground hover:border-primary"
          >
            {lang === "zh" ? "EN" : "中文"}
          </button>
        </div>
      </nav>
    </header>
  );

  const footer = (
    <footer className="border-t border-border/60 px-4 py-10 text-center text-sm text-muted-foreground">
      <p>
        Built by{" "}
        <a
          className="text-primary underline underline-offset-2"
          href="https://www.bryanlauwk.fun"
          target="_blank"
          rel="noopener noreferrer"
        >
          @bryanlauwk
        </a>{" "}
        · Prices from{" "}
        <a
          className="text-primary underline underline-offset-2"
          href="https://data.gov.my/data-catalogue/pricecatcher"
          target="_blank"
          rel="noopener noreferrer"
        >
          PriceCatcher
        </a>
      </p>
    </footer>
  );

  if (isError) {
    return (
      <div className="min-h-screen">
        {nav}
        <main className="mx-auto max-w-xl px-4 py-24 text-center">
          <h1 className="font-serif text-2xl font-bold text-foreground">{g("common.error", lang)}</h1>
          <Button className="mt-5 h-12 text-base" onClick={() => refetch()}>
            {g("common.retry", lang)}
          </Button>
        </main>
        {footer}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {nav}

      {stage === "welcome" ? (
        <main>
          <Welcome
            onQuickStart={() => startPreset("everyday")}
            onBuildOwn={() => {
              setBasket([]);
              setStage("play");
            }}
          />
          <section className="mx-auto max-w-6xl px-4 pb-16">
            <h2 className="font-serif text-xl font-bold text-foreground">{g("preset.pick", lang)}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {PRESETS.map((preset) => (
                <li key={preset.id}>
                  <button
                    type="button"
                    onClick={() => startPreset(preset.id)}
                    className="min-h-[5rem] w-full rounded-2xl border-2 border-border bg-card p-4 text-left transition-colors hover:border-primary"
                  >
                    <span className="block font-serif text-lg font-bold text-foreground">
                      {g(`preset.${preset.id}` as never, lang)}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {preset.items.length} {g("editor.itemsIn", lang)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-muted-foreground">{g("preset.note", lang)}</p>
          </section>
          <div className="mx-auto max-w-6xl px-4 pb-16">
            <HowItWorks latestObservation={data?.latestObservation ?? null} />
          </div>
          {footer}
        </main>
      ) : (
        <main className="mx-auto max-w-6xl px-4 py-6 md:py-10">
          {isLoading || !result ? (
            <p className="py-24 text-center text-lg text-muted-foreground">{g("common.loading", lang)}</p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:items-start">
              <div className="space-y-6">
                <MonthPicker
                  months={months}
                  baselineMonth={resolvedBaseline}
                  comparisonMonth={resolvedComparison}
                  onChange={(b, c) => {
                    setBaselineMonth(b);
                    setComparisonMonth(c);
                  }}
                  latestObservation={data?.latestObservation ?? null}
                  coveredCount={result.coveredLines.length}
                />

                <BasketEditor
                  basket={basket}
                  onChange={setBasket}
                  availableItems={availableItems}
                />

                {basket.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
                    <p className="font-serif text-lg font-bold text-foreground">
                      {g("editor.empty", lang)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{g("editor.emptyHint", lang)}</p>
                    <Button className="mt-4 h-12 text-base" onClick={() => startPreset("everyday")}>
                      {g("hero.tryPreset", lang)}
                    </Button>
                  </div>
                )}

                {basket.length > 0 && (
                  <>
                    <ChangedMost result={result} prices={data!.prices} months={months} />
                    <GuessGame
                      prices={data!.prices}
                      baselineMonth={resolvedBaseline}
                      comparisonMonth={resolvedComparison}
                    />
                  </>
                )}

                <HowItWorks latestObservation={data?.latestObservation ?? null} />
              </div>

              <div className="space-y-4 lg:sticky lg:top-20">
                {basket.length > 0 && (
                  <>
                    <Receipt result={result} mode={mode} onModeChange={setMode} />
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        type="button"
                        className="h-12 flex-1 text-base"
                        onClick={handleShare}
                      >
                        <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
                        {g("share.button", lang)}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 flex-1 text-base"
                        onClick={() => window.print()}
                      >
                        <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
                        {g("share.print", lang)}
                      </Button>
                    </div>
                  </>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 w-full text-base"
                  onClick={() => setStage("welcome")}
                >
                  {g("common.startOver", lang)}
                </Button>
              </div>
            </div>
          )}
        </main>
      )}

      {stage === "play" && footer}
    </div>
  );
};

export default Index;
