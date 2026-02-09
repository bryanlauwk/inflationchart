import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock, CheckCircle2, AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function DataFreshnessBadge() {
  const { lang } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ["data-freshness-with-audit"],
    queryFn: async () => {
      // Fetch latest food price date
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

      // Fetch latest sanity check result
      const { data: auditRow } = await supabase
        .from("sanity_check_results")
        .select("passed, internal_error_count, internal_warn_count, data_date, created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        date: row.date,
        daysAgo: diffDays,
        audit: auditRow ? {
          passed: auditRow.passed,
          errorCount: auditRow.internal_error_count,
          warnCount: auditRow.internal_warn_count,
          dataDate: auditRow.data_date,
        } : null,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || !data) return null;

  const isFresh = data.daysAgo <= 3;
  const isStale = data.daysAgo > 7;

  const label = lang === "zh"
    ? (data.daysAgo === 0 ? "今日更新" : data.daysAgo === 1 ? "昨日更新" : `${data.daysAgo}天前更新`)
    : (data.daysAgo === 0 ? "Updated today" : data.daysAgo === 1 ? "Updated yesterday" : `Updated ${data.daysAgo}d ago`);

  // Determine audit status
  const hasAudit = !!data.audit;
  const auditPassed = data.audit?.passed ?? true;
  const auditHasErrors = (data.audit?.errorCount ?? 0) > 0;
  const auditHasWarnings = (data.audit?.warnCount ?? 0) > 0;

  // Badge color: combine freshness + audit status
  const getBadgeClasses = () => {
    if (isStale || auditHasErrors) {
      return "bg-destructive/10 text-destructive border border-destructive/20";
    }
    if (auditHasWarnings) {
      return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
    }
    if (isFresh) {
      return "bg-green-500/10 text-green-400 border border-green-500/20";
    }
    return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
  };

  const getIcon = () => {
    if (auditHasErrors) return <ShieldAlert className="h-3 w-3" />;
    if (isStale) return <AlertTriangle className="h-3 w-3" />;
    if (hasAudit && auditPassed && !auditHasWarnings) return <ShieldCheck className="h-3 w-3" />;
    if (auditHasWarnings) return <Clock className="h-3 w-3" />;
    if (isFresh) return <CheckCircle2 className="h-3 w-3" />;
    return <Clock className="h-3 w-3" />;
  };

  const tooltipLines: string[] = [];
  if (lang === "zh") {
    tooltipLines.push(`最新数据日期：${data.date}`);
    if (isStale) tooltipLines.push("⚠ 数据可能过时，预计每日更新");
    if (hasAudit) {
      tooltipLines.push(auditPassed ? "✅ 数据质量审计通过" : "⚠ 数据质量审计发现问题");
      if (auditHasErrors) tooltipLines.push(`🔴 ${data.audit!.errorCount} 个错误`);
      if (auditHasWarnings) tooltipLines.push(`🟡 ${data.audit!.warnCount} 个警告`);
    }
  } else {
    tooltipLines.push(`Latest data: ${data.date}`);
    if (isStale) tooltipLines.push("⚠ Data may be stale — daily updates expected");
    if (hasAudit) {
      tooltipLines.push(auditPassed ? "✅ Data quality audit passed" : "⚠ Data quality audit flagged issues");
      if (auditHasErrors) tooltipLines.push(`🔴 ${data.audit!.errorCount} error(s)`);
      if (auditHasWarnings) tooltipLines.push(`🟡 ${data.audit!.warnCount} warning(s)`);
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide transition-colors cursor-default ${getBadgeClasses()}`}
          >
            {getIcon()}
            {label}
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs whitespace-pre-line">
          {tooltipLines.join("\n")}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
