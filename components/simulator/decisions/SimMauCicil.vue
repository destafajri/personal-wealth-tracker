<script setup lang="ts">
// "Mau Cicil?" simulator UI. Mirror SimMauKpr but with tipe dropdown (6 non-KPR options)
// and optional asetValue+asetKategori for opt-in non-likuid tracking. No DP exists when
// tipe is KK/Paylater — UI keeps DP field visible so user can set 0 explicitly.
import { computed, ref } from 'vue'
import ButtonPrimary from '~/components/common/ButtonPrimary.vue'
import ButtonGhost from '~/components/common/ButtonGhost.vue'
import InputCurrency from '~/components/common/InputCurrency.vue'
import SimDeltaTable from '~/components/simulator/SimDeltaTable.vue'
import {
  runMauCicil,
  type CicilInput,
  type CicilTipe,
} from '~/lib/finance/sims/mau-cicil'
import { idr } from '~/lib/format/idr'
import { t, type CopyKey } from '~/lib/copy/strings'
import { FI_MULTIPLIER, useGoalsStore } from '~/stores/goals'
import { useSnapshotStore } from '~/stores/snapshot'
import { useDerivedStore } from '~/stores/derived'
import { useSimulator } from '~/composables/useSimulator'
import type { JenisBunga } from '~/lib/types/snapshot'
import type { GoalDelta, SimResult } from '~/lib/types/sim'

const snapStore = useSnapshotStore()
const goalsStore = useGoalsStore()
const derived = useDerivedStore()
const simulator = useSimulator()

const TIPE_OPTIONS: ReadonlyArray<CicilTipe> = [
  'KPM',
  'BANK_KTA',
  'PINJOL',
  'PAYLATER',
  'KK',
  'LAIN',
]

const JENIS_OPTIONS: ReadonlyArray<Extract<JenisBunga, 'Anuitas' | 'Flat'>> = [
  'Anuitas',
  'Flat',
]

const ASET_KATEGORI_OPTIONS: ReadonlyArray<'kendaraan' | 'properti'> = [
  'kendaraan',
  'properti',
]

const label = ref('')
const tipe = ref<CicilTipe>('KPM')
const hargaBarang = ref<number | null>(null)
const dpPercent = ref<number>(20)
const tenorBulan = ref<number>(36)
const bungaPercent = ref<number>(8)
const jenisBunga = ref<Extract<JenisBunga, 'Anuitas' | 'Flat'>>('Anuitas')
const asetValue = ref<number | null>(null)
const asetKategori = ref<'kendaraan' | 'properti' | ''>('')

const result = computed<SimResult | null>(() => {
  const r = simulator.currentResult.value
  if (r === null || !('delta' in r)) return null
  return r
})

const canSubmit = computed(
  () =>
    hargaBarang.value !== null &&
    hargaBarang.value > 0 &&
    dpPercent.value >= 0 &&
    dpPercent.value <= 100 &&
    tenorBulan.value > 0 &&
    bungaPercent.value >= 0,
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
  if (!canSubmit.value || hargaBarang.value === null) return
  const input: CicilInput = {
    label: label.value,
    tipe: tipe.value,
    hargaBarang: hargaBarang.value,
    dpPercent: dpPercent.value,
    tenorBulan: tenorBulan.value,
    bungaPercent: bungaPercent.value,
    jenisBunga: jenisBunga.value,
    asetValue: asetValue.value ?? undefined,
    asetKategori: asetKategori.value === '' ? undefined : asetKategori.value,
  }
  const r = runMauCicil(input, snapshotView(), goalsStore.goals, {
    prices: derived.priceView ?? undefined,
    fiMultiplier: FI_MULTIPLIER,
    assumedAnnualReturnReal: goalsStore.assumedAnnualReturnReal,
    includes: derived.modalSiapIncludes,
  })
  simulator.setResult(r)
}

function reset() {
  simulator.setResult(null)
}

const summary = computed(() => {
  const r = result.value
  if (!r) return null
  const cic = r.scenarioSnapshot.cicilanAktif[r.scenarioSnapshot.cicilanAktif.length - 1]
  if (!cic) return null
  const totalBayar = cic.cicilanPerBulan * (cic.tenorSisaBulan ?? 0)
  const totalBunga = Math.max(0, totalBayar - cic.sisaPokok)
  return {
    dp: (hargaBarang.value ?? 0) - cic.sisaPokok,
    pokok: cic.sisaPokok,
    cicilan: cic.cicilanPerBulan,
    totalBunga,
  }
})

function goalImpactMessage(g: GoalDelta): string {
  if (g.unreachable) return t('sim.goalImpact.unreachable', { label: g.goalLabel })
  if (Math.abs(g.monthsShift) < 0.5)
    return t('sim.goalImpact.shift.none', { label: g.goalLabel })
  const abs = Math.abs(Math.round(g.monthsShift))
  return g.monthsShift > 0
    ? t('sim.goalImpact.shift.late', { label: g.goalLabel, months: abs })
    : t('sim.goalImpact.shift.early', { label: g.goalLabel, months: abs })
}

const STATUS_LABEL: Record<GoalDelta['beforeStatus'], CopyKey> = {
  on: 'goal.status.on',
  'at-risk': 'goal.status.atRisk',
  off: 'goal.status.off',
}
</script>

<template>
  <div class="space-y-6">
    <header>
      <h2 class="text-lg font-semibold text-[var(--color-text-primary)]">
        {{ t('sim.cicil.title') }}
      </h2>
      <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
        {{ t('sim.cicil.subtitle') }}
      </p>
    </header>

    <section class="grid gap-3 sm:grid-cols-2">
      <label class="block text-xs sm:col-span-2">
        <span class="font-medium text-[var(--color-text-secondary)]">{{ t('sim.cicil.form.label') }}</span>
        <input
          v-model="label"
          type="text"
          :placeholder="t('sim.cicil.form.labelPlaceholder')"
          class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
        >
      </label>

      <label class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">{{ t('sim.cicil.form.tipe') }}</span>
        <select
          v-model="tipe"
          class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
        >
          <option v-for="o in TIPE_OPTIONS" :key="o" :value="o">{{ o }}</option>
        </select>
      </label>

      <label class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">{{ t('sim.cicil.form.harga') }}</span>
        <div class="mt-1">
          <InputCurrency v-model="hargaBarang" />
        </div>
      </label>

      <label class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">{{ t('sim.cicil.form.dp') }}</span>
        <input
          v-model.number="dpPercent"
          type="number"
          min="0"
          max="100"
          step="1"
          class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm tabular text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
        >
      </label>

      <label class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">{{ t('sim.cicil.form.tenor') }}</span>
        <input
          v-model.number="tenorBulan"
          type="number"
          min="1"
          max="120"
          step="1"
          class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm tabular text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
        >
      </label>

      <label class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">{{ t('sim.cicil.form.bunga') }}</span>
        <input
          v-model.number="bungaPercent"
          type="number"
          min="0"
          max="60"
          step="0.1"
          class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm tabular text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
        >
      </label>

      <label class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">{{ t('sim.cicil.form.jenisBunga') }}</span>
        <select
          v-model="jenisBunga"
          class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
        >
          <option v-for="j in JENIS_OPTIONS" :key="j" :value="j">{{ j }}</option>
        </select>
      </label>

      <!-- Optional aset tracking -->
      <label class="block text-xs sm:col-span-2">
        <span class="font-medium text-[var(--color-text-secondary)]">{{ t('sim.cicil.form.asetKategori') }}</span>
        <select
          v-model="asetKategori"
          class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
        >
          <option value="">{{ t('sim.cicil.form.asetSkip') }}</option>
          <option v-for="k in ASET_KATEGORI_OPTIONS" :key="k" :value="k">{{ k }}</option>
        </select>
        <p class="mt-1 text-[11px] text-[var(--color-text-muted)]">{{ t('sim.cicil.form.asetHint') }}</p>
      </label>

      <label v-if="asetKategori !== ''" class="block text-xs sm:col-span-2">
        <span class="font-medium text-[var(--color-text-secondary)]">{{ t('sim.cicil.form.asetValue') }}</span>
        <div class="mt-1">
          <InputCurrency v-model="asetValue" />
        </div>
      </label>
    </section>

    <div class="flex flex-wrap items-center gap-3">
      <ButtonPrimary :disabled="!canSubmit" @click="submit">
        {{ t('sim.cicil.form.submit') }}
      </ButtonPrimary>
      <ButtonGhost v-if="result" @click="reset">{{ t('sim.kpr.form.reset') }}</ButtonGhost>
    </div>

    <template v-if="result && summary">
      <section class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-low)] p-4">
        <h3 class="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
          {{ t('sim.cicil.summary.title') }}
        </h3>
        <ul class="grid gap-1 text-sm text-[var(--color-text-secondary)] sm:grid-cols-2">
          <li>{{ t('sim.cicil.summary.dp', { amount: idr(summary.dp) }) }}</li>
          <li>{{ t('sim.cicil.summary.pokok', { amount: idr(summary.pokok) }) }}</li>
          <li>{{ t('sim.cicil.summary.cicilan', { amount: idr(summary.cicilan) }) }}</li>
          <li>{{ t('sim.cicil.summary.totalBunga', { amount: idr(summary.totalBunga) }) }}</li>
        </ul>
      </section>

      <section
        v-for="(w, i) in result.warnings"
        :key="i"
        class="rounded-[var(--radius-input)] bg-[var(--color-warning-amber-soft)] px-3 py-2 text-sm text-[var(--color-warning-amber)]"
      >
        {{ w }}
      </section>

      <section>
        <h3 class="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
          {{ t('sim.delta.title') }}
        </h3>
        <SimDeltaTable :delta="result.delta" />
      </section>

      <section>
        <h3 class="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
          {{ t('sim.goalImpact.title') }}
        </h3>
        <p v-if="result.goalImpact.length === 0" class="text-sm text-[var(--color-text-muted)]">
          {{ t('sim.goalImpact.empty') }}
        </p>
        <ul v-else class="space-y-2">
          <li
            v-for="g in result.goalImpact"
            :key="g.goalId"
            class="rounded-[var(--radius-input)] bg-[var(--color-surface-low)] px-3 py-2 text-sm"
          >
            <div class="font-medium text-[var(--color-text-primary)]">{{ goalImpactMessage(g) }}</div>
            <div class="mt-1 text-xs text-[var(--color-text-muted)]">
              {{ t(STATUS_LABEL[g.beforeStatus]) }} → {{ t(STATUS_LABEL[g.afterStatus]) }}
            </div>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
