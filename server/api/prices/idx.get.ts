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
  { maxAge: 60 * 15, swr: true },
)
