import { motion } from "framer-motion";

export function SceneStickers() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[12] overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute left-[6%] top-[24%] hidden rotate-[-8deg] sm:block"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="92" height="72" viewBox="0 0 92 72" fill="none">
          <path d="M10 58C21 43 26 26 46 14C53 10 66 8 80 14" stroke="hsl(var(--paper))" strokeWidth="2" strokeLinecap="round" />
          <path d="M34 31C25 20 17 21 10 28C18 37 27 38 34 31Z" fill="hsl(var(--jade))" stroke="hsl(var(--paper))" strokeWidth="1.5" />
          <path d="M49 19C43 8 47 2 57 1C62 11 59 17 49 19Z" fill="hsl(var(--mustard))" stroke="hsl(var(--paper))" strokeWidth="1.5" />
          <path d="M61 15C67 5 76 5 82 12C75 20 67 21 61 15Z" fill="hsl(var(--vermilion))" stroke="hsl(var(--paper))" strokeWidth="1.5" />
        </svg>
      </motion.div>

      <motion.div
        className="absolute right-[10%] top-[19%] rotate-[5deg] rounded-sm border border-foreground/20 bg-paper/95 px-3 py-2 font-serif text-sm font-bold italic text-foreground shadow-lg"
        animate={{ rotate: [5, 8, 5] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      >
        Jom, explore!
        <span className="ml-1 text-vermilion">♥</span>
      </motion.div>

      <div className="absolute bottom-[18%] left-[8%] rotate-[-7deg] rounded-sm border border-paper/60 bg-foreground/75 px-3 py-2 font-serif text-sm font-bold italic text-paper shadow-lg">
        Makan lokal
        <br />
        hidup bermakna
      </div>

      <motion.div
        className="absolute bottom-[13%] right-[10%] hidden sm:block"
        animate={{ y: [0, 4, 0], rotate: [-4, 0, -4] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg width="110" height="80" viewBox="0 0 110 80" fill="none">
          <path d="M15 66C23 48 38 32 57 27C75 22 86 28 98 16" stroke="hsl(var(--paper))" strokeWidth="2" strokeLinecap="round" />
          <path d="M55 28C48 15 54 7 65 4C70 15 65 24 55 28Z" fill="hsl(var(--teal))" stroke="hsl(var(--paper))" strokeWidth="1.5" />
          <path d="M73 24C78 11 89 9 97 17C91 28 81 31 73 24Z" fill="hsl(var(--jade))" stroke="hsl(var(--paper))" strokeWidth="1.5" />
          <circle cx="32" cy="53" r="8" fill="hsl(var(--vermilion))" stroke="hsl(var(--paper))" strokeWidth="1.5" />
          <path d="M32 42V35M23 46L18 41M41 46L46 41" stroke="hsl(var(--mustard))" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </motion.div>
    </div>
  );
}
