// "Mau Gadai?" wizard. Pawn an asset (emas / properti / kendaraan) → get cash piutang.
//
// Effects on scenario:
//   1) Add gadai row (jaminan kind + gramTertahan or asetRefId + piutangIdr + bunga + tempo).
//   2) Add a new kas row for `piutangIdr` (locked decision: cash lands in kas; user can
//      reassign post-scenario if needed). Match real-world "Pegadaian transfers cash to
//      your rekening".
//   3) Emas grams NOT decremented — gadai.gramTertahan tracks the pawned subset; the
//      user still OWNS those grams (this is how the snapshot already models gadai).
//
// Cicilan effect on DSR/Runway: GadaiRow has no `cicilanPerBulan` field, so DSR is
// untouched by this wizard. DAR/NetWorth use the piutangIdr directly via calcTotalUtang.
// Bunga accrues monthly off-snapshot — surfaced only as the warning summary; user
// pays it when tebus / lunas.

import { availableGramOf, emasCategoryOfJaminan } from '~/lib/finance/emas'
import {
  cloneSnapshot,
  computeGoalImpact,
  computeStandardDelta,
  rid,
} from '~/lib/finance/wizards/_shared'
import { t } from '~/lib/copy/strings'
import type { Goal } from '~/lib/types/goals'
import type {
  GadaiJaminanKind,
  GadaiRow,
  PricesView,
  SnapshotState,
} from '~/lib/types/snapshot'
import type { WizardResult } from '~/lib/types/wizard'

export interface GadaiInput {
  label: string
  jaminan: GadaiJaminanKind
  gramTertahan?: number // for emas:* jaminans (required when jaminan starts with 'emas:')
  asetRefId?: string // for properti / kendaraan (links to existing non-likuid row)
  piutangIdr: number // cash received — locked: direct user input (no LTV calculator)
  bungaPerBulanPercent: number // Pegadaian default 1.5
  tempoBulan: number // Pegadaian default 4
}

export interface GadaiComputed {
  totalBungaSepanjangTempo: number // piutang × bunga%/bln × tempoBulan (flat-style)
  // Note: Pegadaian charges bunga proportional + admin; this is a simplified preview.
}

export function computeGadai(input: GadaiInput): GadaiComputed {
  const totalBunga =
    input.piutangIdr *
    (input.bungaPerBulanPercent / 100) *
    Math.max(0, Math.round(input.tempoBulan))
  return { totalBungaSepanjangTempo: Math.max(0, totalBunga) }
}

function applyGadaiToScenario(snap: SnapshotState, input: GadaiInput): void {
  const labelBase = input.label.trim() || 'Gadai scenario'
  const isEmas = input.jaminan.startsWith('emas:')
  const row: GadaiRow = {
    id: rid(),
    label: labelBase,
    jaminan: input.jaminan,
    gramTertahan: isEmas ? Math.max(0, input.gramTertahan ?? 0) : undefined,
    asetRefId: !isEmas ? input.asetRefId : undefined,
    piutangIdr: Math.max(0, input.piutangIdr),
    bungaPerBulanPercent: Math.max(0, input.bungaPerBulanPercent),
    tempoBulan: Math.max(0, Math.round(input.tempoBulan)),
  }
  snap.gadai.push(row)
  // Cash piutang lands in kas (locked decision). New row labelled so user sees source.
  if (row.piutangIdr > 0) {
    snap.asetLikuid.kas.push({
      id: rid(),
      label: `Piutang gadai — ${labelBase}`,
      amount: row.piutangIdr,
    })
  }
}

export function runMauGadai(
  input: GadaiInput,
  snap: SnapshotState,
  goals: Goal[],
  opts: {
    prices?: PricesView
    fiMultiplier: number
    assumedAnnualReturnReal: number
    today?: Date
  },
): WizardResult {
  const { prices } = opts
  const scenarioSnapshot = cloneSnapshot(snap)
  applyGadaiToScenario(scenarioSnapshot, input)

  const delta = computeStandardDelta(snap, scenarioSnapshot, prices)
  const goalImpact = computeGoalImpact(goals, snap, scenarioSnapshot, opts)

  const warnings: string[] = []
  if (input.piutangIdr <= 0) warnings.push(t('wizard.gadai.warning.zeroPiutang'))
  if (input.jaminan.startsWith('emas:') && (input.gramTertahan ?? 0) <= 0) {
    warnings.push(t('wizard.gadai.warning.zeroGram'))
  }
  // Codex round-13: gram ownership invariant. snap.emas.{cat}Gram = TOTAL ownership
  // (at home + already pawned); user can only pawn what's still available at home.
  // Pure fn emits warning (defensive); form layer blocks submit upstream so the
  // warning normally never reaches the user in happy-path flow.
  if (input.jaminan.startsWith('emas:')) {
    const cat = emasCategoryOfJaminan(input.jaminan)
    if (cat !== null) {
      const available = availableGramOf(snap, cat)
      const requested = input.gramTertahan ?? 0
      if (requested > available + 1e-6) {
        warnings.push(
          t('wizard.gadai.warning.gramExceedsOwned', {
            requested: requested.toString(),
            available: available.toFixed(2),
          }),
        )
      }
    }
  }

  return {
    scenarioSnapshot,
    scenarioGoals: goals,
    delta,
    goalImpact,
    warnings,
  }
}
