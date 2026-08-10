import { createOptimizedPicture } from '../../scripts/aem.js';

// Adventure category filter (adventures listing "Current Adventures" grid only).
// WKND groups the 16 adventures into category tabs; a card can belong to more
// than one category. Mapping mirrors the source tab panels (adventures with no
// category appear only under "All"). Keyed by the adventure detail-page slug.
const ADVENTURE_CATEGORIES = {
  'climbing-new-zealand': ['climbing'],
  'colorado-rock-climbing': ['climbing'],
  'whistler-mountain-biking': ['cycling'],
  'cycling-tuscany': ['cycling', 'travel'],
  'west-coast-cycling': ['cycling'],
  'downhill-skiing-wyoming': ['skiing'],
  'ski-touring-mont-blanc': ['skiing'],
  'tahoe-skiing': ['skiing'],
  'bali-surf-camp': ['surfing'],
  'surf-camp-costa-rica': ['surfing'],
  'beervana-portland': ['travel'],
  'gastronomic-marais-tour': ['travel'],
  'napa-wine-tasting': ['travel'],
  'riverside-camping-australia': ['travel'],
  'yosemite-backpacking': ['travel'],
};

const ADVENTURE_FILTERS = ['All', 'Climbing', 'Cycling', 'Skiing', 'Surfing', 'Travel'];

/**
 * Add category filter tabs to the adventures listing card grid. Scoped to the
 * "Current Adventures" grid by its section heading, so other cards blocks
 * (homepage, magazine) are untouched. Each card is tagged with its categories
 * from ADVENTURE_CATEGORIES (via the detail-page slug in its link); selecting a
 * tab shows only matching cards. "All" shows every card.
 * @param {Element} block The cards block element
 * @param {HTMLUListElement} ul The decorated card list
 */
function addAdventureFilters(block, ul) {
  const section = block.closest('.section');
  const heading = section && section.querySelector('h1, h2, h3');
  if (!heading || heading.textContent.trim().toLowerCase() !== 'current adventures') return;

  const cards = [...ul.querySelectorAll(':scope > li')];
  if (!cards.length) return;

  // Tag each card with its categories, derived from the adventure link slug.
  cards.forEach((li) => {
    const href = li.querySelector('a[href*="/adventures/"]');
    const match = href && href.getAttribute('href').match(/\/adventures\/([a-z0-9-]+)/);
    const slug = match ? match[1] : '';
    const cats = ADVENTURE_CATEGORIES[slug] || [];
    li.dataset.categories = cats.join(' ');
  });

  // Build the filter tab bar.
  const nav = document.createElement('div');
  nav.className = 'cards-filters';
  nav.setAttribute('role', 'tablist');
  nav.setAttribute('aria-label', 'Filter adventures by category');

  const apply = (filter) => {
    const key = filter.toLowerCase();
    cards.forEach((li) => {
      const cats = li.dataset.categories ? li.dataset.categories.split(' ') : [];
      li.hidden = key !== 'all' && !cats.includes(key);
    });
    nav.querySelectorAll('button').forEach((b) => {
      b.setAttribute('aria-selected', b.dataset.filter === filter ? 'true' : 'false');
    });
  };

  ADVENTURE_FILTERS.forEach((label) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cards-filter';
    btn.textContent = label;
    btn.dataset.filter = label;
    btn.setAttribute('role', 'tab');
    btn.addEventListener('click', () => apply(label));
    nav.append(btn);
  });

  block.prepend(nav);
  apply('All');
}

// Per-section character limits for card description truncation, keyed by the
// section heading (lower-cased). Only grids listed here are truncated; all
// other cards blocks (adventures listing, magazine) keep their full copy.
const CARD_DESC_LIMITS = {
  'recent articles': 30,
  'where do you want to go?': 34,
};

/**
 * Truncate card description paragraphs to a fixed character count and append an
 * ellipsis marker. Scoped by section heading via CARD_DESC_LIMITS. Descriptions
 * already at/under the limit are left untouched. The full text is preserved in a
 * title attribute for accessibility.
 * @param {Element} block The cards block element
 * @param {HTMLUListElement} ul The decorated card list
 */
function truncateCardDescriptions(block, ul) {
  const section = block.closest('.section');
  const heading = section && section.querySelector('h1, h2, h3');
  if (!heading) return;
  const limit = CARD_DESC_LIMITS[heading.textContent.trim().toLowerCase()];
  if (!limit) return;

  ul.querySelectorAll(':scope > li .cards-card-body p').forEach((p) => {
    const text = p.textContent.trim();
    if (text.length > limit) {
      p.title = text;
      p.textContent = `${text.slice(0, limit).trimEnd()}...`;
    }
  });
}

// Query-index-driven card grids. Instead of hard-coding the card list, the
// listed grids fetch a published query-index.json at runtime and render the
// newest N entries. Keyed by section heading (lower-cased).
const CARD_INDEX_SOURCES = {
  'recent articles': { index: '/us/en/magazine/query-index.json', limit: 4 },
};

/**
 * The dev server serves content under a `/content/` path prefix; preview/live
 * serve it at the root. Rebase an absolute index/content path onto that prefix
 * so the fetch works in both environments.
 * @param {string} path Absolute site path (e.g. /us/en/magazine/query-index.json)
 * @returns {string} The path, prefixed with /content on the dev environment
 */
function resolveContentPath(path) {
  return window.location.pathname.startsWith('/content/') ? `/content${path}` : path;
}

/**
 * Build the raw block rows (a div per card, matching the authored contract:
 * [image cell][body cell]) from query-index entries, so they flow through the
 * same decoration pipeline as authored cards. Newest entries first.
 * @param {Element} block The cards block element
 * @param {Array<Object>} entries query-index rows
 * @param {number} limit Max number of cards to render
 */
function renderIndexCards(block, entries, limit) {
  const items = entries
    .filter((e) => e.path && e.title)
    .sort((a, b) => Number(b.lastModified || 0) - Number(a.lastModified || 0))
    .slice(0, limit);
  if (!items.length) return; // keep authored fallback if the index is empty

  block.textContent = '';
  items.forEach((item) => {
    const row = document.createElement('div');
    const path = resolveContentPath(item.path);

    const imageCell = document.createElement('div');
    if (item.image) {
      const pic = createOptimizedPicture(item.image, item.title, false, [{ width: '750' }]);
      imageCell.append(pic);
    }

    const bodyCell = document.createElement('div');
    const h3 = document.createElement('h3');
    const a = document.createElement('a');
    a.href = path;
    a.textContent = item.title;
    h3.append(a);
    bodyCell.append(h3);
    if (item.description) {
      const p = document.createElement('p');
      p.textContent = item.description;
      bodyCell.append(p);
    }

    row.append(imageCell, bodyCell);
    block.append(row);
  });
}

/**
 * If this cards grid is configured to be query-index-driven (by section
 * heading), fetch the index and replace the authored rows with the newest
 * entries. On any failure (no index yet, network error, empty result) the
 * authored cards are left in place as a graceful fallback.
 * @param {Element} block The cards block element
 */
async function populateFromIndex(block) {
  const section = block.closest('.section');
  const heading = section && section.querySelector('h1, h2, h3');
  if (!heading) return;
  const source = CARD_INDEX_SOURCES[heading.textContent.trim().toLowerCase()];
  if (!source) return;

  try {
    const resp = await fetch(resolveContentPath(source.index));
    if (!resp.ok) return;
    const json = await resp.json();
    const entries = Array.isArray(json.data) ? json.data : [];
    renderIndexCards(block, entries, source.limit);
  } catch (e) {
    // leave the authored cards in place on any error
  }
}

export default async function decorate(block) {
  // Dynamic query-index grids replace their authored rows before decoration,
  // so fetched cards flow through the same transform below.
  await populateFromIndex(block);

  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  // Make the card image a clickable link to the same destination as the title.
  // The title link already provides an accessible route to the article, so the
  // image link is hidden from assistive tech (aria-hidden + tabindex=-1) to
  // avoid announcing the same destination twice.
  ul.querySelectorAll(':scope > li').forEach((li) => {
    const imageCol = li.querySelector('.cards-card-image');
    const picture = imageCol && imageCol.querySelector('picture');
    const titleLink = li.querySelector('.cards-card-body a[href]');
    if (!imageCol || !picture || !titleLink || imageCol.querySelector('a')) return;
    const link = document.createElement('a');
    link.href = titleLink.getAttribute('href');
    link.setAttribute('aria-hidden', 'true');
    link.setAttribute('tabindex', '-1');
    // preserve any link behavior authored on the title (e.g. new-tab CTAs)
    if (titleLink.target) link.target = titleLink.target;
    if (titleLink.rel) link.rel = titleLink.rel;
    link.append(picture);
    imageCol.append(link);
  });

  block.replaceChildren(ul);

  addAdventureFilters(block, ul);
  truncateCardDescriptions(block, ul);
}
