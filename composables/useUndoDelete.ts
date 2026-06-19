import { ref, type Ref } from 'vue'
import { useSnapshotStore } from '~/stores/snapshot'
import type {
  AssetRow,
  CicilanRow,
  GadaiRow,
  LiquidAssetCategory,
  NonLiquidAssetCategory,
  UtangPribadiRow,
} from '~/lib/types/snapshot'

// Phase 8.6 — Undo Toast state. Holds the most recent deleted row in
// component-local UI state for 5 seconds; surfaces a toast with an "Undo"
// action. On undo, dispatches to the corresponding restoreXxx method to
// re-insert the row at its original index.
//
// Singleton (module-level ref) so all panel components share one undo queue.
// Only the MOST RECENT deletion is undoable — older deletions are permanent
// once a new deletion occurs (matches Gmail / Notion / Slack "Undo last" UX).
//
// Phase-2 constraint: UI-only state. No persisted store state. Calculation /
// OJK posture untouched.

export type UndoPanelKind =
  | 'utangPribadi'
  | 'gadai'
  | 'cicilan'
  | 'kas'
  | 'deposito'
  | 'reksaDana'
  | 'sbn'
  | 'properti'
  | 'kendaraan'
  | 'pensiun'
  | 'penghasilanLain'
  | 'pengeluaranLain'

export interface CapturedDeletion {
  panelKind: UndoPanelKind
  rowData: Record<string, unknown>
  originalIndex: number
  timestamp: number
}

// Map likuid categories to panelKind for restore dispatch.
const LIQUID_PANEL_KINDS: ReadonlySet<UndoPanelKind> = new Set([
  'kas',
  'deposito',
  'reksaDana',
  'sbn',
])
const NON_LIQUID_PANEL_KINDS: ReadonlySet<UndoPanelKind> = new Set([
  'properti',
  'kendaraan',
  'pensiun',
])

// Module-level singleton state (shared across components, cleared on tab close).
const _lastDeleted = ref<CapturedDeletion | null>(null)
let _timer: ReturnType<typeof setTimeout> | null = null
const DEFAULT_WINDOW_MS = 5000

export function useUndoDelete() {
  const snap = useSnapshotStore()

  function capture(
    panelKind: UndoPanelKind,
    rowData: Record<string, unknown>,
    originalIndex: number,
    windowMs: number = DEFAULT_WINDOW_MS,
  ) {
    _lastDeleted.value = {
      panelKind,
      rowData,
      originalIndex,
      timestamp: Date.now(),
    }
    if (_timer) clearTimeout(_timer)
    _timer = setTimeout(() => {
      _lastDeleted.value = null
      _timer = null
    }, windowMs)
  }

  function undo() {
    if (!_lastDeleted.value) return
    const { panelKind, rowData, originalIndex } = _lastDeleted.value
    if (LIQUID_PANEL_KINDS.has(panelKind)) {
      snap.restoreLikuid(
        panelKind as LiquidAssetCategory,
        originalIndex,
        rowData as Partial<AssetRow>,
      )
    } else if (NON_LIQUID_PANEL_KINDS.has(panelKind)) {
      snap.restoreNonLikuid(
        panelKind as NonLiquidAssetCategory,
        originalIndex,
        rowData as Partial<AssetRow>,
      )
    } else if (panelKind === 'cicilan') {
      snap.restoreCicilan(originalIndex, rowData as Partial<CicilanRow>)
    } else if (panelKind === 'utangPribadi') {
      snap.restoreUtangPribadi(originalIndex, rowData as Partial<UtangPribadiRow>)
    } else if (panelKind === 'gadai') {
      snap.restoreGadai(originalIndex, rowData as Partial<GadaiRow>)
    } else if (panelKind === 'penghasilanLain') {
      snap.restorePenghasilanLain(originalIndex, rowData as Partial<AssetRow>)
    } else if (panelKind === 'pengeluaranLain') {
      snap.restorePengeluaranLain(originalIndex, rowData as Partial<AssetRow>)
    }
    dismiss()
  }

  function dismiss() {
    if (_timer) {
      clearTimeout(_timer)
      _timer = null
    }
    _lastDeleted.value = null
  }

  return {
    lastDeleted: _lastDeleted as Readonly<Ref<CapturedDeletion | null>>,
    capture,
    undo,
    dismiss,
  }
}
