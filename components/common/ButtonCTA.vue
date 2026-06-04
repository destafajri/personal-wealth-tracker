<script setup lang="ts">
// Landing-style hero CTA: larger default size + shadow elevation. For in-form
// action buttons (Day 5–7 snapshot / goals / simulator) use ButtonPrimary or
// ButtonSecondary instead — they sit in tighter form rhythm without hero weight.
// `tag` switches the rendered element so the CTA can sit inside a NuxtLink
// without producing nested interactive elements (a11y).
withDefaults(
  defineProps<{
    tag?: 'button' | 'span'
    type?: 'button' | 'submit' | 'reset'
    variant?: 'solid' | 'outline'
    size?: 'md' | 'lg'
    block?: boolean
    disabled?: boolean
    disabledReason?: string
  }>(),
  {
    tag: 'button',
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
  <component
    :is="tag"
    :type="tag === 'button' ? type : undefined"
    :disabled="tag === 'button' && disabled ? true : undefined"
    :title="disabled ? disabledReason : undefined"
    class="inline-flex items-center justify-center gap-2 rounded-[var(--radius-input)] text-sm font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40"
    :class="[
      size === 'lg' ? 'h-9 px-4' : 'h-8 px-3',
      block && 'w-full',
      variant === 'solid'
        ? 'bg-[var(--color-primary)] text-white shadow-[var(--shadow-sm)] hover:bg-[var(--color-primary-container)] hover:shadow-[var(--shadow-md)]'
        : 'border border-[var(--color-emerald-200)] bg-[var(--color-accent-emerald-soft)] text-[var(--color-primary-container)] hover:border-[var(--color-primary)] hover:bg-[var(--color-emerald-50)]',
    ]"
  >
    <slot />
  </component>
</template>
