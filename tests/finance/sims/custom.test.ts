import { describe, expect, it } from 'vitest'
import { runCustom, type CustomInput } from '~/lib/finance/sims/custom'
import { emptySnapshot, type SnapshotState } from '~/lib/types/snapshot'

function baseSnap(): SnapshotState {
  const s = emptySnapshot()
  s.penghasilan = { amount: 15_000_000, currency: 'IDR' }
  s.pengeluaran = { pokok: 5_000_000, pokokCurrency: 'IDR', lifestyle: 0, lifestyleCurrency: 'IDR' }
  return s
}

function baseInput(): CustomInput {
  return {
    cicilanLabel: 'Pinjam ke teman',
    cicilanTipe: 'LAIN',
    cicilanSisaPokok: 50_000_000,
    cicilanPerBulan: 1_000_000,
    cicilanJenisBunga: 'Flat',
  }
}

describe('runCustom — minimal scope (cicilan + optional asset)', () => {
  it('adds cicilan row; no asset when asetAmount/Kategori not set', () => {
    const snap = baseSnap()
    const r = runCustom(baseInput(), snap, [], {
      fiMultiplier: 300,
      assumedAnnualReturnReal: 0.05,
    })
    expect(r.scenarioSnapshot.cicilanAktif).toHaveLength(1)
    expect(r.scenarioSnapshot.cicilanAktif[0]!.tipe).toBe('LAIN')
    expect(r.scenarioSnapshot.cicilanAktif[0]!.sisaPokok).toBe(50_000_000)
    expect(r.scenarioSnapshot.cicilanAktif[0]!.cicilanPerBulan).toBe(1_000_000)
    // No asset rows
    expect(r.scenarioSnapshot.asetLikuid.kas).toHaveLength(0)
    expect(r.scenarioSnapshot.asetNonLikuid.kendaraan).toHaveLength(0)
  })

  it('opt-in asset: adds to asetLikuid with currency when liquid kategori', () => {
    const snap = baseSnap()
    const r = runCustom(
      {
        ...baseInput(),
        asetLabel: 'USD Tabungan',
        asetKategori: 'kas',
        asetAmount: 5_000,
        asetCurrency: 'USD',
      },
      snap,
      [],
      { fiMultiplier: 300, assumedAnnualReturnReal: 0.05 },
    )
    expect(r.scenarioSnapshot.asetLikuid.kas).toHaveLength(1)
    expect(r.scenarioSnapshot.asetLikuid.kas[0]!.amount).toBe(5_000)
    expect(r.scenarioSnapshot.asetLikuid.kas[0]!.currency).toBe('USD')
  })

  it('non-likuid drops currency silently (IDR-only by snapshot schema)', () => {
    const snap = baseSnap()
    const r = runCustom(
      {
        ...baseInput(),
        asetLabel: 'Mobil',
        asetKategori: 'kendaraan',
        asetAmount: 200_000_000,
        asetCurrency: 'USD', // ignored
      },
      snap,
      [],
      { fiMultiplier: 300, assumedAnnualReturnReal: 0.05 },
    )
    expect(r.scenarioSnapshot.asetNonLikuid.kendaraan).toHaveLength(1)
    expect(r.scenarioSnapshot.asetNonLikuid.kendaraan[0]!.amount).toBe(200_000_000)
    // No currency field on non-likuid row
    expect(r.scenarioSnapshot.asetNonLikuid.kendaraan[0]!.currency).toBeUndefined()
  })

  it('snapshot purity: original untouched', () => {
    const snap = baseSnap()
    runCustom(baseInput(), snap, [], {
      fiMultiplier: 300,
      assumedAnnualReturnReal: 0.05,
    })
    expect(snap.cicilanAktif).toHaveLength(0)
    expect(snap.asetLikuid.kas).toHaveLength(0)
  })

  it('delta: DSR worse (new cicilanPerBulan), no warnings', () => {
    const snap = baseSnap()
    const r = runCustom(baseInput(), snap, [], {
      fiMultiplier: 300,
      assumedAnnualReturnReal: 0.05,
    })
    expect(r.warnings).toEqual([])
    const dsr = r.delta.find((d) => d.metricKey === 'dsr')!
    expect(dsr.direction).toBe('worse')
  })
})
