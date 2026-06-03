# Cermat MVP — Journey & Features

Process narrative + feature inventory for Phase 1 (MVP). Pairs with the canonical specs in [`docs/ide_3/`](../../ide_3/) — see [`README.md`](./README.md) for the spec index.

---

## 1. What Cermat is

**Cermat** = privacy-first personal wealth web app for Indonesian adults. Track → Plan → Decide → Discover via decision simulators ("Mau X?") and capacity simulators ("Bisa apa? Berapa max?").

**Privacy stance** — 100% client-side state, no auth, no cloud. Data lives in the browser; the only network calls are read-only price proxies (Yahoo for IDX stocks, CoinGecko for crypto, Pegadaian for gold). User-facing trust line: *"Tanpa daftar. Tanpa cloud."*

**OJK posture** — "advice-adjacent" by design. Every panel is **descriptive**, never advisory. Zone labels (Sehat / Waspada / Bahaya) describe state, not prescription. Three disclaimer layers (banner + simulator dialog + GoalForm) keep the boundary clear.

**Brand** — *"Cermat"* locked 2026-05-30.

---

## 2. Tech stack (locked)

| Layer | Choice | Why locked |
|---|---|---|
| Framework | Nuxt **3.21.6** + Vue 3.5 | SSR + filesystem router + auto-imports |
| Language | TS strict + `noUncheckedIndexedAccess` + `typeCheck: true` | catch index errors early; vue-tsc in build |
| Styling | Tailwind **v4** via `@tailwindcss/vite` plugin | v4 dropped `@nuxtjs/tailwindcss` module path; tokens in `assets/css/main.css` `@theme` block |
| State | Pinia 2.3 | snapshot, goals, derived |
| Charts | ECharts (async, tree-shaken) | imported on-demand to keep bundle small |
| xlsx | SheetJS (dynamic import) | first click pays the load; small landing bundle |
| Fonts | @fontsource/plus-jakarta-sans (self-hosted) | no Google Fonts CDN — privacy |
| Icons | lucide-vue-next | tree-shakable |
| Validation | zod | input schema |
| Test | vitest | unit + integration |
| Package manager | pnpm **11.5** via corepack | `pnpm-workspace.yaml` `allowBuilds:` map (NOT deprecated `package.json` `pnpm.onlyBuiltDependencies`) |
| Deploy | Nitro `vercel-edge` preset | edge function `~544 KB / 166 KB gzip` |

**Vite cross-version bridge** — Tailwind v4 ships Vite 7 types while Nuxt 3.21 graph uses Vite 5; `plugins: [tailwindcss() as never]` cast in `nuxt.config.ts` is intentional, documented in-line.

---

## 3. Architecture

```
pages/
  index.vue              # Landing — dual CTA (Snapshot / Demo)
  styleguide.vue         # Primitive showcase
  app/
    index.vue            # /app → snapshot redirect
    snapshot.vue         # 3-pane input
    goals.vue            # Goals CRUD
    simulator.vue        # Simulasi Keputusan + Cek Kapasitas launchers

layouts/
  default.vue            # Landing layout (header + FooterDisclaimer)
  app.vue                # App layout (TopNav + TabBar + FooterDisclaimer)

components/
  common/                # 9 primitives (Button, Input, Pill, StatusDot, …)
  layout/                # TopNav, TabBar, FooterDisclaimer, DashboardPanel
  snapshot/              # 14 input panels (Penghasilan, Pengeluaran, Aset, Cicilan, …)
  goals/                 # GoalCard, FiGoalCard, GoalForm
  dashboard/             # 9 metric cards + explainer modals + AllocationDonut + SafeHavenBar + ModalOptionsPanel + HeroPair
  simulator/             # SimulatorHost + 6 sims (Mau KPR/Gadai/Cicil, Lunasi, Max Utang, Custom) + capacity launcher cards

composables/
  useXlsx.ts             # Async SheetJS, build workbook, trigger browser download
  …

stores/
  snapshot.ts            # Source of truth for input state
  goals.ts               # Goals list + FI multiplier (locked 300 = 4% rule)
  derived.ts             # All metrics (Net Worth, DSR, Goal Health, Safe Haven %, Allocation Discipline, …)

lib/
  copy/strings.ts        # Single string table — every UI text routes through t()
  copy/ojk-lint.ts       # Unit-tested rule: descriptive vocab, no advisory phrasing
  format/                # idr, percent, duration, parse-currency (Infinity-safe via Number.isFinite)
  finance/               # amortization, emas, goals, capacity helpers, sim _shared.ts
  prices/                # yahoo, coingecko, pegadaian (server-proxy clients)
  fixtures/demoSnapshot.ts  # Anonymized persona "Rio, 32, karyawan UMR-range Jakarta + freelance + kos"
  types/                  # snapshot, goals, capacity, sim

server/api/
  prices/{idx,crypto,emas,usdidr}.ts   # Read-only proxies with cache invalidation
```

**Data flow** — User input → Pinia `snapshot` store → `derived` store recomputes metrics reactively → Dashboard renders. Simulator screens read snapshot + write to local sim state (not back to store, unless user explicitly applies).

---

## 4. Feature inventory

### 4.1 Track — Snapshot
14 input panels covering the full balance sheet:
- **Penghasilan** — primary + multi-source tambahan (multi-currency)
- **Pengeluaran** — pokok + lifestyle split
- **Aset Likuid** — kas, deposito (suku bunga), reksa dana (3 jenis), SBN (bunga + bobot Safe Haven)
- **Saham** — per-emiten panel with Yahoo Finance live prices, LIVE/STALE/OVERRIDE pill, lots target → Allocation Discipline derivation, capital gain vs cost basis, duplicate-ticker warning
- **Crypto** — 4-mode panel (unit / IDR / USD / coingecko-coin), capital gain (mode=unit only), CoinGecko price proxy
- **Emas** — 5 categories (Antam fisik, perhiasan, …), kg-based with Pegadaian rate proxy, per-category refresh
- **Aset Non-Likuid** — properti, kendaraan, lainnya
- **Gadai** — jaminan tracking (emas / saham / aset), ownership invariant
- **Utang Pribadi**
- **Cicilan Aktif** — 6 tipes (KPR, KPM, Bank/KTA, Pinjol, Paylater, KK), quick-add chips, missing-bunga warning

### 4.2 Plan — Goals (Day 5)
- **FI Goal** — auto-formula: `pengeluaran × 300` (FI multiplier locked at 300 = 4% rule per D0.2)
- **Custom goals** — multi-goal CRUD with bucket tagging (which assets count toward this goal)
- **Goal Health** — share of active goals with status `on` (descriptive percent)

### 4.3 Decide — Simulasi Keputusan + Cek Kapasitas
Six simulators, all rebranded from "Wizard" → "Sim" on 2026-06-03 (`4df4bcd` + `278d831`):

**Simulasi Keputusan** ("if I do X, what happens?")
- **Mau KPR** — property max + DP scenarios, FX-aware DP waterfall, delta table
- **Mau Gadai** — gram-aware, gadai jaminan invariant
- **Mau Cicil** — flat/floating/anuitas/revolving across 6 cicilan tipes
- **Lunasi Utang** — payoff scenarios, delta vs snapshot

**Cek Kapasitas** ("what's the max I could safely take on?")
- **Max Utang Aman** — multi-select tipes (any combo of KPR + KPM + Paylater pickable), KPM/Paylater overrides, DSR threshold-bounded
- **Custom Skenario** — free-form what-if

All sims write through `lib/finance/sims/_shared.ts` for delta + bucket consistency.

### 4.4 Discover — Dashboard
- **HeroPair** — Net Worth + DSR side-by-side (descriptive zone label sourced from metric explainer registry)
- **9 KPI cards** — Net Worth, DSR, Goal Health, Safe Haven %, Allocation Discipline (derived from lotsTarget, null when universe <2), Cicilan share, …
- **AllocationDonut** + **SafeHavenBar** — ECharts async, symmetric empty states
- **9 MetricExplainer modals** — descriptive what/how, never "you should…"
- **Modal Likuid Options panel** (Day 9) — auto-generated "Modal Siap" distribution suggestions with user-configurable include toggles (saham/emas/sbn); preview-only flow (zero-sum: Net Worth invariant preserved); 3rd OJK disclaimer layer embedded

### 4.5 Export — xlsx (Day 10)
- **5 visible sheets** — Ringkasan, Snapshot, Per-Emiten, Cicilan-Aktif, Goals
- **1 hidden sheet** — `_meta` (cermat_schema_version=1 + exported_at + full state JSON)
- TopNav download disabled while `totalAset === 0` (tooltip "Tambahkan minimal 1 aset"); post-download toast "Tersimpan. Simpan baik-baik ya."
- `useXlsx.ts` dynamic-imports SheetJS so first click pays the load (small landing bundle)
- Skenario + Kapasitas sheets **deferred** to Phase-2 (no persisted scenarios store yet)

### 4.6 Demo seed
Anonymized persona **Rio, 32** — karyawan UMR-range Jakarta + freelance + sewa kos. `?demo=1` query triggers seed; landing's "Coba dengan data contoh" CTA passes the flag. Realistic DSR + safe-haven-dominant profile, mixed crypto modes for parity coverage.

---

## 5. Development journey

11-day plan, scoped on PRD §4. Each day shipped, was reviewed externally by Codex, then patched in-session. Test count grew alongside scope; lint + vue-tsc gates green across all merges.

### Day 0 — Scaffold + decisions
- Locked brand "Cermat" (2026-05-30)
- Locked FI multiplier `300` (4% rule) → `D0.2` closed
- Planned 11-day delivery with hard-floor MVP scope

### Day 1 — Foundation (`e6ef514`)
Nuxt scaffold, design tokens (`assets/css/main.css` `@theme`), 9 primitives, landing dual-CTA, footer disclaimer, baseline tests green.

**Day 1.5 review-fix** (`fc39c86`) — Codex round 1 surfaced 11 issues (2 Blockers / 4 High / 4 Medium / 1 Low). All blockers + highs + most mediums fixed: Vite version bridge, hydration `useId()` replaces `Math.random()`, NBSP removal in `idr.ts`, `pages/app/snapshot.vue` placeholder created (was 404'ing), DisclaimerBanner default flows through ojk-lint, Infinity-safe `Number.isFinite` swap, +18 format test cases.

### Day 2 — Price proxy (`018dfa9`, `a8097ce`)
Server endpoints (idx, gold, usdidr), composables, tests. `ssr: false` on `/app` (a Codex round-3 catch — client-only routes for snapshot-dependent renders).

### Day 3 — Snapshot core (`bf1aba2` + rounds 3.1–3.4)
- `3.1` (`37f32d1`, `7354b15`) navbar subtitle + Codex round-4
- `3.2` (`6cb4519`, `b4317f6`) Screen 10 all-empty alignment + CTA demo polish
- `3.3` (`5a36520`, `13a4486`) 9 metric explainer modals + modal a11y/scroll-lock cleanup
- `3.4` (`e1bcd69`, `964de16`, `77725f3`) crypto panel — dropdown + 4-mode + multi-currency + cold-start recovery + same-mode no-op guard

### Day 4 — Saham per-emiten + charts (`35a95d2` → `02a6a3f`)
- Per-emiten panel with LIVE/STALE/OVERRIDE pill (`35a95d2`)
- Codex round-8 — stock override precedence + form a11y (`8caac96`)
- `4.6` charts (`f3e7377`, `370d88d`) — AllocationDonut + SafeHavenBar, symmetric empty states, color fixes
- `4.7` Stitch parity (`02a6a3f`) — dividend flow, lots target, 3-row penghasilan

**Post-Day-4 hardening** — zone labels sourced from explainer registry (`81d1a3e`), Allocation Discipline derived from `lotsTarget` not `%` (`d5b219d`), duplicate-ticker warning parity with crypto (`329bef9`), universe <2 null guard (`1cdfc32`), capital gain saham + multi-ccy penghasilan + bunga SBN/deposito (`0b1c36f`), crypto cap-gain % vs cost basis (`85eb4aa`), USD cost-basis persistence + FX-aware cicilan warning (`393b65a`).

### Day 5 — Goals + FI (`b4bb721`, `231370c`)
Multi-goal CRUD, FI auto-formula, bucket tagging. Codex round-11 fixed FI zero-pengeluaran false on-track + dialog title a11y.

### Day 6 — Mau KPR sim (`9af60dd`, `eba408b`, `ec51be6`)
Wizard host + delta table. Codex round-12 fixed FX-aware DP waterfall + explicit scope copy. Tech-design backfilled with §5.2 + §6.3 + §15 locked decisions.

### Day 7 — Gadai/Cicil/Custom sims + `_shared.ts` (`1dc3eee`, `9cd3206`)
Three sims share helper extract. Codex round-13: Gadai gram ownership invariant + WizardHost dynamic title.

### Day 8 — Capacity sims (`3613c85` → `320514a`)
Max Utang Aman + Lunasi Utang + CapacityResult. Codex round-14 made launcher cards interactive (`7fa39be`). Then user feedback round-14b expanded Max Utang scope: KPM + Paylater overrides (`a24078e`), multi-select pivot for tipes utang (`320514a`).

**Snapshot refresh UX** — lot input clipped >999 fixed + emas missing refresh button added (`d5ece16`). Refresh now invalidates server cache + adds 30s cooldown per panel (`6a18de7`).

### Day 9 — Modal Likuid Options + 3rd disclaimer (`cc633a4` → `b70dce7`)
Auto-generated Modal Siap deployment panel + 3rd OJK disclaimer layer in GoalForm (`cc633a4`). Then iterated post-MVP-feedback pack:
- User-configurable include toggles + preview-only deploy wizard (`d95c327`)
- Copy: "deployment" → "distribusi" (`e79b4ce`)
- One saham option per emiten with target gap (`e536f26`)
- Zero-sum distribusi (Net Worth invariant) + multi-source drain + Tambah Emas/SBN (`8668a60`)
- Safe Haven includes SBN + filters RD by jenis (RDPU + RD-Pendapatan Tetap only) (`b70dce7`)

**Modal Siap follow-ups** — drainEmas excludes pawned (`efae7b4`); cap drainEmas at cadangan, not total (`111cd28`); Safe Haven chart copy through delta (`8c5007f`). Allow ngrok hosts in Vite (`65a9fc1`) so user could share build over ngrok.

### Demo seed (post-Day-9)
`?demo=1` wires to seed snapshot with anonymized Rio persona (`b41a21f`). Refactored: extracted `triggerDemoFromQuery` (`f25ee90`), Vue-Router LocationQuery shape helper types (`d70160d`), rescaled to UMR persona + fixed addLikuid bug + mixed div modes (`9abc232`), documented why `addPenghasilanLain` drops yield/jenis fields (`4ddebe2`). `.review/` added to `.gitignore` (`7438450`).

### Day 10 — xlsx export + landing polish
- `40acb5f` — Day 10.1–10.3 wired xlsx export with 5 visible + hidden `_meta`
- `af84950` — Snapshot 5-col hybrid schema + PRD §7 update
- `7939358` — Round-trip integration test (write → read)
- `5fe6625` — Parser-friendly Snapshot/Per-Emiten + crypto fixture cleanup
- `a82c7de` — crypto Snapshot label = `coinId` only, `source_currency` = mode marker
- `d2364b8` — extracted `buildWorkbook` helper to kill assembly drift risk
- `68ae820` — tmp-dir cleanup in test `afterEach` so mid-run throws don't leak

**Wizard → Sim rename** (`4df4bcd` code + `278d831` docs) — 37 files code rename (632/632 ins/del) + 8 canonical docs (245/245 ins/del). `stitch_mvp_ui_design_process/` + `code.html` intentionally untouched (frozen process artifacts). Codex round-1 LGTM + 1 polish ("lihat detailnya di simulasi Lunasi").

**Day 10.4 + 10.5** (`e982032`) — landing polish (`max-w-3xl` + `text-balance` on hero), `public/robots.txt` disallow `/app/*`, `public/favicon.svg` (brand C-glyph), Open Graph + Twitter + `theme-color` meta. Plausible (D0.6) explicitly deferred.

**Pre-existing Day-1 regression caught** (`d578aff`) — `layouts/default.vue` used bare `<FooterDisclaimer />`; component lives at `components/layout/FooterDisclaimer.vue`, so Nuxt auto-import registers it as `LayoutFooterDisclaimer` and bare name silently failed at SSR. Footer was missing from landing since Day 1. Found via curl smoke that surfaced Vue warn. Fixed by mirroring `layouts/app.vue`'s explicit import.

### Day 11 — (in progress)
Microcopy pass, edge states (stale price / negative net worth / all-empty), `useDirtyGuard` beforeunload, mobile fallback (<768px), a11y pass, Lighthouse ≥ 85. **D11.7 Playwright smoke deferred post-MVP** (`5b7ac61`) — manual smoke acceptable for launch.

---

## 6. Locked decisions (don't re-litigate)

| Decision | Date | Why |
|---|---|---|
| Brand = "Cermat" | 2026-05-30 | naming exercise concluded |
| FI multiplier = 300 (4% rule) | Day 3-era | `D0.2` closed |
| Tone: "kamu" casual + descriptive, never advisory | from Day 1 | OJK posture |
| 3 disclaimer layers (banner + simulator dialog + GoalForm) | Day 9 | reinforces non-advice framing across context shifts |
| Wizard → Sim rename across code + docs | 2026-06-03 | better matches user mental model ("simulasi") |
| xlsx scope = 5 visible + hidden `_meta` (Skenario + Kapasitas dropped) | 2026-06-03 | no persisted scenarios store yet — defer to Phase-2 round-trip |
| Plausible analytics deferred | (Day 10) | optional in plan; revisit when usage ramps |
| E2E Playwright deferred | Day 5 | manual smoke acceptable for MVP; revisit when regression risk justifies setup |
| `ssr: false` on `/app/*` | Day 2.5 | snapshot is client-only state |
| Allocation Discipline target derived from `lotsTarget`, not `%` | post-Day-4 | matches how users actually configure |
| Allocation Discipline = `null` when universe <2 | post-Day-4 | not meaningful with single ticker |
| Safe Haven scope = kas + deposito + SBN + RD (RDPU + RD-Pendapatan Tetap only) | Day 9 | matches risk profile, not generic "RD" |

---

## 7. Phase boundary

**In MVP (Phase 1):**
- Full Track + Plan + Decide + Discover + Export
- Demo seed + landing polish + robots + favicon + OG meta
- Manual smoke acceptable

**Deferred to Phase 2 — `docs/development_phase/2_import_valid_xlsx/`:**
- xlsx **import** round-trip (read back the exported `_meta.data_json` + Snapshot/Per-Emiten cells to rehydrate state)
- Skenario + Kapasitas xlsx sheets (needs persisted scenarios store first)

**Deferred to Phase 3 — `docs/development_phase/3_improvement_ui_snapshot/`:**
- UI polish for snapshot input flow

**Deferred without phase home (revisit when triggered):**
- D0.6 Plausible analytics
- D11.7 Playwright E2E smoke
- Lucide-vue-next 1.0 bump (currently 0.460)

---

## 8. Test posture (as of 2026-06-03)

- **314 tests passing** across 24 files (vitest)
- `pnpm lint` clean
- `pnpm exec vue-tsc --noEmit` reports 0 errors (vue-tsc, NOT plain tsc — `typeCheck: true` in Nuxt config does this in build too)
- No E2E (deferred per D11.7); manual smoke is the gate

---

## 9. External review pattern (Codex)

User runs Codex as an external code reviewer between phases. Cadence:
1. Build → commit → tag the day
2. Hand the diff to Codex with a scope checklist (correctness, type safety, UI a11y, copy/i18n, tests, OJK-lint, smoke edges)
3. Triage Codex output → fix valid issues → verify → commit
4. Re-review if scope grew

This shipped **17 rounds** across Days 1 → 9. Round-17 (Day 9 Modal Siap) was the last formal cycle; Day 10 was reviewed informally during the rename and xlsx work.

See [`feedback-codex-review-workflow.md`](../../../.claude/projects/-Users-mamikos-Desktop-vibe-coding-project/memory/feedback-codex-review-workflow.md) in agent memory for the pattern.
