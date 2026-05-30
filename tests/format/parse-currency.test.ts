import { describe, it, expect } from 'vitest'
import { parseCurrency } from '~/lib/format/parse-currency'

describe('parseCurrency', () => {
  const cases: Array<[string | number | null | undefined, number | null]> = [
    ['25000000', 25_000_000],
    ['25.000.000', 25_000_000],
    ['25,000,000', 25_000_000],
    ['Rp 25.000.000', 25_000_000],
    ['Rp25000000', 25_000_000],
    ['25jt', 25_000_000],
    ['25 juta', 25_000_000],
    ['25 JUTA', 25_000_000],
    ['1,5jt', 1_500_000],
    ['1.5 juta', 1_500_000],
    ['25 ribu', 25_000],
    ['25rb', 25_000],
    ['25k', 25_000],
    ['2 miliar', 2_000_000_000],
    ['2m', 2_000_000_000],
    ['1 triliun', 1_000_000_000_000],
    [0, 0],
    [12345, 12345],
    ['', null],
    [null, null],
    [undefined, null],
    ['abc', null],
    ['Rp', null],
  ]

  it.each(cases)('parse(%j) → %j', (input, expected) => {
    expect(parseCurrency(input)).toBe(expected)
  })
})
