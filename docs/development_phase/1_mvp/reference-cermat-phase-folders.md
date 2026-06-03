---
name: reference-cermat-phase-folders
description: "Cermat docs are organized by phase under docs/development_phase/; canonical specs stay in docs/ide_3/ as source-of-truth, phase folders are entry points + narratives"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 2cc03fc4-4431-4dd3-a0d8-29cb920cd7a0
---

User reorganized Cermat docs on 2026-06-03 into `docs/development_phase/`:

```
docs/
├── ide_3/                              # canonical specs (source of truth — don't move)
│   ├── cermat-11-day-plan-en.md
│   ├── cermat-tech-design-en.md
│   ├── cermat-design-decisions-en.md
│   ├── personal-wealth-platform-{prd,mvp,design-guidelines}-{en,id}.md
│   └── stitch_mvp_ui_design_process/   # frozen process artifacts
└── development_phase/
    ├── 1_mvp/
    │   ├── README.md                   # pointer index to canonical docs
    │   └── journey-and-features.md     # narrative + feature inventory + locked decisions
    ├── 2_import_valid_xlsx/            # Phase-2 entry (xlsx import round-trip)
    └── 3_improvement_ui_snapshot/      # Phase-3 entry (snapshot UI polish)
```

**Why:** User chose "symlink/copy, keep ide_3 as source" reorg pattern — lowest churn, no link breakage in tools that index `docs/ide_3/` (Stitch workflow, Codex review prompts). Phase folders are the *narrative* layer; ide_3 stays the *spec* layer.

**How to apply:**
- When the user says *"add a doc about X"* and X is canonical (PRD/MVP/tech-design/design-guidelines content), edit in `docs/ide_3/`.
- When the user wants *journey, narrative, retrospective, feature inventory, phase boundary, decision log*, write to the appropriate phase folder under `docs/development_phase/`.
- New phase work (Phase-2 import, Phase-3 UI improvements) should land its own narrative + checklist in the phase folder, with canonical spec deltas going back to `ide_3/`.
- Don't move `stitch_mvp_ui_design_process/` or `code.html` — they're frozen process artifacts the user told us never to touch ([[project-cermat-state]]).
