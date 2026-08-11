# WKND Magazine Page — Dynamic Query-Index Opportunities (`/us/en/magazine`)

## Overview
Identify where the **magazine listing page** can be driven by an EDS **Query Index** (authored single-cell `cards` block naming a `query-index.json` path; index is the single source of truth, no hardcoded fallback) instead of hardcoded content.

> **Plan only.** Authoring the blocks + any index/config changes requires **Execute mode**.

## Magazine Page Sections → Query-Index Suitability

| # | Section | Current | Query-Index candidate? |
|---|---------|---------|------------------------|
| 1 | **Featured Article** (`columns`) | Hardcoded single teaser ("Camping in Western Australia") | ⚠️ Possible but low value — it's a single curated teaser in a `columns` block, not a `cards` grid. Would need a "featured" flag in the index + block support. |
| 2 | **All Articles** (`cards`) | ✅ **Already query-index-driven** — single cell `/us/en/magazine/query-index.json` (4 articles, no fallback). Verified live. | ✅ Done |
| 3 | **Members Only** heading + text | Static default content | ❌ Not a card grid — leave static |
| 4 | **Members teasers** (Alaskan Adventure, Fly Fishing the Amazon) | Hardcoded 2 promo cards | ⚠️ Candidate — could be query-index-driven from a "members" index if those pages get migrated + indexed |

## Where dynamic query indexing applies
- **Primary (done):** the **"All Articles"** grid — already reads `/us/en/magazine/query-index.json`.
- **Optional next:** the **"Members Only"** promo cards — drive from a members index once those articles are migrated (currently just static teasers, targets not migrated).
- **Not applicable:** Featured Article (single teaser) and Members Only heading/text (default content).

## Prerequisites / gaps
- Magazine index currently holds **4** articles (LA Skateparks, Ski Touring, Arctic Surfing, San Diego Surf). **Western Australia** shows in the source but its article page isn't migrated (404) → absent from index. To include it, migrate + publish that article so it's indexed.
- Members-only articles (Alaskan Adventure, Fly Fishing the Amazon) are not migrated → no index rows yet.

## Checklist

### Done
- [x] "All Articles" grid converted to query-index block (`/us/en/magazine/query-index.json`), no fallback — verified on aem.live
- [x] Magazine query index live with 4 article rows (title, description, image, publishedDate, category)

### Available next steps (require Execute mode)
- [ ] Migrate + publish the **Western Australia** article so it joins the magazine index (then it appears in "All Articles" automatically)
- [ ] (Optional) Migrate the two **Members Only** articles + add a members query index, then convert the members promo section to a query-index `cards` block
- [ ] (Optional) Add a **featured** flag to the index + drive the Featured Article teaser from it (only if a dynamic featured slot is wanted over a curated one)

## Open Decisions
- Include **Western Australia** in "All Articles"? Requires migrating that article page first.
- Make **Members Only** promos dynamic? Requires migrating those articles + a members index.

*The magazine page's main list ("All Articles") is already query-index-driven and live. The remaining candidates depend on migrating not-yet-imported articles first — switch to Execute mode to proceed.*
