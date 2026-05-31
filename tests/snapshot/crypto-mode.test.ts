import { describe, expect, it } from 'vitest'
import { nextCryptoModePatch } from '~/lib/snapshot/crypto-mode'

describe('nextCryptoModePatch', () => {
  it('returns mode-only patch when staying on the same mode', () => {
    expect(nextCryptoModePatch('idr', 'idr')).toEqual({ mode: 'idr' })
    expect(nextCryptoModePatch('unit', 'unit')).toEqual({ mode: 'unit' })
  })

  it('does NOT reset amount when toggling between unit and any currency mode', () => {
    // units and amount are separate row fields — toggling preserves the other.
    expect(nextCryptoModePatch('unit', 'idr')).toEqual({ mode: 'idr' })
    expect(nextCryptoModePatch('unit', 'usd')).toEqual({ mode: 'usd' })
    expect(nextCryptoModePatch('unit', 'krw')).toEqual({ mode: 'krw' })
    expect(nextCryptoModePatch('idr', 'unit')).toEqual({ mode: 'unit' })
    expect(nextCryptoModePatch('usd', 'unit')).toEqual({ mode: 'unit' })
    expect(nextCryptoModePatch('krw', 'unit')).toEqual({ mode: 'unit' })
  })

  it('resets amount to 0 when crossing between currency modes (idr↔usd↔krw)', () => {
    expect(nextCryptoModePatch('idr', 'usd')).toEqual({ mode: 'usd', amount: 0 })
    expect(nextCryptoModePatch('idr', 'krw')).toEqual({ mode: 'krw', amount: 0 })
    expect(nextCryptoModePatch('usd', 'idr')).toEqual({ mode: 'idr', amount: 0 })
    expect(nextCryptoModePatch('usd', 'krw')).toEqual({ mode: 'krw', amount: 0 })
    expect(nextCryptoModePatch('krw', 'idr')).toEqual({ mode: 'idr', amount: 0 })
    expect(nextCryptoModePatch('krw', 'usd')).toEqual({ mode: 'usd', amount: 0 })
  })
})
