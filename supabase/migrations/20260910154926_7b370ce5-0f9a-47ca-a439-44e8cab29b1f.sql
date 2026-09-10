
-- 1. Provenance on food_prices
ALTER TABLE public.food_prices
  ADD COLUMN IF NOT EXISTS source_type text NOT NULL DEFAULT 'legacy_unverified',
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS source_file_month text,
  ADD COLUMN IF NOT EXISTS unit text,
  ADD COLUMN IF NOT EXISTS mapping_version text,
  ADD COLUMN IF NOT EXISTS observation_count integer,
  ADD COLUMN IF NOT EXISTS fetched_at timestamptz;

CREATE INDEX IF NOT EXISTS food_prices_item_date_idx ON public.food_prices (item, date);

-- 2. Ingestion run log
CREATE TABLE IF NOT EXISTS public.ingestion_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  function_name text NOT NULL,
  action text NOT NULL,
  status text NOT NULL DEFAULT 'running',
  source_type text,
  source_url text,
  source_month text,
  newest_source_date date,
  rows_upserted integer NOT NULL DEFAULT 0,
  rows_quarantined integer NOT NULL DEFAULT 0,
  duration_ms integer,
  error text,
  checkpoint jsonb NOT NULL DEFAULT '{}'::jsonb
);

GRANT SELECT ON public.ingestion_runs TO anon;
GRANT SELECT ON public.ingestion_runs TO authenticated;
GRANT ALL ON public.ingestion_runs TO service_role;
ALTER TABLE public.ingestion_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read ingestion runs" ON public.ingestion_runs;
CREATE POLICY "Anyone can read ingestion runs" ON public.ingestion_runs FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS ingestion_runs_updated_at ON public.ingestion_runs;
CREATE TRIGGER ingestion_runs_updated_at BEFORE UPDATE ON public.ingestion_runs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Monthly aggregate views (observed days only, no gap filling)
CREATE OR REPLACE VIEW public.monthly_item_prices
WITH (security_invoker = true) AS
SELECT
  item,
  to_char(date_trunc('month', date), 'YYYY-MM') AS month,
  round(avg(price_rm)::numeric, 4) AS avg_price_rm,
  round(min(price_rm)::numeric, 4) AS min_price_rm,
  round(max(price_rm)::numeric, 4) AS max_price_rm,
  count(DISTINCT date)::int AS observed_days,
  min(date) AS first_observed,
  max(date) AS last_observed,
  count(*) FILTER (WHERE source_type <> 'legacy_unverified')::int AS sourced_rows
FROM public.food_prices
WHERE item <> 'basket'
GROUP BY item, date_trunc('month', date);

GRANT SELECT ON public.monthly_item_prices TO anon, authenticated, service_role;

CREATE OR REPLACE VIEW public.monthly_indicators
WITH (security_invoker = true) AS
SELECT
  type,
  to_char(date_trunc('month', date), 'YYYY-MM') AS month,
  round(avg(value)::numeric, 4) AS value,
  count(*)::int AS observations,
  max(date) AS last_observed
FROM public.indicators
GROUP BY type, date_trunc('month', date);

GRANT SELECT ON public.monthly_indicators TO anon, authenticated, service_role;

-- 4. Scheduler secret generated inside the DB; value never leaves the vault
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'PIPELINE_CRON_SECRET') THEN
    PERFORM vault.create_secret(encode(gen_random_bytes(32), 'hex'), 'PIPELINE_CRON_SECRET', 'Shared secret used by pg_cron to authenticate to the sync-dosm edge function');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.verify_pipeline_cron_secret(candidate text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, vault
AS $$
  SELECT EXISTS (
    SELECT 1 FROM vault.decrypted_secrets
    WHERE name = 'PIPELINE_CRON_SECRET'
      AND candidate IS NOT NULL
      AND length(candidate) > 20
      AND decrypted_secret = candidate
  );
$$;

REVOKE ALL ON FUNCTION public.verify_pipeline_cron_secret(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_pipeline_cron_secret(text) TO service_role;

-- 5. Retire the synthetic scraper schedule; re-point the official sync at the vault secret
SELECT cron.unschedule(1);
SELECT cron.unschedule(4);

SELECT cron.schedule(
  'sync-dosm-daily',
  '0 16 * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://uxzyicmsastcrldfvgpf.supabase.co/functions/v1/sync-dosm',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-pipeline-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'PIPELINE_CRON_SECRET')
    ),
    body := jsonb_build_object('action', 'refresh'),
    timeout_milliseconds := 120000
  );
  $cron$
);
