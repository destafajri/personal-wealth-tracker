import type { CicilanRow, CicilanTipe, JenisBunga } from '~/lib/types/snapshot'

// Smart defaults applied when user clicks a Cicilan quick-add chip (KPR / KPM /
// KK / PINJOL / PAYLATER / KTA). The plain "+ Tambah Cicilan" button intentionally
// creates an empty row — chips are the only path to defaults (user decision
// 2026-06-19, spec §15.3).
//
// Rates are typical Indonesian market values (BI rules, OJK regulations, common
// bank published rates as of 2026-Q2). They are SUGGESTIONS marked by a SARAN
// pill in the UI — user is expected to override with their actual contract terms.

export interface CicilanDefaultPatch {
  label: string
  jenisBunga: JenisBunga
  tenorSisaBulan?: number
  sukuBunga?: number // % per tahun
}

export function cicilanDefaultsFor(tipe: CicilanTipe): CicilanDefaultPatch {
  switch (tipe) {
    case 'KPR':
      // Typical 20yr fixed-floating, BI medallion rate
      return { label: 'KPR Rumah', jenisBunga: 'Anuitas', tenorSisaBulan: 240, sukuBunga: 7.5 }
    case 'KPM':
      // Leasing standard 5yr
      return { label: 'KPM Mobil', jenisBunga: 'Anuitas', tenorSisaBulan: 60, sukuBunga: 6.5 }
    case 'KK':
      // BI caps cash advance interest; ~3%/bln typical
      return { label: 'Kartu Kredit', jenisBunga: 'Revolving', sukuBunga: 36 }
    case 'PINJOL':
      // OJK-capped effective rate; ~0.4%/day → ~146%/yr
      return { label: 'Pinjol', jenisBunga: 'Anuitas', tenorSisaBulan: 6, sukuBunga: 146 }
    case 'PAYLATER':
      // Shopee/Tokopedia/GoPay typical 1.5%/bln
      return { label: 'Paylater', jenisBunga: 'Anuitas', tenorSisaBulan: 6, sukuBunga: 18 }
    case 'BANK_KTA':
      // Bank KTA typical 1.5-2%/bln flat
      return { label: 'KTA Bank', jenisBunga: 'Anuitas', tenorSisaBulan: 36, sukuBunga: 24 }
    case 'LAIN':
      // No defaults; user fills freely
      return { label: '', jenisBunga: 'Anuitas' }
  }
}

// Returns the set of CicilanRow field keys that received a non-empty smart default
// for the given tipe. CicilanRow.vue uses this to render SARAN pills on those
// specific fields. `jenisBunga` is excluded because user already chose tipe (which
// implies a default jenis); the pill would feel redundant.
export function cicilanDefaultFields(tipe: CicilanTipe): Array<keyof CicilanRow> {
  const d = cicilanDefaultsFor(tipe)
  const fields: Array<keyof CicilanRow> = []
  if (d.label) fields.push('label')
  if (d.tenorSisaBulan !== undefined) fields.push('tenorSisaBulan')
  if (d.sukuBunga !== undefined) fields.push('sukuBunga')
  return fields
}
