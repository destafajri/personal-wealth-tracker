import { describe, expect, it } from 'vitest'
import {
  buildGoldStalePayload,
  parseAntam1g,
  parsePegadaianToGold,
  type PegadaianResponse,
  type PegadaianTableResponse,
} from '~/lib/prices/pegadaian'

const NOW = '2026-05-30T07:00:00.000Z'

const TABLE_OK: PegadaianTableResponse = {
  data: {
    listAntam: [
      { berat: '0.5', harga: '1508000', tglBerlaku: '2026-05-30' },
      { berat: '1.0', harga: '2911000', tglBerlaku: '2026-05-30' },
      { berat: '2.0', harga: '5760000', tglBerlaku: '2026-05-30' },
    ],
  },
}

describe('parsePegadaianToGold', () => {
  it('parses happy response (savings + table); savings ×100 → per-gram', () => {
    const savings: PegadaianResponse = {
      responseCode: '2000000100',
      data: { hargaBeli: '26540', hargaJual: '25340', tglBerlaku: '2026-05-28' },
    }
    expect(parsePegadaianToGold(savings, TABLE_OK, NOW)).toEqual({
      hargaJual: 2_534_000, // 25340 × 100
      hargaBeli: 2_654_000, // 26540 × 100
      antam1g: 2_911_000,
      tglBerlaku: '2026-05-28',
      stale: false,
      fetchedAt: NOW,
    })
  })

  it('marks stale when savings data block missing', () => {
    const result = parsePegadaianToGold({}, TABLE_OK, NOW)
    expect(result).toEqual({
      hargaJual: null,
      hargaBeli: null,
      antam1g: 2_911_000,
      tglBerlaku: null,
      stale: true,
      fetchedAt: NOW,
    })
  })

  it('marks stale when antam table missing', () => {
    const savings: PegadaianResponse = {
      data: { hargaBeli: '26540', hargaJual: '25340', tglBerlaku: '2026-05-28' },
    }
    const result = parsePegadaianToGold(savings, null, NOW)
    expect(result.antam1g).toBeNull()
    expect(result.stale).toBe(true)
  })

  it('marks stale when one price is invalid', () => {
    const savings: PegadaianResponse = {
      data: { hargaJual: '25340', hargaBeli: 'NaN', tglBerlaku: '2026-05-28' },
    }
    const result = parsePegadaianToGold(savings, TABLE_OK, NOW)
    expect(result.hargaJual).toBe(2_534_000)
    expect(result.hargaBeli).toBeNull()
    expect(result.stale).toBe(true)
  })

  it('marks stale when prices are zero or negative', () => {
    const savings: PegadaianResponse = {
      data: { hargaJual: '0', hargaBeli: '-100', tglBerlaku: '2026-05-28' },
    }
    const result = parsePegadaianToGold(savings, TABLE_OK, NOW)
    expect(result.hargaJual).toBeNull()
    expect(result.hargaBeli).toBeNull()
    expect(result.stale).toBe(true)
  })
})

describe('parseAntam1g', () => {
  it('picks the 1.0 gram row from listAntam', () => {
    expect(parseAntam1g(TABLE_OK)).toBe(2911000)
  })

  it('returns null if listAntam missing the 1.0 row', () => {
    expect(
      parseAntam1g({
        data: { listAntam: [{ berat: '2.0', harga: '5760000' }] },
      }),
    ).toBeNull()
  })

  it('returns null on empty/missing data', () => {
    expect(parseAntam1g({})).toBeNull()
    expect(parseAntam1g({ data: {} })).toBeNull()
  })

  it('returns null when harga is zero or invalid', () => {
    expect(parseAntam1g({ data: { listAntam: [{ berat: '1.0', harga: '0' }] } })).toBeNull()
    expect(
      parseAntam1g({ data: { listAntam: [{ berat: '1.0', harga: 'NaN' }] } }),
    ).toBeNull()
  })
})

describe('buildGoldStalePayload', () => {
  it('returns null prices + stale true', () => {
    expect(buildGoldStalePayload(NOW)).toEqual({
      hargaJual: null,
      hargaBeli: null,
      antam1g: null,
      tglBerlaku: null,
      stale: true,
      fetchedAt: NOW,
    })
  })
})
