// "Mau KPR?" wizard — first decision wizard, sets the pattern for the rest.
//
// Pure function. Never mutates the input snapshot. Returns a fresh scenarioSnapshot
// (clone + KPR effects applied) + computed delta vs. the original. UI layer just renders.
//
// KPR effects on scenario:
//   1) Add cicilan KPR row (Anuitas default) — pokok = harga − DP, cicilan computed via
//      lib/finance/amortization.ts so wizard math matches the canonical schedule.
//   2) Add property row to asetNonLikuid.properti — nilai = full harga rumah (locked
//      decision: better Net Worth framing than DP-only equity accounting).
//   3) Debit DP via waterfall kas → deposito → reksaDana (locked decision: most realistic
//      "tarik dari paling likuid dulu" without an extra UI input). Drain stops at 0;
//      if leftover > 0, warnings.push("DP melebihi modal likuid") — the simulation still
//      computes but the user sees the gap.
//
// Goal impact = re-run goalProgress against scenarioSnapshot per goal. Same pure fn used
// by /app/goals — no special-casing.

import { anuitas, flat } from '~/lib/finance/amortization'
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
  CicilanRow,
  Currency,
  FxRatesMap,
  JenisBunga,
  PricesView,
  SnapshotState,
} from '~/lib/types/snapshot'
import type {
  DeltaDirection,
  DeltaRow,
  DeltaSide,
  GoalDelta,
  WizardResult,
} from '~/lib/types/wizard'

export interface KprInput {
  label: string // e.g., "Rumah Bandung" — surfaced in cicilan row label + property label
  hargaRumah: number // IDR, full price
  dpPercent: number // 0..100
  tenorTahun: number // years (×12 = bulan)
  bungaPercent: number // %/tahun
  jenisBunga: Extract<JenisBunga, 'Anuitas' | 'Flat'> // KPR realistic options
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

// Deep clone via JSON round-trip. Snapshot is plain-data (no Dates, no functions); the
// Pinia reactive proxies cooperate with structuredClone equally well, but JSON keeps the
// wizard pure-function-friendly for tests where structuredClone may or may not exist.
function cloneSnapshot(snap: SnapshotState): SnapshotState {
  return JSON.parse(JSON.stringify(snap)) as SnapshotState
}

// Drain `amountIdr` from a list of asset-row lists in order. Mutates rows in place.
// FX-AWARE (Codex round-12 fix): each row's `amount` is in its own currency; convert
// to IDR for the comparison + drain in source-currency units. A USD 10k deposito row
// at 16_000 IDR/USD covers 160jt IDR — without this conversion it would be treated
// like Rp 10_000 and produce false DP shortfalls.
//
// Row skipped when FX rate is stale/null (currency rate not yet loaded). Skipping
// instead of silently draining-as-0 preserves the row balance; the leftover then
// flows into the shortfall warning so the user sees the gap.
function waterfallDebit(
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
      if (rate === null || rate <= 0) continue // stale FX → skip; don't silently zero out
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

const rid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

interface ApplyResult {
  dpShortfall: number // 0 when DP fully sourced from liquid
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

// ----- delta computation helpers -----

function computeDirection(
  before: number | null,
  after: number | null,
  higherBetter: boolean,
): DeltaDirection {
  if (before === null || after === null) return 'neutral'
  if (after === before) return 'neutral'
  if (higherBetter) return after > before ? 'better' : 'worse'
  return after < before ? 'better' : 'worse'
}

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
  return {
    value,
    display: idr(value),
    zone: maybeZone(metricKey, value),
  }
}

function sidePercent(value: number | null, metricKey: string, digits = 1): DeltaSide {
  return {
    value,
    display: percent(value, digits),
    zone: maybeZone(metricKey, value),
  }
}

function sideMonths(value: number | null, metricKey: string): DeltaSide {
  // Runway display = months with 1 decimal (mirrors HeroPair).
  return {
    value,
    display: value === null ? '—' : `${value.toFixed(1)} bln`,
    zone: maybeZone(metricKey, value),
  }
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

// ----- main entry -----

export function runMauKpr(
  input: KprInput,
  snap: SnapshotState,
  goals: Goal[],
  opts: {
    prices?: PricesView
    fiMultiplier: number
    assumedAnnualReturnReal: number
    today?: Date
  },
): WizardResult {
  const { prices, fiMultiplier, assumedAnnualReturnReal, today } = opts
  const computed = computeKpr(input)
  const scenarioSnapshot = cloneSnapshot(snap)
  const { dpShortfall } = applyKprToScenario(
    scenarioSnapshot,
    input,
    computed,
    prices?.fxRates,
  )

  // Build delta rows — call metric pure fns against both snapshots.
  const bNW = calcNetWorth(snap, prices)
  const aNW = calcNetWorth(scenarioSnapshot, prices)
  const bMS = calcModalSiap(snap, prices)
  const aMS = calcModalSiap(scenarioSnapshot, prices)
  const bDsr = calcDsr(snap, prices)
  const aDsr = calcDsr(scenarioSnapshot, prices)
  const bDar = calcDar(snap, prices)
  const aDar = calcDar(scenarioSnapshot, prices)
  const bRunway = calcRunway(snap, prices)
  const aRunway = calcRunway(scenarioSnapshot, prices)
  const bSR = calcSavingsRate(snap, prices)
  const aSR = calcSavingsRate(scenarioSnapshot, prices)
  const bSH = calcSafeHaven(snap, prices)
  const aSH = calcSafeHaven(scenarioSnapshot, prices)

  const delta: DeltaRow[] = [
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

  // Goal impact — same goalProgress used on /app/goals so the math reconciles.
  const goalImpact: GoalDelta[] = goals.map((g) => {
    const beforeP = goalProgress(g, snap, {
      fiMultiplier,
      annualReturnReal: assumedAnnualReturnReal,
      activeGoalsCount: goals.length,
      today,
      prices,
    })
    const afterP = goalProgress(g, scenarioSnapshot, {
      fiMultiplier,
      annualReturnReal: assumedAnnualReturnReal,
      activeGoalsCount: goals.length,
      today,
      prices,
    })
    const unreachable = !Number.isFinite(afterP.projection.months)
    // monthsShift undefined when either side is unreachable — surface via `unreachable`
    // flag instead of a faked number. Wizard UI renders the dedicated copy in that case.
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

  const warnings: string[] = []
  if (dpShortfall > 0) warnings.push(t('wizard.warning.dpExceedsLiquid'))

  return {
    scenarioSnapshot,
    scenarioGoals: goals,
    delta,
    goalImpact,
    warnings,
  }
}
