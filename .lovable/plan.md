
# Update Purchasing Power Analysis + Verify Pipeline Integrity

## Problem Found

The purchasing power analysis is silently missing items because the database queries exceed the 1000-row default limit:
- Q1 2022 data: 1,860 rows (truncated to 1,000)
- Latest period data: 1,171 rows (truncated to 1,000)

This means some of the 25 food items get dropped entirely from the results, depending on alphabetical ordering.

## Changes

### 1. Fix `src/hooks/usePurchasingPowerAnalysis.ts`

**Root cause fix:** Add `.limit(5000)` to both the early-period and late-period queries so all rows are fetched.

**Additional improvements:**
- Add `itemCount` field to `PurchasingPowerData` so the UI can display total coverage (e.g., "Across 25 items")
- Add `latestDate` field so the UI knows the comparison end date

### 2. Update `src/components/PurchasingPowerSummary.tsx`

- Show item count in the subtitle area (e.g., "25 items" badge next to the CPI badge)
- No structural changes needed -- the two-column layout (losers vs stable) already works correctly once all items are returned

### 3. Add translation key in `src/lib/translations.ts`

- Add `"analysis.itemCount"` with `zh: "品项"` / `en: "items"` for the item count badge

### 4. Verify Perplexity Layer 2 and audit integrity (no code changes needed)

The pipeline is confirmed working:
- Latest audit: `passed: true`, 0 errors, 12 warnings, CPI 134.7
- Perplexity Layer 2 ran successfully with citations
- Quarantine system functioning (0 items quarantined = clean data)

No corrections needed to the pipeline or audit data.

---

## Technical Details

### Query fix (the critical change)

```text
Before:
  supabase.from("food_prices").select("item, price_rm").gte("date", "2022-01-01").lte("date", "2022-03-31")
  // Returns max 1000 rows -- misses items

After:
  supabase.from("food_prices").select("item, price_rm").gte("date", "2022-01-01").lte("date", "2022-03-31").limit(5000)
  // Returns all 1860 rows -- all 25 items covered
```

Same fix applied to the late-period query.

### Files to modify

| File | Change |
|------|--------|
| `src/hooks/usePurchasingPowerAnalysis.ts` | Add `.limit(5000)` to both queries; add `itemCount` and `latestDate` to return type |
| `src/components/PurchasingPowerSummary.tsx` | Show item count badge in header |
| `src/lib/translations.ts` | Add `analysis.itemCount` translation |
