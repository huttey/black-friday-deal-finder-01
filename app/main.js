// TrueDeal — wiring. Owns the filter state, the hash routes (#/ for the
// grid, #/deal/<id> for one deal, #/?verdict=new-low and friends for a
// preset filter) and re-renders the grid whenever anything changes.

import { DEALS, CATEGORIES, STORES, VERDICTS } from './deals.js';
import { defaultState, applyFilters, sortDeals } from './filters.js';
import { renderGrid, renderStats, renderDetail } from './render.js';

const state = defaultState();
const grid = document.getElementById('grid');
const detail = document.getElementById('detail');
const countLine = document.getElementById('count-line');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');
const categoryRow = document.getElementById('category-filters');
const storeRow = document.getElementById('store-filters');
const verdictRow = document.getElementById('verdict-filters');
const discountSelect = document.getElementById('min-discount');

function chipRow(host, options, current, key, label, labels) {
  host.innerHTML = options.map((opt) => {
    const text = opt === 'All' ? label : (labels && labels[opt] ? labels[opt] : opt);
    const active = opt === current ? ' aria-pressed="true" class="chip active"' : ' class="chip"';
    return `<button type="button" data-key="${key}" data-value="${escAttr(opt)}"${active}>${escHtml(text)}</button>`;
  }).join('');
}

function escHtml(text) {
  return String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function escAttr(text) {
  return escHtml(text).replaceAll('"', '&quot;');
}

function buildChips() {
  chipRow(categoryRow, ['All', ...CATEGORIES], state.category, 'category', 'All categories');
  chipRow(storeRow, ['All', ...STORES], state.store, 'store', 'All stores');
  chipRow(verdictRow, ['All', ...Object.keys(VERDICTS)], state.verdict, 'verdict', 'Any verdict', VERDICTS);
  for (const row of [categoryRow, storeRow, verdictRow]) {
    row.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        state[btn.dataset.key] = btn.dataset.value;
        buildChips();
        render();
      });
    });
  }
}

function readHashPreset() {
  const hash = window.location.hash;
  if (hash.startsWith('#/?')) {
    const params = new URLSearchParams(hash.slice(3));
    if (params.get('verdict')) state.verdict = params.get('verdict');
    if (params.get('category')) state.category = params.get('category');
    if (params.get('store')) state.store = params.get('store');
    if (params.get('sort')) state.sort = params.get('sort');
    if (params.get('q')) state.query = params.get('q');
  }
}

function render() {
  const hash = window.location.hash;
  if (hash.startsWith('#/deal/')) {
    const id = decodeURIComponent(hash.slice(7).split('?')[0]);
    const deal = DEALS.find((d) => d.id === id);
    if (deal) {
      grid.hidden = true;
      detail.hidden = false;
      countLine.textContent = '';
      renderDetail(deal, detail);
      return;
    }
  }
  grid.hidden = false;
  detail.hidden = true;
  const filtered = sortDeals(applyFilters(DEALS, state), state.sort);
  renderGrid(filtered, grid);
  countLine.textContent = `Showing ${filtered.length} of ${DEALS.length} deals — sorted by ${
    sortSelect.options[sortSelect.selectedIndex].textContent.toLowerCase()
  }.`;
}

searchInput.addEventListener('input', () => {
  state.query = searchInput.value;
  render();
});

sortSelect.addEventListener('change', () => {
  state.sort = sortSelect.value;
  render();
});

discountSelect.addEventListener('change', () => {
  state.minDiscount = Number(discountSelect.value);
  render();
});

window.addEventListener('hashchange', render);

readHashPreset();
searchInput.value = state.query;
sortSelect.value = state.sort;
discountSelect.value = String(state.minDiscount);
buildChips();
renderStats(document.getElementById('stats'));
render();
