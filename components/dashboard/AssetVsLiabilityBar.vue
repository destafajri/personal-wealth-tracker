<script setup lang="ts">
import { computed } from 'vue'
import { useDerivedStore } from '~/stores/derived'
import { idr } from '~/lib/format/idr'

const derived = useDerivedStore()

const aset = computed(() => derived.totalAset)
const utang = computed(() => derived.totalUtang)
const total = computed(() => aset.value + utang.value)

const asetPct = computed(() =>
  total.value > 0 ? (aset.value / total.value) * 100 : 0,
)
const utangPct = computed(() =>
  total.value > 0 ? (utang.value / total.value) * 100 : 0,
)

const hasUtang = computed(() => utang.value > 0)
</script>

<template>
  <section
    class="min-w-0 overflow-x-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4"
  >
    <header class="mb-3">
      <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
        Rasio Aset vs Utang
      </h3>
    </header>

    <!-- Stacked bar -->
    <div class="h-4 overflow-x-hidden rounded-full bg-[var(--color-surface-low)]">
      <div class="flex h-full" :style="{ width: '100%' }">
        <div
          class="h-full rounded-l-full bg-[var(--color-primary)] transition-all duration-500"
          :style="{ width: asetPct + '%' }"
        />
        <div
          v-if="hasUtang"
          class="h-full rounded-r-full bg-[var(--color-danger-rose)] transition-all duration-500"
          :style="{ width: utangPct + '%' }"
        />
      </div>
    </div>

    <!-- Legend -->
    <div class="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px]">
      <span class="flex items-center gap-1.5">
        <span class="inline-block h-2 w-2 rounded-full bg-[var(--color-primary)]" />
        <span class="text-[var(--color-text-secondary)]">Aset</span>
        <span class="font-semibold tabular-nums text-[var(--color-text-primary)]">{{ asetPct.toFixed(0) }}%</span>
        <span class="text-[var(--color-text-muted)]">· {{ idr(aset) }}</span>
      </span>
      <span v-if="hasUtang" class="flex items-center gap-1.5">
        <span class="inline-block h-2 w-2 rounded-full bg-[var(--color-danger-rose)]" />
        <span class="text-[var(--color-text-secondary)]">Utang</span>
        <span class="font-semibold tabular-nums text-[var(--color-danger-rose)]">{{ utangPct.toFixed(0) }}%</span>
        <span class="text-[var(--color-text-muted)]">· {{ idr(utang) }}</span>
      </span>
    </div>
  </section>
</template>
