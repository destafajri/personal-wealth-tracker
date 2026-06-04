<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    disabledReason?: string
  }>(),
  { type: 'button', disabled: false, disabledReason: undefined },
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :title="disabled ? disabledReason : undefined"
    class="inline-flex items-center justify-center gap-2 rounded-[var(--radius-input)] bg-[var(--color-primary)] px-5 py-3 text-sm font-medium text-white shadow-[var(--shadow-sm)] transition-all hover:bg-[var(--color-primary-container)] hover:shadow-[var(--shadow-md)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
  >
    <slot />
  </button>
</template>
