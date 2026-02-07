/**
 * Japanese-inspired decorative SVG illustrations.
 * Rendered at moderate opacity to be visible yet not compete with data.
 * All elements are aria-hidden and pointer-events-none.
 */

/* ── Seigaiha (wave crest) pattern divider ─────────────────────── */
export function SeigaihaWaves({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none select-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 120"
        className="w-full"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Repeating wave arcs — seigaiha pattern */}
        {[0, 80, 160, 240, 320, 400, 480, 560, 640, 720, 800, 880, 960, 1040, 1120, 1200].map((x, i) => (
          <g key={i}>
            <path
              d={`M${x - 40} 80 A40 40 0 0 1 ${x + 40} 80`}
              stroke="hsl(var(--primary))"
              strokeWidth="1.2"
              opacity="0.25"
            />
            <path
              d={`M${x - 30} 80 A30 30 0 0 1 ${x + 30} 80`}
              stroke="hsl(var(--primary))"
              strokeWidth="0.9"
              opacity="0.18"
            />
            <path
              d={`M${x - 20} 80 A20 20 0 0 1 ${x + 20} 80`}
              stroke="hsl(var(--primary))"
              strokeWidth="0.7"
              opacity="0.12"
            />
          </g>
        ))}
        {/* Offset row */}
        {[40, 120, 200, 280, 360, 440, 520, 600, 680, 760, 840, 920, 1000, 1080, 1160].map((x, i) => (
          <g key={`offset-${i}`}>
            <path
              d={`M${x - 40} 40 A40 40 0 0 1 ${x + 40} 40`}
              stroke="hsl(var(--primary))"
              strokeWidth="1.2"
              opacity="0.2"
            />
            <path
              d={`M${x - 30} 40 A30 30 0 0 1 ${x + 30} 40`}
              stroke="hsl(var(--primary))"
              strokeWidth="0.9"
              opacity="0.14"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ── Hero background: sumi-e food market sketch ────────────────── */
export function HeroIllustration({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 select-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 800 400"
        className="absolute right-0 top-1/2 h-full w-auto -translate-y-1/2 opacity-[0.15] md:opacity-[0.2]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Rice bowl — sumi-e style */}
        <g stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round">
          {/* Bowl body */}
          <path d="M280 260 Q280 310 340 320 Q400 330 460 320 Q520 310 520 260" strokeWidth="2.5" />
          <path d="M280 260 Q400 280 520 260" strokeWidth="1.5" />
          {/* Rice mound */}
          <path d="M300 260 Q340 210 400 200 Q460 210 500 260" strokeWidth="1.8" />
          {/* Steam wisps */}
          <path d="M360 190 Q355 160 365 140" strokeWidth="1.2" opacity="0.8" />
          <path d="M400 185 Q398 150 405 125" strokeWidth="1.2" opacity="0.8" />
          <path d="M440 190 Q445 155 438 135" strokeWidth="1.2" opacity="0.8" />
        </g>

        {/* Chili pepper */}
        <g stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round">
          <path d="M600 180 Q630 200 640 240 Q645 270 630 290" strokeWidth="2" />
          <path d="M600 180 Q610 200 615 240 Q618 270 630 290" strokeWidth="1.5" />
          {/* Stem */}
          <path d="M598 180 Q590 165 600 155 Q610 160 605 175" strokeWidth="1.5" />
        </g>

        {/* Fish — simple sashimi-style outline */}
        <g stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round">
          <path d="M100 200 Q140 160 200 170 Q260 180 280 200 Q260 220 200 230 Q140 240 100 200Z" strokeWidth="2" />
          {/* Eye */}
          <circle cx="160" cy="198" r="4" strokeWidth="1.5" />
          {/* Gill line */}
          <path d="M185 178 Q180 200 185 222" strokeWidth="1.2" />
          {/* Tail */}
          <path d="M100 200 Q75 180 65 165" strokeWidth="1.8" />
          <path d="M100 200 Q75 220 65 235" strokeWidth="1.8" />
        </g>

        {/* Onion / garlic bulb */}
        <g stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round">
          <path d="M680 100 Q700 80 700 60 Q700 50 695 45" strokeWidth="1.5" />
          <path d="M680 100 Q670 80 675 60 Q678 50 685 48" strokeWidth="1.2" />
          <path d="M660 120 Q660 100 680 100 Q700 100 710 120 Q710 140 690 150 Q670 140 660 120Z" strokeWidth="2" />
          {/* Root lines */}
          <path d="M685 150 L683 165" strokeWidth="0.8" />
          <path d="M690 150 L692 163" strokeWidth="0.8" />
        </g>

        {/* Decorative brush stroke — horizontal mist band */}
        <path
          d="M50 350 Q200 340 400 345 Q600 350 750 342"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          opacity="0.5"
          strokeLinecap="round"
        />
        <path
          d="M80 355 Q250 348 450 352 Q650 356 780 350"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          opacity="0.35"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/* ── Footer decorative motifs ──────────────────────────────────── */
export function FooterMotifs({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none select-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 600 60"
        className="mx-auto w-full max-w-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Small leaf sprigs */}
        <g stroke="hsl(var(--primary))" strokeLinecap="round" opacity="0.3" strokeWidth="1.5">
          {/* Left sprig */}
          <path d="M180 40 Q190 25 200 15" />
          <path d="M190 32 Q185 22 192 14" />
          <path d="M195 28 Q200 20 198 12" />
          
          {/* Center dot cluster (like seeds) */}
          <circle cx="300" cy="30" r="2" fill="hsl(var(--primary))" stroke="none" opacity="0.35" />
          <circle cx="288" cy="27" r="1.5" fill="hsl(var(--primary))" stroke="none" opacity="0.3" />
          <circle cx="312" cy="27" r="1.5" fill="hsl(var(--primary))" stroke="none" opacity="0.3" />
          <circle cx="293" cy="36" r="1.8" fill="hsl(var(--primary))" stroke="none" opacity="0.3" />
          <circle cx="307" cy="36" r="1.8" fill="hsl(var(--primary))" stroke="none" opacity="0.3" />

          {/* Right sprig */}
          <path d="M420 40 Q410 25 400 15" />
          <path d="M410 32 Q415 22 408 14" />
          <path d="M405 28 Q400 20 402 12" />
        </g>
      </svg>
    </div>
  );
}

/* ── Cloud/mist band — subtle gradient separator ───────────────── */
export function MistBand({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 40"
        className="w-full"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 20 Q100 8 200 18 Q300 28 400 15 Q500 5 600 20 Q700 32 800 16 Q900 4 1000 22 Q1100 30 1200 18"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          opacity="0.2"
          strokeLinecap="round"
        />
        <path
          d="M0 25 Q150 35 300 22 Q450 12 600 28 Q750 38 900 20 Q1050 10 1200 24"
          stroke="hsl(var(--primary))"
          strokeWidth="0.8"
          opacity="0.12"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
