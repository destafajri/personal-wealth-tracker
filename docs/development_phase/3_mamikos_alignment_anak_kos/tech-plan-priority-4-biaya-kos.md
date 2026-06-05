# Biaya Kos — Dedicated Field + Rent-to-Income Insight Card

## Problem

Budget-kos page focuses on anak kos insights, but kos rent cost is buried inside "Pengeluaran Pokok" alongside food, transport, and electricity. Without a separate field, the app cannot calculate rent-to-income ratio — the single most actionable insight for anak kos.

## Design Decisions

### Storage: Extend Pengeluaran type
Added optional `biayaKos` and `biayaKosCurrency` fields to the `Pengeluaran` interface. Optional means zero impact on the wealth-tracker page — it never sets them, so they default to `0` / `'IDR'` via `emptySnapshot()`.

### Metric: calcRentToIncomeRatio
New pure function returns `(biayaKos / penghasilan) × 100` or `null` when either value is zero. Follows the same pattern as `calcDsr`.

### Thresholds (from financial planning best practices)
| Zone     | Range    | Color   | Message                                              |
|----------|----------|---------|------------------------------------------------------|
| Safe     | ≤ 25%    | Emerald | Budget kos masih dalam batas aman                    |
| Warning  | 25–35%   | Amber   | Mendekati batas aman, pertimbangkan kos lebih murah  |
| Danger   | > 35%    | Rose    | Melewati batas aman, tabungan/pos lain terganggu     |

### Actionable recommendation
When rent is not in the safe zone, the card shows: "Coba cari kos di range Rp {min}–{max}/bulan biar rasio aman" where min = 25% × income and max = 30% × income.

### UI: Conditional form field
`PengeluaranForm.vue` accepts a `showBiayaKos` prop (default false). Budget-kos passes `true`; snapshot page doesn't pass it — field stays hidden.

## Files Modified

| File | Change |
|------|--------|
| `lib/types/snapshot.ts` | Add `biayaKos?` and `biayaKosCurrency?` to `Pengeluaran` interface + `emptySnapshot()` |
| `lib/finance/metrics.ts` | Add biayaKos term to `calcTotalPengeluaran` + new `calcRentToIncomeRatio` function |
| `stores/derived.ts` | Expose `rentToIncomeRatio` computed |
| `lib/copy/strings.ts` | Add form labels + insight card messages (safe/warning/danger + recommendation) |
| `components/snapshot/PengeluaranForm.vue` | Add conditional Biaya Kos input above Pokok field |
| `pages/app/budget-kos.vue` | Wire `show-biaya-kos` prop + rent-to-income insight card in Ringkasan |
| `lib/fixtures/demoSnapshot.ts` | Split: biayaKos 1.2M + pokok 1.5M (was combined 2.8M) |
| `tests/finance/metrics.test.ts` | 9 new tests for biayaKos integration |

## Tests

- `calcTotalPengeluaran` includes biayaKos when set
- `calcTotalPengeluaran` treats biayaKos as 0 when undefined (backward compat)
- `calcTotalPengeluaran` converts non-IDR biayaKos via fxRates
- `calcRentToIncomeRatio` returns null when penghasilan = 0
- `calcRentToIncomeRatio` returns null when biayaKos = 0
- `calcRentToIncomeRatio` calculates correct percentage
- `calcRentToIncomeRatio` converts non-IDR before calculation

All 361 tests pass. Typecheck clean.

## Rent Budget Reference (from user research)

Rule of thumb: sewa kos idealnya max 25–30% dari take-home pay.

| Salary/month | Ideal (25%) | Max (30%) |
|-------------|-------------|-----------|
| Rp 3 juta   | Rp 750rb    | Rp 900rb  |
| Rp 5 juta   | Rp 1.25 jt  | Rp 1.5 jt |
| Rp 8 juta   | Rp 2 jt     | Rp 2.4 jt |
| Rp 12 juta  | Rp 3 jt     | Rp 3.6 jt |

Context matters:
- Big cities (Jakarta, Surabaya): 30–35% is common due to high kos prices
- All-in kos (includes food, laundry, wifi): higher rent is offset by savings elsewhere
- Fresh grads: safer at 20% to build 3–6 month emergency fund first
- Students funded by parents: ratio measured against monthly allowance, not salary
