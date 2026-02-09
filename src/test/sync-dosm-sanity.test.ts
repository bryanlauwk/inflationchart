import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests for the sync-dosm pipeline's sanity check flow.
 *
 * The edge function runs in Deno so we can't import it directly from vitest.
 * Instead we extract and test the core algorithms (internal checks, quarantine
 * logic) and verify that a simulated sync call populates sanity_check_results.
 */

// ── Plausible ranges (mirrored from sync-dosm/index.ts) ─────────────
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

// ── Port of runInternalChecks from sync-dosm/index.ts ────────────────

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

// ── Port of quarantine logic ─────────────────────────────────────────

function runQuarantine(
  allPrices: Array<{ date: string; item: string; price_rm: number }>,
  flags: InternalFlag[],
) {
  const individualPrices = allPrices.filter((p) => p.item !== "basket");
  const basketPrices = allPrices.filter((p) => p.item === "basket");

  const errorItems = new Set(
    flags
      .filter((f) => f.severity === "error" && f.item !== "_dataset")
      .map((f) => f.item)
  );

  const quarantinedItems: Array<{ date: string; item: string; price_rm: number; reason: string }> = [];
  const cleanPrices: Array<{ date: string; item: string; price_rm: number }> = [];

  for (const p of individualPrices) {
    if (errorItems.has(p.item)) {
      const reasons = flags
        .filter((f) => f.item === p.item && f.severity === "error")
        .map((f) => f.message)
        .join("; ");
      quarantinedItems.push({ ...p, reason: reasons });
    } else {
      cleanPrices.push(p);
    }
  }

  cleanPrices.push(...basketPrices);
  return { cleanPrices, quarantinedItems };
}

// ── Build sanity_check_results row (mimics what sync-dosm inserts) ───

function buildSanityCheckRow(
  latestPrices: Array<{ item: string; price_rm: number; date: string }>,
  flags: InternalFlag[],
  quarantinedItems: Array<{ date: string; item: string; price_rm: number; reason: string }>,
  latestDate: string,
) {
  const errorCount = flags.filter((f) => f.severity === "error").length;
  const warnCount = flags.filter((f) => f.severity === "warn").length;
  return {
    data_date: latestDate,
    item_count: latestPrices.length,
    internal_flags: flags,
    internal_error_count: errorCount,
    internal_warn_count: warnCount,
    quarantined_items: quarantinedItems,
    ai_audit: null as string | null,
    citations: [] as string[],
    cpi_value: null as number | null,
    cpi_date: null as string | null,
    passed: errorCount === 0,
  };
}

// ══════════════════════════════════════════════════════════════════════
// ── Tests ────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════

describe("sync-dosm sanity pipeline", () => {
  const TODAY = new Date().toISOString().split("T")[0];

  // Representative set of "normal" prices within plausible ranges
  const normalPrices: Array<{ item: string; price_rm: number; date: string }> = [
    { item: "chicken", price_rm: 10.5, date: TODAY },
    { item: "eggs", price_rm: 0.45, date: TODAY },
    { item: "rice", price_rm: 3.2, date: TODAY },
    { item: "milk", price_rm: 7.5, date: TODAY },
    { item: "sugar", price_rm: 2.85, date: TODAY },
    { item: "cookingoil", price_rm: 7.0, date: TODAY },
    { item: "flour", price_rm: 2.5, date: TODAY },
    { item: "bread", price_rm: 3.2, date: TODAY },
    { item: "santan", price_rm: 8.0, date: TODAY },
    { item: "fish", price_rm: 14.0, date: TODAY },
    { item: "beef", price_rm: 38.0, date: TODAY },
    { item: "prawns", price_rm: 28.0, date: TODAY },
    { item: "tomato", price_rm: 6.0, date: TODAY },
    { item: "longbeans", price_rm: 5.5, date: TODAY },
    { item: "kangkung", price_rm: 4.0, date: TODAY },
    { item: "onion", price_rm: 3.5, date: TODAY },
    { item: "chili", price_rm: 12.0, date: TODAY },
    { item: "cabbage", price_rm: 3.0, date: TODAY },
    { item: "spinach", price_rm: 5.5, date: TODAY },
    { item: "garlic", price_rm: 10.0, date: TODAY },
    { item: "potato", price_rm: 5.0, date: TODAY },
    { item: "papaya", price_rm: 4.5, date: TODAY },
    { item: "banana", price_rm: 5.5, date: TODAY },
    { item: "watermelon", price_rm: 2.5, date: TODAY },
    { item: "lime", price_rm: 8.0, date: TODAY },
  ];

  describe("runInternalChecks", () => {
    it("passes all checks for normal prices with no history", () => {
      const flags = runInternalChecks(normalPrices, [], TODAY);
      // With today's date there should be no staleness; only missing_data warnings for coverage are NOT expected
      // because all 25 items are present.
      const errors = flags.filter((f) => f.severity === "error");
      const rangeFlags = flags.filter((f) => f.type === "out_of_range");
      const missingFlags = flags.filter((f) => f.type === "missing_data");

      expect(rangeFlags).toHaveLength(0);
      expect(missingFlags).toHaveLength(0);
      expect(errors).toHaveLength(0);
    });

    it("flags out-of-range error for chicken at RM2 (below min*0.8 = 5.6)", () => {
      const badPrices = [{ item: "chicken", price_rm: 2, date: TODAY }];
      const flags = runInternalChecks(badPrices, [], TODAY);
      const rangeErrors = flags.filter((f) => f.type === "out_of_range" && f.severity === "error");
      expect(rangeErrors.length).toBeGreaterThanOrEqual(1);
      expect(rangeErrors[0].item).toBe("chicken");
    });

    it("flags out-of-range warning for chicken at RM6.5 (below min=7 but above min*0.8=5.6)", () => {
      const borderPrices = [{ item: "chicken", price_rm: 6.5, date: TODAY }];
      const flags = runInternalChecks(borderPrices, [], TODAY);
      const rangeWarns = flags.filter((f) => f.type === "out_of_range" && f.severity === "warn");
      expect(rangeWarns.length).toBeGreaterThanOrEqual(1);
    });

    it("flags stale data when latest date is > 7 days old", () => {
      const oldDate = "2024-01-01";
      const flags = runInternalChecks(
        [{ item: "chicken", price_rm: 10, date: oldDate }],
        [],
        oldDate,
      );
      const staleFlags = flags.filter((f) => f.type === "stale_data");
      expect(staleFlags.length).toBeGreaterThanOrEqual(1);
    });

    it("flags large month-over-month change (>30%) as error", () => {
      const history = [
        { item: "chicken", price_rm: 10, date: "2025-11-01" },
        { item: "chicken", price_rm: 10, date: "2025-11-15" },
        { item: "chicken", price_rm: 10.2, date: "2025-12-01" },
        { item: "chicken", price_rm: 10.1, date: "2025-12-15" },
      ];
      const latest = [{ item: "chicken", price_rm: 15, date: TODAY }]; // ~47% jump
      const flags = runInternalChecks(latest, history, TODAY);
      const momFlags = flags.filter((f) => f.type === "large_mom_change" && f.severity === "error");
      expect(momFlags.length).toBeGreaterThanOrEqual(1);
    });

    it("flags missing items in coverage check", () => {
      const partial = [{ item: "chicken", price_rm: 10, date: TODAY }];
      const flags = runInternalChecks(partial, [], TODAY);
      const missingFlags = flags.filter((f) => f.type === "missing_data");
      // Should flag 24 missing items (25 total minus chicken)
      expect(missingFlags).toHaveLength(24);
    });
  });

  describe("quarantine logic", () => {
    it("separates error items from clean items", () => {
      const prices = [
        { date: TODAY, item: "chicken", price_rm: 2 },    // will be out-of-range error
        { date: TODAY, item: "eggs", price_rm: 0.45 },    // normal
        { date: TODAY, item: "rice", price_rm: 3.2 },     // normal
      ];
      const flags = runInternalChecks(
        prices.map((p) => ({ ...p })),
        [],
        TODAY,
      );
      const { cleanPrices, quarantinedItems } = runQuarantine(prices, flags);

      expect(quarantinedItems.length).toBeGreaterThanOrEqual(1);
      expect(quarantinedItems.some((q) => q.item === "chicken")).toBe(true);
      expect(cleanPrices.every((p) => p.item !== "chicken")).toBe(true);
      expect(cleanPrices.some((p) => p.item === "eggs")).toBe(true);
    });

    it("passes basket prices through regardless of flags", () => {
      const prices = [
        { date: TODAY, item: "basket", price_rm: 85.5 },
        { date: TODAY, item: "chicken", price_rm: 10, },
      ];
      const flags: InternalFlag[] = [];
      const { cleanPrices } = runQuarantine(prices, flags);
      expect(cleanPrices.some((p) => p.item === "basket")).toBe(true);
    });
  });

  describe("sanity_check_results row population", () => {
    it("builds a complete audit row for clean data (passed=true)", () => {
      const flags = runInternalChecks(normalPrices, [], TODAY);
      const { quarantinedItems } = runQuarantine(normalPrices, flags);

      const row = buildSanityCheckRow(normalPrices, flags, quarantinedItems, TODAY);

      expect(row.data_date).toBe(TODAY);
      expect(row.item_count).toBe(25);
      expect(row.internal_flags).toBeInstanceOf(Array);
      expect(row.internal_error_count).toBe(0);
      expect(row.quarantined_items).toEqual([]);
      expect(row.passed).toBe(true);
    });

    it("builds an audit row with errors when data has issues (passed=false)", () => {
      const badPrices = [
        { item: "chicken", price_rm: 2, date: TODAY },   // out of range
        { item: "eggs", price_rm: 0.45, date: TODAY },
      ];
      const flags = runInternalChecks(badPrices, [], TODAY);
      const { quarantinedItems } = runQuarantine(badPrices, flags);

      const row = buildSanityCheckRow(badPrices, flags, quarantinedItems, TODAY);

      expect(row.passed).toBe(false);
      expect(row.internal_error_count).toBeGreaterThan(0);
      expect(row.quarantined_items.length).toBeGreaterThan(0);
      // Verify the quarantined chicken is tracked
      expect(row.quarantined_items.some((q) => q.item === "chicken")).toBe(true);
    });

    it("includes all required fields matching sanity_check_results schema", () => {
      const flags = runInternalChecks(normalPrices, [], TODAY);
      const { quarantinedItems } = runQuarantine(normalPrices, flags);
      const row = buildSanityCheckRow(normalPrices, flags, quarantinedItems, TODAY);

      // Verify all columns from the sanity_check_results table are present
      expect(row).toHaveProperty("data_date");
      expect(row).toHaveProperty("item_count");
      expect(row).toHaveProperty("internal_flags");
      expect(row).toHaveProperty("internal_error_count");
      expect(row).toHaveProperty("internal_warn_count");
      expect(row).toHaveProperty("quarantined_items");
      expect(row).toHaveProperty("ai_audit");
      expect(row).toHaveProperty("citations");
      expect(row).toHaveProperty("cpi_value");
      expect(row).toHaveProperty("cpi_date");
      expect(row).toHaveProperty("passed");
    });

    it("correctly counts warnings separate from errors", () => {
      const borderPrices = [
        { item: "chicken", price_rm: 6.5, date: TODAY }, // warn (near boundary)
        { item: "eggs", price_rm: 0.45, date: TODAY },
      ];
      const flags = runInternalChecks(borderPrices, [], TODAY);
      const { quarantinedItems } = runQuarantine(borderPrices, flags);
      const row = buildSanityCheckRow(borderPrices, flags, quarantinedItems, TODAY);

      expect(row.internal_warn_count).toBeGreaterThan(0);
      // Warnings don't cause quarantine
      expect(row.quarantined_items).toHaveLength(0);
      // Warnings alone still pass
      expect(row.passed).toBe(true);
    });
  });

  describe("end-to-end pipeline simulation", () => {
    it("processes all 25 items through checks, quarantine, and audit row generation", () => {
      // Simulate the full pipeline: process → check → quarantine → build audit
      const allPrices = [...normalPrices];

      // Inject one bad item
      const badIdx = allPrices.findIndex((p) => p.item === "beef");
      allPrices[badIdx] = { item: "beef", price_rm: 100, date: TODAY }; // way above max*1.2 = 66

      const latestPrices = allPrices.filter((p) => p.date === TODAY);
      const flags = runInternalChecks(latestPrices, [], TODAY);
      const { cleanPrices, quarantinedItems } = runQuarantine(allPrices, flags);
      const auditRow = buildSanityCheckRow(latestPrices, flags, quarantinedItems, TODAY);

      // Beef should be quarantined
      expect(quarantinedItems.some((q) => q.item === "beef")).toBe(true);
      // Clean prices should have 24 items (25 - 1 quarantined)
      expect(cleanPrices).toHaveLength(24);
      // Audit row reflects the error
      expect(auditRow.passed).toBe(false);
      expect(auditRow.internal_error_count).toBeGreaterThanOrEqual(1);
      expect(auditRow.item_count).toBe(25);
    });
  });
});
