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

// Deploy-preview wizard input — carries the action description so WizardDeployPreview
// can simulate it against a cloned snapshot. Kept narrow + serializable.
export type DeployAction =
  | {
      kind: 'addLiquidRow'
      category: 'reksaDana' | 'deposito'
      label: string
      amountIdr: number
    }
  | {
      kind: 'addStockLots'
      stockId: string
      stockTicker: string
      lotsToAdd: number
      costIdr: number
    }

export interface DeployPrefill {
  action: DeployAction
  // Echo the snapshot Modal Siap headline for the wizard's "Sumber" line. Source
  // waterfall (kas→deposito→RD→crypto) is fixed inside the wizard; toggle-include is
  // a display preference for the dashboard headline, NOT a waterfall selector.
  modalSiapHeadline: number
}

export type ModalOptionHandoff =
  | { kind: 'wizard'; wizardKey: 'lunasi'; prefill: LunasiInput }
  | { kind: 'wizard'; wizardKey: 'deploy-preview'; prefill: DeployPrefill }

export interface ModalOption {
  id: string // stable v-for key
  kind: ModalOptionKind
  label: string // headline — "Lunasi Kartu Kredit (Rp 8jt)"
  impactPreview: string // descriptive — "DSR 33% → 31%; sisa modal Rp 44jt"
  amount: number // IDR deployed by this option
  handoff: ModalOptionHandoff
  // Asset-include toggle whose ON state conflicts with this option (deploying TO that
  // class while it's counted as available cash double-counts the same rupiah). UI
  // auto-offs this toggle before opening the wizard. Undefined = no conflict.
  conflictsWith?: keyof ModalSiapIncludes
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

// ----- saham option (top per-emiten target gap) -----

// Pick the emiten with the largest lots-gap (lotsTarget − lot), then size the buy to
// either close the gap fully or what modalSiap allows — whichever smaller. Lots are
// integers; round down to nearest lot. Skipped when no emiten has a gap or no price.
function sahamOption(
  snap: SnapshotState,
  prices: PricesView | undefined,
  modalSiap: number,
): ModalOption | null {
  if (modalSiap <= 0) return null
  if (snap.saham.length === 0) return null

  let best: { stock: StockHolding; gap: number; price: number } | null = null
  for (const s of snap.saham) {
    if (s.lotsTarget === undefined || s.lotsTarget <= 0) continue
    const gap = s.lotsTarget - s.lot
    if (gap <= 0) continue
    const price = effectiveStockPrice(s, prices?.idxByTicker[s.ticker] ?? null)
    if (price <= 0) continue
    if (!best || gap > best.gap) best = { stock: s, gap, price }
  }
  if (!best) return null

  const costPerLot = best.price * 100
  const maxAffordableLots = Math.floor(modalSiap / costPerLot)
  if (maxAffordableLots <= 0) return null
  const lotsToBuy = Math.min(best.gap, maxAffordableLots)
  const costIdr = lotsToBuy * costPerLot

  // Bobot Sebelum/Sesudah within the lotsTarget universe (Allocation Discipline scope).
  const disciplineBefore = calcAllocationDiscipline(snap.saham, prices)
  const scn = cloneSnapshot(snap)
  const idx = scn.saham.findIndex((x) => x.id === best!.stock.id)
  if (idx !== -1) scn.saham[idx]!.lot += lotsToBuy
  const disciplineAfter = calcAllocationDiscipline(scn.saham, prices)

  // Progress to lotsTarget (current/lotsTarget percent).
  const progressBefore =
    best.stock.lotsTarget && best.stock.lotsTarget > 0
      ? (best.stock.lot / best.stock.lotsTarget) * 100
      : null
  const progressAfter =
    best.stock.lotsTarget && best.stock.lotsTarget > 0
      ? ((best.stock.lot + lotsToBuy) / best.stock.lotsTarget) * 100
      : null

  return {
    id: `beli-saham:${best.stock.id}`,
    kind: 'beli-saham',
    label: t('modal.option.beliSaham.label', {
      ticker: best.stock.ticker,
      lots: lotsToBuy,
      amount: idr(costIdr),
    }),
    impactPreview: t('modal.option.beliSaham.preview', {
      progressBefore: percent(progressBefore, 0),
      progressAfter: percent(progressAfter, 0),
      drift: disciplineAfter !== null ? `${disciplineAfter.toFixed(1)} pp` : '—',
      driftBefore: disciplineBefore !== null ? `${disciplineBefore.toFixed(1)} pp` : '—',
    }),
    amount: costIdr,
    handoff: {
      kind: 'wizard',
      wizardKey: 'deploy-preview',
      prefill: {
        action: {
          kind: 'addStockLots',
          stockId: best.stock.id,
          stockTicker: best.stock.ticker,
          lotsToAdd: lotsToBuy,
          costIdr,
        },
        modalSiapHeadline: modalSiap,
      },
    },
    conflictsWith: 'saham',
  }
}

// ----- FI bucket options (tambah RD / deposito) -----

// Always emit if Modal Siap > 0. Goal-months-shift computed against the FI goal if
// present; for non-FI goals or when no FI goal exists, falls back to "kontribusi ke
// likuid" framing (no goal shift line).
function fiBucketOptions(
  snap: SnapshotState,
  goals: Goal[],
  prices: PricesView | undefined,
  modalSiap: number,
  opts: {
    fiMultiplier: number
    assumedAnnualReturnReal: number
    today?: Date
  },
): ModalOption[] {
  if (modalSiap <= 0) return []
  const fiGoal = goals.find((g) => g.kind === 'FI')

  // Helper builds one bucket option (RD or Deposito). Preview math runs against an
  // in-memory clone with the new asset row pushed in — same shape as the deploy-preview
  // wizard's internal simulation. Stays read-only; the real mutation NEVER happens.
  const deployRowLabel = t('modal.option.deployLabel')
  function build(
    category: 'reksaDana' | 'deposito',
    kind: 'tambah-reksaDana' | 'tambah-deposito',
    labelKey: 'modal.option.tambahReksaDana.label' | 'modal.option.tambahDeposito.label',
    previewKey:
      | 'modal.option.tambahReksaDana.preview'
      | 'modal.option.tambahDeposito.preview',
    previewNoGoalKey:
      | 'modal.option.tambahReksaDana.previewNoGoal'
      | 'modal.option.tambahDeposito.previewNoGoal',
  ): ModalOption {
    let preview = t(previewNoGoalKey, { amount: idr(modalSiap) })
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
        amount: modalSiap,
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
        const fmt = months >= 12 ? `${(months / 12).toFixed(1)} tahun` : `${Math.round(months)} bulan`
        preview =
          shift > 0
            ? t(previewKey, { amount: idr(modalSiap), months: fmt })
            : t(previewNoGoalKey, { amount: idr(modalSiap) })
      } else {
        preview = t(previewNoGoalKey, { amount: idr(modalSiap) })
      }
    }

    return {
      id: `${kind}`,
      kind,
      label: t(labelKey),
      impactPreview: preview,
      amount: modalSiap,
      handoff: {
        kind: 'wizard',
        wizardKey: 'deploy-preview',
        prefill: {
          action: {
            kind: 'addLiquidRow',
            category,
            label: deployRowLabel,
            amountIdr: modalSiap,
          },
          modalSiapHeadline: modalSiap,
        },
      },
      // RD/Deposito options don't conflict with toggle-include (those categories are
      // always part of baseline Modal Siap — they can't be toggled). Only saham conflicts.
    }
  }

  return [
    build(
      'reksaDana',
      'tambah-reksaDana',
      'modal.option.tambahReksaDana.label',
      'modal.option.tambahReksaDana.preview',
      'modal.option.tambahReksaDana.previewNoGoal',
    ),
    build(
      'deposito',
      'tambah-deposito',
      'modal.option.tambahDeposito.label',
      'modal.option.tambahDeposito.preview',
      'modal.option.tambahDeposito.previewNoGoal',
    ),
  ]
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

  const options: ModalOption[] = [
    ...cicilanOptions(snap, prices, modalSiap),
    ...utangPribadiOptions(snap, prices, modalSiap),
    ...gadaiOptions(snap, prices, modalSiap),
  ]

  const saham = sahamOption(snap, prices, modalSiap)
  if (saham) options.push(saham)

  options.push(...fiBucketOptions(snap, goals, prices, modalSiap, input))

  return {
    modalSiapIdr: modalSiap,
    options,
    emergencyFundNote: t('modal.options.emergencyFundNote'),
  }
}
