/** Hand-drawn rattan basket mark for the empty basket state (no emoji). */
export function EmptyBasketMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 96 80"
      fill="none"
      className={className}
      role="presentation"
    >
      <path
        d="M28 30C28 18 36 10 48 10s20 8 20 20"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M12 30h72l-8 38a6 6 0 0 1-6 5H26a6 6 0 0 1-6-5L12 30Z"
        fill="hsl(var(--mustard) / 0.18)"
        stroke="hsl(var(--foreground) / 0.5)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M22 42h52M25 55h46"
        stroke="hsl(var(--foreground) / 0.3)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M36 31l3 41M60 31l-3 41"
        stroke="hsl(var(--foreground) / 0.25)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="79" cy="18" r="4" fill="hsl(var(--vermilion))" />
      <circle cx="89" cy="27" r="2.5" fill="hsl(var(--jade))" />
    </svg>
  );
}
