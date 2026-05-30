<script setup lang="ts">
import { useDerivedStore } from '~/stores/derived'
import { idr } from '~/lib/format/idr'
import { t } from '~/lib/copy/strings'

const derived = useDerivedStore()
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-2">
    <article
      class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4"
    >
      <h3 class="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
        {{ t('metric.netWorth.label') }}
      </h3>
      <p
        class="tabular mt-2 text-2xl font-bold"
        :class="derived.netWorth < 0
          ? 'text-[var(--color-danger-rose)]'
          : 'text-[var(--color-primary-dark)]'"
      >
        {{ idr(derived.netWorth) }}
      </p>
    </article>
    <article
      class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4"
    >
      <h3 class="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
        {{ t('metric.modalSiap.label') }}
      </h3>
      <p class="tabular mt-2 text-2xl font-bold text-[var(--color-capacity-teal)]">
        {{ idr(derived.modalSiap) }}
      </p>
      <p class="mt-1 text-[11px] italic text-[var(--color-text-muted)]">
        {{ t('metric.modalSiap.advisory') }}
      </p>
    </article>
  </div>
</template>
