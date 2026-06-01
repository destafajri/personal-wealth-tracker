import {
  buildFxPath,
  buildFxStaleRow,
  failoverFetch,
  FX_PAIRS,
  parseChartToFxRate,
  type FxPair,
  type FxPayload,
  type FxRateRow,
  type YahooChartPayload,
} from '~/lib/prices/yahoo'

// Parallel-fetch all 4 base/IDR pairs. Each pair has independent failover; one pair
// failing doesn't block the others (we mark only the missing ones stale).
export default defineCachedEventHandler(
  async (event): Promise<FxPayload> => {
    const now = new Date().toISOString()
    const fetcher = (url: string, init: { headers: Record<string, string> }) =>
      $fetch<YahooChartPayload>(url, { headers: init.headers })

    async function fetchPair(pair: FxPair): Promise<FxRateRow> {
      try {
        const payload = await failoverFetch(buildFxPath(pair), fetcher)
        return parseChartToFxRate(payload, pair, now)
      } catch (err) {
        console.warn(`[prices/fx] ${pair} fetch failed`, err)
        return buildFxStaleRow(pair, now)
      }
    }

    const rates = await Promise.all(FX_PAIRS.map(fetchPair))
    void event
    return {
      rates,
      missing: rates.filter((r) => r.stale).map((r) => r.pair),
    }
  },
  {
    name: 'prices-fx-v1',
    maxAge: 60 * 60,
    swr: true,
    getKey: () => 'default',
    shouldInvalidateCache: (event) => getQuery(event).force === '1',
  },
)
