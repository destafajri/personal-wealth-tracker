import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import {
  emptySnapshot,
  type AssetRow,
  type CicilanRow,
  type GadaiRow,
  type LiquidAssetCategory,
  type NonLiquidAssetCategory,
  type StockHolding,
  type UtangPribadiRow,
} from '~/lib/types/snapshot'

const rid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

export const useSnapshotStore = defineStore('snapshot', () => {
  const init = emptySnapshot()

  const penghasilan = ref<number>(init.penghasilan)
  const pengeluaran = reactive({ ...init.pengeluaran })
  const asetLikuid = reactive(init.asetLikuid)
  const asetNonLikuid = reactive(init.asetNonLikuid)
  const emas = reactive({ ...init.emas })
  const saham = ref<StockHolding[]>([])
  const cicilanAktif = ref<CicilanRow[]>([])
  const utangPribadi = ref<UtangPribadiRow[]>([])
  const gadai = ref<GadaiRow[]>([])

  // ----- mutations: asset rows -----

  function addLikuid(category: LiquidAssetCategory, partial: Partial<AssetRow> = {}): AssetRow {
    const row: AssetRow = {
      id: rid(),
      label: partial.label ?? '',
      amount: partial.amount ?? 0,
      currency: partial.currency,
    }
    asetLikuid[category].push(row)
    return row
  }

  function updateLikuid(
    category: LiquidAssetCategory,
    id: string,
    patch: Partial<Omit<AssetRow, 'id'>>,
  ) {
    const row = asetLikuid[category].find((r) => r.id === id)
    if (!row) return
    Object.assign(row, patch)
  }

  function removeLikuid(category: LiquidAssetCategory, id: string) {
    asetLikuid[category] = asetLikuid[category].filter((r) => r.id !== id)
  }

  function addNonLikuid(
    category: NonLiquidAssetCategory,
    partial: Partial<AssetRow> = {},
  ): AssetRow {
    const row: AssetRow = {
      id: rid(),
      label: partial.label ?? '',
      amount: partial.amount ?? 0,
      // Non-likuid stays IDR-only; ignore any incoming currency.
    }
    asetNonLikuid[category].push(row)
    return row
  }

  function updateNonLikuid(
    category: NonLiquidAssetCategory,
    id: string,
    patch: Partial<Omit<AssetRow, 'id'>>,
  ) {
    const row = asetNonLikuid[category].find((r) => r.id === id)
    if (!row) return
    Object.assign(row, patch)
  }

  function removeNonLikuid(category: NonLiquidAssetCategory, id: string) {
    asetNonLikuid[category] = asetNonLikuid[category].filter((r) => r.id !== id)
  }

  // ----- mutations: cicilan -----

  function addCicilan(partial: Partial<CicilanRow> = {}): CicilanRow {
    const row: CicilanRow = {
      id: rid(),
      tipe: partial.tipe ?? 'LAIN',
      label: partial.label ?? '',
      sisaPokok: partial.sisaPokok ?? 0,
      cicilanPerBulan: partial.cicilanPerBulan ?? 0,
      sukuBunga: partial.sukuBunga,
      tenorSisaBulan: partial.tenorSisaBulan,
      jenisBunga: partial.jenisBunga ?? 'Anuitas',
      tanggalJatuhTempo: partial.tanggalJatuhTempo,
    }
    cicilanAktif.value.push(row)
    return row
  }

  function updateCicilan(id: string, patch: Partial<Omit<CicilanRow, 'id'>>) {
    const idx = cicilanAktif.value.findIndex((r) => r.id === id)
    if (idx === -1) return
    cicilanAktif.value[idx] = { ...cicilanAktif.value[idx]!, ...patch }
  }

  function removeCicilan(id: string) {
    cicilanAktif.value = cicilanAktif.value.filter((r) => r.id !== id)
  }

  // ----- mutations: utang pribadi (informal debt) -----

  function addUtangPribadi(partial: Partial<UtangPribadiRow> = {}): UtangPribadiRow {
    const row: UtangPribadiRow = {
      id: rid(),
      label: partial.label ?? '',
      sisaPokok: partial.sisaPokok ?? 0,
      cicilanPerBulan: partial.cicilanPerBulan,
      tempoBulan: partial.tempoBulan,
      tanggalJatuhTempo: partial.tanggalJatuhTempo,
    }
    utangPribadi.value.push(row)
    return row
  }

  function updateUtangPribadi(id: string, patch: Partial<Omit<UtangPribadiRow, 'id'>>) {
    const idx = utangPribadi.value.findIndex((r) => r.id === id)
    if (idx === -1) return
    utangPribadi.value[idx] = { ...utangPribadi.value[idx]!, ...patch }
  }

  function removeUtangPribadi(id: string) {
    utangPribadi.value = utangPribadi.value.filter((r) => r.id !== id)
  }

  // ----- mutations: saham (minimal — full edit UI ships in Day 4) -----

  function addSaham(partial: Partial<StockHolding> = {}): StockHolding {
    const row: StockHolding = {
      id: rid(),
      ticker: partial.ticker ?? '',
      lot: partial.lot ?? 0,
      hargaRataRata: partial.hargaRataRata ?? 0,
      bobotTargetPercent: partial.bobotTargetPercent,
    }
    saham.value.push(row)
    return row
  }

  function updateSaham(id: string, patch: Partial<Omit<StockHolding, 'id'>>) {
    const idx = saham.value.findIndex((r) => r.id === id)
    if (idx === -1) return
    saham.value[idx] = { ...saham.value[idx]!, ...patch }
  }

  function removeSaham(id: string) {
    saham.value = saham.value.filter((r) => r.id !== id)
  }

  // ----- mutations: gadai -----

  function addGadai(partial: Partial<GadaiRow> = {}): GadaiRow {
    const jaminan = partial.jaminan ?? 'emas:fisikAntam'
    const isEmas = jaminan.startsWith('emas:')
    const row: GadaiRow = {
      id: rid(),
      label: partial.label ?? '',
      jaminan,
      gramTertahan: isEmas ? (partial.gramTertahan ?? 0) : undefined,
      asetRefId: !isEmas ? partial.asetRefId : undefined,
      piutangIdr: partial.piutangIdr ?? 0,
      bungaPerBulanPercent: partial.bungaPerBulanPercent ?? 1.5,
      tempoBulan: partial.tempoBulan ?? 4,
      tanggalJatuhTempo: partial.tanggalJatuhTempo,
    }
    gadai.value.push(row)
    return row
  }

  function updateGadai(id: string, patch: Partial<Omit<GadaiRow, 'id'>>) {
    const idx = gadai.value.findIndex((r) => r.id === id)
    if (idx === -1) return
    const next = { ...gadai.value[idx]!, ...patch }
    // Keep field shape coherent with the chosen jaminan kind.
    if (patch.jaminan !== undefined) {
      const isEmas = next.jaminan.startsWith('emas:')
      if (isEmas) {
        next.gramTertahan = next.gramTertahan ?? 0
        next.asetRefId = undefined
      } else {
        next.gramTertahan = undefined
        next.asetRefId = next.asetRefId ?? undefined
      }
    }
    gadai.value[idx] = next
  }

  function removeGadai(id: string) {
    gadai.value = gadai.value.filter((r) => r.id !== id)
  }

  // ----- mutations: emas / scalars -----

  function setEmas(patch: Partial<typeof emas>) {
    Object.assign(emas, patch)
  }

  function setPengeluaran(patch: Partial<typeof pengeluaran>) {
    Object.assign(pengeluaran, patch)
  }

  function setPenghasilan(value: number) {
    penghasilan.value = value
  }

  function reset() {
    const fresh = emptySnapshot()
    penghasilan.value = fresh.penghasilan
    Object.assign(pengeluaran, fresh.pengeluaran)
    ;(['kas', 'deposito', 'reksaDana', 'sbn', 'cryptoManual'] as const).forEach(
      (k) => (asetLikuid[k] = []),
    )
    ;(['properti', 'kendaraan', 'pensiun'] as const).forEach(
      (k) => (asetNonLikuid[k] = []),
    )
    Object.assign(emas, fresh.emas)
    saham.value = []
    cicilanAktif.value = []
    utangPribadi.value = []
    gadai.value = []
  }

  return {
    penghasilan,
    pengeluaran,
    asetLikuid,
    asetNonLikuid,
    emas,
    saham,
    cicilanAktif,
    utangPribadi,
    gadai,
    addLikuid,
    updateLikuid,
    removeLikuid,
    addNonLikuid,
    updateNonLikuid,
    removeNonLikuid,
    addCicilan,
    updateCicilan,
    removeCicilan,
    addUtangPribadi,
    updateUtangPribadi,
    removeUtangPribadi,
    addSaham,
    updateSaham,
    removeSaham,
    addGadai,
    updateGadai,
    removeGadai,
    setEmas,
    setPengeluaran,
    setPenghasilan,
    reset,
  }
})
