// CoinGecko `/simple/price?ids=…&vs_currencies=…` adapter. We fetch the entire top-50
// catalog in ONE request per session — previous symbol-input version was vulnerable to
// keystroke-induced refetch races and only carried IDR/USD/KRW. Switching to canonical
// IDs (e.g., `ripple` not `xrp`, `binancecoin` not `bnb`) is required by `?ids=` —
// passing tickers there silently returns nothing for the misnamed coins.
//
// Cermat values everything in IDR (drives totals). USD/EUR/JPY/KRW are display + input-
// mode references — surfaced on the rate line ("~Rp 1.5M · ~$95K · ~₩125M / 1 BTC") and
// used by USD/KRW input modes (user enters $100 for their BTC row, we convert to IDR
// via the FX endpoint, not via the coin's own USD rate — keeps math consistent across
// crypto and other multi-currency assets in the snapshot).

import { allCoinIds } from '~/lib/data/coingecko-top-coins'

export const CG_DISPLAY_CCYS = ['idr', 'usd', 'eur', 'jpy', 'krw'] as const
export type CoinGeckoCcy = (typeof CG_DISPLAY_CCYS)[number]

export type CoinGeckoEntry = Partial<Record<CoinGeckoCcy, number>>
export type CoinGeckoResponse = Record<string, CoinGeckoEntry>

// Per-coin rate map. IDR drives sumCryptoIdr (modalSiap/netWorth). USD/EUR/JPY/KRW are
// display-only on the rate line — missing ones just hide that segment, never make the
// row stale (only IDR=null does).
export interface CryptoRateMap {
  idr: number | null
  usd: number | null
  eur: number | null
  jpy: number | null
  krw: number | null
}

export interface CryptoPriceRow extends CryptoRateMap {
  coinId: string // canonical CoinGecko id (lowercase): "bitcoin", "ethereum", "ripple"
  stale: boolean // true when IDR is missing — the only currency that drives totals
  fetchedAt: string
}

export interface CryptoPayload {
  prices: CryptoPriceRow[]
  missing: string[] // coinIds whose IDR rate came back null
}

export const COINGECKO_PRICE_URL = 'https://api.coingecko.com/api/v3/simple/price'

export function buildCoinGeckoUrl(ids: string[]): string {
  const idsParam = ids.map((s) => s.toLowerCase()).join(',')
  const vs = CG_DISPLAY_CCYS.join(',')
  return `${COINGECKO_PRICE_URL}?ids=${encodeURIComponent(idsParam)}&vs_currencies=${vs}`
}

export function buildTopCoinsUrl(): string {
  return buildCoinGeckoUrl(allCoinIds())
}

function pickPositive(raw: unknown): number | null {
  return typeof raw === 'number' && Number.isFinite(raw) && raw > 0 ? raw : null
}

export function parseCoinGeckoToPrices(
  payload: CoinGeckoResponse,
  ids: string[],
  now: string,
): CryptoPayload {
  const prices: CryptoPriceRow[] = ids.map((id) => {
    const entry = payload[id.toLowerCase()] ?? payload[id]
    const idr = pickPositive(entry?.idr)
    return {
      coinId: id,
      idr,
      usd: pickPositive(entry?.usd),
      eur: pickPositive(entry?.eur),
      jpy: pickPositive(entry?.jpy),
      krw: pickPositive(entry?.krw),
      stale: idr === null,
      fetchedAt: now,
    }
  })
  return {
    prices,
    missing: prices.filter((p) => p.idr === null).map((p) => p.coinId),
  }
}

export function buildCryptoStalePayload(
  ids: string[],
  now: string,
): CryptoPayload {
  return {
    prices: ids.map((id) => ({
      coinId: id,
      idr: null,
      usd: null,
      eur: null,
      jpy: null,
      krw: null,
      stale: true,
      fetchedAt: now,
    })),
    missing: [...ids],
  }
}
