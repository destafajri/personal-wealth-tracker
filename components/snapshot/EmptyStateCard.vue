<script setup lang="ts">
import type { Component } from 'vue'
import IconChip from '~/components/common/IconChip.vue'

// Reusable empty-state card. Replaces terse one-liners like t('cicilan.empty')
// with icon + 2-sentence body + optional #actions slot for quick-add chips.
// Used across all snapshot panels with empty rows (Phase 8.2).

withDefaults(
  defineProps<{
    icon?: Component
    iconVariant?: 'emerald' | 'neutral' | 'amber' | 'rose' | 'sky'
    title: string
    body: string
  }>(),
  {
    iconVariant: 'neutral',
  },
)
</script>

<template>
  <div
    class="flex items-start gap-3 rounded-[var(--radius-input)] bg-[var(--color-surface-low)] px-3 py-3 text-sm text-[var(--color-text-secondary)]"
    role="status"
  >
    <IconChip v-if="icon" :variant="iconVariant" size="md">
      <component :is="icon" :size="18" :stroke-width="1.75" />
    </IconChip>
    <div class="min-w-0 flex-1 space-y-1">
      <p class="font-medium text-[var(--color-text-primary)]">
        {{ title }}
      </p>
      <p class="text-xs text-[var(--color-text-secondary)]">
        {{ body }}
      </p>
      <div v-if="$slots.actions" class="flex flex-wrap gap-1 pt-1">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
