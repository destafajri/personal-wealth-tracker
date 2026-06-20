<script setup lang="ts">
import type { Component } from 'vue'
import { Check } from 'lucide-vue-next'
import TabCountBadge from '~/components/snapshot/TabCountBadge.vue'

export interface SnapshotTab {
  id: string
  label: string
  icon: Component
}

const props = defineProps<{
  tabs: SnapshotTab[]
  activeId: string
  completedIds?: string[]
  // Per-tab row counts for count badges. Keys are tab ids; values are numbers.
  // Omit or pass 0 to hide badge. (Phase 8.3 §4.1)
  counts?: Record<string, number>
}>()

const emit = defineEmits<{
  (e: 'update:activeId', id: string): void
}>()

function isCompleted(id: string) {
  return props.completedIds?.includes(id) ?? false
}

function countOf(id: string): number {
  return props.counts?.[id] ?? 0
}
</script>

<template>
  <div
    class="snapshot-tab-scroll flex items-center gap-1 overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-1"
  >
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      :class="[
        'flex shrink-0 items-center justify-center gap-2 rounded-[var(--radius-input)] border px-3 py-2 text-sm font-medium transition-colors',
        tab.id === activeId
          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]'
          : 'border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-low)]',
      ]"
      :aria-pressed="tab.id === activeId"
      :aria-label="tab.label"
      @click="emit('update:activeId', tab.id)"
    >
      <Check
        v-if="isCompleted(tab.id) && tab.id !== activeId"
        :size="16"
        class="shrink-0 text-[var(--color-primary)]"
        :stroke-width="2.5"
      />
      <component
        :is="tab.icon"
        v-else
        :size="16"
        :stroke-width="1.75"
        class="shrink-0"
      />
      <span class="whitespace-nowrap text-xs sm:text-sm">{{ tab.label }}</span>
      <TabCountBadge :count="countOf(tab.id)" />
    </button>
  </div>
</template>

<style scoped>
/* Hide scrollbar but keep horizontal swipe (Phase 8.3 §4.3 mobile redesign) */
.snapshot-tab-scroll {
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.snapshot-tab-scroll::-webkit-scrollbar {
  display: none;
}
</style>
