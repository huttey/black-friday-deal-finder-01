// TrueDeal — rendering. Builds the deal cards, the detail view and the
// stats strip from the deals data. Every price, discount and verdict on the
// page comes from deals.js, so the page can never show a number the data
// does not hold.

import { DEALS, VERDICTS, discountOf, money, savingOf } from './deals.js';
import { countByVerdict } from './filters.js';

function esc(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function verdictBadge(verdict) {
  return `<span class="verdict verdict-${verdict}">${VERDICTS[verdict]}</span>`;
}

export function priceBlock(deal) {
  const pct = discountOf(deal);
  const usual = deal.usual === null
    ? '<span class="usual-na">usual price not shown</span>'
    : `<span class="usual"><s>${money(deal.usual)}</s></span>`;
  const off = pct === null
    ? '<span class="off off-na">—</span>'
    : `<span class="off">−${pct}%</span>`;
  return `<div class="prices"><span class="sale">${money(deal.sale)}</span>${usual}${off}</div>`;
}

export function dealCard(deal) {
  return `<article class="card">
    <div class="card-top">
      <span class="store">${esc(deal.store)}</span>
      <span class="cat">${esc(deal.category)}</span>
    </div>
    <h3><a href="#/deal/${deal.id}">${esc(deal.name)}</a></h3>
    ${priceBlock(deal)}
    <div class="verdict-row">${verdictBadge(deal.verdict)}</div>
    <p class="evidence">${esc(deal.evidence)}</p>
    <p class="checked">Checked ${esc(deal.checked)} · ${esc(deal.source)}</p>
    <div class="card-links">
      <a class="btn" href="${esc(deal.link)}" target="_blank" rel="noopener">View at ${esc(deal.store)} ↗</a>
      <a class="btn btn-ghost" href="#/deal/${deal.id}">Details</a>
    </div>
  </article>`;
}

export function renderGrid(list, host) {
  if (list.length === 0) {
    host.innerHTML = '<p class="empty">No deals match those filters. Clear the search or widen a filter.</p>';
    return;
  }
  host.innerHTML = list.map(dealCard).join('');
}

export function renderStats(host) {
  const counts = countByVerdict(DEALS);
  const total = DEALS.reduce((sum, d) => sum + savingOf(d), 0);
  const best = DEALS.filter((d) => discountOf(d) !== null)
    .sort((a, b) => discountOf(b) - discountOf(a))[0];
  host.innerHTML = `<div class="stat"><strong>${DEALS.length}</strong> deals checked</div>
    <div class="stat"><strong>${counts['new-low']}</strong> new lows</div>
    <div class="stat"><strong>${money(total)}</strong> total savings</div>
    <div class="stat">biggest cut <strong>${esc(best.name)} −${discountOf(best)}%</strong></div>`;
}

export function renderDetail(deal, host) {
  const pct = discountOf(deal);
  const others = DEALS.filter((d) => d.id !== deal.id && d.name === deal.name);
  host.innerHTML = `<p class="back"><a href="#/">← All deals</a></p>
  <article class="detail">
    <div class="card-top">
      <span class="store">${esc(deal.store)}</span>
      <span class="cat">${esc(deal.category)}</span>
      ${verdictBadge(deal.verdict)}
    </div>
    <h2>${esc(deal.name)}</h2>
    ${priceBlock(deal)}
    <p class="saving-line">${pct === null ? 'No discount claimed.' : `You save ${money(deal.usual - deal.sale)} (${pct}% off the usual price).`}</p>
    <h4>Is it really a deal?</h4>
    <p class="evidence-big">${esc(deal.evidence)}</p>
    <dl class="facts">
      <div><dt>Store</dt><dd>${esc(deal.store)}</dd></div>
      <div><dt>Sale price</dt><dd>${money(deal.sale)}</dd></div>
      <div><dt>Usual price</dt><dd>${deal.usual === null ? 'Not shown by the store' : money(deal.usual)}</dd></div>
      <div><dt>Checked</dt><dd>${esc(deal.checked)}</dd></div>
      <div><dt>Price source</dt><dd><a href="${esc(deal.sourceUrl)}" target="_blank" rel="noopener">${esc(deal.source)}</a></dd></div>
    </dl>
    ${others.length ? `<h4>Same product elsewhere</h4><p>${others.map((o) => `${esc(o.store)}: ${money(o.sale)}`).join(' · ')}</p>` : ''}
    <div class="card-links">
      <a class="btn" href="${esc(deal.link)}" target="_blank" rel="noopener">View at ${esc(deal.store)} ↗</a>
      <a class="btn btn-ghost" href="${esc(deal.sourceUrl)}" target="_blank" rel="noopener">Read the price source ↗</a>
    </div>
  </article>`;
}
