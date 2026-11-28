// Filtering and sorting for the Radar board. Pure functions over the deal list —
// no DOM here, so the board's behaviour can be reasoned about without a browser.
// Weekend re-check edition adds a verdict (signal) filter beside category and store.

import { percentOff, savings, scoreOf } from "./score.js";

export function categoriesOf(deals) {
  return [...new Set(deals.map((d) => d.category))].sort();
}

export function storesOf(deals) {
  return [...new Set(deals.map((d) => d.store))].sort();
}

export function signalsOf(deals) {
  const order = ["new-low", "strong", "routine", "inflated"];
  return order.filter((s) => deals.some((d) => d.signal === s));
}

// state: { query, category, store, signal, minOff, minScore, sort }
export function applyFilters(deals, state) {
  const q = state.query.trim().toLowerCase();
  const shown = deals.filter((d) => {
    if (state.category !== "All" && d.category !== state.category) return false;
    if (state.store !== "All" && d.store !== state.store) return false;
    if (state.signal !== "All" && d.signal !== state.signal) return false;
    if (percentOff(d) < state.minOff) return false;
    if (scoreOf(d) < state.minScore) return false;
    if (q !== "" && !`${d.title} ${d.store} ${d.category} ${d.product}`.toLowerCase().includes(q)) return false;
    return true;
  });
  const by = {
    score: (a, b) => scoreOf(b) - scoreOf(a) || savings(b) - savings(a) || a.price - b.price,
    discount: (a, b) => percentOff(b) - percentOff(a) || scoreOf(b) - scoreOf(a),
    savings: (a, b) => savings(b) - savings(a) || scoreOf(b) - scoreOf(a),
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
  };
  return shown.sort(by[state.sort] ?? by.score);
}

// Every listing of one product across stores, cheapest first — the compare view's data.
export function productGroup(deals, product) {
  return deals.filter((d) => d.product === product).sort((a, b) => a.price - b.price || scoreOf(b) - scoreOf(a));
}

// Products sold by more than one store on this board, best (cheapest) listing first.
export function comparableProducts(deals) {
  const groups = new Map();
  for (const d of deals) {
    if (!groups.has(d.product)) groups.set(d.product, []);
    groups.get(d.product).push(d);
  }
  return [...groups.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([product, list]) => ({ product, list: list.sort((a, b) => a.price - b.price) }))
    .sort((a, b) => a.list[0].price - b.list[0].price);
}

export function boardStats(deals) {
  const scores = deals.map(scoreOf);
  return {
    count: deals.length,
    stores: storesOf(deals).length,
    categories: categoriesOf(deals).length,
    topScore: Math.max(...scores),
    totalSavings: deals.reduce((sum, d) => sum + savings(d), 0),
    comparable: comparableProducts(deals).length,
    newLows: deals.filter((d) => d.signal === "new-low").length,
  };
}
