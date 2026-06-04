# Phase-2a Day 5 — Codex Review Checklist

**Branch:** `revamp`
**Range:** `main..HEAD` (50 files, ~2000 LOC delta)
**Test status:** vue-tsc 0 errors, ESLint clean, 327/327 tests pass

---

## ⚠️ Scope-creep flags (intentional, user-requested — please verify the justification, not the diff direction)

### 1. `lib/types/snapshot.ts` + `lib/finance/metrics.ts` touched

Phase-2a preservation guard says these are out-of-scope. The Day 5 diff modifies them deliberately to enable a USER-REQUESTED feature expansion: **pengeluaran multi-currency + multi-row** (parallel to penghasilanLain pattern).

User asks verbatim (2026-06-04 mid-iteration):
> "pengeluaran kayaknya butuh multy currency juga"
> "terus tambahin dong opsi tambah pengeluaran"

Resulting schema change:
- `Pengeluaran` interface gains `pokokCurrency: Currency` + `lifestyleCurrency: Currency`
- `SnapshotState` gains `pengeluaranLain: AssetRow[]` (parallel to existing `penghasilanLain: AssetRow[]`)
- `emptySnapshot()` updated with defaults (`'IDR'` + `[]`)

Resulting function-signature change:
- `calcTotalPengeluaran(snap)` → `calcTotalPengeluaran(snap, prices?)`
- New behaviour: pokok + lifestyle FX-converted via `rateToIdr` when currency != IDR; `pengeluaranLain` rows summed via `sumRowsToIdr`; cicilan-per-bulan sum unchanged
- `prices?` is **backward-compatible** — existing callers with no prices argument fall through with rate 0 for non-IDR (same stale-rate posture as `sumRowsToIdr`)

Codex check:
- [ ] Confirm signature backward-compat (no caller broken)
- [ ] Confirm tests for FX conversion + lain rows cover the new paths
- [ ] Confirm no other calc helpers leak (only `calcTotalPengeluaran` changed)

### 2. Bolt tab pattern reintroduces tab navigation

Phase-2a plan line: *"wizard 7-step pagination → seamless single-page flow with realtime feedback"*. Bolt tab pattern (6 horizontal tabs + per-tab content + Sebelumnya/Lanjutkan CTA) could be read as walking back toward wizard. User-confirmed direction 2026-06-04: *"dengan ini saya putuskan dibuat dengan inspirasi dari bolt aja"*.

Justification preserved:
- Per-input writes still hit store on every keystroke (B1 intact)
- DashboardSummary sidebar is ALWAYS visible (realtime feedback intact)
- CTA navigates between tabs (in-page), only the LAST tab (Ringkasan) navigates out to `/app/goals` (B18 intact at the outer boundary)
- v-show on input tabs preserves CollapsiblePanel local open state across tab switches (so user doesn't lose their place)

Codex check:
- [ ] Confirm B1 (per-input writes) by typing in any panel during demo and watching `snap.*` mutations fire keystroke-level
- [ ] Confirm B3 (realtime dashboard) — DashboardSummary updates instantly while typing on any tab
- [ ] Confirm B18 — last-tab "Lanjut ke Plan" routes to `/app/goals`; earlier-tab "Simpan & Lanjutkan" stays in-page

---

## ✅ Behavior Contract B1–B18 spot-checks

Apply to demo seed (`?demo=1`) on `/app/snapshot`. Most behaviors are inherited from preserved panel internals; only call out where Day 5 changed orchestration.

- [ ] **B1** Store writes: type in any open collapsible → `snap.*` mutation fires on keystroke (no debounce, no submit gate). Tab switch preserves typed values.
- [ ] **B2** Dirty guard: type one char → close tab → `beforeunload` warning fires. `pengeluaranLainCount > 0` is a new dirty signal (added to `DirtySignals` + test case +1).
- [ ] **B3** Realtime dashboard: type → DashboardSummary mini-KPI + Surplus + per-section list + DSR bar update same frame. Open Ringkasan tab → DashboardPanel HeroPair + 9 KPI cards + charts also update.
- [ ] **B4** Duplicate-ticker warning (Saham): add ticker twice → warning chip renders inline. Untouched by Day 5.
- [ ] **B5** Missing-bunga warning (Cicilan): add row, leave bunga blank → warning surfaces. Untouched.
- [ ] **B6** Gadai ownership invariant: pawn > available emas → warning. Untouched.
- [ ] **B7** FX-aware Cicilan: USD cicilan vs IDR penghasilan → mismatch warning. Untouched.
- [ ] **B8** Chart empty-state gating: empty snapshot → AllocationDonut + SafeHavenBar NOT mounted. Same gate (`hasAnyAsset = totalAset > 0`) preserved inside DashboardPanel; only its mount location moved (now inside Ringkasan tab with `v-if`).
- [ ] **B9** Modal Likuid zero-sum: open ModalOptionsPanel (inside Ringkasan tab DashboardPanel) → preview distribusi → "Terapkan" gated. Untouched.
- [ ] **B10** xlsx download gating: TopNav download button still disabled when `totalAset === 0`. NOTE: xlsx export does NOT yet include `pengeluaranLain` rows or pokokCurrency/lifestyleCurrency — see Known Gaps below.
- [ ] **B11** Pricing refresh cooldown: Saham/Crypto/Emas refresh button still 30s cooldown enforced. Button moved to `ml-auto` in panel header when `hideHeader=true`, behaviour unchanged.
- [ ] **B12** Demo CTA: landing "Coba dengan data contoh" → `?demo=1` → Rio persona populates all panels. Untouched.
- [ ] **B13** OJK disclaimer: DisclaimerBanner on snapshot route still present. `lib/copy/strings.ts` not modified by Day 5 (button copy "+ Tambah" hardcoded inline; registry key `snapshot.penghasilan.lainAdd` still defined, just unused — preservation rule "must NOT REMOVE existing keys" honored).
- [ ] **B14** Descriptive zone labels: KPI cards in DashboardPanel (Ringkasan tab) still pull labels from `lib/copy/metric-explainers.ts`. Untouched.
- [ ] **B15** MetricExplainer modal launch: click any of 9 KPI cards in Ringkasan tab → explainer opens. Untouched.
- [ ] **B16** Sim launch context: open any wizard from Decide tab → form pre-populated from shared snapshot store. snapView builders in 9 sim components now include `pengeluaranLain` field (no behavioural change).
- [ ] **B17** Bottom-nav 4 tabs + Soon: Track/Plan/Decide visible, Discover SOON. Active state polished Day 5 (stronger emerald highlight + top bar indicator on mobile).
- [ ] **B18** Save & Lanjutkan CTA: every input tab has CTA always-enabled. Tab-internal nav added (Cash Flow → Kas → Investasi → ... → Utang → Ringkasan → /app/goals). Per-input save model preserved — typing fills store regardless of clicking CTA.

---

## 📊 Test suite check

- [ ] `pnpm test` → 327/327 pass
- [ ] New test case: `tests/dirty-guard/isSnapshotDirty.test.ts` — `pengeluaranLainCount` flips dirty signal
- [ ] Updated fixtures (Pengeluaran shape): tests/finance/{metrics,goals,sims/*}, tests/xlsx/{sheets,integration}, tests/dirty-guard/isSnapshotDirty — all pass with new pokokCurrency/lifestyleCurrency/pengeluaranLain fields

---

## 🎨 Visual / UX surfaces touched

### Snapshot page (`pages/app/snapshot.vue`)
- 6-tab horizontal SnapshotTabBar (mobile = icon-only at <sm, sm+ = icon+label, flex-1 distribution)
- Tab content wrapped in CollapsiblePanel cards (default closed, click to expand)
- Tab-level header card with gradient backdrop for Cash Flow / Investasi / Utang (multi-panel tabs)
- Investasi tab has 2 sub-groups (Investasi Pasif / Investasi Pasar) with sub-headings
- Ringkasan tab content: emerald-gradient hero header + new SnapshotRecap + DashboardPanel
- Bottom CTA bar: Sebelumnya outline (mobile full-width stacked, desktop inline) + Simpan & Lanjutkan emerald + centered privacy note

### Sidebar (`layouts/app.vue` + new DashboardSummary)
- Sidebar position: left on desktop (280px fixed) via `md:order-1`/`md:order-2`; mobile stays main → aside DOM order
- DashboardSummary: 2×2 mini KPI + Surplus card + per-section list + Net Worth + conic-gradient donut + DSR bar + privacy
- Footer (`FooterDisclaimer`) trimmed visually: no border-top, no tinted bg, smaller padding, muted text
- Layout uses `flex flex-col` + `flex-1` on grid container → sticky-footer pattern (no viewport white space below footer on short pages)

### TabBar (`components/layout/TabBar.vue`) — outer 4-module nav
- Desktop active: `bg-primary/5` + bold text + emerald icon + bottom border (uses `!` to override transparent default)
- Mobile active: emerald color + top emerald bar indicator + `[&_svg]:text-primary` for icon color
- Mobile: `pb-[env(safe-area-inset-bottom)]` for iPhone home indicator safety

### AllocationDonut palette fix
- PALETTE[1] was `--color-accent-emerald` which aliases `--color-primary` → consecutive emitens rendered same color (e.g., BBRI + BMRI both green)
- Dropped duplicate alias; sequence now: emerald / amber / teal / rose / gold / violet / blue / dark-emerald (8 distinct hues)

### Overflow handling (massive numbers)
- `break-all` on HeroPair Net Worth + Modal Siap, DashboardSummary all value spans, CollapsiblePanel value (moved into title column to wrap naturally), PenghasilanForm 3 Estimasi rows, SnapshotRecap all row values
- AssetRowList + PenghasilanForm Penghasilan Lain row: flex-wrap pattern (label `basis-full sm:basis-auto`, amount `flex-1 sm:w-44`)
- Bottom CTA: `whitespace-nowrap`, `flex-col` mobile / `flex-row` desktop

### Currency picker unification (InputCurrency)
- New props: `currency` + `currencies` — when both set, renders inline `<select>` as prefix instead of static text
- PenghasilanForm Gaji Bersih + Lain rows + PengeluaranForm Pokok + Lifestyle + Lain rows + AssetRowList rows ALL drop standalone currency dropdown
- Result: 1 unified input field `[Rp ▾ 6.500.000]` instead of 2 (`[IDR ▾] [Rp 6.500.000]`)

---

## 🆕 New components (review for reuse + naming)

- `components/snapshot/SnapshotTabBar.vue` — horizontal tab pill list w/ optional completed-check indicator
- `components/snapshot/CollapsiblePanel.vue` — card-shape, click-to-toggle, value-on-header
- `components/snapshot/SnapshotRecap.vue` — read-only itemized breakdown (per-section, per-row)
- `components/layout/DashboardSummary.vue` — compact sidebar that replaces DashboardPanel in `layouts/app.vue`

`DashboardPanel.vue` is **NOT deleted** — it now renders inside the Ringkasan tab where it provides B8/B9/B14/B15 surfaces. Day 5 intentionally keeps both surfaces.

---

## ⚙️ Known gaps / deliberate non-fixes

1. **xlsx export does NOT include `pengeluaranLain` rows or pokokCurrency/lifestyleCurrency.** `lib/xlsx/sheets.ts` still exports pokok+lifestyle as IDR-tagged. Acceptable for Day 5 ship since:
   - User flow with non-IDR pengeluaran is rare
   - xlsx is preserved for B10 download gating but content drift is opt-in to fix
   - Recommend: Phase-2b separate ticket
2. **Lot input on Saham allows arbitrarily large values** (no upper bound) → cascade overflow in Net Worth / Modal Siap / SnapshotRecap when user types absurd numbers. Defensive `break-all` added everywhere it can wrap; not a Day 5 bug, surfaced during mobile QA.
3. **Phase-2a plan's Saham/Crypto/Emas Refresh button** in CollapsiblePanel mode lives in its own row inside the panel content (not on the CollapsiblePanel header). Visual is acceptable; if Codex wants tighter integration, propose adding a `header-action` slot to CollapsiblePanel.
4. **`/app/goals` route** — Plan module is Phase-2c scope, not Day 5. Last-tab "Lanjut ke Plan" CTA navigates there; the destination page is still Phase-1 styling. Out of scope for Day 5.
5. **Mobile bottom-nav doesn't show `Ringkasan` as a separate tab** — Ringkasan is INSIDE the snapshot module (6th inner tab), not a separate route. By design.

---

## 🔍 Quick smoke checklist

- [ ] `/app/snapshot` loads clean on desktop + mobile
- [ ] Click each of 6 inner tabs → content renders, no `<Anonymous>` warning in console
- [ ] Expand a CollapsiblePanel, switch to next tab, switch back → panel stays expanded
- [ ] Default all-closed: tab Kas / Aset Tetap show only header card (no panel expanded)
- [ ] Demo seed (`?demo=1`): Rio populates all tabs, all CollapsiblePanel headers show non-zero subtotals
- [ ] Pengeluaran tab: switch pokok currency to USD → DashboardSummary Pengeluaran mini-KPI reflects FX-converted IDR
- [ ] Add a Pengeluaran Lain row with USD: total pengeluaran updates with IDR equivalent
- [ ] Ringkasan tab: SnapshotRecap shows every section with details (per-emiten Saham, per-coin Crypto, per-kategori Emas, etc.); empty sections auto-hidden
- [ ] Ringkasan tab DashboardPanel: HeroPair + 9 KPI cards render, click a KPI → MetricExplainer modal opens
- [ ] Bottom CTA on Utang tab labels "Simpan & Lihat Hasil" → goes to Ringkasan tab (NOT routing out)
- [ ] Bottom CTA on Ringkasan tab labels "Lanjut ke Plan" → routes to `/app/goals`
- [ ] AllocationDonut (in DashboardPanel): with 2+ emitens, each gets a distinct color (BBRI vs BMRI not both emerald)
- [ ] Mobile TabBar (Track/Plan/Decide/Discover): active route shows top emerald bar + bold + emerald icon

---

## Codex round-2 ask

1. Verify the two scope-creep flags above are acceptable as user-requested expansions vs accidental Phase-2 contract violations
2. Spot-check B1–B18 against the demo seed flow
3. Flag any visual regressions vs the bolt visual reference posture ("bolt aja" lock 2026-06-04)
4. Audit `SnapshotRecap.vue` for sum-helper parity with `DashboardSummary` + `metrics.ts` — both must reconcile per-section subtotals; mismatches mean drift
5. Audit `calcTotalPengeluaran` new behaviour: FX rate 0 fallthrough vs throwing on stale rate — pick the right posture relative to other multi-currency calcs
