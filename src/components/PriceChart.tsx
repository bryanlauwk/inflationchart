import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import type { ChartDataPoint } from "@/hooks/useFoodPrices";
import { BASKET_SIZE } from "@/hooks/useFoodPrices";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { getFestivalsInRange, FESTIVALS } from "@/lib/festivals";

interface PriceChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  // Check if this date aligns with a festival
  const dataPoint = payload[0]?.payload;
  const festival = dataPoint
    ? FESTIVALS.find((f) => {
        const fMonth = f.date.substring(0, 7);
        const dMonth = dataPoint.dateRaw?.substring(0, 7);
        return fMonth === dMonth;
      })
    : null;

  const coverage = dataPoint?.coverage as number | undefined;
  const hasCoverage = coverage != null;
  const isLowCoverage = hasCoverage && coverage < BASKET_SIZE;

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-xl">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">
        {label}
        {festival && (
          <span className="ml-1.5">
            {festival.emoji} {festival.zh}
          </span>
        )}
      </p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="flex items-center gap-2 text-sm">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground">
            {typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value}
          </span>
        </p>
      ))}
      {hasCoverage && (
        <p
          className={`mt-1.5 border-t border-border/50 pt-1.5 text-[10px] ${
            isLowCoverage ? "text-price-red" : "text-muted-foreground/70"
          }`}
        >
          {isLowCoverage ? "⚠ " : ""}
          {coverage}/{BASKET_SIZE} items
          {isLowCoverage ? " — low coverage" : ""}
        </p>
      )}
    </div>
  );
};

/** Custom label for festival reference lines */
const FestivalLabel = ({
  viewBox,
  label,
  emoji,
}: {
  viewBox?: { x?: number; y?: number };
  label: string;
  emoji: string;
}) => {
  if (!viewBox?.x) return null;
  return (
    <g>
      <text
        x={viewBox.x}
        y={12}
        textAnchor="middle"
        fontSize={12}
        className="select-none"
      >
        {emoji}
      </text>
      <text
        x={viewBox.x}
        y={24}
        textAnchor="middle"
        fill="hsl(var(--muted-foreground))"
        fontSize={9}
        fontWeight={500}
      >
        {label}
      </text>
    </g>
  );
};

export function PriceChart({ data, loading }: PriceChartProps) {
  const isMobile = useIsMobile();
  const { lang } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const chartHeight = isMobile ? 350 : 450;

  // Check if this is basket data with coverage info
  const hasCoverageData = data.some((d) => d.coverage != null);
  const avgCoverage = hasCoverageData
    ? Math.round(
        data.reduce((sum, d) => sum + (d.coverage ?? BASKET_SIZE), 0) / data.length * 10
      ) / 10
    : null;

  // Compute festival markers within chart date range
  const festivals = useMemo(() => {
    if (!data.length) return [];
    const raw = getFestivalsInRange(data);
    return raw.map((f) => {
      // Re-resolve label based on current lang
      const fest = FESTIVALS.find(
        (ff) => ff.emoji === f.emoji && ff.zh === f.label
      );
      return {
        ...f,
        label: fest ? (lang === "zh" ? fest.zh : fest.en) : f.label,
      };
    });
  }, [data, lang]);

  // Shared reference lines for both chart modes
  const referenceLines = festivals.map((f, i) => (
    <ReferenceLine
      key={`fest-${i}`}
      x={f.x}
      stroke="hsl(var(--muted-foreground))"
      strokeDasharray="4 4"
      strokeOpacity={0.5}
      label={<FestivalLabel label={f.label} emoji={f.emoji} />}
    />
  ));

  if (loading) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-border bg-chart-bg"
        style={{ height: chartHeight }}
      >
        <div className="space-y-2 text-center">
          <div className="mx-auto h-1 w-32 animate-pulse rounded-full bg-muted" />
          <p className="text-xs text-muted-foreground">{t("chart.loading", lang)}</p>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-border bg-chart-bg"
        style={{ height: chartHeight }}
      >
        <p className="text-sm text-muted-foreground">{t("chart.noData", lang)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Coverage summary badge for basket */}
      {hasCoverageData && avgCoverage !== null && (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium ${
              avgCoverage < BASKET_SIZE
                ? "border-price-red/30 bg-price-red/5 text-price-red"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            {avgCoverage < BASKET_SIZE ? "⚠" : "✓"}{" "}
            {lang === "zh"
              ? `平均覆盖 ${avgCoverage}/${BASKET_SIZE} 品项`
              : `Avg. ${avgCoverage}/${BASKET_SIZE} items`}
          </span>
          {avgCoverage < BASKET_SIZE && (
            <span className="text-[10px] text-muted-foreground/60">
              {lang === "zh"
                ? "覆盖不足可能导致统计偏差"
                : "Low coverage may cause statistical bias"}
            </span>
          )}
        </div>
      )}

      <div className="rounded-lg border border-border bg-chart-bg p-4 md:p-6">
        <ResponsiveContainer width="100%" height={chartHeight}>
          {expanded ? (
            <LineChart data={data} margin={{ top: 30, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
                tickCount={isMobile ? 4 : 7}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 11 }}
                width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              {referenceLines}
              <Line
                dataKey="real"
                stroke="hsl(var(--price-red))"
                strokeWidth={2.5}
                dot={false}
                name={t("chart.real", lang)}
                type="monotone"
              />
              <Line
                dataKey="nominal"
                stroke="hsl(var(--price-green))"
                strokeWidth={1.5}
                dot={false}
                name={t("chart.nominal", lang)}
                type="monotone"
                strokeDasharray="6 3"
              />
              <Line
                dataKey="cpi"
                stroke="hsl(var(--price-blue))"
                strokeWidth={1.5}
                dot={false}
                name={t("chart.cpi", lang)}
                type="monotone"
                strokeDasharray="6 3"
              />
            </LineChart>
          ) : (
            <AreaChart data={data} margin={{ top: 30, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="gradientReal" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--price-red))"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--price-red))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.3}
              />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
                tickCount={isMobile ? 4 : 7}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 11 }}
                width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              {referenceLines}
              <Area
                dataKey="real"
                stroke="hsl(var(--price-red))"
                strokeWidth={2.5}
                fill="url(#gradientReal)"
                name={t("chart.real", lang)}
                type="monotone"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Expand/collapse toggle */}
      <div className="flex justify-center">
        <button
          onClick={() => setExpanded(!expanded)}
          className="group flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={expanded ? "collapse" : "expand"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              {expanded
                ? lang === "zh"
                  ? "收起详细 ↑"
                  : "Show less ↑"
                : lang === "zh"
                  ? "展开详细 — 名义价格 · CPI ↓"
                  : "Show detail — Nominal · CPI ↓"}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
