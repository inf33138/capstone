/* eslint-disable */
/* global WebImporter */

/**
 * WKND section transformer.
 *
 * Adds EDS section boundaries and section-metadata blocks derived from the
 * template's `sections` array (tools/importer/page-templates.json). The WKND
 * homepage has 5 content sections:
 *
 *   1. Hero Carousel     div.carousel.cmp-carousel--hero                        (first, no <hr>)
 *   2. Featured Article  div.teaser.cmp-teaser--featured                        (style: highlight)
 *   3. Recent Articles   main.cmp-layout-container--fixed:nth-of-type(1) div.image-list.list
 *   4. Featured Adventure div.teaser.cmp-teaser--hero.cmp-teaser--imagebottom
 *   5. Adventures Grid   main.cmp-layout-container--fixed:nth-of-type(2) div.image-list.list
 *
 * All selectors come from payload.template.sections (validated against
 * migration-work/cleaned.html). For each non-first section a section break
 * (<hr>) is inserted before its start element; for each section with a `style`
 * a Section Metadata block is inserted after its start element. Sections are
 * processed in reverse order so that inserted nodes never shift the position of
 * a not-yet-processed section's start element.
 *
 * Runs in beforeTransform: the block parsers run AFTER this hook and replace
 * each section's source element in place (element.replaceWith), so matching the
 * original section selectors must happen while those elements still exist. The
 * inserted <hr> / Section Metadata nodes do not match any block-instance
 * selector, so they are untouched by the parsers and survive into the output.
 *
 * Heading-aware opening break: several WKND sections are introduced by a CMS
 * title component (div.title > … > h2/h3) that is a previous sibling of the
 * block element. The section break must open BEFORE that heading so the heading
 * stays grouped with its block, not with the preceding section.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

// Is el a SHALLOW leading title for its section? Used to keep a section's intro
// heading grouped with its block. Deliberately does NOT use a descendant
// querySelector: a large grid/container wrapper that merely *contains* a heading
// somewhere deep inside must NOT qualify, or the section break gets hoisted in
// front of the whole preceding container (merging sections / creating empties).
function isLeadingTitle(el) {
  if (!el) return false;
  if (/^H[1-6]$/.test(el.tagName)) return true;
  // AEM Core Components title component: div.title / div.cmp-title--*.
  return typeof el.matches === 'function' && el.matches('.title, [class*="cmp-title"]');
}

// Walk down the lastElementChild chain of `container` looking for a title that
// is trapped as its trailing descendant (an intro heading that visually opens
// the NEXT section but lives at the tail of the previous container's subtree).
// Returns the title element, or null. Bounded depth guards against runaway DOM.
function findTrailingTitle(container) {
  let node = container && container.lastElementChild;
  let depth = 0;
  while (node && depth < 8) {
    if (isLeadingTitle(node)) return node;
    // Only keep descending while the tail is a pure structural wrapper
    // (a title/heading is a leaf-ish component; a grid/container is a wrapper).
    if (!node.matches('div, main, section')) return null;
    node = node.lastElementChild;
    depth += 1;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.beforeTransform) return;

  const template = payload && payload.template;
  const sections = template && payload.template.sections;
  if (!sections || !Array.isArray(sections) || sections.length < 2) return;

  const doc = element.ownerDocument;

  // Reverse order: inserting <hr>/Section Metadata for a later section must not
  // move the start element of an earlier (not-yet-processed) section.
  for (let i = sections.length - 1; i >= 0; i -= 1) {
    const section = sections[i];
    if (!section || !section.selector) continue;

    const sectionEl = element.querySelector(section.selector);
    if (!sectionEl) {
      // eslint-disable-next-line no-console
      console.warn(`Section transformer: no element matched selector "${section.selector}" (section "${section.name || section.id}")`);
      continue;
    }

    // Section Metadata block closes the section — insert AFTER its start element.
    if (section.style) {
      const sectionMetadata = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      sectionEl.after(sectionMetadata);
    }

    // Section break opens every section except the first — insert BEFORE its
    // start element (or its intro title, when one belongs to this section).
    if (i > 0) {
      let startEl = sectionEl;
      const prev = sectionEl.previousElementSibling;
      let trappedTitle = null;
      if (isLeadingTitle(prev)) {
        // Case A: the intro title is a direct sibling immediately before the block.
        startEl = prev;
      } else if ((trappedTitle = findTrailingTitle(prev))) {
        // Case B: the intro title is trapped as the trailing descendant of the
        // preceding container (WKND "Next Adventures" sits at the end of the
        // Recent Articles layout container, while the hero banner is that
        // container's sibling). Lift it out so it opens THIS section instead of
        // closing the previous one.
        sectionEl.before(trappedTitle);
        startEl = trappedTitle;
      }
      if (startEl.previousElementSibling || startEl.parentElement) {
        const hr = doc.createElement('hr');
        startEl.before(hr);
      }
    }
  }
}
