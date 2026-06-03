import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { applyDemoSnapshot } from '~/lib/fixtures/demoSnapshot'
import { useSnapshotStore } from '~/stores/snapshot'

describe('applyDemoSnapshot', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('populates every snapshot panel with non-empty data', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)

    expect(snap.penghasilan.amount).toBeGreaterThan(0)
    expect(snap.penghasilanLain.length).toBeGreaterThan(0)
    expect(snap.pengeluaran.pokok).toBeGreaterThan(0)
    expect(snap.pengeluaran.lifestyle).toBeGreaterThan(0)

    expect(snap.asetLikuid.kas.length).toBeGreaterThan(0)
    expect(snap.asetLikuid.deposito.length).toBeGreaterThan(0)
    expect(snap.asetLikuid.reksaDana.length).toBeGreaterThan(0)
    expect(snap.asetLikuid.sbn.length).toBeGreaterThan(0)

    expect(snap.asetNonLikuid.properti.length).toBeGreaterThan(0)
    expect(snap.asetNonLikuid.kendaraan.length).toBeGreaterThan(0)
    expect(snap.asetNonLikuid.pensiun.length).toBeGreaterThan(0)

    expect(snap.emas.fisikAntamGram).toBeGreaterThan(0)
    expect(snap.emas.perhiasan18KGram).toBeGreaterThan(0)
    expect(snap.emas.digitalGram).toBeGreaterThan(0)

    expect(snap.saham.length).toBeGreaterThanOrEqual(10)
    expect(snap.crypto.length).toBeGreaterThan(0)
    expect(snap.cicilanAktif.length).toBeGreaterThan(0)
    expect(snap.utangPribadi.length).toBeGreaterThan(0)
    expect(snap.gadai.length).toBeGreaterThan(0)
  })

  it('every saham row carries ticker + lot + cost basis + dividend yield', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    for (const s of snap.saham) {
      expect(s.ticker).toMatch(/^[A-Z]{3,4}$/)
      expect(s.lot).toBeGreaterThan(0)
      expect(s.hargaRataRata).toBeGreaterThan(0)
      expect(s.lotsTarget).toBeGreaterThan(0)
      expect(s.avgDividendYieldPercent).toBeGreaterThan(0)
    }
  })

  it('gadai row references real pawned gram (not aset-ref) and uses Pegadaian default bunga', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const g = snap.gadai[0]!
    expect(g.jaminan).toBe('emas:fisikAntam')
    expect(g.gramTertahan).toBeGreaterThan(0)
    expect(g.asetRefId).toBeUndefined()
    expect(g.bungaPerBulanPercent).toBe(1.5)
  })

  it('is idempotent: calling twice yields the same row counts (reset wipes prior demo)', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const firstSahamCount = snap.saham.length
    const firstKasCount = snap.asetLikuid.kas.length
    applyDemoSnapshot(snap)
    expect(snap.saham.length).toBe(firstSahamCount)
    expect(snap.asetLikuid.kas.length).toBe(firstKasCount)
  })

  it('flags isDemo=true after seeding; reset clears the flag', () => {
    const snap = useSnapshotStore()
    expect(snap.isDemo).toBe(false)
    applyDemoSnapshot(snap)
    expect(snap.isDemo).toBe(true)
    snap.reset()
    expect(snap.isDemo).toBe(false)
    expect(snap.saham.length).toBe(0)
  })
})
