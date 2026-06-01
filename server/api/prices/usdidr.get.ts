import {
  buildUsdIdrPath,
  buildUsdIdrStalePayload,
  failoverFetch,
  parseChartToUsdIdr,
  type Fetcher,
  type UsdIdrPayload,
  type YahooChartPayload,
} from '~/lib/prices/yahoo'

export default defineCachedEventHandler(
  async (): Promise<UsdIdrPayload> => {
    const now = new Date().toISOString()
    const fetcher: Fetcher<YahooChartPayload> = (url, init) =>
      $fetch<YahooChartPayload>(url, init)

    try {
      const payload = await failoverFetch(buildUsdIdrPath(), fetcher)
      return parseChartToUsdIdr(payload, now)
    } catch {
      return buildUsdIdrStalePayload(now)
    }
  },
  {
    maxAge: 60 * 15,
    swr: true,
    getKey: () => 'default',
    shouldInvalidateCache: (event) => getQuery(event).force === '1',
  },
)
