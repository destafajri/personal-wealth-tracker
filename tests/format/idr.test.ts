import { describe, it, expect } from 'vitest'
import { idr, idrPlain } from '~/lib/format/idr'

describe('idr', () => {
  it('formats positive integer with Rp prefix', () => {
    expect(idr(25_000_000)).toContain('25.000.000')
    expect(idr(25_000_000)).toMatch(/^Rp/)
  })

  it('formats zero', () => {
    expect(idr(0)).toMatch(/^Rp.*0/)
  })

  it('formats negative', () => {
    expect(idr(-1_000)).toContain('1.000')
  })

  it('returns em-dash for null / undefined / NaN / Infinity', () => {
    expect(idr(null)).toBe('—')
    expect(idr(undefined)).toBe('—')
    expect(idr(NaN)).toBe('—')
    expect(idr(Infinity)).toBe('—')
    expect(idr(-Infinity)).toBe('—')
  })
})

describe('idrPlain', () => {
  it('formats without Rp prefix', () => {
    expect(idrPlain(25_000_000)).not.toMatch(/Rp/)
    expect(idrPlain(25_000_000)).toContain('25.000.000')
  })

  it('returns em-dash for null / NaN / Infinity', () => {
    expect(idrPlain(null)).toBe('—')
    expect(idrPlain(NaN)).toBe('—')
    expect(idrPlain(Infinity)).toBe('—')
  })
})
