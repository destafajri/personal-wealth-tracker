// Loan amortization — pure functions. Used by Day 6+ wizards; ships in Day 3 with tests so
// the math is locked before UI consumes it.
//
// Conventions:
// - pokok / sisaPokok: IDR (number)
// - bungaPerTahun: percent per year (e.g., 7.5, not 0.075)
// - bungaPerBulan: percent per month (e.g., 1.5)
// - tenorBulan / months: integer ≥ 0
// - All amounts in the returned schedule are IDR; no rounding to "rupiah penuh" — caller
//   formats with lib/format/idr.

export interface ScheduleRow {
  bulan: number // 1-indexed
  pokok: number // principal repaid this month
  bunga: number // interest paid this month
  sisa: number // remaining principal AFTER this month's payment
}

export interface Amortization {
  cicilanPerBulan: number
  totalBunga: number
  totalBayar: number
  schedule: ScheduleRow[]
}

export interface RevolvingProjection {
  monthsToClear: number | null // null if minimum payment doesn't cover monthly interest
  totalBunga: number | null
  schedule: ScheduleRow[] // truncated to cap (default 600 mo / 50 yr) when projection diverges
}

// ----- Anuitas (fixed monthly payment, declining-balance) -----

export function anuitas(
  pokok: number,
  bungaPerTahun: number,
  tenorBulan: number,
): Amortization {
  if (tenorBulan <= 0 || pokok <= 0) {
    return { cicilanPerBulan: 0, totalBunga: 0, totalBayar: 0, schedule: [] }
  }
  const i = bungaPerTahun / 100 / 12
  const cicilanPerBulan =
    i === 0
      ? pokok / tenorBulan
      : (pokok * i * Math.pow(1 + i, tenorBulan)) /
        (Math.pow(1 + i, tenorBulan) - 1)

  const schedule: ScheduleRow[] = []
  let sisa = pokok
  let totalBunga = 0
  for (let bulan = 1; bulan <= tenorBulan; bulan++) {
    const bunga = sisa * i
    const pokokBulan = Math.min(cicilanPerBulan - bunga, sisa)
    sisa = Math.max(0, sisa - pokokBulan)
    totalBunga += bunga
    schedule.push({ bulan, pokok: pokokBulan, bunga, sisa })
  }
  return {
    cicilanPerBulan,
    totalBunga,
    totalBayar: cicilanPerBulan * tenorBulan,
    schedule,
  }
}

// ----- Flat (interest on initial principal each month) -----

export function flat(
  pokok: number,
  bungaPerTahun: number,
  tenorBulan: number,
): Amortization {
  if (tenorBulan <= 0 || pokok <= 0) {
    return { cicilanPerBulan: 0, totalBunga: 0, totalBayar: 0, schedule: [] }
  }
  const pokokBulan = pokok / tenorBulan
  const bungaBulan = (pokok * (bungaPerTahun / 100)) / 12
  const cicilanPerBulan = pokokBulan + bungaBulan

  const schedule: ScheduleRow[] = []
  let sisa = pokok
  for (let bulan = 1; bulan <= tenorBulan; bulan++) {
    sisa = Math.max(0, sisa - pokokBulan)
    schedule.push({ bulan, pokok: pokokBulan, bunga: bungaBulan, sisa })
  }
  return {
    cicilanPerBulan,
    totalBunga: bungaBulan * tenorBulan,
    totalBayar: cicilanPerBulan * tenorBulan,
    schedule,
  }
}

// ----- Floating (treated as anuitas at current rate; UI flags "proyeksi pakai rate sekarang") -----

export function floating(
  pokok: number,
  bungaPerTahunSaatIni: number,
  tenorBulan: number,
): Amortization {
  return anuitas(pokok, bungaPerTahunSaatIni, tenorBulan)
}

// ----- Revolving (credit-card / paylater style, % of outstanding) -----
//
// Each month: bunga = sisa × bungaPerBulan; minimum payment = max(minPaymentFloor, sisa × minPaymentRate).
// If payment ≤ bunga → balance never decreases → return null. Otherwise iterate until cleared
// (cap at projectionCap months to avoid runaway loops on near-divergent rates).

const REVOLVING_PROJECTION_CAP = 600 // 50 years

export function revolving(
  sisaPokok: number,
  bungaPerBulanPercent: number,
  minPaymentRate: number, // e.g., 0.05 = 5% of outstanding
  minPaymentFloor = 0,
): RevolvingProjection {
  if (sisaPokok <= 0) {
    return { monthsToClear: 0, totalBunga: 0, schedule: [] }
  }
  const iBulan = bungaPerBulanPercent / 100
  const schedule: ScheduleRow[] = []
  let sisa = sisaPokok
  let totalBunga = 0
  for (let bulan = 1; bulan <= REVOLVING_PROJECTION_CAP; bulan++) {
    const bunga = sisa * iBulan
    const requestedPayment = Math.max(minPaymentFloor, sisa * minPaymentRate)
    const payment = Math.min(requestedPayment, sisa + bunga)
    const pokokBulan = payment - bunga
    if (pokokBulan <= 0) {
      // Payment doesn't even cover interest — diverges. Return null sentinel.
      return { monthsToClear: null, totalBunga: null, schedule }
    }
    sisa = Math.max(0, sisa - pokokBulan)
    totalBunga += bunga
    schedule.push({ bulan, pokok: pokokBulan, bunga, sisa })
    // Asymptotic decay (min-payment % of balance) approaches but never hits 0 — treat
    // sub-rupiah residue as cleared.
    if (sisa < 1) {
      return { monthsToClear: bulan, totalBunga, schedule }
    }
  }
  // Hit cap without clearing — treat as non-clearing.
  return { monthsToClear: null, totalBunga: null, schedule }
}
