import { cadanganGoldIdr, totalGoldIdr } from '~/lib/finance/emas'
import { rowToIdr } from '~/lib/finance/fx'
import type {
  AssetRow,
  CryptoHolding,
  PricesView,
  SnapshotState,
  StockHolding,
} from '~/lib/types/snapshot'

// Pure metric functions. Return `null` when the prerequisite inputs are missing — UI then
// renders "—" with the per-metric hint (D0.5 decision: per-metric rule, not a global gate).
//
// Modal Siap policy (D0.3 decision): no auto-subtraction of emergency buffer; UI shows
// advisory copy alongside the figure ("Pertimbangkan keep dana darurat 3–6 bulan terpisah").

// ----- helpers -----

// Liquid asset rows can be in IDR/USD/SGD/EUR/JPY (per-row currency). Convert each to IDR
// using the latest FX rate; rows with stale rates fall through to 0 (UI surfaces stale).
function sumRowsToIdr(rows: AssetRow[], prices?: PricesView): number {
  return rows.reduce((s, r) => s + rowToIdr(r, prices?.fxRates), 0)
}

// Crypto holdings with per-row mode (see CryptoHolding doc for full table):
//   - 'unit' → units × cryptoByCoinId[coinId].idr (missing rate drops row from total)
//   - 'idr'  → amount as-is
//   - 'usd'  → amount × fxRates.USD (FX endpoint, not coin's own USD price — keeps math
//             consistent with other multi-currency assets in the snapshot)
//   - 'krw'  → amount × fxRates.KRW
function sumCryptoIdr(crypto: CryptoHolding[], prices?: PricesView): number {
  return crypto.reduce((s, c) => {
    if (c.mode === 'idr') return s + (c.amount || 0)
    if (c.mode === 'usd') {
      const fx = prices?.fxRates.USD ?? null
      return fx === null ? s : s + (c.amount || 0) * fx
    }
    if (c.mode === 'krw') {
      const fx = prices?.fxRates.KRW ?? null
      return fx === null ? s : s + (c.amount || 0) * fx
    }
    // mode === 'unit'
    const cid = (c.coinId || '').toLowerCase()
    if (!cid) return s
    const rate = prices?.cryptoByCoinId[cid]?.idr ?? null
    if (rate === null) return s
    return s + (c.units || 0) * rate
  }, 0)
}

function sumLiquidIdr(snap: SnapshotState, prices?: PricesView): number {
  const a = snap.asetLikuid
  return (
    sumRowsToIdr(a.kas, prices) +
    sumRowsToIdr(a.deposito, prices) +
    sumRowsToIdr(a.reksaDana, prices) +
    sumRowsToIdr(a.sbn, prices) +
    sumCryptoIdr(snap.crypto, prices)
  )
}

// Non-likuid (properti/kendaraan/pensiun) stays IDR-only by product decision.
function sumNonLiquidIdr(snap: SnapshotState): number {
  const a = snap.asetNonLikuid
  return (
    a.properti.reduce((s, r) => s + (r.amount || 0), 0) +
    a.kendaraan.reduce((s, r) => s + (r.amount || 0), 0) +
    a.pensiun.reduce((s, r) => s + (r.amount || 0), 0)
  )
}

function sumGoldIdr(snap: SnapshotState, prices?: PricesView): number {
  // Total emas value = cadangan (per-category × per-category rate) + tertahan (Antam buyback).
  // Both still owned by user; piutang gadai sits separately on the utang side.
  return totalGoldIdr(snap, prices)
}

// Single source of truth for stock valuation precedence: `hargaOverride > live IDX
// > hargaRataRata`. Exported so SahamPanel + PerEmitenCard can use the same helper —
// any drift here would silently make dashboard metrics and per-card display disagree.
// Takes `livePrice` as a plain `number | null` so panel-side callers (which read live
// from IdxPriceRow, not PricesView) don't have to synthesize a PricesView slice.
export function effectiveStockPrice(
  s: StockHolding,
  livePrice: number | null,
): number {
  if (s.hargaOverride !== undefined) return s.hargaOverride
  return livePrice ?? s.hargaRataRata
}

function sumStockIdr(stocks: StockHolding[], prices?: PricesView): number {
  return stocks.reduce(
    (s, h) =>
      s + h.lot * 100 * effectiveStockPrice(h, prices?.idxByTicker[h.ticker] ?? null),
    0,
  )
}

function sumCicilanPerBulan(snap: SnapshotState): number {
  // Formal amortizing + informal personal debt. Both are recurring monthly outflows that
  // drive DSR + Total Pengeluaran (Runway / Savings Rate).
  const cicilan = snap.cicilanAktif.reduce((s, c) => s + (c.cicilanPerBulan || 0), 0)
  const pribadi = snap.utangPribadi.reduce((s, u) => s + (u.cicilanPerBulan || 0), 0)
  return cicilan + pribadi
}

function sumCicilanPokok(snap: SnapshotState): number {
  const cicilan = snap.cicilanAktif.reduce((s, c) => s + (c.sisaPokok || 0), 0)
  const pribadi = snap.utangPribadi.reduce((s, u) => s + (u.sisaPokok || 0), 0)
  return cicilan + pribadi
}

function totalPengeluaran(snap: SnapshotState): number {
  // PRD §5.1.3 / tech-design §6.1: pokok + lifestyle + Σ cicilan_per_bulan.
  return (
    (snap.pengeluaran.pokok || 0) +
    (snap.pengeluaran.lifestyle || 0) +
    sumCicilanPerBulan(snap)
  )
}

// ----- assets / debts (used both as metrics and as inputs to other metrics) -----

export function calcTotalAset(snap: SnapshotState, prices?: PricesView): number {
  return (
    sumLiquidIdr(snap, prices) +
    sumNonLiquidIdr(snap) +
    sumGoldIdr(snap, prices) +
    sumStockIdr(snap.saham, prices)
  )
}

export function calcTotalUtang(snap: SnapshotState): number {
  const gadaiPiutang = snap.gadai.reduce((s, g) => s + (g.piutangIdr || 0), 0)
  return sumCicilanPokok(snap) + gadaiPiutang
}

// ----- 1. Net Worth -----

export function calcNetWorth(snap: SnapshotState, prices?: PricesView): number {
  return calcTotalAset(snap, prices) - calcTotalUtang(snap)
}

// ----- 2. Modal Siap Distribusi -----
//
// PRD §5.4 / §11.4: Kas + Deposito + RD + Crypto Liquid. No auto-subtract of emergency
// buffer (D0.3); the dashboard surface adds the advisory copy "Pertimbangkan keep dana
// darurat 3–6 bulan terpisah."

export function calcModalSiap(snap: SnapshotState, prices?: PricesView): number {
  const a = snap.asetLikuid
  return (
    sumRowsToIdr(a.kas, prices) +
    sumRowsToIdr(a.deposito, prices) +
    sumRowsToIdr(a.reksaDana, prices) +
    sumCryptoIdr(snap.crypto, prices)
  )
}

// ----- 3. DSR — Σ cicilan / penghasilan (percent) -----

export function calcDsr(snap: SnapshotState): number | null {
  if (!snap.penghasilan || snap.penghasilan <= 0) return null
  return (sumCicilanPerBulan(snap) / snap.penghasilan) * 100
}

// ----- 4. DAR — total utang / total aset (percent) -----

export function calcDar(snap: SnapshotState, prices?: PricesView): number | null {
  const aset = calcTotalAset(snap, prices)
  if (aset <= 0) return null
  return (calcTotalUtang(snap) / aset) * 100
}

// ----- 5. Runway — aset likuid / total pengeluaran (months) -----

export function calcRunway(snap: SnapshotState, prices?: PricesView): number | null {
  const burn = totalPengeluaran(snap)
  if (burn <= 0) return null
  // Likuid here = cash-equivalent + tradable financial assets. Excludes gold-tertahan
  // (pawned) since it can't be liquidated without tebus.
  const cashlike =
    sumLiquidIdr(snap, prices) +
    cadanganGoldIdr(snap, prices) +
    sumStockIdr(snap.saham, prices)
  return cashlike / burn
}

// ----- 6. Savings Rate — (penghasilan − totalPengeluaran) / penghasilan -----

export function calcSavingsRate(snap: SnapshotState): number | null {
  if (!snap.penghasilan || snap.penghasilan <= 0) return null
  return ((snap.penghasilan - totalPengeluaran(snap)) / snap.penghasilan) * 100
}

// ----- 7. Safe Haven — (Kas + Emas + RD + Deposito) / Total Aset (percent) -----

export function calcSafeHaven(snap: SnapshotState, prices?: PricesView): number | null {
  const aset = calcTotalAset(snap, prices)
  if (aset <= 0) return null
  const a = snap.asetLikuid
  const safe =
    sumRowsToIdr(a.kas, prices) +
    sumRowsToIdr(a.deposito, prices) +
    sumRowsToIdr(a.reksaDana, prices) +
    sumGoldIdr(snap, prices)
  return (safe / aset) * 100
}

// ----- 8. Allocation Discipline — avg pp drift across stocks (Day 4 will surface, but
// expose the function now for consistency / wizard prep) -----

export function calcAllocationDiscipline(
  stocks: StockHolding[],
  prices?: PricesView,
): number | null {
  if (stocks.length === 0) return null
  const valued = stocks.map((s) => ({
    stock: s,
    idr: s.lot * 100 * effectiveStockPrice(s, prices?.idxByTicker[s.ticker] ?? null),
  }))
  const total = valued.reduce((sum, v) => sum + v.idr, 0)
  if (total <= 0) return null
  const stocksWithTarget = valued.filter((v) => v.stock.bobotTargetPercent !== undefined)
  if (stocksWithTarget.length === 0) return null
  const driftSum = stocksWithTarget.reduce((acc, v) => {
    const liveBobot = (v.idr / total) * 100
    const target = v.stock.bobotTargetPercent!
    return acc + Math.abs(liveBobot - target)
  }, 0)
  return driftSum / stocksWithTarget.length
}

// ----- 9. Goal Health — wired in Day 5; stubbed null here so derived store can wire it now.

// Empty-state hints (per-metric, D0.5) live as `metric.empty.{key}` strings in
// `lib/copy/strings.ts`. Each MetricCard passes its own `emptyKey` literal directly —
// there is no mapping layer in TS, so the registry stays the single source.
// (See lib/finance/thresholds.ts for the canonical MetricKey type used by zoneOf.)
