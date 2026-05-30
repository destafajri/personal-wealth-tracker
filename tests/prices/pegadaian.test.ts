import { describe, expect, it } from 'vitest'
import {
  buildGoldStalePayload,
  parsePegadaianToGold,
  type PegadaianResponse,
} from '~/lib/prices/pegadaian'

const NOW = '2026-05-30T07:00:00.000Z'

describe('parsePegadaianToGold', () => {
  it('parses happy response', () => {
    const res: PegadaianResponse = {
      responseCode: '2000000100',
      data: { hargaBeli: '26540', hargaJual: '25340', tglBerlaku: '2026-05-28' },
    }
    expect(parsePegadaianToGold(res, NOW)).toEqual({
      hargaJual: 25340,
      hargaBeli: 26540,
      tglBerlaku: '2026-05-28',
      stale: false,
      fetchedAt: NOW,
    })
  })

  it('marks stale when data block missing', () => {
    const result = parsePegadaianToGold({}, NOW)
    expect(result).toEqual({
      hargaJual: null,
      hargaBeli: null,
      tglBerlaku: null,
      stale: true,
      fetchedAt: NOW,
    })
  })

  it('marks stale when one price is invalid', () => {
    const res: PegadaianResponse = {
      data: { hargaJual: '25340', hargaBeli: 'NaN', tglBerlaku: '2026-05-28' },
    }
    const result = parsePegadaianToGold(res, NOW)
    expect(result.hargaJual).toBe(25340)
    expect(result.hargaBeli).toBeNull()
    expect(result.stale).toBe(true)
  })

  it('marks stale when prices are zero or negative', () => {
    const res: PegadaianResponse = {
      data: { hargaJual: '0', hargaBeli: '-100', tglBerlaku: '2026-05-28' },
    }
    const result = parsePegadaianToGold(res, NOW)
    expect(result.hargaJual).toBeNull()
    expect(result.hargaBeli).toBeNull()
    expect(result.stale).toBe(true)
  })
})

describe('buildGoldStalePayload', () => {
  it('returns null prices + stale true', () => {
    expect(buildGoldStalePayload(NOW)).toEqual({
      hargaJual: null,
      hargaBeli: null,
      tglBerlaku: null,
      stale: true,
      fetchedAt: NOW,
    })
  })
})
