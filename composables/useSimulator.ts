// Simulator state composable — single wizard instance at a time, mounted globally via
// WizardHost in layouts/app.vue. Mirrors useMetricExplainer's module-scoped pattern:
// triggers (WizardLauncher cards / dashboard quick actions) call open(key); host reads
// state.value to switch between wizard components.
//
// `previouslyFocused` captures the trigger at open time so close() restores keyboard
// focus to it — required for the a11y dialog pattern.

import { computed, ref } from 'vue'
import type { AnyWizardResult, WizardKey } from '~/lib/types/wizard'
import type { LunasiInput } from '~/lib/finance/wizards/lunasi-utang'
import type { DeployPrefill } from '~/lib/finance/wizards/modal-options'

const activeKey = ref<WizardKey | null>(null)
// AnyWizardResult = WizardResult (decision wizards) | CapacityResult (Day 8 Max Utang,
// Modal Options). Components narrow by activeKey or via `'heroValue' in result`.
const currentResult = ref<AnyWizardResult | null>(null)
const previouslyFocused = ref<HTMLElement | null>(null)

// Prefill payload — set by callers that want to seed a wizard's form (Day 9 Modal Options
// handoff). Wizard component reads + clears on mount; missing payload = blank form.
// Discriminated union keyed by wizardKey so each wizard claims its own shape; adding a
// new wizard with prefill = add an arm here + read it in the wizard's onMounted.
export type WizardPrefill =
  | { wizardKey: 'lunasi'; input: LunasiInput }
  | { wizardKey: 'deploy-preview'; input: DeployPrefill }
const pendingPrefill = ref<WizardPrefill | null>(null)

export function useSimulator() {
  const isOpen = computed(() => activeKey.value !== null)

  function open(key: WizardKey, prefill?: WizardPrefill) {
    if (typeof document !== 'undefined') {
      const el = document.activeElement
      previouslyFocused.value = el instanceof HTMLElement ? el : null
    }
    activeKey.value = key
    currentResult.value = null
    pendingPrefill.value = prefill ?? null
  }

  function close() {
    activeKey.value = null
    currentResult.value = null
    pendingPrefill.value = null
    const target = previouslyFocused.value
    previouslyFocused.value = null
    if (target && typeof document !== 'undefined') target.focus()
  }

  function setResult(r: AnyWizardResult | null) {
    currentResult.value = r
  }

  // Read-and-clear pattern: wizard calls this once in onMounted; subsequent reads return
  // null so a stale prefill doesn't leak across re-opens with no payload. Generic
  // narrows the return type to the arm whose wizardKey matches `forKey` so callers
  // don't have to re-narrow the input field manually.
  function consumePrefill<K extends WizardKey>(
    forKey: K,
  ): Extract<WizardPrefill, { wizardKey: K }> | null {
    const p = pendingPrefill.value
    if (!p || p.wizardKey !== forKey) return null
    pendingPrefill.value = null
    return p as Extract<WizardPrefill, { wizardKey: K }>
  }

  return {
    activeKey,
    currentResult,
    isOpen,
    open,
    close,
    setResult,
    consumePrefill,
  }
}
