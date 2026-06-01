// "Max Utang Aman" capacity wizard. Reverse-solve: given current penghasilan + existing
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
import type { CapacityResult, CapacityScenario } from '~/lib/types/wizard'

export interface MaxUtangInput {
  targetDsrPercent: number // default 30 (sehat threshold)
  // KPR override knobs (optional — collapsed by default in UI per design-guidelines §8.18).
  kprTenorTahun?: number // default 20
  kprBungaPercent?: number // default 7
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
    warnings.push(t('wizard.maxUtang.warning.noPenghasilan'))
    return {
      heroValue: 0,
      heroLabel: t('wizard.maxUtang.hero.label'),
      scenarios: [],
      warnings,
    }
  }

  const maxTotalCicilan = penghasilan * (targetDsr / 100)
  const maxNewCicilan = Math.max(0, maxTotalCicilan - currentCicilan)

  if (maxNewCicilan <= 0) {
    warnings.push(t('wizard.maxUtang.warning.zeroHeadroom'))
    // Companion advisory: suggest paying existing debt or boosting income.
    return {
      heroValue: 0,
      heroLabel: t('wizard.maxUtang.hero.label'),
      scenarios: [],
      warnings,
    }
  }

  // Burn-rate advisory: if Total Pengeluaran already > penghasilan, headroom is misleading
  // because user is bleeding cash. Surface as warning but still compute scenarios.
  const totalBurn = calcTotalPengeluaran(snap)
  if (totalBurn > penghasilan) {
    warnings.push(t('wizard.maxUtang.warning.burnOverIncome'))
  }

  // KPR scenario (locked defaults: 20 thn / 7%, 20% DP → harga = pokok / 0.8)
  const kprTenorBulan = (input.kprTenorTahun ?? 20) * 12
  const kprBunga = input.kprBungaPercent ?? 7
  const kprPokok = anuitasInversePokok(maxNewCicilan, kprBunga, kprTenorBulan)
  const kprHarga = kprPokok / 0.8

  // KPM scenario (locked: 36 bln / 8%, 20% DP)
  const kpmTenorBulan = 36
  const kpmBunga = 8
  const kpmPokok = anuitasInversePokok(maxNewCicilan, kpmBunga, kpmTenorBulan)
  const kpmHarga = kpmPokok / 0.8

  // Paylater scenario (locked: 12 bln / 24%, no DP — purchase price = pokok)
  const plTenorBulan = 12
  const plBunga = 24
  const plPokok = anuitasInversePokok(maxNewCicilan, plBunga, plTenorBulan)

  const scenarios: CapacityScenario[] = [
    {
      key: 'kpr',
      label: t('wizard.maxUtang.scenario.kpr.label'),
      description: t('wizard.maxUtang.scenario.kpr.body', {
        harga: idr(kprHarga),
        tenor: input.kprTenorTahun ?? 20,
        bunga: kprBunga,
      }),
    },
    {
      key: 'kpm',
      label: t('wizard.maxUtang.scenario.kpm.label'),
      description: t('wizard.maxUtang.scenario.kpm.body', {
        harga: idr(kpmHarga),
      }),
    },
    {
      key: 'paylater',
      label: t('wizard.maxUtang.scenario.paylater.label'),
      description: t('wizard.maxUtang.scenario.paylater.body', {
        harga: idr(plPokok),
      }),
    },
  ]

  return {
    heroValue: maxNewCicilan,
    heroLabel: t('wizard.maxUtang.hero.label'),
    scenarios,
    warnings,
  }
}
