import { useState } from "react";
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
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import type { ChartDataPoint } from "@/hooks/useFoodPrices";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";

interface PriceChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-xl">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
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
    </div>
  );
};

export function PriceChart({ data, loading }: PriceChartProps) {
  const isMobile = useIsMobile();
  const { lang } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const chartHeight = isMobile ? 350 : 450;

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
      <div className="rounded-lg border border-border bg-chart-bg p-4 md:p-6">
        <ResponsiveContainer width="100%" height={chartHeight}>
          {expanded ? (
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
