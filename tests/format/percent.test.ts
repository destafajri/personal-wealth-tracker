import { describe, it, expect } from 'vitest'
import { percent, pp } from '~/lib/format/percent'

describe('percent', () => {
  it('formats integer percent', () => {
    expect(percent(5)).toBe('5%')
    expect(percent(0)).toBe('0%')
  })

  it('respects fractionDigits', () => {
    expect(percent(5.456, 1)).toBe('5.5%')
    expect(percent(5.456, 2)).toBe('5.46%')
  })

  it('returns em-dash for null / undefined / NaN / Infinity', () => {
    expect(percent(null)).toBe('—')
    expect(percent(undefined)).toBe('—')
    expect(percent(NaN)).toBe('—')
    expect(percent(Infinity)).toBe('—')
    expect(percent(-Infinity)).toBe('—')
  })
})

describe('pp', () => {
  it('prefixes + / − / no-sign', () => {
    expect(pp(2)).toBe('+2 pp')
    expect(pp(-3)).toBe('−3 pp')
    expect(pp(0)).toBe('0 pp')
  })

  it('respects fractionDigits', () => {
    expect(pp(2.456, 1)).toBe('+2.5 pp')
  })

  it('returns em-dash for null / NaN / Infinity', () => {
    expect(pp(null)).toBe('—')
    expect(pp(NaN)).toBe('—')
    expect(pp(Infinity)).toBe('—')
    expect(pp(-Infinity)).toBe('—')
  })
})
