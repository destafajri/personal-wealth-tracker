---
name: reference-stitch
description: Stitch (stitch.withgoogle.com) is the UI generation tool used on Cermat. User feeds design-guidelines doc → Stitch generates screens → Claude reviews outputs for PRD/MVP feasibility.
metadata: 
  node_type: memory
  type: reference
  originSessionId: 01ed3a0f-4de5-489e-9035-75438b983071
---

User uses **Stitch** (https://stitch.withgoogle.com/) — Google's text-to-UI generation tool — to mock up Cermat screens. The brief is `docs/ide_3/personal-wealth-platform-design-guidelines-en.md`, whose §9 "Screens to Generate" is structured as Stitch screen prompts.

**Next-session expectation (per user 2026-05-26):** user will likely return with Stitch-generated designs and ask Claude to filter which ones are feasible per PRD + MVP. User pre-acknowledged that "Stitch might halu" (hallucinate / drift).

**Common Stitch drift modes to flag:**
1. **Dark mode** — explicitly out of scope (design guidelines §13). Reject.
2. **Prescriptive panel labels** — "Saran" / "Rekomendasi" / "Pilihan Terbaik" are OJK red lines (PRD §9, design guidelines §11). Reject.
3. **Wrong color palette** — bank-blue, growth-marketing saturated colors, gold rendered as bright yellow. Reject; reference design guidelines §3 forest-green palette.
4. **Gamified energy** — Bibit/Pluang-style. Reject; reference §15 anti-patterns.
5. **Login / signup / account UI** — privacy-first means no accounts (PRD §2.2, design guidelines §8.1). Reject.
6. **Bahasa drift** — "Anda" formal register instead of "kamu" casual. Reject; see design guidelines §2.

**Filter checklist for Stitch outputs:**
1. OJK constraints — PRD §9 + design guidelines §11.
2. Out-of-scope items — design guidelines §13.
3. Component spec accuracy — design guidelines §8 (hero pair, metric cards, Cicilan Aktif rows, Gadai panel, wizards).
4. Microcopy fidelity — design guidelines §10 critical strings table.
