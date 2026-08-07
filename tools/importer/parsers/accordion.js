/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion
 * Base block: accordion
 * Source: https://wknd.site/us/en/faqs.html (main div.accordion.panelcontainer)
 * Generated: 2026-08-07
 *
 * Library convention (accordion): 2 columns, multiple rows. First row is the
 * block name. Each subsequent row = one accordion item:
 *   cell 1 -> title (mandatory)   — the clickable question/label
 *   cell 2 -> content (mandatory) — the answer body revealed when expanded
 *
 * Source: `div.accordion.panelcontainer` > `.cmp-accordion` > N x
 * `.cmp-accordion__item`. Each item has:
 *   - header: `h3.cmp-accordion__header > button.cmp-accordion__button` holding
 *     `span.cmp-accordion__title` (the QUESTION text) plus a trailing
 *     `span.cmp-accordion__icon` toggle chrome — strip the icon, keep only text.
 *   - panel: `.cmp-accordion__panel` wrapping the ANSWER inside
 *     `.container > .cmp-container > .text > .cmp-text` (<p>, etc.).
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.cmp-accordion__item'));

  const cells = [];

  items.forEach((item) => {
    // --- Question (cell 1) ---
    // The dedicated title span carries only the question text (no icon chrome).
    const titleEl = item.querySelector('.cmp-accordion__title, [class*="accordion__title"]');
    let question = '';
    if (titleEl) {
      question = titleEl.textContent.trim();
    } else {
      // Fallback: use the button text but drop the toggle-icon / non-text chrome.
      const button = item.querySelector('.cmp-accordion__button, button');
      if (button) {
        const clone = button.cloneNode(true);
        clone
          .querySelectorAll('.cmp-accordion__icon, [class*="icon"], svg')
          .forEach((chrome) => chrome.remove());
        question = clone.textContent.trim();
      }
    }

    // --- Answer (cell 2) ---
    // Preserve the inner HTML of the panel. Prefer the actual text wrappers
    // (`.cmp-text`) so the boilerplate container divs are dropped; fall back to
    // the panel's own children if the expected structure is missing.
    const panel = item.querySelector('.cmp-accordion__panel, [class*="accordion__panel"]');
    const answerCell = [];
    if (panel) {
      const textEls = Array.from(panel.querySelectorAll('.cmp-text'));
      if (textEls.length) {
        textEls.forEach((textEl) => answerCell.push(textEl));
      } else {
        Array.from(panel.children).forEach((child) => answerCell.push(child));
      }
    }

    // Skip an item only if BOTH question and answer are empty.
    if (!question && answerCell.length === 0) return;

    // 2-column row: [question text] | [answer content]
    cells.push([question || '', answerCell.length ? answerCell : '']);
  });

  // Empty-block guard: nothing extracted -> unwrap in place.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
