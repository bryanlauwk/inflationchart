import { useState } from "react";
import { Shield, ExternalLink, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface InternalFlag {
  item: string;
  type: string;
  severity: "info" | "warn" | "error";
  message: string;
}

interface AuditResult {
  internalChecks: {
    flags: InternalFlag[];
    summary: string;
    errorCount: number;
    warnCount: number;
  };
  aiAudit: string;
  citations: string[];
  dataDate: string;
  itemCount: number;
  cpiValue: number | null;
  cpiDate: string | null;
}

export function DataSanityCheck() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { lang } = useLanguage();

  const runCheck = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setOpen(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "sanity-check-data",
        { body: {} }
      );

      if (fnError) throw fnError;
      if (!data?.success) throw new Error(data?.error ?? "Unknown error");

      setResult({
        internalChecks: data.internalChecks,
        aiAudit: data.aiAudit,
        citations: data.citations ?? [],
        dataDate: data.dataDate,
        itemCount: data.itemCount,
        cpiValue: data.cpiValue,
        cpiDate: data.cpiDate,
      });
    } catch (err) {
      console.error("Sanity check failed:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const severityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />;
      case "warn":
        return <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 shrink-0" />;
      default:
        return <Info className="h-3.5 w-3.5 text-blue-400 shrink-0" />;
    }
  };

  const severityBg = (severity: string) => {
    switch (severity) {
      case "error":
        return "border-destructive/30 bg-destructive/5";
      case "warn":
        return "border-yellow-500/30 bg-yellow-500/5";
      default:
        return "border-blue-400/30 bg-blue-400/5";
    }
  };

  // Simple markdown-to-JSX renderer
  const renderMarkdown = (md: string) => {
    const lines = md.split("\n");
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    const flushTable = () => {
      if (tableRows.length > 0) {
        const header = tableRows[0];
        const body = tableRows.slice(1).filter(
          (row) => !row.every((cell) => /^[-:]+$/.test(cell.trim()))
        );
        elements.push(
          <div key={`table-${elements.length}`} className="my-3 overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  {header.map((cell, ci) => (
                    <th
                      key={ci}
                      className="text-left px-2 py-1.5 border-b border-border/60 text-foreground font-medium"
                    >
                      {renderInline(cell.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, ri) => (
                  <tr key={ri} className="border-b border-border/20">
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className="px-2 py-1.5 text-muted-foreground"
                      >
                        {renderInline(cell.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }
      inTable = false;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Table detection
      if (line.includes("|") && line.trim().startsWith("|")) {
        inTable = true;
        const cells = line
          .split("|")
          .slice(1, -1); // remove empty first/last from leading/trailing |
        tableRows.push(cells);
        continue;
      }

      if (inTable) flushTable();

      if (line.startsWith("### ")) {
        elements.push(
          <h3 key={i} className="mt-4 mb-1 text-sm font-semibold text-foreground">
            {renderInline(line.slice(4))}
          </h3>
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2 key={i} className="mt-5 mb-2 text-base font-bold text-foreground">
            {renderInline(line.slice(3))}
          </h2>
        );
      } else if (line.startsWith("# ")) {
        elements.push(
          <h1 key={i} className="mt-5 mb-2 text-lg font-bold text-foreground">
            {renderInline(line.slice(2))}
          </h1>
        );
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        elements.push(
          <li key={i} className="ml-4 text-sm text-muted-foreground list-disc">
            {renderInline(line.slice(2))}
          </li>
        );
      } else if (/^\d+\.\s/.test(line)) {
        const content = line.replace(/^\d+\.\s/, "");
        elements.push(
          <li key={i} className="ml-4 text-sm text-muted-foreground list-decimal">
            {renderInline(content)}
          </li>
        );
      } else if (line.trim() === "") {
        elements.push(<div key={i} className="h-2" />);
      } else {
        elements.push(
          <p key={i} className="text-sm text-muted-foreground leading-relaxed">
            {renderInline(line)}
          </p>
        );
      }
    }

    if (inTable) flushTable();
    return elements;
  };

  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="text-foreground font-medium">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Verify Data Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={runCheck}
        disabled={loading}
        className="group relative gap-2 border-border/60 bg-card/50 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
      >
        {loading ? (
          <>
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
            </span>
            <span className="animate-pulse">
              {lang === "zh" ? "验证中…" : "Verifying…"}
            </span>
          </>
        ) : (
          <>
            <Shield className="h-4 w-4" />
            {lang === "zh" ? "验证数据" : "Verify Data"}
          </>
        )}
      </Button>

      {/* Slide-over Panel */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-card border-border">
          <SheetHeader className="pb-4 border-b border-border/40">
            <SheetTitle className="flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5 text-primary" />
              {lang === "zh" ? "数据完整性审计" : "Data Integrity Audit"}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              {lang === "zh"
                ? "内部统计检查 + Perplexity 市场交叉验证"
                : "Internal statistical checks + Perplexity market cross-validation"}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-4 space-y-4">
            {/* Loading state */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-2 border-primary/20" />
                  <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground animate-pulse">
                    {lang === "zh"
                      ? "正在运行统计检查和市场交叉验证……"
                      : "Running statistical checks & market cross-validation…"}
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    {lang === "zh"
                      ? "这可能需要 10-20 秒"
                      : "This may take 10–20 seconds"}
                  </p>
                </div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-sm font-medium text-destructive">
                  {lang === "zh" ? "验证失败" : "Verification Failed"}
                </p>
                <p className="mt-1 text-xs text-destructive/80">{error}</p>
              </div>
            )}

            {/* Results */}
            {result && (
              <>
                {/* Meta info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">
                      {lang === "zh" ? "数据日期" : "Data Date"}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {result.dataDate}
                    </p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">
                      {lang === "zh" ? "检查项目" : "Items Checked"}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {result.itemCount}
                    </p>
                  </div>
                  {result.cpiValue && (
                    <div className="rounded-lg bg-secondary/50 p-3 col-span-2">
                      <p className="text-xs text-muted-foreground">
                        {lang === "zh" ? "最新CPI" : "Latest CPI"}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {result.cpiValue} ({result.cpiDate})
                      </p>
                    </div>
                  )}
                </div>

                {/* Layer 1: Internal Checks */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {lang === "zh" ? "第一层：内部统计检查" : "Layer 1: Internal Statistical Checks"}
                    </span>
                    {result.internalChecks.errorCount === 0 && result.internalChecks.warnCount === 0 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {result.internalChecks.errorCount}🔴 {result.internalChecks.warnCount}🟡
                      </span>
                    )}
                  </div>

                  {result.internalChecks.flags.length === 0 ? (
                    <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                      <p className="text-sm text-green-400 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        {lang === "zh"
                          ? "所有内部检查通过——未检测到异常"
                          : "All internal checks passed — no anomalies detected"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {result.internalChecks.flags.map((flag, i) => (
                        <div
                          key={i}
                          className={`rounded-md border p-2.5 flex items-start gap-2 ${severityBg(flag.severity)}`}
                        >
                          {severityIcon(flag.severity)}
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground">
                              {flag.item}
                              <span className="ml-1.5 text-muted-foreground font-normal">
                                ({flag.type.replace(/_/g, " ")})
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {flag.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Layer 2: AI Market Cross-Validation */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {lang === "zh"
                      ? "第二层：AI 市场交叉验证"
                      : "Layer 2: AI Market Cross-Validation"}
                  </span>
                  <div className="rounded-lg border border-border/40 bg-background/50 p-4">
                    {renderMarkdown(result.aiAudit)}
                  </div>
                </div>

                {/* Citations */}
                {result.citations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {lang === "zh" ? "引用来源" : "Sources"}
                    </p>
                    <ul className="space-y-1">
                      {result.citations.map((url, i) => (
                        <li key={i}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-primary/80 hover:text-primary transition-colors truncate"
                          >
                            <ExternalLink className="h-3 w-3 shrink-0" />
                            <span className="truncate">{url}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
