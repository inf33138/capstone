# WKND Block Library Setup Plan

## Overview
Create an **EDS Block Library** so every block in this project is discoverable and insertable by authors from the AEM Sidekick's **Library** plugin. A block library is a `tools/sidekick/library.json` manifest that points to one or more **library documents** — authored pages that contain a live, copy-pasteable example of each block. Authors open the Library panel, browse the blocks, and paste a working instance into their page.

> **Plan only.** Building files + authoring library docs + publishing requires **Execute mode.**

## What exists now
- **14 blocks** in `blocks/`: `accordion, adventure-details, cards, cards-author, cards-profile, carousel-adventure, carousel-hero, columns, footer, fragment, header, hero, tabs, widget`
- Project type = **`doc`**; `.migration/project.json` already sets a `libraryUrl` pointing at the **boilerplate's** sidekick library (`sta-boilerplate`), not ours.
- **No** `tools/sidekick/library.json` and **no** library docs in the repo yet.
- Most blocks carry a `metadata.json` (name, content model, reuse guidance) — good source material for library descriptions.

## How an EDS Block Library works
1. **`tools/sidekick/library.json`** (committed to git) — lists library sources: a **Blocks** entry pointing to a document (or query-index) of block examples, optionally **Templates**, **Icons**, **Placeholders**.
2. **Library document(s)** in Document Authoring — one section per block variant. Each section = a heading naming the block + a live example of the block's authored table. This is what the Sidekick renders as insertable snippets.
3. **Sidekick config** must point `library` at our `library.json` (fix the `libraryUrl` so it targets `main--capstone--inf33138`, not the boilerplate).

## Blocks → library example content model (authored table each block expects)
| Block | Example cell(s) to author |
|-------|---------------------------|
| accordion | single cell → `/us/en/faqs/faqs.json` (index-driven) OR question/answer rows |
| cards | single cell → a `query-index.json` path (+ optional limit) |
| cards-author / cards-profile | image + name/role rows |
| carousel-hero / carousel-adventure | image slides |
| columns | 2-col teaser (image + text) |
| hero | image + heading + CTA |
| tabs | tab-label | panel rows |
| adventure-details | label | value spec rows |
| header / footer / fragment / widget | reference/nav — document as "auto/section" blocks, not author-inserted |

## Approach options (pick in Execute mode)
- **A — Single library doc (recommended):** one `/tools/sidekick/library` document, one section per block. Simplest to maintain; `library.json` references just that doc.
- **B — Query-index-driven library:** a `helix-query.yaml` index over a `/block-library/*` folder (one page per block) → `library.json` points at the index. Scales better, more setup.
- **C — Group by kind:** separate docs for Blocks vs Templates vs Placeholders. Only worth it if you also want template/placeholder libraries.

## Proposed steps (Execute mode)
1. Author a **library document** in DA (`/tools/sidekick/library`) — one section per author-insertable block (10 content blocks; header/footer/fragment/widget documented separately as non-insertable).
2. Pull each block's expected table from its `metadata.json` + the live `.plain.html` examples to build accurate snippets.
3. Create **`tools/sidekick/library.json`** referencing that library doc (Blocks source; add Templates/Placeholders sections if wanted).
4. Fix **`.migration/project.json`** `libraryUrl` → `https://main--capstone--inf33138.aem.page/tools/sidekick/library.json` (and add sidekick `library` config if a `.sidekick`/config file drives it).
5. Preview + publish the library doc + `library.json` to DA/aem.live.
6. Commit + push `tools/sidekick/library.json` (+ config) to `main`.
7. Verify: open Sidekick Library on a live page → all blocks listed, each snippet pastes a working block.

## Checklist

### Decisions needed (see question)
- [ ] Choose library structure: single doc (A) / query-index (B) / grouped (C)
- [ ] Confirm which blocks to expose as author-insertable (exclude header/footer/fragment/widget?)

### Build (requires Execute mode)
- [ ] Author `/tools/sidekick/library` doc — one section per insertable block
- [ ] Build each block's example table from `metadata.json` + live `.plain.html`
- [ ] Create `tools/sidekick/library.json` (Blocks source; optional Templates/Icons/Placeholders)
- [ ] Point `.migration/project.json` `libraryUrl` (+ sidekick config) at our site
- [ ] Preview + publish library doc + `library.json`
- [ ] Commit + push library config to `main`
- [ ] Verify in Sidekick Library on aem.live (all blocks list + paste correctly)

## Open Decisions
- Structure A/B/C and the insertable-block set — answering the question below drives the build.
