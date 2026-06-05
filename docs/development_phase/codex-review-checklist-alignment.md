# Codex Review Checklist — Branch `alignment`

## Scope
Separate Budget Kos page (`/app/budget-kos`) from Wealth Tracker (`/app/snapshot`).
Mode-aware dashboard: `budgetKos` vs `wealthTracker`.

**Review range**: `fc242ce..HEAD` (all changes on `alignment` since main split).
The 2-commit range `9997bc7..386e810` is only the final polish; the mode system
and conditional rendering were introduced across earlier commits in this branch.

---

## 1. Wealth Tracker — Zero Regression

- [ ] `/app/snapshot` always sets `snap.mode = 'wealthTracker'` on mount
- [ ] Dashboard labels professional: "Net Worth", "DSR", "Runway", "Savings Rate"
- [ ] PersonaCard hidden (v-if=false when mode=wealthTracker)
- [ ] CtaMamikos hidden (both afterPersona + dashboardBottom)
- [ ] Simulator shows "Mau KPR" (not "Mau Kos/Sewa?")
- [ ] Simulator title = "Simulator" (not "Simulasi Keputusan")
- [ ] TopNav subtitle = "Cek Rupiah Mu Agar Teratur 💸"
- [ ] All 6 tabs still present: Cash Flow, Kas, Investasi, Aset Tetap, Utang, Ringkasan
- [ ] Ringkasan sidebar still shows full DashboardSummary
- [ ] SnapshotRecap renders all 9 sections (Penghasilan → Gadai)
- [ ] All charts render: Alokasi Saham, Komposisi Pengeluaran, Rasio Aset vs Utang
- [ ] Goals section visible
- [ ] Modal Options panel visible
- [ ] Demo data (Rio profile) loads correctly via `?demo=1`
- [ ] Core calculation files unchanged: `derived.ts`, `metrics.ts`, `goals.ts`, `thresholds.ts`

## 2. Budget Kos — New Page

- [ ] `/app/budget-kos` uses `layout: 'default'` (no tab bar, no sidebar)
- [ ] Only 4 tabs: Cash Flow, Kas, Utang, Ringkasan
- [ ] No Investasi tab
- [ ] No Aset Tetap tab
- [ ] Ringkasan shows gamified persona hero card (not DashboardPanel)
- [ ] Persona resolves correctly with demo data
- [ ] Surplus hero shows green/red based on positive/negative
- [ ] Kas & Utang health cards render correctly
- [ ] CTA Mamikos visible in Ringkasan
- [ ] "Lanjut ke Wealth Tracker" navigates to `/app/snapshot`
- [ ] Budget Kos demo data is anak kos profile (gaji 3.5jt, freelance, paylater, motor)
- [ ] Budget Kos demo does NOT seed: saham, crypto, emas, properti, deposito, RD, SBN

## 3. Landing Page Routing

- [ ] "Cek Budget Ngekos" modal → links go to `/app/budget-kos` and `/app/budget-kos?demo=1`
- [ ] "Wealth Tracker Lengkap" modal → links go to `/app/snapshot` and `/app/snapshot?demo=1`
- [ ] `pendingMode` ref correctly sets mode before navigation
- [ ] `startFresh()` resets store then sets mode

## 4. Mode System

- [ ] `stores/snapshot.ts` has `mode: AppMode | null` field
- [ ] `mode` resets to `null` on `reset()`
- [ ] `tm()` helper in `lib/copy/strings.ts` returns wt.* override when mode=wealthTracker
- [ ] `tm()` falls back to `t()` (base labels) when mode=budgetKos or null
- [ ] `wt.*` keys exist in copy for: netWorth, modalSiap, dsr, runway, savingsRate, simulator cards, simulator title/subtitle, nav brand subtitle

## 5. Build & Tests

- [ ] `npx vue-tsc --noEmit` clean
- [ ] `npm run build` succeeds
- [ ] 354 tests pass
- [ ] No new lint issues

## 6. Files Changed

| File | Change |
|---|---|
| `stores/snapshot.ts` | +AppMode type, +mode ref |
| `lib/copy/strings.ts` | +wt.* overrides, +tm() helper |
| `lib/fixtures/demoSnapshot.ts` | +applyBudgetKosDemo(), +triggerBudgetKosDemo() |
| `components/layout/DashboardPanel.vue` | +v-if isBudgetKos on PersonaCard/CtaMamikos |
| `components/dashboard/HeroPair.vue` | +tm() for metric labels |
| `components/dashboard/MetricCard.vue` | +tm() for metric labels |
| `components/layout/TopNav.vue` | +tm() for brand subtitle |
| `components/simulator/SimLauncher.vue` | +tm() for card labels |
| `pages/app/simulator.vue` | +tm() for title/subtitle |
| `pages/app/snapshot.vue` | mode=wealthTracker in onMounted |
| `pages/index.vue` | dynamic modalRoute based on pendingMode |
| **NEW** `pages/app/budget-kos.vue` | full new page |
| **NEW** `components/snapshot/BudgetKosRecap.vue` | budget recap (unused, can remove) |
| **NEW** `composables/useModeCopy.ts` | mc() helper (unused, can remove) |
