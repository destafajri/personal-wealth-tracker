import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import type { GoldPayload } from '~/lib/prices/pegadaian'
import type { FxPayload, IdxPayload, UsdIdrPayload } from '~/lib/prices/yahoo'

const idxCache = new Map<string, IdxPayload>()
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

  async function refresh() {
    const list = tickers.value
    if (list.length === 0) {
      data.value = null
      return
    }
    const key = idxKey(list)
    const cached = idxCache.get(key)
    if (cached) data.value = cached
    pending.value = true
    try {
      const fresh = await $fetch<IdxPayload>('/api/prices/idx', {
        query: { tickers: list.join(',') },
      })
      idxCache.set(key, fresh)
      data.value = fresh
      error.value = null
    } catch (e) {
      error.value = e
    } finally {
      pending.value = false
    }
  }

  watch(tickers, refresh, { immediate: true, deep: true })

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
