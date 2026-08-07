/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsProfileParser from './parsers/cards-profile.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-cleanup.js';
import profileGroupsTransformer from './transformers/wknd-profile-groups.js';
import sectionsTransformer from './transformers/wknd-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'about-us',
  description: "WKND About Us page: About Us H1, an 'Our Contributors' section (heading + intro + 4 person profile cards), and a 'WKND Guides' section (heading + intro + 3 person profile cards). Each person card = image + name + role + social links. A grouping transformer wraps each run of contributor experience-fragment sections into div.cards-profile--contributors / div.cards-profile--guides. Global header and footer are experience fragments.",
  urls: [
    'https://wknd.site/us/en/about-us.html',
  ],
  blocks: [
    {
      name: 'cards-profile',
      instances: ['main div.cards-profile--contributors', 'main div.cards-profile--guides'],
    },
  ],
  sections: [
    { id: 'rc2', name: 'About Us Title', selector: 'main div.title.aem-GridColumn:nth-of-type(1)', style: null, blocks: [], defaultContent: ['main div.title.aem-GridColumn:nth-of-type(1)'] },
    { id: 'rc3', name: 'Our Contributors Heading', selector: 'main div.title.cmp-title--underline.aem-GridColumn:nth-of-type(2)', style: null, blocks: [], defaultContent: ['main div.title.cmp-title--underline.aem-GridColumn:nth-of-type(2)'] },
    { id: 'rc4', name: 'Contributors Intro', selector: 'main div.text.cmp-text--font-small.aem-GridColumn:nth-of-type(3)', style: null, blocks: [], defaultContent: ['main div.text.cmp-text--font-small.aem-GridColumn:nth-of-type(3)'] },
    { id: 'rc4b', name: 'Contributors Grid', selector: 'main div.cards-profile--contributors', style: null, blocks: ['cards-profile'], defaultContent: [] },
    { id: 'rc5', name: 'WKND Guides Heading', selector: 'main div.title.cmp-title--underline.aem-GridColumn:nth-of-type(5)', style: null, blocks: [], defaultContent: ['main div.title.cmp-title--underline.aem-GridColumn:nth-of-type(5)'] },
    { id: 'rc6', name: 'Guides Intro', selector: 'main div.text.cmp-text--font-small.aem-GridColumn:nth-of-type(6)', style: null, blocks: [], defaultContent: ['main div.text.cmp-text--font-small.aem-GridColumn:nth-of-type(6)'] },
    { id: 'rc6b', name: 'Guides Grid', selector: 'main div.cards-profile--guides', style: null, blocks: ['cards-profile'], defaultContent: [] },
  ],
};

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'cards-profile': cardsProfileParser,
};

// TRANSFORMER REGISTRY - cleanup first, then group the profile cards, then sections.
// profileGroups must run before findBlocksOnPage so the cards-profile wrappers
// exist for the block selectors; it also runs before the section transformer so
// the grid section selectors (div.cards-profile--*) resolve.
const transformers = [
  cleanupTransformer,
  profileGroupsTransformer,
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

    // 1. beforeTransform (initial cleanup + profile grouping + section breaks)
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

    // 4. afterTransform (final cleanup)
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
