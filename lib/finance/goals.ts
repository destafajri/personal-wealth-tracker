import { breakdownGoldIdr } from '~/lib/finance/emas'
import { rowToIdr } from '~/lib/finance/fx'
import {
  calcTotalPengeluaran,
  effectiveStockPrice,
  sumCryptoIdr,
  totalPenghasilanMonthly,
} from '~/lib/finance/metrics'
import type {
  Goal,
  GoalBucketCategory,
  GoalStatus,
} from '~/lib/types/goals'
import type {
  AssetRow,
  PricesView,
  SnapshotState,
} from '~/lib/types/snapshot'

// ----- FI number -----

// FI Number = monthlyExpense × multiplier. multiplier=300 default per D0.2 (4% rule,
// Trinity baseline = 25× annual = 300× monthly). Negative input clamped to 0 — never
// surface a negative target.
export function fiNumber(monthlyExpense: number, multiplier = 300): number {
  return Math.max(0, monthlyExpense * multiplier)
}

// ----- cashflow helpers -----

// Surplus = totalPenghasilan − totalPengeluaran (IDR/bulan). Rides on the same metric
// definitions used by DSR/Runway/SavingsRate — drift here would silently make goal
// projections disagree with the dashboard.
export function surplus(snap: SnapshotState, prices?: PricesView): number {
  return totalPenghasilanMonthly(snap, prices) - calcTotalPengeluaran(snap, prices)
}

// Default per-goal monthly contribution: surplus ÷ active goal count. Negative surplus
// or zero goals → 0. The projection layer treats inflow=0 as unreachable when current
// < target, which is the correct UX signal ("Belum tercapai dengan alokasi sekarang").
export function defaultAllocation(
  snap: SnapshotState,
  activeGoalCount: number,
  prices?: PricesView,
): number {
  const s = surplus(snap, prices)
  if (s <= 0 || activeGoalCount <= 0) return 0
  return s / activeGoalCount
}

// ----- bucket valuation -----

// Sum the IDR value of assets in the tagged categories. Uses the same valuation
// helpers as Total Aset / Net Worth (FX-aware liquid, effectiveStockPrice for saham,
// totalGoldIdr for emas, sumCryptoIdr for crypto), so a goal's progress reconciles
// with the hero numbers on the dashboard.
export function bucketValueIdr(
  buckets: readonly GoalBucketCategory[],
  snap: SnapshotState,
  prices?: PricesView,
): number {
  if (buckets.length === 0) return 0
  let total = 0
  const set = new Set(buckets)
  if (set.has('kas')) total += sumAssetRows(snap.asetLikuid.kas, prices)
  if (set.has('deposito')) total += sumAssetRows(snap.asetLikuid.deposito, prices)
  if (set.has('reksaDana')) total += sumAssetRows(snap.asetLikuid.reksaDana, prices)
  if (set.has('sbn')) total += sumAssetRows(snap.asetLikuid.sbn, prices)
  if (set.has('properti')) total += sumAssetRows(snap.asetNonLikuid.properti, prices)
  if (set.has('kendaraan')) total += sumAssetRows(snap.asetNonLikuid.kendaraan, prices)
  if (set.has('pensiun')) total += sumAssetRows(snap.asetNonLikuid.pensiun, prices)
  if (set.has('saham')) {
    total += snap.saham.reduce(
      (s, h) =>
        s + h.lot * 100 * effectiveStockPrice(h, prices?.idxByTicker[h.ticker] ?? null),
      0,
    )
  }
  if (set.has('crypto')) total += sumCryptoIdr(snap.crypto, prices)
  if (set.has('emas')) {
    // Total gold IDR = sum of all 5 categories (at-home + pawned grams). User still
    // owns the pawned grams — the loan is separately accounted under utang.
    total += breakdownGoldIdr(snap, prices).total
  }
  return total
}

function sumAssetRows(rows: AssetRow[], prices?: PricesView): number {
  return rows.reduce((s, r) => s + rowToIdr(r, prices?.fxRates), 0)
}

// ----- resolved target -----

// FI target = calcTotalPengeluaran(snap) × multiplier. Non-FI = persisted goal.targetIdr.
// fiMultiplier is a parameter (not imported) to keep this pure — the store owns the
// runtime constant. Negative outputs clamped to 0.
export function resolveTargetIdr(
  goal: Goal,
  snap: SnapshotState,
  fiMultiplier: number,
  prices?: PricesView,
): number {
  if (goal.kind === 'FI') {
    return fiNumber(calcTotalPengeluaran(snap, prices), fiMultiplier)
  }
  return Math.max(0, goal.targetIdr)
}

// ----- projection -----

// Future-value compound projection. Solves months t such that FV(t) = target where
//   FV(t) = current·(1+r)^t + inflow·((1+r)^t − 1)/r,   r = (1+annualReturnReal)^(1/12) − 1
// `months` rounded up to whole months; `date` = today + months (ISO YYYY-MM-DD), or
// `null` when unreachable (negative inflow + no growth, etc).
export interface ProjectionResult {
  months: number
  date: string | null
}

export function projectCompletion(args: {
  current: number
  monthlyInflow: number
  target: number
  annualReturnReal?: number
  today?: Date
}): ProjectionResult {
  const { current, monthlyInflow, target } = args
  const annualReturnReal = args.annualReturnReal ?? 0.05
  const today = args.today ?? new Date()
  // target ≤ 0 = invalid/missing target (e.g., FI goal but user hasn't filled pengeluaran).
  // Treat as unreachable — surfaces 'off' status + null projection date downstream. UI
  // layer overrides the generic copy for the FI-specific case.
  if (target <= 0) return { months: Infinity, date: null }
  if (current >= target) return { months: 0, date: toIsoDate(today) }
  const r = Math.pow(1 + annualReturnReal, 1 / 12) - 1
  let months: number
  if (Math.abs(r) < 1e-9) {
    // Real return ≈ 0 → linear accrual.
    if (monthlyInflow <= 0) return { months: Infinity, date: null }
    months = (target - current) / monthlyInflow
  } else {
    // (1+r)^t = (target + inflow/r) / (current + inflow/r)
    const denom = current + monthlyInflow / r
    const numer = target + monthlyInflow / r
    if (denom <= 0 || numer <= 0) return { months: Infinity, date: null }
    const ratio = numer / denom
    if (ratio <= 1) return { months: 0, date: toIsoDate(today) }
    months = Math.log(ratio) / Math.log(1 + r)
  }
  if (!Number.isFinite(months) || months < 0) {
    return { months: Infinity, date: null }
  }
  const ceil = Math.ceil(months)
  return { months: ceil, date: addMonthsIso(today, ceil) }
}

// ----- goal status -----

// 24-month at-risk band: long enough to not flag minor slippage, short enough to surface
// real trouble. PRD §5.8.2 doesn't lock specific numbers; tune if usage data shows the
// band is too narrow/wide.
const AT_RISK_BAND_MONTHS = 24

export function goalStatus(
  projectedDate: string | null,
  targetDate: string,
): GoalStatus {
  if (projectedDate === null || targetDate === '') return 'off'
  const proj = parseIsoDate(projectedDate)
  const tgt = parseIsoDate(targetDate)
  if (proj === null || tgt === null) return 'off'
  const diffMonths = monthDiff(tgt, proj)
  if (diffMonths <= 0) return 'on'
  if (diffMonths <= AT_RISK_BAND_MONTHS) return 'at-risk'
  return 'off'
}

// ----- composite progress -----

export interface GoalProgress {
  currentIdr: number
  targetIdr: number
  percent: number // 0..(capped at 99999 for runaway display)
  monthlyInflow: number
  projection: ProjectionResult
  status: GoalStatus
}

export function goalProgress(
  goal: Goal,
  snap: SnapshotState,
  opts: {
    fiMultiplier: number
    annualReturnReal: number
    activeGoalsCount: number
    today?: Date
    prices?: PricesView
  },
): GoalProgress {
  const { fiMultiplier, annualReturnReal, activeGoalsCount, today, prices } = opts
  const targetIdr = resolveTargetIdr(goal, snap, fiMultiplier, prices)
  const currentIdr = bucketValueIdr(goal.buckets, snap, prices)
  const monthlyInflow =
    goal.monthlyAllocationIdr ?? defaultAllocation(snap, activeGoalsCount, prices)
  const projection = projectCompletion({
    current: currentIdr,
    monthlyInflow,
    target: targetIdr,
    annualReturnReal,
    today,
  })
  const percent =
    targetIdr <= 0 ? 0 : Math.min(99999, (currentIdr / targetIdr) * 100)
  const status = goalStatus(projection.date, goal.targetDate)
  return { currentIdr, targetIdr, percent, monthlyInflow, projection, status }
}

// ----- Goal Health metric -----

// Share of active goals whose status === 'on' (percent). null when no goals (D0.5
// per-metric empty rule — UI surfaces "Belum ada goal" hint). Uses the same projection
// math as the cards so the chip can't disagree with the card statuses.
export function calcGoalHealth(
  goals: Goal[],
  snap: SnapshotState,
  opts: { fiMultiplier: number; annualReturnReal: number; prices?: PricesView },
): number | null {
  if (goals.length === 0) return null
  let on = 0
  for (const g of goals) {
    const p = goalProgress(g, snap, {
      fiMultiplier: opts.fiMultiplier,
      annualReturnReal: opts.annualReturnReal,
      activeGoalsCount: goals.length,
      prices: opts.prices,
    })
    if (p.status === 'on') on += 1
  }
  return (on / goals.length) * 100
}

// ----- date helpers (private) -----

function toIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseIsoDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}(-\d{2})?$/.test(iso)) return null
  const parts = iso.split('-')
  const y = Number(parts[0])
  const m = Number(parts[1])
  const d = parts[2] !== undefined ? Number(parts[2]) : 1
  if (!Number.isFinite(y) || !Number.isFinite(m)) return null
  return new Date(y, m - 1, d)
}

function addMonthsIso(base: Date, months: number): string {
  const out = new Date(base)
  out.setMonth(out.getMonth() + months)
  return toIsoDate(out)
}

function monthDiff(from: Date, to: Date): number {
  return (
    (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
  )
}
