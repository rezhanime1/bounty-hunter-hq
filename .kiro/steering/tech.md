---
inclusion: always
---

# Technology Standards — Bounty Hunter HQ

## Stack

- Plain HTML, CSS, and JavaScript. No framework, no build step, no
  bundler. The app must work served as static files from GitHub Pages.
- No npm dependencies at runtime. No hotlinked images; inline SVG and CSS
  only.

## Data sources

- make.fun board: `GET https://make.fun/api/competitions?limit=200`
  (CORS open: `Access-Control-Allow-Origin: *`). Filter client-side:
  future deadline, entry fee $0, sort by deadline.
- BSC reads: JSON-RPC `eth_call` POST to
  `https://bsc-dataseed.bnbchain.org`. Featured mint DUNE Keys
  `totalMinted()` is selector `0xa2309ff8` on
  `0x1296da72914EA99a6Ac0D0c94Afba2D890dFA25b`.
- Cached fallbacks: `data/board-snapshot.json`,
  `data/mints.json`. Both carry recording timestamps.

## State

- `localStorage["bhh-earnings-v1"]`: earnings entries array.
- `localStorage["bhh-checklist-v1"]`: checklist booleans.
- No cookies, no analytics, no third-party trackers.

## Conventions

- Every displayed value carries a `live` or `cached` label with a time.
- Deadlines render in Asia/Jakarta (WIB).
- Money renders as USD with two decimals.
- Never invent a contract address, a price, or a live value. When a
  source cannot be read, show the recorded value as `cached` or show
  nothing with an explanation.
