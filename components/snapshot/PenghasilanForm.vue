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
        {{ t('snapshot.section.penghasilan') }}
      </h3>
    </header>
    <label class="block">
      <span class="text-sm font-medium text-[var(--color-text-primary)]">
        {{ t('snapshot.penghasilan.label') }}
      </span>
      <p class="mt-0.5 text-xs text-[var(--color-text-secondary)]">
        {{ t('snapshot.penghasilan.help') }}
      </p>
      <div class="mt-2">
        <InputCurrency
          :model-value="snap.penghasilan === 0 ? null : snap.penghasilan"
          @update:model-value="snap.setPenghasilan($event ?? 0)"
        />
      </div>
    </label>
  </section>
</template>
