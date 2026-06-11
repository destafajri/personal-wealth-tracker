import { describe, expect, it } from 'vitest'
import { resolvePersona, hasInvestments, isSnapshotReady, PERSONA_VISUALS } from '~/lib/finance/persona'
import type { PersonaKey } from '~/lib/finance/persona'
import type { SnapshotState } from '~/lib/types/snapshot'
import { emptySnapshot } from '~/lib/types/snapshot'

function snap(overrides: Partial<SnapshotState> = {}): SnapshotState {
  const base = emptySnapshot()
  return { ...base, ...overrides }
}

function snapWithIncomeAndExpense(overrides: Partial<SnapshotState> = {}): SnapshotState {
  return snap({
    penghasilan: { amount: 5_000_000, currency: 'IDR' },
    pengeluaran: { pokok: 2_000_000, lifestyle: 1_000_000, pokokCurrency: 'IDR', lifestyleCurrency: 'IDR' },
    ...overrides,
  })
}

describe('isSnapshotReady', () => {
  it('returns false when empty', () => {
    expect(isSnapshotReady(snap())).toBe(false)
  })

  it('returns false when only income filled', () => {
    const s = snap({ penghasilan: { amount: 5_000_000, currency: 'IDR' } })
    expect(isSnapshotReady(s)).toBe(false)
  })

  it('returns false when only expense filled', () => {
    const s = snap({ pengeluaran: { pokok: 2_000_000, lifestyle: 0, pokokCurrency: 'IDR', lifestyleCurrency: 'IDR' } })
    expect(isSnapshotReady(s)).toBe(false)
  })

  it('returns true when both income and expense filled', () => {
    expect(isSnapshotReady(snapWithIncomeAndExpense())).toBe(true)
  })

  it('returns true with income from penghasilanLain', () => {
    const s = snap({
      penghasilanLain: [{ id: '1', label: 'side', amount: 1_000_000 }],
      pengeluaran: { pokok: 500_000, lifestyle: 0, pokokCurrency: 'IDR', lifestyleCurrency: 'IDR' },
    })
    expect(isSnapshotReady(s)).toBe(true)
  })

  it('returns true when only biayaKos is filled (no pokok/lifestyle)', () => {
    const s = snap({
      penghasilan: { amount: 5_000_000, currency: 'IDR' },
      pengeluaran: { pokok: 0, lifestyle: 0, pokokCurrency: 'IDR', lifestyleCurrency: 'IDR', biayaKos: 1_200_000, biayaKosCurrency: 'IDR' },
    })
    expect(isSnapshotReady(s)).toBe(true)
  })
})

describe('hasInvestments', () => {
  it('returns false when empty', () => {
    expect(hasInvestments(snap())).toBe(false)
  })

  it('returns true with saham', () => {
    const s = snap({ saham: [{ id: '1', ticker: 'BBCA', lot: 10, hargaRataRata: 9000 } as any] })
    expect(hasInvestments(s)).toBe(true)
  })

  it('returns true with crypto', () => {
    const s = snap({ crypto: [{ id: '1', symbol: 'BTC', mode: 'unit', amount: 0.01 } as any] })
    expect(hasInvestments(s)).toBe(true)
  })

  it('returns true with deposito > 0', () => {
    const base = snap()
    base.asetLikuid.deposito.push({ id: '1', label: 'Depo', amount: 10_000_000 })
    expect(hasInvestments(base)).toBe(true)
  })

  it('returns false with deposito = 0', () => {
    const base = snap()
    base.asetLikuid.deposito.push({ id: '1', label: 'Depo', amount: 0 })
    expect(hasInvestments(base)).toBe(false)
  })

  it('returns true with reksaDana > 0', () => {
    const base = snap()
    base.asetLikuid.reksaDana.push({ id: '1', label: 'RD', amount: 5_000_000 })
    expect(hasInvestments(base)).toBe(true)
  })

  it('emas does not count as investment', () => {
    const s = snap({
      emas: { digitalGram: 10, fisikAntamGram: 5, perhiasan18KGram: 0, perhiasan14KGram: 0, perhiasan10KGram: 0 },
    })
    expect(hasInvestments(s)).toBe(false)
  })
})

describe('resolvePersona', () => {
  it('returns null when snapshot not ready', () => {
    expect(resolvePersona({ savingsRate: 50, runway: 10, hasInvestments: true, isSnapshotReady: false })).toBeNull()
  })

  it('sultanKos: savingsRate >= 40 + hasInvestments', () => {
    const result = resolvePersona({ savingsRate: 40, runway: 10, hasInvestments: true, isSnapshotReady: true })
    expect(result).toEqual({ key: 'sultanKos', tone: 'celebration' })
  })

  it('sultanKos: high savingsRate with high investments', () => {
    const result = resolvePersona({ savingsRate: 80, runway: 20, hasInvestments: true, isSnapshotReady: true })
    expect(result?.key).toBe('sultanKos')
  })

  it('investorKos: has investments but savingsRate < 40', () => {
    const result = resolvePersona({ savingsRate: 10, runway: 5, hasInvestments: true, isSnapshotReady: true })
    expect(result).toEqual({ key: 'investorKos', tone: 'positive' })
  })

  it('investorKos: has investments with savingsRate = 0', () => {
    const result = resolvePersona({ savingsRate: 0, runway: 2, hasInvestments: true, isSnapshotReady: true })
    expect(result?.key).toBe('investorKos')
  })

  it('anakKosBijak: savingsRate >= 15, no investments', () => {
    const result = resolvePersona({ savingsRate: 15, runway: 3, hasInvestments: false, isSnapshotReady: true })
    expect(result).toEqual({ key: 'anakKosBijak', tone: 'nudge' })
  })

  it('anakKosBijak: high savingsRate, no investments', () => {
    const result = resolvePersona({ savingsRate: 50, runway: 12, hasInvestments: false, isSnapshotReady: true })
    expect(result?.key).toBe('anakKosBijak')
  })

  it('pejuangAkhirBulan: runway < 1, low savingsRate, no investments', () => {
    const result = resolvePersona({ savingsRate: 5, runway: 0.5, hasInvestments: false, isSnapshotReady: true })
    expect(result).toEqual({ key: 'pejuangAkhirBulan', tone: 'empathy' })
  })

  it('pejuangAkhirBulan: runway = 0', () => {
    const result = resolvePersona({ savingsRate: 0, runway: 0, hasInvestments: false, isSnapshotReady: true })
    expect(result?.key).toBe('pejuangAkhirBulan')
  })

  it('sobatIndomie: fallback when nothing else matches', () => {
    const result = resolvePersona({ savingsRate: 5, runway: 2, hasInvestments: false, isSnapshotReady: true })
    expect(result).toEqual({ key: 'sobatIndomie', tone: 'humor' })
  })

  it('handles null savingsRate as 0', () => {
    const result = resolvePersona({ savingsRate: null, runway: 2, hasInvestments: false, isSnapshotReady: true })
    expect(result?.key).toBe('sobatIndomie')
  })

  it('handles null runway as 0', () => {
    const result = resolvePersona({ savingsRate: 5, runway: null, hasInvestments: false, isSnapshotReady: true })
    expect(result?.key).toBe('pejuangAkhirBulan')
  })

  it('negative savingsRate falls to pejuangAkhirBulan or sobatIndomie', () => {
    const result = resolvePersona({ savingsRate: -10, runway: 2, hasInvestments: false, isSnapshotReady: true })
    expect(result?.key).toBe('sobatIndomie')
  })

  it('negative savingsRate with null runway → pejuangAkhirBulan', () => {
    const result = resolvePersona({ savingsRate: -10, runway: null, hasInvestments: false, isSnapshotReady: true })
    expect(result?.key).toBe('pejuangAkhirBulan')
  })

  it('anakKosBijak wins over pejuangAkhirBulan when savingsRate >= 15', () => {
    const result = resolvePersona({ savingsRate: 15, runway: 0.5, hasInvestments: false, isSnapshotReady: true })
    expect(result?.key).toBe('anakKosBijak')
  })
})

describe('PERSONA_VISUALS', () => {
  const allKeys: PersonaKey[] = ['sultanKos', 'investorKos', 'anakKosBijak', 'pejuangAkhirBulan', 'sobatIndomie']

  it('has an entry for every persona key', () => {
    for (const key of allKeys) {
      expect(PERSONA_VISUALS[key]).toBeDefined()
      expect(PERSONA_VISUALS[key].gradient).toBeTruthy()
      expect(PERSONA_VISUALS[key].emoji).toBeTruthy()
    }
  })

  it('gradients use Tailwind from-to format', () => {
    for (const key of allKeys) {
      expect(PERSONA_VISUALS[key].gradient).toMatch(/^from-/)
    }
  })
})
