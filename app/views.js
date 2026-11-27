// HTML for the Radar board, the deal pages and the compare view.
// Everything from the data file is escaped before it reaches the page.

import { percentOff, savings, scoreOf, scoreParts, scoreWord, signalLabel } from "./score.js";
import { comparableProducts, productGroup } from "./filters.js";

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const usd = (n) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });
const checkedAt = (iso) =>
  new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC";

export function signalBadge(d) {
  return `<span class="badge badge-${esc(d.signal)}">${esc(signalLabel[d.signal] ?? d.signal)}</span>`;
}

// A small radar ring whose filled arc is the Deal Score — readable at screenshot size.
export function scoreRing(d) {
  const s = scoreOf(d);
  const c = 2 * Math.PI * 15.5;
  const filled = (s / 100) * c;
  return `<span class="ring" title="Deal Score ${s} of 100 — ${esc(scoreParts(d))}"><svg viewBox="0 0 36 36" width="44" height="44" aria-hidden="true"><circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--track)" stroke-width="4"/><circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--lime)" stroke-width="4" stroke-linecap="round" stroke-dasharray="${filled.toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 18 18)"/></svg><span class="ring-num">${s}</span></span>`;
}

export function dealCard(d, rank) {
  const s = scoreOf(d);
  return `<article class="card">
  <div class="card-head">${scoreRing(d)}<div class="card-head-text"><span class="rank">#${rank} · Deal Score ${s} — ${scoreWord(s)}</span>${signalBadge(d)}<span class="scorebar" role="img" aria-label="Deal Score ${s} of 100"><span style="width:${s}%"></span></span></div><span class="off">${percentOff(d)}% off</span></div>
  <h3><a href="#/deal/${encodeURIComponent(d.id)}">${esc(d.title)}</a></h3>
  <p class="store">${esc(d.store)} · ${esc(d.category)}</p>
  <p class="prices"><strong>${usd(d.price)}</strong> <s>${usd(d.was)}</s> <span class="save">save ${usd(savings(d))}</span></p>
  <p class="evidence">${esc(d.evidence)}</p>
  <p class="meta">Checked ${checkedAt(d.checked)} · read in ${esc(d.source)}</p>
  <p class="actions"><a class="btn" href="${esc(d.url)}" rel="noopener" target="_blank">See it at ${esc(d.store)}</a>
  <a class="more" href="#/deal/${encodeURIComponent(d.id)}">Score breakdown</a></p>
</article>`;
}

export function board(deals, state, cats, stores, stats) {
  const chip = (label, active, attr) =>
    `<button type="button" class="chip${active ? " chip-on" : ""}" data-${attr}="${esc(label)}">${esc(label)}</button>`;
  return `<section class="stats" aria-label="Board summary">
  <div class="stat"><strong>${stats.count}</strong><span>deals checked this evening</span></div>
  <div class="stat"><strong>${stats.stores}</strong><span>stores · ${stats.categories} categories</span></div>
  <div class="stat"><strong>${usd(Math.round(stats.totalSavings))}</strong><span>total savings vs usual prices</span></div>
  <div class="stat"><strong>${stats.topScore}</strong><span>highest Deal Score (of 100)</span></div>
  <div class="stat"><strong>${stats.comparable}</strong><span>products compared across stores</span></div>
</section>
<section class="controls" aria-label="Search and filters">
  <label class="search">Search the radar <input id="q" type="search" placeholder="e.g. LEGO, headphones, Dyson" value="${esc(state.query)}"></label>
  <div class="chiprow" role="group" aria-label="Category"><span class="chiplabel">Category</span>${["All", ...cats]
    .map((c) => chip(c, state.category === c, "cat"))
    .join("")}</div>
  <div class="chiprow" role="group" aria-label="Store"><span class="chiplabel">Store</span>${["All", ...stores]
    .map((s) => chip(s, state.store === s, "store"))
    .join("")}</div>
  <div class="row2">
    <label>At least <select id="minoff">${[0, 25, 40, 50]
      .map((v) => `<option value="${v}"${state.minOff === v ? " selected" : ""}>${v}% off</option>`)
      .join("")}</select></label>
    <label>Deal Score <select id="minscore">${[0, 35, 55, 75]
      .map((v) => `<option value="${v}"${state.minScore === v ? " selected" : ""}>${v}+</option>`)
      .join("")}</select></label>
    <label>Sort <select id="sort">${[
      ["score", "Deal Score: best first"],
      ["discount", "Biggest % off"],
      ["savings", "Biggest $ saved"],
      ["price-asc", "Price: low to high"],
      ["price-desc", "Price: high to low"],
    ]
      .map(([v, t]) => `<option value="${v}"${state.sort === v ? " selected" : ""}>${t}</option>`)
      .join("")}</select></label>
    <span id="count" class="count"></span>
  </div>
  <p class="compare-link"><a href="#/compare">Compare the same product across stores &rarr;</a> ${stats.comparable} products on this board are sold by more than one store.</p>
</section>
<section id="grid" class="grid"></section>`;
}

export function gridHtml(shown) {
  if (shown.length === 0)
    return `<p class="empty">No deal matches those filters. <a href="#/">Clear the search</a> to see the whole board.</p>`;
  return shown.map((d, i) => dealCard(d, i + 1)).join("");
}

export function dealPage(d, all) {
  const group = productGroup(all, d.product);
  const others = group.filter((o) => o.id !== d.id);
  const compare =
    others.length === 0
      ? ""
      : `<section class="compare"><h2>Same product, other stores</h2><ul>${others
          .map(
            (o) =>
              `<li><strong>${usd(o.price)}</strong> at ${esc(o.store)} (Deal Score ${scoreOf(o)}, ${percentOff(o)}% off, checked ${checkedAt(
                o.checked,
              )}) — <a href="${esc(o.url)}" rel="noopener" target="_blank">see it</a> · <a href="#/deal/${encodeURIComponent(
                o.id,
              )}">its breakdown</a></li>`,
          )
          .join("")}</ul><p>${d.price <= others[0].price ? "This listing is the cheapest of them." : `Cheapest elsewhere: ${usd(others[0].price)} at ${esc(others[0].store)} — ${usd(d.price - others[0].price)} less than here.`}</p><p><a href="#/compare">See every cross-store comparison</a></p></section>`;
  return `<p><a href="#/">&larr; Back to the radar</a></p>
<article class="detail">
  <div class="card-head">${scoreRing(d)}<div class="card-head-text"><span class="rank">Deal Score ${scoreOf(d)} of 100 — ${scoreWord(scoreOf(d))}</span>${signalBadge(d)}</div><span class="off">${percentOff(d)}% off</span></div>
  <h1>${esc(d.title)}</h1>
  <p class="prices big"><strong>${usd(d.price)}</strong> <s>${usd(d.was)}</s> <span class="save">you save ${usd(savings(d))}</span></p>
  <dl>
    <dt>Store</dt><dd>${esc(d.store)}</dd>
    <dt>Category</dt><dd>${esc(d.category)}</dd>
    <dt>Score breakdown</dt><dd>${esc(scoreParts(d))} = ${scoreOf(d)}</dd>
    <dt>Verdict</dt><dd>${esc(signalLabel[d.signal] ?? d.signal)} — ${esc(d.evidence)}</dd>
    <dt>Price checked</dt><dd>${checkedAt(d.checked)}</dd>
    <dt>Read in</dt><dd>${esc(d.source)}</dd>
    <dt>Good to know</dt><dd>${esc(d.note)}</dd>
  </dl>
  <p><a class="btn btn-big" href="${esc(d.url)}" rel="noopener" target="_blank">See it at ${esc(d.store)}</a></p>
  <p class="meta">Prices move during Black Friday week — the store's page at checkout is the final word.</p>
</article>
${compare}`;
}

export function comparePage(all) {
  const groups = comparableProducts(all);
  const rows = groups
    .map(({ product, list }) => {
      const best = list[0];
      const cells = list
        .map(
          (d) =>
            `<tr${d.id === best.id ? ' class="best-row"' : ""}><td>${esc(d.store)}${d.id === best.id ? ' <span class="best-tag">cheapest</span>' : ""}</td><td><strong>${usd(d.price)}</strong></td><td><s>${usd(d.was)}</s></td><td>${percentOff(d)}% off</td><td>${scoreOf(d)}</td><td>${checkedAt(d.checked)}</td><td><a href="${esc(d.url)}" rel="noopener" target="_blank">see it</a> · <a href="#/deal/${encodeURIComponent(d.id)}">breakdown</a></td></tr>`,
        )
        .join("");
      const spread = list[list.length - 1].price - best.price;
      return `<section class="compare-group"><h2>${esc(product)}</h2><p class="spread">${list.length} stores · spread ${usd(spread)} · cheapest: <strong>${usd(best.price)} at ${esc(best.store)}</strong></p><div class="tablewrap"><table><thead><tr><th>Store</th><th>Price</th><th>Usual</th><th>Off</th><th>Score</th><th>Checked</th><th>Link</th></tr></thead><tbody>${cells}</tbody></table></div></section>`;
    })
    .join("");
  return `<p><a href="#/">&larr; Back to the radar</a></p>
<h1>Same product, every store</h1>
<p class="lede">These ${groups.length} products are sold by more than one store on tonight's board. Every price was checked on Black Friday evening, 27 November 2026 — the cheapest row of each table is marked, and ties are shown as ties.</p>
${rows}`;
}

export function missingPage() {
  return `<h1>That deal is not on the radar</h1><p>It may have sold out or the address is wrong. <a href="#/">See all checked deals</a>.</p>`;
}
