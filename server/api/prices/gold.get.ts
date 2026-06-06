import {
  buildGoldStalePayload,
  parsePegadaianToGold,
  PEGADAIAN_TABLE_URL,
  PEGADAIAN_URL,
  type GoldPayload,
  type PegadaianResponse,
  type PegadaianTableResponse,
} from '~/lib/prices/pegadaian'

export default defineCachedEventHandler(
  async (event): Promise<GoldPayload> => {
    const now = new Date().toISOString()
    const force = getQuery(event).force === '1'
    try {
      const browserHeaders = {
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
        accept:
          'application/json,text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
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
        console.warn('[prices/gold] Pegadaian savings fetch failed — trying PAXG fallback', savings.reason)
        return paxgFallback(now, force)
      }
      if (table.status === 'rejected') {
        console.warn('[prices/gold] antam table fetch failed', table.reason)
      }
      const tableRes = table.status === 'fulfilled' ? table.value : null
      const result = parsePegadaianToGold(savings.value, tableRes, now)
      if (result.stale) {
        console.warn('[prices/gold] Pegadaian returned incomplete data — trying PAXG fallback')
        return paxgFallback(now, force)
      }
      return result
    } catch (err) {
      console.warn('[prices/gold] unexpected error — trying PAXG fallback', err)
      return paxgFallback(now, force)
    }
  },
  {
    name: 'prices-gold-v2',
    maxAge: 60 * 60,
    swr: true,
    getKey: () => 'default',
    shouldInvalidateCache: (event) => getQuery(event).force === '1',
  },
)

async function paxgFallback(now: string, force: boolean): Promise<GoldPayload> {
  try {
    const paxg = await $fetch<GoldPayload>('/api/prices/gold-paxg', {
      query: force ? { force: '1' } : undefined,
    })
    if (!paxg.stale) return paxg
  } catch {
    console.warn('[prices/gold] PAXG fallback also failed')
  }
  return buildGoldStalePayload(now)
}
