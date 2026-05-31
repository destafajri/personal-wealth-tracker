import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useSnapshotStore } from '~/stores/snapshot'
import {
  calcAllocationDiscipline,
  calcAssetBreakdown,
  calcDar,
  calcDsr,
  calcModalSiap,
  calcNetWorth,
  calcRunway,
  calcSafeHaven,
  calcSavingsRate,
  calcTotalAset,
  calcTotalDividendAnnual,
  calcTotalUtang,
} from '~/lib/finance/metrics'
import { breakdownGoldIdr } from '~/lib/finance/emas'
import type { PricesView, SnapshotState } from '~/lib/types/snapshot'

// Derived store = single source of dashboard truth. NEVER mutated by components.
// Wires snapshot store + an injected PricesView (set by the layout/dashboard component
// from usePrices composables) through pure metric functions.
//
// Why no internal price fetching: pinia stores are global singletons created lazily;
// fetching here couples reactivity to Nuxt-instance-bound composables. Cleaner to keep
// the store pure and let the layout pipe prices in via setPrices().

export const useDerivedStore = defineStore('derived', () => {
  const snap = useSnapshotStore()
  const priceView = ref<PricesView | null>(null)

  function setPrices(next: PricesView | null) {
    priceView.value = next
  }

  // Snapshot state as a plain object (Pinia's reactive proxies are fine; metric functions
  // only read). Computed below re-runs when any snapshot field or priceView changes.
  const snapshotState = computed<SnapshotState>(() => ({
    penghasilan: snap.penghasilan,
    penghasilanLain: snap.penghasilanLain,
    pengeluaran: snap.pengeluaran,
    asetLikuid: snap.asetLikuid,
    asetNonLikuid: snap.asetNonLikuid,
    emas: snap.emas,
    saham: snap.saham,
    crypto: snap.crypto,
    cicilanAktif: snap.cicilanAktif,
    utangPribadi: snap.utangPribadi,
    gadai: snap.gadai,
  }))

  const prices = computed(() => priceView.value ?? undefined)

  const totalAset = computed(() => calcTotalAset(snapshotState.value, prices.value))
  const totalUtang = computed(() => calcTotalUtang(snapshotState.value))
  const netWorth = computed(() => calcNetWorth(snapshotState.value, prices.value))
  const modalSiap = computed(() => calcModalSiap(snapshotState.value, prices.value))
  const dsr = computed(() => calcDsr(snapshotState.value, prices.value))
  const dar = computed(() => calcDar(snapshotState.value, prices.value))
  const runway = computed(() => calcRunway(snapshotState.value, prices.value))
  const savingsRate = computed(() =>
    calcSavingsRate(snapshotState.value, prices.value),
  )
  const safeHaven = computed(() => calcSafeHaven(snapshotState.value, prices.value))
  const allocationDiscipline = computed(() =>
    calcAllocationDiscipline(snapshotState.value.saham, prices.value),
  )

  // Per-kategori emas valuation breakdown — surfaced in EmasPanel for transparency.
  const emasBreakdown = computed(() => breakdownGoldIdr(snapshotState.value, prices.value))

  // Safe vs growth split — feeds the SafeHavenBar chart on the dashboard. Same numbers
  // that drive calcSafeHaven, exposed in absolute Rp so the chart can render slice widths.
  const assetBreakdown = computed(() =>
    calcAssetBreakdown(snapshotState.value, prices.value),
  )

  // Saham dividend totals — annual (per Stitch design + per-row "Rp X/tahun" copy) and
  // monthly avg (annual / 12), surfaced in PenghasilanForm as an auto-derived ESTIMASI
  // line. Same Rp that gets folded into DSR/SavingsRate via totalPenghasilanMonthly.
  const dividendAnnual = computed(() =>
    calcTotalDividendAnnual(snapshotState.value.saham, prices.value),
  )
  const dividendMonthly = computed(() => dividendAnnual.value / 12)

  // Day 5 will wire goalHealth. Returning null keeps the dashboard "—" state honest.
  const goalHealth = computed<number | null>(() => null)

  // No `isEmpty` gate here. The Screen-10 all-empty visual is handled in DashboardPanel
  // by always rendering HeroPair + MetricGrid; each MetricCard renders "—" + hint when
  // its underlying value is null (per-metric rule, D0.5). TopNav.downloadDisabled
  // separately gates on totalAset === 0 — that's the right "is there anything to
  // export?" check.

  return {
    setPrices,
    priceView,
    totalAset,
    totalUtang,
    netWorth,
    modalSiap,
    dsr,
    dar,
    runway,
    savingsRate,
    safeHaven,
    allocationDiscipline,
    goalHealth,
    emasBreakdown,
    assetBreakdown,
    dividendAnnual,
    dividendMonthly,
  }
})
