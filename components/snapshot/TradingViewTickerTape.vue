<script setup lang="ts">
import { onMounted } from 'vue'
import { useTheme } from '~/composables/useTheme'

// TradingView Ticker Tape wrapper — horizontal scrolling strip of market
// symbols (IDX composite, gold, BTC, USD/IDR by default). Web component
// (<tv-ticker-tape>) loaded via TV's official module script. Same lazy-load
// pattern as TradingViewTickerTag — script injected once globally, reused by
// all instances.
//
// Placement: top of Investasi tab. Contextual market overview for users
// entering their investments. Not shown on Cash Flow / Utang / Ringkasan
// tabs (those don't benefit from market ticker).
//
// Theme reactive via useTheme() — when user toggles theme (light/dark/auto),
// the :key binding forces Vue to remount <tv-ticker-tape> with the new theme
// attribute. TV web components don't observe attribute mutations after init,
// so :key is the cleanest way to swap themes.
withDefaults(
  defineProps<{
    // Comma-separated TV symbols. Default = Indonesian market context:
    // IHSG + gold + BTC + USD/IDR. Caller can override per-use.
    symbols?: string
  }>(),
  {
    symbols: 'IDX:COMPOSITE,OANDA:XAUUSD,BITSTAMP:BTCUSD,FX_IDC:USDIDR',
  },
)

const { resolved } = useTheme()

const SCRIPT_ID = 'tv-ticker-tape-script'
const SCRIPT_SRC = 'https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js'

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
    <tv-ticker-tape
      :key="resolved"
      :symbols="symbols"
      :theme="resolved"
    />
    <template #fallback>
      <div class="h-[46px] animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-card)]" />
    </template>
  </ClientOnly>
</template>
