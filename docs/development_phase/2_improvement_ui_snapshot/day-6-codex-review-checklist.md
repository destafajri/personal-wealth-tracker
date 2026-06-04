# Day 6 Codex Review Checklist — Phase-2a Parity Hard Gate

**Range**: `main..HEAD` (21 commits, pushed to `origin/revamp`)
**Date**: 2026-06-04
**Status**: vue-tsc clean, lint clean, 327/327 tests pass

---

## Hard-gate exit criteria (7/7 required)

### 1. MVP feature audit — PASS

All 14 input panels reachable and wired in `pages/app/snapshot.vue`:

| # | Panel | Component | Tab |
|---|-------|-----------|-----|
| 1 | Penghasilan | `PenghasilanForm` | Cash Flow |
| 2 | Pengeluaran | `PengeluaranForm` | Cash Flow |
| 3 | Kas | `AsetLikuidPanel :categories="['kas']"` | Kas |
| 4 | Deposito/RD/SBN | `AsetLikuidPanel :categories="['deposito','reksaDana','sbn']"` | Investasi |
| 5 | Emas 5-kategori | `EmasPanel` + live pricing props | Investasi |
| 6 | Saham per-emiten | `SahamPanel` + IDX live pricing props | Investasi |
| 7 | Crypto 4-mode | `CryptoPanel` + CoinGecko live pricing props | Investasi |
| 8 | Aset Non-Likuid | `AsetNonLikuidPanel` | Aset Tetap |
| 9 | Cicilan Aktif 6-tipes | `CicilanAktifPanel` | Utang |
| 10 | Utang Pribadi | `UtangPribadiPanel` | Utang |
| 11 | Gadai | `GadaiPanel` | Utang |
| 12 | Dashboard 9 KPIs | `DashboardPanel` (in Ringkasan tab) | Ringkasan |
| 13 | SnapshotRecap | `SnapshotRecap` | Ringkasan |
| 14 | DashboardSummary sidebar | `DashboardSummary` (in `layouts/app.vue` aside) | Always visible |

**9 KPIs in DashboardPanel**: HeroPair (NW + Modal Siap), DSR, Runway, Savings Rate, DAR, Safe Haven %, Allocation Discipline, SurplusGauge, EmergencyFundMeter.

**4 Charts**: AllocationDonut + ExpenseBreakdownDonut + SafeHavenBar + AssetVsLiabilityBar (inside DashboardPanel, grouped by type).

**Pricing integration**: `useGoldPrice()` + `useFxRates()` + `useIdxPrices()` + `useCryptoPrices()` wired via `watchEffect` → `derived.setPrices()`.

### 2. UI Behavior Contract audit (B1–B18) — PASS

| # | Behavior | Status | Evidence |
|---|----------|--------|----------|
| B1 | Store writes per-input | PASS | All form components use `snap.set*`/`snap.update*`/`snap.add*` on v-model/@input |
| B2 | Dirty guard | PASS | `useDirtyGuard()` called in `layouts/app.vue:11` |
| B3 | Realtime dashboard | PASS | `derived` store reacts to snapshot mutations → DashboardSummary/DashboardPanel consume computed values |
| B4 | Duplicate-ticker warning | PASS | SahamPanel:37-46 + CryptoPanel:61-68 |
| B5 | Missing-bunga warning | PASS | CicilanRow:27 `missingBunga` computed + warning UI |
| B6 | Gadai invariant | PASS | GadaiPanel:42-49 `rasioTertahan` (pawned/total ratio) + zone labels (identical to Phase-1) |
| B7 | FX mismatch | PASS | CicilanAktifPanel:36-43 FX-aware `overPenghasilan` uses `derived.penghasilanMonthlyIdr` (identical to Phase-1) |
| B8 | Chart empty-state gating | PASS | DashboardPanel:23 `hasAnyAsset` → `v-if` on chart mount |
| B9 | Modal Likuid zero-sum | PASS | ModalOptionsPanel per-option sizing capped by deployablePool |
| B10 | xlsx gating | PASS | TopNav:9 `downloadDisabled` when `totalAset === 0` |
| B11 | Pricing cooldown | PASS | `usePrices.ts:25` `REFRESH_COOLDOWN_MS = 30_000` |
| B12 | Demo CTA | PASS | Landing `pages/index.vue:99` → `/app/snapshot?demo=1` + `demoSnapshot.ts` |
| B13 | OJK disclaimer | PASS | `FooterDisclaimer` in `layouts/app.vue:43` + sim dialogs + copy from `lib/copy/strings.ts` |
| B14 | Zone labels | PASS | MetricCard imports `zoneOf` + `metric-explainers` registry |
| B15 | MetricExplainer | PASS | `MetricExplainerModal` in `layouts/app.vue:6,44` |
| B16 | Sim launch context | PASS | Sim components use `useSnapshotStore` + `useDerivedStore` |
| B17 | Bottom-nav 4 tabs + Soon | PASS | TabBar:17-21 (4 tabs) + `nav.soon` badge on Discover (disabled) |
| B18 | Save & Lanjutkan CTA | PASS | `pages/app/snapshot.vue:544-549` ButtonPrimary always enabled |

### 3. Calc preservation — PASS (with documented exception)

`git diff main..HEAD -- lib/finance lib/prices lib/snapshot lib/types lib/xlsx server/api` returns **4 files changed (+34/-12 lines)**. All are the **user-requested Pengeluaran scope expansion**, not scope creep:

| File | Change | Lines |
|------|--------|-------|
| `lib/types/snapshot.ts` | Added `pokokCurrency`, `lifestyleCurrency`, `pengeluaranLain[]` to type + `emptySnapshot()` | +17/-3 |
| `lib/finance/metrics.ts` | `calcTotalPengeluaran(snap, prices?)` FX-converts pokok+lifestyle+adds pengeluaranLain rows | +23/-6 |
| `lib/finance/goals.ts` | `surplus()` + `resolveTargetIdr()` pass `prices` to `calcTotalPengeluaran` | +4/-2 |
| `lib/finance/sims/max-utang.ts` | `runMaxUtang()` passes `prices` to `calcTotalPengeluaran` | +2/-1 |

Related changes outside `lib/` (also user-requested):
- `lib/copy/strings.ts` (+17 new keys for pengeluaran expansion UI)
- `stores/snapshot.ts` (+28 lines for pengeluaranLain state)
- `stores/derived.ts` (+1 line)
- `composables/useDirtyGuard.ts` (+3 lines pengeluaranLain tracking)
- `composables/useXlsx.ts` (+3 lines pengeluaranLain export)

All backward-compatible. Flagged in Day 5 Codex round-2 checklist as user-requested. `lib/prices/`, `lib/snapshot/`, `lib/xlsx/`, `server/api/` — **zero diff**.

### 4. Test suite — PASS

```
pnpm vue-tsc --noEmit: clean (no errors)
pnpm lint:              clean (0 errors, 0 warnings)
pnpm test:              25 files, 327 tests pass
Duration:               ~1.3s
```

Test count delta: 327 (326 Phase-1 + 1 new pengeluaranLainCount dirty-guard case).

### 5. Manual smoke — PENDING (user must verify in browser)

Desktop + mobile viewport checklist:

- [ ] Landing → primary CTA → snapshot empty state
- [ ] Fill Penghasilan → DSR + Surplus + relevant KPIs update in DashboardSummary sidebar
- [ ] Fill Saham per-emiten → Net Worth + Allocation Discipline update
- [ ] Fill Cicilan → DSR updates, missing-bunga warning surfaces if applicable
- [ ] Refresh emas/saham → LIVE pill flips, 30s cooldown enforces
- [ ] Save → reload page → all values restored from IndexedDB
- [ ] Tab close mid-edit → dirty-guard prompt fires
- [ ] Demo seed via `?demo=1` → Rio persona loads, all panels populated
- [ ] Mobile viewport: stacked layout sane, dashboard accessible, all controls usable
- [ ] Ringkasan tab: DashboardPanel renders all 9 KPIs + 4 charts
- [ ] SnapshotRecap shows itemized breakdown
- [ ] TopNav xlsx button disabled when empty, enabled after adding asset
- [ ] Sim launch pre-populated from snapshot store

### 6. `?demo=1` — PENDING (verify with manual smoke)

Rio persona loads, all panels populated, warnings/disclaimers visible. Code path verified: `triggerDemoFromQuery()` called in `onMounted` of `snapshot.vue:76`.

### 7. Compliance posture — PASS

- FooterDisclaimer rendered in `layouts/app.vue:43` (layer 1 — snapshot route)
- Sim dialog disclaimers preserved in all sim components (layer 2)
- Copy sourced from `lib/copy/strings.ts` registry — no verbatim v0/bolt copy
- Zone labels from `metric-explainers.ts` registry (e.g., "Cukup leluasa" not "Good")

---

## Day 6 fixes applied

| Fix | File | Detail |
|-----|------|--------|
| Lint error | `components/snapshot/SnapshotRecap.vue` | Removed unused `t` import |
| Lint warning | `components/dashboard/EmergencyFundMeter.vue` | Fixed first-attribute-linebreak |
| Duplicate render | `components/layout/DashboardPanel.vue` | Removed standalone AssetVsLiabilityBar (line 76) — already rendered in bar charts row (line 88) |

---

## Obsolete files — NONE to delete

Same 4 pages on both branches (`pages/app/{index,goals,simulator,snapshot}.vue`). Phase-1 wizard was intra-page pagination, not separate route files. REPLACE-AFTER-PARITY rule satisfied vacuously.

---

## Files changed (full diff stat: 82 files, +3578/-407)

Key new files: `Badge.vue`, `ButtonCTA.vue`, `IconChip.vue`, `CollapsiblePanel.vue`, `SnapshotRecap.vue`, `SnapshotTabBar.vue`, `DashboardSummary.vue`, `EmergencyFundMeter.vue`, `ExpenseBreakdownDonut.vue`, `AssetVsLiabilityBar.vue`, `SurplusGauge.vue`.

Key modified files: `pages/app/snapshot.vue` (+485 restructure to tabbed layout), `layouts/app.vue` (sidebar + sticky footer), `assets/css/main.css` (design tokens), `nuxt.config.ts` (Geist font).

---

## Gate decision

**Automated criteria: PASS (4/7)**
- [x] MVP feature audit (code-verified)
- [x] UI Behavior Contract B1–B18 (code-verified)
- [x] Calc preservation (4 known exceptions, user-requested)
- [x] Test suite (327/327, typecheck clean, lint clean)

**Manual criteria: PENDING (3/7)**
- [ ] Manual smoke (desktop + mobile) — user must verify
- [ ] `?demo=1` Rio persona — user must verify
- [ ] Compliance posture visual — user must verify

**After manual verification passes**: ready for Codex round-6 (Phase-2a final) review.
