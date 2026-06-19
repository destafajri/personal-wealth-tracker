<script setup lang="ts">
import { computed, ref } from 'vue'
import ButtonGhost from '~/components/common/ButtonGhost.vue'
import CicilanRowEditor from '~/components/snapshot/CicilanRow.vue'
import { useSnapshotStore } from '~/stores/snapshot'
import { useDerivedStore } from '~/stores/derived'
import { useUndoDelete } from '~/composables/useUndoDelete'
import { idr } from '~/lib/format/idr'
import { t } from '~/lib/copy/strings'
import { cicilanDefaultFields, cicilanDefaultsFor } from '~/lib/smart-defaults/cicilanDefaults'
import type { CicilanTipe } from '~/lib/types/snapshot'

defineProps<{ hideHeader?: boolean }>()

const snap = useSnapshotStore()
const derived = useDerivedStore()
const undo = useUndoDelete()

const quickAdds: { labelKey: 'cicilan.quickadd.kpr' | 'cicilan.quickadd.kpm' | 'cicilan.quickadd.kk' | 'cicilan.quickadd.pinjol'; tipe: CicilanTipe }[] = [
  { labelKey: 'cicilan.quickadd.kpr', tipe: 'KPR' },
  { labelKey: 'cicilan.quickadd.kpm', tipe: 'KPM' },
  { labelKey: 'cicilan.quickadd.kk', tipe: 'KK' },
  { labelKey: 'cicilan.quickadd.pinjol', tipe: 'PINJOL' },
]

// Per-row "fields that received smart defaults" map. Keyed by row id. Rows added
// via quick-add chip get an entry; plain "+ Tambah" rows do not. Used by
// CicilanRow to seed its local defaultFields set for SARAN pill rendering.
const recentDefaults = ref<Map<string, string[]>>(new Map())

// Quick-add chips apply smart defaults (label, jenisBunga, tenor, sukuBunga) per
// tipe. Plain "+ Tambah Cicilan" button intentionally stays empty (user decision
// 2026-06-19, spec §15.3).
function addWithDefaults(tipe: CicilanTipe) {
  const defaults = cicilanDefaultsFor(tipe)
  const newRow = snap.addCicilan({ tipe, ...defaults })
  recentDefaults.value.set(newRow.id, cicilanDefaultFields(tipe))
  // Trigger Map reactivity
  recentDefaults.value = new Map(recentDefaults.value)
}

function defaultsFor(rowId: string): string[] {
  return recentDefaults.value.get(rowId) ?? []
}

function handleRemove(rowId: string) {
  const idx = snap.cicilanAktif.findIndex((r) => r.id === rowId)
  if (idx === -1) return
  const row = snap.cicilanAktif[idx]!
  const { id, ...rowData } = row
  void id
  undo.capture('cicilan', rowData, idx)
  snap.removeCicilan(rowId)
}

const rows = computed(() => snap.cicilanAktif)
const totalCicilan = computed(() =>
  rows.value.reduce((s, r) => s + (r.cicilanPerBulan || 0), 0),
)
const totalPokok = computed(() =>
  rows.value.reduce((s, r) => s + (r.sisaPokok || 0), 0),
)
const biggest = computed(() => {
  if (rows.value.length === 0) return null
  return rows.value.reduce((max, r) =>
    r.cicilanPerBulan > (max?.cicilanPerBulan ?? -1) ? r : max,
  )
})
// Compare against FX-aware total monthly income (gaji + lain + dividen + bunga) in IDR
// — not `snap.penghasilan.amount` raw, which is in source currency and ignores the
// non-gaji income streams. Otherwise a USD salary 1000 + IDR cicilan 5jt would falsely
// trip the warning even though derived DSR is fine.
const overPenghasilan = computed(
  () =>
    derived.penghasilanMonthlyIdr > 0 &&
    totalCicilan.value > derived.penghasilanMonthlyIdr,
)
</script>

<template>
  <section
    class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4 sm:p-6"
  >
    <header v-if="!hideHeader" class="mb-3">
      <h3 class="text-base font-semibold text-[var(--color-text-primary)]">
        {{ t('snapshot.section.cicilanAktif') }}
      </h3>
    </header>
    <div class="mb-3 flex flex-wrap gap-1">
      <ButtonGhost
        v-for="qa in quickAdds"
        :key="qa.tipe"
        @click="addWithDefaults(qa.tipe)"
      >
        {{ t(qa.labelKey) }}
      </ButtonGhost>
    </div>

    <p
      v-if="rows.length === 0"
      class="rounded-[var(--radius-input)] bg-[var(--color-surface-low)] px-3 py-3 text-sm text-[var(--color-text-secondary)]"
    >
      {{ t('cicilan.empty') }}
    </p>

    <TransitionGroup v-else name="row-slide" tag="div" class="space-y-3">
      <CicilanRowEditor
        v-for="row in rows"
        :key="row.id"
        :row="row"
        :initial-default-fields="defaultsFor(row.id)"
        @update="(patch) => snap.updateCicilan(row.id, patch)"
        @remove="handleRemove(row.id)"
      />
    </TransitionGroup>

    <ButtonGhost class="mt-3 w-full" @click="snap.addCicilan()">
      {{ t('cicilan.add') }}
    </ButtonGhost>

    <div
      v-if="rows.length > 0"
      class="mt-4 grid gap-2 rounded-[var(--radius-input)] bg-[var(--color-surface-low)] p-3 text-xs sm:grid-cols-3"
    >
      <div>
        <div class="text-[var(--color-text-secondary)]">
          {{ t('cicilan.aggregate.total') }}
        </div>
        <div class="tabular text-sm font-semibold text-[var(--color-text-primary)]">
          {{ idr(totalCicilan) }}
        </div>
      </div>
      <div>
        <div class="text-[var(--color-text-secondary)]">
          {{ t('cicilan.aggregate.pokok') }}
        </div>
        <div class="tabular text-sm font-semibold text-[var(--color-text-primary)]">
          {{ idr(totalPokok) }}
        </div>
      </div>
      <div v-if="biggest">
        <div class="text-[var(--color-text-secondary)]">
          {{ t('cicilan.aggregate.biggest') }}
        </div>
        <div class="text-sm font-semibold text-[var(--color-text-primary)]">
          {{ biggest.label || biggest.tipe }}
          <span class="tabular ml-1 text-[var(--color-text-secondary)]">
            ({{ idr(biggest.cicilanPerBulan) }})
          </span>
        </div>
      </div>
    </div>

    <p
      v-if="overPenghasilan"
      class="mt-3 rounded-[var(--radius-input)] bg-[var(--color-danger-rose-soft)] px-3 py-2 text-xs text-[var(--color-danger-rose)]"
    >
      {{ t('cicilan.warning.overPenghasilan') }}
    </p>
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
