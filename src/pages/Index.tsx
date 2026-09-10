import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Printer, Share2, Volume2, VolumeX, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { g } from "@/lib/gameTranslations";
import { ITEM_BY_ID, PRESETS, clampQty, type ItemId } from "@/lib/catalogue";
import { computeBasket, sanitizeBasket, type BasketLine } from "@/lib/basket";
import { decodeSelection, encodeSelection, loadStoredBasket, storeBasket } from "@/lib/share";
import { defaultMonthPair, usableMonths, useMonthlyPrices } from "@/hooks/useMonthlyPrices";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { HeroScene } from "@/components/game/HeroScene";
import { BasketTray } from "@/components/game/BasketTray";
import { BasketEditor } from "@/components/game/BasketEditor";
import { MonthPicker } from "@/components/game/MonthPicker";
import { Receipt } from "@/components/game/Receipt";
import { RevealOverlay } from "@/components/game/RevealOverlay";
import { GuessGame } from "@/components/game/GuessGame";
import { ChangedMost } from "@/components/game/ChangedMost";
import { HowItWorks } from "@/components/game/HowItWorks";
import { MobileBasketBar } from "@/components/game/MobileBasketBar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Mode = "same-groceries" | "same-rm100";

const Index = () => {
  const { lang, toggleLang } = useLanguage();
  const { data, isLoading, isError, refetch } = useMonthlyPrices();

  const initial = useRef(decodeSelection(window.location.search)).current;
  const [basket, setBasket] = useState<BasketLine[]>(
    initial.basket.length > 0 ? initial.basket : loadStoredBasket(),
  );
  const [baselineMonth, setBaselineMonth] = useState<string | null>(initial.baselineMonth);
  const [comparisonMonth, setComparisonMonth] = useState<string | null>(initial.comparisonMonth);
  const [mode, setMode] = useState<Mode>("same-groceries");
  const [editorOpen, setEditorOpen] = useState(false);
  const [revealOpen, setRevealOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem("rm100-sound") !== "off";
  });
  const sounds = useSoundEffects(soundEnabled);

  const months = useMemo(() => usableMonths(data), [data]);

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

  useEffect(() => {
    window.localStorage.setItem("rm100-sound", soundEnabled ? "on" : "off");
  }, [soundEnabled]);

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
    sounds.playAdd();
    setEditorOpen(false);
    setShowDetails(false);
  }, [sounds.playAdd]);

  const toggleSceneItem = useCallback((id: ItemId) => {
    const existing = basket.find((line) => line.id === id);
    if (existing) {
      setBasket((prev) => prev.filter((line) => line.id !== id));
      sounds.playRemove();
      return;
    }
    setBasket((prev) => [...prev, { id, qty: ITEM_BY_ID[id].defaultQty }]);
    sounds.playAdd();
  }, [basket, sounds.playAdd, sounds.playRemove]);

  const changeQty = useCallback((id: ItemId, qty: number) => {
    const nextQty = clampQty(qty, ITEM_BY_ID[id].step);
    setBasket((prev) => {
      const without = prev.filter((line) => line.id !== id);
      return nextQty > 0 ? [...without, { id, qty: nextQty }] : without;
    });
    if (nextQty > 0) sounds.playTick();
    else sounds.playRemove();
  }, [sounds.playRemove, sounds.playTick]);

  const handleEditorChange = useCallback((next: BasketLine[]) => {
    if (next.length > basket.length) sounds.playAdd();
    else if (next.length < basket.length) sounds.playRemove();
    else sounds.playTick();
    setBasket(next);
  }, [basket.length, sounds.playAdd, sounds.playRemove, sounds.playTick]);

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

  const handleStartOver = useCallback(() => {
    setBasket([]);
    setEditorOpen(false);
    setRevealOpen(false);
    setShowDetails(false);
    sounds.playRemove();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [sounds.playRemove]);

  const handleSeeDetails = useCallback(() => {
    setRevealOpen(false);
    setShowDetails(true);
    window.setTimeout(() => {
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }, []);

  const nav = (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:px-6"
      >
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="font-serif text-2xl font-bold tracking-tight text-primary"
        >
          {g("nav.brand", lang)}
        </button>
        <div className="flex items-center gap-2 text-sm sm:gap-4">
          <a href="#how-it-works" className="hidden min-h-11 px-1 py-3 text-foreground hover:text-primary sm:inline-block">
            {g("nav.how", lang)}
          </a>
          <a
            href="https://www.bryanlauwk.fun"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden min-h-11 px-1 py-3 text-muted-foreground hover:text-primary md:inline-block"
          >
            @bryanlauwk
          </a>
          <button
            type="button"
            onClick={() => setSoundEnabled((value) => !value)}
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? g("nav.soundToggleOff", lang) : g("nav.soundToggleOn", lang)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-3 py-2 font-medium text-foreground hover:border-primary"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" aria-hidden="true" /> : <VolumeX className="h-4 w-4" aria-hidden="true" />}
            <span className="hidden sm:inline">
              {soundEnabled ? g("nav.soundOn", lang) : g("nav.soundOff", lang)}
            </span>
          </button>
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

      <main className="mx-auto max-w-[1600px] px-3 pb-24 pt-3 sm:px-5 lg:px-6 lg:pb-3">
        {isLoading || !result ? (
          <p className="py-32 text-center text-lg text-muted-foreground">{g("common.loading", lang)}</p>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
              <div className="space-y-4">
                <HeroScene
                  basket={basket}
                  availableItems={availableItems}
                  onAdd={toggleSceneItem}
                  onQuickStart={() => startPreset("everyday")}
                  onBuildOwn={() => {
                    setBasket([]);
                    setEditorOpen(true);
                  }}
                />
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
              </div>

              <BasketTray
                basket={basket}
                result={result}
                step={showDetails ? 3 : basket.length > 0 ? 2 : 1}
                onChangeQty={changeQty}
                onOpenEditor={() => setEditorOpen(true)}
                onReveal={() => {
                  sounds.playReveal();
                  setRevealOpen(true);
                }}
                onStartOver={handleStartOver}
              />
            </div>

            <AnimatePresence>
              {editorOpen && (
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="editor-dialog-title"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[60] overflow-y-auto bg-foreground/40 p-3 backdrop-blur-sm sm:p-6"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 18, scale: 0.97 }}
                    className="mx-auto max-w-6xl"
                  >
                    <div className="mb-3 flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 shadow-xl">
                      <h2 id="editor-dialog-title" className="font-serif text-xl font-bold text-foreground">
                        {lang === "zh" ? "挑选你的杂货" : "Build your basket"}
                      </h2>
                      <Button type="button" variant="ghost" className="h-11" onClick={() => setEditorOpen(false)}>
                        <X className="mr-2 h-4 w-4" aria-hidden="true" />
                        {g("common.close", lang)}
                      </Button>
                    </div>
                    <BasketEditor basket={basket} onChange={handleEditorChange} availableItems={availableItems} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {revealOpen && result && !result.empty && (
                <RevealOverlay
                  result={result}
                  onClose={() => setRevealOpen(false)}
                  onSeeDetails={handleSeeDetails}
                />
              )}
            </AnimatePresence>

            {showDetails && (
              <motion.section
                id="results"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="print-area mx-auto mt-8 max-w-5xl scroll-mt-20 space-y-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                      {g("results.kicker", lang)}
                    </p>
                    <h2 className="font-serif text-3xl font-bold text-foreground">
                      {g("results.title", lang)}
                    </h2>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" className="h-11" onClick={handleShare}>
                      <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
                      {g("share.button", lang)}
                    </Button>
                    <Button type="button" variant="outline" className="h-11" onClick={() => window.print()}>
                      <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
                      {g("share.print", lang)}
                    </Button>
                  </div>
                </div>
                <Receipt result={result} mode={mode} onModeChange={setMode} />
                <div className="grid gap-6 lg:grid-cols-2">
                  <ChangedMost result={result} prices={data.prices} months={months} />
                  <GuessGame prices={data.prices} baselineMonth={resolvedBaseline} comparisonMonth={resolvedComparison} />
                </div>
              </motion.section>
            )}

            <div className="mx-auto mt-8 max-w-5xl">
              <HowItWorks latestObservation={data?.latestObservation ?? null} />
            </div>

            <MobileBasketBar
              count={basket.length}
              result={result}
              onReveal={() => {
                sounds.playReveal();
                setRevealOpen(true);
              }}
            />
          </>
        )}
      </main>

      {footer}
    </div>
  );
};

export default Index;
