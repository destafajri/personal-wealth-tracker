// Simulator state composable — single wizard instance at a time, mounted globally via
// WizardHost in layouts/app.vue. Mirrors useMetricExplainer's module-scoped pattern:
// triggers (WizardLauncher cards / dashboard quick actions) call open(key); host reads
// state.value to switch between wizard components.
//
// `previouslyFocused` captures the trigger at open time so close() restores keyboard
// focus to it — required for the a11y dialog pattern.

import { computed, ref } from 'vue'
import type { AnyWizardResult, WizardKey } from '~/lib/types/wizard'

const activeKey = ref<WizardKey | null>(null)
// AnyWizardResult = WizardResult (decision wizards) | CapacityResult (Day 8 Max Utang,
// Modal Options). Components narrow by activeKey or via `'heroValue' in result`.
const currentResult = ref<AnyWizardResult | null>(null)
const previouslyFocused = ref<HTMLElement | null>(null)

export function useSimulator() {
  const isOpen = computed(() => activeKey.value !== null)

  function open(key: WizardKey) {
    if (typeof document !== 'undefined') {
      const el = document.activeElement
      previouslyFocused.value = el instanceof HTMLElement ? el : null
    }
    activeKey.value = key
    currentResult.value = null
  }

  function close() {
    activeKey.value = null
    currentResult.value = null
    const target = previouslyFocused.value
    previouslyFocused.value = null
    if (target && typeof document !== 'undefined') target.focus()
  }

  function setResult(r: AnyWizardResult | null) {
    currentResult.value = r
  }

  return { activeKey, currentResult, isOpen, open, close, setResult }
}
