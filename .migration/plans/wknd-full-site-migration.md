# WKND — Where the Dynamic Query-Indexing Changes Live

## Overview
A map of every piece of the **dynamic query-index** work delivered across the WKND migration — the code, the index config, and the authored blocks — so you can find each part. Dynamic query indexing = an authored `cards` block whose single cell names a `query-index.json` path; at runtime the block fetches that index and renders the newest N entries (index = single source of truth, no hardcoded fallback).

> **Plan/inventory only** — this is a locator, not new work. No changes needed.

## 1. Index configuration — `helix-query.yaml`
Defines the three published indices the dynamic grids read from:

| Index | Target JSON | Feeds |
|-------|-------------|-------|
| `pages` | `/query-index.json` | Header **search autocomplete** (site-wide, title + description) |
| `adventures` | `/us/en/adventures/query-index.json` | Adventures listing **"Current Adventures"** grid (16 detail pages) |
| `magazine` | `/us/en/magazine/query-index.json` | Homepage **"Recent Articles"** + magazine **"All Articles"** (title, description, image, publishedDate) |

## 2. Runtime rendering logic — `blocks/cards/cards.js`
The engine that turns an authored index reference into a live card grid:
- **`readAuthoredIndexSource(block)`** (line ~193) — detects an authored single-cell block naming a `query-index.json` path (text or link); optional 2nd cell = numeric limit. This is the **preferred, index-as-source-of-truth** path.
- **`CARD_INDEX_SOURCES`** (line ~122) — legacy heading-based mapping (`recent articles` → magazine index, limit 4).
- **`populateFromIndex(block)`** (line ~223) — fetches the index, renders entries; for an authored index block it clears the cell if the index is empty/unreachable (no stray fallback card).
- **`renderIndexCards()`** (line ~147) — builds `[image][body]` rows, sorted by `publishedDate` newest-first.
- **`resolveContentPath()`** (line ~133) — rebases paths for dev vs preview/live.
- **`addAdventureFilters()` / `truncateCardDescriptions()`** — the category filter tabs + description truncation layered on top.

## 3. Search autocomplete — `blocks/header/header.js`
Uses the site-wide `/query-index.json` (via the `pages` index) to power the header search suggestions dropdown.

## 4. The authored index blocks — **in Document Authoring (da.live), not in git**
This is the key thing to know about "where they are": the single-cell `cards` blocks that *name* the index paths are **authored content**, published to the live site through Document Authoring. They are **not** in the local `content/` mirror — a grep of `content/` for `query-index.json` returns nothing because that folder holds the pre-index import snapshots. The live authored docs carrying the index blocks are:
- Homepage `/us/en` — **"Recent Articles"** + **"Where do you want to go?"** grids
- Magazine `/us/en/magazine` — **"All Articles"** grid
- Adventures `/us/en/adventures` — **"Current Adventures"** grid

## Where each dynamic grid ends up (live)
| Page | Grid | Index used | State |
|------|------|-----------|-------|
| Homepage | Recent Articles | `/us/en/magazine/query-index.json` | ✅ live |
| Homepage | Where do you want to go? | `/us/en/adventures/query-index.json` | ✅ live |
| Magazine | All Articles | `/us/en/magazine/query-index.json` | ✅ live |
| Adventures | Current Adventures | `/us/en/adventures/query-index.json` | ✅ live |
| Header (all pages) | Search autocomplete | `/query-index.json` | ✅ live |
| **FAQs** | — | — | ❌ n/a (no page-list grid) |

## Checklist

### Where to look (reference)
- [x] Index config → `helix-query.yaml` (3 indices: pages, adventures, magazine)
- [x] Render engine → `blocks/cards/cards.js` (`readAuthoredIndexSource`, `populateFromIndex`, `renderIndexCards`)
- [x] Search autocomplete → `blocks/header/header.js` (reads `/query-index.json`)
- [x] Authored index blocks → **Document Authoring (da.live)** on homepage, magazine, adventures — *not* in the git `content/` mirror
- [x] FAQs page → no dynamic query indexing (no card-grid of pages)

### Optional verification (requires Execute mode)
- [ ] Confirm live row counts per index (`curl` each `query-index.json` on `aem.live`)
- [ ] Confirm each live page's grid serves an index block (fetch `.plain.html` and check for the single-cell `cards` block)

## Open Decisions
- None — this is a locator for existing, deployed work. Say the word (and switch to Execute mode) if you want me to run the live verification checks above or add a dynamic grid to another page.

*Your dynamic query-indexing changes live in three places: `helix-query.yaml` (index definitions), `blocks/cards/cards.js` + `blocks/header/header.js` (runtime logic), and the authored single-cell blocks in Document Authoring on the homepage/magazine/adventures pages (not in the git `content/` folder). The FAQs page has none because it has no page-list grid.*
