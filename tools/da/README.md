# Document Authoring (da.live) site config

`config.json` is the Document Authoring **site config** for `inf33138/capstone`.
It is the source of truth for the DA Author **Library** panel (the "Search
everything" blocks browser inside da.live/edit).

DA stores this config in its own KV store — it is **not** served from this repo.
This file is a committed copy so the configuration is reproducible and reviewable.

## What it does

The `library` sheet registers a **Blocks** source pointing at our Sidekick
library manifest:

| title  | path                             | ref  |
|--------|----------------------------------|------|
| Blocks | `/tools/sidekick/library.json`   | main |

At runtime the DA Author Library:
1. reads this `library` sheet from the site config;
2. fetches the `path` (resolved to `https://main--capstone--inf33138.aem.live/tools/sidekick/library.json`) as the block list — a sheet of `{ name, path }` rows (see `tools/sidekick/library.json`, 10 blocks);
3. for each block, fetches `path + .plain.html` from the same origin (the `/block-library/<slug>` example pages) to render the preview and provide the insertable markup.

The `permissions` sheet grants config-write + content-create to
`inf33138@adobe.com` and is required for the config to validate on save.

## Re-apply the config

If the DA Author Library panel is empty, (re)post this config (credentials are
injected automatically — do not add an Authorization header):

```sh
curl -X POST --form-string "config=$(cat tools/da/config.json)" \
  "https://admin.da.live/config/inf33138/capstone/"
```

Verify it was stored (should list `data,library,permissions`):

```sh
curl -s "https://admin.da.live/config/inf33138/capstone/" | jq '.":names"'
```

Then hard-refresh the DA Author page and open the Library panel.

## Related

- `tools/sidekick/library.json` — the 10-block manifest the Library reads.
- `/block-library/*` (in Document Authoring) — one example page per block.
- `tools/sidekick/config.json` — AEM Sidekick (browser extension) library wiring;
  separate from this DA Author config.
