# Codex Review Checklist — Biaya Kos + Landing Polish

**Range:** `789f654..879868c` (7 feature commits) + `4ffabbb` (this checklist)
**Branch:** `alignment`
**Codex review:** 2 findings (1 medium, 1 low) — fixed in follow-up commits

## 1. Biaya Kos Type Extension
- [ ] `lib/types/snapshot.ts` — `biayaKos?` and `biayaKosCurrency?` added to `Pengeluaran` interface as optional
- [ ] `emptySnapshot()` includes `biayaKos: 0, biayaKosCurrency: 'IDR'` defaults
- [ ] Optional fields mean wealth-tracker page (snapshot.vue) never sets them → backward compat

## 2. Metrics: calcTotalPengeluaran + calcRentToIncomeRatio
- [ ] `lib/finance/metrics.ts` — biayaKos term added to `calcTotalPengeluaran` with FX conversion
- [ ] `calcRentToIncomeRatio` returns `null` when penghasilan ≤ 0 or biayaKos ≤ 0
- [ ] Returns `(kosIdr / income) × 100` when both present
- [ ] Thresholds: safe ≤25%, warning 25–35%, danger >35%

## 3. Derived Store
- [ ] `stores/derived.ts` — `calcRentToIncomeRatio` imported and `rentToIncomeRatio` computed exposed
- [ ] Returned in store's return object

## 4. PengeluaranForm — Conditional Biaya Kos Field
- [ ] `components/snapshot/PengeluaranForm.vue` — `showBiayaKos?: boolean` prop added (default false)
- [ ] Biaya Kos input placed ABOVE Pokok field, gated by `v-if="showBiayaKos"`
- [ ] Same pattern as Pokok/Lifestyle (InputCurrency + currency dropdown)
- [ ] snapshot.vue does NOT pass `showBiayaKos` → field hidden on wealth-tracker

## 5. Budget-Kos Page — Ringkasan Tab
- [ ] `pages/app/budget-kos.vue` — passes `show-biaya-kos` on `<PengeluaranForm>`
- [ ] Rent-to-income insight card: color-coded zones (emerald/amber/rose), shows ratio % + message + amounts
- [ ] Actionable recommendation shown when zone !== 'safe': "Coba cari kos di range Rp X–Y/bulan"
- [ ] `goNext()` migrates biayaKos → pengeluaranLain row + resets biayaKos to 0 + switches mode to wealthTracker
- [ ] Dynamic Mamikos CTA: price range from biayaKos ±25%, fallback to all prices when biayaKos = 0

## 6. Demo Data
- [ ] `lib/fixtures/demoSnapshot.ts` — biayaKos 1.2M + pokok 1.5M (was combined 2.8M)
- [ ] Realistic anak kos Jakarta: kos 1.2M, makan/transport/listrik 1.5M

## 7. Explainer Modals
- [ ] `layouts/default.vue` — MetricExplainerModal added (was only in app.vue layout)
- [ ] `lib/copy/metric-explainers.ts` — `rentToIncome` and `surplusBulanan` entries added with zones
- [ ] Info icon buttons in budget-kos Ringkasan call `explainer.open()` — same pattern as snapshot page
- [ ] OJK lint: no prescriptive lemmas ("harus", "sebaiknya", etc.)

## 8. Landing Page Updates
- [ ] Headline: "Cermat kelola duit, dari ngekos sampai punya rumah"
- [ ] Subtitle: "Cek kondisi keuangan, atur aset, sampai siap beli rumah — semuanya dari satu tempat."
- [ ] Brand tagline synced with headline
- [ ] "Cari Kos Sekitar Kamu" CTA deep-links to Mamikos search with price filters
- [ ] "Beli Kos Buat Investasi" CTA links to `mamikos.com/jual/cari?type=Kost`
- [ ] "Cari Rumah Impianmu" CTA links to `mamikos.com/jual/cari?type=Rumah`
- [ ] "Rekap Duit Kamu" replaces "Wealth Tracker Lengkap" on second CTA card
- [ ] Landing brand pill: "Cermat" (removed "× Mamikos")

## 9. FX Rates Fix
- [ ] `pages/app/budget-kos.vue` — `useFxRates()` + `watchEffect` added to populate `derived.setPrices()`
- [ ] Non-IDR currency inputs now convert properly (was "kurs belum kebaca" before)

## 10. Tests
- [ ] 9 new tests: `calcTotalPengeluaran` with biayaKos (includes, backward compat, FX conversion)
- [ ] `calcRentToIncomeRatio` (null cases, correct percentage, FX conversion)
- [ ] All 361 tests pass, typecheck clean

## 11. Copy Keys Added
- [ ] `snapshot.pengeluaran.biayaKos.label` / `.help`
- [ ] `budgetKos.biayaKos.ratio.label` / `.safe` / `.warning` / `.danger` / `.recommend`
- [ ] `cta.mamikos.rumah.label` / `.body` / `.invest.label` / `.invest.body`

## Sengaja tidak diubah
- `components/dashboard/PersonaCard.vue` — unused (inline hero in budget-kos.vue is the active component)
- `components/snapshot/BudgetKosRecap.vue` — unused (replaced by inline Ringkasan)
- `composables/useModeCopy.ts` — unused (replaced by `tm()` in strings.ts)
- `lib/finance/persona.ts` — no changes needed (personas auto-adjust via savings rate/runway)
