# Bounty Hunter HQ

**Kiroween 2026 — Frankenstein category.** One dashboard that stitches three
incompatible technologies into a single app for a zero-capital crypto hunter:

1. **make.fun bounty board** — a Web2 REST API, read live in the browser.
2. **BSC free-mint radar** — on-chain JSON-RPC reads (`eth_call`) plus a
   curated list of verified free mints.
3. **Telegram alert bot** — the hunter's own `@AirdropHunterAIrez_bot`,
   linked from the dashboard.

Plus an earnings tracker (only `won` payouts count toward the $70 goal) and
a daily hunter checklist, both stored in `localStorage`.

## Honesty rule

Every number is labelled **LIVE** (fetched this session) or **CACHED** (a
recorded snapshot with its timestamp). If the live fetch fails, the app
shows the cached snapshot and says so. Nothing is presented as live when
it is not, and nothing promises a win.

## How Kiro was used

The app was built spec-first with Kiro's documented format:

- `.kiro/specs/bounty-hunter-hq/` — `requirements.md` (EARS notation),
  `design.md`, `tasks.md`. The build followed `tasks.md` item by item.
- `.kiro/steering/` — `product.md`, `tech.md`, `structure.md` (standing
  project knowledge, with `inclusion: always` front matter).
- `.kiro/hooks/validate-data.json` — validates the JSON data files on save.
- `.kiro/settings/mcp.json` — no MCP servers required.

Kiro CLI 3.6.0 was installed on the build machine from the official
installer (`https://cli.kiro.dev/install`). The CLI's agent runs need an
interactive Builder ID login, so the spec and steering files were authored
by hand in Kiro's documented format and the implementation was built
against them, task by task.

## Run it

No build step, no server code, no dependencies. Serve the folder as
static files (or open `index.html` directly):

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

Deployed on GitHub Pages from this repo.

## Data

- `data/board-snapshot.json` — open zero-capital make.fun bounties,
  recorded 25 Nov 2026 16:35 WIB (fallback when the live API is
  unreachable).
- `data/mints.json` — 8 verified free mints with recorded counts. Contract
  addresses are shown only where verified on record; the featured DUNE
  Keys count is read live on-chain (`totalMinted()`).

## What it never does

No wallet connection, no signing, no private keys, no transactions, no
paid mints, no entry fees. Minting is never automatic.
