<script setup lang="ts">
// All-empty contract (tech-design Screen 10 / design-guidelines): hero pair + the
// 6-card metric grid always render; per-metric "—" + hint copy handles the empty UX
// via MetricCard. No separate "blank dashboard" placeholder card — that's the path
// the round-4/round-5 Codex review flagged as drift from spec.
//
// Charts (D4.6) are async — ECharts bundle (~80kb gzip tree-shaken) only fetches when
// the dashboard mounts, keeping the initial route payload lean. defineAsyncComponent
// splits each into its own chunk in Vite.
import { computed, defineAsyncComponent, h } from 'vue'
import HeroPair from '~/components/dashboard/HeroPair.vue'
import MetricGrid from '~/components/dashboard/MetricGrid.vue'
import PersonaCard from '~/components/dashboard/PersonaCard.vue'
import GoalSummaryCards from '~/components/dashboard/GoalSummaryCards.vue'
import ModalOptionsPanel from '~/components/dashboard/ModalOptionsPanel.vue'
import CtaMamikos from '~/components/common/CtaMamikos.vue'
import { useDerivedStore } from '~/stores/derived'
import { useSnapshotStore } from '~/stores/snapshot'
import { useInsightJujur } from '~/composables/useInsightJujur'
import { t } from '~/lib/copy/strings'

const derived = useDerivedStore()
const snap = useSnapshotStore()
const isBudgetKos = computed(() => snap.mode === 'budgetKos')
const { insight: insightJujur, fires: insightJujurFires } = useInsightJujur()
// D11.6 — gate chart mount on having any asset. Both charts only have meaning
// once there's portfolio data; skipping them on empty state keeps the ECharts
// chunk (~80 KB gzip) off the wire until the user enters their first row. The
// async wrappers remain so the chunks split cleanly when they do load.
const hasAnyAsset = computed(() => derived.totalAset > 0)

const ChartLoading = {
  render() {
    return h(
      'div',
      {
        class:
          'flex h-24 items-center justify-center text-xs text-[var(--color-text-muted)]',
      },
      t('chart.loading'),
    )
  },
}
const AllocationDonut = defineAsyncComponent({
  loader: () => import('~/components/dashboard/AllocationDonut.vue'),
  loadingComponent: ChartLoading,
})
const AssetAllocationDonut = defineAsyncComponent({
  loader: () => import('~/components/dashboard/AssetAllocationDonut.vue'),
  loadingComponent: ChartLoading,
})
const SafeHavenBar = defineAsyncComponent({
  loader: () => import('~/components/dashboard/SafeHavenBar.vue'),
  loadingComponent: ChartLoading,
})
const ExpenseBreakdownDonut = defineAsyncComponent({
  loader: () => import('~/components/dashboard/ExpenseBreakdownDonut.vue'),
  loadingComponent: ChartLoading,
})
const SurplusGauge = defineAsyncComponent({
  loader: () => import('~/components/dashboard/SurplusGauge.vue'),
  loadingComponent: ChartLoading,
})
const AssetVsLiabilityBar = defineAsyncComponent({
  loader: () => import('~/components/dashboard/AssetVsLiabilityBar.vue'),
  loadingComponent: ChartLoading,
})
const EmergencyFundMeter = defineAsyncComponent({
  loader: () => import('~/components/dashboard/EmergencyFundMeter.vue'),
  loadingComponent: ChartLoading,
})
const CermatScoreHero = defineAsyncComponent({
  loader: () => import('~/components/dashboard/CermatScoreHero.vue'),
  loadingComponent: ChartLoading,
})
const AchievementGrid = defineAsyncComponent({
  loader: () => import('~/components/dashboard/AchievementGrid.vue'),
  loadingComponent: ChartLoading,
})
const CashFlowSankey = defineAsyncComponent({
  loader: () => import('~/components/dashboard/CashFlowSankey.vue'),
  loadingComponent: ChartLoading,
})
const WhatIfSimulator = defineAsyncComponent({
  loader: () => import('~/components/dashboard/WhatIfSimulator.vue'),
  loadingComponent: ChartLoading,
})
const InsightJujur = defineAsyncComponent({
  loader: () => import('~/components/dashboard/InsightJujur.vue'),
})
</script>

<template>
  <!--
    D11.5 — aria-live="polite" so screen readers announce metric updates as
    the user fills in / edits snapshot rows. "polite" (not "assertive")
    avoids interrupting in-progress typing.
  -->
  <section class="flex min-w-0 flex-col gap-5 overflow-x-hidden p-3" aria-live="polite" aria-atomic="false">
    <HeroPair />
    <!-- Phase 6.2: Cermat Score + Badges (wealth-tracker only) -->
    <template v-if="!isBudgetKos">
      <CermatScoreHero />
      <AchievementGrid />
    </template>
    <PersonaCard v-if="isBudgetKos" />
    <!-- Phase 7.2: Insight Jujur — spotlight position (after hero, before metrics) -->
    <InsightJujur :insight="insightJujur" />
    <CtaMamikos v-if="isBudgetKos" variant="afterPersona" />
    <!-- New quick-glance row: Surplus Gauge + Emergency Fund -->
    <div class="grid gap-4 lg:grid-cols-2">
      <SurplusGauge />
      <EmergencyFundMeter />
    </div>
    <MetricGrid />
    <!-- Donut charts row -->
    <div v-if="hasAnyAsset">
      <AssetAllocationDonut />
    </div>
    <div class="grid gap-4 lg:grid-cols-2">
      <AllocationDonut />
      <ExpenseBreakdownDonut />
    </div>
    <!-- Bar charts row -->
    <div class="grid gap-4 lg:grid-cols-2">
      <div v-if="hasAnyAsset">
        <SafeHavenBar />
      </div>
      <AssetVsLiabilityBar />
    </div>
    <!-- Phase 6.2: Sankey + What-If (wealth-tracker only) -->
    <template v-if="!isBudgetKos && hasAnyAsset">
      <CashFlowSankey />
      <WhatIfSimulator />
    </template>
    <GoalSummaryCards />
    <ModalOptionsPanel />
    <CtaMamikos v-if="isBudgetKos" variant="dashboardBottom" />
  </section>
</template>
