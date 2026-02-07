import type { PriceStats, TimePeriod } from "@/hooks/useFoodPrices";

interface PriceSidebarProps {
  stats: PriceStats;
  period: TimePeriod;
  loading?: boolean;
}

export function PriceSidebar({ stats, period, loading }: PriceSidebarProps) {
  const periodLabel =
    period === "1y" ? "last year" : period === "2y" ? "2 years ago" : "the start";

  const changeColor = stats.percentChange >= 0 ? "text-price-red" : "text-price-green";
  const changeSign = stats.percentChange >= 0 ? "+" : "";

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Big stat card */}
      <div className="rounded-xl border border-chart-border bg-chart-bg p-6">
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-12 w-32 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
          </div>
        ) : (
          <>
            <h2 className={`text-5xl font-bold ${changeColor}`}>
              {changeSign}{stats.percentChange.toFixed(1)}%
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Food prices changed {changeSign}{stats.percentChange.toFixed(1)}% since{" "}
              {periodLabel}. Current price:{" "}
              <span className="font-semibold text-foreground">
                RM{stats.currentPrice.toFixed(2)}
              </span>
            </p>
          </>
        )}
      </div>

      {/* ELI5 explanation */}
      <div className="rounded-xl border border-chart-border bg-chart-bg p-6">
        <h3 className="mb-3 font-bold text-foreground">💡 What This Chart Shows</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-price-green">🟢 Green</span> = What you
            actually pay at the market
          </p>
          <p>
            <span className="font-medium text-price-blue">🔵 Blue</span> = Official
            government inflation (CPI index)
          </p>
          <p>
            <span className="font-medium text-price-red">🔴 Red</span> = Real purchasing
            power — what your money is actually worth
          </p>
        </div>
        <p className="mt-3 text-xs text-muted-foreground/70">
          When the red line rises faster than blue, food is getting more expensive in real
          terms — your ringgit buys less food than official inflation suggests.
        </p>
      </div>

      {/* Data sources */}
      <div className="rounded-xl border border-chart-border bg-chart-bg p-6">
        <h3 className="mb-3 font-bold text-foreground">📊 Data Sources</h3>
        <p className="text-sm text-muted-foreground">
          Prices from{" "}
          <a
            href="https://pricecatcher.kpdn.gov.my"
            target="_blank"
            rel="noopener noreferrer"
            className="text-price-red underline hover:text-price-red/80"
          >
            KPDN PriceCatcher
          </a>
          . CPI data from Department of Statistics Malaysia. Updated daily at 11:30 PM MYT.
        </p>
        <p className="mt-2 text-xs text-muted-foreground/70">
          Historical data uses synthetic modeling based on actual inflation trends. Real-time
          scraping begins from today.
        </p>
      </div>
    </div>
  );
}
