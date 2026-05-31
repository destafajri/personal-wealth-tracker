<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { metricExplainers, type ZoneLabel } from '~/lib/copy/metric-explainers'
import { useMetricExplainer } from '~/composables/useMetricExplainer'

const { active, isOpen, close } = useMetricExplainer()
const panelRef = ref<HTMLElement | null>(null)

const spec = computed(() =>
  active.value === null ? null : metricExplainers[active.value],
)

// Keyed on ZoneLabel union so adding a new label in metric-explainers forces a matching
// entry here at compile time.
const ZONE_CLASS: Record<ZoneLabel, string> = {
  Sehat: 'bg-[var(--color-accent-emerald-soft)] text-[var(--color-accent-emerald)]',
  Konservatif:
    'bg-[var(--color-accent-emerald-soft)] text-[var(--color-accent-emerald)]',
  Tight: 'bg-[var(--color-accent-emerald-soft)] text-[var(--color-accent-emerald)]',
  Aman: 'bg-[var(--color-accent-emerald-soft)] text-[var(--color-accent-emerald)]',
  Waspada: 'bg-[var(--color-warning-amber-soft)] text-[var(--color-warning-amber)]',
  Seimbang: 'bg-[var(--color-warning-amber-soft)] text-[var(--color-warning-amber)]',
  Drift: 'bg-[var(--color-warning-amber-soft)] text-[var(--color-warning-amber)]',
  Bahaya: 'bg-[var(--color-danger-rose-soft)] text-[var(--color-danger-rose)]',
  Agresif: 'bg-[var(--color-danger-rose-soft)] text-[var(--color-danger-rose)]',
  'Off-Plan': 'bg-[var(--color-danger-rose-soft)] text-[var(--color-danger-rose)]',
  'Risiko Likuidasi':
    'bg-[var(--color-danger-rose-soft)] text-[var(--color-danger-rose)]',
}

function zoneClass(label: ZoneLabel): string {
  return ZONE_CLASS[label]
}

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
      // No focusable children — keep focus pinned to the panel itself.
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

// Snapshot prior body.overflow so we restore (not clobber) on close — handles the case
// where some other component already set it for its own reason.
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
  // immediate handles the edge case where the modal mounts while `active` is already
  // set (e.g., HMR), so body scroll + focus still wire up correctly.
  { immediate: true },
)

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  // Restore body scroll if the modal unmounts while still open (route nav / HMR).
  unlockBodyScroll()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen && spec"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="metric-explainer-title"
        @click.self="close"
      >
        <div
          ref="panelRef"
          tabindex="-1"
          class="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[var(--radius-card)] bg-[var(--color-surface-card)] p-6 shadow-[var(--shadow-modal)] focus:outline-none"
        >
          <header class="mb-4 flex items-start justify-between gap-4">
            <h2
              id="metric-explainer-title"
              class="text-lg font-bold text-[var(--color-primary-dark)]"
            >
              {{ spec.title }}
            </h2>
            <button
              type="button"
              aria-label="Tutup"
              class="rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-low)] hover:text-[var(--color-text-primary)]"
              @click="close"
            >
              <X :size="18" />
            </button>
          </header>

          <section class="space-y-4 text-sm">
            <div>
              <p class="text-[var(--color-text-primary)]">{{ spec.definition }}</p>
            </div>

            <div class="rounded-[var(--radius-input)] bg-[var(--color-surface-low)] p-3">
              <div
                class="text-[10px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]"
              >
                Formula
              </div>
              <p
                class="tabular mt-1 break-words font-mono text-[12px] text-[var(--color-text-primary)]"
              >
                {{ spec.formula }}
              </p>
            </div>

            <div v-if="spec.zones" class="space-y-2">
              <div
                class="text-[10px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]"
              >
                Arti zona
              </div>
              <ul class="space-y-2">
                <li
                  v-for="zone in spec.zones"
                  :key="zone.label"
                  class="rounded-[var(--radius-input)] border border-[var(--color-border)] p-3"
                >
                  <div class="mb-1 flex items-center gap-2">
                    <span
                      class="rounded-[var(--radius-pill)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                      :class="zoneClass(zone.label)"
                    >
                      {{ zone.label }}
                    </span>
                    <span
                      class="tabular text-xs font-medium text-[var(--color-text-secondary)]"
                    >
                      {{ zone.range }}
                    </span>
                  </div>
                  <p class="text-xs text-[var(--color-text-primary)]">{{ zone.body }}</p>
                </li>
              </ul>
            </div>

            <p
              v-if="spec.note"
              class="rounded-[var(--radius-input)] bg-[var(--color-warning-amber-soft)] p-3 text-xs italic text-[var(--color-warning-amber)]"
            >
              {{ spec.note }}
            </p>
          </section>

          <footer class="mt-6 flex justify-end">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-[var(--radius-input)] bg-[var(--color-primary)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
              @click="close"
            >
              Kembali
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 120ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
