<script setup lang="ts">
import AssetRowList from '~/components/snapshot/AssetRowList.vue'
import { useSnapshotStore } from '~/stores/snapshot'
import { t } from '~/lib/copy/strings'
import type { LiquidAssetCategory } from '~/lib/types/snapshot'

const snap = useSnapshotStore()

const categories: { key: LiquidAssetCategory; titleKey: string }[] = [
  { key: 'kas', titleKey: 'snapshot.aset.kas' },
  { key: 'deposito', titleKey: 'snapshot.aset.deposito' },
  { key: 'reksaDana', titleKey: 'snapshot.aset.reksaDana' },
  { key: 'sbn', titleKey: 'snapshot.aset.sbn' },
  { key: 'cryptoManual', titleKey: 'snapshot.aset.cryptoManual' },
]

// CopyKey type is exposed by strings.ts; using string casting to keep this generic.
function label(key: string): string {
  return t(key as Parameters<typeof t>[0])
}
</script>

<template>
  <section
    class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4 sm:p-6"
  >
    <header class="mb-4">
      <h3 class="text-base font-semibold text-[var(--color-text-primary)]">
        {{ t('snapshot.section.asetLikuid') }}
      </h3>
    </header>
    <div class="space-y-5">
      <AssetRowList
        v-for="cat in categories"
        :key="cat.key"
        :title="label(cat.titleKey)"
        :rows="snap.asetLikuid[cat.key]"
        show-currency
        @add="snap.addLikuid(cat.key)"
        @update:label="(id, value) => snap.updateLikuid(cat.key, id, { label: value })"
        @update:amount="
          (id, value) => snap.updateLikuid(cat.key, id, { amount: value ?? 0 })
        "
        @update:currency="(id, value) => snap.updateLikuid(cat.key, id, { currency: value })"
        @remove="(id) => snap.removeLikuid(cat.key, id)"
      />
    </div>
  </section>
</template>
