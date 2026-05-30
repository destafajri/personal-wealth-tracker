<script setup lang="ts">
import InputCurrency from '~/components/common/InputCurrency.vue'
import { useSnapshotStore } from '~/stores/snapshot'
import { t } from '~/lib/copy/strings'

const snap = useSnapshotStore()
</script>

<template>
  <section
    class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4 sm:p-6"
  >
    <header class="mb-3">
      <h3 class="text-base font-semibold text-[var(--color-text-primary)]">
        {{ t('snapshot.section.pengeluaran') }}
      </h3>
    </header>
    <div class="space-y-3">
      <label class="block">
        <span class="text-sm font-medium text-[var(--color-text-primary)]">
          {{ t('snapshot.pengeluaran.pokok.label') }}
        </span>
        <p class="mt-0.5 text-xs text-[var(--color-text-secondary)]">
          {{ t('snapshot.pengeluaran.pokok.help') }}
        </p>
        <div class="mt-2">
          <InputCurrency
            :model-value="snap.pengeluaran.pokok === 0 ? null : snap.pengeluaran.pokok"
            @update:model-value="snap.setPengeluaran({ pokok: $event ?? 0 })"
          />
        </div>
      </label>
      <label class="block">
        <span class="text-sm font-medium text-[var(--color-text-primary)]">
          {{ t('snapshot.pengeluaran.lifestyle.label') }}
        </span>
        <p class="mt-0.5 text-xs text-[var(--color-text-secondary)]">
          {{ t('snapshot.pengeluaran.lifestyle.help') }}
        </p>
        <div class="mt-2">
          <InputCurrency
            :model-value="
              snap.pengeluaran.lifestyle === 0 ? null : snap.pengeluaran.lifestyle
            "
            @update:model-value="snap.setPengeluaran({ lifestyle: $event ?? 0 })"
          />
        </div>
      </label>
    </div>
    <p class="mt-3 text-xs italic text-[var(--color-text-muted)]">
      {{ t('snapshot.pengeluaran.note') }}
    </p>
  </section>
</template>
