<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'emerald' | 'neutral' | 'amber' | 'rose' | 'sky'
    size?: 'md' | 'lg'
  }>(),
  { variant: 'emerald', size: 'md' },
)
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center rounded-[var(--radius-input)]"
    :class="[
      size === 'lg' ? 'h-12 w-12' : 'h-10 w-10',
      variant === 'emerald' &&
        'bg-[var(--color-accent-emerald-soft)] text-[var(--color-primary)]',
      variant === 'neutral' && 'bg-[var(--color-surface-low)] text-[var(--color-text-secondary)]',
      variant === 'amber' &&
        'bg-[var(--color-warning-amber-soft)] text-[var(--color-warning-amber)]',
      variant === 'rose' &&
        'bg-[var(--color-danger-rose-soft)] text-[var(--color-danger-rose)]',
      variant === 'sky' &&
        'bg-sky-100 text-sky-600',
    ]"
  >
    <slot />
  </span>
</template>
