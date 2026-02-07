
-- Remove overly permissive INSERT/UPDATE policies
-- Edge functions use service_role which bypasses RLS, so no write policies needed
DROP POLICY "Service role can insert food prices" ON public.food_prices;
DROP POLICY "Service role can update food prices" ON public.food_prices;
DROP POLICY "Service role can insert indicators" ON public.indicators;
DROP POLICY "Service role can update indicators" ON public.indicators;
