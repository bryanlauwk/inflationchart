import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { g } from "@/lib/gameTranslations";
import { t, type TranslationKey } from "@/lib/translations";
import { ALL_ITEM_IDS, ITEM_BY_ID, type ItemId } from "@/lib/catalogue";
import type { BasketLine } from "@/lib/basket";
import { GroceryThumb } from "@/components/game/GroceryThumb";
import { SceneStickers } from "@/components/game/SceneStickers";
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

const Arrow = ({ d }: { d: string }) => (
  <motion.path
    d={d}
    fill="none"
    stroke="hsl(var(--paper))"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="0.35"
    strokeDasharray="1.2 0.8"
    initial={{ pathLength: 0, opacity: 0 }}
    animate={{ pathLength: 1, opacity: 0.82 }}
    transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
  />
);

export function HeroScene({
  basket,
  availableItems,
  onAdd,
  onQuickStart,
  onBuildOwn,
}: HeroSceneProps) {
  const { lang } = useLanguage();
  const selectedIds = new Set(basket.map((line) => line.id));
  const hotspotIds = new Set(hotspotData.map((h) => h.id));
  const quickPicks = ALL_ITEM_IDS.filter(
    (id) => !hotspotIds.has(id) && availableItems.has(id),
  ).slice(0, 10);

  return (
    <section className="relative min-h-[68svh] overflow-hidden rounded-[2rem] border-2 border-foreground/10 bg-foreground shadow-2xl shadow-foreground/10 lg:min-h-[78svh]">
      <img
        src="/images/kedai-runcit-hero.webp"
        alt={g("hero.imageAlt", lang)}
        width={1536}
        height={1024}
        loading="eager"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/95 via-foreground/55 to-foreground/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-foreground/45" />
      <div className="absolute inset-x-0 top-0 h-[58%] bg-gradient-to-br from-foreground/85 via-foreground/45 to-transparent lg:h-[50%] lg:w-[62%]" />

      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible"
      >
        <Arrow d="M34 55 C38 57, 41 61, 43 64" />
        <Arrow d="M60 58 C60 61, 60 64, 60 66" />
        <Arrow d="M88 53 C84 56, 81 60, 78 62" />
        <Arrow d="M75 31 C74 34, 73 36, 72 39" />
        <Arrow d="M17 60 C21 62, 24 65, 26 68" />
        <path
          d="M7 88 C12 82, 14 76, 13 69"
          fill="none"
          stroke="hsl(var(--mustard))"
          strokeLinecap="round"
          strokeWidth="0.55"
          opacity="0.75"
        />
        <path
          d="M8 86 C12 88, 16 88, 19 86 M10 82 C14 83, 17 82, 20 80"
          fill="none"
          stroke="hsl(var(--paper))"
          strokeLinecap="round"
          strokeWidth="0.3"
          opacity="0.7"
        />
        <path
          d="M89 20 C92 16, 95 16, 97 18 C95 21, 92 22, 89 20 Z"
          fill="hsl(var(--mustard) / 0.8)"
          stroke="hsl(var(--paper))"
          strokeWidth="0.25"
        />
        <path
          d="M93 17 C93 13, 96 11, 99 12 C98 16, 96 18, 93 17 Z"
          fill="hsl(var(--vermilion) / 0.75)"
          stroke="hsl(var(--paper))"
          strokeWidth="0.25"
        />
      </svg>
      <SceneStickers />

      <div className="relative z-10 flex min-h-[68svh] w-full min-w-0 flex-col justify-between p-5 sm:p-8 lg:min-h-[78svh] lg:p-10">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold uppercase tracking-[0.18em] text-paper/85"
          >
            {g("hero.kicker", lang)}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.5 }}
            className="mt-4 max-w-xl font-serif text-4xl font-bold leading-[0.98] tracking-tight text-paper [text-shadow:0_2px_18px_hsl(var(--ink)/0.65)] sm:text-6xl lg:text-7xl"
          >
            {lang === "zh" ? (
              <>
                你的 <span className="text-mustard">RM100</span> 去哪了？
              </>
            ) : (
              <>
                What happened to your <span className="text-mustard">RM100?</span>
              </>
            )}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.5 }}
            className="mt-5 max-w-lg text-lg leading-relaxed text-paper/90 [text-shadow:0_1px_10px_hsl(var(--ink)/0.7)] sm:text-xl"
          >
            {g("hero.sub", lang)}
          </motion.p>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              size="lg"
              onClick={onQuickStart}
              className="h-14 w-full border-2 border-paper/20 bg-primary px-7 text-base font-bold text-primary-foreground shadow-xl transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              {g("hero.tryPreset", lang)}
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={onBuildOwn}
              className="h-14 w-full border-2 border-paper/80 bg-paper/10 px-7 text-base font-bold text-paper backdrop-blur-sm transition-transform hover:-translate-y-0.5 hover:bg-paper hover:text-foreground sm:w-auto"
            >
              {g("hero.build", lang)}
            </Button>
          </div>
          <div className="flex items-center gap-3 text-sm font-medium text-paper/85">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-paper/50">+</span>
            <span>{g("hero.tapHint", lang)}</span>
          </div>

          {quickPicks.length > 0 && (
            <div className="w-full min-w-0 rounded-2xl border border-paper/25 bg-foreground/55 p-3 backdrop-blur-sm">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-paper/80">
                {g("hero.quickPick", lang)}
              </p>
              <ul className="flex w-full min-w-0 gap-2 overflow-x-auto pb-1 [&>li]:shrink-0">
                {quickPicks.map((id) => {
                  const selected = selectedIds.has(id);
                  const name = t(`item.${id}` as TranslationKey, lang);
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => onAdd(id)}
                        aria-pressed={selected}
                        className={cn(
                          "flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border-2 px-3 py-1.5 text-sm font-bold transition-colors",
                          selected
                            ? "border-mustard bg-mustard/25 text-paper"
                            : "border-paper/40 bg-paper/10 text-paper hover:bg-paper/25",
                        )}
                      >
                        <GroceryThumb id={id} className="h-7 w-7 rounded" />
                        {name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <p className="hidden items-center gap-1.5 text-xs font-medium text-paper/70 lg:flex">
            <ChevronDown className="h-4 w-4 animate-bounce" aria-hidden="true" />
            {g("hero.scroll", lang)}
          </p>
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
              <span className="mt-1 block rotate-[-3deg] rounded-sm border border-foreground/10 bg-paper px-2 py-1 text-center font-serif text-xs font-bold text-foreground shadow-md">
                {name}
                <span className="hidden font-sans text-[10px] font-medium text-primary sm:block">
                  {selected ? g("item.inBasket", lang) : g("item.tapAdd", lang)}
                </span>
              </span>
              <span className="sr-only">{available ? item.unit : `${item.unit}, no usable history`}</span>
            </motion.button>
          );
        })}
      </div>

    </section>
  );
}
