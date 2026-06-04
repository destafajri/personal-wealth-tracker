<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { parseCurrency } from '~/lib/format/parse-currency'
import type { Currency } from '~/lib/types/snapshot'

// Symbol map used when in currency-picker mode — passing `currencies` + `currency`
// turns the static prefix into an inline `<select>` so users can switch currency
// without a separate dropdown next to the input.
const CURRENCY_SYMBOL: Record<Currency, string> = {
  IDR: 'Rp',
  USD: '$',
  SGD: 'S$',
  EUR: '€',
  JPY: '¥',
  KRW: '₩',
}

const props = withDefaults(
  defineProps<{
    modelValue: number | null
    placeholder?: string
    ariaLabel?: string
    disabled?: boolean
    prefix?: string // currency label rendered inside the input (e.g., 'Rp', '$', 'KRW')
    currency?: Currency // current currency when picker mode is on
    currencies?: readonly Currency[] // when provided, render inline currency `<select>`
    id?: string // optional: let parent supply id so an external <label for=...> can target it
  }>(),
  {
    placeholder: '0',
    disabled: false,
    ariaLabel: undefined,
    prefix: 'Rp',
    currency: undefined,
    currencies: undefined,
    id: undefined,
  },
)
const emit = defineEmits<{
  'update:modelValue': [value: number | null]
  'update:currency': [value: Currency]
}>()

const showPicker = computed(
  () => !!props.currencies && props.currency !== undefined,
)

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

const fallbackId = useId()
const id = computed(() => props.id ?? fallbackId)
</script>

<template>
  <label
    :for="id"
    class="relative flex h-12 items-center rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 transition-colors focus-within:border-[var(--color-primary)]"
  >
    <select
      v-if="showPicker"
      :value="currency"
      :disabled="disabled"
      aria-label="Pilih mata uang"
      class="-ml-1 mr-1 cursor-pointer bg-transparent pr-1 text-sm text-[var(--color-text-secondary)] outline-none focus:text-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
      @change="
        emit('update:currency', ($event.target as HTMLSelectElement).value as Currency)
      "
    >
      <option v-for="cur in currencies" :key="cur" :value="cur">
        {{ CURRENCY_SYMBOL[cur] }} {{ cur }}
      </option>
    </select>
    <span
      v-else
      class="mr-2 text-sm text-[var(--color-text-secondary)]"
    >{{ props.prefix }}</span>
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
