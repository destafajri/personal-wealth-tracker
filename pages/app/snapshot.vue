<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { t } from '~/lib/copy/strings'
import PenghasilanForm from '~/components/snapshot/PenghasilanForm.vue'
import PengeluaranForm from '~/components/snapshot/PengeluaranForm.vue'
import AsetLikuidPanel from '~/components/snapshot/AsetLikuidPanel.vue'
import AsetNonLikuidPanel from '~/components/snapshot/AsetNonLikuidPanel.vue'
import CryptoPanel from '~/components/snapshot/CryptoPanel.vue'
import SahamPanel from '~/components/snapshot/SahamPanel.vue'
import EmasPanel from '~/components/snapshot/EmasPanel.vue'
import CicilanAktifPanel from '~/components/snapshot/CicilanAktifPanel.vue'
import UtangPribadiPanel from '~/components/snapshot/UtangPribadiPanel.vue'
import GadaiPanel from '~/components/snapshot/GadaiPanel.vue'
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
useSeoMeta({ title: `${t('snapshot.title')} — ${t('brand.name')}` })

const snap = useSnapshotStore()
const derived = useDerivedStore()

// Live prices: gold, FX, and the top-52 crypto catalog fire once per session (the
// endpoints/composables handle caching). IDX is gated on having tickers because Yahoo's
// endpoint requires the ticker list up-front; crypto is NOT gated because the whole
// catalog is requested once regardless of what the user picks in the dropdown.
const tickers = computed(() => snap.saham.map((s) => s.ticker).filter(Boolean))
const gold = useGoldPrice()
const fx = useFxRates()
const idx = useIdxPrices(tickers)
const crypto = useCryptoPrices()
const cryptoLiveError = computed(() => crypto.error.value !== null)
const idxLiveError = computed(() => idx.error.value !== null)
const goldLiveError = computed(() => gold.error.value !== null)

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
    <h1 class="sr-only">{{ t('snapshot.title') }}</h1>
    <PenghasilanForm />
    <PengeluaranForm />
    <AsetLikuidPanel />
    <SahamPanel
      :idx-rows="idx.data.value?.prices"
      :live-error="idxLiveError"
      :live-pending="idx.pending.value"
      :on-refresh="idx.refresh"
    />
    <CryptoPanel
      :live-error="cryptoLiveError"
      :live-pending="crypto.pending.value"
      :on-refresh="crypto.refresh"
    />
    <EmasPanel
      :live-error="goldLiveError"
      :live-pending="gold.pending.value"
      :on-refresh="gold.refresh"
    />
    <AsetNonLikuidPanel />
    <CicilanAktifPanel />
    <UtangPribadiPanel />
    <GadaiPanel />
  </div>
</template>
