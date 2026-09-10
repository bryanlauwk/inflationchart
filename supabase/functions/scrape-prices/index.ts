import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * RETIRED — this function used to fill gaps with randomly generated prices.
 * Generated numbers must never enter production data, so it now writes nothing.
 * The only ingestion route is `sync-dosm`, which reads the official published
 * PriceCatcher CSV downloads. Historical rows written by this function remain in
 * the database for audit and are labelled `legacy_unverified`.
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
      function_name: "scrape-prices",
      action: "retired",
      status: "rejected",
      error: "Synthetic price writer retired; no data written.",
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
        "scrape-prices has been retired. It previously generated synthetic prices. Use sync-dosm, which ingests the official published PriceCatcher CSV.",
      officialIngestion: "sync-dosm",
      source: "https://data.gov.my/data-catalogue/pricecatcher",
    }),
    { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
