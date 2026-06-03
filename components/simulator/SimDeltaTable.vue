<script setup lang="ts">
// Shared 4-col delta table (Metrik | Sebelum | Sesudah | Δ). Used by all 6 simulators —
// any styling drift here flows everywhere, so the table stays minimal + tokens-only.
//
// Coloring rule: `after.zone` drives the cell tint (sehat/waspada/bahaya soft bg).
// Arrow color via `direction` (better=emerald, worse=rose, neutral=muted). Direction
// and zone are independent: a metric can be "worse" but still in 'sehat' zone (just
// got closer to waspada).
import { t } from '~/lib/copy/strings'
import type { DeltaDirection, DeltaRow } from '~/lib/types/sim'
import type { Zone } from '~/lib/finance/thresholds'

defineProps<{ delta: DeltaRow[] }>()

const ZONE_TINT: Record<Zone, string> = {
  sehat: 'bg-[var(--color-accent-emerald-soft)] text-[var(--color-accent-emerald)]',
  waspada: 'bg-[var(--color-warning-amber-soft)] text-[var(--color-warning-amber)]',
  bahaya: 'bg-[var(--color-danger-rose-soft)] text-[var(--color-danger-rose)]',
}

const DIRECTION_CLASS: Record<DeltaDirection, string> = {
  better: 'text-[var(--color-accent-emerald)]',
  worse: 'text-[var(--color-danger-rose)]',
  neutral: 'text-[var(--color-text-muted)]',
}

function afterCellClass(zone: Zone | undefined): string {
  if (!zone) return 'text-[var(--color-text-primary)]'
  return ZONE_TINT[zone] + ' px-2 py-1 rounded-[var(--radius-pill)]'
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse text-sm">
      <thead>
        <tr class="border-b border-[var(--color-border)] text-left text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
          <th class="py-2 pr-3 font-medium">{{ t('sim.delta.col.metric') }}</th>
          <th class="py-2 pr-3 font-medium">{{ t('sim.delta.col.before') }}</th>
          <th class="py-2 pr-3 font-medium">{{ t('sim.delta.col.after') }}</th>
          <th class="py-2 font-medium">{{ t('sim.delta.col.delta') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in delta"
          :key="row.metricKey"
          class="border-b border-[var(--color-border)]/60 last:border-0"
        >
          <td class="py-2.5 pr-3 font-medium text-[var(--color-text-primary)]">
            {{ row.label }}
          </td>
          <td class="py-2.5 pr-3 tabular text-[var(--color-text-secondary)]">
            {{ row.before.display }}
          </td>
          <td class="py-2.5 pr-3 tabular">
            <span :class="afterCellClass(row.after.zone)">{{ row.after.display }}</span>
          </td>
          <td class="py-2.5 tabular font-medium" :class="DIRECTION_CLASS[row.direction]">
            {{ row.deltaDisplay }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
