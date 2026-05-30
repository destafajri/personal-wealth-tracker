export interface PegadaianResponse {
  responseCode?: string
  data?: {
    hargaBeli?: string
    hargaJual?: string
    tglBerlaku?: string
  }
}

// `/gold/prices/table?interval=7&isRequest=true` returns list-of-weights per brand.
// We only consume Antam @ berat=1.0 as the canonical 1-gram reference price for
// valuing fisik + perhiasan grams (see lib/finance/emas.ts for the multipliers).
export interface PegadaianTableEntry {
  berat?: string
  harga?: string
  tglBerlaku?: string
}

export interface PegadaianTableResponse {
  data?: {
    listAntam?: PegadaianTableEntry[]
    listUbs?: PegadaianTableEntry[]
  }
}

// All prices in IDR per 1 gram. NOTE: the raw `/gold/prices/savings` endpoint returns
// the digital tabungan rate per 0.01 gram (smallest unit users transact in) — we
// multiply by 100 inside the parser so every downstream consumer reads per-gram
// consistently. Antam table is already per 1 gram (we read the berat=1.0 row).
export interface GoldPayload {
  hargaJual: number | null // Pegadaian Digital per gram (sell-side / our valuation rate)
  hargaBeli: number | null // Pegadaian Digital per gram (buy-side)
  antam1g: number | null // Antam 1g list price — base for fisik + perhiasan valuation
  tglBerlaku: string | null
  stale: boolean
  fetchedAt: string
}

export const PEGADAIAN_URL = 'https://pegadaian.co.id/gold/prices/savings'
export const PEGADAIAN_TABLE_URL =
  'https://pegadaian.co.id/gold/prices/table?interval=7&isRequest=true'

function toPrice(raw: string | undefined): number | null {
  if (raw === undefined) return null
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
}

// `/savings` returns price per 0.01 gram → multiply by 100 for per-gram.
function toSavingsPricePerGram(raw: string | undefined): number | null {
  const per001 = toPrice(raw)
  return per001 === null ? null : per001 * 100
}

export function parseAntam1g(res: PegadaianTableResponse): number | null {
  const row = res.data?.listAntam?.find((e) => Number(e.berat) === 1)
  return toPrice(row?.harga)
}

export function parsePegadaianToGold(
  savingsRes: PegadaianResponse,
  tableRes: PegadaianTableResponse | null,
  now: string,
): GoldPayload {
  const hargaJual = toSavingsPricePerGram(savingsRes.data?.hargaJual)
  const hargaBeli = toSavingsPricePerGram(savingsRes.data?.hargaBeli)
  const antam1g = tableRes ? parseAntam1g(tableRes) : null
  return {
    hargaJual,
    hargaBeli,
    antam1g,
    tglBerlaku: savingsRes.data?.tglBerlaku ?? null,
    stale: hargaJual === null || hargaBeli === null || antam1g === null,
    fetchedAt: now,
  }
}

export function buildGoldStalePayload(now: string): GoldPayload {
  return {
    hargaJual: null,
    hargaBeli: null,
    antam1g: null,
    tglBerlaku: null,
    stale: true,
    fetchedAt: now,
  }
}
