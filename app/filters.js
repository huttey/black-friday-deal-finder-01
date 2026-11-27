// TrueDeal — filtering and sorting. Pure functions over the deals list;
// nothing here touches the page, so the same code drives the grid, the
// counts and the detail view's "same product" notes.

import { discountOf, savingOf } from './deals.js';

export function defaultState() {
  return {
    query: '',
    category: 'All',
    store: 'All',
    minDiscount: 0,
    verdict: 'All',
    sort: 'discount',
  };
}

export function applyFilters(deals, state) {
  const q = state.query.trim().toLowerCase();
  return deals.filter((d) => {
    if (q && !(d.name + ' ' + d.category + ' ' + d.store).toLowerCase().includes(q)) return false;
    if (state.category !== 'All' && d.category !== state.category) return false;
    if (state.store !== 'All' && d.store !== state.store) return false;
    if (state.verdict !== 'All' && d.verdict !== state.verdict) return false;
    if (state.minDiscount > 0) {
      const pct = discountOf(d);
      if (pct === null || pct < state.minDiscount) return false;
    }
    return true;
  });
}

export function sortDeals(deals, sort) {
  const list = [...deals];
  if (sort === 'discount') {
    list.sort((a, b) => (discountOf(b) ?? -1) - (discountOf(a) ?? -1) || a.sale - b.sale);
  } else if (sort === 'price-asc') {
    list.sort((a, b) => a.sale - b.sale);
  } else if (sort === 'price-desc') {
    list.sort((a, b) => b.sale - a.sale);
  } else if (sort === 'saving') {
    list.sort((a, b) => savingOf(b) - savingOf(a));
  } else if (sort === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }
  return list;
}

export function countByVerdict(deals) {
  const counts = { 'new-low': 0, strong: 0, routine: 0, inflated: 0 };
  for (const d of deals) counts[d.verdict] += 1;
  return counts;
}
