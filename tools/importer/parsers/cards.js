/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards
 * Base block: cards
 * Source: https://wknd.site/us/en.html
 *   - main.cmp-layout-container--fixed:nth-of-type(1) div.image-list.list (Recent Articles)
 *   - main.cmp-layout-container--fixed:nth-of-type(2) div.image-list.list (Adventures Grid)
 * Generated: 2026-08-06
 *
 * Library convention (cards): 2 columns, multiple rows. First row is the block
 * name. Each subsequent row = one card:
 *   cell 1 -> image (mandatory)
 *   cell 2 -> text content (title as heading, description, optional CTA)
 *
 * Source: `.image-list` > `ul.cmp-image-list` > `li.cmp-image-list__item`. Each
 * item has a linked image (`.cmp-image-list__item-image-link` > img), a linked
 * title (`.cmp-image-list__item-title-link` > span.cmp-image-list__item-title)
 * and a description span (`.cmp-image-list__item-description`). Both grids share
 * this structure, so one parser handles both instances.
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.cmp-image-list__item, li'));

  const cells = [];

  items.forEach((item) => {
    // Image (mandatory) — the real <img>, not the link/wrapper.
    const image = item.querySelector('.cmp-image-list__item-image img, .cmp-image__image, img');

    // Linked title — the card links to the article/adventure. Wrap it in a
    // heading so it is styled as a title per the library convention while
    // preserving the link.
    const titleLink = item.querySelector('.cmp-image-list__item-title-link');
    const titleText = item.querySelector('.cmp-image-list__item-title');

    let heading = null;
    if (titleLink) {
      heading = document.createElement('h3');
      heading.append(titleLink);
    } else if (titleText) {
      heading = document.createElement('h3');
      heading.append(titleText);
    } else {
      // Fallback: an existing heading element inside the item.
      heading = item.querySelector('h1, h2, h3, h4, h5, h6');
    }

    // Description.
    const description = item.querySelector('.cmp-image-list__item-description, [class*="description"]');

    // Skip a card only if it has no meaningful content at all.
    if (!image && !heading && !description) return;

    const textCell = [];
    if (heading) textCell.push(heading);
    if (description) textCell.push(description);

    // 2-column row: [image] | [text content]
    cells.push([image || '', textCell]);
  });

  // Empty-block guard: nothing extracted -> unwrap in place.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
