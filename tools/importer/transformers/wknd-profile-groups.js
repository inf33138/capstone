/* eslint-disable */
/* global WebImporter */

/**
 * WKND profile-group transformer (About Us page).
 *
 * The About Us page renders each contributor / guide as a standalone
 * experience-fragment `section.cmp-experience-fragment--contributor`. All 7
 * cards are flat siblings in one grid with NO per-grid wrapper; the two logical
 * groups ("Our Contributors" = first 4, "WKND Guides" = last 3) are separated
 * only by the intervening title/text components in document order.
 *
 * To give the cards-profile parser a single element per grid to convert, this
 * transformer (beforeTransform, so it runs before parsing) groups each
 * CONSECUTIVE run of contributor sections into a wrapper div:
 *   - the first run  -> div.cards-profile.cards-profile--contributors
 *   - the next run   -> div.cards-profile.cards-profile--guides
 * (runs beyond the second reuse the --guides class; WKND only has two.)
 *
 * A "run" ends when a non-contributor sibling (a title/text section) appears
 * between cards, which is exactly how the two groups are delimited. Guarded to
 * the contributor sections, so pages without them are untouched.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

const GROUP_CLASSES = ['cards-profile--contributors', 'cards-profile--guides'];

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.beforeTransform) return;

  const cards = [...element.querySelectorAll('section.cmp-experience-fragment--contributor')];
  if (!cards.length) return; // not the About Us page

  const doc = element.ownerDocument;

  // 1. Compute groups from the ORIGINAL DOM adjacency, BEFORE moving anything.
  //    A card starts a new group when its previous element sibling is not also
  //    a contributor card (i.e. a title/intro section separates the two runs).
  //    Computing membership up front avoids the trap of reading
  //    `nextElementSibling` after a card has already been detached into a
  //    wrapper (which would put every card in its own group).
  const groups = [];
  cards.forEach((card) => {
    const prevEl = card.previousElementSibling;
    const prevIsCard = prevEl
      && prevEl.matches && prevEl.matches('section.cmp-experience-fragment--contributor');
    if (!prevIsCard || groups.length === 0) {
      groups.push([card]);
    } else {
      groups[groups.length - 1].push(card);
    }
  });

  // 2. Create one wrapper per group and move its cards in.
  groups.forEach((group, gi) => {
    const wrapper = doc.createElement('div');
    const groupClass = GROUP_CLASSES[Math.min(gi, GROUP_CLASSES.length - 1)];
    wrapper.className = `cards-profile ${groupClass}`;
    group[0].before(wrapper);
    group.forEach((card) => wrapper.append(card));
  });
}
