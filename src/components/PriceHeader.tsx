import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, type TranslationKey } from "@/lib/translations";
import type { FoodItem, TimePeriod } from "@/hooks/useFoodPrices";

interface PriceHeaderProps {
  item: FoodItem;
  period: TimePeriod;
  onItemChange: (item: FoodItem) => void;
  onPeriodChange: (period: TimePeriod) => void;
}

const ITEMS: FoodItem[] = [
  "basket", "chicken", "eggs", "tomato", "longbeans", "rice", "milk",
  "kangkung", "onion", "sugar", "cookingoil",
];

const PERIODS: TimePeriod[] = ["1y", "2y", "all"];

export function PriceHeader({
  item,
  period,
  onItemChange,
  onPeriodChange,
}: PriceHeaderProps) {
  const { lang, toggleLang } = useLanguage();

  return (
    <header className="border-b border-border px-4 py-10 md:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-start justify-between">
          <h1 className="font-serif text-2xl font-bold leading-tight text-foreground md:text-4xl">
            {t("pageTitle", lang)}
          </h1>
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
              {ITEMS.map((i) => (
                <SelectItem key={i} value={i}>
                  {t(`item.${i}` as TranslationKey, lang)}
                </SelectItem>
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
