<script setup lang="ts">
import { Info } from 'lucide-vue-next'
import { computed } from 'vue'
import StatusDot from '~/components/common/StatusDot.vue'
import { duration } from '~/lib/format/duration'
import { percent } from '~/lib/format/percent'
import { t } from '~/lib/copy/strings'
import { zoneOf, type MetricKey, type Zone } from '~/lib/finance/thresholds'
import { useMetricExplainer } from '~/composables/useMetricExplainer'
import { metricExplainers, type ExplainerKey } from '~/lib/copy/metric-explainers'

type UnitKind = 'percent' | 'months' | 'pp'

const props = defineProps<{
  thresholdKey: MetricKey
  labelKey: Parameters<typeof t>[0]
  emptyKey: Parameters<typeof t>[0]
  explainerKey: ExplainerKey
  value: number | null
  unit: UnitKind
}>()

const explainer = useMetricExplainer()

const zone = computed<Zone | null>(() =>
  props.value === null ? null : zoneOf(props.thresholdKey, props.value),
)

// Label sourced from the explainer registry (single source of truth) so card status
// stays in sync with the popup labels per metric — e.g., Safe Haven shows
// Konservatif/Seimbang/Agresif, Allocation Discipline shows Tight/Drift/Off-Plan,
// instead of falling back to generic Sehat/Waspada/Bahaya.
const zoneLabel = computed(() => {
  if (zone.value === null) return ''
  const zones = metricExplainers[props.explainerKey].zones
  if (!zones) return ''
  const idx = zone.value === 'sehat' ? 0 : zone.value === 'waspada' ? 1 : 2
  return zones[idx]?.label ?? ''
})

const display = computed(() => {
  if (props.value === null) return '—'
  if (props.unit === 'percent') return percent(props.value, 1)
  if (props.unit === 'months') return duration(props.value)
  if (props.unit === 'pp') return `${props.value.toFixed(1)} pp`
  return String(props.value)
})
</script>

<template>
  <article
    class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4 pb-5"
  >
    <header class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-1.5">
        <h4 class="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
          {{ t(labelKey) }}
        </h4>
        <button
          type="button"
          :aria-label="`Penjelasan ${t(labelKey)}`"
          class="inline-flex h-4 w-4 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
          @click="explainer.open(explainerKey)"
        >
          <Info :size="13" />
        </button>
      </div>
      <StatusDot :status="zone ?? 'neutral'" :label="zoneLabel || undefined" />
    </header>
    <p
      class="tabular mt-2 text-xl font-semibold"
      :class="value === null ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text-primary)]'"
    >
      {{ display }}
    </p>
    <p
      v-if="value === null"
      class="mt-1 text-[11px] text-[var(--color-text-secondary)]"
    >
      {{ t(emptyKey) }}
    </p>
  </article>
</template>
