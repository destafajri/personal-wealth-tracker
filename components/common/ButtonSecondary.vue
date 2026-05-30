<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  { type: 'button', disabled: false },
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center gap-2 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-5 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-surface-low)] disabled:cursor-not-allowed disabled:opacity-40"
  >
    <slot />
  </button>
</template>
