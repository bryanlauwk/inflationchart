/**
 * Pure basket maths. No data fetching, no formatting side effects — everything
 * here is unit tested in src/test/basket.test.ts.
 */

import { ITEM_BY_ID, clampQty, isItemId, type ItemId } from "@/lib/catalogue";

export interface BasketLine {
  id: ItemId;
  qty: number;
}

/** Average observed price for one item in one month. */
export interface MonthPrice {
  avgPrice: number;
  observedDays: number;
  firstObserved: string;
  lastObserved: string;
}

/** month -> item -> price */
export type PriceIndex = Record<string, Partial<Record<ItemId, MonthPrice>>>;

export interface LineResult {
  id: ItemId;
  qty: number;
  unit: string;
  baselinePrice: number | null;
  comparisonPrice: number | null;
  baselineCost: number | null;
  comparisonCost: number | null;
  /** Contribution to the basket's RM change: qty * (comparison - baseline). */
  contribution: number | null;
  percentChange: number | null;
  /** True only when both months have an observed price for this item. */
  covered: boolean;
}

export interface BasketResult {
  baselineMonth: string;
  comparisonMonth: string;
  lines: LineResult[];
  coveredLines: LineResult[];
  uncoveredLines: LineResult[];
  baselineTotal: number;
  comparisonTotal: number;
  /** comparisonTotal - baselineTotal, over covered lines only. */
  difference: number;
  percentChange: number | null;
  /**
   * What the same mix would cost in the comparison month if it cost exactly
   * RM100 in the baseline month. Normalised example, not a claim about the
   * chosen quantities.
   */
  rm100Equivalent: number | null;
  /**
   * Share of the same mix affordable in the comparison month on the baseline
   * budget, expressed 0-1. Proportional scaling, not physical part-items.
   */
  affordableShare: number | null;
  /** True when nothing could be priced in both months. */
  empty: boolean;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Normalises arbitrary input into a valid, de-duplicated, bounded basket. */
export function sanitizeBasket(input: unknown): BasketLine[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<ItemId>();
  const out: BasketLine[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const id = (raw as { id?: unknown }).id;
    const qty = Number((raw as { qty?: unknown }).qty);
    if (!isItemId(id) || seen.has(id)) continue;
    const step = ITEM_BY_ID[id].step;
    const clamped = clampQty(qty, step);
    if (clamped <= 0) continue;
    seen.add(id);
    out.push({ id, qty: clamped });
  }
  return out;
}

export function computeBasket(
  basket: BasketLine[],
  prices: PriceIndex,
  baselineMonth: string,
  comparisonMonth: string,
): BasketResult {
  const baseMonthPrices = prices[baselineMonth] ?? {};
  const compMonthPrices = prices[comparisonMonth] ?? {};

  const lines: LineResult[] = basket.map(({ id, qty }) => {
    const item = ITEM_BY_ID[id];
    const b = baseMonthPrices[id]?.avgPrice ?? null;
    const c = compMonthPrices[id]?.avgPrice ?? null;
    const covered = b != null && c != null && b > 0 && c > 0;

    return {
      id,
      qty,
      unit: item.unit,
      baselinePrice: b,
      comparisonPrice: c,
      baselineCost: covered ? round2(b! * qty) : null,
      comparisonCost: covered ? round2(c! * qty) : null,
      contribution: covered ? round2((c! - b!) * qty) : null,
      percentChange: covered ? round2(((c! - b!) / b!) * 100) : null,
      covered,
    };
  });

  const coveredLines = lines.filter((l) => l.covered);
  const uncoveredLines = lines.filter((l) => !l.covered);

  const baselineTotal = round2(
    coveredLines.reduce((sum, l) => sum + (l.baselineCost ?? 0), 0),
  );
  const comparisonTotal = round2(
    coveredLines.reduce((sum, l) => sum + (l.comparisonCost ?? 0), 0),
  );
  const difference = round2(comparisonTotal - baselineTotal);

  const usable = coveredLines.length > 0 && baselineTotal > 0 && comparisonTotal > 0;

  return {
    baselineMonth,
    comparisonMonth,
    lines,
    coveredLines,
    uncoveredLines,
    baselineTotal,
    comparisonTotal,
    difference,
    percentChange: usable ? round2((difference / baselineTotal) * 100) : null,
    rm100Equivalent: usable ? round2(100 * (comparisonTotal / baselineTotal)) : null,
    affordableShare: usable ? baselineTotal / comparisonTotal : null,
    empty: coveredLines.length === 0,
  };
}

/** Biggest movers by their RM contribution to this basket, increases first. */
export function rankContributions(result: BasketResult): LineResult[] {
  return [...result.coveredLines].sort(
    (a, b) => Math.abs(b.contribution ?? 0) - Math.abs(a.contribution ?? 0),
  );
}

export interface QuizPair {
  a: ItemId;
  b: ItemId;
  changeA: number;
  changeB: number;
  /** null on a genuine tie. */
  winner: ItemId | null;
  tie: boolean;
}

/** Items priced in BOTH months — the only ones a fair comparison can use. */
export function eligibleQuizItems(
  prices: PriceIndex,
  baselineMonth: string,
  comparisonMonth: string,
): ItemId[] {
  const base = prices[baselineMonth] ?? {};
  const comp = prices[comparisonMonth] ?? {};
  return (Object.keys(base) as ItemId[]).filter((id) => {
    const b = base[id]?.avgPrice;
    const c = comp[id]?.avgPrice;
    return b != null && c != null && b > 0 && c > 0;
  });
}

export function percentChangeFor(
  prices: PriceIndex,
  id: ItemId,
  baselineMonth: string,
  comparisonMonth: string,
): number | null {
  const b = prices[baselineMonth]?.[id]?.avgPrice;
  const c = prices[comparisonMonth]?.[id]?.avgPrice;
  if (b == null || c == null || b <= 0) return null;
  return round2(((c - b) / b) * 100);
}

export function buildQuizPair(
  prices: PriceIndex,
  baselineMonth: string,
  comparisonMonth: string,
  pick: (pool: ItemId[]) => [ItemId, ItemId] | null,
): QuizPair | null {
  const pool = eligibleQuizItems(prices, baselineMonth, comparisonMonth);
  if (pool.length < 2) return null;
  const chosen = pick(pool);
  if (!chosen) return null;
  const [a, b] = chosen;
  const changeA = percentChangeFor(prices, a, baselineMonth, comparisonMonth);
  const changeB = percentChangeFor(prices, b, baselineMonth, comparisonMonth);
  if (changeA == null || changeB == null) return null;
  const tie = Math.abs(changeA - changeB) < 0.05;
  return {
    a,
    b,
    changeA,
    changeB,
    tie,
    winner: tie ? null : changeA > changeB ? a : b,
  };
}

export function randomQuizPair(
  prices: PriceIndex,
  baselineMonth: string,
  comparisonMonth: string,
): QuizPair | null {
  return buildQuizPair(prices, baselineMonth, comparisonMonth, (pool) => {
    const first = Math.floor(Math.random() * pool.length);
    let second = Math.floor(Math.random() * (pool.length - 1));
    if (second >= first) second += 1;
    return [pool[first], pool[second]];
  });
}

/** Rebases a series so the baseline month equals 100. */
export function rebaseSeries(
  points: Array<{ month: string; value: number }>,
  baselineMonth: string,
): Array<{ month: string; value: number | null }> {
  const base = points.find((p) => p.month === baselineMonth)?.value;
  if (!base || base <= 0) return points.map((p) => ({ month: p.month, value: null }));
  return points.map((p) => ({
    month: p.month,
    value: p.value > 0 ? round2((p.value / base) * 100) : null,
  }));
}

export function formatRM(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `RM${value.toFixed(2)}`;
}

export function formatMonth(month: string, lang: "en" | "zh"): string {
  const [y, m] = month.split("-").map(Number);
  if (!y || !m) return month;
  const d = new Date(Date.UTC(y, m - 1, 1));
  return d.toLocaleDateString(lang === "zh" ? "zh-Hant" : "en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatQty(qty: number): string {
  return Number.isInteger(qty) ? String(qty) : qty.toFixed(1);
}
