<script setup lang="ts">
import { toRef } from 'vue'
import VChart from 'vue-echarts'
import { useDerivedStore } from '~/stores/derived'
import { useWhatIf } from '~/composables/useWhatIf'
import { idr } from '~/lib/format/idr'
import { cssVar, registerEcharts } from './charts-register'

registerEcharts()

const derived = useDerivedStore()

const netWorth = toRef(derived, 'netWorth')
const monthlyIncome = toRef(derived, 'penghasilanMonthlyIdr')

const {
  monthlyInvestment,
  annualReturn,
  timeHorizon,
  projection,
  finalYear,
} = useWhatIf(netWorth, monthlyIncome)

function fmtM(val: number): string {
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}M`
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(0)}jt`
  return idr(val)
}

const option = computed(() => {
  const pts = projection.value
  if (pts.length === 0) return {}

  const years = pts.map((p) => p.year)

  return {
    aria: { enabled: true, decal: { show: false } },
    tooltip: {
      trigger: 'axis',
      formatter: (params: { seriesName: string; value: number }[]) => {
        const rows = params.map(
          (p) => `${p.seriesName}: ${idr(p.value)}`,
        )
        return rows.join('<br/>')
      },
    },
    legend: {
      bottom: 0,
      textStyle: { fontSize: 11, color: cssVar('--color-text-secondary') },
    },
    grid: { top: 16, right: 16, bottom: 36, left: 64 },
    xAxis: {
      type: 'category',
      data: years.map((y) => `${y} th`),
      axisLabel: { fontSize: 11, color: cssVar('--color-text-muted') },
      axisLine: { lineStyle: { color: cssVar('--color-border') } },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 10,
        color: cssVar('--color-text-muted'),
        formatter: (v: number) => fmtM(v),
      },
      splitLine: { lineStyle: { color: cssVar('--color-border)'), opacity: 0.4 } },
    },
    series: [
      {
        name: 'Konservatif',
        type: 'line',
        data: pts.map((p) => p.conservative),
        smooth: true,
        lineStyle: { color: '#6b7280', type: 'dashed', width: 1.5 },
        itemStyle: { color: '#6b7280' },
        symbol: 'none',
      },
      {
        name: 'Ekspektasi',
        type: 'line',
        data: pts.map((p) => p.expected),
        smooth: true,
        lineStyle: { color: '#059669', width: 2 },
        itemStyle: { color: '#059669' },
        areaStyle: { color: 'rgba(5, 150, 105, 0.08)' },
        symbol: 'none',
      },
      {
        name: 'Optimis',
        type: 'line',
        data: pts.map((p) => p.optimistic),
        smooth: true,
        lineStyle: { color: '#b45309', type: 'dashed', width: 1.5 },
        itemStyle: { color: '#b45309' },
        symbol: 'none',
      },
    ],
  }
})

// Need computed import (already imported above via toRef)
import { computed } from 'vue'
</script>

<template>
  <section
    class="min-w-0 overflow-x-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4"
  >
    <header class="mb-3">
      <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
        Simulasi What-If
      </h3>
      <p class="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
        Eksplorasi proyeksi kekayaan dengan investasi rutin
      </p>
    </header>

    <!-- Sliders -->
    <div class="mb-4 grid gap-4 sm:grid-cols-3">
      <!-- Monthly investment -->
      <label class="block">
        <span class="text-xs text-[var(--color-text-secondary)]">
          Investasi /bulan: <strong class="tabular">{{ idr(monthlyInvestment) }}</strong>
        </span>
        <input
          v-model.number="monthlyInvestment"
          type="range"
          :min="0"
          :max="10_000_000"
          :step="100_000"
          class="mt-1 w-full accent-[var(--color-primary)]"
        />
      </label>

      <!-- Annual return -->
      <label class="block">
        <span class="text-xs text-[var(--color-text-secondary)]">
          Return /tahun: <strong class="tabular">{{ annualReturn }}%</strong>
        </span>
        <input
          v-model.number="annualReturn"
          type="range"
          :min="0"
          :max="20"
          :step="1"
          class="mt-1 w-full accent-[var(--color-primary)]"
        />
      </label>

      <!-- Time horizon -->
      <label class="block">
        <span class="text-xs text-[var(--color-text-secondary)]">
          Jangka waktu: <strong class="tabular">{{ timeHorizon }} tahun</strong>
        </span>
        <input
          v-model.number="timeHorizon"
          type="range"
          :min="1"
          :max="30"
          :step="1"
          class="mt-1 w-full accent-[var(--color-primary)]"
        />
      </label>
    </div>

    <!-- Final year highlight -->
    <div
      v-if="finalYear"
      class="mb-3 rounded-md bg-[var(--color-surface-low)] p-3 text-center"
    >
      <p class="text-xs text-[var(--color-text-secondary)]">
        Dalam <strong>{{ timeHorizon }} tahun</strong> (estimasi):
      </p>
      <p class="mt-1 tabular text-xl font-bold text-[var(--color-primary-dark)]">
        {{ idr(finalYear.expected) }}
      </p>
      <p class="mt-0.5 text-[10px] text-[var(--color-text-muted)]">
        Konservatif: {{ idr(finalYear.conservative) }} — Optimis: {{ idr(finalYear.optimistic) }}
      </p>
    </div>

    <!-- Chart -->
    <div class="h-64 w-full overflow-x-hidden">
      <VChart :option="option" autoresize />
    </div>

    <!-- Inflation disclaimer -->
    <p class="mt-3 text-[10px] italic text-[var(--color-text-muted)]">
      Nilai nominal, belum disesuaikan inflasi (~4%/tahun). Return asumsi bukan jaminan.
    </p>
  </section>
</template>
