
-- Create sanity_check_results table for audit trail
CREATE TABLE public.sanity_check_results (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  data_date text NOT NULL,
  item_count integer NOT NULL DEFAULT 0,
  internal_flags jsonb DEFAULT '[]'::jsonb,
  internal_error_count integer DEFAULT 0,
  internal_warn_count integer DEFAULT 0,
  quarantined_items jsonb DEFAULT '[]'::jsonb,
  ai_audit text,
  citations jsonb DEFAULT '[]'::jsonb,
  cpi_value numeric,
  cpi_date text,
  passed boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE public.sanity_check_results ENABLE ROW LEVEL SECURITY;

-- Public read-only
CREATE POLICY "Anyone can read sanity check results"
ON public.sanity_check_results
FOR SELECT
USING (true);

-- Create quarantined_prices table for items blocked from food_prices
CREATE TABLE public.quarantined_prices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  date date NOT NULL,
  item varchar NOT NULL,
  price_rm numeric NOT NULL,
  reason text NOT NULL,
  resolved boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE public.quarantined_prices ENABLE ROW LEVEL SECURITY;

-- Public read-only
CREATE POLICY "Anyone can read quarantined prices"
ON public.quarantined_prices
FOR SELECT
USING (true);
