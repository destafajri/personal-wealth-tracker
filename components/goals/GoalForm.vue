<script setup lang="ts">
// Add-new-goal form. Always visible at the top of /app/goals — same idiom as snapshot
// panels (no separate modal). Submit resets the entry fields but keeps `kind` selection
// so users can quickly add multiple goals of the same type.
import { computed, ref, watch } from 'vue'
import ButtonPrimary from '~/components/common/ButtonPrimary.vue'
import InputCurrency from '~/components/common/InputCurrency.vue'
import { t, type CopyKey } from '~/lib/copy/strings'
import { useGoalsStore } from '~/stores/goals'
import {
  ALL_BUCKETS,
  DEFAULT_BUCKETS,
  GOAL_KINDS,
  type GoalBucketCategory,
  type GoalKind,
} from '~/lib/types/goals'

const store = useGoalsStore()

const KIND_LABEL: Record<GoalKind, CopyKey> = {
  FI: 'goals.kind.FI',
  DP_RUMAH: 'goals.kind.DP_RUMAH',
  DANA_PENDIDIKAN: 'goals.kind.DANA_PENDIDIKAN',
  CUSTOM: 'goals.kind.CUSTOM',
}

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

const kind = ref<GoalKind>('DP_RUMAH')
const label = ref('')
const targetIdr = ref<number | null>(null)
const targetDate = ref('')
const buckets = ref<GoalBucketCategory[]>([...DEFAULT_BUCKETS.DP_RUMAH])
const monthlyAllocation = ref<number | null>(null)

const isFi = computed(() => kind.value === 'FI')
const fiBlocked = computed(() => isFi.value && store.hasFiGoal)

// Non-FI requires target + date. FI uses targetDate only (target auto-computed).
const submitDisabled = computed(() => {
  if (fiBlocked.value) return true
  if (targetDate.value === '') return true
  if (!isFi.value && (targetIdr.value === null || targetIdr.value <= 0)) return true
  return false
})

// Auto-sync default buckets when kind changes (only if user hasn't customized).
watch(kind, (next) => {
  buckets.value = [...DEFAULT_BUCKETS[next]]
})

function toggleBucket(b: GoalBucketCategory) {
  buckets.value = buckets.value.includes(b)
    ? buckets.value.filter((x) => x !== b)
    : [...buckets.value, b]
}

function submit() {
  if (submitDisabled.value) return
  store.addGoal({
    kind: kind.value,
    label: label.value || undefined,
    targetIdr: isFi.value ? 0 : (targetIdr.value ?? 0),
    targetDate: targetDate.value,
    buckets: [...buckets.value],
    monthlyAllocationIdr:
      monthlyAllocation.value !== null && monthlyAllocation.value > 0
        ? monthlyAllocation.value
        : undefined,
  })
  // Reset entry fields; keep `kind` for quick repeat-entry.
  label.value = ''
  targetIdr.value = null
  targetDate.value = ''
  monthlyAllocation.value = null
}
</script>

<template>
  <section
    class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4 sm:p-6"
  >
    <header class="mb-4">
      <h2 class="text-base font-semibold text-[var(--color-text-primary)]">
        {{ t('goals.form.title') }}
      </h2>
      <p class="mt-1 text-xs text-[var(--color-text-secondary)]">
        {{ t('goals.subtitle') }}
      </p>
    </header>

    <div class="grid gap-3 sm:grid-cols-2">
      <label class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">
          {{ t('goals.form.kindLabel') }}
        </span>
        <select
          v-model="kind"
          class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
        >
          <option v-for="k in GOAL_KINDS" :key="k" :value="k">
            {{ t(KIND_LABEL[k]) }}
          </option>
        </select>
      </label>

      <label class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">
          {{ t('goals.form.labelLabel') }}
        </span>
        <input
          v-model="label"
          type="text"
          :placeholder="t('goals.form.labelPlaceholder')"
          class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
        >
      </label>

      <label v-if="!isFi" class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">
          {{ t('goals.form.targetLabel') }}
        </span>
        <div class="mt-1">
          <InputCurrency
            v-model="targetIdr"
            :placeholder="t('goals.form.targetLabel')"
          />
        </div>
      </label>

      <label class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">
          {{ t('goals.form.targetDateLabel') }}
        </span>
        <input
          v-model="targetDate"
          type="date"
          class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
        >
      </label>

      <label class="block text-xs sm:col-span-2">
        <span class="font-medium text-[var(--color-text-secondary)]">
          {{ t('goals.form.allocationLabel') }}
        </span>
        <div class="mt-1">
          <InputCurrency
            v-model="monthlyAllocation"
            :placeholder="t('goal.edit.allocationPlaceholder')"
          />
        </div>
        <p class="mt-1 text-[11px] text-[var(--color-text-muted)]">
          {{ t('goals.form.allocationHelp') }}
        </p>
      </label>
    </div>

    <div v-if="isFi" class="mt-3 rounded-[var(--radius-input)] bg-[var(--color-surface-low)] p-3 text-xs text-[var(--color-text-secondary)]">
      {{ t('goals.form.fiAuto') }}
    </div>

    <div class="mt-4">
      <span class="text-xs font-medium text-[var(--color-text-secondary)]">
        {{ t('goals.form.bucketsLabel') }}
      </span>
      <p class="mt-1 text-[11px] text-[var(--color-text-muted)]">
        {{ t('goals.form.bucketsHelp') }}
      </p>
      <div class="mt-2 flex flex-wrap gap-2">
        <button
          v-for="b in ALL_BUCKETS"
          :key="b"
          type="button"
          :aria-pressed="buckets.includes(b)"
          class="rounded-[var(--radius-pill)] border px-3 py-1.5 text-xs font-medium transition"
          :class="[
            buckets.includes(b)
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
              : 'border-[var(--color-border)] bg-[var(--color-surface-low)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-secondary)]',
          ]"
          @click="toggleBucket(b)"
        >
          {{ t(BUCKET_LABEL[b]) }}
        </button>
      </div>
    </div>

    <div class="mt-5 flex flex-col items-start gap-2">
      <ButtonPrimary
        type="button"
        :disabled="submitDisabled"
        :disabled-reason="fiBlocked ? t('goals.form.fiBlocked') : t('goals.form.targetRequired')"
        @click="submit"
      >
        {{ t('goals.form.submit') }}
      </ButtonPrimary>
      <span
        v-if="fiBlocked"
        class="text-[11px] text-[var(--color-warning-amber-dark)]"
      >
        {{ t('goals.form.fiBlocked') }}
      </span>
    </div>
  </section>
</template>
