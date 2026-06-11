import type { SnapshotState } from '~/lib/types/snapshot'

export type PersonaKey =
  | 'sultanKos'
  | 'investorKos'
  | 'anakKosBijak'
  | 'pejuangAkhirBulan'
  | 'sobatIndomie' // display label renamed to "Sobat Mie" — internal key kept for localStorage/test compat

export const PERSONA_VISUALS: Record<PersonaKey, { gradient: string; gradientCSS: string; emoji: string }> = {
  sultanKos: { gradient: 'from-amber-400 to-yellow-500', gradientCSS: 'linear-gradient(to bottom, #fbbf24, #eab308)', emoji: '👑' },
  investorKos: { gradient: 'from-emerald-400 to-teal-500', gradientCSS: 'linear-gradient(to bottom, #34d399, #14b8a6)', emoji: '📈' },
  anakKosBijak: { gradient: 'from-blue-400 to-indigo-500', gradientCSS: 'linear-gradient(to bottom, #60a5fa, #6366f1)', emoji: '👍' },
  pejuangAkhirBulan: { gradient: 'from-rose-400 to-pink-500', gradientCSS: 'linear-gradient(to bottom, #fb7185, #ec4899)', emoji: '🔥' },
  sobatIndomie: { gradient: 'from-orange-400 to-amber-500', gradientCSS: 'linear-gradient(to bottom, #fb923c, #f59e0b)', emoji: '🍜' },
}

export type PersonaTone = 'celebration' | 'positive' | 'nudge' | 'empathy' | 'humor'

export interface PersonaResult {
  key: PersonaKey
  tone: PersonaTone
}

export interface PersonaInput {
  savingsRate: number | null
  runway: number | null
  hasInvestments: boolean
  isSnapshotReady: boolean
}

export function hasInvestments(snapshot: SnapshotState): boolean {
  if (snapshot.saham.length > 0) return true
  if (snapshot.crypto.length > 0) return true
  if (snapshot.asetLikuid.deposito.some((r) => r.amount > 0)) return true
  if (snapshot.asetLikuid.reksaDana.some((r) => r.amount > 0)) return true
  return false
}

export function isSnapshotReady(snapshot: SnapshotState): boolean {
  const hasIncome =
    snapshot.penghasilan.amount > 0
    || snapshot.penghasilanLain.some((r) => r.amount > 0)
  const hasExpense =
    snapshot.pengeluaran.pokok > 0
    || snapshot.pengeluaran.lifestyle > 0
    || (snapshot.pengeluaran.biayaKos ?? 0) > 0
    || snapshot.pengeluaranLain.some((r) => r.amount > 0)
  return hasIncome && hasExpense
}

export function resolvePersona(input: PersonaInput): PersonaResult | null {
  if (!input.isSnapshotReady) return null

  const sr = input.savingsRate ?? 0
  const rw = input.runway ?? 0

  if (sr >= 40 && input.hasInvestments) {
    return { key: 'sultanKos', tone: 'celebration' }
  }
  if (input.hasInvestments && sr >= 0) {
    return { key: 'investorKos', tone: 'positive' }
  }
  if (sr >= 15) {
    return { key: 'anakKosBijak', tone: 'nudge' }
  }
  if (rw < 1) {
    return { key: 'pejuangAkhirBulan', tone: 'empathy' }
  }
  return { key: 'sobatIndomie', tone: 'humor' }
}
