export interface PegadaianResponse {
  responseCode?: string
  data?: {
    hargaBeli?: string
    hargaJual?: string
    tglBerlaku?: string
  }
}

export interface GoldPayload {
  hargaJual: number | null
  hargaBeli: number | null
  tglBerlaku: string | null
  stale: boolean
  fetchedAt: string
}

export const PEGADAIAN_URL = 'https://pegadaian.co.id/gold/prices/savings'

function toPrice(raw: string | undefined): number | null {
  if (raw === undefined) return null
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function parsePegadaianToGold(
  res: PegadaianResponse,
  now: string,
): GoldPayload {
  const hargaJual = toPrice(res.data?.hargaJual)
  const hargaBeli = toPrice(res.data?.hargaBeli)
  return {
    hargaJual,
    hargaBeli,
    tglBerlaku: res.data?.tglBerlaku ?? null,
    stale: hargaJual === null || hargaBeli === null,
    fetchedAt: now,
  }
}

export function buildGoldStalePayload(now: string): GoldPayload {
  return {
    hargaJual: null,
    hargaBeli: null,
    tglBerlaku: null,
    stale: true,
    fetchedAt: now,
  }
}
