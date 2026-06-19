import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSnapshotStore } from '~/stores/snapshot'

// Tests for Phase 8.6 restoreXxx methods — verify splice-at-index behaviour used
// by useUndoDelete to restore deleted rows at their original position.

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('restoreUtangPribadi', () => {
  it('inserts at index 0 of empty array', () => {
    const snap = useSnapshotStore()
    const row = snap.restoreUtangPribadi(0, { label: 'A', sisaPokok: 1000 })
    expect(snap.utangPribadi).toHaveLength(1)
    expect(snap.utangPribadi[0]!.id).toBe(row.id)
    expect(row.label).toBe('A')
  })

  it('inserts at given index, shifting later rows', () => {
    const snap = useSnapshotStore()
    snap.addUtangPribadi({ label: 'A' })
    snap.addUtangPribadi({ label: 'C' })
    snap.restoreUtangPribadi(1, { label: 'B' })
    expect(snap.utangPribadi.map((r) => r.label)).toEqual(['A', 'B', 'C'])
  })

  it('clamps negative index to 0', () => {
    const snap = useSnapshotStore()
    snap.addUtangPribadi({ label: 'A' })
    snap.restoreUtangPribadi(-5, { label: 'B' })
    expect(snap.utangPribadi.map((r) => r.label)).toEqual(['B', 'A'])
  })

  it('clamps index > length to end', () => {
    const snap = useSnapshotStore()
    snap.addUtangPribadi({ label: 'A' })
    snap.restoreUtangPribadi(99, { label: 'B' })
    expect(snap.utangPribadi.map((r) => r.label)).toEqual(['A', 'B'])
  })
})

describe('restoreCicilan', () => {
  it('inserts at given index', () => {
    const snap = useSnapshotStore()
    snap.addCicilan({ tipe: 'KPR', label: 'A' })
    snap.addCicilan({ tipe: 'KPM', label: 'C' })
    snap.restoreCicilan(1, { tipe: 'KK', label: 'B' })
    expect(snap.cicilanAktif.map((r) => r.label)).toEqual(['A', 'B', 'C'])
    expect(snap.cicilanAktif[1]!.tipe).toBe('KK')
  })

  it('preserves optional fields from partial', () => {
    const snap = useSnapshotStore()
    const row = snap.restoreCicilan(0, {
      tipe: 'KPR',
      label: 'Test',
      tenorSisaBulan: 240,
      sukuBunga: 7.5,
    })
    expect(row.tenorSisaBulan).toBe(240)
    expect(row.sukuBunga).toBe(7.5)
  })
})

describe('restoreGadai', () => {
  it('inserts at given index with all gadai fields', () => {
    const snap = useSnapshotStore()
    snap.restoreGadai(0, {
      label: 'Gadai Antam',
      jaminan: 'emas:fisikAntam',
      piutangIdr: 5_000_000,
      bungaPerBulanPercent: 1.0,
      tempoBulan: 4,
    })
    expect(snap.gadai).toHaveLength(1)
    expect(snap.gadai[0]!.jaminan).toBe('emas:fisikAntam')
    expect(snap.gadai[0]!.piutangIdr).toBe(5_000_000)
  })
})

describe('restoreLikuid', () => {
  it('inserts into the specified category at given index', () => {
    const snap = useSnapshotStore()
    snap.addLikuid('kas', { label: 'A' })
    snap.addLikuid('kas', { label: 'C' })
    snap.restoreLikuid('kas', 1, { label: 'B', amount: 1000 })
    expect(snap.asetLikuid.kas.map((r) => r.label)).toEqual(['A', 'B', 'C'])
    expect(snap.asetLikuid.kas[1]!.amount).toBe(1000)
  })

  it('does not affect other categories', () => {
    const snap = useSnapshotStore()
    snap.addLikuid('kas', { label: 'Kas A' })
    snap.restoreLikuid('deposito', 0, { label: 'Depo A' })
    expect(snap.asetLikuid.kas).toHaveLength(1)
    expect(snap.asetLikuid.deposito).toHaveLength(1)
  })
})

describe('restoreNonLikuid', () => {
  it('inserts at given index in specified category', () => {
    const snap = useSnapshotStore()
    snap.restoreNonLikuid('properti', 0, { label: 'Rumah', amount: 500_000_000 })
    expect(snap.asetNonLikuid.properti).toHaveLength(1)
    expect(snap.asetNonLikuid.properti[0]!.amount).toBe(500_000_000)
  })
})

describe('restorePenghasilanLain + restorePengeluaranLain', () => {
  it('restorePenghasilanLain inserts at given index', () => {
    const snap = useSnapshotStore()
    snap.addPenghasilanLain({ label: 'A' })
    snap.restorePenghasilanLain(0, { label: 'B' })
    expect(snap.penghasilanLain.map((r) => r.label)).toEqual(['B', 'A'])
  })

  it('restorePengeluaranLain inserts at given index', () => {
    const snap = useSnapshotStore()
    snap.addPengeluaranLain({ label: 'A' })
    snap.addPengeluaranLain({ label: 'C' })
    snap.restorePengeluaranLain(1, { label: 'B' })
    expect(snap.pengeluaranLain.map((r) => r.label)).toEqual(['A', 'B', 'C'])
  })
})

describe('round-trip: remove then restore lands at original position', () => {
  it('utangPribadi: A B C → remove B → restore lands at index 1', () => {
    const snap = useSnapshotStore()
    snap.addUtangPribadi({ label: 'A' })
    snap.addUtangPribadi({ label: 'B' })
    snap.addUtangPribadi({ label: 'C' })
    const originalIndex = 1
    const removed = snap.utangPribadi[originalIndex]!
    const { id, ...rowData } = removed
    void id
    snap.removeUtangPribadi(removed.id)
    expect(snap.utangPribadi.map((r) => r.label)).toEqual(['A', 'C'])
    snap.restoreUtangPribadi(originalIndex, rowData)
    expect(snap.utangPribadi.map((r) => r.label)).toEqual(['A', 'B', 'C'])
  })
})
