<script setup lang="ts">
import { Info } from 'lucide-vue-next'
import { t } from '~/lib/copy/strings'

withDefaults(defineProps<{ message?: string }>(), {
  message: () => t('banner.simulation.disclaimer'),
})
</script>

<template>
  <div
    class="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-4 py-3 text-sm text-[var(--color-text-secondary)]"
  >
    <Info class="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-text-muted)]" />
    <p>{{ message }}</p>
  </div>
</template>
