

# Plan: Monthly Sync + Japanese Illustration Background

## 1. Change Data Sync to Monthly

Currently, a `pg_cron` job named `sync-dosm-daily` runs every day at 16:00 UTC (00:00 MYT). Since OpenDOSM publishes PriceCatcher data as **monthly CSV files** and CPI data is also monthly, daily syncs are redundant -- the same data gets re-fetched 28-30 times per month.

**Changes:**
- Delete the existing `sync-dosm-daily` cron job
- Create a new `sync-dosm-monthly` cron job that runs on the **1st of each month at 16:00 UTC** (00:00 MYT)
- The new job will sync **both** the current month and previous month (to catch late-published data), plus update CPI
- Update the edge function to accept a new `"full"` action that syncs prices + CPI in one call
- Update the About page translation for data freshness to reflect monthly sync schedule

**Cron schedule:** `0 16 1 * *` (1st of every month, 16:00 UTC)

## 2. Add Japanese-Style Illustration Background

Add subtle, hand-drawn Japanese illustration elements (ukiyo-e / sumi-e inspired) as decorative SVG backgrounds to break the visual monotony of the dark charcoal data-heavy layout. This stays true to the Eslite-inspired aesthetic while adding warmth and visual interest.

**Approach:**
- Create a new `BackgroundIllustration` component with inline SVG art featuring:
  - Delicate line-drawn food motifs (rice bowl, vegetables, fish) in a very low-opacity terracotta/warm tone
  - Wave patterns (seigaiha) as subtle section dividers
  - Organic brush-stroke textures at section boundaries
- Place illustrations in key areas:
  - **Hero section**: A large, faded food market scene illustration behind the RM amount
  - **Between chart and analysis**: A thin wave/cloud separator pattern
  - **Footer area**: Small decorative motifs
- All illustrations will be SVG paths rendered at very low opacity (5-12%) so they don't compete with data readability
- Colors will use the existing terracotta palette (`--primary`) at reduced opacity

**Design principles:**
- No emojis in structural elements (per design constraints)
- Illustrations are purely decorative, using `pointer-events-none` and `aria-hidden`
- Responsive -- scales gracefully on mobile
- Subtle enough to enhance without distracting from the core data narrative

---

## Technical Details

### Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/sync-dosm/index.ts` | Add `"full"` action that syncs current+previous month prices and CPI in one call |
| `src/lib/translations.ts` | Update data freshness description to mention monthly sync |
| `src/components/BackgroundIllustration.tsx` | **New** -- SVG illustration components (wave patterns, food motifs) |
| `src/pages/Index.tsx` | Add background illustration layers to hero, chart section, and footer |
| `src/index.css` | Add any needed utility classes for illustration positioning |

### Database Changes

- **Delete** cron job `sync-dosm-daily`
- **Create** cron job `sync-dosm-monthly` with schedule `0 16 1 * *`, calling sync-dosm with `{"action":"full"}` body

### Edge Function Update

Add a `"full"` action to `sync-dosm` that:
1. Syncs the current month's CSV
2. Syncs the previous month's CSV (catches late data)
3. Updates CPI indicators
4. Returns combined results

### SVG Illustration Elements

- **Seigaiha waves**: Traditional Japanese wave pattern as horizontal dividers
- **Sumi-e food sketches**: Minimalist brush-stroke rice bowl, chili, fish outlines
- **Cloud/mist bands**: Soft gradient bands between major sections
- All rendered at 5-10% opacity in terracotta tones on the dark background

