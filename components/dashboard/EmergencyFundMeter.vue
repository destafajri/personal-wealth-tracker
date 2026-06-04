<script setup lang="ts">
import { computed } from 'vue'
import { ShieldCheck } from 'lucide-vue-next'
import { useDerivedStore } from '~/stores/derived'

const derived = useDerivedStore()

// derived.runway = months of expenses covered by liquid assets
// Good: >= 6 months, OK: 3-6, Low: 1-3, Critical: < 1
const runway = computed(() => derived.runway ?? 0)
const hasData = computed(() => runway.value > 0)

// Cap display at 12 months for visual purposes
const cappedRunway = computed(() => Math.min(runway.value, 12))
const fillPct = computed(() =>
  hasData.value ? (cappedRunway.value / 12) * 100 : 0,
)

const zone = computed(() => {
  if (!hasData.value) return 'empty'
  if (runway.value >= 6) return 'good'
  if (runway.value >= 3) return 'ok'
  if (runway.value >= 1) return 'low'
  return 'critical'
})

const zoneColor = computed(() => {
  switch (zone.value) {
    case 'good': return 'bg-[var(--color-primary)]'
    case 'ok': return 'bg-[var(--color-capacity-teal)]'
    case 'low': return 'bg-[var(--color-warning-amber)]'
    case 'critical': return 'bg-[var(--color-danger-rose)]'
    default: return 'bg-[var(--color-text-muted)]'
  }
})

const zoneLabel = computed(() => {
  switch (zone.value) {
    case 'good': return 'Aman'
    case 'ok': return 'Cukup'
    case 'low': return 'Kurang'
    case 'critical': return 'Kritis'
    default: return '—'
  }
})

// Milestones: 3, 6, 9, 12 months
const milestones = [3, 6, 9, 12]
</script>

<template>
  <section
    class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4"
  >
    <header class="mb-3 flex items-center justify-between">
      <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
        Dana Darurat
      </h3>
      <span
        v-if="hasData"
        class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
        :class="[
          zone === 'good' && 'bg-[var(--color-accent-emerald-soft)] text-[var(--color-primary)]',
          zone === 'ok' && 'bg-sky-50 text-[var(--color-capacity-teal)]',
          zone === 'low' && 'bg-[var(--color-warning-amber-soft)] text-[var(--color-warning-amber)]',
          zone === 'critical' && 'bg-[var(--color-danger-rose-soft)] text-[var(--color-danger-rose)]',
        ]"
      >
        <ShieldCheck :size="10" />
        {{ zoneLabel }}
      </span>
    </header>

    <!-- Main display -->
    <div class="text-center">
      <span
        class="text-3xl font-bold tabular-nums"
        :class="[
          zone === 'good' && 'text-[var(--color-primary)]',
          zone === 'ok' && 'text-[var(--color-capacity-teal)]',
          zone === 'low' && 'text-[var(--color-warning-amber)]',
          zone === 'critical' && 'text-[var(--color-danger-rose)]',
          zone === 'empty' && 'text-[var(--color-text-muted)]',
        ]"
      >
        {{ hasData ? (runway >= 12 ? '12+' : runway.toFixed(1)) : '—' }}
      </span>
      <span class="ml-1 text-sm text-[var(--color-text-secondary)]">bulan</span>
    </div>

    <!-- Progress bar with milestones -->
    <div class="relative mt-3">
      <div class="h-2 overflow-hidden rounded-full bg-[var(--color-surface-low)]">
        <div
          :class="['h-full rounded-full transition-all duration-500', zoneColor]"
          :style="{ width: fillPct + '%' }"
        />
      </div>
      <!-- Milestone markers -->
      <div
        v-for="m in milestones"
        :key="m"
        class="absolute top-0 h-2 w-px bg-[var(--color-border)]"
        :style="{ left: (m / 12 * 100) + '%' }"
      />
    </div>
    <!-- Milestone labels -->
    <div class="mt-1 flex justify-between text-[10px] text-[var(--color-text-muted)]">
      <span>0</span>
      <span>3</span>
      <span>6</span>
      <span>9</span>
      <span>12</span>
    </div>
    <p class="mt-2 text-center text-[11px] text-[var(--color-text-muted)]">
      Jumlah bulan pengeluaran yang bisa ditutup aset likuid
    </p>
  </section>
</template>
