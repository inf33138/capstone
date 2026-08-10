/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-adventure
 * Base block: carousel
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html
 *   (div.carousel.panelcontainer.cmp-carousel--mini)
 * Generated: 2026-08-10
 *
 * Library convention (carousel): 2 columns, multiple rows. First row is the
 * block name/variant. Each subsequent row = one slide:
 *   cell 1 -> image (mandatory)
 *   cell 2 -> text content (optional) — this variant is image-only, so the
 *             second cell is left empty ('') to keep the 2-column shape.
 *
 * Source structure: `.cmp-carousel` > `.cmp-carousel__content` > N x
 * `.cmp-carousel__item`; each item wraps `div.image` > `div.cmp-image` >
 * `img.cmp-image__image`. Some pages have 1 slide, others 2+. Items with no
 * <img> (e.g. an empty/placeholder slide) are skipped.
 */
export default function parse(element, { document }) {
  // One row per slide.
  const items = Array.from(element.querySelectorAll('.cmp-carousel__item'));

  const cells = [];

  items.forEach((item) => {
    // The real <img>, not the .cmp-image wrapper or the trailing <meta>.
    const image = item.querySelector('.cmp-image__image, .cmp-image img, img');

    // Skip slides that carry no image.
    if (!image) return;

    // 2-column row: [image] | [text content] — image-only, so cell 2 is empty.
    cells.push([image, '']);
  });

  // Empty-block guard: nothing extracted -> unwrap in place.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-adventure', cells });
  element.replaceWith(block);
}
