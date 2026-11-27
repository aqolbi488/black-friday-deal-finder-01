// HTML for the board and the deal pages. Everything from the data file is escaped before it reaches the page.

import { dealScore, percentOff, sameProductElsewhere, signalLabel } from "./filters.js";

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const usd = (n) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });
const checkedAt = (iso) =>
  new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC";

export function signalBadge(d) {
  return `<span class="badge badge-${esc(d.signal)}">${esc(signalLabel[d.signal] ?? d.signal)}</span>`;
}

export function dealCard(d, rank) {
  return `<article class="card">
  <div class="card-top"><span class="rank">#${rank}</span>${signalBadge(d)}<span class="off">${percentOff(d)}% off</span></div>
  <h3><a href="#/deal/${encodeURIComponent(d.id)}">${esc(d.title)}</a></h3>
  <p class="store">${esc(d.store)} · ${esc(d.category)}</p>
  <p class="prices"><strong>${usd(d.price)}</strong> <s>${usd(d.was)}</s> <span class="save">save ${usd(d.was - d.price)}</span></p>
  <p class="evidence">${esc(d.evidence)}</p>
  <p class="meta">Checked ${checkedAt(d.checked)} · read in ${esc(d.source)}</p>
  <p class="actions"><a class="btn" href="${esc(d.url)}" rel="noopener" target="_blank">See it at ${esc(d.store)}</a>
  <a class="more" href="#/deal/${encodeURIComponent(d.id)}">Why this verdict?</a></p>
</article>`;
}

export function board(deals, state, cats, stores) {
  const chip = (label, active, attr) =>
    `<button type="button" class="chip${active ? " chip-on" : ""}" data-${attr}="${esc(label)}">${esc(label)}</button>`;
  return `<section class="controls" aria-label="Search and filters">
  <label class="search">Search deals <input id="q" type="search" placeholder="e.g. Dyson, headphones, LEGO" value="${esc(state.query)}"></label>
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
    <label>Sort <select id="sort">${[
      ["best", "Best deals first"],
      ["discount", "Biggest % off"],
      ["savings", "Biggest $ saved"],
      ["price-asc", "Price: low to high"],
      ["price-desc", "Price: high to low"],
    ]
      .map(([v, t]) => `<option value="${v}"${state.sort === v ? " selected" : ""}>${t}</option>`)
      .join("")}</select></label>
    <span id="count" class="count"></span>
  </div>
</section>
<section id="grid" class="grid"></section>`;
}

export function gridHtml(shown) {
  if (shown.length === 0)
    return `<p class="empty">No deal matches those filters. <a href="#/">Clear the search</a> to see the whole board.</p>`;
  return shown.map((d, i) => dealCard(d, i + 1)).join("");
}

export function dealPage(d, all) {
  const others = sameProductElsewhere(all, d);
  const compare =
    others.length === 0
      ? ""
      : `<section class="compare"><h2>Same product, other stores</h2><ul>${others
          .map(
            (o) =>
              `<li><strong>${usd(o.price)}</strong> at ${esc(o.store)} (${percentOff(o)}% off, checked ${checkedAt(
                o.checked,
              )}) — <a href="${esc(o.url)}" rel="noopener" target="_blank">see it</a> · <a href="#/deal/${encodeURIComponent(
                o.id,
              )}">its verdict</a></li>`,
          )
          .join("")}</ul><p>${d.price <= others[0].price ? "This listing is the cheapest of them." : `Cheapest elsewhere: ${usd(others[0].price)} at ${esc(others[0].store)}.`}</p></section>`;
  const code = d.code ? `<p class="code">Promo code: <strong>${esc(d.code)}</strong> — enter it at checkout.</p>` : "";
  return `<p><a href="#/">&larr; Back to the board</a></p>
<article class="detail">
  <div class="card-top">${signalBadge(d)}<span class="off">${percentOff(d)}% off</span><span class="score">Deal score ${dealScore(d)}</span></div>
  <h1>${esc(d.title)}</h1>
  <p class="prices big"><strong>${usd(d.price)}</strong> <s>${usd(d.was)}</s> <span class="save">you save ${usd(d.was - d.price)}</span></p>
  <dl>
    <dt>Store</dt><dd>${esc(d.store)}</dd>
    <dt>Category</dt><dd>${esc(d.category)}</dd>
    <dt>Verdict</dt><dd>${esc(signalLabel[d.signal] ?? d.signal)} — ${esc(d.evidence)}</dd>
    <dt>Price checked</dt><dd>${checkedAt(d.checked)}</dd>
    <dt>Read in</dt><dd>${esc(d.source)}</dd>
    <dt>Good to know</dt><dd>${esc(d.note)}</dd>
  </dl>
  ${code}
  <p><a class="btn btn-big" href="${esc(d.url)}" rel="noopener" target="_blank">See it at ${esc(d.store)}</a></p>
  <p class="meta">Prices move during Black Friday week — the store's page at checkout is the final word.</p>
</article>
${compare}`;
}

export function missingPage() {
  return `<h1>That deal is not on the board</h1><p>It may have sold out or the address is wrong. <a href="#/">See all checked deals</a>.</p>`;
}
