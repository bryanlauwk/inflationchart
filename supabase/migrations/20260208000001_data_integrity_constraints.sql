
-- Data integrity constraints: enforce valid price ranges at the database level
-- so no pipeline (sync-dosm, scrape-prices, backfill) can insert invalid data.

-- 1. Price must be positive
ALTER TABLE public.food_prices
  ADD CONSTRAINT chk_price_positive CHECK (price_rm > 0);

-- 2. Price must be within a reasonable ceiling (RM 500 as absolute max)
ALTER TABLE public.food_prices
  ADD CONSTRAINT chk_price_ceiling CHECK (price_rm <= 500);

-- 3. Date must not be in the future (prevents accidental time-zone issues)
ALTER TABLE public.food_prices
  ADD CONSTRAINT chk_date_not_future CHECK (date <= CURRENT_DATE + INTERVAL '1 day');

-- 4. Item must be from the known set of tracked items
ALTER TABLE public.food_prices
  ADD CONSTRAINT chk_item_known CHECK (
    item IN (
      'basket', 'chicken', 'eggs', 'tomato', 'longbeans', 'rice', 'milk',
      'kangkung', 'onion', 'sugar', 'cookingoil', 'chili', 'cabbage',
      'spinach', 'papaya', 'banana', 'watermelon', 'lime'
    )
  );

-- 5. CPI value must be positive and reasonable (50-200 range for Malaysia)
ALTER TABLE public.indicators
  ADD CONSTRAINT chk_indicator_positive CHECK (value > 0);
ALTER TABLE public.indicators
  ADD CONSTRAINT chk_indicator_ceiling CHECK (value <= 300);

-- 6. Add source column to track data provenance
--    'dosm' = official DOSM data, 'scrape' = web scraping, 'backfill' = synthetic
ALTER TABLE public.food_prices
  ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'dosm';

-- 7. Add NOT NULL constraint on source after setting default for existing rows
UPDATE public.food_prices SET source = 'dosm' WHERE source IS NULL;
ALTER TABLE public.food_prices
  ALTER COLUMN source SET NOT NULL;
ALTER TABLE public.food_prices
  ADD CONSTRAINT chk_source_known CHECK (source IN ('dosm', 'scrape', 'backfill'));

-- 8. Add delete policy — only service role should delete (it bypasses RLS,
--    but having no policy means anon can't delete even if they try)
CREATE POLICY "Deny public deletes on food_prices"
  ON public.food_prices
  FOR DELETE
  USING (false);

CREATE POLICY "Deny public deletes on indicators"
  ON public.indicators
  FOR DELETE
  USING (false);
