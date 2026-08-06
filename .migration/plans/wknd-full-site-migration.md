# WKND Homepage Migration Plan (`/us/en`)

## Overview
Migrate the WKND Adventures & Travel **homepage** (`https://wknd.site/us/en.html`) — currently an AEM Core Components (Sites) page — to **AEM Edge Delivery Services**. This is the first deliverable of the broader full-site migration; the homepage establishes the core reusable blocks (carousel, cards, teaser) that later templates will reuse.

> **This is a plan only.** Execution (scraping, block creation, import) requires switching to **Execute mode**.

## Scope
**Homepage first.** Migrate `/us/en.html` end-to-end (content + styling + local preview parity). Global header/footer and remaining site templates follow in later passes (tracked under "Deferred" below).

## Homepage Structure → EDS Block Mapping

| # | Section | Source content | Proposed EDS block |
|---|---------|----------------|--------------------|
| 1 | **Header / Nav** | WKND logo, language selector (`en-US`), search, menu (Home, Magazine, Adventures, FAQs, About Us) | Global `header` (nav) — *deferred, but stub for preview* |
| 2 | **Hero Carousel** | 3 slides: "WKND Adventures" + intro + *View Trips* CTA + bushland image; San Diego Surf Spots; Downhill Skiing Wyoming. Prev/Next + dots | `carousel` |
| 3 | **Featured Article** | Eyebrow "Featured Article", heading "Camping in Western Australia", body, *Full Article* CTA, canyon image | `teaser` / `columns` (image + text + CTA) |
| 4 | **Recent Articles** | Heading + 4 article cards (LA Skateparks, Ski Touring, Arctic Surfing, San Diego Surf); *All Articles* link | `cards` |
| 5 | **Divider + "Next Adventures"** | Separator + section heading | Section break / default-content heading |
| 6 | **Featured Adventure** | Heading "Climbing New Zealand", body, *See Trip* CTA, climbing image | `teaser` / `columns` |
| 7 | **Adventures Grid** | Heading "Where do you want to go?" + 4 trip cards (Yosemite, Whistler, West Coast Cycling, Tahoe); *All Trips* link | `cards` |
| 8 | **Footer** | Light logo, footer nav, "Follow Us" social icons, © 2019 + Adobe/AEM disclaimer | Global `footer` — *deferred, but stub for preview* |

## Core Blocks to Model (from this page)
- **carousel** — hero (3 slides: image + heading + body + single CTA).
- **cards** — reused twice (articles grid and adventures grid); one block, section-styled variants.
- **teaser / columns** — image + eyebrow + heading + body + single CTA (used by Featured Article and Featured Adventure).

## Checklist

### Phase 0 — Prep (done)
- [x] Fetch & render homepage; capture full structure
- [x] Map each section to an EDS block
- [x] Confirm scope (homepage first)

### Phase 1 — Block palette
- [ ] Determine project type (doc / da / xwalk) and the project's block-library endpoint
- [ ] Survey local project blocks + Block Collection; match sections to existing `carousel`, `cards`, `columns/teaser` blocks or flag as new
- [ ] Model content structures for the 3 core blocks (carousel, cards, teaser)

### Phase 2 — Homepage migration
- [ ] Scrape `/us/en.html` (download & optimize images, extract metadata/title/description, cleaned HTML)
- [ ] Identify section boundaries; classify default content vs. blocks; validate block selection
- [ ] Build page-template skeleton + block mappings (DOM selectors) for the homepage
- [ ] Generate import infrastructure (parsers + transformers) and the bundled import script
- [ ] Run the import via the project's bulk-import script to produce the homepage content file
- [ ] Preview locally and compare against the original page
- [ ] Iterate block CSS/JS until the homepage visually matches the source

### Phase 3 — Chrome for preview parity
- [ ] Stub or migrate global **header/nav** (logo, menu, language selector) enough to render the homepage
- [ ] Stub or migrate global **footer** (logo, nav, social icons, copyright/disclaimer)
- [ ] Extract & apply homepage design tokens (colors, fonts, spacing) to `styles.css` / block CSS

### Phase 4 — QA & publish
- [ ] Full visual critique of the migrated homepage vs. original; fix gaps
- [ ] Lint (`npm run lint`) and run PageSpeed Insights on the feature preview; target 100
- [ ] Verify internal links (to `/adventures`, `/magazine`, detail pages) resolve or are stubbed
- [ ] Push feature branch, open PR with a preview link to the migrated homepage

## Deferred (later passes, full-site)
- Adventures listing + ~16 adventure detail pages (carousel hero, info-bar, tabs, related trips)
- Magazine listing + ~7 articles (byline, pull-quote, author bio, members-only gating)
- FAQs / About Us static pages
- Other locales (CA, CH, DE, FR, ES, IT) reusing the same templates

## Open Decisions (resolve at execution start)
- **Header/footer for the homepage:** full migration now, or a lightweight stub so the homepage renders in preview (recommended for "homepage first")?
- **Members-only handling** and **adventures filter** — only relevant to deferred templates; no impact on the homepage.

*Recommended next step: switch to Execute mode and begin Phase 1 (block palette) → Phase 2 (scrape & import the homepage).*
