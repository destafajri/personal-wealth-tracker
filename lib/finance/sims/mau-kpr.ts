// "Mau KPR?" simulator — first decision simulator, sets the pattern for the rest.
//
// Pure function. Never mutates the input snapshot. Returns a fresh scenarioSnapshot
// (clone + KPR effects applied) + computed delta vs. the original. UI layer just renders.
//
// KPR effects on scenario:
//   1) Add cicilan KPR row (Anuitas default) — pokok = harga − DP, cicilan computed via
//      lib/finance/amortization.ts so simulator math matches the canonical schedule.
//   2) Add property row to asetNonLikuid.properti — nilai = full harga rumah (locked
//      decision: better Net Worth framing than DP-only equity accounting).
//   3) Debit DP via waterfall kas → deposito → reksaDana (locked decision). FX-aware
//      after Codex round-12. Drain stops at 0; leftover triggers shortfall warning.
//
// Goal impact = re-run goalProgress against scenarioSnapshot per goal. Same pure fn used
// by /app/goals — no special-casing.

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
  FxRatesMap,
  JenisBunga,
  PricesView,
  SnapshotState,
} from '~/lib/types/snapshot'
import type { SimResult } from '~/lib/types/sim'
import type { ModalSiapIncludes } from '~/lib/finance/metrics'

export interface KprInput {
  label: string
  hargaRumah: number
  dpPercent: number // 0..100
  tenorTahun: number // years (×12 = bulan)
  bungaPercent: number // %/tahun
  jenisBunga: Extract<JenisBunga, 'Anuitas' | 'Flat'>
}

export interface KprComputed {
  dpIdr: number
  pokokPinjaman: number
  tenorBulan: number
  cicilanPerBulan: number
  totalBunga: number
}

export function computeKpr(input: KprInput): KprComputed {
  const dpIdr = Math.max(0, input.hargaRumah * (input.dpPercent / 100))
  const pokokPinjaman = Math.max(0, input.hargaRumah - dpIdr)
  const tenorBulan = Math.max(0, Math.round(input.tenorTahun * 12))
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

function applyKprToScenario(
  snap: SnapshotState,
  input: KprInput,
  c: KprComputed,
  fxRates: FxRatesMap | undefined,
): ApplyResult {
  const labelBase = input.label.trim() || 'KPR scenario'
  snap.cicilanAktif.push({
    id: rid(),
    tipe: 'KPR',
    label: labelBase,
    sisaPokok: c.pokokPinjaman,
    cicilanPerBulan: c.cicilanPerBulan,
    sukuBunga: input.bungaPercent,
    tenorSisaBulan: c.tenorBulan,
    jenisBunga: input.jenisBunga,
  } satisfies CicilanRow)
  snap.asetNonLikuid.properti.push({
    id: rid(),
    label: `KPR scenario — ${labelBase}`,
    amount: input.hargaRumah,
  })
  const dpShortfall = waterfallDebit(
    [snap.asetLikuid.kas, snap.asetLikuid.deposito, snap.asetLikuid.reksaDana],
    c.dpIdr,
    fxRates,
  )
  return { dpShortfall }
}

export function runMauKpr(
  input: KprInput,
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
  const computed = computeKpr(input)
  const scenarioSnapshot = cloneSnapshot(snap)
  const { dpShortfall } = applyKprToScenario(
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
