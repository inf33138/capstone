/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns
 * Base block: columns
 * Source: https://wknd.site/us/en.html (div.teaser.cmp-teaser--featured)
 * Generated: 2026-08-06
 *
 * Library convention (columns): first row is the block name; subsequent rows
 * have as many cells as visual columns. Here the Featured Article teaser is a
 * 2-column layout:
 *   cell 1 -> image
 *   cell 2 -> eyebrow/pretitle ("Featured Article"), h2 title, description, CTA
 *
 * Source: `.cmp-teaser--featured` with a `.cmp-teaser__content` (pretitle,
 * title, description, action link) and a `.cmp-teaser__image` wrapper.
 */
export default function parse(element, { document }) {
  // Image (left column) — extract the real <img>, not the wrapper.
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image__image, img');

  // Text content (right column).
  const eyebrow = element.querySelector('.cmp-teaser__pretitle, [class*="pretitle"], [class*="eyebrow"]');
  // NOTE: avoid a generic [class*="title"] fallback here — it would also match
  // "cmp-teaser__pretitle" (substring "title") and, being earlier in document
  // order, steal the eyebrow instead of the real heading.
  const heading = element.querySelector('.cmp-teaser__title, h1, h2, h3, h4');
  const description = element.querySelector('.cmp-teaser__description, [class*="description"]');
  const ctaLinks = Array.from(
    element.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a'),
  );

  const textCell = [];
  if (eyebrow) textCell.push(eyebrow);
  if (heading) textCell.push(heading);
  if (description) textCell.push(description);
  ctaLinks.forEach((cta) => textCell.push(cta));

  // Empty-block guard: no text and no image -> unwrap in place.
  if (textCell.length === 0 && !image) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // 2-column row: [image] | [text content]
  const cells = [[image || '', textCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
