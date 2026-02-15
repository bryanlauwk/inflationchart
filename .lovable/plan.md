

# Fix Build Errors + Add Text Logo to Header

## 1. Fix Build Errors in sync-dosm

All 19 build errors stem from one root cause: the auto-generated Supabase types file doesn't yet reflect the new `sanity_check_results` and `quarantined_prices` tables. The Supabase client infers `never` for unknown tables, causing every `.from("quarantined_prices")`, `.from("sanity_check_results")`, and `.from("indicators")` call to fail type-checking.

**Fix:** Cast the Supabase client to `any` for these operations, or use explicit type annotations on the query results. The simplest and most maintainable approach is to type the `supabase` parameter as `any` in the helper functions (`runSanityPipeline`, `upsertWithSanityCheck`, `syncCPI`, `processMonthCSV`) since edge functions don't benefit from strict Supabase typing the way frontend code does.

Specifically:
- Change `supabase: ReturnType<typeof createClient>` to `supabase: any` in `runSanityPipeline`, `upsertWithSanityCheck`, `syncCPI`, and `processMonthCSV`
- This resolves all 19 type errors in one sweep

## 2. Add Text Logo to Header

Add a clickable "@bryanlauwk" text logo in the top-right corner of the header, next to the existing language toggle button.

**Changes to `src/components/PriceHeader.tsx`:**
- Replace the lone language toggle button with a small flex group containing:
  1. A clickable link `@bryanlauwk` pointing to `https://bryanlauwk.fun`, styled as subtle muted text that highlights on hover (matching the editorial brand)
  2. A `·` separator
  3. The existing language toggle button
- Position: top-right, aligned with the current language button location

## Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/sync-dosm/index.ts` | Fix all 19 type errors by using `any` for supabase parameter types |
| `src/components/PriceHeader.tsx` | Add clickable text logo next to language toggle |

