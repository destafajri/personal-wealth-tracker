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
    class="inline-flex items-center justify-center gap-2 rounded-[var(--radius-input)] bg-transparent px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-[var(--color-surface-low)] hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
    :class="
      danger ? 'text-[var(--color-danger-rose)]' : 'text-[var(--color-text-primary)]'
    "
  >
    <slot />
  </button>
</template>
