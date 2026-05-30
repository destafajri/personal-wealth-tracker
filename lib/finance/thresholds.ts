// Zone classification for each metric. Lower value = better for debt-ish metrics (dsr, dar,
// rasioTertahan, allocationDiscipline); higher value = better for the rest.
//
// Boundary rule: classification is left-inclusive on the "better" side — i.e., values exactly
// at a sehat/waspada boundary land in the SEHAT bucket; values exactly at waspada/bahaya
// land in the WASPADA bucket. PRD wording "<30% Sehat · 30–40% Waspada" reads ambiguously
// at 30; we resolve to: < 30 sehat, 30 ≤ x < 40 waspada, ≥ 40 bahaya.

export type Zone = 'sehat' | 'waspada' | 'bahaya'

export type MetricKey =
  | 'dsr'
  | 'dar'
  | 'runway'
  | 'savingsRate'
  | 'safeHaven'
  | 'allocationDiscipline'
  | 'goalHealth'
  | 'rasioTertahan'

interface BoundsLowerIsBetter {
  direction: 'lower-better'
  sehatBelow: number
  bahayaAtOrAbove: number
}

interface BoundsHigherIsBetter {
  direction: 'higher-better'
  sehatAtOrAbove: number
  bahayaBelow: number
}

type Bounds = BoundsLowerIsBetter | BoundsHigherIsBetter

export const thresholds: Record<MetricKey, Bounds> = {
  dsr: { direction: 'lower-better', sehatBelow: 30, bahayaAtOrAbove: 40 },
  dar: { direction: 'lower-better', sehatBelow: 30, bahayaAtOrAbove: 50 },
  runway: { direction: 'higher-better', sehatAtOrAbove: 6, bahayaBelow: 3 },
  savingsRate: { direction: 'higher-better', sehatAtOrAbove: 20, bahayaBelow: 10 },
  safeHaven: { direction: 'higher-better', sehatAtOrAbove: 60, bahayaBelow: 40 },
  allocationDiscipline: {
    direction: 'lower-better',
    sehatBelow: 5,
    bahayaAtOrAbove: 15,
  },
  goalHealth: { direction: 'higher-better', sehatAtOrAbove: 80, bahayaBelow: 50 },
  rasioTertahan: { direction: 'lower-better', sehatBelow: 50, bahayaAtOrAbove: 70 },
}

export function zoneOf(metric: MetricKey, value: number): Zone {
  const b = thresholds[metric]
  if (b.direction === 'lower-better') {
    if (value < b.sehatBelow) return 'sehat'
    if (value >= b.bahayaAtOrAbove) return 'bahaya'
    return 'waspada'
  }
  if (value >= b.sehatAtOrAbove) return 'sehat'
  if (value < b.bahayaBelow) return 'bahaya'
  return 'waspada'
}
