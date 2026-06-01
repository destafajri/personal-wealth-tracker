import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  DEFAULT_BUCKETS,
  emptyGoals,
  type Goal,
  type GoalKind,
} from '~/lib/types/goals'

// D0.2 locked: FI multiplier = 300 (Trinity 4% rule; monthly = 25× annual). Exposed as
// a constant so callers (FiGoalCard, fiNumber, derived store) read one source — flipping
// to a dropdown later is one line. Not a `ref` because changing it at runtime would
// invalidate every projection without user notice.
export const FI_MULTIPLIER = 300

const rid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

export const useGoalsStore = defineStore('goals', () => {
  const goals = ref<Goal[]>(emptyGoals())
  // Global real-return assumption (REAL, inflation-baked). 0.05 default = 5%.
  // User-editable on the Goals page header; every projected figure carries ESTIMASI.
  const assumedAnnualReturnReal = ref<number>(0.05)

  const hasFiGoal = computed(() => goals.value.some((g) => g.kind === 'FI'))
  const activeGoalsCount = computed(() => goals.value.length)

  function addGoal(partial: Partial<Goal> & { kind: GoalKind }): Goal | null {
    // Enforce one FI goal at a time — FI Number is a single derived target per snapshot.
    if (partial.kind === 'FI' && hasFiGoal.value) return null
    const row: Goal = {
      id: rid(),
      kind: partial.kind,
      label: partial.label ?? defaultLabel(partial.kind),
      targetIdr: partial.targetIdr ?? 0,
      targetDate: partial.targetDate ?? '',
      buckets: partial.buckets ?? [...DEFAULT_BUCKETS[partial.kind]],
      monthlyAllocationIdr: partial.monthlyAllocationIdr,
    }
    goals.value.push(row)
    return row
  }

  function updateGoal(id: string, patch: Partial<Omit<Goal, 'id' | 'kind'>>) {
    const idx = goals.value.findIndex((g) => g.id === id)
    if (idx === -1) return
    goals.value[idx] = { ...goals.value[idx]!, ...patch }
  }

  function removeGoal(id: string) {
    goals.value = goals.value.filter((g) => g.id !== id)
  }

  function setAssumedReturn(value: number) {
    if (!Number.isFinite(value)) return
    // Clamp to a sane range: −5% (deflation scenario) to +20%. Outside this band the
    // projection math is either misleading (too rosy) or numerically wonky.
    assumedAnnualReturnReal.value = Math.max(-0.05, Math.min(0.2, value))
  }

  function reset() {
    goals.value = emptyGoals()
    assumedAnnualReturnReal.value = 0.05
  }

  return {
    goals,
    assumedAnnualReturnReal,
    hasFiGoal,
    activeGoalsCount,
    addGoal,
    updateGoal,
    removeGoal,
    setAssumedReturn,
    reset,
  }
})

function defaultLabel(kind: GoalKind): string {
  switch (kind) {
    case 'FI':
      return 'Financial Independence'
    case 'DP_RUMAH':
      return 'DP Rumah'
    case 'DANA_PENDIDIKAN':
      return 'Dana Pendidikan'
    case 'CUSTOM':
      return 'Goal kustom'
  }
}
