

# Comprehensive Data Pipeline Fix, Expansion, and About Page

## Summary

Five areas of work: (1) fix CPI sync timeout, (2) clean sugar data anomaly and add tighter price bounds, (3) add 7 new vegetable and fruit items, (4) create an About/Methodology page, (5) improve item organization in UI.

---

## 1. Fix CPI Sync Timeout

**Problem**: The `indicators` table is completely empty. The CPI sync in `sync-dosm` fetches from `api.data.gov.my/opendosm?id=cpi_core` but times out because it downloads all divisions (food, transport, housing, etc.) across all dates, then filters client-side for `division === "overall"`.

**Fix**: Add server-side filtering to the API request:
- Use `&filter=division@overall` parameter to request only the "overall" division
- Add `&date_start=2024-01-01` to limit to relevant date range
- Reduce pagination to avoid edge function timeout (max 50s)
- If the API doesn't support those filters, reduce the loop cap and process faster

**Expected result**: ~24 monthly CPI records (Jan 2024 to present) inserted into `indicators` table.

---

## 2. Fix Sugar Data Anomaly

**Problem**: On `2025-01-09`, sugar shows RM282.85 instead of ~RM2.87. This cascades to the basket total (RM325.55). The current price filter (`price > 0 && price < 500`) is too loose.

**Root cause**: Likely a malformed CSV line where the price field contained a concatenated value, or a genuinely erroneous data point in the PriceCatcher CSV.

**Fix**:
1. Delete the bad record and its corrupted basket entry for 2025-01-09
2. Re-sync January 2025 data with tighter bounds
3. Add per-item price ceiling in the sync function:

```text
Item-specific max prices (RM per unit):
chicken:    25    (1kg, typically 8-12)
eggs:       15    (10 pcs, typically 4-6)
tomato:     20    (1kg, typically 4-8)
longbeans:  20    (1kg, typically 5-10)
rice:       10    (per kg after /10, typically 3-5)
milk:       20    (1L, typically 6-9)
kangkung:   15    (1kg, typically 3-7)
onion:      15    (1kg, typically 3-7)
sugar:      10    (1kg, typically 2-4)
cookingoil: 15    (1kg, typically 4-8)
(new items: similar bounds)
```

This replaces the blanket `price < 500` check with item-aware validation.

---

## 3. Add Vegetables and Fruits

Add 7 new items from PriceCatcher, all priced per kg for unit consistency.

### New Vegetables (3 items)

| DB Key | Chinese | English | PriceCatcher Codes | Notes |
|--------|---------|---------|-------------------|-------|
| `chili` | 辣椒 | Chili | 92 (hijau), 93 (merah kulai), 94 (merah minyak) | Average across green and red varieties |
| `cabbage` | 包菜 | Cabbage | 104 (import China), 105 (tempatan), 1396, 1458 | All per kg |
| `spinach` | 菠菜 | Spinach | 1556 (bayam hijau), 1557 (bayam merah) | Bayam |

### New Fruits (4 items)

| DB Key | Chinese | English | PriceCatcher Codes | Notes |
|--------|---------|---------|-------------------|-------|
| `papaya` | 木瓜 | Papaya | 16 (betik biasa) | Per kg |
| `banana` | 香蕉 | Banana | 18 (pisang berangan) | Per kg, most common variety |
| `watermelon` | 西瓜 | Watermelon | 20 (berbiji), 21 (tanpa biji) | Average seeded + seedless |
| `lime` | 酸柑 | Lime | 1132 (limau nipis) | Per kg |

### Why these items
- All measured per kg (unlike apples/oranges which are per piece) -- consistent with existing items
- High coverage in PriceCatcher (surveyed daily nationwide)
- Common Malaysian kitchen staples across all ethnic groups
- Good price volatility -- vegetables and fruits show more seasonal variation than staples

### Changes required
- Update `FoodItem` type union in `useFoodPrices.ts`
- Add to `ITEM_MAP` in `sync-dosm/index.ts` with per-item max prices
- Add translation keys for all 7 new items
- Add to `PriceHeader` dropdown (with category grouping)
- Run backfill for all months (2024-02 to 2026-02) to populate historical data

---

## 4. About / Methodology Page

Create a new `/about` route with a dedicated page explaining the data pipeline, calculation methods, and data freshness.

### Page structure

```text
About This Project
==================

Section 1: What This Tracks
- 18 food items (10 staples + 3 vegetables + 4 fruits + 1 composite basket)
- National daily average prices from ~5,000+ retail premises
- CPI-adjusted "real price" to show true purchasing power

Section 2: Data Pipeline
- Source: KPDN PriceCatcher via OpenDOSM (storage.data.gov.my)
- Monthly CSV files containing millions of individual price observations
- Pipeline computes national daily averages per item
- CPI from DOSM via OpenDOSM API (cpi_core dataset)
- Automated daily sync for current month data

Section 3: Calculation Method
- Nominal Price: Simple average of all surveyor-reported prices for an item on a given day
- Real Price = Nominal Price / CPI x 100
- Basket = Sum of all individual item averages for a given day
- Percentage change = (Latest - Earliest) / Earliest x 100

Section 4: Item Code Mapping Table
- Full table showing each tracked item, its PriceCatcher item_codes, unit, and normalization (e.g. rice: 10kg bags divided by 10)

Section 5: Data Freshness & Limitations
- PriceCatcher data typically available within 1-2 days
- CPI data is monthly, published with ~2 month lag
- Some items have sparse daily coverage (fewer surveyor visits)
- Prices represent national averages and may not reflect regional variation

Section 6: Credits & Links
- OpenDOSM: open.dosm.gov.my
- KPDN: kpdn.gov.my
- DOSM: dosm.gov.my
- Inspired by inflationchart.com
```

### Design
- Same Eslite aesthetic as the main page
- Serif headings, warm palette
- Bilingual (Chinese/English) using the existing translation system
- Navigation link in the header and footer to go between Home and About

---

## 5. UI Improvements for 18 Items

With 18 items (up from 11), the flat dropdown and 2-column grid become crowded. Changes:

### Dropdown grouping
Organize the Select dropdown into three visual groups:
- **Staples** (综合/主食): Basket, Chicken, Eggs, Rice, Milk, Sugar, Cooking Oil
- **Vegetables** (蔬菜): Tomato, Long Beans, Kangkung, Onion, Cabbage, Spinach, Chili, Cucumber (if added)
- **Fruits** (水果): Papaya, Banana, Watermelon, Lime

Use `SelectGroup` with `SelectLabel` from Radix to create labeled sections.

### Current Prices Grid
- Expand to 3-column grid on sidebar
- Add subtle category labels (主食 / 蔬菜 / 水果) as tiny section headers within the grid
- Keep the click-to-select behavior

---

## Technical Details

### Files to Create

| File | Purpose |
|------|---------|
| `src/pages/About.tsx` | Methodology and data pipeline page |

### Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add `/about` route |
| `src/hooks/useFoodPrices.ts` | Expand `FoodItem` type with 7 new items |
| `src/lib/translations.ts` | Add translations for new items, About page text, category labels |
| `src/components/PriceHeader.tsx` | Grouped dropdown with SelectGroup, add About nav link |
| `src/components/CurrentPricesGrid.tsx` | 3-column layout, category section headers |
| `src/pages/Index.tsx` | Add About link in footer |
| `supabase/functions/sync-dosm/index.ts` | Add 7 new item codes, per-item price bounds, fix CPI API filtering |

### Edge Function Changes (sync-dosm)

1. Add new entries to `ITEM_MAP`:
```text
chili:      { codes: [92, 93, 94], divisor: 1 }
cabbage:    { codes: [104, 105, 1396, 1458], divisor: 1 }
spinach:    { codes: [1556, 1557], divisor: 1 }
papaya:     { codes: [16], divisor: 1 }
banana:     { codes: [18], divisor: 1 }
watermelon: { codes: [20, 21], divisor: 1 }
lime:       { codes: [1132], divisor: 1 }
```

2. Add `MAX_PRICE` map for per-item validation:
```text
chicken: 25, eggs: 15, tomato: 20, longbeans: 20,
rice: 10, milk: 20, kangkung: 15, onion: 15,
sugar: 10, cookingoil: 15, chili: 30, cabbage: 15,
spinach: 15, papaya: 15, banana: 20, watermelon: 10, lime: 20
```

3. Fix CPI sync: add API filters, reduce pagination

### Data Operations (post-deploy)

1. Delete bad sugar record: `DELETE FROM food_prices WHERE item = 'sugar' AND date = '2025-01-09'`
2. Delete bad basket record: `DELETE FROM food_prices WHERE item = 'basket' AND date = '2025-01-09'`
3. Re-sync January 2025: `{ "action": "sync", "months": ["2025-01"] }`
4. Sync CPI: `{ "action": "cpi" }`
5. Backfill all months for new items (the existing months will be re-processed, adding new item averages)

### Execution Order

1. Update sync-dosm with new items, price bounds, and CPI fix -- deploy
2. Clean bad data (delete sugar/basket anomaly records)
3. Run CPI sync
4. Re-sync all months (2024-02 through 2026-02) to populate new items and fix sugar
5. Update frontend: FoodItem type, translations, grouped dropdown, grid improvements
6. Create About page and add route
7. Verify end-to-end: chart renders for new items, CPI line appears, About page works

