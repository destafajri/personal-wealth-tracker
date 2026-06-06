<script setup lang="ts">
import { computed } from 'vue'
import { TrendingDown, TrendingUp } from 'lucide-vue-next'
import { useDerivedStore } from '~/stores/derived'
import { idr } from '~/lib/format/idr'

const derived = useDerivedStore()

const surplus = computed(() => derived.surplusIdr)
const income = computed(() => derived.penghasilanMonthlyIdr)
const expense = computed(() => income.value - surplus.value)

const isPositive = computed(() => surplus.value > 0)
const isNegative = computed(() => surplus.value < 0)

const percent = computed(() => {
  if (income.value <= 0) return 0
  return Math.abs((surplus.value / income.value) * 100)
})

// Bar width: expense as % of income, 0-100% capped
const barWidth = computed(() => {
  if (income.value <= 0) return 0
  return Math.min(100, (expense.value / income.value) * 100)
})

const statusText = computed(() => {
  if (income.value <= 0) return 'Isi pendapatan dulu'
  if (isPositive.value) return `${percent.value.toFixed(0)}% dari pendapatan tersisa`
  if (isNegative.value) return `${percent.value.toFixed(0)}% defisit dari pendapatan`
  return 'Pas-pasan'
})
</script>

<template>
  <section
    class="min-w-0 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4"
  >
    <header class="mb-3 flex items-center justify-between">
      <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
        Surplus Bulanan
      </h3>
      <span class="flex items-center gap-1 text-[10px] font-medium" :class="isPositive ? 'text-[var(--color-primary)]' : isNegative ? 'text-[var(--color-danger-rose)]' : 'text-[var(--color-text-muted)]'">
        <TrendingUp v-if="isPositive" :size="12" />
        <TrendingDown v-else-if="isNegative" :size="12" />
        {{ statusText }}
      </span>
    </header>

    <p class="break-all text-2xl font-bold tabular-nums leading-tight" :class="isPositive ? 'text-[var(--color-primary)]' : isNegative ? 'text-[var(--color-danger-rose)]' : 'text-[var(--color-text-primary)]'">
      {{ surplus > 0 ? '+' : '' }}{{ idr(surplus) }}
    </p>

    <!-- Income vs Expense bar -->
    <div class="mt-3">
      <div class="flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
        <span>Pengeluaran {{ income > 0 ? ((expense / income) * 100).toFixed(0) + '%' : '' }}</span>
        <span>Pendapatan</span>
      </div>
      <div class="mt-1 h-2 overflow-hidden rounded-full bg-[var(--color-primary)]/15">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="isPositive ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-danger-rose)]'"
          :style="{ width: barWidth + '%' }"
        />
      </div>
      <div class="mt-1.5 flex items-center justify-between text-[10px]">
        <span class="text-[var(--color-danger-rose)]">{{ idr(expense) }}</span>
        <span class="text-[var(--color-primary)]">{{ idr(income) }}</span>
      </div>
    </div>
  </section>
</template>
