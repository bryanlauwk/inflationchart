import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { g } from "@/lib/gameTranslations";
import { Button } from "@/components/ui/button";

interface WelcomeProps {
  onQuickStart: () => void;
  onBuildOwn: () => void;
}

export function Welcome({ onQuickStart, onBuildOwn }: WelcomeProps) {
  const { lang } = useLanguage();

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-8 md:grid-cols-[1.05fr_1fr] md:gap-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="font-serif text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl">
          {g("hero.title", lang)}
        </h1>
        <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl">
          {g("hero.sub", lang)}
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            size="lg"
            className="h-14 flex-1 text-base font-bold sm:flex-none sm:px-8"
            onClick={onQuickStart}
          >
            {g("hero.tryPreset", lang)}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="h-14 flex-1 border-2 text-base font-bold sm:flex-none sm:px-8"
            onClick={onBuildOwn}
          >
            {g("hero.build", lang)}
          </Button>
        </div>

        <p className="mt-5 text-sm text-muted-foreground">{g("hero.dataNote", lang)}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="order-first md:order-last"
      >
        <img
          src="/images/kedai-runcit-hero.webp"
          alt={g("hero.imageAlt", lang)}
          width={1536}
          height={1024}
          loading="eager"
          decoding="async"
          className="h-48 w-full rounded-2xl object-cover object-center ink-border sm:h-64 md:h-auto md:max-h-[26rem]"
        />
      </motion.div>
    </section>
  );
}
