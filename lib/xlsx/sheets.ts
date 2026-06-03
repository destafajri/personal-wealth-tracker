// Sheet builders for the Day 10 xlsx export. Pure functions returning
// Array-of-Arrays (AOA) suitable for SheetJS XLSX.utils.aoa_to_sheet().
// Kept separate from useXlsx.ts so they're unit-testable without the XLSX
// runtime or browser blob plumbing.
//
// Scope (per user decision 2026-06-03): 5 visible sheets + hidden _meta.
// Skenario + Kapasitas sheets from PRD §7 dropped per 11-day-plan safety
// valve (line 203) — there's no persisted scenarios store yet; deferring
// to Phase-2 round-trip work.

import type { Goal } from '~/lib/types/goals'
import type {
  CryptoHolding,
  Currency,
  CicilanRow,
  FxRatesMap,
  PricesView,
  SnapshotState,
  StockHolding,
} from '~/lib/types/snapshot'
import { anuitas, flat, floating, revolving } from '~/lib/finance/amortization'
import { type EmasCategory, ratePerGram } from '~/lib/finance/emas'
import { goalProgress } from '~/lib/finance/goals'
import {
  calcPotentialDividendIdr,
  effectiveStockPrice,
} from '~/lib/finance/metrics'

// Bumped any time the sheet schema changes in a way that affects Phase-2
// import. Stored in _meta so future importers can branch on version.
export const SCHEMA_VERSION = 1

// Cell type the builders emit. SheetJS narrows to string | number | boolean
// | Date | null at write time — null leaves the cell blank.
type Cell = string | number | null
type Row = Cell[]

// Pre-computed derived metrics piped in by the composable. Keeps builders
// pure (no Pinia / no async) and lets tests drive them with hand-rolled
// snapshots.
export interface XlsxDerivedSnapshot {
  totalAset: number
  totalUtang: number
  netWorth: number
  modalSiap: number
  dsr: number | null
  dar: number | null
  runway: number | null
  savingsRate: number | null
  safeHaven: number | null
  allocationDiscipline: number | null
  goalHealth: number | null
  surplusIdr: number
  penghasilanMonthlyIdr: number
  dividendAnnual: number
  bungaSbnAnnual: number
  bungaDepositoAnnual: number
}

export interface XlsxContext {
  snap: SnapshotState
  prices: PricesView
  goals: Goal[]
  derived: XlsxDerivedSnapshot
  exportedAt: string // ISO timestamp
  fiMultiplier: number
  annualReturnReal: number
}

// ===== Ringkasan =====
// Hero + 9 metrics + income/expense summary + counts. Display-only sheet
// per PRD §7 ("Ringkasan: display-only"); no normalized columns.
export function buildRingkasan(ctx: XlsxContext): Row[] {
  const { snap, derived, exportedAt, goals } = ctx
  return [
    ['Cermat Snapshot Report', null],
    ['Exported at', exportedAt],
    [],
    ['Hero', 'IDR'],
    ['Net Worth', derived.netWorth],
    ['Total Aset', derived.totalAset],
    ['Total Utang', derived.totalUtang],
    ['Modal Siap Distribusi', derived.modalSiap],
    [],
    ['Metric', 'Value'],
    ['DSR (Debt Service Ratio %)', derived.dsr],
    ['DAR (Debt-to-Asset Ratio %)', derived.dar],
    ['Runway (bulan)', derived.runway],
    ['Savings Rate (%)', derived.savingsRate],
    ['Safe Haven (%)', derived.safeHaven],
    ['Allocation Discipline', derived.allocationDiscipline],
    ['Goal Health (%)', derived.goalHealth],
    [],
    ['Penghasilan (IDR/bln)', null],
    ['Total income/bln', derived.penghasilanMonthlyIdr],
    ['Surplus/bln', derived.surplusIdr],
    ['Dividen estimasi/tahun', derived.dividendAnnual],
    ['Bunga SBN/tahun', derived.bungaSbnAnnual],
    ['Bunga Deposito/tahun', derived.bungaDepositoAnnual],
    [],
    ['Pengeluaran (IDR/bln)', null],
    ['Pokok', snap.pengeluaran.pokok],
    ['Lifestyle', snap.pengeluaran.lifestyle],
    [],
    ['Counts', null],
    ['Saham emiten', snap.saham.length],
    ['Crypto rows', snap.crypto.length],
    ['Cicilan aktif', snap.cicilanAktif.length],
    ['Utang pribadi', snap.utangPribadi.length],
    ['Gadai aktif', snap.gadai.length],
    ['Goals', goals.length],
  ]
}

// ===== Snapshot =====
// 8-column parser-friendly schema per user decision 2026-06-03 (Phase-2
// import readiness):
//   section, id, label, value_source, source_currency, value_idr,
//   suku_bunga_percent, rd_jenis
//
// - `id` enables round-trip identity. For array-backed rows (penghasilanLain,
//   asetLikuid, asetNonLikuid, crypto, cicilan, utang, gadai) it's the row's
//   uuid. For singleton/keyed records (penghasilan gaji, pengeluaran, emas
//   per-kategori) it's a stable string key so importers can match deterministically.
// - `suku_bunga_percent` + `rd_jenis` previously encoded inline in the label
//   ("Deposito BCA 12bln @4.25%/thn") — now split into their own cells so
//   future importers don't need regex parsing.
// - Crypto/gadai rows are still emitted but stay LOSSY (mode/jaminan/etc not
//   carried). Round-trip those via _meta.data_json (canonical source of truth).
export const SNAPSHOT_HEADER: Row = [
  'section',
  'id',
  'label',
  'value_source',
  'source_currency',
  'value_idr',
  'suku_bunga_percent',
  'rd_jenis',
]

export function buildSnapshot(snap: SnapshotState, prices: PricesView): Row[] {
  const rows: Row[] = [SNAPSHOT_HEADER]
  const fx = prices.fxRates

  // Penghasilan — singleton gaji + array of "lain"
  rows.push(
    snapshotMoneyRow(
      'penghasilan',
      'gaji',
      'Gaji Bersih',
      snap.penghasilan.amount,
      snap.penghasilan.currency,
      fx,
    ),
  )
  for (const r of snap.penghasilanLain) {
    rows.push(
      snapshotMoneyRow('penghasilanLain', r.id, r.label, r.amount, r.currency ?? 'IDR', fx),
    )
  }

  // Pengeluaran (IDR only by design)
  rows.push(snapshotMoneyRow('pengeluaran', 'pokok', 'Pokok', snap.pengeluaran.pokok, 'IDR', fx))
  rows.push(
    snapshotMoneyRow('pengeluaran', 'lifestyle', 'Lifestyle', snap.pengeluaran.lifestyle, 'IDR', fx),
  )

  // Aset likuid — sukuBungaPercent + rdJenis now ride in their own cells.
  for (const cat of ['kas', 'deposito', 'reksaDana', 'sbn'] as const) {
    for (const r of snap.asetLikuid[cat]) {
      rows.push(
        snapshotMoneyRow(
          `asetLikuid.${cat}`,
          r.id,
          r.label,
          r.amount,
          r.currency ?? 'IDR',
          fx,
          r.sukuBungaPercent,
          r.rdJenis,
        ),
      )
    }
  }

  // Aset non-likuid (IDR only)
  for (const cat of ['properti', 'kendaraan', 'pensiun'] as const) {
    for (const r of snap.asetNonLikuid[cat]) {
      rows.push(
        snapshotMoneyRow(`asetNonLikuid.${cat}`, r.id, r.label, r.amount, 'IDR', fx),
      )
    }
  }

  // Emas — id = category key (stable across exports; importer maps back via setEmas).
  rows.push(snapshotEmasRow('digital', 'Digital', snap.emas.digitalGram, 'digital', prices))
  rows.push(snapshotEmasRow('fisikAntam', 'Fisik Antam', snap.emas.fisikAntamGram, 'fisikAntam', prices))
  rows.push(snapshotEmasRow('perhiasan18K', 'Perhiasan 18K', snap.emas.perhiasan18KGram, 'perhiasan18K', prices))
  rows.push(snapshotEmasRow('perhiasan14K', 'Perhiasan 14K', snap.emas.perhiasan14KGram, 'perhiasan14K', prices))
  rows.push(snapshotEmasRow('perhiasan10K', 'Perhiasan 10K', snap.emas.perhiasan10KGram, 'perhiasan10K', prices))

  // Crypto — emit value_idr only; mode/coin/cost-basis live in _meta. Lossy
  // by design (user picked narrow refactor; full crypto detail spinout was
  // not in scope).
  for (const c of snap.crypto) {
    rows.push(snapshotCryptoRow(c, prices))
  }

  // Cicilan + utang pribadi + gadai listed under utang side as sisa pokok.
  // Detail lives in Cicilan-Aktif sheet (cicilan), and in _meta.data_json
  // (utangPribadi tempo/cicilan fields, gadai jaminan/gram/asetRef fields).
  for (const c of snap.cicilanAktif) {
    rows.push(
      snapshotMoneyRow('cicilanAktif', c.id, `[${c.tipe}] ${c.label}`, c.sisaPokok, 'IDR', fx),
    )
  }
  for (const u of snap.utangPribadi) {
    rows.push(snapshotMoneyRow('utangPribadi', u.id, u.label, u.sisaPokok, 'IDR', fx))
  }
  for (const g of snap.gadai) {
    rows.push(
      snapshotMoneyRow('gadai', g.id, `${g.label} [${g.jaminan}]`, g.piutangIdr, 'IDR', fx),
    )
  }

  return rows
}

// ----- snapshot row helpers (private) -----

function snapshotMoneyRow(
  section: string,
  id: string,
  label: string,
  amount: number,
  currency: Currency,
  fx: FxRatesMap,
  sukuBungaPercent?: number,
  rdJenis?: string,
): Row {
  return [
    section,
    id,
    label,
    amount,
    currency,
    moneyToIdrOrNull(amount, currency, fx),
    sukuBungaPercent ?? null,
    rdJenis ?? null,
  ]
}

function snapshotEmasRow(
  id: string,
  label: string,
  gram: number,
  cat: EmasCategory,
  prices: PricesView,
): Row {
  return [
    'emas',
    id,
    label,
    gram,
    'gram',
    emasIdrOrNull(gram, cat, prices),
    null,
    null,
  ]
}

function snapshotCryptoRow(c: CryptoHolding, prices: PricesView): Row {
  // Label = coinId only (canonical CoinGecko slug). Custom nickname (c.label)
  // is preserved in _meta.data_json + the dashboard UI; mixing it into this
  // cell as "bitcoin — BTC cold wallet" makes Phase-2 import ambiguous and
  // looks awkward on first read.
  const label = c.coinId
  // source_currency carries the mode marker (unit / IDR / USD / KRW) — that's
  // sufficient to round-trip the crypto mode on import. The coin info is
  // already in the label column above.
  if (c.mode === 'unit') {
    const rate = prices.cryptoByCoinId[c.coinId]?.idr ?? null
    return [
      'crypto',
      c.id,
      label,
      c.units,
      'unit',
      rate !== null ? c.units * rate : null,
      null,
      null,
    ]
  }
  if (c.mode === 'idr') {
    return ['crypto', c.id, label, c.amount, 'IDR', c.amount, null, null]
  }
  const fxKey: Exclude<Currency, 'IDR'> = c.mode === 'usd' ? 'USD' : 'KRW'
  const rate = prices.fxRates[fxKey]
  return [
    'crypto',
    c.id,
    label,
    c.amount,
    fxKey,
    rate !== null ? c.amount * rate : null,
    null,
    null,
  ]
}

function moneyToIdrOrNull(
  amount: number,
  currency: Currency,
  fx: FxRatesMap,
): number | null {
  if (currency === 'IDR') return amount
  const rate = fx[currency]
  return rate !== null && rate !== undefined ? amount * rate : null
}

function emasIdrOrNull(
  gram: number,
  cat: EmasCategory,
  prices: PricesView,
): number | null {
  if (gram <= 0) return 0
  const rate = ratePerGram(cat, prices)
  // ratePerGram returns 0 when the relevant price (digital or Antam) is
  // null — treat as "missing" not "worthless" so the cell stays blank.
  return rate > 0 ? gram * rate : null
}

// ===== Per-Emiten =====
// Uses the same effectiveStockPrice precedence as the dashboard so per-emiten
// card values reconcile with the workbook. PRD §7 originally listed
// `target_bobot` as a column, but the Day 4.7 product decision hid that field
// from the UI (lib/types/snapshot.ts:80-83 — "Currently NOT fed into any
// metric"); column dropped here to avoid a perma-null column. `id` added at
// the start so re-import can preserve row identity (matters when other sheets
// reference the saham by row, e.g. future scenario sheets).
export const PER_EMITEN_HEADER: Row = [
  'id',
  'ticker',
  'lots_current',
  'lots_target',
  'price_live',
  'valuasi',
  'bobot_live',
  'progress_pct',
  'avg_dividend_yield',
  'last_dividend',
  'potential_dividend',
]

export function buildPerEmiten(
  saham: StockHolding[],
  prices: PricesView,
): Row[] {
  const rows: Row[] = [PER_EMITEN_HEADER]
  const totalValuasi = saham.reduce(
    (s, h) =>
      s +
      h.lot *
        100 *
        effectiveStockPrice(h, prices.idxByTicker[h.ticker] ?? null),
    0,
  )
  for (const s of saham) {
    const livePrice = prices.idxByTicker[s.ticker] ?? null
    const effPrice = effectiveStockPrice(s, livePrice)
    const valuasi = s.lot * 100 * effPrice
    const bobotLive = totalValuasi > 0 ? (valuasi / totalValuasi) * 100 : 0
    const progress =
      s.lotsTarget !== undefined && s.lotsTarget > 0
        ? (s.lot / s.lotsTarget) * 100
        : null
    const potentialDiv = calcPotentialDividendIdr(s, livePrice)
    rows.push([
      s.id,
      s.ticker,
      s.lot,
      s.lotsTarget ?? null,
      // price_live shows the live IDX rate when present; falls back to cost
      // basis so the column is never blank (consumer can spot the fallback
      // by comparing against avg, but at least the cell isn't #N/A).
      livePrice ?? s.hargaRataRata,
      valuasi,
      round2(bobotLive),
      progress !== null ? round2(progress) : null,
      s.avgDividendYieldPercent ?? null,
      s.lastDividendPerLembar ?? null,
      potentialDiv,
    ])
  }
  return rows
}

// ===== Cicilan-Aktif =====
// total_beban_sisa = remaining principal + projected interest (anuitas / flat
// / floating use the existing helpers; revolving falls back when minimum
// payment doesn't clear monthly interest).
export const CICILAN_HEADER: Row = [
  'cicilan_id',
  'tipe',
  'label',
  'sisa_pokok',
  'cicilan_per_bulan',
  'suku_bunga',
  'tenor_sisa_bulan',
  'jenis_bunga',
  'total_beban_sisa',
  'tanggal_jatuh_tempo',
]

export function buildCicilanAktif(cicilan: CicilanRow[]): Row[] {
  const rows: Row[] = [CICILAN_HEADER]
  for (const c of cicilan) {
    rows.push([
      c.id,
      c.tipe,
      c.label,
      c.sisaPokok,
      c.cicilanPerBulan,
      c.sukuBunga ?? null,
      c.tenorSisaBulan ?? null,
      c.jenisBunga,
      computeTotalBebanSisa(c),
      c.tanggalJatuhTempo ?? null,
    ])
  }
  return rows
}

function computeTotalBebanSisa(c: CicilanRow): number | null {
  if (c.sisaPokok <= 0) return 0
  const bunga = c.sukuBunga ?? 0
  if (c.jenisBunga === 'Revolving') {
    if (c.cicilanPerBulan <= 0 || c.sisaPokok <= 0) return null
    const r = revolving(c.sisaPokok, bunga / 12, c.cicilanPerBulan / c.sisaPokok)
    return r.totalBunga !== null ? r.totalBunga + c.sisaPokok : null
  }
  const tenor = c.tenorSisaBulan ?? 0
  if (tenor <= 0) return null
  if (c.jenisBunga === 'Flat') return flat(c.sisaPokok, bunga, tenor).totalBayar
  if (c.jenisBunga === 'Floating')
    return floating(c.sisaPokok, bunga, tenor).totalBayar
  return anuitas(c.sisaPokok, bunga, tenor).totalBayar
}

// ===== Goals =====
// Reuses goalProgress so column values match the Goals page exactly.
// bucket_json stays serialized (the categories list is rarely useful in
// per-cell form; importers can JSON.parse for round-trip).
export const GOALS_HEADER: Row = [
  'goal_id',
  'goal_type',
  'label',
  'target_amount',
  'target_date',
  'fi_multiplier',
  'bucket_json',
  'current_progress',
  'monthly_contribution_needed',
  'status',
  'projected_completion',
]

export function buildGoals(
  goals: Goal[],
  snap: SnapshotState,
  opts: {
    fiMultiplier: number
    annualReturnReal: number
    prices?: PricesView
  },
): Row[] {
  const rows: Row[] = [GOALS_HEADER]
  const activeGoalsCount = goals.length
  for (const g of goals) {
    const p = goalProgress(g, snap, { ...opts, activeGoalsCount })
    rows.push([
      g.id,
      g.kind,
      g.label,
      p.targetIdr,
      g.targetDate || null,
      g.kind === 'FI' ? opts.fiMultiplier : null,
      JSON.stringify(g.buckets),
      p.currentIdr,
      p.monthlyInflow,
      p.status,
      p.projection.date,
    ])
  }
  return rows
}

// ===== _meta (hidden) =====
// PRD §7: schema_version, exported_at, data_json. data_json scope per user
// decision = snapshot + goals only (derived is recomputable, scenarios +
// capacity are out of scope for v1).
export function buildMeta(
  ctx: Pick<
    XlsxContext,
    'snap' | 'goals' | 'exportedAt' | 'annualReturnReal' | 'fiMultiplier'
  >,
): Row[] {
  const data = {
    snapshot: ctx.snap,
    goals: {
      goals: ctx.goals,
      assumedAnnualReturnReal: ctx.annualReturnReal,
      fiMultiplier: ctx.fiMultiplier,
    },
  }
  return [
    ['cermat_schema_version', SCHEMA_VERSION],
    ['exported_at', ctx.exportedAt],
    ['data_json', JSON.stringify(data)],
  ]
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
