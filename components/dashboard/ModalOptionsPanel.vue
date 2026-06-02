<script setup lang="ts">
// Day 9 — Modal Likuid Options panel (design-guidelines §8.20). Always-visible card
// below the hero pair on the dashboard when Modal Siap > 0. Renders the auto-generated
// option list from derived.modalOptions; each option has a [Hitung] button that either:
//   - opens the relevant wizard with prefill (Lunasi for debt actions), or
//   - opens an in-panel confirmation card that mutates the snapshot directly (asset
//     acquisition: addLiquid row OR top-up saham lots).
//
// NEVER ranked. Header copy is "Opsi yang Bisa Dihitungkan" — see PRD §9 / OJK §11.1.
import { ref } from 'vue'
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

// Pending confirm payload — when set, the option list is replaced by an inline confirm
// card. Cleared on Confirm/Cancel. Storing the whole option (not just the apply payload)
// so the confirm body can echo the option label back to the user.
const pendingConfirm = ref<ModalOption | null>(null)

function hitung(opt: ModalOption) {
  if (opt.handoff.kind === 'wizard') {
    simulator.open(opt.handoff.wizardKey, {
      wizardKey: opt.handoff.wizardKey,
      input: opt.handoff.prefill,
    })
    return
  }
  // Apply-direct path: stage the action behind a confirmation card.
  pendingConfirm.value = opt
}

function confirmApply() {
  const opt = pendingConfirm.value
  if (!opt || opt.handoff.kind !== 'apply') {
    pendingConfirm.value = null
    return
  }
  applyAction(opt.handoff.apply)
  pendingConfirm.value = null
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
  <section
    v-if="derived.modalOptions.options.length > 0"
    class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4"
    aria-labelledby="modal-options-heading"
  >
    <header class="flex items-center gap-2">
      <Compass :size="16" class="text-[var(--color-primary)]" />
      <h3
        id="modal-options-heading"
        class="text-sm font-semibold text-[var(--color-text-primary)]"
      >
        {{ t('modal.options.title') }}
      </h3>
    </header>
    <p class="mt-1 text-xs text-[var(--color-text-secondary)]">
      {{ t('modal.options.subtitle') }}
    </p>
    <p class="tabular mt-2 text-xs text-[var(--color-text-muted)]">
      {{ t('modal.options.modalSiapLabel', { amount: idr(derived.modalOptions.modalSiapIdr) }) }}
    </p>

    <!-- Confirmation card replaces the option list when an apply-direct action is staged. -->
    <div
      v-if="pendingConfirm"
      role="alertdialog"
      aria-modal="false"
      aria-labelledby="modal-options-confirm-title"
      class="mt-3 rounded-[var(--radius-card)] border border-[var(--color-primary)] bg-[var(--color-surface-low)] p-3"
    >
      <h4
        id="modal-options-confirm-title"
        class="text-sm font-semibold text-[var(--color-text-primary)]"
      >
        {{ t('modal.options.confirm.title') }}
      </h4>
      <p class="mt-2 text-xs text-[var(--color-text-primary)]">
        <span class="font-medium">{{ pendingConfirm.label }}</span>
      </p>
      <p class="mt-1 text-xs text-[var(--color-text-secondary)]">
        {{ t('modal.options.confirm.body') }}
      </p>
      <div class="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          class="rounded-[var(--radius-pill)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-card)] hover:text-[var(--color-text-primary)]"
          @click="pendingConfirm = null"
        >
          {{ t('modal.options.confirm.cancel') }}
        </button>
        <button
          type="button"
          class="rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--color-primary-dark)]"
          @click="confirmApply"
        >
          {{ t('modal.options.confirm.confirm') }}
        </button>
      </div>
    </div>

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

    <p class="mt-3 text-[11px] italic text-[var(--color-text-muted)]">
      {{ derived.modalOptions.emergencyFundNote }}
    </p>
  </section>
</template>
