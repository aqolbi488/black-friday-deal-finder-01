// Bargain Verdict: a Black Friday deal board where every price was checked and every discount gets a verdict.
// Hash routes: #/ is the board (search + filters), #/deal/<id> is one deal's page.
// window.__shotReady tells a screenshot script when the page is fully rendered.

import { deals } from "./data.js";
import { applyFilters, categoriesOf, storesOf } from "./filters.js";
import { board, dealPage, gridHtml, missingPage } from "./views.js";

const app = document.getElementById("app");
const state = { query: "", category: "All", store: "All", minOff: 0, sort: "best" };

function refreshGrid() {
  const shown = applyFilters(deals, state);
  document.getElementById("grid").innerHTML = gridHtml(shown);
  document.getElementById("count").textContent = `${shown.length} of ${deals.length} deals`;
}

function renderBoard() {
  document.title = "Bargain Verdict — Black Friday deals, checked";
  app.innerHTML = board(deals, state, categoriesOf(deals), storesOf(deals));
  refreshGrid();
  document.getElementById("q").addEventListener("input", (e) => {
    state.query = e.target.value;
    refreshGrid();
  });
  document.getElementById("minoff").addEventListener("change", (e) => {
    state.minOff = Number(e.target.value);
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
}

function render() {
  window.__shotReady = false;
  const match = location.hash.match(/^#\/deal\/([^/?]+)/);
  if (match) {
    const found = deals.find((d) => d.id === decodeURIComponent(match[1]));
    document.title = found ? `${found.title} | Bargain Verdict` : "Not found | Bargain Verdict";
    app.innerHTML = found ? dealPage(found, deals) : missingPage();
  } else {
    renderBoard();
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener("hashchange", render);
render();
