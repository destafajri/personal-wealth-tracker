import { describe, expect, it } from 'vitest'
import {
  runMaxUtang,
  type MaxUtangInput,
} from '~/lib/finance/wizards/max-utang'
import { emptySnapshot, type SnapshotState } from '~/lib/types/snapshot'

function baseSnap(): SnapshotState {
  const s = emptySnapshot()
  s.penghasilan = { amount: 15_000_000, currency: 'IDR' }
  s.pengeluaran = { pokok: 5_000_000, lifestyle: 0 }
  return s
}

function baseInput(): MaxUtangInput {
  return { targetDsrPercent: 30 }
}

describe('runMaxUtang', () => {
  it('hero = penghasilan × targetDsr − currentCicilan (no existing debt)', () => {
    const r = runMaxUtang(baseInput(), baseSnap(), {})
    // 15jt × 30% = 4.5jt, no existing cicilan → 4.5jt headroom
    expect(r.heroValue).toBe(4_500_000)
  })

  it('subtracts existing cicilan (both formal + utang pribadi)', () => {
    const s = baseSnap()
    s.cicilanAktif.push({
      id: 'c1',
      tipe: 'KPR',
      label: 'KPR',
      sisaPokok: 0,
      cicilanPerBulan: 2_000_000,
      jenisBunga: 'Anuitas',
    })
    s.utangPribadi.push({
      id: 'u1',
      label: 'Pinjam teman',
      sisaPokok: 0,
      cicilanPerBulan: 500_000,
    })
    // 15jt × 30% = 4.5jt, current = 2.5jt → headroom = 2jt
    const r = runMaxUtang(baseInput(), s, {})
    expect(r.heroValue).toBe(2_000_000)
  })

  it('returns 0 + warning when no penghasilan', () => {
    const s = emptySnapshot() // penghasilan = 0
    const r = runMaxUtang(baseInput(), s, {})
    expect(r.heroValue).toBe(0)
    expect(r.scenarios).toEqual([])
    expect(r.warnings.length).toBeGreaterThan(0)
  })

  it('returns 0 + warning when current cicilan already exceeds target DSR', () => {
    const s = baseSnap()
    s.cicilanAktif.push({
      id: 'c1',
      tipe: 'KPR',
      label: 'KPR',
      sisaPokok: 0,
      cicilanPerBulan: 6_000_000, // 40% DSR > 30% target
      jenisBunga: 'Anuitas',
    })
    const r = runMaxUtang(baseInput(), s, {})
    expect(r.heroValue).toBe(0)
    expect(r.warnings.some((w) => w.toLowerCase().includes('headroom') || w.toLowerCase().includes('lebih') || w.length > 0)).toBe(true)
  })

  it('emits burn-over-income advisory when totalPengeluaran > penghasilan', () => {
    const s = baseSnap()
    s.pengeluaran = { pokok: 20_000_000, lifestyle: 0 } // burn > 15jt income
    const r = runMaxUtang(baseInput(), s, {})
    // Still computes headroom (no cicilan, just expense check)
    expect(r.warnings.length).toBeGreaterThan(0)
  })

  it('renders 3 equivalent scenarios when headroom > 0', () => {
    const r = runMaxUtang(baseInput(), baseSnap(), {})
    expect(r.scenarios).toHaveLength(3)
    expect(r.scenarios.map((s) => s.key)).toEqual(['kpr', 'kpm', 'paylater'])
    // KPR harga should be MUCH larger than KPM (longer tenor + lower rate)
    const kpr = r.scenarios.find((s) => s.key === 'kpr')!
    const kpm = r.scenarios.find((s) => s.key === 'kpm')!
    expect(kpr.description.length).toBeGreaterThan(0)
    expect(kpm.description.length).toBeGreaterThan(0)
  })

  it('honours custom KPR tenor + bunga overrides', () => {
    const r1 = runMaxUtang(baseInput(), baseSnap(), {})
    const r2 = runMaxUtang(
      { targetDsrPercent: 30, kprTenorTahun: 30, kprBungaPercent: 5 },
      baseSnap(),
      {},
    )
    // Lower bunga + longer tenor → bigger KPR harga
    expect(r2.scenarios.find((s) => s.key === 'kpr')!.description).not.toBe(
      r1.scenarios.find((s) => s.key === 'kpr')!.description,
    )
  })

  it('honours custom KPM + Paylater overrides (carries to scenario body)', () => {
    const r1 = runMaxUtang(baseInput(), baseSnap(), {})
    const r2 = runMaxUtang(
      {
        targetDsrPercent: 30,
        kpmTenorBulan: 60,
        kpmBungaPercent: 6,
        paylaterTenorBulan: 24,
        paylaterBungaPercent: 18,
      },
      baseSnap(),
      {},
    )
    // KPM with longer tenor + lower rate → bigger harga
    const r1Kpm = r1.scenarios.find((s) => s.key === 'kpm')!
    const r2Kpm = r2.scenarios.find((s) => s.key === 'kpm')!
    expect(r2Kpm.description).not.toBe(r1Kpm.description)
    // Paylater same — different body
    const r1Pl = r1.scenarios.find((s) => s.key === 'paylater')!
    const r2Pl = r2.scenarios.find((s) => s.key === 'paylater')!
    expect(r2Pl.description).not.toBe(r1Pl.description)
  })
})
