<script setup lang="ts">
import { computed, useId } from 'vue'
import { X } from 'lucide-vue-next'
import InputQuantity from '~/components/common/InputQuantity.vue'
import InputCurrency from '~/components/common/InputCurrency.vue'
import ButtonGhost from '~/components/common/ButtonGhost.vue'
import { useSnapshotStore } from '~/stores/snapshot'
import { useDerivedStore } from '~/stores/derived'
import { idr } from '~/lib/format/idr'
import { t } from '~/lib/copy/strings'
import {
  COINGECKO_TOP_COINS,
  findCoinById,
  findCoinBySymbol,
} from '~/lib/data/coingecko-top-coins'
import type { CryptoHolding, CryptoMode } from '~/lib/types/snapshot'

const snap = useSnapshotStore()
const derived = useDerivedStore()

// One shared datalist serves every row's coin dropdown — browsers handle the search +
// filter natively and the IDs stay short (the dropdown shows symbol + name, the value
// stored on input is the canonical CoinGecko ID).
const datalistId = useId()

// Compact-notation formatters for the multi-currency rate line. Compact keeps both
// large values (BTC: $95K, ₩125M) and small (XRP: $0.62) readable.
const fmtUsd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
  notation: 'compact',
})
const fmtKrw = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'KRW',
  maximumFractionDigits: 2,
  notation: 'compact',
})

// Duplicate detection: same coinId on multiple rows is flagged but not blocked — user
// might legitimately split a holding across wallets/exchanges.
const duplicateCoinIds = computed(() => {
  const seen = new Map<string, number>()
  for (const row of snap.crypto) {
    if (!row.coinId) continue
    seen.set(row.coinId, (seen.get(row.coinId) ?? 0) + 1)
  }
  return new Set([...seen.entries()].filter(([, n]) => n > 1).map(([k]) => k))
})

function rateFor(coinId: string) {
  if (!coinId) return null
  return derived.priceView?.cryptoByCoinId[coinId] ?? null
}

function coinSymbol(coinId: string): string {
  return findCoinById(coinId)?.symbol ?? ''
}

function coinName(coinId: string): string {
  return findCoinById(coinId)?.name ?? ''
}

// Rate line: "~Rp 1.5M · ~$95K · ~₩125M / 1 BTC". Returns empty string when there's
// nothing to show — caller swaps in the hint copy.
function rateLine(coinId: string): string {
  if (!coinId) return ''
  const rate = rateFor(coinId)
  if (rate === null || rate.idr === null) return ''
  const segments: string[] = [`~${idr(rate.idr)}`]
  if (rate.usd !== null) segments.push(`~${fmtUsd.format(rate.usd)}`)
  if (rate.krw !== null) segments.push(`~${fmtKrw.format(rate.krw)}`)
  return t('snapshot.crypto.rateLine', {
    rates: segments.join(' · '),
    sym: coinSymbol(coinId),
  })
}

function rateHint(coinId: string): string {
  if (!coinId) return t('snapshot.crypto.ratePickCoin')
  return t('snapshot.crypto.rateStale', { sym: coinSymbol(coinId) || coinId })
}

// Live IDR equivalent for a unit-mode row. Returns null when the rate is missing so the
// UI can render its stale hint instead of "≈ Rp 0".
function liveIdrEquivalent(row: CryptoHolding): number | null {
  if (row.mode !== 'unit') return null
  const rate = rateFor(row.coinId)
  if (rate === null || rate.idr === null) return null
  return (row.units || 0) * rate.idr
}

// Convert a non-unit row to IDR (for the total bar). Mirrors sumCryptoIdr in metrics.ts
// but pulls from priceView directly so each row's "≈ Rp X" line can show partial sums.
function nonUnitIdrEquivalent(row: CryptoHolding): number | null {
  if (row.mode === 'idr') return row.amount || 0
  const fx = derived.priceView?.fxRates
  if (row.mode === 'usd') {
    const rate = fx?.USD ?? null
    return rate === null ? null : (row.amount || 0) * rate
  }
  if (row.mode === 'krw') {
    const rate = fx?.KRW ?? null
    return rate === null ? null : (row.amount || 0) * rate
  }
  return null
}

function rowIdrEquivalent(row: CryptoHolding): number | null {
  return row.mode === 'unit' ? liveIdrEquivalent(row) : nonUnitIdrEquivalent(row)
}

// Datalist gives back the raw symbol (e.g. "BTC"); we resolve it through the catalog
// to its canonical CoinGecko id ("bitcoin"). Unrecognized typing clears the row's coin
// — better than persisting an unresolvable id that would silently fail to price.
function onCoinPick(id: string, ev: Event) {
  const raw = (ev.target as HTMLInputElement).value
  const coin = findCoinBySymbol(raw)
  snap.updateCrypto(id, { coinId: coin?.id ?? '' })
}

function onUnits(id: string, v: number | null) {
  snap.updateCrypto(id, { units: v ?? 0 })
}

function onAmount(id: string, v: number | null) {
  snap.updateCrypto(id, { amount: v ?? 0 })
}

function setMode(id: string, mode: CryptoMode) {
  snap.updateCrypto(id, { mode })
}

// Mode toggle config — drives the segmented control + the amount-input prefix copy.
const MODE_OPTIONS: { key: CryptoMode; labelKey: 'snapshot.crypto.modeUnit' | 'snapshot.crypto.modeIdr' | 'snapshot.crypto.modeUsd' | 'snapshot.crypto.modeKrw' }[] = [
  { key: 'unit', labelKey: 'snapshot.crypto.modeUnit' },
  { key: 'idr', labelKey: 'snapshot.crypto.modeIdr' },
  { key: 'usd', labelKey: 'snapshot.crypto.modeUsd' },
  { key: 'krw', labelKey: 'snapshot.crypto.modeKrw' },
]

function amountPrefix(mode: CryptoMode): string {
  if (mode === 'idr') return 'Rp'
  if (mode === 'usd') return '$'
  if (mode === 'krw') return '₩'
  return ''
}

const total = computed(() =>
  snap.crypto.reduce((s, c) => s + (rowIdrEquivalent(c) ?? 0), 0),
)
</script>

<template>
  <section
    class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4 sm:p-6"
  >
    <header class="mb-3">
      <h3 class="text-base font-semibold text-[var(--color-text-primary)]">
        {{ t('snapshot.section.crypto') }}
      </h3>
      <p class="mt-0.5 text-xs text-[var(--color-text-secondary)]">
        {{ t('snapshot.crypto.help') }}
      </p>
    </header>

    <!-- Shared datalist for native autocomplete on every row's coin picker. The value
         the user types/picks is the ticker symbol (BTC, ETH); the panel resolves that
         to the canonical CoinGecko id on commit. Coin name is shown as the option label
         so users searching by name (e.g., typing "bit" for Bitcoin) still see matches in
         browsers that filter on both attributes. -->
    <datalist :id="datalistId">
      <option
        v-for="c in COINGECKO_TOP_COINS"
        :key="c.id"
        :value="c.symbol"
        :label="c.name"
      />
    </datalist>

    <ul v-if="snap.crypto.length > 0" class="space-y-3">
      <li
        v-for="row in snap.crypto"
        :key="row.id"
        class="space-y-2 rounded-[var(--radius-input)] bg-[var(--color-surface-low)] p-3"
      >
        <!-- Header: coin picker + remove. Mode toggle is on its own row to keep the
             coin picker wide enough to read the suggested coin name. -->
        <div class="flex items-center gap-2">
          <div class="flex-1">
            <!-- :value derives from the stored coinId so the field always shows the
                 canonical ticker after commit. @change (not @input) means we only
                 resolve once the user finishes typing — datalist selection fires
                 change, and so does blur after manual typing. Unrecognized text snaps
                 back to the last valid symbol (or empty) when Vue re-renders. -->
            <input
              :list="datalistId"
              type="text"
              :value="findCoinById(row.coinId)?.symbol ?? ''"
              :placeholder="t('snapshot.crypto.coinPlaceholder')"
              :aria-label="t('snapshot.crypto.coinAria')"
              autocomplete="off"
              autocapitalize="characters"
              class="h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 text-sm uppercase tracking-wide text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
              @change="onCoinPick(row.id, $event)"
            >
          </div>
          <button
            type="button"
            :aria-label="t('snapshot.crypto.remove')"
            class="rounded p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-card)] hover:text-[var(--color-danger-rose)]"
            @click="snap.removeCrypto(row.id)"
          >
            <X :size="16" />
          </button>
        </div>

        <!-- Symbol + name preview pulled from the catalog when a valid coin is picked.
             Stays empty (whitespace placeholder) before the user picks. -->
        <p
          v-if="row.coinId && coinSymbol(row.coinId)"
          class="text-[11px] text-[var(--color-text-secondary)]"
        >
          {{ coinSymbol(row.coinId) }} — {{ coinName(row.coinId) }}
        </p>

        <!-- Mode toggle: Unit / IDR / USD / KRW -->
        <div
          class="inline-flex h-9 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-0.5"
          role="group"
          :aria-label="t('snapshot.crypto.modeAria')"
        >
          <button
            v-for="opt in MODE_OPTIONS"
            :key="opt.key"
            type="button"
            class="rounded-[var(--radius-input)] px-3 text-xs font-medium transition-colors"
            :class="
              row.mode === opt.key
                ? 'bg-[var(--color-primary)] text-[var(--color-surface-card)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            "
            :aria-pressed="row.mode === opt.key"
            @click="setMode(row.id, opt.key)"
          >
            {{ t(opt.labelKey) }}
          </button>
        </div>

        <!-- Multi-currency rate line (always shown for context, including non-unit
             modes — a 'wajar gak harganya' reference). -->
        <p class="tabular text-[11px] text-[var(--color-text-muted)]">
          <template v-if="rateLine(row.coinId)">{{ rateLine(row.coinId) }}</template>
          <template v-else>{{ rateHint(row.coinId) }}</template>
        </p>

        <!-- Value input — depends on mode -->
        <div v-if="row.mode === 'unit'">
          <InputQuantity
            :unit="coinSymbol(row.coinId) || t('snapshot.crypto.unitFallback')"
            :step="0.0001"
            :model-value="row.units || null"
            @update:model-value="(v) => onUnits(row.id, v)"
          />
          <p class="tabular mt-1 text-[11px] text-[var(--color-text-muted)]">
            <template v-if="liveIdrEquivalent(row) !== null">
              ≈ {{ idr(liveIdrEquivalent(row)) }}
            </template>
            <template v-else>{{ t('snapshot.crypto.idrStale') }}</template>
          </p>
        </div>
        <div v-else>
          <InputCurrency
            :prefix="amountPrefix(row.mode)"
            :placeholder="t('snapshot.crypto.amountPlaceholder')"
            :model-value="row.amount === 0 ? null : row.amount"
            @update:model-value="(v) => onAmount(row.id, v)"
          />
          <p
            v-if="row.mode !== 'idr'"
            class="tabular mt-1 text-[11px] text-[var(--color-text-muted)]"
          >
            <template v-if="nonUnitIdrEquivalent(row) !== null">
              ≈ {{ idr(nonUnitIdrEquivalent(row)) }}
            </template>
            <template v-else>{{ t('snapshot.crypto.fxStale') }}</template>
          </p>
        </div>

        <p
          v-if="row.coinId && duplicateCoinIds.has(row.coinId)"
          class="text-[11px] text-[var(--color-danger-rose)]"
        >
          {{
            t('snapshot.crypto.duplicateWarning', {
              sym: coinSymbol(row.coinId) || row.coinId,
            })
          }}
        </p>
      </li>
    </ul>
    <p v-else class="text-xs text-[var(--color-text-muted)]">
      {{ t('snapshot.crypto.empty') }}
    </p>

    <div class="mt-3">
      <ButtonGhost @click="snap.addCrypto()">
        {{ t('snapshot.crypto.add') }}
      </ButtonGhost>
    </div>

    <div
      class="mt-4 flex items-baseline justify-between rounded-[var(--radius-input)] bg-[var(--color-primary-container)] px-3 py-2 text-[var(--color-surface-card)]"
    >
      <span class="text-xs font-medium uppercase tracking-wide">
        {{ t('snapshot.crypto.totalLabel') }}
      </span>
      <span class="tabular text-base font-semibold">{{ idr(total) }}</span>
    </div>
  </section>
</template>
