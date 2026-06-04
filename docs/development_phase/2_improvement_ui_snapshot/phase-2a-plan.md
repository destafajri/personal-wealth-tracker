# Phase 2a — Foundation + Landing + Snapshot Split-Screen

> Milestone 1 of 3 (see [`scope-and-plan.md`](./scope-and-plan.md) D2.7). Targets ~6 days. Landing + snapshot revamp + token swap. PR-able + Codex-reviewable as one unit.

**Branch suggestion:** `phase-2a-foundation` (off `main` at `f822659`).
**Done when:** Verification block at bottom all ticked + Codex round-1 LGTM.

---

## 🎯 Phase-2 Core Principle (READ FIRST)

> **"Ini tuh cuma ubah tata letak dan design-nya aja tanpa ubah behaviour-nya, soalnya yg MVP tampilannya jadul dan ga user-friendly dan user journey-nya jelek."** — user, 2026-06-03

What changes in Phase-2:
- ✅ **Visual design** (tokens: emerald + gradient + Geist + rounded-2xl + soft shadows)
- ✅ **Layout** (split-screen sticky dashboard + scrollable flow)
- ✅ **User journey** (wizard 7-step pagination → seamless single-page flow with realtime feedback)
- ✅ **Microcopy polish** (where new layout requires new labels/hints; existing OJK-lint registry strings preserved)

What does NOT change in Phase-2:
- ❌ **Behaviour** — all calculations, formulas, invariants, validations identical
- ❌ **Feature scope** — every Phase-1 input panel, KPI, sim, capacity wizard, pricing proxy, OJK disclaimer layer preserved
- ❌ **Data flow** — IndexedDB persistence, useDirtyGuard, demo seed, snapshot store shape all unchanged
- ❌ **Pricing wiring** — Yahoo / Pegadaian / CoinGecko proxies + 30s cooldown + LIVE/STALE/OVERRIDE pill behavior all unchanged
- ❌ **xlsx export** — 5 visible sheets + hidden `_meta` schema unchanged
- ❌ **Compliance posture** — descriptive "kamu" tone + 3-layer OJK disclaimer + descriptive zone labels all unchanged

If you find yourself editing `lib/finance/*`, `lib/prices/*`, `lib/snapshot/*`, `lib/types/*`, `lib/xlsx/*`, `server/api/*`, `lib/copy/{ojk-lint,metric-explainers}.ts`, or `lib/data/*` — **stop and reconsider**. The revamp does not need those. The detailed tables below are the contract enforcement.

### Reference status (locked, Codex round-1 2026-06-04)

- **`docs/ide_4_revamp/reff/*`** (in-repo ZIP archives of v0 / bolt outputs; canonical repo-contained reference) — **visual + layout + interaction-pattern reference only.** NOT a source of truth for:
  - feature scope (their 7 generic categories ≠ Cermat's 14 panels)
  - domain logic (their DSR/KPR calcs ≠ Cermat's `lib/finance/`)
  - copy/microcopy (theirs bypasses OJK-lint registry)
  - data flow (theirs uses localStorage; Cermat uses IndexedDB + Pinia store)
  - state shape (theirs is throwaway; Cermat's `lib/types/snapshot.ts` is the contract)
- Visual treatments OK to adopt: card shapes, spacing, gradient bg, emerald accent, sticky split-screen layout, surplus highlight bar styling, currency-input with Rp prefix.
- Everything else: derive from Phase-1 `lib/` + Phase-1 components.

### shadcn adoption posture

Revamp aesthetic is **shadcn-inspired**, but Cermat is a **Vue 3.5 + Nuxt 3 app**, not a Next.js+React project. **Adapt** patterns to Nuxt idioms — don't transplant shadcn-React component structure verbatim into Vue SFCs. Specifically:
- Use Nuxt auto-import + `components/common/*` primitives we already have (`ButtonPrimary`, `Card`, `InputCurrency`, etc.) — restyle, don't rewrite into shadcn-style `<Button variant="default" />` API.
- Use Pinia stores + composables for state, not React-style prop drilling or context.
- Use `<NuxtLink>` for routing, not `<Link>`/`<a>`.
- Use Tailwind v4 `@theme` block we already configured (see [[project-cermat-state]]), not shadcn's CSS-vars-in-`:root` convention.
- Result rule: revamp should look "tampan" *and* feel native to the existing Nuxt repo. If it feels like a half-transplanted Next.js project, back up and re-port.

---

## ⚠️ MVP Feature Preservation Guard (read before any line-item)

**Phase-2 revamp swaps the UI shell + tokens + journey. It does NOT change feature scope or behaviour.** v0 and bolt outputs are **visual + UX reference only** — their 7 generic categories ("Penghasilan/Pengeluaran/Tabungan/Investasi/Aset/Utang/Ringkasan") are a SIMPLIFICATION of what Cermat actually does. Treating them as the feature inventory will silently drop core MVP capabilities.

**Phase-1 truth (source: [`../1_mvp/journey-and-features.md`](../1_mvp/journey-and-features.md) §4.1–§4.4):**

| Surface | Phase-1 has (must preserve) | v0/bolt simplification (DO NOT adopt as scope) |
|---|---|---|
| **Snapshot input** | **14 panels** across Penghasilan, Pengeluaran, Aset Likuid (kas+deposito+RD 3-jenis+SBN), Saham per-emiten, Crypto 4-mode, Emas 5-kategori, Aset Non-Likuid, Gadai, Utang Pribadi, Cicilan Aktif 6-tipes | 7 generic categories with single inputs |
| **Saham** | Per-emiten panel, Yahoo Finance live, LIVE/STALE/OVERRIDE pill, lots target → Allocation Discipline, capital gain vs cost basis, duplicate-ticker warning | Single "Saham" amount field |
| **Crypto** | 4-mode (unit / IDR / USD / coingecko-coin), CoinGecko price proxy, capital gain unit-mode-only | Single "Crypto" amount field |
| **Emas** | 5 kategori (Antam fisik / perhiasan / etc.), kg-based, Pegadaian live, per-category refresh + 30s cooldown | Single "Emas" amount field |
| **Cicilan** | 6 tipes (KPR/KPM/Bank-KTA/Pinjol/Paylater/KK), quick-add chips, missing-bunga warning, FX-aware | Generic "Cicilan" line |
| **Gadai** | Jaminan tracking (emas/saham/aset), ownership invariant | (Not present) |
| **SBN** | Bunga + Safe Haven weighting, RDPU+RD-Pendapatan-Tetap filter | (Not present) |
| **Dashboard** | **HeroPair (NW + DSR)** + **9 KPI cards** + AllocationDonut + SafeHavenBar (ECharts async) + 9 MetricExplainer modals + Modal Likuid Options panel | 4 metric cards 2x2 (Penghasilan/Pengeluaran/Total Aset/Kekayaan Bersih) + Surplus highlight bar |
| **Pricing** | Yahoo (IDX + USDIDR) + Pegadaian + CoinGecko proxies, common envelope `{stale,fetchedAt}`, refresh button per panel, 30s cooldown, server cache invalidation | Static values |
| **Modal Siap** | Auto-generated distribusi suggestions + user-configurable include toggles + preview-only (zero-sum NW invariant) + 3rd OJK disclaimer layer | (Not present) |
| **Goals + FI** | FI auto `pengeluaran × 300` + multi-goal CRUD with bucket tagging + Goal Health | (Not in Phase-2a; lives in Plan module — Phase-2c) |
| **xlsx export** | 5 visible sheets + hidden `_meta`, TopNav button gated on `totalAset > 0` | (Not present) |
| **Persistence** | IndexedDB write per-input + cold-start recovery + useDirtyGuard composable | localStorage typical |
| **OJK posture** | 3-layer disclaimer + descriptive tone + ojk-lint via `lib/copy/strings.ts` + zone labels from explainer registry | Generic copy |

**Adoption rule:** v0/bolt reff inform **visual treatment** (rounded-2xl cards, soft shadows, gradient bg, emerald accent, split-screen sticky layout, surplus highlight bar styling, currency input with Rp prefix, action-card grid) — **NOT feature scope**. Every Phase-1 panel/control/calc/pricing/disclaimer must exist in revamp.

**Design choice surfaced (decide during Day 4-5 implementation):**

How to organize 14 panels under split-screen right column?
- **Option A (1:1):** 14 separate cards/sections, scrollable flow. Faithful to Phase-1 structure.
- **Option B (grouped):** Group under ~7 semantic headers (Penghasilan / Pengeluaran / Likuid / Investasi-Pasar / Investasi-Riil / Utang+Cicilan / Ringkasan), but every sub-panel + all controls preserved inside. Feels closer to revamp prompt without losing capability.
- **Default (Working Notes Day 4):** Option B — easier to visually anchor, matches v0(max)'s grouping style, no feature loss. Confirm during implementation or revisit.

---

## ⚠️ Calculation Function Preservation (lib/ directory contract)

**Phase-2a touches UI components only. The `lib/` directory is a CONTRACT — calculations, pricing proxies, formatting, OJK lint, and type definitions stay untouched.** Any change to `lib/finance/`, `lib/prices/`, `lib/format/`, `lib/snapshot/`, `lib/types/` during the revamp = scope creep + regression risk.

**Verified inventory (file count + responsibility, source: `find lib -type f -name "*.ts"` on `f822659`):**

### `lib/finance/` — calculation engine (DO NOT MODIFY in 2a)

| File | What it owns | User-named feature |
|---|---|---|
| `metrics.ts` | Net Worth, DSR, Safe Haven %, Allocation Discipline (avg pp drift), Goal Health share, Cicilan share, Runway, all 9 KPI computations + `emptyHintKey` per-metric prereq map | **Dashboard KPIs** |
| `amortization.ts` | Cicilan amortization: flat / floating / anuitas / revolving across 6 cicilan tipes | **Cicilan + Mau Cicil sim** |
| `goals.ts` | FI auto `pengeluaran × 300`, multi-goal bucket tagging, on/off threshold, FI zero-pengeluaran guard | **Plan / FI / Goal Health** |
| `emas.ts` | drainEmas (excludes pawned, cap at cadangan not total), gold valuation, kg-based math | **Emas section** |
| `fx.ts` | Multi-currency conversion, USD cost-basis persistence, FX-aware cicilan + DP waterfall | **Multi-currency penghasilan + Mau KPR DP scenarios** |
| `thresholds.ts` | DSR thresholds, Runway thresholds, Allocation zones (<5 / 5-15 / >15), Safe Haven weights | **Zone labels in dashboard** |
| `sims/_shared.ts` | Delta + bucket consistency helper for ALL sims | **All 6 sims** |
| `sims/mau-kpr.ts` | Property max + DP scenarios + FX-aware DP waterfall + delta table | **Mau KPR sim** |
| `sims/mau-gadai.ts` | Gram-aware gadai, jaminan invariant | **Mau Gadai sim** |
| `sims/mau-cicil.ts` | 6 cicilan tipes simulation | **Mau Cicil sim** |
| `sims/lunasi-utang.ts` | Payoff scenarios + delta vs snapshot | **Lunasi Utang sim** |
| `sims/max-utang.ts` | Multi-select tipes (KPM/Paylater overrides), DSR threshold-bounded | **Max Utang Aman cek-kapasitas** |
| `sims/custom.ts` | Free-form what-if | **Custom Skenario cek-kapasitas** |
| `sims/modal-options.ts` | Modal Siap auto-distribusi (one saham per emiten with target gap, RD-jenis filter for Safe Haven, multi-source drain) | **Modal Likuid Options panel** |
| `sims/deploy-preview.ts` | Preview-only zero-sum (Net Worth invariant) | **Modal Likuid Options panel** |

**Specifically user-mentioned calculations preserved (deviden, obligasi, saham):**
- **Deviden saham** — Day 4.7 dividend flow per-emiten; capital gain vs cost basis split (lives in `metrics.ts` + `sims/_shared.ts` flow into Saham UI). Don't touch the computation; just feed it from revamp Saham section.
- **Obligasi (SBN)** — bunga input + Safe Haven bobot (Safe Haven includes SBN + RD-Pendapatan-Tetap, NOT RD-Saham — `b70dce7` lock). Lives in `metrics.ts` Safe Haven aggregation + Aset Likuid input. Preserve filter rule.
- **Saham per-emiten** — capital gain vs cost basis, Allocation Discipline derived from lotsTarget (null when universe<2 — `1cdfc32` null guard), duplicate-ticker warning. All in `metrics.ts` + Saham UI component.
- **Bunga deposito** — suku bunga input per deposito row, contributes to penghasilan multi-source (Day 4 hardening `0b1c36f`).
- **Capital gain crypto** — unit-mode-only constraint (`85eb4aa`); the rule lives in `lib/snapshot/crypto-mode.ts` + crypto UI guard.

### `lib/prices/` — pricing proxies (DO NOT MODIFY in 2a)

| File | What it owns |
|---|---|
| `yahoo.ts` | IDX `/v7/spark` batch + `/v8/chart` single + USDIDR=X. **DON'T reintroduce `/v7/quote`** — it's dead (401), see [[project-cermat-state]]. |
| `pegadaian.ts` | `/gold/prices/savings`: `hargaJual`=buyback=valuation, `hargaBeli`=buy |
| `coingecko.ts` | Crypto coin lookup proxy |

Common envelope `{stale, fetchedAt}` + 30s cooldown per panel + server cache invalidation — all preserved at proxy level.

### `lib/snapshot/`, `lib/format/`, `lib/copy/`, `lib/types/`, `lib/xlsx/`, `lib/fixtures/`, `lib/data/`

- `snapshot/crypto-mode.ts` — crypto 4-mode handler (DON'T TOUCH)
- `format/{idr,percent,duration,parse-currency}.ts` — formatters; **DON'T reintroduce `\b` boundary in parse-currency** (see [[project-cermat-state]] fix note) — additions OK if revamp needs new helpers
- `copy/strings.ts` — i18n + OJK-lint registry; **may ADD revamp microcopy keys, must NOT REMOVE existing keys** (regression risk if some surface still references)
- `copy/ojk-lint.ts` + `copy/metric-explainers.ts` — DO NOT MODIFY
- `types/{goals,sim,snapshot}.ts` — data shape contracts; revamp UI consumes these but doesn't change them
- `xlsx/{sheets,workbook}.ts` — export logic + `buildWorkbook` helper (Phase-1 Day 10 `d2364b8`); xlsx still works in revamp via existing TopNav download (DON'T TOUCH)
- `fixtures/demoSnapshot.ts` — Rio persona seed; revamp's "Coba dengan data contoh" CTA still passes `?demo=1` to trigger this (DON'T REMOVE; small fixes OK)
- `data/coingecko-top-coins.ts` — coin catalog (DO NOT MODIFY)

### `server/api/prices/*` (DO NOT MODIFY in 2a)

Yahoo + Pegadaian + USDIDR + CoinGecko proxy endpoints — preserved as-is.

### Allowed in 2a

- **NEW**: `components/snapshot/SplitScreenShell.vue`, `DashboardSidebar.vue`, `sections/*.vue`
- **MODIFY**: `pages/index.vue`, `pages/app/snapshot.vue`, `components/common/*` (token swap), `pages/styleguide.vue`, `assets/css/main.css`, `nuxt.config.ts` (font + theme-color)
- **REPLACE-AFTER-PARITY**: obsolete wizard step pages are kept in the tree alongside the new split-screen surface during Days 4–5; deletion happens **only after Day 6 parity audit passes** (see hard gate below). Reframing per Codex round-1 2026-06-04: never delete the old surface before the new one is verified at parity — protects against accidentally shipping a regression that the test suite missed.
- **REWIRE (read-only)**: `lib/finance/metrics.ts` consumers in dashboard sidebar — read existing reactive values, don't change what `metrics.ts` returns

### Verification step (Day 6 already lists this — restated)

Manual MVP feature audit walks every preserved capability end-to-end. If a `lib/finance/*` or `lib/prices/*` file shows up in `git diff` between branch base and Phase-2a tip, **stop and reconsider** — likely scope creep.

---

## ⚠️ UI Behavior Contract (orchestration layer)

> The `lib/` contract above protects **calculations**. The contract below protects **UI orchestration** — *when* state writes happen, *when* warnings fire, *when* CTAs gate, *when* modals launch. Codex round-1 surfaced this gap 2026-06-04: visual refresh without preserving these timing/gating rules will silently regress the UX while every test still passes.

**Adoption rule:** for each row, the revamp surface must trigger the same behavior under the same condition. Restyle the affected element freely; do NOT change *when* it fires.

| # | Behavior | Phase-1 rule (must preserve) | Where it lives today | Revamp risk if missed |
|---|---|---|---|---|
| B1 | **Store writes** | Per-input write to snapshot store on each mutation; IndexedDB persistence layer mirrors store on every write (D11.1 cold-start recovery depends on this). | snapshot Pinia store + persistence composable | Form-level submit handler from v0/bolt = breaks cold-start recovery, breaks realtime dashboard |
| B2 | **Dirty state + unload guard** | `useDirtyGuard` composable fires `beforeunload` browser warning if there are mutations since last successful save (D11.1). | `composables/useDirtyGuard.ts` | Removing/rewiring = tab-close data loss |
| B3 | **Realtime dashboard reactivity** | Every per-input write → all 9 KPI cards + HeroPair + charts recompute in the same frame. No "Update" button gate. | snapshot store → `lib/finance/metrics.ts` reads → dashboard computed | Adding a manual "Recalculate" button = breaks the revamp's core "realtime" promise |
| B4 | **Duplicate-ticker warning (Saham + Crypto)** | Same ticker entered twice in per-emiten/per-coin panel → inline warning chip (Phase-1 invariant). | Saham + Crypto sections → store-derived computed | Generic "Saham" amount input from v0/bolt erases this safety net entirely |
| B5 | **Missing-bunga warning (Cicilan)** | Cicilan row without bunga value → warning chip + recompute marks DSR with caveat. | Cicilan section | Hiding behind collapsed sub-card = warning never seen |
| B6 | **Gadai jaminan ownership invariant** | Pawned > available emas/saham/aset → invariant violation warning blocks confused state (Phase-1 Day 7 Codex round-13 fix). | Gadai section + `lib/finance/emas.ts` `drainEmas` (excludes pawned) | Skipping check = wrong NW + wrong drain math |
| B7 | **FX mismatch (Cicilan FX-aware)** | Multi-currency cicilan vs penghasilan currency → FX-aware warning when mismatch material (Phase-1 Day 4 hardening). | Cicilan section + `lib/finance/fx.ts` | Silently dropping = wrong DSR for USD-debt users |
| B8 | **Chart empty-state gating** | AllocationDonut + SafeHavenBar mount gated on `totalAset > 0` (D11.6 perf). When 0, charts not rendered + descriptive empty hint. | DashboardSidebar mount logic | Always-mount = unnecessary ECharts cost + breaks D11.6 perf win |
| B9 | **Modal Likuid zero-sum invariant** | Preview-only: distribusi suggestions must sum to NW-neutral before user can "Terapkan"; violation blocks apply. | `lib/finance/sims/deploy-preview.ts` + Modal Likuid panel | Skipping check on revamped panel = NW corruption on apply |
| B10 | **xlsx download gating** | TopNav xlsx button `disabled when totalAset === 0` + descriptive tooltip explaining why; post-download success toast (Phase-1 Day 10). | TopNav + `lib/xlsx/workbook.ts` | Always-enabled = empty workbook export + user confusion |
| B11 | **Pricing refresh cooldown** | 30s cooldown per panel (Saham/Crypto/Emas refresh); LIVE/STALE/OVERRIDE pill reflects state from common `{stale, fetchedAt}` envelope. | Per-section refresh + `server/api/prices/*` cache | Removing cooldown = proxy hammering + Yahoo/CoinGecko rate-limit risk |
| B12 | **Demo seed CTA** | Landing "Coba dengan data contoh" CTA navigates to snapshot with `?demo=1` → Rio persona seed populates store + IndexedDB. | Landing CTA + `lib/fixtures/demoSnapshot.ts` | Dropping the query or renaming = demo CTA dead |
| B13 | **OJK 3-layer disclaimer** | DisclaimerBanner on snapshot + sim dialog disclaimers + GoalForm disclaimer (GoalForm = Phase-2c, but banner + sim layers in 2a scope). Copy sourced via `lib/copy/strings.ts` registry, NOT pulled verbatim from v0/bolt. | DisclaimerBanner + sim modals + `lib/copy/strings.ts` | Adopting v0/bolt copy = OJK lint regression + compliance posture broken |
| B14 | **Descriptive zone labels** | Dashboard KPI cards show descriptive zone labels (e.g., "Cukup leluasa" not "Good") sourced from `lib/copy/metric-explainers.ts` registry. | KPI cards + `metric-explainers.ts` | Hardcoding labels in revamp components = explainer registry drift |
| B15 | **MetricExplainer modal launch** | 9 KPI cards → click opens MetricExplainer modal with descriptive zone label + explainer copy from registry. All 9 preserved. | MetricExplainer component + KPI card click handler | Removing click handler in revamp = explainer discoverability gone |
| B16 | **Sim launch context (shared store reads)** | 6 capacity wizards + 5 decision wizards read snapshot via shared Pinia store (single source of truth); no detached/cloned form state. | Wizard pages → snapshot store reads | Detaching state in revamp = stale/divergent sim results |
| B17 | **Bottom-nav 4 tabs + Soon badge** | 4 tabs (Snapshot/Decide/Plan/Discover); Decide + Discover have "Soon" badge styling (Phase-1 MVP scope). | Layouts + BottomNav component | Removing tabs/badges = navigation regression + scope misrepresentation |
| B18 | **Save & Lanjutkan CTA** | "Simpan & Lanjutkan" bottom-bar CTA: always enabled (Phase-1 pattern — persistence is per-input on B1, so this button signals "I'm done snapshotting" rather than a write gate). Routes to next surface. | Snapshot bottom bar | Adding gating ("disabled until Penghasilan filled") = breaks per-input save model |

**Rule for Day 6 audit:** every row above is a *behavior* check, not just a *feature-presence* check. If a revamp surface technically has the element but its timing/gating differs from Phase-1, that counts as a regression and blocks the gate.

---

## Day 1 — Token foundation + Geist font

**Goal:** Lock new design tokens at the system level. No UI page work yet — just plumbing. Existing Phase-1 components will render with new tokens (likely visually rough until Day 2 refactor, that's expected).

- [ ] Install `@fontsource/geist-sans` (uninstall `@fontsource/plus-jakarta-sans` after Day 2 confirms no fallback usage)
- [ ] `nuxt.config.ts` — swap css array Plus Jakarta Sans imports → Geist Sans (400/500/600/700)
- [ ] `nuxt.config.ts` — `theme-color` meta `#1b4332` → emerald hex (`#059669` for emerald-600)
- [ ] `assets/css/main.css` `@theme` block:
  - Palette: emerald primary (`--color-primary: var(--color-emerald-600)` style), keep neutrals, deprecate Phase-1 deep-green
  - Gradient utility: `--bg-gradient-subtle: linear-gradient(to bottom, #fff, #f9fafb)` or `@utility bg-gradient-subtle`
  - Font-family: Geist Sans as default
  - Border-radius scale: ensure `rounded-2xl` token consistent
  - Shadow scale: confirm `shadow-sm` + `shadow-md` match revamp soft-shadow vibe
- [ ] `ide_3/personal-wealth-platform-design-guidelines-en.md`:
  - §1 (colors) — replace Phase-1 palette with emerald-led; add gradient bg note
  - §2 (typography) — Geist Sans + scale unchanged (revamp prompt no new scale)
  - §3 (component patterns) — add rounded-2xl + soft shadow pattern note
- [ ] `ide_3/cermat-design-decisions-en.md` — append D2.1 + D2.5 entries with rationale ("Phase-2 revamp: full token accept, Geist over Plus Jakarta Sans, shadcn-inspired aesthetic for trust + 'lebih tampan'")
- [ ] Verify `pnpm dev` boots + landing/snapshot still routable (visual breakage OK at this point — Day 2 fixes)

**Done when:** new tokens in `@theme`, Geist self-hosted, ide_3 specs reflect locks. `pnpm build` succeeds.

---

## Day 2 — Common primitives refactor + styleguide

**Goal:** All `components/common/*` primitives consume new tokens. After this day, existing wizard surface should look "Phase-1 structure with new tokens" — no layout shift yet.

- [ ] Audit `components/common/*` for hardcoded color refs (`#1b4332`, `green-700` etc) — replace with token vars
- [ ] `ButtonPrimary` — emerald primary, rounded-2xl variant if specified by revamp; outline variant if exists
- [ ] `InputCurrency` + `InputQuantity` — new border + focus ring (emerald), rounded scale
- [ ] `Card` (if dedicated; otherwise the `<div>` patterns sprinkled) — rounded-2xl + shadow-sm + hover:shadow-md
- [ ] `StatusDot`, `Pill` (PillLive, PillStale, etc) — emerald-tint where green was used
- [ ] `DisclaimerBanner` — verify still readable on new gradient bg
- [ ] `MetricCard` (9-metric Phase-1 primitive) — new card shape + token compliance
- [ ] `FooterDisclaimer` — typography swap visual check
- [ ] `pages/styleguide.vue` — mirror new tokens, render every primitive variant
- [ ] `pnpm typecheck` + `pnpm lint` clean
- [ ] `pnpm test` — fix anything that snapshot-tests visual classes (likely a few breaks)

**Done when:** styleguide page renders all primitives with new tokens, existing snapshot wizard still functional + uses new look at primitive level.

---

## Day 3 — Landing page revamp

**Goal:** `pages/index.vue` matches revamp prompt spec.

- [ ] Nav bar — logo left ("Cermat" bold slate-900 + shield/wallet emerald icon), "Cek Keuangan dalam 10 Menit" gray text right
- [ ] Hero section — `py-24` generous padding, center-aligned
- [ ] H1 — "Aman gak kalau gw KPR, Gadai, atau Cicil?" (`text-4xl` atau `text-5xl` bold slate-900)
- [ ] Sub-headline — "Berapa max utang yang aman? Cek keuangan kamu dalam 10 menit." (`text-lg text-slate-600 mt-4`)
- [ ] Trust badges — flex row centered, pill-shape (`bg-green-50 text-emerald-700 border border-green-100`):
  - Badge 1: Lock icon + "Tanpa daftar"
  - Badge 2: Cloud-Off icon + "Tanpa cloud"
- [ ] Action cards grid — 2-col `max-w-4xl gap-6 centered`:
  - **Card 1 (Primary):** subtle green top border, user/document icon emerald-soft box, title "Mulai dari Snapshot" `text-xl bold`, desc "Isi data kamu sendiri (5–10 menit)", solid emerald button "Mulai →"
  - **Card 2 (Secondary):** standard border, play/sparkle icon gray-soft box, title "Coba dengan data contoh" `text-xl bold`, desc "Skip dulu, lihat tools-nya", outline button "Coba →"
- [ ] Footer — center small gray "Cermat. Data diproses secara lokal di browser Anda untuk privasi maksimal." + lock icon
- [ ] Verify routes — Primary CTA → `/app/snapshot`, Secondary CTA → `/app/snapshot?demo=true` (or similar query convention)
- [ ] Smoke: landing renders pixel-close to revamp prompt; CTAs navigate; no console errors

**Done when:** landing page = revamp spec, both CTAs route correctly.

---

## Day 4 — Snapshot split-screen shell + Dashboard sidebar

**Goal:** Layout shell + sticky left dashboard. Right column still empty/stub OK.

**Preservation note:** Phase-1 dashboard = HeroPair (NW + DSR) + 9 KPI cards + AllocationDonut + SafeHavenBar (ECharts) + 9 MetricExplainer modals + Modal Likuid Options panel. v0/bolt's "4 metric cards 2x2 + Surplus bar" is a **visual pattern to adopt**, NOT a replacement for Phase-1's 9-KPI semantic content. Treat the sticky-left dashboard as a **revamp of how the existing 9-KPI dashboard is laid out**, not as a stripped-down version.

- [ ] Top header — Cermat emerald logo + subtext "Kalkulator Keuangan" left, oval gray badge "Gratis - Tanpa Login" right
- [ ] `components/snapshot/SplitScreenShell.vue` — desktop: sticky-left + scroll-right (`grid lg:grid-cols-[360px_1fr]` or similar); mobile: stacked (dashboard collapsible at top OR drawer pattern)
- [ ] `components/snapshot/DashboardSidebar.vue` — revamp of Phase-1 dashboard panel:
  - Title "Ringkasan Cepat"
  - **Top: HeroPair** — Net Worth + DSR side-by-side, prominent, with descriptive zone label from explainer registry (Phase-1 preserved)
  - **Surplus highlight bar** — `bg-emerald-50` larger card, "Surplus Bulanan" prominent value (new revamp pattern, adopted from v0/bolt)
  - **9 KPI cards** — compact stacked or 2-col grid (Net Worth, DSR, Goal Health, Safe Haven %, Allocation Discipline, Cicilan share, ...) — preserve every Phase-1 KPI, just restyled to new tokens. Per-metric empty-state hints preserved (D0.5).
  - **AllocationDonut + SafeHavenBar** — ECharts async, mount gated on `totalAset > 0` (Phase-1 D11.6 perf preserved). May render compact inside sidebar OR moved to a "Lihat Visual" expandable section if vertical space tight.
  - **MetricExplainer modals** — all 9 preserved, descriptive copy untouched
  - **Modal Likuid Options panel** — preserved (lives lower in dashboard or as collapsible section)
- [ ] Wire to existing Phase-1 snapshot store (NOT new state shape — read from existing Pinia / composable shared state)
- [ ] Mobile: stacked layout responsive at < `lg` breakpoint (decide: top collapsible vs drawer — pick simpler, document in Working Notes)
- [ ] Sticky behavior: dashboard stays visible while user scrolls right column (test long-content scroll)
- [ ] Vertical density audit — sticky sidebar with HeroPair + 9 cards + 2 charts + Modal Likuid panel may overflow viewport; design fallback (sticky top section + scrollable lower section, OR per-section collapsibles)

**Done when:** split-screen shell renders, sidebar shows full Phase-1 dashboard content with new token styling, sticky on desktop, stacked on mobile, all 9 metrics live-update.

---

## Day 5 — Right column sections + realtime wiring

**Goal:** Right column scrollable flow with all Phase-1 input panels grouped under section headers, input → dashboard reactive. Default grouping per "Option B" in Preservation Guard (~7 headers, all sub-panels preserved inside). Adjust per implementation feel.

**Preservation rule:** Every Phase-1 panel + its controls + its live-pricing wiring + its warnings + its OJK-compliant copy must exist in the revamp. Do NOT pull simpler input shapes from v0/bolt — use Phase-1 components as the source-of-truth, restyled.

### Section grouping (tentative — adjust during implementation)

- [ ] **`components/snapshot/sections/Penghasilan.vue`** — primary salary + multi-source tambahan + multi-currency support (Phase-1 Day 4.7 "Stitch parity" 3-row penghasilan preserved); subtitle hints, info-tooltip icons; emerald-soft subtotal card "Total Penghasilan Bulanan"; success-state checkmark
- [ ] **`components/snapshot/sections/Pengeluaran.vue`** — pokok + lifestyle split; cicilan ENTERED ONCE here per Phase-1 cicilan single-entry rule; subtotal "Total Pengeluaran" (pokok+lifestyle+Σcicilan)
- [ ] **`components/snapshot/sections/AsetLikuid.vue`** — Kas + Deposito (suku bunga input) + Reksa Dana (3 jenis: RDPU / RD-Pendapatan-Tetap / RD-Saham) + SBN (bunga + Safe Haven bobot)
- [ ] **`components/snapshot/sections/Saham.vue`** — **per-emiten panel preserved as-is functionally**: ticker search, LIVE/STALE/OVERRIDE pill, lots target → Allocation Discipline derivation, capital gain vs cost basis, duplicate-ticker warning, refresh button + 30s cooldown, Yahoo Finance live pricing wiring
- [ ] **`components/snapshot/sections/Crypto.vue`** — **4-mode panel preserved** (unit / IDR / USD / coingecko-coin), CoinGecko price proxy, capital gain unit-mode-only, cold-start recovery, same-mode no-op guard, duplicate-ticker warning parity
- [ ] **`components/snapshot/sections/Emas.vue`** — **5 kategori preserved** (Antam fisik / perhiasan / etc.), kg-based input, Pegadaian rate proxy, per-category refresh button + 30s cooldown; drainEmas excludes pawned (Phase-1 fix preserved)
- [ ] **`components/snapshot/sections/AsetNonLikuid.vue`** — Properti + Kendaraan + Lainnya
- [ ] **`components/snapshot/sections/Gadai.vue`** — Jaminan tracking (emas / saham / aset), ownership invariant preserved (Phase-1 Day 7 Codex round-13 fix)
- [ ] **`components/snapshot/sections/Utang.vue`** — Utang Pribadi + Cicilan Aktif **6 tipes preserved** (KPR / KPM / Bank-KTA / Pinjol / Paylater / KK), quick-add chips, missing-bunga warning, FX-aware (Phase-1 Day 4 hardening preserved)
- [ ] **`components/snapshot/sections/Ringkasan.vue`** — recap; references dashboard's 9 KPIs (don't duplicate the cards here, link/anchor instead)
- [ ] Vertical timeline/progress connector on left of right column connecting section headers
- [ ] Bottom action bar — outline "Sebelumnya" left, solid emerald "Simpan & Lanjutkan" right, below: lock icon + "Privasi Anda terjaga. Data disimpan lokal di browser Anda, tidak dikirim ke server."

### Wiring + persistence

- [ ] Realtime: any input change → dashboard 9-KPI + HeroPair + charts recalc (verify all panels: Penghasilan → DSR + Surplus; Saham → Net Worth + Allocation Discipline; Cicilan → DSR; Emas → Safe Haven %; etc.)
- [ ] Persistence: IndexedDB write per-input (Phase-1 pattern preserved — don't rewrite)
- [ ] Dirty-guard: `useDirtyGuard` composable still triggers on tab close mid-edit (Phase-1 D11.1)
- [ ] Pricing proxies: server endpoints (idx, gold, usdidr, coingecko) untouched — wire reads from existing composables
- [ ] Demo seed: `?demo=1` triggers Rio persona seed (Phase-1 demo seed preserved); landing's "Coba dengan data contoh" CTA passes the flag

### OJK compliance preserved

- [ ] DisclaimerBanner present on snapshot route
- [ ] Tone: "kamu" casual, descriptive (never advisory); ojk-lint via existing `lib/copy/strings.ts` registry — DON'T pull copy from v0/bolt verbatim (their copy doesn't go through ojk-lint)
- [ ] Zone labels in dashboard sourced from explainer registry (Phase-1 `81d1a3e`)
- [ ] All status framing copy ("Surplus", "On track", etc.) preserved from `strings.ts`

**Done when:** all Phase-1 input panels reachable in revamp UI, every panel functional incl. live pricing, every warning/invariant intact (per [[no-overclaim-checklist]] verify against actual code not memory), type in any panel → all 9 dashboard KPIs reactive, reload restores values, demo seed works.

---

## Day 6 — Parity hard gate + cleanup + Codex prep

**Framing (hardened per Codex round-1 2026-06-04):** Day 6 is **NOT** a closing checklist. It is a **blocking gate**. Phase-2a is **not mergeable** unless **every** item below passes. If any single row fails, the gate is closed: do NOT delete the old wizard surface, do NOT open the Codex review, do NOT advertise the milestone as done. Fix the regression, re-run the audit, only then proceed.

**Hard-gate exit criteria (all required):**

1. **MVP feature audit** — every row in the Feature Preservation Guard table renders + functions on the revamp surface. (See checklist below.)
2. **UI Behavior Contract audit** — every row B1–B18 in the Behavior Contract table triggers under the same condition as Phase-1. (See behavior smoke below.)
3. **Calc preservation** — `git diff main..phase-2a -- lib/finance lib/prices lib/snapshot lib/types lib/xlsx server/api` returns **zero lines**. (Allowed changes are documented in "Allowed in 2a" — any unexpected diff = scope creep.)
4. **Test suite** — `pnpm typecheck` (vue-tsc) + `pnpm lint` + `pnpm test` all green, count delta documented.
5. **Manual smoke** — desktop + mobile viewport flows below all pass.
6. **`?demo=1`** — Rio persona loads, all panels populated, all warnings/disclaimers visible.
7. **Compliance posture** — OJK 3-layer disclaimer present, copy still sourced from `lib/copy/strings.ts` (no verbatim v0/bolt copy).

Only after **all 7 criteria pass**, proceed to: (a) delete obsolete wizard step pages (per "REPLACE-AFTER-PARITY" rule), (b) Vercel deploy preview, (c) submit Codex review round-2.

---

### Day 6 task list

- [ ] **Run calc-preservation diff guard first** — `git diff main..HEAD -- lib/finance lib/prices lib/snapshot lib/types lib/xlsx server/api` must be empty. If not, revert before going further.
- [ ] **Replace-after-parity:** only delete old wizard step pages AFTER the MVP feature audit + Behavior Contract audit both pass below
- [ ] Update any router config / nuxt page links that reference old wizard URLs (defer actual file deletion until audit passes)
- [ ] Prune obsolete tests — wizard step component tests that no longer apply
- [ ] Add new tests:
  - SplitScreenShell layout (desktop vs mobile)
  - DashboardSidebar — all 9 KPI cards reactivity + HeroPair update
  - Per-section panel: Saham per-emiten LIVE pill rendering, Crypto 4-mode toggle, Emas 5-kategori refresh, Cicilan 6-tipes quick-add
  - Realtime wiring per panel → dashboard
  - Persistence round-trip (write → reload → restore)
  - Demo seed `?demo=1` populates Rio persona correctly
- [ ] `pnpm typecheck` (vue-tsc) clean
- [ ] `pnpm lint` clean
- [ ] `pnpm test` all green (target 326 → ~340 after prune + add)
- [ ] **MVP feature audit** (per Preservation Guard table at top) — for each row, manually verify revamp surface still has the capability:
  - [ ] 14 input panels reachable
  - [ ] Saham per-emiten LIVE/STALE/OVERRIDE pill + lots target + duplicate-ticker warning + capital gain
  - [ ] Crypto 4-mode (try each mode end-to-end)
  - [ ] Emas 5-kategori (try refresh on Antam)
  - [ ] Cicilan 6 tipes (quick-add chips, missing-bunga warning fires)
  - [ ] Gadai jaminan ownership invariant (try pawning > available emas → warn)
  - [ ] SBN safe-haven weighting reflected on dashboard
  - [ ] 9 KPI cards rendered + 9 MetricExplainer modals open + Modal Likuid Options panel works
  - [ ] AllocationDonut + SafeHavenBar render when `totalAset > 0`, hidden when empty
  - [ ] OJK 3-layer disclaimer present (banner + sim dialog + GoalForm — GoalForm gets revamp in 2c, just confirm banner still wired here)
  - [ ] xlsx export still works (TopNav button enabled with non-zero totalAset; post-download toast)
- [ ] **UI Behavior Contract audit** (per Behavior Contract table B1–B18) — manually trigger each behavior + verify it fires under the same condition as Phase-1:
  - [ ] B1 Store writes: type in any input → DevTools shows store mutation + IndexedDB write in same tick (no debounce gap)
  - [ ] B2 Dirty guard: enter a value → close tab → `beforeunload` warning fires
  - [ ] B3 Realtime dashboard: type in Penghasilan → DSR + Surplus + Net Worth recompute same frame, no manual "Recalculate" button needed
  - [ ] B4 Duplicate-ticker (Saham + Crypto): add same ticker twice → warning chip renders inline
  - [ ] B5 Missing-bunga: add Cicilan row, leave bunga blank → warning chip surfaces
  - [ ] B6 Gadai invariant: pawn > available emas → invariant warning blocks (or visibly flags) state
  - [ ] B7 FX mismatch: USD cicilan + IDR penghasilan → FX-aware warning
  - [ ] B8 Chart empty-state: empty snapshot → AllocationDonut + SafeHavenBar NOT mounted (verify in DevTools); add asset → charts mount
  - [ ] B9 Modal Likuid zero-sum: open Modal Likuid → preview suggestions → distribusi sums to NW-neutral before "Terapkan" enables
  - [ ] B10 xlsx gating: empty snapshot → TopNav xlsx button disabled + tooltip; add asset → button enables; click → 5-sheet workbook downloads + toast fires
  - [ ] B11 Pricing cooldown: click refresh on Emas → LIVE pill flips; click again within 30s → cooldown enforced (button disabled or no-op)
  - [ ] B12 Demo CTA: from landing, click "Coba dengan data contoh" → URL has `?demo=1` → Rio persona populated
  - [ ] B13 OJK disclaimer: snapshot route renders DisclaimerBanner; open any sim modal → disclaimer present; copy matches `lib/copy/strings.ts` (spot-grep a known phrase)
  - [ ] B14 Zone labels: hover/click each KPI card → label matches registry (e.g., DSR shows "Cukup leluasa" not "Good")
  - [ ] B15 MetricExplainer: click each of 9 KPI cards → MetricExplainer modal opens with descriptive copy
  - [ ] B16 Sim launch: open any capacity wizard → form pre-populated from snapshot store (not blank, not detached copy)
  - [ ] B17 Bottom-nav: 4 tabs visible, Decide + Discover show "Soon" badge, active-state styling works
  - [ ] B18 Save & Lanjutkan: bottom-bar CTA always enabled; click → routes to next surface; data already persisted (per B1) so route works even if you skip the click
- [ ] Manual smoke flow (desktop + mobile viewport):
  - Landing → primary CTA → snapshot empty state
  - Fill Penghasilan → DSR + Surplus + relevant KPIs update
  - Fill Saham per-emiten → Net Worth + Allocation Discipline update
  - Fill Cicilan → DSR updates, missing-bunga warning surfaces if applicable
  - Refresh emas/saham → LIVE pill flips, 30s cooldown enforces
  - Save → reload page → all values restored from IndexedDB
  - Tab close mid-edit → dirty-guard prompt fires
  - Demo seed via `?demo=1` → Rio persona loads, all panels populated
  - Mobile viewport: stacked layout sane, dashboard accessible, all controls usable
- [ ] **Gate decision point:** all 7 hard-gate exit criteria above pass? If NO → stop, fix, re-audit, do not proceed. If YES → continue:
- [ ] Delete obsolete wizard step pages (now safe per REPLACE-AFTER-PARITY rule)
- [ ] Commit (HEREDOC, Co-Authored-By per Phase-1 pattern)
- [ ] Vercel deploy preview
- [ ] Lighthouse spot-check on preview URL (target ≥85 mobile per Phase-1 D11.6 deferred goal)
- [ ] Codex review round-2 Phase-2a — submit + address findings before merging to main

**Done when:** all 7 hard-gate exit criteria pass + obsolete wizard files deleted + Codex round-2 LGTM. Phase-2a merged to main → unlocks Phase-2b (and **narrowed** Phase-3 parallel scope: parser/schema/backend only — see [scope-and-plan.md](./scope-and-plan.md) D2.7 narrowing).

---

## Out of scope for 2a (deferred to 2b / 2c)

- 6 wizards restyle (Phase-2b)
- Plan module + FI card + GoalForm + WizardModalOptions (Phase-2c)
- Capacity result panels (Phase-2b, ride with wizard restyle)
- Decide / Discover modules — stay 'Soon'-tagged

## Working notes (append-only)

- **2026-06-03** — Plan drafted. Day 4 mobile pattern undecided (top-collapsible vs drawer) — document choice when implementing. Day 1 expected to look temporarily ugly until Day 2 primitives refactor; commit per-day OK if work clean, but visual coherence only guaranteed after Day 3 (landing) at earliest.
- **2026-06-03 (later)** — User flagged MVP feature preservation risk: "fungsi2 yang ada di mvp tetap ada di revamp baru, terutama di snapshot, seperti yang saham, crypto emas dan lain-lain jadikan v0 dan bolt hanya sebagai referensi." Added Preservation Guard section at top; rewrote Day 4 dashboard plan (9 KPI + HeroPair + ECharts preserved, not 4-card simplification) + Day 5 section list (10 input panel components, not 7 generic) + Day 6 MVP feature audit checklist. v0/bolt now framed strictly as visual/UX reff. See [[feedback-revamp-feature-preservation]].
- **2026-06-03 (later, follow-up #2)** — User reinforced: "pastikan pula semua fitur2 tetap ada, semua fungsi kalkulasi seperti deviden obligasi saham dan lain tetap ada." Added Calculation Function Preservation section with verified `lib/` inventory (~30 .ts files), explicit lib/ directory contract (DON'T MODIFY lib/finance, lib/prices, lib/snapshot, lib/types, lib/xlsx during 2a), user-named calculations (deviden, obligasi, saham) cross-referenced to their file homes.
- **2026-06-03 (later, follow-up #3)** — User locked the principle verbatim: "ini tuh cuma ubah tata letak dan designya aja tanpa ubah behviournya, soalnya yg mvp tampilannya jadul dan ga user friendly dan user journeynya jelek." Added 🎯 Phase-2 Core Principle banner at very top of plan: change = visual design + layout + user journey + microcopy polish; unchanged = behaviour + feature scope + data flow + pricing wiring + xlsx + compliance posture. This is now the headline rule, all subsequent line-items derive from it.
- **2026-06-04 (Codex round-1 feedback)** — 7 points from Codex addressed: (P1) sharpened `ide_4_revamp/reff/*` framing as visual-only reference + explicit non-source-of-truth list; (P2) **NEW** UI Behavior Contract section B1–B18 covering store writes, dirty guard, realtime reactivity, warnings, CTA gating, xlsx gating, sim launch, OJK posture — closes the orchestration-layer gap that the lib/ contract didn't cover; (P3) README sync to reflect D2.1–D2.7 locked; (P4) Phase-3 parallel claim narrowed in `scope-and-plan.md` to parser/schema/backend only (UX integration blocks on 2a parity); (P5) Day 6 reframed as **hard gate** with 7 explicit exit criteria + gate-decision-point in task list; (P6) "delete old files" reworded to **REPLACE-AFTER-PARITY** in Allowed-in-2a + Day 6; (P7) shadcn adoption posture added — adapt patterns to Nuxt/Vue idioms, do not transplant React component shapes verbatim. Plan is now ready for Codex round-2 review pass.
