import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Item mapping: DB name -> keywords to look for in scraped content
const ITEMS: Record<string, string[]> = {
  chicken: ["ayam", "chicken", "ayam bersih", "ayam standard"],
  eggs: ["telur", "egg", "telur ayam", "telur gred"],
  tomato: ["tomato", "tomatoes"],
  longbeans: ["kacang panjang", "long bean"],
  rice: ["beras", "rice", "beras tempatan"],
  milk: ["susu", "milk", "susu segar"],
  kangkung: ["kangkung", "kangkong", "water spinach"],
  onion: ["bawang besar", "bawang", "onion"],
  sugar: ["gula pasir", "gula", "sugar"],
  cookingoil: ["minyak masak", "minyak sawit", "cooking oil", "palm oil"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = new Date().toISOString().split("T")[0];
    let results: Array<{ date: string; item: string; price_rm: number }> = [];

    // Try Firecrawl scraping first
    if (firecrawlKey) {
      try {
        console.log("Attempting to scrape KPDN PriceCatcher...");
        const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${firecrawlKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: "https://pricecatcher.kpdn.gov.my/",
            formats: ["markdown"],
            onlyMainContent: true,
            waitFor: 3000,
          }),
        });

        const scrapeData = await scrapeResponse.json();
        const markdown = scrapeData?.data?.markdown || scrapeData?.markdown || "";

        if (markdown) {
          console.log("Scrape successful, parsing prices...");
          for (const [item, keywords] of Object.entries(ITEMS)) {
            for (const keyword of keywords) {
              const regex = new RegExp(
                `${keyword}[\\s\\S]{0,100}?(?:RM|rm)\\s*(\\d+\\.\\d{2})`,
                "i"
              );
              const match = markdown.match(regex);
              if (match) {
                const price = parseFloat(match[1]);
                if (price > 0 && price < 100) {
                  results.push({ date: today, item, price_rm: price });
                  break;
                }
              }
            }
          }
        }

        if (results.length > 0) {
          console.log(`Extracted ${results.length} prices from scrape`);
        } else {
          console.log("No prices extracted from scrape, falling back...");
        }
      } catch (scrapeErr) {
        console.error("Scrape failed:", scrapeErr);
      }
    }

    // NOTE: Synthetic fallback data generation has been removed.
    // Previously this generated random ±2% variance prices from last known values,
    // which contaminated the database with fabricated data indistinguishable from
    // real observations. If scraping fails, we now simply skip — real data will be
    // backfilled by the sync-dosm function when the monthly CSV becomes available.
    if (results.length < Object.keys(ITEMS).length) {
      console.log(`Only scraped ${results.length}/${Object.keys(ITEMS).length} items. Skipping synthetic fallback to preserve data integrity.`);
    }

    // Calculate weighted basket (must match sync-dosm weights)
    const BASKET_WEIGHTS: Record<string, number> = {
      chicken: 2.0, rice: 1.5, eggs: 1.2, cookingoil: 1.0,
      onion: 0.8, sugar: 0.7, milk: 0.6,
      kangkung: 0.5, tomato: 0.5, longbeans: 0.4,
    };

    let weightedSum = 0;
    let hasBasketItems = false;
    for (const r of results) {
      const weight = BASKET_WEIGHTS[r.item] ?? 0;
      if (weight > 0) {
        weightedSum += r.price_rm * weight;
        hasBasketItems = true;
      }
    }
    if (hasBasketItems) {
      results.push({
        date: today,
        item: "basket",
        price_rm: Math.round(weightedSum * 100) / 100,
      });
    }

    // Upsert into database
    if (results.length > 0) {
      const { error } = await supabase
        .from("food_prices")
        .upsert(results, { onConflict: "date,item" });

      if (error) throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        itemsScraped: results.length,
        method: results.length > 0 ? "scrape+fallback" : "no_data",
        prices: results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Scraper error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
