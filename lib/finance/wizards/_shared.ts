// Shared helpers across all wizards (mau-kpr/mau-gadai/mau-cicil/custom + Day-8 capacity).
// Extracted from Day-6 mau-kpr.ts so the 7-metric delta block + goal-impact projection
// re-run don't get copy-pasted 4–7 times. Any new metric or wizard-shared formatter
// rule belongs here so the wizards stay declarative.

import { rateToIdr } from '~/lib/finance/fx'
import { goalProgress } from '~/lib/finance/goals'
import {
  calcDar,
  calcDsr,
  calcModalSiap,
  calcNetWorth,
  calcRunway,
  calcSafeHaven,
  calcSavingsRate,
} from '~/lib/finance/metrics'
import { zoneOf, type MetricKey } from '~/lib/finance/thresholds'
import { idr } from '~/lib/format/idr'
import { percent, pp } from '~/lib/format/percent'
import { t } from '~/lib/copy/strings'
import type { Goal } from '~/lib/types/goals'
import type {
  AssetRow,
  Currency,
  FxRatesMap,
  PricesView,
  SnapshotState,
} from '~/lib/types/snapshot'
import type {
  DeltaDirection,
  DeltaRow,
  DeltaSide,
  GoalDelta,
} from '~/lib/types/wizard'

// ----- clone + ID -----

// SnapshotState is plain data (no Dates / functions / Maps) → JSON round-trip is safe.
// structuredClone not used: Vitest path more predictable; saves a polyfill consideration.
export function cloneSnapshot(snap: SnapshotState): SnapshotState {
  return JSON.parse(JSON.stringify(snap)) as SnapshotState
}

export const rid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

// ----- FX-aware waterfall -----

// Drain `amountIdr` from a list of asset-row lists in order. Mutates rows in place.
// FX-aware (Codex round-12): row.amount is in source currency per snapshot schema.
// Convert to IDR for the comparison; debit in source-currency units; preserve currency.
// Stale FX rate (null) → skip row (don't silently drain-as-0). Leftover flows into a
// shortfall warning emitted by the caller.
export function waterfallDebit(
  rows: AssetRow[][],
  amountIdr: number,
  fxRates: FxRatesMap | undefined,
): number {
  let remainingIdr = amountIdr
  for (const list of rows) {
    if (remainingIdr <= 0) break
    for (const r of list) {
      if (remainingIdr <= 0) break
      const currency: Currency = r.currency ?? 'IDR'
      const rate = currency === 'IDR' ? 1 : rateToIdr(currency, fxRates)
      if (rate === null || rate <= 0) continue
      const availIdr = (r.amount || 0) * rate
      if (availIdr <= 0) continue
      const takeIdr = Math.min(availIdr, remainingIdr)
      const takeSource = takeIdr / rate
      r.amount = (r.amount || 0) - takeSource
      remainingIdr -= takeIdr
    }
  }
  return remainingIdr
}

// ----- delta helpers (private) -----

const KNOWN_METRIC_KEYS: ReadonlySet<string> = new Set([
  'dsr',
  'dar',
  'runway',
  'savingsRate',
  'safeHaven',
  'allocationDiscipline',
  'goalHealth',
  'rasioTertahan',
])

function maybeZone(metricKey: string, value: number | null) {
  if (value === null || !KNOWN_METRIC_KEYS.has(metricKey)) return undefined
  return zoneOf(metricKey as MetricKey, value)
}

function sideIdr(value: number | null, metricKey: string): DeltaSide {
  return { value, display: idr(value), zone: maybeZone(metricKey, value) }
}

function sidePercent(value: number | null, metricKey: string, digits = 1): DeltaSide {
  return { value, display: percent(value, digits), zone: maybeZone(metricKey, value) }
}

function sideMonths(value: number | null, metricKey: string): DeltaSide {
  return {
    value,
    display: value === null ? '—' : `${value.toFixed(1)} bln`,
    zone: maybeZone(metricKey, value),
  }
}

// Direction = "is this delta good for the user?" — independent from up/down. Each wizard
// passes the bias per metric (DSR↑=worse, Runway↑=better).
export function computeDirection(
  before: number | null,
  after: number | null,
  higherBetter: boolean,
): DeltaDirection {
  if (before === null || after === null) return 'neutral'
  if (after === before) return 'neutral'
  if (higherBetter) return after > before ? 'better' : 'worse'
  return after < before ? 'better' : 'worse'
}

function deltaIdr(before: number | null, after: number | null): string {
  if (before === null || after === null) return '—'
  const diff = after - before
  if (diff === 0) return '●'
  const arrow = diff > 0 ? '▲' : '▼'
  return `${arrow} ${idr(Math.abs(diff))}`
}

function deltaPp(before: number | null, after: number | null): string {
  if (before === null || after === null) return '—'
  const diff = after - before
  if (diff === 0) return '●'
  const arrow = diff > 0 ? '▲' : '▼'
  return `${arrow} ${pp(diff, 1)}`
}

function deltaMonths(before: number | null, after: number | null): string {
  if (before === null || after === null) return '—'
  const diff = after - before
  if (Math.abs(diff) < 0.05) return '●'
  const arrow = diff > 0 ? '▲' : '▼'
  return `${arrow} ${Math.abs(diff).toFixed(1)} bln`
}

// ----- standard 7-metric delta -----

// Returns the 7-metric delta block used by every decision + capacity wizard. Each
// wizard can post-process if it needs custom rows; for KPR/Gadai/Cicil/Custom the
// block is identical.
export function computeStandardDelta(
  before: SnapshotState,
  after: SnapshotState,
  prices?: PricesView,
): DeltaRow[] {
  const bNW = calcNetWorth(before, prices)
  const aNW = calcNetWorth(after, prices)
  const bMS = calcModalSiap(before, prices)
  const aMS = calcModalSiap(after, prices)
  const bDsr = calcDsr(before, prices)
  const aDsr = calcDsr(after, prices)
  const bDar = calcDar(before, prices)
  const aDar = calcDar(after, prices)
  const bRunway = calcRunway(before, prices)
  const aRunway = calcRunway(after, prices)
  const bSR = calcSavingsRate(before, prices)
  const aSR = calcSavingsRate(after, prices)
  const bSH = calcSafeHaven(before, prices)
  const aSH = calcSafeHaven(after, prices)

  return [
    {
      metricKey: 'netWorth',
      label: t('metric.label.netWorth'),
      before: sideIdr(bNW, 'netWorth'),
      after: sideIdr(aNW, 'netWorth'),
      deltaDisplay: deltaIdr(bNW, aNW),
      direction: computeDirection(bNW, aNW, true),
    },
    {
      metricKey: 'modalSiap',
      label: t('metric.label.modalSiap'),
      before: sideIdr(bMS, 'modalSiap'),
      after: sideIdr(aMS, 'modalSiap'),
      deltaDisplay: deltaIdr(bMS, aMS),
      direction: computeDirection(bMS, aMS, true),
    },
    {
      metricKey: 'dsr',
      label: t('metric.label.dsr'),
      before: sidePercent(bDsr, 'dsr'),
      after: sidePercent(aDsr, 'dsr'),
      deltaDisplay: deltaPp(bDsr, aDsr),
      direction: computeDirection(bDsr, aDsr, false),
    },
    {
      metricKey: 'dar',
      label: t('metric.label.dar'),
      before: sidePercent(bDar, 'dar'),
      after: sidePercent(aDar, 'dar'),
      deltaDisplay: deltaPp(bDar, aDar),
      direction: computeDirection(bDar, aDar, false),
    },
    {
      metricKey: 'runway',
      label: t('metric.label.runway'),
      before: sideMonths(bRunway, 'runway'),
      after: sideMonths(aRunway, 'runway'),
      deltaDisplay: deltaMonths(bRunway, aRunway),
      direction: computeDirection(bRunway, aRunway, true),
    },
    {
      metricKey: 'savingsRate',
      label: t('metric.label.savingsRate'),
      before: sidePercent(bSR, 'savingsRate'),
      after: sidePercent(aSR, 'savingsRate'),
      deltaDisplay: deltaPp(bSR, aSR),
      direction: computeDirection(bSR, aSR, true),
    },
    {
      metricKey: 'safeHaven',
      label: t('metric.label.safeHaven'),
      before: sidePercent(bSH, 'safeHaven'),
      after: sidePercent(aSH, 'safeHaven'),
      deltaDisplay: deltaPp(bSH, aSH),
      direction: computeDirection(bSH, aSH, true),
    },
  ]
}

// ----- goal impact -----

// Re-runs goalProgress per goal against the scenarioSnapshot. monthsShift=0 +
// unreachable=true when either before or after projection is Infinity (don't fake a
// number for unreachable cases — UI uses the flag to render a dedicated copy).
export function computeGoalImpact(
  goals: Goal[],
  before: SnapshotState,
  after: SnapshotState,
  opts: {
    prices?: PricesView
    fiMultiplier: number
    assumedAnnualReturnReal: number
    today?: Date
  },
): GoalDelta[] {
  const { prices, fiMultiplier, assumedAnnualReturnReal, today } = opts
  return goals.map((g) => {
    const beforeP = goalProgress(g, before, {
      fiMultiplier,
      annualReturnReal: assumedAnnualReturnReal,
      activeGoalsCount: goals.length,
      today,
      prices,
    })
    const afterP = goalProgress(g, after, {
      fiMultiplier,
      annualReturnReal: assumedAnnualReturnReal,
      activeGoalsCount: goals.length,
      today,
      prices,
    })
    const unreachable = !Number.isFinite(afterP.projection.months)
    const monthsShift =
      !Number.isFinite(beforeP.projection.months) ||
      !Number.isFinite(afterP.projection.months)
        ? 0
        : afterP.projection.months - beforeP.projection.months
    return {
      goalId: g.id,
      goalLabel: g.label,
      beforeStatus: beforeP.status,
      afterStatus: afterP.status,
      monthsShift,
      unreachable,
    }
  })
}
