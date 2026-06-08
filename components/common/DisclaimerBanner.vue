<script setup lang="ts">
import { Info } from 'lucide-vue-next'
import { t } from '~/lib/copy/strings'

withDefaults(defineProps<{ message?: string }>(), {
  message: () => t('banner.simulation.disclaimer'),
})
</script>

<template>
  <div
    class="flex items-start gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 py-2.5 text-[12px] leading-5 text-[var(--color-text-secondary)] sm:gap-3 sm:px-4 sm:py-3 sm:text-sm sm:leading-6"
  >
    <Info class="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)] sm:h-4 sm:w-4" />
    <p class="max-w-[26ch] sm:max-w-none">{{ message }}</p>
  </div>
</template>
