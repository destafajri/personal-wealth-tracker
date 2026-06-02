import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useSnapshotStore } from '~/stores/snapshot'
import { FI_MULTIPLIER, useGoalsStore } from '~/stores/goals'
import {
  calcAllocationDiscipline,
  calcAssetBreakdown,
  calcBungaDepositoMonthly,
  calcBungaSbnMonthly,
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
  totalPenghasilanMonthly,
  type ModalSiapIncludes,
} from '~/lib/finance/metrics'
import { calcGoalHealth, goalProgress, surplus } from '~/lib/finance/goals'
import { breakdownGoldIdr } from '~/lib/finance/emas'
import { runModalOptions } from '~/lib/finance/wizards/modal-options'
import type { Goal } from '~/lib/types/goals'
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
  const goalsStore = useGoalsStore()
  const priceView = ref<PricesView | null>(null)

  function setPrices(next: PricesView | null) {
    priceView.value = next
  }

  // Day 9 — user-configurable Modal Siap includes. Default = baseline PRD §11.4 (kas /
  // deposito / RD / crypto only). Toggle ON pulls saham / emas / sbn into the headline
  // at full live valuation; HeroPair shows inline disclaimer about spread/bea jual.
  // Ephemeral (resets on refresh) — no localStorage layer in this app per architecture.
  const modalSiapIncludes = ref<ModalSiapIncludes>({
    saham: false,
    emas: false,
    sbn: false,
  })

  function toggleModalSiapInclude(category: keyof ModalSiapIncludes) {
    modalSiapIncludes.value = {
      ...modalSiapIncludes.value,
      [category]: !modalSiapIncludes.value[category],
    }
  }

  function setModalSiapInclude(
    category: keyof ModalSiapIncludes,
    value: boolean,
  ) {
    modalSiapIncludes.value = { ...modalSiapIncludes.value, [category]: value }
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
  const modalSiap = computed(() =>
    calcModalSiap(snapshotState.value, prices.value, modalSiapIncludes.value),
  )
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

  // Bunga sbn + deposito — auto-derived monthly income that flows into PenghasilanForm
  // as an ESTIMASI line (mirrors the dividen pattern). Annual figure shown alongside
  // so per-row "%/tahun" math reconciles visually.
  const bungaSbnMonthly = computed(() =>
    calcBungaSbnMonthly(snapshotState.value, prices.value),
  )
  const bungaSbnAnnual = computed(() => bungaSbnMonthly.value * 12)
  const bungaDepositoMonthly = computed(() =>
    calcBungaDepositoMonthly(snapshotState.value, prices.value),
  )
  const bungaDepositoAnnual = computed(() => bungaDepositoMonthly.value * 12)

  // FX-aware total monthly income (gaji + lain + dividen + bunga sbn + bunga deposito,
  // all in IDR). Single source of truth for "income vs burn" UI checks like the cicilan
  // overflow warning — keeps panels from comparing against `snap.penghasilan.amount`
  // raw (which is in source currency and excludes lain/dividen/bunga).
  const penghasilanMonthlyIdr = computed(() =>
    totalPenghasilanMonthly(snapshotState.value, prices.value),
  )

  // Surplus = penghasilan − pengeluaran (IDR/bulan). Public so Goals page can show the
  // user the same surplus number that drives `defaultAllocation` for projections.
  const surplusIdr = computed(() => surplus(snapshotState.value, prices.value))

  // Goal Health = share of active goals with status 'on' (percent). null when 0 goals.
  // Per Codex round-4 + PRD §5.4: chip beside Goals panel, NOT a 7th MetricGrid card.
  const goalHealth = computed<number | null>(() =>
    calcGoalHealth(goalsStore.goals, snapshotState.value, {
      fiMultiplier: FI_MULTIPLIER,
      annualReturnReal: goalsStore.assumedAnnualReturnReal,
      prices: prices.value,
    }),
  )

  // Per-goal progress factory. Reads reactive snapshot + goalsStore.assumedAnnualReturnReal
  // so cards/chips can wrap this in a `computed` and stay reactive. NOT a computed map
  // because the caller (per-card) usually only needs one entry — avoids recomputing all
  // goals when one card re-renders.
  function progressFor(goal: Goal) {
    return goalProgress(goal, snapshotState.value, {
      fiMultiplier: FI_MULTIPLIER,
      annualReturnReal: goalsStore.assumedAnnualReturnReal,
      activeGoalsCount: goalsStore.activeGoalsCount,
      prices: prices.value,
    })
  }

  // Modal Likuid Options (Day 9). Auto-generated deployable Option[] from Modal Siap.
  // Recomputes when any snapshot field, goal, or price changes — derived from the same
  // snapshotState computed everything else reads. NO ranking; canonical order baked into
  // the pure fn (debt-reduction → asset-acquisition → FI bucket).
  const modalOptions = computed(() =>
    runModalOptions(snapshotState.value, goalsStore.goals, {
      fiMultiplier: FI_MULTIPLIER,
      assumedAnnualReturnReal: goalsStore.assumedAnnualReturnReal,
      prices: prices.value,
      includes: modalSiapIncludes.value,
    }),
  )

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
    surplusIdr,
    progressFor,
    emasBreakdown,
    assetBreakdown,
    dividendAnnual,
    dividendMonthly,
    bungaSbnMonthly,
    bungaSbnAnnual,
    bungaDepositoMonthly,
    bungaDepositoAnnual,
    penghasilanMonthlyIdr,
    modalOptions,
    modalSiapIncludes,
    toggleModalSiapInclude,
    setModalSiapInclude,
  }
})
