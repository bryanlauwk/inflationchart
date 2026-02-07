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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Base prices (Feb 2024 baseline) — per kg or per unit as labeled
    const basePrices: Record<string, number> = {
      chicken: 5.95,
      eggs: 10.5,
      tomato: 4.5,
      longbeans: 4.0,
      rice: 14.5,
      milk: 9.8,
    };

    // Item-specific monthly inflation rates for realism
    const monthlyRates: Record<string, number> = {
      chicken: 0.01,
      eggs: 0.015,
      tomato: 0.018,
      longbeans: 0.012,
      rice: 0.008,
      milk: 0.011,
    };

    const startDate = new Date("2024-02-01");
    const endDate = new Date();
    const allPrices: Array<{ date: string; item: string; price_rm: number }> = [];

    const currentDate = new Date(startDate);
    let dayIndex = 0;

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const monthsSinceStart =
        (currentDate.getFullYear() - startDate.getFullYear()) * 12 +
        (currentDate.getMonth() - startDate.getMonth());

      let basketTotal = 0;

      for (const [item, basePrice] of Object.entries(basePrices)) {
        const rate = monthlyRates[item];
        // Compound monthly inflation + daily noise ±3%
        const trendPrice = basePrice * Math.pow(1 + rate, monthsSinceStart);
        const noise = (Math.sin(dayIndex * 0.7 + item.length) * 0.015) + 
                      (Math.cos(dayIndex * 1.3 + item.length * 2) * 0.015);
        const finalPrice = Math.round(trendPrice * (1 + noise) * 100) / 100;

        allPrices.push({ date: dateStr, item, price_rm: finalPrice });
        basketTotal += finalPrice;
      }

      // Basket = sum of all items
      allPrices.push({
        date: dateStr,
        item: "basket",
        price_rm: Math.round(basketTotal * 100) / 100,
      });

      currentDate.setDate(currentDate.getDate() + 1);
      dayIndex++;
    }

    // Batch upsert in chunks of 500
    const chunkSize = 500;
    let inserted = 0;

    for (let i = 0; i < allPrices.length; i += chunkSize) {
      const chunk = allPrices.slice(i, i + chunkSize);
      const { error } = await supabase
        .from("food_prices")
        .upsert(chunk, { onConflict: "date,item" });

      if (error) {
        console.error(`Chunk ${i} error:`, error.message);
        throw error;
      }
      inserted += chunk.length;
    }

    return new Response(
      JSON.stringify({
        success: true,
        recordsInserted: inserted,
        dateRange: {
          start: startDate.toISOString().split("T")[0],
          end: endDate.toISOString().split("T")[0],
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Backfill error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
