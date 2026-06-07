<script setup lang="ts">
import { computed } from 'vue'
import MetricCard from '~/components/dashboard/MetricCard.vue'
import { useDerivedStore } from '~/stores/derived'
import type { MetricKey } from '~/lib/finance/thresholds'
import type { ExplainerKey } from '~/lib/copy/metric-explainers'
import type { CopyKey } from '~/lib/copy/strings'

type UnitKind = 'percent' | 'months' | 'pp'

interface CardDef {
  key: string
  thresholdKey: MetricKey
  labelKey: CopyKey
  emptyKey: CopyKey
  explainerKey: ExplainerKey
  value: number | null
  unit: UnitKind
}

const derived = useDerivedStore()

const cards = computed<CardDef[]>(() => [
  {
    key: 'dsr',
    thresholdKey: 'dsr',
    labelKey: 'metric.dsr.label',
    emptyKey: 'metric.empty.dsr',
    explainerKey: 'dsr',
    value: derived.dsr,
    unit: 'percent',
  },
  {
    key: 'runway',
    thresholdKey: 'runway',
    labelKey: 'metric.runway.label',
    emptyKey: 'metric.empty.runway',
    explainerKey: 'runway',
    value: derived.runway,
    unit: 'months',
  },
  {
    key: 'savingsRate',
    thresholdKey: 'savingsRate',
    labelKey: 'metric.savingsRate.label',
    emptyKey: 'metric.empty.savingsRate',
    explainerKey: 'savingsRate',
    value: derived.savingsRate,
    unit: 'percent',
  },
  {
    key: 'dar',
    thresholdKey: 'dar',
    labelKey: 'metric.dar.label',
    emptyKey: 'metric.empty.dar',
    explainerKey: 'dar',
    value: derived.dar,
    unit: 'percent',
  },
  {
    key: 'safeHaven',
    thresholdKey: 'safeHaven',
    labelKey: 'metric.safeHaven.label',
    emptyKey: 'metric.empty.safeHaven',
    explainerKey: 'safeHaven',
    value: derived.safeHaven,
    unit: 'percent',
  },
  {
    key: 'allocationDiscipline',
    thresholdKey: 'allocationDiscipline',
    labelKey: 'metric.allocationDiscipline.label',
    emptyKey: 'metric.empty.allocationDiscipline',
    explainerKey: 'allocationDiscipline',
    value: derived.allocationDiscipline,
    unit: 'pp',
  },
])
</script>

<template>
  <div class="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
    <div
      v-for="(card, i) in cards"
      :key="card.key"
      class="animate-fade-slide-up"
      :style="{ animationDelay: `${i * 80}ms` }"
    >
      <MetricCard
        :threshold-key="card.thresholdKey"
        :label-key="card.labelKey"
        :empty-key="card.emptyKey"
        :explainer-key="card.explainerKey"
        :value="card.value"
        :unit="card.unit"
      />
    </div>
  </div>
</template>
