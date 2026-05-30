import {
  buildGoldStalePayload,
  parsePegadaianToGold,
  PEGADAIAN_URL,
  type GoldPayload,
  type PegadaianResponse,
} from '~/lib/prices/pegadaian'

export default defineCachedEventHandler(
  async (): Promise<GoldPayload> => {
    const now = new Date().toISOString()
    try {
      const res = await $fetch<PegadaianResponse>(PEGADAIAN_URL)
      return parsePegadaianToGold(res, now)
    } catch {
      return buildGoldStalePayload(now)
    }
  },
  { maxAge: 60 * 60, swr: true },
)
