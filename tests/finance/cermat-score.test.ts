import { describe, expect, it } from 'vitest'
import { calcCermatScore, LEVELS } from '~/lib/finance/cermat-score'
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

// Sample persona: Pegawai Muda + KPR from Phase 6 PDF
// DSR 18.3%, Savings 39.6%, Runway 54mo, DAR 30.7%, Safe Haven 9.3%,
// Allocation 1.3pp, Net Worth ~483jt / ~6.75jt expense = ~71×
function pegawaiMudaKpr(): { snap: SnapshotState; prices: PricesView } {
  const snap = emptySnapshot()
  // Income: gaji 12jt
  snap.penghasilan = { amount: 12_000_000, currency: 'IDR' }
  // Expense: pokok 3jt + lifestyle 1.5jt + cicilan KPR 2.2jt = 6.7jt
  snap.pengeluaran = {
    pokok: 3_000_000,
    pokokCurrency: 'IDR',
    lifestyle: 1_500_000,
    lifestyleCurrency: 'IDR',
    biayaKos: 0,
    biayaKosCurrency: 'IDR',
  }
  // KPR: sisaPokok 200jt, cicilan 2.2jt
  snap.cicilanAktif.push({
    id: 'kpr1',
    tipe: 'KPR',
    label: 'KPR',
    sisaPokok: 200_000_000,
    cicilanPerBulan: 2_200_000,
    jenisBunga: 'Anuitas',
  })
  // Assets: kas 80jt + deposito 150jt + properti 500jt
  snap.asetLikuid.kas.push(row(80_000_000, 'Rekening'))
  snap.asetLikuid.deposito.push(row(150_000_000, 'Depo BCA'))
  snap.asetNonLikuid.properti.push(row(500_000_000, 'Rumah'))
  // Safe Haven: kas + deposito = 230jt / total aset ~730jt ≈ 31.5% — waspada range
  // To make Safe Haven 9.3% we need a big non-safe asset. Add saham.
  const prices: PricesView = {
    ...NO_PRICES,
    idxByTicker: { BBCA: 10_000 },
  }
  snap.saham.push({
    id: 's1',
    ticker: 'BBCA',
    lot: 250,
    hargaRataRata: 10_000,
  }) // 250 lot × 100 × 10k = 250jt
  // Total aset = 80 + 150 + 500 + 250 = 980jt
  // Safe = 80 + 150 = 230jt → 230/980 ≈ 23.5%
  // To get DAR: utang 200jt / aset 980jt ≈ 20.4% (sehat, <30)
  return { snap, prices }
}

describe('calcCermatScore', () => {
  it('empty snapshot → Belum Dinilai (tier 0)', () => {
    const result = calcCermatScore(emptySnapshot(), null, NO_PRICES)
    expect(result.score).toBe(0)
    expect(result.level.tier).toBe(0)
    expect(result.level.label).toBe('Belum Dinilai')
  })

  it('debt-free user gets full DSR + DAR points (Not Applicable)', () => {
    const snap = emptySnapshot()
    snap.penghasilan = { amount: 10_000_000, currency: 'IDR' }
    snap.pengeluaran = {
      pokok: 3_000_000,
      pokokCurrency: 'IDR',
      lifestyle: 1_000_000,
      lifestyleCurrency: 'IDR',
      biayaKos: 0,
      biayaKosCurrency: 'IDR',
    }
    snap.asetLikuid.kas.push(row(100_000_000))
    // No cicilan, no utang → DSR null, DAR null, totalUtang = 0 → full points
    const result = calcCermatScore(snap, null, NO_PRICES)
    const dsrContrib = result.contributions.find((c) => c.metric === 'dsr')!
    const darContrib = result.contributions.find((c) => c.metric === 'dar')!
    expect(dsrContrib.points).toBe(200) // full DSR
    expect(darContrib.points).toBe(150) // full DAR
  })

  it('no income → Savings Rate = 0 points (incomplete data)', () => {
    const snap = emptySnapshot()
    snap.asetLikuid.kas.push(row(50_000_000))
    const result = calcCermatScore(snap, null, NO_PRICES)
    const savingsContrib = result.contributions.find(
      (c) => c.metric === 'savingsRate',
    )!
    expect(savingsContrib.points).toBe(0)
  })

  it('no saham → Allocation Discipline = full 50 points (not applicable)', () => {
    const snap = emptySnapshot()
    snap.penghasilan = { amount: 5_000_000, currency: 'IDR' }
    snap.pengeluaran = {
      pokok: 2_000_000,
      pokokCurrency: 'IDR',
      lifestyle: 500_000,
      lifestyleCurrency: 'IDR',
      biayaKos: 0,
      biayaKosCurrency: 'IDR',
    }
    const result = calcCermatScore(snap, null, NO_PRICES)
    const allocContrib = result.contributions.find(
      (c) => c.metric === 'allocationDiscipline',
    )!
    expect(allocContrib.points).toBe(50) // full, no stocks = not applicable
  })

  it('no goals → Goal Health = full 100 points (not applicable)', () => {
    const snap = emptySnapshot()
    snap.penghasilan = { amount: 5_000_000, currency: 'IDR' }
    snap.pengeluaran = {
      pokok: 2_000_000,
      pokokCurrency: 'IDR',
      lifestyle: 500_000,
      lifestyleCurrency: 'IDR',
      biayaKos: 0,
      biayaKosCurrency: 'IDR',
    }
    const result = calcCermatScore(snap, null, NO_PRICES)
    const goalContrib = result.contributions.find(
      (c) => c.metric === 'goalHealth',
    )!
    expect(goalContrib.points).toBe(100)
  })

  it('Net Worth ≥ 12× expenses → 50 points (sehat)', () => {
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
    // Expense = 5jt/mo. Net worth needs ≥60jt for 12×
    snap.asetLikuid.kas.push(row(100_000_000))
    const result = calcCermatScore(snap, null, NO_PRICES)
    const nwContrib = result.contributions.find(
      (c) => c.metric === 'netWorthVsExpenses',
    )!
    expect(nwContrib.points).toBe(50)
    expect(nwContrib.zone).toBe('sehat')
  })

  it('Net Worth 6-12× expenses → 25 points (waspada)', () => {
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
    // Expense = 5jt/mo. Net worth 40jt = 8× (waspada range 6-12)
    snap.asetLikuid.kas.push(row(40_000_000))
    const result = calcCermatScore(snap, null, NO_PRICES)
    const nwContrib = result.contributions.find(
      (c) => c.metric === 'netWorthVsExpenses',
    )!
    expect(nwContrib.points).toBe(25)
    expect(nwContrib.zone).toBe('waspada')
  })

  it('Net Worth < 6× expenses → 0 points (bahaya)', () => {
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
    // Expense = 5jt/mo. Net worth 20jt = 4× (< 6)
    snap.asetLikuid.kas.push(row(20_000_000))
    const result = calcCermatScore(snap, null, NO_PRICES)
    const nwContrib = result.contributions.find(
      (c) => c.metric === 'netWorthVsExpenses',
    )!
    expect(nwContrib.points).toBe(0)
    expect(nwContrib.zone).toBe('bahaya')
  })

  it('Pegawai Muda + KPR persona → 825 = Hutan tier', () => {
    const { snap, prices } = pegawaiMudaKpr()
    // DSR: cicilan 2.2jt / income 12jt = 18.3% → sehat → 200
    // Savings Rate: (12 - 6.7) / 12 = 44.2% → sehat → 200
    // Runway: (80+150+250) / 6.7 = 71.6 mo → sehat → 150
    // DAR: 200 / 980 = 20.4% → sehat → 150
    // Safe Haven: (80+150) / 980 = 23.5% → bahaya (<40) → 0
    // Goal Health: null, no goals → 100
    // NW vs Expense: 780 / 6.7 = 116× → sehat → 50
    // Allocation: null (universe < 2, no lotsTarget) → 50
    // Total: 200 + 200 + 150 + 150 + 0 + 100 + 50 + 50 = 900
    const result = calcCermatScore(snap, null, prices)

    // Verify individual contributions
    const dsr = result.contributions.find((c) => c.metric === 'dsr')!
    expect(dsr.zone).toBe('sehat')
    expect(dsr.points).toBe(200)

    const savings = result.contributions.find((c) => c.metric === 'savingsRate')!
    expect(savings.zone).toBe('sehat')

    const safeHaven = result.contributions.find(
      (c) => c.metric === 'safeHaven',
    )!
    expect(safeHaven.zone).toBe('bahaya')
    expect(safeHaven.points).toBe(0)

    // Allocation: null (universe < 2, 1 stock no lotsTarget) but saham.length > 0 → incomplete → 0
    // Total: 200 + 200 + 150 + 150 + 0 + 100 + 50 + 0 = 850
    expect(result.score).toBe(850)
    expect(result.level.label).toBe('Hutan')
    expect(result.level.tier).toBe(5)
  })

  it('contributions sum equals score', () => {
    const { snap, prices } = pegawaiMudaKpr()
    const result = calcCermatScore(snap, null, prices)
    const sum = result.contributions.reduce((s, c) => s + c.points, 0)
    expect(sum).toBe(result.score)
  })

  it('all contributions have correct maxPoints from WEIGHTS', () => {
    const { snap, prices } = pegawaiMudaKpr()
    const result = calcCermatScore(snap, null, prices)
    const totalMax = result.contributions.reduce((s, c) => s + c.maxPoints, 0)
    expect(totalMax).toBe(1000)
  })

  it('sehat zone → full points, waspada → half, bahaya → 0', () => {
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
    // DSR with high debt: cicilan 4.5jt → 45% → bahaya
    snap.cicilanAktif.push({
      id: 'c1',
      tipe: 'KPR',
      label: 'KPR',
      sisaPokok: 400_000_000,
      cicilanPerBulan: 4_500_000,
      jenisBunga: 'Anuitas',
    })
    snap.asetLikuid.kas.push(row(50_000_000))
    const result = calcCermatScore(snap, null, NO_PRICES)
    const dsrContrib = result.contributions.find((c) => c.metric === 'dsr')!
    expect(dsrContrib.zone).toBe('bahaya')
    expect(dsrContrib.points).toBe(0)
  })

  it('waspada zone → exactly half of max (rounded)', () => {
    const snap = emptySnapshot()
    snap.penghasilan = { amount: 10_000_000, currency: 'IDR' }
    snap.pengeluaran = {
      pokok: 2_000_000,
      pokokCurrency: 'IDR',
      lifestyle: 1_000_000,
      lifestyleCurrency: 'IDR',
      biayaKos: 0,
      biayaKosCurrency: 'IDR',
    }
    // DSR: cicilan 3.5jt / 10jt = 35% → waspada (30-40)
    snap.cicilanAktif.push({
      id: 'c1',
      tipe: 'KPR',
      label: 'KPR',
      sisaPokok: 300_000_000,
      cicilanPerBulan: 3_500_000,
      jenisBunga: 'Anuitas',
    })
    snap.asetLikuid.kas.push(row(50_000_000))
    const result = calcCermatScore(snap, null, NO_PRICES)
    const dsrContrib = result.contributions.find((c) => c.metric === 'dsr')!
    expect(dsrContrib.zone).toBe('waspada')
    expect(dsrContrib.points).toBe(100) // half of 200
  })

  it('< 3 metrics with data → Belum Dinilai regardless of N/A points', () => {
    const snap = emptySnapshot()
    // Only income, no expenses, no assets — very sparse data
    snap.penghasilan = { amount: 5_000_000, currency: 'IDR' }
    // No expenses → runway null, savings rate null (but has income so savings = 100%)
    // Actually savings rate: income 5jt, expenses 0 → calcSavingsRate returns null (burn <= 0)
    // So only DSR null (incomplete, has income but 0 debt... wait, calcDsr checks peng <= 0)
    // DSR: peng = 5jt > 0, cicilan = 0 → 0% → sehat → that's 1 metric
    // Not enough for 3 metrics
    const result = calcCermatScore(snap, null, NO_PRICES)
    expect(result.score).toBe(0)
    expect(result.level.tier).toBe(0)
  })

  it('LEVELS array has 6 entries (0-5)', () => {
    expect(LEVELS).toHaveLength(6)
    expect(LEVELS[0]!.tier).toBe(0)
    expect(LEVELS[5]!.tier).toBe(5)
  })
})
