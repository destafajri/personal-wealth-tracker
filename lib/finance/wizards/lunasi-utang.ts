// "Lunasi Utang Sekarang" capacity wizard. User picks a debt + payment amount; we apply
// to scenarioSnapshot and show delta + goal impact.
//
// Debt scope (locked Day 8): Cicilan Aktif + Utang Pribadi + Gadai (all 3 sources that
// contribute to Total Utang). Sort by `jatuh_tempo asc` / insertion order, NEVER by rate
// (OJK §11.1 — ranking by rate implies "best repayment strategy" advice we don't give).
//
// Per-jenis-bunga behaviour for Cicilan Aktif:
//   - Anuitas/Flat: user picks mode 'tenor' (tenor shortens, cicilan unchanged) OR
//     'cicilan' (cicilan reduces, tenor unchanged). Re-amortize on the chosen axis.
//   - Revolving/Floating: sisaPokok drops; cicilan/bln stays user-set (Revolving has no
//     fixed tenor anyway).
// Utang Pribadi + Gadai: simple drop on sisaPokok / piutangIdr; row removed when 0.
//
// Payment debited from Modal Siap via FX-aware waterfall (kas → deposito → reksaDana),
// same helper as KPR/Cicil DP. Shortfall triggers warning.

import {
  anuitas,
  anuitasInverseTenor,
  flat,
} from '~/lib/finance/amortization'
import {
  cloneSnapshot,
  computeGoalImpact,
  computeStandardDelta,
  waterfallDebit,
} from '~/lib/finance/wizards/_shared'
import { t } from '~/lib/copy/strings'
import type { Goal } from '~/lib/types/goals'
import type {
  FxRatesMap,
  PricesView,
  SnapshotState,
} from '~/lib/types/snapshot'
import type { WizardResult } from '~/lib/types/wizard'
import type { ModalSiapIncludes } from '~/lib/finance/metrics'

export type LunasiSource = 'cicilan' | 'utangPribadi' | 'gadai'
export type LunasiAnuitasMode = 'tenor' | 'cicilan'

export interface LunasiInput {
  source: LunasiSource
  id: string // row id in the matching source list
  paymentIdr: number
  // For Cicilan with Anuitas/Flat. Ignored for Revolving/Floating + utangPribadi + gadai.
  // Defaults to 'cicilan' (cicilan reduces) when applicable but not provided.
  modeAnuitas?: LunasiAnuitasMode
}

interface ApplyResult {
  actualPayment: number
  sourceDeficit: number
  lunasCompleted: boolean
  // Surfacing the post-pay row state so UI can show "tenor sisa: X bulan" or "cicilan/bln: Rp Y"
  postSisaPokok?: number
  postCicilanPerBulan?: number
  postTenorBulan?: number
}

function applyLunasiToScenario(
  snap: SnapshotState,
  input: LunasiInput,
  fxRates: FxRatesMap | undefined,
): ApplyResult {
  const requestedPayment = Math.max(0, input.paymentIdr)
  // Debit Modal Siap (FX-aware) before touching debt — if liquid runs out we still
  // apply what we could source so user sees the gap.
  const sourceDeficit = waterfallDebit(
    [snap.asetLikuid.kas, snap.asetLikuid.deposito, snap.asetLikuid.reksaDana],
    requestedPayment,
    fxRates,
  )
  const actualPayment = requestedPayment - sourceDeficit

  if (actualPayment <= 0) {
    return { actualPayment: 0, sourceDeficit, lunasCompleted: false }
  }

  if (input.source === 'cicilan') {
    const idx = snap.cicilanAktif.findIndex((c) => c.id === input.id)
    if (idx === -1) return { actualPayment, sourceDeficit, lunasCompleted: false }
    const row = snap.cicilanAktif[idx]!
    const newSisa = Math.max(0, row.sisaPokok - actualPayment)
    if (newSisa === 0) {
      // Full lunas — drop the row entirely.
      snap.cicilanAktif.splice(idx, 1)
      return {
        actualPayment,
        sourceDeficit,
        lunasCompleted: true,
        postSisaPokok: 0,
      }
    }
    // Partial — handle per jenisBunga.
    const isReamortizable = row.jenisBunga === 'Anuitas' || row.jenisBunga === 'Flat'
    if (isReamortizable) {
      const mode = input.modeAnuitas ?? 'cicilan'
      const bunga = row.sukuBunga ?? 0
      if (mode === 'cicilan') {
        // Keep tenor, recompute cicilan from new pokok.
        const am =
          row.jenisBunga === 'Flat'
            ? flat(newSisa, bunga, row.tenorSisaBulan ?? 0)
            : anuitas(newSisa, bunga, row.tenorSisaBulan ?? 0)
        row.sisaPokok = newSisa
        row.cicilanPerBulan = am.cicilanPerBulan
        return {
          actualPayment,
          sourceDeficit,
          lunasCompleted: false,
          postSisaPokok: newSisa,
          postCicilanPerBulan: am.cicilanPerBulan,
          postTenorBulan: row.tenorSisaBulan,
        }
      }
      // mode === 'tenor' — keep cicilan, recompute tenor.
      const newTenor = anuitasInverseTenor(row.cicilanPerBulan, newSisa, bunga)
      row.sisaPokok = newSisa
      const tenorBulan = newTenor === null ? row.tenorSisaBulan : Math.ceil(newTenor)
      row.tenorSisaBulan = tenorBulan
      return {
        actualPayment,
        sourceDeficit,
        lunasCompleted: false,
        postSisaPokok: newSisa,
        postCicilanPerBulan: row.cicilanPerBulan,
        postTenorBulan: tenorBulan,
      }
    }
    // Revolving / Floating: drop sisaPokok, cicilan/bln unchanged (user sets it).
    row.sisaPokok = newSisa
    return {
      actualPayment,
      sourceDeficit,
      lunasCompleted: false,
      postSisaPokok: newSisa,
      postCicilanPerBulan: row.cicilanPerBulan,
    }
  }

  if (input.source === 'utangPribadi') {
    const idx = snap.utangPribadi.findIndex((u) => u.id === input.id)
    if (idx === -1) return { actualPayment, sourceDeficit, lunasCompleted: false }
    const row = snap.utangPribadi[idx]!
    const newSisa = Math.max(0, row.sisaPokok - actualPayment)
    if (newSisa === 0) {
      snap.utangPribadi.splice(idx, 1)
      return { actualPayment, sourceDeficit, lunasCompleted: true, postSisaPokok: 0 }
    }
    row.sisaPokok = newSisa
    return {
      actualPayment,
      sourceDeficit,
      lunasCompleted: false,
      postSisaPokok: newSisa,
    }
  }

  if (input.source === 'gadai') {
    const idx = snap.gadai.findIndex((g) => g.id === input.id)
    if (idx === -1) return { actualPayment, sourceDeficit, lunasCompleted: false }
    const row = snap.gadai[idx]!
    const newPiutang = Math.max(0, row.piutangIdr - actualPayment)
    if (newPiutang === 0) {
      snap.gadai.splice(idx, 1)
      return { actualPayment, sourceDeficit, lunasCompleted: true, postSisaPokok: 0 }
    }
    row.piutangIdr = newPiutang
    return {
      actualPayment,
      sourceDeficit,
      lunasCompleted: false,
      postSisaPokok: newPiutang,
    }
  }

  return { actualPayment, sourceDeficit, lunasCompleted: false }
}

// Extra metadata surfaced via WizardResult.warnings + a special "post-pay" warning that
// UI components parse to render the per-jenisBunga shift line. Kept in warnings array
// (vs adding a custom field) so the base WizardResult shape stays stable for Day-7
// decision wizards.
export interface LunasiExtras {
  applyResult: ApplyResult
}

export function runLunasiUtang(
  input: LunasiInput,
  snap: SnapshotState,
  goals: Goal[],
  opts: {
    prices?: PricesView
    fiMultiplier: number
    assumedAnnualReturnReal: number
    today?: Date
    includes?: ModalSiapIncludes
  },
): WizardResult & { applyResult: ApplyResult } {
  const { prices } = opts
  const scenarioSnapshot = cloneSnapshot(snap)
  const applyResult = applyLunasiToScenario(scenarioSnapshot, input, prices?.fxRates)

  const delta = computeStandardDelta(snap, scenarioSnapshot, prices, opts.includes)
  const goalImpact = computeGoalImpact(goals, snap, scenarioSnapshot, opts)

  const warnings: string[] = []
  if (input.paymentIdr <= 0) {
    warnings.push(t('wizard.lunasi.warning.zeroPayment'))
  }
  if (applyResult.sourceDeficit > 0) {
    warnings.push(t('wizard.lunasi.warning.modalShortfall'))
  }

  return {
    scenarioSnapshot,
    scenarioGoals: goals,
    delta,
    goalImpact,
    warnings,
    applyResult,
  }
}
