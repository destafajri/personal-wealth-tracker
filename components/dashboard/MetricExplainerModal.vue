<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { metricExplainers } from '~/lib/copy/metric-explainers'
import { useMetricExplainer } from '~/composables/useMetricExplainer'

const { active, isOpen, close } = useMetricExplainer()

const spec = computed(() =>
  active.value === null ? null : metricExplainers[active.value],
)

const ZONE_CLASS: Record<string, string> = {
  // Lower-better good / higher-better good — both render emerald
  Sehat: 'bg-[var(--color-accent-emerald-soft)] text-[var(--color-accent-emerald)]',
  Konservatif:
    'bg-[var(--color-accent-emerald-soft)] text-[var(--color-accent-emerald)]',
  Tight: 'bg-[var(--color-accent-emerald-soft)] text-[var(--color-accent-emerald)]',
  Aman: 'bg-[var(--color-accent-emerald-soft)] text-[var(--color-accent-emerald)]',
  // Middle zone — amber
  Waspada: 'bg-[var(--color-warning-amber-soft)] text-[var(--color-warning-amber)]',
  Seimbang: 'bg-[var(--color-warning-amber-soft)] text-[var(--color-warning-amber)]',
  Drift: 'bg-[var(--color-warning-amber-soft)] text-[var(--color-warning-amber)]',
  // High-risk side — rose
  Bahaya: 'bg-[var(--color-danger-rose-soft)] text-[var(--color-danger-rose)]',
  Agresif: 'bg-[var(--color-danger-rose-soft)] text-[var(--color-danger-rose)]',
  'Off-Plan': 'bg-[var(--color-danger-rose-soft)] text-[var(--color-danger-rose)]',
  'Risiko Likuidasi':
    'bg-[var(--color-danger-rose-soft)] text-[var(--color-danger-rose)]',
}

function zoneClass(label: string): string {
  return ZONE_CLASS[label] ?? 'bg-[var(--color-surface-low)] text-[var(--color-text-secondary)]'
}

function onEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) close()
}

onMounted(() => document.addEventListener('keydown', onEscape))
onBeforeUnmount(() => document.removeEventListener('keydown', onEscape))

// Lock body scroll while the modal is open so the page behind doesn't drift.
watch(isOpen, (open) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = open ? 'hidden' : ''
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
        @click.self="close"
      >
        <div
          class="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[var(--radius-card)] bg-[var(--color-surface-card)] p-6 shadow-[var(--shadow-modal)]"
        >
          <header class="mb-4 flex items-start justify-between gap-4">
            <h2 class="text-lg font-bold text-[var(--color-primary-dark)]">
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
