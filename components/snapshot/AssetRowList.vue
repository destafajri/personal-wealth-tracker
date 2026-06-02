<script setup lang="ts">
import { X } from 'lucide-vue-next'
import InputCurrency from '~/components/common/InputCurrency.vue'
import ButtonGhost from '~/components/common/ButtonGhost.vue'
import { idr } from '~/lib/format/idr'
import { rateToIdr } from '~/lib/finance/fx'
import { useDerivedStore } from '~/stores/derived'
import { t } from '~/lib/copy/strings'
import {
  CURRENCIES,
  RD_JENIS_LIST,
  type AssetRow,
  type Currency,
  type RdJenis,
} from '~/lib/types/snapshot'

withDefaults(
  defineProps<{
    rows: AssetRow[]
    title: string
    // Likuid panels expose currency dropdown; non-likuid leaves it off (IDR-only).
    showCurrency?: boolean
    // Sbn + deposito surface a per-row interest rate input. Drives the auto-derived
    // monthly bunga line in PenghasilanForm.
    showInterestRate?: boolean
    // Reksa Dana panel surfaces a per-row jenis picker (RDPU / RDPT / Campuran /
    // Saham / Indeks / Lain). Drives Safe Haven inclusion — only defensif jenis
    // (RDPU + RDPT) count. Untagged rows treated as safe for back-compat.
    showRdJenis?: boolean
  }>(),
  { showCurrency: false, showInterestRate: false, showRdJenis: false },
)

const emit = defineEmits<{
  add: []
  'update:label': [id: string, value: string]
  'update:amount': [id: string, value: number | null]
  'update:currency': [id: string, value: Currency]
  'update:sukuBunga': [id: string, value: number | null]
  'update:rdJenis': [id: string, value: RdJenis | null]
  remove: [id: string]
}>()

const derived = useDerivedStore()

const PREFIX: Record<Currency, string> = {
  IDR: 'Rp',
  USD: '$',
  SGD: 'S$',
  EUR: '€',
  JPY: '¥',
  KRW: '₩',
}

function currencyOf(row: AssetRow): Currency {
  return row.currency ?? 'IDR'
}

function idrEquivalent(row: AssetRow): number | null {
  const cur = currencyOf(row)
  if (cur === 'IDR') return null
  const rate = rateToIdr(cur, derived.priceView?.fxRates)
  if (rate === null) return null
  return (row.amount || 0) * rate
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <h4 class="text-sm font-medium text-[var(--color-text-primary)]">{{ title }}</h4>
      <ButtonGhost @click="emit('add')">
        {{ t('snapshot.row.add') }}
      </ButtonGhost>
    </div>
    <ul v-if="rows.length > 0" class="space-y-2">
      <li v-for="row in rows" :key="row.id" class="space-y-1">
        <div class="flex items-center gap-2">
          <input
            type="text"
            :value="row.label"
            :placeholder="t('snapshot.row.labelPlaceholder')"
            class="h-12 flex-1 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
            @input="
              emit('update:label', row.id, ($event.target as HTMLInputElement).value)
            "
          >
          <select
            v-if="showCurrency"
            :value="currencyOf(row)"
            class="h-12 w-20 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-2 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
            @change="
              emit(
                'update:currency',
                row.id,
                ($event.target as HTMLSelectElement).value as Currency,
              )
            "
          >
            <option v-for="cur in CURRENCIES" :key="cur" :value="cur">{{ cur }}</option>
          </select>
          <div class="w-44">
            <InputCurrency
              :model-value="row.amount === 0 ? null : row.amount"
              :prefix="PREFIX[currencyOf(row)]"
              :placeholder="t('snapshot.row.idrPlaceholder')"
              @update:model-value="emit('update:amount', row.id, $event)"
            />
          </div>
          <button
            type="button"
            :aria-label="t('snapshot.row.remove')"
            class="rounded p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-low)] hover:text-[var(--color-danger-rose)]"
            @click="emit('remove', row.id)"
          >
            <X :size="16" />
          </button>
        </div>
        <p
          v-if="showCurrency && currencyOf(row) !== 'IDR'"
          class="tabular pl-2 text-[11px] text-[var(--color-text-muted)]"
        >
          <template v-if="idrEquivalent(row) !== null">
            ≈ {{ idr(idrEquivalent(row)) }}
          </template>
          <template v-else>{{ t('snapshot.row.fxStale') }}</template>
        </p>

        <div
          v-if="showRdJenis"
          class="flex flex-wrap items-center gap-2 pl-2"
        >
          <label
            :for="`rdJenis-${row.id}`"
            class="text-[11px] text-[var(--color-text-muted)]"
          >
            {{ t('snapshot.aset.rdJenisLabel') }}
          </label>
          <select
            :id="`rdJenis-${row.id}`"
            :value="row.rdJenis ?? ''"
            :aria-label="t('snapshot.aset.rdJenisAria')"
            class="h-8 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-2 text-xs text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
            @change="
              emit(
                'update:rdJenis',
                row.id,
                (($event.target as HTMLSelectElement).value || null) as RdJenis | null,
              )
            "
          >
            <option value="">{{ t('snapshot.aset.rdJenis.untagged') }}</option>
            <option v-for="j in RD_JENIS_LIST" :key="j" :value="j">
              {{ t(`snapshot.aset.rdJenis.${j}` as const) }}
            </option>
          </select>
          <span class="text-[11px] italic text-[var(--color-text-muted)]">
            {{ t('snapshot.aset.rdJenis.safeHavenHint') }}
          </span>
        </div>

        <div v-if="showInterestRate" class="flex items-center gap-2 pl-2">
          <label
            :for="`sukuBunga-${row.id}`"
            class="text-[11px] text-[var(--color-text-muted)]"
          >
            {{ t('snapshot.aset.sukuBungaLabel') }}
          </label>
          <input
            :id="`sukuBunga-${row.id}`"
            type="number"
            inputmode="decimal"
            step="0.01"
            min="0"
            :value="row.sukuBungaPercent ?? ''"
            :aria-label="t('snapshot.aset.sukuBungaAria')"
            class="tabular h-8 w-20 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-2 text-right text-xs text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
            @input="
              emit(
                'update:sukuBunga',
                row.id,
                (($event.target as HTMLInputElement).value || '') === ''
                  ? null
                  : Number(($event.target as HTMLInputElement).value),
              )
            "
          >
        </div>
      </li>
    </ul>
  </div>
</template>
