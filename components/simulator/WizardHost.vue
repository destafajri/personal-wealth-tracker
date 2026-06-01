<script setup lang="ts">
// Global modal host for all 6 wizards — mounted once in layouts/app.vue. Reads
// useSimulator.activeKey to decide which wizard component to render. Owns:
//   - DisclaimerBanner (1 of 3 OJK layers — required pre-wizard)
//   - Escape / backdrop-click / focus-restore (same pattern as MetricExplainerModal)
//   - Body-scroll lock when open
//
// Why a single global host (vs per-wizard modal): keeps disclaimer + a11y wiring in
// one place; per Day 6 → Day 8, each new wizard plugs in via the keyed v-if below.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import DisclaimerBanner from '~/components/common/DisclaimerBanner.vue'
import WizardMauKpr from '~/components/simulator/decisions/WizardMauKpr.vue'
import WizardMauGadai from '~/components/simulator/decisions/WizardMauGadai.vue'
import WizardMauCicil from '~/components/simulator/decisions/WizardMauCicil.vue'
import WizardCustom from '~/components/simulator/decisions/WizardCustom.vue'
import WizardMaxUtang from '~/components/simulator/capacity/WizardMaxUtang.vue'
import WizardLunasiUtang from '~/components/simulator/capacity/WizardLunasiUtang.vue'
import { useSimulator } from '~/composables/useSimulator'
import { t, type CopyKey } from '~/lib/copy/strings'

const { activeKey, isOpen, close } = useSimulator()
const panelRef = ref<HTMLElement | null>(null)

// Codex round-13: dialog accessible name must reflect the active wizard, not the
// hard-coded KPR title. Maps each WizardKey to its localized title; unknown keys
// fall through to the generic Simulator label.
const titleKey = computed<CopyKey>(() => {
  switch (activeKey.value) {
    case 'kpr':
      return 'wizard.kpr.title'
    case 'gadai':
      return 'wizard.gadai.title'
    case 'cicil':
      return 'wizard.cicil.title'
    case 'custom':
      return 'wizard.custom.title'
    case 'max-utang':
      return 'wizard.maxUtang.title'
    case 'lunasi':
      return 'wizard.lunasi.title'
    case 'modal-options':
    case null:
    default:
      return 'simulator.title'
  }
})

function focusableIn(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  )
}

function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return
  if (e.key === 'Escape') {
    e.preventDefault()
    close()
    return
  }
  if (e.key === 'Tab' && panelRef.value) {
    const focusable = focusableIn(panelRef.value)
    if (focusable.length === 0) {
      e.preventDefault()
      panelRef.value.focus()
      return
    }
    const first = focusable[0]!
    const last = focusable[focusable.length - 1]!
    const activeEl = document.activeElement as HTMLElement | null
    if (e.shiftKey && (activeEl === first || activeEl === panelRef.value)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && activeEl === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

let prevBodyOverflow: string | null = null
function lockBodyScroll() {
  if (typeof document === 'undefined') return
  prevBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
}
function unlockBodyScroll() {
  if (typeof document === 'undefined') return
  if (prevBodyOverflow !== null) {
    document.body.style.overflow = prevBodyOverflow
    prevBodyOverflow = null
  }
}

watch(
  isOpen,
  async (open) => {
    if (open) {
      lockBodyScroll()
      await nextTick()
      panelRef.value?.focus()
    } else {
      unlockBodyScroll()
    }
  },
  { immediate: true },
)

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  unlockBodyScroll()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8"
      @click.self="close"
    >
      <div
        ref="panelRef"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wizard-host-title"
        tabindex="-1"
        class="w-full max-w-2xl rounded-[var(--radius-card)] bg-[var(--color-surface-card)] shadow-[var(--shadow-modal)] outline-none"
      >
        <header
          class="flex items-start justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4"
        >
          <h2 id="wizard-host-title" class="sr-only">{{ t(titleKey) }}</h2>
          <DisclaimerBanner />
          <button
            type="button"
            :aria-label="t('wizard.host.close')"
            class="shrink-0 rounded p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-low)] hover:text-[var(--color-text-primary)]"
            @click="close"
          >
            <X :size="18" />
          </button>
        </header>

        <div class="px-5 py-5">
          <WizardMauKpr v-if="activeKey === 'kpr'" />
          <WizardMauGadai v-else-if="activeKey === 'gadai'" />
          <WizardMauCicil v-else-if="activeKey === 'cicil'" />
          <WizardCustom v-else-if="activeKey === 'custom'" />
          <WizardMaxUtang v-else-if="activeKey === 'max-utang'" />
          <WizardLunasiUtang v-else-if="activeKey === 'lunasi'" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
