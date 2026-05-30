import { describe, expect, it, vi } from 'vitest'
import {
  buildIdxStalePayload,
  buildSparkPath,
  buildUsdIdrPath,
  buildUsdIdrStalePayload,
  failoverFetch,
  isValidTicker,
  parseChartToUsdIdr,
  parseSparkToIdx,
  parseTickerList,
  type YahooChartPayload,
  type YahooSparkPayload,
} from '~/lib/prices/yahoo'

const NOW = '2026-05-30T07:00:00.000Z'

describe('parseTickerList', () => {
  it('splits, trims, uppercases, drops empty', () => {
    expect(parseTickerList('bbca, bbri , , tlkm')).toEqual(['BBCA', 'BBRI', 'TLKM'])
  })

  it('returns [] for empty string', () => {
    expect(parseTickerList('')).toEqual([])
  })
})

describe('isValidTicker', () => {
  it('accepts exactly 4 uppercase letters', () => {
    expect(isValidTicker('BBCA')).toBe(true)
    expect(isValidTicker('TLKM')).toBe(true)
  })

  it('rejects digits, lowercase, wrong length, empty', () => {
    expect(isValidTicker('BBC1')).toBe(false)
    expect(isValidTicker('bbca')).toBe(false)
    expect(isValidTicker('BBC')).toBe(false)
    expect(isValidTicker('BBCAA')).toBe(false)
    expect(isValidTicker('')).toBe(false)
  })
})

describe('buildSparkPath', () => {
  it('encodes comma-joined .JK symbols', () => {
    expect(buildSparkPath(['BBCA', 'BBRI'])).toBe(
      '/v7/finance/spark?symbols=BBCA.JK%2CBBRI.JK&interval=1d&range=1d',
    )
  })
})

describe('buildUsdIdrPath', () => {
  it('returns USDIDR=X chart path', () => {
    expect(buildUsdIdrPath()).toBe('/v8/finance/chart/USDIDR=X?interval=1d&range=1d')
  })
})

describe('failoverFetch', () => {
  it('returns query1 result on first success', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce({ ok: 'q1' })
    const res = await failoverFetch<{ ok: string }>('/path', fetcher)
    expect(res).toEqual({ ok: 'q1' })
    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(fetcher.mock.calls[0]?.[0]).toContain('query1.finance.yahoo.com')
  })

  it('falls back to query2 when query1 throws', async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new Error('q1 down'))
      .mockResolvedValueOnce({ ok: 'q2' })
    const res = await failoverFetch<{ ok: string }>('/path', fetcher)
    expect(res).toEqual({ ok: 'q2' })
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(fetcher.mock.calls[1]?.[0]).toContain('query2.finance.yahoo.com')
  })

  it('rethrows when both hosts fail', async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new Error('q1'))
      .mockRejectedValueOnce(new Error('q2'))
    await expect(failoverFetch('/path', fetcher)).rejects.toThrow('q2')
  })
})

describe('parseSparkToIdx', () => {
  const payload: YahooSparkPayload = {
    spark: {
      result: [
        {
          symbol: 'BBCA.JK',
          response: [{ meta: { regularMarketPrice: 9500, chartPreviousClose: 9450 } }],
        },
        {
          symbol: 'BBRI.JK',
          response: [{ meta: { regularMarketPrice: 4200, chartPreviousClose: 4180 } }],
        },
      ],
    },
  }

  it('maps tickers preserving input order', () => {
    const result = parseSparkToIdx(payload, ['BBCA', 'BBRI'], NOW)
    expect(result.prices.map((p) => p.ticker)).toEqual(['BBCA', 'BBRI'])
    expect(result.prices[0]?.price).toBe(9500)
    expect(result.prices[0]?.prevClose).toBe(9450)
    expect(result.prices[0]?.stale).toBe(false)
    expect(result.missing).toEqual([])
  })

  it('marks missing tickers stale and lists in missing[]', () => {
    const result = parseSparkToIdx(payload, ['BBCA', 'ZZZZ'], NOW)
    expect(result.prices[1]).toMatchObject({ ticker: 'ZZZZ', price: null, stale: true })
    expect(result.missing).toEqual(['ZZZZ'])
  })

  it('handles malformed payload (no result array) — all stale', () => {
    const result = parseSparkToIdx({ spark: {} }, ['BBCA'], NOW)
    expect(result.prices[0]?.stale).toBe(true)
    expect(result.missing).toEqual(['BBCA'])
  })

  it('stamps fetchedAt on every row', () => {
    const result = parseSparkToIdx(payload, ['BBCA'], NOW)
    expect(result.prices[0]?.fetchedAt).toBe(NOW)
  })
})

describe('buildIdxStalePayload', () => {
  it('returns all-null stale rows + all tickers in missing[]', () => {
    const result = buildIdxStalePayload(['BBCA', 'TLKM'], NOW)
    expect(result.prices).toHaveLength(2)
    expect(result.prices.every((p) => p.stale && p.price === null)).toBe(true)
    expect(result.missing).toEqual(['BBCA', 'TLKM'])
  })
})

describe('parseChartToUsdIdr', () => {
  it('extracts rate from regularMarketPrice', () => {
    const payload: YahooChartPayload = {
      chart: { result: [{ meta: { regularMarketPrice: 17784 } }] },
    }
    const result = parseChartToUsdIdr(payload, NOW)
    expect(result).toEqual({
      rate: 17784,
      currency: 'IDR',
      stale: false,
      fetchedAt: NOW,
    })
  })

  it('returns stale=true when meta missing', () => {
    const result = parseChartToUsdIdr({ chart: {} }, NOW)
    expect(result.rate).toBeNull()
    expect(result.stale).toBe(true)
  })

  it('returns stale=true when regularMarketPrice not a number', () => {
    const payload = { chart: { result: [{ meta: {} }] } } as YahooChartPayload
    const result = parseChartToUsdIdr(payload, NOW)
    expect(result.rate).toBeNull()
    expect(result.stale).toBe(true)
  })
})

describe('buildUsdIdrStalePayload', () => {
  it('returns null rate + stale true', () => {
    expect(buildUsdIdrStalePayload(NOW)).toEqual({
      rate: null,
      currency: 'IDR',
      stale: true,
      fetchedAt: NOW,
    })
  })
})
