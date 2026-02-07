
# Title Redesign, Data Integrity Fix, and Pre-Launch Checklist

## Overview
Three parallel workstreams: fix critical data quality issues, redesign the title/hero for a catchier neal.fun-inspired feel, and run a comprehensive verification before publishing.

---

## 1. Data Integrity Fixes

### Problem: Anomalous Prices Corrupting Charts
The database contains price outliers that distort the charts:

- **Eggs**: RM12.60 on 2026-02-07 (normal range RM4.20-5.00). The current MAX_PRICE of 15 is too generous for 10-piece eggs.
- **Cooking oil**: RM2.50 entries (subsidized packet price) leaking through despite code 1091 restriction. Normal 1kg bottle price is RM7-9. Prices alternate between RM2.50 and RM8.55 on consecutive days, creating extreme volatility.

### Fix
**A. Tighten validation bounds in `sync-dosm/index.ts`:**
- Add a `MIN_PRICE` map alongside MAX_PRICE for items where a floor makes sense
- Cooking oil: MIN_PRICE = 5.00 (filters out RM2.50 subsidized packet prices tagged as code 1091)
- Eggs: Lower MAX_PRICE from 15 to 8 (10-piece eggs should never exceed RM8)

**B. Clean existing bad data from the database:**
- Delete eggs records where price_rm > 8.00
- Delete cooking oil records where price_rm < 5.00
- Re-sync affected months to rebuild basket calculations

**C. Add 2022-2023 festival markers in `festivals.ts`:**
- CNY 2022 (Feb 1), Hari Raya 2022 (May 2), Raya Haji 2022 (Jul 10), Deepavali 2022 (Oct 24)
- CNY 2023 (Jan 22), Hari Raya 2023 (Apr 22), Raya Haji 2023 (Jun 29), Deepavali 2023 (Nov 12)

---

## 2. Title & Typography Redesign (neal.fun inspired)

### Current State
The title "Malaysian Food Prices -- Real Purchasing Power" is academic and dry. The hero section is informational but lacks the hook that neal.fun achieves.

### New Design Direction
Inspired by neal.fun's conversational, story-driven approach:

**New titles:**
- EN: "Is Your Grocery Bill Lying to You?"
- ZH: "你的菜钱到底够不够用？"

**Subtitle (smaller, below the title):**
- EN: "Track real food prices across Malaysia -- adjusted for inflation"
- ZH: "追踪马来西亚食品真实价格 -- 扣除通胀后的购买力"

### Typography Changes
- Title: Larger, bolder -- `text-3xl md:text-5xl` (up from `text-2xl md:text-4xl`)
- Use serif font for maximum impact, with tighter letter-spacing
- Remove the em-dash separator, use a natural subtitle instead
- Add a subtle "typewriter" feel with slightly muted subtitle color

### Hero Stat Improvements
- Make the "RM" figure even more prominent with `text-7xl md:text-9xl`
- Tighten the narrative flow: "Your RM100 of [item]" -> giant number -> percentage badge
- Remove the formula explanation from the hero (move to sidebar)

---

## 3. Default Language Switch

### Change
Switch default language from Chinese ("zh") to English ("en") in `LanguageContext.tsx`:
```
const saved = localStorage.getItem("lang");
return saved === "zh" ? "zh" : "en";  // flip default
```

Update `index.html` lang attribute from `zh-Hant` to `en`.

---

## 4. Pre-Launch Verification Checklist

After all changes are implemented, systematically verify:

- [ ] All 18 items load correctly for all 5 time periods (1y, 2y, 3y, 4y, all)
- [ ] No anomalous price spikes in any chart (eggs, cooking oil especially)
- [ ] Basket chart shows stable RM52-58 range without wild swings
- [ ] Festival markers display correctly for 2022-2026 on 4-year and "All Time" views
- [ ] Language toggle works (EN default, switch to ZH and back)
- [ ] Hero stat animation counts up smoothly
- [ ] Current prices grid shows reasonable values
- [ ] About page renders correctly in both languages
- [ ] Mobile responsiveness (check smaller viewport)
- [ ] CPI data available for all 4 years (2022-2025, 48 months confirmed)

---

## Technical Details

### Files to modify

| File | Changes |
|------|---------|
| `supabase/functions/sync-dosm/index.ts` | Add MIN_PRICE map; tighten eggs MAX_PRICE to 8 |
| `src/lib/festivals.ts` | Add 8 festival entries for 2022-2023 |
| `src/components/PriceHeader.tsx` | Redesign title typography; new catchy headline |
| `src/components/HeroStat.tsx` | Larger RM figure; remove formula text from hero |
| `src/contexts/LanguageContext.tsx` | Default to "en" instead of "zh" |
| `src/lib/translations.ts` | Update pageTitle translations; add subtitle key |
| `index.html` | Change lang="zh-Hant" to lang="en" |

### Data cleanup steps (via edge function calls)
1. Deploy updated sync-dosm with tighter validation
2. Delete anomalous records: eggs > RM8, cooking oil < RM5
3. Re-sync months with affected basket data (2024-02 through 2026-02)
4. Verify cleaned data via SQL queries

### Execution order
1. Fix data first (sync-dosm update + data cleanup) -- this is the foundation
2. Add festival markers for 2022-2023
3. Redesign title/hero typography
4. Switch default language
5. Run full verification checklist
