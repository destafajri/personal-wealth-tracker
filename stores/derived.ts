import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useSnapshotStore } from '~/stores/snapshot'
import {
  calcAllocationDiscipline,
  calcDar,
  calcDsr,
  calcModalSiap,
  calcNetWorth,
  calcRunway,
  calcSafeHaven,
  calcSavingsRate,
  calcTotalAset,
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
    pengeluaran: snap.pengeluaran,
    asetLikuid: snap.asetLikuid,
    asetNonLikuid: snap.asetNonLikuid,
    emas: snap.emas,
    saham: snap.saham,
    cicilanAktif: snap.cicilanAktif,
    utangPribadi: snap.utangPribadi,
    gadai: snap.gadai,
  }))

  const prices = computed(() => priceView.value ?? undefined)

  const totalAset = computed(() => calcTotalAset(snapshotState.value, prices.value))
  const totalUtang = computed(() => calcTotalUtang(snapshotState.value))
  const netWorth = computed(() => calcNetWorth(snapshotState.value, prices.value))
  const modalSiap = computed(() => calcModalSiap(snapshotState.value, prices.value))
  const dsr = computed(() => calcDsr(snapshotState.value))
  const dar = computed(() => calcDar(snapshotState.value, prices.value))
  const runway = computed(() => calcRunway(snapshotState.value, prices.value))
  const savingsRate = computed(() => calcSavingsRate(snapshotState.value))
  const safeHaven = computed(() => calcSafeHaven(snapshotState.value, prices.value))
  const allocationDiscipline = computed(() =>
    calcAllocationDiscipline(snapshotState.value.saham, prices.value),
  )

  // Per-kategori emas valuation breakdown — surfaced in EmasPanel for transparency.
  const emasBreakdown = computed(() => breakdownGoldIdr(snapshotState.value, prices.value))

  // Day 5 will wire goalHealth. Returning null keeps the dashboard "—" state honest.
  const goalHealth = computed<number | null>(() => null)

  // Convenience: does the snapshot have any meaningful VALUE? Reads numeric inputs
  // directly — a row that exists with amount 0 / piutang 0 / grams 0 counts as still
  // empty. Reading values (not totalAset) means a user who entered grams but is still
  // waiting on price fetch doesn't see "empty" dashboard flicker either.
  const anyAssetAmount = computed(() => {
    const l = snap.asetLikuid
    const n = snap.asetNonLikuid
    const allRows = [
      ...l.kas,
      ...l.deposito,
      ...l.reksaDana,
      ...l.sbn,
      ...l.cryptoManual,
      ...n.properti,
      ...n.kendaraan,
      ...n.pensiun,
    ]
    return allRows.some((r) => (r.amount || 0) > 0)
  })
  const anySahamLot = computed(() => snap.saham.some((s) => (s.lot || 0) > 0))
  const anyEmasGram = computed(() => {
    const e = snap.emas
    return (
      e.digitalGram +
        e.fisikAntamGram +
        e.perhiasan18KGram +
        e.perhiasan14KGram +
        e.perhiasan10KGram >
      0
    )
  })
  const anyDebtValue = computed(
    () =>
      snap.cicilanAktif.some(
        (c) => (c.sisaPokok || 0) > 0 || (c.cicilanPerBulan || 0) > 0,
      ) ||
      snap.utangPribadi.some(
        (u) => (u.sisaPokok || 0) > 0 || (u.cicilanPerBulan || 0) > 0,
      ) ||
      snap.gadai.some(
        (g) => (g.piutangIdr || 0) > 0 || (g.gramTertahan || 0) > 0,
      ),
  )
  const isEmpty = computed(
    () =>
      snap.penghasilan === 0 &&
      snap.pengeluaran.pokok === 0 &&
      snap.pengeluaran.lifestyle === 0 &&
      !anyAssetAmount.value &&
      !anySahamLot.value &&
      !anyEmasGram.value &&
      !anyDebtValue.value,
  )

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
    isEmpty,
  }
})
