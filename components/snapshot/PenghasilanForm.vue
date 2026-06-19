<script setup lang="ts">
import { computed } from 'vue'
import { Banknote, CirclePlus, Coins, Landmark, PiggyBank, X } from 'lucide-vue-next'
import InputCurrency from '~/components/common/InputCurrency.vue'
import AddRowCta from '~/components/snapshot/AddRowCta.vue'
import { useSnapshotStore } from '~/stores/snapshot'
import { useDerivedStore } from '~/stores/derived'
import { useUndoDelete } from '~/composables/useUndoDelete'
import { rateToIdr } from '~/lib/finance/fx'
import { idr } from '~/lib/format/idr'
import { t } from '~/lib/copy/strings'
import { CURRENCIES, type Currency } from '~/lib/types/snapshot'

defineProps<{ hideHeader?: boolean }>()

const snap = useSnapshotStore()
const derived = useDerivedStore()
const undo = useUndoDelete()

function handleRemoveLain(rowId: string) {
  const idx = snap.penghasilanLain.findIndex((r) => r.id === rowId)
  if (idx === -1) return
  const row = snap.penghasilanLain[idx]!
  const { id, ...rowData } = row
  void id
  undo.capture('penghasilanLain', rowData, idx)
  snap.removePenghasilanLain(rowId)
}

// Auto-derived monthly estimasi rows surfaced inline: saham dividen + bunga sbn +
// bunga deposito. Same numbers that flow into DSR/SavingsRate via metrics layer.
const dividenMonthly = computed(() => derived.dividendMonthly)
const dividenAnnual = computed(() => derived.dividendAnnual)
const hasDividen = computed(() => dividenAnnual.value > 0)

const bungaSbnMonthly = computed(() => derived.bungaSbnMonthly)
const bungaSbnAnnual = computed(() => derived.bungaSbnAnnual)
const hasBungaSbn = computed(() => bungaSbnAnnual.value > 0)

const bungaDepositoMonthly = computed(() => derived.bungaDepositoMonthly)
const bungaDepositoAnnual = computed(() => derived.bungaDepositoAnnual)
const hasBungaDeposito = computed(() => bungaDepositoAnnual.value > 0)

// Gaji bersih IDR equivalent (when currency != IDR) — kept in this component (not pulled
// from derived) because the form is the only place it's surfaced as a per-row hint.
function gajiIdrEquivalent(): number | null {
  const cur = snap.penghasilan.currency
  if (cur === 'IDR') return null
  const rate = rateToIdr(cur, derived.priceView?.fxRates)
  if (rate === null) return null
  return (snap.penghasilan.amount || 0) * rate
}

function lainIdrEquivalent(row: { amount: number; currency?: Currency }): number | null {
  const cur = row.currency ?? 'IDR'
  if (cur === 'IDR') return null
  const rate = rateToIdr(cur, derived.priceView?.fxRates)
  if (rate === null) return null
  return (row.amount || 0) * rate
}
</script>

<template>
  <section
    class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4 sm:p-6"
  >
    <header v-if="!hideHeader" class="mb-3">
      <h3 class="text-base font-semibold uppercase tracking-wide text-[var(--color-text-primary)]">
        {{ t('snapshot.section.penghasilan') }} / Bulan
      </h3>
    </header>

    <div class="space-y-3">
      <!-- Row 1: Gaji Bersih (currency-aware) -->
      <div class="flex items-start gap-3 rounded-[var(--radius-input)] bg-[var(--color-surface-low)] p-3">
        <Banknote
          :size="20"
          class="mt-1 shrink-0 text-[var(--color-text-secondary)]"
        />
        <div class="flex-1 space-y-1">
          <label
            for="penghasilan-gaji"
            class="block text-xs font-medium text-[var(--color-text-secondary)]"
          >
            {{ t('snapshot.penghasilan.gajiLabel') }}
          </label>
          <div class="mt-1">
            <InputCurrency
              id="penghasilan-gaji"
              :aria-label="t('snapshot.penghasilan.gajiLabel')"
              :currency="snap.penghasilan.currency"
              :currencies="CURRENCIES"
              :model-value="snap.penghasilan.amount === 0 ? null : snap.penghasilan.amount"
              @update:model-value="snap.setPenghasilanAmount($event ?? 0)"
              @update:currency="snap.setPenghasilanCurrency($event)"
            />
          </div>
          <p
            v-if="snap.penghasilan.currency !== 'IDR'"
            class="tabular text-[11px] text-[var(--color-text-muted)]"
          >
            <template v-if="gajiIdrEquivalent() !== null">
              ≈ {{ idr(gajiIdrEquivalent()) }}
            </template>
            <template v-else>{{ t('snapshot.row.fxStale') }}</template>
          </p>
        </div>
      </div>

      <!-- Row 2: Penghasilan Lain (multi-row + per-row currency) -->
      <div class="rounded-[var(--radius-input)] bg-[var(--color-surface-low)] p-3">
        <div class="flex items-start gap-3">
          <CirclePlus
            :size="20"
            class="mt-1 shrink-0 text-[var(--color-text-secondary)]"
          />
          <div class="flex-1">
            <label
              class="block text-xs font-medium text-[var(--color-text-secondary)]"
            >
              {{ t('snapshot.penghasilan.lainLabel') }}
            </label>
            <p
              v-if="snap.penghasilanLain.length === 0"
              class="mt-2 text-[11px] text-[var(--color-text-muted)]"
            >
              Belum ada penghasilan lain. Freelance, THR, komisi, dividen — semua sampingan masuk sini.
            </p>
            <TransitionGroup
              v-else
              name="row-slide"
              tag="ul"
              class="mt-2 divide-y divide-[var(--color-border)]"
            >
              <li
                v-for="row in snap.penghasilanLain"
                :key="row.id"
                class="space-y-1 py-2 first:pt-0 last:pb-0"
              >
                <div class="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    :value="row.label"
                    :placeholder="t('snapshot.penghasilan.lainLabelPlaceholder')"
                    class="h-12 min-w-0 flex-1 basis-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 text-sm text-[var(--color-text-primary)] outline-none transition-colors duration-200 focus:border-[var(--color-primary)] sm:basis-auto"
                    @input="
                      snap.updatePenghasilanLain(row.id, {
                        label: ($event.target as HTMLInputElement).value,
                      })
                    "
                  >
                  <div class="min-w-0 flex-1 sm:w-52 sm:flex-initial">
                    <InputCurrency
                      :model-value="row.amount === 0 ? null : row.amount"
                      :currency="row.currency ?? 'IDR'"
                      :currencies="CURRENCIES"
                      :placeholder="t('snapshot.row.idrPlaceholder')"
                      @update:model-value="
                        snap.updatePenghasilanLain(row.id, { amount: $event ?? 0 })
                      "
                      @update:currency="
                        snap.updatePenghasilanLain(row.id, { currency: $event })
                      "
                    />
                  </div>
                  <button
                    type="button"
                    :aria-label="t('snapshot.penghasilan.lainRemove')"
                    class="shrink-0 rounded p-2 text-[var(--color-text-muted)] transition-all duration-200 hover:scale-110 hover:bg-[var(--color-surface-card)] hover:text-[var(--color-danger-rose)] active:scale-95"
                    @click="handleRemoveLain(row.id)"
                  >
                    <X :size="16" />
                  </button>
                </div>
                <p
                  v-if="(row.currency ?? 'IDR') !== 'IDR'"
                  class="tabular pl-2 text-[11px] text-[var(--color-text-muted)]"
                >
                  <template v-if="lainIdrEquivalent(row) !== null">
                    ≈ {{ idr(lainIdrEquivalent(row)) }}
                  </template>
                  <template v-else>{{ t('snapshot.row.fxStale') }}</template>
                </p>
              </li>
            </TransitionGroup>
            <AddRowCta
              noun="penghasilan lain"
              :has-row="snap.penghasilanLain.length > 0"
              class="mt-2"
              @add="snap.addPenghasilanLain()"
            />
          </div>
        </div>
      </div>

      <!-- Auto rows: Dividen Saham, Bunga SBN, Bunga Deposito (ESTIMASI). Same pattern. -->
      <div
        v-if="hasDividen"
        class="flex items-start gap-3 rounded-[var(--radius-input)] bg-[var(--color-surface-low)] p-3"
      >
        <PiggyBank
          :size="20"
          class="mt-1 shrink-0 text-[var(--color-accent-emerald)]"
        />
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-[var(--color-text-secondary)]">
              {{ t('snapshot.penghasilan.dividenLabel') }}
            </span>
            <span
              class="rounded-[var(--radius-pill)] bg-[var(--color-accent-emerald-soft)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--color-accent-emerald)]"
            >
              {{ t('pill.estimasi') }}
            </span>
          </div>
          <p class="tabular mt-1 break-all text-lg font-semibold text-[var(--color-text-primary)]">
            {{ idr(dividenMonthly) }}
          </p>
          <p class="tabular text-[11px] text-[var(--color-text-muted)]">
            {{ t('snapshot.penghasilan.dividenAnnual', { amount: idr(dividenAnnual) }) }}
          </p>
          <p class="mt-1 text-[11px] italic text-[var(--color-text-muted)]">
            {{ t('snapshot.penghasilan.dividenHint') }}
          </p>
        </div>
      </div>

      <div
        v-if="hasBungaSbn"
        class="flex items-start gap-3 rounded-[var(--radius-input)] bg-[var(--color-surface-low)] p-3"
      >
        <Landmark
          :size="20"
          class="mt-1 shrink-0 text-[var(--color-accent-emerald)]"
        />
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-[var(--color-text-secondary)]">
              {{ t('snapshot.penghasilan.bungaSbnLabel') }}
            </span>
            <span
              class="rounded-[var(--radius-pill)] bg-[var(--color-accent-emerald-soft)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--color-accent-emerald)]"
            >
              {{ t('pill.estimasi') }}
            </span>
          </div>
          <p class="tabular mt-1 break-all text-lg font-semibold text-[var(--color-text-primary)]">
            {{ idr(bungaSbnMonthly) }}
          </p>
          <p class="tabular text-[11px] text-[var(--color-text-muted)]">
            {{ t('snapshot.penghasilan.dividenAnnual', { amount: idr(bungaSbnAnnual) }) }}
          </p>
          <p class="mt-1 text-[11px] italic text-[var(--color-text-muted)]">
            {{ t('snapshot.penghasilan.bungaSbnHint') }}
          </p>
        </div>
      </div>

      <div
        v-if="hasBungaDeposito"
        class="flex items-start gap-3 rounded-[var(--radius-input)] bg-[var(--color-surface-low)] p-3"
      >
        <Coins
          :size="20"
          class="mt-1 shrink-0 text-[var(--color-accent-emerald)]"
        />
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-[var(--color-text-secondary)]">
              {{ t('snapshot.penghasilan.bungaDepositoLabel') }}
            </span>
            <span
              class="rounded-[var(--radius-pill)] bg-[var(--color-accent-emerald-soft)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--color-accent-emerald)]"
            >
              {{ t('pill.estimasi') }}
            </span>
          </div>
          <p class="tabular mt-1 break-all text-lg font-semibold text-[var(--color-text-primary)]">
            {{ idr(bungaDepositoMonthly) }}
          </p>
          <p class="tabular text-[11px] text-[var(--color-text-muted)]">
            {{ t('snapshot.penghasilan.dividenAnnual', { amount: idr(bungaDepositoAnnual) }) }}
          </p>
          <p class="mt-1 text-[11px] italic text-[var(--color-text-muted)]">
            {{ t('snapshot.penghasilan.bungaDepositoHint') }}
          </p>
        </div>
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
