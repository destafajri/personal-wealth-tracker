import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { calcBadges, isNewUnlock, markBadgeSeen } from '~/lib/finance/badges'
import { emptySnapshot, type PricesView, type SnapshotState } from '~/lib/types/snapshot'

function row(amount: number, label = 'x') {
  return { id: crypto.randomUUID(), label, amount }
}

const NO_PRICES: PricesView = {
  goldDigitalIdrPerGram: null,
  goldAntam1gIdr: null,
  fxRates: { USD: null, SGD: null, EUR: null, JPY: null, KRW: null },
  idxByTicker: {},
  cryptoByCoinId: {},
}

function find(badges: ReturnType<typeof calcBadges>, id: string) {
  return badges.find((b) => b.id === id)!
}

describe('calcBadges', () => {
  it('empty snapshot → all 5 badges locked', () => {
    const badges = calcBadges(emptySnapshot(), NO_PRICES)
    expect(badges).toHaveLength(5)
    for (const b of badges) {
      expect(b.unlocked).toBe(false)
    }
  })

  describe('Dana Darurat Aman', () => {
    it('unlocked when runway ≥ 6 months', () => {
      const snap = emptySnapshot()
      snap.penghasilan = { amount: 10_000_000, currency: 'IDR' }
      snap.pengeluaran = {
        pokok: 3_000_000,
        pokokCurrency: 'IDR',
        lifestyle: 2_000_000,
        lifestyleCurrency: 'IDR',
        biayaKos: 0,
        biayaKosCurrency: 'IDR',
      }
      // 30jt kas / 5jt burn = 6 months
      snap.asetLikuid.kas.push(row(30_000_000))
      const badges = calcBadges(snap, NO_PRICES)
      expect(find(badges, 'dana-darurat-aman').unlocked).toBe(true)
    })

    it('locked when runway < 6 months', () => {
      const snap = emptySnapshot()
      snap.penghasilan = { amount: 10_000_000, currency: 'IDR' }
      snap.pengeluaran = {
        pokok: 3_000_000,
        pokokCurrency: 'IDR',
        lifestyle: 2_000_000,
        lifestyleCurrency: 'IDR',
        biayaKos: 0,
        biayaKosCurrency: 'IDR',
      }
      snap.asetLikuid.kas.push(row(10_000_000)) // 10jt / 5jt = 2 months
      const badges = calcBadges(snap, NO_PRICES)
      expect(find(badges, 'dana-darurat-aman').unlocked).toBe(false)
    })
  })

  describe('Utang Terkontrol', () => {
    it('unlocked when DSR < 30%', () => {
      const snap = emptySnapshot()
      snap.penghasilan = { amount: 10_000_000, currency: 'IDR' }
      snap.cicilanAktif.push({
        id: 'c1',
        tipe: 'KPR',
        label: 'KPR',
        sisaPokok: 200_000_000,
        cicilanPerBulan: 2_000_000, // 20% DSR
        jenisBunga: 'Anuitas',
      })
      snap.asetLikuid.kas.push(row(100_000_000))
      const badges = calcBadges(snap, NO_PRICES)
      expect(find(badges, 'utang-terkontrol').unlocked).toBe(true)
    })

    it('locked when DSR ≥ 30%', () => {
      const snap = emptySnapshot()
      snap.penghasilan = { amount: 10_000_000, currency: 'IDR' }
      snap.cicilanAktif.push({
        id: 'c1',
        tipe: 'KPR',
        label: 'KPR',
        sisaPokok: 400_000_000,
        cicilanPerBulan: 4_000_000, // 40% DSR
        jenisBunga: 'Anuitas',
      })
      snap.asetLikuid.kas.push(row(100_000_000))
      const badges = calcBadges(snap, NO_PRICES)
      expect(find(badges, 'utang-terkontrol').unlocked).toBe(false)
    })
  })

  describe('Cashflow Positif', () => {
    it('unlocked when surplus > 0', () => {
      const snap = emptySnapshot()
      snap.penghasilan = { amount: 10_000_000, currency: 'IDR' }
      snap.pengeluaran = {
        pokok: 3_000_000,
        pokokCurrency: 'IDR',
        lifestyle: 2_000_000,
        lifestyleCurrency: 'IDR',
        biayaKos: 0,
        biayaKosCurrency: 'IDR',
      }
      const badges = calcBadges(snap, NO_PRICES)
      expect(find(badges, 'cashflow-positif').unlocked).toBe(true)
    })

    it('locked when expenses ≥ income', () => {
      const snap = emptySnapshot()
      snap.penghasilan = { amount: 5_000_000, currency: 'IDR' }
      snap.pengeluaran = {
        pokok: 4_000_000,
        pokokCurrency: 'IDR',
        lifestyle: 2_000_000,
        lifestyleCurrency: 'IDR',
        biayaKos: 0,
        biayaKosCurrency: 'IDR',
      }
      const badges = calcBadges(snap, NO_PRICES)
      expect(find(badges, 'cashflow-positif').unlocked).toBe(false)
    })
  })

  describe('Diversifikasi Sehat', () => {
    it('unlocked when ≥ 4 categories, each ≥5%, total > 1jt', () => {
      const snap = emptySnapshot()
      // 4 categories at 25% each = kas 500k, deposito 500k, properti 500k, kendaraan 500k
      // Total = 2jt, each = 25% > 5%
      snap.asetLikuid.kas.push(row(500_000))
      snap.asetLikuid.deposito.push(row(500_000))
      snap.asetNonLikuid.properti.push(row(500_000))
      snap.asetNonLikuid.kendaraan.push(row(500_000))
      const badges = calcBadges(snap, NO_PRICES)
      expect(find(badges, 'diversifikasi-sehat').unlocked).toBe(true)
    })

    it('locked when < 4 qualifying categories', () => {
      const snap = emptySnapshot()
      // Only 2 categories
      snap.asetLikuid.kas.push(row(1_000_000))
      snap.asetLikuid.deposito.push(row(1_000_000))
      const badges = calcBadges(snap, NO_PRICES)
      expect(find(badges, 'diversifikasi-sehat').unlocked).toBe(false)
    })

    it('locked when total assets ≤ 1jt', () => {
      const snap = emptySnapshot()
      snap.asetLikuid.kas.push(row(200_000))
      snap.asetLikuid.deposito.push(row(200_000))
      snap.asetNonLikuid.properti.push(row(200_000))
      snap.asetNonLikuid.kendaraan.push(row(200_000))
      // Total = 800k < 1jt
      const badges = calcBadges(snap, NO_PRICES)
      expect(find(badges, 'diversifikasi-sehat').unlocked).toBe(false)
    })

    it('locked when a category < 5% of total', () => {
      const snap = emptySnapshot()
      // 4 categories but one is tiny: kas 970k, deposito 10k, properti 10k, kendaraan 10k
      // Total = 1jt, deposito = 1%, properti = 1%, kendaraan = 1%
      snap.asetLikuid.kas.push(row(970_000))
      snap.asetLikuid.deposito.push(row(10_000))
      snap.asetNonLikuid.properti.push(row(10_000))
      snap.asetNonLikuid.kendaraan.push(row(10_000))
      const badges = calcBadges(snap, NO_PRICES)
      expect(find(badges, 'diversifikasi-sehat').unlocked).toBe(false)
    })
  })

  describe('Tabungan Disiplin', () => {
    it('unlocked when savings rate ≥ 20%', () => {
      const snap = emptySnapshot()
      snap.penghasilan = { amount: 10_000_000, currency: 'IDR' }
      snap.pengeluaran = {
        pokok: 5_000_000,
        pokokCurrency: 'IDR',
        lifestyle: 2_000_000,
        lifestyleCurrency: 'IDR',
        biayaKos: 0,
        biayaKosCurrency: 'IDR',
      }
      // Savings = (10 - 7) / 10 = 30%
      const badges = calcBadges(snap, NO_PRICES)
      expect(find(badges, 'tabungan-disiplin').unlocked).toBe(true)
    })

    it('locked when savings rate < 20%', () => {
      const snap = emptySnapshot()
      snap.penghasilan = { amount: 10_000_000, currency: 'IDR' }
      snap.pengeluaran = {
        pokok: 7_000_000,
        pokokCurrency: 'IDR',
        lifestyle: 2_000_000,
        lifestyleCurrency: 'IDR',
        biayaKos: 0,
        biayaKosCurrency: 'IDR',
      }
      // Savings = (10 - 9) / 10 = 10%
      const badges = calcBadges(snap, NO_PRICES)
      expect(find(badges, 'tabungan-disiplin').unlocked).toBe(false)
    })
  })

  it('each badge has required fields', () => {
    const badges = calcBadges(emptySnapshot(), NO_PRICES)
    for (const b of badges) {
      expect(b.id).toBeTruthy()
      expect(b.label).toBeTruthy()
      expect(b.icon).toBeTruthy()
      expect(b.description).toBeTruthy()
      expect(typeof b.unlocked).toBe('boolean')
    }
  })
})

describe('isNewUnlock / markBadgeSeen', () => {
  beforeEach(() => {
    const store: Record<string, string> = {}
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, val: string) => { store[key] = val },
    })
  })
  afterEach(() => vi.unstubAllGlobals())

  it('isNewUnlock returns true for unlocked badge with no localStorage entry', () => {
    const badge = {
      id: 'test-badge',
      label: 'Test',
      icon: 'X',
      description: 'desc',
      unlocked: true,
    }
    expect(isNewUnlock(badge)).toBe(true)
  })

  it('isNewUnlock returns false when timestamp exists', () => {
    localStorage.setItem(
      'cermat-badges',
      JSON.stringify({ 'test-badge': '2026-06-07T12:00:00Z' }),
    )
    const badge = {
      id: 'test-badge',
      label: 'Test',
      icon: 'X',
      description: 'desc',
      unlocked: true,
    }
    expect(isNewUnlock(badge)).toBe(false)
  })

  it('markBadgeSeen writes timestamp to localStorage', () => {
    const badge = {
      id: 'test-badge',
      label: 'Test',
      icon: 'X',
      description: 'desc',
      unlocked: true,
    }
    markBadgeSeen(badge)
    const stored = JSON.parse(localStorage.getItem('cermat-badges')!)
    expect(stored['test-badge']).toBeTruthy()
  })
})
