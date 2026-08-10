/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselAdventureParser from './parsers/carousel-adventure.js';
import adventureDetailsParser from './parsers/adventure-details.js';
import tabsParser from './parsers/tabs.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'adventure-detail',
  description: 'WKND individual adventure detail page: breadcrumb, image carousel, title, adventure details spec list + share links, and a tabbed Overview/Itinerary/What-to-Bring content section',
  urls: [
    'https://wknd.site/us/en/adventures/bali-surf-camp.html',
  ],
  blocks: [
    {
      name: 'carousel-adventure',
      instances: ['div.carousel.panelcontainer.cmp-carousel--mini'],
    },
    {
      name: 'adventure-details',
      instances: ['div.contentfragment.cmp-contentfragment--elements article.cmp-contentfragment'],
    },
    {
      name: 'tabs',
      instances: ['div.tabs.panelcontainer'],
    },
  ],
  sections: [
    { id: 'rc1', name: 'Breadcrumb', selector: 'div.breadcrumb.cmp-breadcrumb--fixed', style: null, blocks: [], defaultContent: ['nav.cmp-breadcrumb ol.cmp-breadcrumb__list'] },
    { id: 'rc2', name: 'Image Carousel', selector: 'div.carousel.panelcontainer.cmp-carousel--mini', style: null, blocks: ['carousel-adventure'], defaultContent: [] },
    { id: 'rc3', name: 'Title', selector: 'div.title.cmp-title--underline', style: null, blocks: [], defaultContent: ['div.title.cmp-title--underline h1'] },
    { id: 'rc4', name: 'Adventure Details', selector: 'div.contentfragment.cmp-contentfragment--elements article.cmp-contentfragment', style: null, blocks: ['adventure-details'], defaultContent: [] },
    { id: 'rc5', name: 'Tabbed Content', selector: 'div.tabs.panelcontainer', style: null, blocks: ['tabs'], defaultContent: [] },
  ],
};

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'carousel-adventure': carouselAdventureParser,
  'adventure-details': adventureDetailsParser,
  tabs: tabsParser,
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
