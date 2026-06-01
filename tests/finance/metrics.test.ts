import { describe, expect, it } from 'vitest'
import {
  calcAllocationDiscipline,
  calcAssetBreakdown,
  calcBungaDepositoMonthly,
  calcBungaSbnMonthly,
  calcDar,
  calcDsr,
  calcModalSiap,
  calcNetWorth,
  calcPotentialDividendIdr,
  calcRunway,
  calcSafeHaven,
  calcSavingsRate,
  calcTotalAset,
  calcTotalDividendAnnual,
  calcTotalUtang,
  effectiveStockPrice,
  gajiBersihIdr,
} from '~/lib/finance/metrics'
import { emptySnapshot, type PricesView, type SnapshotState } from '~/lib/types/snapshot'

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
    // 60 × 2_000_000 × 0.897 = 107_640_000
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
      cryptoByCoinId: {} as Record<
        string,
        { idr: number | null; usd: number | null; eur: number | null; jpy: number | null; krw: number | null }
      >,
    }
    // 30jt likuid + 1mlrd properti + 107.64jt fisik + 10jt saham
    expect(calcTotalAset(s, prices)).toBe(
      30_000_000 + 1_000_000_000 + 107_640_000 + 10_000_000,
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
    // IDR-mode crypto row — escape hatch for coins not on CoinGecko.
    s.crypto.push({
      id: 'c0',
      coinId: 'dogecoin',
      mode: 'idr',
      units: 0,
      amount: 5_000_000,
    })
    s.pengeluaran = { pokok: 10_000_000, lifestyle: 5_000_000 }
    // Should NOT subtract 6 × pengeluaran (= 90jt). Pure sum:
    expect(calcModalSiap(s)).toBe(50_000_000)
  })

  it('includes live crypto holdings (units × cryptoByCoinId.idr)', () => {
    const s = baseSnap()
    s.asetLikuid.kas.push(row(10_000_000))
    s.crypto.push({
      id: 'c1',
      coinId: 'bitcoin',
      mode: 'unit',
      units: 0.5,
      amount: 0,
    })
    s.crypto.push({
      id: 'c2',
      coinId: 'ethereum',
      mode: 'unit',
      units: 2,
      amount: 0,
    })
    const prices = {
      goldDigitalIdrPerGram: null,
      goldAntam1gIdr: null,
      fxRates: { USD: null, SGD: null, EUR: null, JPY: null, KRW: null },
      idxByTicker: {},
      cryptoByCoinId: {
        bitcoin: {
          idr: 1_500_000_000,
          usd: 95_000,
          eur: 88_000,
          jpy: 14_500_000,
          krw: 125_000_000,
        },
        ethereum: {
          idr: 50_000_000,
          usd: 3200,
          eur: 2950,
          jpy: 480_000,
          krw: 4_200_000,
        },
      },
    }
    // 10jt kas + 0.5 × 1.5mlrd + 2 × 50jt = 10jt + 750jt + 100jt = 860jt
    expect(calcModalSiap(s, prices)).toBe(10_000_000 + 750_000_000 + 100_000_000)
  })

  it('skips live crypto with missing / stale rate (graceful degrade)', () => {
    const s = baseSnap()
    s.asetLikuid.kas.push(row(10_000_000))
    s.crypto.push({
      id: 'c1',
      coinId: 'bitcoin',
      mode: 'unit',
      units: 0.5,
      amount: 0,
    })
    s.crypto.push({
      id: 'c2',
      coinId: 'nosuch',
      mode: 'unit',
      units: 1000,
      amount: 0,
    })
    const prices = {
      goldDigitalIdrPerGram: null,
      goldAntam1gIdr: null,
      fxRates: { USD: null, SGD: null, EUR: null, JPY: null, KRW: null },
      idxByTicker: {},
      cryptoByCoinId: {
        bitcoin: {
          idr: 1_500_000_000,
          usd: 95_000,
          eur: 88_000,
          jpy: 14_500_000,
          krw: 125_000_000,
        },
        nosuch: { idr: null, usd: null, eur: null, jpy: null, krw: null },
      },
    }
    expect(calcModalSiap(s, prices)).toBe(10_000_000 + 750_000_000)
  })

  it('IDR-mode crypto uses amount regardless of coinId or live rate', () => {
    const s = baseSnap()
    s.crypto.push({
      id: 'c1',
      coinId: 'dogecoin',
      mode: 'idr',
      units: 9999, // ignored when mode='idr'
      amount: 7_500_000,
    })
    const prices = {
      goldDigitalIdrPerGram: null,
      goldAntam1gIdr: null,
      fxRates: { USD: null, SGD: null, EUR: null, JPY: null, KRW: null },
      idxByTicker: {},
      cryptoByCoinId: {
        dogecoin: { idr: 2000, usd: 0.12, eur: 0.11, jpy: 17, krw: 160 },
      },
    }
    expect(calcModalSiap(s, prices)).toBe(7_500_000)
  })

  it('USD-mode crypto = amount × fxRates.USD; KRW-mode = amount × fxRates.KRW', () => {
    const s = baseSnap()
    s.crypto.push({
      id: 'c1',
      coinId: 'bitcoin',
      mode: 'usd',
      units: 0,
      amount: 100, // $100 worth of BTC
    })
    s.crypto.push({
      id: 'c2',
      coinId: 'ripple',
      mode: 'krw',
      units: 0,
      amount: 1_000_000, // ₩1M worth of XRP
    })
    const prices = {
      goldDigitalIdrPerGram: null,
      goldAntam1gIdr: null,
      fxRates: { USD: 16_000, SGD: null, EUR: null, JPY: null, KRW: 12 },
      idxByTicker: {},
      cryptoByCoinId: {
        // Live rates are irrelevant here — mode='usd'/'krw' uses fxRates, not coin rate.
        bitcoin: { idr: 1, usd: 1, eur: null, jpy: null, krw: null },
      },
    }
    // $100 × 16_000 IDR/USD = 1.6jt; ₩1M × 12 IDR/KRW = 12jt. Sum = 13.6jt
    expect(calcModalSiap(s, prices)).toBe(100 * 16_000 + 1_000_000 * 12)
  })

  it('USD/KRW-mode skipped when their FX rate is missing', () => {
    const s = baseSnap()
    s.crypto.push({
      id: 'c1',
      coinId: 'bitcoin',
      mode: 'usd',
      units: 0,
      amount: 100,
    })
    const prices = {
      goldDigitalIdrPerGram: null,
      goldAntam1gIdr: null,
      // USD fx missing → row contributes 0 (UI separately shows "kurs FX belum kebaca").
      fxRates: { USD: null, SGD: null, EUR: null, JPY: null, KRW: null },
      idxByTicker: {},
      cryptoByCoinId: {} as Record<
        string,
        { idr: number | null; usd: number | null; eur: number | null; jpy: number | null; krw: number | null }
      >,
    }
    expect(calcModalSiap(s, prices)).toBe(0)
  })
})

describe('calcDsr (per-metric empty rule)', () => {
  it('returns null when penghasilan = 0', () => {
    expect(calcDsr(baseSnap())).toBeNull()
  })

  it('returns Σ cicilan / penghasilan × 100 when penghasilan > 0', () => {
    const s = baseSnap()
    s.penghasilan = { amount: 18_000_000, currency: 'IDR' }
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
      cryptoByCoinId: {} as Record<
        string,
        { idr: number | null; usd: number | null; eur: number | null; jpy: number | null; krw: number | null }
      >,
    }
    // at-home = 50g; 50 × 1jt × 0.897 = 44.85jt; runway = 44.85
    expect(calcRunway(s, prices)).toBeCloseTo(44.85, 6)
  })
})

describe('calcSavingsRate', () => {
  it('returns null when penghasilan = 0', () => {
    expect(calcSavingsRate(baseSnap())).toBeNull()
  })

  it('= (penghasilan − totalPengeluaran) / penghasilan × 100', () => {
    const s = baseSnap()
    s.penghasilan = { amount: 20_000_000, currency: 'IDR' }
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
    s.penghasilan = { amount: 10_000_000, currency: 'IDR' }
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
      cryptoByCoinId: {} as Record<
        string,
        { idr: number | null; usd: number | null; eur: number | null; jpy: number | null; krw: number | null }
      >,
    }
    // aset = 40jt likuid + 10jt emas + 50jt properti = 100jt; safe haven = 10+20+10+10 = 50jt → 50%
    expect(calcSafeHaven(s, prices)).toBeCloseTo(50, 6)
  })
})

describe('calcPotentialDividendIdr', () => {
  const baseStock = {
    id: '1',
    ticker: 'BBCA',
    lot: 162,
    hargaRataRata: 9_000,
  }

  it('returns 0 when neither lastDividend nor yield is set', () => {
    expect(calcPotentialDividendIdr(baseStock, 10_000)).toBe(0)
  })

  it('uses lastDividendPerLembar literal when set: lot × 100 × lastDiv', () => {
    // 162 lot × 100 × 225 = 3_645_000 (matches Stitch example)
    expect(
      calcPotentialDividendIdr(
        { ...baseStock, lastDividendPerLembar: 225 },
        10_000,
      ),
    ).toBe(3_645_000)
  })

  it('uses yield % × valuasi when lastDividend missing', () => {
    // valuasi = 162 × 100 × 10_000 = 162_000_000; 4% yield → 6_480_000
    expect(
      calcPotentialDividendIdr(
        { ...baseStock, avgDividendYieldPercent: 4 },
        10_000,
      ),
    ).toBeCloseTo(6_480_000, 6)
  })

  it('lastDividend literal wins over yield % when both set', () => {
    expect(
      calcPotentialDividendIdr(
        { ...baseStock, lastDividendPerLembar: 225, avgDividendYieldPercent: 4 },
        10_000,
      ),
    ).toBe(3_645_000)
  })

  it('yield path uses effectiveStockPrice (override > live > cost basis)', () => {
    // override 12_000 → valuasi 162 × 100 × 12_000 = 194_400_000; 4% = 7_776_000
    expect(
      calcPotentialDividendIdr(
        { ...baseStock, hargaOverride: 12_000, avgDividendYieldPercent: 4 },
        10_000, // live ignored due to override
      ),
    ).toBeCloseTo(7_776_000, 6)
  })
})

describe('calcTotalDividendAnnual + DSR/SavingsRate integration', () => {
  it('sums per-row dividends across stocks', () => {
    const stocks = [
      { id: '1', ticker: 'BBCA', lot: 162, hargaRataRata: 9_000, lastDividendPerLembar: 225 }, // 3_645_000
      { id: '2', ticker: 'BBRI', lot: 100, hargaRataRata: 4_000, lastDividendPerLembar: 150 }, // 1_500_000
    ]
    expect(calcTotalDividendAnnual(stocks)).toBe(5_145_000)
  })

  it('dividend flows into calcDsr (denominator grows → ratio shrinks)', () => {
    const s = baseSnap()
    s.penghasilan = { amount: 10_000_000, currency: 'IDR' }
    s.cicilanAktif.push({
      id: 'c1',
      tipe: 'KPR',
      label: 'KPR',
      sisaPokok: 100_000_000,
      cicilanPerBulan: 4_000_000,
      jenisBunga: 'Flat',
      sukuBunga: 5,
      tenorSisaBulan: 60,
    })
    // Without dividend: DSR = 4jt / 10jt = 40%
    expect(calcDsr(s)).toBeCloseTo(40, 6)
    // Add dividend: 1jt/bulan (12jt/tahun). Total penghasilan = 11jt. DSR = 4/11 ≈ 36.36%
    s.saham.push({
      id: 's1',
      ticker: 'BBCA',
      lot: 100,
      hargaRataRata: 9_000,
      lastDividendPerLembar: 1_200, // 100 × 100 × 1_200 = 12_000_000/tahun = 1_000_000/bulan
    })
    expect(calcDsr(s)).toBeCloseTo((4_000_000 / 11_000_000) * 100, 4)
  })

  it('dividend flows into calcSavingsRate (denominator + numerator both adjust)', () => {
    const s = baseSnap()
    s.penghasilan = { amount: 10_000_000, currency: 'IDR' }
    s.pengeluaran.pokok = 6_000_000
    // Without dividend: (10 − 6)/10 = 40%
    expect(calcSavingsRate(s)).toBeCloseTo(40, 6)
    s.saham.push({
      id: 's1',
      ticker: 'BBCA',
      lot: 100,
      hargaRataRata: 9_000,
      lastDividendPerLembar: 1_200, // +1jt/bulan
    })
    // With dividend: (11 − 6)/11 ≈ 45.45%
    expect(calcSavingsRate(s)).toBeCloseTo((5_000_000 / 11_000_000) * 100, 4)
  })
})

describe('calcAssetBreakdown', () => {
  it('totalIdr === 0 when snapshot is empty', () => {
    const b = calcAssetBreakdown(baseSnap())
    expect(b.safeIdr).toBe(0)
    expect(b.totalIdr).toBe(0)
  })

  it('safeIdr = kas + deposito + reksaDana + emas (per Safe Haven formula)', () => {
    const s = baseSnap()
    s.asetLikuid.kas.push(row(10_000_000))
    s.asetLikuid.deposito.push(row(20_000_000))
    s.asetLikuid.reksaDana.push(row(30_000_000))
    s.asetLikuid.sbn.push(row(40_000_000)) // SBN is NOT in safe haven
    // emas: skip — totalGoldIdr requires prices; test the no-emas path here
    const b = calcAssetBreakdown(s)
    expect(b.safeIdr).toBe(60_000_000)
    // total = 60jt safe + 40jt sbn = 100jt
    expect(b.totalIdr).toBe(100_000_000)
  })
})

describe('effectiveStockPrice', () => {
  const baseStock = {
    id: '1',
    ticker: 'BBCA',
    lot: 1,
    hargaRataRata: 5_000,
  }

  it('uses hargaOverride when set (live + cost basis ignored)', () => {
    expect(
      effectiveStockPrice({ ...baseStock, hargaOverride: 9_000 }, 7_000),
    ).toBe(9_000)
  })

  it('falls back to live price when override is missing', () => {
    expect(effectiveStockPrice(baseStock, 7_000)).toBe(7_000)
  })

  it('falls back to cost basis when both override and live are missing', () => {
    expect(effectiveStockPrice(baseStock, null)).toBe(5_000)
  })
})

describe('calcAllocationDiscipline', () => {
  it('returns null when no stocks', () => {
    expect(calcAllocationDiscipline([])).toBeNull()
  })

  it('returns null when no stock has a lots target set', () => {
    expect(
      calcAllocationDiscipline([
        { id: '1', ticker: 'BBCA', lot: 10, hargaRataRata: 10_000 },
      ]),
    ).toBeNull()
  })

  it('= avg |live_bobot − target_bobot_derived| within lots-target universe', () => {
    // BBCA: lot 50, lots_target 60, price 10_000 → live 50jt, target 60jt
    // BBRI: lot 50, lots_target 40, price 10_000 → live 50jt, target 40jt
    // Universe: totalLive 100jt, totalTarget 100jt.
    // BBCA: live_bobot 50%, target_bobot 60% → drift 10
    // BBRI: live_bobot 50%, target_bobot 40% → drift 10
    // avg = 10 pp
    const stocks = [
      { id: '1', ticker: 'BBCA', lot: 50, hargaRataRata: 10_000, lotsTarget: 60 },
      { id: '2', ticker: 'BBRI', lot: 50, hargaRataRata: 10_000, lotsTarget: 40 },
    ]
    expect(calcAllocationDiscipline(stocks)).toBeCloseTo(10, 6)
  })

  it('returns null when only one stock has lots target (universe of 1 is not meaningful)', () => {
    // BBCA in universe (lots = target), BBRI excluded (no target).
    // Universe collapses to 1 member → composition drift is undefined (single-member
    // bobot is always 100% by definition). Return null so the UI shows the empty-state
    // hint instead of a misleading "0pp Tight" green.
    const stocks = [
      { id: '1', ticker: 'BBCA', lot: 50, hargaRataRata: 10_000, lotsTarget: 50 },
      { id: '2', ticker: 'BBRI', lot: 50, hargaRataRata: 10_000 },
    ]
    expect(calcAllocationDiscipline(stocks)).toBeNull()
  })

  it('excludes rows without lots target while keeping ≥2 in universe', () => {
    // BBCA + BBRI in universe (both have target), TLKM excluded (no target).
    // Universe size 2, math same as the canonical 2-stock case.
    const stocks = [
      { id: '1', ticker: 'BBCA', lot: 50, hargaRataRata: 10_000, lotsTarget: 60 },
      { id: '2', ticker: 'BBRI', lot: 50, hargaRataRata: 10_000, lotsTarget: 40 },
      { id: '3', ticker: 'TLKM', lot: 50, hargaRataRata: 10_000 },
    ]
    expect(calcAllocationDiscipline(stocks)).toBeCloseTo(10, 6)
  })

  it('hargaOverride feeds calcNetWorth (not just Allocation Discipline)', () => {
    // Regression for Codex round-8 #1: prior to extracting `effectiveStockPrice`,
    // sumStockIdr ignored hargaOverride so card display and dashboard total disagreed.
    const s = baseSnap()
    s.saham.push({
      id: '1',
      ticker: 'BBCA',
      lot: 10, // 10 × 100 = 1_000 lembar
      hargaRataRata: 5_000,
      hargaOverride: 12_000, // override → 12_000 × 1_000 = 12_000_000
    })
    const prices: PricesView = {
      goldDigitalIdrPerGram: null,
      goldAntam1gIdr: null,
      fxRates: { USD: null, SGD: null, EUR: null, JPY: null, KRW: null },
      idxByTicker: { BBCA: 8_000 }, // live ignored due to override
      cryptoByCoinId: {},
    }
    expect(calcTotalAset(s, prices)).toBe(12_000_000)
    expect(calcNetWorth(s, prices)).toBe(12_000_000)
  })

  it('hargaOverride feeds calcAllocationDiscipline (target_idr uses effective price)', () => {
    // BBCA: lot 50, lots_target 100, hargaOverride 20_000 → live 100jt, target 200jt
    // BBRI: lot 100, lots_target 100, no override, cost basis 5_000 → live 50jt, target 50jt
    // (no live price in PricesView for BBRI → falls through to cost basis)
    // Universe totals: live 150jt, target 250jt
    // BBCA: live_bobot 100/150 = 66.67%, target_bobot 200/250 = 80% → drift 13.33
    // BBRI: live_bobot 50/150 = 33.33%, target_bobot 50/250 = 20% → drift 13.33
    // avg ≈ 13.33 pp
    const stocks = [
      {
        id: '1',
        ticker: 'BBCA',
        lot: 50,
        hargaRataRata: 5_000,
        lotsTarget: 100,
        hargaOverride: 20_000, // overrides whatever live says
      },
      {
        id: '2',
        ticker: 'BBRI',
        lot: 100,
        hargaRataRata: 5_000,
        lotsTarget: 100,
      },
    ]
    const prices: PricesView = {
      goldDigitalIdrPerGram: null,
      goldAntam1gIdr: null,
      fxRates: { USD: null, SGD: null, EUR: null, JPY: null, KRW: null },
      idxByTicker: { BBCA: 99_999 }, // BBCA live ignored due to override
      cryptoByCoinId: {},
    }
    expect(calcAllocationDiscipline(stocks, prices)).toBeCloseTo(40 / 3, 4)
  })
})

describe('gajiBersihIdr (currency-aware penghasilan)', () => {
  it('IDR returns amount as-is', () => {
    const s = baseSnap()
    s.penghasilan = { amount: 15_000_000, currency: 'IDR' }
    expect(gajiBersihIdr(s)).toBe(15_000_000)
  })

  it('USD converts via fxRates.USD', () => {
    const s = baseSnap()
    s.penghasilan = { amount: 1_000, currency: 'USD' }
    const prices: PricesView = {
      goldDigitalIdrPerGram: null,
      goldAntam1gIdr: null,
      fxRates: { USD: 16_200, SGD: null, EUR: null, JPY: null, KRW: null },
      idxByTicker: {},
      cryptoByCoinId: {},
    }
    expect(gajiBersihIdr(s, prices)).toBe(16_200_000)
  })

  it('returns 0 when foreign currency rate is stale (matches asset-side behavior)', () => {
    const s = baseSnap()
    s.penghasilan = { amount: 1_000, currency: 'USD' }
    // No prices supplied → no fxRates → falls through to 0
    expect(gajiBersihIdr(s)).toBe(0)
  })
})

describe('calcBungaSbnMonthly + calcBungaDepositoMonthly', () => {
  it('returns 0 when no rows have sukuBunga', () => {
    const s = baseSnap()
    s.asetLikuid.sbn.push(row(100_000_000)) // no sukuBunga
    s.asetLikuid.deposito.push(row(50_000_000))
    expect(calcBungaSbnMonthly(s)).toBe(0)
    expect(calcBungaDepositoMonthly(s)).toBe(0)
  })

  it('= principal × (sukuBunga/100) / 12 per row, summed', () => {
    const s = baseSnap()
    // SBN: 100jt @ 6.5% → 6.5jt/tahun → 541_666.67/bulan
    s.asetLikuid.sbn.push({
      id: 'sbn1',
      label: 'ORI',
      amount: 100_000_000,
      sukuBungaPercent: 6.5,
    })
    // Deposito: 50jt @ 4% → 2jt/tahun → 166_666.67/bulan
    s.asetLikuid.deposito.push({
      id: 'd1',
      label: 'BCA',
      amount: 50_000_000,
      sukuBungaPercent: 4,
    })
    expect(calcBungaSbnMonthly(s)).toBeCloseTo(541_666.67, 0)
    expect(calcBungaDepositoMonthly(s)).toBeCloseTo(166_666.67, 0)
  })

  it('foreign-currency principal converts via fxRates before applying rate', () => {
    const s = baseSnap()
    // 1_000 USD @ 4% with USD rate 16_200 → principal IDR 16_200_000 → 648_000/tahun → 54_000/bulan
    s.asetLikuid.deposito.push({
      id: 'd1',
      label: 'USD Deposito',
      amount: 1_000,
      currency: 'USD',
      sukuBungaPercent: 4,
    })
    const prices: PricesView = {
      goldDigitalIdrPerGram: null,
      goldAntam1gIdr: null,
      fxRates: { USD: 16_200, SGD: null, EUR: null, JPY: null, KRW: null },
      idxByTicker: {},
      cryptoByCoinId: {},
    }
    expect(calcBungaDepositoMonthly(s, prices)).toBeCloseTo(54_000, 0)
  })

  it('bunga flows into calcDsr (penghasilan denominator grows)', () => {
    const s = baseSnap()
    s.penghasilan = { amount: 10_000_000, currency: 'IDR' }
    s.cicilanAktif.push({
      id: 'c1',
      tipe: 'KPR',
      label: 'KPR',
      sisaPokok: 100_000_000,
      cicilanPerBulan: 4_000_000,
      jenisBunga: 'Flat',
    })
    // Without bunga: DSR = 4/10 = 40%
    expect(calcDsr(s)).toBeCloseTo(40, 6)
    // Add SBN 100jt @ 12% → 1jt/bulan; total penghasilan = 11jt; DSR = 4/11 ≈ 36.36%
    s.asetLikuid.sbn.push({
      id: 'sbn1',
      label: 'ORI',
      amount: 100_000_000,
      sukuBungaPercent: 12,
    })
    expect(calcDsr(s)).toBeCloseTo((4_000_000 / 11_000_000) * 100, 4)
  })
})

describe('multi-row penghasilanLain', () => {
  it('sums all rows into DSR denominator', () => {
    const s = baseSnap()
    s.penghasilan = { amount: 10_000_000, currency: 'IDR' }
    s.penghasilanLain = [
      { id: 'l1', label: 'Sewa', amount: 3_000_000 },
      { id: 'l2', label: 'Freelance', amount: 2_000_000 },
    ]
    s.cicilanAktif.push({
      id: 'c1',
      tipe: 'KPR',
      label: 'KPR',
      sisaPokok: 0,
      cicilanPerBulan: 5_000_000,
      jenisBunga: 'Anuitas',
    })
    // total penghasilan = 10 + 5 = 15jt; DSR = 5/15 ≈ 33.33%
    expect(calcDsr(s)).toBeCloseTo((5_000_000 / 15_000_000) * 100, 4)
  })

  it('foreign-currency lain row converts via fxRates', () => {
    const s = baseSnap()
    s.penghasilan = { amount: 0, currency: 'IDR' }
    s.penghasilanLain = [
      { id: 'l1', label: 'Konsultasi remote', amount: 500, currency: 'USD' },
    ]
    s.pengeluaran.pokok = 4_000_000
    const prices: PricesView = {
      goldDigitalIdrPerGram: null,
      goldAntam1gIdr: null,
      fxRates: { USD: 16_200, SGD: null, EUR: null, JPY: null, KRW: null },
      idxByTicker: {},
      cryptoByCoinId: {},
    }
    // penghasilan = 500 × 16_200 = 8.1jt; SR = (8.1 − 4)/8.1 ≈ 50.6%
    expect(calcSavingsRate(s, prices)).toBeCloseTo(((8_100_000 - 4_000_000) / 8_100_000) * 100, 4)
  })
})
