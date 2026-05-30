<script setup lang="ts">
import HeroPair from '~/components/dashboard/HeroPair.vue'
import MetricGrid from '~/components/dashboard/MetricGrid.vue'
import { useDerivedStore } from '~/stores/derived'
import { t } from '~/lib/copy/strings'

const derived = useDerivedStore()
</script>

<template>
  <section class="flex flex-col gap-4 p-2">
    <template v-if="derived.isEmpty">
      <div
        class="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-card)] p-6 text-center"
      >
        <h2 class="text-base font-semibold text-[var(--color-text-primary)]">
          {{ t('dashboard.empty.title') }}
        </h2>
        <p class="mt-2 text-sm text-[var(--color-text-secondary)]">
          {{ t('dashboard.empty.body') }}
        </p>
      </div>
    </template>
    <template v-else>
      <HeroPair />
      <MetricGrid />
    </template>
  </section>
</template>
