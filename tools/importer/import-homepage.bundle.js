/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/carousel-hero.js
  function parse(element, { document }) {
    const items = Array.from(element.querySelectorAll(".cmp-carousel__item"));
    const cells = [];
    items.forEach((item) => {
      const image = item.querySelector(".cmp-teaser__image img, .cmp-image__image, img");
      const heading = item.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]');
      const description = item.querySelector('.cmp-teaser__description, [class*="description"]');
      const ctaLinks = Array.from(
        item.querySelectorAll(".cmp-teaser__action-link, .cmp-teaser__action-container a")
      );
      if (!image && !heading && !description && ctaLinks.length === 0) return;
      const textCell = [];
      if (heading) textCell.push(heading);
      if (description) textCell.push(description);
      ctaLinks.forEach((cta) => textCell.push(cta));
      cells.push([image || "", textCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function parse2(element, { document }) {
    const image = element.querySelector(".cmp-teaser__image img, .cmp-image__image, img");
    const eyebrow = element.querySelector('.cmp-teaser__pretitle, [class*="pretitle"], [class*="eyebrow"]');
    const heading = element.querySelector(".cmp-teaser__title, h1, h2, h3, h4");
    const description = element.querySelector('.cmp-teaser__description, [class*="description"]');
    const ctaLinks = Array.from(
      element.querySelectorAll(".cmp-teaser__action-link, .cmp-teaser__action-container a")
    );
    const textCell = [];
    if (eyebrow) textCell.push(eyebrow);
    if (heading) textCell.push(heading);
    if (description) textCell.push(description);
    ctaLinks.forEach((cta) => textCell.push(cta));
    if (textCell.length === 0 && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[image || "", textCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse3(element, { document }) {
    const items = Array.from(element.querySelectorAll(".cmp-image-list__item, li"));
    const cells = [];
    items.forEach((item) => {
      const image = item.querySelector(".cmp-image-list__item-image img, .cmp-image__image, img");
      const titleLink = item.querySelector(".cmp-image-list__item-title-link");
      const titleText = item.querySelector(".cmp-image-list__item-title");
      let heading = null;
      if (titleLink) {
        heading = document.createElement("h3");
        heading.append(titleLink);
      } else if (titleText) {
        heading = document.createElement("h3");
        heading.append(titleText);
      } else {
        heading = item.querySelector("h1, h2, h3, h4, h5, h6");
      }
      const description = item.querySelector('.cmp-image-list__item-description, [class*="description"]');
      if (!image && !heading && !description) return;
      const textCell = [];
      if (heading) textCell.push(heading);
      if (description) textCell.push(description);
      cells.push([image || "", textCell]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero.js
  function parse4(element, { document }) {
    const image = element.querySelector(".cmp-teaser__image img, .cmp-image__image, img");
    const heading = element.querySelector(".cmp-teaser__title, h1, h2, h3");
    const description = element.querySelector('.cmp-teaser__description, [class*="description"]');
    const ctaLinks = Array.from(
      element.querySelectorAll(".cmp-teaser__action-link, .cmp-teaser__action-container a")
    );
    if (!heading && !description && ctaLinks.length === 0 && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (image) cells.push([image]);
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);
    ctaLinks.forEach((cta) => contentCell.push(cta));
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.experiencefragment.cmp-experiencefragment--header",
        "footer.experiencefragment.cmp-experiencefragment--footer",
        "#toggleNav",
        "#mobileNav",
        "iframe",
        "meta"
      ]);
    }
  }

  // tools/importer/transformers/wknd-sections.js
  var TransformHook2 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function isLeadingTitle(el) {
    if (!el) return false;
    if (/^H[1-6]$/.test(el.tagName)) return true;
    return typeof el.matches === "function" && el.matches('.title, [class*="cmp-title"]');
  }
  function findTrailingTitle(container) {
    let node = container && container.lastElementChild;
    let depth = 0;
    while (node && depth < 8) {
      if (isLeadingTitle(node)) return node;
      if (!node.matches("div, main, section")) return null;
      node = node.lastElementChild;
      depth += 1;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.beforeTransform) return;
    const template = payload && payload.template;
    const sections = template && payload.template.sections;
    if (!sections || !Array.isArray(sections) || sections.length < 2) return;
    const doc = element.ownerDocument;
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section || !section.selector) continue;
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) {
        console.warn(`Section transformer: no element matched selector "${section.selector}" (section "${section.name || section.id}")`);
        continue;
      }
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        sectionEl.after(sectionMetadata);
      }
      if (i > 0) {
        let startEl = sectionEl;
        const prev = sectionEl.previousElementSibling;
        let trappedTitle = null;
        if (isLeadingTitle(prev)) {
          startEl = prev;
        } else if (trappedTitle = findTrailingTitle(prev)) {
          sectionEl.before(trappedTitle);
          startEl = trappedTitle;
        }
        if (startEl.previousElementSibling || startEl.parentElement) {
          const hr = doc.createElement("hr");
          startEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "WKND US/EN homepage: hero carousel, featured article teaser, recent articles card grid, featured adventure teaser, adventures card grid. Global header and footer are experience fragments.",
    urls: [
      "https://wknd.site/us/en.html"
    ],
    blocks: [
      {
        name: "carousel-hero",
        instances: ["div.carousel.cmp-carousel--hero"]
      },
      {
        name: "columns",
        instances: ["div.teaser.cmp-teaser--featured"],
        section: "highlight"
      },
      {
        name: "cards",
        instances: [
          "main.cmp-layout-container--fixed:nth-of-type(1) div.image-list.list",
          "main.cmp-layout-container--fixed:nth-of-type(2) div.image-list.list"
        ]
      },
      {
        name: "hero",
        instances: ["div.teaser.cmp-teaser--hero.cmp-teaser--imagebottom"]
      }
    ],
    sections: [
      { id: "rc2", name: "Hero Carousel", selector: "div.carousel.cmp-carousel--hero", style: null, blocks: ["carousel-hero"], defaultContent: [] },
      { id: "rc3", name: "Featured Article", selector: "div.teaser.cmp-teaser--featured", style: "highlight", blocks: ["columns"], defaultContent: [] },
      { id: "rc5", name: "Recent Articles", selector: "main.cmp-layout-container--fixed:nth-of-type(1) div.image-list.list", style: null, blocks: ["cards"], defaultContent: [] },
      { id: "rc9", name: "Featured Adventure", selector: "div.teaser.cmp-teaser--hero.cmp-teaser--imagebottom", style: null, blocks: ["hero"], defaultContent: [] },
      { id: "rc11", name: "Adventures Grid", selector: "main.cmp-layout-container--fixed:nth-of-type(2) div.image-list.list", style: null, blocks: ["cards"], defaultContent: [] }
    ]
  };
  var parsers = {
    "carousel-hero": parse,
    columns: parse2,
    cards: parse3,
    hero: parse4
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
