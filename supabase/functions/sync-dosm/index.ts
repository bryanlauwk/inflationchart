import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Item code mapping ─────────────────────────────────────────────
const ITEM_MAP: Record<string, { codes: number[]; divisor: number }> = {
  // Staples
  chicken:    { codes: [1],    divisor: 1 },
  eggs:       { codes: [118],  divisor: 1 },
  rice:       { codes: [904, 992, 1445, 1581, 1582], divisor: 10 },
  milk:       { codes: [224, 225, 1852],  divisor: 1 },
  sugar:      { codes: [1589, 1590], divisor: 1 },
  cookingoil: { codes: [918, 1091, 1092, 1093], divisor: 1 },
  // Vegetables
  tomato:     { codes: [114],  divisor: 1 },
  longbeans:  { codes: [98],   divisor: 1 },
  kangkung:   { codes: [1559], divisor: 1 },
  onion:      { codes: [129, 1440, 1441],  divisor: 1 },
  chili:      { codes: [92, 93, 94], divisor: 1 },
  cabbage:    { codes: [104, 105, 1396, 1458], divisor: 1 },
  spinach:    { codes: [1556, 1557], divisor: 1 },
  // Fruits
  papaya:     { codes: [16], divisor: 1 },
  banana:     { codes: [18], divisor: 1 },
  watermelon: { codes: [20, 21], divisor: 1 },
  lime:       { codes: [1132], divisor: 1 },
};

// Per-item price ceiling (RM) — rejects outlier data points
const MAX_PRICE: Record<string, number> = {
  chicken: 25, eggs: 15, tomato: 20, longbeans: 20,
  rice: 10, milk: 20, kangkung: 15, onion: 15,
  sugar: 10, cookingoil: 15, chili: 30, cabbage: 15,
  spinach: 15, papaya: 15, banana: 20, watermelon: 10, lime: 20,
};

// Core basket items — only these contribute to "basket" total.
// These have consistent daily survey coverage, unlike newer items.
const BASKET_ITEMS = new Set([
  "chicken", "eggs", "rice", "milk", "sugar",
  "cookingoil", "tomato", "longbeans", "kangkung", "onion",
]);
const MIN_BASKET_ITEMS = 7; // require ≥7 of 10 core items; normalize to full 10

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
  let rejected = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || line.length < 5) continue;

    const parts = line.split(",");
    const itemCode = parseInt(parts[itemCodeIdx], 10);
    if (!ALL_CODES.has(itemCode)) continue;

    const date = parts[dateIdx]?.trim();
    const price = parseFloat(parts[priceIdx]);
    if (!date || isNaN(price) || price <= 0) continue;

    const mapping = CODE_TO_ITEM.get(itemCode)!;
    const normalizedPrice = price / mapping.divisor;

    // Per-item price ceiling validation
    const ceiling = MAX_PRICE[mapping.item] ?? 500;
    if (normalizedPrice > ceiling) {
      rejected++;
      continue;
    }

    matched++;
    const key = `${date}|${mapping.item}`;

    if (!acc[key]) acc[key] = { sum: 0, count: 0 };
    acc[key].sum += normalizedPrice;
    acc[key].count += 1;
  }

  console.log(`${month}: matched ${matched} records, rejected ${rejected} outliers`);

  const results: Array<{ date: string; item: string; price_rm: number }> = [];

  // Track basket-eligible items per date
  const basketByDate: Record<string, { total: number; count: number }> = {};

  for (const [key, { sum, count }] of Object.entries(acc)) {
    const [date, item] = key.split("|");
    const avgPrice = Math.round((sum / count) * 100) / 100;
    results.push({ date, item, price_rm: avgPrice });

    // Only core basket items contribute to the basket total
    if (BASKET_ITEMS.has(item)) {
      if (!basketByDate[date]) basketByDate[date] = { total: 0, count: 0 };
      basketByDate[date].total += avgPrice;
      basketByDate[date].count += 1;
    }
  }

  // Emit normalized basket: scale to represent all 10 core items
  const BASKET_SIZE = BASKET_ITEMS.size; // 10
  for (const [date, { total, count }] of Object.entries(basketByDate)) {
    if (count >= MIN_BASKET_ITEMS) {
      // Normalize: if 8 of 10 items present with sum=46, basket = (46/8)*10 = 57.50
      const normalized = Math.round((total / count) * BASKET_SIZE * 100) / 100;
      results.push({ date, item: "basket", price_rm: normalized });
    } else {
      console.log(`Skipping basket for ${date}: only ${count}/${MIN_BASKET_ITEMS} core items`);
    }
  }

  return results;
}

// ── CPI Sync (filtered: only "overall" division, from 2024) ──────

async function syncCPI(
  supabase: ReturnType<typeof createClient>
): Promise<number> {
  console.log("Fetching CPI with server-side filtering...");

  // Deduplicate by date — API may return multiple records per date
  const byDate: Record<string, number> = {};

  // Use server-side filtering to request only "overall" division from 2024+
  for (let offset = 0; offset < 5000; offset += 500) {
    const url = `https://api.data.gov.my/opendosm?id=cpi_core&limit=500&offset=${offset}&filter=division@overall&date_start=2024-01-01`;
    console.log(`CPI fetch: offset=${offset}`);
    const resp = await fetch(url);
    if (!resp.ok) {
      console.error(`CPI fetch failed: ${resp.status}`);
      break;
    }

    const data = await resp.json();
    if (!Array.isArray(data) || data.length === 0) break;

    for (const row of data) {
      if (row.index != null && row.date) {
        byDate[row.date] = row.index; // last-write-wins dedup
      }
    }

    if (data.length < 500) break;
  }

  // Fallback: if server-side filter didn't work, try unfiltered with tighter loop
  if (Object.keys(byDate).length === 0) {
    console.log("Fallback: fetching CPI without server-side filter...");
    for (let offset = 0; offset < 3000; offset += 500) {
      const url = `https://api.data.gov.my/opendosm?id=cpi_core&limit=500&offset=${offset}`;
      const resp = await fetch(url);
      if (!resp.ok) break;

      const data = await resp.json();
      if (!Array.isArray(data) || data.length === 0) break;

      for (const row of data) {
        if (row.division === "overall" && row.index != null && row.date >= "2024-01-01") {
          byDate[row.date] = row.index;
        }
      }

      if (data.length < 500) break;
    }
  }

  // Convert to records array (deduplicated)
  const records = Object.entries(byDate).map(([date, value]) => ({
    date,
    type: "CPI",
    value,
  }));

  console.log(`CPI: ${records.length} unique date records`);

  if (records.length === 0) return 0;

  // Upsert in small chunks
  for (let i = 0; i < records.length; i += 100) {
    const chunk = records.slice(i, i + 100);
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
