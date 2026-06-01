<script setup lang="ts">
import { computed } from 'vue'
import { RotateCw } from 'lucide-vue-next'
import ButtonGhost from '~/components/common/ButtonGhost.vue'
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
  <section
    class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4 sm:p-6"
  >
    <header class="mb-3">
      <div class="flex items-start justify-between gap-3">
        <h3 class="text-base font-semibold text-[var(--color-text-primary)]">
          {{ t('snapshot.section.saham') }}
        </h3>
        <button
          v-if="onRefresh"
          type="button"
          class="inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-2 py-1 text-[11px] font-medium transition-colors"
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
      <p class="mt-0.5 text-xs text-[var(--color-text-secondary)]">
        {{ t('snapshot.saham.help') }}
      </p>
    </header>

    <ul v-if="snap.saham.length > 0" class="space-y-3">
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
    </ul>
    <p v-else class="text-xs text-[var(--color-text-muted)]">
      {{ t('snapshot.saham.empty') }}
    </p>

    <div class="mt-3">
      <ButtonGhost @click="snap.addSaham()">
        {{ t('snapshot.saham.add') }}
      </ButtonGhost>
    </div>

    <div
      v-if="snap.saham.length > 0"
      class="mt-4 flex items-baseline justify-between rounded-[var(--radius-input)] bg-[var(--color-primary-container)] px-3 py-2 text-[var(--color-surface-card)]"
    >
      <span class="text-xs font-medium uppercase tracking-wide">
        {{ t('snapshot.saham.totalLabel') }}
      </span>
      <span class="tabular text-base font-semibold">{{ idr(totalValueIdr) }}</span>
    </div>
  </section>
</template>
