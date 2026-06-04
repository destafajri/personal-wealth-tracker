# Phase 2 — UI Revamp (Snapshot Flow)

**Status:** Phase-2a plan locked (D2.1–D2.7 all decided 2026-06-03). Execution pending Codex round-1 LGTM. Phase-2b/2c stubbed (drafted when 2a in flight).
**Started:** 2026-06-03 (Phase-1 MVP ticked + phase order swapped: revamp before xlsx import).

**Decisions locked (see [scope-and-plan.md](./scope-and-plan.md) for rationale):**
- D2.1 = Full Accept tokens (emerald + gradient + rounded-2xl + soft shadow)
- D2.2 = Pure Split-Screen snapshot (sticky dashboard + scrollable category flow)
- D2.3 = Full Revamp scope (Landing + Snapshot + 6 wizards + Plan shell + FI + Goal cards)
- D2.4 = Extend + Prune tests (preserve 326 regression set; rewrite-for-rewrite-sake forbidden)
- D2.5 = Geist Sans typography (Plus Jakarta Sans deprecated)
- D2.6 = Flow-shaped wizard restyle (6 wizards stay step-by-step; only Snapshot is split-screen)
- D2.7 = Chunked 2a / 2b / 2c delivery (~6 day each, own PR + Codex round each)

Phase-1 MVP landed a working snapshot flow but the wizard UX feels clunky and the visual treatment is plain. This phase replaces the 7-step paginated wizard with a **split-screen seamless flow** (sticky dashboard left + scrollable category flow right) and refreshes the visual layer toward a cleaner shadcn-inspired aesthetic. User goal stated verbatim: *"supaya lebih tampan."*

## Phase-2 narrative

- [Scope & plan](./scope-and-plan.md) — why this phase exists, chosen base reference, open decisions, screen-by-screen checklist

## Source material

UI exploration outputs from v0 / bolt / lovable, prompted with the same spec:

- [`../../ide_4_revamp/Promt.md`](../../ide_4_revamp/Promt.md) — original prompt fed to all 3 tools
- [`../../ide_4_revamp/Result.md`](../../ide_4_revamp/Result.md) — links to live previews + chat sessions
- [`../../ide_4_revamp/reff/`](../../ide_4_revamp/reff/) — in-repo archive (ZIPs only); extracted source moved 2026-06-03 to keep repo tidy
- **Extracted source (active reference, outside repo):**
  - `/Users/mamikos/Downloads/cermat-personal-finance-app-v1/` — v0 (auto): Next 16 + shadcn, modular components, **realtime calc broken** (sidebar state not wired)
  - `/Users/mamikos/Downloads/cermat-app-revamp/` — v0 (max): Next 16 + shadcn + demo mode → **chosen as visual/UX base reference**
  - `/Users/mamikos/Downloads/bolt-main/` — bolt: Vite + React 18 + Tailwind v3, **`src/lib/finance.ts` has complete DSR + KPR calc** → harvest calc patterns only
- lovable: no source code available (preview link only, see `Result.md`)

## Core specs (carry-over from Phase-1)

Canonical specs stay in [`docs/ide_3/`](../../ide_3/) — phase-2 may produce **deltas** to these (especially design-guidelines if tokens are accepted), tracked in `scope-and-plan.md`:

- [11-day plan (EN)](../../ide_3/cermat-11-day-plan-en.md) — Phase-1 day-by-day (now reference-only)
- [Tech design (EN)](../../ide_3/cermat-tech-design-en.md) — architecture stays; routing/page surface may grow
- [Design decisions (EN)](../../ide_3/cermat-design-decisions-en.md) — additive only; phase-2 decisions appended
- [Design guidelines (EN)](../../ide_3/personal-wealth-platform-design-guidelines-en.md) — **may receive token deltas if structural decision #1 lands "accept new tokens"**
- [PRD (EN)](../../ide_3/personal-wealth-platform-prd-en.md) — unchanged
- [MVP scope (EN)](../../ide_3/personal-wealth-platform-mvp-en.md) — unchanged

## Adjacent phases

- [`../1_mvp/`](../1_mvp/) — completed (origin/main = `f822659`, 326 tests, full snapshot + capacity wizards + decision wizards)
- [`../3_import_valid_xlsx/`](../3_import_valid_xlsx/) — deferred until revamp lands
