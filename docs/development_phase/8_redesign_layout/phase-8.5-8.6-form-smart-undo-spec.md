# Phase 8.5 + 8.6 — Smart Defaults + Undo Toast (Combined Spec)

**Status:** Spec — awaiting user review
**Branch:** `improvement-ui-and-layout`
**Scope:** All repeatable-input form panels on `/app/snapshot` (continuation of Phase 8.1)
**Estimated effort:** ~1.5 working days (smart defaults 1d + undo toast 0.5d)
**Phase-2 constraint:** Visual / journey changes only. No calculation, OJK posture, or core store-behaviour changes. One pragmatic store addition (`restoreXxx`) is **APPROVED** per user decision (2026-06-19) — see §7.3.

---

## 1. Background

Phase 8.1 (commit `2f98489`) delivered structural form improvements: hybrid pattern (progressive disclosure + inline-list) and polished micro-interactions. The form now looks cleaner, but two interaction-level gaps remain:

1. **Row-add is friction-heavy.** When a user clicks "+ Tambah Cicilan" then picks KPR, they face six empty fields. They must know from memory that typical Indonesian KPR terms are ~20 years / 7.5% / Anuitas. New users without this context guess wrong or abandon. Quick-add chips exist for CicilanAktifPanel (KPR / KPM / KK / PINJOL) but only pre-fill `tipe` + `jenisBunga` — not the numerical fields.

2. **Row-delete is destructive.** A user who has spent 30 seconds filling a Gadai row (label + jaminan + piutang + gram + bunga + tempo + tanggal) and accidentally clicks the X loses everything. There is no undo. The existing `TransitionGroup` slide-out animation is permanent.

Combined, these pair into a "**Safe & Smart** data entry" experience: smart defaults reduce friction at row creation, undo toast removes fear of mistakes after deletion.

## 2. Goals

- **Smart Defaults**: when a user adds a row in a panel where we have realistic Indonesian-market context (Cicilan per tipe, Gadai per jaminan), pre-fill known fields with sensible defaults. UI must clearly mark these as suggestions ("Saran: ...") so the user feels in control to edit or override.
- **Undo Toast**: any row deletion (X button across all 7 panel types) holds the deleted row in UI state for 5 seconds, surfaces a toast at bottom-right with an "Undo" action. Restore re-inserts the row (functionally identical — same fields, may differ in list position; see §7.3 tradeoff).

## 3. Non-Goals

- Smart defaults for **non-numeric** panels (Kas, Penghasilan Lain, Pengeluaran Lain, Aset Likuid, Aset Non Likuid). These have no canonical Indonesian presets — defaults would be arbitrary. Instead: rotate contextual placeholder examples (separate sub-task, see §12).
- Multi-level undo history (Ctrl+Z style). Only the **most recent** deletion is undoable. Older deletions are permanent once a new deletion occurs.
- Cross-session persistence of undo state. Closing the tab clears undo state.
- "Redo" (undo of an undo). Out of scope.
- Changing calculation, DSR, OJK posture, or any value in `lib/finance/` or `lib/ojk/`.
- Persona-driven smart defaults (e.g. "Pegawai KPR persona auto-fills KPR with their actual tenor"). That's persona-template territory, deferred to Phase 8.2.

## 4. Architecture

### 4.1 Smart Defaults

**Pattern:** A pure function `defaultsFor<T>(panelKind, discriminator): Partial<T>` returns a partial patch applied at row-add time. Discriminator varies by panel:
- Cicilan: `tipe` (KPR / KPM / KK / PINJOL / PAYLATER / KTA / LAIN)
- Gadai: `jaminan` (emas:digital / emas:fisikAntam / ... / properti / kendaraan)

The store's existing `addCicilan({ tipe, jenisBunga })` already accepts a partial patch. We extend the same pattern: every `addXxx` accepts a fuller patch.

**UI marking:** Every pre-filled field renders a small "Saran" pill next to its label for the first 5 seconds after row creation, then fades out. After fade-out, the field looks normal (no permanent visual debt). User-edited values lose the pill instantly on first keystroke.

### 4.2 Undo Toast

**Pattern:** A new composable `useUndoDelete` captures the most recent deleted row in component-local UI state. A new component `UndoToast.vue` renders globally (mounted in the snapshot page root or app layout), watches the composable state, and surfaces when non-empty.

**Restore semantics:** Re-insert row by calling the existing `snap.addXxx(capturedFields)` API. The new row gets a fresh ID but identical data fields. Position in the list is end-of-array (NOT original position). See §7.3 for the tradeoff and the optional one-method store addition.

### 4.3 Phase-2 invariant preservation

- All calculations in `lib/finance/`, `lib/ojk/`, `lib/derive.ts` — untouched
- No new persisted state in `useSnapshotStore` (undo state is component-local, ephemeral)
- Per-input store writes on every keystroke (B1 invariant from Phase 8.1) — preserved
- **Approved store addition** (user decision 2026-06-19): `restoreXxx(panelKind, index, rowData)` methods on `useSnapshotStore` — pure list-position helpers, zero calculation impact. See §7.3.

## 5. Components

### 5.1 New components (3)

#### `components/snapshot/SmartDefaultPill.vue`

Tiny inline pill that renders next to a field label for ~5 seconds after a smart default was applied.

**Props:**
- `visible: boolean`
- `label?: string` (default: `"Saran"`)

**Behaviour:**
- Renders as a 10px uppercase emerald pill: `SARAN`
- On mount, schedules a 5s timer; on expiry, transitions opacity to 0 over 300ms then unmounts
- Click anywhere on the field's parent `<label>` does NOT dismiss the pill (only first keystroke does — handled by parent component)

#### `components/snapshot/UndoToast.vue`

Global toast that surfaces the most recent deletion with an "Undo" button.

**Props:** none (reads from `useUndoDelete` composable internally)

**Behaviour:**
- Fixed position bottom-right on desktop (`bottom-6 right-6`), bottom-center full-width minus padding on mobile
- Renders only when `useUndoDelete().lastDeleted` is non-null
- Slide-in from bottom (translateY 100% → 0) on enter, slide-out on leave
- Auto-dismiss after 5 seconds OR on Undo click OR on user-initiated dismiss (X)
- z-index: 50 (above CollapsiblePanel content but below any modal)
- Layout: `[icon] [text] [Undo button] [X]`
- Dark mode styling: `bg-[var(--color-surface-card)]` + `border border-[var(--color-border)]` + `backdrop-blur-sm`
- Undo button: emerald variant, left-aligned text "Undo" / "Batal hapus"

#### `lib/smart-defaults/cicilanDefaults.ts` (or `.ts` files per panel)

Pure functions returning the default patch per discriminator value.

```ts
// Example: cicilanDefaults.ts
export function cicilanDefaultsFor(tipe: CicilanTipe): {
  tenorSisaBulan?: number
  sukuBunga?: number
  jenisBunga: JenisBunga
  label: string  // pre-filled label like "KPR Rumah"
} {
  switch (tipe) {
    case 'KPR': return { jenisBunga: 'Anuitas', tenorSisaBulan: 240, sukuBunga: 7.5, label: 'KPR Rumah' }
    case 'KPM': return { jenisBunga: 'Anuitas', tenorSisaBulan: 60, sukuBunga: 6.5, label: 'KPM Mobil' }
    case 'KK':  return { jenisBunga: 'Revolving', tenorSisaBulan: undefined, sukuBunga: 36, label: 'Kartu Kredit' }
    case 'PINJOL': return { jenisBunga: 'Anuitas', tenorSisaBulan: 6, sukuBunga: 146, label: 'Pinjol' }
    case 'PAYLATER': return { jenisBunga: 'Anuitas', tenorSisaBulan: 6, sukuBunga: 18, label: 'Paylater' }
    case 'BANK_KTA': return { jenisBunga: 'Anuitas', tenorSisaBulan: 36, sukuBunga: 24, label: 'KTA Bank' }
    case 'LAIN': return { jenisBunga: 'Anuitas', tenorSisaBulan: undefined, sukuBunga: undefined, label: '' }
  }
}
```

### 5.2 New composables (1)

#### `composables/useUndoDelete.ts`

```ts
interface CapturedDeletion {
  panelKind: 'utangPribadi' | 'gadai' | 'cicilan' | 'kas' | 'penghasilanLain' | 'pengeluaranLain' | 'asetNonLikuid'
  rowData: Record<string, unknown>  // all fields except id
  timestamp: number
  undoWindowMs: number  // default 5000
}

export function useUndoDelete() {
  return {
    lastDeleted: Readonly<Ref<CapturedDeletion | null>>,
    capture(panelKind: string, rowData: object): void,  // also (re)starts 5s timer
    undo(): void,        // re-inserts via snap.addXxx + clears state
    dismiss(): void,     // clears state immediately
  }
}
```

- Singleton state (module-level `ref`) so all panel components share one undo queue
- 5s timer cleared on `capture` of a new deletion (only one slot — most-recent-wins)
- On undo: calls `snap.addXxx(rowData)` then clears state
- On timeout: clears state silently
- Persists across HMR reloads (module-level state), but NOT across tab close

### 5.3 Refactored components (4)

#### `components/snapshot/CicilanAktifPanel.vue`

- Extend `quickAdds` chips to also call `snap.addCicilan(cicilanDefaultsFor(qa.tipe))` instead of just `{ tipe, jenisBunga }`
- The non-chip "Tambah" button at the bottom stays as-is (creates an empty row) — defaults only apply via quick-add chips
- On any row remove, call `useUndoDelete().capture('cicilan', rowData)` BEFORE calling `snap.removeCicilan(id)`

#### `components/snapshot/GadaiPanel.vue`

- Replace plain "+ Tambah Gadai" with a small chip group like CicilanAktifPanel: `emas:digital`, `emas:fisikAntam`, `properti`, `kendaraan` (the 4 most common jaminan). Each chip calls `snap.addGadai({ jaminan: chipKind, ...gadaiDefaultsFor(chipKind) })`
- For emas-based jaminan, `gadaiDefaultsFor` checks existing emas rows and pre-suggests `gramTertahan` hint if available
- On remove: `useUndoDelete().capture('gadai', rowData)`

#### `components/snapshot/UtangPribadiPanel.vue`

- No smart defaults (no canonical Indonesian preset for "utang ke teman")
- On remove: `useUndoDelete().capture('utangPribadi', rowData)`

#### `components/snapshot/AssetRowList.vue`

- No smart defaults per row (each row is just label + amount)
- BUT: rotate placeholder examples per category (kas → "BCA" / "Dana darurat"; properti → "Rumah Bekasi"; kendaraan → "Motor Vario")
- On remove: `useUndoDelete().capture(panelKind, rowData)` — the parent panel passes its `panelKind` to AssetRowList as a prop

## 6. Smart Defaults Presets

### 6.1 Cicilan per `tipe`

Sourced from publicly available Indonesian market data (BI rules, OJK regulations, common bank published rates as of 2026-Q2). Rounded to typical user-facing values.

| `tipe` | `label` | `jenisBunga` | `tenorSisaBulan` | `sukuBunga` (% per tahun) | Notes |
|---|---|---|---|---|---|
| `KPR` | "KPR Rumah" | Anuitas | 240 | 7.5 | Most common 20yr fixed-floating; BI medallion rate |
| `KPM` | "KPM Mobil" | Anuitas | 60 | 6.5 | Leasing standard 5yr |
| `KK` | "Kartu Kredit" | Revolving | — | 36 | BI caps cash advance interest; ~3%/bln typical |
| `PINJOL` | "Pinjol" | Anuitas | 6 | 146 | OJK-capped effective rate; ~0.4%/day → ~146%/yr |
| `PAYLATER` | "Paylater" | Anuitas | 6 | 18 | Shopee/Tokopedia/GoPay typical 1.5%/bln |
| `BANK_KTA` | "KTA Bank" | Anuitas | 36 | 24 | Bank KTA typical 1.5-2%/bln flat |
| `LAIN` | "" | Anuitas | — | — | No defaults; user fills freely |

### 6.2 Gadai per `jaminan`

| `jaminan` | `piutangIdr` | `bungaPerBulanPercent` | `tempoBulan` | Notes |
|---|---|---|---|---|
| `emas:digital` | — | 1.0 | 4 | Pegadaian digital pawn rate |
| `emas:fisikAntam` | — | 1.0 | 4 | Pegadaian standard |
| `emas:perhiasan18K` | — | 1.5 | 4 | Higher rate for non-Antam |
| `emas:perhiasan14K` | — | 1.5 | 4 | Same |
| `emas:perhiasan10K` | — | 1.5 | 4 | Same |
| `properti` | — | 1.0 | 12 | Longer term for property collateral |
| `kendaraan` | — | 1.5 | 6 | BPKB-gadai typical |

For all emas variants: if existing emas rows in the snapshot have > 0 grams of matching karat, the panel surfaces a small hint next to `gramTertahan` like "Kamu punya 12g Antam — isi berapa yang digadaikan?" (text hint only, not auto-filled — to avoid accidental overcommit).

### 6.3 What does NOT get smart defaults

- **Penghasilan Lain, Pengeluaran Lain, Kas, Deposito, Reksa Dana, SBN, Properti, Kendaraan, Pensiun** — no canonical Indonesian preset. Each row is user-specific. Instead: rotate contextual placeholder examples in the label input (see §12).
- **Utang Pribadi** — informal loans have no standard structure. No defaults.
- **Saham, Crypto, Emas** — live-price panels already in scope of Phase 8.1's exclusion. Deferred.

## 7. Undo State Management

### 7.1 Composable shape

```ts
// composables/useUndoDelete.ts
import { ref, type Ref } from 'vue'
import { useSnapshotStore } from '~/stores/snapshot'

interface CapturedDeletion {
  panelKind: 'utangPribadi' | 'gadai' | 'cicilan' | 'kas' | 'deposito' | 'reksaDana' | 'sbn' | 'properti' | 'kendaraan' | 'pensiun' | 'penghasilanLain' | 'pengeluaranLain'
  rowData: Record<string, unknown>
  timestamp: number
}

// Module-level singleton (shared across components, cleared on tab close)
const _lastDeleted = ref<CapturedDeletion | null>(null)
let _timer: ReturnType<typeof setTimeout> | null = null

export function useUndoDelete() {
  const snap = useSnapshotStore()

  function capture(panelKind: CapturedDeletion['panelKind'], rowData: Record<string, unknown>) {
    _lastDeleted.value = { panelKind, rowData, timestamp: Date.now() }
    if (_timer) clearTimeout(_timer)
    _timer = setTimeout(() => {
      _lastDeleted.value = null
      _timer = null
    }, 5000)
  }

  function undo() {
    if (!_lastDeleted.value) return
    const { panelKind, rowData } = _lastDeleted.value
    // Dispatch to the correct store add method
    switch (panelKind) {
      case 'utangPribadi': snap.addUtangPribadi(rowData as any); break
      case 'gadai': snap.addGadai(rowData as any); break
      case 'cicilan': snap.addCicilan(rowData as any); break
      case 'kas': case 'deposito': case 'reksaDana': case 'sbn':
        snap.addLikuid(panelKind, rowData as any); break
      case 'properti': case 'kendaraan': case 'pensiun':
        snap.addNonLikuid(panelKind, rowData as any); break
      case 'penghasilanLain': snap.addPenghasilanLain(rowData as any); break
      case 'pengeluaranLain': snap.addPengeluaranLain(rowData as any); break
    }
    dismiss()
  }

  function dismiss() {
    if (_timer) { clearTimeout(_timer); _timer = null }
    _lastDeleted.value = null
  }

  return {
    lastDeleted: _lastDeleted as Readonly<Ref<CapturedDeletion | null>>,
    capture,
    undo,
    dismiss,
  }
}
```

### 7.2 Capture points

Each panel component wraps its remove handler:

```vue
<!-- In UtangPribadiPanel.vue -->
<UtangPribadiRow
  :row="row"
  @remove="handleRemove(row)"
/>

<script setup>
const undo = useUndoDelete()

function handleRemove(row) {
  // Capture full row data BEFORE removing from store
  const { id, ...rowData } = row
  undo.capture('utangPribadi', rowData)
  snap.removeUtangPribadi(row.id)
}
</script>
```

### 7.3 Position restoration (PRAGMATIC APPROACH — APPROVED)

**User decision (2026-06-19):** Use the pragmatic approach. Undo restores the row at its **exact original index** via new `restoreXxx` store methods.

**Implementation:** Add the following methods to `useSnapshotStore`:

```ts
// All restore methods: generate fresh ID, splice into array at given index
restoreUtangPribadi(index: number, rowData: Omit<UtangPribadiRow, 'id'>): void
restoreGadai(index: number, rowData: Omit<GadaiRow, 'id'>): void
restoreCicilan(index: number, rowData: Omit<CicilanRow, 'id'>): void
restoreLikuid(category: LiquidAssetCategory, index: number, rowData: Omit<AssetRow, 'id'>): void
restoreNonLikuid(category: NonLiquidAssetCategory, index: number, rowData: Omit<AssetRow, 'id'>): void
restorePenghasilanLain(index: number, rowData: Omit<PenghasilanLainRow, 'id'>): void
restorePengeluaranLain(index: number, rowData: Omit<PengeluaranLainRow, 'id'>): void
```

Each method:
1. Generates a new UUID (same generator used by `addXxx`)
2. Splices into the target array at the given index
3. Triggers Pinia reactivity (existing TransitionGroup handles slide-in animation)

Calculation impact: zero. The new row has identical fields to the deleted one; all `derived` getters produce identical values. Pure list-position helper.

### 7.4 Capture now stores the original index

To support the pragmatic approach, the composable captures both the row data AND its original index in the array. Updated `CapturedDeletion` shape:

```ts
interface CapturedDeletion {
  panelKind: 'utangPribadi' | 'gadai' | 'cicilan' | 'kas' | 'deposito' | 'reksaDana' | 'sbn' | 'properti' | 'kendaraan' | 'pensiun' | 'penghasilanLain' | 'pengeluaranLain'
  rowData: Record<string, unknown>
  originalIndex: number  // NEW: position to restore to
  timestamp: number
}
```

Capture points must compute the index BEFORE calling `removeXxx`. Pattern:

```ts
function handleRemove(row, index) {
  const { id, ...rowData } = row
  undo.capture('utangPribadi', rowData, index)
  snap.removeUtangPribadi(row.id)
}
```

### 7.5 Multi-level undo

Out of scope. Only the most recent deletion is undoable. If user deletes row A, then row B, only B is recoverable. A is lost. This matches the common Gmail / Notion / Slack "Undo last action" pattern — not a full history.

## 8. UI Design — Undo Toast

### 8.1 Layout

```
┌─────────────────────────────────────────────────────┐
│  🗑️  Cicilan Aktif dihapus              [ Undo ]  ✕  │
└─────────────────────────────────────────────────────┘
```

- **Desktop:** fixed `bottom-6 right-6`, `max-w-md`, slide-in from bottom-right
- **Mobile:** fixed `bottom-4 inset-x-4` (full width minus 16px padding), slide-in from bottom
- **z-index:** 50 (above page content, below any modal/dialog)

### 8.2 Styling

```
bg-[var(--color-surface-card)]
border border-[var(--color-border)]
rounded-[var(--radius-card)]
shadow-lg
backdrop-blur-sm
px-4 py-3
flex items-center gap-3
```

- **Icon:** `Trash2` from lucide, 18px, color `var(--color-text-muted)`
- **Text:** `text-sm text-[var(--color-text-primary)]` — e.g. "Cicilan Aktif dihapus"
- **Undo button:** `ButtonSecondary` size=sm, emerald-tinted variant, text "Undo"
- **Dismiss (X):** 16px X icon, `text-[var(--color-text-muted)]`, hover → `text-[var(--color-text-primary)]`

### 8.3 Animations

- **Enter:** `translate-y-full opacity-0` → `translate-y-0 opacity-100`, 300ms ease-out
- **Leave:** reverse, 200ms ease-in
- **Auto-dismiss countdown:** optional 5s progress bar at the bottom of the toast (1px tall, emerald, shrinking width over 5s). Visual cue that the undo window is closing.

### 8.4 Placement decision

Mount `UndoToast.vue` once at the root of `pages/app/snapshot.vue` (inside the layout's main content, after all tabs). Rationale:
- Local to snapshot page (undo only applies to snapshot rows)
- Avoids polluting the global app layout
- Survives tab switches within snapshot (the `v-show` tabs don't unmount)

## 9. UI Design — Smart Default Pill

### 9.1 Visual

```
Suku Bunga  [SARAN]
[ 7.5              % ]
```

- Pill: `inline-flex items-center rounded-full bg-[var(--color-accent-emerald-soft)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--color-accent-emerald)]`
- Sits inline next to the field label, 4px gap
- 5s timer from row creation → fade out over 300ms → unmount

### 9.2 Lifecycle

- Pill renders when a row is created via quick-add chip with smart defaults
- Pill renders only on fields that received a non-empty default
- First keystroke in that field → pill removes instantly (signals "user took control")
- 5s elapsed with no edit → pill fades out (signals "user accepted default")

### 9.3 Implementation note

Each `ProgressiveRowCard` row that received smart defaults tracks a local `defaultFields: Set<string>` ref. The label template checks `if defaultFields.has('sukuBunga')` to render the pill. On first input in that field, remove from set.

## 10. Testing Strategy

### 10.1 Unit tests

- `cicilanDefaultsFor`: returns expected preset per tipe; `LAIN` returns empty
- `gadaiDefaultsFor`: returns expected preset per jaminan
- `useUndoDelete`:
  - `capture` sets `lastDeleted`, starts 5s timer
  - Second `capture` within 5s replaces previous (timer resets)
  - `undo` calls corresponding `snap.addXxx` with captured data, clears state
  - `dismiss` clears state immediately
  - Timer auto-clears state on expiry

### 10.2 Regression tests

- All 513 existing tests must pass
- CicilanAktifPanel quick-add chips still create rows with the right `tipe` (default fields are additional, not replacing)
- GadaiPanel still surfaces emas overcommit warning when defaults cause cross-row overcommit (test: add 2 emas:gadai rows with high default gram → overOwned warning still fires)

### 10.3 Manual QA matrix

Per tab, verify:
- Quick-add chip → row appears with pre-filled fields + "SARAN" pill on each pre-filled field
- Edit a pre-filled field → pill disappears on that field
- Wait 5s without editing → pills fade out
- Click X on any row → toast appears bottom-right with "Undo"
- Click Undo → row re-appears at end of list (Phase-2 strict mode)
- Wait 5s without clicking Undo → toast auto-dismisses
- Delete row A, then row B → only B is undoable (A is lost)
- Click X on toast → toast dismisses, row stays deleted

## 11. Implementation Order

| Day | Work |
|---|---|
| 1 (morning) | `cicilanDefaults.ts` + `gadaiDefaults.ts` pure functions + unit tests |
| 1 (morning) | Extend `CicilanAktifPanel` quick-adds to pass full defaults |
| 1 (afternoon) | Add GadaiPanel quick-add chips (emas:digital, emas:fisikAntam, properti, kendaraan) with defaults |
| 1 (afternoon) | `SmartDefaultPill.vue` + lifecycle wiring (track defaultFields per row, first-keystroke dismissal) |
| 2 (morning) | **NEW:** Add 7 `restoreXxx` methods to `stores/snapshot.ts` + unit tests (user-approved §7.3) |
| 2 (morning) | `useUndoDelete.ts` composable (with originalIndex capture) + unit tests |
| 2 (morning) | `UndoToast.vue` + mount in `pages/app/snapshot.vue` |
| 2 (afternoon) | Wire all 7 panel remove handlers through `useUndoDelete().capture(index, data)` |
| 2 (afternoon) | Manual QA matrix, fix regressions, final commit |

## 12. Files Touched

**New (5):**
- `lib/smart-defaults/cicilanDefaults.ts`
- `lib/smart-defaults/gadaiDefaults.ts`
- `components/snapshot/SmartDefaultPill.vue`
- `components/snapshot/UndoToast.vue`
- `composables/useUndoDelete.ts`
- Test files for each

**Modified (6):**
- `stores/snapshot.ts` — **NEW: 7 `restoreXxx` methods** (per §7.3 pragmatic approach, user-approved)
- `components/snapshot/CicilanAktifPanel.vue` — quick-adds pass full defaults
- `components/snapshot/GadaiPanel.vue` — new quick-add chips with defaults
- `components/snapshot/CicilanRow.vue` — render `SmartDefaultPill` next to fields in `defaultFields` set
- `components/snapshot/GadaiRow.vue` — same
- `components/snapshot/UtangPribadiPanel.vue` — wire remove through undo (capture index + data)
- `components/snapshot/AssetRowList.vue` — accept `panelKind` prop, wire remove through undo (capture index + data)
- `components/snapshot/AsetLikuidPanel.vue` + `AsetNonLikuidPanel.vue` — pass `panelKind` to AssetRowList
- `components/snapshot/PenghasilanForm.vue` + `PengeluaranForm.vue` — wire remove through undo (capture index + data)
- `pages/app/snapshot.vue` — mount `<UndoToast />` at root

**Untouched:**
- `lib/finance/*`, `lib/ojk/*` — no calculation changes
- `components/snapshot/SahamPanel.vue`, `CryptoPanel.vue`, `EmasPanel.vue` — out of scope

## 13. Success Criteria

- All 513 existing tests pass + new tests pass
- Manual QA matrix shows zero regressions
- User reports the form feels less intimidating on row-add (qualitative)
- User reports accidental deletes feel recoverable (qualitative)
- No calculation, OJK, or core-store changes (verifiable via diff scope)

## 14. Risks and Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Smart default presets are wrong (e.g. KPR rate 7.5% but user's actual is 9%) | Medium | Pills mark fields as "SARAN" explicitly; first-keystroke dismissal signals user override; presets are typical market values, not authoritative |
| PINJOL 146% rate shocks users | Low | Pill is informational; the number is real (OJK-capped effective rate). Could add a one-time tooltip on first PINJOL quick-add: "Rate efektif ~146%/tahun sesuai aturan OJK" |
| Undo restores row at end of list, not original position | Medium | Documented tradeoff in §7.3; revisit if user complaints |
| `useUndoDelete` singleton state leaks across HMR in unexpected ways | Low | Module-level ref + explicit timer cleanup; verify during manual QA |
| Toast appears over modal dialog (z-index conflict) | Low | z-index 50 below modal (which is typically 100+); verify during manual QA |
| Capture-before-remove race: if `removeXxx` fires before `capture`, the row data is lost | Low | Order in code: capture synchronously, then remove synchronously — both sync operations, no race |
| 7 separate panel-specific restore branches in `useUndoDelete` become unwieldy | Low | Switch statement is verbose but explicit; refactoring to a strategy map is premature without >7 cases |

## 15. Resolved Open Questions (user decisions 2026-06-19)

1. **§7.3 — position restoration:** ✅ **PRAGMATIC APPROACH APPROVED.** Implement `restoreXxx(panelKind, index, rowData)` store methods so undone rows return to exact original index via splice.
2. **PINJOL shock-rate tooltip:** ✅ **SKIP.** The "SARAN" pill is sufficient context. Re-evaluate only if user feedback post-ship flags the 146% rate as confusing.
3. **Plain "+ Tambah" button behaviour:** ✅ **STAYS EMPTY.** Plain add creates a blank row user must fill from scratch. Quick-add chips are the only path to smart defaults.

## 16. Out of Scope (Future Phases)

- **Phase 8.2** — Persona templates + onboarding empty states
- **Phase 8.3** — Layout polish (sidebar + segmented tab control with count badges)
- **Phase 8.4** — Gamification (Cermat Score badges, achievement toasts)
- **Phase 8.7** — Contextual placeholder rotation per panel (mentioned in §6.3 as a small enhancement; could ship alongside this phase if scope allows)
- **Phase 8.8** — Multi-level undo history (Ctrl+Z style)
- **Phase 8.9** — Cross-session undo persistence via localStorage
