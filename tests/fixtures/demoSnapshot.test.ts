import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { applyDemoSnapshot, triggerDemoFromQuery } from '~/lib/fixtures/demoSnapshot'
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

  it('every saham row carries ticker + lot + cost basis + at least one dividend input', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    for (const s of snap.saham) {
      expect(s.ticker).toMatch(/^[A-Z]{3,4}$/)
      expect(s.lot).toBeGreaterThan(0)
      expect(s.hargaRataRata).toBeGreaterThan(0)
      expect(s.lotsTarget).toBeGreaterThan(0)
      // Dividend input is mode-agnostic — either literal rupiah/lembar OR yield %.
      const hasYield =
        s.avgDividendYieldPercent !== undefined && s.avgDividendYieldPercent > 0
      const hasLast =
        s.lastDividendPerLembar !== undefined && s.lastDividendPerLembar > 0
      expect(hasYield || hasLast).toBe(true)
    }
  })

  it('saham fixture mixes dividend input modes (some literal, some yield)', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const withLast = snap.saham.filter(
      (s) => s.lastDividendPerLembar !== undefined && s.lastDividendPerLembar > 0,
    )
    const withYield = snap.saham.filter(
      (s) => s.avgDividendYieldPercent !== undefined && s.avgDividendYieldPercent > 0,
    )
    // At least one of each so the dashboard showcases both input options.
    expect(withLast.length).toBeGreaterThan(0)
    expect(withYield.length).toBeGreaterThan(0)
  })

  it('likuid bunga + RD jenis are persisted (regression guard for addLikuid)', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)

    // Deposito + SBN both seed sukuBungaPercent — addLikuid must forward it.
    const depo = snap.asetLikuid.deposito[0]!
    expect(depo.sukuBungaPercent).toBeGreaterThan(0)
    for (const sbn of snap.asetLikuid.sbn) {
      expect(sbn.sukuBungaPercent).toBeGreaterThan(0)
    }

    // RD seeds rdJenis on every row; fixture covers at least 2 distinct jenis
    // including one non-Safe-Haven (campuran/saham/indeks/lain) so the dashboard
    // shows a mixed allocation.
    const jenisSet = new Set(snap.asetLikuid.reksaDana.map((r) => r.rdJenis))
    expect(jenisSet.size).toBeGreaterThanOrEqual(2)
    const nonSafeJenisList = ['campuran', 'saham', 'indeks', 'lain']
    const hasNonSafe = snap.asetLikuid.reksaDana.some(
      (r) => r.rdJenis !== undefined && nonSafeJenisList.includes(r.rdJenis),
    )
    expect(hasNonSafe).toBe(true)
  })

  it('penghasilan lain has multiple rows (freelance + sewa kos)', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    expect(snap.penghasilanLain.length).toBeGreaterThanOrEqual(2)
    for (const row of snap.penghasilanLain) {
      expect(row.amount).toBeGreaterThan(0)
      expect(row.label.length).toBeGreaterThan(0)
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

describe('triggerDemoFromQuery', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it("seeds + cleans URL when route.query.demo === '1'", () => {
    const snap = useSnapshotStore()
    const router = { replace: vi.fn() }
    const route = { query: { demo: '1', other: 'keep' } }

    const fired = triggerDemoFromQuery(snap, route, router)

    expect(fired).toBe(true)
    expect(snap.isDemo).toBe(true)
    expect(snap.saham.length).toBeGreaterThan(0)
    // demo key dropped from the URL; other params preserved.
    expect(router.replace).toHaveBeenCalledTimes(1)
    expect(router.replace).toHaveBeenCalledWith({ query: { other: 'keep' } })
  })

  it('is a no-op when ?demo is missing or not exactly "1"', () => {
    const snap = useSnapshotStore()
    const router = { replace: vi.fn() }

    expect(triggerDemoFromQuery(snap, { query: {} }, router)).toBe(false)
    expect(triggerDemoFromQuery(snap, { query: { demo: '0' } }, router)).toBe(false)
    expect(triggerDemoFromQuery(snap, { query: { demo: 'true' } }, router)).toBe(false)

    expect(snap.isDemo).toBe(false)
    expect(snap.saham.length).toBe(0)
    expect(router.replace).not.toHaveBeenCalled()
  })
})
