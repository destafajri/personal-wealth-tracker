# Day 5 Codex Round-3 Review Checklist

**Range**: `4f379c6..7fb4add` (5 commits, all pushed to `origin/revamp`)
**Date**: 2026-06-04
**Status**: vue-tsc clean, 327/327 tests pass, lint clean

---

## Commits in scope

| Hash | Message |
|------|---------|
| `4f379c6` | bolt-tab snapshot revamp — collapsibles + sidebar Ringkasan Cepat + Ringkasan tab recap |
| `88ec9ea` | polish footer + snapshot CTA nav — gradient border, step dots, responsive sizing |
| `a320439` | restructure Ringkasan tab — charts-first IA + grid 2-col collapsible details + sidebar polish |
| `7f97a0c` | typography polish + mobile overflow fix |
| `7fb4add` | 4 new Ringkasan charts + FX bugfix in surplus/runway/savings-rate |

---

## Round-2 findings status

| # | Finding | Status |
|---|---------|--------|
| 1 | Checklist range `main..HEAD` | **Fixed** — this checklist uses `4f379c6..7fb4add` |
| 2 | xlsx export schema drift (pengeluaranLain not emitted) | **Known gap, deferred to Phase 3** — `sheets.ts` still hard-codes IDR rows. Day 5 intentionally changed snapshot shape; xlsx fix is Phase 3 scope. |
| 3 | `calcTotalPengeluaran` FX tests missing | **Fixed in `7fb4add`** — bug was real: `surplus()`, `calcRunway()`, `calcSavingsRate()`, `runMaxUtang()` all called `calcTotalPengeluaran(snap)` without `prices`. Now all pass `prices`. Targeted tests still TODO but the runtime bug is patched. |

---

## New in round 3

### Visual changes (behaviour untouched unless noted)

- **Footer** (`FooterDisclaimer.vue`): gradient top border, styled lock chip, better hierarchy, responsive text sizing
- **Snapshot CTA nav** (`snapshot.vue`): step progress dots (6 clickable dots), responsive sizing (mobile larger, desktop compact), border/shadow removed
- **DashboardSummary sidebar**: surplus hero gradient bg + ring glow, net worth donut enlarged to 56px + glow shadow, per-section totals with colored left-border rows, increased spacing
- **SnapshotRecap**: 2-col grid on desktop (`sm:grid-cols-2 items-start`), all sections collapsible (default closed, chevron indicator), category labels as colored badge pills (Deposito=emerald, RD=amber, SBN=blue, Properti/Kendaraan/Pensiun=gray), `rdJenis` raw camelCase → human-readable labels (map in component, not `t()` due to TS literal constraints), secondary info (yield, jenis RD) on second line with indent
- **Ringkasan tab IA restructure**: DashboardPanel moved ABOVE SnapshotRecap (charts-first), DashboardPanel internal reorder: charts above ModalOptionsPanel
- **4 new chart components**: ExpenseBreakdownDonut, SurplusGauge (card + bar, NOT SVG gauge), AssetVsLiabilityBar, EmergencyFundMeter
- **Copy**: subtitle "Foto utuh: Net Worth, DSR..." → "Gambaran menyeluruh kondisi keuanganmu — langsung dari data yang kamu isi."
- **ModalOptionsPanel**: moved to bottom of DashboardPanel, `max-h-80` scrollable

### Bugfix (behaviour change)

- **`calcTotalPengeluaran` FX propagation** (`7fb4add`): 4 call sites were not passing `prices` parameter, causing non-IDR pengeluaran to be treated as raw number (no FX conversion). Affected: `surplus()`, `calcRunway()`, `calcSavingsRate()`, `runMaxUtang()`. All now pass `prices`.

---

## Audit checklist

### lib/ contract preservation
- [x] `lib/types/snapshot.ts` — unchanged since round-2 (Pengeluaran interface already has pokokCurrency/lifestyleCurrency/pengeluaranLain)
- [x] `lib/finance/metrics.ts` — `calcTotalPengeluaran(snap, prices)` signature unchanged; 2 internal callers (`calcRunway`, `calcSavingsRate`) now pass `prices`
- [x] `lib/finance/goals.ts` — `surplus()` now passes `prices` to `calcTotalPengeluaran`; `resolveTargetIdr` intentionally does NOT pass prices (FI target = base IDR baseline × multiplier, no FX needed)
- [x] `lib/finance/sims/max-utang.ts` — `runMaxUtang()` now passes `prices` to `calcTotalPengeluaran`
- [x] No new lib/ exports or type changes

### UI Behaviour Contract (B1–B18)
- [x] B1: per-input store writes still fire on keystroke (tab content uses `v-show`, not `v-if`)
- [x] B3: DashboardSummary always visible in sidebar
- [x] B8/B9/B14/B15: DashboardPanel preserved inside Ringkasan tab (moved above SnapshotRecap, not deleted)
- [x] B18: CTA "Simpan & Lanjutkan" still navigates tabs; last tab routes to `/app/goals`
- [x] New step progress dots are clickable navigation aids, not new behaviour

### New components review
- [x] ExpenseBreakdownDonut: uses ECharts via `registerEcharts()` + `cssVar()` (same pattern as AllocationDonut); async-loaded via `defineAsyncComponent`; data from `useSnapshotStore` + `useDerivedStore`
- [x] SurplusGauge: pure CSS card, no ECharts; data from `derived.surplusIdr` + `derived.penghasilanMonthlyIdr`; expense = income − surplus (avoids needing separate store property)
- [x] AssetVsLiabilityBar: pure CSS; data from `derived.totalAset` + `derived.totalUtang`
- [x] EmergencyFundMeter: pure CSS; data from `derived.runway` (already computed)

### Mobile responsiveness
- [x] SnapshotRecap grid: single column on mobile, 2-col on `sm:+`
- [x] DashboardSummary: unchanged responsive behavior
- [x] New charts in DashboardPanel: `sm:grid-cols-2` grid, stack on mobile
- [x] Footer: responsive text sizing (`text-[10px]` for mobile hint)

### Scope-creep assessment
- **FX bugfix**: touches `lib/finance/goals.ts`, `lib/finance/metrics.ts`, `lib/finance/sims/max-utang.ts` — this is a **real bug fix** (non-IDR pengeluaran was silently wrong), not scope creep. User-discovered bug confirmed with screenshots.
- **4 new chart components**: visual-only (present existing store data in new chart form). No new calculations, no new store properties, no behaviour changes.
- **IA restructure**: visual layout reorder only. B8/B9/B14/B15 dashboard components preserved.

### Known gaps (deferred)
- [ ] xlsx export does not emit `pengeluaranLain` rows or respect `pokokCurrency`/`lifestyleCurrency` (Phase 3 scope)
- [ ] `calcTotalPengeluaran` still has zero targeted unit tests for non-IDR FX conversion (runtime bug is fixed, but test coverage gap remains)
- [ ] Day 4 57px advisory (TabBar height) still not addressed
- [ ] D11.6 Lighthouse pending Vercel deploy
- [ ] D11.7 Playwright HOLD post-MVP

---

## Test results
```
Test Files  25 passed (25)
     Tests  327 passed (327)
  Duration  ~1.3s
vue-tsc:   clean (no errors)
```
