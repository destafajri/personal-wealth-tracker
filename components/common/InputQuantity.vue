<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: number | null
    unit: string
    placeholder?: string
    ariaLabel?: string
    disabled?: boolean
    step?: number
  }>(),
  { placeholder: '0', disabled: false, step: 1 },
)
const emit = defineEmits<{ 'update:modelValue': [value: number | null] }>()

const display = ref(props.modelValue === null ? '' : String(props.modelValue))

watch(
  () => props.modelValue,
  (v) => {
    const parsed = Number(display.value)
    if (Number.isNaN(parsed) || parsed !== v) {
      display.value = v === null ? '' : String(v)
    }
  },
)

function onInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  display.value = raw
  const trimmed = raw.trim()
  if (trimmed === '') {
    emit('update:modelValue', null)
    return
  }
  const n = Number(trimmed.replace(',', '.'))
  emit('update:modelValue', Number.isFinite(n) ? n : null)
}

const id = computed(() => `qty-${Math.random().toString(36).slice(2, 9)}`)
</script>

<template>
  <label
    :for="id"
    class="relative flex h-12 items-center rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 transition-colors focus-within:border-[var(--color-primary)]"
  >
    <input
      :id="id"
      :value="display"
      :placeholder="placeholder"
      :aria-label="ariaLabel"
      :disabled="disabled"
      :step="step"
      type="number"
      inputmode="decimal"
      class="tabular w-full bg-transparent text-right text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] disabled:cursor-not-allowed disabled:opacity-50"
      @input="onInput"
    />
    <span class="ml-2 text-sm text-[var(--color-text-muted)]">{{ unit }}</span>
  </label>
</template>
