
-- Main prices table
CREATE TABLE public.food_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  item VARCHAR(50) NOT NULL,
  price_rm DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(date, item)
);

CREATE INDEX idx_prices_date_item ON public.food_prices(date, item);

-- Enable RLS (public read, no auth needed for this public dashboard)
ALTER TABLE public.food_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read food prices"
  ON public.food_prices
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert food prices"
  ON public.food_prices
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update food prices"
  ON public.food_prices
  FOR UPDATE
  USING (true);

-- Economic indicators table
CREATE TABLE public.indicators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  type VARCHAR(50) NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  UNIQUE(date, type)
);

CREATE INDEX idx_indicators_date_type ON public.indicators(date, type);

ALTER TABLE public.indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read indicators"
  ON public.indicators
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert indicators"
  ON public.indicators
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update indicators"
  ON public.indicators
  FOR UPDATE
  USING (true);
