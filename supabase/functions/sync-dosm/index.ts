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
  rice:       { codes: [904, 992, 1445, 1581, 1582], divisor: 10 },
  milk:       { codes: [224, 225, 1852],  divisor: 1 },
  sugar:      { codes: [1589, 1590], divisor: 1 },
  cookingoil: { codes: [1091], divisor: 1 },
  flour:      { codes: [917, 1593], divisor: 1 },
  bread:      { codes: [272, 1494, 1586], divisor: 1 },
  santan:     { codes: [103], divisor: 1 },
  fish:       { codes: [55, 1476], divisor: 1 },
  beef:       { codes: [1370, 1371, 1372, 1373], divisor: 1 },
  prawns:     { codes: [849, 1391, 1555], divisor: 1 },
  tomato:     { codes: [114],  divisor: 1 },
  longbeans:  { codes: [98],   divisor: 1 },
  kangkung:   { codes: [1559], divisor: 1 },
  onion:      { codes: [129, 1440, 1441],  divisor: 1 },
  chili:      { codes: [92, 93, 94], divisor: 1 },
  cabbage:    { codes: [104, 105, 1396, 1458], divisor: 1 },
  spinach:    { codes: [1556, 1557], divisor: 1 },
  garlic:     { codes: [1564], divisor: 1 },
  potato:     { codes: [160, 861, 1131], divisor: 1 },
  papaya:     { codes: [16], divisor: 1 },
  banana:     { codes: [18], divisor: 1 },
  watermelon: { codes: [20, 21], divisor: 1 },
  lime:       { codes: [1132], divisor: 1 },
};

// Per-item price ceiling (RM) — rejects outlier data points
const MAX_PRICE: Record<string, number> = {
  chicken: 15, eggs: 5, tomato: 20, longbeans: 20,
  rice: 10, milk: 20, kangkung: 15, onion: 8,
  sugar: 10, cookingoil: 15, chili: 30, cabbage: 15,
  spinach: 15, papaya: 15, banana: 20, watermelon: 10, lime: 20,
  fish: 30, beef: 60, flour: 8, bread: 8,
  prawns: 50, santan: 20, garlic: 25, potato: 15,
};

// Per-item price floor (RM) — rejects subsidized/misclassified entries
const MIN_PRICE: Record<string, number> = {
  cookingoil: 5.0, fish: 5.0, beef: 20.0,
  prawns: 10.0, garlic: 3.0, potato: 2.0,
};

// ── Basket configuration ──────────────────────────────────────────
const BASKET_ITEMS = new Set([
  "chicken", "eggs", "rice", "sugar", "cookingoil",
  "flour", "fish", "garlic",
  "tomato", "longbeans", "kangkung", "onion",
]);

const BASKET_WEIGHTS: Record<string, number> = {
  chicken: 2.0, rice: 1.5, fish: 1.2, eggs: 1.2,
  cookingoil: 1.0, onion: 0.8, sugar: 0.7, flour: 0.6,
  garlic: 0.5, tomato: 0.5, kangkung: 0.4, longbeans: 0.3,
};

const ROLLING_WINDOW_DAYS = 14;

const CODE_TO_ITEM: Map<number, { item: string; divisor: number }> = new Map();
for (const [item, { codes, divisor }] of Object.entries(ITEM_MAP)) {
  for (const code of codes) {
    CODE_TO_ITEM.set(code, { item, divisor });
  }
}
const ALL_CODES = new Set(CODE_TO_ITEM.keys());

// ══════════════════════════════════════════════════════════════════
// ── SANITY CHECK: Plausible ranges & statistical checks ──────────
// ══════════════════════════════════════════════════════════════════

const PLAUSIBLE_RANGES: Record<string, { min: number; max: number; unit: string }> = {
  chicken:    { min: 7,  max: 14, unit: "kg" },
  eggs:       { min: 0.3, max: 0.6, unit: "egg (grade A)" },
  rice:       { min: 2,  max: 5,  unit: "kg" },
  milk:       { min: 4,  max: 12, unit: "L" },
  sugar:      { min: 2,  max: 4,  unit: "kg" },
  cookingoil: { min: 5,  max: 10, unit: "kg" },
  flour:      { min: 1.5, max: 5, unit: "kg" },
  bread:      { min: 2,  max: 6,  unit: "400g loaf" },
  santan:     { min: 4,  max: 12, unit: "kg" },
  fish:       { min: 8,  max: 25, unit: "kg (kembung)" },
  beef:       { min: 28, max: 55, unit: "kg (import)" },
  prawns:     { min: 15, max: 45, unit: "kg" },
  tomato:     { min: 3,  max: 12, unit: "kg" },
  longbeans:  { min: 3,  max: 10, unit: "kg" },
  kangkung:   { min: 2,  max: 8,  unit: "kg" },
  onion:      { min: 2,  max: 7,  unit: "kg" },
  chili:      { min: 5,  max: 25, unit: "kg" },
  cabbage:    { min: 1.5, max: 6, unit: "kg" },
  spinach:    { min: 3,  max: 10, unit: "kg" },
  garlic:     { min: 6,  max: 18, unit: "kg" },
  potato:     { min: 3,  max: 8,  unit: "kg" },
  papaya:     { min: 2,  max: 8,  unit: "kg" },
  banana:     { min: 3,  max: 10, unit: "kg" },
  watermelon: { min: 1,  max: 5,  unit: "kg" },
  lime:       { min: 4,  max: 15, unit: "kg" },
};

interface InternalFlag {
  item: string;
  type: "out_of_range" | "stale_data" | "large_mom_change" | "missing_data" | "trend_break";
  severity: "info" | "warn" | "error";
  message: string;
}

function runInternalChecks(
  latestPrices: Array<{ item: string; price_rm: number; date: string }>,
  historicalPrices: Array<{ item: string; price_rm: number; date: string }>,
  latestDate: string,
): InternalFlag[] {
  const flags: InternalFlag[] = [];

  // 1. Range check
  for (const p of latestPrices) {
    const range = PLAUSIBLE_RANGES[p.item];
    if (!range) continue;
    if (p.price_rm < range.min * 0.8 || p.price_rm > range.max * 1.2) {
      flags.push({
        item: p.item, type: "out_of_range", severity: "error",
        message: `RM${p.price_rm} is outside plausible range (RM${range.min}–RM${range.max}/${range.unit})`,
      });
    } else if (p.price_rm < range.min || p.price_rm > range.max) {
      flags.push({
        item: p.item, type: "out_of_range", severity: "warn",
        message: `RM${p.price_rm} is near boundary of expected range (RM${range.min}–RM${range.max}/${range.unit})`,
      });
    }
  }

  // 2. Data staleness
  const daysSinceLatest = Math.floor(
    (Date.now() - new Date(latestDate + "T12:00:00Z").getTime()) / 86400000
  );
  if (daysSinceLatest > 7) {
    flags.push({
      item: "_dataset", type: "stale_data",
      severity: daysSinceLatest > 30 ? "error" : "warn",
      message: `Latest data is ${daysSinceLatest} days old (${latestDate}). Expect daily updates.`,
    });
  }

  // 3. Month-over-month volatility
  const monthlyAvg: Record<string, Record<string, { sum: number; count: number }>> = {};
  for (const row of historicalPrices) {
    const month = row.date.slice(0, 7);
    if (!monthlyAvg[row.item]) monthlyAvg[row.item] = {};
    if (!monthlyAvg[row.item][month]) monthlyAvg[row.item][month] = { sum: 0, count: 0 };
    monthlyAvg[row.item][month].sum += row.price_rm;
    monthlyAvg[row.item][month].count += 1;
  }

  for (const p of latestPrices) {
    const months = Object.keys(monthlyAvg[p.item] || {}).sort();
    if (months.length < 2) continue;
    const prevMonth = months[months.length - 1];
    const prevAvg = monthlyAvg[p.item][prevMonth];
    if (!prevAvg) continue;
    const prevAvgPrice = prevAvg.sum / prevAvg.count;
    const changePct = ((p.price_rm - prevAvgPrice) / prevAvgPrice) * 100;

    if (Math.abs(changePct) > 30) {
      flags.push({
        item: p.item, type: "large_mom_change", severity: "error",
        message: `${changePct > 0 ? "+" : ""}${changePct.toFixed(1)}% vs last month avg (RM${prevAvgPrice.toFixed(2)} → RM${p.price_rm})`,
      });
    } else if (Math.abs(changePct) > 15) {
      flags.push({
        item: p.item, type: "large_mom_change", severity: "warn",
        message: `${changePct > 0 ? "+" : ""}${changePct.toFixed(1)}% vs last month avg (RM${prevAvgPrice.toFixed(2)} → RM${p.price_rm})`,
      });
    }
  }

  // 4. Coverage check
  const expectedItems = Object.keys(PLAUSIBLE_RANGES);
  const presentItems = new Set(latestPrices.map((p) => p.item));
  for (const item of expectedItems) {
    if (!presentItems.has(item)) {
      flags.push({ item, type: "missing_data", severity: "warn", message: `No price data on ${latestDate}` });
    }
  }

  // 5. Trend break — 3-month rolling average vs latest
  for (const p of latestPrices) {
    const months = Object.keys(monthlyAvg[p.item] || {}).sort();
    if (months.length < 3) continue;
    const last3 = months.slice(-3);
    let rollingSum = 0, rollingCount = 0;
    for (const m of last3) {
      const entry = monthlyAvg[p.item][m];
      rollingSum += entry.sum / entry.count;
      rollingCount++;
    }
    const rollingAvg = rollingSum / rollingCount;
    const deviation = ((p.price_rm - rollingAvg) / rollingAvg) * 100;
    if (Math.abs(deviation) > 25) {
      flags.push({
        item: p.item, type: "trend_break", severity: "warn",
        message: `${deviation > 0 ? "+" : ""}${deviation.toFixed(1)}% deviation from 3-month rolling average (RM${rollingAvg.toFixed(2)})`,
      });
    }
  }

  return flags;
}

function formatInternalReport(flags: InternalFlag[]): string {
  if (flags.length === 0) return "All internal checks passed — no anomalies detected.";
  const errors = flags.filter((f) => f.severity === "error");
  const warns = flags.filter((f) => f.severity === "warn");
  const infos = flags.filter((f) => f.severity === "info");
  let report = `**Internal Checks: ${errors.length} errors, ${warns.length} warnings, ${infos.length} info**\n\n`;
  if (errors.length > 0) {
    report += "🔴 **Errors:**\n";
    for (const f of errors) report += `- **${f.item}** (${f.type}): ${f.message}\n`;
    report += "\n";
  }
  if (warns.length > 0) {
    report += "🟡 **Warnings:**\n";
    for (const f of warns) report += `- **${f.item}** (${f.type}): ${f.message}\n`;
    report += "\n";
  }
  if (infos.length > 0) {
    report += "🔵 **Info:**\n";
    for (const f of infos) report += `- **${f.item}** (${f.type}): ${f.message}\n`;
    report += "\n";
  }
  return report;
}

// ══════════════════════════════════════════════════════════════════
// ── PERPLEXITY LAYER 2: AI cross-validation ──────────────────────
// ══════════════════════════════════════════════════════════════════

async function runPerplexityAudit(
  latestPrices: Array<{ item: string; price_rm: number; date: string }>,
  latestDate: string,
  internalReport: string,
  cpiValue: number | null,
  cpiDate: string | null,
  basketHistory: Array<{ price_rm: number; date: string }>,
): Promise<{ aiAudit: string; citations: string[] }> {
  const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
  if (!PERPLEXITY_API_KEY) {
    console.warn("PERPLEXITY_API_KEY not set — skipping Layer 2 audit");
    return { aiAudit: "Layer 2 unavailable: PERPLEXITY_API_KEY not configured", citations: [] };
  }

  const pricesSummary = latestPrices
    .map((p) => {
      const range = PLAUSIBLE_RANGES[p.item];
      return `${p.item}: RM${p.price_rm}${range ? `/${range.unit}` : "/kg"}`;
    })
    .join("\n");

  const priceMap: Record<string, number> = {};
  for (const p of latestPrices) priceMap[p.item] = p.price_rm;

  const ratios: string[] = [];
  if (priceMap.beef && priceMap.chicken) ratios.push(`Beef-to-chicken ratio: ${(priceMap.beef / priceMap.chicken).toFixed(1)}x`);
  if (priceMap.prawns && priceMap.fish) ratios.push(`Prawns-to-fish ratio: ${(priceMap.prawns / priceMap.fish).toFixed(1)}x`);
  if (priceMap.garlic && priceMap.onion) ratios.push(`Garlic-to-onion ratio: ${(priceMap.garlic / priceMap.onion).toFixed(1)}x`);

  const basketTrend = basketHistory.length >= 2
    ? `Basket index trend (last ${basketHistory.length} days): RM${basketHistory[basketHistory.length - 1]?.price_rm} → RM${basketHistory[0]?.price_rm}`
    : "";

  const systemPrompt = `You are a Malaysian food market analyst and data quality auditor. Your job is to assess whether these food prices look reasonable for the Malaysian market.

You do NOT have access to DOSM's raw database. Instead, validate using these indirect methods:

1. **General market knowledge**: Are these prices broadly consistent with what Malaysian consumers typically pay at wet markets and supermarkets in 2024-2026?
2. **Relative pricing logic**: Do the price ratios between items make sense? (e.g., beef should be 3-5x chicken, imported garlic > local onion, prawns > fish)
3. **Economic context**: Search for any recent Malaysian food price news — subsidy changes, supply disruptions, seasonal effects (monsoon, festive periods like Hari Raya/CNY) that could explain unusual prices.
4. **Regional benchmarks**: Compare against food prices in neighboring ASEAN countries (adjusted for RM exchange rate) as a sanity check.
5. **Government price controls**: Flag items under Malaysian government price controls (e.g., chicken ceiling price, cooking oil subsidies) and check if reported prices respect those controls.

Format your response as:

## Overall Assessment
One paragraph: Is this data broadly trustworthy?

## Flagged Items
Items where the price seems suspicious or noteworthy (table format if possible):
| Item | Reported Price | Expected Range | Concern |

## Price Control Compliance
Items under Malaysian government price ceilings/subsidies and whether our data respects them.

## Economic Context
Any recent events (past 3 months) affecting Malaysian food prices.

## Relative Pricing Check
Are the item-to-item ratios reasonable?

Be concise. Use markdown. If everything looks fine, say so clearly.`;

  const userMessage = `Audit these Malaysian food prices (as of ${latestDate}):

${pricesSummary}

**Price ratios:**
${ratios.join("\n")}

**CPI**: ${cpiValue ?? "N/A"} (${cpiDate ?? "N/A"})
${basketTrend}

**Our internal checks already found:**
${internalReport}

Please provide your independent assessment using web search for current Malaysian market data, news, and government price control policies.`;

  try {
    const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.1,
        max_tokens: 2500,
      }),
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error("Perplexity API error:", perplexityResponse.status, errorText);
      return { aiAudit: `Layer 2 unavailable: Perplexity API error [${perplexityResponse.status}]`, citations: [] };
    }

    const perplexityData = await perplexityResponse.json();
    const aiAudit = perplexityData.choices?.[0]?.message?.content ?? "No response from AI";
    const citations = perplexityData.citations ?? [];
    console.log(`Perplexity audit complete. Citations: ${citations.length}`);
    return { aiAudit, citations };
  } catch (err) {
    console.error("Perplexity call failed:", err);
    return { aiAudit: `Layer 2 unavailable: ${err instanceof Error ? err.message : String(err)}`, citations: [] };
  }
}

// ══════════════════════════════════════════════════════════════════
// ── PIPELINE: Run sanity checks + store audit ────────────────────
// ══════════════════════════════════════════════════════════════════

async function runSanityPipeline(
  allPrices: Array<{ date: string; item: string; price_rm: number }>,
  supabase: ReturnType<typeof createClient>,
): Promise<{
  cleanPrices: Array<{ date: string; item: string; price_rm: number }>;
  quarantinedItems: Array<{ date: string; item: string; price_rm: number; reason: string }>;
  auditSummary: { errorCount: number; warnCount: number; passed: boolean };
}> {
  // Separate basket from individual items
  const individualPrices = allPrices.filter((p) => p.item !== "basket");
  const basketPrices = allPrices.filter((p) => p.item === "basket");

  if (individualPrices.length === 0) {
    return { cleanPrices: allPrices, quarantinedItems: [], auditSummary: { errorCount: 0, warnCount: 0, passed: true } };
  }

  // Find latest date for these prices
  const latestDate = individualPrices.reduce((max, p) => p.date > max ? p.date : max, individualPrices[0].date);

  // Get latest-date prices for sanity check
  const latestPrices = individualPrices.filter((p) => p.date === latestDate);

  // Fetch 3 months of historical data from DB for trend analysis
  const threeMonthsAgo = new Date(latestDate + "T12:00:00Z");
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const historyStart = threeMonthsAgo.toISOString().split("T")[0];

  const [historicalRes, latestCpiRes, basketRes] = await Promise.all([
    supabase
      .from("food_prices")
      .select("item, price_rm, date")
      .gte("date", historyStart)
      .lt("date", latestDate)
      .neq("item", "basket"),
    supabase
      .from("indicators")
      .select("value, date")
      .eq("type", "CPI")
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("food_prices")
      .select("price_rm, date")
      .eq("item", "basket")
      .order("date", { ascending: false })
      .limit(30),
  ]);

  const historicalPrices = historicalRes.data || [];
  const latestCpi = latestCpiRes.data;
  const basketHistory = basketRes.data || [];

  // ── Layer 1: Internal statistical checks ──
  const internalFlags = runInternalChecks(latestPrices, historicalPrices, latestDate);
  const internalReport = formatInternalReport(internalFlags);
  const errorCount = internalFlags.filter((f) => f.severity === "error").length;
  const warnCount = internalFlags.filter((f) => f.severity === "warn").length;

  console.log(`Sanity Layer 1: ${internalFlags.length} flags (${errorCount} errors, ${warnCount} warnings)`);

  // ── Quarantine: separate error items from clean items ──
  const errorItems = new Set(
    internalFlags
      .filter((f) => f.severity === "error" && f.item !== "_dataset")
      .map((f) => f.item)
  );

  const quarantinedItems: Array<{ date: string; item: string; price_rm: number; reason: string }> = [];
  const cleanPrices: Array<{ date: string; item: string; price_rm: number }> = [];

  for (const p of individualPrices) {
    if (errorItems.has(p.item)) {
      const reasons = internalFlags
        .filter((f) => f.item === p.item && f.severity === "error")
        .map((f) => f.message)
        .join("; ");
      quarantinedItems.push({ ...p, reason: reasons });
    } else {
      cleanPrices.push(p);
    }
  }

  // Basket prices always pass through (they're computed, not raw)
  cleanPrices.push(...basketPrices);

  console.log(`Sanity pipeline: ${cleanPrices.length} clean, ${quarantinedItems.length} quarantined`);

  // ── Store quarantined items ──
  if (quarantinedItems.length > 0) {
    const quarantineRows = quarantinedItems.map((q) => ({
      date: q.date,
      item: q.item,
      price_rm: q.price_rm,
      reason: q.reason,
    }));

    for (let i = 0; i < quarantineRows.length; i += 100) {
      const chunk = quarantineRows.slice(i, i + 100);
      const { error } = await supabase.from("quarantined_prices").insert(chunk);
      if (error) console.error("Failed to insert quarantined prices:", error);
    }
  }

  // ── Layer 2: Perplexity AI cross-validation (post-upsert, non-blocking) ──
  const { aiAudit, citations } = await runPerplexityAudit(
    latestPrices, latestDate, internalReport,
    latestCpi?.value ?? null, latestCpi?.date ?? null,
    basketHistory,
  );

  // ── Store audit trail ──
  const passed = errorCount === 0;
  const { error: auditError } = await supabase.from("sanity_check_results").insert({
    data_date: latestDate,
    item_count: latestPrices.length,
    internal_flags: internalFlags,
    internal_error_count: errorCount,
    internal_warn_count: warnCount,
    quarantined_items: quarantinedItems,
    ai_audit: aiAudit,
    citations: citations,
    cpi_value: latestCpi?.value ?? null,
    cpi_date: latestCpi?.date ?? null,
    passed,
  });

  if (auditError) console.error("Failed to store sanity check results:", auditError);
  else console.log(`Sanity audit stored: passed=${passed}`);

  return { cleanPrices, quarantinedItems, auditSummary: { errorCount, warnCount, passed } };
}

// ══════════════════════════════════════════════════════════════════
// ── Helpers ───────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════

function subtractDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().split("T")[0];
}

// ── CSV Processing ────────────────────────────────────────────────

async function processMonthCSV(
  month: string,
  supabase: ReturnType<typeof createClient>
): Promise<Array<{ date: string; item: string; price_rm: number }>> {
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

    const ceiling = MAX_PRICE[mapping.item] ?? 500;
    const floor = MIN_PRICE[mapping.item] ?? 0;
    if (normalizedPrice > ceiling || normalizedPrice < floor) {
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

  // ── Step 1: Compute individual item daily averages ──
  const rawResults: Array<{ date: string; item: string; price_rm: number }> = [];
  const itemPriceByDate: Record<string, Record<string, number>> = {};

  for (const [key, { sum, count }] of Object.entries(acc)) {
    const [date, item] = key.split("|");
    const avgPrice = Math.round((sum / count) * 100) / 100;
    rawResults.push({ date, item, price_rm: avgPrice });

    if (BASKET_ITEMS.has(item)) {
      if (!itemPriceByDate[date]) itemPriceByDate[date] = {};
      itemPriceByDate[date][item] = avgPrice;
    }
  }

  // ── Step 1b: Day-over-day spike detection ──
  const SPIKE_THRESHOLD = 0.60;
  const byItem: Record<string, Array<{ date: string; price: number; idx: number }>> = {};
  for (let i = 0; i < rawResults.length; i++) {
    const r = rawResults[i];
    if (!byItem[r.item]) byItem[r.item] = [];
    byItem[r.item].push({ date: r.date, price: r.price_rm, idx: i });
  }

  const spikeRejected = new Set<number>();
  for (const [item, entries] of Object.entries(byItem)) {
    entries.sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 1; i < entries.length; i++) {
      const prev = entries[i - 1].price;
      const curr = entries[i].price;
      if (prev > 0) {
        const changePct = Math.abs(curr - prev) / prev;
        if (changePct > SPIKE_THRESHOLD) {
          const next = entries[i + 1];
          if (next) {
            const revertPct = Math.abs(next.price - prev) / prev;
            if (revertPct < SPIKE_THRESHOLD) {
              console.log(`Spike detected: ${item} on ${entries[i].date} (${prev} → ${curr} → ${next.price})`);
              spikeRejected.add(entries[i].idx);
              if (BASKET_ITEMS.has(item)) {
                delete itemPriceByDate[entries[i].date]?.[item];
              }
            }
          }
        }
      }
    }
  }

  const results: Array<{ date: string; item: string; price_rm: number }> = [];
  for (let i = 0; i < rawResults.length; i++) {
    if (!spikeRejected.has(i)) results.push(rawResults[i]);
  }

  if (spikeRejected.size > 0) {
    console.log(`${month}: rejected ${spikeRejected.size} day-over-day spikes`);
  }

  // ── Step 2: Load previous month's basket item prices from DB ──
  const monthFirstDay = `${month}-01`;
  const lookbackStart = subtractDays(monthFirstDay, ROLLING_WINDOW_DAYS);

  const { data: prevMonthData } = await supabase
    .from("food_prices")
    .select("date, item, price_rm")
    .in("item", [...BASKET_ITEMS])
    .gte("date", lookbackStart)
    .lt("date", monthFirstDay)
    .order("date", { ascending: true });

  if (prevMonthData && prevMonthData.length > 0) {
    console.log(`${month}: loaded ${prevMonthData.length} previous-month basket item prices for rolling window`);
    for (const row of prevMonthData) {
      if (!itemPriceByDate[row.date]) itemPriceByDate[row.date] = {};
      itemPriceByDate[row.date][row.item] = row.price_rm;
    }
  }

  // ── Step 3: Compute weighted basket with rolling window ──
  const currentMonthDates = [...new Set(results.map((r) => r.date))].sort();
  const BASKET_ITEM_LIST = [...BASKET_ITEMS];

  let basketEmitted = 0;
  let basketSkipped = 0;

  for (const date of currentMonthDates) {
    const resolved: Record<string, number> = {};

    for (const bItem of BASKET_ITEM_LIST) {
      for (let d = 0; d < ROLLING_WINDOW_DAYS; d++) {
        const lookDate = d === 0 ? date : subtractDays(date, d);
        if (itemPriceByDate[lookDate]?.[bItem] != null) {
          resolved[bItem] = itemPriceByDate[lookDate][bItem];
          break;
        }
      }
    }

    if (Object.keys(resolved).length === BASKET_ITEMS.size) {
      let weightedSum = 0;
      for (const [item, price] of Object.entries(resolved)) {
        weightedSum += price * (BASKET_WEIGHTS[item] ?? 1);
      }
      results.push({
        date,
        item: "basket",
        price_rm: Math.round(weightedSum * 100) / 100,
      });
      basketEmitted++;
    } else {
      const missing = BASKET_ITEM_LIST.filter((i) => !resolved[i]);
      basketSkipped++;
      if (basketSkipped <= 3) {
        console.log(`Skipping basket for ${date}: missing [${missing.join(", ")}] in ${ROLLING_WINDOW_DAYS}-day window`);
      }
    }
  }

  console.log(
    `${month} basket: ${basketEmitted} emitted, ${basketSkipped} skipped (require all ${BASKET_ITEMS.size} items in ${ROLLING_WINDOW_DAYS}-day window)`
  );

  return results;
}

// ── CPI Sync ─────────────────────────────────────────────────────

async function syncCPI(
  supabase: ReturnType<typeof createClient>
): Promise<number> {
  console.log("Fetching CPI with server-side filtering...");

  const byDate: Record<string, number> = {};

  for (let offset = 0; offset < 5000; offset += 500) {
    const url = `https://api.data.gov.my/opendosm?id=cpi_core&limit=500&offset=${offset}&filter=division@overall&date_start=2022-01-01`;
    console.log(`CPI fetch: offset=${offset}`);
    const resp = await fetch(url);
    if (!resp.ok) { console.error(`CPI fetch failed: ${resp.status}`); break; }

    const data = await resp.json();
    if (!Array.isArray(data) || data.length === 0) break;

    for (const row of data) {
      if (row.index != null && row.date) byDate[row.date] = row.index;
    }
    if (data.length < 500) break;
  }

  // Fallback
  if (Object.keys(byDate).length === 0) {
    console.log("Fallback: fetching CPI without server-side filter...");
    for (let offset = 0; offset < 3000; offset += 500) {
      const url = `https://api.data.gov.my/opendosm?id=cpi_core&limit=500&offset=${offset}`;
      const resp = await fetch(url);
      if (!resp.ok) break;
      const data = await resp.json();
      if (!Array.isArray(data) || data.length === 0) break;
      for (const row of data) {
        if (row.division === "overall" && row.index != null && row.date >= "2022-01-01") {
          byDate[row.date] = row.index;
        }
      }
      if (data.length < 500) break;
    }
  }

  const records = Object.entries(byDate).map(([date, value]) => ({ date, type: "CPI", value }));
  console.log(`CPI: ${records.length} unique date records`);

  if (records.length === 0) return 0;

  for (let i = 0; i < records.length; i += 100) {
    const chunk = records.slice(i, i + 100);
    const { error } = await supabase.from("indicators").upsert(chunk, { onConflict: "type,date" });
    if (error) throw error;
  }

  return records.length;
}

// ══════════════════════════════════════════════════════════════════
// ── UPSERT WITH SANITY PIPELINE ──────────────────────────────────
// ══════════════════════════════════════════════════════════════════

async function upsertWithSanityCheck(
  prices: Array<{ date: string; item: string; price_rm: number }>,
  supabase: ReturnType<typeof createClient>,
): Promise<{
  upserted: number;
  quarantined: number;
  auditSummary: { errorCount: number; warnCount: number; passed: boolean };
}> {
  if (prices.length === 0) {
    return { upserted: 0, quarantined: 0, auditSummary: { errorCount: 0, warnCount: 0, passed: true } };
  }

  // Run the sanity pipeline — quarantine errors, pass warnings
  const { cleanPrices, quarantinedItems, auditSummary } = await runSanityPipeline(prices, supabase);

  // Upsert ONLY clean prices
  if (cleanPrices.length > 0) {
    for (let i = 0; i < cleanPrices.length; i += 500) {
      const chunk = cleanPrices.slice(i, i + 500);
      const { error } = await supabase
        .from("food_prices")
        .upsert(chunk, { onConflict: "date,item" });
      if (error) throw error;
    }
  }

  console.log(`Upsert complete: ${cleanPrices.length} clean, ${quarantinedItems.length} quarantined`);

  return { upserted: cleanPrices.length, quarantined: quarantinedItems.length, auditSummary };
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

    // ── Full sync: prices (current + previous month) + CPI ──
    if (action === "full") {
      const d = new Date();
      const curMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const pm = new Date(d.getFullYear(), d.getMonth() - 1, 1);
      const prevMonth = `${pm.getFullYear()}-${String(pm.getMonth() + 1).padStart(2, "0")}`;

      const months = [prevMonth, curMonth];
      let totalUpserted = 0;
      let totalQuarantined = 0;
      const monthResults: Record<string, unknown> = {};
      let lastAudit: { errorCount: number; warnCount: number; passed: boolean } | null = null;

      for (const month of months) {
        const prices = await processMonthCSV(month, supabase);
        const { upserted, quarantined, auditSummary } = await upsertWithSanityCheck(prices, supabase);
        totalUpserted += upserted;
        totalQuarantined += quarantined;
        monthResults[month] = { upserted, quarantined };
        lastAudit = auditSummary;
      }

      results.prices = { totalUpserted, totalQuarantined, months: monthResults };
      results.sanityCheck = lastAudit;
      results.cpi = await syncCPI(supabase);
    }

    // ── Sync prices for specific months ──
    if (action === "sync") {
      const months = (body.months as string[]) || [body.month as string].filter(Boolean);
      if (months.length === 0) {
        const d = new Date();
        months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
      }

      months.sort();

      let totalUpserted = 0;
      let totalQuarantined = 0;
      const monthResults: Record<string, unknown> = {};
      let lastAudit: { errorCount: number; warnCount: number; passed: boolean } | null = null;

      for (const month of months) {
        const prices = await processMonthCSV(month, supabase);
        const { upserted, quarantined, auditSummary } = await upsertWithSanityCheck(prices, supabase);
        totalUpserted += upserted;
        totalQuarantined += quarantined;
        monthResults[month] = { upserted, quarantined };
        lastAudit = auditSummary;
      }

      results.prices = { totalUpserted, totalQuarantined, months: monthResults };
      results.sanityCheck = lastAudit;
    }

    // ── Clear ──
    if (action === "clear") {
      await supabase.from("food_prices").delete().gte("date", "2000-01-01");
      await supabase.from("indicators").delete().gte("date", "2000-01-01");
      await supabase.from("quarantined_prices").delete().gte("date", "2000-01-01");
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
