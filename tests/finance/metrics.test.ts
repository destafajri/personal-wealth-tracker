import { describe, expect, it } from 'vitest'
import {
  calcAllocationDiscipline,
  calcDar,
  calcDsr,
  calcModalSiap,
  calcNetWorth,
  calcRunway,
  calcSafeHaven,
  calcSavingsRate,
  calcTotalAset,
  calcTotalUtang,
} from '~/lib/finance/metrics'
import { emptySnapshot, type SnapshotState } from '~/lib/types/snapshot'

function row(amount: number, label = 'x') {
  return { id: crypto.randomUUID(), label, amount }
}

function baseSnap(): SnapshotState {
  return emptySnapshot()
}

describe('calcTotalAset / calcTotalUtang / calcNetWorth', () => {
  it('aset = sum of likuid + non-likuid + emas (per-kategori total) + saham', () => {
    const s = baseSnap()
    s.asetLikuid.kas.push(row(10_000_000))
    s.asetLikuid.deposito.push(row(20_000_000))
    s.asetNonLikuid.properti.push(row(1_000_000_000))
    // emas.fisikAntamGram = 60 (TOTAL owned, including the 10g pawned below)
    // 60 × 2_000_000 × 0.93 = 111_600_000
    s.emas.fisikAntamGram = 60
    s.gadai.push({
      id: 'g1',
      label: 'Pegadaian',
      jaminan: 'emas:fisikAntam',
      gramTertahan: 10, // 10 of the 60 fisik grams are currently pawned
      piutangIdr: 0,
      bungaPerBulanPercent: 1.5,
      tempoBulan: 4,
    })
    s.saham.push({ id: '1', ticker: 'BBCA', lot: 10, hargaRataRata: 9_000 })
    const prices = {
      goldDigitalIdrPerGram: 1_200_000,
      goldAntam1gIdr: 2_000_000,
      fxRates: { USD: null, SGD: null, EUR: null, JPY: null, KRW: null },
      idxByTicker: { BBCA: 10_000 },
    }
    // 30jt likuid + 1mlrd properti + 111.6jt fisik + 10jt saham
    expect(calcTotalAset(s, prices)).toBe(
      30_000_000 + 1_000_000_000 + 111_600_000 + 10_000_000,
    )
  })

  it('utang = Σ sisa_pokok + Σ gadai.piutang (multi-row)', () => {
    const s = baseSnap()
    s.cicilanAktif.push({
      id: '1',
      tipe: 'KPR',
      label: 'KPR',
      sisaPokok: 400_000_000,
      cicilanPerBulan: 4_000_000,
      jenisBunga: 'Anuitas',
    })
    s.gadai.push(
      {
        id: 'g1',
        label: 'Pegadaian-1',
        jaminan: 'emas:fisikAntam',
        gramTertahan: 30,
        piutangIdr: 15_000_000,
        bungaPerBulanPercent: 1.5,
        tempoBulan: 4,
      },
      {
        id: 'g2',
        label: 'Pegadaian-2',
        jaminan: 'emas:perhiasan18K',
        gramTertahan: 5,
        piutangIdr: 2_000_000,
        bungaPerBulanPercent: 1.5,
        tempoBulan: 4,
      },
    )
    expect(calcTotalUtang(s)).toBe(400_000_000 + 15_000_000 + 2_000_000)
  })

  it('net worth can be negative', () => {
    const s = baseSnap()
    s.cicilanAktif.push({
      id: '1',
      tipe: 'KK',
      label: 'KK',
      sisaPokok: 50_000_000,
      cicilanPerBulan: 2_000_000,
      jenisBunga: 'Revolving',
    })
    expect(calcNetWorth(s)).toBe(-50_000_000)
  })
})

describe('calcModalSiap (D0.3: advisory only, no auto-subtract)', () => {
  it('= Kas + Deposito + RD + Crypto Liquid (no SBN, no auto buffer)', () => {
    const s = baseSnap()
    s.asetLikuid.kas.push(row(20_000_000))
    s.asetLikuid.deposito.push(row(10_000_000))
    s.asetLikuid.reksaDana.push(row(15_000_000))
    s.asetLikuid.sbn.push(row(50_000_000)) // intentionally excluded per PRD §5.4 #9
    s.asetLikuid.cryptoManual.push(row(5_000_000))
    s.pengeluaran = { pokok: 10_000_000, lifestyle: 5_000_000 }
    // Should NOT subtract 6 × pengeluaran (= 90jt). Pure sum:
    expect(calcModalSiap(s)).toBe(50_000_000)
  })
})

describe('calcDsr (per-metric empty rule)', () => {
  it('returns null when penghasilan = 0', () => {
    expect(calcDsr(baseSnap())).toBeNull()
  })

  it('returns Σ cicilan / penghasilan × 100 when penghasilan > 0', () => {
    const s = baseSnap()
    s.penghasilan = 18_000_000
    s.cicilanAktif.push({
      id: '1',
      tipe: 'KPR',
      label: 'KPR',
      sisaPokok: 400_000_000,
      cicilanPerBulan: 4_500_000,
      jenisBunga: 'Anuitas',
    })
    s.cicilanAktif.push({
      id: '2',
      tipe: 'KK',
      label: 'KK',
      sisaPokok: 5_000_000,
      cicilanPerBulan: 1_500_000,
      jenisBunga: 'Revolving',
    })
    expect(calcDsr(s)).toBeCloseTo((6_000_000 / 18_000_000) * 100, 6)
  })
})

describe('calcDar', () => {
  it('returns null when aset = 0', () => {
    expect(calcDar(baseSnap())).toBeNull()
  })

  it('= utang / aset × 100', () => {
    const s = baseSnap()
    s.asetLikuid.kas.push(row(100_000_000))
    s.cicilanAktif.push({
      id: '1',
      tipe: 'KPR',
      label: 'KPR',
      sisaPokok: 40_000_000,
      cicilanPerBulan: 1_000_000,
      jenisBunga: 'Anuitas',
    })
    expect(calcDar(s)).toBeCloseTo(40, 6)
  })
})

describe('calcRunway', () => {
  it('returns null when total burn = 0', () => {
    const s = baseSnap()
    s.asetLikuid.kas.push(row(10_000_000))
    expect(calcRunway(s)).toBeNull()
  })

  it('= cash-like / total burn (months); burn includes cicilan', () => {
    const s = baseSnap()
    s.asetLikuid.kas.push(row(60_000_000))
    s.pengeluaran = { pokok: 5_000_000, lifestyle: 2_000_000 }
    s.cicilanAktif.push({
      id: '1',
      tipe: 'KPR',
      label: 'KPR',
      sisaPokok: 0,
      cicilanPerBulan: 3_000_000,
      jenisBunga: 'Anuitas',
    })
    // burn = 5 + 2 + 3 = 10jt; runway = 60/10 = 6
    expect(calcRunway(s)).toBeCloseTo(6, 6)
  })

  it('excludes tertahan gold from liquid (cant tebus instantly without piutang settle)', () => {
    const s = baseSnap()
    // 100g fisik total owned; 50 of them are pawned in the gadai below → 50g at home.
    s.emas.fisikAntamGram = 100
    s.gadai.push({
      id: 'g1',
      label: 'Pegadaian',
      jaminan: 'emas:fisikAntam',
      gramTertahan: 50,
      piutangIdr: 0,
      bungaPerBulanPercent: 1.5,
      tempoBulan: 4,
    })
    s.pengeluaran = { pokok: 1_000_000, lifestyle: 0 }
    const prices = {
      goldDigitalIdrPerGram: 0,
      goldAntam1gIdr: 1_000_000,
      fxRates: { USD: null, SGD: null, EUR: null, JPY: null, KRW: null },
      idxByTicker: {},
    }
    // at-home = 50g; 50 × 1jt × 0.93 = 46.5jt; runway = 46.5
    expect(calcRunway(s, prices)).toBeCloseTo(46.5, 6)
  })
})

describe('calcSavingsRate', () => {
  it('returns null when penghasilan = 0', () => {
    expect(calcSavingsRate(baseSnap())).toBeNull()
  })

  it('= (penghasilan − totalPengeluaran) / penghasilan × 100', () => {
    const s = baseSnap()
    s.penghasilan = 20_000_000
    s.pengeluaran = { pokok: 8_000_000, lifestyle: 4_000_000 }
    s.cicilanAktif.push({
      id: '1',
      tipe: 'KPR',
      label: 'KPR',
      sisaPokok: 0,
      cicilanPerBulan: 4_000_000,
      jenisBunga: 'Anuitas',
    })
    // burn = 16jt; (20-16)/20 = 20%
    expect(calcSavingsRate(s)).toBeCloseTo(20, 6)
  })

  it('can be negative when burn > penghasilan', () => {
    const s = baseSnap()
    s.penghasilan = 10_000_000
    s.pengeluaran = { pokok: 12_000_000, lifestyle: 0 }
    expect(calcSavingsRate(s)).toBeCloseTo(-20, 6)
  })
})

describe('calcSafeHaven', () => {
  it('returns null when no aset', () => {
    expect(calcSafeHaven(baseSnap())).toBeNull()
  })

  it('= (Kas + Emas + RD + Deposito) / Total Aset × 100', () => {
    const s = baseSnap()
    s.asetLikuid.kas.push(row(10_000_000))
    s.asetLikuid.deposito.push(row(20_000_000))
    s.asetLikuid.reksaDana.push(row(10_000_000))
    s.emas.digitalGram = 10 // 10jt at 1jt/gram (digital uses goldDigitalIdrPerGram directly)
    s.asetNonLikuid.properti.push(row(50_000_000))
    const prices = {
      goldDigitalIdrPerGram: 1_000_000,
      goldAntam1gIdr: 0,
      fxRates: { USD: null, SGD: null, EUR: null, JPY: null, KRW: null },
      idxByTicker: {},
    }
    // aset = 40jt likuid + 10jt emas + 50jt properti = 100jt; safe haven = 10+20+10+10 = 50jt → 50%
    expect(calcSafeHaven(s, prices)).toBeCloseTo(50, 6)
  })
})

describe('calcAllocationDiscipline', () => {
  it('returns null when no stocks', () => {
    expect(calcAllocationDiscipline([])).toBeNull()
  })

  it('returns null when no stock has a target bobot set', () => {
    expect(
      calcAllocationDiscipline([
        { id: '1', ticker: 'BBCA', lot: 10, hargaRataRata: 10_000 },
      ]),
    ).toBeNull()
  })

  it('= avg |live − target| pp across stocks-with-target', () => {
    // BBCA: 50jt (50% live), target 60 → drift 10
    // BBRI: 50jt (50% live), target 40 → drift 10
    // avg = 10 pp
    const stocks = [
      {
        id: '1',
        ticker: 'BBCA',
        lot: 50,
        hargaRataRata: 10_000,
        bobotTargetPercent: 60,
      },
      {
        id: '2',
        ticker: 'BBRI',
        lot: 50,
        hargaRataRata: 10_000,
        bobotTargetPercent: 40,
      },
    ]
    expect(calcAllocationDiscipline(stocks)).toBeCloseTo(10, 6)
  })
})
