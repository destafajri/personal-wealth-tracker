# Phase 2 — Scope & Plan

> Living document. Decisions land here as they get locked; checklist gets ticked as work ships.

## Why this phase exists

Phase-1 MVP shipped a working snapshot flow but the UX is a paginated 7-step wizard with plain styling. Two user-felt problems:

1. **Wizard feels clunky** — users have to commit to a step before seeing how their numbers affect the bigger picture; no realtime feedback while typing.
2. **Visually plain** — the layout is functional but doesn't feel "tampan." User explicitly asked for the revamp before xlsx import work.

The revamp targets both: **split-screen seamless flow** (realtime dashboard updates as user types) + **shadcn-inspired visual polish**.

## Source material & chosen base

Three AI tools were prompted with the same brief (see `../../ide_4_revamp/Promt.md`). Comparative review summary:

| | v0 (auto) | v0 (max) | bolt |
|---|---|---|---|
| Stack | Next 16 + React 19 + Tailwind v4 | Next 16 + React 19 + Tailwind v4 | Vite + React 18 + **Tailwind v3** |
| Landing completeness | ~90% | ~95% | **100%** |
| Snapshot split-screen | ✓ accordion | ✓ tabbed | ✓ + subsections |
| Realtime calc | partial (state bridge missing) | better | **full DSR + KPR cap** |
| Demo mode | ✗ | ✓ `?demo=true` | ✓ |
| Modularity | **excellent** (small modules) | good | monolithic (475-line page) |

**Chosen base reference:** **v0 (max)** for visual + UX layout. Reasoning:
- Stack closest to Cermat (Tailwind v4, React 19 ≈ Vue 3.5 composition feel) → minimal friction translating JSX → Vue SFC.
- Demo mode + `formatRupiah()` centralization are patterns worth replicating.
- Form architecture cleaner than v0(auto)'s untriggered dashboard, less monolithic than bolt's 475-line page.

**Calc harvesting:** **NONE required** (revised post Codex round-2 2026-06-04). Earlier draft mentioned harvesting from bolt's `finance.ts`, but D2.1–D2.7 + the Phase-2a UI Behavior Contract lock `lib/finance/*`, `lib/prices/*`, `lib/snapshot/*` as **DON'T TOUCH** during the revamp. Phase-1's `lib/` is treated as feature-complete for Phase-2 scope. If a future phase genuinely needs a calc that's missing from Phase-1, raise it as a new decision then — do NOT pull from external machine-local paths during this phase. The bolt source archive (ZIP under [`../../ide_4_revamp/reff/`](../../ide_4_revamp/reff/)) remains a **visual/pattern reference**, not a calc source.

**Skipped:** v0 (auto) (broken state wiring), bolt (Tailwind v3 + React routing = bigger port lift), lovable (no source).

## Decisions locked

### D2.1 — Design tokens: **FULL ACCEPT** (locked 2026-06-03)

Sepenuhnya adopt revamp prompt aesthetic. Phase-1 tokens di-deprecate, ide_3 design-guidelines di-update.

**Adopted:**
- Primary accent: `emerald-600` (replaces Phase-1 deep-green primary)
- Background: `bg-gradient-to-b from-white to-gray-50` (subtle gradient)
- Cards: `rounded-2xl`, soft shadow (`shadow-sm` → `shadow-md` on hover), `border-gray-100`
- Typography: Inter atau Geist (TBD — see follow-up Q below)
- Spacing: generous (revamp prompt: `py-24` hero section, etc.)

**Blast radius (work items):**
- Update `assets/css/main.css` `@theme` block — palette, font-family, gradient utility, rounded/shadow scales
- Add new font (Inter or Geist) via @fontsource (mirror Phase-1 self-host pattern; deprecate Plus Jakarta Sans imports OR keep as fallback)
- Update `ide_3/personal-wealth-platform-design-guidelines-en.md` §1 (colors) + §2 (typography) + §3 (components patterns if affected)
- Append decision entry to `ide_3/cermat-design-decisions-en.md` (with rationale: "lebih tampan" goal + shadcn-inspired visual cohesion)
- Refactor every `components/common/*` primitive to new tokens (ButtonPrimary, Card, Input*, Pill*, StatusDot, DisclaimerBanner)
- Update `pages/styleguide.vue` to mirror new tokens
- Audit + update any component using hardcoded `#1b4332` (Phase-1 deep-green theme-color) and similar legacy color refs

### D2.2 — Snapshot UX: **PURE SPLIT-SCREEN** (locked 2026-06-03)

Wizard pagination 7-step dihapus. Snapshot = 1 page split-screen layout. Sticky dashboard kiri (realtime), scrollable category cards kanan. Bottom action bar buat save + privacy note. Mobile: stacked (dashboard di atas, scroll naik kategori di bawah, atau drawer dashboard).

**Blast radius:**
- Delete wizard step files / routing if exists (need to scan `pages/app/snapshot/` structure)
- New: `components/snapshot/SplitScreenShell.vue`, `DashboardSidebar.vue`, `CategoryFlowColumn.vue`
- 7 category cards/sections sebagai komponen-komponen `components/snapshot/sections/*` (Penghasilan, Pengeluaran, Tabungan, Investasi, Aset, Utang, Ringkasan)
- Realtime wiring: section input → reactive dashboard metrics (likely via Pinia store atau composable shared state)
- Preserve: persistence (IndexedDB), `useDirtyGuard` composable, OJK lint, parse-currency lib, all calculation logic in `lib/`

**Sub-question PENDING:** capacity + decision wizards juga di-reshape jadi split-screen, atau stay flow-shaped (cuma di-restyle dengan token baru)? See follow-up Q below.

### D2.3 — Scope: **FULL REVAMP** (locked 2026-06-03)

Landing + Snapshot + 6 wizards (Mau KPR/Gadai/Cicil/Custom + Max Utang/Lunasi) + Plan module shell + FI card + Goal cards. Decide + Discover modules stay 'Soon'-tagged.

**Estimated effort:** 12-16 day work. Phase split into milestones may be necessary — see follow-up Q below.

**Blast radius:**
- Pages: `pages/index.vue`, `pages/app/snapshot.vue`, `pages/app/decide/{mau-kpr,mau-gadai,mau-cicil,mau-custom,max-utang,lunasi}.vue`, `pages/app/plan/*` (Plan module surface), FI + Goal card components
- Layouts: bottom-nav (4 tabs) gets restyled with new tokens
- Capacity wizard shape decision pending (see below)

### D2.4 — Test strategy: **EXTEND + PRUNE** (default, no user contest)

Pertahankan 326 Phase-1 tests sebagai regression safety. Component refactor → tests yang point ke komponen lama auto-fail; update path/selector kalau logic preserved, hapus kalau komponen genuinely obsolete. Tambah test baru untuk komponen baru (split-screen shell, realtime wiring, new design tokens). **Larangan:** rewrite-for-rewrite-sake; jangan delete test cuma karena "udah kuno" tanpa verifikasi coverage masih tertahan di komponen baru.

## Follow-up decisions (locked 2026-06-03)

### D2.5 — Typography: **GEIST** (locked)

Self-host via `@fontsource/geist-sans` (mirror Phase-1 self-host pattern). Plus Jakarta Sans deprecated; remove imports from `nuxt.config.ts` css array. Pairs natural dengan emerald + minimal aesthetic. Risk noted: render edge case OS lama possible — verify smoke pass di Safari/Chrome target di Phase-2a Day 1.

### D2.6 — Wizard shape: **FLOW-SHAPED RESTYLE** (locked)

6 wizards (Mau KPR/Gadai/Cicil/Custom + Max Utang/Lunasi) keep step-by-step pagination. Hanya restyle dengan token baru (emerald button, rounded-2xl card, gradient bg, soft shadow). Pattern split intentional: **Snapshot = split-screen (data entry → realtime feedback)**, **Wizard = flow (linear decision)**. Conditional branches (Mau KPR BI Checking, Mau Gadai emas/sertifikat) stay natural di wizard.

### D2.7 — Delivery: **CHUNKED 2a / 2b / 2c** (locked)

| Milestone | Scope | Est. | Doc |
|---|---|---|---|
| **Phase-2a** | Tokens swap + Geist + Landing + Snapshot split-screen | ~6 hari | [`phase-2a-plan.md`](./phase-2a-plan.md) |
| **Phase-2b** | 6 wizards restyle (Mau KPR/Gadai/Cicil/Custom + Max Utang/Lunasi) | ~6 hari | TBD (stub later) |
| **Phase-2c** | Plan module + FI card + GoalForm + WizardModalOptions restyle | ~6 hari | TBD (stub later) |

Each milestone = own PR + Codex review round + landing commit.

**Phase-3 parallel scope (narrowed per Codex round-1 feedback 2026-06-04):** setelah Phase-2a landing, hanya **parser + schema validation + backend import worker** yang aman dijalankan paralel. **Import UX (file-picker, mapping screen, preview, error-row UI, surface integration ke snapshot)** harus tunggu sampai Phase-2a shell stabil (parity verified) — kalau dijalankan paralel, integrasi UX bakal nempel ke surface lama yang masih moving target. Aturan praktisnya: kalau task Phase-3 menyentuh `pages/`, `components/snapshot/`, atau snapshot store wiring, **block sampai 2a merge ke main**.

## Out of scope (deliberately deferred)

- **xlsx import** — moved to Phase-3 (`../3_import_valid_xlsx/`).
- **Backend / cloud sync** — Cermat stays browser-local. Privacy promise unchanged.
- **Bahasa-id full re-sync** — `-id` translations still lag EN-canonical (Phase-1 banner-flagged policy stands).
- **Plausible analytics** — D0.6, stays low-priority polish.
- **Playwright E2E** — D11.7 HOLD continues; revamp may invalidate any partial setup anyway.

## Milestone checklists

Detailed per-day checklists live in milestone docs:
- **Phase-2a** — see [`phase-2a-plan.md`](./phase-2a-plan.md) (~6 day plan, foundation + landing + snapshot)
- **Phase-2b** — TBD (stubbed when 2a in flight)
- **Phase-2c** — TBD (stubbed when 2b in flight)

## Phase-2 closing verification (run before each milestone PR)

- [ ] `pnpm typecheck` (vue-tsc, not tsc — see [[feedback-typecheck-vue-projects]])
- [ ] `pnpm lint` clean
- [ ] `pnpm test` — extend, don't rewrite-for-rewrite-sake
- [ ] Manual smoke per milestone (per-doc checklist)
- [ ] Vercel deploy + Lighthouse spot-check (local preview blocked — see [[feedback-nuxt-vercel-edge-preview]])
- [ ] Codex review round (see [[feedback-codex-review-workflow]])

## Working notes (append-only)

> Add dated entries as decisions land or scope shifts.

- **2026-06-03** — Phase order swapped (revamp before xlsx). Source material reviewed. v0(max) chosen as base. D2.1–D2.4 open at this point; ASK user before writing real line-items. *[Superseded by later same-day entries below — D2.1–D2.7 all locked by EOD 2026-06-03; entry preserved for audit trail only.]*
- **2026-06-03 (same session)** — D2.1=Full Accept, D2.2=Pure Split-Screen, D2.3=Full Revamp, D2.4=Extend+Prune (default). 3 follow-ups surfaced: D2.5 typography, D2.6 capacity wizard shape, D2.7 phase delivery model.
- **2026-06-03 (same session, later)** — D2.5=Geist, D2.6=Flow-shaped restyle, D2.7=Chunked 2a/2b/2c locked. `phase-2a-plan.md` created (6-day foundation + landing + snapshot). 2b/2c stubs deferred until 2a in flight (avoid over-planning).
- **2026-06-04 (Codex round-2)** — 2 minor findings closed: (Med) calc-harvesting line removed — referenced external machine-local path which broke handoff/reviewability; reframed as "none required" since Phase-2a lib/ contract locks calculations as DON'T TOUCH. (Low) stale "D2.1–D2.4 open" line in 2026-06-03 working-notes entry tagged as superseded inline. Phase-3 narrowing fix from round-1 confirmed LGTM by Codex.
