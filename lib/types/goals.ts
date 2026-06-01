// Goals domain types — used by stores/goals.ts, lib/finance/goals.ts, and the goals/
// + dashboard components. Bucket tagging is CATEGORY-level (multi-select): user picks
// which asset categories count toward the goal. Per-row tagging considered but skipped
// for MVP (simpler UI; matches design-guidelines example "Bucket: RD + Saham + Deposito").

export type GoalKind = 'FI' | 'DP_RUMAH' | 'DANA_PENDIDIKAN' | 'CUSTOM'

export const GOAL_KINDS: readonly GoalKind[] = ['FI', 'DP_RUMAH', 'DANA_PENDIDIKAN', 'CUSTOM']

// Asset categories that can be tagged onto a goal. Mirror snapshot's asset taxonomy:
// liquid sub-categories + saham + crypto + emas + non-liquid. Same string identifiers
// as snapshot keys where applicable (kas/deposito/reksaDana/sbn/properti/kendaraan/pensiun).
export type GoalBucketCategory =
  | 'kas'
  | 'deposito'
  | 'reksaDana'
  | 'sbn'
  | 'saham'
  | 'crypto'
  | 'emas'
  | 'properti'
  | 'kendaraan'
  | 'pensiun'

export const ALL_BUCKETS: readonly GoalBucketCategory[] = [
  'kas',
  'deposito',
  'reksaDana',
  'sbn',
  'saham',
  'crypto',
  'emas',
  'properti',
  'kendaraan',
  'pensiun',
]

// Default bucket per kind. FI = wealth-building set (excludes properti/kendaraan/pensiun
// since those aren't usually deployed to fund retirement income). Others start empty —
// DP rumah vs dana pendidikan have different sensible defaults per household, so the
// user picks instead of getting a guess that may be misleading.
export const DEFAULT_BUCKETS: Record<GoalKind, readonly GoalBucketCategory[]> = {
  FI: ['kas', 'deposito', 'reksaDana', 'sbn', 'saham', 'crypto', 'emas'],
  DP_RUMAH: [],
  DANA_PENDIDIKAN: [],
  CUSTOM: [],
}

export type GoalStatus = 'on' | 'at-risk' | 'off'

export interface Goal {
  id: string
  kind: GoalKind
  label: string
  // Target amount (IDR). For FI this is auto-computed from snapshot (Pengeluaran × 300)
  // so the persisted value is ignored — UI hides the input on FI goals.
  targetIdr: number
  // Target date (ISO YYYY-MM-DD or YYYY-MM). Empty string when user hasn't set one yet.
  // goalStatus() treats empty as 'off' (no anchor to compare projection against).
  targetDate: string
  // Tagged asset categories. progress = Σ assets in these categories ÷ resolved target.
  buckets: GoalBucketCategory[]
  // Optional monthly contribution override. When undefined: surplus ÷ active goal count.
  monthlyAllocationIdr?: number
}

export function emptyGoals(): Goal[] {
  return []
}
