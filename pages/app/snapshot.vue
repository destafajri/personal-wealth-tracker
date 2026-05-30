<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { t } from '~/lib/copy/strings'
import PenghasilanForm from '~/components/snapshot/PenghasilanForm.vue'
import PengeluaranForm from '~/components/snapshot/PengeluaranForm.vue'
import AsetLikuidPanel from '~/components/snapshot/AsetLikuidPanel.vue'
import AsetNonLikuidPanel from '~/components/snapshot/AsetNonLikuidPanel.vue'
import EmasPanel from '~/components/snapshot/EmasPanel.vue'
import CicilanAktifPanel from '~/components/snapshot/CicilanAktifPanel.vue'
import UtangPribadiPanel from '~/components/snapshot/UtangPribadiPanel.vue'
import GadaiPanel from '~/components/snapshot/GadaiPanel.vue'
import { useSnapshotStore } from '~/stores/snapshot'
import { useDerivedStore } from '~/stores/derived'
import { useFxRates, useGoldPrice, useIdxPrices } from '~/composables/usePrices'
import type { Currency, FxRatesMap, PricesView } from '~/lib/types/snapshot'

definePageMeta({ layout: 'app', ssr: false })
useSeoMeta({ title: `${t('snapshot.title')} — ${t('brand.name')}` })

const snap = useSnapshotStore()
const derived = useDerivedStore()

// Live prices: gold always, IDX only when there are tickers in the snapshot. The derived
// store reads a flat PricesView shape; we project the composables' raw payloads into it.
const tickers = computed(() => snap.saham.map((s) => s.ticker).filter(Boolean))
const gold = useGoldPrice()
const fx = useFxRates()
const idx = useIdxPrices(tickers)

function emptyFxRates(): FxRatesMap {
  return { USD: null, SGD: null, EUR: null, JPY: null, KRW: null }
}

watchEffect(() => {
  const idxMap: Record<string, number | null> = {}
  for (const row of idx.data.value?.prices ?? []) idxMap[row.ticker] = row.price
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
  }
  derived.setPrices(view)
})
</script>

<template>
  <div class="space-y-5">
    <h1 class="sr-only">{{ t('snapshot.title') }}</h1>
    <PenghasilanForm />
    <PengeluaranForm />
    <AsetLikuidPanel />
    <EmasPanel />
    <AsetNonLikuidPanel />
    <CicilanAktifPanel />
    <UtangPribadiPanel />
    <GadaiPanel />
  </div>
</template>
