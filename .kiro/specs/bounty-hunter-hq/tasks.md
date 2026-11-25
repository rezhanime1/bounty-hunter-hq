# Tasks — Bounty Hunter HQ

- [x] 1. Record cached data
  - [x] 1.1 Fetch the make.fun board (`limit=200`) and save the open
    zero-capital slice to `data/board-snapshot.json` with a timestamp
    - _Requirements: 1.3_
  - [x] 1.2 Record the 8 verified free mints in `data/mints.json` with
    contract addresses only where verified, recorded counts, and warnings
    - _Requirements: 2.1, 2.4, 2.5_
  - [x] 1.3 Read the live DUNE `totalMinted()` via `eth_call` once and
    record it as the cached count (527/6666, 25 Nov 16:35 WIB)
    - _Requirements: 2.3_

- [x] 2. Build the bounty board panel
  - [x] 2.1 Fetch the board live, filter zero-fee + future deadline,
    sort by deadline, render with pot/deadline/category/submissions
    - _Requirements: 1.1, 1.2, 1.5_
  - [x] 2.2 Fall back to `data/board-snapshot.json` with a `CACHED`
    label and timestamp on any fetch failure; `LIVE` label on success
    - _Requirements: 1.3, 1.4_
  - [x] 2.3 Render an empty state when no bounties match
    - _Requirements: 1.6_

- [x] 3. Build the free-mint radar panel
  - [x] 3.1 Render mint cards from `data/mints.json` (no invented
    contract addresses)
    - _Requirements: 2.1, 2.4, 2.5_
  - [x] 3.2 Attempt the live DUNE `totalMinted()` `eth_call`; show the
    live count on success, the recorded count with `CACHED` on failure
    - _Requirements: 2.2, 2.3_

- [x] 4. Build the earnings tracker panel
  - [x] 4.1 Add/delete entries persisted in localStorage
    (`bhh-earnings-v1`), totals recomputed on every change
    - _Requirements: 3.1, 3.3, 3.4_
  - [x] 4.2 Count payout only for `won` entries; show $0.00 of $70
    when empty
    - _Requirements: 3.2, 3.5_

- [x] 5. Build the Telegram alerts panel
  - [x] 5.1 Link button to `https://t.me/AirdropHunterAIrez_bot`
    with a two-line explanation
    - _Requirements: 4.1, 4.2_

- [x] 6. Build the daily checklist panel
  - [x] 6.1 Four items with localStorage persistence
    (`bhh-checklist-v1`) and a reset button
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 7. Polish, honesty, and verification
  - [x] 7.1 Apply the dark haunted-HQ theme, responsive layout,
    inline SVG only
    - _Requirements: 6.2, 6.3, 6.4_
  - [x] 7.2 Verify every value carries a `live` or `cached` label
    with a timestamp
    - _Requirements: 6.1_
  - [x] 7.3 Verify in a browser: panels render, offline fallback
    works, earnings/checklist persist, 390 px has no horizontal scroll
    - _Requirements: 6.1, 6.2, 6.3_
