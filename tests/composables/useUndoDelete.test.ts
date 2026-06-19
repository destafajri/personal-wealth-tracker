import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUndoDelete } from '~/composables/useUndoDelete'
import { useSnapshotStore } from '~/stores/snapshot'

beforeEach(() => {
  setActivePinia(createPinia())
  // Clear any module-level timer state between tests by dismissing
  const { dismiss } = useUndoDelete()
  dismiss()
})

describe('useUndoDelete', () => {
  it('exports as a function', () => {
    expect(typeof useUndoDelete).toBe('function')
  })

  it('returns capture / undo / dismiss functions + lastDeleted ref', () => {
    const api = useUndoDelete()
    expect(typeof api.capture).toBe('function')
    expect(typeof api.undo).toBe('function')
    expect(typeof api.dismiss).toBe('function')
    expect(api.lastDeleted.value).toBeNull()
  })

  it('capture stores deletion with panelKind, rowData, originalIndex', () => {
    const { capture, lastDeleted } = useUndoDelete()
    capture('utangPribadi', { label: 'A', sisaPokok: 1000 }, 2)
    expect(lastDeleted.value).not.toBeNull()
    expect(lastDeleted.value!.panelKind).toBe('utangPribadi')
    expect(lastDeleted.value!.rowData).toEqual({ label: 'A', sisaPokok: 1000 })
    expect(lastDeleted.value!.originalIndex).toBe(2)
    expect(typeof lastDeleted.value!.timestamp).toBe('number')
  })

  it('second capture within window replaces previous deletion', () => {
    const { capture, lastDeleted } = useUndoDelete()
    capture('utangPribadi', { label: 'A' }, 0)
    capture('gadai', { label: 'B' }, 1)
    expect(lastDeleted.value!.panelKind).toBe('gadai')
    expect(lastDeleted.value!.rowData).toEqual({ label: 'B' })
  })

  it('undo dispatches to the matching restoreXxx + clears state', () => {
    const { capture, undo, lastDeleted } = useUndoDelete()
    capture('utangPribadi', { label: 'A', sisaPokok: 500 }, 0)
    undo()
    expect(lastDeleted.value).toBeNull()
    // Verify row was actually restored into the store
    const snap = useSnapshotStore()
    expect(snap.utangPribadi.length).toBeGreaterThan(0)
    expect(snap.utangPribadi[0]!.label).toBe('A')
  })

  it('undo with no captured deletion is a no-op (no throw)', () => {
    const { undo } = useUndoDelete()
    expect(() => undo()).not.toThrow()
  })

  it('dismiss clears state immediately', () => {
    const { capture, dismiss, lastDeleted } = useUndoDelete()
    capture('cicilan', { tipe: 'KPR', label: 'X' }, 0)
    expect(lastDeleted.value).not.toBeNull()
    dismiss()
    expect(lastDeleted.value).toBeNull()
  })

  it('auto-dismisses after windowMs', async () => {
    vi.useFakeTimers()
    try {
      const { capture, lastDeleted } = useUndoDelete()
      capture('cicilan', { label: 'A' }, 0, 1000)
      expect(lastDeleted.value).not.toBeNull()
      vi.advanceTimersByTime(1100)
      expect(lastDeleted.value).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })

  it('new capture before window expires resets timer', async () => {
    vi.useFakeTimers()
    try {
      const { capture, lastDeleted } = useUndoDelete()
      capture('cicilan', { label: 'A' }, 0, 1000)
      vi.advanceTimersByTime(800)
      expect(lastDeleted.value).not.toBeNull() // 200ms remaining
      capture('gadai', { label: 'B' }, 0, 1000)
      vi.advanceTimersByTime(800) // Would have expired the FIRST timer
      expect(lastDeleted.value).not.toBeNull() // But second timer still has 200ms
      vi.advanceTimersByTime(300)
      expect(lastDeleted.value).toBeNull()
    } finally {
      vi.useRealTimers()
    }
  })
})
