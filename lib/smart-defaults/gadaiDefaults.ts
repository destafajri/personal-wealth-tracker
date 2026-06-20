import type { GadaiJaminanKind, GadaiRow } from '~/lib/types/snapshot'

// Smart defaults applied when user clicks a Gadai quick-add chip (currently the
// 4 most common jaminan: emas:digital, emas:fisikAntam, properti, kendaraan).
// Pegadaian-standard rates; user can override with their actual contract terms.
//
// Note: piutangIdr and gramTertahan / asetRefId are NOT defaulted because they
// are user-specific (depend on the actual pawn amount and owned-asset state).

export interface GadaiDefaultPatch {
  label: string
  bungaPerBulanPercent: number // %/bln, Pegadaian-standard
  tempoBulan: number // typical contract length per jaminan type
}

export function gadaiDefaultsFor(jaminan: GadaiJaminanKind): GadaiDefaultPatch {
  switch (jaminan) {
    case 'emas:digital':
      return { label: 'Gadai Emas Digital', bungaPerBulanPercent: 1.0, tempoBulan: 4 }
    case 'emas:fisikAntam':
      return { label: 'Gadai Emas Antam', bungaPerBulanPercent: 1.0, tempoBulan: 4 }
    case 'emas:perhiasan18K':
      return { label: 'Gadai Perhiasan 18K', bungaPerBulanPercent: 1.5, tempoBulan: 4 }
    case 'emas:perhiasan14K':
      return { label: 'Gadai Perhiasan 14K', bungaPerBulanPercent: 1.5, tempoBulan: 4 }
    case 'emas:perhiasan10K':
      return { label: 'Gadai Perhiasan 10K', bungaPerBulanPercent: 1.5, tempoBulan: 4 }
    case 'properti':
      // Sertifikat-backed; longer term typical
      return { label: 'Gadai Sertifikat', bungaPerBulanPercent: 1.0, tempoBulan: 12 }
    case 'kendaraan':
      // BPKB-gadai typical
      return { label: 'Gadai BPKB', bungaPerBulanPercent: 1.5, tempoBulan: 6 }
  }
}

// All three default fields always receive values for every jaminan kind.
// GadaiRow.vue renders SARAN pills on all three.
export function gadaiDefaultFields(_jaminan: GadaiJaminanKind): Array<keyof GadaiRow> {
  return ['label', 'bungaPerBulanPercent', 'tempoBulan']
}
