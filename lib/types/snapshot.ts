// Snapshot domain types — single source of truth for shape used by stores/snapshot.ts,
// stores/derived.ts, and lib/finance/* pure functions.
//
// Conventions:
// - IDR amounts: number (rupiah, integer ideally but float tolerated)
// - Gold: gram (number, fractional allowed)
// - Stock holdings: lot (number), price IDR/lembar; 1 lot = 100 lembar
// - Percentages: number 0–100 (NOT 0–1) unless noted

export type LiquidAssetCategory = 'kas' | 'deposito' | 'reksaDana' | 'sbn' | 'cryptoManual'
export type NonLiquidAssetCategory = 'properti' | 'kendaraan' | 'pensiun'

// Supported currencies for liquid assets. Non-liquid (properti/kendaraan/pensiun)
// stays IDR-only because real-world Indonesians hold those in IDR.
export type Currency = 'IDR' | 'USD' | 'SGD' | 'EUR' | 'JPY' | 'KRW'
export const CURRENCIES: readonly Currency[] = [
  'IDR',
  'USD',
  'SGD',
  'EUR',
  'JPY',
  'KRW',
]

export interface AssetRow {
  id: string
  label: string
  amount: number // value in the row's currency (defaults to IDR if currency undefined)
  currency?: Currency
}

export interface StockHolding {
  id: string
  ticker: string // e.g., "BBCA"
  lot: number
  hargaRataRata: number // IDR / lembar (cost basis)
  bobotTargetPercent?: number // 0–100; missing = no target set
}

export type JenisBunga = 'Anuitas' | 'Flat' | 'Floating' | 'Revolving'

export type CicilanTipe =
  | 'KPR'
  | 'KPM'
  | 'BANK_KTA'
  | 'PINJOL'
  | 'PAYLATER'
  | 'KK'
  | 'LAIN'

export interface CicilanRow {
  id: string
  tipe: CicilanTipe
  label: string
  sisaPokok: number // IDR
  cicilanPerBulan: number // IDR
  sukuBunga?: number // %/tahun; optional per PRD §5.3.1 edge case
  tenorSisaBulan?: number // optional for Revolving
  jenisBunga: JenisBunga
  tanggalJatuhTempo?: string // ISO date YYYY-MM-DD
}

// Informal / non-bank debt — pinjam ke teman, keluarga, pribadi. Tidak ada bunga formal
// atau jenis bunga; tenor & cicilan/bulan optional. Tetap dihitung di Total Utang (DAR,
// Net Worth) dan kalau ada cicilan/bln, masuk ke DSR + Total Pengeluaran (Runway, Savings).
export interface UtangPribadiRow {
  id: string
  label: string
  sisaPokok: number
  cicilanPerBulan?: number
  tempoBulan?: number
  tanggalJatuhTempo?: string
}

// What's collateralised in a gadai contract. Each emas-subcategory is its own kind
// so the "at home" balance per category can be derived (snapshot.emas.{cat}Gram
// minus pawned-in-that-category). Properti / kendaraan reference an existing aset row.
export type GadaiJaminanKind =
  | 'emas:digital'
  | 'emas:fisikAntam'
  | 'emas:perhiasan18K'
  | 'emas:perhiasan14K'
  | 'emas:perhiasan10K'
  | 'properti'
  | 'kendaraan'

export const EMAS_JAMINAN_KINDS = [
  'emas:digital',
  'emas:fisikAntam',
  'emas:perhiasan18K',
  'emas:perhiasan14K',
  'emas:perhiasan10K',
] as const satisfies readonly GadaiJaminanKind[]

// One row per gadai contract. gramTertahan applies only to emas:* jaminans;
// asetRefId applies only to properti/kendaraan (links to an asetNonLikuid row).
export interface GadaiRow {
  id: string
  label: string
  jaminan: GadaiJaminanKind
  gramTertahan?: number
  asetRefId?: string
  piutangIdr: number
  bungaPerBulanPercent: number // typical Pegadaian default 1.5
  tempoBulan: number
  tanggalJatuhTempo?: string // ISO date YYYY-MM-DD
}

export interface Pengeluaran {
  pokok: number // IDR/bulan
  lifestyle: number // IDR/bulan
}

// Emas is split into 5 categories with distinct valuation rates (see lib/finance/emas.ts).
// Each gram is "owned at home" (not pawned); pawned grams live on gadai[].gramTertahan.
export interface EmasState {
  digitalGram: number // valued at Pegadaian Digital hargaJual
  fisikAntamGram: number // valued at Antam 1g × ~0.93 buyback spread
  perhiasan18KGram: number // ~59.5% Antam
  perhiasan14KGram: number // ~45.5% Antam
  perhiasan10KGram: number // ~37.5% Antam
}

export interface SnapshotState {
  penghasilan: number // IDR/bulan
  pengeluaran: Pengeluaran
  asetLikuid: Record<LiquidAssetCategory, AssetRow[]>
  asetNonLikuid: Record<NonLiquidAssetCategory, AssetRow[]>
  emas: EmasState
  saham: StockHolding[]
  cicilanAktif: CicilanRow[]
  utangPribadi: UtangPribadiRow[]
  gadai: GadaiRow[]
}

// FX rates: IDR per 1 unit of base currency (e.g., fxRates.USD = 16_200 means 1 USD = 16,200 IDR).
// `null` per pair → fetch failed; the consumer renders the row as stale.
export type FxRatesMap = Record<Exclude<Currency, 'IDR'>, number | null>

export interface PricesView {
  goldDigitalIdrPerGram: number | null // Pegadaian Digital hargaJual (savings endpoint)
  goldAntam1gIdr: number | null // Antam 1g list price (table endpoint)
  fxRates: FxRatesMap
  idxByTicker: Record<string, number | null> // IDR per lembar
}

export function emptySnapshot(): SnapshotState {
  return {
    penghasilan: 0,
    pengeluaran: { pokok: 0, lifestyle: 0 },
    asetLikuid: {
      kas: [],
      deposito: [],
      reksaDana: [],
      sbn: [],
      cryptoManual: [],
    },
    asetNonLikuid: { properti: [], kendaraan: [], pensiun: [] },
    emas: {
      digitalGram: 0,
      fisikAntamGram: 0,
      perhiasan18KGram: 0,
      perhiasan14KGram: 0,
      perhiasan10KGram: 0,
    },
    saham: [],
    cicilanAktif: [],
    utangPribadi: [],
    gadai: [],
  }
}
