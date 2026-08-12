/*
 * Accordion Block
 * Recreate an accordion
 * https://www.aem.live/developer/block-collection/accordion
 *
 * Note: this project ships a stripped @adobe/aem-boilerplate - scripts.js does
 * NOT export moveInstrumentation (it is xwalk-only and unneeded for a doc
 * project), so the vanilla import is intentionally dropped here.
 */

/**
 * The dev server serves content under a `/content/` prefix; preview/live serve
 * it at the root. Rebase an absolute path so the fetch works in both.
 */
function resolveContentPath(path) {
  return window.location.pathname.startsWith('/content/') ? `/content${path}` : path;
}

/**
 * Authored single-cell index mode: a block whose only content is a cell naming
 * a query-index / sheet `.json` path (text or link). Returns the path or null.
 */
function readAuthoredIndexSource(block) {
  const rows = [...block.children];
  if (rows.length !== 1) return null;
  const link = block.querySelector('a[href$=".json"], a[href*=".json?"]');
  const href = link ? link.getAttribute('href') : rows[0].textContent.trim();
  if (!href || !/\.json(\?|#|$)/.test(href)) return null;
  try { return /^https?:/i.test(href) ? new URL(href).pathname : href; } catch (e) { return href; }
}

/**
 * Replace the authored path cell with [question][answer] rows built from the
 * index (columns: question/answer, or title/description). The index is the
 * single source of truth — the cell is cleared if it's empty or unreachable
 * (no hardcoded fallback).
 */
async function populateFromIndex(block, indexPath) {
  block.textContent = '';
  try {
    const resp = await fetch(resolveContentPath(indexPath));
    if (!resp.ok) return;
    const json = await resp.json();
    const entries = Array.isArray(json.data) ? json.data : [];
    entries.forEach((e) => {
      const q = e.question || e.title;
      const a = e.answer || e.description;
      if (!q) return;
      const row = document.createElement('div');
      const qCell = document.createElement('div');
      qCell.textContent = q;
      const aCell = document.createElement('div');
      aCell.textContent = a || '';
      row.append(qCell, aCell);
      block.append(row);
    });
  } catch (e) { /* leave cleared */ }
}

export default async function decorate(block) {
  const indexPath = readAuthoredIndexSource(block);
  if (indexPath) await populateFromIndex(block, indexPath);

  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);
    // decorate accordion item body
    const body = row.children[1];
    body.className = 'accordion-item-body';
    // decorate accordion item
    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
