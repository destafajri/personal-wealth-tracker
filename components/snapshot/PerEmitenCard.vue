<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronDown, X } from 'lucide-vue-next'
import InputCurrency from '~/components/common/InputCurrency.vue'
import InputQuantity from '~/components/common/InputQuantity.vue'
import StatusDot from '~/components/common/StatusDot.vue'
import { idr } from '~/lib/format/idr'
import { percent } from '~/lib/format/percent'
import { t } from '~/lib/copy/strings'
import { zoneOf, type Zone } from '~/lib/finance/thresholds'
import type { StockHolding } from '~/lib/types/snapshot'

const props = defineProps<{
  row: StockHolding
  // Live price snapshot for THIS card's ticker. `price` is IDR per lembar from IDX;
  // `stale` flags Yahoo's staleness marker; `fetchedAt` is ISO. All null/false when the
  // ticker hasn't been fetched yet (e.g., user just typed a new symbol).
  livePrice: number | null
  liveStale: boolean
  liveFetchedAt: string | null
  // Sum of all stocks' value (post override > live > cost basis precedence). Used to
  // derive THIS row's live bobot for drift comparison.
  totalValueIdr: number
}>()

const emit = defineEmits<{
  update: [patch: Partial<Omit<StockHolding, 'id'>>]
  remove: []
}>()

const expanded = ref(false)

// Effective price for valuation: override > live > cost basis. Mirrors the precedence
// in calcAllocationDiscipline so this card's displayed value matches the metric.
const effectivePrice = computed(() => {
  return props.row.hargaOverride ?? props.livePrice ?? props.row.hargaRataRata
})

const valueIdr = computed(() => props.row.lot * 100 * effectivePrice.value)

const liveBobot = computed(() => {
  if (props.totalValueIdr <= 0) return null
  return (valueIdr.value / props.totalValueIdr) * 100
})

const drift = computed<number | null>(() => {
  if (props.row.bobotTargetPercent === undefined) return null
  if (liveBobot.value === null) return null
  return Math.abs(liveBobot.value - props.row.bobotTargetPercent)
})

const driftZone = computed<Zone | null>(() => {
  if (drift.value === null) return null
  return zoneOf('allocationDiscipline', drift.value)
})

const driftLabel = computed(() => {
  if (driftZone.value === null) return t('snapshot.saham.driftNoTarget')
  if (driftZone.value === 'sehat') return t('snapshot.saham.driftSehat')
  if (driftZone.value === 'waspada') return t('snapshot.saham.driftWaspada')
  return t('snapshot.saham.driftBahaya')
})

// Pill state: hargaOverride wins → no live pill (user explicitly opted out). Else
// LIVE or STALE based on the upstream flag. Null = nothing fetched yet.
type PillKind = 'live' | 'stale' | 'override' | 'missing'
const pillKind = computed<PillKind>(() => {
  if (props.row.hargaOverride !== undefined) return 'override'
  if (props.livePrice === null) return 'missing'
  return props.liveStale ? 'stale' : 'live'
})

const pillClass = computed(() => {
  switch (pillKind.value) {
    case 'live':
      return 'bg-[var(--color-accent-emerald-soft)] text-[var(--color-accent-emerald)]'
    case 'stale':
      return 'bg-[var(--color-warning-amber-soft)] text-[var(--color-warning-amber)]'
    case 'override':
      return 'bg-[var(--color-surface-low)] text-[var(--color-text-secondary)]'
    case 'missing':
      return 'bg-[var(--color-surface-low)] text-[var(--color-text-muted)]'
  }
  return ''
})

const pillLabel = computed(() => {
  switch (pillKind.value) {
    case 'live':
      return t('pill.live')
    case 'stale':
      return t('pill.stale')
    case 'override':
      return 'OVERRIDE'
    case 'missing':
      return t('snapshot.saham.priceMissing')
  }
  return ''
})

function fmtTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

// Ticker → uppercase, max 4 chars (IDX convention). We don't gate fetching client-side
// — the endpoint rejects malformed tickers with 400, surfaced as a stale state.
function onTickerInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  emit('update', { ticker: raw.toUpperCase().slice(0, 4) })
}

function onLot(v: number | null) {
  emit('update', { lot: v ?? 0 })
}

function onHargaRataRata(v: number | null) {
  emit('update', { hargaRataRata: v ?? 0 })
}

function onTarget(v: number | null) {
  // Clamp to 0–100. Empty input = clear target (drift goes back to "no target").
  if (v === null || Number.isNaN(v)) {
    emit('update', { bobotTargetPercent: undefined })
    return
  }
  const clamped = Math.max(0, Math.min(100, v))
  emit('update', { bobotTargetPercent: clamped })
}

function onOverride(v: number | null) {
  if (v === null || v <= 0) {
    emit('update', { hargaOverride: undefined })
    return
  }
  emit('update', { hargaOverride: v })
}
</script>

<template>
  <li
    class="space-y-2 rounded-[var(--radius-input)] bg-[var(--color-surface-low)] p-3"
  >
    <!-- Collapsed row: ticker | lot | price+pill | drift dot | expand chevron + delete -->
    <div class="flex flex-wrap items-center gap-2">
      <input
        type="text"
        :value="row.ticker"
        :placeholder="t('snapshot.saham.tickerPlaceholder')"
        :aria-label="t('snapshot.saham.tickerAria')"
        autocomplete="off"
        autocapitalize="characters"
        maxlength="4"
        class="h-10 w-20 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 text-sm font-medium uppercase tracking-wide text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
        @input="onTickerInput"
      >

      <div class="w-24">
        <InputQuantity
          :unit="t('snapshot.saham.lotLabel')"
          :step="1"
          :model-value="row.lot || null"
          @update:model-value="onLot"
        />
      </div>

      <!-- Price chip: shows effective price + LIVE/STALE/OVERRIDE/missing state. -->
      <div class="flex flex-1 min-w-[120px] items-center gap-2">
        <span
          class="inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
          :class="pillClass"
        >
          {{ pillLabel }}
        </span>
        <span class="tabular text-sm font-medium text-[var(--color-text-primary)]">
          {{ idr(effectivePrice) }}
        </span>
      </div>

      <StatusDot
        :status="driftZone ?? 'neutral'"
        :label="driftLabel"
      />

      <button
        type="button"
        :aria-label="expanded ? t('snapshot.saham.collapse') : t('snapshot.saham.expand')"
        class="rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-card)] hover:text-[var(--color-text-primary)]"
        @click="expanded = !expanded"
      >
        <ChevronDown
          :size="16"
          :class="expanded ? 'rotate-180 transition-transform' : 'transition-transform'"
        />
      </button>
      <button
        type="button"
        :aria-label="t('snapshot.saham.remove')"
        class="rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-card)] hover:text-[var(--color-danger-rose)]"
        @click="emit('remove')"
      >
        <X :size="16" />
      </button>
    </div>

    <!-- Value summary row (always visible — answers "berapa nilainya"). -->
    <div class="flex items-baseline justify-between text-[11px] text-[var(--color-text-secondary)]">
      <span class="tabular">{{ idr(valueIdr) }}</span>
      <span v-if="liveBobot !== null" class="tabular">
        {{ percent(liveBobot, 1) }}
        <template v-if="row.bobotTargetPercent !== undefined">
          / target {{ row.bobotTargetPercent }}%
        </template>
      </span>
    </div>

    <!-- Expanded section: cost basis + target + override + last-updated. -->
    <div v-if="expanded" class="space-y-3 border-t border-[var(--color-border)] pt-3">
      <div>
        <label class="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
          {{ t('snapshot.saham.hargaRataRataLabel') }}
        </label>
        <InputCurrency
          prefix="Rp"
          :model-value="row.hargaRataRata === 0 ? null : row.hargaRataRata"
          @update:model-value="onHargaRataRata"
        />
        <p class="mt-1 text-[10px] text-[var(--color-text-muted)]">
          {{ t('snapshot.saham.hargaRataRataHelp') }}
        </p>
      </div>

      <div>
        <label class="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
          {{ t('snapshot.saham.targetLabel') }}
        </label>
        <InputQuantity
          unit="%"
          :step="1"
          :model-value="row.bobotTargetPercent ?? null"
          @update:model-value="onTarget"
        />
        <p class="mt-1 text-[10px] text-[var(--color-text-muted)]">
          {{ t('snapshot.saham.targetHelp') }}
        </p>
      </div>

      <div>
        <label class="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
          {{ t('snapshot.saham.overrideLabel') }}
        </label>
        <InputCurrency
          prefix="Rp"
          :model-value="row.hargaOverride ?? null"
          @update:model-value="onOverride"
        />
        <p class="mt-1 text-[10px] text-[var(--color-text-muted)]">
          {{ t('snapshot.saham.overrideHelp') }}
        </p>
      </div>

      <p
        v-if="liveFetchedAt && pillKind !== 'missing'"
        class="text-[10px] italic text-[var(--color-text-muted)]"
      >
        {{ t('snapshot.saham.lastUpdated', { time: fmtTime(liveFetchedAt) }) }}
      </p>
    </div>
  </li>
</template>
