<script setup lang="ts">
// Plan tab → Goals module. Layout follows snapshot pattern (top form, list below).
// Right rail dashboard is provided by layouts/app.vue (DashboardPanel). The page
// itself only renders the Plan-tab content: assumed return knob + form + goal cards.
import { computed, watchEffect } from 'vue'
import InputCurrency from '~/components/common/InputCurrency.vue'
import GoalForm from '~/components/goals/GoalForm.vue'
import GoalCard from '~/components/goals/GoalCard.vue'
import FiGoalCard from '~/components/goals/FiGoalCard.vue'
import { t } from '~/lib/copy/strings'
import { useGoalsStore } from '~/stores/goals'
import { useSnapshotStore } from '~/stores/snapshot'
import { useDerivedStore } from '~/stores/derived'
import {
  useCryptoPrices,
  useFxRates,
  useGoldPrice,
  useIdxPrices,
} from '~/composables/usePrices'
import type {
  CryptoRateView,
  Currency,
  FxRatesMap,
  PricesView,
} from '~/lib/types/snapshot'

definePageMeta({ layout: 'app', ssr: false })
useSeoMeta({ title: `${t('goals.title')} — ${t('brand.name')}` })

const store = useGoalsStore()
const snap = useSnapshotStore()
const derived = useDerivedStore()

// Mirror snapshot.vue's price-piping: Plan-tab needs prices for bucket valuation
// (saham, crypto, emas, multi-currency liquid). Same composables, same SWR cache.
const tickers = computed(() => snap.saham.map((s) => s.ticker).filter(Boolean))
const gold = useGoldPrice()
const fx = useFxRates()
const idx = useIdxPrices(tickers)
const crypto = useCryptoPrices()

function emptyFxRates(): FxRatesMap {
  return { USD: null, SGD: null, EUR: null, JPY: null, KRW: null }
}

watchEffect(() => {
  const idxMap: Record<string, number | null> = {}
  for (const row of idx.data.value?.prices ?? []) idxMap[row.ticker] = row.price
  const cryptoMap: Record<string, CryptoRateView> = {}
  for (const row of crypto.data.value?.prices ?? []) {
    cryptoMap[row.coinId] = {
      idr: row.idr,
      usd: row.usd,
      eur: row.eur,
      jpy: row.jpy,
      krw: row.krw,
    }
  }
  const fxRates = emptyFxRates()
  for (const row of fx.data.value?.rates ?? []) {
    const base = row.pair.replace(/IDR$/, '') as Exclude<Currency, 'IDR'>
    fxRates[base] = row.rate
  }
  const view: PricesView = {
    goldDigitalIdrPerGram: gold.data.value?.hargaJual ?? null,
    goldAntam1gIdr: gold.data.value?.antam1g ?? null,
    fxRates,
    idxByTicker: idxMap,
    cryptoByCoinId: cryptoMap,
  }
  derived.setPrices(view)
})

// Return assumption input: percent (0–20 typical). Stored as decimal (0.05) in the
// store; UI shows/edits percent so users don't fumble with 0.05 vs 5.
const returnPct = computed({
  get: () => Math.round(store.assumedAnnualReturnReal * 1000) / 10, // 5.0 not 5
  set: (v: number | null) => {
    if (v === null) return
    store.setAssumedReturn(v / 100)
  },
})
</script>

<template>
  <div class="space-y-5">
    <h1 class="text-2xl font-semibold text-[var(--color-text-primary)]">{{ t('goals.title') }}</h1>

    <!-- ESTIMASI banner + return assumption knob -->
    <section
      class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4 sm:p-6"
    >
      <p class="mb-3 text-xs text-[var(--color-text-secondary)]">
        {{ t('goals.banner.estimasi', { pct: returnPct }) }}
      </p>
      <label class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">
          {{ t('goals.returnAssumption.label') }}
        </span>
        <div class="mt-1 max-w-xs">
          <InputCurrency
            v-model="returnPct"
            prefix="%"
            placeholder="5"
          />
        </div>
        <p class="mt-1 text-[11px] text-[var(--color-text-muted)]">
          {{ t('goals.returnAssumption.help') }}
        </p>
      </label>
    </section>

    <GoalForm />

    <section v-if="store.goals.length === 0" class="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] p-8 text-center">
      <p class="text-sm font-medium text-[var(--color-text-primary)]">{{ t('goals.empty.title') }}</p>
      <p class="mt-1 text-xs text-[var(--color-text-secondary)]">{{ t('goals.empty.body') }}</p>
    </section>

    <div v-else class="space-y-4">
      <template v-for="g in store.goals" :key="g.id">
        <FiGoalCard v-if="g.kind === 'FI'" :goal="g" />
        <GoalCard v-else :goal="g" />
      </template>
    </div>
  </div>
</template>
