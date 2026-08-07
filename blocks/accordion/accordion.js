/*
 * Accordion Block
 * Recreate an accordion
 * https://www.aem.live/developer/block-collection/accordion
 *
 * Note: this project ships a stripped @adobe/aem-boilerplate - scripts.js does
 * NOT export moveInstrumentation (it is xwalk-only and unneeded for a doc
 * project), so the vanilla import is intentionally dropped here.
 */

export default function decorate(block) {
  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);
    // decorate accordion item body
    const body = row.children[1];
    body.className = 'accordion-item-body';
    // decorate accordion item
    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
