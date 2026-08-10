/*
 * Adventure Details Block
 * A small key/value specification block rendered as a definition list.
 * Used for the WKND adventure detail spec panel
 * (Activity, Adventure Type, Trip Length, Group Size, Difficulty, Price).
 *
 * Content model:
 *   - First row: block name 'adventure-details'.
 *   - Each subsequent row: 2 cells -> [label] | [value].
 *
 * This is a bespoke block (no Block Collection base) - authors enter a label
 * and a value per row and the block emits a semantic <dl> of <dt>/<dd> pairs.
 *
 * Note: this project ships a stripped @adobe/aem-boilerplate - only plain DOM
 * APIs are used, so no aem.js/scripts.js import is required (moveInstrumentation
 * and fetchPlaceholders are not exported here).
 */

export default function decorate(block) {
  const dl = document.createElement('dl');
  dl.className = 'adventure-details-list';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;

    const [labelCell, valueCell] = cells;

    const dt = document.createElement('dt');
    dt.className = 'adventure-details-label';
    dt.append(...labelCell.childNodes);

    const dd = document.createElement('dd');
    dd.className = 'adventure-details-value';
    dd.append(...valueCell.childNodes);

    const group = document.createElement('div');
    group.className = 'adventure-details-item';
    group.append(dt, dd);
    dl.append(group);
  });

  block.replaceChildren(dl);
}
