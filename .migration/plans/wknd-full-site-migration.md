# WKND Homepage Migration Plan (`/us/en`)

> **Answer to your question:** you are on branch **`main`** (local `main` in sync with `origin/main` on GitHub `inf33138/capstone`, latest commit `7f9f1bd`).

## Overview
Migrate the WKND Adventures & Travel **homepage** (`https://wknd.site/us/en.html`) — currently an AEM Core Components (Sites) page — to **AEM Edge Delivery Services**. This is the first deliverable of the broader full-site migration; the homepage establishes the core reusable blocks (carousel, cards, teaser) that later templates reuse.

> **This is a plan only.** Execution (scraping, block creation, import) requires switching to **Execute mode**.

## Scope
**Homepage first.** Migrate `/us/en.html` end-to-end (content + styling + local preview parity). Global header/footer and remaining site templates follow in later passes (tracked under "Deferred" below).

## Homepage Structure → EDS Block Mapping

| # | Section | Source content | Proposed EDS block |
|---|---------|----------------|--------------------|
| 1 | **Header / Nav** | WKND logo, language selector (`en-US`), search, menu (Home, Magazine, Adventures, FAQs, About Us) | Global `header` (nav) — *done* |
| 2 | **Hero Carousel** | 3 slides: "WKND Adventures" + intro + *View Trips* CTA + bushland image; San Diego Surf Spots; Downhill Skiing Wyoming. Prev/Next + dots | `carousel-hero` |
| 3 | **Featured Article** | Eyebrow "Featured Article", heading "Camping in Western Australia", body, *Full Article* CTA, canyon image | `columns` |
| 4 | **Recent Articles** | Heading + 4 article cards; *All Articles* link | `cards` (query-index-driven) |
| 5 | **Divider + "Next Adventures"** | Separator + section heading | Section break / default-content heading |
| 6 | **Featured Adventure** | Heading "Climbing New Zealand", body, *See Trip* CTA, climbing image | `hero` |
| 7 | **Adventures Grid** | Heading "Where do you want to go?" + 4 trip cards; *All Trips* link | `cards` |
| 8 | **Footer** | Light logo, footer nav, "Follow Us" social icons, © 2019 + Adobe/AEM disclaimer | Global `footer` — *done* |

## Core Blocks (from this page)
- **carousel-hero** — hero (3 slides: image + heading + body + single CTA).
- **cards** — reused for the articles grid and adventures grid; the Recent Articles instance is **query-index-driven** (authored single-cell path `/us/en/magazine/query-index.json`, no hardcoded content, no fallback).
- **columns / hero** — image + eyebrow + heading + body + single CTA (Featured Article / Featured Adventure).

## Checklist

### Phase 0 — Prep
- [x] Fetch & render homepage; capture full structure
- [x] Map each section to an EDS block
- [x] Confirm scope (homepage first)

### Phase 1 — Block palette
- [x] Determine project type (doc / da / xwalk) and block-library endpoint
- [x] Survey local + Block Collection blocks; match sections to existing blocks or flag new
- [x] Model content structures for carousel, cards, teaser/columns

### Phase 2 — Homepage migration
- [x] Scrape `/us/en.html` (images, metadata, cleaned HTML)
- [x] Identify section boundaries; classify default content vs. blocks
- [x] Build page-template skeleton + block mappings
- [x] Generate import infrastructure + bundled import script
- [x] Run import → homepage content file
- [x] Preview locally and compare to original
- [x] Iterate block CSS/JS to match source

### Phase 3 — Chrome & dynamic content
- [x] Migrate global header/nav (logo, menu, language selector, search autocomplete)
- [x] Migrate global footer (logo, nav, social icons, copyright)
- [x] Apply homepage design tokens (serif titles, yellow accents) to global/block CSS
- [x] Make Recent Articles query-index-driven (magazine index, newest-first, no fallback) — verified on aem.live

### Phase 4 — QA & publish
- [x] Visual critique vs. original; fix gaps
- [x] Lint (`npm run lint`) clean
- [x] Verify internal links resolve
- [x] Push to `main`; Code Sync deployed; verified on `main--capstone--inf33138.aem.live`

## Deferred (later passes, full-site)
- Adventures listing + 16 adventure detail pages — **done** (migrated & published)
- Magazine listing + articles — **done** (separate PR)
- FAQs / About Us static pages — **done**
- Other locales (CA, CH, DE, FR, ES, IT) reusing the same templates — *not started*

## Open Decisions
- None outstanding for the homepage. Remaining work is the untouched **other-locale** rollout.

*Homepage migration is complete and live on `main` (`7f9f1bd`). To take on the deferred locale rollout, switch to Execute mode.*
