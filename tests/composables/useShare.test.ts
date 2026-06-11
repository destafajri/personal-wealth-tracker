import { describe, expect, it } from 'vitest'
import { getAppUrl } from '~/composables/useShare'

describe('getAppUrl', () => {
  it('falls back to production URL in node (no window)', () => {
    expect(getAppUrl()).toBe('https://cermat-personal-wealth-tracker.vercel.app')
  })
})

describe('useShare', () => {
  it('exports useShare as a function', async () => {
    const { useShare } = await import('~/composables/useShare')
    expect(typeof useShare).toBe('function')
  })

  it('returns expected API shape', async () => {
    const { useShare } = await import('~/composables/useShare')
    const api = useShare()
    expect(typeof api.captureAsBlob).toBe('function')
    expect(typeof api.copyText).toBe('function')
    expect(typeof api.shareToWa).toBe('function')
    expect(typeof api.shareToTwitter).toBe('function')
    expect(typeof api.shareNative).toBe('function')
    expect(typeof api.isMobileShareCapable).toBe('function')
  })

  it('shareNative returns false when navigator.share is unavailable', async () => {
    const { useShare } = await import('~/composables/useShare')
    const { shareNative } = useShare()
    const result = await shareNative({ files: [], text: 'test', title: 'test' })
    expect(result).toBe(false)
  })

  it('isMobileShareCapable returns false in node (no window.matchMedia)', async () => {
    const { useShare } = await import('~/composables/useShare')
    const { isMobileShareCapable } = useShare()
    expect(isMobileShareCapable()).toBe(false)
  })
})
