import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import {
  emptySnapshot,
  type AssetRow,
  type CicilanRow,
  type CryptoHolding,
  type Currency,
  type GadaiRow,
  type LiquidAssetCategory,
  type NonLiquidAssetCategory,
  type PenghasilanGaji,
  type StockHolding,
  type UtangPribadiRow,
} from '~/lib/types/snapshot'

const rid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

export const useSnapshotStore = defineStore('snapshot', () => {
  const init = emptySnapshot()

  const penghasilan = reactive<PenghasilanGaji>({ ...init.penghasilan })
  const penghasilanLain = ref<AssetRow[]>([...init.penghasilanLain])
  const pengeluaran = reactive({ ...init.pengeluaran })
  const pengeluaranLain = ref<AssetRow[]>([...init.pengeluaranLain])
  const asetLikuid = reactive(init.asetLikuid)
  const asetNonLikuid = reactive(init.asetNonLikuid)
  const emas = reactive({ ...init.emas })
  const saham = ref<StockHolding[]>([])
  const cryptoLive = ref<CryptoHolding[]>([])
  const cicilanAktif = ref<CicilanRow[]>([])
  const utangPribadi = ref<UtangPribadiRow[]>([])
  const gadai = ref<GadaiRow[]>([])
  // Demo session flag — true after applyDemoSnapshot seeds the store, false on reset
  // or fresh init. Persists across route nav (Pinia is global) so banner + "Mulai dari
  // Snapshot" cleanup behave consistently regardless of which page mounts/unmounts.
  const isDemo = ref(false)

  function setDemo(value: boolean) {
    isDemo.value = value
  }

  // ----- mutations: asset rows -----

  function addLikuid(category: LiquidAssetCategory, partial: Partial<AssetRow> = {}): AssetRow {
    const row: AssetRow = {
      id: rid(),
      label: partial.label ?? '',
      amount: partial.amount ?? 0,
      currency: partial.currency,
      // sukuBungaPercent + rdJenis are forwarded so callers (fixtures, future template
      // flows) can seed a row pre-populated. Production UI today calls addLikuid with
      // {} and lets the user type values → updateLikuid (Object.assign), so omitting
      // these previously hid silently — only fixture seeding revealed the gap.
      sukuBungaPercent: partial.sukuBungaPercent,
      rdJenis: partial.rdJenis,
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
      lotsTarget: partial.lotsTarget,
      hargaOverride: partial.hargaOverride,
      lastDividendPerLembar: partial.lastDividendPerLembar,
      avgDividendYieldPercent: partial.avgDividendYieldPercent,
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

  // ----- mutations: crypto (per-row CryptoHolding with mode + canonical coinId) -----

  function addCrypto(partial: Partial<CryptoHolding> = {}): CryptoHolding {
    const row: CryptoHolding = {
      id: rid(),
      coinId: (partial.coinId ?? '').toLowerCase(),
      mode: partial.mode ?? 'unit',
      units: partial.units ?? 0,
      amount: partial.amount ?? 0,
      label: partial.label,
      costBasisPerUnit: partial.costBasisPerUnit,
      costBasisCurrency: partial.costBasisCurrency,
    }
    cryptoLive.value.push(row)
    return row
  }

  function updateCrypto(id: string, patch: Partial<Omit<CryptoHolding, 'id'>>) {
    const idx = cryptoLive.value.findIndex((r) => r.id === id)
    if (idx === -1) return
    const next = { ...cryptoLive.value[idx]!, ...patch }
    // Coin IDs are canonical CoinGecko lowercase slugs (e.g., "bitcoin"); normalize on
    // write so lookups against PricesView.cryptoByCoinId always match.
    if (patch.coinId !== undefined) next.coinId = patch.coinId.toLowerCase()
    cryptoLive.value[idx] = next
  }

  function removeCrypto(id: string) {
    cryptoLive.value = cryptoLive.value.filter((r) => r.id !== id)
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

  function setPenghasilanAmount(value: number) {
    penghasilan.amount = value
  }

  function setPenghasilanCurrency(currency: Currency) {
    penghasilan.currency = currency
  }

  function addPenghasilanLain(partial: Partial<AssetRow> = {}): AssetRow {
    // Reuses AssetRow shape for field overlap (id/label/amount/currency), but
    // sukuBungaPercent + rdJenis are intentionally NOT forwarded — those carry
    // yield/RD-jenis semantics that only apply to deposito/SBN/reksaDana rows,
    // not to income streams (gaji/sewa/freelance). Mirror precedent: addNonLikuid
    // similarly drops `currency` because non-likuid is IDR-only by design.
    const row: AssetRow = {
      id: rid(),
      label: partial.label ?? '',
      amount: partial.amount ?? 0,
      currency: partial.currency,
    }
    penghasilanLain.value.push(row)
    return row
  }

  function updatePenghasilanLain(id: string, patch: Partial<Omit<AssetRow, 'id'>>) {
    const row = penghasilanLain.value.find((r) => r.id === id)
    if (!row) return
    Object.assign(row, patch)
  }

  function removePenghasilanLain(id: string) {
    penghasilanLain.value = penghasilanLain.value.filter((r) => r.id !== id)
  }

  // Pengeluaran tambahan — same shape as penghasilanLain (id/label/amount/currency).
  function addPengeluaranLain(partial: Partial<AssetRow> = {}): AssetRow {
    const row: AssetRow = {
      id: rid(),
      label: partial.label ?? '',
      amount: partial.amount ?? 0,
      currency: partial.currency,
    }
    pengeluaranLain.value.push(row)
    return row
  }

  function updatePengeluaranLain(id: string, patch: Partial<Omit<AssetRow, 'id'>>) {
    const row = pengeluaranLain.value.find((r) => r.id === id)
    if (!row) return
    Object.assign(row, patch)
  }

  function removePengeluaranLain(id: string) {
    pengeluaranLain.value = pengeluaranLain.value.filter((r) => r.id !== id)
  }

  function reset() {
    const fresh = emptySnapshot()
    Object.assign(penghasilan, fresh.penghasilan)
    penghasilanLain.value = [...fresh.penghasilanLain]
    Object.assign(pengeluaran, fresh.pengeluaran)
    pengeluaranLain.value = [...fresh.pengeluaranLain]
    ;(['kas', 'deposito', 'reksaDana', 'sbn'] as const).forEach(
      (k) => (asetLikuid[k] = []),
    )
    ;(['properti', 'kendaraan', 'pensiun'] as const).forEach(
      (k) => (asetNonLikuid[k] = []),
    )
    Object.assign(emas, fresh.emas)
    saham.value = []
    cryptoLive.value = []
    cicilanAktif.value = []
    utangPribadi.value = []
    gadai.value = []
    isDemo.value = false
  }

  return {
    penghasilan,
    penghasilanLain,
    pengeluaran,
    pengeluaranLain,
    asetLikuid,
    asetNonLikuid,
    emas,
    saham,
    // Exposed as `crypto` for consumer ergonomics; internal ref keeps the more explicit
    // `cryptoLive` name (predates the per-row mode refactor — name retained to keep diffs
    // small; the public surface is `snap.crypto`).
    crypto: cryptoLive,
    cicilanAktif,
    utangPribadi,
    gadai,
    isDemo,
    setDemo,
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
    addCrypto,
    updateCrypto,
    removeCrypto,
    addGadai,
    updateGadai,
    removeGadai,
    setEmas,
    setPengeluaran,
    setPenghasilanAmount,
    setPenghasilanCurrency,
    addPenghasilanLain,
    updatePenghasilanLain,
    removePenghasilanLain,
    addPengeluaranLain,
    updatePengeluaranLain,
    removePengeluaranLain,
    reset,
  }
})
