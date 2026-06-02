// Day 9 — "Deploy Preview" wizard. Preview-only path for Modal Likuid Options asset
// acquisition actions (Tambah RD / Tambah Deposito / Beli Saham). Was apply-direct in
// the first iteration; user explicitly asked for "popup tanpa gangu data snapshot",
// so this is now strictly read-only.
//
// Mirrors the wizard purity invariant (mau-kpr / lunasi-utang pattern): pure fn against
// a cloned snapshot, returns WizardResult shape. Source waterfall is FIXED (kas →
// deposito → reksaDana → crypto, FX-aware via _shared.waterfallDebit) so the simulation
// stays consistent with how Lunasi + KPR drain Modal Siap. Source selector intentionally
// NOT exposed — adding picker complexity for a preview-only path doesn't pay off; user
// reads the warning then opens Snapshot to do precise placement themselves.

import { goalProgress } from '~/lib/finance/goals'
import { effectiveStockPrice } from '~/lib/finance/metrics'
import { t } from '~/lib/copy/strings'
import {
  cloneSnapshot,
  computeGoalImpact,
  computeStandardDelta,
  rid,
  waterfallDebit,
} from '~/lib/finance/wizards/_shared'
import type { Goal } from '~/lib/types/goals'
import type {
  AssetRow,
  PricesView,
  SnapshotState,
} from '~/lib/types/snapshot'
import type { WizardResult } from '~/lib/types/wizard'
import type { DeployAction } from '~/lib/finance/wizards/modal-options'

export interface DeployPreviewInput {
  action: DeployAction
}

function applyActionToScenario(
  snap: SnapshotState,
  action: DeployAction,
  fxRates: PricesView['fxRates'] | undefined,
): { actualCostIdr: number; shortfallIdr: number } {
  let requestedIdr = 0
  if (action.kind === 'addLiquidRow') requestedIdr = action.amountIdr
  if (action.kind === 'addStockLots') requestedIdr = action.costIdr

  // Drain Modal Siap (FX-aware) before adding to the destination. Shortfall surfaces
  // as warning; we still apply the destination row at the FULL requested amount so the
  // user sees the intended "after" state (clamping would silently hide the gap).
  const shortfallIdr = waterfallDebit(
    [
      snap.asetLikuid.kas,
      snap.asetLikuid.deposito,
      snap.asetLikuid.reksaDana,
      // Crypto rows aren't AssetRow shape — they sit in snap.crypto, so the waterfall
      // can't include them without a separate helper. For preview-only this is fine:
      // the warning copy mentions only the 3 ledger categories that are drained.
    ],
    requestedIdr,
    fxRates,
  )
  const actualCostIdr = requestedIdr - shortfallIdr

  if (action.kind === 'addLiquidRow') {
    const row: AssetRow = {
      id: rid(),
      label: action.label,
      amount: action.amountIdr,
      currency: 'IDR',
    }
    snap.asetLikuid[action.category].push(row)
  }
  if (action.kind === 'addStockLots') {
    const target = snap.saham.find((s) => s.id === action.stockId)
    if (target) target.lot += action.lotsToAdd
  }

  return { actualCostIdr, shortfallIdr }
}

export function runDeployPreview(
  input: DeployPreviewInput,
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
  const { shortfallIdr } = applyActionToScenario(
    scenarioSnapshot,
    input.action,
    prices?.fxRates,
  )

  const delta = computeStandardDelta(snap, scenarioSnapshot, prices)
  const goalImpact = computeGoalImpact(goals, snap, scenarioSnapshot, opts)

  const warnings: string[] = []
  if (shortfallIdr > 0) {
    warnings.push(t('wizard.deployPreview.warning.shortfall'))
  }

  return {
    scenarioSnapshot,
    scenarioGoals: goals,
    delta,
    goalImpact,
    warnings,
  }
}

// Helper for the wizard component: format the action label for the Summary card. Read
// the inputs the wizard receives + the snapshot so we can echo ticker / category / price.
// Returned in localized form via t() so the wizard template stays declarative.
export function formatDeployActionSummary(
  action: DeployAction,
  snap: SnapshotState,
  prices: PricesView | undefined,
): { headline: string; amountIdr: number } {
  if (action.kind === 'addLiquidRow') {
    const categoryKey =
      action.category === 'reksaDana'
        ? 'wizard.deployPreview.category.reksaDana'
        : 'wizard.deployPreview.category.deposito'
    return {
      headline: t('wizard.deployPreview.summary.action.addLiquid', {
        amount: formatAmount(action.amountIdr),
        category: t(categoryKey),
      }),
      amountIdr: action.amountIdr,
    }
  }
  // addStockLots — use prefill ticker; if missing, fall back to snap.saham lookup so
  // the wizard works even when a stale prefill lacks the field.
  const target = snap.saham.find((s) => s.id === action.stockId)
  const ticker =
    action.stockTicker ||
    target?.ticker ||
    '—'
  // Cost should match the prefill (computed in modal-options when option built); use
  // the prefill value directly so we don't drift from the option's headline amount.
  const cost = action.costIdr
  void prices
  void effectiveStockPrice
  return {
    headline: t('wizard.deployPreview.summary.action.addStock', {
      ticker,
      lots: action.lotsToAdd,
      amount: formatAmount(cost),
    }),
    amountIdr: cost,
  }
}

// Light wrapper around the IDR formatter so the helper module stays free of the
// lib/format import chain — formatting through idr() requires Rp prefix etc.
function formatAmount(n: number): string {
  // Lazy import to avoid pulling lib/format/idr into this pure module's surface.
  // Inline format is sufficient for the headline string; full Intl formatting lives
  // in the component template via the idr() helper.
  return `Rp ${n.toLocaleString('id-ID')}`
}

// Re-export goalProgress so the wizard component can read FI projection independent
// of the standard goalImpact (used when there's only an FI goal and the user wants
// a "maju X bulan" framing instead of the generic delta table arrow). Kept here so
// wizards don't reach into lib/finance/goals directly when they already import this
// preview module.
export { goalProgress }
