import { Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { g } from "@/lib/gameTranslations";
import { formatRM, type BasketResult } from "@/lib/basket";
import { Button } from "@/components/ui/button";

interface MobileBasketBarProps {
  count: number;
  result: BasketResult | null;
  onReveal: () => void;
}

/** Sticky thumb-reach summary shown on phones once the basket has items. */
export function MobileBasketBar({ count, result, onReveal }: MobileBasketBarProps) {
  const { lang } = useLanguage();
  if (count === 0) return null;

  const total = result && !result.empty ? formatRM(result.comparisonTotal) : "—";

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 px-3 py-2.5 shadow-[0_-8px_24px_-16px_hsl(var(--ink)/0.6)] backdrop-blur lg:hidden print:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-muted-foreground">
            {count} {g("tray.itemCount", lang)}
          </p>
          <p className="font-serif text-xl font-bold leading-tight text-vermilion">{total}</p>
        </div>
        <Button
          type="button"
          onClick={onReveal}
          disabled={!result || result.empty}
          className="h-12 px-5 text-base font-bold"
        >
          <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
          {g("tray.reveal", lang)}
        </Button>
      </div>
    </div>
  );
}
