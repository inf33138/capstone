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

  // tools/importer/import-adventure-detail.js
  var import_adventure_detail_exports = {};
  __export(import_adventure_detail_exports, {
    default: () => import_adventure_detail_default
  });

  // tools/importer/parsers/carousel-adventure.js
  function parse(element, { document }) {
    const items = Array.from(element.querySelectorAll(".cmp-carousel__item"));
    const cells = [];
    items.forEach((item) => {
      const image = item.querySelector(".cmp-image__image, .cmp-image img, img");
      if (!image) return;
      cells.push([image, ""]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-adventure", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/adventure-details.js
  function parse2(element, { document }) {
    const specs = Array.from(
      element.querySelectorAll(".cmp-contentfragment__element")
    );
    const cells = [];
    specs.forEach((spec) => {
      const labelEl = spec.querySelector(".cmp-contentfragment__element-title, dt");
      const valueEl = spec.querySelector(".cmp-contentfragment__element-value, dd");
      const label = labelEl ? labelEl.textContent.trim() : "";
      const value = valueEl ? valueEl.textContent.trim() : "";
      if (!label || !value) return;
      cells.push([label, value]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "adventure-details", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs.js
  function collectPanelContent(panel) {
    const root = panel.querySelector("article.cmp-contentfragment, .cmp-contentfragment") || panel;
    const candidates = Array.from(
      root.querySelectorAll("p, ul, ol, img, h1, h2, h3, h4, h5, h6, blockquote")
    ).filter((node) => !node.closest(".cmp-contentfragment__title")).filter((node) => node.tagName === "IMG" || node.querySelector("img") || node.textContent.trim());
    return candidates.filter(
      (node) => !candidates.some((other) => other !== node && other.contains(node))
    );
  }
  function parse3(element, { document }) {
    const tabsRoot = element.querySelector(".cmp-tabs") || element;
    let tabLabels = Array.from(tabsRoot.querySelectorAll(":scope > .cmp-tabs__tablist > .cmp-tabs__tab"));
    if (!tabLabels.length) tabLabels = Array.from(element.querySelectorAll(".cmp-tabs__tab"));
    let panels = Array.from(tabsRoot.querySelectorAll(":scope > .cmp-tabs__tabpanel"));
    if (!panels.length) panels = Array.from(element.querySelectorAll(".cmp-tabs__tabpanel"));
    const cells = [];
    const rowCount = Math.max(tabLabels.length, panels.length);
    for (let i = 0; i < rowCount; i += 1) {
      const labelEl = tabLabels[i];
      const panel = panels[i];
      const label = labelEl ? labelEl.textContent.trim() : "";
      const content = panel ? collectPanelContent(panel) : [];
      if (!label && content.length === 0) continue;
      cells.push([label || "", content.length ? content : ""]);
    }
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      element.querySelectorAll(".tabs.panelcontainer").forEach((tabs) => {
        const isCategoryFilter = tabs.querySelector(".cmp-tabs__tabpanel .image-list");
        if (!isCategoryFilter) return;
        tabs.querySelectorAll(".cmp-tabs__tablist").forEach((el) => el.remove());
        tabs.querySelectorAll(".cmp-tabs__tabpanel:not(.cmp-tabs__tabpanel--active)").forEach((el) => el.remove());
      });
    }
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

  // tools/importer/import-adventure-detail.js
  var PAGE_TEMPLATE = {
    name: "adventure-detail",
    description: "WKND individual adventure detail page: breadcrumb, image carousel, title, adventure details spec list + share links, and a tabbed Overview/Itinerary/What-to-Bring content section",
    urls: [
      "https://wknd.site/us/en/adventures/bali-surf-camp.html"
    ],
    blocks: [
      {
        name: "carousel-adventure",
        instances: ["div.carousel.panelcontainer.cmp-carousel--mini"]
      },
      {
        name: "adventure-details",
        instances: ["div.contentfragment.cmp-contentfragment--elements article.cmp-contentfragment"]
      },
      {
        name: "tabs",
        instances: ["div.tabs.panelcontainer"]
      }
    ],
    sections: [
      { id: "rc1", name: "Breadcrumb", selector: "div.breadcrumb.cmp-breadcrumb--fixed", style: null, blocks: [], defaultContent: ["nav.cmp-breadcrumb ol.cmp-breadcrumb__list"] },
      { id: "rc2", name: "Image Carousel", selector: "div.carousel.panelcontainer.cmp-carousel--mini", style: null, blocks: ["carousel-adventure"], defaultContent: [] },
      { id: "rc3", name: "Title", selector: "div.title.cmp-title--underline", style: null, blocks: [], defaultContent: ["div.title.cmp-title--underline h1"] },
      { id: "rc4", name: "Adventure Details", selector: "div.contentfragment.cmp-contentfragment--elements article.cmp-contentfragment", style: null, blocks: ["adventure-details"], defaultContent: [] },
      { id: "rc5", name: "Tabbed Content", selector: "div.tabs.panelcontainer", style: null, blocks: ["tabs"], defaultContent: [] }
    ]
  };
  var parsers = {
    "carousel-adventure": parse,
    "adventure-details": parse2,
    tabs: parse3
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
  var import_adventure_detail_default = {
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
  return __toCommonJS(import_adventure_detail_exports);
})();
