<script setup lang="ts">
// Decide tab → Simulator (wizard launcher). Right-rail dashboard provided by
// layouts/app.vue. Page hosts WizardLauncher only; the actual wizard modal lives on
// the layout via WizardHost so it can be triggered from anywhere (snapshot dashboard
// quick actions, future deep-linking, etc).
//
// Mirror snapshot/goals pages: pipe prices into derived so the wizard's delta math
// reads the same FX-aware valuations the dashboard shows.
import { computed, watchEffect } from 'vue'
import WizardLauncher from '~/components/simulator/WizardLauncher.vue'
import { t } from '~/lib/copy/strings'
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
useSeoMeta({ title: `${t('simulator.title')} — ${t('brand.name')}` })

const snap = useSnapshotStore()
const derived = useDerivedStore()

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
</script>

<template>
  <div class="space-y-5">
    <h1 class="text-2xl font-semibold text-[var(--color-text-primary)]">
      {{ t('simulator.title') }}
    </h1>
    <p class="text-sm text-[var(--color-text-secondary)]">{{ t('simulator.subtitle') }}</p>
    <WizardLauncher />
  </div>
</template>
