import { COINGECKO_PRICE_URL, type CoinGeckoResponse } from '~/lib/prices/coingecko'
import type { GoldPayload, GoldSource } from '~/lib/prices/pegadaian'

// PAXG (Paxos Gold) fallback — 1 PAXG ≈ 1 troy oz gold.
// CoinGecko returns IDR/USD per token; we convert to per-gram using
// 1 troy oz = 31.1035 g. Valuation approach:
//   - hargaJual (digital) = spot per gram (≈ buyback Antam, off by <0.5%)
//   - hargaBeli (buyback)  = spot per gram
//   - antam1g = spot × 1.114 (Antam list price premium over spot, Jun 2026 data)
// The emas.ts multipliers then apply correctly (fisikAntamSpread 0.897 × antam1g
// ≈ buyback price). Source badge + disclaimer in UI clarifies the estimation.

const TROY_OZ_TO_GRAM = 31.1035
const ANTAM_LIST_PREMIUM = 1.114 // Antam jual vs spot (Jun 2026: 11.4%)

export default defineCachedEventHandler(
  async (): Promise<GoldPayload> => {
    const now = new Date().toISOString()
    try {
      const payload = await $fetch<CoinGeckoResponse>(
        `${COINGECKO_PRICE_URL}?ids=pax-gold&vs_currencies=idr,usd`,
        { headers: { accept: 'application/json' } },
      )
      const entry = payload['pax-gold']
      const idrPerToken = entry?.idr ?? null
      const usdPerToken = entry?.usd ?? null

      if (!idrPerToken || idrPerToken <= 0) {
        console.warn('[prices/gold-paxg] no IDR price from CoinGecko')
        return { hargaJual: null, hargaBeli: null, antam1g: null, tglBerlaku: null, stale: true, fetchedAt: now, source: 'stale' }
      }

      const perGram = Math.round(idrPerToken / TROY_OZ_TO_GRAM)
      const antamEstimate = Math.round(perGram * ANTAM_LIST_PREMIUM)

      return {
        hargaJual: perGram,
        hargaBeli: perGram,
        antam1g: antamEstimate,
        tglBerlaku: null,
        stale: false,
        fetchedAt: now,
        source: 'paxg' as GoldSource,
      }
    } catch (err) {
      console.warn('[prices/gold-paxg] fetch failed', err)
      return { hargaJual: null, hargaBeli: null, antam1g: null, tglBerlaku: null, stale: true, fetchedAt: now, source: 'stale' }
    }
  },
  {
    name: 'prices-gold-paxg-v1',
    maxAge: 60 * 5,
    swr: true,
    getKey: () => 'default',
    shouldInvalidateCache: (event) => getQuery(event).force === '1',
  },
)
