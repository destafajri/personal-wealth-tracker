import { describe, expect, it } from 'vitest'
import {
  gadaiDefaultFields,
  gadaiDefaultsFor,
} from '~/lib/smart-defaults/gadaiDefaults'

describe('gadaiDefaultsFor', () => {
  it('emas:digital returns 1.0%/bln, 4bln tenor (Pegadaian standard)', () => {
    expect(gadaiDefaultsFor('emas:digital')).toEqual({
      label: 'Gadai Emas Digital',
      bungaPerBulanPercent: 1.0,
      tempoBulan: 4,
    })
  })

  it('emas:fisikAntam returns 1.0%/bln, 4bln tenor', () => {
    expect(gadaiDefaultsFor('emas:fisikAntam')).toEqual({
      label: 'Gadai Emas Antam',
      bungaPerBulanPercent: 1.0,
      tempoBulan: 4,
    })
  })

  it('emas perhiasan variants return 1.5%/bln (higher rate for non-Antam)', () => {
    expect(gadaiDefaultsFor('emas:perhiasan18K').bungaPerBulanPercent).toBe(1.5)
    expect(gadaiDefaultsFor('emas:perhiasan14K').bungaPerBulanPercent).toBe(1.5)
    expect(gadaiDefaultsFor('emas:perhiasan10K').bungaPerBulanPercent).toBe(1.5)
  })

  it('properti returns 1.0%/bln, 12bln tenor (longer-term sertifikat)', () => {
    expect(gadaiDefaultsFor('properti')).toEqual({
      label: 'Gadai Sertifikat',
      bungaPerBulanPercent: 1.0,
      tempoBulan: 12,
    })
  })

  it('kendaraan returns 1.5%/bln, 6bln tenor (BPKB typical)', () => {
    expect(gadaiDefaultsFor('kendaraan')).toEqual({
      label: 'Gadai BPKB',
      bungaPerBulanPercent: 1.5,
      tempoBulan: 6,
    })
  })

  it('every jaminan returns a patch with all 3 fields filled', () => {
    const jaminans = [
      'emas:digital',
      'emas:fisikAntam',
      'emas:perhiasan18K',
      'emas:perhiasan14K',
      'emas:perhiasan10K',
      'properti',
      'kendaraan',
    ] as const
    for (const j of jaminans) {
      const d = gadaiDefaultsFor(j)
      expect(d.label).toBeTruthy()
      expect(d.bungaPerBulanPercent).toBeGreaterThan(0)
      expect(d.tempoBulan).toBeGreaterThan(0)
    }
  })
})

describe('gadaiDefaultFields', () => {
  it('returns label + bungaPerBulanPercent + tempoBulan for any jaminan', () => {
    expect(gadaiDefaultFields('emas:digital').sort()).toEqual(
      ['label', 'bungaPerBulanPercent', 'tempoBulan'].sort(),
    )
    expect(gadaiDefaultFields('properti').sort()).toEqual(
      ['label', 'bungaPerBulanPercent', 'tempoBulan'].sort(),
    )
  })
})
