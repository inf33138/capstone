# WKND FAQs Page — Dynamic Query-Index Opportunities (`/us/en/faqs`)

## Overview
Assess where the **FAQs page** could be driven by an EDS **Query Index** (authored single-cell `cards` block naming a `query-index.json` path; index as single source of truth, no hardcoded fallback) vs. content that should stay authored inline.

> **Plan only.** Any block/index changes require **Execute mode**.

## FAQs Page Sections → Query-Index Suitability

| # | Section | Current | Query-Index candidate? |
|---|---------|---------|------------------------|
| 1 | **FAQs** H1 | Default-content heading | ❌ Not a grid — static |
| 2 | **Hero image** | Single image (default content) | ❌ Not a grid — static |
| 3 | **Intro paragraph** | Default-content text (justified) | ❌ Not a grid — static |
| 4 | **FAQ accordion** (7 Q&A) | `accordion` block, authored inline | ❌ **Not a fit** — Q&A pairs are authored page content, not a set of published pages. A query index indexes *pages*, not in-page rows. Keep authored. |
| 5 | **"Need more help?"** contact | Default-content heading + links | ❌ Not a grid — static |

## Verdict
**No dynamic query indexing applies to the FAQs page.** It has **no card grid of pages** — the only repeating structure is the FAQ accordion, whose items are in-page Q&A content (not published, indexable pages). Query indexing is for grids that list *pages* (articles, adventures), which this page doesn't contain.

The FAQ accordion is correctly authored inline. Making it "dynamic" would require modeling each Q&A as its own page + a FAQ index + an accordion-from-index block — a large, low-value inversion of a simple authored list. Not recommended.

## Checklist

### Assessment (done)
- [x] Review FAQs page sections (H1, hero image, intro, accordion, contact)
- [x] Determine query-index applicability → **none** (no page-list card grid on this page)

### Available next steps (require Execute mode) — optional / not recommended
- [ ] (Not recommended) Model each FAQ as a standalone page + build a FAQ query index + an accordion-from-index block, to drive the accordion dynamically
- [ ] (Out of scope here) Continue query-index rollout on pages that *do* have page-list grids (already done: homepage, magazine, adventures)

## Open Decisions
- None. The FAQs page has no query-index-suitable section; the accordion stays authored inline.

*The FAQs page has no card grid of pages, so dynamic query indexing does not apply here. The already-completed query-index work covers the pages that do have page grids (homepage, magazine listing, adventures listing). No action needed unless you explicitly want the not-recommended FAQ-from-index inversion — which would require Execute mode.*
