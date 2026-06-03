// Simulator state composable — single simulator instance at a time, mounted globally via
// SimHost in layouts/app.vue. Mirrors useMetricExplainer's module-scoped pattern:
// triggers (SimLauncher cards / dashboard quick actions) call open(key); host reads
// state.value to switch between simulator components.
//
// `previouslyFocused` captures the trigger at open time so close() restores keyboard
// focus to it — required for the a11y dialog pattern.

import { computed, ref } from 'vue'
import type { AnySimResult, SimKey } from '~/lib/types/sim'
import type { LunasiInput } from '~/lib/finance/sims/lunasi-utang'
import type { DeployPrefill } from '~/lib/finance/sims/modal-options'

const activeKey = ref<SimKey | null>(null)
// AnySimResult = SimResult (decision simulators) | CapacityResult (Day 8 Max Utang,
// Modal Options). Components narrow by activeKey or via `'heroValue' in result`.
const currentResult = ref<AnySimResult | null>(null)
const previouslyFocused = ref<HTMLElement | null>(null)

// Prefill payload — set by callers that want to seed a simulator's form (Day 9 Modal Options
// handoff). Simulator component reads + clears on mount; missing payload = blank form.
// Discriminated union keyed by simKey so each simulator claims its own shape; adding a
// new simulator with prefill = add an arm here + read it in the simulator's onMounted.
export type SimPrefill =
  | { simKey: 'lunasi'; input: LunasiInput }
  | { simKey: 'deploy-preview'; input: DeployPrefill }
const pendingPrefill = ref<SimPrefill | null>(null)

export function useSimulator() {
  const isOpen = computed(() => activeKey.value !== null)

  function open(key: SimKey, prefill?: SimPrefill) {
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

  function setResult(r: AnySimResult | null) {
    currentResult.value = r
  }

  // Read-and-clear pattern: simulator calls this once in onMounted; subsequent reads return
  // null so a stale prefill doesn't leak across re-opens with no payload. Generic
  // narrows the return type to the arm whose simKey matches `forKey` so callers
  // don't have to re-narrow the input field manually.
  function consumePrefill<K extends SimKey>(
    forKey: K,
  ): Extract<SimPrefill, { simKey: K }> | null {
    const p = pendingPrefill.value
    if (!p || p.simKey !== forKey) return null
    pendingPrefill.value = null
    return p as Extract<SimPrefill, { simKey: K }>
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
