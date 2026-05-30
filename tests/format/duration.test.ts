import { describe, it, expect } from 'vitest'
import { duration } from '~/lib/format/duration'

describe('duration', () => {
  it('formats sub-month', () => {
    expect(duration(0)).toBe('kurang dari 1 bulan')
    expect(duration(0.5)).toBe('kurang dari 1 bulan')
  })

  it('formats months only', () => {
    expect(duration(1)).toBe('1 bulan')
    expect(duration(11)).toBe('11 bulan')
  })

  it('formats years only', () => {
    expect(duration(12)).toBe('1 tahun')
    expect(duration(24)).toBe('2 tahun')
  })

  it('formats years + months', () => {
    expect(duration(13)).toBe('1 tahun 1 bulan')
    expect(duration(25)).toBe('2 tahun 1 bulan')
  })

  it('rounds fractional months', () => {
    expect(duration(13.4)).toBe('1 tahun 1 bulan')
    expect(duration(13.6)).toBe('1 tahun 2 bulan')
  })

  it('returns em-dash for null / undefined / NaN / Infinity', () => {
    expect(duration(null)).toBe('—')
    expect(duration(undefined)).toBe('—')
    expect(duration(NaN)).toBe('—')
    expect(duration(Infinity)).toBe('—')
    expect(duration(-Infinity)).toBe('—')
  })
})
