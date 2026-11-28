// Deal Radar: a Black Friday deal board scored 0–100, best first.
// Hash routes: #/ is the board (search + filters), #/deal/<id> is one deal's page,
// #/compare is every same-product-across-stores table.
// window.__shotReady tells a screenshot script when the page is fully rendered.
// Weekend re-check edition wires the verdict (signal) chips into the board state.

import { deals } from "./data.js";
import { applyFilters, boardStats, categoriesOf, signalsOf, storesOf } from "./filters.js";
import { board, comparePage, dealPage, gridHtml, missingPage } from "./views.js";

const app = document.getElementById("app");
const state = { query: "", category: "All", store: "All", signal: "All", minOff: 0, minScore: 0, sort: "score" };
const stats = boardStats(deals);

function refreshGrid() {
  const shown = applyFilters(deals, state);
  document.getElementById("grid").innerHTML = gridHtml(shown, deals);
  document.getElementById("count").textContent = `${shown.length} of ${deals.length} deals on the radar`;
}

function renderBoard() {
  document.title = "Deal Radar — Black Friday deals scored, best first";
  app.innerHTML = board(deals, state, categoriesOf(deals), storesOf(deals), signalsOf(deals), stats);
  refreshGrid();
  document.getElementById("q").addEventListener("input", (e) => {
    state.query = e.target.value;
    refreshGrid();
  });
  document.getElementById("minoff").addEventListener("change", (e) => {
    state.minOff = Number(e.target.value);
    refreshGrid();
  });
  document.getElementById("minscore").addEventListener("change", (e) => {
    state.minScore = Number(e.target.value);
    refreshGrid();
  });
  document.getElementById("sort").addEventListener("change", (e) => {
    state.sort = e.target.value;
    refreshGrid();
  });
  app.querySelectorAll("[data-cat]").forEach((b) =>
    b.addEventListener("click", () => {
      state.category = b.dataset.cat;
      render();
    }),
  );
  app.querySelectorAll("[data-store]").forEach((b) =>
    b.addEventListener("click", () => {
      state.store = b.dataset.store;
      render();
    }),
  );
  app.querySelectorAll("[data-signal]").forEach((b) =>
    b.addEventListener("click", () => {
      state.signal = b.dataset.signal;
      render();
    }),
  );
}

function render() {
  window.__shotReady = false;
  const dealMatch = location.hash.match(/^#\/deal\/([^/?]+)/);
  if (dealMatch) {
    const found = deals.find((d) => d.id === decodeURIComponent(dealMatch[1]));
    document.title = found ? `${found.title} | Deal Radar` : "Not found | Deal Radar";
    app.innerHTML = found ? dealPage(found, deals) : missingPage();
  } else if (location.hash.startsWith("#/compare")) {
    document.title = "Same product, every store | Deal Radar";
    app.innerHTML = comparePage(deals);
  } else {
    renderBoard();
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener("hashchange", render);
render();
