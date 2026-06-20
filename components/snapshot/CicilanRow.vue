<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import InputCurrency from '~/components/common/InputCurrency.vue'
import InputQuantity from '~/components/common/InputQuantity.vue'
import ProgressiveRowCard from '~/components/snapshot/ProgressiveRowCard.vue'
import SmartDefaultPill from '~/components/snapshot/SmartDefaultPill.vue'
import { t } from '~/lib/copy/strings'
import type { CicilanRow, CicilanTipe, JenisBunga } from '~/lib/types/snapshot'

const props = defineProps<{
  row: CicilanRow
  // Fields that received smart defaults on row creation (via quick-add chip).
  // Pill renders next to each field's label until 5s elapsed OR user edits.
  initialDefaultFields?: string[]
}>()
const emit = defineEmits<{
  update: [patch: Partial<Omit<CicilanRow, 'id'>>]
  remove: []
}>()

const tipeOptions: CicilanTipe[] = [
  'KPR',
  'KPM',
  'BANK_KTA',
  'PINJOL',
  'PAYLATER',
  'KK',
  'LAIN',
]
const jenisOptions: JenisBunga[] = ['Anuitas', 'Flat', 'Floating', 'Revolving']

const tenorOptional = computed(() => props.row.jenisBunga === 'Revolving')
const missingBunga = computed(
  () => props.row.sukuBunga === undefined || props.row.sukuBunga === null,
)
const floatingNoBunga = computed(
  () => props.row.jenisBunga === 'Floating' && missingBunga.value,
)

// Either warning surfaces inside the advanced slot (next to sukuBunga field).
// Counted into ProgressiveRowCard's amber-dot indicator when collapsed.
const warningCount = computed(() =>
  floatingNoBunga.value || missingBunga.value ? 1 : 0,
)

// Per-field "smart default applied" pill state. Seeded from initialDefaultFields
// prop on mount; cleared on first edit of that specific field.
const defaultFields = ref<Set<string>>(new Set(props.initialDefaultFields ?? []))
function clearDefault(field: string) {
  if (!defaultFields.value.has(field)) return
  defaultFields.value.delete(field)
  defaultFields.value = new Set(defaultFields.value) // trigger reactivity
}
</script>

<template>
  <ProgressiveRowCard :warning-count="warningCount">
    <template #basic>
      <div class="flex flex-wrap items-center gap-2">
        <div class="min-w-0 flex-1 basis-full sm:basis-auto">
          <label class="flex items-center gap-1.5">
            <span class="sr-only">{{ t('cicilan.field.label') }}</span>
            <input
              type="text"
              :value="row.label"
              :placeholder="t('cicilan.field.label')"
              class="h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 text-sm font-medium text-[var(--color-text-primary)] outline-none transition-colors duration-200 focus:border-[var(--color-primary)]"
              @input="
                emit('update', { label: ($event.target as HTMLInputElement).value });
                clearDefault('label')
              "
            >
            <SmartDefaultPill v-if="defaultFields.has('label')" />
          </label>
        </div>
        <select
          :value="row.tipe"
          class="h-10 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors duration-200 focus:border-[var(--color-primary)]"
          @change="
            emit('update', {
              tipe: ($event.target as HTMLSelectElement).value as CicilanTipe,
            })
          "
        >
          <option v-for="opt in tipeOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
        <div class="min-w-0 flex-1 sm:w-48 sm:flex-initial">
          <InputCurrency
            :model-value="row.sisaPokok === 0 ? null : row.sisaPokok"
            @update:model-value="emit('update', { sisaPokok: $event ?? 0 })"
          />
        </div>
        <button
          type="button"
          :aria-label="t('snapshot.row.remove')"
          class="shrink-0 rounded p-2 text-[var(--color-text-muted)] transition-all duration-200 hover:scale-110 hover:bg-[var(--color-surface-card)] hover:text-[var(--color-danger-rose)] active:scale-95"
          @click="emit('remove')"
        >
          <X :size="16" />
        </button>
      </div>
    </template>

    <template #advanced>
      <div class="grid gap-3 sm:grid-cols-2">
        <label class="block text-xs">
          <span class="flex items-center gap-1.5 font-medium text-[var(--color-text-secondary)]">
            {{ t('cicilan.field.jenisBunga') }}
          </span>
          <select
            :value="row.jenisBunga"
            class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors duration-200 focus:border-[var(--color-primary)]"
            @change="
              emit('update', {
                jenisBunga: ($event.target as HTMLSelectElement).value as JenisBunga,
              })
            "
          >
            <option v-for="opt in jenisOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </label>

        <label class="block text-xs">
          <span class="font-medium text-[var(--color-text-secondary)]">
            {{ t('cicilan.field.cicilan') }}
          </span>
          <div class="mt-1">
            <InputCurrency
              :model-value="row.cicilanPerBulan === 0 ? null : row.cicilanPerBulan"
              @update:model-value="emit('update', { cicilanPerBulan: $event ?? 0 })"
            />
          </div>
        </label>

        <label class="block text-xs">
          <span class="flex items-center gap-1.5 font-medium text-[var(--color-text-secondary)]">
            {{ t('cicilan.field.sukuBunga') }}
            <SmartDefaultPill v-if="defaultFields.has('sukuBunga')" />
          </span>
          <div class="mt-1">
            <InputQuantity
              unit="%"
              :step="0.1"
              :model-value="row.sukuBunga ?? null"
              @update:model-value="
                emit('update', { sukuBunga: $event ?? undefined });
                clearDefault('sukuBunga')
              "
            />
          </div>
        </label>

        <label class="block text-xs">
          <span class="flex items-center gap-1.5 font-medium text-[var(--color-text-secondary)]">
            {{ t('cicilan.field.tenorSisa') }}
            <SmartDefaultPill v-if="defaultFields.has('tenorSisaBulan')" />
            <span v-if="tenorOptional" class="text-[var(--color-text-muted)]">(opsional)</span>
          </span>
          <div class="mt-1">
            <InputQuantity
              unit="bln"
              :step="1"
              :model-value="row.tenorSisaBulan ?? null"
              @update:model-value="
                emit('update', { tenorSisaBulan: $event ?? undefined });
                clearDefault('tenorSisaBulan')
              "
            />
          </div>
        </label>

        <p
          v-if="floatingNoBunga"
          class="rounded-[var(--radius-input)] bg-[var(--color-warning-amber-soft)] px-3 py-2 text-xs text-[var(--color-warning-amber)] sm:col-span-2"
        >
          {{ t('cicilan.warning.floatingNoBunga') }}
        </p>
        <p
          v-else-if="missingBunga"
          class="rounded-[var(--radius-input)] bg-[var(--color-surface-low)] px-3 py-2 text-xs text-[var(--color-text-secondary)] sm:col-span-2"
        >
          {{ t('cicilan.warning.missingBunga') }}
        </p>
      </div>
    </template>
  </ProgressiveRowCard>
</template>
