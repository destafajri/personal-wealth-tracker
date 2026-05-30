export type Fetcher<T> = (
  url: string,
  init: { headers: Record<string, string> },
) => Promise<T>

export interface YahooSparkMeta {
  regularMarketPrice?: number
  chartPreviousClose?: number
}

export interface YahooSparkResult {
  symbol: string
  response?: Array<{ meta?: YahooSparkMeta }>
}

export interface YahooSparkPayload {
  spark: { result?: YahooSparkResult[] }
}

export interface YahooChartMeta {
  regularMarketPrice?: number
  chartPreviousClose?: number
}

export interface YahooChartPayload {
  chart: { result?: Array<{ meta?: YahooChartMeta }> }
}

export interface IdxPriceRow {
  ticker: string
  price: number | null
  prevClose: number | null
  currency: 'IDR'
  stale: boolean
  fetchedAt: string
}

export interface IdxPayload {
  prices: IdxPriceRow[]
  missing: string[]
}

// FX pair = a 6-letter Yahoo ticker like `USDIDR`. We fetch base/IDR conversion rates
// (rate = how many IDR per 1 unit of base currency).
export type FxPair = 'USDIDR' | 'SGDIDR' | 'EURIDR' | 'JPYIDR' | 'KRWIDR'
export const FX_PAIRS: readonly FxPair[] = [
  'USDIDR',
  'SGDIDR',
  'EURIDR',
  'JPYIDR',
  'KRWIDR',
]

export interface FxRateRow {
  pair: FxPair
  rate: number | null // IDR per 1 unit of base currency
  stale: boolean
  fetchedAt: string
}

export interface FxPayload {
  rates: FxRateRow[]
  missing: FxPair[]
}

// Kept as type alias for backward compat with existing usdidr endpoint + tests.
export interface UsdIdrPayload {
  rate: number | null
  currency: 'IDR'
  stale: boolean
  fetchedAt: string
}

const YAHOO_HOSTS = [
  'https://query1.finance.yahoo.com',
  'https://query2.finance.yahoo.com',
] as const

const YAHOO_HEADERS = { 'user-agent': 'Mozilla/5.0' }

const TICKER_RE = /^[A-Z]{4}$/

export async function failoverFetch<T>(
  pathAndQuery: string,
  fetcher: Fetcher<T>,
): Promise<T> {
  let lastErr: unknown
  for (const host of YAHOO_HOSTS) {
    try {
      return await fetcher(`${host}${pathAndQuery}`, { headers: YAHOO_HEADERS })
    } catch (err) {
      lastErr = err
    }
  }
  throw lastErr ?? new Error('all yahoo hosts failed')
}

export function parseTickerList(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean)
}

export function isValidTicker(t: string): boolean {
  return TICKER_RE.test(t)
}

export function buildSparkPath(tickers: string[]): string {
  const symbols = tickers.map((t) => `${t}.JK`).join(',')
  return `/v7/finance/spark?symbols=${encodeURIComponent(symbols)}&interval=1d&range=1d`
}

export function buildFxPath(pair: FxPair): string {
  return `/v8/finance/chart/${pair}=X?interval=1d&range=1d`
}

export function buildUsdIdrPath(): string {
  return buildFxPath('USDIDR')
}

export function parseSparkToIdx(
  payload: YahooSparkPayload,
  tickers: string[],
  now: string,
): IdxPayload {
  const byTicker = new Map<string, YahooSparkMeta | undefined>(
    (payload.spark?.result ?? []).map((r) => [
      r.symbol.replace('.JK', ''),
      r.response?.[0]?.meta,
    ]),
  )
  return {
    prices: tickers.map((t) => {
      const m = byTicker.get(t)
      const price = typeof m?.regularMarketPrice === 'number' ? m.regularMarketPrice : null
      const prevClose =
        typeof m?.chartPreviousClose === 'number' ? m.chartPreviousClose : null
      return {
        ticker: t,
        price,
        prevClose,
        currency: 'IDR' as const,
        stale: price === null,
        fetchedAt: now,
      }
    }),
    missing: tickers.filter((t) => {
      const m = byTicker.get(t)
      return !m || typeof m.regularMarketPrice !== 'number'
    }),
  }
}

export function buildIdxStalePayload(tickers: string[], now: string): IdxPayload {
  return {
    prices: tickers.map((t) => ({
      ticker: t,
      price: null,
      prevClose: null,
      currency: 'IDR' as const,
      stale: true,
      fetchedAt: now,
    })),
    missing: [...tickers],
  }
}

export function parseChartToFxRate(
  payload: YahooChartPayload,
  pair: FxPair,
  now: string,
): FxRateRow {
  const m = payload.chart?.result?.[0]?.meta
  const rate = typeof m?.regularMarketPrice === 'number' ? m.regularMarketPrice : null
  return { pair, rate, stale: rate === null, fetchedAt: now }
}

export function parseChartToUsdIdr(
  payload: YahooChartPayload,
  now: string,
): UsdIdrPayload {
  const row = parseChartToFxRate(payload, 'USDIDR', now)
  return { rate: row.rate, currency: 'IDR', stale: row.stale, fetchedAt: row.fetchedAt }
}

export function buildFxStaleRow(pair: FxPair, now: string): FxRateRow {
  return { pair, rate: null, stale: true, fetchedAt: now }
}

export function buildFxStalePayload(now: string): FxPayload {
  return {
    rates: FX_PAIRS.map((p) => buildFxStaleRow(p, now)),
    missing: [...FX_PAIRS],
  }
}

export function buildUsdIdrStalePayload(now: string): UsdIdrPayload {
  return {
    rate: null,
    currency: 'IDR',
    stale: true,
    fetchedAt: now,
  }
}
