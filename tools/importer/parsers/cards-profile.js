/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-profile
 * Base block: cards
 * Source: https://wknd.site/us/en/about-us.html
 *   - main div.cards-profile--contributors (4 person cards)
 *   - main div.cards-profile--guides (3 person cards)
 * Generated: 2026-08-07
 *
 * Library convention (cards): 2 columns, multiple rows. First row is the block
 * name. Each subsequent row = one card:
 *   cell 1 -> image (profile photo)
 *   cell 2 -> text content: name (heading) + role + social links
 *
 * Runtime input: a grouping transformer (transformers/wknd-profile-groups.js)
 * runs BEFORE parsing and wraps each run of person cards into
 * `div.cards-profile.cards-profile--contributors` / `--guides`. So `element`
 * is that wrapper div; its children are `section.cmp-experience-fragment--contributor`
 * elements, one per person. Each section contains, in order:
 *   - profile image:   `.cmp-image img`
 *   - name:            `h3.cmp-title__text` (inside `.cmp-title`)
 *   - role/subtitle:   `h5.cmp-title__text` (inside `.cmp-title[.cmp-title--black]`)
 *   - social buttons:  `.cmp-buildingblock--btn-list` > `a.cmp-button` (2-3 links
 *                      to placeholder hrefs; each anchor holds an icon-font
 *                      `span.cmp-button__icon` (the glyph, no text) plus a
 *                      `span.cmp-button__text` that carries the clean label).
 *
 * Social-link label source (verified against the live page): the `aria-label`
 * is inconsistent and polluted ("Facebook Social Media", "Facebook jakehammer",
 * "instagram jakehammer"), while `span.cmp-button__text` is always the clean,
 * canonical network name ("Facebook"/"Twitter"/"Instagram"). We therefore
 * prefer `.cmp-button__text`, then derive from the icon-font class as a
 * semantic fallback, and only fall back to aria-label/title/anchor text if
 * neither is present — this yields exactly the labels the block expects.
 *
 * Clean <h3>/<p>/<a> nodes are rebuilt via document.createElement so no icon
 * spans, ids, or nested chrome leak into the block table.
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
  // One card per person section. Prefer the exact class; fall back to any
  // section / div direct child so grouping-transformer output variations still
  // parse.
  let people = Array.from(element.querySelectorAll(':scope > section.cmp-experience-fragment--contributor'));
  if (!people.length) people = Array.from(element.querySelectorAll('section.cmp-experience-fragment--contributor'));
  if (!people.length) people = Array.from(element.querySelectorAll(':scope > section'));
  if (!people.length) people = Array.from(element.querySelectorAll(':scope > div'));

  const cells = [];

  people.forEach((person) => {
    // Cell 1: the real profile <img>, not the .cmp-image wrapper.
    const image = person.querySelector('.cmp-image img, img');

    // Name: distinguished from the role by heading level (h3 vs h5). The
    // `.cmp-title--black` marker is inconsistent across instances, so key off
    // the element, not the class. Build a clean heading to drop nested chrome.
    const nameEl = person.querySelector('h3.cmp-title__text, .cmp-title h3, h3');
    const nameText = nameEl ? nameEl.textContent.trim() : '';

    // Role / subtitle.
    const roleEl = person.querySelector('h5.cmp-title__text, .cmp-title h5, h5');
    const roleText = roleEl ? roleEl.textContent.trim() : '';

    // Social links: restrict to the button list, fall back to any cmp-button.
    let socialAnchors = Array.from(person.querySelectorAll('.cmp-buildingblock--btn-list a[href]'));
    if (!socialAnchors.length) socialAnchors = Array.from(person.querySelectorAll('a.cmp-button[href]'));

    // Skip a card only if it has neither image nor name.
    if (!image && !nameText) return;

    const textCell = [];

    if (nameText) {
      const heading = document.createElement('h3');
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

    // 2-column row: [image] | [name + role + social links]
    cells.push([image || '', textCell]);
  });

  // Empty-block guard: nothing extracted -> unwrap in place.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-profile', cells });
  element.replaceWith(block);
}
