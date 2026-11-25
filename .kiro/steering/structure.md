---
inclusion: always
---

# Structure — Bounty Hunter HQ

```
bounty-hunter-hq/
├── index.html            # page structure, five panels
├── styles.css            # dark haunted-HQ theme, responsive
├── app.js                # all logic: board, radar, tracker, checklist
├── data/
│   ├── board-snapshot.json  # cached open zero-fee bounties + timestamp
│   └── mints.json           # curated verified free mints + timestamp
├── .kiro/
│   ├── steering/         # product.md, tech.md, structure.md
│   ├── specs/
│   │   └── bounty-hunter-hq/
│   │       ├── requirements.md   # EARS requirements
│   │       ├── design.md
│   │       └── tasks.md
│   ├── hooks/
│   │   └── validate-data.json  # validate JSON data files on save
│   └── settings/
│       └── mcp.json      # no MCP servers required
├── README.md
└── LICENSE               # MIT
```

## Naming

- Files are lowercase with hyphens. `app.js` holds all client logic in
  one file so the app stays deployable as static files.
- Data files live under `data/` and always carry a recording timestamp
  (`fetched_at_wib` / `updated_wib`).
- localStorage keys are prefixed `bhh-` with a `-v1` version suffix.

## Rules

- Do not add `.kiro` or any sub-folder to `.gitignore`. The Kiroween
  rules disqualify entries that hide the `.kiro` directory.
- Do not commit secrets, API keys, private keys, or claim codes.
- Keep the app dependency-free so GitHub Pages serves it unchanged.
