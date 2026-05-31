<script setup lang="ts">
import { computed } from 'vue'
import { Banknote, CirclePlus, PiggyBank } from 'lucide-vue-next'
import InputCurrency from '~/components/common/InputCurrency.vue'
import { useSnapshotStore } from '~/stores/snapshot'
import { useDerivedStore } from '~/stores/derived'
import { idr } from '~/lib/format/idr'
import { t } from '~/lib/copy/strings'

const snap = useSnapshotStore()
const derived = useDerivedStore()

// Saham dividend auto-flows into Penghasilan as a read-only ESTIMASI row. Monthly avg
// (annual / 12) keeps the /BULAN context consistent with the rest of the form; annual
// figure shown as a hint so the per-row "Rp X/tahun" numbers still reconcile.
const dividenMonthly = computed(() => derived.dividendMonthly)
const dividenAnnual = computed(() => derived.dividendAnnual)
const hasDividen = computed(() => dividenAnnual.value > 0)
</script>

<template>
  <section
    class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4 sm:p-6"
  >
    <header class="mb-3">
      <h3 class="text-base font-semibold uppercase tracking-wide text-[var(--color-text-primary)]">
        {{ t('snapshot.section.penghasilan') }} / Bulan
      </h3>
    </header>

    <div class="space-y-3">
      <!-- Row 1: Gaji Bersih -->
      <div class="flex items-start gap-3 rounded-[var(--radius-input)] bg-[var(--color-surface-low)] p-3">
        <Banknote
          :size="20"
          class="mt-1 shrink-0 text-[var(--color-text-secondary)]"
        />
        <div class="flex-1 space-y-1">
          <label
            :for="'penghasilan-gaji'"
            class="block text-xs font-medium text-[var(--color-text-secondary)]"
          >
            {{ t('snapshot.penghasilan.gajiLabel') }}
          </label>
          <InputCurrency
            :aria-label="t('snapshot.penghasilan.gajiLabel')"
            :model-value="snap.penghasilan === 0 ? null : snap.penghasilan"
            @update:model-value="snap.setPenghasilan($event ?? 0)"
          />
        </div>
      </div>

      <!-- Row 2: Penghasilan Lain -->
      <div class="flex items-start gap-3 rounded-[var(--radius-input)] bg-[var(--color-surface-low)] p-3">
        <CirclePlus
          :size="20"
          class="mt-1 shrink-0 text-[var(--color-text-secondary)]"
        />
        <div class="flex-1 space-y-1">
          <label
            class="block text-xs font-medium text-[var(--color-text-secondary)]"
          >
            {{ t('snapshot.penghasilan.lainLabel') }}
          </label>
          <InputCurrency
            :aria-label="t('snapshot.penghasilan.lainLabel')"
            :model-value="snap.penghasilanLain === 0 ? null : snap.penghasilanLain"
            @update:model-value="snap.setPenghasilanLain($event ?? 0)"
          />
        </div>
      </div>

      <!-- Row 3: Estimasi Dividen Saham (auto, read-only) — renders only when ≥1 saham
           row has dividen data, matching the Stitch "auto muncul" pattern. -->
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
          <p class="tabular mt-1 text-lg font-semibold text-[var(--color-text-primary)]">
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
    </div>
  </section>
</template>
