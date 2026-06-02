// Day 9 (iteration 3) — "Deploy Preview" wizard. Preview-only path for Modal Likuid
// Options asset acquisition (Tambah RD / Deposito / SBN / Emas / Beli Saham). User
// flow: click [Hitung] → wizard opens with prefilled action → simulation rendered →
// close (no mutation to real snapshot).
//
// Key invariant (user feedback): distribusi is ZERO-SUM. Net Worth before ≡ after. The
// scenario snapshot drains source classes equal to the destination amount; if the full
// amount can't be sourced, scenario applies the partial sourced amount only and emits
// a shortfall warning. Destination NEVER added without an equal source deduction.
//
// Drain priority (locked): liquid first (kas → deposito → reksaDana → crypto), then
// toggled-in classes in fixed order (SBN → emas → other-saham). Liquid first reflects
// realisasi-cost mental model: lowest-spread sources spend first. Toggle-in lets the
// user signal "I'd liquidate these too if needed" — no extra drain happens unless the
// toggle is ON. Destination class is EXCLUDED from drain (no buying X by selling X).
//
// Emas drain order within: digital → fisikAntam → perhiasan18K → 14K → 10K (lowest
// spread first). Saham drain: proportional across other emitens by current IDR value.

import { ratePerGram, EMAS_CATEGORIES } from '~/lib/finance/emas'
import { rateToIdr } from '~/lib/finance/fx'
import { goalProgress } from '~/lib/finance/goals'
import {
  calcModalSiap,
  effectiveStockPrice,
  sumEmasIdr,
  sumSbnIdr,
  sumStockIdr,
} from '~/lib/finance/metrics'
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
  Currency,
  FxRatesMap,
  PricesView,
  SnapshotState,
} from '~/lib/types/snapshot'
import type { WizardResult } from '~/lib/types/wizard'
import type { ModalSiapIncludes } from '~/lib/finance/metrics'

// DeployAction lives here (not in modal-options.ts) to break a circular dep — modal-options
// imports deployablePool from this file, so the shared type has to live downstream.
// Asset-acquisition options each pre-shape one of these arms; the wizard component reads
// it from useSimulator's prefill payload + runs the simulation.
export type DeployAction =
  | {
      kind: 'addLiquidRow'
      category: 'reksaDana' | 'deposito' | 'sbn'
      label: string
      amountIdr: number
    }
  | {
      kind: 'addStockLots'
      stockId: string
      stockTicker: string
      lotsToAdd: number
      costIdr: number
    }
  | {
      kind: 'addEmasGram'
      // Defaults to 'digital' sub-category (lowest spread). Component template
      // surfaces "Tambah emas digital" framing.
      amountIdr: number
    }

export interface DeployPreviewInput {
  action: DeployAction
  includes: ModalSiapIncludes
}

// ----- per-source drain helpers -----
//
// Each helper mutates `snap` and returns the new remaining IDR after draining as much
// as the source could yield. Caller chains them in priority order; final remaining =
// shortfall surfaced as warning + scenario applies only the actualSourced amount.

// Drain crypto holdings until remaining = 0. Different shape from AssetRow so it needs
// its own loop. For 'unit' mode: reduce units (IDR = units × rate.idr). For idr/usd/krw:
// reduce amount converting via FX. Skip rows whose rate is missing.
function drainCrypto(
  snap: SnapshotState,
  remainingIdr: number,
  prices: PricesView | undefined,
): number {
  if (remainingIdr <= 0) return 0
  for (const c of snap.crypto) {
    if (remainingIdr <= 0) break
    if (c.mode === 'unit') {
      const rate = prices?.cryptoByCoinId[c.coinId]?.idr ?? null
      if (rate === null || rate <= 0) continue
      const availIdr = (c.units || 0) * rate
      if (availIdr <= 0) continue
      const takeIdr = Math.min(availIdr, remainingIdr)
      c.units = (c.units || 0) - takeIdr / rate
      remainingIdr -= takeIdr
    } else if (c.mode === 'idr') {
      const avail = c.amount || 0
      if (avail <= 0) continue
      const take = Math.min(avail, remainingIdr)
      c.amount = avail - take
      remainingIdr -= take
    } else {
      // 'usd' or 'krw' — amount is in that currency
      const cur: Currency = c.mode === 'usd' ? 'USD' : 'KRW'
      const fx = rateToIdr(cur, prices?.fxRates)
      if (fx === null || fx <= 0) continue
      const availIdr = (c.amount || 0) * fx
      if (availIdr <= 0) continue
      const takeIdr = Math.min(availIdr, remainingIdr)
      c.amount = (c.amount || 0) - takeIdr / fx
      remainingIdr -= takeIdr
    }
  }
  return remainingIdr
}

// Drain emas grams across categories in lowest-spread-first order. Each gram in a
// category equals ratePerGram(cat, prices) IDR. Mutates snap.emas in place.
function drainEmas(
  snap: SnapshotState,
  remainingIdr: number,
  prices: PricesView | undefined,
): number {
  if (remainingIdr <= 0) return 0
  for (const cat of EMAS_CATEGORIES) {
    if (remainingIdr <= 0) break
    const rate = ratePerGram(cat, prices)
    if (rate <= 0) continue
    const field =
      cat === 'digital'
        ? 'digitalGram'
        : cat === 'fisikAntam'
          ? 'fisikAntamGram'
          : cat === 'perhiasan18K'
            ? 'perhiasan18KGram'
            : cat === 'perhiasan14K'
              ? 'perhiasan14KGram'
              : 'perhiasan10KGram'
    const grams = snap.emas[field] || 0
    if (grams <= 0) continue
    const availIdr = grams * rate
    if (availIdr <= 0) continue
    const takeIdr = Math.min(availIdr, remainingIdr)
    snap.emas[field] = grams - takeIdr / rate
    remainingIdr -= takeIdr
  }
  return remainingIdr
}

// Drain other-emiten saham (lots reduce proportionally). Excludes the destination
// emiten so beli-BBRI doesn't drain BBRI itself. Lots are kept as floats here — the
// scenario snapshot is read-only by metric helpers + Net Worth uses lot × price so
// fractional lots are fine for preview math (real-world would round but this is illustrative).
function drainOtherSaham(
  snap: SnapshotState,
  remainingIdr: number,
  prices: PricesView | undefined,
  excludeStockId: string | null,
): number {
  if (remainingIdr <= 0) return 0
  for (const s of snap.saham) {
    if (remainingIdr <= 0) break
    if (excludeStockId !== null && s.id === excludeStockId) continue
    const price = effectiveStockPrice(s, prices?.idxByTicker[s.ticker] ?? null)
    if (price <= 0) continue
    const availIdr = s.lot * 100 * price
    if (availIdr <= 0) continue
    const takeIdr = Math.min(availIdr, remainingIdr)
    s.lot = s.lot - takeIdr / (100 * price)
    remainingIdr -= takeIdr
  }
  return remainingIdr
}

// ----- destination application -----

// Apply destination addition. Returns the IDR amount actually placed at the destination
// (clamped to whatever was sourced, so Net Worth invariance holds when sourced < requested).
function applyDestination(
  snap: SnapshotState,
  action: DeployAction,
  actualIdr: number,
  prices: PricesView | undefined,
): void {
  if (actualIdr <= 0) return
  if (action.kind === 'addLiquidRow') {
    const row: AssetRow = {
      id: rid(),
      label: action.label,
      amount: actualIdr,
      currency: 'IDR',
    }
    snap.asetLikuid[action.category].push(row)
    return
  }
  if (action.kind === 'addStockLots') {
    const target = snap.saham.find((s) => s.id === action.stockId)
    if (!target) return
    const price = effectiveStockPrice(target, prices?.idxByTicker[target.ticker] ?? null)
    if (price <= 0) return
    // Convert IDR back to lots (fractional ok in preview math).
    const lotsAdded = actualIdr / (100 * price)
    target.lot += lotsAdded
    return
  }
  if (action.kind === 'addEmasGram') {
    const rate = ratePerGram('digital', prices)
    if (rate <= 0) return
    const gramsAdded = actualIdr / rate
    snap.emas.digitalGram += gramsAdded
    return
  }
}

// ----- destination's drain-exclusion category -----

// Which source class is the destination's own bucket — that bucket is EXCLUDED from
// the drain pool to avoid buying-X-by-selling-X. Returns null when destination doesn't
// overlap any drainable class (impossible at the moment, but kept for future arms).
type DrainExcludeKey =
  | { kind: 'liquidCategory'; category: 'kas' | 'deposito' | 'reksaDana' | 'sbn' }
  | { kind: 'emas' }
  | { kind: 'saham'; stockId: string }

function destinationExclusion(action: DeployAction): DrainExcludeKey {
  if (action.kind === 'addLiquidRow') {
    return { kind: 'liquidCategory', category: action.category }
  }
  if (action.kind === 'addStockLots') {
    return { kind: 'saham', stockId: action.stockId }
  }
  // addEmasGram
  return { kind: 'emas' }
}

// ----- core drain pipeline -----

function drainAll(
  snap: SnapshotState,
  requestedIdr: number,
  exclude: DrainExcludeKey,
  includes: ModalSiapIncludes,
  prices: PricesView | undefined,
): { actualIdr: number; shortfallIdr: number } {
  let remaining = requestedIdr
  const fxRates: FxRatesMap | undefined = prices?.fxRates

  // 1) Liquid waterfall (kas → deposito → reksaDana). Skip the destination category if
  // it's one of these — buying RD by selling RD = no-op intent + would double-count.
  const liquidLists: AssetRow[][] = []
  const liquidCats: Array<'kas' | 'deposito' | 'reksaDana'> = ['kas', 'deposito', 'reksaDana']
  for (const cat of liquidCats) {
    if (exclude.kind === 'liquidCategory' && exclude.category === cat) continue
    liquidLists.push(snap.asetLikuid[cat])
  }
  remaining = waterfallDebit(liquidLists, remaining, fxRates)

  // 2) Crypto (always part of baseline Modal Siap).
  remaining = drainCrypto(snap, remaining, prices)

  // 3) SBN — only when toggled in AND not the destination.
  if (includes.sbn && !(exclude.kind === 'liquidCategory' && exclude.category === 'sbn')) {
    remaining = waterfallDebit([snap.asetLikuid.sbn], remaining, fxRates)
  }

  // 4) Emas — only when toggled in AND not the destination class.
  if (includes.emas && exclude.kind !== 'emas') {
    remaining = drainEmas(snap, remaining, prices)
  }

  // 5) Saham — only when toggled in AND not the destination (excluding the specific
  // destination emiten so beli-BBRI doesn't drain BBRI).
  if (includes.saham) {
    const excludeStockId = exclude.kind === 'saham' ? exclude.stockId : null
    remaining = drainOtherSaham(snap, remaining, prices, excludeStockId)
  }

  return {
    actualIdr: Math.max(0, requestedIdr - remaining),
    shortfallIdr: Math.max(0, remaining),
  }
}

// ----- destination's requested IDR (sized by caller) -----

// The action carries the requested IDR amount embedded in its fields. We re-extract
// here so the wizard runs an integrity check (caller's option generator may have used
// a stale Modal Siap before the user toggled chips off).
function requestedIdrFromAction(action: DeployAction): number {
  if (action.kind === 'addLiquidRow') return Math.max(0, action.amountIdr)
  if (action.kind === 'addStockLots') return Math.max(0, action.costIdr)
  if (action.kind === 'addEmasGram') return Math.max(0, action.amountIdr)
  return 0
}

// ----- entry point -----

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
  const requested = requestedIdrFromAction(input.action)
  const exclude = destinationExclusion(input.action)

  // Re-cap the requested amount against the current deployable pool (recomputed against
  // post-toggle state). If user toggled chips OFF since the option was emitted, the
  // option's amount may exceed actual deployable — clamp here so we never overshoot.
  const deployable = deployablePool(scenarioSnapshot, prices, input.includes, exclude)
  const targetIdr = Math.min(requested, deployable)

  // Drain sources (mutates scenarioSnapshot).
  const { actualIdr, shortfallIdr } = drainAll(
    scenarioSnapshot,
    targetIdr,
    exclude,
    input.includes,
    prices,
  )

  // Add destination (clamped to what was actually sourced — preserves Net Worth invariance).
  applyDestination(scenarioSnapshot, input.action, actualIdr, prices)

  const delta = computeStandardDelta(snap, scenarioSnapshot, prices)
  const goalImpact = computeGoalImpact(goals, snap, scenarioSnapshot, opts)

  const warnings: string[] = []
  if (shortfallIdr > 0 || requested > deployable) {
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

// ----- deployable pool (public) -----
//
// Computes max IDR that can flow into the given destination from all OTHER sources.
// = Modal Siap (with includes) − destination's own current value (so we don't pretend
// to buy X by selling X). Modal Options option generators call this to size each
// option correctly.

export function deployablePool(
  snap: SnapshotState,
  prices: PricesView | undefined,
  includes: ModalSiapIncludes,
  exclude: DrainExcludeKey,
): number {
  const headline = calcModalSiap(snap, prices, includes)
  let overlap = 0
  if (exclude.kind === 'liquidCategory') {
    if (exclude.category === 'sbn') {
      // SBN only contributes to Modal Siap if toggled. Subtract only when so.
      overlap = includes.sbn ? sumSbnIdr(snap, prices) : 0
    } else {
      // kas / deposito / reksaDana — always part of baseline Modal Siap.
      overlap = sumAssetCategoryIdr(snap, exclude.category, prices)
    }
  } else if (exclude.kind === 'emas') {
    overlap = includes.emas ? sumEmasIdr(snap, prices) : 0
  } else if (exclude.kind === 'saham') {
    if (includes.saham) {
      const target = snap.saham.find((s) => s.id === exclude.stockId)
      if (target) {
        const price = effectiveStockPrice(
          target,
          prices?.idxByTicker[target.ticker] ?? null,
        )
        overlap = target.lot * 100 * price
      }
    }
    // If saham not toggled, no overlap to subtract — but also no other saham drainable.
    // sahamOption emitter is responsible for not over-sizing in that case.
  }
  return Math.max(0, headline - overlap)
}

// Single-category sum helper. Lives here (not metrics.ts) because deployablePool is
// the only consumer; keeping it module-local avoids re-exporting from metrics.
function sumAssetCategoryIdr(
  snap: SnapshotState,
  category: 'kas' | 'deposito' | 'reksaDana',
  prices: PricesView | undefined,
): number {
  const rows = snap.asetLikuid[category]
  const fxRates = prices?.fxRates
  return rows.reduce((sum, r) => {
    const cur: Currency = r.currency ?? 'IDR'
    const rate = cur === 'IDR' ? 1 : rateToIdr(cur, fxRates)
    if (rate === null) return sum
    return sum + (r.amount || 0) * rate
  }, 0)
}

// ----- summary helper for component template -----

export function formatDeployActionSummary(
  action: DeployAction,
  snap: SnapshotState,
  prices: PricesView | undefined,
): { headline: string; amountIdr: number } {
  if (action.kind === 'addLiquidRow') {
    const categoryKey =
      action.category === 'reksaDana'
        ? 'wizard.deployPreview.category.reksaDana'
        : action.category === 'deposito'
          ? 'wizard.deployPreview.category.deposito'
          : 'wizard.deployPreview.category.sbn'
    return {
      headline: t('wizard.deployPreview.summary.action.addLiquid', {
        amount: formatAmount(action.amountIdr),
        category: t(categoryKey),
      }),
      amountIdr: action.amountIdr,
    }
  }
  if (action.kind === 'addStockLots') {
    const target = snap.saham.find((s) => s.id === action.stockId)
    const ticker = action.stockTicker || target?.ticker || '—'
    return {
      headline: t('wizard.deployPreview.summary.action.addStock', {
        ticker,
        lots: action.lotsToAdd,
        amount: formatAmount(action.costIdr),
      }),
      amountIdr: action.costIdr,
    }
  }
  // addEmasGram
  const digitalRate = ratePerGram('digital', prices)
  const grams = digitalRate > 0 ? (action.amountIdr / digitalRate).toFixed(2) : '0.00'
  return {
    headline: t('wizard.deployPreview.summary.action.addEmas', {
      grams,
      amount: formatAmount(action.amountIdr),
    }),
    amountIdr: action.amountIdr,
  }
}

function formatAmount(n: number): string {
  return `Rp ${n.toLocaleString('id-ID')}`
}

// Reference sumStockIdr so it's exported chain stays warm for callers that import
// this module. (Useful for callers that need full saham sum without re-importing
// metrics.ts directly.)
void sumStockIdr

export { goalProgress }
