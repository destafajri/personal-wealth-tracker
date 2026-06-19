<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

// TradingView Symbol Info wrapper — comprehensive read-only market data
// (price, % change, market cap, P/E, div yield, fundamentals) embedded as a
// script-driven widget. Lazy-loaded on mount, cleaned up on unmount.
//
// TV symbol format:
//   - IDX saham: `IDX:BBRI`
//   - Crypto: `BINANCE:BTCUSDT`
//
// Theme=dark + isTransparent=true to blend with Cermat's dark mode + the parent
// card's surface color. Width 100% so it fills the expanded row responsively.
const props = withDefaults(
  defineProps<{
    symbol: string
    height?: number
    locale?: string
  }>(),
  {
    height: 250,
    locale: 'id',
  },
)

const container = ref<HTMLElement | null>(null)

function embed() {
  if (!container.value || !props.symbol) return
  container.value.innerHTML = ''

  const script = document.createElement('script')
  script.src =
    'https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js'
  script.async = true
  script.type = 'text/javascript'
  script.innerHTML = JSON.stringify({
    symbol: props.symbol,
    colorTheme: 'dark',
    isTransparent: true,
    locale: props.locale,
    width: '100%',
    height: props.height,
  })
  container.value.appendChild(script)
}

onMounted(embed)

watch(() => props.symbol, () => embed())

onBeforeUnmount(() => {
  if (container.value) container.value.innerHTML = ''
})
</script>

<template>
  <div
    class="tradingview-widget-container w-full overflow-hidden rounded-[var(--radius-input)]"
    ref="container"
    :data-symbol="symbol"
  />
</template>
