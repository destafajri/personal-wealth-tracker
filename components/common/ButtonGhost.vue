<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    danger?: boolean
    disabled?: boolean
  }>(),
  { type: 'button', danger: false, disabled: false },
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="inline-flex items-center justify-center gap-2 rounded-[var(--radius-input)] bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-surface-low)] disabled:cursor-not-allowed disabled:opacity-40"
    :class="
      danger ? 'text-[var(--color-danger-rose)]' : 'text-[var(--color-text-primary)]'
    "
  >
    <slot />
  </button>
</template>
