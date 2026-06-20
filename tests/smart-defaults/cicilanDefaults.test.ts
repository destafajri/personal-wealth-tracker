import { describe, expect, it } from 'vitest'
import {
  cicilanDefaultFields,
  cicilanDefaultsFor,
} from '~/lib/smart-defaults/cicilanDefaults'

describe('cicilanDefaultsFor', () => {
  it('KPR returns 20yr / 7.5% / Anuitas', () => {
    expect(cicilanDefaultsFor('KPR')).toEqual({
      label: 'KPR Rumah',
      jenisBunga: 'Anuitas',
      tenorSisaBulan: 240,
      sukuBunga: 7.5,
    })
  })

  it('KPM returns 5yr / 6.5% / Anuitas', () => {
    expect(cicilanDefaultsFor('KPM')).toEqual({
      label: 'KPM Mobil',
      jenisBunga: 'Anuitas',
      tenorSisaBulan: 60,
      sukuBunga: 6.5,
    })
  })

  it('KK returns Revolving with no tenor (credit card)', () => {
    const d = cicilanDefaultsFor('KK')
    expect(d.jenisBunga).toBe('Revolving')
    expect(d.tenorSisaBulan).toBeUndefined()
    expect(d.sukuBunga).toBe(36)
  })

  it('PINJOL returns 6bln / 146% (OJK-capped effective rate)', () => {
    expect(cicilanDefaultsFor('PINJOL')).toEqual({
      label: 'Pinjol',
      jenisBunga: 'Anuitas',
      tenorSisaBulan: 6,
      sukuBunga: 146,
    })
  })

  it('PAYLATER returns 6bln / 18%', () => {
    expect(cicilanDefaultsFor('PAYLATER')).toEqual({
      label: 'Paylater',
      jenisBunga: 'Anuitas',
      tenorSisaBulan: 6,
      sukuBunga: 18,
    })
  })

  it('BANK_KTA returns 3yr / 24%', () => {
    expect(cicilanDefaultsFor('BANK_KTA')).toEqual({
      label: 'KTA Bank',
      jenisBunga: 'Anuitas',
      tenorSisaBulan: 36,
      sukuBunga: 24,
    })
  })

  it('LAIN returns empty label + Anuitas default jenisBunga', () => {
    expect(cicilanDefaultsFor('LAIN')).toEqual({
      label: '',
      jenisBunga: 'Anuitas',
    })
  })

  it('every tipe returns a defined patch', () => {
    const tipes = ['KPR', 'KPM', 'KK', 'PINJOL', 'PAYLATER', 'BANK_KTA', 'LAIN'] as const
    for (const tipe of tipes) {
      const d = cicilanDefaultsFor(tipe)
      expect(d).toBeDefined()
      expect(d.jenisBunga).toBeDefined()
    }
  })
})

describe('cicilanDefaultFields', () => {
  it('KPR includes label, tenorSisaBulan, sukuBunga', () => {
    expect(cicilanDefaultFields('KPR').sort()).toEqual(
      ['label', 'sukuBunga', 'tenorSisaBulan'].sort(),
    )
  })

  it('KK excludes tenorSisaBulan (Revolving has no tenor)', () => {
    const fields = cicilanDefaultFields('KK')
    expect(fields).toContain('label')
    expect(fields).toContain('sukuBunga')
    expect(fields).not.toContain('tenorSisaBulan')
  })

  it('LAIN returns only label (which is empty string, so actually empty array)', () => {
    // LAIN's label is '' so it doesn't get added to the fields array
    expect(cicilanDefaultFields('LAIN')).toEqual([])
  })
})
