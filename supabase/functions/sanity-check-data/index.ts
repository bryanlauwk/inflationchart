import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) {
      throw new Error("PERPLEXITY_API_KEY is not configured");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch latest prices for all individual items (excluding basket)
    const { data: latestDateRow } = await supabase
      .from("food_prices")
      .select("date")
      .neq("item", "basket")
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latestDateRow) {
      throw new Error("No food price data found in database");
    }

    const latestDate = latestDateRow.date;

    // Get all items for the latest date
    const { data: latestPrices, error: pricesError } = await supabase
      .from("food_prices")
      .select("item, price_rm, date")
      .eq("date", latestDate)
      .neq("item", "basket")
      .order("item");

    if (pricesError) throw pricesError;

    // Also fetch CPI for context
    const { data: latestCpi } = await supabase
      .from("indicators")
      .select("value, date")
      .eq("type", "CPI")
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Build the data payload for Perplexity
    const pricesSummary = (latestPrices || [])
      .map((p) => `${p.item}: RM${p.price_rm}/kg`)
      .join("\n");

    const dataContext = `Malaysian Food Prices as of ${latestDate} (source: OpenDOSM PriceCatcher):\n\n${pricesSummary}\n\nCPI (latest): ${latestCpi?.value ?? "N/A"} (date: ${latestCpi?.date ?? "N/A"})\n\nNote: All prices are in Malaysian Ringgit (RM) per kilogram unless otherwise noted. Eggs are per unit (10 eggs). Rice is per kg. Cooking oil is per kg bottle.`;

    const systemPrompt = `You are a data integrity bot. Compare these values against the latest Bureau of Labor Statistics (BLS) data. Flag any value that deviates by >0.2% and provide the correct value.

Additionally, cross-reference with Malaysian DOSM (Department of Statistics Malaysia) published food price data where available.

Format your response as:
1. A brief summary of data quality
2. A list of flagged items (if any) with:
   - Item name
   - Reported value
   - Expected value (from reference data)
   - Deviation percentage
   - Source of reference data
3. Items that appear reasonable
4. Any data gaps or concerns

Be concise and structured. Use markdown formatting.`;

    // Call Perplexity API with sonar-pro
    const perplexityResponse = await fetch(
      "https://api.perplexity.ai/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar-pro",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Please audit the following food price data for accuracy and consistency:\n\n${dataContext}`,
            },
          ],
          temperature: 0.1,
          max_tokens: 2000,
        }),
      }
    );

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error("Perplexity API error:", perplexityResponse.status, errorText);
      throw new Error(
        `Perplexity API error [${perplexityResponse.status}]: ${errorText}`
      );
    }

    const perplexityData = await perplexityResponse.json();
    const auditContent =
      perplexityData.choices?.[0]?.message?.content ?? "No response from AI";
    const citations = perplexityData.citations ?? [];

    return new Response(
      JSON.stringify({
        success: true,
        audit: auditContent,
        citations,
        dataDate: latestDate,
        itemCount: latestPrices?.length ?? 0,
        cpiValue: latestCpi?.value ?? null,
        cpiDate: latestCpi?.date ?? null,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("sanity-check-data error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
