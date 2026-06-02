<script setup lang="ts">
// Day 9 — Modal Likuid Options panel (design-guidelines §8.20). Always-visible card
// on the dashboard right rail when Modal Siap > 0. Renders the auto-generated option
// list from derived.modalOptions; each [Hitung] opens the relevant wizard:
//   - lunasi/prepay/utangPribadi/gadai → WizardLunasi pre-filled
//   - beli-saham / tambah-RD / tambah-deposito → WizardDeployPreview (preview-only)
//
// Conflict auto-off (D9.10): if an option has `conflictsWith` matching a Modal Siap
// toggle currently ON, auto-off that toggle BEFORE opening the wizard. A transient
// notice surfaces briefly so the user understands why their toggle changed (Modal
// Siap headline recomputes reactively).
//
// NEVER ranked. Header: "Opsi yang Bisa Dihitungkan" (OJK §11.1).
import { ref } from 'vue'
import { Compass } from 'lucide-vue-next'
import { useDerivedStore } from '~/stores/derived'
import { useSimulator } from '~/composables/useSimulator'
import { idr } from '~/lib/format/idr'
import { t, type CopyKey } from '~/lib/copy/strings'
import type { ModalOption } from '~/lib/finance/wizards/modal-options'

const derived = useDerivedStore()
const simulator = useSimulator()

// Transient conflict notice — set when auto-off fires; auto-clears after 4s. UI renders
// as a soft amber strip at the top of the panel; not modal/blocking.
const conflictNotice = ref<string | null>(null)
let noticeTimer: ReturnType<typeof setTimeout> | null = null

function CATEGORY_LABEL_KEY(key: 'saham' | 'emas' | 'sbn'): CopyKey {
  if (key === 'saham') return 'modal.siap.includes.saham'
  if (key === 'emas') return 'modal.siap.includes.emas'
  return 'modal.siap.includes.sbn'
}

function hitung(opt: ModalOption) {
  // Auto-off the conflicting include toggle (if any) before opening the wizard. Modal
  // Siap recomputes reactively; the wizard's internal simulation reads the updated
  // headline via prefill so the Sebelum/Sesudah math stays consistent.
  if (opt.conflictsWith && derived.modalSiapIncludes[opt.conflictsWith]) {
    derived.setModalSiapInclude(opt.conflictsWith, false)
    conflictNotice.value = t('wizard.deployPreview.conflictNotice', {
      category: t(CATEGORY_LABEL_KEY(opt.conflictsWith)),
    })
    if (noticeTimer) clearTimeout(noticeTimer)
    noticeTimer = setTimeout(() => {
      conflictNotice.value = null
    }, 4000)
  }

  if (opt.handoff.kind !== 'wizard') return
  simulator.open(opt.handoff.wizardKey, {
    wizardKey: opt.handoff.wizardKey,
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

    <!-- Conflict auto-off notice (transient, 4s). aria-live=polite so screen readers
         announce the change without stealing focus. -->
    <div
      v-if="conflictNotice"
      role="status"
      aria-live="polite"
      class="mt-3 rounded-[var(--radius-card)] border border-[var(--color-warning-amber)] bg-[var(--color-warning-amber-soft)] p-2 text-xs text-[var(--color-warning-amber)]"
    >
      {{ conflictNotice }}
    </div>

    <ol class="mt-3 space-y-2.5">
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
