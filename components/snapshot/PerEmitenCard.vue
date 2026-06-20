<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, ChevronDown, X } from 'lucide-vue-next'
import InputCurrency from '~/components/common/InputCurrency.vue'
import TickerChip from '~/components/snapshot/TickerChip.vue'
import TradingViewSymbolInfo from '~/components/snapshot/TradingViewSymbolInfo.vue'
import InputQuantity from '~/components/common/InputQuantity.vue'
import { calcPotentialDividendIdr, effectiveStockPrice } from '~/lib/finance/metrics'
import { idr } from '~/lib/format/idr'
import { percent } from '~/lib/format/percent'
import { t } from '~/lib/copy/strings'
import type { StockHolding } from '~/lib/types/snapshot'

// Dividend input modes — user toggles between literal "Last dividend / lembar" and a
// "Yield %" path. Only one field is rendered at a time; switching modes clears the
// other so the underlying calcPotentialDividendIdr precedence (literal wins) stays
// unambiguous regardless of which mode the user lands on.
type DividendMode = 'lastDiv' | 'yield'

const props = withDefaults(
  defineProps<{
    row: StockHolding
    livePrice: number | null
    liveStale: boolean
    liveFetchedAt: string | null
    totalValueIdr: number
    isDuplicate?: boolean
  }>(),
  { isDuplicate: false },
)

const emit = defineEmits<{
  update: [patch: Partial<Omit<StockHolding, 'id'>>]
  remove: []
}>()

const expanded = ref(false)

// Default mode = lastDiv (more concrete). Initial mode picks whichever field already
// has a value, so reopening a row with yield set lands on the yield tab.
const dividendMode = ref<DividendMode>(
  props.row.avgDividendYieldPercent !== undefined &&
    props.row.lastDividendPerLembar === undefined
    ? 'yield'
    : 'lastDiv',
)

function setDividendMode(mode: DividendMode) {
  if (dividendMode.value === mode) return
  // Clear the non-active field on switch so precedence is unambiguous and the new mode
  // starts from a clean slate.
  if (mode === 'lastDiv') {
    emit('update', { avgDividendYieldPercent: undefined })
  } else {
    emit('update', { lastDividendPerLembar: undefined })
  }
  dividendMode.value = mode
}

const effectivePrice = computed(() => effectiveStockPrice(props.row, props.livePrice))
const valueIdr = computed(() => props.row.lot * 100 * effectivePrice.value)

// Row-complete signal for the green ✓ indicator. Saham row is "complete" when it has
// a valid 4-char IDX ticker, lot > 0, and an effective price (live, override, or avg
// fallback). Without all three the row contributes Rp 0 to the section total and the
// ✓ stays hidden — matches the "filled value input" semantic from the Stitch Aset
// Tetap mockup without adding a status metric.
const isComplete = computed(
  () =>
    props.row.ticker.trim().length > 0 &&
    props.row.lot > 0 &&
    effectivePrice.value > 0,
)

// TV symbol for embed widgets (Symbol Info in expanded view). IDX:{TICKER} format
// for Indonesia stocks. Empty when ticker is unset so the widget doesn't render.
const tvSymbol = computed(() => {
  const t = props.row.ticker.trim().toUpperCase()
  return t ? `IDX:${t}` : ''
})

const liveBobot = computed(() => {
  if (props.totalValueIdr <= 0) return null
  return (valueIdr.value / props.totalValueIdr) * 100
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

// Ticker → uppercase, max 4 chars (IDX convention). Endpoint rejects malformed.
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

function onOverride(v: number | null) {
  if (v === null || v <= 0) {
    emit('update', { hargaOverride: undefined })
    return
  }
  emit('update', { hargaOverride: v })
}

function onLotsTarget(v: number | null) {
  if (v === null || v <= 0) {
    emit('update', { lotsTarget: undefined })
    return
  }
  emit('update', { lotsTarget: v })
}

function onLastDiv(v: number | null) {
  if (v === null || v <= 0) {
    emit('update', { lastDividendPerLembar: undefined })
    return
  }
  emit('update', { lastDividendPerLembar: v })
}

function onYield(v: number | null) {
  if (v === null || v <= 0) {
    emit('update', { avgDividendYieldPercent: undefined })
    return
  }
  emit('update', { avgDividendYieldPercent: Math.min(100, v) })
}

// Lots accumulation progress (PRD §5.7: Progress to Target = lotsSekarang / lotsTarget).
const lotsProgressPct = computed<number | null>(() => {
  if (props.row.lotsTarget === undefined || props.row.lotsTarget <= 0) return null
  return Math.min(100, (props.row.lot / props.row.lotsTarget) * 100)
})

// Capital gain % = (effectivePrice − hargaRataRata) / hargaRataRata × 100. Only shown
// when there's a *real* market price (live or override) — otherwise effectivePrice falls
// through to hargaRataRata itself and the gain would always be 0% (misleading).
const capitalGainPercent = computed<number | null>(() => {
  if (props.row.hargaRataRata <= 0) return null
  const hasMarketPrice =
    props.row.hargaOverride !== undefined || props.livePrice !== null
  if (!hasMarketPrice) return null
  return ((effectivePrice.value - props.row.hargaRataRata) / props.row.hargaRataRata) * 100
})

const capitalGainClass = computed(() => {
  if (capitalGainPercent.value === null) return ''
  if (capitalGainPercent.value > 0) return 'text-[var(--color-accent-emerald)]'
  if (capitalGainPercent.value < 0) return 'text-[var(--color-danger-rose)]'
  return 'text-[var(--color-text-muted)]'
})

// Annual potential dividend via the shared helper — keeps per-row display in sync with
// totalDividendAnnual that flows into PenghasilanForm + DSR + SavingsRate.
const potentialDividendAnnual = computed(() =>
  calcPotentialDividendIdr(props.row, props.livePrice),
)
</script>

<template>
  <li
    class="space-y-2 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-3"
  >
    <!-- Collapsed row: colored chip + ticker input | lot | price+pill | ✓ | expand | delete -->
    <div class="flex flex-wrap items-center gap-2">
      <TickerChip :ticker="row.ticker" size="md" />
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

      <div class="w-32">
        <InputQuantity
          :unit="t('snapshot.saham.lotLabel')"
          :aria-label="t('snapshot.saham.lotAria')"
          :step="1"
          :model-value="row.lot || null"
          @update:model-value="onLot"
        />
      </div>

      <div class="flex flex-1 min-w-[120px] items-center gap-2">
        <span
          class="inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
          :class="pillClass"
        >
          {{ pillLabel }}
        </span>
        <span class="num text-sm font-medium text-[var(--color-text-primary)]">
          {{ idr(effectivePrice) }}
        </span>
      </div>

      <Check
        v-if="isComplete"
        :size="14"
        :stroke-width="2.5"
        class="shrink-0 text-[var(--color-accent-emerald)]"
        aria-label="Baris sudah lengkap"
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
        class="rounded p-1 text-[var(--color-text-muted)] transition-all duration-200 hover:scale-110 hover:bg-[var(--color-surface-card)] hover:text-[var(--color-danger-rose)] active:scale-95"
        @click="emit('remove')"
      >
        <X :size="16" />
      </button>
    </div>

    <p
      v-if="props.isDuplicate"
      class="text-[11px] text-[var(--color-danger-rose)]"
    >
      {{ t('snapshot.saham.duplicateWarning', { ticker: row.ticker }) }}
    </p>

    <div class="flex items-baseline justify-between text-[11px] text-[var(--color-text-secondary)]">
      <span class="num">{{ idr(valueIdr) }}</span>
      <span class="flex items-baseline gap-2">
        <span
          v-if="capitalGainPercent !== null"
          class="num font-medium"
          :class="capitalGainClass"
          :title="t('snapshot.saham.capitalGainHint')"
        >
          {{ capitalGainPercent > 0 ? '+' : '' }}{{ percent(capitalGainPercent, 2) }}
        </span>
        <span v-if="liveBobot !== null" class="num">
          {{ percent(liveBobot, 1) }}
        </span>
      </span>
    </div>

    <div v-if="lotsProgressPct !== null" class="space-y-1">
      <div class="flex items-baseline justify-between text-[10px] text-[var(--color-text-muted)]">
        <span class="tabular">
          {{ t('snapshot.saham.lotsProgress', { now: row.lot, target: row.lotsTarget! }) }}
        </span>
        <span class="tabular">{{ percent(lotsProgressPct, 0) }}</span>
      </div>
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-card)]">
        <div
          class="h-full rounded-full bg-[var(--color-primary)] transition-all"
          :style="{ width: `${lotsProgressPct}%` }"
        />
      </div>
    </div>

    <!-- Expanded section: TV Symbol Info (market data) + lots target + dividend +
         override + last-updated. Symbol Info gives real-time price + market cap +
         P/E + div yield — useful context while user edits cost basis + lots target.
         Only renders when ticker is set. -->
    <div v-if="expanded" class="space-y-3 border-t border-[var(--color-border)] pt-3">
      <ClientOnly v-if="tvSymbol">
        <TradingViewSymbolInfo :symbol="tvSymbol" :height="250" />
        <template #fallback>
          <div class="h-[250px] animate-pulse rounded-[var(--radius-input)] bg-[var(--color-surface-low)]" />
        </template>
      </ClientOnly>
      <div>
        <label class="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
          {{ t('snapshot.saham.lotsTargetLabel') }}
        </label>
        <InputQuantity
          :unit="t('snapshot.saham.lotLabel')"
          :aria-label="t('snapshot.saham.lotsTargetLabel')"
          :step="1"
          :model-value="row.lotsTarget ?? null"
          @update:model-value="onLotsTarget"
        />
        <p class="mt-1 text-[10px] text-[var(--color-text-muted)]">
          {{ t('snapshot.saham.lotsTargetHelp') }}
        </p>
      </div>

      <div>
        <label class="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
          {{ t('snapshot.saham.dividendSection') }}
        </label>
        <div
          class="inline-flex h-9 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-0.5"
          role="group"
          :aria-label="t('snapshot.saham.dividendModeAria')"
        >
          <button
            type="button"
            class="rounded-[var(--radius-input)] px-3 text-xs font-medium transition-colors"
            :class="
              dividendMode === 'lastDiv'
                ? 'bg-[var(--color-primary)] text-[var(--color-surface-card)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            "
            :aria-pressed="dividendMode === 'lastDiv'"
            @click="setDividendMode('lastDiv')"
          >
            {{ t('snapshot.saham.dividendModeLastDiv') }}
          </button>
          <button
            type="button"
            class="rounded-[var(--radius-input)] px-3 text-xs font-medium transition-colors"
            :class="
              dividendMode === 'yield'
                ? 'bg-[var(--color-primary)] text-[var(--color-surface-card)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            "
            :aria-pressed="dividendMode === 'yield'"
            @click="setDividendMode('yield')"
          >
            {{ t('snapshot.saham.dividendModeYield') }}
          </button>
        </div>

        <div v-if="dividendMode === 'lastDiv'" class="mt-2">
          <InputCurrency
            prefix="Rp"
            :aria-label="t('snapshot.saham.lastDivLabel')"
            :model-value="row.lastDividendPerLembar ?? null"
            @update:model-value="onLastDiv"
          />
          <p class="mt-1 text-[10px] text-[var(--color-text-muted)]">
            {{ t('snapshot.saham.lastDivHelp') }}
          </p>
        </div>
        <div v-else class="mt-2">
          <InputQuantity
            unit="%"
            :aria-label="t('snapshot.saham.yieldLabel')"
            :step="0.1"
            :model-value="row.avgDividendYieldPercent ?? null"
            @update:model-value="onYield"
          />
          <p class="mt-1 text-[10px] text-[var(--color-text-muted)]">
            {{ t('snapshot.saham.yieldHelp') }}
          </p>
        </div>
      </div>

      <p
        v-if="potentialDividendAnnual > 0"
        class="rounded-[var(--radius-input)] bg-[var(--color-accent-emerald-soft)] px-3 py-2 text-[11px] font-medium text-[var(--color-accent-emerald)]"
      >
        {{ t('snapshot.saham.potentialDividend', { amount: idr(potentialDividendAnnual) }) }}
      </p>

      <div>
        <label class="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
          {{ t('snapshot.saham.hargaRataRataLabel') }}
        </label>
        <InputCurrency
          prefix="Rp"
          :aria-label="t('snapshot.saham.hargaRataRataLabel')"
          :model-value="row.hargaRataRata === 0 ? null : row.hargaRataRata"
          @update:model-value="onHargaRataRata"
        />
        <p class="mt-1 text-[10px] text-[var(--color-text-muted)]">
          {{ t('snapshot.saham.hargaRataRataHelp') }}
        </p>
      </div>

      <div>
        <label class="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
          {{ t('snapshot.saham.overrideLabel') }}
        </label>
        <InputCurrency
          prefix="Rp"
          :aria-label="t('snapshot.saham.overrideLabel')"
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
