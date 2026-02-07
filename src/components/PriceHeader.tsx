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
          </div>
          <button
            onClick={toggleLang}
            className="mt-1 shrink-0 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            {lang === "zh" ? "EN" : "中"}
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Select value={item} onValueChange={(v) => onItemChange(v as FoodItem)}>
            <SelectTrigger className="w-[160px] border-border bg-card text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-50 border-border bg-card">
              <SelectGroup>
                <SelectLabel className="text-xs text-muted-foreground">
                  {t("category.staples", lang)}
                </SelectLabel>
                {ITEM_CATEGORIES.staples.map((i) => (
                  <SelectItem key={i} value={i}>
                    {t(`item.${i}` as TranslationKey, lang)}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel className="text-xs text-muted-foreground">
                  {t("category.vegetables", lang)}
                </SelectLabel>
                {ITEM_CATEGORIES.vegetables.map((i) => (
                  <SelectItem key={i} value={i}>
                    {t(`item.${i}` as TranslationKey, lang)}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel className="text-xs text-muted-foreground">
                  {t("category.fruits", lang)}
                </SelectLabel>
                {ITEM_CATEGORIES.fruits.map((i) => (
                  <SelectItem key={i} value={i}>
                    {t(`item.${i}` as TranslationKey, lang)}
                  </SelectItem>
                ))}
              </SelectGroup>
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
