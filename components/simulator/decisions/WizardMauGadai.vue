<script setup lang="ts">
// "Mau Gadai?" wizard UI. Conditional form: gram input for emas:* jaminans, asetRefId
// dropdown for properti / kendaraan (sourced from existing snapshot rows so user can
// pick which collateral they'd pawn).
import { computed, ref, watch } from 'vue'
import ButtonPrimary from '~/components/common/ButtonPrimary.vue'
import ButtonGhost from '~/components/common/ButtonGhost.vue'
import InputCurrency from '~/components/common/InputCurrency.vue'
import WizardDeltaTable from '~/components/simulator/WizardDeltaTable.vue'
import {
  computeGadai,
  runMauGadai,
  type GadaiInput,
} from '~/lib/finance/wizards/mau-gadai'
import { availableGramOf, emasCategoryOfJaminan } from '~/lib/finance/emas'
import { idr } from '~/lib/format/idr'
import { t, type CopyKey } from '~/lib/copy/strings'
import { FI_MULTIPLIER, useGoalsStore } from '~/stores/goals'
import { useSnapshotStore } from '~/stores/snapshot'
import { useDerivedStore } from '~/stores/derived'
import { useSimulator } from '~/composables/useSimulator'
import type { GadaiJaminanKind } from '~/lib/types/snapshot'
import type { GoalDelta, WizardResult } from '~/lib/types/wizard'

const snapStore = useSnapshotStore()
const goalsStore = useGoalsStore()
const derived = useDerivedStore()
const simulator = useSimulator()

const JAMINAN_OPTIONS: ReadonlyArray<GadaiJaminanKind> = [
  'emas:digital',
  'emas:fisikAntam',
  'emas:perhiasan18K',
  'emas:perhiasan14K',
  'emas:perhiasan10K',
  'properti',
  'kendaraan',
]

const JAMINAN_LABEL: Record<GadaiJaminanKind, CopyKey> = {
  'emas:digital': 'wizard.gadai.jaminan.emasDigital',
  'emas:fisikAntam': 'wizard.gadai.jaminan.emasFisikAntam',
  'emas:perhiasan18K': 'wizard.gadai.jaminan.emasPerhiasan18K',
  'emas:perhiasan14K': 'wizard.gadai.jaminan.emasPerhiasan14K',
  'emas:perhiasan10K': 'wizard.gadai.jaminan.emasPerhiasan10K',
  properti: 'wizard.gadai.jaminan.properti',
  kendaraan: 'wizard.gadai.jaminan.kendaraan',
}

const label = ref('')
const jaminan = ref<GadaiJaminanKind>('emas:fisikAntam')
const gramTertahan = ref<number>(0)
const asetRefId = ref<string>('')
const piutangIdr = ref<number | null>(null)
const bungaPerBulanPercent = ref<number>(1.5)
const tempoBulan = ref<number>(4)

const isEmas = computed(() => jaminan.value.startsWith('emas:'))
const result = computed<WizardResult | null>(() => {
  const r = simulator.currentResult.value
  if (r === null || !('delta' in r)) return null
  return r
})

// Codex round-13: gram ownership ceiling. Block submit when user requests more than
// what's actually at-home in this category. Recomputes reactively against snapshot
// (kategori switch + existing gadai rows both flow through).
const availableGrams = computed(() => {
  if (!isEmas.value) return Infinity
  const cat = emasCategoryOfJaminan(jaminan.value)
  if (cat === null) return Infinity
  return availableGramOf(snapshotView(), cat)
})

const gramOverOwned = computed(
  () => isEmas.value && gramTertahan.value > availableGrams.value + 1e-6,
)

// Aset rows available for asetRefId picker, based on jaminan kind.
const refRows = computed(() => {
  if (jaminan.value === 'properti') return snapStore.asetNonLikuid.properti
  if (jaminan.value === 'kendaraan') return snapStore.asetNonLikuid.kendaraan
  return []
})

// Reset asetRefId when switching to a non-matching jaminan kind.
watch(jaminan, () => {
  asetRefId.value = ''
})

const canSubmit = computed(() => {
  if (piutangIdr.value === null || piutangIdr.value <= 0) return false
  if (bungaPerBulanPercent.value < 0) return false
  if (tempoBulan.value <= 0) return false
  if (isEmas.value && gramTertahan.value <= 0) return false
  if (isEmas.value && gramOverOwned.value) return false
  if (!isEmas.value && asetRefId.value === '') return false
  return true
})

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
  if (!canSubmit.value || piutangIdr.value === null) return
  const input: GadaiInput = {
    label: label.value,
    jaminan: jaminan.value,
    gramTertahan: isEmas.value ? gramTertahan.value : undefined,
    asetRefId: !isEmas.value ? asetRefId.value : undefined,
    piutangIdr: piutangIdr.value,
    bungaPerBulanPercent: bungaPerBulanPercent.value,
    tempoBulan: tempoBulan.value,
  }
  const r = runMauGadai(input, snapshotView(), goalsStore.goals, {
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
  const lastGadai = r.scenarioSnapshot.gadai[r.scenarioSnapshot.gadai.length - 1]
  if (!lastGadai) return null
  const c = computeGadai({
    label: lastGadai.label,
    jaminan: lastGadai.jaminan,
    gramTertahan: lastGadai.gramTertahan,
    piutangIdr: lastGadai.piutangIdr,
    bungaPerBulanPercent: lastGadai.bungaPerBulanPercent,
    tempoBulan: lastGadai.tempoBulan,
  })
  return {
    piutang: lastGadai.piutangIdr,
    totalBunga: c.totalBungaSepanjangTempo,
  }
})

function goalImpactMessage(g: GoalDelta): string {
  if (g.unreachable) return t('wizard.goalImpact.unreachable', { label: g.goalLabel })
  if (Math.abs(g.monthsShift) < 0.5)
    return t('wizard.goalImpact.shift.none', { label: g.goalLabel })
  const abs = Math.abs(Math.round(g.monthsShift))
  return g.monthsShift > 0
    ? t('wizard.goalImpact.shift.late', { label: g.goalLabel, months: abs })
    : t('wizard.goalImpact.shift.early', { label: g.goalLabel, months: abs })
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
        {{ t('wizard.gadai.title') }}
      </h2>
      <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
        {{ t('wizard.gadai.subtitle') }}
      </p>
    </header>

    <section class="grid gap-3 sm:grid-cols-2">
      <label class="block text-xs sm:col-span-2">
        <span class="font-medium text-[var(--color-text-secondary)]">{{ t('wizard.gadai.form.label') }}</span>
        <input
          v-model="label"
          type="text"
          :placeholder="t('wizard.gadai.form.labelPlaceholder')"
          class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
        >
      </label>

      <label class="block text-xs sm:col-span-2">
        <span class="font-medium text-[var(--color-text-secondary)]">{{ t('wizard.gadai.form.jaminan') }}</span>
        <select
          v-model="jaminan"
          class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
        >
          <option v-for="j in JAMINAN_OPTIONS" :key="j" :value="j">{{ t(JAMINAN_LABEL[j]) }}</option>
        </select>
      </label>

      <!-- Conditional: emas → gram input. properti/kendaraan → asetRef picker. -->
      <label v-if="isEmas" class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">{{ t('wizard.gadai.form.gram') }}</span>
        <input
          v-model.number="gramTertahan"
          type="number"
          min="0"
          step="0.1"
          class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm tabular text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
        >
        <p
          class="mt-1 text-[11px]"
          :class="gramOverOwned ? 'text-[var(--color-danger-rose)]' : 'text-[var(--color-text-muted)]'"
        >
          {{
            gramOverOwned
              ? t('wizard.gadai.warning.gramExceedsOwned', {
                requested: gramTertahan.toString(),
                available: availableGrams.toFixed(2),
              })
              : t('wizard.gadai.form.gramAvailable', { available: availableGrams.toFixed(2) })
          }}
        </p>
      </label>
      <label v-else class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">{{ t('wizard.gadai.form.asetRef') }}</span>
        <select
          v-model="asetRefId"
          class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
        >
          <option value="" disabled>{{ t('wizard.gadai.form.asetRefEmpty') }}</option>
          <option v-for="row in refRows" :key="row.id" :value="row.id">
            {{ row.label || '(tanpa nama)' }} — {{ idr(row.amount) }}
          </option>
        </select>
      </label>

      <label class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">{{ t('wizard.gadai.form.piutang') }}</span>
        <div class="mt-1">
          <InputCurrency v-model="piutangIdr" />
        </div>
      </label>

      <label class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">{{ t('wizard.gadai.form.bunga') }}</span>
        <input
          v-model.number="bungaPerBulanPercent"
          type="number"
          min="0"
          max="20"
          step="0.1"
          class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm tabular text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
        >
      </label>

      <label class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">{{ t('wizard.gadai.form.tempo') }}</span>
        <input
          v-model.number="tempoBulan"
          type="number"
          min="1"
          max="48"
          step="1"
          class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm tabular text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
        >
      </label>
    </section>

    <div class="flex flex-wrap items-center gap-3">
      <ButtonPrimary :disabled="!canSubmit" @click="submit">
        {{ t('wizard.gadai.form.submit') }}
      </ButtonPrimary>
      <ButtonGhost v-if="result" @click="reset">{{ t('wizard.kpr.form.reset') }}</ButtonGhost>
    </div>

    <template v-if="result && summary">
      <section class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-low)] p-4">
        <h3 class="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
          {{ t('wizard.gadai.summary.title') }}
        </h3>
        <ul class="grid gap-1 text-sm text-[var(--color-text-secondary)] sm:grid-cols-2">
          <li>{{ t('wizard.gadai.summary.piutang', { amount: idr(summary.piutang) }) }}</li>
          <li>{{ t('wizard.gadai.summary.totalBunga', { amount: idr(summary.totalBunga) }) }}</li>
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
          {{ t('wizard.delta.title') }}
        </h3>
        <WizardDeltaTable :delta="result.delta" />
      </section>

      <section>
        <h3 class="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
          {{ t('wizard.goalImpact.title') }}
        </h3>
        <p v-if="result.goalImpact.length === 0" class="text-sm text-[var(--color-text-muted)]">
          {{ t('wizard.goalImpact.empty') }}
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
