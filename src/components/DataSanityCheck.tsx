import { useState } from "react";
import { Shield, X, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface AuditResult {
  audit: string;
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
        audit: data.audit,
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

  // Simple markdown-to-JSX renderer for the audit content
  const renderMarkdown = (md: string) => {
    const lines = md.split("\n");
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith("### ")) {
        elements.push(
          <h3 key={i} className="mt-4 mb-1 text-sm font-semibold text-foreground">
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith("## ")) {
        elements.push(
          <h2 key={i} className="mt-5 mb-2 text-base font-bold text-foreground">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith("# ")) {
        elements.push(
          <h1 key={i} className="mt-5 mb-2 text-lg font-bold text-foreground">
            {line.slice(2)}
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

    return elements;
  };

  const renderInline = (text: string) => {
    // Bold
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
                ? "由 Perplexity sonar-pro 驱动的交叉验证"
                : "Cross-verified using Perplexity sonar-pro"}
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
                <p className="text-sm text-muted-foreground animate-pulse">
                  {lang === "zh"
                    ? "正在与公开数据交叉验证……"
                    : "Cross-referencing with public data sources…"}
                </p>
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

                {/* Audit content */}
                <div className="rounded-lg border border-border/40 bg-background/50 p-4">
                  {renderMarkdown(result.audit)}
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
