<script setup lang="ts">
import { computed } from 'vue'
import {
  BarChart3,
  CreditCard,
  Home,
  Lock,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-vue-next'
import { useSnapshotStore } from '~/stores/snapshot'
import { useDerivedStore } from '~/stores/derived'
import { useInsightJujur } from '~/composables/useInsightJujur'
import { idr } from '~/lib/format/idr'
import { rateToIdr } from '~/lib/finance/fx'
import {
  calcTotalPengeluaran,
  sumCryptoIdr,
  sumEmasIdr,
  sumSbnIdr,
  sumStockIdr,
} from '~/lib/finance/metrics'
import type { AssetRow, SnapshotState } from '~/lib/types/snapshot'

// Compact sidebar — replaces the heavy DashboardPanel in `layouts/app.vue` aside.
// Shows per-section totals + Surplus/DSR vital signs + an asset-composition donut.
// The full Phase-1 dashboard (HeroPair + 9 KPI cards + ECharts + ModalOptions + Goal
// summary) is preserved and rendered inside the Ringkasan tab on the snapshot page.

const snap = useSnapshotStore()
const derived = useDerivedStore()

function sumRows(rows: AssetRow[] | undefined): number {
  if (!rows) return 0
  return rows.reduce((sum, row) => {
    const amt = row.amount || 0
    const cur = row.currency ?? 'IDR'
    if (cur === 'IDR') return sum + amt
    const rate = rateToIdr(cur, derived.priceView?.fxRates) ?? 0
    return sum + amt * rate
  }, 0)
}

const snapState = computed<SnapshotState>(() => ({
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

const penghasilan = computed(() => derived.penghasilanMonthlyIdr)
const pengeluaran = computed(() =>
  calcTotalPengeluaran(snapState.value, derived.priceView ?? undefined),
)
const surplus = computed(() => derived.surplusIdr)
const { fires: insightJujurFires } = useInsightJujur()

const kas = computed(() => sumRows(snap.asetLikuid.kas))
const investasi = computed(() => {
  const prices = derived.priceView ?? undefined
  const deposito = sumRows(snap.asetLikuid.deposito)
  const rd = sumRows(snap.asetLikuid.reksaDana)
  return (
    deposito +
    rd +
    sumSbnIdr(snapState.value, prices) +
    sumEmasIdr(snapState.value, prices) +
    sumStockIdr(snap.saham, prices) +
    sumCryptoIdr(snap.crypto, prices)
  )
})
const asetTetap = computed(
  () =>
    sumRows(snap.asetNonLikuid.properti) +
    sumRows(snap.asetNonLikuid.kendaraan) +
    sumRows(snap.asetNonLikuid.pensiun),
)
const utang = computed(() => derived.totalUtang)
const netWorth = computed(() => derived.netWorth)
const dsr = computed(() => derived.dsr)

const surplusPositive = computed(() => surplus.value > 0)
const surplusStatus = computed(() => {
  if (surplus.value > 0) return 'Keuangan kamu sehat'
  if (surplus.value < 0) return 'Defisit bulanan'
  return 'Mepet — pas-pasan'
})

// Asset composition donut (kas / investasi / aset tetap) — utang sengaja tidak masuk
// karena negative, ditampilkan terpisah di list bawah.
const compositionTotal = computed(() => kas.value + investasi.value + asetTetap.value)
const hasComposition = computed(() => compositionTotal.value > 0)

const kasPct = computed(() =>
  hasComposition.value ? (kas.value / compositionTotal.value) * 100 : 0,
)
const investasiPct = computed(() =>
  hasComposition.value ? (investasi.value / compositionTotal.value) * 100 : 0,
)
const asetTetapPct = computed(() =>
  hasComposition.value ? (asetTetap.value / compositionTotal.value) * 100 : 0,
)

const donutBg = computed(() => {
  if (!hasComposition.value) {
    return 'conic-gradient(var(--color-border) 0 100%)'
  }
  const kasDeg = (kasPct.value / 100) * 360
  const invDeg = kasDeg + (investasiPct.value / 100) * 360
  return `conic-gradient(var(--color-primary) 0 ${kasDeg}deg, var(--color-warning-amber) ${kasDeg}deg ${invDeg}deg, var(--color-text-muted) ${invDeg}deg 360deg)`
})

// DSR zone color (Phase-1 thresholds: aman <30 / waspada 30-40 / bahaya >40)
const dsrPercent = computed(() => (dsr.value === null ? 0 : Math.min(dsr.value, 100)))
const dsrZoneClass = computed(() => {
  if (dsr.value === null) return 'bg-[var(--color-text-muted)]'
  if (dsr.value < 30) return 'bg-[var(--color-primary)]'
  if (dsr.value < 40) return 'bg-[var(--color-warning-amber)]'
  return 'bg-[var(--color-danger-rose)]'
})
const dsrZoneText = computed(() => {
  if (dsr.value === null) return null
  if (dsr.value < 30) return 'Aman'
  if (dsr.value < 40) return 'Waspada'
  return 'Bahaya'
})
</script>

<template>
  <section
    class="space-y-4 p-3"
    aria-live="polite"
    aria-atomic="false"
  >
    <header>
      <h2 class="text-sm font-semibold text-[var(--color-text-primary)]">
        Ringkasan Cepat
      </h2>
      <p class="text-[10px] text-[var(--color-text-secondary)]">
        Diperbarui otomatis saat kamu mengisi
      </p>
    </header>

    <!-- Flow bulanan -->
    <div class="grid grid-cols-2 gap-2">
      <div
        class="rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-2.5 py-2"
      >
        <div class="flex items-center gap-1 text-[var(--color-text-secondary)]">
          <TrendingUp :size="11" class="text-[var(--color-primary)]" />
          <span class="text-[10px] font-medium">Pendapatan</span>
        </div>
        <p class="mt-1 text-[10px] font-semibold tabular-nums break-all text-[var(--color-text-primary)]">
          {{ idr(penghasilan) }}
        </p>
      </div>
      <div
        class="rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-2.5 py-2"
      >
        <div class="flex items-center gap-1 text-[var(--color-text-secondary)]">
          <TrendingDown :size="11" class="text-[var(--color-danger-rose)]" />
          <span class="text-[10px] font-medium">Pengeluaran</span>
        </div>
        <p class="mt-1 text-[10px] font-semibold tabular-nums break-all text-[var(--color-text-primary)]">
          {{ idr(pengeluaran) }}
        </p>
      </div>
    </div>

    <!-- Surplus hero -->
    <div
      :class="[
        'rounded-[var(--radius-card)] px-3 py-3',
        surplusPositive
          ? 'bg-gradient-to-br from-[var(--color-primary)]/12 via-[var(--color-accent-emerald-soft)] to-[var(--color-primary)]/5 ring-1 ring-[var(--color-primary)]/20'
          : surplus < 0
            ? 'bg-gradient-to-br from-[var(--color-danger-rose)]/10 via-[var(--color-danger-rose-soft)] to-[var(--color-danger-rose)]/5 ring-1 ring-[var(--color-danger-rose)]/15'
            : 'bg-[var(--color-surface-card)] ring-1 ring-[var(--color-border)]',
      ]"
    >
      <div class="flex items-center gap-1.5">
        <Sparkles :size="12" :class="surplusPositive ? 'text-[var(--color-primary)]' : surplus < 0 ? 'text-[var(--color-danger-rose)]' : 'text-[var(--color-text-muted)]'" />
        <span class="text-[10px] font-medium text-[var(--color-text-secondary)]">
          Surplus Bulanan
        </span>
      </div>
      <p
        :class="[
          'mt-1 break-all text-base font-bold tabular-nums leading-tight',
          surplusPositive
            ? 'text-[var(--color-primary)]'
            : surplus < 0
              ? 'text-[var(--color-danger-rose)]'
              : 'text-[var(--color-text-primary)]',
        ]"
      >
        {{ surplus > 0 ? '+' : '' }}{{ idr(surplus) }}
      </p>
      <p v-if="!insightJujurFires" class="mt-0.5 text-[10px] text-[var(--color-text-secondary)]">
        {{ surplusStatus }}
      </p>
    </div>

    <!-- Per-section totals with colored left borders -->
    <ul class="space-y-2">
      <li class="flex items-start gap-2.5 rounded-[var(--radius-input)] border-l-2 border-l-[var(--color-primary)] bg-[var(--color-surface-card)] px-3 py-2">
        <span
          class="grid h-6 w-6 shrink-0 place-items-center rounded bg-[var(--color-accent-emerald-soft)] text-[var(--color-primary)]"
        >
          <Wallet :size="12" :stroke-width="2" />
        </span>
        <span class="flex-1 truncate text-[11px] text-[var(--color-text-secondary)]">
          Kas / Tabungan
        </span>
        <span class="shrink-0 text-right text-[11px] font-semibold tabular-nums break-all text-[var(--color-text-primary)]">
          {{ idr(kas) }}
        </span>
      </li>
      <li class="flex items-start gap-2.5 rounded-[var(--radius-input)] border-l-2 border-l-[var(--color-warning-amber)] bg-[var(--color-surface-card)] px-3 py-2">
        <span
          class="grid h-6 w-6 shrink-0 place-items-center rounded bg-[var(--color-warning-amber-soft)] text-[var(--color-warning-amber)]"
        >
          <BarChart3 :size="12" :stroke-width="2" />
        </span>
        <span class="flex-1 truncate text-[11px] text-[var(--color-text-secondary)]">
          Investasi
        </span>
        <span class="shrink-0 text-right text-[11px] font-semibold tabular-nums break-all text-[var(--color-text-primary)]">
          {{ idr(investasi) }}
        </span>
      </li>
      <li class="flex items-start gap-2.5 rounded-[var(--radius-input)] border-l-2 border-l-[var(--color-text-muted)] bg-[var(--color-surface-card)] px-3 py-2">
        <span
          class="grid h-6 w-6 shrink-0 place-items-center rounded bg-[var(--color-surface-low)] text-[var(--color-text-secondary)]"
        >
          <Home :size="12" :stroke-width="2" />
        </span>
        <span class="flex-1 truncate text-[11px] text-[var(--color-text-secondary)]">
          Aset Tetap
        </span>
        <span class="shrink-0 text-right text-[11px] font-semibold tabular-nums break-all text-[var(--color-text-primary)]">
          {{ idr(asetTetap) }}
        </span>
      </li>
      <li class="flex items-start gap-2.5 rounded-[var(--radius-input)] border-l-2 border-l-[var(--color-danger-rose)] bg-[var(--color-surface-card)] px-3 py-2">
        <span
          class="grid h-6 w-6 shrink-0 place-items-center rounded bg-[var(--color-danger-rose-soft)] text-[var(--color-danger-rose)]"
        >
          <CreditCard :size="12" :stroke-width="2" />
        </span>
        <span class="flex-1 truncate text-[11px] text-[var(--color-text-secondary)]">
          Utang
        </span>
        <span class="shrink-0 text-right text-[11px] font-semibold tabular-nums break-all text-[var(--color-danger-rose)]">
          {{ utang > 0 ? '−' : '' }}{{ idr(utang) }}
        </span>
      </li>
    </ul>

    <!-- Net Worth + composition donut -->
    <div
      class="rounded-[var(--radius-card)] bg-[var(--color-surface-card)] p-3 ring-1 ring-[var(--color-border)]"
    >
      <div class="flex items-center gap-3">
        <div class="relative grid h-14 w-14 shrink-0 place-items-center rounded-full shadow-[0_0_12px_rgba(5,150,105,0.15)]" :style="{ background: donutBg }">
          <div class="h-8 w-8 rounded-full bg-[var(--color-surface-card)]" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[10px] font-medium text-[var(--color-text-secondary)]">
            Kekayaan Bersih
          </p>
          <p class="break-all text-sm font-bold tabular-nums text-[var(--color-text-primary)]">
            {{ idr(netWorth) }}
          </p>
        </div>
      </div>
      <div
        v-if="hasComposition"
        class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-[var(--color-text-secondary)]"
      >
        <span class="flex items-center gap-1">
          <span class="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
          Kas {{ kasPct.toFixed(0) }}%
        </span>
        <span class="flex items-center gap-1">
          <span class="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-warning-amber)]" />
          Investasi {{ investasiPct.toFixed(0) }}%
        </span>
        <span class="flex items-center gap-1">
          <span class="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-text-muted)]" />
          Tetap {{ asetTetapPct.toFixed(0) }}%
        </span>
      </div>
    </div>

    <!-- DSR mini bar -->
    <div>
      <div class="flex items-center justify-between text-[10px]">
        <span class="font-medium text-[var(--color-text-secondary)]">Beban Cicilan</span>
        <span class="flex items-center gap-1">
          <span
            v-if="dsrZoneText"
            :class="[
              'rounded-full px-1.5 py-px text-[9px] font-medium',
              dsr === null
                ? ''
                : dsr < 30
                  ? 'bg-[var(--color-accent-emerald-soft)] text-[var(--color-primary)]'
                  : dsr < 40
                    ? 'bg-[var(--color-warning-amber-soft)] text-[var(--color-warning-amber)]'
                    : 'bg-[var(--color-danger-rose-soft)] text-[var(--color-danger-rose)]',
            ]"
          >
            {{ dsrZoneText }}
          </span>
          <span
            v-if="dsr !== null"
            class="font-semibold tabular-nums break-all text-[var(--color-text-primary)]"
          >
            {{ dsr.toFixed(1) }}%
          </span>
          <span v-else class="text-[var(--color-text-muted)]">—</span>
        </span>
      </div>
      <div
        class="mt-1 h-1 overflow-hidden rounded-full bg-[var(--color-surface-low)]"
      >
        <div
          :class="['h-full rounded-full transition-all', dsrZoneClass]"
          :style="{ width: dsrPercent + '%' }"
        />
      </div>
    </div>

    <!-- Privacy footer -->
    <p
      class="flex items-start gap-1 text-[9px] text-[var(--color-text-muted)]"
    >
      <Lock :size="9" :stroke-width="2" class="mt-px shrink-0" />
      <span>Data lokal di browser, tidak dikirim ke server.</span>
    </p>
  </section>
</template>
