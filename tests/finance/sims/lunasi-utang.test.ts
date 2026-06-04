import { describe, expect, it } from 'vitest'
import {
  runLunasiUtang,
  type LunasiInput,
} from '~/lib/finance/sims/lunasi-utang'
import { emptySnapshot, type SnapshotState } from '~/lib/types/snapshot'

function richSnap(): SnapshotState {
  const s = emptySnapshot()
  s.penghasilan = { amount: 25_000_000, currency: 'IDR' }
  s.pengeluaran = { pokok: 8_000_000, pokokCurrency: 'IDR', lifestyle: 0, lifestyleCurrency: 'IDR' }
  s.asetLikuid.kas.push({ id: 'k1', label: 'BCA', amount: 100_000_000 })
  return s
}

describe('runLunasiUtang — cicilan source', () => {
  it('full lunas removes the cicilan row + debits kas', () => {
    const snap = richSnap()
    snap.cicilanAktif.push({
      id: 'c1',
      tipe: 'KPM',
      label: 'Motor',
      sisaPokok: 50_000_000,
      cicilanPerBulan: 1_500_000,
      sukuBunga: 7,
      tenorSisaBulan: 36,
      jenisBunga: 'Anuitas',
    })
    const input: LunasiInput = {
      source: 'cicilan',
      id: 'c1',
      paymentIdr: 50_000_000,
    }
    const r = runLunasiUtang(input, snap, [], {
      fiMultiplier: 300,
      assumedAnnualReturnReal: 0.05,
    })
    // Purity
    expect(snap.cicilanAktif).toHaveLength(1)
    expect(snap.asetLikuid.kas[0]!.amount).toBe(100_000_000)
    // Scenario
    expect(r.scenarioSnapshot.cicilanAktif).toHaveLength(0)
    expect(r.scenarioSnapshot.asetLikuid.kas[0]!.amount).toBe(50_000_000)
    expect(r.applyResult.lunasCompleted).toBe(true)
    expect(r.warnings.length).toBe(0)
  })

  it('partial Anuitas mode=cicilan: cicilan turun, tenor sama', () => {
    const snap = richSnap()
    snap.cicilanAktif.push({
      id: 'c1',
      tipe: 'KPM',
      label: 'Motor',
      sisaPokok: 30_000_000,
      cicilanPerBulan: 1_000_000,
      sukuBunga: 7,
      tenorSisaBulan: 36,
      jenisBunga: 'Anuitas',
    })
    const r = runLunasiUtang(
      { source: 'cicilan', id: 'c1', paymentIdr: 10_000_000, modeAnuitas: 'cicilan' },
      snap,
      [],
      { fiMultiplier: 300, assumedAnnualReturnReal: 0.05 },
    )
    const post = r.scenarioSnapshot.cicilanAktif[0]!
    expect(post.sisaPokok).toBe(20_000_000)
    expect(post.tenorSisaBulan).toBe(36) // unchanged
    expect(post.cicilanPerBulan).toBeLessThan(1_000_000) // reduced
    expect(r.applyResult.lunasCompleted).toBe(false)
  })

  it('partial Anuitas mode=tenor: tenor turun, cicilan sama', () => {
    const snap = richSnap()
    snap.cicilanAktif.push({
      id: 'c1',
      tipe: 'KPM',
      label: 'Motor',
      sisaPokok: 30_000_000,
      cicilanPerBulan: 1_000_000,
      sukuBunga: 7,
      tenorSisaBulan: 36,
      jenisBunga: 'Anuitas',
    })
    const r = runLunasiUtang(
      { source: 'cicilan', id: 'c1', paymentIdr: 10_000_000, modeAnuitas: 'tenor' },
      snap,
      [],
      { fiMultiplier: 300, assumedAnnualReturnReal: 0.05 },
    )
    const post = r.scenarioSnapshot.cicilanAktif[0]!
    expect(post.sisaPokok).toBe(20_000_000)
    expect(post.cicilanPerBulan).toBe(1_000_000) // unchanged
    expect(post.tenorSisaBulan).toBeLessThan(36) // reduced
  })

  it('Revolving: sisaPokok drops, cicilan/bln unchanged', () => {
    const snap = richSnap()
    snap.cicilanAktif.push({
      id: 'c1',
      tipe: 'KK',
      label: 'BCA KK',
      sisaPokok: 5_000_000,
      cicilanPerBulan: 500_000,
      jenisBunga: 'Revolving',
    })
    const r = runLunasiUtang(
      { source: 'cicilan', id: 'c1', paymentIdr: 2_000_000 },
      snap,
      [],
      { fiMultiplier: 300, assumedAnnualReturnReal: 0.05 },
    )
    const post = r.scenarioSnapshot.cicilanAktif[0]!
    expect(post.sisaPokok).toBe(3_000_000)
    expect(post.cicilanPerBulan).toBe(500_000) // user-set, unchanged
  })
})

describe('runLunasiUtang — utangPribadi + gadai sources', () => {
  it('utangPribadi full lunas removes row', () => {
    const snap = richSnap()
    snap.utangPribadi.push({
      id: 'u1',
      label: 'Pinjam teman',
      sisaPokok: 10_000_000,
    })
    const r = runLunasiUtang(
      { source: 'utangPribadi', id: 'u1', paymentIdr: 10_000_000 },
      snap,
      [],
      { fiMultiplier: 300, assumedAnnualReturnReal: 0.05 },
    )
    expect(r.scenarioSnapshot.utangPribadi).toHaveLength(0)
    expect(r.applyResult.lunasCompleted).toBe(true)
  })

  it('utangPribadi partial: sisaPokok drops', () => {
    const snap = richSnap()
    snap.utangPribadi.push({
      id: 'u1',
      label: 'Pinjam teman',
      sisaPokok: 10_000_000,
    })
    const r = runLunasiUtang(
      { source: 'utangPribadi', id: 'u1', paymentIdr: 3_000_000 },
      snap,
      [],
      { fiMultiplier: 300, assumedAnnualReturnReal: 0.05 },
    )
    expect(r.scenarioSnapshot.utangPribadi[0]!.sisaPokok).toBe(7_000_000)
    expect(r.applyResult.lunasCompleted).toBe(false)
  })

  it('gadai full lunas removes row', () => {
    const snap = richSnap()
    snap.gadai.push({
      id: 'g1',
      label: 'Gadai emas',
      jaminan: 'emas:fisikAntam',
      gramTertahan: 20,
      piutangIdr: 30_000_000,
      bungaPerBulanPercent: 1.5,
      tempoBulan: 4,
    })
    const r = runLunasiUtang(
      { source: 'gadai', id: 'g1', paymentIdr: 30_000_000 },
      snap,
      [],
      { fiMultiplier: 300, assumedAnnualReturnReal: 0.05 },
    )
    expect(r.scenarioSnapshot.gadai).toHaveLength(0)
    expect(r.applyResult.lunasCompleted).toBe(true)
  })

  it('gadai partial: piutangIdr drops', () => {
    const snap = richSnap()
    snap.gadai.push({
      id: 'g1',
      label: 'Gadai emas',
      jaminan: 'emas:fisikAntam',
      gramTertahan: 20,
      piutangIdr: 30_000_000,
      bungaPerBulanPercent: 1.5,
      tempoBulan: 4,
    })
    const r = runLunasiUtang(
      { source: 'gadai', id: 'g1', paymentIdr: 10_000_000 },
      snap,
      [],
      { fiMultiplier: 300, assumedAnnualReturnReal: 0.05 },
    )
    expect(r.scenarioSnapshot.gadai[0]!.piutangIdr).toBe(20_000_000)
  })
})

describe('runLunasiUtang — Modal Siap shortfall', () => {
  it('emits warning when payment > kas+deposito+RD', () => {
    const snap = emptySnapshot()
    snap.penghasilan = { amount: 25_000_000, currency: 'IDR' }
    snap.pengeluaran = { pokok: 8_000_000, pokokCurrency: 'IDR', lifestyle: 0, lifestyleCurrency: 'IDR' }
    snap.asetLikuid.kas.push({ id: 'k1', label: 'BCA', amount: 5_000_000 })
    snap.cicilanAktif.push({
      id: 'c1',
      tipe: 'KPM',
      label: 'Motor',
      sisaPokok: 50_000_000,
      cicilanPerBulan: 1_500_000,
      sukuBunga: 7,
      tenorSisaBulan: 36,
      jenisBunga: 'Anuitas',
    })
    const r = runLunasiUtang(
      { source: 'cicilan', id: 'c1', paymentIdr: 20_000_000 },
      snap,
      [],
      { fiMultiplier: 300, assumedAnnualReturnReal: 0.05 },
    )
    expect(r.warnings.length).toBeGreaterThan(0)
    expect(r.applyResult.sourceDeficit).toBe(15_000_000)
    // Only actual 5jt got applied
    expect(r.scenarioSnapshot.cicilanAktif[0]!.sisaPokok).toBe(45_000_000)
    expect(r.scenarioSnapshot.asetLikuid.kas[0]!.amount).toBe(0)
  })
})
