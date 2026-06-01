<script setup lang="ts">
// Compact goal summary on the dashboard rail — mini list (cap 3) + Goal Health chip.
// Each line: status dot + label + percent. No edit affordances — full editing lives
// on the /app/goals page. Empty state: gentle CTA to the Plan tab.
import { computed } from 'vue'
import GoalHealthChip from '~/components/dashboard/GoalHealthChip.vue'
import { t } from '~/lib/copy/strings'
import { useDerivedStore } from '~/stores/derived'
import { useGoalsStore } from '~/stores/goals'
import type { GoalStatus } from '~/lib/types/goals'

const goalsStore = useGoalsStore()
const derived = useDerivedStore()

const MAX_CARDS = 3
const visibleGoals = computed(() => goalsStore.goals.slice(0, MAX_CARDS))

const STATUS_DOT: Record<GoalStatus, string> = {
  on: 'bg-[var(--color-accent-emerald)]',
  'at-risk': 'bg-[var(--color-warning-amber)]',
  off: 'bg-[var(--color-danger-rose)]',
}
</script>

<template>
  <section
    class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4"
  >
    <header class="mb-3 flex items-center justify-between gap-2">
      <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
        {{ t('dashboard.goals.title') }}
      </h3>
      <GoalHealthChip />
    </header>

    <p v-if="visibleGoals.length === 0" class="text-xs text-[var(--color-text-muted)]">
      <NuxtLink to="/app/goals" class="underline hover:text-[var(--color-primary-dark)]">
        {{ t('dashboard.goals.empty') }}
      </NuxtLink>
    </p>

    <ul v-else class="space-y-2">
      <li
        v-for="g in visibleGoals"
        :key="g.id"
        class="flex items-center justify-between gap-3 rounded-[var(--radius-input)] bg-[var(--color-surface-low)] px-3 py-2 text-xs"
      >
        <span class="flex items-center gap-2 truncate">
          <span class="inline-block h-2 w-2 shrink-0 rounded-full" :class="STATUS_DOT[derived.progressFor(g).status]" />
          <span class="truncate font-medium text-[var(--color-text-primary)]">{{ g.label }}</span>
        </span>
        <span class="shrink-0 tabular font-semibold text-[var(--color-text-secondary)]">
          {{ Math.min(100, Math.round(derived.progressFor(g).percent)) }}%
        </span>
      </li>
    </ul>
  </section>
</template>
