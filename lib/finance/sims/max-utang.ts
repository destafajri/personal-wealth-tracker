// "Max Utang Aman" capacity simulator. Reverse-solve: given current penghasilan + existing
// cicilan + target DSR, what's the MAX new monthly cicilan that keeps DSR under target?
// Then translate that cicilan into 3 equivalent scenarios (KPR / KPM / Paylater) so user
// sees what kind of debt actually fits the headroom.
//
// Does NOT mutate snapshot — purely a calculation. Returns CapacityResult shape (no
// scenarioSnapshot, no delta table, no goal impact). Hero number = max new cicilan/bln.

import { anuitasInversePokok } from '~/lib/finance/amortization'
import {
  calcTotalPengeluaran,
  totalPenghasilanMonthly,
} from '~/lib/finance/metrics'
import { idr } from '~/lib/format/idr'
import { t } from '~/lib/copy/strings'
import type {
  PricesView,
  SnapshotState,
} from '~/lib/types/snapshot'
import type { CapacityResult, CapacityScenario } from '~/lib/types/sim'

// User picks 1+ utang tipes — simulator renders 1 scenario per picked tipe so user bisa
// compare (mis. KPR vs KPM kalau lagi mikir antara dua). Empty array → no scenarios.
export type MaxUtangTipe = 'kpr' | 'kpm' | 'paylater'

export const MAX_UTANG_TIPES: ReadonlyArray<MaxUtangTipe> = ['kpr', 'kpm', 'paylater']

export interface MaxUtangInput {
  targetDsrPercent: number // default 30 (sehat threshold)
  tipes: MaxUtangTipe[] // 1+ picks; renders 1 scenario per pick in this order
  // Override knobs per-tipe (optional — collapsed by default per design-guidelines §8.18).
  // Only fields matching picked tipes are read; others ignored.
  // KPR tenor in YEARS (longer horizon); KPM + Paylater in MONTHS (typical contract framing).
  kprTenorTahun?: number // default 20
  kprBungaPercent?: number // default 7
  kpmTenorBulan?: number // default 36
  kpmBungaPercent?: number // default 8
  paylaterTenorBulan?: number // default 12
  paylaterBungaPercent?: number // default 24
}

// Sum monthly cicilan from cicilanAktif + utangPribadi. Same definition as DSR's cicilan
// numerator (lib/finance/metrics.ts) so headroom math matches dashboard.
function sumCicilanPerBulan(snap: SnapshotState): number {
  const cicilan = snap.cicilanAktif.reduce((s, c) => s + (c.cicilanPerBulan || 0), 0)
  const pribadi = snap.utangPribadi.reduce((s, u) => s + (u.cicilanPerBulan || 0), 0)
  return cicilan + pribadi
}

export function runMaxUtang(
  input: MaxUtangInput,
  snap: SnapshotState,
  opts: { prices?: PricesView },
): CapacityResult {
  const { prices } = opts
  const targetDsr = Math.max(0, Math.min(100, input.targetDsrPercent))
  const penghasilan = totalPenghasilanMonthly(snap, prices)
  const currentCicilan = sumCicilanPerBulan(snap)

  const warnings: string[] = []

  if (penghasilan <= 0) {
    warnings.push(t('sim.maxUtang.warning.noPenghasilan'))
    return {
      heroValue: 0,
      heroLabel: t('sim.maxUtang.hero.label'),
      scenarios: [],
      warnings,
    }
  }

  const maxTotalCicilan = penghasilan * (targetDsr / 100)
  const maxNewCicilan = Math.max(0, maxTotalCicilan - currentCicilan)

  if (maxNewCicilan <= 0) {
    warnings.push(t('sim.maxUtang.warning.zeroHeadroom'))
    // Companion advisory: suggest paying existing debt or boosting income.
    return {
      heroValue: 0,
      heroLabel: t('sim.maxUtang.hero.label'),
      scenarios: [],
      warnings,
    }
  }

  // Burn-rate advisory: if Total Pengeluaran already > penghasilan, headroom is misleading
  // because user is bleeding cash. Surface as warning but still compute scenarios.
  const totalBurn = calcTotalPengeluaran(snap, prices)
  if (totalBurn > penghasilan) {
    warnings.push(t('sim.maxUtang.warning.burnOverIncome'))
  }

  // Render canonical order (kpr → kpm → paylater) regardless of pick-array order, so the
  // result list looks consistent if user toggles checkboxes. Dedup via Set in case caller
  // passes duplicates.
  const pickedSet = new Set<MaxUtangTipe>(input.tipes)
  const scenarios: CapacityScenario[] = []
  for (const tipe of MAX_UTANG_TIPES) {
    if (!pickedSet.has(tipe)) continue
    scenarios.push(buildScenario(tipe, maxNewCicilan, input))
  }

  return {
    heroValue: maxNewCicilan,
    heroLabel: t('sim.maxUtang.hero.label'),
    scenarios,
    warnings,
  }
}

// Build a single scenario for the given tipe. DP framing per tipe: 20% for KPR/KPM,
// 0% for Paylater (purchase price = pokok). Same anuitas inverse helper for all 3.
function buildScenario(
  tipe: MaxUtangTipe,
  maxNewCicilan: number,
  input: MaxUtangInput,
): CapacityScenario {
  if (tipe === 'kpr') {
    const tenorTahun = input.kprTenorTahun ?? 20
    const tenorBulan = tenorTahun * 12
    const bunga = input.kprBungaPercent ?? 7
    const pokok = anuitasInversePokok(maxNewCicilan, bunga, tenorBulan)
    const harga = pokok / 0.8
    return {
      key: 'kpr',
      label: t('sim.maxUtang.scenario.kpr.label'),
      description: t('sim.maxUtang.scenario.kpr.body', {
        harga: idr(harga),
        tenor: tenorTahun,
        bunga,
      }),
    }
  }
  if (tipe === 'kpm') {
    const tenorBulan = input.kpmTenorBulan ?? 36
    const bunga = input.kpmBungaPercent ?? 8
    const pokok = anuitasInversePokok(maxNewCicilan, bunga, tenorBulan)
    const harga = pokok / 0.8
    return {
      key: 'kpm',
      label: t('sim.maxUtang.scenario.kpm.label'),
      description: t('sim.maxUtang.scenario.kpm.body', {
        harga: idr(harga),
        tenor: tenorBulan,
        bunga,
      }),
    }
  }
  // paylater
  const tenorBulan = input.paylaterTenorBulan ?? 12
  const bunga = input.paylaterBungaPercent ?? 24
  const pokok = anuitasInversePokok(maxNewCicilan, bunga, tenorBulan)
  return {
    key: 'paylater',
    label: t('sim.maxUtang.scenario.paylater.label'),
    description: t('sim.maxUtang.scenario.paylater.body', {
      harga: idr(pokok),
      tenor: tenorBulan,
      bunga,
    }),
  }
}
