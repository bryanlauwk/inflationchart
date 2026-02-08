import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Known plausible price ranges for Malaysian food (RM/kg) ──────
// Based on typical retail prices across Malaysian wet markets & supermarkets.
// Used for fast internal checks before calling Perplexity.
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

// ── Statistical helpers ──────────────────────────────────────────

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

  // 1. Range check against plausible bounds
  for (const p of latestPrices) {
    const range = PLAUSIBLE_RANGES[p.item];
    if (!range) continue;
    if (p.price_rm < range.min * 0.8 || p.price_rm > range.max * 1.2) {
      flags.push({
        item: p.item,
        type: "out_of_range",
        severity: "error",
        message: `RM${p.price_rm} is outside plausible range (RM${range.min}–RM${range.max}/${range.unit})`,
      });
    } else if (p.price_rm < range.min || p.price_rm > range.max) {
      flags.push({
        item: p.item,
        type: "out_of_range",
        severity: "warn",
        message: `RM${p.price_rm} is near boundary of expected range (RM${range.min}–RM${range.max}/${range.unit})`,
      });
    }
  }

  // 2. Data staleness — check how old the latest data is
  const daysSinceLatest = Math.floor(
    (Date.now() - new Date(latestDate + "T12:00:00Z").getTime()) / 86400000
  );
  if (daysSinceLatest > 7) {
    flags.push({
      item: "_dataset",
      type: "stale_data",
      severity: daysSinceLatest > 30 ? "error" : "warn",
      message: `Latest data is ${daysSinceLatest} days old (${latestDate}). Expect daily updates.`,
    });
  }

  // 3. Month-over-month volatility check
  // Build per-item monthly averages from historical data
  const monthlyAvg: Record<string, Record<string, { sum: number; count: number }>> = {};
  for (const row of historicalPrices) {
    const month = row.date.slice(0, 7); // YYYY-MM
    if (!monthlyAvg[row.item]) monthlyAvg[row.item] = {};
    if (!monthlyAvg[row.item][month]) monthlyAvg[row.item][month] = { sum: 0, count: 0 };
    monthlyAvg[row.item][month].sum += row.price_rm;
    monthlyAvg[row.item][month].count += 1;
  }

  for (const p of latestPrices) {
    const months = Object.keys(monthlyAvg[p.item] || {}).sort();
    if (months.length < 2) continue;

    // Compare latest price to the most recent full month's average
    const prevMonth = months[months.length - 1];
    const prevAvg = monthlyAvg[p.item][prevMonth];
    if (!prevAvg) continue;

    const prevAvgPrice = prevAvg.sum / prevAvg.count;
    const changePct = ((p.price_rm - prevAvgPrice) / prevAvgPrice) * 100;

    if (Math.abs(changePct) > 30) {
      flags.push({
        item: p.item,
        type: "large_mom_change",
        severity: "error",
        message: `${changePct > 0 ? "+" : ""}${changePct.toFixed(1)}% vs last month avg (RM${prevAvgPrice.toFixed(2)} → RM${p.price_rm})`,
      });
    } else if (Math.abs(changePct) > 15) {
      flags.push({
        item: p.item,
        type: "large_mom_change",
        severity: "warn",
        message: `${changePct > 0 ? "+" : ""}${changePct.toFixed(1)}% vs last month avg (RM${prevAvgPrice.toFixed(2)} → RM${p.price_rm})`,
      });
    }
  }

  // 4. Coverage check — items we expect but are missing
  const expectedItems = Object.keys(PLAUSIBLE_RANGES);
  const presentItems = new Set(latestPrices.map((p) => p.item));
  for (const item of expectedItems) {
    if (!presentItems.has(item)) {
      flags.push({
        item,
        type: "missing_data",
        severity: "warn",
        message: `No price data on ${latestDate}`,
      });
    }
  }

  // 5. Trend break detection — 3-month rolling average vs latest
  for (const p of latestPrices) {
    const months = Object.keys(monthlyAvg[p.item] || {}).sort();
    if (months.length < 3) continue;

    const last3 = months.slice(-3);
    let rollingSum = 0;
    let rollingCount = 0;
    for (const m of last3) {
      const entry = monthlyAvg[p.item][m];
      rollingSum += entry.sum / entry.count;
      rollingCount++;
    }
    const rollingAvg = rollingSum / rollingCount;
    const deviation = ((p.price_rm - rollingAvg) / rollingAvg) * 100;

    if (Math.abs(deviation) > 25) {
      flags.push({
        item: p.item,
        type: "trend_break",
        severity: "warn",
        message: `${deviation > 0 ? "+" : ""}${deviation.toFixed(1)}% deviation from 3-month rolling average (RM${rollingAvg.toFixed(2)})`,
      });
    }
  }

  return flags;
}

// ── Format internal checks as readable text ──────────────────────

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

// ── Main ─────────────────────────────────────────────────────────

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

    // ── Fetch data ───────────────────────────────────────────────

    // Latest date
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

    // Fetch latest prices + 3 months of history (for trend analysis)
    const threeMonthsAgo = new Date(latestDate + "T12:00:00Z");
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const historyStart = threeMonthsAgo.toISOString().split("T")[0];

    const [latestPricesRes, historicalRes, latestCpiRes, basketRes] = await Promise.all([
      supabase
        .from("food_prices")
        .select("item, price_rm, date")
        .eq("date", latestDate)
        .neq("item", "basket")
        .order("item"),
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

    if (latestPricesRes.error) throw latestPricesRes.error;
    const latestPrices = latestPricesRes.data || [];
    const historicalPrices = historicalRes.data || [];
    const latestCpi = latestCpiRes.data;
    const basketHistory = basketRes.data || [];

    // ── Layer 1: Internal statistical checks ─────────────────────

    const internalFlags = runInternalChecks(latestPrices, historicalPrices, latestDate);
    const internalReport = formatInternalReport(internalFlags);

    console.log(`Internal checks: ${internalFlags.length} flags`);

    // ── Layer 2: Perplexity cross-validation ─────────────────────
    // Instead of asking for exact DOSM data, we ask Perplexity to:
    //   a) Validate prices against general Malaysian market knowledge
    //   b) Check for economic events that could explain anomalies
    //   c) Compare relative pricing ratios (e.g. chicken vs beef)

    const pricesSummary = latestPrices
      .map((p) => {
        const range = PLAUSIBLE_RANGES[p.item];
        return `${p.item}: RM${p.price_rm}${range ? `/${range.unit}` : "/kg"}`;
      })
      .join("\n");

    // Compute some relative ratios for cross-validation
    const priceMap: Record<string, number> = {};
    for (const p of latestPrices) priceMap[p.item] = p.price_rm;

    const ratios: string[] = [];
    if (priceMap.beef && priceMap.chicken) {
      ratios.push(`Beef-to-chicken ratio: ${(priceMap.beef / priceMap.chicken).toFixed(1)}x`);
    }
    if (priceMap.prawns && priceMap.fish) {
      ratios.push(`Prawns-to-fish ratio: ${(priceMap.prawns / priceMap.fish).toFixed(1)}x`);
    }
    if (priceMap.garlic && priceMap.onion) {
      ratios.push(`Garlic-to-onion ratio: ${(priceMap.garlic / priceMap.onion).toFixed(1)}x`);
    }

    // Basket trend summary
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

**CPI**: ${latestCpi?.value ?? "N/A"} (${latestCpi?.date ?? "N/A"})
${basketTrend}

**Our internal checks already found:**
${internalReport}

Please provide your independent assessment using web search for current Malaysian market data, news, and government price control policies.`;

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
            { role: "user", content: userMessage },
          ],
          temperature: 0.1,
          max_tokens: 2500,
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
    const aiAudit =
      perplexityData.choices?.[0]?.message?.content ?? "No response from AI";
    const citations = perplexityData.citations ?? [];

    console.log(`Perplexity audit complete. Citations: ${citations.length}`);

    // ── Combine results ──────────────────────────────────────────

    return new Response(
      JSON.stringify({
        success: true,
        internalChecks: {
          flags: internalFlags,
          summary: internalReport,
          errorCount: internalFlags.filter((f) => f.severity === "error").length,
          warnCount: internalFlags.filter((f) => f.severity === "warn").length,
        },
        aiAudit,
        citations,
        dataDate: latestDate,
        itemCount: latestPrices.length,
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
