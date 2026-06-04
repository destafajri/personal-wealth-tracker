## Cermat — Phase-2 (UI Revamp) Product Requirements Document

**Status:** Plan Locked (Codex review rounds 1–3 LGTM 2026-06-04)
**Last updated:** 2026-06-04
**Owner:** TBD
**Working brand name:** **Cermat** *(unchanged from Phase-1)*

**Companion docs:**
- [`./scope-and-plan.md`](./scope-and-plan.md) — phase scope + decision log (D2.1–D2.7 locked)
- [`./phase-2a-plan.md`](./phase-2a-plan.md) — milestone 1 execution plan + 4-layer preservation guard + Day 6 hard gate
- [`./README.md`](./README.md) — phase index
- [`../1_mvp/journey-and-features.md`](../1_mvp/journey-and-features.md) — Phase-1 feature inventory (preserved verbatim)
- [`../../ide_3/personal-wealth-platform-prd-en.md`](../../ide_3/personal-wealth-platform-prd-en.md) — canonical product PRD (behaviour unchanged in Phase-2; this PRD describes the visual/journey delta only)
- [`../../ide_3/personal-wealth-platform-design-guidelines-en.md`](../../ide_3/personal-wealth-platform-design-guidelines-en.md) — design guidelines (receives token deltas in Phase-2a Day 1)
- [`../../ide_4_revamp/`](../../ide_4_revamp/) — visual reference archive (v0 / bolt / lovable outputs)

---

## 1. Why this phase exists

### 1.1 Problem

Phase-1 shipped a functionally complete MVP (snapshot + 6 sims + Plan module + xlsx export + 326 passing tests) but two user-felt problems remain:

1. **Wizard UX feels clunky.** The snapshot lives behind a 7-step paginated wizard. Users must commit to a step before they see how their numbers affect the bigger picture. There is no realtime feedback while typing — DSR, Net Worth, Surplus, Allocation Discipline are all hidden until the user finishes a step and lands on the dashboard.
2. **Visual treatment is plain.** The Phase-1 styling is functional (Plus Jakarta Sans + deep-green primary) but does not feel "tampan" or trust-inspiring. Users have explicitly said the app looks **"jadul"** (dated).

Neither problem is a bug. Both are product gaps that block the next stage of adoption: turning curious first-time visitors into engaged returning users.

### 1.2 User-stated goal

> *"Ini tuh cuma ubah tata letak dan design-nya aja tanpa ubah behaviour-nya, soalnya yang MVP tampilannya jadul dan ga user-friendly dan user journey-nya jelek."* — user, 2026-06-03

Translation: "This is just changing the layout and design without changing the behaviour, because the MVP looks dated and isn't user-friendly and the user journey is bad."

Headline goal verbatim: **"supaya lebih tampan"** ("so it looks more handsome / polished").

### 1.3 Why now

- Phase-1 MVP is stable and feature-complete. There is no functional debt blocking the revamp.
- Phase-3 (xlsx import) was originally next in the roadmap. The user explicitly swapped phase order: **revamp before import**, on the reasoning that better first-impression UX matters more than import depth for early adoption.
- The 326-test regression suite means a UI refactor can be done with high confidence — broken behaviour will surface as failing tests.
- External UI-generation tools (v0, bolt, lovable) produced rich visual reference output for the same brief, giving the revamp a strong starting point without a from-scratch design pass.

---

## 2. Goals & Non-Goals

### 2.1 Goals

1. **Replace the 7-step wizard with a split-screen seamless flow** for Snapshot. Sticky dashboard left, scrollable category cards right. Realtime updates as the user types — DSR, Net Worth, Surplus, Allocation Discipline all reflect input mutations in the same frame.
2. **Refresh the visual layer** toward a shadcn-inspired aesthetic: emerald-led palette, gradient backgrounds, `rounded-2xl` cards, soft shadows, Geist Sans typography, generous spacing.
3. **Revamp the landing page** into a clear two-CTA hero ("Mulai dari Snapshot" vs "Coba dengan data contoh") with privacy trust badges and matching visual polish.
4. **Restyle the 6 capacity + decision wizards** (Mau KPR / Gadai / Cicil / Custom + Max Utang / Lunasi) using the new tokens — keeping their flow-shaped pagination intentionally.
5. **Restyle the Plan module surface** (FI card, Goal cards, Modal Likuid Options, WizardModalOptions) using the new tokens.
6. **Preserve every Phase-1 feature, behaviour, calculation, pricing wiring, and compliance posture verbatim.** The revamp is style + layout + journey only.
7. **Ship in 3 PR-reviewable milestones (2a / 2b / 2c)** with their own Codex review round, so the size of any single review stays manageable.

### 2.2 Non-Goals (what does NOT change in Phase-2)

Phase-2 is explicitly a visual + journey refresh. The following stay exactly as Phase-1 shipped them:

- **Behaviour.** Every calculation formula, every invariant, every validation rule unchanged.
- **Feature scope.** Every input panel, every KPI card, every sim, every capacity wizard, every pricing proxy, every disclaimer layer preserved.
- **Data flow.** IndexedDB persistence pattern, `useDirtyGuard` composable, demo seed flow, Pinia snapshot store shape — all unchanged.
- **Pricing wiring.** Yahoo Finance (IDX + USDIDR) / Pegadaian / CoinGecko proxies + common `{stale, fetchedAt}` envelope + 30s cooldown per panel + LIVE/STALE/OVERRIDE pill behaviour preserved.
- **xlsx export.** 5 visible sheets + hidden `_meta` schema + TopNav download gating preserved.
- **OJK compliance posture.** Descriptive "kamu" tone, 3-layer disclaimer (snapshot banner + sim dialog + GoalForm), descriptive zone labels sourced from `lib/copy/metric-explainers.ts` registry, copy gating via `lib/copy/strings.ts` + `lib/copy/ojk-lint.ts` — all preserved.
- **xlsx import.** Deferred to Phase-3.
- **Backend / cloud sync.** Cermat stays browser-local. Privacy promise unchanged.
- **Bahasa-ID full re-sync.** `-id` translations still lag EN canonical (Phase-1 banner-flagged policy stands).
- **Plausible analytics.** Stays low-priority polish.
- **Playwright E2E.** D11.7 HOLD continues; revamp would invalidate any partial setup.

---

## 3. Scope

Phase-2 is **chunked into 3 milestones**. Each is its own PR + Codex review round + landing commit. The chunking is deliberate: smaller reviews catch more, and Phase-2a sets visual tokens that 2b + 2c inherit.

### 3.1 Milestone 2a — Foundation + Landing + Snapshot Split-Screen *(~6 days)*

**Scope:**
- Design token swap at the system level (palette, typography, scales)
- All `components/common/*` primitives refactored to new tokens
- Styleguide page mirrors new tokens
- Landing page (`/`) revamped — hero + 2-card CTA grid + trust badges + privacy footer
- Snapshot page (`/app/snapshot`) rebuilt as split-screen — sticky dashboard sidebar (left) + scrollable section flow (right)
- All 14 Phase-1 input panels surfaced in the right column, restyled
- Dashboard sidebar = revamp of Phase-1 dashboard (HeroPair NW+DSR + 9 KPI cards + AllocationDonut + SafeHavenBar + MetricExplainer modals + Modal Likuid Options panel — every Phase-1 element preserved)
- Mobile layout: stacked or drawer pattern at `< lg` breakpoint
- Obsolete wizard step files **deleted only after Day 6 parity audit passes** (REPLACE-AFTER-PARITY rule)

**Detailed execution plan:** [`./phase-2a-plan.md`](./phase-2a-plan.md). Includes 4-layer preservation guard (Feature + Calc inventory + lib/ contract + UI Behavior Contract B1–B18) and Day 6 hard gate with 7 explicit exit criteria.

### 3.2 Milestone 2b — Wizard Restyle *(~6 days, stub TBD when 2a in flight)*

**Scope:**
- 4 decision wizards: Mau KPR, Mau Gadai Emas, Mau Cicil, Custom Skenario
- 2 capacity wizards: Max Utang Aman, Lunasi Utang Sekarang
- Restyle only — **keep step-by-step pagination intentionally** (D2.6 locked). Pattern split:
  - **Snapshot = split-screen** (data entry + realtime feedback)
  - **Wizard = flow** (linear decision)
- Conditional branches preserved (Mau KPR BI Checking, Mau Gadai emas vs sertifikat)
- CapacityResult panels ride along with wizard restyle

**Out of 2b:** Plan module + GoalForm (those are 2c).

### 3.3 Milestone 2c — Plan Module + Modal Likuid *(~6 days, stub TBD when 2b in flight)*

**Scope:**
- Plan module surface (Plan page shell)
- FI auto-formula card (FiGoalCard) restyle
- Goal cards (GoalCard, GoalSummaryCards) restyle
- GoalForm + WizardModalOptions restyle (includes 3rd OJK disclaimer layer preserved)
- Modal Likuid Options panel restyle (preview-only zero-sum invariant preserved)
- Bottom-nav 4 tabs final polish

**Out of 2c:** Decide / Discover modules stay "Soon"-tagged (Phase-1 scope decision preserved).

---

## 4. User Journey — Before vs After

### 4.1 Snapshot — the core UX delta

**Phase-1 (current):** 7-step paginated wizard. User clicks Next/Back through Penghasilan → Aset Likuid → Saham → Crypto → Emas → Aset Non-Likuid + Gadai → Utang + Cicilan, then lands on the Dashboard page to see DSR / Net Worth / Surplus. **Dashboard math is not visible during input.**

**Phase-2 (revamp):** Single-page split-screen.
- **Left (sticky):** Dashboard sidebar — HeroPair (NW + DSR), Surplus highlight bar, 9 KPI cards (compact stacked or 2-col grid), AllocationDonut, SafeHavenBar, MetricExplainer modals, Modal Likuid panel. Always visible while user scrolls input.
- **Right (scrollable):** ~7 semantic section headers (Penghasilan / Pengeluaran / Likuid / Investasi-Pasar / Investasi-Riil / Utang+Cicilan / Ringkasan) with **all 14 Phase-1 input panels grouped inside**. No panel removed. Every control preserved.
- **Realtime:** any input mutation → all 9 KPI cards + HeroPair + charts recompute in the same frame. No "Update" or "Recalculate" button.

### 4.2 Landing — the first impression delta

**Phase-1:** Plain title + CTAs. Functional but does not signal trust or polish.

**Phase-2:**
- **Nav bar:** "Cermat" logo (bold slate-900 + emerald shield/wallet icon) left; "Cek Keuangan dalam 10 Menit" gray text right.
- **Hero:** `py-24` generous padding, center-aligned. H1 "Aman gak kalau gw KPR, Gadai, atau Cicil?" (text-4xl/5xl bold slate-900). Sub-headline "Berapa max utang yang aman? Cek keuangan kamu dalam 10 menit." (text-lg gray-600).
- **Trust badges:** flex row, emerald-soft pills — "Tanpa daftar" (lock icon), "Tanpa cloud" (cloud-off icon).
- **2-card CTA grid** (max-w-4xl gap-6 centered):
  - **Primary card:** subtle emerald top border, user/document icon, title "Mulai dari Snapshot" + desc "Isi data kamu sendiri (5–10 menit)", solid emerald button "Mulai →" → `/app/snapshot`
  - **Secondary card:** standard border, play/sparkle icon, title "Coba dengan data contoh" + desc "Skip dulu, lihat tools-nya", outline button "Coba →" → `/app/snapshot?demo=1`
- **Footer:** center, small gray "Cermat. Data diproses secara lokal di browser Anda untuk privasi maksimal." + lock icon.

### 4.3 Wizards — restyle only

**Phase-1:** Plain forms, step-by-step pagination, deep-green CTAs, basic card styling.

**Phase-2:** Same flow, new visual tokens. Emerald primary CTAs, `rounded-2xl` cards, soft shadows, gradient background, Geist typography. Step-by-step pagination intentionally preserved — decision wizards work better as linear flows where each step builds on the previous (conditional branches like Mau KPR's BI Checking step rely on flow continuity).

### 4.4 Dashboard — repositioned, not replaced

**Phase-1:** Standalone dashboard page (`/app/dashboard`) shown after snapshot completion.

**Phase-2:** Same 9-KPI semantic content, repositioned as the sticky-left sidebar in the snapshot split-screen. Visual treatment adopts v0/bolt's Surplus highlight bar styling but does **not** strip down to the 4-metric simplification their reference UIs used. Standalone dashboard page may or may not survive — TBD during 2a implementation, but the sidebar-as-dashboard is the new canonical surface.

### 4.5 Mobile

**Phase-1:** Functional, narrow-viewport friendly per Phase-1 D11 polish.

**Phase-2:** Stacked layout at `< lg` breakpoint. Dashboard at top (collapsible) or as a drawer — final pattern decided during 2a Day 4 implementation. All controls remain usable; sticky sidebar pattern degrades gracefully.

---

## 5. Functional Requirements

### 5.1 Visual design tokens (D2.1 — Full Accept)

Adopted from revamp prompt aesthetic. Phase-1 tokens deprecated:

- **Primary accent:** `emerald-600` (`#059669`) replaces Phase-1 deep-green
- **Background:** subtle gradient `bg-gradient-to-b from-white to-gray-50`
- **Cards:** `rounded-2xl`, `shadow-sm` default → `shadow-md` on hover, `border-gray-100`
- **Border radius scale:** `rounded-2xl` consistent across cards and primary surfaces
- **Spacing:** generous (revamp prompt-aligned: `py-24` hero, `py-12` section breaks)

### 5.2 Typography (D2.5 — Geist Sans)

- Self-hosted via `@fontsource/geist-sans` (mirrors Phase-1 self-host pattern)
- Weights: 400 / 500 / 600 / 700
- Plus Jakarta Sans deprecated; imports removed from `nuxt.config.ts`
- Scale unchanged from Phase-1 (revamp prompt provides no new scale)
- Render edge-case verified on Safari + Chrome target browsers during 2a Day 1

### 5.3 Snapshot split-screen architecture (D2.2 — Pure Split-Screen)

- 7-step wizard pagination **removed**
- Layout: `grid lg:grid-cols-[360px_1fr]` (desktop) / stacked (mobile)
- New components: `SplitScreenShell.vue`, `DashboardSidebar.vue`, `sections/{Penghasilan, Pengeluaran, AsetLikuid, Saham, Crypto, Emas, AsetNonLikuid, Gadai, Utang, Ringkasan}.vue`
- Right column section grouping — **Option B (semantic grouping)** is the default: ~7 headers, all 14 Phase-1 sub-panels preserved inside. Revisit during implementation if grouping feels off.
- Bottom action bar: "Sebelumnya" outline (left) + "Simpan & Lanjutkan" solid emerald (right) + privacy note below

### 5.4 Wizard restyle policy (D2.6 — Flow-Shaped Restyle)

- 6 wizards keep step-by-step pagination
- Restyle only: emerald CTAs, `rounded-2xl` cards, gradient bg, soft shadow, Geist typography
- Conditional branches preserved (Mau KPR BI Checking, Mau Gadai emas/sertifikat)
- CapacityResult panels ride along

### 5.5 Behaviour preservation (UI Behavior Contract B1–B18)

Phase-2 changes **how** the UI is laid out and styled — never **when** it fires. The full contract lives in [`./phase-2a-plan.md`](./phase-2a-plan.md) §UI Behavior Contract and covers 18 orchestration rules:

| ID | Behaviour |
|---|---|
| B1 | Store writes per-input + IndexedDB persistence on every mutation |
| B2 | `useDirtyGuard` `beforeunload` warning on unsaved mutations |
| B3 | Realtime dashboard recompute on every input write (no manual recalc button) |
| B4 | Duplicate-ticker warning (Saham + Crypto) |
| B5 | Missing-bunga warning (Cicilan) |
| B6 | Gadai jaminan ownership invariant |
| B7 | FX mismatch warning (Cicilan FX-aware) |
| B8 | Chart empty-state gating on `totalAset > 0` |
| B9 | Modal Likuid zero-sum invariant (preview before apply) |
| B10 | xlsx download gating + post-download toast |
| B11 | Pricing refresh 30s cooldown + LIVE/STALE/OVERRIDE pill |
| B12 | Demo seed CTA via `?demo=1` → Rio persona |
| B13 | OJK 3-layer disclaimer (banner + sim dialog + GoalForm) |
| B14 | Descriptive zone labels from explainer registry |
| B15 | MetricExplainer modal launch from KPI cards |
| B16 | Sim launch context — shared store reads (no detached form state) |
| B17 | Bottom-nav 4 tabs + "Soon" badge on Decide/Discover |
| B18 | "Simpan & Lanjutkan" CTA always enabled (per-input save model) |

Every B-rule is audited during the Day 6 hard gate.

### 5.6 Calculation preservation (lib/ contract)

`lib/finance/*`, `lib/prices/*`, `lib/snapshot/*`, `lib/types/*`, `lib/xlsx/*`, `server/api/*`, and `lib/copy/{ojk-lint,metric-explainers}.ts` are **DON'T TOUCH** during Phase-2. The detailed inventory and per-file responsibilities live in [`./phase-2a-plan.md`](./phase-2a-plan.md) §Calculation Function Preservation, covering all ~30 `lib/` TypeScript files including:

- Net Worth, DSR, Safe Haven %, Allocation Discipline, Goal Health, Cicilan share, Runway in `metrics.ts`
- Cicilan amortization (flat / floating / anuitas / revolving) in `amortization.ts`
- FI auto-formula `pengeluaran × 300` + Goal CRUD in `goals.ts`
- Gold valuation + drainEmas (excludes pawned) in `emas.ts`
- Multi-currency FX + USD cost-basis persistence in `fx.ts`
- All 6 simulators in `sims/*.ts`
- Yahoo / Pegadaian / CoinGecko price proxies in `prices/*` + `server/api/prices/*`

If any of those files appear in `git diff main..phase-2a -- lib/ server/`, the Day 6 hard gate fails.

### 5.7 Feature preservation (Feature Preservation Guard)

The full Phase-1 inventory of input panels, KPI cards, simulators, pricing integrations, and disclaimer layers is preserved verbatim in the revamp. The detailed mapping (14 panels, 9 KPIs, 5-mode emas, 4-mode crypto, 6-tipes cicilan, etc.) lives in [`./phase-2a-plan.md`](./phase-2a-plan.md) §MVP Feature Preservation Guard.

**v0 / bolt simplifications are NEVER adopted as feature scope.** They are visual reference only — see §8.

---

## 6. Non-Functional Requirements

### 6.1 Performance

- **D11.6 lazy-mount preserved.** AllocationDonut + SafeHavenBar (ECharts) gated on `totalAset > 0`.
- **Lighthouse target ≥85 mobile** (Phase-1 D11.6 deferred goal, still pending real Vercel deploy).
- ECharts async chunk continues — no eager-mount regressions.
- Geist Sans self-hosted (no network font requests).
- Realtime reactivity must not introduce render-blocking debounce or batched-write delays (per B1 + B3).

### 6.2 Privacy posture preserved

- Browser-local only. No backend. No cloud sync. No analytics in Phase-2.
- IndexedDB persistence layer unchanged.
- Demo seed (Rio persona) runs entirely client-side.
- Privacy footer copy preserved on landing.

### 6.3 Accessibility

- Primitive a11y verified during 2a Day 2 styleguide pass (focus rings, ARIA labels, color contrast on emerald + gradient bg)
- Keyboard navigation through split-screen sections preserved
- Mobile touch targets sized per platform guidance

### 6.4 Browser support

- Smoke test target: Safari (latest), Chrome (latest) on desktop + mobile viewport
- Geist Sans render edge-case verified on Day 1 (older OS reported risk)
- Tailwind v4 `@theme` block features verified per browser

### 6.5 Test posture (D2.4 — Extend + Prune)

- Phase-1's 326-test regression suite is the safety net for behaviour preservation
- Component refactor → tests pointing at old components auto-fail; update path/selector if logic preserved, delete if component genuinely obsolete
- Add new tests for new components (split-screen shell, realtime wiring, new design tokens)
- **Forbidden:** rewrite-for-rewrite-sake; deleting tests "because they look outdated" without verifying coverage is preserved in new components
- Phase-2a Day 6 hard gate requires `pnpm typecheck` (vue-tsc) + `pnpm lint` + `pnpm test` all green, count delta documented

---

## 7. Compliance & OJK Posture

Phase-2 preserves Phase-1's OJK compliance posture verbatim. The revamp must NOT pull microcopy from v0/bolt outputs — their copy bypasses our `lib/copy/strings.ts` registry and `lib/copy/ojk-lint.ts` checks.

### 7.1 3-layer disclaimer preserved

- **Layer 1:** DisclaimerBanner on snapshot route (always visible)
- **Layer 2:** Sim dialog disclaimer (inside each capacity/decision wizard modal)
- **Layer 3:** GoalForm disclaimer (in Plan module; revamp surfaces in 2c)

### 7.2 Descriptive tone preserved

- "Kamu" casual, never "Anda" formal
- Descriptive, never advisory: "DSR kamu di angka X" — never "sebaiknya kamu kurangi cicilan"
- Zone labels from explainer registry: "Cukup leluasa", "Mulai ketat", "Berat" — never "Good", "Bad", "Risky"

### 7.3 OJK-lint copy registry preserved

- All status framing copy ("Surplus", "On track", etc.) sourced from `lib/copy/strings.ts`
- `lib/copy/ojk-lint.ts` policy unchanged
- Revamp may **ADD** new keys for new microcopy (e.g., new section headers); must NOT **REMOVE** existing keys (regression risk for surfaces that still reference them)

### 7.4 Verbatim v0/bolt copy forbidden

- v0 and bolt outputs were generated by tools that don't know about Indonesian financial regulator constraints
- Their copy ("Your savings rate is great!", advisory CTAs, etc.) would fail ojk-lint immediately
- Phase-2 implementer translates **visual patterns** from those outputs into Cermat's existing copy registry — never copies their text verbatim

---

## 8. Reference Material

### 8.1 Visual reference archive

- [`docs/ide_4_revamp/Promt.md`](../../ide_4_revamp/Promt.md) — original prompt fed to v0 / bolt / lovable
- [`docs/ide_4_revamp/Result.md`](../../ide_4_revamp/Result.md) — preview links + chat session URLs
- [`docs/ide_4_revamp/reff/`](../../ide_4_revamp/reff/) — in-repo ZIP archives (extracted source moved to `/Users/mamikos/Downloads/` 2026-06-03 to keep repo tidy; see [[reference-cermat-revamp-source-code]] memory entry for canonical extraction location)

### 8.2 Source-of-truth boundary (locked Codex round-1 2026-06-04)

The v0 / bolt / lovable outputs are **visual + layout + interaction-pattern reference only.** They are **NOT** a source of truth for:

- **Feature scope** — their 7 generic categories simplify Cermat's 14 panels; using them as the inventory will silently drop core capabilities
- **Domain logic** — their DSR/KPR calculations are toy implementations vs Cermat's `lib/finance/`; harvesting them = regression risk
- **Copy / microcopy** — theirs bypasses OJK-lint registry (see §7.4)
- **Data flow** — theirs uses localStorage; Cermat uses IndexedDB + Pinia + per-input persistence
- **State shape** — theirs is throwaway; Cermat's `lib/types/snapshot.ts` is the contract

Visual treatments OK to adopt: card shapes, spacing, gradient bg, emerald accent, sticky split-screen layout, surplus highlight bar styling, currency input with Rp prefix, action-card grid. Everything else: derive from Phase-1 `lib/` + Phase-1 components.

### 8.3 shadcn adoption posture (locked Codex round-1 2026-06-04)

The revamp aesthetic is **shadcn-inspired**, but Cermat is a **Vue 3.5 + Nuxt 3** app, not a Next.js + React project. Adapt patterns to Nuxt idioms — do not transplant shadcn-React component structure verbatim into Vue SFCs:

- Use Nuxt auto-import + existing `components/common/*` primitives — restyle them, don't rewrite into shadcn-style `<Button variant="default" />` API
- Use Pinia stores + composables for state, not React-style prop drilling or context
- Use `<NuxtLink>` for routing
- Use Tailwind v4 `@theme` block (already configured), not shadcn's CSS-vars-in-`:root` convention
- Result rule: the revamp should look "tampan" *and* feel native to the existing Nuxt repo. If it feels like a half-transplanted Next.js project, back up and re-port.

---

## 9. Success Criteria

### 9.1 Per-milestone exit criteria

Each milestone has its own hard gate. The 2a hard gate (representative) requires **all 7** of:

1. MVP feature audit — every Phase-1 capability renders and functions on the revamp surface
2. UI Behavior Contract audit — all B1–B18 trigger under the same condition as Phase-1
3. Calc preservation — `git diff` against `lib/finance lib/prices lib/snapshot lib/types lib/xlsx server/api` returns zero lines
4. `pnpm typecheck` (vue-tsc) + `pnpm lint` + `pnpm test` all green
5. Manual smoke (desktop + mobile viewport) passes the documented flows
6. `?demo=1` loads Rio persona with all panels populated + all warnings/disclaimers visible
7. Compliance posture preserved (DisclaimerBanner + copy still sourced from `strings.ts`, no verbatim v0/bolt copy)

Old wizard files are deleted **only after** all 7 pass (REPLACE-AFTER-PARITY).

### 9.2 Phase-wide success metrics

- **Functional parity:** 326 → ~340 tests after prune + add; all green
- **No regressions in:** snapshot persistence, demo seed, dirty guard, pricing refresh cooldown, xlsx export, OJK lint
- **Visual polish:** landing + snapshot match revamp prompt visual targets per side-by-side review with `/Users/mamikos/Downloads/cermat-app-revamp/` (v0 max output as the visual base reference)
- **Lighthouse:** ≥85 mobile (carries over from Phase-1 D11.6 deferred goal; requires real Vercel deploy to verify)

### 9.3 What "lebih tampan" means measurably

User's qualitative goal ("supaya lebih tampan") is intentionally subjective. The proxies we use for "done":

- **Token alignment:** every primitive in `components/common/*` renders with new tokens (verified on styleguide page)
- **Layout coherence:** landing + snapshot + dashboard surfaces all use the same gradient bg, emerald accent, `rounded-2xl` cards, Geist Sans, soft shadows
- **Journey friction:** snapshot input → dashboard math is **same-frame** (no Next button required to see DSR change)
- **First-impression:** landing reads as "modern privacy-first finance tool" not "homework form" — confirmed by user smoke + Codex review

---

## 10. Delivery Plan

### 10.1 Chunked 2a / 2b / 2c (D2.7 — Locked)

| Milestone | Scope | Estimated | Doc |
|---|---|---|---|
| **2a** | Tokens swap + Geist + Landing + Snapshot split-screen | ~6 days | [`phase-2a-plan.md`](./phase-2a-plan.md) |
| **2b** | 6 wizards restyle | ~6 days | TBD (stub when 2a in flight) |
| **2c** | Plan module + FI card + Goal cards + Modal Likuid restyle | ~6 days | TBD (stub when 2b in flight) |

Total estimate: ~18 work-days across the 3 milestones, plus Codex review rounds.

### 10.2 Codex review rounds per milestone

Per [[feedback-codex-review-workflow]] memory pattern: each milestone follows **build → commit → Codex review → triage + fix + verify → commit → review again**. A milestone is not "done" until Codex returns LGTM with no blocking findings.

Phase-2a planning already went through 3 Codex review rounds (LGTM at round-3, 2026-06-04). Execution will get its own review rounds at the merge-to-main checkpoint.

### 10.3 Phase-3 parallel scope (narrowed Codex round-1 2026-06-04)

After Phase-2a lands, **parser + schema validation + backend import worker** for xlsx import (Phase-3) may be developed in parallel with Phase-2b. **Import UX** (file-picker, mapping screen, preview, error-row UI, surface integration into snapshot) **must wait** until Phase-2a shell is stable + parity verified. Rule of thumb: if a Phase-3 task touches `pages/`, `components/snapshot/`, or snapshot store wiring, it blocks on 2a merge.

---

## 11. Out of Scope

### 11.1 Behaviour changes

Any change to formulas, invariants, validations, pricing logic, or compliance posture is out of scope. If a regression is discovered during the revamp, fix it as a Phase-1 hotfix on a separate branch, not bundled into the revamp PR.

### 11.2 xlsx import (Phase-3)

Deferred. Phase-3 narrative folder at [`../3_import_valid_xlsx/`](../3_import_valid_xlsx/) stays as the home for that work.

### 11.3 Backend / cloud sync

Cermat stays browser-local. Privacy promise unchanged. This is a Phase-N+ topic if ever revisited.

### 11.4 New features

The revamp is style + layout + journey only. Any new feature request (new metric, new sim, new module) is out of Phase-2 scope and routes to the canonical PRD roadmap at [`../../ide_3/personal-wealth-platform-prd-en.md`](../../ide_3/personal-wealth-platform-prd-en.md) §12.

### 11.5 Bahasa-ID re-sync

The `-id` translations of canonical docs in `ide_3/` still lag the EN versions. Phase-2 does not address this. The Phase-1 policy stands: EN is canonical, `-id` is best-effort companion.

### 11.6 Plausible analytics

Stays low-priority polish. Not in Phase-2 scope.

### 11.7 Playwright E2E

D11.7 HOLD continues. The revamp invalidates any partial setup anyway.

---

## 12. Decision Log

All Phase-2 decisions are locked. The list below is the canonical record; rationale lives in [`./scope-and-plan.md`](./scope-and-plan.md).

| ID | Decision | Locked | Rationale (one-line) |
|---|---|---|---|
| **D2.1** | Design tokens: **Full Accept** revamp prompt aesthetic | 2026-06-03 | Phase-1 tokens look "jadul"; user explicit ask for shadcn-inspired refresh |
| **D2.2** | Snapshot UX: **Pure Split-Screen** | 2026-06-03 | Wizard pagination hides realtime math; split-screen surfaces it |
| **D2.3** | Scope: **Full Revamp** (Landing + Snapshot + Wizards + Plan) | 2026-06-03 | Half-revamp would leave visual inconsistency between surfaces |
| **D2.4** | Test strategy: **Extend + Prune** | 2026-06-03 | Phase-1's 326-test suite is the safety net; rewrite-for-rewrite is forbidden |
| **D2.5** | Typography: **Geist Sans** | 2026-06-03 | Pairs natural with emerald + minimal aesthetic; replaces Plus Jakarta |
| **D2.6** | Wizard shape: **Flow-Shaped Restyle** | 2026-06-03 | Decision wizards work better as linear flows; only Snapshot needs split-screen |
| **D2.7** | Delivery: **Chunked 2a / 2b / 2c** | 2026-06-03 | Smaller PRs = better Codex reviews + faster regression catch |

---

## 13. References

- [`./scope-and-plan.md`](./scope-and-plan.md) — living phase scope + decision log
- [`./phase-2a-plan.md`](./phase-2a-plan.md) — milestone 1 execution plan w/ 4-layer preservation guard + Day 6 hard gate
- [`../1_mvp/`](../1_mvp/) — Phase-1 MVP (completed, origin/main = `f822659`)
- [`../1_mvp/journey-and-features.md`](../1_mvp/journey-and-features.md) — Phase-1 feature inventory (preserved verbatim)
- [`../3_import_valid_xlsx/`](../3_import_valid_xlsx/) — Phase-3 narrative (deferred)
- [`../../ide_3/personal-wealth-platform-prd-en.md`](../../ide_3/personal-wealth-platform-prd-en.md) — canonical product PRD (unchanged)
- [`../../ide_3/personal-wealth-platform-design-guidelines-en.md`](../../ide_3/personal-wealth-platform-design-guidelines-en.md) — design guidelines (receives D2.1 + D2.5 token deltas during 2a Day 1)
- [`../../ide_3/cermat-design-decisions-en.md`](../../ide_3/cermat-design-decisions-en.md) — append-only decision log (receives D2.1 + D2.5 entries during 2a Day 1)
- [`../../ide_4_revamp/`](../../ide_4_revamp/) — visual reference archive

**Codex review rounds (planning phase):**
- Round-1 LGTM partial → `b2ba646` addresses 7 plan-doc gaps including UI Behavior Contract + Day 6 hard gate
- Round-2 LGTM 2 minor → `5385202` removes external calc-harvest path + tags stale working-note
- Round-3 LGTM full → no findings; planning phase closed

---

## 14. The bet

Phase-1 proved the product works. Phase-2 makes it look like it works.

The bet is that a meaningful share of users bounce off a functional-but-dated UI before they get to the value, and that fixing the first impression unblocks the next stage of adoption — without rewriting any of the math, pricing, or compliance work that took Phase-1 to land.

If Phase-2 ships and users still bounce, the problem was never the UI. We learn that from the same data we'd have collected anyway.

If Phase-2 ships and engagement moves, the bet paid off and Phase-3 (xlsx import) becomes the natural next play.

Either way, the calculations, the pricing wiring, and the OJK posture stay exactly where Phase-1 left them. That's the contract.
