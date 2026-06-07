<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { useDerivedStore } from '~/stores/derived'
import { useSnapshotStore } from '~/stores/snapshot'
import {
  calcBungaDepositoMonthly,
  calcBungaSbnMonthly,
  calcPotentialDividendIdr,
  calcTotalPengeluaran,
  gajiBersihIdr,
  sumCryptoIdr,
  sumRowsToIdr,
  sumStockIdr,
  totalPenghasilanMonthly,
} from '~/lib/finance/metrics'
import { surplus } from '~/lib/finance/goals'
import { rateToIdr, rowToIdr } from '~/lib/finance/fx'
import { idr } from '~/lib/format/idr'
import { cssVar, registerEcharts } from './charts-register'
import type { Currency, PricesView, SnapshotState } from '~/lib/types/snapshot'

registerEcharts()

const derived = useDerivedStore()
const snap = useSnapshotStore()

const snapshotState = computed<SnapshotState>(() => ({
  penghasilan: snap.penghasilan,
  penghasilanLain: snap.penghasilanLain,
  pengeluaran: snap.pengeluaran,
  pengeluaranLain: snap.pengeluaranLain,
  asetLikuid: snap.asetLikuid,
  asetNonLikuid: snap.asetNonLikuid,
  emas: snap.emas,
  saham: snap.saham,
  crypto: snap.crypto,
  cicilanAktif: snap.cicilanAktif,
  utangPribadi: snap.utangPribadi,
  gadai: snap.gadai,
}))

const prices = computed(() => derived.priceView ?? undefined)

// Color palette — align with existing ExpenseBreakdownDonut
const COLORS = {
  income: '#059669', // emerald-600
  aggregate: '#047857', // emerald-700
  pokok: '#059669', // same as ExpenseBreakdownDonut
  lifestyle: '#b45309', // --color-warning-amber
  cicilan: '#be123c', // --color-danger-rose
  lainnya: '#7c3aed', // violet (same as Pengeluaran Lain)
  tabungan: '#047857', // darker emerald to distinguish from Pokok
  defisit: '#be123c', // red
}

interface SankeyNode {
  name: string
  itemStyle?: { color: string }
}

interface SankeyLink {
  source: string
  target: string
  value: number
}

const MAX_INCOME_NODES = 5
const MAX_EXPENSE_NODES = 6

const sankeyData = computed(() => {
  const s = snapshotState.value
  const p = prices.value

  const totalIncome = totalPenghasilanMonthly(s, p)
  const totalExpense = calcTotalPengeluaran(s, p)
  const surplusVal = surplus(s, p)

  if (totalIncome <= 0 && totalExpense <= 0) {
    return { nodes: [] as SankeyNode[], links: [] as SankeyLink[], empty: true }
  }

  const nodes: SankeyNode[] = []
  const links: SankeyLink[] = []

  // --- Income sources ---
  const incomeSources: { label: string; value: number }[] = []

  const gaji = gajiBersihIdr(s, p)
  if (gaji > 0) incomeSources.push({ label: 'Gaji', value: gaji })

  for (const r of s.penghasilanLain) {
    const val = rowToIdr(r, p?.fxRates)
    if (val > 0) incomeSources.push({ label: r.label || 'Lainnya', value: val })
  }

  const divMonthly =
    s.saham.reduce(
      (sum, st) =>
        sum + calcPotentialDividendIdr(st, p?.idxByTicker[st.ticker] ?? null),
      0,
    ) / 12
  if (divMonthly > 0) incomeSources.push({ label: 'Dividen', value: divMonthly })

  const bungaDepo = calcBungaDepositoMonthly(s, p)
  if (bungaDepo > 0) incomeSources.push({ label: 'Bunga Deposito', value: bungaDepo })

  const bungaSbn = calcBungaSbnMonthly(s, p)
  if (bungaSbn > 0) incomeSources.push({ label: 'Bunga SBN', value: bungaSbn })

  // Limit-N: top N + "Lainnya"
  incomeSources.sort((a, b) => b.value - a.value)
  let shownIncome = incomeSources.slice(0, MAX_INCOME_NODES)
  const restIncome = incomeSources.slice(MAX_INCOME_NODES)
  if (restIncome.length > 0) {
    const lainnyaVal = restIncome.reduce((s, r) => s + r.value, 0)
    shownIncome = [...shownIncome, { label: 'Lainnya', value: lainnyaVal }]
  }

  // --- Expense categories ---
  const toIdr = (amount: number, currency?: Currency) => {
    const cur = currency ?? 'IDR'
    if (cur === 'IDR') return amount
    const rate = rateToIdr(cur, p?.fxRates)
    return rate === null ? 0 : amount * rate
  }

  const expenseItems: { label: string; value: number; color: string }[] = []

  const pokokIdr = toIdr(s.pengeluaran.pokok, s.pengeluaran.pokokCurrency)
  if (pokokIdr > 0) expenseItems.push({ label: 'Pokok', value: pokokIdr, color: COLORS.pokok })

  const lifestyleIdr = toIdr(s.pengeluaran.lifestyle, s.pengeluaran.lifestyleCurrency)
  if (lifestyleIdr > 0)
    expenseItems.push({ label: 'Lifestyle', value: lifestyleIdr, color: COLORS.lifestyle })

  const cicilanMonthly =
    s.cicilanAktif.reduce((sum, r) => sum + (r.cicilanPerBulan || 0), 0) +
    s.utangPribadi.reduce((sum, r) => sum + (r.cicilanPerBulan || 0), 0)
  if (cicilanMonthly > 0)
    expenseItems.push({ label: 'Cicilan', value: cicilanMonthly, color: COLORS.cicilan })

  for (const r of s.pengeluaranLain) {
    const val = rowToIdr(r, p?.fxRates)
    if (val > 0) expenseItems.push({ label: r.label || 'Lainnya', value: val, color: COLORS.lainnya })
  }

  // Limit-N for expenses
  expenseItems.sort((a, b) => b.value - a.value)
  let shownExpense = expenseItems.slice(0, MAX_EXPENSE_NODES)
  const restExpense = expenseItems.slice(MAX_EXPENSE_NODES)
  if (restExpense.length > 0) {
    const lainnyaVal = restExpense.reduce((sum, r) => sum + r.value, 0)
    shownExpense = [...shownExpense, { label: 'Lainnya', value: lainnyaVal, color: COLORS.lainnya }]
  }

  // --- Build nodes ---
  for (const src of shownIncome) {
    nodes.push({ name: src.label, itemStyle: { color: COLORS.income } })
  }

  // Aggregate nodes
  nodes.push({ name: 'Total Pendapatan', itemStyle: { color: COLORS.aggregate } })

  if (surplusVal > 0) {
    // Surplus → Tabungan node
    nodes.push({ name: 'Tabungan', itemStyle: { color: COLORS.tabungan } })
  } else if (surplusVal < 0) {
    nodes.push({ name: 'Defisit', itemStyle: { color: COLORS.defisit } })
  }

  const hasExpenses = shownExpense.length > 0
  if (hasExpenses) {
    nodes.push({ name: 'Total Pengeluaran', itemStyle: { color: COLORS.aggregate } })
    for (const exp of shownExpense) {
      nodes.push({ name: exp.label, itemStyle: { color: exp.color } })
    }
  }

  // --- Build links ---
  // Income → Total Pendapatan
  for (const src of shownIncome) {
    links.push({ source: src.label, target: 'Total Pendapatan', value: src.value })
  }

  // Total Pendapatan → Total Pengeluaran (or direct to expenses)
  const totalExpenseFlow = shownExpense.reduce((s, e) => s + e.value, 0)

  if (hasExpenses) {
    links.push({
      source: 'Total Pendapatan',
      target: 'Total Pengeluaran',
      value: totalExpenseFlow,
    })

    // Total Pengeluaran → individual expenses
    for (const exp of shownExpense) {
      links.push({
        source: 'Total Pengeluaran',
        target: exp.label,
        value: exp.value,
      })
    }
  }

  // Surplus or Defisit
  if (surplusVal > 0) {
    links.push({
      source: 'Total Pendapatan',
      target: 'Tabungan',
      value: surplusVal,
    })
  } else if (surplusVal < 0 && hasExpenses) {
    // Defisit: expenses exceed income — no Tabungan node, but Total Pengeluaran
    // gets extra from the deficit. We already link Total Pendapatan → Total Pengeluaran
    // with totalExpenseFlow. If totalExpenseFlow > totalIncome, the Sankey handles it
    // by just showing the income side as the constraint.
    // Instead, just note: expenses > income. Sankey shows reality.
  }

  return { nodes, links, empty: false }
})

const hasData = computed(() => !sankeyData.value.empty && sankeyData.value.nodes.length > 0)

const option = computed(() => {
  if (!hasData.value) return {}

  return {
    aria: { enabled: true, decal: { show: false } },
    tooltip: {
      trigger: 'item',
      formatter: (params: { name: string; data: { value: number } }) =>
        `${params.name}<br/>${idr(params.data.value)}`,
    },
    series: [
      {
        type: 'sankey',
        layoutIterations: 64,
        nodeWidth: 20,
        nodeGap: 12,
        draggable: false,
        label: {
          fontSize: 11,
          color: cssVar('--color-text-secondary'),
        },
        lineStyle: {
          color: 'gradient',
          opacity: 0.35,
        },
        emphasis: {
          lineStyle: { opacity: 0.6 },
        },
        data: sankeyData.value.nodes,
        links: sankeyData.value.links,
      },
    ],
  }
})
</script>

<template>
  <section
    class="min-w-0 overflow-x-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4"
  >
    <header class="mb-2">
      <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
        Alur Kas
      </h3>
    </header>

    <!-- Desktop: Sankey chart -->
    <div v-if="hasData" class="hidden sm:block">
      <div class="h-80 w-full overflow-x-hidden">
        <VChart :option="option" autoresize />
      </div>
    </div>

    <!-- Mobile: friendly fallback -->
    <div
      v-if="hasData"
      class="flex h-32 items-center justify-center sm:hidden"
    >
      <p class="text-center text-xs text-[var(--color-text-muted)]">
        Visual alur kas tersedia di layar lebih lebar.<br />
        Buka di desktop untuk pengalaman lengkap.
      </p>
    </div>

    <!-- Empty state -->
    <p
      v-if="!hasData"
      class="flex h-48 items-center justify-center text-xs text-[var(--color-text-muted)]"
    >
      Isi data pendapatan dan pengeluaran untuk melihat alur kas
    </p>
  </section>
</template>
