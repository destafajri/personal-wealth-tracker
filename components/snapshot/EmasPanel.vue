<script setup lang="ts">
import { computed } from 'vue'
import { RotateCw } from 'lucide-vue-next'
import InputQuantity from '~/components/common/InputQuantity.vue'
import { useSnapshotStore } from '~/stores/snapshot'
import { useDerivedStore } from '~/stores/derived'
import { idr } from '~/lib/format/idr'
import { EMAS_VALUATION, pawnedGramOf, type EmasCategory } from '~/lib/finance/emas'
import { t } from '~/lib/copy/strings'
import type { EmasState } from '~/lib/types/snapshot'

const props = defineProps<{
  liveError?: boolean
  livePending?: boolean
  cooldownRemaining?: number
  onRefresh?: () => void | Promise<void>
  hideHeader?: boolean
  disabled?: boolean
  goldSource?: 'pegadaian' | 'paxg' | 'stale' | null
}>()

const snap = useSnapshotStore()
const derived = useDerivedStore()

function refreshLive() {
  if (props.livePending || (props.cooldownRemaining ?? 0) > 0) return
  props.onRefresh?.()
}

const digitalRate = computed(() => derived.priceView?.goldDigitalIdrPerGram ?? null)
const antamRate = computed(() => derived.priceView?.goldAntam1gIdr ?? null)

function effective(antam: number | null, mult: number): number | null {
  return antam === null ? null : Math.round(antam * mult)
}

const fisikRate = computed(() => effective(antamRate.value, EMAS_VALUATION.fisikAntamSpread))
const p18Rate = computed(() => effective(antamRate.value, EMAS_VALUATION.perhiasan18K))
const p14Rate = computed(() => effective(antamRate.value, EMAS_VALUATION.perhiasan14K))
const p10Rate = computed(() => effective(antamRate.value, EMAS_VALUATION.perhiasan10K))

function rateLabel(rate: number | null): string {
  return rate === null
    ? t('snapshot.emas.staleRate')
    : t('snapshot.emas.rateLine', { rate: idr(rate) })
}

const totalTertahan = computed(() =>
  snap.gadai.reduce((s, g) => s + (g.gramTertahan || 0), 0),
)
const kontrakCount = computed(() => snap.gadai.length)

const snapView = computed(() => ({
  penghasilan: snap.penghasilan,
  penghasilanLain: snap.penghasilanLain,
  pengeluaran: snap.pengeluaran,
  pengeluaranLain: snap.pengeluaranLain,
  asetLikuid: snap.asetLikuid,
  asetNonLikuid: snap.asetNonLikuid,
  emas: snap.emas,
  saham: snap.saham,
  crypto: snap.crypto,
  cicilanAktif: snap.cicilanAktif,
  utangPribadi: snap.utangPribadi,
  gadai: snap.gadai,
}))

function pawnedFor(cat: EmasCategory): number {
  return pawnedGramOf(snapView.value, cat)
}

function breakdownLine(cat: EmasCategory, total: number): string {
  const pawned = pawnedFor(cat)
  if (pawned === 0 || total === 0) return ''
  const available = Math.max(0, total - pawned)
  return t('snapshot.emas.atHomeBreakdown', { available, pawned, total })
}

function field(key: keyof EmasState, value: number | null) {
  snap.setEmas({ [key]: value ?? 0 } as Partial<EmasState>)
}
</script>

<template>
  <section>
    <!-- Maintenance banner -->
    <div
      v-if="disabled"
      class="mb-4 flex items-center gap-2 rounded-[var(--radius-input)] border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:border-amber-600 dark:bg-amber-900/40 dark:text-amber-200"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <span class="text-xs font-medium">Harga emas sedang dalam perbaikan. Fitur emas sementara dinonaktifkan.</span>
    </div>

    <!-- Price source badge -->
    <div
      v-if="goldSource === 'pegadaian'"
      class="mb-3 flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      <span>Harga dari Pegadaian.co.id</span>
    </div>
    <div
      v-else-if="goldSource === 'paxg'"
      class="mb-3 flex items-start gap-2 rounded-[var(--radius-input)] border border-[var(--color-warning-amber)]/30 bg-[var(--color-warning-amber-soft)] px-3 py-2 text-xs text-[var(--color-warning-amber)]"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="mt-0.5 h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
      <span>Harga acuan internasional (PAXG). Valuasi berdasarkan harga buyback. Harga jual baru biasanya 4–12% lebih tinggi tergantung jenis emas.</span>
    </div>
    <div
      v-else-if="goldSource === 'stale'"
      class="mb-3 flex items-center gap-1.5 text-[11px] text-[var(--color-danger-rose)]"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      <span>Harga emas tidak tersedia saat ini</span>
    </div>

    <header v-if="!hideHeader || onRefresh" class="mb-3">
      <div class="flex items-start gap-3">
        <h3 v-if="!hideHeader" class="text-base font-semibold text-[var(--color-text-primary)]">
          {{ t('snapshot.section.emas') }}
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
          :aria-label="t('snapshot.emas.refreshAria')"
          @click="refreshLive"
        >
          <RotateCw :size="12" :class="livePending ? 'animate-spin' : ''" />
          <span>{{
            (cooldownRemaining ?? 0) > 0
              ? t('snapshot.emas.refreshCooldown', { sec: cooldownRemaining ?? 0 })
              : liveError
                ? t('snapshot.emas.refreshError')
                : t('snapshot.emas.refresh')
          }}</span>
        </button>
      </div>
      <p v-if="!hideHeader" class="mt-0.5 text-xs text-[var(--color-text-secondary)]">
        {{ t('snapshot.emas.help') }}
      </p>
    </header>

    <div class="space-y-4">
      <!-- Digital -->
      <div>
        <div class="flex items-baseline justify-between">
          <span class="text-sm font-medium text-[var(--color-text-primary)]">
            {{ t('snapshot.emas.digital.label') }}
          </span>
          <span class="tabular text-[11px] text-[var(--color-text-muted)]">
            {{ rateLabel(digitalRate) }}
          </span>
        </div>
        <p class="text-[11px] text-[var(--color-text-secondary)]">
          {{ t('snapshot.emas.digital.note') }}
        </p>
        <div class="mt-2">
          <InputQuantity
            unit="gram"
            :step="0.01"
            :disabled="disabled"
            :model-value="snap.emas.digitalGram || null"
            @update:model-value="field('digitalGram', $event)"
          />
        </div>
        <p
          v-if="breakdownLine('digital', snap.emas.digitalGram)"
          class="mt-1 text-[11px] text-[var(--color-text-muted)]"
        >
          {{ breakdownLine('digital', snap.emas.digitalGram) }}
        </p>
      </div>

      <!-- Fisik Antam -->
      <div>
        <div class="flex items-baseline justify-between">
          <span class="text-sm font-medium text-[var(--color-text-primary)]">
            {{ t('snapshot.emas.fisik.label') }}
          </span>
          <span class="tabular text-[11px] text-[var(--color-text-muted)]">
            {{ rateLabel(fisikRate) }}
          </span>
        </div>
        <p class="text-[11px] text-[var(--color-text-secondary)]">
          {{ t('snapshot.emas.fisik.note') }}
        </p>
        <div class="mt-2">
          <InputQuantity
            unit="gram"
            :step="0.1"
            :disabled="disabled"
            :model-value="snap.emas.fisikAntamGram || null"
            @update:model-value="field('fisikAntamGram', $event)"
          />
        </div>
        <p
          v-if="breakdownLine('fisikAntam', snap.emas.fisikAntamGram)"
          class="mt-1 text-[11px] text-[var(--color-text-muted)]"
        >
          {{ breakdownLine('fisikAntam', snap.emas.fisikAntamGram) }}
        </p>
      </div>

      <!-- Perhiasan group -->
      <div class="rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-3">
        <div class="mb-2">
          <span class="text-sm font-medium text-[var(--color-text-primary)]">
            {{ t('snapshot.emas.perhiasan.label') }}
          </span>
          <p class="text-[11px] text-[var(--color-text-secondary)]">
            {{ t('snapshot.emas.perhiasan.note') }}
          </p>
        </div>

        <div class="space-y-3">
          <div>
            <div class="flex items-baseline justify-between">
              <span class="text-xs font-medium text-[var(--color-text-secondary)]">
                {{ t('snapshot.emas.perhiasan.18K.label') }}
              </span>
              <span class="tabular text-[11px] text-[var(--color-text-muted)]">
                {{ rateLabel(p18Rate) }}
              </span>
            </div>
            <p class="text-[11px] text-[var(--color-text-muted)]">
              {{ t('snapshot.emas.perhiasan.18K.note') }}
            </p>
            <div class="mt-1">
              <InputQuantity
                unit="gram"
                :step="0.1"
                :disabled="disabled"
                :model-value="snap.emas.perhiasan18KGram || null"
                @update:model-value="field('perhiasan18KGram', $event)"
              />
            </div>
            <p
              v-if="breakdownLine('perhiasan18K', snap.emas.perhiasan18KGram)"
              class="mt-1 text-[11px] text-[var(--color-text-muted)]"
            >
              {{ breakdownLine('perhiasan18K', snap.emas.perhiasan18KGram) }}
            </p>
          </div>

          <div>
            <div class="flex items-baseline justify-between">
              <span class="text-xs font-medium text-[var(--color-text-secondary)]">
                {{ t('snapshot.emas.perhiasan.14K.label') }}
              </span>
              <span class="tabular text-[11px] text-[var(--color-text-muted)]">
                {{ rateLabel(p14Rate) }}
              </span>
            </div>
            <p class="text-[11px] text-[var(--color-text-muted)]">
              {{ t('snapshot.emas.perhiasan.14K.note') }}
            </p>
            <div class="mt-1">
              <InputQuantity
                unit="gram"
                :step="0.1"
                :disabled="disabled"
                :model-value="snap.emas.perhiasan14KGram || null"
                @update:model-value="field('perhiasan14KGram', $event)"
              />
            </div>
            <p
              v-if="breakdownLine('perhiasan14K', snap.emas.perhiasan14KGram)"
              class="mt-1 text-[11px] text-[var(--color-text-muted)]"
            >
              {{ breakdownLine('perhiasan14K', snap.emas.perhiasan14KGram) }}
            </p>
          </div>

          <div>
            <div class="flex items-baseline justify-between">
              <span class="text-xs font-medium text-[var(--color-text-secondary)]">
                {{ t('snapshot.emas.perhiasan.10K.label') }}
              </span>
              <span class="tabular text-[11px] text-[var(--color-text-muted)]">
                {{ rateLabel(p10Rate) }}
              </span>
            </div>
            <p class="text-[11px] text-[var(--color-text-muted)]">
              {{ t('snapshot.emas.perhiasan.10K.note') }}
            </p>
            <div class="mt-1">
              <InputQuantity
                unit="gram"
                :step="0.1"
                :disabled="disabled"
                :model-value="snap.emas.perhiasan10KGram || null"
                @update:model-value="field('perhiasan10KGram', $event)"
              />
            </div>
            <p
              v-if="breakdownLine('perhiasan10K', snap.emas.perhiasan10KGram)"
              class="mt-1 text-[11px] text-[var(--color-text-muted)]"
            >
              {{ breakdownLine('perhiasan10K', snap.emas.perhiasan10KGram) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      class="mt-4 flex items-baseline justify-between rounded-[var(--radius-input)] bg-[var(--color-primary-container)] px-3 py-2 text-[var(--color-surface-card)]"
    >
      <span class="text-xs font-medium uppercase tracking-wide">
        {{ t('snapshot.emas.totalLabel') }}
      </span>
      <span class="tabular text-base font-semibold">
        {{ idr(derived.emasBreakdown.total) }}
      </span>
    </div>

    <p
      class="mt-3 rounded-[var(--radius-input)] bg-[var(--color-surface-low)] px-3 py-2 text-xs text-[var(--color-text-secondary)]"
    >
      {{
        kontrakCount === 0
          ? t('snapshot.emas.tertahanZero')
          : t('snapshot.emas.tertahanDerived', {
              grams: totalTertahan,
              count: kontrakCount,
            })
      }}
    </p>
  </section>
</template>
