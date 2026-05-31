import type { CryptoMode } from '~/lib/types/snapshot'

// Decides the patch applied when the user taps a different mode on a crypto row.
// Crossing between currency modes (idr↔usd↔krw) resets `amount` to 0 because the same
// number reinterpreted as a new currency can silently explode portfolio totals
// (e.g., 1.000.000 IDR ≠ 1.000.000 USD ≈ 16B IDR). Unit↔currency does NOT need a reset
// because `units` and `amount` are separate fields.
const CURRENCY_MODES: readonly CryptoMode[] = ['idr', 'usd', 'krw']

export interface CryptoModePatch {
  mode: CryptoMode
  amount?: 0
}

export function nextCryptoModePatch(
  prev: CryptoMode,
  next: CryptoMode,
): CryptoModePatch {
  if (prev === next) return { mode: next }
  const crossingCurrencies =
    CURRENCY_MODES.includes(prev) && CURRENCY_MODES.includes(next)
  return crossingCurrencies ? { mode: next, amount: 0 } : { mode: next }
}
