import { computed, ref } from 'vue'
import type { ExplainerKey } from '~/lib/copy/metric-explainers'

// Module-scoped state — single modal at a time. Mounted once in layouts/app.vue via
// MetricExplainerModal; every metric card / hero / panel triggers open(key) from this
// composable. Closing on backdrop click + Escape lives in the modal component.

const active = ref<ExplainerKey | null>(null)

export function useMetricExplainer() {
  const isOpen = computed(() => active.value !== null)

  function open(key: ExplainerKey) {
    active.value = key
  }

  function close() {
    active.value = null
  }

  return { active, isOpen, open, close }
}
