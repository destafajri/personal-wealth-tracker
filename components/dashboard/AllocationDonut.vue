<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { useSnapshotStore } from '~/stores/snapshot'
import { useDerivedStore } from '~/stores/derived'
import { effectiveStockPrice } from '~/lib/finance/metrics'
import { idr } from '~/lib/format/idr'
import { t } from '~/lib/copy/strings'
import { registerEcharts } from './charts-register'

registerEcharts()

const snap = useSnapshotStore()
const derived = useDerivedStore()

// Per-emiten valuation via the shared helper — chart slices read the same Rp the
// dashboard metrics use, so a row's slice width matches its share in Allocation
// Discipline.
const slices = computed(() => {
  const live = derived.priceView?.idxByTicker ?? {}
  return snap.saham
    .map((s) => ({
      ticker: s.ticker || '?',
      value: s.lot * 100 * effectiveStockPrice(s, live[s.ticker] ?? null),
    }))
    .filter((row) => row.value > 0)
})

const total = computed(() => slices.value.reduce((sum, r) => sum + r.value, 0))

const hasData = computed(() => slices.value.length > 0 && total.value > 0)

// Design-token palette — keeps the donut on-brand without echarts default rainbow.
const PALETTE = [
  'var(--color-primary)',
  'var(--color-accent-emerald)',
  'var(--color-warning-amber)',
  'var(--color-capacity-teal)',
  'var(--color-danger-rose)',
  'var(--color-primary-container)',
  'var(--color-text-secondary)',
]

const option = computed(() => ({
  aria: { enabled: true, decal: { show: false } },
  tooltip: {
    trigger: 'item',
    formatter: (params: { name: string; value: number; percent: number }) =>
      `${params.name}<br/>${idr(params.value)} (${params.percent.toFixed(1)}%)`,
  },
  legend: {
    orient: 'horizontal',
    bottom: 0,
    type: 'scroll',
    textStyle: { fontSize: 11 },
  },
  series: [
    {
      name: t('chart.allocation.title'),
      type: 'pie',
      radius: ['55%', '78%'],
      center: ['50%', '42%'],
      avoidLabelOverlap: true,
      label: { show: false },
      labelLine: { show: false },
      data: slices.value.map((s, i) => ({
        name: s.ticker,
        value: s.value,
        itemStyle: { color: PALETTE[i % PALETTE.length] },
      })),
    },
  ],
}))
</script>

<template>
  <section
    class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4"
  >
    <header class="mb-2 flex items-baseline justify-between">
      <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
        {{ t('chart.allocation.title') }}
      </h3>
      <span v-if="hasData" class="tabular text-xs text-[var(--color-text-secondary)]">
        {{ t('chart.allocation.legendTotal') }} {{ idr(total) }}
      </span>
    </header>
    <div v-if="hasData" class="h-64">
      <VChart :option="option" autoresize />
    </div>
    <p
      v-else
      class="flex h-64 items-center justify-center text-xs text-[var(--color-text-muted)]"
    >
      {{ t('chart.allocation.empty') }}
    </p>
  </section>
</template>
