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
  CicilanRow,
  PricesView,
  SnapshotState,
  StockHolding,
} from '~/lib/types/snapshot'
import { anuitas, flat, floating, revolving } from '~/lib/finance/amortization'
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
// Flat 4-column layout: section, label, value, unit_or_currency. Value
// stays in source currency; FX conversion is consumer-side (matches PRD §7's
// "raw snapshot input" framing).
export function buildSnapshot(snap: SnapshotState): Row[] {
  const rows: Row[] = [['section', 'label', 'value', 'unit_or_currency']]

  // Penghasilan
  rows.push([
    'penghasilan',
    'Gaji Bersih',
    snap.penghasilan.amount,
    snap.penghasilan.currency,
  ])
  for (const r of snap.penghasilanLain) {
    rows.push(['penghasilanLain', r.label, r.amount, r.currency ?? 'IDR'])
  }

  // Pengeluaran
  rows.push(
    ['pengeluaran', 'Pokok', snap.pengeluaran.pokok, 'IDR'],
    ['pengeluaran', 'Lifestyle', snap.pengeluaran.lifestyle, 'IDR'],
  )

  // Aset likuid (sukuBungaPercent / rdJenis surfaced inline in label so the
  // row stays 4-column)
  for (const cat of ['kas', 'deposito', 'reksaDana', 'sbn'] as const) {
    for (const r of snap.asetLikuid[cat]) {
      const extra =
        r.sukuBungaPercent !== undefined
          ? ` @${r.sukuBungaPercent}%/thn`
          : r.rdJenis !== undefined
            ? ` [${r.rdJenis}]`
            : ''
      rows.push([
        `asetLikuid.${cat}`,
        `${r.label}${extra}`,
        r.amount,
        r.currency ?? 'IDR',
      ])
    }
  }

  // Aset non-likuid
  for (const cat of ['properti', 'kendaraan', 'pensiun'] as const) {
    for (const r of snap.asetNonLikuid[cat]) {
      rows.push([`asetNonLikuid.${cat}`, r.label, r.amount, 'IDR'])
    }
  }

  // Emas (per-kategori gram)
  rows.push(
    ['emas', 'Digital (g)', snap.emas.digitalGram, 'gram'],
    ['emas', 'Fisik Antam (g)', snap.emas.fisikAntamGram, 'gram'],
    ['emas', 'Perhiasan 18K (g)', snap.emas.perhiasan18KGram, 'gram'],
    ['emas', 'Perhiasan 14K (g)', snap.emas.perhiasan14KGram, 'gram'],
    ['emas', 'Perhiasan 10K (g)', snap.emas.perhiasan10KGram, 'gram'],
  )

  // Crypto — per-row, mode-aware (unit vs idr/usd/krw)
  for (const c of snap.crypto) {
    const labelExtra = c.label ? ` — ${c.label}` : ''
    if (c.mode === 'unit') {
      rows.push(['crypto', `${c.coinId}${labelExtra}`, c.units, 'unit'])
    } else {
      rows.push([
        'crypto',
        `${c.coinId}${labelExtra}`,
        c.amount,
        c.mode.toUpperCase(),
      ])
    }
  }

  // Cicilan + utang pribadi + gadai listed under utang side as sisa pokok.
  // Per-cicilan detail is in the Cicilan-Aktif sheet.
  for (const c of snap.cicilanAktif) {
    rows.push(['cicilanAktif', `[${c.tipe}] ${c.label}`, c.sisaPokok, 'IDR'])
  }
  for (const u of snap.utangPribadi) {
    rows.push(['utangPribadi', u.label, u.sisaPokok, 'IDR'])
  }
  for (const g of snap.gadai) {
    rows.push(['gadai', `${g.label} [${g.jaminan}]`, g.piutangIdr, 'IDR'])
  }

  return rows
}

// ===== Per-Emiten =====
// Columns per PRD §7. Uses the same effectiveStockPrice precedence as the
// dashboard so per-emiten card values reconcile with the workbook.
export const PER_EMITEN_HEADER: Row = [
  'ticker',
  'lots_current',
  'lots_target',
  'price_live',
  'valuasi',
  'target_bobot',
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
      s.ticker,
      s.lot,
      s.lotsTarget ?? null,
      // price_live shows the live IDX rate when present; falls back to cost
      // basis so the column is never blank (consumer can spot the fallback
      // by comparing against avg, but at least the cell isn't #N/A).
      livePrice ?? s.hargaRataRata,
      valuasi,
      s.bobotTargetPercent ?? null,
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
