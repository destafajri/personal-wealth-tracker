<script setup lang="ts">
// Global modal host for all 6 simulators — mounted once in layouts/app.vue. Reads
// useSimulator.activeKey to decide which simulator component to render. Owns:
//   - DisclaimerBanner (1 of 3 OJK layers — required pre-simulator)
//   - Escape / backdrop-click / focus-restore (same pattern as MetricExplainerModal)
//   - Body-scroll lock when open
//
// Why a single global host (vs per-simulator modal): keeps disclaimer + a11y wiring in
// one place; per Day 6 → Day 8, each new simulator plugs in via the keyed v-if below.
import type { Component } from 'vue'
import { computed, defineAsyncComponent, defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import DisclaimerBanner from '~/components/common/DisclaimerBanner.vue'
import { useSimulator } from '~/composables/useSimulator'
import { t, type CopyKey } from '~/lib/copy/strings'

// D11.6 — defer the 8 simulator bundles out of the app shell. Each chunk only
// fetches when its v-if becomes true (i.e. the user actually opens that sim).
// Shared loading state keeps the modal from popping in empty during the
// first-click chunk fetch on slow connections.
const SimLoading = defineComponent({
  name: 'SimLoading',
  setup() {
    return () =>
      h(
        'p',
        { class: 'py-8 text-center text-sm text-[var(--color-text-muted)]' },
        t('sim.host.loading'),
      )
  },
})
const asyncSim = (loader: () => Promise<{ default: Component }>) =>
  defineAsyncComponent({ loader, loadingComponent: SimLoading })

const SimMauKpr = asyncSim(() => import('~/components/simulator/decisions/SimMauKpr.vue'))
const SimMauGadai = asyncSim(() => import('~/components/simulator/decisions/SimMauGadai.vue'))
const SimMauCicil = asyncSim(() => import('~/components/simulator/decisions/SimMauCicil.vue'))
const SimCustom = asyncSim(() => import('~/components/simulator/decisions/SimCustom.vue'))
const SimMaxUtang = asyncSim(() => import('~/components/simulator/capacity/SimMaxUtang.vue'))
const SimLunasiUtang = asyncSim(() => import('~/components/simulator/capacity/SimLunasiUtang.vue'))
const SimModalOptions = asyncSim(() => import('~/components/simulator/capacity/SimModalOptions.vue'))
const SimDeployPreview = asyncSim(() => import('~/components/simulator/capacity/SimDeployPreview.vue'))

const { activeKey, isOpen, close } = useSimulator()
const panelRef = ref<HTMLElement | null>(null)

// Codex round-13: dialog accessible name must reflect the active simulator, not the
// hard-coded KPR title. Maps each SimKey to its localized title; unknown keys
// fall through to the generic Simulator label.
const titleKey = computed<CopyKey>(() => {
  switch (activeKey.value) {
    case 'kpr':
      return 'sim.kpr.title'
    case 'gadai':
      return 'sim.gadai.title'
    case 'cicil':
      return 'sim.cicil.title'
    case 'custom':
      return 'sim.custom.title'
    case 'max-utang':
      return 'sim.maxUtang.title'
    case 'lunasi':
      return 'sim.lunasi.title'
    case 'modal-options':
      return 'modal.options.title'
    case 'deploy-preview':
      return 'sim.deployPreview.title'
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
        aria-labelledby="sim-host-title"
        tabindex="-1"
        class="w-full max-w-2xl rounded-[var(--radius-card)] bg-[var(--color-surface-card)] shadow-[var(--shadow-modal)] outline-none"
      >
        <header
          class="flex items-start justify-between gap-3 border-b border-[var(--color-border)] px-5 py-4"
        >
          <h2 id="sim-host-title" class="sr-only">{{ t(titleKey) }}</h2>
          <DisclaimerBanner />
          <button
            type="button"
            :aria-label="t('sim.host.close')"
            class="shrink-0 rounded p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-low)] hover:text-[var(--color-text-primary)]"
            @click="close"
          >
            <X :size="18" />
          </button>
        </header>

        <div class="px-5 py-5">
          <SimMauKpr v-if="activeKey === 'kpr'" />
          <SimMauGadai v-else-if="activeKey === 'gadai'" />
          <SimMauCicil v-else-if="activeKey === 'cicil'" />
          <SimCustom v-else-if="activeKey === 'custom'" />
          <SimMaxUtang v-else-if="activeKey === 'max-utang'" />
          <SimLunasiUtang v-else-if="activeKey === 'lunasi'" />
          <SimModalOptions v-else-if="activeKey === 'modal-options'" />
          <SimDeployPreview v-else-if="activeKey === 'deploy-preview'" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
