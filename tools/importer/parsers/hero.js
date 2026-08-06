/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero
 * Base block: hero
 * Source: https://wknd.site/us/en.html (div.teaser.cmp-teaser--hero.cmp-teaser--imagebottom)
 * Generated: 2026-08-06
 *
 * Library convention (hero): 1 column, 3 rows. Row 1 is the block name.
 *   Row 2 (single cell) -> background image (optional)
 *   Row 3 (single cell) -> title (heading), subheading/description, CTA
 *
 * Source: `.cmp-teaser--hero` with `.cmp-teaser__content` (title, description,
 * action link) and a `.cmp-teaser__image` wrapper. This is the "Featured
 * Adventure" teaser ("Climbing New Zealand").
 */
export default function parse(element, { document }) {
  // Background image (row 2) — extract the real <img>, not the wrapper/meta.
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image__image, img');

  // Text content (row 3).
  const heading = element.querySelector('.cmp-teaser__title, h1, h2, h3');
  const description = element.querySelector('.cmp-teaser__description, [class*="description"]');
  const ctaLinks = Array.from(
    element.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a'),
  );

  // Empty-block guard: bail gracefully if no meaningful content.
  if (!heading && !description && ctaLinks.length === 0 && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image (only if present).
  if (image) cells.push([image]);

  // Row 3: single cell holding all text content (1-column trap — push the
  // content array as the single cell of the row, i.e. cells.push([contentCell])).
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  ctaLinks.forEach((cta) => contentCell.push(cta));
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
