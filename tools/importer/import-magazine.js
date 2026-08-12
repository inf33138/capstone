/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsParser from './parsers/columns.js';
import cardsParser from './parsers/cards.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'magazine',
  description: "WKND magazine listing page: page title, featured article teaser, 'All Articles' image-list card grid, and a 'Members Only' promo section with heading and text. Global header and footer are experience fragments.",
  urls: [
    'https://wknd.site/us/en/magazine.html',
  ],
  blocks: [
    {
      name: 'columns',
      instances: ['main div.teaser.cmp-teaser--featured'],
    },
    {
      name: 'cards',
      instances: ['main div.image-list.list'],
    },
  ],
  sections: [
    { id: 'rc2', name: 'Magazine Title', selector: 'main div.title.aem-GridColumn:nth-of-type(1)', style: null, blocks: [], defaultContent: ['main div.title.aem-GridColumn:nth-of-type(1)'] },
    { id: 'rc3', name: 'Featured Article', selector: 'main div.teaser.cmp-teaser--featured', style: 'highlight', blocks: ['columns'], defaultContent: [] },
    { id: 'rc4', name: 'All Articles Title', selector: 'main div.title.cmp-title--underline:nth-of-type(3)', style: null, blocks: [], defaultContent: ['main div.title.cmp-title--underline:nth-of-type(3)'] },
    { id: 'rc5', name: 'All Articles Grid', selector: 'main div.image-list.list', style: null, blocks: ['cards'], defaultContent: [] },
    { id: 'rc6', name: 'Members Only Title', selector: 'main div.title.cmp-title--underline:nth-of-type(5)', style: null, blocks: [], defaultContent: ['main div.title.cmp-title--underline:nth-of-type(5)'] },
    { id: 'rc7', name: 'Members Only Text', selector: 'main div.text', style: null, blocks: [], defaultContent: ['main div.text'] },
    { id: 'rc8', name: 'Trailing Separator', selector: 'main div.separator.cmp-separator--space-medium', style: null, blocks: [], defaultContent: ['main div.separator.cmp-separator--space-medium'] },
  ],
};

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  columns: columnsParser,
  cards: cardsParser,
};

// QUERY-INDEX GRIDS: which `cards` instances are dynamic (index-driven) rather
// than hardcoded. Keyed by the block instance selector. The WKND source ships a
// static image-list here, so scraping it would overwrite the authored
// single-cell query-index block on every re-import. Emitting the index block
// instead makes the import idempotent. `limit` is optional (omit = all).
const CARD_INDEX_GRIDS = {
  'main div.image-list.list': { index: '/us/en/magazine/query-index.json' },
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
      // Query-index-driven grids: emit a single-cell index block instead of
      // scraping the hardcoded cards, so re-imports stay idempotent.
      const idx = block.name === 'cards' && CARD_INDEX_GRIDS[block.selector];
      if (idx) {
        // createBlock puts the name in the block's class; cells are the rows.
        // Row 1 = index path, optional row 2 = limit (the authored contract
        // readAuthoredIndexSource expects). Do NOT add a literal name row.
        const cells = [[idx.index]];
        if (idx.limit) cells.push([String(idx.limit)]);
        block.element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'cards', cells }));
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
