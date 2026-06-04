import {
  buildGoldStalePayload,
  parsePegadaianToGold,
  PEGADAIAN_TABLE_URL,
  PEGADAIAN_URL,
  type GoldPayload,
  type PegadaianResponse,
  type PegadaianTableResponse,
} from '~/lib/prices/pegadaian'

// `name` bumped to v2 when the Antam table fetch was added — retires any v1 cache
// entries that pre-date the table source and only carried digital prices.
export default defineCachedEventHandler(
  async (): Promise<GoldPayload> => {
    const now = new Date().toISOString()
    try {
      // Run both fetches in parallel — savings has digital hargaJual/hargaBeli;
      // table has the per-weight Antam list we need at berat=1.0.
      // Pegadaian blocks minimal bot-like UAs — send realistic browser headers.
      const browserHeaders = {
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        referer: 'https://pegadaian.co.id/gold',
      }
      const [savings, table] = await Promise.allSettled([
        $fetch<PegadaianResponse>(PEGADAIAN_URL, {
          headers: browserHeaders,
        }),
        $fetch<PegadaianTableResponse>(PEGADAIAN_TABLE_URL, {
          headers: browserHeaders,
        }),
      ])
      if (savings.status === 'rejected') {
        console.warn('[prices/gold] savings fetch failed', savings.reason)
        return buildGoldStalePayload(now)
      }
      if (table.status === 'rejected') {
        console.warn('[prices/gold] antam table fetch failed', table.reason)
      }
      const tableRes = table.status === 'fulfilled' ? table.value : null
      return parsePegadaianToGold(savings.value, tableRes, now)
    } catch (err) {
      console.warn('[prices/gold] unexpected error', err)
      return buildGoldStalePayload(now)
    }
  },
  {
    name: 'prices-gold-v2',
    maxAge: 60 * 60,
    swr: true,
    // Stable key — strip the `force` param so a user-forced refresh updates the
    // SAME cache entry instead of pinning a parallel one under a different URL hash.
    getKey: () => 'default',
    // `force=1` from the client refresh button: mark current entry expired so the
    // handler re-fetches upstream and writes the fresh payload back to cache for
    // everyone (vs shouldBypassCache, which skips the write).
    shouldInvalidateCache: (event) => getQuery(event).force === '1',
  },
)
