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
    class="inline-flex items-center justify-center gap-2 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-5 py-3 text-sm font-medium text-[var(--color-text-primary)] shadow-[var(--shadow-sm)] transition-all hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-low)] hover:shadow-[var(--shadow-md)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
  >
    <slot />
  </button>
</template>
