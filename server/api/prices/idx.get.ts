import {
  buildIdxStalePayload,
  buildSparkPath,
  failoverFetch,
  isValidTicker,
  parseSparkToIdx,
  parseTickerList,
  type Fetcher,
  type IdxPayload,
  type YahooSparkPayload,
} from '~/lib/prices/yahoo'

export default defineCachedEventHandler(
  async (event): Promise<IdxPayload> => {
    const raw = String(getQuery(event).tickers ?? '')
    const tickers = parseTickerList(raw)
    if (tickers.length === 0 || !tickers.every(isValidTicker)) {
      throw createError({ statusCode: 400, statusMessage: 'invalid ticker(s)' })
    }

    const now = new Date().toISOString()
    const fetcher: Fetcher<YahooSparkPayload> = (url, init) =>
      $fetch<YahooSparkPayload>(url, init)

    try {
      const payload = await failoverFetch(buildSparkPath(tickers), fetcher)
      return parseSparkToIdx(payload, tickers, now)
    } catch {
      return buildIdxStalePayload(tickers, now)
    }
  },
  {
    maxAge: 60 * 15,
    swr: true,
    // Key by sorted-canonical ticker list only — drops `force` so a forced refresh
    // updates the same entry the unforced reads share, not a parallel one.
    getKey: (event) => {
      const list = parseTickerList(String(getQuery(event).tickers ?? ''))
      return list.length === 0 ? 'empty' : [...list].sort().join(',')
    },
    shouldInvalidateCache: (event) => getQuery(event).force === '1',
  },
)
