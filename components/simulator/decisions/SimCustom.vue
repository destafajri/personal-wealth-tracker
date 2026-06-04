<script setup lang="ts">
// Custom simulator UI — minimal scope (locked): 1 required cicilan + 1 optional asset.
import { computed, ref } from 'vue'
import ButtonPrimary from '~/components/common/ButtonPrimary.vue'
import ButtonGhost from '~/components/common/ButtonGhost.vue'
import InputCurrency from '~/components/common/InputCurrency.vue'
import SimDeltaTable from '~/components/simulator/SimDeltaTable.vue'
import {
  runCustom,
  type AnyAssetCategory,
  type CustomInput,
} from '~/lib/finance/sims/custom'
import { t, type CopyKey } from '~/lib/copy/strings'
import { FI_MULTIPLIER, useGoalsStore } from '~/stores/goals'
import { useSnapshotStore } from '~/stores/snapshot'
import { useDerivedStore } from '~/stores/derived'
import { useSimulator } from '~/composables/useSimulator'
import { CURRENCIES, type CicilanTipe, type Currency, type JenisBunga } from '~/lib/types/snapshot'
import type { GoalDelta, SimResult } from '~/lib/types/sim'

const snapStore = useSnapshotStore()
const goalsStore = useGoalsStore()
const derived = useDerivedStore()
const simulator = useSimulator()

const CICILAN_TIPE_OPTIONS: ReadonlyArray<CicilanTipe> = [
  'KPR',
  'KPM',
  'BANK_KTA',
  'PINJOL',
  'PAYLATER',
  'KK',
  'LAIN',
]

const JENIS_OPTIONS: ReadonlyArray<JenisBunga> = [
  'Anuitas',
  'Flat',
  'Floating',
  'Revolving',
]

const ASET_OPTIONS: ReadonlyArray<AnyAssetCategory | ''> = [
  '',
  'kas',
  'deposito',
  'reksaDana',
  'sbn',
  'properti',
  'kendaraan',
  'pensiun',
]

// Cicilan (required)
const cicilanLabel = ref('')
const cicilanTipe = ref<CicilanTipe>('LAIN')
const cicilanSisaPokok = ref<number | null>(null)
const cicilanPerBulan = ref<number | null>(null)
const cicilanJenisBunga = ref<JenisBunga>('Flat')
const cicilanSukuBunga = ref<number | null>(null)
const cicilanTenorBulan = ref<number | null>(null)

// Aset (optional)
const asetLabel = ref('')
const asetKategori = ref<AnyAssetCategory | ''>('')
const asetAmount = ref<number | null>(null)
const asetCurrency = ref<Currency>('IDR')

const result = computed<SimResult | null>(() => {
  const r = simulator.currentResult.value
  if (r === null || !('delta' in r)) return null
  return r
})

const isLiquidCat = computed(() =>
  ['kas', 'deposito', 'reksaDana', 'sbn'].includes(asetKategori.value as string),
)

const canSubmit = computed(
  () =>
    cicilanSisaPokok.value !== null &&
    cicilanSisaPokok.value > 0 &&
    cicilanPerBulan.value !== null &&
    cicilanPerBulan.value >= 0,
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
  if (
    !canSubmit.value ||
    cicilanSisaPokok.value === null ||
    cicilanPerBulan.value === null
  )
    return
  const input: CustomInput = {
    cicilanLabel: cicilanLabel.value,
    cicilanTipe: cicilanTipe.value,
    cicilanSisaPokok: cicilanSisaPokok.value,
    cicilanPerBulan: cicilanPerBulan.value,
    cicilanJenisBunga: cicilanJenisBunga.value,
    cicilanSukuBunga: cicilanSukuBunga.value ?? undefined,
    cicilanTenorBulan: cicilanTenorBulan.value ?? undefined,
    asetLabel: asetLabel.value || undefined,
    asetKategori: asetKategori.value === '' ? undefined : asetKategori.value,
    asetAmount: asetAmount.value ?? undefined,
    asetCurrency: isLiquidCat.value ? asetCurrency.value : undefined,
  }
  const r = runCustom(input, snapshotView(), goalsStore.goals, {
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
        {{ t('sim.custom.title') }}
      </h2>
      <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
        {{ t('sim.custom.subtitle') }}
      </p>
    </header>

    <!-- Cicilan section -->
    <section class="space-y-3">
      <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
        {{ t('sim.custom.cicilan.title') }}
      </h3>
      <div class="grid gap-3 sm:grid-cols-2">
        <label class="block text-xs sm:col-span-2">
          <span class="font-medium text-[var(--color-text-secondary)]">{{ t('sim.custom.cicilan.label') }}</span>
          <input
            v-model="cicilanLabel"
            type="text"
            class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
          >
        </label>

        <label class="block text-xs">
          <span class="font-medium text-[var(--color-text-secondary)]">{{ t('sim.custom.cicilan.tipe') }}</span>
          <select
            v-model="cicilanTipe"
            class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
          >
            <option v-for="o in CICILAN_TIPE_OPTIONS" :key="o" :value="o">{{ o }}</option>
          </select>
        </label>

        <label class="block text-xs">
          <span class="font-medium text-[var(--color-text-secondary)]">{{ t('sim.custom.cicilan.jenisBunga') }}</span>
          <select
            v-model="cicilanJenisBunga"
            class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
          >
            <option v-for="j in JENIS_OPTIONS" :key="j" :value="j">{{ j }}</option>
          </select>
        </label>

        <label class="block text-xs">
          <span class="font-medium text-[var(--color-text-secondary)]">{{ t('sim.custom.cicilan.sisaPokok') }}</span>
          <div class="mt-1">
            <InputCurrency v-model="cicilanSisaPokok" />
          </div>
        </label>

        <label class="block text-xs">
          <span class="font-medium text-[var(--color-text-secondary)]">{{ t('sim.custom.cicilan.cicilanPerBulan') }}</span>
          <div class="mt-1">
            <InputCurrency v-model="cicilanPerBulan" />
          </div>
        </label>

        <label class="block text-xs">
          <span class="font-medium text-[var(--color-text-secondary)]">{{ t('sim.custom.cicilan.sukuBunga') }}</span>
          <input
            v-model.number="cicilanSukuBunga"
            type="number"
            min="0"
            step="0.1"
            class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm tabular text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
          >
        </label>

        <label class="block text-xs">
          <span class="font-medium text-[var(--color-text-secondary)]">{{ t('sim.custom.cicilan.tenor') }}</span>
          <input
            v-model.number="cicilanTenorBulan"
            type="number"
            min="0"
            step="1"
            class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm tabular text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
          >
        </label>
      </div>
    </section>

    <!-- Aset section (optional) -->
    <section class="space-y-3">
      <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
        {{ t('sim.custom.aset.title') }}
      </h3>
      <p class="text-[11px] text-[var(--color-text-muted)]">{{ t('sim.custom.aset.skipHint') }}</p>
      <div class="grid gap-3 sm:grid-cols-2">
        <label class="block text-xs">
          <span class="font-medium text-[var(--color-text-secondary)]">{{ t('sim.custom.aset.kategori') }}</span>
          <select
            v-model="asetKategori"
            class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
          >
            <option v-for="o in ASET_OPTIONS" :key="o || 'none'" :value="o">
              {{ o || t('sim.custom.aset.none') }}
            </option>
          </select>
        </label>

        <label v-if="asetKategori !== ''" class="block text-xs">
          <span class="font-medium text-[var(--color-text-secondary)]">{{ t('sim.custom.aset.label') }}</span>
          <input
            v-model="asetLabel"
            type="text"
            class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
          >
        </label>

        <label v-if="asetKategori !== ''" class="block text-xs">
          <span class="font-medium text-[var(--color-text-secondary)]">{{ t('sim.custom.aset.amount') }}</span>
          <div class="mt-1">
            <InputCurrency v-model="asetAmount" />
          </div>
        </label>

        <label v-if="asetKategori !== '' && isLiquidCat" class="block text-xs">
          <span class="font-medium text-[var(--color-text-secondary)]">{{ t('sim.custom.aset.currency') }}</span>
          <select
            v-model="asetCurrency"
            class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
          >
            <option v-for="c in CURRENCIES" :key="c" :value="c">{{ c }}</option>
          </select>
        </label>
      </div>
    </section>

    <div class="flex flex-wrap items-center gap-3">
      <ButtonPrimary :disabled="!canSubmit" @click="submit">
        {{ t('sim.custom.form.submit') }}
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
