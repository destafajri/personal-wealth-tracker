import type { AssetRow, Currency, FxRatesMap } from '~/lib/types/snapshot'

// Currency conversion to IDR. The single canonical helper used by metric functions and
// UI surfaces — keeps the "what if the rate is stale?" handling in one place.

export function rateToIdr(currency: Currency, fx?: FxRatesMap): number | null {
  if (currency === 'IDR') return 1
  if (!fx) return null
  return fx[currency] ?? null
}

// Returns 0 when the FX rate is stale/missing — the row's value still shows up to the user
// in the panel, but Net Worth / aggregates treat foreign holdings as 0 IDR until rates load.
// The UI is expected to flag stale rates separately so users notice.
export function rowToIdr(row: AssetRow, fx?: FxRatesMap): number {
  const cur: Currency = row.currency ?? 'IDR'
  if (cur === 'IDR') return row.amount || 0
  const rate = rateToIdr(cur, fx)
  if (rate === null) return 0
  return (row.amount || 0) * rate
}

// True when any AssetRow in the array uses a non-IDR currency whose rate is missing from
// the supplied FX map. Used by panels to show a stale-rate hint.
export function anyForeignStale(rows: AssetRow[], fx?: FxRatesMap): boolean {
  for (const r of rows) {
    const cur: Currency = r.currency ?? 'IDR'
    if (cur === 'IDR') continue
    if (!fx || fx[cur] === null) return true
  }
  return false
}
