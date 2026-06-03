<script setup lang="ts">
// "Lunasi Utang Sekarang" capacity simulator UI. Single debt picker + payment input +
// (Anuitas/Flat only) mode toggle. Debt list aggregates Cicilan Aktif + Utang Pribadi
// + Gadai sorted by jatuh_tempo asc / insertion order (NEVER by rate — OJK §11.1).
import { computed, onMounted, ref, watch } from 'vue'
import ButtonPrimary from '~/components/common/ButtonPrimary.vue'
import ButtonGhost from '~/components/common/ButtonGhost.vue'
import InputCurrency from '~/components/common/InputCurrency.vue'
import SimDeltaTable from '~/components/simulator/SimDeltaTable.vue'
import {
  runLunasiUtang,
  type LunasiAnuitasMode,
  type LunasiInput,
  type LunasiSource,
} from '~/lib/finance/sims/lunasi-utang'
import { idr } from '~/lib/format/idr'
import { t, type CopyKey } from '~/lib/copy/strings'
import { FI_MULTIPLIER, useGoalsStore } from '~/stores/goals'
import { useSnapshotStore } from '~/stores/snapshot'
import { useDerivedStore } from '~/stores/derived'
import { useSimulator } from '~/composables/useSimulator'
import type { GoalDelta, SimResult } from '~/lib/types/sim'
import type { JenisBunga } from '~/lib/types/snapshot'

const snapStore = useSnapshotStore()
const goalsStore = useGoalsStore()
const derived = useDerivedStore()
const simulator = useSimulator()

interface DebtListItem {
  key: string
  source: LunasiSource
  id: string
  label: string
  sisaPokok: number
  jenisBunga: JenisBunga | undefined
  jatuhTempo: string
}

// Sort: jatuh_tempo asc; missing tempo dates sink to bottom in insertion order.
// LOCKED OJK §11.1: NEVER sort by rate (implies ranking advice).
const allDebts = computed<DebtListItem[]>(() => {
  const out: DebtListItem[] = []
  for (const c of snapStore.cicilanAktif) {
    out.push({
      key: `cicilan:${c.id}`,
      source: 'cicilan',
      id: c.id,
      label: c.label || c.tipe,
      sisaPokok: c.sisaPokok,
      jenisBunga: c.jenisBunga,
      jatuhTempo: c.tanggalJatuhTempo ?? '',
    })
  }
  for (const u of snapStore.utangPribadi) {
    out.push({
      key: `utang:${u.id}`,
      source: 'utangPribadi',
      id: u.id,
      label: u.label || 'Utang pribadi',
      sisaPokok: u.sisaPokok,
      jenisBunga: undefined,
      jatuhTempo: u.tanggalJatuhTempo ?? '',
    })
  }
  for (const g of snapStore.gadai) {
    out.push({
      key: `gadai:${g.id}`,
      source: 'gadai',
      id: g.id,
      label: g.label || 'Gadai',
      sisaPokok: g.piutangIdr,
      jenisBunga: undefined,
      jatuhTempo: g.tanggalJatuhTempo ?? '',
    })
  }
  return out.sort((a, b) => {
    if (a.jatuhTempo === '' && b.jatuhTempo === '') return 0
    if (a.jatuhTempo === '') return 1
    if (b.jatuhTempo === '') return -1
    return a.jatuhTempo.localeCompare(b.jatuhTempo)
  })
})

const selectedKey = ref<string>('')
const paymentIdr = ref<number | null>(null)
const modeAnuitas = ref<LunasiAnuitasMode>('cicilan')

const selected = computed<DebtListItem | null>(() => {
  if (selectedKey.value === '') return null
  return allDebts.value.find((d) => d.key === selectedKey.value) ?? null
})

// Auto-default payment to sisa pokok when user picks a debt.
watch(selected, (next) => {
  if (next) paymentIdr.value = next.sisaPokok
})

// Day 9 — Modal Options handoff prefills source/id/payment/mode so user lands on the
// scenario directly. Read-and-clear so subsequent re-opens with no prefill don't
// re-apply stale state.
onMounted(() => {
  const p = simulator.consumePrefill('lunasi')
  if (!p) return
  const target = allDebts.value.find(
    (d) => d.source === p.input.source && d.id === p.input.id,
  )
  if (!target) return
  selectedKey.value = target.key
  paymentIdr.value = p.input.paymentIdr
  if (p.input.modeAnuitas) modeAnuitas.value = p.input.modeAnuitas
})

const isAnuitasOrFlat = computed(
  () =>
    selected.value !== null &&
    selected.value.source === 'cicilan' &&
    (selected.value.jenisBunga === 'Anuitas' || selected.value.jenisBunga === 'Flat'),
)

// Payment ceiling: sisaPokok of selected debt. Codex round-13 pattern carries here —
// we don't let user pay more than the debt; that's a meaningless "scenario".
const paymentOverSisa = computed(() => {
  if (selected.value === null || paymentIdr.value === null) return false
  return paymentIdr.value > selected.value.sisaPokok + 1e-6
})

const canSubmit = computed(() => {
  if (selected.value === null) return false
  if (paymentIdr.value === null || paymentIdr.value <= 0) return false
  if (paymentOverSisa.value) return false
  return true
})

// SimResult narrowing: simulator stores AnySimResult. Narrow via 'delta' check
// (CapacityResult doesn't have delta).
const result = computed<(SimResult & { applyResult?: ReturnType<typeof runLunasiUtang>['applyResult'] }) | null>(() => {
  const r = simulator.currentResult.value
  if (r === null || !('delta' in r)) return null
  return r as SimResult & { applyResult?: ReturnType<typeof runLunasiUtang>['applyResult'] }
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
  if (!canSubmit.value || selected.value === null || paymentIdr.value === null) return
  const input: LunasiInput = {
    source: selected.value.source,
    id: selected.value.id,
    paymentIdr: paymentIdr.value,
    modeAnuitas: isAnuitasOrFlat.value ? modeAnuitas.value : undefined,
  }
  const r = runLunasiUtang(input, snapshotView(), goalsStore.goals, {
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

function debtListLabel(d: DebtListItem): string {
  const labelKey: CopyKey =
    d.source === 'cicilan'
      ? 'sim.lunasi.debt.cicilanLabel'
      : d.source === 'utangPribadi'
      ? 'sim.lunasi.debt.utangLabel'
      : 'sim.lunasi.debt.gadaiLabel'
  if (d.source === 'cicilan') {
    return t(labelKey, { label: d.label, tipe: d.jenisBunga ?? '', amount: idr(d.sisaPokok) })
  }
  return t(labelKey, { label: d.label, amount: idr(d.sisaPokok) })
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
        {{ t('sim.lunasi.title') }}
      </h2>
      <p class="mt-1 text-sm text-[var(--color-text-secondary)]">
        {{ t('sim.lunasi.subtitle') }}
      </p>
    </header>

    <section v-if="allDebts.length === 0" class="rounded-[var(--radius-input)] bg-[var(--color-surface-low)] px-3 py-3 text-sm text-[var(--color-text-muted)]">
      {{ t('sim.lunasi.form.debtEmpty') }}
    </section>

    <section v-else class="space-y-3">
      <label class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">
          {{ t('sim.lunasi.form.debt') }}
        </span>
        <select
          v-model="selectedKey"
          class="mt-1 h-10 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-low)] px-3 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)]"
        >
          <option value="" disabled>—</option>
          <option v-for="d in allDebts" :key="d.key" :value="d.key">
            {{ debtListLabel(d) }}
          </option>
        </select>
      </label>

      <label v-if="selected" class="block text-xs">
        <span class="font-medium text-[var(--color-text-secondary)]">
          {{ t('sim.lunasi.form.payment') }}
        </span>
        <div class="mt-1">
          <InputCurrency v-model="paymentIdr" />
        </div>
        <p
          class="mt-1 text-[11px]"
          :class="paymentOverSisa ? 'text-[var(--color-danger-rose)]' : 'text-[var(--color-text-muted)]'"
        >
          {{
            paymentOverSisa
              ? `Maksimum: ${idr(selected.sisaPokok)} (sisa pokok)`
              : t('sim.lunasi.form.paymentHelp')
          }}
        </p>
      </label>

      <fieldset v-if="isAnuitasOrFlat" class="space-y-2">
        <legend class="text-xs font-medium text-[var(--color-text-secondary)]">
          {{ t('sim.lunasi.form.modeTitle') }}
        </legend>
        <label class="flex items-center gap-2 text-sm">
          <input
            v-model="modeAnuitas"
            type="radio"
            name="lunasi-mode"
            value="tenor"
            class="accent-[var(--color-primary)]"
          >
          {{ t('sim.lunasi.form.modeTenor') }}
        </label>
        <label class="flex items-center gap-2 text-sm">
          <input
            v-model="modeAnuitas"
            type="radio"
            name="lunasi-mode"
            value="cicilan"
            class="accent-[var(--color-primary)]"
          >
          {{ t('sim.lunasi.form.modeCicilan') }}
        </label>
      </fieldset>
    </section>

    <div v-if="allDebts.length > 0" class="flex flex-wrap items-center gap-3">
      <ButtonPrimary :disabled="!canSubmit" @click="submit">
        {{ t('sim.lunasi.form.submit') }}
      </ButtonPrimary>
      <ButtonGhost v-if="result" @click="reset">{{ t('sim.kpr.form.reset') }}</ButtonGhost>
    </div>

    <template v-if="result">
      <section class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-low)] p-4">
        <h3 class="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
          {{ t('sim.lunasi.summary.title') }}
        </h3>
        <ul class="grid gap-1 text-sm text-[var(--color-text-secondary)] sm:grid-cols-2">
          <li v-if="result.applyResult">
            {{ t('sim.lunasi.summary.paid', { amount: idr(result.applyResult.actualPayment) }) }}
          </li>
          <li v-if="result.applyResult?.lunasCompleted">
            {{ t('sim.lunasi.summary.lunas') }}
          </li>
          <li v-else-if="result.applyResult?.postSisaPokok !== undefined">
            {{ t('sim.lunasi.summary.postSisa', { amount: idr(result.applyResult.postSisaPokok) }) }}
          </li>
          <li v-if="result.applyResult?.postCicilanPerBulan !== undefined && !result.applyResult.lunasCompleted">
            {{ t('sim.lunasi.summary.postCicilan', { amount: idr(result.applyResult.postCicilanPerBulan) }) }}
          </li>
          <li v-if="result.applyResult?.postTenorBulan !== undefined && !result.applyResult.lunasCompleted">
            {{ t('sim.lunasi.summary.postTenor', { months: result.applyResult.postTenorBulan }) }}
          </li>
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
