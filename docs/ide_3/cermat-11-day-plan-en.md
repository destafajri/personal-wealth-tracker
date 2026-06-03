# Cermat — 11-Day Build Plan

**Status:** Draft v1
**Last updated:** 2026-05-28
**Companion docs:** `cermat-tech-design-en.md` (implementation source of truth), `personal-wealth-platform-mvp-en.md` (§4 milestones), `cermat-design-decisions-en.md`, `personal-wealth-platform-design-guidelines-en.md`

This plan expands the MVP §4 milestone table into concrete per-day tasks tied to files from the tech design. Each day lists a **Goal**, a **task checklist** (IDs `D{n}.{m}`), **Done criteria**, and **Depends on**. Solo developer + AI assistance.

---

## Dependency Map

```
D1 scaffold ──┬──▶ D2 price proxy ──┐
              │                      ├──▶ D4 per-emiten (needs prices) ──┐
              └──▶ D3 snapshot+metrics ──┬──▶ D5 goals ──────────────────┤
                                         │                               ▼
                                         ├──▶ D6 KPR simulator ──▶ D7 other decision simulators
                                         └──▶ D8 capacity (Max/Lunasi) ──▶ D9 Modal Options + copy audit
                                                                              │
                       D10 xlsx export + landing polish ◀─────────────────────┘
                                         │
                       D11 microcopy + edge states + mobile + Lighthouse
```

The compute engine (`lib/finance/*`) and copy registry (`lib/copy/*`) are built incrementally — each day adds the functions that day's UI needs. Write the pure function + its Vitest test *before* the component that renders it.

---

## Day 0 (½ day, fold into Day 1 morning) — Decisions block

Resolve the open items from `cermat-tech-design-en.md` §15 that block early days. ~30–45 min.

| Task | Question | Blocks |
|---|---|---|
| D0.1 | Brand name — "Cermat" final or alt? | D1 wordmark |
| D0.2 | ✅ RESOLVED — fixed `300` (4% rule, Trinity baseline); no dropdown for MVP | D5 |
| D0.3 | Modal Siap formula — subtract emergency buffer? | D3 |
| D0.4 | ✅ RESOLVED — Yahoo `/v7/spark`+`/v8/chart` (free, no-auth, tested 2026-05-28); Goapi only if Vercel egress blocked | D2 |
| D0.5 | 9-metric "—" rules — per-metric or shared? | D3 |
| D0.6 | Plausible analytics on `/` landing — yes/no? | D1 |

**Done:** all six answered and noted in the tech-design open-items table.

---

## Day 1 — Scaffold + tokens + landing

**Goal:** A deployable Nuxt 3 app with the design system wired and the landing page live.

- [ ] D1.1 — `npx nuxi init cermat`; add TS strict, ESLint flat + Prettier, Pinia, Tailwind v4, @fontsource/plus-jakarta-sans, lucide-vue-next, zod, vitest + @nuxt/test-utils
- [ ] D1.2 — `assets/css/main.css` with the full `@theme` token block (colors, radii, shadows, font) from tech-design §8
- [ ] D1.3 — `nuxt.config.ts`: modules, `vercel-edge` Nitro preset, font + css registration
- [ ] D1.4 — Build `components/common/` primitives: `ButtonPrimary`, `ButtonSecondary`, `ButtonGhost`, `InputCurrency`, `InputQuantity`, `PillLive/Estimasi/Stale`, `StatusDot`, `DisclaimerBanner`
- [ ] D1.5 — `lib/format/*`: `idr.ts`, `percent.ts`, `duration.ts`, `parse-currency.ts` (+ Vitest table tests for lenient parsing)
- [ ] D1.6 — `lib/copy/strings.ts` seeded with landing + footer strings; `lib/copy/ojk-lint.ts` + passing test
- [ ] D1.7 — `pages/index.vue` (Landing / Screen 1): hero, dual-CTA, trust line, footer disclaimer
- [ ] D1.8 — `layouts/default.vue` + `components/layout/FooterDisclaimer.vue`
- [ ] D1.9 — `/styleguide` dev-only route rendering all primitives + token swatches
- [ ] D1.10 — Push to Vercel; confirm preview deploy builds

**Done:** Vercel deploy works; `/` renders the landing; `/styleguide` shows the primitives; `parse-currency` + `ojk-lint` tests green.
**Depends on:** D0.

---

## Day 2 — Price proxy

**Goal:** Three cached price endpoints returning normalized JSON, with graceful stale fallback.

- [~] D2.1 — `server/api/prices/idx.get.ts` — _shipped:_ Yahoo `/v7/spark?symbols=…JK` (batch, `?tickers=BBCA,BBRI`), query1→query2 host failover, zod-validate tickers, `defineCachedEventHandler` 15-min, SWR. _Deferred:_ per-ticker `/v8/chart` failover for tickers missing from spark batch (see Day 2 deferred section).
- [ ] D2.2 — `server/api/prices/gold.get.ts` — Pegadaian source, 60-min cache
- [ ] D2.3 — `server/api/prices/usdidr.get.ts` — Yahoo v8 chart `USDIDR=X` → `meta.regularMarketPrice`, 15-min cache
- [ ] D2.4 — Common envelope: every endpoint carries `{ stale, fetchedAt }`; payload endpoint-specific (idx `prices[]`, gold `hargaJual/Beli`, usdidr `rate`) — see tech-design §7.4; failures return `stale:true` not 5xx
- [ ] D2.5 — `composables/usePrices.ts` — reactive client fetch + in-memory memo + STALE detection
- [~] D2.6 — _partial_: pure-helper unit tests done (`tests/prices/{yahoo,pegadaian}.test.ts`, 23 cases). Handler + composable integration tests deferred — needs `@nuxt/test-utils` runtime setup.

**Done:** all 3 endpoints return cached responses locally + on Vercel preview; bad ticker rejected; stale path verified.
**Depends on:** D1. (D0.4)

**Deferred from Codex review (handle when Day 4 Saham per-emiten lands):**
- IDX chart fallback: per-ticker `/v8/finance/chart/{TICKER}.JK` retry for tickers missing from spark batch. Current impl = host-failover only (query1→query2). Spec §7.1 narrative mentions chart as failover, but reference code in tech-design itself is host-only — implementing per-ticker chart retry only becomes meaningful once Day-4 partial-fail UX needs it.
- Handler integration tests (mocked `$fetch` / cache hit-miss / 400 / stale fallback) — same `@nuxt/test-utils` blocker as D2.6.
- Composable tests (`useIdxPrices` / `useGoldPrice` / `useUsdIdr`) — same blocker.

---

## Day 3 — Snapshot basics + Cicilan Aktif + 9 metrics

**Goal:** The core loop: fill the snapshot form → dashboard computes all 9 metrics live.

- [ ] D3.1 — `lib/types/snapshot.ts` (Asset, Debt/Cicilan, Gadai, Stock interfaces)
- [ ] D3.2 — `stores/snapshot.ts` — all sections + mutation methods
- [ ] D3.3 — `lib/finance/metrics.ts` — NetWorth, ModalSiap, DSR, DAR, Runway, SavingsRate, SafeHaven (+ Vitest)
- [ ] D3.4 — `lib/finance/amortization.ts` — anuitas/flat/floating/revolving (+ Vitest edge cases)
- [ ] D3.5 — `lib/finance/thresholds.ts` — zones + `zoneOf()` (+ Vitest)
- [ ] D3.6 — `stores/derived.ts` — computed getters wrapping the metric functions
- [ ] D3.7 — `layouts/app.vue` + `components/layout/{TopNav,TabBar,DashboardPanel}.vue`; nested route redirect `/app → /app/snapshot`
- [ ] D3.8 — `pages/app/snapshot.vue` left panel: `PenghasilanForm`, `AsetLikuidPanel` (basic), `AsetNonLikuidPanel`, `PengeluaranForm`
- [ ] D3.9 — `components/snapshot/CicilanAktifPanel.vue` + `CicilanRow.vue` (4 jenis_bunga variants, quick-add chips, aggregate strip, missing-bunga warning)
- [ ] D3.10 — `components/snapshot/GadaiPanel.vue` (emas cadangan/tertahan + piutang + Rasio Tertahan)
- [ ] D3.11 — `components/dashboard/{HeroPair,MetricCard}.vue` — render 9 metrics with status dots + empty "—" states
- [ ] D3.12 — Wire empty/partial-state rules (D0.5) into MetricCard

**Done:** Multiple debt rows addable with correct per-jenis-bunga behavior; all 9 metrics compute live and update on input; empty fields show "—".
**Depends on:** D1, D2 (usePrices for NetWorth gold/stock valuation — can stub if D4 not done). (D0.3, D0.5)

---

## Day 4 — Per-emiten Saham subsection

**Goal:** Power-user stock depth with live IDX prices.

- [ ] D4.1 — `lib/finance/metrics.ts` — `calcAllocationDiscipline(stocks)` (+ Vitest)
- [ ] D4.2 — `components/snapshot/SahamPanel.vue` — list + `+ Tambah Saham`
- [ ] D4.3 — `components/snapshot/PerEmitenCard.vue` — collapsed (progress bar, bobot drift dot, LIVE price) + expanded (dividend detail, edit/hapus)
- [ ] D4.4 — Wire `usePrices().idx(ticker)` per card; LIVE/STALE pill + "Last updated" + manual override
- [ ] D4.5 — Add Allocation Discipline as the 6th metric card on the dashboard (design-decisions §2.3)
- [ ] D4.6 — Allocation donut + Safe Haven stacked bar (`components/dashboard/{AllocationDonut,SafeHavenBar}.vue`, ECharts async)

**Done:** 5 sample emiten render; live IDX prices populate; bobot drift dots correct; Allocation Discipline card live; donut + safe-haven bar render.
**Depends on:** D2, D3.

---

## Day 5 — Goals module + FI auto-formula

**Goal:** Multi-goal CRUD with bucket tagging and the FI auto-computation.

- [ ] D5.1 — `lib/types/goals.ts`; `stores/goals.ts` (list + fiMultiplier)
- [ ] D5.2 — `lib/finance/goals.ts` — FI formula (expenses × multiplier), goal projection (future-value, real-return default 5%; inflow = surplus ÷ N default + manual allocation override), contribution-needed, status (On/At-Risk/Off) (+ Vitest)
- [ ] D5.3 — `lib/finance/metrics.ts` — `calcGoalHealth(goals, snap)` (+ Vitest)
- [ ] D5.4 — `pages/app/goals.vue` + `components/goals/GoalForm.vue` (type, target, date, bucket tags)
- [ ] D5.5 — `components/goals/GoalCard.vue` (standard) + `FiGoalCard.vue` (multiplier = fixed 300 per D0.2; show formula inline, no dropdown)
- [ ] D5.6 — `components/dashboard/{GoalHealthChip,GoalSummaryCards}.vue` on dashboard
- [ ] D5.7 — Bucket tagging: tag assets → progress auto-computes from tagged buckets

**Done:** Multiple goals addable; FI target auto-computes from expenses × multiplier; Goal Health chip live; bucket-based progress correct.
**Depends on:** D3 (expenses, assets).

---

## Day 6 — Decision simulator: Mau KPR

**Goal:** First full simulator, end-to-end, establishing the pattern for the rest.

- [ ] D6.1 — `lib/types/sim.ts` (Scenario, Delta, SimResult)
- [ ] D6.2 — `lib/finance/sims/mau-kpr.ts` — clones snapshot, applies KPR, recomputes all metrics + goal shifts (+ Vitest golden fixture)
- [ ] D6.3 — `composables/useSimulator.ts` — open/close, current result state
- [ ] D6.4 — `components/simulator/SimHost.vue` (global modal host, enforces DisclaimerBanner) in `layouts/app.vue`
- [ ] D6.5 — `components/simulator/SimDeltaTable.vue` — the shared 4-col table (Metrik|Sebelum|Sesudah|Δ) with arrows + zone-flip coloring
- [ ] D6.6 — `components/simulator/decisions/SimMauKpr.vue` — input form + Posisi Sekarang mirror + delta table + goal-impact section
- [ ] D6.7 — `pages/app/simulator.vue` + `components/simulator/SimLauncher.vue` (launcher card for KPR opens the modal)

**Done:** KPR simulator opens, computes Cicilan/bln + total bunga, shows Sebelum/Sesudah deltas with zone flips and goal shift (e.g., "FI mundur 3 tahun").
**Depends on:** D3, D5.

---

## Day 7 — Remaining decision simulators

**Goal:** All 4 decision simulators functional, reusing the Day 6 chrome.

- [ ] D7.1 — `lib/finance/sims/mau-gadai.ts` (+ Vitest) → `SimMauGadai.vue`
- [ ] D7.2 — `lib/finance/sims/mau-cicil.ts` (+ Vitest) → `SimMauCicil.vue`
- [ ] D7.3 — `lib/finance/sims/custom.ts` (free-form delta tweaks) (+ Vitest) → `SimCustom.vue`
- [ ] D7.4 — Add all 4 launcher cards to `SimLauncher.vue` (Simulasi Keputusan group)

**Done:** All 4 decision simulators open from the launcher and render correct side-by-side deltas + goal impact.
**Depends on:** D6.

---

## Day 8 — Capacity simulators: Max Utang + Lunasi Utang

**Goal:** The two highest-value reverse-looking tools (per MVP hard floor).

- [ ] D8.1 — `lib/finance/sims/max-utang.ts` — solve max new cicilan keeping DSR < threshold; derive equivalent KPR/KPM scenarios (+ Vitest)
- [ ] D8.2 — `components/simulator/capacity/SimMaxUtang.vue` — optional inputs + hero result + equivalent-scenarios list + `capacity.max.zero` edge copy
- [ ] D8.3 — `lib/finance/sims/lunasi-utang.ts` — pay full/partial from Modal Siap; per-jenis-bunga behavior (Anuitas/Flat: tenor-vs-cicilan toggle; Revolving/Gadai: sisa pokok turun) (+ Vitest)
- [ ] D8.4 — `components/simulator/capacity/SimLunasiUtang.vue` — debt radio list sourced from Cicilan Aktif + Gadai (sort = jatuh_tempo asc / insertion order, NEVER by rate — OJK §11.1), partial slider, impact table
- [ ] D8.5 — Add both launcher cards to `SimLauncher.vue` (Cek Kapasitas group)

**Done:** Both capacity simulators compute live with descriptive output; Lunasi debt list respects non-ranked sort.
**Depends on:** D3 (debts), D6 (delta table), D5 (goal shifts).

---

## Day 9 — Modal Likuid Options + copy audit

**Goal:** The auto-generated options panel + a full OJK pass on all copy.

- [ ] D9.1 — `lib/finance/sims/modal-options.ts` — generate deployable `Option[]` from Modal Siap (debt reduction / asset acquisition / FI bucket), each with descriptive impact preview, NO ranking (+ Vitest)
- [ ] D9.2 — `components/dashboard/ModalOptionsPanel.vue` (§8.20) — header "Opsi yang Bisa Dihitungkan", each option + `[Hitung]` → opens relevant simulator pre-filled
- [ ] D9.3 — `components/simulator/capacity/SimModalOptions.vue` + launcher card
- [ ] D9.4 — Complete `lib/copy/strings.ts` — all ~60 strings from design §10 (metric zones, empty states, errors, capacity outputs)
- [ ] D9.5 — Run `ojk-lint` over the full registry + scan component templates for inline Indonesian strings; fix every violation
- [ ] D9.6 — Verify the 3 disclaimer layers present: footer, pre-simulator banner, pre-goal-save banner

**Done:** Options panel renders with descriptive impacts + working `[Hitung]` hand-off; ~60 strings audited, 0 OJK lint violations; 3 disclaimer layers present.
**Depends on:** D3, D5, D6–D8.

**Safety valve (MVP §4 drop order):** if behind, drop in this order — (1) Custom skenario [D7.3], (2) Modal Options [D9.1–D9.3, keep Max+Lunasi], (3) mobile polish [D11], (4) xlsx sheets beyond Snapshot+Per-Emiten [D10].

---

## Day 10 — xlsx export + landing polish

**Goal:** A clean 5-visible-sheet (+ hidden `_meta`) downloadable workbook + a polished landing.

- [x] D10.1 — `composables/useXlsx.ts` — SheetJS async; build sheets: Ringkasan, Snapshot, Per-Emiten, Cicilan-Aktif, Goals + hidden `_meta` (schema version + state JSON, per PRD §7) _(Skenario + Kapasitas dropped 2026-06-03 per safety valve — no persisted scenarios store yet; deferred to Phase-2 round-trip work)_
- [x] D10.2 — Wire Download button in `TopNav` — disabled until ≥1 asset (tooltip "Tambahkan minimal 1 aset"); post-download toast (`download.confirm`)
- [x] D10.3 — Verify workbook opens cleanly in Excel + Google Sheets (number formats, no `#REF`) _(2026-06-03: structural verify ✅ via unzip — 5 visible + `_meta` hidden, 0 #REF, schema_version=1, full state JSON present; manual file-open visual accepted as MVP-sufficient on top of unit-tested round-trip integration test)_
- [x] D10.4 — Landing polish: spacing, copy, responsive hero; optional Plausible on `/` (D0.6) _(Plausible skipped — defer with D0.6)_
- [x] D10.5 — `public/robots.txt` (disallow `/app/*`); favicon; meta tags

**Done:** Download produces a clean file (5 visible sheets + hidden `_meta`) that opens in Excel/Sheets; landing polished; robots/meta set.
**Depends on:** D3–D9.

---

## Day 11 — Microcopy, edge states, mobile, Lighthouse

**Goal:** Ship-ready polish.

- [ ] D11.1 — Microcopy pass across every screen (tone: casual, "kamu", descriptive)
- [ ] D11.2 — Edge states: stale price (Screen 11), negative net worth (Screen 12, "Status" framing), all-empty (Screen 10), partial
- [ ] D11.3 — `useDirtyGuard.ts` beforeunload warning (`dialog.refresh`)
- [ ] D11.4 — Mobile fallback (<768px): stack columns, "↓ Lihat dashboard" anchor, "Lebih nyaman di desktop" hint; resolve breakpoint behavior (D0.4 — bottom-nav vs hamburger)
- [ ] D11.5 — Accessibility pass: keyboard nav, focus states, ARIA live on dashboard, AA contrast check (esp. amber)
- [ ] D11.6 — Lighthouse run → fix until Performance ≥ 85; defer-load simulator bundles + ECharts + SheetJS
- [HOLD] D11.7 — Playwright smoke: Landing → Snapshot fill → KPR simulator → xlsx download _(deferred post-MVP — manual smoke pass acceptable for launch; revisit when regression risk justifies E2E setup cost)_

**Done:** Lighthouse ≥ 85; all edge states render correctly; mobile is functional; a11y pass. Ready to ship. _(E2E smoke deferred — see D11.7.)_
**Depends on:** all prior.

---

## Hard floor (if the sprint compresses)

Per MVP §4, a viable launch needs at minimum:
**Snapshot (basic + per-emiten) + KPR simulator + Max Utang Aman + Lunasi Utang + Goal tracker with FI formula + 9 metrics + xlsx export.** ≈ 8 days (D1–D6, D8, D10 core).

Cuttable without breaking the floor: Custom simulator (D7.3), Modal Options (D9.1–D9.3), full mobile polish (D11.4), xlsx sheets beyond Snapshot + Per-Emiten (D10.1 partial).

---

## Cross-cutting conventions

- **Test-first for compute:** write each `lib/finance/*` function + its Vitest before its component.
- **No inline Indonesian strings:** everything user-facing goes through `lib/copy/strings.ts` so the OJK linter can see it.
- **Pure functions for simulators:** every simulator = `run(inputs, snapshot, goals) → SimResult`; the UI is a thin renderer.
- **Dashboard reads only `stores/derived.ts`**, never the raw snapshot/goals stores.
- **Commit cadence:** one logical commit per task ID where practical; keep CI (tests + lint) green per push.
```

