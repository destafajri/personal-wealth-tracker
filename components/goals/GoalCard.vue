<script setup lang="ts">
// Standard goal card (non-FI). Inline-editable inputs follow the AssetRow / CicilanRow
// pattern — no separate edit mode. Progress + projection come from the derived store
// so they reconcile with the dashboard hero numbers.
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import InputCurrency from '~/components/common/InputCurrency.vue'
import { idr } from '~/lib/format/idr'
import { t, type CopyKey } from '~/lib/copy/strings'
import { useDerivedStore } from '~/stores/derived'
import { useGoalsStore } from '~/stores/goals'
import type { Goal, GoalBucketCategory, GoalStatus } from '~/lib/types/goals'
import { ALL_BUCKETS } from '~/lib/types/goals'

const props = defineProps<{ goal: Goal }>()

const store = useGoalsStore()
const derived = useDerivedStore()

const BUCKET_LABEL: Record<GoalBucketCategory, CopyKey> = {
  kas: 'goals.bucket.kas',
  deposito: 'goals.bucket.deposito',
  reksaDana: 'goals.bucket.reksaDana',
  sbn: 'goals.bucket.sbn',
  saham: 'goals.bucket.saham',
  crypto: 'goals.bucket.crypto',
  emas: 'goals.bucket.emas',
  properti: 'goals.bucket.properti',
  kendaraan: 'goals.bucket.kendaraan',
  pensiun: 'goals.bucket.pensiun',
}

const STATUS_LABEL: Record<GoalStatus, CopyKey> = {
  on: 'goal.status.on',
  'at-risk': 'goal.status.atRisk',
  off: 'goal.status.off',
}

const progress = computed(() => derived.progressFor(props.goal))
const percent = computed(() => Math.min(100, Math.round(progress.value.percent)))

// Tailwind v4 token-class lookup. Picks zone color for status pill + progress bar fill.
const ZONE_CLASS: Record<GoalStatus, { pill: string; fill: string }> = {
  on: {
    pill: 'bg-[var(--color-accent-emerald-soft)] text-[var(--color-accent-emerald)]',
    fill: 'bg-[var(--color-accent-emerald)]',
  },
  'at-risk': {
    pill: 'bg-[var(--color-warning-amber-soft)] text-[var(--color-warning-amber)]',
    fill: 'bg-[var(--color-warning-amber)]',
  },
  off: {
    pill: 'bg-[var(--color-danger-rose-soft)] text-[var(--color-danger-rose)]',
    fill: 'bg-[var(--color-danger-rose)]',
  },
}

function diffMessage(): string {
  const proj = progress.value.projection
  if (proj.date === null) return t('goal.projection.unreachable')
  if (proj.months === 0) return t('goal.projection.complete')
  if (props.goal.targetDate === '') return t('goal.projection.date', { date: proj.date })
  // Compute diff in months between target and projection (positive = late).
  const target = parseIso(props.goal.targetDate)
  const projDate = parseIso(proj.date)
  if (!target || !projDate) return t('goal.projection.date', { date: proj.date })
  const diff =
    (projDate.getFullYear() - target.getFullYear()) * 12 +
    (projDate.getMonth() - target.getMonth())
  if (diff === 0) return t('goal.projection.diffOn')
  if (diff < 0) return t('goal.projection.diffEarly', { months: Math.abs(diff) })
  return t('goal.projection.diffLate', { months: diff })
}

function parseIso(s: string): Date | null {
  if (!/^\d{4}-\d{2}(-\d{2})?$/.test(s)) return null
  const p = s.split('-')
  return new Date(Number(p[0]), Number(p[1]) - 1, p[2] ? Number(p[2]) : 1)
}

function onLabel(e: Event) {
  store.updateGoal(props.goal.id, { label: (e.target as HTMLInputElement).value })
}
function onTargetDate(e: Event) {
  store.updateGoal(props.goal.id, { targetDate: (e.target as HTMLInputElement).value })
}
function onTargetIdr(v: number | null) {
  store.updateGoal(props.goal.id, { targetIdr: v ?? 0 })
}
function onAllocation(v: number | null) {
  store.updateGoal(props.goal.id, {
    monthlyAllocationIdr: v !== null && v > 0 ? v : undefined,
  })
}
function toggleBucket(b: GoalBucketCategory) {
  const next = props.goal.buckets.includes(b)
    ? props.goal.buckets.filter((x) => x !== b)
    : [...props.goal.buckets, b]
  store.updateGoal(props.goal.id, { buckets: next })
}
function remove() {
  store.removeGoal(props.goal.id)
}
</script>

<template>
  <article
    class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4 sm:p-6"
  >
    <header class="mb-3 flex items-start justify-between gap-3">
      <input
        type="text"
        :value="goal.label"
        class="h-10 flex-1 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm font-semibold text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
        @input="onLabel"
      >
      <span
        class="inline-flex shrink-0 items-center rounded-[var(--radius-pill)] px-3 py-1 text-xs font-medium"
        :class="ZONE_CLASS[progress.status].pill"
      >
        ● {{ t(STATUS_LABEL[progress.status]) }}
      </span>
      <button
        type="button"
        :aria-label="t('goal.remove')"
        class="rounded p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-low)] hover:text-[var(--color-danger-rose)]"
        @click="remove"
      >
        <X :size="16" />
      </button>
    </header>

    <div class="mb-2 flex items-baseline justify-between gap-3">
      <span class="text-sm tabular text-[var(--color-text-secondary)]">
        {{ t('goal.progress.label', { current: idr(progress.currentIdr), target: idr(progress.targetIdr) }) }}
      </span>
      <span class="text-sm font-semibold tabular text-[var(--color-text-primary)]">
        {{ percent }}%
      </span>
    </div>

    <div class="mb-4 h-2 w-full overflow-hidden rounded-[var(--radius-pill)] bg-[var(--color-surface-low)]">
      <div
        class="h-full transition-all"
        :class="ZONE_CLASS[progress.status].fill"
        :style="{ width: percent + '%' }"
      />
    </div>

    <div class="grid gap-3 sm:grid-cols-2">
      <label class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">
          {{ t('goal.edit.targetIdr') }}
        </span>
        <div class="mt-1">
          <InputCurrency
            :model-value="goal.targetIdr === 0 ? null : goal.targetIdr"
            @update:model-value="onTargetIdr"
          />
        </div>
      </label>
      <label class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">
          {{ t('goal.edit.targetDate') }}
        </span>
        <input
          type="date"
          :value="goal.targetDate"
          class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
          @change="onTargetDate"
        >
      </label>
      <label class="block text-xs sm:col-span-2">
        <span class="font-medium text-[var(--color-text-secondary)]">
          {{ t('goal.edit.allocation') }}
        </span>
        <div class="mt-1">
          <InputCurrency
            :model-value="goal.monthlyAllocationIdr ?? null"
            :placeholder="t('goal.edit.allocationPlaceholder')"
            @update:model-value="onAllocation"
          />
        </div>
      </label>
    </div>

    <div class="mt-4">
      <span class="text-xs font-medium text-[var(--color-text-secondary)]">
        {{ t('goals.form.bucketsLabel') }}
      </span>
      <div class="mt-2 flex flex-wrap gap-2">
        <button
          v-for="b in ALL_BUCKETS"
          :key="b"
          type="button"
          :aria-pressed="goal.buckets.includes(b)"
          class="rounded-[var(--radius-pill)] border px-2.5 py-1 text-[11px] font-medium transition"
          :class="[
            goal.buckets.includes(b)
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
              : 'border-[var(--color-border)] bg-[var(--color-surface-low)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-secondary)]',
          ]"
          @click="toggleBucket(b)"
        >
          {{ t(BUCKET_LABEL[b]) }}
        </button>
      </div>
      <p v-if="goal.buckets.length === 0" class="mt-2 text-[11px] text-[var(--color-text-muted)]">
        {{ t('goal.bucket.empty') }}
      </p>
    </div>

    <footer class="mt-4 border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-text-secondary)]">
      <div>
        {{ goal.monthlyAllocationIdr
          ? t('goal.contribution.label', { amount: idr(progress.monthlyInflow) })
          : t('goal.contribution.default', { amount: idr(progress.monthlyInflow) }) }}
      </div>
      <div class="mt-1">
        {{ diffMessage() }}
        <span v-if="progress.projection.date && progress.projection.months > 0" class="text-[var(--color-text-muted)]">
          ({{ t('goal.projection.date', { date: progress.projection.date }) }})
        </span>
      </div>
    </footer>
  </article>
</template>
