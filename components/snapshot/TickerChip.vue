<script setup lang="ts">
import { computed } from 'vue'
import { tickerColor, readableTextColor } from '~/lib/format/ticker-colors'

// Branded ticker chip — colored circle (or rounded square) with 2-4 letter
// ticker initials. Color comes from the curated brand mapping in
// lib/format/ticker-colors.ts, falling back to a deterministic hash color for
// unmapped tickers. Text color auto-contrasts against the background to meet
// WCAG AA. Robinhood/Stockbit-style visual identity per holding.
//
// Real-logo attempts (TV CDN, Clearbit, etc) all returned 403/deprecated when
// tested 2026-06-19. Manual curated logos is the only path forward — deferred.
const props = withDefaults(
  defineProps<{
    ticker: string
    size?: 'sm' | 'md' | 'lg'
    square?: boolean
  }>(),
  {
    size: 'md',
    square: false,
  },
)

const bg = computed(() => tickerColor(props.ticker))
const fg = computed(() => readableTextColor(bg.value))

// 2-letter abbreviation for compact display. Full 4-letter IDX tickers show
// as-is; longer crypto symbols get first 3-4 chars.
const initials = computed(() => {
  const t = props.ticker.trim().toUpperCase()
  if (!t) return '?'
  if (t.length <= 4) return t
  return t.slice(0, 4)
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-7 w-7 text-[10px]'
    case 'lg':
      return 'h-12 w-12 text-base'
    default:
      return 'h-9 w-9 text-xs'
  }
})

// Inline style for color — Tailwind can't generate dynamic hex classes, so we
// bind via :style. The chip still gets its layout classes from Tailwind.
const chipStyle = computed(() => ({
  backgroundColor: bg.value,
  color: fg.value,
}))
</script>

<template>
  <span
    :class="[
      'inline-flex shrink-0 items-center justify-center font-bold uppercase tracking-wide tabular-nums',
      sizeClass,
      square ? 'rounded-md' : 'rounded-full',
    ]"
    :style="chipStyle"
    :aria-label="`Ticker ${ticker || 'kosong'}`"
  >
    {{ initials }}
  </span>
</template>
