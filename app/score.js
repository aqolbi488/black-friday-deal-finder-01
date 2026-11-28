// Deal Score: one 0–100 number per deal, built only from facts printed on the card.
// Base = the discount percentage. The honest signal then adjusts it: a new low is worth
// more than the same % off a price that returns every year, and an inflated was-price is
// worth less. A small bonus for large dollar savings keeps big-ticket cuts visible.
// The score is clamped to 0–100 and every input sits next to it, so any reader can
// recompute it by hand. Weekend re-check edition: same published formula, fresh prices.

export const percentOff = (d) => Math.round((1 - d.price / d.was) * 100);

export const savings = (d) => d.was - d.price;

const signalBonus = { "new-low": 22, strong: 10, routine: 0, inflated: -18 };

export function scoreOf(d) {
  const base = percentOff(d);
  const bonus = signalBonus[d.signal] ?? 0;
  const dollars = Math.min(12, Math.round(savings(d) / 100));
  return Math.max(0, Math.min(100, base + bonus + dollars));
}

export const signalLabel = {
  "new-low": "New low",
  strong: "Strong price",
  routine: "Routine sale",
  inflated: "Inflated was-price",
};

export function scoreWord(score) {
  if (score >= 75) return "Exceptional";
  if (score >= 55) return "Great";
  if (score >= 35) return "Good";
  if (score >= 18) return "Fair";
  return "Weak";
}

export function scoreParts(d) {
  return [
    `${percentOff(d)}% off`,
    `${signalLabel[d.signal] ?? d.signal} ${signalBonus[d.signal] >= 0 ? "+" : ""}${signalBonus[d.signal] ?? 0}`,
    `saves $${Math.round(savings(d))} +${Math.min(12, Math.round(savings(d) / 100))}`,
  ].join(" · ");
}
