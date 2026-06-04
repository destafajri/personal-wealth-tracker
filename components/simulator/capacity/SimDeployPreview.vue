<script setup lang="ts">
// Day 9 — Deploy Preview simulator. Triggered from ModalOptionsPanel / SimModalOptions
// for asset-acquisition options (Tambah RD / Tambah Deposito / Beli Saham). Renders
// the simulation Sebelum/Sesudah + goal impact + warnings, with NO Apply button.
//
// Reads the prefilled action from useSimulator.consumePrefill('deploy-preview'); if no
// prefill is present (shouldn't happen via normal flow), displays an empty state and
// lets the user close.
//
// Source waterfall is fixed (kas → deposito → reksaDana, FX-aware) inside the pure fn
// runDeployPreview. We intentionally don't expose a per-row picker here — user feedback
// "popup tanpa gangu data snapshot" preferred this lean read-only path; precise
// placement happens in /app/snapshot, this simulator is just the simulation.
import { computed, onMounted, ref } from 'vue'
import ButtonGhost from '~/components/common/ButtonGhost.vue'
import SimDeltaTable from '~/components/simulator/SimDeltaTable.vue'
import {
  formatDeployActionSummary,
  runDeployPreview,
} from '~/lib/finance/sims/deploy-preview'
import { t } from '~/lib/copy/strings'
import { FI_MULTIPLIER, useGoalsStore } from '~/stores/goals'
import { useSnapshotStore } from '~/stores/snapshot'
import { useDerivedStore } from '~/stores/derived'
import { useSimulator } from '~/composables/useSimulator'
import type { DeployPrefill } from '~/lib/finance/sims/modal-options'
import type { GoalDelta, SimResult } from '~/lib/types/sim'

const snapStore = useSnapshotStore()
const goalsStore = useGoalsStore()
const derived = useDerivedStore()
const simulator = useSimulator()

const prefill = ref<DeployPrefill | null>(null)

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

onMounted(() => {
  const p = simulator.consumePrefill('deploy-preview')
  if (!p) return
  prefill.value = p.input
  // Auto-run preview on mount — simulator is preview-only so there's no "Hitung" step.
  // Pass through the toggle-include snapshot so the drain pipeline knows which
  // toggled-in classes are drainable (saham/emas/sbn).
  const r = runDeployPreview(
    { action: p.input.action, includes: p.input.includes },
    snapshotView(),
    goalsStore.goals,
    {
      prices: derived.priceView ?? undefined,
      fiMultiplier: FI_MULTIPLIER,
      assumedAnnualReturnReal: goalsStore.assumedAnnualReturnReal,
    },
  )
  simulator.setResult(r)
})

// Narrow useSimulator.currentResult (AnySimResult) to SimResult via 'delta' guard.
const result = computed<SimResult | null>(() => {
  const r = simulator.currentResult.value
  if (r === null || !('delta' in r)) return null
  return r
})

const summary = computed(() => {
  if (!prefill.value) return null
  return formatDeployActionSummary(
    prefill.value.action,
    snapshotView(),
    derived.priceView ?? undefined,
  )
})

function goalShiftLabel(g: GoalDelta): string {
  if (g.unreachable) return t('sim.goalImpact.unreachable', { label: g.goalLabel })
  if (Math.abs(g.monthsShift) < 0.5) {
    return t('sim.goalImpact.shift.none', { label: g.goalLabel })
  }
  const months = Math.abs(g.monthsShift).toFixed(1)
  return g.monthsShift > 0
    ? t('sim.goalImpact.shift.late', { label: g.goalLabel, months })
    : t('sim.goalImpact.shift.early', { label: g.goalLabel, months })
}
</script>

<template>
  <div>
    <header>
      <h3 class="text-base font-semibold text-[var(--color-text-primary)]">
        {{ t('sim.deployPreview.title') }}
      </h3>
      <p class="mt-1 text-xs text-[var(--color-text-secondary)]">
        {{ t('sim.deployPreview.subtitle') }}
      </p>
    </header>

    <section
      v-if="summary"
      class="mt-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-low)] p-4"
    >
      <h4 class="text-sm font-semibold text-[var(--color-text-primary)]">
        {{ t('sim.deployPreview.summary.title') }}
      </h4>
      <p class="tabular mt-2 text-sm text-[var(--color-text-primary)]">
        {{ summary.headline }}
      </p>
      <p class="mt-1 text-xs text-[var(--color-text-secondary)]">
        {{ t('sim.deployPreview.summary.source') }}
      </p>
    </section>

    <template v-if="result">
      <section class="mt-4">
        <h4 class="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
          {{ t('sim.delta.title') }}
        </h4>
        <SimDeltaTable :delta="result.delta" />
      </section>

      <section
        v-if="result.goalImpact.length > 0"
        class="mt-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-low)] p-4"
      >
        <h4 class="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
          {{ t('sim.goalImpact.title') }}
        </h4>
        <ul class="space-y-1 text-sm text-[var(--color-text-secondary)]">
          <li v-for="g in result.goalImpact" :key="g.goalId">
            {{ goalShiftLabel(g) }}
          </li>
        </ul>
      </section>

      <section
        v-if="result.warnings.length > 0"
        class="mt-4 rounded-[var(--radius-card)] border border-[var(--color-warning-amber)] bg-[var(--color-warning-amber-soft)] p-3"
      >
        <ul class="space-y-1 text-xs text-[var(--color-warning-amber)]">
          <li v-for="(w, i) in result.warnings" :key="i">⚠ {{ w }}</li>
        </ul>
      </section>
    </template>

    <p class="mt-4 text-[11px] italic text-[var(--color-text-muted)]">
      {{ t('sim.deployPreview.note') }}
    </p>

    <div class="mt-4 flex justify-end">
      <ButtonGhost @click="simulator.close()">
        {{ t('sim.host.close') }}
      </ButtonGhost>
    </div>
  </div>
</template>
