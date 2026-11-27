// Filtering, sorting and scoring for the deal board. Pure functions over the deal list — no DOM here,
// so the board's behaviour can be reasoned about (and tested) without a browser.

export const percentOff = (d) => Math.round((1 - d.price / d.was) * 100);

// A simple, explainable score: the discount counts, and the honest signal adjusts it.
// A new low is worth more than the same % off a price that comes back every year.
const signalBonus = { "new-low": 25, strong: 12, routine: 0, inflated: -15 };

export function dealScore(d) {
  return percentOff(d) + (signalBonus[d.signal] ?? 0);
}

export const signalLabel = {
  "new-low": "New low",
  strong: "Strong price",
  routine: "Routine sale",
  inflated: "Inflated was-price",
};

export function categoriesOf(deals) {
  return [...new Set(deals.map((d) => d.category))].sort();
}

export function storesOf(deals) {
  return [...new Set(deals.map((d) => d.store))].sort();
}

// state: { query, category, store, minOff, sort }
export function applyFilters(deals, state) {
  const q = state.query.trim().toLowerCase();
  const shown = deals.filter((d) => {
    if (state.category !== "All" && d.category !== state.category) return false;
    if (state.store !== "All" && d.store !== state.store) return false;
    if (percentOff(d) < state.minOff) return false;
    if (q !== "" && !`${d.title} ${d.store} ${d.category} ${d.product}`.toLowerCase().includes(q)) return false;
    return true;
  });
  const by = {
    best: (a, b) => dealScore(b) - dealScore(a) || a.price - b.price,
    discount: (a, b) => percentOff(b) - percentOff(a) || dealScore(b) - dealScore(a),
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    savings: (a, b) => b.was - b.price - (a.was - a.price),
  };
  return shown.sort(by[state.sort] ?? by.best);
}

// Other listings of the same product at different stores, cheapest first.
export function sameProductElsewhere(deals, deal) {
  return deals
    .filter((d) => d.product === deal.product && d.id !== deal.id)
    .sort((a, b) => a.price - b.price);
}
