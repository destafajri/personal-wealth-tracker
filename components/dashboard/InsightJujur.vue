<script setup lang="ts">
import type { InsightJujur } from '~/composables/useInsightJujur'

defineProps<{
  insight: InsightJujur | null
}>()
</script>

<template>
  <div
    v-if="insight"
    class="rounded-lg px-4 py-3"
    :class="{
      'bg-rose-50 text-rose-900 dark:bg-rose-950/30 dark:text-rose-100': insight.tone === 'rose',
      'bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-100': insight.tone === 'amber',
    }"
  >
    <p class="text-sm font-medium leading-snug">
      <span class="mr-1 text-base">{{ insight.emoji }}</span>
      {{ insight.copy }}
    </p>
  </div>
</template>
