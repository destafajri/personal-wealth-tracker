import type {
  EmasState,
  GadaiJaminanKind,
  PricesView,
  SnapshotState,
} from '~/lib/types/snapshot'

// Per-category buyback multipliers vs Antam 1g list price.
// Source: market norms (2025–2026 Pegadaian / toko emas data); midpoints of the bands
// the user provided. Centralised so we surface them as ESTIMASI copy beside each input.
//
// Digital savings uses Pegadaian's own `hargaJual` (Tabungan Emas top-up price, ~4% over spot).
// Fisik Antam buyback ≈ spot ≈ 89.7% of Antam list price (Antam jual/beli spread ~11.4%).
//
// IMPORTANT: these are *estimates*; UI MUST surface them as such.
export const EMAS_VALUATION = {
  fisikAntamSpread: 0.897, // Antam buyback ≈ 89.7% of list (Jun 2026: 2,584k / 2,881k)
  perhiasan18K: 0.595, // ~57–62% Antam (kadar ~75%)
  perhiasan14K: 0.455, // ~43–48% Antam (kadar ~58.3%)
  perhiasan10K: 0.375, // ~35–40% Antam (kadar ~41.7%)
} as const

// Ordered for stable iteration / UI rendering.
export const EMAS_CATEGORIES = [
  'digital',
  'fisikAntam',
  'perhiasan18K',
  'perhiasan14K',
  'perhiasan10K',
] as const

export type EmasCategory = (typeof EMAS_CATEGORIES)[number]

const CATEGORY_GRAM_FIELD: Record<EmasCategory, keyof EmasState> = {
  digital: 'digitalGram',
  fisikAntam: 'fisikAntamGram',
  perhiasan18K: 'perhiasan18KGram',
  perhiasan14K: 'perhiasan14KGram',
  perhiasan10K: 'perhiasan10KGram',
}

const CATEGORY_FROM_JAMINAN: Partial<Record<GadaiJaminanKind, EmasCategory>> = {
  'emas:digital': 'digital',
  'emas:fisikAntam': 'fisikAntam',
  'emas:perhiasan18K': 'perhiasan18K',
  'emas:perhiasan14K': 'perhiasan14K',
  'emas:perhiasan10K': 'perhiasan10K',
}

export function emasCategoryOfJaminan(
  kind: GadaiJaminanKind,
): EmasCategory | null {
  return CATEGORY_FROM_JAMINAN[kind] ?? null
}

export function ratePerGram(cat: EmasCategory, prices?: PricesView): number {
  const digital = prices?.goldDigitalIdrPerGram ?? 0
  const antam = prices?.goldAntam1gIdr ?? 0
  switch (cat) {
    case 'digital':
      return digital
    case 'fisikAntam':
      return antam * EMAS_VALUATION.fisikAntamSpread
    case 'perhiasan18K':
      return antam * EMAS_VALUATION.perhiasan18K
    case 'perhiasan14K':
      return antam * EMAS_VALUATION.perhiasan14K
    case 'perhiasan10K':
      return antam * EMAS_VALUATION.perhiasan10K
  }
}

// Total grams owned in a category (whether at home or pawned).
export function totalGramOf(snap: SnapshotState, cat: EmasCategory): number {
  return snap.emas[CATEGORY_GRAM_FIELD[cat]] || 0
}

// Sum of grams currently pawned in this specific emas category.
export function pawnedGramOf(snap: SnapshotState, cat: EmasCategory): number {
  return snap.gadai.reduce((s, g) => {
    if (emasCategoryOfJaminan(g.jaminan) !== cat) return s
    return s + (g.gramTertahan || 0)
  }, 0)
}

// Grams still at home (not pawned) — used by Runway numerator.
export function availableGramOf(snap: SnapshotState, cat: EmasCategory): number {
  return Math.max(0, totalGramOf(snap, cat) - pawnedGramOf(snap, cat))
}

export interface EmasValuationBreakdown {
  digital: number
  fisikAntam: number
  perhiasan18K: number
  perhiasan14K: number
  perhiasan10K: number
  total: number
}

// Full value of owned emas (all categories, INCLUDING pawned grams, valued at their
// own category rate). Used by Net Worth.
export function totalGoldIdr(snap: SnapshotState, prices?: PricesView): number {
  let sum = 0
  for (const cat of EMAS_CATEGORIES) {
    sum += totalGramOf(snap, cat) * ratePerGram(cat, prices)
  }
  return sum
}

// Value of at-home (non-pawned) emas. Used by Runway.
export function cadanganGoldIdr(snap: SnapshotState, prices?: PricesView): number {
  let sum = 0
  for (const cat of EMAS_CATEGORIES) {
    sum += availableGramOf(snap, cat) * ratePerGram(cat, prices)
  }
  return sum
}

export function tertahanGoldIdr(snap: SnapshotState, prices?: PricesView): number {
  return totalGoldIdr(snap, prices) - cadanganGoldIdr(snap, prices)
}

export function breakdownGoldIdr(
  snap: SnapshotState,
  prices?: PricesView,
): EmasValuationBreakdown {
  const parts: EmasValuationBreakdown = {
    digital: totalGramOf(snap, 'digital') * ratePerGram('digital', prices),
    fisikAntam: totalGramOf(snap, 'fisikAntam') * ratePerGram('fisikAntam', prices),
    perhiasan18K:
      totalGramOf(snap, 'perhiasan18K') * ratePerGram('perhiasan18K', prices),
    perhiasan14K:
      totalGramOf(snap, 'perhiasan14K') * ratePerGram('perhiasan14K', prices),
    perhiasan10K:
      totalGramOf(snap, 'perhiasan10K') * ratePerGram('perhiasan10K', prices),
    total: 0,
  }
  parts.total =
    parts.digital +
    parts.fisikAntam +
    parts.perhiasan18K +
    parts.perhiasan14K +
    parts.perhiasan10K
  return parts
}

// Total grams owned (any category). Used by Rasio Tertahan denominator.
export function totalGoldGram(snap: SnapshotState): number {
  let sum = 0
  for (const cat of EMAS_CATEGORIES) sum += totalGramOf(snap, cat)
  return sum
}

export function totalPawnedGoldGram(snap: SnapshotState): number {
  let sum = 0
  for (const cat of EMAS_CATEGORIES) sum += pawnedGramOf(snap, cat)
  return sum
}
