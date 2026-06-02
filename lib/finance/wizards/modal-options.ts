// "Modal Likuid Options" — auto-generated deployable options from Modal Siap Distribusi.
// Pure fn returns Option[] each carrying a descriptive impact preview + handoff intent.
//
// NO ranking (PRD §5.2.7 + OJK §11.1). Canonical order: debt-reduction → asset-acquisition
// → FI bucket. Within each category, no rate sort — debt rows follow jatuh_tempo asc /
// insertion order (same convention as Lunasi wizard); saham follows largest-gap-first
// (descriptive: "which emiten lags the lotsTarget by most lot"); FI options always RD →
// Deposito (alphabetic, not preferred-first).
//
// Day 9 lock (post-iteration): EVERY [Hitung] click opens a preview-only wizard. NEVER
// mutates the real snapshot. Two wizard kinds:
//   - 'lunasi'        → existing WizardLunasi pre-filled (debt actions; user can adjust
//                        mode/amount before [Hitung] inside the wizard)
//   - 'deploy-preview' → new WizardDeployPreview that runs an internal waterfall debit
//                        (kas→deposito→RD→crypto, FX-aware) + asset add against a cloned
//                        snapshot, renders Sebelum/Sesudah delta + Goal impact, NO Apply
//                        button. User decides next steps manually in Snapshot panel.
//
// The previous apply-direct path was dropped after user feedback "lebih baik popup tanpa
// gangu data snapshot" — wizard purity invariant now uniform across all 6 wizards + the
// 7th Modal Options handoff.
//
// `conflictsWith` flags the ModalSiap-include category whose toggle should auto-off
// before the wizard opens (e.g., beli-saham conflicts with saham toggle — including
// saham in Modal Siap while deploying TO saham double-counts the same rupiah).
//
// Per OJK copy guard (PRD §9): NO advisory verbs ("sebaiknya", "rekomendasi"). Headers
// use "Opsi yang Bisa Dihitungkan" — never "Rekomendasi" or "Pilihan terbaik".

import {
  calcAllocationDiscipline,
  calcDsr,
  calcModalSiap,
  effectiveStockPrice,
  type ModalSiapIncludes,
} from '~/lib/finance/metrics'
import { goalProgress } from '~/lib/finance/goals'
import { idr } from '~/lib/format/idr'
import { percent, pp } from '~/lib/format/percent'
import { t } from '~/lib/copy/strings'
import { cloneSnapshot } from '~/lib/finance/wizards/_shared'
import { deployablePool } from '~/lib/finance/wizards/deploy-preview'
import type { Goal } from '~/lib/types/goals'
import type {
  CicilanRow,
  PricesView,
  SnapshotState,
  StockHolding,
} from '~/lib/types/snapshot'
import type { LunasiInput } from '~/lib/finance/wizards/lunasi-utang'

// ----- types -----

export type ModalOptionKind =
  | 'lunasi-cicilan'
  | 'prepay-cicilan'
  | 'lunasi-utangPribadi'
  | 'lunasi-gadai'
  | 'beli-saham'
  | 'tambah-reksaDana'
  | 'tambah-deposito'
  | 'tambah-sbn'
  | 'tambah-emas'

// DeployAction lives in deploy-preview.ts to break the circular dep (deploy-preview
// imports deployablePool, modal-options needs the action shape). Re-exported here so
// existing call sites keep working.
import type { DeployAction } from '~/lib/finance/wizards/deploy-preview'
export type { DeployAction }

// Re-export ModalSiapIncludes type so wizards that import this module can read it
// without a separate import from metrics.
export type { ModalSiapIncludes } from '~/lib/finance/metrics'

export interface DeployPrefill {
  action: DeployAction
  // Echo the snapshot Modal Siap headline for the wizard's "Sumber" line.
  modalSiapHeadline: number
  // Toggle state at the time the option was generated — passed through so the wizard's
  // internal drain pipeline knows which toggled-in classes are drainable.
  includes: ModalSiapIncludes
}

export type ModalOptionHandoff =
  | { kind: 'wizard'; wizardKey: 'lunasi'; prefill: LunasiInput }
  | { kind: 'wizard'; wizardKey: 'deploy-preview'; prefill: DeployPrefill }

export interface ModalOption {
  id: string // stable v-for key
  kind: ModalOptionKind
  label: string // headline — "Lunasi Kartu Kredit (Rp 8jt)"
  impactPreview: string // descriptive — "DSR 33% → 31%; sisa modal Rp 44jt"
  amount: number // IDR deployed by this option (already capped to deployable pool)
  handoff: ModalOptionHandoff
}

export interface ModalOptionsResult {
  modalSiapIdr: number
  options: ModalOption[]
  // Footer note about keeping emergency fund separate. Localized string surfaced here
  // so consumers don't need to know the copy key.
  emergencyFundNote: string
}

// ----- cicilan options (lunasi or prepay) -----

// For each cicilan row, emit either a "lunasi penuh" or "prepay" option (not both).
// Sort = insertion order, no rate ranking. modalSiap caps the payment.
function cicilanOptions(
  snap: SnapshotState,
  prices: PricesView | undefined,
  modalSiap: number,
): ModalOption[] {
  if (modalSiap <= 0) return []
  const out: ModalOption[] = []
  for (const c of snap.cicilanAktif) {
    if (c.sisaPokok <= 0) continue
    // Full lunas when modal covers sisaPokok.
    if (modalSiap >= c.sisaPokok) {
      out.push(makeLunasiOption(snap, prices, c, c.sisaPokok, modalSiap, 'lunasi-cicilan'))
      continue
    }
    // Otherwise prepay (use full modal, mode 'tenor' for amortizing — tenor mundur is
    // the more legible UX vs cicilan-down). Skip non-amortizing prepay since impact
    // is just "sisa pokok turun" not "tenor mundur".
    const isAmortizing = c.jenisBunga === 'Anuitas' || c.jenisBunga === 'Flat'
    if (!isAmortizing) continue
    out.push(makeLunasiOption(snap, prices, c, modalSiap, modalSiap, 'prepay-cicilan'))
  }
  return out
}

function makeLunasiOption(
  snap: SnapshotState,
  prices: PricesView | undefined,
  row: CicilanRow,
  paymentIdr: number,
  modalSiap: number,
  kind: 'lunasi-cicilan' | 'prepay-cicilan',
): ModalOption {
  const dsrBefore = calcDsr(snap, prices)
  // Quick scenario: clone + apply targeted payment for DSR readout. We don't go through
  // runLunasiUtang to keep this lightweight (no goalImpact needed for preview).
  const scn = cloneSnapshot(snap)
  const idx = scn.cicilanAktif.findIndex((c) => c.id === row.id)
  if (idx !== -1) {
    const target = scn.cicilanAktif[idx]!
    const newSisa = Math.max(0, target.sisaPokok - paymentIdr)
    if (newSisa === 0) {
      scn.cicilanAktif.splice(idx, 1)
    } else {
      // Prepay path — for legibility model as 'tenor' mode (cicilan unchanged, tenor
      // shortens). We don't recompute tenor in this preview; the user opens Lunasi
      // wizard for the precise figure. cicilanPerBulan stays — so DSR doesn't change
      // until full lunas. That's intentional: prepay impact preview surfaces "tenor
      // mundur" framing through the label, not via DSR delta.
      target.sisaPokok = newSisa
    }
  }
  const dsrAfter = calcDsr(scn, prices)
  const modalAfter = modalSiap - paymentIdr

  const prefill: LunasiInput = {
    source: 'cicilan',
    id: row.id,
    paymentIdr,
    modeAnuitas: kind === 'prepay-cicilan' ? 'tenor' : 'cicilan',
  }

  const labelKey =
    kind === 'lunasi-cicilan' ? 'modal.option.lunasiCicilan.label' : 'modal.option.prepayCicilan.label'
  const previewKey =
    kind === 'lunasi-cicilan'
      ? 'modal.option.lunasiCicilan.preview'
      : 'modal.option.prepayCicilan.preview'

  return {
    id: `${kind}:${row.id}`,
    kind,
    label: t(labelKey, {
      label: row.label || row.tipe,
      amount: idr(paymentIdr),
    }),
    impactPreview: t(previewKey, {
      dsrBefore: percent(dsrBefore, 1),
      dsrAfter: percent(dsrAfter, 1),
      dsrDelta:
        dsrBefore === null || dsrAfter === null ? '—' : pp(dsrAfter - dsrBefore, 1),
      modalSisa: idr(Math.max(0, modalAfter)),
    }),
    amount: paymentIdr,
    handoff: { kind: 'wizard', wizardKey: 'lunasi', prefill },
  }
}

// ----- utang pribadi + gadai options -----

function utangPribadiOptions(
  snap: SnapshotState,
  prices: PricesView | undefined,
  modalSiap: number,
): ModalOption[] {
  if (modalSiap <= 0) return []
  const out: ModalOption[] = []
  for (const u of snap.utangPribadi) {
    if (u.sisaPokok <= 0) continue
    if (modalSiap < u.sisaPokok) continue // skip partial — utang pribadi has no tenor framing
    const dsrBefore = calcDsr(snap, prices)
    const scn = cloneSnapshot(snap)
    const idx = scn.utangPribadi.findIndex((x) => x.id === u.id)
    if (idx !== -1) scn.utangPribadi.splice(idx, 1)
    const dsrAfter = calcDsr(scn, prices)
    const modalAfter = modalSiap - u.sisaPokok
    const prefill: LunasiInput = {
      source: 'utangPribadi',
      id: u.id,
      paymentIdr: u.sisaPokok,
    }
    out.push({
      id: `lunasi-utangPribadi:${u.id}`,
      kind: 'lunasi-utangPribadi',
      label: t('modal.option.lunasiUtangPribadi.label', {
        label: u.label || 'Utang pribadi',
        amount: idr(u.sisaPokok),
      }),
      impactPreview: t('modal.option.lunasiUtangPribadi.preview', {
        dsrBefore: percent(dsrBefore, 1),
        dsrAfter: percent(dsrAfter, 1),
        modalSisa: idr(Math.max(0, modalAfter)),
      }),
      amount: u.sisaPokok,
      handoff: { kind: 'wizard', wizardKey: 'lunasi', prefill },
    })
  }
  return out
}

function gadaiOptions(
  snap: SnapshotState,
  _prices: PricesView | undefined,
  modalSiap: number,
): ModalOption[] {
  if (modalSiap <= 0) return []
  const out: ModalOption[] = []
  for (const g of snap.gadai) {
    if (g.piutangIdr <= 0) continue
    if (modalSiap < g.piutangIdr) continue
    const modalAfter = modalSiap - g.piutangIdr
    const prefill: LunasiInput = {
      source: 'gadai',
      id: g.id,
      paymentIdr: g.piutangIdr,
    }
    out.push({
      id: `lunasi-gadai:${g.id}`,
      kind: 'lunasi-gadai',
      label: t('modal.option.lunasiGadai.label', {
        label: g.label || 'Gadai',
        amount: idr(g.piutangIdr),
      }),
      impactPreview: t('modal.option.lunasiGadai.preview', {
        modalSisa: idr(Math.max(0, modalAfter)),
      }),
      amount: g.piutangIdr,
      handoff: { kind: 'wizard', wizardKey: 'lunasi', prefill },
    })
  }
  return out
}

// ----- saham options (one per emiten with target gap) -----

// Emit one option per emiten that has (a) lotsTarget > 0 + (b) gap = lotsTarget − lot
// > 0 + (c) live/override price > 0 + (d) deployable pool covers at least 1 lot. Each
// option's deployable pool = full Modal Siap (with includes) MINUS THIS emiten's own
// current value (so the option doesn't pretend to "buy BBRI by selling BBRI"). User
// picks one to preview per [Hitung]; deploying to multiple = multiple clicks.
//
// Sort by gap desc (largest-gap-first, descriptive — NOT advice).
function sahamOptions(
  snap: SnapshotState,
  prices: PricesView | undefined,
  includes: ModalSiapIncludes,
): ModalOption[] {
  if (snap.saham.length === 0) return []

  // First pass: enumerate eligible emitens with their gap + price.
  const eligible: Array<{ stock: StockHolding; gap: number; price: number }> = []
  for (const s of snap.saham) {
    if (s.lotsTarget === undefined || s.lotsTarget <= 0) continue
    const gap = s.lotsTarget - s.lot
    if (gap <= 0) continue
    const price = effectiveStockPrice(s, prices?.idxByTicker[s.ticker] ?? null)
    if (price <= 0) continue
    eligible.push({ stock: s, gap, price })
  }
  if (eligible.length === 0) return []

  eligible.sort((a, b) => b.gap - a.gap)
  const disciplineBefore = calcAllocationDiscipline(snap.saham, prices)

  const out: ModalOption[] = []
  for (const e of eligible) {
    const costPerLot = e.price * 100
    // Cap by deployable pool for THIS emiten — excludes the emiten's own current value
    // so the option doesn't propose buying X by selling X.
    const deployable = deployablePool(snap, prices, includes, {
      kind: 'saham',
      stockId: e.stock.id,
    })
    if (deployable <= 0) continue
    const maxAffordableLots = Math.floor(deployable / costPerLot)
    if (maxAffordableLots <= 0) continue
    const lotsToBuy = Math.min(e.gap, maxAffordableLots)
    const costIdr = lotsToBuy * costPerLot

    const scn = cloneSnapshot(snap)
    const idx = scn.saham.findIndex((x) => x.id === e.stock.id)
    if (idx !== -1) scn.saham[idx]!.lot += lotsToBuy
    const disciplineAfter = calcAllocationDiscipline(scn.saham, prices)

    const target = e.stock.lotsTarget!
    const progressBefore = target > 0 ? (e.stock.lot / target) * 100 : null
    const progressAfter = target > 0 ? ((e.stock.lot + lotsToBuy) / target) * 100 : null

    out.push({
      id: `beli-saham:${e.stock.id}`,
      kind: 'beli-saham',
      label: t('modal.option.beliSaham.label', {
        ticker: e.stock.ticker,
        lots: lotsToBuy,
        amount: idr(costIdr),
      }),
      impactPreview: t('modal.option.beliSaham.preview', {
        progressBefore: percent(progressBefore, 0),
        progressAfter: percent(progressAfter, 0),
        drift: disciplineAfter !== null ? `${disciplineAfter.toFixed(1)} pp` : '—',
        driftBefore:
          disciplineBefore !== null ? `${disciplineBefore.toFixed(1)} pp` : '—',
      }),
      amount: costIdr,
      handoff: {
        kind: 'wizard',
        wizardKey: 'deploy-preview',
        prefill: {
          action: {
            kind: 'addStockLots',
            stockId: e.stock.id,
            stockTicker: e.stock.ticker,
            lotsToAdd: lotsToBuy,
            costIdr,
          },
          modalSiapHeadline: calcModalSiap(snap, prices, includes),
          includes,
        },
      },
    })
  }
  return out
}

// ----- asset acquisition options (tambah RD / Deposito / SBN / Emas) -----

// Each option's amount caps at deployablePool(snap, prices, includes, destination)
// so distribusi math stays zero-sum (Net Worth invariant). For RD/Deposito + SBN +
// emas, the "destination" overlap subtracts from Modal Siap so the option's amount
// = what can ACTUALLY be moved into that bucket from other sources.
//
// FI bucket framing — when an FI goal exists, the preview line surfaces months-shift.
// Otherwise falls back to no-goal preview copy. Goal-shift math runs against a clone
// with the new row pushed in (preview only — never mutates real snap).
function assetAcquisitionOptions(
  snap: SnapshotState,
  goals: Goal[],
  prices: PricesView | undefined,
  includes: ModalSiapIncludes,
  opts: {
    fiMultiplier: number
    assumedAnnualReturnReal: number
    today?: Date
  },
): ModalOption[] {
  const out: ModalOption[] = []
  const fiGoal = goals.find((g) => g.kind === 'FI')
  const deployRowLabel = t('modal.option.deployLabel')

  // Generic "tambah-likuid" builder (RD / Deposito / SBN — all AssetRow[] destinations).
  function buildLiquidBucket(
    category: 'reksaDana' | 'deposito' | 'sbn',
    kind: 'tambah-reksaDana' | 'tambah-deposito' | 'tambah-sbn',
    labelKey:
      | 'modal.option.tambahReksaDana.label'
      | 'modal.option.tambahDeposito.label'
      | 'modal.option.tambahSbn.label',
    previewKey:
      | 'modal.option.tambahReksaDana.preview'
      | 'modal.option.tambahDeposito.preview'
      | 'modal.option.tambahSbn.preview',
    previewNoGoalKey:
      | 'modal.option.tambahReksaDana.previewNoGoal'
      | 'modal.option.tambahDeposito.previewNoGoal'
      | 'modal.option.tambahSbn.previewNoGoal',
  ): ModalOption | null {
    const deployable = deployablePool(snap, prices, includes, {
      kind: 'liquidCategory',
      category,
    })
    if (deployable <= 0) return null

    let preview = t(previewNoGoalKey, { amount: idr(deployable) })
    if (fiGoal) {
      const before = goalProgress(fiGoal, snap, {
        fiMultiplier: opts.fiMultiplier,
        annualReturnReal: opts.assumedAnnualReturnReal,
        activeGoalsCount: goals.length,
        today: opts.today,
        prices,
      })
      const scn = cloneSnapshot(snap)
      scn.asetLikuid[category].push({
        id: 'preview-only',
        label: deployRowLabel,
        amount: deployable,
        currency: 'IDR',
      })
      const after = goalProgress(fiGoal, scn, {
        fiMultiplier: opts.fiMultiplier,
        annualReturnReal: opts.assumedAnnualReturnReal,
        activeGoalsCount: goals.length,
        today: opts.today,
        prices,
      })
      const bFin = Number.isFinite(before.projection.months)
      const aFin = Number.isFinite(after.projection.months)
      if (bFin && aFin) {
        const shift = before.projection.months - after.projection.months
        const months = Math.abs(shift)
        const fmt =
          months >= 12 ? `${(months / 12).toFixed(1)} tahun` : `${Math.round(months)} bulan`
        preview =
          shift > 0
            ? t(previewKey, { amount: idr(deployable), months: fmt })
            : t(previewNoGoalKey, { amount: idr(deployable) })
      }
    }

    return {
      id: `${kind}`,
      kind,
      label: t(labelKey),
      impactPreview: preview,
      amount: deployable,
      handoff: {
        kind: 'wizard',
        wizardKey: 'deploy-preview',
        prefill: {
          action: {
            kind: 'addLiquidRow',
            category,
            label: deployRowLabel,
            amountIdr: deployable,
          },
          modalSiapHeadline: calcModalSiap(snap, prices, includes),
          includes,
        },
      },
    }
  }

  // Emas option (destination = emas.digital, lowest-spread sub-category).
  function buildEmasOption(): ModalOption | null {
    const deployable = deployablePool(snap, prices, includes, { kind: 'emas' })
    if (deployable <= 0) return null
    return {
      id: 'tambah-emas',
      kind: 'tambah-emas',
      label: t('modal.option.tambahEmas.label'),
      impactPreview: t('modal.option.tambahEmas.preview', { amount: idr(deployable) }),
      amount: deployable,
      handoff: {
        kind: 'wizard',
        wizardKey: 'deploy-preview',
        prefill: {
          action: { kind: 'addEmasGram', amountIdr: deployable },
          modalSiapHeadline: calcModalSiap(snap, prices, includes),
          includes,
        },
      },
    }
  }

  const rd = buildLiquidBucket(
    'reksaDana',
    'tambah-reksaDana',
    'modal.option.tambahReksaDana.label',
    'modal.option.tambahReksaDana.preview',
    'modal.option.tambahReksaDana.previewNoGoal',
  )
  if (rd) out.push(rd)
  const dep = buildLiquidBucket(
    'deposito',
    'tambah-deposito',
    'modal.option.tambahDeposito.label',
    'modal.option.tambahDeposito.preview',
    'modal.option.tambahDeposito.previewNoGoal',
  )
  if (dep) out.push(dep)
  const sbn = buildLiquidBucket(
    'sbn',
    'tambah-sbn',
    'modal.option.tambahSbn.label',
    'modal.option.tambahSbn.preview',
    'modal.option.tambahSbn.previewNoGoal',
  )
  if (sbn) out.push(sbn)
  const emas = buildEmasOption()
  if (emas) out.push(emas)
  return out
}

// ----- entry point -----

export interface ModalOptionsInput {
  fiMultiplier: number
  assumedAnnualReturnReal: number
  today?: Date
  prices?: PricesView
  // D9.8 — user-configurable Modal Siap includes (saham/emas/sbn). Default = none, which
  // preserves baseline PRD §11.4 behavior. Inflated headline (when toggles ON) flows into
  // every option's amount cap + impact preview's "sisa modal" line — keeps the panel's
  // math consistent with the dashboard headline the user sees.
  includes?: ModalSiapIncludes
}

export function runModalOptions(
  snap: SnapshotState,
  goals: Goal[],
  input: ModalOptionsInput,
): ModalOptionsResult {
  const { prices, includes } = input
  const modalSiap = calcModalSiap(snap, prices, includes)

  if (modalSiap <= 0) {
    return {
      modalSiapIdr: 0,
      options: [],
      emergencyFundNote: t('modal.options.emergencyFundNote'),
    }
  }

  const effectiveIncludes: ModalSiapIncludes =
    includes ?? { saham: false, emas: false, sbn: false }

  const options: ModalOption[] = [
    ...cicilanOptions(snap, prices, modalSiap),
    ...utangPribadiOptions(snap, prices, modalSiap),
    ...gadaiOptions(snap, prices, modalSiap),
  ]

  options.push(...sahamOptions(snap, prices, effectiveIncludes))

  options.push(
    ...assetAcquisitionOptions(snap, goals, prices, effectiveIncludes, input),
  )

  return {
    modalSiapIdr: modalSiap,
    options,
    emergencyFundNote: t('modal.options.emergencyFundNote'),
  }
}
