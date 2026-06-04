<script setup lang="ts">
import type { Component } from 'vue'
import { Check } from 'lucide-vue-next'

export interface SnapshotTab {
  id: string
  label: string
  icon: Component
}

const props = defineProps<{
  tabs: SnapshotTab[]
  activeId: string
  completedIds?: string[]
}>()

const emit = defineEmits<{
  (e: 'update:activeId', id: string): void
}>()

function isCompleted(id: string) {
  return props.completedIds?.includes(id) ?? false
}
</script>

<template>
  <div
    class="flex items-center gap-1 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-1"
  >
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      :class="[
        'flex min-w-0 flex-1 items-center justify-center gap-2 rounded-[var(--radius-input)] border px-3 py-2 text-sm font-medium transition-colors',
        tab.id === activeId
          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]'
          : 'border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-low)]',
      ]"
      :aria-pressed="tab.id === activeId"
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
      <span class="hidden truncate sm:inline">{{ tab.label }}</span>
    </button>
  </div>
</template>
