// Centralized display labels for Cermat Score contribution breakdown.
// Single source of truth so ScoreHero + MetricGrid never show raw code keys.

// Keys used in Cermat Score contributions (subset of MetricKey + custom)
export type ContributionKey =
  | 'dsr'
  | 'dar'
  | 'savingsRate'
  | 'runway'
  | 'safeHaven'
  | 'goalHealth'
  | 'netWorthVsExpenses'
  | 'allocationDiscipline'

interface MetricLabel {
  label: string
  tooltip: string
}

const LABELS: Record<ContributionKey, MetricLabel> = {
  dsr: {
    label: 'Beban Cicilan',
    tooltip: 'Debt Service Ratio — % penghasilan buat cicilan',
  },
  dar: {
    label: 'Rasio Utang',
    tooltip: 'Debt to Asset Ratio — utang vs aset',
  },
  savingsRate: {
    label: 'Rajin Nabung',
    tooltip: 'Savings Rate — % penghasilan ditabung',
  },
  runway: {
    label: 'Daya Tahan Dana',
    tooltip: 'Berapa bulan bertahan tanpa pemasukan',
  },
  safeHaven: {
    label: 'Dana Aman',
    tooltip: '% aset di instrumen likuid & aman',
  },
  goalHealth: {
    label: 'Progress Tujuan',
    tooltip: 'Kesehatan progress goal',
  },
  netWorthVsExpenses: {
    label: 'Bantalan Kekayaan',
    tooltip: 'Kekayaan bersih vs pengeluaran bulanan',
  },
  allocationDiscipline: {
    label: 'Disiplin Alokasi',
    tooltip: 'Deviasi alokasi aktual vs target',
  },
}

export function metricLabel(key: string): string {
  return (LABELS as Record<string, MetricLabel>)[key]?.label ?? key
}

export function metricTooltip(key: string): string {
  return (LABELS as Record<string, MetricLabel>)[key]?.tooltip ?? ''
}
