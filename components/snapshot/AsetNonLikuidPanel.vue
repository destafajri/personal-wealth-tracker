<script setup lang="ts">
import AssetRowList from '~/components/snapshot/AssetRowList.vue'
import { useSnapshotStore } from '~/stores/snapshot'
import { useUndoDelete, type UndoPanelKind } from '~/composables/useUndoDelete'
import { t } from '~/lib/copy/strings'
import type { NonLiquidAssetCategory } from '~/lib/types/snapshot'

defineProps<{ hideHeader?: boolean }>()

const snap = useSnapshotStore()
const undo = useUndoDelete()

function handleRemove(cat: NonLiquidAssetCategory, rowId: string) {
  const arr = snap.asetNonLikuid[cat]
  const idx = arr.findIndex((r) => r.id === rowId)
  if (idx === -1) return
  const row = arr[idx]!
  const { id, ...rowData } = row
  void id
  // cat doubles as UndoPanelKind (properti/kendaraan/pensiun are valid values).
  undo.capture(cat as UndoPanelKind, rowData, idx)
  snap.removeNonLikuid(cat, rowId)
}

const categories: { key: NonLiquidAssetCategory; titleKey: string }[] = [
  { key: 'properti', titleKey: 'snapshot.aset.properti' },
  { key: 'kendaraan', titleKey: 'snapshot.aset.kendaraan' },
  { key: 'pensiun', titleKey: 'snapshot.aset.pensiun' },
]

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
        {{ t('snapshot.section.asetNonLikuid') }}
      </h3>
    </header>
    <div class="space-y-5">
      <AssetRowList
        v-for="cat in categories"
        :key="cat.key"
        :title="label(cat.titleKey)"
        :rows="snap.asetNonLikuid[cat.key]"
        variant="inline"
        @add="snap.addNonLikuid(cat.key)"
        @update:label="(id, value) => snap.updateNonLikuid(cat.key, id, { label: value })"
        @update:amount="
          (id, value) => snap.updateNonLikuid(cat.key, id, { amount: value ?? 0 })
        "
        @remove="(id) => handleRemove(cat.key, id)"
      />
    </div>
  </section>
</template>
