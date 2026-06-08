<script setup lang="ts">
import { computed } from 'vue'
import { useDerivedStore } from '~/stores/derived'
import { useCountUp } from '~/composables/useCountUp'
import { t, tm, type CopyKey } from '~/lib/copy/strings'
import { useSnapshotStore } from '~/stores/snapshot'

const snap = useSnapshotStore()

const derived = useDerivedStore()

const score = computed(() => derived.cermatScore.score)
const level = computed(() => derived.cermatScore.level)
const contributions = computed(() => derived.cermatScore.contributions)
const ratio = computed(() => score.value / 1000)
const isDeficit = computed(() => (derived.surplusIdr ?? 0) < 0)

const displayedScore = useCountUp(score)

const mobileContributions = computed(() => {
  const zoneRank = {
    bahaya: 0,
    waspada: 1,
    sehat: 2,
  } as const

  return [...contributions.value].sort((left, right) => {
    const zoneDiff = zoneRank[left.zone] - zoneRank[right.zone]
    if (zoneDiff !== 0) return zoneDiff
    return left.points - right.points
  })
})

// Map contribution keys → copy string keys (same source as MetricGrid)
const CONTRIBUTION_LABELS: Record<string, CopyKey> = {
  dsr: 'metric.dsr.label',
  dar: 'metric.dar.label',
  savingsRate: 'metric.savingsRate.label',
  runway: 'metric.runway.label',
  safeHaven: 'metric.safeHaven.label',
  goalHealth: 'metric.goalHealth.label',
  netWorthVsExpenses: 'metric.netWorthVsExpenses.label',
  allocationDiscipline: 'metric.allocationDiscipline.label',
}

function contributionLabel(key: string): string {
  const copyKey = CONTRIBUTION_LABELS[key]
  return copyKey ? tm(copyKey, snap.mode) : key
}

// SVG ring params
const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const dashOffset = computed(() => CIRCUMFERENCE * (1 - ratio.value))

const tierRingColor = computed(() => {
  const tier = level.value.tier
  if (tier === 0) return 'var(--color-text-muted)'
  if (tier === 5) return 'var(--color-gold, #d97706)'
  return 'var(--color-primary)'
})
</script>

<template>
  <article
    class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-5"
  >
    <div class="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
      <!-- Score ring -->
      <div class="relative flex-shrink-0">
        <svg width="128" height="128" viewBox="0 0 128 128" class="block">
          <!-- Background ring -->
          <circle
            cx="64"
            cy="64"
            :r="RADIUS"
            fill="none"
            stroke="var(--color-surface-low)"
            stroke-width="8"
          />
          <!-- Progress ring -->
          <circle
            cx="64"
            cy="64"
            :r="RADIUS"
            fill="none"
            :stroke="tierRingColor"
            stroke-width="8"
            stroke-linecap="round"
            :stroke-dasharray="CIRCUMFERENCE"
            :stroke-dashoffset="dashOffset"
            transform="rotate(-90 64 64)"
            :class="'transition-[stroke-dashoffset] duration-1000 ease-out'"
          />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="tabular text-3xl font-bold text-[var(--color-text-primary)]">
            {{ displayedScore }}
          </span>
        </div>
      </div>

      <!-- Level + breakdown -->
      <div class="min-w-0 flex-1 text-center sm:text-left">
        <h3 class="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
          Cermat Score
        </h3>
        <div class="mt-1 flex items-center justify-center gap-2 sm:justify-start">
          <span class="text-lg">{{ level.icon }}</span>
          <span
            class="text-lg font-bold"
            :class="level.tier === 0 ? 'text-[var(--color-text-muted)]' : level.color"
          >
            {{ level.label }}
          </span>
          <span v-if="level.tier > 0 && isDeficit" class="text-xs font-medium text-[var(--color-danger-rose)]">
            · Hati-hati Defisit
          </span>
          <span v-else-if="level.tier > 0" class="text-xs text-[var(--color-text-muted)]">
            · {{ level.subtitle }}
          </span>
        </div>
        <p v-if="level.tier === 0" class="mt-2 text-xs text-[var(--color-text-muted)]">
          Isi minimal 3 metrik untuk melihat skor kamu
        </p>

        <!-- Contribution breakdown -->
        <div v-if="level.tier > 0" class="mt-4 border-y border-[var(--color-border)]/60 py-2 sm:hidden">
          <div
            v-for="c in mobileContributions"
            :key="c.metric"
            class="flex items-center justify-between gap-3 py-2.5 text-sm last:pb-0 first:pt-0"
          >
            <div class="flex min-w-0 flex-1 items-center gap-2.5">
              <span
                class="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                :class="{
                  'bg-emerald-500': c.zone === 'sehat',
                  'bg-amber-400': c.zone === 'waspada',
                  'bg-rose-400': c.zone === 'bahaya',
                }"
              />
              <span class="min-w-0 flex-1 leading-snug text-[var(--color-text-secondary)]">
                {{ contributionLabel(c.metric) }}
              </span>
            </div>
            <span class="shrink-0 text-right text-sm tabular font-semibold text-[var(--color-text-primary)]">
              {{ c.points }}/{{ c.maxPoints }}
            </span>
          </div>
        </div>

        <div
          v-if="level.tier > 0"
          class="mt-3 hidden sm:grid sm:grid-cols-2 sm:gap-x-4 sm:gap-y-1.5"
        >
          <div
            v-for="c in contributions"
            :key="c.metric"
            class="flex items-center gap-1.5 text-xs"
          >
            <span
              class="inline-block h-2 w-2 flex-shrink-0 rounded-full"
              :class="{
                'bg-emerald-500': c.zone === 'sehat',
                'bg-amber-400': c.zone === 'waspada',
                'bg-rose-400': c.zone === 'bahaya',
              }"
            />
            <span class="text-[var(--color-text-secondary)]">{{ contributionLabel(c.metric) }}</span>
            <span class="tabular font-medium text-[var(--color-text-primary)]">
              {{ c.points }}/{{ c.maxPoints }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
