<script setup lang="ts">
import { computed } from 'vue'
import { Info } from 'lucide-vue-next'
import { useDerivedStore } from '~/stores/derived'
import { useSnapshotStore } from '~/stores/snapshot'
import { useMetricExplainer } from '~/composables/useMetricExplainer'
import { idr } from '~/lib/format/idr'
import {
  sumEmasIdr,
  sumSbnIdr,
  sumStockIdr,
  type ModalSiapIncludes,
} from '~/lib/finance/metrics'
import { t, type CopyKey } from '~/lib/copy/strings'

const derived = useDerivedStore()
const snapStore = useSnapshotStore()
const explainer = useMetricExplainer()

// Per-toggle visibility — hide chip when the category has Rp 0 (no rows / no value).
// Avoids surfacing toggles user can't meaningfully act on. Reads via the public sum
// helpers in lib/finance/metrics.ts to stay aligned with calcModalSiap's math.
const snapshotView = computed(() => ({
  penghasilan: snapStore.penghasilan,
  penghasilanLain: snapStore.penghasilanLain,
  pengeluaran: snapStore.pengeluaran,
  asetLikuid: snapStore.asetLikuid,
  asetNonLikuid: snapStore.asetNonLikuid,
  emas: snapStore.emas,
  saham: snapStore.saham,
  crypto: snapStore.crypto,
  cicilanAktif: snapStore.cicilanAktif,
  utangPribadi: snapStore.utangPribadi,
  gadai: snapStore.gadai,
}))

const sahamValue = computed(() =>
  sumStockIdr(snapshotView.value.saham, derived.priceView ?? undefined),
)
const emasValue = computed(() =>
  sumEmasIdr(snapshotView.value, derived.priceView ?? undefined),
)
const sbnValue = computed(() =>
  sumSbnIdr(snapshotView.value, derived.priceView ?? undefined),
)

interface ToggleChip {
  key: keyof ModalSiapIncludes
  labelKey: CopyKey
  hasValue: boolean
}

const chips = computed<ToggleChip[]>(() => [
  { key: 'saham', labelKey: 'modal.siap.includes.saham', hasValue: sahamValue.value > 0 },
  { key: 'emas', labelKey: 'modal.siap.includes.emas', hasValue: emasValue.value > 0 },
  { key: 'sbn', labelKey: 'modal.siap.includes.sbn', hasValue: sbnValue.value > 0 },
])

const anyChipVisible = computed(() => chips.value.some((c) => c.hasValue))
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-2">
    <article
      class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4"
    >
      <header class="flex items-center gap-1.5">
        <h3 class="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
          {{ t('metric.netWorth.label') }}
        </h3>
        <button
          type="button"
          :aria-label="t('metric.explainer.aria.netWorth')"
          class="inline-flex h-4 w-4 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
          @click="explainer.open('netWorth')"
        >
          <Info :size="13" />
        </button>
      </header>
      <p
        class="tabular mt-2 text-2xl font-bold"
        :class="derived.netWorth < 0
          ? 'text-[var(--color-danger-rose)]'
          : 'text-[var(--color-primary-dark)]'"
      >
        {{ idr(derived.netWorth) }}
      </p>
      <!--
        D11.2 — Screen 12 Status framing. Only renders when NW is actually
        negative; uses "Status" (descriptive), never "Saran" (advisory) per
        OJK posture. Numbers are absolute IDR so the sentence reads cleanly
        regardless of locale formatting.
      -->
      <p
        v-if="derived.netWorth < 0"
        class="mt-2 rounded-md bg-[var(--color-surface-low)] p-2 text-xs leading-relaxed text-[var(--color-text-secondary)]"
      >
        {{
          t('metric.netWorth.statusNegative', {
            liabilities: idr(derived.totalUtang),
            assets: idr(derived.totalAset),
          })
        }}
      </p>
    </article>
    <article
      class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4"
    >
      <header class="flex items-center gap-1.5">
        <h3 class="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
          {{ t('metric.modalSiap.label') }}
        </h3>
        <button
          type="button"
          :aria-label="t('metric.explainer.aria.modalSiap')"
          class="inline-flex h-4 w-4 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
          @click="explainer.open('modalSiap')"
        >
          <Info :size="13" />
        </button>
      </header>
      <p class="tabular mt-2 text-2xl font-bold text-[var(--color-capacity-teal)]">
        {{ idr(derived.modalSiap) }}
      </p>
      <p class="mt-1 text-[11px] italic text-[var(--color-text-muted)]">
        {{ t('metric.modalSiap.advisory') }}
      </p>

      <!--
        Day 9 — Modal Siap include toggles. Chips for saham / emas / sbn render only
        when the underlying category has value (no point toggling Rp 0). Click flips
        the include state; reactively updates derived.modalSiap headline above.
        Disclaimer below the chip row explains the realisasi-cair gap (spread / bea
        jual not deducted from displayed value). Auto-off on conflict happens at the
        Modal Options [Hitung] step, not here.
      -->
      <div v-if="anyChipVisible" class="mt-3 flex flex-wrap items-center gap-1.5">
        <span class="text-[11px] font-medium text-[var(--color-text-muted)]">
          {{ t('modal.siap.includes.label') }}
        </span>
        <button
          v-for="chip in chips.filter((c) => c.hasValue)"
          :key="chip.key"
          type="button"
          :aria-pressed="derived.modalSiapIncludes[chip.key]"
          :aria-label="t('modal.siap.includes.aria.toggle', { category: t(chip.labelKey) })"
          class="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border px-2 py-0.5 text-[11px] font-medium transition"
          :class="
            derived.modalSiapIncludes[chip.key]
              ? 'border-[var(--color-primary)] bg-[var(--color-primary-container)] text-[var(--color-primary-dark)]'
              : 'border-[var(--color-border)] bg-[var(--color-surface-low)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-secondary)]'
          "
          @click="derived.toggleModalSiapInclude(chip.key)"
        >
          <span aria-hidden="true">{{ derived.modalSiapIncludes[chip.key] ? '✓' : '+' }}</span>
          {{ t(chip.labelKey) }}
        </button>
      </div>
      <p
        v-if="anyChipVisible"
        class="mt-1.5 text-[10px] italic text-[var(--color-text-muted)]"
      >
        {{ t('modal.siap.includes.disclaimer') }}
      </p>
    </article>
  </div>
</template>
