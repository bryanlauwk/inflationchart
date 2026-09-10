import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { g } from "@/lib/gameTranslations";
import { t, type TranslationKey } from "@/lib/translations";
import { formatMonth, type PriceIndex } from "@/lib/basket";
import { ITEM_BY_ID, type ItemId } from "@/lib/catalogue";
import { cn } from "@/lib/utils";

interface PriceExplorerProps {
  prices: PriceIndex;
  months: string[];
  baselineMonth: string;
  comparisonMonth: string;
  items: ItemId[];
}

const SERIES_COLORS = [
  "hsl(var(--jade))",
  "hsl(var(--vermilion))",
  "hsl(var(--teal))",
  "hsl(var(--mustard))",
  "hsl(24 30% 30%)",
  "hsl(200 40% 40%)",
];

/**
 * Real RM per unit, or every series rebased so the baseline month equals 100.
 * The two views are never mixed on one axis, and gaps are never bridged.
 */
export function PriceExplorer({
  prices,
  months,
  baselineMonth,
  comparisonMonth,
  items,
}: PriceExplorerProps) {
  const { lang } = useLanguage();
  const [mode, setMode] = useState<"rm" | "index">("rm");

  const windowMonths = useMemo(
    () => months.filter((m) => m >= baselineMonth && m <= comparisonMonth),
    [months, baselineMonth, comparisonMonth],
  );

  const shown = items.slice(0, 6);

  const data = useMemo(() => {
    const bases: Partial<Record<ItemId, number>> = {};
    for (const id of shown) {
      bases[id] = prices[baselineMonth]?.[id]?.avgPrice;
    }

    return windowMonths.map((month) => {
      const row: Record<string, string | number | null> = { month };
      for (const id of shown) {
        const price = prices[month]?.[id]?.avgPrice ?? null;
        if (price == null) {
          row[id] = null;
          continue;
        }
        if (mode === "rm") {
          row[id] = price;
        } else {
          const base = bases[id];
          row[id] = base && base > 0 ? Math.round((price / base) * 1000) / 10 : null;
        }
      }
      return row;
    });
  }, [windowMonths, shown, prices, baselineMonth, mode]);

  if (shown.length === 0) {
    return <p className="text-sm text-muted-foreground">{g("chart.empty", lang)}</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={g("changed.explore", lang)}>
        {(["rm", "index"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={cn(
              "min-h-11 rounded-full border px-4 text-sm font-bold transition-colors",
              mode === m
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:border-primary",
            )}
          >
            {m === "rm" ? g("chart.modeRM", lang) : g("chart.modeIndex", lang)}
          </button>
        ))}
      </div>

      {mode === "index" && (
        <p className="mt-2 text-sm text-muted-foreground">{g("chart.indexNote", lang)}</p>
      )}

      <div className="mt-4 h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              stroke="hsl(var(--border))"
              minTickGap={24}
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              stroke="hsl(var(--border))"
              width={56}
              tickFormatter={(v: number) => (mode === "rm" ? `RM${v}` : String(v))}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 12,
                color: "hsl(var(--foreground))",
              }}
              labelFormatter={(label: string) => formatMonth(label, lang)}
              formatter={(value: number, name: string) => [
                mode === "rm"
                  ? `RM${Number(value).toFixed(2)} / ${ITEM_BY_ID[name as ItemId]?.unit ?? ""}`
                  : `${Number(value).toFixed(1)} (${g("chart.modeIndex", lang)})`,
                t(`item.${name}` as TranslationKey, lang),
              ]}
            />
            <Legend
              formatter={(value: string) => t(`item.${value}` as TranslationKey, lang)}
              wrapperStyle={{ fontSize: 12 }}
            />
            {shown.map((id, i) => (
              <Line
                key={id}
                type="monotone"
                dataKey={id}
                stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
