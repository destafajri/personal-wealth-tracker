<script setup lang="ts">
// Landing-style hero CTA: larger default size + shadow elevation. For in-form
// action buttons (Day 5–7 snapshot / goals / simulator) use ButtonPrimary or
// ButtonSecondary instead — they sit in tighter form rhythm without hero weight.
withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    variant?: 'solid' | 'outline'
    size?: 'md' | 'lg'
    block?: boolean
    disabled?: boolean
    disabledReason?: string
  }>(),
  {
    type: 'button',
    variant: 'solid',
    size: 'lg',
    block: false,
    disabled: false,
    disabledReason: undefined,
  },
)
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :title="disabled ? disabledReason : undefined"
    class="inline-flex items-center justify-center gap-2 rounded-[var(--radius-input)] font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40"
    :class="[
      size === 'lg' ? 'px-6 py-3.5 text-sm sm:text-base' : 'px-5 py-3 text-sm',
      block && 'w-full',
      variant === 'solid'
        ? 'bg-[var(--color-primary)] text-white shadow-[var(--shadow-sm)] hover:bg-[var(--color-primary-container)] hover:shadow-[var(--shadow-md)]'
        : 'border border-[var(--color-emerald-200)] bg-[var(--color-accent-emerald-soft)] text-[var(--color-primary-container)] hover:border-[var(--color-primary)] hover:bg-[var(--color-emerald-50)]',
    ]"
  >
    <slot />
  </button>
</template>
