/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero
 * Base block: carousel
 * Source: https://wknd.site/us/en.html (div.carousel.cmp-carousel--hero)
 * Generated: 2026-08-06
 *
 * Library convention (carousel): 2 columns, multiple rows. First row is the
 * block name/variant. Each subsequent row = one slide:
 *   cell 1 -> image (mandatory)
 *   cell 2 -> text content (title as heading, description, CTA link)
 *
 * Source structure: each slide is a `.cmp-carousel__item` containing a
 * `.cmp-teaser` with `.cmp-teaser__title` (h2), `.cmp-teaser__description`,
 * a CTA `.cmp-teaser__action-link`, and an image in `.cmp-teaser__image`.
 */
export default function parse(element, { document }) {
  // Each slide of the carousel.
  const items = Array.from(element.querySelectorAll('.cmp-carousel__item'));

  const cells = [];

  items.forEach((item) => {
    // Image (mandatory) — pull the real <img>, not the wrapper/meta.
    const image = item.querySelector('.cmp-teaser__image img, .cmp-image__image, img');

    // Text content for the second cell.
    const heading = item.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]');
    const description = item.querySelector('.cmp-teaser__description, [class*="description"]');
    const ctaLinks = Array.from(
      item.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a'),
    );

    // Skip a slide only if it has no meaningful content at all.
    if (!image && !heading && !description && ctaLinks.length === 0) return;

    const textCell = [];
    if (heading) textCell.push(heading);
    if (description) textCell.push(description);
    ctaLinks.forEach((cta) => textCell.push(cta));

    // 2-column row: [image] | [text content]
    cells.push([image || '', textCell]);
  });

  // Empty-block guard: nothing extracted -> unwrap in place.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
