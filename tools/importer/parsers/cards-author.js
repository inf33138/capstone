/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-author
 * Base block: cards (author-bio byline variant)
 * Source: https://wknd.site/us/en/magazine/guide-la-skateparks.html
 *   - main main div.experiencefragment (single author byline, one per article)
 * Generated: 2026-08-09
 *
 * EDS "cards" library convention: table has 2 columns and multiple rows; the
 * first row contains only the block name. Each subsequent row is one card:
 *   cell 1 -> Image (mandatory) — author portrait
 *   cell 2 -> Text content (mandatory) — Title (heading) + Description + links
 * This variant emits exactly ONE card row (a single author byline).
 *
 * Runtime input: `element` is the author-bio experience fragment
 * `div.experiencefragment` inside the article column. Unlike cards-profile
 * (a GRID of person sections produced by a grouping transformer), this is a
 * SINGLE byline component. Its meaningful content lives in `.cmp-byline`:
 *   - portrait image:  `.cmp-byline__image .cmp-image img`
 *   - name:            `h2.cmp-byline__name`
 *   - role/subtitle:   `p.cmp-byline__occupations`
 * plus a sibling social button list `.cmp-buildingblock--btn-list`:
 *   - social buttons:  `a.cmp-button` (Facebook/Twitter/Instagram, placeholder
 *                      hrefs). Each anchor holds an icon-font
 *                      `span.cmp-button__icon` (glyph, no text) plus a
 *                      `span.cmp-button__text` carrying the clean label.
 *
 * Social-link label source (same rationale as cards-profile): `span.cmp-button__text`
 * is the clean canonical network name; the icon-font class is a semantic
 * fallback; aria-label/title/anchor text are last resorts. Clean <h2>/<p>/<a>
 * nodes are rebuilt via document.createElement so no icon spans, ids, or nested
 * chrome leak into the block table.
 */

/** Derive an anchor's clean social label (Facebook/Twitter/Instagram). */
function socialLabel(a) {
  // Preferred: the button's own text span — clean and canonical on this site.
  const textSpan = a.querySelector('.cmp-button__text');
  if (textSpan && textSpan.textContent.trim()) return textSpan.textContent.trim();
  // Fallback: derive from the icon-font class, e.g. cmp-button__icon--facebook.
  const icon = a.querySelector('[class*="cmp-button__icon--"]');
  if (icon) {
    const match = icon.className.match(/cmp-button__icon--([a-z]+)/i);
    if (match) return match[1].charAt(0).toUpperCase() + match[1].slice(1);
  }
  // Last resort: accessible attributes, then the anchor's own text.
  const aria = (a.getAttribute('aria-label') || '').trim();
  if (aria) return aria;
  const title = (a.getAttribute('title') || '').trim();
  if (title) return title;
  return a.textContent.trim();
}

export default function parse(element, { document }) {
  // The byline holds image + name + role; the social buttons live in a sibling
  // building-block list. Scope to the whole fragment so both are reachable.
  const byline = element.querySelector('.cmp-byline') || element;

  // Cell 1 (Image, mandatory): the real portrait <img>, not the wrapper.
  const image = byline.querySelector('.cmp-byline__image img, .cmp-image img, img');

  // Name (Title): h2.cmp-byline__name (fall back to any heading). Rebuild clean.
  const nameEl = byline.querySelector('h2.cmp-byline__name, .cmp-byline__name, h2, h3');
  const nameText = nameEl ? nameEl.textContent.trim() : '';

  // Role / occupations subtitle (Description).
  const roleEl = byline.querySelector('p.cmp-byline__occupations, .cmp-byline__occupations, p');
  const roleText = roleEl ? roleEl.textContent.trim() : '';

  // Social links (CTAs): prefer the button list scoped to the whole fragment,
  // fall back to any cmp-button anchor.
  let socialAnchors = Array.from(element.querySelectorAll('.cmp-buildingblock--btn-list a[href]'));
  if (!socialAnchors.length) socialAnchors = Array.from(element.querySelectorAll('a.cmp-button[href]'));

  // Empty-block guard: neither image nor name -> unwrap in place.
  if (!image && !nameText) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Cell 2 (Text content): Title heading + Description + CTA links.
  const textCell = [];

  if (nameText) {
    const heading = document.createElement('h2');
    heading.textContent = nameText;
    textCell.push(heading);
  }

  if (roleText) {
    const roleP = document.createElement('p');
    roleP.textContent = roleText;
    textCell.push(roleP);
  }

  socialAnchors.forEach((src) => {
    const href = src.getAttribute('href');
    const label = socialLabel(src);
    const link = document.createElement('a');
    if (href) link.setAttribute('href', href);
    link.textContent = label || href || '';
    textCell.push(link);
  });

  // Single 2-column card row: [image] | [name + role + social links].
  // First row (block name) is added by WebImporter.Blocks.createBlock.
  const cells = [[image || '', textCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-author', cells });
  element.replaceWith(block);
}
