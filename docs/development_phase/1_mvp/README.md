# Phase 1 — MVP

Canonical docs for the MVP phase live in [`docs/ide_3/`](../../ide_3/) (kept as source of truth to avoid link breakage). This folder is the phase-1 entry point.

## Phase-1 narrative

- [Journey & Features](./journey-and-features.md) — what was built, day-by-day, with feature inventory + locked decisions + phase boundary

## Agent memory snapshots (Phase-1 era)

Copies of the Claude Code agent memory entries built up during MVP development. The live versions sit in `~/.claude/projects/.../memory/` (per-machine, not source-controlled); these are the in-repo archive snapshot at end-of-MVP (2026-06-03).

**Process / workflow:**
- [Codex review workflow](./feedback-codex-review-workflow.md) — external review cadence between phases
- [No-overclaim checklist](./feedback-no-overclaim-checklist.md) — verify claims against actual code before writing status
- [Spec workflow](./feedback-spec-workflow.md) — propose+tradeoff → ask → batched edits → summary

**Technical gotchas:**
- [Nuxt component subdir prefix](./feedback-nuxt-component-subdir-prefix.md) — `components/layout/X.vue` auto-imports as `<LayoutX/>`; bare name silently fails
- [Vue/Nuxt typecheck = vue-tsc](./feedback-typecheck-vue-projects.md) — `tsc` skips setup blocks + templates; always use `vue-tsc`
- [Nuxt vercel-edge preview](./feedback-nuxt-vercel-edge-preview.md) — `nuxt preview` blocked by vercel-edge preset; needs deploy or preset swap for local production Lighthouse

**References:**
- [Cermat phase folders](./reference-cermat-phase-folders.md) — `docs/ide_3/` vs `docs/development_phase/` split
- [Stitch UI tool](./reference-stitch.md) — user feeds design-guidelines §9 into Stitch; Claude reviews outputs against PRD/MVP+OJK

> Not archived: `project-cermat-state.md` (74 KB mutation log — too noisy for a snapshot; superseded by [`journey-and-features.md`](./journey-and-features.md) above) and `MEMORY.md` (just an index over the live memory dir).

## Core specs

- [11-day plan (EN)](../../ide_3/cermat-11-day-plan-en.md) — day-by-day delivery checklist
- [Tech design (EN)](../../ide_3/cermat-tech-design-en.md) — architecture, stack, data shape
- [Design decisions (EN)](../../ide_3/cermat-design-decisions-en.md) — locked tradeoffs + their why
- [Design guidelines (EN)](../../ide_3/personal-wealth-platform-design-guidelines-en.md) — visual tokens, screen specs, copy rules
- [PRD (EN)](../../ide_3/personal-wealth-platform-prd-en.md) / [PRD (ID)](../../ide_3/personal-wealth-platform-prd-id.md)
- [MVP scope (EN)](../../ide_3/personal-wealth-platform-mvp-en.md) / [MVP scope (ID)](../../ide_3/personal-wealth-platform-mvp-id.md)

## Frozen process artifacts

- [`stitch_mvp_ui_design_process/`](../../ide_3/stitch_mvp_ui_design_process/) — Stitch UI iteration outputs
- [`stitch_mvp_ui_design_process (1).zip`](<../../ide_3/stitch_mvp_ui_design_process (1).zip>) — archive snapshot

## Next phases

- [`../2_import_valid_xlsx/`](../2_import_valid_xlsx/) — xlsx import round-trip
- [`../3_improvement_ui_snapshot/`](../3_improvement_ui_snapshot/) — UI polish for snapshot flow
