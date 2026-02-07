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

interface PriceChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-chart-border bg-chart-tooltip px-3 py-2 text-sm shadow-xl">
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
        className="flex items-center justify-center rounded-xl border border-chart-border bg-chart-bg"
        style={{ height: isMobile ? 400 : 500 }}
      >
        <p className="text-muted-foreground">Loading chart data...</p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-chart-border bg-chart-bg"
        style={{ height: isMobile ? 400 : 500 }}
      >
        <p className="text-muted-foreground">
          No data available. Run the backfill to populate historical prices.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-chart-border bg-chart-bg p-4 md:p-6">
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
            wrapperStyle={{ cursor: "pointer", fontSize: 13 }}
          />
          {visible.nominal && (
            <Line
              dataKey="nominal"
              stroke="#4ade80"
              strokeWidth={2.5}
              dot={false}
              name="Nominal (RM)"
              type="monotone"
            />
          )}
          {visible.cpi && (
            <Line
              dataKey="cpi"
              stroke="#60a5fa"
              strokeWidth={2.5}
              dot={false}
              name="CPI Index"
              type="monotone"
            />
          )}
          {visible.real && (
            <Line
              dataKey="real"
              stroke="#f87171"
              strokeWidth={2.5}
              dot={false}
              name="Real Price"
              type="monotone"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
