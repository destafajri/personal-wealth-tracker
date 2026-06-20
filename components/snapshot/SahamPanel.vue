<script setup lang="ts">
import { computed } from 'vue'
import { CircleAlert, RotateCw } from 'lucide-vue-next'
import AddRowCta from '~/components/snapshot/AddRowCta.vue'
import PerEmitenCard from '~/components/snapshot/PerEmitenCard.vue'
import { useSnapshotStore } from '~/stores/snapshot'
import { effectiveStockPrice } from '~/lib/finance/metrics'
import { idr } from '~/lib/format/idr'
import { t } from '~/lib/copy/strings'
import type { IdxPriceRow } from '~/lib/prices/yahoo'

// Live-price plumbing from the page (snapshot.vue owns the composable so panel + cards
// share one fetch state). Mirrors CryptoPanel's prop shape — refresh button surfaces a
// retry affordance when the upstream throws.
const props = defineProps<{
  idxRows?: IdxPriceRow[]
  liveError?: boolean
  livePending?: boolean
  cooldownRemaining?: number
  onRefresh?: () => void | Promise<void>
  hideHeader?: boolean
}>()

const snap = useSnapshotStore()

const priceByTicker = computed<Record<string, IdxPriceRow>>(() => {
  const map: Record<string, IdxPriceRow> = {}
  for (const r of props.idxRows ?? []) map[r.ticker] = r
  return map
})

function priceFor(ticker: string): IdxPriceRow | null {
  if (!ticker) return null
  return priceByTicker.value[ticker] ?? null
}

// Duplicate detection: same ticker on multiple rows is flagged but not blocked — user
// might legitimately hold BBCA across multiple sekuritas (Stockbit + Mirae etc).
const duplicateTickers = computed(() => {
  const seen = new Map<string, number>()
  for (const row of snap.saham) {
    if (!row.ticker) continue
    seen.set(row.ticker, (seen.get(row.ticker) ?? 0) + 1)
  }
  return new Set([...seen.entries()].filter(([, n]) => n > 1).map(([k]) => k))
})

// Total uses the shared `effectiveStockPrice` helper so the panel summary stays in
// lockstep with dashboard metrics. If a row has hargaOverride, NetWorth/DAR/Runway/
// SafeHaven and this total all read the same number.
const totalValueIdr = computed(() =>
  snap.saham.reduce(
    (sum, row) =>
      sum + row.lot * 100 * effectiveStockPrice(row, priceFor(row.ticker)?.price ?? null),
    0,
  ),
)

function refreshLive() {
  if (props.livePending || (props.cooldownRemaining ?? 0) > 0) return
  props.onRefresh?.()
}
</script>

<template>
  <section>
    <div
      class="mb-3 flex items-start gap-2 rounded-[var(--radius-input)] border border-[var(--color-warning-amber)]/30 bg-[var(--color-warning-amber-soft)] px-3 py-2 text-xs text-[var(--color-warning-amber)]"
    >
      <CircleAlert class="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{{ t('snapshot.saham.disclaimer') }}</span>
    </div>

    <header v-if="!hideHeader || onRefresh" class="mb-3">
      <div class="flex items-start gap-3">
        <h3 v-if="!hideHeader" class="text-base font-semibold text-[var(--color-text-primary)]">
          {{ t('snapshot.section.saham') }}
        </h3>
        <button
          v-if="onRefresh"
          type="button"
          class="ml-auto inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-2 py-1 text-[11px] font-medium transition-colors"
          :class="
            liveError
              ? 'bg-[var(--color-danger-rose-soft)] text-[var(--color-danger-rose)] hover:bg-[var(--color-danger-rose-soft)]/80'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-low)] hover:text-[var(--color-text-secondary)]'
          "
          :disabled="livePending || (cooldownRemaining ?? 0) > 0"
          :aria-label="t('snapshot.saham.refreshAria')"
          @click="refreshLive"
        >
          <RotateCw :size="12" :class="livePending ? 'animate-spin' : ''" />
          <span>{{
            (cooldownRemaining ?? 0) > 0
              ? t('snapshot.saham.refreshCooldown', { sec: cooldownRemaining ?? 0 })
              : liveError
                ? t('snapshot.saham.refreshError')
                : t('snapshot.saham.refresh')
          }}</span>
        </button>
      </div>
      <p v-if="!hideHeader" class="mt-0.5 text-xs text-[var(--color-text-secondary)]">
        {{ t('snapshot.saham.help') }}
      </p>
    </header>

    <TransitionGroup
      v-if="snap.saham.length > 0"
      name="row-slide"
      tag="ul"
      class="grid gap-3 lg:grid-cols-2"
    >
      <PerEmitenCard
        v-for="row in snap.saham"
        :key="row.id"
        :row="row"
        :live-price="priceFor(row.ticker)?.price ?? null"
        :live-stale="priceFor(row.ticker)?.stale ?? false"
        :live-fetched-at="priceFor(row.ticker)?.fetchedAt ?? null"
        :total-value-idr="totalValueIdr"
        :is-duplicate="!!row.ticker && duplicateTickers.has(row.ticker)"
        @update="(patch) => snap.updateSaham(row.id, patch)"
        @remove="snap.removeSaham(row.id)"
      />
    </TransitionGroup>
    <p v-else class="text-xs text-[var(--color-text-muted)]">
      {{ t('snapshot.saham.empty') }}
    </p>

    <AddRowCta
      noun="saham"
      :has-row="snap.saham.length > 0"
      class="mt-3"
      @add="snap.addSaham()"
    />

    <div
      v-if="snap.saham.length > 0"
      class="mt-4 flex items-baseline justify-between rounded-[var(--radius-input)] bg-[var(--color-primary-container)] px-3 py-2 text-[var(--color-surface-card)]"
    >
      <span class="text-xs font-medium uppercase tracking-wide">
        {{ t('snapshot.saham.totalLabel') }}
      </span>
      <span class="num text-base font-semibold">{{ idr(totalValueIdr) }}</span>
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
