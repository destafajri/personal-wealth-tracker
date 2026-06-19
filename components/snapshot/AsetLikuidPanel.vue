<script setup lang="ts">
import { computed } from 'vue'
import AssetRowList from '~/components/snapshot/AssetRowList.vue'
import { useSnapshotStore } from '~/stores/snapshot'
import { t } from '~/lib/copy/strings'
import type { LiquidAssetCategory } from '~/lib/types/snapshot'

// Phase-2a Day 5 — `categories` + `hideHeader` props let snapshot.vue render this
// panel twice with different slices (kas under "Kas & Tabungan" tab, depo+RD+SBN
// under "Investasi Pasif" tab) without touching store shape or row logic.
const props = withDefaults(
  defineProps<{
    categories?: LiquidAssetCategory[]
    hideHeader?: boolean
  }>(),
  {
    categories: () => ['kas', 'deposito', 'reksaDana', 'sbn'],
    hideHeader: false,
  },
)

const snap = useSnapshotStore()

// `withInterest` marks categories that surface a per-row suku bunga input. Sbn +
// deposito are the only fixed-income-like bucket; bunga flows into PenghasilanForm as
// auto-derived estimasi (mirrors saham dividen pattern).
const ALL_CATEGORIES: {
  key: LiquidAssetCategory
  titleKey: string
  withInterest?: boolean
  withRdJenis?: boolean
}[] = [
  { key: 'kas', titleKey: 'snapshot.aset.kas' },
  { key: 'deposito', titleKey: 'snapshot.aset.deposito', withInterest: true },
  { key: 'reksaDana', titleKey: 'snapshot.aset.reksaDana', withRdJenis: true },
  { key: 'sbn', titleKey: 'snapshot.aset.sbn', withInterest: true },
  // Crypto is no longer here — it lives in its own panel with per-row mode toggle
  // (live unit-based OR manual IDR). See components/snapshot/CryptoPanel.vue.
]

const visibleCategories = computed(() =>
  ALL_CATEGORIES.filter((c) => props.categories.includes(c.key)),
)

// CopyKey type is exposed by strings.ts; using string casting to keep this generic.
function label(key: string): string {
  return t(key as Parameters<typeof t>[0])
}
</script>

<template>
  <section
    class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4 sm:p-6"
  >
    <header v-if="!hideHeader" class="mb-4">
      <h3 class="text-base font-semibold text-[var(--color-text-primary)]">
        {{ t('snapshot.section.asetLikuid') }}
      </h3>
    </header>
    <div class="space-y-5">
      <AssetRowList
        v-for="cat in visibleCategories"
        :key="cat.key"
        :title="label(cat.titleKey)"
        :rows="snap.asetLikuid[cat.key]"
        show-currency
        :show-interest-rate="cat.withInterest"
        :show-rd-jenis="cat.withRdJenis"
        variant="inline"
        @add="snap.addLikuid(cat.key)"
        @update:label="(id, value) => snap.updateLikuid(cat.key, id, { label: value })"
        @update:amount="
          (id, value) => snap.updateLikuid(cat.key, id, { amount: value ?? 0 })
        "
        @update:currency="(id, value) => snap.updateLikuid(cat.key, id, { currency: value })"
        @update:suku-bunga="
          (id, value) =>
            snap.updateLikuid(cat.key, id, {
              sukuBungaPercent: value === null || value <= 0 ? undefined : value,
            })
        "
        @update:rd-jenis="
          (id, value) =>
            snap.updateLikuid(cat.key, id, {
              rdJenis: value === null ? undefined : value,
            })
        "
        @remove="(id) => snap.removeLikuid(cat.key, id)"
      />
    </div>
  </section>
</template>
