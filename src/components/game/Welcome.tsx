import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { g } from "@/lib/gameTranslations";
import { Button } from "@/components/ui/button";
import { GroceryThumb } from "@/components/game/GroceryThumb";
import { ITEM_BY_ID, type ItemId } from "@/lib/catalogue";

interface WelcomeProps {
  onQuickStart: () => void;
  onBuildOwn: () => void;
}

const floatingItems: Array<{ id: ItemId; className: string; delay: number }> = [
  { id: "chicken", className: "left-[8%] top-[18%] rotate-[-12deg]", delay: 0.1 },
  { id: "eggs", className: "right-[9%] top-[13%] rotate-[10deg]", delay: 0.25 },
  { id: "rice", className: "left-[2%] bottom-[17%] rotate-[8deg]", delay: 0.4 },
  { id: "tomato", className: "right-[3%] bottom-[19%] rotate-[-10deg]", delay: 0.55 },
];

export function Welcome({ onQuickStart, onBuildOwn }: WelcomeProps) {
  const { lang } = useLanguage();

  return (
    <section className="relative isolate mx-auto min-h-[calc(100vh-4.5rem)] max-w-6xl overflow-hidden px-4 py-8 md:py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-mustard/10 blur-3xl"
          animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.7, 0.45] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        {floatingItems.map(({ id, className, delay }) => (
          <motion.div
            key={id}
            className={`absolute ${className}`}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.88, scale: 1, y: [0, -10, 0] }}
            transition={{
              opacity: { duration: 0.45, delay },
              scale: { duration: 0.45, delay, type: "spring", bounce: 0.45 },
              y: { duration: 4.5, delay, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <GroceryThumb id={id} className="h-14 w-14 rounded-2xl shadow-lg sm:h-20 sm:w-20" />
          </motion.div>
        ))}
      </div>

      <div className="grid min-h-[calc(100vh-6rem)] items-center gap-8 md:grid-cols-[0.95fr_1.05fr] md:gap-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.02em" }}
            animate={{ opacity: 1, letterSpacing: "0.14em" }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-xs font-bold uppercase text-primary"
          >
            Malaysian grocery time machine
          </motion.p>
          <h1 className="mt-4 max-w-xl font-serif text-5xl font-bold leading-[0.98] tracking-tight text-foreground md:text-7xl">
            {g("hero.title", lang)}
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl">
            {g("hero.sub", lang)}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
              <Button
                type="button"
                size="lg"
                className="h-14 w-full text-base font-bold shadow-lg shadow-primary/15 sm:w-auto sm:px-8"
                onClick={onQuickStart}
              >
                {g("hero.tryPreset", lang)}
              </Button>
            </motion.div>
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="h-14 w-full border-2 text-base font-bold sm:w-auto sm:px-8"
                onClick={onBuildOwn}
              >
                {g("hero.build", lang)}
              </Button>
            </motion.div>
          </div>

          <p className="mt-5 text-sm text-muted-foreground">{g("hero.dataNote", lang)}</p>
          <motion.p
            className="mt-8 text-sm font-bold text-primary"
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            ↓ Pick a basket to begin
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.82, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.75, delay: 0.12, type: "spring", bounce: 0.28 }}
          className="relative order-first mx-auto w-full max-w-xl md:order-last"
        >
          <motion.div
            className="relative overflow-hidden rounded-[2rem] border-2 border-foreground/10 bg-card p-2 shadow-2xl shadow-foreground/10"
            animate={{ rotate: [-1, 1, -1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <img
              src="/images/kedai-runcit-hero.webp"
              alt={g("hero.imageAlt", lang)}
              width={1536}
              height={1024}
              loading="eager"
              decoding="async"
              className="h-64 w-full rounded-[1.5rem] object-cover object-center sm:h-80 md:h-[30rem]"
            />
            <motion.div
              className="absolute left-1/2 top-1/2 flex h-32 w-56 -translate-x-1/2 -translate-y-1/2 rotate-[-8deg] items-center justify-center rounded-xl border-2 border-emerald-950/20 bg-emerald-700 text-4xl font-black tracking-tight text-emerald-50 shadow-2xl sm:h-40 sm:w-72 sm:text-6xl"
              animate={{ y: [-4, 4, -4], rotate: [-8, -4, -8] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              RM100
              <span className="absolute bottom-3 right-4 text-xs font-bold tracking-[0.25em] text-emerald-100/80">MY</span>
            </motion.div>
            <div className="absolute bottom-5 left-5 rounded-full border border-white/50 bg-background/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-foreground backdrop-blur">
              {ITEM_BY_ID.chicken.unit} → ??? 
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
