<script setup lang="ts">
import { computed } from 'vue'
import StatusDot from '~/components/common/StatusDot.vue'
import { duration } from '~/lib/format/duration'
import { percent } from '~/lib/format/percent'
import { t } from '~/lib/copy/strings'
import { zoneOf, type MetricKey, type Zone } from '~/lib/finance/thresholds'

type UnitKind = 'percent' | 'months' | 'pp'

const props = defineProps<{
  thresholdKey: MetricKey
  labelKey: Parameters<typeof t>[0]
  emptyKey: Parameters<typeof t>[0]
  value: number | null
  unit: UnitKind
}>()

const zone = computed<Zone | null>(() =>
  props.value === null ? null : zoneOf(props.thresholdKey, props.value),
)

const zoneLabel = computed(() => {
  if (zone.value === 'sehat') return t('metric.zone.sehat')
  if (zone.value === 'waspada') return t('metric.zone.waspada')
  if (zone.value === 'bahaya') return t('metric.zone.bahaya')
  return ''
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
    class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4"
  >
    <header class="flex items-center justify-between gap-2">
      <h4 class="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
        {{ t(labelKey) }}
      </h4>
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
