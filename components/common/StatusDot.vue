<script setup lang="ts">
import { computed } from 'vue'

type Status = 'sehat' | 'waspada' | 'bahaya' | 'neutral'

const props = withDefaults(defineProps<{ status?: Status; label?: string }>(), {
  status: 'neutral',
  label: undefined,
})

const colorClass = computed(() => {
  switch (props.status) {
    case 'sehat':
      return 'bg-[var(--color-accent-emerald)]'
    case 'waspada':
      return 'bg-[var(--color-warning-amber)]'
    case 'bahaya':
      return 'bg-[var(--color-danger-rose)]'
    default:
      return 'bg-[var(--color-border-strong)]'
  }
})
</script>

<template>
  <span class="inline-flex items-center gap-1.5" :aria-label="label || status">
    <span class="h-2 w-2 rounded-full" :class="colorClass" />
    <span v-if="label" class="text-xs text-[var(--color-text-secondary)]">{{ label }}</span>
  </span>
</template>
