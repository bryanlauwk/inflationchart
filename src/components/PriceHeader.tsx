import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/lib/translations";
import { ITEM_CATEGORIES } from "@/hooks/useFoodPrices";
import { DataFreshnessBadge } from "@/components/DataFreshnessBadge";
import type { FoodItem, TimePeriod } from "@/hooks/useFoodPrices";

interface PriceHeaderProps {
  item: FoodItem;
  period: TimePeriod;
  onItemChange: (item: FoodItem) => void;
  onPeriodChange: (period: TimePeriod) => void;
}

const PERIODS: TimePeriod[] = ["1y", "2y", "3y", "4y", "all"];

export function PriceHeader({
  item,
  period,
  onItemChange,
  onPeriodChange,
}: PriceHeaderProps) {
  const { lang, toggleLang } = useLanguage();

  return (
    <header className="border-b border-border px-4 py-10 md:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold leading-[1.1] tracking-tight text-foreground md:text-5xl">
              {t("pageTitle", lang)}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:mt-3 md:text-base">
              {t("pageSubtitle", lang)}
            </p>
            <div className="mt-2">
              <DataFreshnessBadge />
            </div>
          </div>
          <div className="mt-1 flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
            <a
              href="https://www.bryanlauwk.fun"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-primary"
            >
              @bryanlauwk
            </a>
            <span aria-hidden="true">·</span>
            <button
              onClick={toggleLang}
              className="transition-colors hover:text-primary"
            >
              {lang === "zh" ? "EN" : "中"}
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Select value={item} onValueChange={(v) => onItemChange(v as FoodItem)}>
            <SelectTrigger className="w-[160px] border-border bg-card text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50 border-border bg-card">
              {(Object.keys(ITEM_CATEGORIES) as Array<keyof typeof ITEM_CATEGORIES>).map((cat) => (
                <SelectGroup key={cat}>
                  <SelectLabel className="text-xs text-muted-foreground">
                    {t(`category.${cat}` as TranslationKey, lang)}
                  </SelectLabel>
                  {ITEM_CATEGORIES[cat].map((i) => (
                    <SelectItem key={i} value={i}>
                      {t(`item.${i}` as TranslationKey, lang)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>

          <Select value={period} onValueChange={(v) => onPeriodChange(v as TimePeriod)}>
            <SelectTrigger className="w-[140px] border-border bg-card text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50 border-border bg-card">
              {PERIODS.map((p) => (
                <SelectItem key={p} value={p}>
                  {t(`period.${p}` as TranslationKey, lang)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
