import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function DataFreshnessBadge() {
  const { lang } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ["data-freshness"],
    queryFn: async () => {
      const { data: row, error } = await supabase
        .from("food_prices")
        .select("date")
        .neq("item", "basket")
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !row) return null;

      const latestDate = new Date(row.date + "T12:00:00Z");
      const now = new Date();
      const diffMs = now.getTime() - latestDate.getTime();
      const diffDays = Math.floor(diffMs / 86400000);

      return { date: row.date, daysAgo: diffDays };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || !data) return null;

  const isFresh = data.daysAgo <= 3;
  const isStale = data.daysAgo > 7;

  const label = lang === "zh"
    ? (data.daysAgo === 0 ? "今日更新" : data.daysAgo === 1 ? "昨日更新" : `${data.daysAgo}天前更新`)
    : (data.daysAgo === 0 ? "Updated today" : data.daysAgo === 1 ? "Updated yesterday" : `Updated ${data.daysAgo}d ago`);

  const tooltipText = lang === "zh"
    ? `最新数据日期：${data.date}${isStale ? "\n⚠ 数据可能过时，预计每日更新" : ""}`
    : `Latest data: ${data.date}${isStale ? "\n⚠ Data may be stale — daily updates expected" : ""}`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide transition-colors cursor-default ${
              isStale
                ? "bg-destructive/10 text-destructive border border-destructive/20"
                : isFresh
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
            }`}
          >
            {isStale ? (
              <AlertTriangle className="h-3 w-3" />
            ) : isFresh ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            {label}
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs whitespace-pre-line">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
