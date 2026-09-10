import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { g } from "@/lib/gameTranslations";
import { formatMonth } from "@/lib/basket";
import { Slider } from "@/components/ui/slider";

interface MonthPickerProps {
  months: string[];
  baselineMonth: string;
  comparisonMonth: string;
  onChange: (baseline: string, comparison: string) => void;
  latestObservation: string | null;
  coveredCount: number;
}

/**
 * Two accessible month controls over the ACTUAL available months. The baseline
 * can never sit after the comparison month.
 */
export function MonthPicker({
  months,
  baselineMonth,
  comparisonMonth,
  onChange,
  latestObservation,
  coveredCount,
}: MonthPickerProps) {
  const { lang } = useLanguage();

  if (months.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        {g("time.noMonths", lang)}
      </p>
    );
  }

  const baseIdx = Math.max(0, months.indexOf(baselineMonth));
  const compIdx = Math.max(0, months.indexOf(comparisonMonth));

  const setBaseline = (idx: number) => {
    const clamped = Math.min(idx, compIdx);
    onChange(months[clamped], months[compIdx]);
  };

  const setComparison = (idx: number) => {
    const clamped = Math.max(idx, baseIdx);
    onChange(months[baseIdx], months[clamped]);
  };

  return (
    <motion.section
      layout
      aria-labelledby="month-picker-heading"
      className="rounded-2xl border border-border bg-card p-4 ink-border md:p-6"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Time machine</p>
          <h2 id="month-picker-heading" className="mt-1 font-serif text-xl font-bold text-foreground">
            {g("time.title", lang)}
          </h2>
        </div>
        <motion.div
          key={`${baselineMonth}-${comparisonMonth}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-full bg-secondary px-3 py-1 font-receipt text-xs font-bold text-foreground"
        >
          {compIdx - baseIdx} {lang === "zh" ? "个月跨度" : "month jump"}
        </motion.div>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <motion.div layout>
          <label
            htmlFor="baseline-month"
            className="text-sm font-bold uppercase tracking-wide text-muted-foreground"
          >
            {g("time.baseline", lang)}
          </label>
          <motion.p
            key={baselineMonth}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 font-serif text-2xl text-foreground"
          >
            {formatMonth(baselineMonth, lang)}
          </motion.p>
          <Slider
            id="baseline-month"
            className="mt-3"
            min={0}
            max={months.length - 1}
            step={1}
            value={[baseIdx]}
            onValueChange={([v]) => setBaseline(v)}
            aria-label={g("time.baseline", lang)}
            aria-valuetext={formatMonth(baselineMonth, lang)}
          />
        </motion.div>

        <motion.div layout>
          <label
            htmlFor="comparison-month"
            className="text-sm font-bold uppercase tracking-wide text-muted-foreground"
          >
            {g("time.comparison", lang)}
          </label>
          <motion.p
            key={comparisonMonth}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 font-serif text-2xl text-foreground"
          >
            {formatMonth(comparisonMonth, lang)}
          </motion.p>
          <Slider
            id="comparison-month"
            className="mt-3"
            min={0}
            max={months.length - 1}
            step={1}
            value={[compIdx]}
            onValueChange={([v]) => setComparison(v)}
            aria-label={g("time.comparison", lang)}
            aria-valuetext={formatMonth(comparisonMonth, lang)}
          />
        </motion.div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        {g("time.help", lang)}{" "}
        <span className="font-medium text-foreground">
          {coveredCount} {g("time.coverage", lang)}
        </span>
        {latestObservation ? (
          <>
            {" · "}
            {g("time.latestObs", lang)}: {latestObservation}
          </>
        ) : null}
      </p>
    </motion.section>
  );
}
