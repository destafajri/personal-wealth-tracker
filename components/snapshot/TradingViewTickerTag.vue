<script setup lang="ts">
import { onMounted } from 'vue'

// TradingView Ticker Tag wrapper — compact inline chip with branded logo +
// live ticker price. Replaces our colored TickerChip with TV's official
// widget when TV is reachable. Fallback to colored chip via slot when TV
// script fails to load (offline, blocked, etc).
//
// Script loaded once globally via DOM injection. Subsequent instances reuse
// the same script tag. The web component (<tv-ticker-tag>) renders once the
// script finishes loading — Vue handles it as a native custom element (see
// nuxt.config.ts vue.compilerOptions.isCustomElement).
const props = defineProps<{
  symbol: string // e.g., 'IDX:BBRI', 'BINANCE:BTCUSDT'
}>()

const SCRIPT_ID = 'tv-ticker-tag-script'
const SCRIPT_SRC = 'https://widgets.tradingview-widget.com/w/en/tv-ticker-tag.js'

onMounted(() => {
  if (document.getElementById(SCRIPT_ID)) return
  const script = document.createElement('script')
  script.id = SCRIPT_ID
  script.type = 'module'
  script.src = SCRIPT_SRC
  script.async = true
  document.head.appendChild(script)
})
</script>

<template>
  <ClientOnly>
    <tv-ticker-tag :symbol="symbol" />
    <template #fallback>
      <slot name="fallback" />
    </template>
  </ClientOnly>
</template>
