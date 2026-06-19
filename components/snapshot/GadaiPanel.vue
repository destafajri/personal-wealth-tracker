<script setup lang="ts">
import { Info } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import ButtonGhost from '~/components/common/ButtonGhost.vue'
import GadaiRowEditor from '~/components/snapshot/GadaiRow.vue'
import { useSnapshotStore } from '~/stores/snapshot'
import { useMetricExplainer } from '~/composables/useMetricExplainer'
import { useUndoDelete } from '~/composables/useUndoDelete'
import { idr } from '~/lib/format/idr'
import { percent } from '~/lib/format/percent'
import { t } from '~/lib/copy/strings'
import { zoneOf } from '~/lib/finance/thresholds'
import { gadaiDefaultFields, gadaiDefaultsFor } from '~/lib/smart-defaults/gadaiDefaults'
import type { GadaiJaminanKind } from '~/lib/types/snapshot'

defineProps<{ hideHeader?: boolean }>()

const snap = useSnapshotStore()
const explainer = useMetricExplainer()
const undo = useUndoDelete()

const rows = computed(() => snap.gadai)

// Quick-add chips for the 4 most common gadai jaminan types. Each applies smart
// defaults (label, bungaPerBulanPercent, tempoBulan) per Pegadaian-standard rates.
// Plain "+ Tambah Gadai" button below intentionally stays empty (user decision
// 2026-06-19, spec §15.3).
const quickAdds: { jaminan: GadaiJaminanKind; labelKey: Parameters<typeof t>[0] }[] = [
  { jaminan: 'emas:digital', labelKey: 'gadai.jaminan.emas.digital' },
  { jaminan: 'emas:fisikAntam', labelKey: 'gadai.jaminan.emas.fisikAntam' },
  { jaminan: 'properti', labelKey: 'gadai.jaminan.properti' },
  { jaminan: 'kendaraan', labelKey: 'gadai.jaminan.kendaraan' },
]

// Per-row "fields that received smart defaults" map. Keyed by row id.
const recentDefaults = ref<Map<string, string[]>>(new Map())

function addWithDefaults(jaminan: GadaiJaminanKind) {
  const defaults = gadaiDefaultsFor(jaminan)
  const newRow = snap.addGadai({ jaminan, ...defaults })
  recentDefaults.value.set(newRow.id, gadaiDefaultFields(jaminan))
  recentDefaults.value = new Map(recentDefaults.value)
}

function defaultsFor(rowId: string): string[] {
  return recentDefaults.value.get(rowId) ?? []
}

function handleRemove(rowId: string) {
  const idx = snap.gadai.findIndex((r) => r.id === rowId)
  if (idx === -1) return
  const row = snap.gadai[idx]!
  const { id, ...rowData } = row
  void id
  undo.capture('gadai', rowData, idx)
  snap.removeGadai(rowId)
}

// Aggregates only over emas-backed gadai. Properti/kendaraan still count for piutang totals
// but not for gram/Rasio Tertahan.
const totalEmasPawnedGram = computed(() =>
  rows.value.reduce((s, g) => {
    if (!g.jaminan.startsWith('emas:')) return s
    return s + (g.gramTertahan || 0)
  }, 0),
)
const totalPiutang = computed(() =>
  rows.value.reduce((s, g) => s + (g.piutangIdr || 0), 0),
)
const totalOwnedEmasGram = computed(() => {
  const e = snap.emas
  return (
    e.digitalGram +
    e.fisikAntamGram +
    e.perhiasan18KGram +
    e.perhiasan14KGram +
    e.perhiasan10KGram
  )
})

// Rasio Tertahan = pawned emas grams / total emas grams owned. Null if no emas at all.
const rasioTertahan = computed(() => {
  if (totalOwnedEmasGram.value === 0) return null
  return (totalEmasPawnedGram.value / totalOwnedEmasGram.value) * 100
})

const rasioZone = computed(() =>
  rasioTertahan.value === null ? null : zoneOf('rasioTertahan', rasioTertahan.value),
)

const zoneLabel = computed(() => {
  if (rasioZone.value === 'sehat') return t('gadai.zone.aman')
  if (rasioZone.value === 'waspada') return t('gadai.zone.waspada')
  if (rasioZone.value === 'bahaya') return t('gadai.zone.bahaya')
  return ''
})

const zoneClass = computed(() => {
  if (rasioZone.value === 'sehat')
    return 'bg-[var(--color-accent-emerald-soft)] text-[var(--color-accent-emerald)]'
  if (rasioZone.value === 'waspada')
    return 'bg-[var(--color-warning-amber-soft)] text-[var(--color-warning-amber)]'
  if (rasioZone.value === 'bahaya')
    return 'bg-[var(--color-danger-rose-soft)] text-[var(--color-danger-rose)]'
  return 'bg-[var(--color-surface-low)] text-[var(--color-text-secondary)]'
})
</script>

<template>
  <section
    class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4 sm:p-6"
  >
    <header v-if="!hideHeader" class="mb-3">
      <h3 class="text-base font-semibold text-[var(--color-text-primary)]">
        {{ t('snapshot.section.gadai') }}
      </h3>
    </header>
    <div class="mb-3 flex flex-wrap gap-1">
      <ButtonGhost
        v-for="qa in quickAdds"
        :key="qa.jaminan"
        @click="addWithDefaults(qa.jaminan)"
      >
        {{ t(qa.labelKey) }}
      </ButtonGhost>
    </div>

    <p
      v-if="rows.length === 0"
      class="rounded-[var(--radius-input)] bg-[var(--color-surface-low)] px-3 py-3 text-sm text-[var(--color-text-secondary)]"
    >
      {{ t('gadai.empty') }}
    </p>

    <TransitionGroup v-else name="row-slide" tag="div" class="space-y-3">
      <GadaiRowEditor
        v-for="row in rows"
        :key="row.id"
        :row="row"
        :initial-default-fields="defaultsFor(row.id)"
        @update="(patch) => snap.updateGadai(row.id, patch)"
        @remove="handleRemove(row.id)"
      />
    </TransitionGroup>

    <ButtonGhost
      class="mt-3 w-full"
      @click="snap.addGadai()"
    >
      {{ t('gadai.add') }}
    </ButtonGhost>

    <div
      v-if="rows.length > 0"
      class="mt-4 grid gap-2 rounded-[var(--radius-input)] bg-[var(--color-surface-low)] p-3 text-xs sm:grid-cols-3"
    >
      <div>
        <div class="text-[var(--color-text-secondary)]">
          {{ t('gadai.aggregate.kontrak') }}
        </div>
        <div class="tabular text-sm font-semibold text-[var(--color-text-primary)]">
          {{ rows.length }}
        </div>
      </div>
      <div v-if="totalEmasPawnedGram > 0">
        <div class="text-[var(--color-text-secondary)]">
          {{ t('gadai.aggregate.totalEmasGram') }}
        </div>
        <div class="tabular text-sm font-semibold text-[var(--color-text-primary)]">
          {{ totalEmasPawnedGram }} gram
        </div>
      </div>
      <div>
        <div class="text-[var(--color-text-secondary)]">
          {{ t('gadai.aggregate.piutang') }}
        </div>
        <div class="tabular text-sm font-semibold text-[var(--color-text-primary)]">
          {{ idr(totalPiutang) }}
        </div>
      </div>
    </div>

    <div
      v-if="rasioTertahan !== null"
      class="mt-3 flex items-center justify-between rounded-[var(--radius-input)] bg-[var(--color-surface-low)] px-3 py-2"
    >
      <span class="flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
        {{ t('gadai.rasioTertahan') }}
        <button
          type="button"
          :aria-label="t('metric.explainer.aria.rasioTertahan')"
          class="inline-flex h-4 w-4 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
          @click="explainer.open('rasioTertahan')"
        >
          <Info :size="13" />
        </button>
      </span>
      <div class="flex items-center gap-2">
        <span class="tabular text-sm font-semibold text-[var(--color-text-primary)]">
          {{ percent(rasioTertahan, 1) }}
        </span>
        <span
          class="rounded-[var(--radius-pill)] px-2 py-0.5 text-[10px] uppercase tracking-wide"
          :class="zoneClass"
        >
          {{ zoneLabel }}
        </span>
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
