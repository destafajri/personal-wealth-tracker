# Day 5 Codex Round-4 Review Checklist

**Range**: `7fb4add..8d9fec6` (2 commits, all pushed to `origin/revamp`)
**Date**: 2026-06-04
**Status**: vue-tsc clean, 327/327 tests pass, lint clean

---

## Commits in scope

| Hash | Message |
|------|---------|
| `4a30a76` | docs(phase-2a/day-5): Codex round-3 review checklist |
| `8d9fec6` | fix(phase-2a/day-5): FX-convert ExpenseBreakdownDonut slices + clarify checklist |

---

## Round-3 findings status

| # | Severity | Finding | Status |
|---|----------|---------|--------|
| 1 | Medium | ExpenseBreakdownDonut slices built from raw amounts (no FX), header total uses `calcTotalPengeluaran` (with FX) — composition disagrees with total for non-IDR expenses | **Fixed in `8d9fec6`** — slices now FX-converted via `rateToIdr()` helper: `pokok` uses `pokokCurrency`, `lifestyle` uses `lifestyleCurrency`, `pengeluaranLain` rows use per-row `currency`, cicilan stays IDR (already correct). |
| 2 | Low | Checklist overstates "all async-loaded or pure CSS" — async-loading is via DashboardPanel `defineAsyncComponent`, not component-internal | **Fixed in `8d9fec6`** — checklist wording updated to "async-loaded via `defineAsyncComponent` in DashboardPanel" for all 4 components. |

---

## What changed

### ExpenseBreakdownDonut.vue
- Added `import { rateToIdr } from '~/lib/finance/fx'` and `import type { Currency } from '~/lib/types/snapshot'`
- Added local `toIdr(amount, currency)` helper that converts via `rateToIdr` using `derived.priceView?.fxRates`
- `pokok` slice: `snap.pengeluaran.pokok` → `toIdr(snap.pengeluaran.pokok, snap.pengeluaran.pokokCurrency)`
- `lifestyle` slice: `snap.pengeluaran.lifestyle` → `toIdr(snap.pengeluaran.lifestyle, snap.pengeluaran.lifestyleCurrency)`
- `pengeluaranLain` slice: raw sum → `snap.pengeluaranLain.reduce((s, r) => s + toIdr(r.amount || 0, r.currency), 0)`
- `cicilan` slice: unchanged (cicilan per bulan is always IDR)
- Header total: unchanged (still uses `calcTotalPengeluaran` which is the canonical source)

### day-5-codex-round3-checklist.md
- Updated "New components review" section to clarify async-loading mechanism and FX parity for ExpenseBreakdownDonut

### What did NOT change
- No lib/ files touched
- No store files touched
- No other components touched
- No behaviour changes — this is a visual-data parity fix only

---

## Verification

- [x] Slice values now match header total for IDR inputs (no regression)
- [x] Slice values now match header total for non-IDR inputs (FX bug fixed)
- [x] `cicilanPerBulan` remains unconverted (always IDR, correct)
- [x] vue-tsc clean
- [x] 327/327 tests pass
- [x] No new test files (test coverage gap acknowledged in known gaps)

---

## Known gaps (unchanged from round 3)
- [ ] xlsx export does not emit `pengeluaranLain` rows or respect `pokokCurrency`/`lifestyleCurrency` (Phase 3 scope)
- [ ] `calcTotalPengeluaran` has zero targeted unit tests for non-IDR FX conversion
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
