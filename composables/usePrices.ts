import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import type { CryptoPayload } from '~/lib/prices/coingecko'
import type { GoldPayload } from '~/lib/prices/pegadaian'
import type { FxPayload, IdxPayload, UsdIdrPayload } from '~/lib/prices/yahoo'

const idxCache = new Map<string, IdxPayload>()
// Crypto cache is a single payload (no per-key map) — the endpoint always returns the
// full top-50 list, so there's only ever one payload to remember.
let cryptoCache: CryptoPayload | null = null
let usdIdrCache: UsdIdrPayload | null = null
// NOTE: no module-level cache for gold — that survived HMR and pinned stale payloads
// when the server schema evolved (e.g., when antam1g was added). Each useGoldPrice()
// call refreshes; /api/prices/gold has its own SWR cache so the network cost stays low.

function idxKey(tickers: string[]): string {
  return [...tickers].sort().join(',')
}

export function useIdxPrices(tickers: Ref<string[]> | ComputedRef<string[]>) {
  const data = ref<IdxPayload | null>(null)
  const error = ref<unknown>(null)
  const pending = ref(false)
  // Sequence guard: typing a ticker letter-by-letter fires N rapid fetches; without
  // this guard, a slow earlier response can land AFTER a faster later one and overwrite
  // the fresh data with stale partial results. Each call bumps seq; the result is only
  // applied if seq is still the latest.
  let seq = 0

  async function refresh() {
    const list = tickers.value
    if (list.length === 0) {
      data.value = null
      return
    }
    const key = idxKey(list)
    const cached = idxCache.get(key)
    if (cached) data.value = cached
    const mySeq = ++seq
    pending.value = true
    try {
      const fresh = await $fetch<IdxPayload>('/api/prices/idx', {
        query: { tickers: list.join(',') },
      })
      idxCache.set(key, fresh)
      if (mySeq === seq) {
        data.value = fresh
        error.value = null
      }
    } catch (e) {
      if (mySeq === seq) error.value = e
    } finally {
      if (mySeq === seq) pending.value = false
    }
  }

  watch(tickers, refresh, { immediate: true, deep: true })

  const isStale = computed(
    () => data.value?.prices.some((p) => p.stale) ?? false,
  )

  return { data, error, pending, isStale, refresh }
}

// Crypto prices: one batched request for the entire top-50 catalog. No args (server
// endpoint sources the catalog itself), single payload cached at module level so HMR
// reuses last-good data. The panel reads per-coin from priceView.cryptoByCoinId without
// re-triggering any fetch when the user adds/edits rows — the keystroke race that
// plagued the symbol-input version is gone because the symbol field is gone.
export function useCryptoPrices() {
  const data = ref<CryptoPayload | null>(cryptoCache)
  const error = ref<unknown>(null)
  const pending = ref(false)

  async function refresh() {
    pending.value = true
    try {
      const fresh = await $fetch<CryptoPayload>('/api/prices/crypto')
      cryptoCache = fresh
      data.value = fresh
      error.value = null
    } catch (e) {
      error.value = e
    } finally {
      pending.value = false
    }
  }

  if (!cryptoCache) void refresh()

  const isStale = computed(
    () => data.value?.prices.some((p) => p.stale) ?? false,
  )

  return { data, error, pending, isStale, refresh }
}

export function useGoldPrice() {
  const data = ref<GoldPayload | null>(null)
  const error = ref<unknown>(null)
  const pending = ref(false)

  async function refresh() {
    pending.value = true
    try {
      const fresh = await $fetch<GoldPayload>('/api/prices/gold')
      data.value = fresh
      error.value = null
    } catch (e) {
      error.value = e
    } finally {
      pending.value = false
    }
  }

  void refresh()

  const isStale = computed(() => data.value?.stale ?? false)

  return { data, error, pending, isStale, refresh }
}

// Aggregate FX rates: USD/SGD/EUR/JPY/KRW → IDR. Single network call; the server endpoint
// (`/api/prices/fx`) fan-outs to Yahoo in parallel. No module-level cache — same reason
// we dropped goldCache (stale-pin across HMR).
export function useFxRates() {
  const data = ref<FxPayload | null>(null)
  const error = ref<unknown>(null)
  const pending = ref(false)

  async function refresh() {
    pending.value = true
    try {
      const fresh = await $fetch<FxPayload>('/api/prices/fx')
      data.value = fresh
      error.value = null
    } catch (e) {
      error.value = e
    } finally {
      pending.value = false
    }
  }

  void refresh()

  const isStale = computed(() => (data.value?.rates ?? []).some((r) => r.stale))

  return { data, error, pending, isStale, refresh }
}

export function useUsdIdr() {
  const data = ref<UsdIdrPayload | null>(usdIdrCache)
  const error = ref<unknown>(null)
  const pending = ref(false)

  async function refresh() {
    pending.value = true
    try {
      const fresh = await $fetch<UsdIdrPayload>('/api/prices/usdidr')
      usdIdrCache = fresh
      data.value = fresh
      error.value = null
    } catch (e) {
      error.value = e
    } finally {
      pending.value = false
    }
  }

  if (!usdIdrCache) void refresh()

  const isStale = computed(() => data.value?.stale ?? false)

  return { data, error, pending, isStale, refresh }
}
