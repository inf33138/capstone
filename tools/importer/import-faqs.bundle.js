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

  // tools/importer/import-faqs.js
  var import_faqs_exports = {};
  __export(import_faqs_exports, {
    default: () => import_faqs_default
  });

  // tools/importer/parsers/accordion.js
  function parse(element, { document }) {
    const items = Array.from(element.querySelectorAll(".cmp-accordion__item"));
    const cells = [];
    items.forEach((item) => {
      const titleEl = item.querySelector('.cmp-accordion__title, [class*="accordion__title"]');
      let question = "";
      if (titleEl) {
        question = titleEl.textContent.trim();
      } else {
        const button = item.querySelector(".cmp-accordion__button, button");
        if (button) {
          const clone = button.cloneNode(true);
          clone.querySelectorAll('.cmp-accordion__icon, [class*="icon"], svg').forEach((chrome) => chrome.remove());
          question = clone.textContent.trim();
        }
      }
      const panel = item.querySelector('.cmp-accordion__panel, [class*="accordion__panel"]');
      const answerCell = [];
      if (panel) {
        const textEls = Array.from(panel.querySelectorAll(".cmp-text"));
        if (textEls.length) {
          textEls.forEach((textEl) => answerCell.push(textEl));
        } else {
          Array.from(panel.children).forEach((child) => answerCell.push(child));
        }
      }
      if (!question && answerCell.length === 0) return;
      cells.push([question || "", answerCell.length ? answerCell : ""]);
    });
    if (cells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      element.querySelectorAll(".tabs.panelcontainer .cmp-tabs__tablist").forEach((el) => el.remove());
      element.querySelectorAll(".tabs.panelcontainer .cmp-tabs__tabpanel:not(.cmp-tabs__tabpanel--active)").forEach((el) => el.remove());
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

  // tools/importer/import-faqs.js
  var PAGE_TEMPLATE = {
    name: "faqs",
    description: "WKND FAQs page: FAQs H1, hero image, intro paragraph, an accordion of 7 collapsible Q&A items, and a 'Need more help?' contact section. Global header and footer are experience fragments.",
    urls: [
      "https://wknd.site/us/en/faqs.html"
    ],
    blocks: [
      {
        name: "accordion",
        instances: ["main div.accordion.panelcontainer"]
      }
    ],
    sections: [
      { id: "rc2", name: "FAQs Title", selector: "main div.title.cmp-title--underline", style: null, blocks: [], defaultContent: ["main div.title.cmp-title--underline"] },
      { id: "rc3", name: "Hero Image", selector: "main div.image.aem-GridColumn", style: null, blocks: [], defaultContent: ["main div.image.aem-GridColumn"] },
      { id: "rc4", name: "Intro Paragraph", selector: "main div.text.aem-GridColumn", style: null, blocks: [], defaultContent: ["main div.text.aem-GridColumn"] },
      { id: "rc5", name: "FAQ Accordion", selector: "main div.accordion.panelcontainer", style: null, blocks: ["accordion"], defaultContent: [] },
      { id: "rc6", name: "Need More Help", selector: "main div.aem-GridColumn--default--3", style: null, blocks: [], defaultContent: ["main div.aem-GridColumn--default--3"] }
    ]
  };
  var parsers = {
    accordion: parse
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
  var import_faqs_default = {
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
  return __toCommonJS(import_faqs_exports);
})();
