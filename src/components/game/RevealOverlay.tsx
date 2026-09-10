import { motion } from "framer-motion";
import { ArrowRight, RotateCcw, Sparkles, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatMonth, formatRM, type BasketResult } from "@/lib/basket";
import { Button } from "@/components/ui/button";

interface RevealOverlayProps {
  result: BasketResult;
  onClose: () => void;
  onSeeDetails: () => void;
}

const confetti = Array.from({ length: 18 }, (_, index) => ({
  left: `${(index * 37) % 100}%`,
  delay: (index % 6) * 0.08,
  duration: 2.6 + (index % 4) * 0.25,
  rotate: (index * 29) % 180,
}));

export function RevealOverlay({ result, onClose, onSeeDetails }: RevealOverlayProps) {
  const { lang } = useLanguage();
  const rose = result.difference > 0;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reveal-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] overflow-y-auto bg-foreground/95 p-4 text-paper backdrop-blur-md sm:p-8"
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        {confetti.map((piece, index) => (
          <motion.span
            key={index}
            className={`absolute top-[-2rem] h-3 w-7 rounded-full ${index % 3 === 0 ? "bg-mustard" : index % 3 === 1 ? "bg-vermilion" : "bg-teal"}`}
            style={{ left: piece.left, rotate: piece.rotate }}
            initial={{ y: "-10vh", opacity: 0 }}
            animate={{ y: "115vh", opacity: [0, 1, 1, 0] }}
            transition={{ duration: piece.duration, delay: piece.delay, ease: "easeIn" }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex min-h-[calc(100svh-2rem)] max-w-5xl flex-col items-center justify-center text-center sm:min-h-[calc(100svh-4rem)]">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="absolute right-0 top-0 h-11 text-paper hover:bg-paper/10 hover:text-paper"
        >
          <X className="mr-2 h-4 w-4" aria-hidden="true" />
          {lang === "zh" ? "关闭" : "Close"}
        </Button>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-bold uppercase tracking-[0.2em] text-mustard"
        >
          {lang === "zh" ? "价格时间机 · 结果揭晓" : "Price time machine · Result revealed"}
        </motion.p>
        <motion.h1
          id="reveal-title"
          initial={{ opacity: 0, y: 20, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.12, duration: 0.6, type: "spring", bounce: 0.34 }}
          className="mt-6 max-w-4xl font-serif text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl"
        >
          {lang === "zh" ? "你的 RM100，变成了" : "Your RM100 now buys"}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.55, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.35, duration: 0.75, type: "spring", bounce: 0.42 }}
          className="relative mt-8 rounded-[2rem] border-4 border-mustard bg-paper px-8 py-7 text-foreground shadow-[0_0_80px_rgba(247,190,70,0.28)] sm:px-14 sm:py-10"
        >
          <Sparkles className="absolute -left-5 -top-5 h-10 w-10 rotate-[-18deg] text-mustard" aria-hidden="true" />
          <Sparkles className="absolute -bottom-4 -right-5 h-9 w-9 rotate-[24deg] text-vermilion" aria-hidden="true" />
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {formatMonth(result.comparisonMonth, lang)}
          </p>
          <motion.p
            key={result.rm100Equivalent}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.62, duration: 0.5 }}
            className="mt-2 font-receipt text-6xl font-bold tracking-tight text-vermilion sm:text-8xl"
          >
            {formatRM(result.rm100Equivalent)}
          </motion.p>
          <p className="mt-2 font-serif text-xl font-bold">
            {lang === "zh" ? "可以买到同样的东西" : "for the same groceries"}
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="mt-7 max-w-xl text-lg leading-relaxed text-paper/80"
          aria-live="polite"
        >
          {rose
            ? lang === "zh"
              ? `同一篮杂货贵了 ${formatRM(result.difference)}（${result.percentChange?.toFixed(1) ?? "—"}%）。`
              : `The same basket is ${formatRM(result.difference)} more expensive — up ${result.percentChange?.toFixed(1) ?? "—"}%.`
            : lang === "zh"
              ? `这一次，同一篮杂货便宜了 ${formatRM(Math.abs(result.difference))}。`
              : `This time, the same basket is ${formatRM(Math.abs(result.difference))} cheaper.`}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05 }}
          className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
        >
          <Button type="button" onClick={onSeeDetails} className="h-14 flex-1 bg-primary text-base font-bold text-primary-foreground hover:bg-primary/90">
            {lang === "zh" ? "看看谁变最多" : "See what changed most"}
            <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="h-14 flex-1 border-paper/50 bg-transparent text-base font-bold text-paper hover:bg-paper hover:text-foreground">
            <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
            {lang === "zh" ? "继续探索" : "Keep exploring"}
          </Button>
        </motion.div>

        <p className="mt-7 font-receipt text-xs text-paper/55">
          {formatMonth(result.baselineMonth, lang)} → {formatMonth(result.comparisonMonth, lang)}
        </p>
      </div>
    </motion.div>
  );
}
