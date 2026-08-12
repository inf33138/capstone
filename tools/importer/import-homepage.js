/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselHeroParser from './parsers/carousel-hero.js';
import columnsParser from './parsers/columns.js';
import cardsParser from './parsers/cards.js';
import heroParser from './parsers/hero.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'WKND US/EN homepage: hero carousel, featured article teaser, recent articles card grid, featured adventure teaser, adventures card grid. Global header and footer are experience fragments.',
  urls: [
    'https://wknd.site/us/en.html',
  ],
  blocks: [
    {
      name: 'carousel-hero',
      instances: ['div.carousel.cmp-carousel--hero'],
    },
    {
      name: 'columns',
      instances: ['div.teaser.cmp-teaser--featured'],
      section: 'highlight',
    },
    {
      name: 'cards',
      instances: [
        'main.cmp-layout-container--fixed:nth-of-type(1) div.image-list.list',
        'main.cmp-layout-container--fixed:nth-of-type(2) div.image-list.list',
      ],
    },
    {
      name: 'hero',
      instances: ['div.teaser.cmp-teaser--hero.cmp-teaser--imagebottom'],
    },
  ],
  sections: [
    { id: 'rc2', name: 'Hero Carousel', selector: 'div.carousel.cmp-carousel--hero', style: null, blocks: ['carousel-hero'], defaultContent: [] },
    { id: 'rc3', name: 'Featured Article', selector: 'div.teaser.cmp-teaser--featured', style: 'highlight', blocks: ['columns'], defaultContent: [] },
    { id: 'rc5', name: 'Recent Articles', selector: 'main.cmp-layout-container--fixed:nth-of-type(1) div.image-list.list', style: null, blocks: ['cards'], defaultContent: [] },
    { id: 'rc9', name: 'Featured Adventure', selector: 'div.teaser.cmp-teaser--hero.cmp-teaser--imagebottom', style: null, blocks: ['hero'], defaultContent: [] },
    { id: 'rc11', name: 'Adventures Grid', selector: 'main.cmp-layout-container--fixed:nth-of-type(2) div.image-list.list', style: null, blocks: ['cards'], defaultContent: [] },
  ],
};

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'carousel-hero': carouselHeroParser,
  columns: columnsParser,
  cards: cardsParser,
  hero: heroParser,
};

// QUERY-INDEX GRIDS: the two homepage `cards` grids are dynamic (index-driven).
// The WKND source ships static image-lists here, so scraping them would
// overwrite the authored single-cell query-index blocks on every re-import.
// Emitting the index blocks instead makes the import idempotent.
//   1st cards instance = Recent Articles (magazine index, 4)
//   2nd cards instance = Where do you want to go? (adventures index, 4)
const CARD_INDEX_GRIDS = {
  'main.cmp-layout-container--fixed:nth-of-type(1) div.image-list.list': { index: '/us/en/magazine/query-index.json', limit: 4 },
  'main.cmp-layout-container--fixed:nth-of-type(2) div.image-list.list': { index: '/us/en/adventures/query-index.json', limit: 4 },
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
