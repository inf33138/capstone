/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import accordionParser from './parsers/accordion.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'faqs',
  description: "WKND FAQs page: FAQs H1, hero image, intro paragraph, an accordion of 7 collapsible Q&A items, and a 'Need more help?' contact section. Global header and footer are experience fragments.",
  urls: [
    'https://wknd.site/us/en/faqs.html',
  ],
  blocks: [
    {
      name: 'accordion',
      instances: ['main div.accordion.panelcontainer'],
    },
  ],
  sections: [
    { id: 'rc2', name: 'FAQs Title', selector: 'main div.title.cmp-title--underline', style: null, blocks: [], defaultContent: ['main div.title.cmp-title--underline'] },
    { id: 'rc3', name: 'Hero Image', selector: 'main div.image.aem-GridColumn', style: null, blocks: [], defaultContent: ['main div.image.aem-GridColumn'] },
    { id: 'rc4', name: 'Intro Paragraph', selector: 'main div.text.aem-GridColumn', style: null, blocks: [], defaultContent: ['main div.text.aem-GridColumn'] },
    { id: 'rc5', name: 'FAQ Accordion', selector: 'main div.accordion.panelcontainer', style: null, blocks: ['accordion'], defaultContent: [] },
    { id: 'rc6', name: 'Need More Help', selector: 'main div.aem-GridColumn--default--3', style: null, blocks: [], defaultContent: ['main div.aem-GridColumn--default--3'] },
  ],
};

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  accordion: accordionParser,
};

// SHEET-DRIVEN ACCORDIONS: which `accordion` instances are backed by a data
// sheet (single source of truth) rather than hardcoded Q&A rows. Keyed by the
// block instance selector. The WKND source ships a hardcoded Q&A accordion, so
// scraping it would overwrite the authored single-cell sheet reference on every
// re-import. Emitting the sheet block instead keeps re-imports idempotent.
const ACCORDION_INDEX_GRIDS = {
  'main div.accordion.panelcontainer': { index: '/us/en/faqs/faqs.json' },
};

// TRANSFORMER REGISTRY - cleanup runs first, sections after
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // Already replaced by earlier parser
      // Sheet-driven accordions: emit a single-cell index block naming the data
      // sheet instead of scraping the hardcoded Q&A rows, so re-imports stay
      // idempotent (createBlock puts the name in the class; the one cell is the
      // sheet path the accordion block reads at runtime).
      const idx = block.name === 'accordion' && ACCORDION_INDEX_GRIDS[block.selector];
      if (idx) {
        block.element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'accordion', cells: [[idx.index]] }));
        return;
      }
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
