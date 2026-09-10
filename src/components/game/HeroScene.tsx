import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { g } from "@/lib/gameTranslations";
import { t, type TranslationKey } from "@/lib/translations";
import { ITEM_BY_ID, type ItemId } from "@/lib/catalogue";
import type { BasketLine } from "@/lib/basket";
import { GroceryThumb } from "@/components/game/GroceryThumb";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroSceneProps {
  basket: BasketLine[];
  availableItems: Set<ItemId>;
  onAdd: (id: ItemId) => void;
  onQuickStart: () => void;
  onBuildOwn: () => void;
}

const hotspotData: Array<{ id: ItemId; left: string; top: string; tilt: number }> = [
  { id: "tomato", left: "43%", top: "66%", tilt: -5 },
  { id: "eggs", left: "60%", top: "67%", tilt: 4 },
  { id: "rice", left: "78%", top: "63%", tilt: -3 },
  { id: "chicken", left: "72%", top: "39%", tilt: 5 },
  { id: "kangkung", left: "26%", top: "68%", tilt: -4 },
];

export function HeroScene({
  basket,
  availableItems,
  onAdd,
  onQuickStart,
  onBuildOwn,
}: HeroSceneProps) {
  const { lang } = useLanguage();
  const selectedIds = new Set(basket.map((line) => line.id));

  return (
    <section className="relative min-h-[calc(100svh-5rem)] overflow-hidden rounded-[2rem] border-2 border-foreground/10 bg-foreground shadow-2xl shadow-foreground/10">
      <img
        src="/images/kedai-runcit-hero.webp"
        alt={g("hero.imageAlt", lang)}
        width={1536}
        height={1024}
        loading="eager"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/30 to-foreground/5" />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/65 via-transparent to-foreground/10" />

      <div className="relative z-10 flex min-h-[calc(100svh-5rem)] flex-col justify-between p-5 sm:p-8 lg:p-10">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold uppercase tracking-[0.18em] text-paper/85"
          >
            Malaysian grocery time machine
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.5 }}
            className="mt-4 max-w-xl font-serif text-5xl font-bold leading-[0.93] tracking-tight text-paper sm:text-6xl lg:text-8xl"
          >
            What happened to your <span className="text-vermilion">RM100?</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.5 }}
            className="mt-5 max-w-lg text-lg leading-relaxed text-paper/90 sm:text-xl"
          >
            {g("hero.sub", lang)}
          </motion.p>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
              <Button
                type="button"
                size="lg"
                onClick={onQuickStart}
                className="h-14 w-full border-2 border-paper/20 bg-primary px-7 text-base font-bold text-primary-foreground shadow-xl sm:w-auto"
              >
                {g("hero.tryPreset", lang)}
              </Button>
            </motion.div>
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={onBuildOwn}
                className="h-14 w-full border-2 border-paper/80 bg-paper/10 px-7 text-base font-bold text-paper backdrop-blur-sm hover:bg-paper hover:text-foreground sm:w-auto"
              >
                {g("hero.build", lang)}
              </Button>
            </motion.div>
          </div>
          <div className="flex items-center gap-3 text-sm font-medium text-paper/80">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-paper/50">+</span>
            <span>Tap a grocery in the scene to add it to your basket</span>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-20" aria-label="Groceries in the scene">
        {hotspotData.map(({ id, left, top, tilt }, index) => {
          const item = ITEM_BY_ID[id];
          const selected = selectedIds.has(id);
          const available = availableItems.has(id);
          const name = t(`item.${id}` as TranslationKey, lang);

          return (
            <motion.button
              key={id}
              type="button"
              aria-label={`${selected ? "Remove" : "Add"} ${name}`}
              aria-pressed={selected}
              onClick={() => onAdd(id)}
              whileHover={{ scale: 1.12, rotate: tilt }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + index * 0.08, type: "spring", bounce: 0.45 }}
              className="group absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl p-1.5 text-left focus-visible:outline-paper"
              style={{ left, top }}
            >
              <span
                className={cn(
                  "absolute inset-0 -z-10 rounded-2xl border-2 border-paper/80 bg-foreground/20 shadow-xl backdrop-blur-sm transition-colors",
                  selected && "border-mustard bg-mustard/30",
                )}
              />
              <span className="relative block rounded-xl border border-paper/60 bg-paper p-1.5 shadow-lg">
                <GroceryThumb id={id} className="h-12 w-12 sm:h-16 sm:w-16" />
                <span
                  className={cn(
                    "absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-paper text-lg font-bold shadow-md",
                    selected ? "bg-primary text-paper" : "bg-vermilion text-paper",
                  )}
                >
                  {selected ? "✓" : "+"}
                </span>
              </span>
              <span className="mt-1 block rounded-full bg-foreground/80 px-2 py-0.5 text-center text-[11px] font-bold text-paper opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {available ? name : `${name} · no history`}
              </span>
              <span className="sr-only">{item.unit}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="pointer-events-none absolute bottom-4 right-4 z-10 hidden max-w-[12rem] rotate-[-4deg] rounded-lg border border-foreground/20 bg-paper/90 px-3 py-2 text-center font-serif text-sm font-bold text-foreground shadow-lg backdrop-blur-sm md:block">
        Same little things.
        <br />
        A fuller tomorrow.
      </div>
    </section>
  );
}
