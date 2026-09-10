import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * RETIRED — this function used to fabricate historical prices from a base price
 * plus a compound trend and sine-wave noise. Fabricated history must never enter
 * production data, so it now writes nothing.
 *
 * Historical backfill is done by `sync-dosm` with `{"action":"sync","months":[...]}`,
 * which reads the official published PriceCatcher CSV for each month.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || authHeader !== `Bearer ${serviceRoleKey}`) {
    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, serviceRoleKey);
    await supabase.from("ingestion_runs").insert({
      function_name: "backfill-prices",
      action: "retired",
      status: "rejected",
      error: "Synthetic history generator retired; no data written.",
    });
  } catch (_e) {
    // Logging the refusal must never be the reason a caller sees a 500.
  }

  return new Response(
    JSON.stringify({
      success: false,
      retired: true,
      wrote: 0,
      error:
        "backfill-prices has been retired. It previously generated synthetic history. Use sync-dosm with {\"action\":\"sync\",\"months\":[\"YYYY-MM\"]} to ingest official monthly data.",
      officialIngestion: "sync-dosm",
      source: "https://data.gov.my/data-catalogue/pricecatcher",
    }),
    { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
