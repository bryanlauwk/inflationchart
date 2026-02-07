import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Item code mapping ─────────────────────────────────────────────
const ITEM_MAP: Record<string, { codes: number[]; divisor: number }> = {
  chicken:    { codes: [1],    divisor: 1 },
  eggs:       { codes: [118],  divisor: 1 },
  tomato:     { codes: [114],  divisor: 1 },
  longbeans:  { codes: [98],   divisor: 1 },
  rice:       { codes: [904, 992, 1445, 1581, 1582], divisor: 10 },
  milk:       { codes: [224, 225, 1852],  divisor: 1 },
  kangkung:   { codes: [1559], divisor: 1 },
  onion:      { codes: [129, 1440, 1441],  divisor: 1 },
  sugar:      { codes: [1589, 1590], divisor: 1 },
  cookingoil: { codes: [918, 1091, 1092, 1093], divisor: 1 },
};

const CODE_TO_ITEM: Map<number, { item: string; divisor: number }> = new Map();
for (const [item, { codes, divisor }] of Object.entries(ITEM_MAP)) {
  for (const code of codes) {
    CODE_TO_ITEM.set(code, { item, divisor });
  }
}
const ALL_CODES = new Set(CODE_TO_ITEM.keys());

// ── CSV Processing ────────────────────────────────────────────────

async function processMonthCSV(month: string): Promise<
  Array<{ date: string; item: string; price_rm: number }>
> {
  const url = `https://storage.data.gov.my/pricecatcher/pricecatcher_${month}.csv`;
  console.log(`Fetching: ${url}`);

  const resp = await fetch(url);
  if (!resp.ok) {
    console.warn(`CSV not available for ${month}: ${resp.status}`);
    return [];
  }

  const text = await resp.text();
  const lines = text.split("\n");

  const header = lines[0]?.split(",").map((h) => h.trim().toLowerCase());
  if (!header) return [];

  const dateIdx = header.indexOf("date");
  const itemCodeIdx = header.indexOf("item_code");
  const priceIdx = header.indexOf("price");

  if (dateIdx === -1 || itemCodeIdx === -1 || priceIdx === -1) {
    console.error(`Bad header for ${month}:`, header.join(","));
    return [];
  }

  // Accumulate: key = "date|item" → { sum, count }
  const acc: Record<string, { sum: number; count: number }> = {};
  let matched = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || line.length < 5) continue;

    const parts = line.split(",");
    const itemCode = parseInt(parts[itemCodeIdx], 10);
    if (!ALL_CODES.has(itemCode)) continue;

    const date = parts[dateIdx]?.trim();
    const price = parseFloat(parts[priceIdx]);
    if (!date || isNaN(price) || price <= 0 || price > 500) continue;

    matched++;
    const mapping = CODE_TO_ITEM.get(itemCode)!;
    const normalizedPrice = price / mapping.divisor;
    const key = `${date}|${mapping.item}`;

    if (!acc[key]) acc[key] = { sum: 0, count: 0 };
    acc[key].sum += normalizedPrice;
    acc[key].count += 1;
  }

  console.log(`${month}: matched ${matched} records`);

  const results: Array<{ date: string; item: string; price_rm: number }> = [];
  const basketByDate: Record<string, number> = {};

  for (const [key, { sum, count }] of Object.entries(acc)) {
    const [date, item] = key.split("|");
    const avgPrice = Math.round((sum / count) * 100) / 100;
    results.push({ date, item, price_rm: avgPrice });
    basketByDate[date] = (basketByDate[date] || 0) + avgPrice;
  }

  for (const [date, total] of Object.entries(basketByDate)) {
    results.push({ date, item: "basket", price_rm: Math.round(total * 100) / 100 });
  }

  return results;
}

// ── CPI Sync (efficient: only "overall" division, from 2024) ─────

async function syncCPI(
  supabase: ReturnType<typeof createClient>
): Promise<number> {
  console.log("Fetching CPI...");

  const records: Array<{ date: string; type: string; value: number }> = [];

  // Use large page size to minimize round-trips
  for (let offset = 0; offset < 10000; offset += 1000) {
    const url = `https://api.data.gov.my/opendosm?id=cpi_core&limit=1000&offset=${offset}`;
    const resp = await fetch(url);
    if (!resp.ok) { console.error(`CPI fetch failed: ${resp.status}`); break; }

    const data = await resp.json();
    if (!Array.isArray(data) || data.length === 0) break;

    for (const row of data) {
      if (row.division === "overall" && row.index != null && row.date >= "2024-01-01") {
        records.push({ date: row.date, type: "CPI", value: row.index });
      }
    }

    if (data.length < 1000) break;
  }

  console.log(`CPI: ${records.length} overall records`);

  if (records.length === 0) return 0;

  // Upsert
  for (let i = 0; i < records.length; i += 200) {
    const chunk = records.slice(i, i + 200);
    const { error } = await supabase
      .from("indicators")
      .upsert(chunk, { onConflict: "type,date" });
    if (error) throw error;
  }

  return records.length;
}

// ── Main ──────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let body: Record<string, unknown> = {};
    try { body = await req.json(); } catch { /* no body */ }

    const action = (body.action as string) || "sync";
    const results: Record<string, unknown> = {};

    // ── CPI ──
    if (action === "cpi") {
      results.cpi = await syncCPI(supabase);
    }

    // ── Sync prices for specific months ──
    if (action === "sync") {
      const months = (body.months as string[]) || [body.month as string].filter(Boolean);
      if (months.length === 0) {
        const d = new Date();
        months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
      }

      let total = 0;
      const monthResults: Record<string, number> = {};

      for (const month of months) {
        const prices = await processMonthCSV(month);
        if (prices.length > 0) {
          for (let i = 0; i < prices.length; i += 500) {
            const chunk = prices.slice(i, i + 500);
            const { error } = await supabase
              .from("food_prices")
              .upsert(chunk, { onConflict: "date,item" });
            if (error) throw error;
          }
        }
        total += prices.length;
        monthResults[month] = prices.length;
      }

      results.prices = { total, months: monthResults };
    }

    // ── Clear ──
    if (action === "clear") {
      await supabase.from("food_prices").delete().gte("date", "2000-01-01");
      await supabase.from("indicators").delete().gte("date", "2000-01-01");
      results.cleared = true;
    }

    return new Response(
      JSON.stringify({ success: true, ...results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("sync-dosm error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
