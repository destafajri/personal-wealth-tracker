<script setup lang="ts">
import { computed } from 'vue'
import ButtonGhost from '~/components/common/ButtonGhost.vue'
import UtangPribadiRow from '~/components/snapshot/UtangPribadiRow.vue'
import { useSnapshotStore } from '~/stores/snapshot'
import { useUndoDelete } from '~/composables/useUndoDelete'
import { idr } from '~/lib/format/idr'
import { t } from '~/lib/copy/strings'

defineProps<{ hideHeader?: boolean }>()

const snap = useSnapshotStore()
const undo = useUndoDelete()

const rows = computed(() => snap.utangPribadi)
const totalPokok = computed(() => rows.value.reduce((s, r) => s + (r.sisaPokok || 0), 0))
const totalCicilan = computed(() =>
  rows.value.reduce((s, r) => s + (r.cicilanPerBulan || 0), 0),
)

// Capture row data + original index BEFORE remove, so useUndoDelete can restore
// at the right position via snap.restoreUtangPribadi.
function handleRemove(rowId: string) {
  const idx = snap.utangPribadi.findIndex((r) => r.id === rowId)
  if (idx === -1) return
  const row = snap.utangPribadi[idx]!
  const { id, ...rowData } = row
  void id
  undo.capture('utangPribadi', rowData, idx)
  snap.removeUtangPribadi(rowId)
}
</script>

<template>
  <section
    class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4 sm:p-6"
  >
    <header v-if="!hideHeader" class="mb-3">
      <h3 class="text-base font-semibold text-[var(--color-text-primary)]">
        {{ t('snapshot.section.utangPribadi') }}
      </h3>
      <p class="mt-0.5 text-xs text-[var(--color-text-secondary)]">
        {{ t('utangPribadi.help') }}
      </p>
    </header>
    <p
      v-if="rows.length === 0"
      class="rounded-[var(--radius-input)] bg-[var(--color-surface-low)] px-3 py-3 text-sm text-[var(--color-text-secondary)]"
    >
      {{ t('utangPribadi.empty') }}
    </p>

    <TransitionGroup v-else name="row-slide" tag="div" class="space-y-3">
      <UtangPribadiRow
        v-for="row in rows"
        :key="row.id"
        :row="row"
        @update="(patch) => snap.updateUtangPribadi(row.id, patch)"
        @remove="handleRemove(row.id)"
      />
    </TransitionGroup>

    <ButtonGhost
      class="mt-3 w-full"
      @click="snap.addUtangPribadi()"
    >
      {{ t('utangPribadi.add') }}
    </ButtonGhost>

    <div
      v-if="rows.length > 0"
      class="mt-4 grid gap-2 rounded-[var(--radius-input)] bg-[var(--color-surface-low)] p-3 text-xs sm:grid-cols-2"
    >
      <div>
        <div class="text-[var(--color-text-secondary)]">
          {{ t('utangPribadi.aggregate.total') }}
        </div>
        <div class="tabular text-sm font-semibold text-[var(--color-text-primary)]">
          {{ idr(totalPokok) }}
        </div>
      </div>
      <div>
        <div class="text-[var(--color-text-secondary)]">
          {{ t('utangPribadi.aggregate.cicilan') }}
        </div>
        <div class="tabular text-sm font-semibold text-[var(--color-text-primary)]">
          {{ idr(totalCicilan) }}
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.row-slide-enter-active {
  transition: all 0.3s ease-out;
}
.row-slide-leave-active {
  transition: all 0.2s ease-in;
}
.row-slide-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.row-slide-leave-to {
  opacity: 0;
  transform: translateX(12px);
}
.row-slide-move {
  transition: transform 0.25s ease;
}
</style>
