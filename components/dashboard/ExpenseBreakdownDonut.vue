<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { useSnapshotStore } from '~/stores/snapshot'
import { useDerivedStore } from '~/stores/derived'
import { calcTotalPengeluaran } from '~/lib/finance/metrics'
import { idr } from '~/lib/format/idr'
import { cssVar, registerEcharts } from './charts-register'

registerEcharts()

const snap = useSnapshotStore()
const derived = useDerivedStore()

const slices = computed(() => {
  const items: { label: string; value: number; color: string }[] = []
  if (snap.pengeluaran.pokok > 0) {
    items.push({ label: 'Pokok', value: snap.pengeluaran.pokok, color: cssVar('--color-primary') })
  }
  if (snap.pengeluaran.lifestyle > 0) {
    items.push({ label: 'Lifestyle', value: snap.pengeluaran.lifestyle, color: cssVar('--color-warning-amber') })
  }
  const lainTotal = snap.pengeluaranLain.reduce((s, r) => s + (r.amount || 0), 0)
  if (lainTotal > 0) {
    items.push({ label: 'Pengeluaran Lain', value: lainTotal, color: '#7c3aed' })
  }
  const cicilanMonthly = snap.cicilanAktif.reduce((s, r) => s + (r.cicilanPerBulan || 0), 0)
  if (cicilanMonthly > 0) {
    items.push({ label: 'Cicilan', value: cicilanMonthly, color: cssVar('--color-danger-rose') })
  }
  return items
})

const total = computed(() =>
  calcTotalPengeluaran(
    {
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
    },
    derived.priceView ?? undefined,
  ),
)

const hasData = computed(() => slices.value.length > 0)

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
    textStyle: { fontSize: 11 },
  },
  series: [
    {
      name: 'Pengeluaran',
      type: 'pie',
      radius: ['55%', '78%'],
      center: ['50%', '42%'],
      avoidLabelOverlap: true,
      label: { show: false },
      labelLine: { show: false },
      data: slices.value.map((s) => ({
        name: s.label,
        value: s.value,
        itemStyle: { color: s.color },
      })),
    },
  ],
}))
</script>

<template>
  <section
    class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4"
  >
    <header class="mb-2 flex items-baseline justify-between">
      <h3 class="text-sm font-semibold text-[var(--color-text-primary)]">
        Komposisi Pengeluaran
      </h3>
      <span v-if="hasData" class="tabular text-xs text-[var(--color-text-secondary)]">
        {{ idr(total) }}
      </span>
    </header>
    <div v-if="hasData" class="h-64">
      <VChart :option="option" autoresize />
    </div>
    <p
      v-else
      class="flex h-48 items-center justify-center text-xs text-[var(--color-text-muted)]"
    >
      Belum ada data pengeluaran
    </p>
  </section>
</template>
