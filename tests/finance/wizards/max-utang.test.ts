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
  return { targetDsrPercent: 30, tipes: ['kpr'] }
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

  it('single pick: renders only that scenario', () => {
    const r = runMaxUtang({ targetDsrPercent: 30, tipes: ['kpm'] }, baseSnap(), {})
    expect(r.scenarios).toHaveLength(1)
    expect(r.scenarios[0]!.key).toBe('kpm')
  })

  it('multi pick: renders 1 scenario per picked tipe, canonical order', () => {
    // Pick in any order — output always canonical (kpr → kpm → paylater)
    const r = runMaxUtang(
      { targetDsrPercent: 30, tipes: ['paylater', 'kpr'] },
      baseSnap(),
      {},
    )
    expect(r.scenarios.map((s) => s.key)).toEqual(['kpr', 'paylater'])
  })

  it('all 3 picked: 3 scenarios in canonical order', () => {
    const r = runMaxUtang(
      { targetDsrPercent: 30, tipes: ['kpm', 'paylater', 'kpr'] },
      baseSnap(),
      {},
    )
    expect(r.scenarios.map((s) => s.key)).toEqual(['kpr', 'kpm', 'paylater'])
  })

  it('duplicates dedup via Set', () => {
    const r = runMaxUtang(
      { targetDsrPercent: 30, tipes: ['kpr', 'kpr', 'kpm'] },
      baseSnap(),
      {},
    )
    expect(r.scenarios.map((s) => s.key)).toEqual(['kpr', 'kpm'])
  })

  it('empty tipes array: 0 scenarios (caller-side validation expected)', () => {
    const r = runMaxUtang({ targetDsrPercent: 30, tipes: [] }, baseSnap(), {})
    expect(r.scenarios).toEqual([])
    // Hero still populated — headroom calc is independent of tipe choice
    expect(r.heroValue).toBeGreaterThan(0)
  })

  it('honours custom KPR tenor + bunga overrides', () => {
    const r1 = runMaxUtang(baseInput(), baseSnap(), {})
    const r2 = runMaxUtang(
      { targetDsrPercent: 30, tipes: ['kpr'], kprTenorTahun: 30, kprBungaPercent: 5 },
      baseSnap(),
      {},
    )
    expect(r2.scenarios[0]!.description).not.toBe(r1.scenarios[0]!.description)
  })

  it('honours custom KPM override (only when KPM picked)', () => {
    const r1 = runMaxUtang({ targetDsrPercent: 30, tipes: ['kpm'] }, baseSnap(), {})
    const r2 = runMaxUtang(
      {
        targetDsrPercent: 30,
        tipes: ['kpm'],
        kpmTenorBulan: 60,
        kpmBungaPercent: 6,
      },
      baseSnap(),
      {},
    )
    expect(r2.scenarios[0]!.description).not.toBe(r1.scenarios[0]!.description)
  })

  it('non-matching tipe overrides ignored (KPR override does not affect KPM-only pick)', () => {
    const r1 = runMaxUtang({ targetDsrPercent: 30, tipes: ['kpm'] }, baseSnap(), {})
    const r2 = runMaxUtang(
      {
        targetDsrPercent: 30,
        tipes: ['kpm'],
        kprTenorTahun: 30,
        kprBungaPercent: 5,
      },
      baseSnap(),
      {},
    )
    expect(r2.scenarios[0]!.description).toBe(r1.scenarios[0]!.description)
  })
})
