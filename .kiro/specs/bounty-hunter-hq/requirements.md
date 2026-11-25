# Requirements — Bounty Hunter HQ

## Introduction

Bounty Hunter HQ is a single-page dashboard for a zero-capital crypto hunter.
It stitches three incompatible sources into one view: the make.fun bounty board
(a Web2 REST API), the BSC free-mint radar (on-chain JSON-RPC), and the
hunter's own Telegram alert bot. Everything runs client-side as static
HTML/CSS/JS with no build step and no server, so the app deploys on GitHub
Pages. All state the user owns (earnings log, checklist) lives in
localStorage. The app never invents live data: every live value carries a
`live` or `cached` label, and every cached value shows when it was recorded.

## Glossary

- **Bounty**: a make.fun competition with a cash pot, a deadline, and a
  category. A bounty is **zero-capital** when its entry fee is $0.
- **Free mint**: a BSC NFT/token mint that costs only gas (value 0), verified
  on-chain by the hunter.
- **Live value**: a value fetched in the browser in this session from its
  source API or RPC endpoint.
- **Cached value**: a value recorded in `data/` at build time, shown with its
  recording timestamp when the live fetch fails or has not run.
- **Earnings entry**: one user-recorded bounty submission (name, pot, status,
  payout).

## Requirements

### Requirement 1: Bounty board (live-first)

**User Story:** As a hunter, I want the open zero-capital bounties in one
list, so I can pick what to enter without opening make.fun first.

#### Acceptance Criteria

1. WHEN the page loads, THE SYSTEM SHALL fetch
   `https://make.fun/api/competitions?limit=200` from the browser.
2. WHEN the fetch succeeds, THE SYSTEM SHALL show only bounties whose
   deadline is in the future AND whose entry fee is $0, sorted by deadline
   ascending, with pot, deadline (WIB), category, and submission count.
3. WHEN the fetch fails (network, CORS, or non-200), THE SYSTEM SHALL show
   the cached snapshot from `data/board-snapshot.json` and label the board
   `cached` with the snapshot timestamp.
4. WHEN the fetch succeeds, THE SYSTEM SHALL label the board `live` with the
   fetch time.
5. WHEN a bounty row is rendered, THE SYSTEM SHALL link its title to the
   bounty page on make.fun.
6. WHEN the board has no matching bounties, THE SYSTEM SHALL show an empty
   state instead of a blank list.

### Requirement 2: Free-mint radar (on-chain read)

**User Story:** As a hunter, I want the verified free mints with their live
minted counts, so I know what is still mintable before spending gas.

#### Acceptance Criteria

1. WHEN the page loads, THE SYSTEM SHALL render the curated mint list from
   `data/mints.json` (name, network, contract address where verified,
   free quota, recorded minted count, source link).
2. WHEN the featured mint (DUNE Keys) is rendered, THE SYSTEM SHALL attempt
   a live `eth_call` for `totalMinted()` against
   `https://bsc-dataseed.bnbchain.org` and show the live count with a
   `live` label when the call succeeds.
3. WHEN the live `eth_call` fails, THE SYSTEM SHALL show the recorded
   count from `data/mints.json` with a `cached` label and its timestamp.
4. WHEN a mint has no verified contract address on record, THE SYSTEM SHALL
   show no address rather than an invented one, and link to the mint site.
5. WHEN a mint is flagged risky in the data (e.g. unverified contract),
   THE SYSTEM SHALL show its warning text.

### Requirement 3: Earnings tracker (localStorage)

**User Story:** As a hunter, I want to log my submissions and see my honest
total earned, so I know exactly where the $70 goal stands.

#### Acceptance Criteria

1. WHEN the user adds an entry (name, pot, status), THE SYSTEM SHALL store
   it in localStorage and render it in the log.
2. WHEN an entry status is `won`, THE SYSTEM SHALL include its payout in
   the total-earned counter; entries with status `submitted` or `placed`
   SHALL contribute $0.
3. WHEN the user deletes an entry, THE SYSTEM SHALL remove it from
   localStorage and re-render the log and totals.
4. WHEN the page loads, THE SYSTEM SHALL restore the log and totals from
   localStorage.
5. WHEN the log is empty, THE SYSTEM SHALL show the goal ($70) and $0.00
   earned rather than a blank panel.

### Requirement 4: Telegram alerts panel

**User Story:** As a hunter, I want one link to the alert bot and a plain
explanation of what it sends, so I can open it in one tap.

#### Acceptance Criteria

1. WHEN the panel renders, THE SYSTEM SHALL link to
   `https://t.me/AirdropHunterAIrez_bot`.
2. WHEN the panel renders, THE SYSTEM SHALL explain in one or two lines
   that the bot sends new free-airdrop/free-mint alerts and answers
   questions.

### Requirement 5: Daily hunter checklist (localStorage)

**User Story:** As a hunter, I want a daily checklist of the routine
checks, so nothing is forgotten.

#### Acceptance Criteria

1. WHEN the page loads, THE SYSTEM SHALL render the checklist items:
   check news-image, check race results, claim PXIO, check the FLOP
   faucet.
2. WHEN the user toggles an item, THE SYSTEM SHALL persist the state in
   localStorage and restore it on load.
3. WHEN the user presses reset, THE SYSTEM SHALL clear all checkboxes.

### Requirement 6: Honesty and deployment

**User Story:** As a visitor, I want to trust what the dashboard shows, and
as the owner, I want it to work from GitHub Pages with no server.

#### Acceptance Criteria

1. WHEN any value is shown, THE SYSTEM SHALL label it `live` or `cached`
   with a timestamp; no value SHALL be presented as live when it is not.
2. WHEN the app is opened from any static host, THE SYSTEM SHALL work
   with no build step and no server-side code.
3. WHEN the page is viewed on a phone, THE SYSTEM SHALL lay out all five
   panels readably without horizontal scrolling.
4. WHEN any image is needed, THE SYSTEM SHALL use inline SVG or CSS only;
   no hotlinked images SHALL be used.
