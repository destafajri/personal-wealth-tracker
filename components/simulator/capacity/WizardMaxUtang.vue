<script setup lang="ts">
// "Max Utang Aman" capacity wizard UI. Different shape from decision wizards: no delta
// table; instead a large hero number + 3 equivalent scenarios. Advanced KPR overrides
// (tenor/bunga) start collapsed per design-guidelines §8.18 — keep the default flow
// 1-input (target DSR) → result.
import { computed, ref } from 'vue'
import ButtonPrimary from '~/components/common/ButtonPrimary.vue'
import ButtonGhost from '~/components/common/ButtonGhost.vue'
import {
  runMaxUtang,
  type MaxUtangInput,
} from '~/lib/finance/wizards/max-utang'
import { idr } from '~/lib/format/idr'
import { t } from '~/lib/copy/strings'
import { useSnapshotStore } from '~/stores/snapshot'
import { useDerivedStore } from '~/stores/derived'
import { useSimulator } from '~/composables/useSimulator'
import type { CapacityResult } from '~/lib/types/wizard'

const snapStore = useSnapshotStore()
const derived = useDerivedStore()
const simulator = useSimulator()

const targetDsrPercent = ref<number>(30)
const showAdvanced = ref(false)
// Per-scenario override knobs. Defaults match max-utang.ts pure-fn defaults so
// untouched fields produce identical results to before the round-14 expansion.
const kprTenorTahun = ref<number>(20)
const kprBungaPercent = ref<number>(7)
const kpmTenorBulan = ref<number>(36)
const kpmBungaPercent = ref<number>(8)
const paylaterTenorBulan = ref<number>(12)
const paylaterBungaPercent = ref<number>(24)

// CapacityResult narrowing: simulator.currentResult is AnyWizardResult — narrow via
// 'heroValue' check (only CapacityResult has it).
const result = computed<CapacityResult | null>(() => {
  const r = simulator.currentResult.value
  if (r === null || !('heroValue' in r)) return null
  return r
})

const canSubmit = computed(
  () => targetDsrPercent.value > 0 && targetDsrPercent.value <= 100,
)

function snapshotView() {
  return {
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
  }
}

function submit() {
  if (!canSubmit.value) return
  const input: MaxUtangInput = {
    targetDsrPercent: targetDsrPercent.value,
    kprTenorTahun: showAdvanced.value ? kprTenorTahun.value : undefined,
    kprBungaPercent: showAdvanced.value ? kprBungaPercent.value : undefined,
    kpmTenorBulan: showAdvanced.value ? kpmTenorBulan.value : undefined,
    kpmBungaPercent: showAdvanced.value ? kpmBungaPercent.value : undefined,
    paylaterTenorBulan: showAdvanced.value ? paylaterTenorBulan.value : undefined,
    paylaterBungaPercent: showAdvanced.value ? paylaterBungaPercent.value : undefined,
  }
  const r = runMaxUtang(input, snapshotView(), {
    prices: derived.priceView ?? undefined,
  })
  simulator.setResult(r)
}

function reset() {
  simulator.setResult(null)
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h2 class="text-lg font-semibold text-[var(--color-text-primary)]">
        {{ t('wizard.maxUtang.title') }}
      </h2>
      <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
        {{ t('wizard.maxUtang.subtitle') }}
      </p>
    </header>

    <section class="grid gap-3 sm:grid-cols-2">
      <label class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">
          {{ t('wizard.maxUtang.form.targetDsr') }}
        </span>
        <input
          v-model.number="targetDsrPercent"
          type="number"
          min="1"
          max="100"
          step="1"
          class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm tabular text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
        >
        <p class="mt-1 text-[11px] text-[var(--color-text-muted)]">
          {{ t('wizard.maxUtang.form.targetDsrHelp') }}
        </p>
      </label>
    </section>

    <details
      class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-low)] p-3"
      :open="showAdvanced"
      @toggle="showAdvanced = ($event.target as HTMLDetailsElement).open"
    >
      <summary class="cursor-pointer text-xs font-medium text-[var(--color-text-secondary)]">
        {{ t('wizard.maxUtang.form.advancedToggle') }}
      </summary>

      <div class="mt-3 space-y-4">
        <!-- KPR section: tenor in tahun (longer horizon) -->
        <div>
          <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
            {{ t('wizard.maxUtang.form.kprSection') }}
          </h4>
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="block text-xs">
              <span class="font-medium text-[var(--color-text-secondary)]">
                {{ t('wizard.maxUtang.form.kprTenor') }}
              </span>
              <input
                v-model.number="kprTenorTahun"
                type="number"
                min="1"
                max="35"
                step="1"
                class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 text-sm tabular text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
              >
            </label>
            <label class="block text-xs">
              <span class="font-medium text-[var(--color-text-secondary)]">
                {{ t('wizard.maxUtang.form.kprBunga') }}
              </span>
              <input
                v-model.number="kprBungaPercent"
                type="number"
                min="0"
                max="30"
                step="0.1"
                class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 text-sm tabular text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
              >
            </label>
          </div>
        </div>

        <!-- KPM section: tenor in bulan (shorter, matches typical contract framing) -->
        <div>
          <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
            {{ t('wizard.maxUtang.form.kpmSection') }}
          </h4>
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="block text-xs">
              <span class="font-medium text-[var(--color-text-secondary)]">
                {{ t('wizard.maxUtang.form.tenorBulan') }}
              </span>
              <input
                v-model.number="kpmTenorBulan"
                type="number"
                min="1"
                max="120"
                step="1"
                class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 text-sm tabular text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
              >
            </label>
            <label class="block text-xs">
              <span class="font-medium text-[var(--color-text-secondary)]">
                {{ t('wizard.maxUtang.form.bunga') }}
              </span>
              <input
                v-model.number="kpmBungaPercent"
                type="number"
                min="0"
                max="40"
                step="0.1"
                class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 text-sm tabular text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
              >
            </label>
          </div>
        </div>

        <!-- Paylater section -->
        <div>
          <h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
            {{ t('wizard.maxUtang.form.paylaterSection') }}
          </h4>
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="block text-xs">
              <span class="font-medium text-[var(--color-text-secondary)]">
                {{ t('wizard.maxUtang.form.tenorBulan') }}
              </span>
              <input
                v-model.number="paylaterTenorBulan"
                type="number"
                min="1"
                max="60"
                step="1"
                class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 text-sm tabular text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
              >
            </label>
            <label class="block text-xs">
              <span class="font-medium text-[var(--color-text-secondary)]">
                {{ t('wizard.maxUtang.form.bunga') }}
              </span>
              <input
                v-model.number="paylaterBungaPercent"
                type="number"
                min="0"
                max="100"
                step="0.1"
                class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 text-sm tabular text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
              >
            </label>
          </div>
        </div>
      </div>
    </details>

    <div class="flex flex-wrap items-center gap-3">
      <ButtonPrimary :disabled="!canSubmit" @click="submit">
        {{ t('wizard.maxUtang.form.submit') }}
      </ButtonPrimary>
      <ButtonGhost v-if="result" @click="reset">{{ t('wizard.kpr.form.reset') }}</ButtonGhost>
    </div>

    <template v-if="result">
      <section
        v-for="(w, i) in result.warnings"
        :key="i"
        class="rounded-[var(--radius-input)] bg-[var(--color-warning-amber-soft)] px-3 py-2 text-sm text-[var(--color-warning-amber)]"
      >
        {{ w }}
      </section>

      <section
        class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-low)] p-5 text-center"
      >
        <p class="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
          {{ result.heroLabel }}
        </p>
        <p
          class="mt-2 text-3xl font-semibold tabular"
          :class="result.heroValue > 0 ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'"
        >
          {{ idr(result.heroValue) }}
        </p>
      </section>

      <section v-if="result.scenarios.length > 0">
        <h3 class="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
          {{ t('wizard.maxUtang.scenarios.title') }}
        </h3>
        <ul class="space-y-2">
          <li
            v-for="s in result.scenarios"
            :key="s.key"
            class="rounded-[var(--radius-input)] bg-[var(--color-surface-low)] px-3 py-2 text-sm"
          >
            <div class="font-medium text-[var(--color-text-primary)]">{{ s.label }}</div>
            <div class="mt-1 text-xs text-[var(--color-text-secondary)]">{{ s.description }}</div>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
