import { cadanganGoldIdr, totalGoldIdr } from '~/lib/finance/emas'
import { rateToIdr, rowToIdr } from '~/lib/finance/fx'
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
export function sumCryptoIdr(crypto: CryptoHolding[], prices?: PricesView): number {
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

// Per-row annual potential dividend (IDR / tahun). Precedence: literal lastDividend wins
// (concrete, user-provided number) over the yield-percent path (yield × valuation). Both
// optional — returns 0 when neither is set. Exported so panels / form can show per-row
// figures with the same math used in aggregates.
export function calcPotentialDividendIdr(
  s: StockHolding,
  livePrice: number | null,
): number {
  if (s.lastDividendPerLembar !== undefined && s.lastDividendPerLembar > 0) {
    return s.lot * 100 * s.lastDividendPerLembar
  }
  if (s.avgDividendYieldPercent !== undefined && s.avgDividendYieldPercent > 0) {
    const valuasi = s.lot * 100 * effectiveStockPrice(s, livePrice)
    return valuasi * (s.avgDividendYieldPercent / 100)
  }
  return 0
}

export function calcTotalDividendAnnual(
  stocks: StockHolding[],
  prices?: PricesView,
): number {
  return stocks.reduce(
    (sum, s) =>
      sum + calcPotentialDividendIdr(s, prices?.idxByTicker[s.ticker] ?? null),
    0,
  )
}

// Monthly equivalent of total annual dividend — used to flow saham yield into the
// /BULAN context (Penghasilan section, DSR, Savings Rate). Dividend doesn't actually
// arrive monthly, but the monthly avg is what makes the numbers consistent across the
// snapshot's monthly-cashflow framing.
function dividendMonthly(snap: SnapshotState, prices?: PricesView): number {
  return calcTotalDividendAnnual(snap.saham, prices) / 12
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

// Public so goal projections (lib/finance/goals.ts) compute surplus against the same
// definition the dashboard metrics use — drift would silently make goal cards disagree
// with DSR / Runway / SavingsRate.
export function calcTotalPengeluaran(snap: SnapshotState): number {
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

// Gaji Bersih → IDR. Stale FX rate falls through to 0 (consistent with asset-side rule);
// UI surfaces the stale-rate hint on the form so the user notices.
export function gajiBersihIdr(snap: SnapshotState, prices?: PricesView): number {
  const { amount, currency } = snap.penghasilan
  if (currency === 'IDR') return amount || 0
  const rate = rateToIdr(currency, prices?.fxRates)
  if (rate === null) return 0
  return (amount || 0) * rate
}

// Monthly interest income from sbn/deposito rows. principal (IDR) × (sukuBunga/100) / 12.
// Both `sukuBungaPercent` and `amount` optional → row contributes 0 when missing. Public
// so PenghasilanForm can render per-category breakdowns (mirrors how dividen is exposed).
export function calcBungaMonthlyForRows(rows: AssetRow[], prices?: PricesView): number {
  return rows.reduce((sum, r) => {
    const rate = r.sukuBungaPercent
    if (rate === undefined || rate <= 0) return sum
    const principal = rowToIdr(r, prices?.fxRates)
    return sum + (principal * (rate / 100)) / 12
  }, 0)
}

export function calcBungaSbnMonthly(snap: SnapshotState, prices?: PricesView): number {
  return calcBungaMonthlyForRows(snap.asetLikuid.sbn, prices)
}

// Per-row crypto capital gain % — (liveIdrPerUnit − costIdrPerUnit) / costIdrPerUnit × 100.
// Only meaningful for mode='unit' (other modes input opaque IDR/USD/KRW totals — no
// per-unit comparison possible). Returns null when cost basis is missing, FX rate is
// stale, or live coin price is unavailable. Public so panel + future per-row analytics
// share one definition.
export function calcCryptoCapitalGainPercent(
  c: CryptoHolding,
  prices?: PricesView,
): number | null {
  if (c.mode !== 'unit') return null
  if (c.costBasisPerUnit === undefined || c.costBasisPerUnit <= 0) return null
  if (c.costBasisCurrency === undefined) return null
  const liveIdrPerUnit = prices?.cryptoByCoinId[c.coinId.toLowerCase()]?.idr ?? null
  if (liveIdrPerUnit === null || liveIdrPerUnit <= 0) return null
  const fxRate = rateToIdr(c.costBasisCurrency, prices?.fxRates)
  if (fxRate === null) return null
  const costIdrPerUnit = c.costBasisPerUnit * fxRate
  if (costIdrPerUnit <= 0) return null
  return ((liveIdrPerUnit - costIdrPerUnit) / costIdrPerUnit) * 100
}

export function calcBungaDepositoMonthly(snap: SnapshotState, prices?: PricesView): number {
  return calcBungaMonthlyForRows(snap.asetLikuid.deposito, prices)
}

// Monthly penghasilan in IDR — Gaji Bersih + Σ Penghasilan Lain + monthly avg saham
// dividend + monthly bunga sbn/deposito. Dividend is annual by nature; same /12 framing
// keeps DSR, Runway, Savings Rate consistent in the /BULAN context. Exported so panels
// that surface income-vs-burn warnings (e.g., CicilanAktifPanel `overPenghasilan`) read
// the canonical FX-aware total instead of comparing against `snap.penghasilan.amount`
// raw — which is in source currency and ignores lain/dividen/bunga contributions.
export function totalPenghasilanMonthly(
  snap: SnapshotState,
  prices?: PricesView,
): number {
  return (
    gajiBersihIdr(snap, prices) +
    sumRowsToIdr(snap.penghasilanLain, prices) +
    dividendMonthly(snap, prices) +
    calcBungaSbnMonthly(snap, prices) +
    calcBungaDepositoMonthly(snap, prices)
  )
}

// ----- 3. DSR — Σ cicilan / penghasilan (percent) -----

export function calcDsr(snap: SnapshotState, prices?: PricesView): number | null {
  const peng = totalPenghasilanMonthly(snap, prices)
  if (peng <= 0) return null
  return (sumCicilanPerBulan(snap) / peng) * 100
}

// ----- 4. DAR — total utang / total aset (percent) -----

export function calcDar(snap: SnapshotState, prices?: PricesView): number | null {
  const aset = calcTotalAset(snap, prices)
  if (aset <= 0) return null
  return (calcTotalUtang(snap) / aset) * 100
}

// ----- 5. Runway — aset likuid / total pengeluaran (months) -----

export function calcRunway(snap: SnapshotState, prices?: PricesView): number | null {
  const burn = calcTotalPengeluaran(snap)
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

export function calcSavingsRate(
  snap: SnapshotState,
  prices?: PricesView,
): number | null {
  const peng = totalPenghasilanMonthly(snap, prices)
  if (peng <= 0) return null
  return ((peng - calcTotalPengeluaran(snap)) / peng) * 100
}

// ----- 7. Safe Haven — (Kas + Emas + RD + Deposito) / Total Aset (percent) -----

// Absolute Rp breakdown used by both the Safe Haven ratio and the dashboard
// SafeHavenBar chart. Exposing this as a single helper keeps the chart's slices
// numerically aligned with the metric (no drift between visual and number).
export interface AssetBreakdown {
  safeIdr: number // kas + deposito + RD + emas (per Safe Haven formula)
  totalIdr: number
}

export function calcAssetBreakdown(
  snap: SnapshotState,
  prices?: PricesView,
): AssetBreakdown {
  const a = snap.asetLikuid
  const safeIdr =
    sumRowsToIdr(a.kas, prices) +
    sumRowsToIdr(a.deposito, prices) +
    sumRowsToIdr(a.reksaDana, prices) +
    sumGoldIdr(snap, prices)
  return { safeIdr, totalIdr: calcTotalAset(snap, prices) }
}

export function calcSafeHaven(snap: SnapshotState, prices?: PricesView): number | null {
  const { safeIdr, totalIdr } = calcAssetBreakdown(snap, prices)
  if (totalIdr <= 0) return null
  return (safeIdr / totalIdr) * 100
}

// ----- 8. Allocation Discipline — avg pp drift across stocks (Day 4 will surface, but
// expose the function now for consistency / wizard prep) -----

// Discipline universe = rows where the user set `lotsTarget`. Target bobot is derived
// from `lotsTarget × price` (not an explicit `bobotTargetPercent`), so the metric
// reflects how proportionally close current holdings are to the user's targeted lot
// composition. Both live and target bobots are computed WITHIN the universe so the
// bases are comparable. Rows without lots target are excluded (no baseline to drift
// against). Same `effectiveStockPrice` (override > live > cost basis) feeds both
// live_idr and target_idr — so a price override flows symmetrically into the metric.
// Universe size <2 returns null: composition drift is undefined with a single member
// (live & target bobot both 100% by definition), so reporting "0pp Tight" would be
// misleadingly green. UI surfaces an empty-state hint instead.
export function calcAllocationDiscipline(
  stocks: StockHolding[],
  prices?: PricesView,
): number | null {
  if (stocks.length === 0) return null
  const universe = stocks
    .filter((s) => s.lotsTarget !== undefined && s.lotsTarget > 0)
    .map((s) => {
      const price = effectiveStockPrice(s, prices?.idxByTicker[s.ticker] ?? null)
      return {
        liveIdr: s.lot * 100 * price,
        targetIdr: s.lotsTarget! * 100 * price,
      }
    })
  if (universe.length < 2) return null
  const totalLive = universe.reduce((sum, v) => sum + v.liveIdr, 0)
  const totalTarget = universe.reduce((sum, v) => sum + v.targetIdr, 0)
  if (totalLive <= 0 || totalTarget <= 0) return null
  const driftSum = universe.reduce((acc, v) => {
    const liveBobot = (v.liveIdr / totalLive) * 100
    const targetBobot = (v.targetIdr / totalTarget) * 100
    return acc + Math.abs(liveBobot - targetBobot)
  }, 0)
  return driftSum / universe.length
}

// ----- 9. Goal Health — wired in Day 5; stubbed null here so derived store can wire it now.

// Empty-state hints (per-metric, D0.5) live as `metric.empty.{key}` strings in
// `lib/copy/strings.ts`. Each MetricCard passes its own `emptyKey` literal directly —
// there is no mapping layer in TS, so the registry stays the single source.
// (See lib/finance/thresholds.ts for the canonical MetricKey type used by zoneOf.)
