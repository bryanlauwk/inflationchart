import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FoodItem, TimePeriod } from "@/hooks/useFoodPrices";

interface PriceHeaderProps {
  item: FoodItem;
  period: TimePeriod;
  onItemChange: (item: FoodItem) => void;
  onPeriodChange: (period: TimePeriod) => void;
}

const ITEMS: { value: FoodItem; label: string }[] = [
  { value: "basket", label: "🛒 Full Basket" },
  { value: "chicken", label: "🐔 Chicken" },
  { value: "eggs", label: "🥚 Eggs" },
  { value: "tomato", label: "🍅 Tomato" },
  { value: "longbeans", label: "🫘 Long Beans" },
  { value: "rice", label: "🍚 Rice" },
  { value: "milk", label: "🥛 Milk" },
];

const PERIODS: { value: TimePeriod; label: string }[] = [
  { value: "1y", label: "🗓 1 year" },
  { value: "2y", label: "🗓 2 years" },
  { value: "all", label: "🗓 All time" },
];

export function PriceHeader({
  item,
  period,
  onItemChange,
  onPeriodChange,
}: PriceHeaderProps) {
  return (
    <header className="border-b border-chart-border px-4 py-8 text-center md:py-10">
      <h1 className="mb-6 text-3xl font-bold md:text-5xl">
        <span className="bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
          🛒 Malaysian Food Prices 🇲🇾 in Real Terms 💰
        </span>
      </h1>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Select value={item} onValueChange={(v) => onItemChange(v as FoodItem)}>
          <SelectTrigger className="w-[180px] border-chart-border bg-chart-bg text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-chart-border bg-chart-bg">
            {ITEMS.map((i) => (
              <SelectItem key={i.value} value={i.value}>
                {i.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={period} onValueChange={(v) => onPeriodChange(v as TimePeriod)}>
          <SelectTrigger className="w-[160px] border-chart-border bg-chart-bg text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-chart-border bg-chart-bg">
            {PERIODS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}
