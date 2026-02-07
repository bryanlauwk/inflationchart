

# Malaysian Food Price Tracker -- Overhaul Plan

## Summary of Changes

Four areas of work: (1) current prices grid, (2) expanded basket items, (3) bilingual Chinese/English with Chinese as default, (4) full visual redesign in Eslite-inspired style.

---

## About Data Legitimacy

The existing ~5,166 price records are **synthetically generated** by the backfill edge function. They use a compound monthly inflation formula (e.g. chicken at 1%/month, eggs at 1.5%/month) with sine-wave noise -- not real market data.

The daily scraper attempts to pull from KPDN PriceCatcher via Firecrawl but usually falls back to +/-2% random variance from the last known price. This means almost all data points are simulated.

**Recommendation**: Add a clear disclaimer in the sidebar indicating that historical data is modeled/estimated. Real scraping accuracy can be improved separately. The synthetic data is directionally reasonable but should not be presented as factual market prices.

---

## 1. Current Prices Grid

**New component**: `CurrentPricesGrid` in the sidebar, showing a 2x2 (expanding to 3-column grid on wider sidebars) layout of today's latest prices for all tracked items.

- Fetches latest prices via a new `useLatestPrices` hook that queries `food_prices` for the most recent date, grouped by item
- Each cell shows the item name (in current language), price in RM, and a small up/down indicator vs. previous day
- Clicking an item cell updates the main chart to that item
- Placed above the stat card in the sidebar

---

## 2. Expanded Basket Items

Add **4 new items** to broaden coverage. These are common Malaysian staples:

| DB Key | Chinese | English | Base Price (RM) | Monthly Rate |
|--------|---------|---------|-----------------|--------------|
| `kangkung` | 空心菜 | Kangkung | 3.50 | 1.4% |
| `onion` | 洋葱 | Onion | 3.80 | 1.6% |
| `sugar` | 白糖 | Sugar | 2.85 | 0.5% |
| `cookingoil` | 食用油 | Cooking Oil | 6.90 | 1.0% |

**Changes required**:
- Update `FoodItem` type union in `useFoodPrices.ts`
- Add items to `PriceHeader` dropdown
- Update `backfill-prices` edge function with new base prices and rates
- Update `scrape-prices` edge function with new keyword mappings
- Re-run backfill to populate historical data for new items

---

## 3. Bilingual Support (Chinese Default + English Toggle)

### Architecture

Create a lightweight i18n system using React Context -- no heavy library needed for two languages.

- **`LanguageContext`** (`src/contexts/LanguageContext.tsx`): provides `lang` ("zh" | "en") and `toggleLang()` 
- **`translations.ts`** (`src/lib/translations.ts`): a flat dictionary file mapping all UI strings in both languages
- **Language toggle**: A minimal text toggle in the top-right corner of the header -- styled as inline text "EN / 中" (not a button with icons), matching the Eslite aesthetic

### Translation scope

All visible text: page title, dropdown labels, sidebar headings, stat descriptions, chart legend names, tooltip labels, footer, data source explanations, disclaimer text.

### Default behavior

- Page loads in Chinese (zh)
- Toggle switches to English
- Preference stored in `localStorage`

---

## 4. Eslite (诚品) Design Overhaul

The Eslite aesthetic is defined by: **restraint, warmth, literary sensibility, and generous whitespace.** Think of a well-curated bookstore -- quiet confidence, not shouting.

### Key design principles applied

1. **Typography over decoration** -- Let type hierarchy do the work. No emoji in UI chrome. No gradient titles.
2. **Warm neutrals on dark** -- Replace pure black (#000) with a warm very-dark charcoal. Cards get a subtle warm tint.
3. **Serif for headings** -- Use `Noto Serif TC` (Google Fonts, free) for Chinese headings and section titles. Body text stays in a clean sans-serif (`Noto Sans TC` for Chinese, system sans for English).
4. **Thin, deliberate borders** -- Hairline dividers, not chunky borders. Borders in warm gray, not cold gray.
5. **No emoji in structural UI** -- Remove all emoji from headings, buttons, cards, dropdown labels. The data speaks for itself.
6. **Accent color**: A single warm terracotta/rust tone (around `hsl(15, 60%, 50%)`) replaces the red-orange-yellow gradient. Used sparingly for links, the active state, and key statistics.
7. **Generous spacing** -- More padding, more breathing room between sections.

### CSS variable changes (`index.css`)

```text
Current                          New (Eslite-inspired)
--background: 0 0% 0%           --background: 30 5% 5%        (warm near-black)
--foreground: 0 0% 95%          --foreground: 40 10% 88%      (warm off-white)
--card: 0 0% 4%                 --card: 30 4% 8%              (warm dark card)
--muted: 0 0% 12%               --muted: 30 4% 14%            (warm muted)
--muted-fg: 0 0% 55%            --muted-fg: 30 5% 50%         (warm gray text)
--border: 0 0% 15%              --border: 30 5% 18%           (warm hairline)
--primary: 0 72% 51%            --primary: 15 55% 48%         (terracotta)
--chart-bg: 0 0% 3%             --chart-bg: 30 5% 6%          (warm chart bg)
```

### Font loading

Add Google Fonts link in `index.html`:
```text
Noto Serif TC (weights 400, 700) -- for zh headings
Noto Sans TC (weights 400, 500, 700) -- for zh body
```

Add font-family configuration in `tailwind.config.ts`:
```text
fontFamily: {
  serif: ['"Noto Serif TC"', 'Georgia', 'serif'],
  sans: ['"Noto Sans TC"', 'system-ui', 'sans-serif'],
}
```

### Component-level changes

**`PriceHeader`**:
- Remove emoji from title. New title: "马来西亚食品价格 -- 实际购买力" (zh) / "Malaysian Food Prices -- Real Purchasing Power" (en)
- Title uses `font-serif` class, warm foreground color, no gradient
- Language toggle as small text link in top-right
- Dropdowns use clean labels without emoji (e.g., "鸡肉" not "🐔 Chicken")

**`PriceChart`**:
- Keep chart colors (green/blue/red lines) -- these are functional, not decorative
- Tooltip and legend text uses the translation system
- Slightly warmer chart background

**`PriceSidebar`**:
- Remove all emoji from headings ("图表说明" not "💡 What This Chart Shows")
- Section titles in serif font
- Current prices grid at top with clean typography
- Thinner card borders, more internal padding
- Legend uses small colored circles (CSS) instead of emoji (🟢🔵🔴)

**`Index.tsx` (footer)**:
- Clean footer without emoji, warm muted text
- Links use terracotta accent color

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/contexts/LanguageContext.tsx` | Language provider + toggle hook |
| `src/lib/translations.ts` | All UI strings in zh/en |
| `src/components/CurrentPricesGrid.tsx` | Today's prices grid component |
| `src/hooks/useLatestPrices.ts` | Fetch latest prices for all items |

## Files to Modify

| File | Changes |
|------|---------|
| `index.html` | Add Google Fonts, update title/meta |
| `src/index.css` | Warm color palette, font defaults |
| `tailwind.config.ts` | Add font-family config |
| `src/App.tsx` | Wrap with `LanguageProvider` |
| `src/pages/Index.tsx` | Integrate language context, pass to children |
| `src/components/PriceHeader.tsx` | Bilingual labels, no emoji, serif title, language toggle |
| `src/components/PriceChart.tsx` | Bilingual tooltip/legend labels |
| `src/components/PriceSidebar.tsx` | Bilingual text, no emoji, add CurrentPricesGrid, serif headings |
| `src/hooks/useFoodPrices.ts` | Expand `FoodItem` type with 4 new items |
| `supabase/functions/backfill-prices/index.ts` | Add 4 new items with base prices |
| `supabase/functions/scrape-prices/index.ts` | Add keyword mappings for new items |

## Execution order

1. Create translation system and language context
2. Update CSS/Tailwind for Eslite palette and fonts
3. Expand `FoodItem` type and update edge functions
4. Create `useLatestPrices` hook and `CurrentPricesGrid` component
5. Update all UI components with bilingual support and new design
6. Re-deploy edge functions and run backfill for new items
7. Test end-to-end: language toggle, item switching, responsive layout

