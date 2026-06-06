import { describe, it, expect } from 'vitest'
import { formatIndonesianDate, formatIdrPdf, formatPercentPdf } from '~/lib/pdf/format'

describe('formatIndonesianDate', () => {
  it('formats a known date', () => {
    expect(formatIndonesianDate(new Date(2026, 5, 6))).toBe('6 Juni 2026')
  })

  it('formats January 1st', () => {
    expect(formatIndonesianDate(new Date(2025, 0, 1))).toBe('1 Januari 2025')
  })

  it('formats December 31st', () => {
    expect(formatIndonesianDate(new Date(2026, 11, 31))).toBe('31 Desember 2026')
  })
})

describe('formatIdrPdf', () => {
  it('formats zero', () => {
    expect(formatIdrPdf(0)).toBe('Rp 0')
  })

  it('formats positive value', () => {
    expect(formatIdrPdf(1500000)).toContain('Rp')
  })

  it('formats negative value with minus', () => {
    const result = formatIdrPdf(-500000)
    expect(result).toContain('-Rp')
  })

  it('returns N/A for null', () => {
    expect(formatIdrPdf(null)).toBe('N/A')
  })

  it('returns N/A for undefined', () => {
    expect(formatIdrPdf(undefined)).toBe('N/A')
  })
})

describe('formatPercentPdf', () => {
  it('formats percentage with comma decimal', () => {
    expect(formatPercentPdf(32.5)).toBe('32,5%')
  })

  it('formats integer percentage', () => {
    expect(formatPercentPdf(50, 0)).toBe('50%')
  })

  it('returns N/A for null', () => {
    expect(formatPercentPdf(null)).toBe('N/A')
  })
})
