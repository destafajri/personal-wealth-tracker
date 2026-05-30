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
      const [savings, table] = await Promise.allSettled([
        $fetch<PegadaianResponse>(PEGADAIAN_URL, {
          headers: { 'user-agent': 'Mozilla/5.0' },
        }),
        $fetch<PegadaianTableResponse>(PEGADAIAN_TABLE_URL, {
          headers: { 'user-agent': 'Mozilla/5.0' },
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
  { name: 'prices-gold-v2', maxAge: 60 * 60, swr: true },
)
