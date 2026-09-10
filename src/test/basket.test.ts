import { describe, expect, it } from "vitest";
import {
  computeBasket,
  buildQuizPair,
  eligibleQuizItems,
  rankContributions,
  rebaseSeries,
  sanitizeBasket,
  type PriceIndex,
} from "@/lib/basket";
import { decodeSelection, encodeSelection } from "@/lib/share";
import { clampQty } from "@/lib/catalogue";

const price = (avgPrice: number) => ({
  avgPrice,
  observedDays: 20,
  firstObserved: "2022-01-01",
  lastObserved: "2022-01-31",
});

const prices: PriceIndex = {
  "2022-01": { rice: price(3), chicken: price(8), eggs: price(0.4), bread: price(3) },
  "2026-01": { rice: price(3.6), chicken: price(10), eggs: price(0.5) },
};

describe("sanitizeBasket", () => {
  it("drops unknown items, bad quantities and duplicates", () => {
    const out = sanitizeBasket([
      { id: "rice", qty: 2 },
      { id: "rice", qty: 5 },
      { id: "not-a-food", qty: 3 },
      { id: "chicken", qty: -4 },
      { id: "eggs", qty: Number.NaN },
      "nonsense",
    ]);
    expect(out).toEqual([{ id: "rice", qty: 2 }]);
  });

  it("bounds absurd quantities", () => {
    expect(clampQty(10_000, 1)).toBe(99);
    expect(clampQty(Number.POSITIVE_INFINITY, 1)).toBe(0);
  });
});

describe("computeBasket", () => {
  const basket = [
    { id: "rice" as const, qty: 5 },
    { id: "chicken" as const, qty: 1 },
  ];

  it("sums quantities against monthly averages", () => {
    const r = computeBasket(basket, prices, "2022-01", "2026-01");
    expect(r.baselineTotal).toBe(23); // 5*3 + 1*8
    expect(r.comparisonTotal).toBe(28); // 5*3.6 + 1*10
    expect(r.difference).toBe(5);
  });

  it("scales the RM100 example from the ratio of totals", () => {
    const r = computeBasket(basket, prices, "2022-01", "2026-01");
    expect(r.rm100Equivalent).toBeCloseTo(121.74, 2);
    expect(r.affordableShare).toBeCloseTo(23 / 28, 5);
  });

  it("excludes items missing in either month instead of guessing", () => {
    const r = computeBasket([...basket, { id: "bread" as const, qty: 2 }], prices, "2022-01", "2026-01");
    expect(r.uncoveredLines.map((l) => l.id)).toEqual(["bread"]);
    expect(r.baselineTotal).toBe(23);
  });

  it("never produces NaN for an empty basket", () => {
    const r = computeBasket([], prices, "2022-01", "2026-01");
    expect(r.empty).toBe(true);
    expect(r.baselineTotal).toBe(0);
    expect(r.rm100Equivalent).toBeNull();
    expect(r.percentChange).toBeNull();
  });

  it("ranks contributions by RM impact on this basket", () => {
    const r = computeBasket(basket, prices, "2022-01", "2026-01");
    const ranked = rankContributions(r);
    expect(ranked[0].id).toBe("rice"); // 5 * 0.6 = 3.00 vs chicken 2.00
    expect(ranked[0].contribution).toBeCloseTo(3, 2);
  });
});

describe("quiz", () => {
  it("only offers items priced in both months", () => {
    expect(eligibleQuizItems(prices, "2022-01", "2026-01").sort()).toEqual([
      "chicken",
      "eggs",
      "rice",
    ]);
  });

  it("picks the bigger percentage mover", () => {
    const pair = buildQuizPair(prices, "2022-01", "2026-01", () => ["chicken", "eggs"]);
    expect(pair?.winner).toBe("eggs"); // +25% vs +25%? eggs 0.4->0.5 = 25%, chicken 8->10 = 25%
    expect(pair?.tie).toBe(true);
  });

  it("reports a clear winner when the changes differ", () => {
    const pair = buildQuizPair(prices, "2022-01", "2026-01", () => ["rice", "eggs"]);
    expect(pair?.tie).toBe(false);
    expect(pair?.winner).toBe("eggs"); // +25% vs rice +20%
  });

  it("returns null when data is unavailable", () => {
    expect(buildQuizPair({}, "2022-01", "2026-01", () => ["rice", "eggs"])).toBeNull();
  });
});

describe("rebaseSeries", () => {
  it("sets the baseline month to 100 and keeps gaps as gaps", () => {
    const out = rebaseSeries(
      [
        { month: "2022-01", value: 4 },
        { month: "2022-02", value: 5 },
        { month: "2022-03", value: 0 },
      ],
      "2022-01",
    );
    expect(out[0].value).toBe(100);
    expect(out[1].value).toBe(125);
    expect(out[2].value).toBeNull();
  });
});

describe("shared links", () => {
  it("round-trips a valid selection", () => {
    const query = encodeSelection([{ id: "rice", qty: 5 }], "2022-01", "2026-01");
    const decoded = decodeSelection(query);
    expect(decoded.basket).toEqual([{ id: "rice", qty: 5 }]);
    expect(decoded.baselineMonth).toBe("2022-01");
    expect(decoded.comparisonMonth).toBe("2026-01");
  });

  it("rejects malformed months and items", () => {
    const decoded = decodeSelection("b=rice:5,dragonfruit:2&from=hello&to=2026-13");
    expect(decoded.basket).toEqual([{ id: "rice", qty: 5 }]);
    expect(decoded.baselineMonth).toBeNull();
    expect(decoded.comparisonMonth).toBeNull();
  });

  it("survives complete nonsense", () => {
    const decoded = decodeSelection("");
    expect(decoded.basket).toEqual([]);
  });
});
