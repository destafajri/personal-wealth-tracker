<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'emerald' | 'neutral' | 'amber'
    size?: 'sm' | 'md'
  }>(),
  { variant: 'emerald', size: 'sm' },
)
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] font-medium"
    :class="[
      size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
      variant === 'emerald' &&
        'bg-[var(--color-accent-emerald-soft)] text-[var(--color-primary-container)]',
      variant === 'neutral' &&
        'border border-[var(--color-border)] bg-[var(--color-surface-low)] text-[var(--color-text-secondary)]',
      variant === 'amber' &&
        'bg-[var(--color-warning-amber-soft)] text-[var(--color-warning-amber)]',
    ]"
  >
    <slot name="icon" />
    <slot />
  </span>
</template>
