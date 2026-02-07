

# Plan: Daily Sync + Remove About Page + Eslite Design Upgrade

## 1. Restore Daily Data Sync

The "今日价格" sidebar displays daily prices, but `sync-dosm` currently runs monthly. This means prices could be up to 30 days stale while labeled "today." Restoring daily sync resolves this conflict.

**Database change:**
- Delete `sync-dosm-monthly` cron job
- Create `sync-dosm-daily` with schedule `0 16 * * *` (daily at 00:00 MYT), calling `{"action":"full"}` to sync current + previous month prices and CPI

**Translation update:**
- Change "每月自动更新一次" back to "每日自动更新"

## 2. Remove About Page, Keep Key Info on Homepage

Delete the standalone `/about` page. The sidebar already contains "Data Sources" and "Chart Explanation" sections. We only need to add one concise methodology note (the Real Price formula) to the sidebar -- which is already there in `data.methodology`.

**Changes:**
- Delete `src/pages/About.tsx`
- Remove `/about` route from `App.tsx`
- Remove About link from header (`PriceHeader.tsx`) and footer (`Index.tsx`)
- Remove about-related translations from `translations.ts` (clean up unused keys)
- The sidebar already contains the methodology formula, data source links, and chart legend -- no additional content migration needed

## 3. Eslite-Inspired Visual Upgrade

Transform the page from a "data dashboard" into an editorial, bookstore-magazine aesthetic. Key changes:

**a) Remove emojis from PurchasingPowerSummary** (per design constraints -- no emojis in cards/text). Replace with elegant terracotta dot indicators.

**b) Enhance Japanese illustrations:**
- Increase hero illustration opacity to 25-30% (currently 15-20%)
- Add a new subtle washi paper texture overlay on the page background
- Add a warm ambient glow behind the hero RM figure using a radial gradient

**c) Refine typography and spacing:**
- Add more generous vertical spacing between major sections
- Use softer, more organic card borders (lower opacity border color)
- Add subtle entry animations to sidebar cards using framer-motion

**d) Footer redesign:**
- Cleaner, more minimal footer with just credits and data source
- Enhanced footer motifs at higher opacity

---

## Technical Details

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/About.tsx` | **Delete** |
| `src/App.tsx` | Remove About import and route |
| `src/pages/Index.tsx` | Remove About link from footer, add warm glow behind hero, increase section spacing |
| `src/components/PriceHeader.tsx` | Remove About link from header nav |
| `src/components/PurchasingPowerSummary.tsx` | Remove emoji mapping, use terracotta dot indicators instead |
| `src/components/BackgroundIllustration.tsx` | Increase hero opacity to 25-30%, add washi texture overlay component |
| `src/components/HeroStat.tsx` | Add warm radial glow background behind the RM figure |
| `src/lib/translations.ts` | Remove all `about.*` keys, update data freshness to daily |
| `src/index.css` | Add washi texture utility, refine card border softness |

### Database Changes

```text
DELETE cron job: sync-dosm-monthly
CREATE cron job: sync-dosm-daily
  Schedule: 0 16 * * * (daily 00:00 MYT)
  Action: {"action":"full"}
```

### Design Upgrades Summary

```text
Before                          After
------                          -----
Emojis in price cards           Terracotta dot indicators
Illustrations at 15-20%        Illustrations at 25-30%
Flat dark background            Subtle washi paper texture
Plain hero section              Warm radial glow behind RM figure
Standard card borders           Softer, lower-opacity borders
Separate About page             Key info consolidated in sidebar
```

