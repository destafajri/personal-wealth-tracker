<script setup lang="ts">
// All-empty contract (tech-design Screen 10 / design-guidelines): hero pair + the
// 6-card metric grid always render; per-metric "—" + hint copy handles the empty UX
// via MetricCard. No separate "blank dashboard" placeholder card — that's the path
// the round-4/round-5 Codex review flagged as drift from spec.
//
// Charts (D4.6) are async — ECharts bundle (~80kb gzip tree-shaken) only fetches when
// the dashboard mounts, keeping the initial route payload lean. defineAsyncComponent
// splits each into its own chunk in Vite.
import { defineAsyncComponent, h } from 'vue'
import HeroPair from '~/components/dashboard/HeroPair.vue'
import MetricGrid from '~/components/dashboard/MetricGrid.vue'
import GoalSummaryCards from '~/components/dashboard/GoalSummaryCards.vue'
import ModalOptionsPanel from '~/components/dashboard/ModalOptionsPanel.vue'
import { t } from '~/lib/copy/strings'

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
const SafeHavenBar = defineAsyncComponent({
  loader: () => import('~/components/dashboard/SafeHavenBar.vue'),
  loadingComponent: ChartLoading,
})
</script>

<template>
  <section class="flex flex-col gap-4 p-2">
    <HeroPair />
    <MetricGrid />
    <ModalOptionsPanel />
    <div class="grid gap-4 sm:grid-cols-2">
      <AllocationDonut />
      <SafeHavenBar />
    </div>
    <GoalSummaryCards />
  </section>
</template>
