# Import `/us/en` Homepage Into Root `index` (`/`)

## Goal
Replace the AEM boilerplate placeholder at the site root (`inf33138/capstone/index` → served at `/`) with the **real WKND homepage content** currently at **`/us/en`**, so `https://main--capstone--inf33138.aem.live/` renders the homepage directly.

> **Approach change:** earlier you leaned toward a redirect; this instruction is to **copy the homepage content into root `index`** instead. Plan below reflects that.
> **Plan ready.** Implementation runs in **Execute mode.**

## Approach
The homepage is authored in Document Authoring at `us/en` (DA source `inf33138/capstone/us/en.html`). The cleanest, faithful copy is to take that **exact DA source** and write it to the root **`index.html`**, then preview + publish `/`. No re-scrape/import needed — it's a DA-doc → DA-doc copy so the homepage renders identically at root.

### Why this renders correctly at `/`
- **Dynamic card grids** (Recent Articles, "Where do you want to go?") reference **absolute** index paths (`/us/en/magazine/query-index.json`, `/us/en/adventures/query-index.json`) — they resolve the same from `/`.
- **Images** in the DA source use absolute `content.da.live` URLs — resolve from any path.
- **Links** (View Trips, All Articles, etc.) are absolute site paths (`/us/en/...`) — unaffected by the page's location.
- **Header/footer** come from the shared `nav`/`footer` fragments — identical at root.

### Watch-outs (I'll verify)
- **Metadata:** the source's `metadata` block (Title/Description) copies over — good for `/`.
- **Duplicate-home caveat:** this creates a **second copy** of the homepage (root `/` and `/us/en`) to keep in sync going forward. (A redirect avoids that, but you chose copy — noted.)
- **Not deleting anything** — just overwriting the placeholder root `index`.

## Steps (Execute mode)
1. **Fetch** the homepage DA source: `GET https://admin.da.live/source/inf33138/capstone/us/en.html`.
2. **Confirm root is placeholder:** fetch root `index` DA source + `/index.plain.html` to record the "Congrats, you are ready to go!" before-state.
3. **Upload** the homepage HTML to the root: `POST …/source/inf33138/capstone/index.html` (multipart `data` field, `text/html`).
4. **Preview + publish** the root: `POST admin.hlx.page/preview|live/inf33138/capstone/main/` (root path).
5. **Verify on aem.live** (below).

## Checklist

### Copy content (Execute mode)
- [ ] Fetch `us/en.html` DA source (the authored homepage)
- [ ] Record root `/` before-state (placeholder) for the report
- [ ] Upload that HTML to root `index.html` in DA
- [ ] Preview + publish `/`

### Verify
- [ ] `https://main--capstone--inf33138.aem.live/` renders the WKND homepage (hero carousel, Featured Article, Recent Articles grid, Next Adventures, "Where do you want to go?" grid) — no more "Congrats, you are ready to go!"
- [ ] Root `/` plain.html carries the two `query-index.json` card blocks; grids populate dynamically at root
- [ ] Images + nav/footer render; homepage links work
- [ ] `/us/en` remains unchanged

### Optional follow-up
- [ ] Decide whether to keep both `/` and `/us/en` (accept duplicate) or later switch `/` to a redirect to avoid drift — not doing now unless you ask

## Open Decisions
- **Copy vs redirect:** proceeding with **copy** per this instruction. If you'd rather avoid maintaining two homepage copies, say so and I'll switch `/` to a redirect instead.
- Everything else is determined — switch to **Execute mode** and I'll copy `/us/en` → root `index`, publish, and verify on aem.live.
