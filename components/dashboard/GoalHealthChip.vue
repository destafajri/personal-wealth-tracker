<script setup lang="ts">
// Goal Health composite chip — % goals on-track. Placement: alongside Goals (NOT in
// the 6-card MetricGrid) per PRD §5.4 + Codex round-4 finding. zoneOf reuses the
// shared metric threshold table so the chip color follows the same convention as
// dashboard metrics.
import { computed } from 'vue'
import { t } from '~/lib/copy/strings'
import { useDerivedStore } from '~/stores/derived'
import { zoneOf, type Zone } from '~/lib/finance/thresholds'

const derived = useDerivedStore()

const value = computed(() => derived.goalHealth)
const zone = computed<Zone | null>(() =>
  value.value === null ? null : zoneOf('goalHealth', value.value),
)

const ZONE_CLASS: Record<Zone, string> = {
  sehat: 'bg-[var(--color-accent-emerald-soft)] text-[var(--color-accent-emerald)]',
  waspada: 'bg-[var(--color-warning-amber-soft)] text-[var(--color-warning-amber)]',
  bahaya: 'bg-[var(--color-danger-rose-soft)] text-[var(--color-danger-rose)]',
}
</script>

<template>
  <span
    class="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-3 py-1 text-xs font-medium"
    :class="
      zone === null
        ? 'bg-[var(--color-surface-low)] text-[var(--color-text-muted)]'
        : ZONE_CLASS[zone]
    "
    :title="t('dashboard.goalHealth.label')"
  >
    <span class="font-semibold">{{ t('dashboard.goalHealth.label') }}</span>
    <span v-if="value === null">—</span>
    <span v-else class="tabular">{{ t('dashboard.goalHealth.value', { pct: Math.round(value) }) }}</span>
  </span>
</template>
