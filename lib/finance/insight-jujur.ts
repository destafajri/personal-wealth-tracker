import { isDiscretionary } from '~/lib/finance/discretionary-keywords'
import { idrPlain } from '~/lib/format/idr'

export type InsightKind = 'defisit' | 'bocor-normal' | 'bocor-dominant' | 'runway'

export interface InsightJujur {
  kind: InsightKind
  emoji: string
  copy: string
  tone: 'rose' | 'amber'
}

export interface ResolverInput {
  income: number
  surplus: number
  pokok: number
  biayaKos: number
  lifestyle: number
  pengeluaranLain: Array<{ label: string; amount: number }>
  cicilanTotal: number
  runwayDays: number
}

// Pick the single dominant discretionary category for "lari ke {kategori}" copy.
// Returns the category name + its amount (X_amount).
// CRITICAL: X_amount is the named-category amount, NOT total diskresioner.
export function pickNamedCategory(
  lifestyle: number,
  matchedLainRows: Array<{ label: string; amount: number }>,
): { name: string; amount: number } {
  if (matchedLainRows.length === 0) return { name: 'Lifestyle', amount: lifestyle }
  const totalFromLain = matchedLainRows.reduce((s, r) => s + r.amount, 0)
  if (totalFromLain >= lifestyle) {
    const top = matchedLainRows.reduce((max, r) => (r.amount > max.amount ? r : max))
    return { name: top.label, amount: top.amount }
  }
  return { name: 'Lifestyle', amount: lifestyle }
}

export function resolveInsight(input: ResolverInput): InsightJujur | null {
  const { surplus, lifestyle, pengeluaranLain, cicilanTotal, runwayDays, pokok, biayaKos } = input

  // 1. Compute discretionary breakdown
  const matchedLainRows = pengeluaranLain.filter(r => isDiscretionary(r.label))
  const diskresionerFromLain = matchedLainRows.reduce((s, r) => s + r.amount, 0)
  const diskresionerTotal = lifestyle + diskresionerFromLain

  // 2. Pick named category (for copy {X} + {kategori})
  const { name: kategori, amount: xAmount } = pickNamedCategory(lifestyle, matchedLainRows)

  // 3. Essential total for dominance gate
  const essentialTotal = pokok + biayaKos + cicilanTotal

  // 4. Priority logic

  // Path 1: Bocor dominant — surplus < 0 AND leak dominates essentials
  if (surplus < 0 && diskresionerTotal > essentialTotal) {
    const absSurplus = Math.abs(surplus)
    const copy = `Rp${idrPlain(xAmount)} bulan ini lari ke ${kategori} — itu yang bikin kamu nombok Rp${idrPlain(absSurplus)} tiap bulan.`
    return { kind: 'bocor-dominant', emoji: '🚰', copy, tone: 'rose' }
  }

  // Path 2: Defisit — surplus < 0, leak does NOT dominate
  if (surplus < 0) {
    const absSurplus = Math.abs(surplus)
    const copy = `Tiap bulan kamu nombok Rp${idrPlain(absSurplus)}. Pengeluaran lebih besar dari pemasukan.`
    return { kind: 'defisit', emoji: '💸', copy, tone: 'rose' }
  }

  // Path 3: Bocor normal — surplus > 0, discretionary leak > tabungan, Y >= 2.0
  const tabungan = Math.max(0, surplus)
  if (tabungan > 0 && xAmount > tabungan) {
    const yActual = xAmount / tabungan
    if (yActual >= 2.0) {
      const yDisplay = Math.round(yActual)
      const copy = `Rp${idrPlain(xAmount)} bulan ini lari ke ${kategori}. Itu ${yDisplay}× lebih besar dari yang kamu tabung.`
      return { kind: 'bocor-normal', emoji: '🚰', copy, tone: 'rose' }
    }
  }

  // Path 4: Runway kritis
  if (runwayDays < 30) {
    const copy = `Kalau pemasukan berhenti, dana kamu cukup buat ${Math.round(runwayDays)} hari.`
    return { kind: 'runway', emoji: '⏳', copy, tone: 'amber' }
  }

  // Silence — no signal
  return null
}
