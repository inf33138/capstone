/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs
 * Base block: tabs
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html
 *   (div.tabs.panelcontainer)
 * Generated: 2026-08-10
 *
 * Library convention (tabs): 2 columns, multiple rows. First row is the block
 * name/variant. Each subsequent row = one tab:
 *   cell 1 -> tab label (mandatory) — the clickable tab text (e.g. Overview /
 *             Itinerary / What to Bring)
 *   cell 2 -> tab content (mandatory) — rich HTML shown when the tab is
 *             selected: headings, paragraphs, lists, inline image + caption.
 *             The Nth label pairs with the Nth panel.
 *
 * Source structure: `.cmp-tabs` > `ol.cmp-tabs__tablist` > N x
 * `li.cmp-tabs__tab` (labels, in order) and N sibling `div.cmp-tabs__tabpanel`
 * elements (one per tab, same order; the first has `--active`). Each panel wraps
 * a content fragment (`article.cmp-contentfragment` / `.cmp-contentfragment`)
 * holding the actual copy inside `.cmp-contentfragment__elements`, plus an
 * `h3.cmp-contentfragment__title` with the fragment's own name that is repeated
 * on every tab — this is skipped so it does not pollute each panel.
 *
 * On detail pages ALL panels are real content (hidden/non-active included), so
 * every panel is migrated. Panel content nodes are moved (not flattened) to keep
 * headings/paragraphs/lists/images intact.
 */

/** Collect the meaningful content nodes of a tab panel, preserving order. */
function collectPanelContent(panel) {
  const root = panel.querySelector('article.cmp-contentfragment, .cmp-contentfragment') || panel;

  // Meaningful, migratable nodes in document order. Layout-only wrappers
  // (empty aem-Grid divs) are ignored because they are not in this list.
  const candidates = Array.from(
    root.querySelectorAll('p, ul, ol, img, h1, h2, h3, h4, h5, h6, blockquote'),
  )
    // Drop the fragment's own repeated title (an h3.cmp-contentfragment__title).
    .filter((node) => !node.closest('.cmp-contentfragment__title'))
    // Keep only nodes that carry text or an image.
    .filter((node) => node.tagName === 'IMG' || node.querySelector('img') || node.textContent.trim());

  // Dedupe nested matches (e.g. an <img> inside a collected <p>): keep the
  // outermost node so content is never emitted twice.
  return candidates.filter(
    (node) => !candidates.some((other) => other !== node && other.contains(node)),
  );
}

export default function parse(element, { document }) {
  const tabsRoot = element.querySelector('.cmp-tabs') || element;

  // Tab labels (ordered). Prefer direct children of the tablist; fall back to
  // any tab li within this tabs component.
  let tabLabels = Array.from(tabsRoot.querySelectorAll(':scope > .cmp-tabs__tablist > .cmp-tabs__tab'));
  if (!tabLabels.length) tabLabels = Array.from(element.querySelectorAll('.cmp-tabs__tab'));

  // Tab panels (ordered, same order as labels). Prefer direct children.
  let panels = Array.from(tabsRoot.querySelectorAll(':scope > .cmp-tabs__tabpanel'));
  if (!panels.length) panels = Array.from(element.querySelectorAll('.cmp-tabs__tabpanel'));

  const cells = [];

  // Pair Nth label with Nth panel by index. Iterate the longer of the two so no
  // label or panel is dropped; pad the missing side with an empty cell.
  const rowCount = Math.max(tabLabels.length, panels.length);
  for (let i = 0; i < rowCount; i += 1) {
    const labelEl = tabLabels[i];
    const panel = panels[i];

    const label = labelEl ? labelEl.textContent.trim() : '';
    const content = panel ? collectPanelContent(panel) : [];

    // Skip a row only if it has neither a label nor any content.
    if (!label && content.length === 0) continue;

    // 2-column row: [tab label] | [panel content]
    cells.push([label || '', content.length ? content : '']);
  }

  // Empty-block guard: nothing extracted -> unwrap in place.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs', cells });
  element.replaceWith(block);
}
