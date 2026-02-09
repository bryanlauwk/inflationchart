

# Closed-Loop Data Pipeline: Sanity Check Integration

## What This Does

Currently, `sync-dosm` and `sanity-check-data` are separate functions -- sync writes data blindly, and the sanity check can only report problems after the fact. This plan creates a **closed-loop pipeline** where the sanity check runs automatically after every sync, and flagged items can be **quarantined or corrected** before they reach the frontend.

## How It Works

The pipeline flow after this change:

```text
sync-dosm triggered (daily cron or manual)
  |
  v
Step 1: Fetch & process CSV data from DOSM
  |
  v
Step 2: Layer 1 -- Run internal statistical checks on NEW data
         (range, volatility, spike, trend break)
  |
  +-- Any "error" severity flags? ──> Quarantine those items
  |                                    (don't upsert them into food_prices)
  |
  v
Step 3: Upsert only CLEAN data into food_prices
  |
  v
Step 4: Layer 2 -- Call Perplexity for cross-validation
         (market context, price control compliance, ratio checks)
  |
  +-- AI flags specific items as suspicious?
  |   ──> Mark them in sanity_check_results for review
  |
  v
Step 5: Store full audit trail in sanity_check_results table
  |
  v
Step 6: Return response with sync stats + sanity summary
```

## Key Design Decisions

**1. Quarantine, don't delete:** Items flagged with "error" severity in Layer 1 are held back from `food_prices` -- they're stored in a `quarantined_prices` table instead. This prevents bad data from reaching the chart while keeping the records for manual review.

**2. Warnings pass through:** Items with only "warn" severity are still upserted into `food_prices` -- they're noted in the audit log but not blocked. This avoids over-filtering legitimate seasonal price swings.

**3. Perplexity runs post-upsert:** The AI cross-validation (Layer 2) runs after clean data is written. This is because Perplexity needs the full picture (all items) to do ratio checks and economic context analysis. If it flags something, the finding is logged but doesn't auto-delete -- it surfaces as an advisory for the next sync cycle.

**4. Audit trail:** Every sync run gets a row in `sanity_check_results` with the full Layer 1 flags, Layer 2 AI audit, quarantined items, and pass/fail status. The `DataFreshnessBadge` on the frontend can optionally show the latest audit status.

**5. Frontend cleanup:** Remove the manual "Verify Data" button from the footer since the check now runs automatically in the pipeline.

## Technical Details

### New Database Tables

**`sanity_check_results`** -- Audit log for every pipeline run:

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid (PK) | Auto-generated |
| created_at | timestamptz | When the check ran |
| data_date | text | Latest food price date checked |
| item_count | integer | Items processed |
| internal_flags | jsonb | Layer 1 statistical flags |
| internal_error_count | integer | Count of error-severity flags |
| internal_warn_count | integer | Count of warning-severity flags |
| quarantined_items | jsonb | Items held back from food_prices |
| ai_audit | text | Perplexity markdown response |
| citations | jsonb | Perplexity source URLs |
| cpi_value | numeric | CPI at time of check |
| cpi_date | text | CPI date |
| passed | boolean | Overall pass/fail |

**`quarantined_prices`** -- Items blocked from food_prices:

| Column | Type | Purpose |
|--------|------|---------|
| id | uuid (PK) | Auto-generated |
| created_at | timestamptz | When quarantined |
| date | date | Price date |
| item | varchar | Food item name |
| price_rm | numeric | The suspicious price |
| reason | text | Why it was quarantined |
| resolved | boolean | Whether it was reviewed and resolved |

Both tables get SELECT-only RLS (public read, no public write).

### Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/sync-dosm/index.ts` | Add sanity check logic after CSV processing: run Layer 1 checks on processed data, quarantine error items, upsert clean data, call Perplexity for Layer 2, store results in `sanity_check_results` |
| `supabase/functions/sanity-check-data/index.ts` | Refactor into a shared utility pattern; also update to write results to `sanity_check_results` table when called standalone |
| `src/pages/Index.tsx` | Remove `DataSanityCheck` import and component from footer |
| `src/components/DataFreshnessBadge.tsx` | Optionally enhance to show latest audit pass/fail status from `sanity_check_results` |

### sync-dosm Integration Detail

The key change is in the `processMonthCSV` return path. Currently:

```text
processMonthCSV() -> returns all prices -> upsert ALL into food_prices
```

After this change:

```text
processMonthCSV() -> returns all prices
  -> runInternalChecks(prices, historicalPrices, latestDate)
  -> separate into clean[] and quarantined[]
  -> upsert clean[] into food_prices
  -> upsert quarantined[] into quarantined_prices
  -> call Perplexity with clean[] for Layer 2
  -> store audit in sanity_check_results
```

The `PLAUSIBLE_RANGES`, `runInternalChecks()`, and `formatInternalReport()` functions from `sanity-check-data` will be inlined into `sync-dosm` (since edge functions can't import from each other). The sanity-check-data function will remain as a standalone ad-hoc tool that also writes to the audit table.

### Perplexity Call in sync-dosm

The Perplexity call is wrapped in a try/catch so that if the API is down or rate-limited, the sync still completes -- the AI audit field is simply marked as "unavailable" in the audit log. Data quality should not be blocked by an external API outage.

### DataFreshnessBadge Enhancement

The badge will query the latest `sanity_check_results` row and show:
- Green checkmark if `passed = true` and no errors
- Yellow warning if warnings exist but no errors
- Red alert if errors exist or quarantined items were found

This gives users a passive data quality signal without needing a manual button.

