<script setup lang="ts">
import TopNav from '~/components/layout/TopNav.vue'
import TabBar from '~/components/layout/TabBar.vue'
import DashboardSummary from '~/components/layout/DashboardSummary.vue'
import FooterDisclaimer from '~/components/layout/FooterDisclaimer.vue'
import MetricExplainerModal from '~/components/dashboard/MetricExplainerModal.vue'
import SimHost from '~/components/simulator/SimHost.vue'
import { useDirtyGuard } from '~/composables/useDirtyGuard'
import { t } from '~/lib/copy/strings'

useDirtyGuard()
</script>

<template>
  <div class="flex min-h-screen flex-col bg-[var(--color-surface)] pb-16 md:pb-0">
    <TopNav />
    <TabBar />
    <div class="mx-auto w-full max-w-[1440px] flex-1 px-4 pb-2 pt-6 sm:px-6 lg:px-10">
      <div class="grid gap-6 lg:grid-cols-[280px_1fr] lg:gap-8">
        <main class="min-w-0 lg:order-2">
          <!--
            D11.4 — Mobile only. Lets the user jump from the input column to
            the dashboard column below without scrolling the full input list.
            Hidden on lg+ where the dashboard is already in view as a sticky
            aside.
          -->
          <a
            href="#dashboard"
            class="mb-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] lg:hidden"
          >
            {{ t('mobile.viewDashboard') }}
          </a>
          <slot />
        </main>
        <aside
          id="dashboard"
          class="min-w-0 scroll-mt-20 lg:order-1 lg:sticky lg:top-[calc(4rem+57px)] lg:max-h-[calc(100vh-4rem-57px)] lg:self-start lg:overflow-y-auto"
        >
          <DashboardSummary />
        </aside>
      </div>
    </div>
    <FooterDisclaimer />
    <MetricExplainerModal />
    <SimHost />
  </div>
</template>
