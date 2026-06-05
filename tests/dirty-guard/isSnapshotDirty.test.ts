import { describe, expect, it } from 'vitest'
import { isSnapshotDirty, type DirtySignals } from '~/composables/useDirtyGuard'

function clean(overrides: Partial<DirtySignals> = {}): DirtySignals {
  return {
    isDemo: false,
    goalsCount: 0,
    penghasilanAmount: 0,
    penghasilanLainCount: 0,
    pengeluaranPokok: 0,
    pengeluaranLifestyle: 0,
    pengeluaranBiayaKos: 0,
    pengeluaranLainCount: 0,
    totalAset: 0,
    cicilanCount: 0,
    utangPribadiCount: 0,
    gadaiCount: 0,
    ...overrides,
  }
}

describe('isSnapshotDirty', () => {
  it('returns false for a fully empty snapshot', () => {
    expect(isSnapshotDirty(clean())).toBe(false)
  })

  it('always returns false in demo mode, even with seeded data', () => {
    expect(
      isSnapshotDirty(
        clean({
          isDemo: true,
          penghasilanAmount: 6500000,
          totalAset: 50000000,
          goalsCount: 2,
        }),
      ),
    ).toBe(false)
  })

  it.each<[keyof DirtySignals, number]>([
    ['goalsCount', 1],
    ['penghasilanAmount', 1],
    ['penghasilanLainCount', 1],
    ['pengeluaranPokok', 1],
    ['pengeluaranLifestyle', 1],
    ['pengeluaranBiayaKos', 1],
    ['pengeluaranLainCount', 1],
    ['totalAset', 1],
    ['cicilanCount', 1],
    ['utangPribadiCount', 1],
    ['gadaiCount', 1],
  ])('flips dirty when only %s is populated', (field, value) => {
    expect(isSnapshotDirty(clean({ [field]: value }))).toBe(true)
  })

  it('treats zero on every field as clean even when demo flag flips on/off', () => {
    expect(isSnapshotDirty(clean({ isDemo: true }))).toBe(false)
    expect(isSnapshotDirty(clean({ isDemo: false }))).toBe(false)
  })
})
