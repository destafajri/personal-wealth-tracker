import {
  calcAllocationDiscipline,
  calcDar,
  calcDsr,
  calcNetWorth,
  calcRunway,
  calcSafeHaven,
  calcSavingsRate,
  calcTotalAset,
  calcTotalPengeluaran,
  calcTotalUtang,
  totalPenghasilanMonthly,
} from '~/lib/finance/metrics'
import { zoneOf, type MetricKey, type Zone } from '~/lib/finance/thresholds'
import type { PricesView, SnapshotState } from '~/lib/types/snapshot'

// Cermat Score — weighted sum of existing health metric zones, max 1000 points.
// Extends the Zone system (sehat/waspada/bahaya) instead of introducing new logic.

export interface ScoreContribution {
  metric: MetricKey | 'netWorthVsExpenses'
  zone: Zone
  points: number
  maxPoints: number
}

export interface CermatLevel {
  tier: number
  label: string
  icon: string
  color: string
}

export const LEVELS: CermatLevel[] = [
  { tier: 0, label: 'Belum Dinilai', icon: '—', color: 'text-gray-400' },
  { tier: 1, label: 'Bibit', icon: '🌱', color: 'text-emerald-300' },
  { tier: 2, label: 'Tunas', icon: '🌿', color: 'text-emerald-400' },
  { tier: 3, label: 'Pohon', icon: '🌳', color: 'text-emerald-500' },
  { tier: 4, label: 'Rimbun', icon: '🌲', color: 'text-emerald-600' },
  { tier: 5, label: 'Hutan', icon: '🏆', color: 'text-amber-500' },
]

function levelOf(score: number): CermatLevel {
  if (score <= 0) return LEVELS[0]!
  if (score <= 200) return LEVELS[1]!
  if (score <= 400) return LEVELS[2]!
  if (score <= 600) return LEVELS[3]!
  if (score <= 800) return LEVELS[4]!
  return LEVELS[5]!
}

interface MetricWeight {
  key: MetricKey | 'netWorthVsExpenses'
  weight: number
}

const WEIGHTS: MetricWeight[] = [
  { key: 'dsr', weight: 200 },
  { key: 'savingsRate', weight: 200 },
  { key: 'runway', weight: 150 },
  { key: 'dar', weight: 150 },
  { key: 'safeHaven', weight: 100 },
  { key: 'goalHealth', weight: 100 },
  { key: 'netWorthVsExpenses', weight: 50 },
  { key: 'allocationDiscipline', weight: 50 },
]

function zonePoints(zone: Zone, max: number): number {
  if (zone === 'sehat') return max
  if (zone === 'waspada') return Math.round(max / 2)
  return 0
}

// Not Applicable = full points (e.g., debt-free user). Incomplete Data = 0 points.
type NullHandling = 'notApplicable' | 'incompleteData'

function nullHandling(
  key: MetricKey | 'netWorthVsExpenses',
  snap: SnapshotState,
): NullHandling {
  if (key === 'dsr') {
    return calcTotalUtang(snap) === 0 ? 'notApplicable' : 'incompleteData'
  }
  if (key === 'dar') {
    return calcTotalUtang(snap) === 0 ? 'notApplicable' : 'incompleteData'
  }
  if (key === 'allocationDiscipline') {
    return snap.saham.length === 0 ? 'notApplicable' : 'incompleteData'
  }
  if (key === 'goalHealth') {
    // No goals defined = neutral, not penalized
    return 'notApplicable'
  }
  return 'incompleteData'
}

function calcNetWorthVsExpenses(
  snap: SnapshotState,
  prices?: PricesView,
): Zone | null {
  const nw = calcNetWorth(snap, prices)
  const burn = calcTotalPengeluaran(snap, prices)
  if (burn <= 0) return null
  const ratio = nw / burn
  if (ratio >= 12) return 'sehat'
  if (ratio >= 6) return 'waspada'
  return 'bahaya'
}

export function calcCermatScore(
  snap: SnapshotState,
  goalHealth: number | null,
  prices?: PricesView,
): { score: number; level: CermatLevel; contributions: ScoreContribution[] } {
  const metricValues: Record<string, number | null> = {
    dsr: calcDsr(snap, prices),
    savingsRate: calcSavingsRate(snap, prices),
    runway: calcRunway(snap, prices),
    dar: calcDar(snap, prices),
    safeHaven: calcSafeHaven(snap, prices),
    goalHealth,
    allocationDiscipline: calcAllocationDiscipline(snap.saham, prices),
    netWorthVsExpenses: null, // handled separately
  }

  const contributions: ScoreContribution[] = []
  let score = 0
  let metricsWithData = 0

  for (const { key, weight } of WEIGHTS) {
    if (key === 'netWorthVsExpenses') {
      const zone = calcNetWorthVsExpenses(snap, prices)
      if (zone === null) {
        contributions.push({
          metric: key,
          zone: 'bahaya',
          points: 0,
          maxPoints: weight,
        })
      } else {
        metricsWithData++
        const pts = zonePoints(zone, weight)
        score += pts
        contributions.push({ metric: key, zone, points: pts, maxPoints: weight })
      }
      continue
    }

    const value = metricValues[key]

    if (value === null || value === undefined) {
      const handling = nullHandling(key, snap)
      if (handling === 'notApplicable') {
        score += weight
        contributions.push({
          metric: key,
          zone: 'sehat',
          points: weight,
          maxPoints: weight,
        })
      } else {
        contributions.push({
          metric: key,
          zone: 'bahaya',
          points: 0,
          maxPoints: weight,
        })
      }
      continue
    }

    metricsWithData++
    const zone = zoneOf(key, value)
    const pts = zonePoints(zone, weight)
    score += pts
    contributions.push({ metric: key, zone, points: pts, maxPoints: weight })
  }

  // Belum Dinilai: fewer than 3 metrics with actual data → tier 0
  if (metricsWithData < 3) {
    return { score: 0, level: LEVELS[0]!, contributions }
  }

  return { score, level: levelOf(score), contributions }
}
