<script setup lang="ts">
// Day 9 — Modal Likuid Options as a wizard surface (capacity launcher entry). Renders
// the same option list as the dashboard ModalOptionsPanel, just inside the WizardHost
// modal chrome. Provides a second entry point for users who reach Modal Options via
// /app/simulator instead of scrolling the dashboard right-rail.
//
// Lighter than the dashboard panel: no confirmation-flow inline UI. Confirmation lives
// in the dashboard panel; this wizard view is primarily a "see the options" reference
// that hands off to other wizards for the [Hitung] click. Apply-direct actions here
// silently close the wizard + apply (the WizardHost backdrop replaces the inline
// confirm card's modal framing).
import { Compass } from 'lucide-vue-next'
import { useDerivedStore } from '~/stores/derived'
import { useSnapshotStore } from '~/stores/snapshot'
import { useSimulator } from '~/composables/useSimulator'
import { idr } from '~/lib/format/idr'
import { t } from '~/lib/copy/strings'
import type {
  ApplyAction,
  ModalOption,
} from '~/lib/finance/wizards/modal-options'

const derived = useDerivedStore()
const snapStore = useSnapshotStore()
const simulator = useSimulator()

function hitung(opt: ModalOption) {
  if (opt.handoff.kind === 'wizard') {
    simulator.open(opt.handoff.wizardKey, {
      wizardKey: opt.handoff.wizardKey,
      input: opt.handoff.prefill,
    })
    return
  }
  // Apply-direct: confirm via JS native dialog (lightweight — wizard host already
  // owns the modal chrome). Avoids stacking a second modal layer.
  if (typeof window === 'undefined') return
  const ok = window.confirm(
    `${t('modal.options.confirm.title')}\n\n${opt.label}\n\n${t('modal.options.confirm.body')}`,
  )
  if (!ok) return
  applyAction(opt.handoff.apply)
  simulator.close()
}

function applyAction(action: ApplyAction) {
  if (action.kind === 'addLiquidRow') {
    snapStore.addLikuid(action.category, {
      label: action.label,
      amount: action.amountIdr,
      currency: 'IDR',
    })
    return
  }
  if (action.kind === 'addStockLots') {
    const target = snapStore.saham.find((s) => s.id === action.stockId)
    if (!target) return
    snapStore.updateSaham(action.stockId, { lot: target.lot + action.lotsToAdd })
  }
}
</script>

<template>
  <div>
    <header class="flex items-center gap-2">
      <Compass :size="18" class="text-[var(--color-primary)]" />
      <h3 class="text-base font-semibold text-[var(--color-text-primary)]">
        {{ t('modal.options.title') }}
      </h3>
    </header>
    <p class="mt-1 text-xs text-[var(--color-text-secondary)]">
      {{ t('modal.options.subtitle') }}
    </p>
    <p class="tabular mt-3 text-sm text-[var(--color-text-primary)]">
      {{ t('modal.options.modalSiapLabel', { amount: idr(derived.modalOptions.modalSiapIdr) }) }}
    </p>

    <p
      v-if="derived.modalOptions.options.length === 0"
      class="mt-3 text-xs italic text-[var(--color-text-muted)]"
    >
      {{ t('modal.options.empty') }}
    </p>

    <ol v-else class="mt-3 space-y-2.5">
      <li
        v-for="(opt, i) in derived.modalOptions.options"
        :key="opt.id"
        class="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-low)] p-3"
      >
        <span
          class="tabular shrink-0 text-xs font-semibold text-[var(--color-text-muted)]"
          aria-hidden="true"
        >{{ i + 1 }}.</span>
        <div class="min-w-0 flex-1">
          <div class="text-sm font-medium text-[var(--color-text-primary)]">
            {{ opt.label }}
          </div>
          <div class="mt-0.5 text-xs text-[var(--color-text-secondary)]">
            → {{ opt.impactPreview }}
          </div>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 py-1 text-xs font-medium text-[var(--color-primary)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-container)]"
          :aria-label="t('modal.options.hitungAria', { label: opt.label })"
          @click="hitung(opt)"
        >
          {{ t('modal.options.hitung') }}
        </button>
      </li>
    </ol>

    <p class="mt-4 text-[11px] italic text-[var(--color-text-muted)]">
      {{ derived.modalOptions.emergencyFundNote }}
    </p>
  </div>
</template>
