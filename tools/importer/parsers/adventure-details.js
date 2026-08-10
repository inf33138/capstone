/* eslint-disable */
/* global WebImporter */
/**
 * Parser for adventure-details
 * Base block: adventure-details (custom, no library convention cached)
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html
 *   (div.contentfragment.cmp-contentfragment--elements article.cmp-contentfragment)
 * Generated: 2026-08-10
 *
 * Definition-list spec block: 2 columns, multiple rows. First row is the block
 * name (built by createBlock). Each subsequent row = one spec:
 *   cell 1 -> label (dt) e.g. Activity, Adventure Type, Trip Length, Group
 *             Size, Difficulty, Price
 *   cell 2 -> value (dd) e.g. Surfing, 6 Days, Beginner, 5000.0
 *
 * Source structure: `article.cmp-contentfragment` > optional
 * `h3.cmp-contentfragment__title` (the fragment's own name, e.g. "Bali Surf
 * Camp" — NOT a spec, so it is skipped) followed by
 * `dl.cmp-contentfragment__elements` > N x `div.cmp-contentfragment__element`,
 * each holding `dt.cmp-contentfragment__element-title` (label) and
 * `dd.cmp-contentfragment__element-value` (value). Elements missing a label or
 * value are skipped.
 */
export default function parse(element, { document }) {
  // One row per spec element. Restrict to the element wrappers so the
  // fragment title (an <h3> outside the <dl>) is never picked up.
  const specs = Array.from(
    element.querySelectorAll('.cmp-contentfragment__element'),
  );

  const cells = [];

  specs.forEach((spec) => {
    const labelEl = spec.querySelector('.cmp-contentfragment__element-title, dt');
    const valueEl = spec.querySelector('.cmp-contentfragment__element-value, dd');

    const label = labelEl ? labelEl.textContent.trim() : '';
    const value = valueEl ? valueEl.textContent.trim() : '';

    // Skip any element missing a label or value.
    if (!label || !value) return;

    // 2-column row: [label] | [value]
    cells.push([label, value]);
  });

  // Empty-block guard: nothing extracted -> unwrap in place.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'adventure-details', cells });
  element.replaceWith(block);
}
