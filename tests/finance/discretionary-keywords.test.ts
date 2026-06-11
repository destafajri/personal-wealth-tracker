import { describe, expect, it } from 'vitest'
import { isDiscretionary, DISCRETIONARY_KEYWORDS } from '~/lib/finance/discretionary-keywords'

describe('isDiscretionary', () => {
  it('matches "Top-up / Hobi Online" via top-up + hobi', () => {
    expect(isDiscretionary('Top-up / Hobi Online')).toBe(true)
  })

  it('matches "TOP-UP MOBA" case insensitive', () => {
    expect(isDiscretionary('TOP-UP MOBA')).toBe(true)
  })

  it('does NOT match "Belanja Bulanan" (regression — was false-positive in v1)', () => {
    expect(isDiscretionary('Belanja Bulanan')).toBe(false)
  })

  it('does NOT match "Kursus Online" (online keyword removed)', () => {
    expect(isDiscretionary('Kursus Online')).toBe(false)
  })

  it('does NOT match "Belanja Online" (online keyword removed)', () => {
    expect(isDiscretionary('Belanja Online')).toBe(false)
  })

  it('does NOT match "Cicilan Mobil" (debt, not discretionary)', () => {
    expect(isDiscretionary('Cicilan Mobil')).toBe(false)
  })

  it('does NOT match "Pinjaman Paylater" (debt, not discretionary)', () => {
    expect(isDiscretionary('Pinjaman Paylater')).toBe(false)
  })

  it('matches judol/judi/slot keywords', () => {
    expect(isDiscretionary('Judol slot gacor')).toBe(true)
    expect(isDiscretionary('Main judi online')).toBe(true)
  })

  it('matches rokok/vape/boba/kopi', () => {
    expect(isDiscretionary('Beli rokok')).toBe(true)
    expect(isDiscretionary('Vape liquid')).toBe(true)
    expect(isDiscretionary('Boba mantap')).toBe(true)
    expect(isDiscretionary('Beli kopi di kafe')).toBe(true)
  })

  it('does NOT match empty or generic labels', () => {
    expect(isDiscretionary('')).toBe(false)
    expect(isDiscretionary('Lainnya')).toBe(false)
    expect(isDiscretionary('Transportasi')).toBe(false)
  })

  it('has no online or belanja in keyword list', () => {
    expect(DISCRETIONARY_KEYWORDS).not.toContain('online')
    expect(DISCRETIONARY_KEYWORDS).not.toContain('belanja')
  })
})
