import { describe, expect, it } from 'vitest'
import {
  buildCoinGeckoUrl,
  buildCryptoStalePayload,
  buildTopCoinsUrl,
  COINGECKO_PRICE_URL,
  parseCoinGeckoToPrices,
  type CoinGeckoResponse,
} from '~/lib/prices/coingecko'
import {
  COINGECKO_TOP_COINS,
  findCoinById,
  findCoinBySymbol,
} from '~/lib/data/coingecko-top-coins'

const NOW = '2026-05-31T08:00:00.000Z'

describe('coingecko top-coin catalog', () => {
  it('contains the gold-backed stablecoins XAUT + PAXG', () => {
    expect(findCoinBySymbol('XAUT')?.id).toBe('tether-gold')
    expect(findCoinBySymbol('PAXG')?.id).toBe('pax-gold')
  })

  it('findCoinBySymbol is case-insensitive + trims whitespace', () => {
    expect(findCoinBySymbol('btc')?.id).toBe('bitcoin')
    expect(findCoinBySymbol('  eth ')?.id).toBe('ethereum')
    expect(findCoinBySymbol('xrp')?.id).toBe('ripple')
  })

  it('findCoinBySymbol returns undefined for unknown tickers', () => {
    expect(findCoinBySymbol('NOSUCH')).toBeUndefined()
    expect(findCoinBySymbol('')).toBeUndefined()
  })

  it('findCoinById round-trips for every catalog entry', () => {
    for (const c of COINGECKO_TOP_COINS) {
      expect(findCoinById(c.id)).toEqual(c)
      expect(findCoinBySymbol(c.symbol)).toEqual(c)
    }
  })

  it('every symbol in the catalog is unique (no two coins share a ticker)', () => {
    const symbols = COINGECKO_TOP_COINS.map((c) => c.symbol)
    expect(new Set(symbols).size).toBe(symbols.length)
  })
})

describe('buildCoinGeckoUrl', () => {
  it('lowercases ids, joins with comma, requests all 5 vs_currencies', () => {
    expect(buildCoinGeckoUrl(['bitcoin', 'ethereum', 'ripple'])).toBe(
      `${COINGECKO_PRICE_URL}?ids=bitcoin%2Cethereum%2Cripple&vs_currencies=idr,usd,eur,jpy,krw`,
    )
  })

  it('handles single id', () => {
    expect(buildCoinGeckoUrl(['bitcoin'])).toBe(
      `${COINGECKO_PRICE_URL}?ids=bitcoin&vs_currencies=idr,usd,eur,jpy,krw`,
    )
  })
})

describe('buildTopCoinsUrl', () => {
  it('embeds every coin from the catalog', () => {
    const url = buildTopCoinsUrl()
    for (const c of COINGECKO_TOP_COINS) {
      expect(url).toContain(encodeURIComponent(c.id))
    }
  })

  it('uses canonical IDs, not tickers (regression: XRP/BNB)', () => {
    const url = buildTopCoinsUrl()
    expect(url).toContain('ripple')
    expect(url).toContain('binancecoin')
    // Sanity: tickers shouldn't leak into the URL.
    expect(url).not.toMatch(/[?&]ids=[^&]*(?:\b|%2C)xrp(?:%2C|\b)/)
    expect(url).not.toMatch(/[?&]ids=[^&]*(?:\b|%2C)bnb(?:%2C|\b)/)
  })
})

describe('parseCoinGeckoToPrices', () => {
  it('happy path — maps lowercase id keys with all 5 rates', () => {
    const payload: CoinGeckoResponse = {
      bitcoin: { idr: 1_500_000_000, usd: 95_000, eur: 88_000, jpy: 14_500_000, krw: 125_000_000 },
      ethereum: { idr: 50_000_000, usd: 3200, eur: 2950, jpy: 480_000, krw: 4_200_000 },
    }
    const result = parseCoinGeckoToPrices(payload, ['bitcoin', 'ethereum'], NOW)
    expect(result.prices).toEqual([
      {
        coinId: 'bitcoin',
        idr: 1_500_000_000,
        usd: 95_000,
        eur: 88_000,
        jpy: 14_500_000,
        krw: 125_000_000,
        stale: false,
        fetchedAt: NOW,
      },
      {
        coinId: 'ethereum',
        idr: 50_000_000,
        usd: 3200,
        eur: 2950,
        jpy: 480_000,
        krw: 4_200_000,
        stale: false,
        fetchedAt: NOW,
      },
    ])
    expect(result.missing).toEqual([])
  })

  it('marks missing coin (not in response) as stale', () => {
    const payload: CoinGeckoResponse = {
      bitcoin: { idr: 1_500_000_000, usd: 95_000, eur: 88_000, jpy: 14_500_000, krw: 125_000_000 },
    }
    const result = parseCoinGeckoToPrices(payload, ['bitcoin', 'nosuchcoin'], NOW)
    expect(result.prices[0]?.idr).toBe(1_500_000_000)
    expect(result.prices[1]).toEqual({
      coinId: 'nosuchcoin',
      idr: null,
      usd: null,
      eur: null,
      jpy: null,
      krw: null,
      stale: true,
      fetchedAt: NOW,
    })
    expect(result.missing).toEqual(['nosuchcoin'])
  })

  it('marks zero / negative / non-finite idr as stale; other ccys independent', () => {
    const payload: CoinGeckoResponse = {
      bitcoin: { idr: 0, usd: 95_000, eur: 0, jpy: 14_500_000, krw: 125_000_000 },
      ethereum: { idr: -100, usd: 3200, eur: 2950, jpy: -1, krw: 0 },
    }
    const result = parseCoinGeckoToPrices(payload, ['bitcoin', 'ethereum'], NOW)
    expect(result.prices[0]).toMatchObject({
      coinId: 'bitcoin',
      idr: null,
      usd: 95_000,
      eur: null,
      jpy: 14_500_000,
      krw: 125_000_000,
      stale: true,
    })
    expect(result.prices[1]).toMatchObject({
      coinId: 'ethereum',
      idr: null,
      usd: 3200,
      eur: 2950,
      jpy: null,
      krw: null,
      stale: true,
    })
    expect(result.missing).toEqual(['bitcoin', 'ethereum'])
  })

  it('tolerates missing display currencies when idr present', () => {
    const payload: CoinGeckoResponse = {
      bitcoin: { idr: 1_500_000_000 },
    }
    const result = parseCoinGeckoToPrices(payload, ['bitcoin'], NOW)
    expect(result.prices[0]).toMatchObject({
      coinId: 'bitcoin',
      idr: 1_500_000_000,
      usd: null,
      eur: null,
      jpy: null,
      krw: null,
      stale: false,
    })
    expect(result.missing).toEqual([])
  })
})

describe('buildCryptoStalePayload', () => {
  it('returns all-null rates marked stale for the requested coin ids', () => {
    expect(buildCryptoStalePayload(['bitcoin', 'ethereum'], NOW)).toEqual({
      prices: [
        {
          coinId: 'bitcoin',
          idr: null,
          usd: null,
          eur: null,
          jpy: null,
          krw: null,
          stale: true,
          fetchedAt: NOW,
        },
        {
          coinId: 'ethereum',
          idr: null,
          usd: null,
          eur: null,
          jpy: null,
          krw: null,
          stale: true,
          fetchedAt: NOW,
        },
      ],
      missing: ['bitcoin', 'ethereum'],
    })
  })
})
