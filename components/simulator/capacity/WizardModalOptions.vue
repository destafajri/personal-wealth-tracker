<script setup lang="ts">
// Day 9 — Modal Likuid Options as a wizard surface (capacity launcher entry). Renders
// the same option list as the dashboard ModalOptionsPanel, just inside the WizardHost
// modal chrome. Second entry point for users on /app/simulator who reach Modal Options
// via the launcher card rather than the dashboard right rail.
//
// Post-iteration: apply-direct path was dropped (user feedback "popup tanpa gangu data
// snapshot"). [Hitung] now opens the relevant preview-only wizard — Lunasi for debt,
// DeployPreview for asset acquisition — by replacing the active wizard in WizardHost.
// Conflict auto-off (D9.10) mirrors the dashboard panel: include-toggle that matches
// the option's conflictsWith key flips OFF before the inner wizard opens.
import { ref } from 'vue'
import { Compass } from 'lucide-vue-next'
import { useDerivedStore } from '~/stores/derived'
import { useSimulator } from '~/composables/useSimulator'
import { idr } from '~/lib/format/idr'
import { t, type CopyKey } from '~/lib/copy/strings'
import type { ModalOption } from '~/lib/finance/wizards/modal-options'

const derived = useDerivedStore()
const simulator = useSimulator()

const conflictNotice = ref<string | null>(null)
let noticeTimer: ReturnType<typeof setTimeout> | null = null

function CATEGORY_LABEL_KEY(key: 'saham' | 'emas' | 'sbn'): CopyKey {
  if (key === 'saham') return 'modal.siap.includes.saham'
  if (key === 'emas') return 'modal.siap.includes.emas'
  return 'modal.siap.includes.sbn'
}

function hitung(opt: ModalOption) {
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
  // Swap to the target wizard inside the same modal chrome. useSimulator.open will
  // reset currentResult + accept a new prefill payload, so this is a clean handoff.
  simulator.open(opt.handoff.wizardKey, {
    wizardKey: opt.handoff.wizardKey,
    input: opt.handoff.prefill,
  } as Parameters<typeof simulator.open>[1])
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

    <div
      v-if="conflictNotice"
      role="status"
      aria-live="polite"
      class="mt-3 rounded-[var(--radius-card)] border border-[var(--color-warning-amber)] bg-[var(--color-warning-amber-soft)] p-2 text-xs text-[var(--color-warning-amber)]"
    >
      {{ conflictNotice }}
    </div>

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
