<script setup lang="ts">
import { ref, useId, watch } from 'vue'
import { parseCurrency } from '~/lib/format/parse-currency'

const props = withDefaults(
  defineProps<{
    modelValue: number | null
    placeholder?: string
    ariaLabel?: string
    disabled?: boolean
  }>(),
  { placeholder: '0', disabled: false, ariaLabel: undefined },
)
const emit = defineEmits<{ 'update:modelValue': [value: number | null] }>()

const formatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 })

const display = ref('')

function syncFromModel(v: number | null) {
  display.value = v === null || v === undefined ? '' : formatter.format(v)
}
syncFromModel(props.modelValue)

watch(
  () => props.modelValue,
  (v) => {
    const current = parseCurrency(display.value)
    if (current !== v) syncFromModel(v)
  },
)

function onInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  display.value = raw
  const parsed = parseCurrency(raw)
  emit('update:modelValue', parsed)
}

function onBlur() {
  const parsed = parseCurrency(display.value)
  if (parsed !== null) display.value = formatter.format(parsed)
  else display.value = ''
}

const id = useId()
</script>

<template>
  <label
    :for="id"
    class="relative flex h-12 items-center rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 transition-colors focus-within:border-[var(--color-primary)]"
  >
    <span class="mr-2 text-sm text-[var(--color-text-secondary)]">Rp</span>
    <input
      :id="id"
      :value="display"
      :placeholder="placeholder"
      :aria-label="ariaLabel"
      :disabled="disabled"
      inputmode="decimal"
      class="tabular w-full bg-transparent text-right text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] disabled:cursor-not-allowed disabled:opacity-50"
      @input="onInput"
      @blur="onBlur"
    >
  </label>
</template>
