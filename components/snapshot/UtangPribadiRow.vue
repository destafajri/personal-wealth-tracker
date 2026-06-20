<script setup lang="ts">
import { X } from 'lucide-vue-next'
import InputCurrency from '~/components/common/InputCurrency.vue'
import InputQuantity from '~/components/common/InputQuantity.vue'
import ProgressiveRowCard from '~/components/snapshot/ProgressiveRowCard.vue'
import { t } from '~/lib/copy/strings'
import type { UtangPribadiRow } from '~/lib/types/snapshot'

defineProps<{ row: UtangPribadiRow }>()
const emit = defineEmits<{
  update: [patch: Partial<Omit<UtangPribadiRow, 'id'>>]
  remove: []
}>()
</script>

<template>
  <ProgressiveRowCard>
    <template #basic>
      <div class="flex flex-wrap items-center gap-2">
        <input
          type="text"
          :value="row.label"
          :placeholder="t('utangPribadi.field.label')"
          class="h-10 min-w-0 flex-1 basis-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 text-sm font-medium text-[var(--color-text-primary)] outline-none transition-colors duration-200 focus:border-[var(--color-primary)] sm:basis-auto"
          @input="emit('update', { label: ($event.target as HTMLInputElement).value })"
        >
        <div class="min-w-0 flex-1 sm:w-52 sm:flex-initial">
          <InputCurrency
            :model-value="row.sisaPokok || null"
            @update:model-value="emit('update', { sisaPokok: $event ?? 0 })"
          />
        </div>
        <button
          type="button"
          :aria-label="t('utangPribadi.row.remove')"
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
          <span class="font-medium text-[var(--color-text-secondary)]">
            {{ t('utangPribadi.field.cicilan') }}
          </span>
          <div class="mt-1">
            <InputCurrency
              :model-value="row.cicilanPerBulan ?? null"
              @update:model-value="emit('update', { cicilanPerBulan: $event ?? undefined })"
            />
          </div>
        </label>
        <label class="block text-xs">
          <span class="font-medium text-[var(--color-text-secondary)]">
            {{ t('utangPribadi.field.tempo') }}
          </span>
          <div class="mt-1">
            <InputQuantity
              unit="bln"
              :step="1"
              :model-value="row.tempoBulan ?? null"
              @update:model-value="emit('update', { tempoBulan: $event ?? undefined })"
            />
          </div>
        </label>
        <label class="block text-xs">
          <span class="font-medium text-[var(--color-text-secondary)]">
            {{ t('utangPribadi.field.tanggal') }}
          </span>
          <input
            type="date"
            :value="row.tanggalJatuhTempo ?? ''"
            class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors duration-200 focus:border-[var(--color-primary)]"
            @input="emit('update', { tanggalJatuhTempo: ($event.target as HTMLInputElement).value || undefined })"
          >
        </label>
      </div>
    </template>
  </ProgressiveRowCard>
</template>
