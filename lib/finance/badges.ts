import {
  calcAssetBreakdown,
  calcDsr,
  calcRunway,
  calcSavingsRate,
  calcTotalAset,
  totalPenghasilanMonthly,
} from '~/lib/finance/metrics'
import { surplus } from '~/lib/finance/goals'
import type { PricesView, SnapshotState } from '~/lib/types/snapshot'

export interface Badge {
  id: string
  label: string
  icon: string
  description: string
  unlocked: boolean
}

interface BadgeDef {
  id: string
  label: string
  icon: string
  description: string
  check: (snap: SnapshotState, prices?: PricesView) => boolean
}

const BADGE_DEFS: BadgeDef[] = [
  {
    id: 'dana-darurat-aman',
    label: 'Dana Darurat Aman',
    icon: '🛡️',
    description: 'Dana darurat ≥ 6 bulan pengeluaran',
    check: (snap, prices) => {
      const r = calcRunway(snap, prices)
      return r !== null && r >= 6
    },
  },
  {
    id: 'utang-terkontrol',
    label: 'Utang Terkontrol',
    icon: '⚖️',
    description: 'DSR < 30% (cicilan wajar vs penghasilan)',
    check: (snap, prices) => {
      const dsr = calcDsr(snap, prices)
      return dsr !== null && dsr < 30
    },
  },
  {
    id: 'cashflow-positif',
    label: 'Cashflow Positif',
    icon: '💰',
    description: 'Penghasilan > pengeluaran tiap bulan',
    check: (snap, prices) => surplus(snap, prices) > 0,
  },
  {
    id: 'diversifikasi-sehat',
    label: 'Diversifikasi',
    icon: '🌱',
    description:
      '≥ 4 kategori aset, masing-masing ≥5% dari total, total aset > Rp 1 juta',
    check: (snap, prices) => {
      const totalAset = calcTotalAset(snap, prices)
      if (totalAset < 1_000_000) return false
      const { breakdown } = assetCategories(snap, prices)
      const qualifying = breakdown.filter(
        (b) => b.value > 0 && b.value / totalAset >= 0.05,
      )
      return qualifying.length >= 4
    },
  },
  {
    id: 'tabungan-disiplin',
    label: 'Tabungan Disiplin',
    icon: '📈',
    description: 'Savings rate ≥ 20%',
    check: (snap, prices) => {
      const sr = calcSavingsRate(snap, prices)
      return sr !== null && sr >= 20
    },
  },
]

// Per-category asset value for diversification check.
function assetCategories(
  snap: SnapshotState,
  prices?: PricesView,
): { breakdown: { label: string; value: number }[] } {
  const a = snap.asetLikuid
  const kas = a.kas.reduce((s, r) => s + (r.amount || 0), 0)
  const deposito = a.deposito.reduce((s, r) => s + (r.amount || 0), 0)
  const rd = a.reksaDana.reduce((s, r) => s + (r.amount || 0), 0)
  const sbn = a.sbn.reduce((s, r) => s + (r.amount || 0), 0)
  const properti = snap.asetNonLikuid.properti.reduce(
    (s, r) => s + (r.amount || 0),
    0,
  )
  const kendaraan = snap.asetNonLikuid.kendaraan.reduce(
    (s, r) => s + (r.amount || 0),
    0,
  )
  const pensiun = snap.asetNonLikuid.pensiun.reduce(
    (s, r) => s + (r.amount || 0),
    0,
  )
  // Simplified: use raw amounts without FX for diversification check.
  // This keeps the check lightweight and correct for IDR-only users (99% of users).
  const breakdown = [
    { label: 'Kas', value: kas },
    { label: 'Deposito', value: deposito },
    { label: 'Reksa Dana', value: rd },
    { label: 'SBN', value: sbn },
    { label: 'Properti', value: properti },
    { label: 'Kendaraan', value: kendaraan },
    { label: 'Pensiun', value: pensiun },
  ]
  return { breakdown }
}

// Check if a badge is newly unlocked (no localStorage timestamp yet).
export function isNewUnlock(badge: Badge): boolean {
  if (!badge.unlocked) return false
  try {
    const stored = JSON.parse(
      localStorage.getItem('cermat-badges') || '{}',
    ) as Record<string, string>
    return !stored[badge.id]
  } catch {
    return true
  }
}

// Persist badge unlock timestamp to localStorage.
export function markBadgeSeen(badge: Badge): void {
  try {
    const stored = JSON.parse(
      localStorage.getItem('cermat-badges') || '{}',
    ) as Record<string, string>
    stored[badge.id] = new Date().toISOString()
    localStorage.setItem('cermat-badges', JSON.stringify(stored))
  } catch {
    // localStorage unavailable (SSR, private browsing) — skip silently
  }
}

export function calcBadges(
  snap: SnapshotState,
  prices?: PricesView,
): Badge[] {
  return BADGE_DEFS.map((def) => ({
    id: def.id,
    label: def.label,
    icon: def.icon,
    description: def.description,
    unlocked: def.check(snap, prices),
  }))
}
