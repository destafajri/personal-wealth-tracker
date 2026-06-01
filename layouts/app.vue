<script setup lang="ts">
import TopNav from '~/components/layout/TopNav.vue'
import TabBar from '~/components/layout/TabBar.vue'
import DashboardPanel from '~/components/layout/DashboardPanel.vue'
import FooterDisclaimer from '~/components/layout/FooterDisclaimer.vue'
import MetricExplainerModal from '~/components/dashboard/MetricExplainerModal.vue'
import WizardHost from '~/components/simulator/WizardHost.vue'
</script>

<template>
  <div class="min-h-screen bg-[var(--color-surface)] pb-16 md:pb-0">
    <TopNav />
    <TabBar />
    <div class="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 md:px-10">
      <div class="grid gap-6 md:grid-cols-[45fr_55fr] md:gap-8">
        <main class="min-w-0">
          <slot />
        </main>
        <aside
          class="min-w-0 md:sticky md:top-[calc(4rem+57px)] md:max-h-[calc(100vh-4rem-57px)] md:self-start md:overflow-y-auto"
        >
          <DashboardPanel />
        </aside>
      </div>
    </div>
    <FooterDisclaimer />
    <MetricExplainerModal />
    <WizardHost />
  </div>
</template>
