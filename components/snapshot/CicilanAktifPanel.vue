<script setup lang="ts">
import { computed } from 'vue'
import ButtonGhost from '~/components/common/ButtonGhost.vue'
import CicilanRowEditor from '~/components/snapshot/CicilanRow.vue'
import { useSnapshotStore } from '~/stores/snapshot'
import { useDerivedStore } from '~/stores/derived'
import { idr } from '~/lib/format/idr'
import { t } from '~/lib/copy/strings'
import type { CicilanTipe } from '~/lib/types/snapshot'

defineProps<{ hideHeader?: boolean }>()

const snap = useSnapshotStore()
const derived = useDerivedStore()

const quickAdds: { labelKey: 'cicilan.quickadd.kpr' | 'cicilan.quickadd.kpm' | 'cicilan.quickadd.kk' | 'cicilan.quickadd.pinjol'; tipe: CicilanTipe; jenis: 'Anuitas' | 'Revolving' }[] = [
  { labelKey: 'cicilan.quickadd.kpr', tipe: 'KPR', jenis: 'Anuitas' },
  { labelKey: 'cicilan.quickadd.kpm', tipe: 'KPM', jenis: 'Anuitas' },
  { labelKey: 'cicilan.quickadd.kk', tipe: 'KK', jenis: 'Revolving' },
  { labelKey: 'cicilan.quickadd.pinjol', tipe: 'PINJOL', jenis: 'Anuitas' },
]

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
        @click="snap.addCicilan({ tipe: qa.tipe, jenisBunga: qa.jenis })"
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

    <div v-else class="space-y-3">
      <CicilanRowEditor
        v-for="row in rows"
        :key="row.id"
        :row="row"
        @update="(patch) => snap.updateCicilan(row.id, patch)"
        @remove="snap.removeCicilan(row.id)"
      />
    </div>

    <ButtonGhost class="mt-3" @click="snap.addCicilan()">
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
