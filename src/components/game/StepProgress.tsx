import { useLanguage } from "@/contexts/LanguageContext";
import { g } from "@/lib/gameTranslations";
import { cn } from "@/lib/utils";

/** Three-step journey marker: pick groceries, choose months, reveal. */
export function StepProgress({ step }: { step: 1 | 2 | 3 }) {
  const { lang } = useLanguage();
  const labels = [g("steps.pick", lang), g("steps.months", lang), g("steps.reveal", lang)];

  return (
    <ol className="flex items-center gap-2" aria-label={labels.join(" → ")}>
      {labels.map((label, index) => {
        const value = index + 1;
        const active = value <= step;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              aria-current={value === step ? "step" : undefined}
              className={cn(
                "flex min-w-0 flex-1 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-bold transition-colors",
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-receipt text-[11px]",
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {value}
              </span>
              <span className="truncate">{label}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
