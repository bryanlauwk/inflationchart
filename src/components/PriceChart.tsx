import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
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
    <div className="rounded-md border border-border bg-card px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} style={{ color: entry.color }} className="text-xs">
          {entry.name}: {typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value}
        </p>
      ))}
    </div>
  );
};

export function PriceChart({ data, loading }: PriceChartProps) {
  const isMobile = useIsMobile();
  const { lang } = useLanguage();
  const [visible, setVisible] = useState({
    nominal: true,
    cpi: true,
    real: true,
  });

  const handleLegendClick = (e: any) => {
    const key = e.dataKey as keyof typeof visible;
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-border bg-chart-bg"
        style={{ height: isMobile ? 400 : 500 }}
      >
        <p className="text-sm text-muted-foreground">{t("chart.loading", lang)}</p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-border bg-chart-bg"
        style={{ height: isMobile ? 400 : 500 }}
      >
        <p className="text-sm text-muted-foreground">{t("chart.noData", lang)}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-chart-bg p-4 md:p-6">
      <ResponsiveContainer width="100%" height={isMobile ? 400 : 500}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <XAxis
            dataKey="date"
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
            tickCount={isMobile ? 5 : 8}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            tick={{ fontSize: 11 }}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            onClick={handleLegendClick}
            wrapperStyle={{ cursor: "pointer", fontSize: 12 }}
          />
          {visible.nominal && (
            <Line
              dataKey="nominal"
              stroke="hsl(142, 71%, 65%)"
              strokeWidth={2}
              dot={false}
              name={t("chart.nominal", lang)}
              type="monotone"
            />
          )}
          {visible.cpi && (
            <Line
              dataKey="cpi"
              stroke="hsl(217, 91%, 68%)"
              strokeWidth={2}
              dot={false}
              name={t("chart.cpi", lang)}
              type="monotone"
            />
          )}
          {visible.real && (
            <Line
              dataKey="real"
              stroke="hsl(0, 91%, 71%)"
              strokeWidth={2}
              dot={false}
              name={t("chart.real", lang)}
              type="monotone"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
