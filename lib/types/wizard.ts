// Wizard domain types — shared by all 6 wizards (4 decision + 2 capacity). Each wizard
// exports its own input type + a `run()` pure function that returns WizardResult; the
// UI is a thin renderer of `delta` + `goalImpact`.

import type { Goal, GoalStatus } from '~/lib/types/goals'
import type { SnapshotState } from '~/lib/types/snapshot'
import type { Zone } from '~/lib/finance/thresholds'

// Stable string keys for wizard identification (URL/state/launcher). Capacity wizards
// (Day 8+) and custom (Day 7) included so the launcher/host can reference them now
// even though the run-functions ship later.
export type WizardKey =
  | 'kpr'
  | 'gadai'
  | 'cicil'
  | 'custom'
  | 'max-utang'
  | 'lunasi'
  | 'modal-options'

// One side of a metric delta row (before or after). `value` is the raw number for math /
// arrow direction; `display` is the user-facing string. `zone` populated only for metrics
// that have a threshold band (DSR/DAR/Runway/etc); netWorth/modalSiap omit it.
export interface DeltaSide {
  display: string
  value: number | null
  zone?: Zone
}

// Direction = is the delta "good" for the user? Drives arrow + color. Independent from
// up/down — DSR going UP is "worse"; Runway going UP is "better". Wizard math owns the bias.
export type DeltaDirection = 'better' | 'worse' | 'neutral'

export interface DeltaRow {
  metricKey: string // 'netWorth' | 'modalSiap' | 'dsr' | … | 'goal:fi' (future)
  label: string
  before: DeltaSide
  after: DeltaSide
  deltaDisplay: string // '▲ Rp 40jt' | '▼ −4 pp' | '●'
  direction: DeltaDirection
}

// Per-goal impact: status flip + month-shift in completion projection. unreachable=true
// when scenario makes the goal impossible (projection.date became null). monthsShift > 0
// = mundur, < 0 = lebih cepat, 0 = neutral.
export interface GoalDelta {
  goalId: string
  goalLabel: string
  beforeStatus: GoalStatus
  afterStatus: GoalStatus
  monthsShift: number
  unreachable: boolean
}

// All wizards return this shape. `scenarioSnapshot` and `scenarioGoals` are the cloned-
// and-mutated state so callers can re-run analyses (e.g., chaining wizards). `warnings`
// surfaces non-blocking concerns like "DP exceeds liquid" — UI renders them inline.
export interface WizardResult {
  scenarioSnapshot: SnapshotState
  scenarioGoals: Goal[]
  delta: DeltaRow[]
  goalImpact: GoalDelta[]
  warnings: string[]
}
