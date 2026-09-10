import { sanitizeBasket, type BasketLine } from "@/lib/basket";
import { ITEM_BY_ID, isItemId, clampQty } from "@/lib/catalogue";

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

export interface SharedSelection {
  basket: BasketLine[];
  baselineMonth: string | null;
  comparisonMonth: string | null;
}

export function encodeSelection(
  basket: BasketLine[],
  baselineMonth: string,
  comparisonMonth: string,
): string {
  const params = new URLSearchParams();
  params.set(
    "b",
    basket.map((l) => `${l.id}:${l.qty}`).join(","),
  );
  params.set("from", baselineMonth);
  params.set("to", comparisonMonth);
  return params.toString();
}

/** Parses a shared link defensively — any malformed part is simply dropped. */
export function decodeSelection(search: string): SharedSelection {
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(search);
  } catch {
    return { basket: [], baselineMonth: null, comparisonMonth: null };
  }

  const raw = params.get("b") ?? "";
  const parsed = raw
    .split(",")
    .map((chunk) => {
      const [id, qtyRaw] = chunk.split(":");
      if (!isItemId(id)) return null;
      const qty = clampQty(Number(qtyRaw), ITEM_BY_ID[id].step);
      if (qty <= 0) return null;
      return { id, qty };
    })
    .filter(Boolean);

  const from = params.get("from");
  const to = params.get("to");

  return {
    basket: sanitizeBasket(parsed),
    baselineMonth: from && MONTH_RE.test(from) ? from : null,
    comparisonMonth: to && MONTH_RE.test(to) ? to : null,
  };
}

const STORAGE_KEY = "rm100.basket.v1";

export function loadStoredBasket(): BasketLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return sanitizeBasket(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function storeBasket(basket: BasketLine[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(basket));
  } catch {
    /* storage may be unavailable or full — the game still works without it */
  }
}
