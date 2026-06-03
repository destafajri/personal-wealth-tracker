import { describe, expect, it } from 'vitest'
import {
  computeCicil,
  runMauCicil,
  type CicilInput,
} from '~/lib/finance/sims/mau-cicil'
import { emptySnapshot, type PricesView, type SnapshotState } from '~/lib/types/snapshot'

function emptyPrices(): PricesView {
  return {
    goldDigitalIdrPerGram: null,
    goldAntam1gIdr: null,
    fxRates: { USD: null, SGD: null, EUR: null, JPY: null, KRW: null },
    idxByTicker: {},
    cryptoByCoinId: {},
  }
}

function baseInput(): CicilInput {
  return {
    label: 'Motor Honda',
    tipe: 'KPM',
    hargaBarang: 30_000_000,
    dpPercent: 20,
    tenorBulan: 36,
    bungaPercent: 7,
    jenisBunga: 'Anuitas',
  }
}

function richSnap(): SnapshotState {
  const s = emptySnapshot()
  s.penghasilan = { amount: 15_000_000, currency: 'IDR' }
  s.pengeluaran = { pokok: 5_000_000, lifestyle: 0 }
  s.asetLikuid.kas.push({ id: 'k1', label: 'BCA', amount: 50_000_000 })
  return s
}

describe('computeCicil', () => {
  it('DP / pokok / tenor math is sane', () => {
    const c = computeCicil(baseInput())
    expect(c.dpIdr).toBe(6_000_000) // 30jt × 20%
    expect(c.pokokPinjaman).toBe(24_000_000)
    expect(c.tenorBulan).toBe(36)
    expect(c.cicilanPerBulan).toBeGreaterThan(700_000)
    expect(c.cicilanPerBulan).toBeLessThan(800_000)
  })

  it('Flat jenisBunga uses flat amortization', () => {
    const a = computeCicil(baseInput())
    const f = computeCicil({ ...baseInput(), jenisBunga: 'Flat' })
    expect(f.cicilanPerBulan).not.toBeCloseTo(a.cicilanPerBulan, 0)
  })
})

describe('runMauCicil', () => {
  it('clones snapshot + adds cicilan + waterfall DP from kas; NO auto-aset', () => {
    const snap = richSnap()
    const r = runMauCicil(baseInput(), snap, [], {
      fiMultiplier: 300,
      assumedAnnualReturnReal: 0.05,
    })
    // Purity
    expect(snap.cicilanAktif).toHaveLength(0)
    expect(snap.asetLikuid.kas[0]!.amount).toBe(50_000_000)
    // Scenario
    expect(r.scenarioSnapshot.cicilanAktif).toHaveLength(1)
    expect(r.scenarioSnapshot.cicilanAktif[0]!.tipe).toBe('KPM')
    expect(r.scenarioSnapshot.cicilanAktif[0]!.sisaPokok).toBe(24_000_000)
    // DP 6jt → kas 50jt − 6jt = 44jt
    expect(r.scenarioSnapshot.asetLikuid.kas[0]!.amount).toBe(44_000_000)
    // No auto-aset (asetValue not set in baseInput)
    expect(r.scenarioSnapshot.asetNonLikuid.kendaraan).toHaveLength(0)
    expect(r.scenarioSnapshot.asetNonLikuid.properti).toHaveLength(0)
  })

  it('opt-in asset tracking: asetValue + asetKategori adds non-likuid row', () => {
    const snap = richSnap()
    const r = runMauCicil(
      { ...baseInput(), asetValue: 28_000_000, asetKategori: 'kendaraan' },
      snap,
      [],
      { fiMultiplier: 300, assumedAnnualReturnReal: 0.05 },
    )
    expect(r.scenarioSnapshot.asetNonLikuid.kendaraan).toHaveLength(1)
    expect(r.scenarioSnapshot.asetNonLikuid.kendaraan[0]!.amount).toBe(28_000_000)
  })

  it('skips aset when only asetValue is set (no kategori)', () => {
    const snap = richSnap()
    const r = runMauCicil(
      { ...baseInput(), asetValue: 28_000_000 }, // kategori missing
      snap,
      [],
      { fiMultiplier: 300, assumedAnnualReturnReal: 0.05 },
    )
    expect(r.scenarioSnapshot.asetNonLikuid.kendaraan).toHaveLength(0)
  })

  it('FX-aware waterfall (USD deposito drained correctly)', () => {
    const snap = emptySnapshot()
    snap.penghasilan = { amount: 15_000_000, currency: 'IDR' }
    snap.pengeluaran = { pokok: 5_000_000, lifestyle: 0 }
    snap.asetLikuid.deposito.push({
      id: 'd1',
      label: 'USD Depo',
      amount: 1_000,
      currency: 'USD',
    })
    const prices: PricesView = {
      ...emptyPrices(),
      fxRates: { USD: 16_000, SGD: null, EUR: null, JPY: null, KRW: null },
    }
    // DP 6jt IDR = 375 USD from deposito
    const r = runMauCicil(baseInput(), snap, [], {
      fiMultiplier: 300,
      assumedAnnualReturnReal: 0.05,
      prices,
    })
    expect(r.scenarioSnapshot.asetLikuid.deposito[0]!.amount).toBeCloseTo(625, 1)
    expect(r.scenarioSnapshot.asetLikuid.deposito[0]!.currency).toBe('USD')
    expect(r.warnings.length).toBe(0)
  })

  it('DP-zero case: no DP drain, just cicilan row added (KK/Paylater scenario)', () => {
    const snap = richSnap()
    const r = runMauCicil(
      { ...baseInput(), tipe: 'PAYLATER', hargaBarang: 5_000_000, dpPercent: 0 },
      snap,
      [],
      { fiMultiplier: 300, assumedAnnualReturnReal: 0.05 },
    )
    expect(r.scenarioSnapshot.cicilanAktif[0]!.sisaPokok).toBe(5_000_000)
    expect(r.scenarioSnapshot.asetLikuid.kas[0]!.amount).toBe(50_000_000) // untouched
    expect(r.warnings.length).toBe(0)
  })
})
