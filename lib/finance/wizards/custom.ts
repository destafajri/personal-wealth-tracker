// "Custom" wizard — free-form delta. Locked-minimal scope (per Day 7 decision):
//   - Required: 1 cicilan row (label/tipe/sisaPokok/cicilanPerBulan/jenisBunga + optional
//     sukuBunga + tenor).
//   - Optional: 1 asset row (any liquid or non-liquid category; liquid supports currency).
//
// No DP / waterfall here — user states the cicilan + asset directly. Use case: "gimana
// kalau pinjam ke teman 50jt cicil 1jt/bln dan pakai sebagian buat tambahin RD?".
// For more complex flows (multi-row, change penghasilan, etc), user should use
// dedicated wizards or edit the snapshot directly.

import {
  cloneSnapshot,
  computeGoalImpact,
  computeStandardDelta,
  rid,
} from '~/lib/finance/wizards/_shared'
import type { Goal } from '~/lib/types/goals'
import type {
  AssetRow,
  CicilanRow,
  CicilanTipe,
  Currency,
  JenisBunga,
  LiquidAssetCategory,
  NonLiquidAssetCategory,
  PricesView,
  SnapshotState,
} from '~/lib/types/snapshot'
import type { WizardResult } from '~/lib/types/wizard'
import type { ModalSiapIncludes } from '~/lib/finance/metrics'

export type AnyAssetCategory = LiquidAssetCategory | NonLiquidAssetCategory

export interface CustomInput {
  // Cicilan (required)
  cicilanLabel: string
  cicilanTipe: CicilanTipe
  cicilanSisaPokok: number
  cicilanPerBulan: number
  cicilanJenisBunga: JenisBunga
  cicilanSukuBunga?: number
  cicilanTenorBulan?: number
  // Aset (optional). Both `asetKategori` + `asetAmount` must be set to apply.
  asetLabel?: string
  asetKategori?: AnyAssetCategory
  asetAmount?: number
  asetCurrency?: Currency // ignored for non-liquid kategori (IDR-only)
}

function isLiquid(cat: AnyAssetCategory): cat is LiquidAssetCategory {
  return cat === 'kas' || cat === 'deposito' || cat === 'reksaDana' || cat === 'sbn'
}

function applyCustomToScenario(snap: SnapshotState, input: CustomInput): void {
  snap.cicilanAktif.push({
    id: rid(),
    tipe: input.cicilanTipe,
    label: input.cicilanLabel.trim() || 'Custom cicilan',
    sisaPokok: Math.max(0, input.cicilanSisaPokok),
    cicilanPerBulan: Math.max(0, input.cicilanPerBulan),
    sukuBunga: input.cicilanSukuBunga,
    tenorSisaBulan: input.cicilanTenorBulan,
    jenisBunga: input.cicilanJenisBunga,
  } satisfies CicilanRow)

  if (
    input.asetKategori !== undefined &&
    input.asetAmount !== undefined &&
    input.asetAmount > 0
  ) {
    const baseLabel = input.asetLabel?.trim() || 'Custom aset'
    if (isLiquid(input.asetKategori)) {
      const row: AssetRow = {
        id: rid(),
        label: baseLabel,
        amount: input.asetAmount,
        currency: input.asetCurrency,
      }
      snap.asetLikuid[input.asetKategori].push(row)
    } else {
      // Non-likuid stays IDR-only by snapshot schema — drop currency silently.
      snap.asetNonLikuid[input.asetKategori].push({
        id: rid(),
        label: baseLabel,
        amount: input.asetAmount,
      })
    }
  }
}

export function runCustom(
  input: CustomInput,
  snap: SnapshotState,
  goals: Goal[],
  opts: {
    prices?: PricesView
    fiMultiplier: number
    assumedAnnualReturnReal: number
    today?: Date
    includes?: ModalSiapIncludes
  },
): WizardResult {
  const { prices } = opts
  const scenarioSnapshot = cloneSnapshot(snap)
  applyCustomToScenario(scenarioSnapshot, input)

  const delta = computeStandardDelta(snap, scenarioSnapshot, prices, opts.includes)
  const goalImpact = computeGoalImpact(goals, snap, scenarioSnapshot, opts)

  return {
    scenarioSnapshot,
    scenarioGoals: goals,
    delta,
    goalImpact,
    warnings: [],
  }
}
