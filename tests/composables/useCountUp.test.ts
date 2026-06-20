import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest'
import { effectScope, ref, nextTick } from 'vue'
import { useCountUp } from '~/composables/useCountUp'

// Node test env has no requestAnimationFrame; stub it so the composable's rAF calls
// don't throw. Tests that need to assert rAF was/wasn't called use vi.spyOn on top.
let rafRestore: (() => void) | null = null
beforeAll(() => {
  vi.stubGlobal('requestAnimationFrame', (() => 0) as FrameRequestCallback)
  vi.stubGlobal('cancelAnimationFrame', (() => undefined) as (handle: number) => void)
})
afterAll(() => {
  vi.unstubAllGlobals()
})

describe('useCountUp', () => {
  it('exports as a function', () => {
    expect(typeof useCountUp).toBe('function')
  })

  it('returns a Ref<number>', () => {
    const scope = effectScope()
    const result = scope.run(() => useCountUp(ref(100)))
    scope.stop()
    expect(result).toBeTruthy()
    expect(typeof result!.value).toBe('number')
  })

  it('initialises displayed to 0 by default (animateTo runs via rAF on mount)', () => {
    const scope = effectScope()
    const target = ref(500)
    const displayed = scope.run(() => useCountUp(target))!
    // The immediate-watch animation calls rAF synchronously, but `displayed` only
    // advances when the rAF callback runs. With our stubbed rAF (no-op), displayed
    // remains at its initial value of 0.
    expect(displayed.value).toBe(0)
    scope.stop()
  })

  it('with skipInitial: true, initialises displayed to target immediately', () => {
    const scope = effectScope()
    const target = ref(500)
    const displayed = scope.run(() => useCountUp(target, { skipInitial: true }))!
    expect(displayed.value).toBe(500)
    scope.stop()
  })

  it('with skipInitial: true, does NOT call rAF on mount', () => {
    const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 0)
    try {
      const scope = effectScope()
      const target = ref(500)
      scope.run(() => useCountUp(target, { skipInitial: true }))
      expect(rafSpy).not.toHaveBeenCalled()
      scope.stop()
    } finally {
      rafSpy.mockRestore()
    }
  })

  it('without skipInitial, calls rAF on mount (immediate watch triggers animation)', () => {
    const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 0)
    try {
      const scope = effectScope()
      const target = ref(500)
      scope.run(() => useCountUp(target))
      expect(rafSpy).toHaveBeenCalled()
      scope.stop()
    } finally {
      rafSpy.mockRestore()
    }
  })

  it('triggers animation when target changes', async () => {
    const rafSpy = vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(() => 0)
    try {
      const scope = effectScope()
      const target = ref(100)
      scope.run(() => useCountUp(target, { skipInitial: true }))
      rafSpy.mockClear()

      target.value = 200
      await nextTick()
      expect(rafSpy).toHaveBeenCalled()
      scope.stop()
    } finally {
      rafSpy.mockRestore()
    }
  })

  it('accepts custom duration option', () => {
    const scope = effectScope()
    const target = ref(100)
    // No assertion on internal duration; this verifies the option is accepted without error.
    const displayed = scope.run(() => useCountUp(target, { duration: 500, skipInitial: true }))
    expect(displayed!.value).toBe(100)
    scope.stop()
  })
})
