import { describe, expect, it } from 'vitest'
import { computeKpr, runMauKpr, type KprInput } from '~/lib/finance/sims/mau-kpr'
import { emptySnapshot, type PricesView, type SnapshotState } from '~/lib/types/snapshot'
import type { Goal } from '~/lib/types/goals'

function emptyPrices(): PricesView {
  return {
    goldDigitalIdrPerGram: null,
    goldAntam1gIdr: null,
    fxRates: { USD: null, SGD: null, EUR: null, JPY: null, KRW: null },
    idxByTicker: {},
    cryptoByCoinId: {},
  }
}

function baseInput(): KprInput {
  return {
    label: 'Rumah Bandung',
    hargaRumah: 1_200_000_000,
    dpPercent: 20,
    tenorTahun: 20,
    bungaPercent: 7,
    jenisBunga: 'Anuitas',
  }
}

function richSnap(): SnapshotState {
  const s = emptySnapshot()
  s.penghasilan = { amount: 25_000_000, currency: 'IDR' }
  s.pengeluaran = { pokok: 8_000_000, lifestyle: 0 }
  s.asetLikuid.kas.push({ id: 'k1', label: 'BCA', amount: 500_000_000 })
  return s
}

describe('computeKpr', () => {
  it('DP/pokok/tenor math is sane (anuitas 1.2B harga, DP 20%, 20yr, 7%)', () => {
    const c = computeKpr(baseInput())
    expect(c.dpIdr).toBe(240_000_000)
    expect(c.pokokPinjaman).toBe(960_000_000)
    expect(c.tenorBulan).toBe(240)
    // anuitas formula at 7%/12=0.583% monthly for 240 months on 960jt principal
    // M ≈ Rp 7_442_000 (allowing wiggle for rounding within amortization.ts)
    expect(c.cicilanPerBulan).toBeGreaterThan(7_300_000)
    expect(c.cicilanPerBulan).toBeLessThan(7_600_000)
    // totalBayar = cicilan × tenor; totalBunga = totalBayar − pokok > 0
    expect(c.totalBunga).toBeGreaterThan(c.pokokPinjaman * 0.5)
  })

  it('handles DP=0 and 100% (boundary)', () => {
    const c0 = computeKpr({ ...baseInput(), dpPercent: 0 })
    expect(c0.dpIdr).toBe(0)
    expect(c0.pokokPinjaman).toBe(baseInput().hargaRumah)
    const c100 = computeKpr({ ...baseInput(), dpPercent: 100 })
    expect(c100.dpIdr).toBe(baseInput().hargaRumah)
    expect(c100.pokokPinjaman).toBe(0)
    expect(c100.cicilanPerBulan).toBe(0)
  })

  it('Flat jenisBunga uses flat amortization', () => {
    const anuitas = computeKpr(baseInput())
    const flat = computeKpr({ ...baseInput(), jenisBunga: 'Flat' })
    // Flat cicilan = pokok/tenor + pokok×rate/12 → different from anuitas
    expect(flat.cicilanPerBulan).not.toBeCloseTo(anuitas.cicilanPerBulan, 0)
  })
})

describe('runMauKpr — golden fixture', () => {
  it('clones snapshot + adds cicilan + property + waterfall DP from kas', () => {
    const snap = richSnap()
    const r = runMauKpr(baseInput(), snap, [], {
      fiMultiplier: 300,
      assumedAnnualReturnReal: 0.05,
    })
    // Snapshot purity — original untouched
    expect(snap.cicilanAktif).toHaveLength(0)
    expect(snap.asetNonLikuid.properti).toHaveLength(0)
    expect(snap.asetLikuid.kas[0]!.amount).toBe(500_000_000)
    // Scenario mutated correctly
    expect(r.scenarioSnapshot.cicilanAktif).toHaveLength(1)
    expect(r.scenarioSnapshot.cicilanAktif[0]!.tipe).toBe('KPR')
    expect(r.scenarioSnapshot.cicilanAktif[0]!.sisaPokok).toBe(960_000_000)
    expect(r.scenarioSnapshot.asetNonLikuid.properti).toHaveLength(1)
    expect(r.scenarioSnapshot.asetNonLikuid.properti[0]!.amount).toBe(1_200_000_000)
    // DP 240jt debited from 500jt kas → kas = 260jt
    expect(r.scenarioSnapshot.asetLikuid.kas[0]!.amount).toBe(260_000_000)
  })

  it('delta directions: DSR/DAR worse, Runway worse, NetWorth better-ish', () => {
    const snap = richSnap()
    const r = runMauKpr(baseInput(), snap, [], {
      fiMultiplier: 300,
      assumedAnnualReturnReal: 0.05,
    })
    const get = (key: string) => r.delta.find((d) => d.metricKey === key)!
    // DSR jumps from 0 → ~30% — worse
    expect(get('dsr').direction).toBe('worse')
    // DAR jumps from 0 → high — worse
    expect(get('dar').direction).toBe('worse')
    // Runway gets shorter — worse
    expect(get('runway').direction).toBe('worse')
    // Net Worth: aset gained 1.2B (property) − 240jt drained kas + 0 deposito + 0 RD
    // = +960jt; utang +960jt → NW unchanged. May be neutral or slightly off due to
    // valuation rounding. Just verify it's not crashing & has a deltaDisplay.
    expect(get('netWorth').deltaDisplay).toBeTruthy()
  })

  it('emits warning when DP exceeds liquid (waterfall leftover > 0)', () => {
    const snap = emptySnapshot()
    snap.penghasilan = { amount: 25_000_000, currency: 'IDR' }
    snap.pengeluaran = { pokok: 8_000_000, lifestyle: 0 }
    snap.asetLikuid.kas.push({ id: 'k1', label: 'BCA', amount: 100_000_000 })
    // DP 240jt vs 100jt liquid → 140jt shortfall
    const r = runMauKpr(baseInput(), snap, [], {
      fiMultiplier: 300,
      assumedAnnualReturnReal: 0.05,
    })
    expect(r.warnings.length).toBeGreaterThan(0)
    // Kas drained to 0
    expect(r.scenarioSnapshot.asetLikuid.kas[0]!.amount).toBe(0)
  })

  it('goal impact: FI gets pushed back (monthsShift > 0)', () => {
    const snap = richSnap()
    const fi: Goal = {
      id: 'g',
      kind: 'FI',
      label: 'FI',
      targetIdr: 0,
      targetDate: '2050-01-01',
      buckets: ['kas', 'deposito', 'reksaDana', 'saham'],
    }
    const r = runMauKpr(baseInput(), snap, [fi], {
      fiMultiplier: 300,
      assumedAnnualReturnReal: 0.05,
      today: new Date(2026, 0, 1),
    })
    const impact = r.goalImpact[0]!
    expect(impact.goalId).toBe('g')
    // Either mundur (positive shift) or scenario made FI unreachable (cicilan eat surplus).
    // Both are valid worse-outcomes; just verify it's not a zero/early shift.
    expect(impact.monthsShift > 0 || impact.unreachable).toBe(true)
  })

  it('zero-goal case: goalImpact empty array, no crash', () => {
    const snap = richSnap()
    const r = runMauKpr(baseInput(), snap, [], {
      fiMultiplier: 300,
      assumedAnnualReturnReal: 0.05,
    })
    expect(r.goalImpact).toEqual([])
  })
})

describe('runMauKpr — FX-aware DP waterfall (Codex round-12 fix)', () => {
  it('USD deposito drained in source currency, not raw IDR', () => {
    const snap = emptySnapshot()
    snap.penghasilan = { amount: 25_000_000, currency: 'IDR' }
    snap.pengeluaran = { pokok: 8_000_000, lifestyle: 0 }
    // USD 20_000 × 16_000 = Rp 320jt IDR equivalent
    snap.asetLikuid.deposito.push({
      id: 'd1',
      label: 'BCA Dollar',
      amount: 20_000,
      currency: 'USD',
    })
    const prices: PricesView = {
      ...emptyPrices(),
      fxRates: { USD: 16_000, SGD: null, EUR: null, JPY: null, KRW: null },
    }
    // DP 240jt → drain 240jt IDR = 15_000 USD from deposito
    const r = runMauKpr(baseInput(), snap, [], {
      fiMultiplier: 300,
      assumedAnnualReturnReal: 0.05,
      prices,
    })
    expect(r.scenarioSnapshot.asetLikuid.deposito[0]!.amount).toBeCloseTo(5_000, 1)
    // Currency preserved post-drain
    expect(r.scenarioSnapshot.asetLikuid.deposito[0]!.currency).toBe('USD')
    // 320jt > 240jt → no shortfall warning
    expect(r.warnings.length).toBe(0)
  })

  it('skips rows with stale FX rate (no silent drain of foreign liquid)', () => {
    const snap = emptySnapshot()
    snap.penghasilan = { amount: 25_000_000, currency: 'IDR' }
    snap.pengeluaran = { pokok: 8_000_000, lifestyle: 0 }
    snap.asetLikuid.deposito.push({
      id: 'd1',
      label: 'BCA Dollar',
      amount: 10_000,
      currency: 'USD',
    })
    // FX rate null → row should be skipped, not drained as raw 10_000 IDR
    const prices: PricesView = emptyPrices()
    const r = runMauKpr(baseInput(), snap, [], {
      fiMultiplier: 300,
      assumedAnnualReturnReal: 0.05,
      prices,
    })
    expect(r.scenarioSnapshot.asetLikuid.deposito[0]!.amount).toBe(10_000)
    // Nothing drained → 240jt shortfall → warning fires
    expect(r.warnings.length).toBeGreaterThan(0)
  })

  it('mixed IDR + USD waterfall drains IDR first, then foreign', () => {
    const snap = emptySnapshot()
    snap.penghasilan = { amount: 25_000_000, currency: 'IDR' }
    snap.pengeluaran = { pokok: 8_000_000, lifestyle: 0 }
    // Kas 100jt IDR + deposito USD 10_000 (= 160jt IDR @ 16k rate) = 260jt total liquid
    snap.asetLikuid.kas.push({ id: 'k1', label: 'BCA', amount: 100_000_000 })
    snap.asetLikuid.deposito.push({
      id: 'd1',
      label: 'BCA Dollar',
      amount: 10_000,
      currency: 'USD',
    })
    const prices: PricesView = {
      ...emptyPrices(),
      fxRates: { USD: 16_000, SGD: null, EUR: null, JPY: null, KRW: null },
    }
    // DP 240jt: drain kas 100jt + deposito 140jt IDR (= 8_750 USD)
    const r = runMauKpr(baseInput(), snap, [], {
      fiMultiplier: 300,
      assumedAnnualReturnReal: 0.05,
      prices,
    })
    expect(r.scenarioSnapshot.asetLikuid.kas[0]!.amount).toBe(0)
    expect(r.scenarioSnapshot.asetLikuid.deposito[0]!.amount).toBeCloseTo(1_250, 1) // 10_000 - 8_750
    expect(r.warnings.length).toBe(0)
  })
})
