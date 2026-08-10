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

  // tools/importer/import-magazine-article.js
  var import_magazine_article_exports = {};
  __export(import_magazine_article_exports, {
    default: () => import_magazine_article_default
  });

  // tools/importer/parsers/cards-author.js
  function socialLabel(a) {
    const textSpan = a.querySelector(".cmp-button__text");
    if (textSpan && textSpan.textContent.trim()) return textSpan.textContent.trim();
    const icon = a.querySelector('[class*="cmp-button__icon--"]');
    if (icon) {
      const match = icon.className.match(/cmp-button__icon--([a-z]+)/i);
      if (match) return match[1].charAt(0).toUpperCase() + match[1].slice(1);
    }
    const aria = (a.getAttribute("aria-label") || "").trim();
    if (aria) return aria;
    const title = (a.getAttribute("title") || "").trim();
    if (title) return title;
    return a.textContent.trim();
  }
  function parse(element, { document }) {
    const byline = element.querySelector(".cmp-byline") || element;
    const image = byline.querySelector(".cmp-byline__image img, .cmp-image img, img");
    const nameEl = byline.querySelector("h2.cmp-byline__name, .cmp-byline__name, h2, h3");
    const nameText = nameEl ? nameEl.textContent.trim() : "";
    const roleEl = byline.querySelector("p.cmp-byline__occupations, .cmp-byline__occupations, p");
    const roleText = roleEl ? roleEl.textContent.trim() : "";
    let socialAnchors = Array.from(element.querySelectorAll(".cmp-buildingblock--btn-list a[href]"));
    if (!socialAnchors.length) socialAnchors = Array.from(element.querySelectorAll("a.cmp-button[href]"));
    if (!image && !nameText) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const textCell = [];
    if (nameText) {
      const heading = document.createElement("h2");
      heading.textContent = nameText;
      textCell.push(heading);
    }
    if (roleText) {
      const roleP = document.createElement("p");
      roleP.textContent = roleText;
      textCell.push(roleP);
    }
    socialAnchors.forEach((src) => {
      const href = src.getAttribute("href");
      const label = socialLabel(src);
      const link = document.createElement("a");
      if (href) link.setAttribute("href", href);
      link.textContent = label || href || "";
      textCell.push(link);
    });
    const cells = [[image || "", textCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-author", cells });
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

  // tools/importer/import-magazine-article.js
  var PAGE_TEMPLATE = {
    name: "magazine-article",
    description: "WKND magazine article detail page: optional full-width hero image, breadcrumb (Magazine > article title), H1 article title, H4 byline, long-form article body (paragraphs, pull-quote blockquotes, H2 subheadings, inline images, image-with-caption, address paragraphs), an author-bio block (separator + author name/role + social links), and a sidebar column (SHARE THIS STORY, optional Download PDF, related-articles list). Global header and footer are experience fragments.",
    urls: [
      "https://wknd.site/us/en/magazine/guide-la-skateparks.html",
      "https://wknd.site/us/en/magazine/ski-touring.html",
      "https://wknd.site/us/en/magazine/arctic-surfing.html",
      "https://wknd.site/us/en/magazine/san-diego-surf.html"
    ],
    blocks: [
      {
        name: "cards-author",
        instances: ["main main div.experiencefragment"]
      }
    ],
    sections: [
      { id: "rc2", name: "Article", selector: "main.container.responsivegrid.cmp-layout-container--fixed", style: null, blocks: [], defaultContent: ["main div.image.aem-GridColumn", "main div.breadcrumb.aem-GridColumn", "main main.container.responsivegrid"] },
      { id: "rc3", name: "Author Bio", selector: "main main div.experiencefragment", style: null, blocks: ["cards-author"], defaultContent: [] },
      { id: "rc4", name: "Sidebar", selector: "main aside.cmp-layoutcontainer--sidebar", style: "sidebar", blocks: [], defaultContent: ["main aside.cmp-layoutcontainer--sidebar"] }
    ]
  };
  var parsers = {
    "cards-author": parse
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
  var import_magazine_article_default = {
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
  return __toCommonJS(import_magazine_article_exports);
})();
