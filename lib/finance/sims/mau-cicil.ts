// "Mau Cicil?" simulator — generic installment (non-KPR). Covers KPM / BANK_KTA / PINJOL /
// PAYLATER / KK / LAIN. KPR has its own simulator (different mental model: home + DP large).
//
// Effects on scenario (mirror mau-kpr.ts but no auto-property):
//   1) Add cicilan row (Anuitas/Flat) — pokok = harga − DP, cicilan via amortization.ts.
//   2) Optional asset row in asetNonLikuid (kendaraan / properti) — only if user fills
//      `asetValue + asetKategori`. Default skip (locked decision: avoid auto-tracking
//      depreciating elektronik / KK groceries; KPM user can opt in by setting nilai).
//   3) DP waterfall (FX-aware) from kas → deposito → reksaDana. Same helper as KPR.

import { anuitas, flat } from '~/lib/finance/amortization'
import {
  cloneSnapshot,
  computeGoalImpact,
  computeStandardDelta,
  rid,
  waterfallDebit,
} from '~/lib/finance/sims/_shared'
import { t } from '~/lib/copy/strings'
import type { Goal } from '~/lib/types/goals'
import type {
  CicilanRow,
  CicilanTipe,
  FxRatesMap,
  JenisBunga,
  PricesView,
  SnapshotState,
} from '~/lib/types/snapshot'
import type { SimResult } from '~/lib/types/sim'
import type { ModalSiapIncludes } from '~/lib/finance/metrics'

// KPR excluded — has its own simulator. KK is technically Revolving but we keep it under
// this simulator with Anuitas/Flat options (user can switch later in Cicilan Aktif panel).
export type CicilTipe = Exclude<CicilanTipe, 'KPR'>

export interface CicilInput {
  label: string
  tipe: CicilTipe
  hargaBarang: number
  dpPercent: number // 0..100; default 0 OK (KK/Paylater have no DP)
  tenorBulan: number
  bungaPercent: number // %/tahun
  jenisBunga: Extract<JenisBunga, 'Anuitas' | 'Flat'>
  // Optional asset tracking. Set both to add a non-likuid row reflecting the purchase.
  asetValue?: number
  asetKategori?: 'kendaraan' | 'properti'
}

export interface CicilComputed {
  dpIdr: number
  pokokPinjaman: number
  tenorBulan: number
  cicilanPerBulan: number
  totalBunga: number
}

export function computeCicil(input: CicilInput): CicilComputed {
  const dpIdr = Math.max(0, input.hargaBarang * (input.dpPercent / 100))
  const pokokPinjaman = Math.max(0, input.hargaBarang - dpIdr)
  const tenorBulan = Math.max(0, Math.round(input.tenorBulan))
  const am =
    input.jenisBunga === 'Flat'
      ? flat(pokokPinjaman, input.bungaPercent, tenorBulan)
      : anuitas(pokokPinjaman, input.bungaPercent, tenorBulan)
  return {
    dpIdr,
    pokokPinjaman,
    tenorBulan,
    cicilanPerBulan: am.cicilanPerBulan,
    totalBunga: am.totalBunga,
  }
}

interface ApplyResult {
  dpShortfall: number
}

function applyCicilToScenario(
  snap: SnapshotState,
  input: CicilInput,
  c: CicilComputed,
  fxRates: FxRatesMap | undefined,
): ApplyResult {
  const labelBase = input.label.trim() || 'Cicil scenario'
  snap.cicilanAktif.push({
    id: rid(),
    tipe: input.tipe,
    label: labelBase,
    sisaPokok: c.pokokPinjaman,
    cicilanPerBulan: c.cicilanPerBulan,
    sukuBunga: input.bungaPercent,
    tenorSisaBulan: c.tenorBulan,
    jenisBunga: input.jenisBunga,
  } satisfies CicilanRow)
  // Optional asset (locked decision: opt-in via asetValue + asetKategori both set).
  if (
    input.asetValue !== undefined &&
    input.asetValue > 0 &&
    input.asetKategori !== undefined
  ) {
    snap.asetNonLikuid[input.asetKategori].push({
      id: rid(),
      label: `Cicil scenario — ${labelBase}`,
      amount: input.asetValue,
    })
  }
  const dpShortfall = waterfallDebit(
    [snap.asetLikuid.kas, snap.asetLikuid.deposito, snap.asetLikuid.reksaDana],
    c.dpIdr,
    fxRates,
  )
  return { dpShortfall }
}

export function runMauCicil(
  input: CicilInput,
  snap: SnapshotState,
  goals: Goal[],
  opts: {
    prices?: PricesView
    fiMultiplier: number
    assumedAnnualReturnReal: number
    today?: Date
    includes?: ModalSiapIncludes
  },
): SimResult {
  const { prices } = opts
  const computed = computeCicil(input)
  const scenarioSnapshot = cloneSnapshot(snap)
  const { dpShortfall } = applyCicilToScenario(
    scenarioSnapshot,
    input,
    computed,
    prices?.fxRates,
  )

  const delta = computeStandardDelta(snap, scenarioSnapshot, prices, opts.includes)
  const goalImpact = computeGoalImpact(goals, snap, scenarioSnapshot, opts)

  const warnings: string[] = []
  if (dpShortfall > 0) warnings.push(t('sim.warning.dpExceedsLiquid'))

  return {
    scenarioSnapshot,
    scenarioGoals: goals,
    delta,
    goalImpact,
    warnings,
  }
}
