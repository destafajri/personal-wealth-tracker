import { computed, ref } from 'vue'
import type { ExplainerKey } from '~/lib/copy/metric-explainers'

// Module-scoped state — single modal at a time. Mounted once in layouts/app.vue via
// MetricExplainerModal; every metric card / hero / panel triggers open(key) from this
// composable. Closing on backdrop click + Escape lives in the modal component.
//
// `previouslyFocused` captures the trigger (Info button) at open time so close() can
// restore keyboard focus back to it — required for a11y dialog pattern.

const active = ref<ExplainerKey | null>(null)
const previouslyFocused = ref<HTMLElement | null>(null)

export function useMetricExplainer() {
  const isOpen = computed(() => active.value !== null)

  function open(key: ExplainerKey) {
    if (typeof document !== 'undefined') {
      const el = document.activeElement
      previouslyFocused.value = el instanceof HTMLElement ? el : null
    }
    active.value = key
  }

  function close() {
    active.value = null
    const target = previouslyFocused.value
    previouslyFocused.value = null
    if (target && typeof document !== 'undefined') target.focus()
  }

  return { active, isOpen, open, close }
}
