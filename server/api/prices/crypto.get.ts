import { allCoinIds } from '~/lib/data/coingecko-top-coins'
import {
  buildTopCoinsUrl,
  parseCoinGeckoToPrices,
  type CoinGeckoResponse,
  type CryptoPayload,
} from '~/lib/prices/coingecko'

// One batched request per session: pull every coin in the top-52 catalog at once and
// cache for 5 minutes. The composable consumes the whole payload and the panel reads
// per-coin from the cryptoByCoinId map — no per-symbol refetch, so the keystroke-race
// the previous version had is gone.
//
// Throw on upstream failure so the response NEVER enters the Nitro cache; otherwise a
// single 429 from CoinGecko free-tier pins a null-everywhere payload for 5 min and the
// panel looks permanently broken. The composable catches and the panel renders its
// "rate belum kebaca" hint.
//
// Cache name is bumped whenever the catalog or response shape changes (v3 → v4 when
// XAUT + PAXG were added). Without the bump, Nitro keeps serving the old payload until
// maxAge elapses — invisible to the client and easy to confuse with an upstream issue.
export default defineCachedEventHandler(
  async (): Promise<CryptoPayload> => {
    const now = new Date().toISOString()
    const ids = allCoinIds()
    try {
      const payload = await $fetch<CoinGeckoResponse>(buildTopCoinsUrl(), {
        headers: { 'user-agent': 'Mozilla/5.0', accept: 'application/json' },
      })
      return parseCoinGeckoToPrices(payload, ids, now)
    } catch (err) {
      console.warn('[prices/crypto] coingecko fetch failed', err)
      throw createError({
        statusCode: 502,
        statusMessage: 'crypto price fetch failed',
      })
    }
  },
  {
    name: 'prices-crypto-v4',
    maxAge: 60 * 5,
    swr: true,
    getKey: () => 'default',
    shouldInvalidateCache: (event) => getQuery(event).force === '1',
  },
)
