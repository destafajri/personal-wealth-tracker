<script setup lang="ts">
// Day 9 — Modal Likuid Options panel (design-guidelines §8.20). Always-visible card
// on the dashboard right rail when ≥1 option exists. Renders the auto-generated option
// list from derived.modalOptions; each [Hitung] opens the relevant preview simulator:
//   - lunasi/prepay/utangPribadi/gadai → SimLunasi pre-filled
//   - beli-saham / tambah-RD / Deposito / SBN / Emas → SimDeployPreview (preview-only)
//
// Per-option sizing capped by deployablePool (= Modal Siap − destination's own current
// value) so distribusi math stays zero-sum (Net Worth invariant). Conflict auto-off
// pattern from the earlier iteration was removed — toggle-include is now actually
// drainable in the preview, so there's no double-count to avoid.
//
// NEVER ranked. Header: "Opsi yang Bisa Dihitungkan" (OJK §11.1).
import { Compass } from 'lucide-vue-next'
import { useDerivedStore } from '~/stores/derived'
import { useSimulator } from '~/composables/useSimulator'
import { idr } from '~/lib/format/idr'
import { t } from '~/lib/copy/strings'
import type { ModalOption } from '~/lib/finance/sims/modal-options'

const derived = useDerivedStore()
const simulator = useSimulator()

function hitung(opt: ModalOption) {
  if (opt.handoff.kind !== 'sim') return
  simulator.open(opt.handoff.simKey, {
    simKey: opt.handoff.simKey,
    input: opt.handoff.prefill,
  } as Parameters<typeof simulator.open>[1])
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

    <ol class="mt-3 max-h-80 space-y-3 overflow-y-auto pr-1">
      <li
        v-for="(opt, i) in derived.modalOptions.options"
        :key="opt.id"
        class="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-low)] p-4"
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
          class="shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-3 py-1 text-xs font-medium text-white shadow-[var(--shadow-sm)] transition hover:bg-[var(--color-primary-container)]"
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
