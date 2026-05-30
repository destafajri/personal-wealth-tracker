<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { computed } from 'vue'
import InputCurrency from '~/components/common/InputCurrency.vue'
import InputQuantity from '~/components/common/InputQuantity.vue'
import { t } from '~/lib/copy/strings'
import type { CicilanRow, CicilanTipe, JenisBunga } from '~/lib/types/snapshot'

const props = defineProps<{ row: CicilanRow }>()
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
</script>

<template>
  <article
    class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-low)] p-4"
  >
    <header class="mb-3 flex items-start justify-between gap-2">
      <input
        type="text"
        :value="row.label"
        :placeholder="t('cicilan.field.label')"
        class="h-10 flex-1 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 text-sm font-medium text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
        @input="emit('update', { label: ($event.target as HTMLInputElement).value })"
      >
      <button
        type="button"
        :aria-label="t('snapshot.row.remove')"
        class="rounded p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-card)] hover:text-[var(--color-danger-rose)]"
        @click="emit('remove')"
      >
        <X :size="16" />
      </button>
    </header>

    <div class="grid gap-3 sm:grid-cols-2">
      <label class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">
          {{ t('cicilan.field.tipe') }}
        </span>
        <select
          :value="row.tipe"
          class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
          @change="
            emit('update', {
              tipe: ($event.target as HTMLSelectElement).value as CicilanTipe,
            })
          "
        >
          <option v-for="opt in tipeOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </label>

      <label class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">
          {{ t('cicilan.field.jenisBunga') }}
        </span>
        <select
          :value="row.jenisBunga"
          class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
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
          {{ t('cicilan.field.sisaPokok') }}
        </span>
        <div class="mt-1">
          <InputCurrency
            :model-value="row.sisaPokok === 0 ? null : row.sisaPokok"
            @update:model-value="emit('update', { sisaPokok: $event ?? 0 })"
          />
        </div>
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
        <span class="font-medium text-[var(--color-text-secondary)]">
          {{ t('cicilan.field.sukuBunga') }}
        </span>
        <div class="mt-1">
          <InputQuantity
            unit="%"
            :step="0.1"
            :model-value="row.sukuBunga ?? null"
            @update:model-value="emit('update', { sukuBunga: $event ?? undefined })"
          />
        </div>
      </label>

      <label class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">
          {{ t('cicilan.field.tenorSisa') }}
          <span v-if="tenorOptional" class="text-[var(--color-text-muted)]">(opsional)</span>
        </span>
        <div class="mt-1">
          <InputQuantity
            unit="bln"
            :step="1"
            :model-value="row.tenorSisaBulan ?? null"
            @update:model-value="emit('update', { tenorSisaBulan: $event ?? undefined })"
          />
        </div>
      </label>
    </div>

    <p
      v-if="floatingNoBunga"
      class="mt-3 rounded-[var(--radius-input)] bg-[var(--color-warning-amber-soft)] px-3 py-2 text-xs text-[var(--color-warning-amber)]"
    >
      {{ t('cicilan.warning.floatingNoBunga') }}
    </p>
    <p
      v-else-if="missingBunga"
      class="mt-3 rounded-[var(--radius-input)] bg-[var(--color-surface-low)] px-3 py-2 text-xs text-[var(--color-text-secondary)]"
    >
      {{ t('cicilan.warning.missingBunga') }}
    </p>
  </article>
</template>
