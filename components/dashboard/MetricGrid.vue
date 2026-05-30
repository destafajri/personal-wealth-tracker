<script setup lang="ts">
// PRD §5.4 layout: 6 health metrics under Hero pair. Goal Health (composite) is
// shown alongside the Goal cards panel, NOT here — surfaces in Day 5.
import MetricCard from '~/components/dashboard/MetricCard.vue'
import { useDerivedStore } from '~/stores/derived'

const derived = useDerivedStore()
</script>

<template>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <MetricCard
      threshold-key="dsr"
      label-key="metric.dsr.label"
      empty-key="metric.empty.dsr"
      explainer-key="dsr"
      :value="derived.dsr"
      unit="percent"
    />
    <MetricCard
      threshold-key="runway"
      label-key="metric.runway.label"
      empty-key="metric.empty.runway"
      explainer-key="runway"
      :value="derived.runway"
      unit="months"
    />
    <MetricCard
      threshold-key="savingsRate"
      label-key="metric.savingsRate.label"
      empty-key="metric.empty.savingsRate"
      explainer-key="savingsRate"
      :value="derived.savingsRate"
      unit="percent"
    />
    <MetricCard
      threshold-key="dar"
      label-key="metric.dar.label"
      empty-key="metric.empty.dar"
      explainer-key="dar"
      :value="derived.dar"
      unit="percent"
    />
    <MetricCard
      threshold-key="safeHaven"
      label-key="metric.safeHaven.label"
      empty-key="metric.empty.safeHaven"
      explainer-key="safeHaven"
      :value="derived.safeHaven"
      unit="percent"
    />
    <MetricCard
      threshold-key="allocationDiscipline"
      label-key="metric.allocationDiscipline.label"
      empty-key="metric.empty.allocationDiscipline"
      explainer-key="allocationDiscipline"
      :value="derived.allocationDiscipline"
      unit="pp"
    />
  </div>
</template>
