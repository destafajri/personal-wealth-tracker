import { describe, expect, it } from 'vitest'
import {
  computeGadai,
  runMauGadai,
  type GadaiInput,
} from '~/lib/finance/sims/mau-gadai'
import { emptySnapshot, type SnapshotState } from '~/lib/types/snapshot'

function baseInput(): GadaiInput {
  return {
    label: 'Gadai emas Antam',
    jaminan: 'emas:fisikAntam',
    gramTertahan: 20,
    piutangIdr: 30_000_000,
    bungaPerBulanPercent: 1.5,
    tempoBulan: 4,
  }
}

function snapWithEmas(): SnapshotState {
  const s = emptySnapshot()
  s.penghasilan = { amount: 20_000_000, currency: 'IDR' }
  s.pengeluaran = { pokok: 6_000_000, lifestyle: 0 }
  s.emas.fisikAntamGram = 50
  // Small init kas so before-DAR is computable (not null). Without prices the emas value
  // resolves to 0 in metric fns, so we need IDR-only aset to anchor the before side.
  s.asetLikuid.kas.push({ id: 'k1', label: 'Init', amount: 10_000_000 })
  return s
}

describe('computeGadai', () => {
  it('totalBunga = piutang × bunga%/bln × tempoBulan', () => {
    const c = computeGadai(baseInput())
    // 30jt × 0.015 × 4 = 1.8jt
    expect(c.totalBungaSepanjangTempo).toBeCloseTo(1_800_000, 0)
  })
  it('clamps negatives to 0', () => {
    const c = computeGadai({ ...baseInput(), piutangIdr: -1, tempoBulan: -2 })
    expect(c.totalBungaSepanjangTempo).toBe(0)
  })
})

describe('runMauGadai', () => {
  it('adds gadai row + kas piutang row; emas gram untouched', () => {
    const snap = snapWithEmas()
    const r = runMauGadai(baseInput(), snap, [], {
      fiMultiplier: 300,
      assumedAnnualReturnReal: 0.05,
    })
    // Original snapshot untouched (init kas row stays as 1 row, untouched)
    expect(snap.gadai).toHaveLength(0)
    expect(snap.asetLikuid.kas).toHaveLength(1)
    expect(snap.asetLikuid.kas[0]!.amount).toBe(10_000_000)
    expect(snap.emas.fisikAntamGram).toBe(50)
    // Scenario
    expect(r.scenarioSnapshot.gadai).toHaveLength(1)
    expect(r.scenarioSnapshot.gadai[0]!.jaminan).toBe('emas:fisikAntam')
    expect(r.scenarioSnapshot.gadai[0]!.gramTertahan).toBe(20)
    expect(r.scenarioSnapshot.gadai[0]!.piutangIdr).toBe(30_000_000)
    // kas now has init row + piutang row
    expect(r.scenarioSnapshot.asetLikuid.kas).toHaveLength(2)
    expect(r.scenarioSnapshot.asetLikuid.kas[1]!.amount).toBe(30_000_000)
    expect(r.scenarioSnapshot.asetLikuid.kas[1]!.label).toContain('Piutang gadai')
    // Emas gram stays — gadai.gramTertahan tracks pawned subset, user still owns
    expect(r.scenarioSnapshot.emas.fisikAntamGram).toBe(50)
  })

  it('delta: Modal Siap up (kas boost), DAR worse (utang up), NW unchanged', () => {
    const snap = snapWithEmas()
    const r = runMauGadai(baseInput(), snap, [], {
      fiMultiplier: 300,
      assumedAnnualReturnReal: 0.05,
    })
    const get = (k: string) => r.delta.find((d) => d.metricKey === k)!
    expect(get('modalSiap').direction).toBe('better')
    expect(get('dar').direction).toBe('worse')
    // NW = aset (kas +30jt) − utang (piutang +30jt) → no change
    expect(get('netWorth').direction).toBe('neutral')
  })

  it('properti jaminan: stores asetRefId, no gramTertahan', () => {
    const snap = snapWithEmas()
    snap.asetNonLikuid.properti.push({ id: 'p1', label: 'Rumah', amount: 1_000_000_000 })
    const r = runMauGadai(
      { ...baseInput(), jaminan: 'properti', asetRefId: 'p1', gramTertahan: undefined },
      snap,
      [],
      { fiMultiplier: 300, assumedAnnualReturnReal: 0.05 },
    )
    expect(r.scenarioSnapshot.gadai[0]!.asetRefId).toBe('p1')
    expect(r.scenarioSnapshot.gadai[0]!.gramTertahan).toBeUndefined()
  })

  it('warning when piutang ≤ 0', () => {
    const snap = snapWithEmas()
    const r = runMauGadai({ ...baseInput(), piutangIdr: 0 }, snap, [], {
      fiMultiplier: 300,
      assumedAnnualReturnReal: 0.05,
    })
    expect(r.warnings.length).toBeGreaterThan(0)
    // No piutang row pushed when piutang is 0 — only the init kas row remains
    expect(r.scenarioSnapshot.asetLikuid.kas).toHaveLength(1)
    expect(r.scenarioSnapshot.asetLikuid.kas[0]!.label).toBe('Init')
  })

  it('warning when emas jaminan but gramTertahan ≤ 0', () => {
    const snap = snapWithEmas()
    const r = runMauGadai(
      { ...baseInput(), gramTertahan: 0 },
      snap,
      [],
      { fiMultiplier: 300, assumedAnnualReturnReal: 0.05 },
    )
    expect(r.warnings.length).toBeGreaterThan(0)
  })

  it('warning when gramTertahan exceeds owned grams (Codex round-13)', () => {
    const snap = emptySnapshot() // no emas at all
    snap.penghasilan = { amount: 20_000_000, currency: 'IDR' }
    snap.pengeluaran = { pokok: 6_000_000, lifestyle: 0 }
    const r = runMauGadai(
      { ...baseInput(), gramTertahan: 20 }, // owns 0, requests 20
      snap,
      [],
      { fiMultiplier: 300, assumedAnnualReturnReal: 0.05 },
    )
    expect(
      r.warnings.some((w) => w.includes('punya') && w.includes('available')),
    ).toBe(true)
  })

  it('respects already-pawned grams when computing availability', () => {
    const snap = snapWithEmas() // 50g fisikAntam
    // Existing gadai pawning 30g of fisikAntam — available = 50 − 30 = 20g
    snap.gadai.push({
      id: 'g0',
      label: 'Old gadai',
      jaminan: 'emas:fisikAntam',
      gramTertahan: 30,
      piutangIdr: 10_000_000,
      bungaPerBulanPercent: 1.5,
      tempoBulan: 4,
    })
    // Try to gadai 25 more — exceeds available by 5g
    const rOver = runMauGadai(
      { ...baseInput(), gramTertahan: 25 },
      snap,
      [],
      { fiMultiplier: 300, assumedAnnualReturnReal: 0.05 },
    )
    expect(rOver.warnings.some((w) => w.includes('punya'))).toBe(true)

    // Pawning 20 — exactly at available — no over-ownership warning (still has
    // other warnings? no — piutang positive, gram positive, gram = available)
    const rExact = runMauGadai(
      { ...baseInput(), gramTertahan: 20 },
      snap,
      [],
      { fiMultiplier: 300, assumedAnnualReturnReal: 0.05 },
    )
    expect(rExact.warnings.every((w) => !w.includes('available'))).toBe(true)
  })
})
