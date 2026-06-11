import { describe, expect, it } from 'vitest'
import { APP_URL } from '~/composables/useShare'

describe('APP_URL', () => {
  it('points to production', () => {
    expect(APP_URL).toBe('https://cermat.vercel.app')
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
    expect(typeof api.captureAsPng).toBe('function')
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
