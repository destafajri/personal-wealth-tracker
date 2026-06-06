<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { useSnapshotStore } from '~/stores/snapshot'
import { useDerivedStore } from '~/stores/derived'
import { sumRowsToIdr, sumCryptoIdr, sumStockIdr } from '~/lib/finance/metrics'
import { totalGoldIdr } from '~/lib/finance/emas'
import { idr } from '~/lib/format/idr'
import { cssVar, registerEcharts } from './charts-register'

registerEcharts()

const COLORS = [
  cssVar('--color-primary'),       // kas — emerald
  '#0ea5e9',                        // deposito — sky blue
  '#0d9488',                        // reksa dana — teal
  '#6366f1',                        // sbn — indigo
  cssVar('--color-gold'),           // emas — gold
  '#2563eb',                        // saham — blue
  '#7c3aed',                        // crypto — violet
  '#f59e0b',                        // properti — amber
  '#ec4899',                        // kendaraan — pink
  '#c084fc',                        // pensiun — purple
]

const snap = useSnapshotStore()
const derived = useDerivedStore()
const prices = computed(() => derived.priceView ?? undefined)

const snapState = computed(() => ({
  emas: snap.emas,
  asetLikuid: snap.asetLikuid,
  asetNonLikuid: snap.asetNonLikuid,
  penghasilan: snap.penghasilan,
  penghasilanLain: snap.penghasilanLain,
  pengeluaran: snap.pengeluaran,
  pengeluaranLain: snap.pengeluaranLain,
  saham: snap.saham,
  crypto: snap.crypto,
  cicilanAktif: snap.cicilanAktif,
  utangPribadi: snap.utangPribadi,
  gadai: snap.gadai,
}))

const slices = computed(() => {
  const p = prices.value
  const items: { label: string; value: number }[] = []

  const kas = sumRowsToIdr(snap.asetLikuid.kas, p)
  if (kas > 0) items.push({ label: 'Kas', value: kas })

  const deposito = sumRowsToIdr(snap.asetLikuid.deposito, p)
  if (deposito > 0) items.push({ label: 'Deposito', value: deposito })

  const rd = sumRowsToIdr(snap.asetLikuid.reksaDana, p)
  if (rd > 0) items.push({ label: 'Reksa Dana', value: rd })

  const sbn = sumRowsToIdr(snap.asetLikuid.sbn, p)
  if (sbn > 0) items.push({ label: 'SBN', value: sbn })

  const emas = totalGoldIdr(snapState.value, p)
  if (emas > 0) items.push({ label: 'Emas', value: emas })

  const saham = sumStockIdr(snap.saham, p)
  if (saham > 0) items.push({ label: 'Saham', value: saham })

  const crypto = sumCryptoIdr(snap.crypto, p)
  if (crypto > 0) items.push({ label: 'Crypto', value: crypto })

  const properti = snap.asetNonLikuid.properti.reduce((s, r) => s + (r.amount || 0), 0)
  if (properti > 0) items.push({ label: 'Properti', value: properti })

  const kendaraan = snap.asetNonLikuid.kendaraan.reduce((s, r) => s + (r.amount || 0), 0)
  if (kendaraan > 0) items.push({ label: 'Kendaraan', value: kendaraan })

  const pensiun = snap.asetNonLikuid.pensiun.reduce((s, r) => s + (r.amount || 0), 0)
  if (pensiun > 0) items.push({ label: 'Pensiun', value: pensiun })

  return items
})

const total = computed(() => slices.value.reduce((s, r) => s + r.value, 0))
const hasData = computed(() => slices.value.length > 0 && total.value > 0)

const option = computed(() => ({
  aria: { enabled: true, decal: { show: false } },
  tooltip: {
    trigger: 'item',
    formatter: (params: { name: string; value: number; percent: number }) =>
      `${params.name}<br/>${idr(params.value)} (${params.percent.toFixed(1)}%)`,
  },
  legend: {
    orient: 'horizontal',
    bottom: 0,
    type: 'scroll',
    textStyle: { fontSize: 11 },
  },
  series: [
    {
      name: 'Alokasi Aset',
      type: 'pie',
      radius: ['55%', '78%'],
      center: ['50%', '42%'],
      avoidLabelOverlap: true,
      label: { show: false },
      labelLine: { show: false },
      data: slices.value.map((s, i) => ({
        name: s.label,
        value: s.value,
        itemStyle: { color: COLORS[i % COLORS.length] },
      })),
    },
  ],
}))
</script>

<template>
  <section
    class="min-w-0 overflow-x-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4"
  >
    <header class="mb-2 flex items-baseline justify-between">
      <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
        Alokasi Aset
      </h3>
      <span v-if="hasData" class="tabular text-xs text-[var(--color-text-secondary)]">
        Total {{ idr(total) }}
      </span>
    </header>
    <div v-if="hasData" class="h-64 w-full overflow-x-hidden">
      <VChart :option="option" autoresize />
    </div>
    <p
      v-else
      class="flex h-48 items-center justify-center text-xs text-[var(--color-text-muted)]"
    >
      Belum ada data aset
    </p>
  </section>
</template>
