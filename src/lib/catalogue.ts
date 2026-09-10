import type { CSSProperties } from "react";

/**
 * Grocery catalogue.
 *
 * Item ids match the `item` column in the price table. Units come from the
 * PriceCatcher item lookup used by the ingestion function. Where the published
 * packaging varies between premises the unit is marked as not confirmed, and the
 * UI shows it as approximate rather than pretending to know.
 */

export type ItemId =
  | "chicken" | "eggs" | "rice" | "milk" | "sugar"
  | "cookingoil" | "flour" | "bread" | "santan" | "fish"
  | "beef" | "prawns" | "tomato" | "longbeans" | "kangkung"
  | "onion" | "chili" | "cabbage" | "spinach" | "garlic"
  | "potato" | "papaya" | "banana" | "watermelon" | "lime";

export type CategoryId = "staples" | "protein" | "vegetables" | "fruits";

export interface CatalogueItem {
  id: ItemId;
  category: CategoryId;
  /** Short unit label, e.g. "kg", "egg", "loaf". */
  unit: string;
  /** False when published packaging varies and the unit is an approximation. */
  unitConfirmed: boolean;
  /** Sensible increment when adding/removing. */
  step: number;
  /** Starting quantity when the shopper taps "add". */
  defaultQty: number;
  /** Zero-based position in the 5x5 illustration atlas. */
  atlas: number;
}

/**
 * ORDER MATTERS: this array is the exact reading order of the 5x5 atlas
 * (public/images/grocery-atlas.webp), left to right, top to bottom.
 */
export const CATALOGUE: CatalogueItem[] = [
  // row 1
  { id: "chicken",    category: "protein",    unit: "kg",   unitConfirmed: true,  step: 0.5, defaultQty: 1,  atlas: 0 },
  { id: "eggs",       category: "staples",    unit: "egg",  unitConfirmed: true,  step: 10,  defaultQty: 10, atlas: 1 },
  { id: "rice",       category: "staples",    unit: "kg",   unitConfirmed: true,  step: 1,   defaultQty: 5,  atlas: 2 },
  { id: "milk",       category: "staples",    unit: "L",    unitConfirmed: false, step: 1,   defaultQty: 1,  atlas: 3 },
  { id: "sugar",      category: "staples",    unit: "kg",   unitConfirmed: true,  step: 0.5, defaultQty: 1,  atlas: 4 },
  // row 2
  { id: "cookingoil", category: "staples",    unit: "kg",   unitConfirmed: false, step: 1,   defaultQty: 1,  atlas: 5 },
  { id: "flour",      category: "staples",    unit: "kg",   unitConfirmed: true,  step: 0.5, defaultQty: 1,  atlas: 6 },
  { id: "bread",      category: "staples",    unit: "loaf", unitConfirmed: true,  step: 1,   defaultQty: 1,  atlas: 7 },
  { id: "santan",     category: "staples",    unit: "kg",   unitConfirmed: false, step: 0.5, defaultQty: 0.5, atlas: 8 },
  { id: "fish",       category: "protein",    unit: "kg",   unitConfirmed: true,  step: 0.5, defaultQty: 1,  atlas: 9 },
  // row 3
  { id: "beef",       category: "protein",    unit: "kg",   unitConfirmed: true,  step: 0.5, defaultQty: 0.5, atlas: 10 },
  { id: "prawns",     category: "protein",    unit: "kg",   unitConfirmed: true,  step: 0.5, defaultQty: 0.5, atlas: 11 },
  { id: "tomato",     category: "vegetables", unit: "kg",   unitConfirmed: true,  step: 0.5, defaultQty: 0.5, atlas: 12 },
  { id: "longbeans",  category: "vegetables", unit: "kg",   unitConfirmed: true,  step: 0.5, defaultQty: 0.5, atlas: 13 },
  { id: "kangkung",   category: "vegetables", unit: "kg",   unitConfirmed: true,  step: 0.5, defaultQty: 0.5, atlas: 14 },
  // row 4
  { id: "onion",      category: "vegetables", unit: "kg",   unitConfirmed: true,  step: 0.5, defaultQty: 0.5, atlas: 15 },
  { id: "chili",      category: "vegetables", unit: "kg",   unitConfirmed: true,  step: 0.5, defaultQty: 0.5, atlas: 16 },
  { id: "cabbage",    category: "vegetables", unit: "kg",   unitConfirmed: true,  step: 0.5, defaultQty: 1,  atlas: 17 },
  { id: "spinach",    category: "vegetables", unit: "kg",   unitConfirmed: true,  step: 0.5, defaultQty: 0.5, atlas: 18 },
  { id: "garlic",     category: "vegetables", unit: "kg",   unitConfirmed: true,  step: 0.5, defaultQty: 0.5, atlas: 19 },
  // row 5
  { id: "potato",     category: "vegetables", unit: "kg",   unitConfirmed: true,  step: 0.5, defaultQty: 1,  atlas: 20 },
  { id: "papaya",     category: "fruits",     unit: "kg",   unitConfirmed: true,  step: 0.5, defaultQty: 1,  atlas: 21 },
  { id: "banana",     category: "fruits",     unit: "kg",   unitConfirmed: true,  step: 0.5, defaultQty: 1,  atlas: 22 },
  { id: "watermelon", category: "fruits",     unit: "kg",   unitConfirmed: true,  step: 0.5, defaultQty: 2,  atlas: 23 },
  { id: "lime",       category: "fruits",     unit: "kg",   unitConfirmed: true,  step: 0.5, defaultQty: 0.5, atlas: 24 },
];

export const ATLAS_COLUMNS = 5;
export const ATLAS_ROWS = 5;

export const ITEM_BY_ID: Record<ItemId, CatalogueItem> = CATALOGUE.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<ItemId, CatalogueItem>,
);

export const ALL_ITEM_IDS: ItemId[] = CATALOGUE.map((i) => i.id);

export function isItemId(value: unknown): value is ItemId {
  return typeof value === "string" && value in ITEM_BY_ID;
}

/**
 * CSS background properties for one atlas cell. The atlas is a 5x5 grid of equal
 * cells, so the sheet is scaled to 500% and shifted by column/4 and row/4.
 */
export function atlasStyle(atlasIndex: number): CSSProperties {
  const col = atlasIndex % ATLAS_COLUMNS;
  const row = Math.floor(atlasIndex / ATLAS_COLUMNS);
  return {
    backgroundImage: "url(/images/grocery-atlas.webp)",
    backgroundSize: `${ATLAS_COLUMNS * 100}% ${ATLAS_ROWS * 100}%`,
    backgroundPosition: `${(col / (ATLAS_COLUMNS - 1)) * 100}% ${(row / (ATLAS_ROWS - 1)) * 100}%`,
    backgroundRepeat: "no-repeat",
  };
}

export const CATEGORY_ORDER: CategoryId[] = ["staples", "protein", "vegetables", "fruits"];

export interface BasketPreset {
  id: string;
  items: Array<{ id: ItemId; qty: number }>;
}

/**
 * Illustrative mixes to make starting easy. These are NOT representative
 * household baskets and carry no official weighting.
 */
export const PRESETS: BasketPreset[] = [
  {
    id: "everyday",
    items: [
      { id: "rice", qty: 5 },
      { id: "chicken", qty: 1.5 },
      { id: "eggs", qty: 20 },
      { id: "cookingoil", qty: 1 },
      { id: "sugar", qty: 1 },
      { id: "onion", qty: 0.5 },
      { id: "tomato", qty: 0.5 },
      { id: "kangkung", qty: 0.5 },
      { id: "flour", qty: 1 },
    ],
  },
  {
    id: "freshmarket",
    items: [
      { id: "kangkung", qty: 0.5 },
      { id: "spinach", qty: 0.5 },
      { id: "longbeans", qty: 0.5 },
      { id: "tomato", qty: 1 },
      { id: "chili", qty: 0.5 },
      { id: "cabbage", qty: 1 },
      { id: "garlic", qty: 0.5 },
      { id: "potato", qty: 1 },
      { id: "banana", qty: 1 },
      { id: "papaya", qty: 1 },
    ],
  },
  {
    id: "breakfast",
    items: [
      { id: "eggs", qty: 10 },
      { id: "bread", qty: 2 },
      { id: "milk", qty: 1 },
      { id: "sugar", qty: 0.5 },
      { id: "santan", qty: 0.5 },
      { id: "flour", qty: 1 },
      { id: "banana", qty: 1 },
    ],
  },
];

export const MAX_QTY = 99;

/** Clamps a quantity to a safe, finite, sensibly rounded value. */
export function clampQty(value: number, step: number): number {
  if (!Number.isFinite(value)) return 0;
  const rounded = Math.round(value / step) * step;
  const bounded = Math.min(MAX_QTY, Math.max(0, rounded));
  return Math.round(bounded * 100) / 100;
}
