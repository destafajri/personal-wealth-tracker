<script setup lang="ts">
import { Info } from 'lucide-vue-next'
import { computed } from 'vue'
import ButtonGhost from '~/components/common/ButtonGhost.vue'
import GadaiRowEditor from '~/components/snapshot/GadaiRow.vue'
import { useSnapshotStore } from '~/stores/snapshot'
import { useMetricExplainer } from '~/composables/useMetricExplainer'
import { idr } from '~/lib/format/idr'
import { percent } from '~/lib/format/percent'
import { t } from '~/lib/copy/strings'
import { zoneOf } from '~/lib/finance/thresholds'

const snap = useSnapshotStore()
const explainer = useMetricExplainer()

const rows = computed(() => snap.gadai)

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
    <header class="mb-3 flex items-center justify-between">
      <h3 class="text-base font-semibold text-[var(--color-text-primary)]">
        {{ t('snapshot.section.gadai') }}
      </h3>
      <ButtonGhost @click="snap.addGadai()">
        {{ t('gadai.add') }}
      </ButtonGhost>
    </header>

    <p
      v-if="rows.length === 0"
      class="rounded-[var(--radius-input)] bg-[var(--color-surface-low)] px-3 py-3 text-sm text-[var(--color-text-secondary)]"
    >
      {{ t('gadai.empty') }}
    </p>

    <div v-else class="space-y-3">
      <GadaiRowEditor
        v-for="row in rows"
        :key="row.id"
        :row="row"
        @update="(patch) => snap.updateGadai(row.id, patch)"
        @remove="snap.removeGadai(row.id)"
      />
    </div>

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
