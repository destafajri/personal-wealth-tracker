<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { useDerivedStore } from '~/stores/derived'
import { idr } from '~/lib/format/idr'
import { percent } from '~/lib/format/percent'
import { t } from '~/lib/copy/strings'
import { cssVar, registerEcharts } from './charts-register'

registerEcharts()

// ECharts canvas can't resolve `var(--color-*)` — resolve to literal hex at mount.
const SAFE_COLOR = cssVar('--color-accent-emerald')
const GROWTH_COLOR = cssVar('--color-warning-amber')

const derived = useDerivedStore()

const safeIdr = computed(() => derived.assetBreakdown.safeIdr)
const totalIdr = computed(() => derived.assetBreakdown.totalIdr)
const growthIdr = computed(() => Math.max(0, totalIdr.value - safeIdr.value))

const hasData = computed(() => totalIdr.value > 0)

const safePct = computed(() =>
  hasData.value ? (safeIdr.value / totalIdr.value) * 100 : 0,
)
const growthPct = computed(() =>
  hasData.value ? (growthIdr.value / totalIdr.value) * 100 : 0,
)

// Single horizontal stacked bar. Two series stacked on one Y category so the bar reads
// left-to-right as Safe → Growth, matching the metric narrative (Safe Haven ratio is
// the left slice).
const option = computed(() => ({
  aria: { enabled: true, decal: { show: false } },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: (
      params: Array<{ seriesName: string; value: number; color: string }>,
    ) =>
      params
        .map(
          (p) =>
            `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:6px"></span>${p.seriesName}: ${idr(p.value)}`,
        )
        .join('<br/>'),
  },
  grid: { left: 8, right: 8, top: 8, bottom: 8, containLabel: false },
  xAxis: { type: 'value', show: false, max: totalIdr.value },
  yAxis: { type: 'category', show: false, data: [''] },
  series: [
    {
      name: t('chart.safeHaven.safe'),
      type: 'bar',
      stack: 'total',
      barWidth: 24,
      itemStyle: {
        color: SAFE_COLOR,
        borderRadius: [6, 0, 0, 6],
      },
      data: [safeIdr.value],
    },
    {
      name: t('chart.safeHaven.growth'),
      type: 'bar',
      stack: 'total',
      barWidth: 24,
      itemStyle: {
        color: GROWTH_COLOR,
        borderRadius: [0, 6, 6, 0],
      },
      data: [growthIdr.value],
    },
  ],
}))
</script>

<template>
  <section
    class="min-w-0 overflow-x-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4"
  >
    <header class="mb-3 flex items-baseline justify-between">
      <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
        {{ t('chart.safeHaven.title') }}
      </h3>
      <span v-if="hasData" class="tabular text-xs text-[var(--color-text-secondary)]">
        {{ idr(totalIdr) }}
      </span>
    </header>

    <template v-if="hasData">
      <div class="h-10 w-full overflow-x-hidden">
        <VChart :option="option" autoresize />
      </div>
      <div class="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div>
          <div class="flex items-center gap-1.5">
            <span class="h-2 w-2 rounded-full bg-[var(--color-accent-emerald)]" />
            <span class="font-medium text-[var(--color-text-primary)]">
              {{ t('chart.safeHaven.safe') }}
            </span>
            <span class="tabular text-[var(--color-text-secondary)]">
              {{ percent(safePct, 1) }}
            </span>
          </div>
          <p class="mt-0.5 break-words text-[11px] text-[var(--color-text-muted)]">
            {{ t('chart.safeHaven.safeDesc') }}
          </p>
          <p class="tabular mt-0.5 text-xs text-[var(--color-text-secondary)]">
            {{ idr(safeIdr) }}
          </p>
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <span class="h-2 w-2 rounded-full bg-[var(--color-warning-amber)]" />
            <span class="font-medium text-[var(--color-text-primary)]">
              {{ t('chart.safeHaven.growth') }}
            </span>
            <span class="tabular text-[var(--color-text-secondary)]">
              {{ percent(growthPct, 1) }}
            </span>
          </div>
          <p class="mt-0.5 break-words text-[11px] text-[var(--color-text-muted)]">
            {{ t('chart.safeHaven.growthDesc') }}
          </p>
          <p class="tabular mt-0.5 text-xs text-[var(--color-text-secondary)]">
            {{ idr(growthIdr) }}
          </p>
        </div>
      </div>
    </template>
    <p
      v-else
      class="flex h-48 items-center justify-center text-xs text-[var(--color-text-muted)]"
    >
      {{ t('chart.safeHaven.empty') }}
    </p>
  </section>
</template>
