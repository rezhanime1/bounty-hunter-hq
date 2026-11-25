# Design — Bounty Hunter HQ

## Overview

A static single-page dashboard. Three files carry the app: `index.html`
(structure), `styles.css` (dark "haunted HQ" theme), `app.js` (all logic).
Two JSON files carry cached data: `data/board-snapshot.json` (59 open
zero-capital make.fun bounties recorded 25 Nov 2026 16:35 WIB) and
`data/mints.json` (8 verified free mints recorded 25 Nov 2026). No build
step, no framework, no server. Deploys on GitHub Pages as-is.

## Architecture

```
index.html ── loads styles.css, app.js
app.js
  ├── fetchBoard() ── GET make.fun/api/competitions?limit=200
  │     ├── success → filter zero-fee + future deadline, sort by deadline
  │     └── failure → load data/board-snapshot.json
  ├── fetchDuneLive() ── eth_call totalMinted() to bsc-dataseed.bnbchain.org
  │     ├── success → render live count
  │     └── failure → render recorded count from data/mints.json
  ├── renderMints() ── static list from data/mints.json
  ├── earnings store ── localStorage key "bhh-earnings-v1"
  └── checklist store ── localStorage key "bhh-checklist-v1"
```

The page is five panels in one column on mobile, two columns on desktop:
Bounty Board, Free-Mint Radar, Earnings Tracker, Telegram Alerts, Daily
Checklist. A header shows the goal ($70) and the honest total earned.

## Components

### Bounty Board
- `fetchBoard()` uses `fetch()` with a 10 s timeout (AbortController).
- Zero-capital filter: `entryFeesUsd === "0.00"` or `entryFeeUsd` null/0.
- Open filter: `deadline > now`.
- Sort: deadline ascending. Render: title (link to make.fun), pot
  (`potUsd` or `rewardAmount`), deadline formatted in Asia/Jakarta,
  category, submission count.
- Status pill: `LIVE · HH:MM WIB` on success, `CACHED · <snapshot time>`
  on fallback. Empty state when no rows match.

### Free-Mint Radar
- `renderMints()` builds cards from `data/mints.json`: name, chain (BSC),
  contract address (only when verified on record), free quota, recorded
  minted count, warning text when present, source link.
- Featured card (DUNE Keys): `fetchDuneLive()` POSTs a JSON-RPC
  `eth_call` with data `0xa2309ff8` (`totalMinted()`) to
  `https://bsc-dataseed.bnbchain.org`. On success, decodes the uint256
  and renders `527 → live` with a `LIVE` pill. On any failure it renders
  the recorded count with a `CACHED` pill and timestamp.
- No contract address is ever invented: mints without a verified address
  on record show no address field.

### Earnings Tracker
- Form: name (text), pot (number, USD), status (select:
  submitted/placed/won), payout (number, USD, only counted when won).
- `localStorage["bhh-earnings-v1"]` holds an array of entries.
- Totals: `earned = Σ payout where status === "won"`;
  `goal progress = earned / 70`. Each entry has a delete button.
- On load, entries are restored and totals recomputed. Empty state shows
  `$0.00 earned of $70 goal`.

### Telegram Alerts Panel
- Static panel: link button to `https://t.me/AirdropHunterAIrez_bot`
  plus two lines explaining the bot sends new free-airdrop/free-mint
  alerts and answers questions.

### Daily Checklist
- Four fixed items: check news-image, check race results, claim PXIO,
  check FLOP faucet. `localStorage["bhh-checklist-v1"]` holds a map of
  item id → boolean. Reset button clears all.

## Data Models

```jsonc
// data/board-snapshot.json
{ "fetched_at_utc": "2026-11-25T09:35:00Z",
  "fetched_at_wib": "2026-11-25 16:35 WIB",
  "source": "https://make.fun/api/competitions?limit=200",
  "items": [{ "slug": "...", "title": "...", "rewardAmount": 100,
              "potUsd": "100.00", "deadline": "2026-11-26T00:00:00.000Z",
              "category": "Growth", "submissionCount": 19701,
              "url": "https://make.fun/bounty/..." }] }

// data/mints.json
{ "updated_wib": "2026-11-25 16:35 WIB",
  "items": [{ "name": "DUNE ($DUNE) — Dune Keys NFT",
              "chain": "BSC", "contract": "0x1296...",
              "free": "1 key per wallet, gas only",
              "minted": 527, "supply": 6666,
              "minted_at_wib": "2026-11-25 16:35 WIB",
              "live": { "method": "eth_call totalMinted()",
                        "rpc": "https://bsc-dataseed.bnbchain.org",
                        "data": "0xa2309ff8" },
              "warning": null,
              "link": "https://duneid.fun/" }] }

// localStorage bhh-earnings-v1
[{ "id": "…", "name": "…", "pot": 100, "status": "submitted",
   "payout": 0 }]

// localStorage bhh-checklist-v1
{ "news-image": true, "race": false, "pxio": false, "flop": false }
```

## Visual Design

- Dark "haunted HQ" theme: near-black background `#0b0e14`, panels
  `#12161f` with a 1px `#232a38` border, green accent `#3ddc84` for
  live/earned, amber `#f5a623` for cached/warnings, red `#ff5c5c` for
  risk flags. Purple `#a78bfa` accent for the Frankenstein stitching.
- Typography: system sans stack. Big numbers for the goal counter.
- Inline SVG only (pumpkin/ghost mark in the header, drawn in code).
- Responsive: single column below 900 px, two-column grid above.

## Error Handling

| Failure | Behaviour |
| --- | --- |
| make.fun fetch fails / times out | Render cached snapshot, `CACHED` pill with snapshot time |
| make.fun returns non-200 / bad JSON | Same as above |
| BSC `eth_call` fails / reverts | Render recorded DUNE count, `CACHED` pill with timestamp |
| `data/*.json` fails to load | Panel shows "data unavailable" message, page still works |
| localStorage unavailable | Tracker/checklist work in-memory for the session |

## Testing Strategy

- Open `index.html` from a local static server; confirm all five panels
  render with no console errors.
- Block network (offline) and confirm the board shows the cached
  snapshot with the `CACHED` label and the DUNE card shows the recorded
  count.
- Add, delete, and reload earnings entries; confirm totals persist.
- Toggle checklist items, reload, confirm state persists.
- Resize to 390 px width; confirm no horizontal scrolling.
- Validate `data/mints.json` and `data/board-snapshot.json` parse as JSON
  (hook `validate-data.json`).
