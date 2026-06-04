<script setup lang="ts">
// "Max Utang Aman" capacity simulator UI. Different shape from decision simulators: no delta
// table; instead a large hero number + 3 equivalent scenarios. Advanced KPR overrides
// (tenor/bunga) start collapsed per design-guidelines §8.18 — keep the default flow
// 1-input (target DSR) → result.
import { computed, ref } from 'vue'
import ButtonPrimary from '~/components/common/ButtonPrimary.vue'
import ButtonGhost from '~/components/common/ButtonGhost.vue'
import {
  MAX_UTANG_TIPES,
  runMaxUtang,
  type MaxUtangInput,
  type MaxUtangTipe,
} from '~/lib/finance/sims/max-utang'
import { idr } from '~/lib/format/idr'
import { t, type CopyKey } from '~/lib/copy/strings'
import { useSnapshotStore } from '~/stores/snapshot'
import { useDerivedStore } from '~/stores/derived'
import { useSimulator } from '~/composables/useSimulator'
import type { CapacityResult } from '~/lib/types/sim'

const snapStore = useSnapshotStore()
const derived = useDerivedStore()
const simulator = useSimulator()

const targetDsrPercent = ref<number>(30)
// Multi-pick. Defaults to KPR-only so single-decision user gets the most common path.
const tipes = ref<MaxUtangTipe[]>(['kpr'])
const showAdvanced = ref(false)

function toggleTipe(t: MaxUtangTipe) {
  tipes.value = tipes.value.includes(t)
    ? tipes.value.filter((x) => x !== t)
    : [...tipes.value, t]
}
// Per-tipe override knobs. Defaults match max-utang.ts pure-fn defaults so untouched
// fields produce identical results to default (showAdvanced=false → all undefined →
// pure-fn falls back to its own defaults).
const kprTenorTahun = ref<number>(20)
const kprBungaPercent = ref<number>(7)
const kpmTenorBulan = ref<number>(36)
const kpmBungaPercent = ref<number>(8)
const paylaterTenorBulan = ref<number>(12)
const paylaterBungaPercent = ref<number>(24)

const TIPE_LABEL: Record<MaxUtangTipe, CopyKey> = {
  kpr: 'sim.maxUtang.form.tipeKpr',
  kpm: 'sim.maxUtang.form.tipeKpm',
  paylater: 'sim.maxUtang.form.tipePaylater',
}

// CapacityResult narrowing: simulator.currentResult is AnySimResult — narrow via
// 'heroValue' check (only CapacityResult has it).
const result = computed<CapacityResult | null>(() => {
  const r = simulator.currentResult.value
  if (r === null || !('heroValue' in r)) return null
  return r
})

const canSubmit = computed(
  () =>
    targetDsrPercent.value > 0 &&
    targetDsrPercent.value <= 100 &&
    tipes.value.length > 0,
)

function snapshotView() {
  return {
    penghasilan: snapStore.penghasilan,
    penghasilanLain: snapStore.penghasilanLain,
    pengeluaran: snapStore.pengeluaran,
  pengeluaranLain: snapStore.pengeluaranLain,
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
  // Only pass override fields for picked tipes (pure fn ignores non-matching ones, but
  // this keeps the input shape clean for debugging).
  const input: MaxUtangInput = {
    targetDsrPercent: targetDsrPercent.value,
    tipes: [...tipes.value],
    ...(showAdvanced.value && tipes.value.includes('kpr')
      ? {
          kprTenorTahun: kprTenorTahun.value,
          kprBungaPercent: kprBungaPercent.value,
        }
      : {}),
    ...(showAdvanced.value && tipes.value.includes('kpm')
      ? {
          kpmTenorBulan: kpmTenorBulan.value,
          kpmBungaPercent: kpmBungaPercent.value,
        }
      : {}),
    ...(showAdvanced.value && tipes.value.includes('paylater')
      ? {
          paylaterTenorBulan: paylaterTenorBulan.value,
          paylaterBungaPercent: paylaterBungaPercent.value,
        }
      : {}),
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
        {{ t('sim.maxUtang.title') }}
      </h2>
      <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
        {{ t('sim.maxUtang.subtitle') }}
      </p>
    </header>

    <section class="space-y-3">
      <!-- Tipe utang checkboxes: pick 1+ — simulator renders 1 scenario per pick. -->
      <fieldset class="space-y-2">
        <legend class="text-xs font-medium text-[var(--color-text-secondary)]">
          {{ t('sim.maxUtang.form.tipe') }}
        </legend>
        <div class="grid gap-2 sm:grid-cols-3">
          <label
            v-for="opt in MAX_UTANG_TIPES"
            :key="opt"
            class="flex cursor-pointer items-center gap-2 rounded-[var(--radius-input)] border px-3 py-2 text-sm"
            :class="
              tipes.includes(opt)
                ? 'border-[var(--color-primary)] bg-[var(--color-surface-low)] text-[var(--color-text-primary)]'
                : 'border-[var(--color-border)] bg-[var(--color-surface-card)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-secondary)]'
            "
          >
            <input
              type="checkbox"
              :checked="tipes.includes(opt)"
              class="accent-[var(--color-primary)]"
              @change="toggleTipe(opt)"
            >
            {{ t(TIPE_LABEL[opt]) }}
          </label>
        </div>
        <p
          v-if="tipes.length === 0"
          class="text-[11px] text-[var(--color-danger-rose)]"
        >
          {{ t('sim.maxUtang.form.tipeEmpty') }}
        </p>
      </fieldset>

      <label class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">
          {{ t('sim.maxUtang.form.targetDsr') }}
        </span>
        <input
          v-model.number="targetDsrPercent"
          type="number"
          min="1"
          max="100"
          step="1"
          class="mt-1 h-10 w-full max-w-xs rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm tabular text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
        >
        <p class="mt-1 text-[11px] text-[var(--color-text-muted)]">
          {{ t('sim.maxUtang.form.targetDsrHelp') }}
        </p>
      </label>
    </section>

    <details
      class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-low)] p-3"
      :open="showAdvanced"
      @toggle="showAdvanced = ($event.target as HTMLDetailsElement).open"
    >
      <summary class="cursor-pointer text-xs font-medium text-[var(--color-text-secondary)]">
        {{ t('sim.maxUtang.form.advancedToggle') }}
      </summary>

      <!-- Override sections: render 1 grid per picked tipe. -->
      <div v-if="tipes.includes('kpr')" class="mt-3">
        <h4 class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
          {{ t('sim.maxUtang.form.tipeKpr') }}
        </h4>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="block text-xs">
            <span class="font-medium text-[var(--color-text-secondary)]">
              {{ t('sim.maxUtang.form.kprTenor') }}
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
              {{ t('sim.maxUtang.form.kprBunga') }}
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

      <div v-if="tipes.includes('kpm')" class="mt-4">
        <h4 class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
          {{ t('sim.maxUtang.form.tipeKpm') }}
        </h4>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="block text-xs">
            <span class="font-medium text-[var(--color-text-secondary)]">
              {{ t('sim.maxUtang.form.tenorBulan') }}
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
              {{ t('sim.maxUtang.form.bunga') }}
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

      <div v-if="tipes.includes('paylater')" class="mt-4">
        <h4 class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
          {{ t('sim.maxUtang.form.tipePaylater') }}
        </h4>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="block text-xs">
            <span class="font-medium text-[var(--color-text-secondary)]">
              {{ t('sim.maxUtang.form.tenorBulan') }}
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
              {{ t('sim.maxUtang.form.bunga') }}
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
    </details>

    <div class="flex flex-wrap items-center gap-3">
      <ButtonPrimary :disabled="!canSubmit" @click="submit">
        {{ t('sim.maxUtang.form.submit') }}
      </ButtonPrimary>
      <ButtonGhost v-if="result" @click="reset">{{ t('sim.kpr.form.reset') }}</ButtonGhost>
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
          {{ t('sim.maxUtang.scenarios.title') }}
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
