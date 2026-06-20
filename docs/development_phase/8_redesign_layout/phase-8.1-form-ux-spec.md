# Phase 8.1 — Form UX Improvement (Hybrid Pattern + Polished Micro-Interactions)

**Status:** Spec — awaiting user review
**Branch:** `improvement-ui-and-layout` (current)
**Scope:** All repeatable-input form panels on `/app/snapshot`
**Estimated effort:** ~6 working days
**Phase-2 constraint:** Visual / layout / journey changes ONLY. No store, calculation, or OJK posture changes.

---

## 1. Background

The `/app/snapshot` page is a 6-tab step-by-step wizard (Cash Flow → Kas → Investasi → Aset Tetap → Utang → Ringkasan). Each tab wraps form panels inside `CollapsiblePanel`. Within each panel, repeatable rows are rendered as bordered cards containing a label input + a 2-column grid of fields.

User feedback (2026-06-19): the form "feels" cramped and intimidating. Review of 5 reference screenshots plus current code surfaced two structural problems:

1. **Simple rows carry heavy chrome.** A Kas row needs only label + amount, but each row sits inside its own bordered card with header + padding, creating visual noise at 3+ rows.
2. **Complex rows overwhelm.** Gadai, CicilanAktif, and UtangPribadi rows show 4–7 fields simultaneously. New users see a wall of inputs before deciding whether the row applies to them.

Existing strengths to preserve:
- Per-input store writes on every keystroke (B1 invariant)
- `TransitionGroup` with `row-slide` animation on add/remove
- `CollapsiblePanel` wraps each section (fold heavy sections)
- Established design tokens (`--color-surface-card`, `--color-border`, `--radius-card`, etc.)
- 457 passing tests must remain green

## 2. Goals

- **Reduce visual noise on simple-row panels** by removing per-row card chrome and using inline-list dividers.
- **Reduce cognitive load on complex-row panels** by progressive disclosure: basic fields (identity + amount) always visible, advanced fields (scheduling + terms) on expand.
- **Add polished micro-interactions**: smooth height transition on expand/collapse, count-up animation on section totals, subtle "section complete" pulse on CollapsiblePanel headers when minimum data is present, focus rings on inputs.
- **Preserve all existing behavior**: store writes, validation, OJK-derived warnings, FX awareness, live price integration.

## 3. Non-Goals (deferred to later specs)

- User journey changes (tab reordering, progressive tab unlock, flow restructuring)
- Empty-state / onboarding redesign (persona templates, example data, first-run experience)
- Sidebar + tab bar layout polish (segmented control, count badges)
- Gamification (profile completeness bar, achievement badges, score-based medals)
- Mobile-specific layout rework beyond what the hybrid pattern naturally improves
- Streaks or any feature requiring new store state

## 4. Architecture

### 4.1 Pattern selection: Hybrid by row complexity

| Row complexity | Pattern | Panels |
|---|---|---|
| **Simple** (1–3 fields per row) | Inline-list — flat rows, bottom-border dividers, no per-row card chrome | `PenghasilanForm` (Penghasilan Lain), `PengeluaranForm` (Pengeluaran Lain), `AsetLikuidPanel` (kas / deposito / reksaDana / sbn), `AsetNonLikuidPanel` (properti / kendaraan / pensiun) |
| **Complex** (4–7 fields per row) | Progressive disclosure — basic slot always visible, advanced slot behind expand chevron | `UtangPribadiPanel`, `GadaiPanel` / `GadaiRow`, `CicilanAktifPanel` / `CicilanRow` |

**Rationale:** Simple rows don't benefit from disclosure (only 2 fields; hiding adds clicks for no payoff). Complex rows overwhelm when all fields render at once; disclosure delivers the "less intimidating" feel and gives power users a clean default with optional depth.

### 4.2 No store changes

All changes are presentation-layer:
- Inputs continue to write to `useSnapshotStore` on every keystroke
- Progressive disclosure expand state is component-local `ref<boolean>`, not persisted, resets to collapsed on remount
- Count-up animations are visual; underlying `derived` / `snap` getters remain source-of-truth

### 4.3 Phase-2 invariant preservation

- B1 (per-input store writes) — preserved
- All calculations, DSR logic, OJK-derived warnings — untouched
- Test fixtures and snapshots — untouched

## 5. Components

### 5.1 New components (5)

#### `components/snapshot/ProgressiveRowCard.vue`

Wrapper for complex-row progressive disclosure.

**Props:**
- `expanded?: boolean` (default `false`) — initial expand state
- `warningCount?: number` (default `0`) — number of active warnings in the advanced slot; if > 0 and collapsed, renders amber dot on chevron
- `basicAriaLabel?: string` — a11y label for the expand toggle

**Slots:**
- `#basic` — always visible row content (label input + amount input + remove button)
- `#advanced` — content revealed on expand (scheduling + terms fields)

**Behavior:**
- Click on expand chevron toggles `expanded`
- Smooth height transition via `useExpandTransition` composable
- When collapsed and `warningCount > 0`, render small amber dot on the chevron
- When expanded, chevron rotates 180deg

**Accessibility:**
- Expand button has `aria-expanded` and `aria-controls`
- Advanced region has matching `id` for `aria-controls`
- Keyboard-focusable

#### `components/snapshot/AnimatedTotal.vue`

Wraps a numeric value, animates from previous to new value on change.

**Props:**
- `value: number` — current value
- `format?: (n: number) => string` — formatter (default: `idr`)
- `durationMs?: number` (default `400`) — tween duration
- `className?: string` — pass-through for styling

**Behavior:**
- Uses `useCountUp` composable
- Tween runs on `value` change via `watch`
- Renders final formatted value during tween at each animation frame
- On initial mount, renders immediately (no count-up from 0) — only animates subsequent changes

#### `components/snapshot/SectionCompleteIndicator.vue`

Subtle checkmark or pulse rendered next to a section title when the section has minimum required data.

**Props:**
- `complete: boolean` — whether the section meets its minimum-data criterion
- `variant?: 'checkmark' | 'pulse'` (default `'checkmark'`)
- `size?: 'sm' | 'md'` (default `'sm'`)

**Behavior:**
- When `complete` transitions from `false` to `true`, plays a brief pulse animation (scale + fade)
- When `complete === true` (steady state), renders as a static checkmark with emerald color
- When `complete === false`, renders nothing (returns `null`) — keeps the header clean for incomplete sections

### 5.2 New composables (2)

#### `composables/useCountUp.ts`

```ts
export function useCountUp(
  source: Ref<number>,
  options?: { durationMs?: number }
): Ref<number>
```

- Returns a ref that tweens from previous to new value on `source` change
- Uses `requestAnimationFrame` with ease-out cubic
- On initial mount, returns source value immediately (no animation)
- Cleans up rAF on unmount

#### `composables/useExpandTransition.ts`

```ts
export function useExpandTransition(options?: {
  durationMs?: number
}): {
  onEnter: (el: Element) => void
  onAfterEnter: (el: Element) => void
  onLeave: (el: Element) => void
  onAfterLeave: (el: Element) => void
}
```

- Returns hooks for Vue's `<Transition>` component
- Measures scrollHeight, animates from `0` to measured height (enter) or measured height to `0` (leave)
- Handles overflow hidden during transition, restores after
- Avoids the CSS `height: auto` transition limitation

### 5.3 Refactored components (4)

#### `components/snapshot/AssetRowList.vue`

Add a new `variant` prop:

```ts
withDefaults(defineProps<{
  variant?: 'card' | 'inline'  // default: 'card' (current behavior)
  // ... existing props
}>(), { variant: 'card' })
```

- `variant="card"` (default) — current behavior, preserves other surfaces using this component
- `variant="inline"` — drops the per-row `bg-[var(--color-surface-low)]` wrapper and per-row border; rows separated by `border-b border-[var(--color-border)]` only; first/last row no border

Snapshot panels will pass `variant="inline"` for the simple-row use case.

#### `components/snapshot/UtangPribadiPanel.vue`

Extract inline row markup to a new child `components/snapshot/UtangPribadiRow.vue` (parallel to existing `GadaiRow.vue` and `CicilanRow.vue`). Wrap row content in `ProgressiveRowCard`:

- `#basic` slot: label input + sisaPokok input + remove button
- `#advanced` slot: cicilanPerBulan + tempoBulan + tanggalJatuhTempo

#### `components/snapshot/GadaiRow.vue`

Wrap existing field grid in `ProgressiveRowCard`:

- `#basic` slot: label input + jaminan select + piutangIdr input + remove button
- `#advanced` slot: gramTertahan / asetRef (depends on jaminan), bungaPerBulanPercent, tempoBulan, tanggalJatuhTempo, plus existing warning messages (emasNotEntered, overOwned, nonEmasEmptyMsg)

Existing warning logic (emas category checks, cross-row overcommit) preserved as-is.

#### `components/snapshot/CicilanRow.vue`

Wrap existing field grid in `ProgressiveRowCard`:

- `#basic` slot: label input + tipe select + sisaPokok input + remove button
- `#advanced` slot: cicilanPerBulan + bungaPercent + tempoBulan + tanggalJatuhTempo + jenisBunga

Quick-add buttons (KPR / KPM / KK / PINJOL) on the parent panel remain unchanged.

### 5.4 Optional: CollapsiblePanel integration

`CollapsiblePanel.vue` currently accepts a `:value` prop and renders it as static text. Enhancement:

- Replace static `{{ idr(props.value) }}` with `<AnimatedTotal :value="props.value" />`
- Add optional `:sectionComplete?: boolean` prop that renders `<SectionCompleteIndicator>` next to the title

This is the lowest-risk change and can ship independently of the row refactor.

## 6. Field Splits (Basic vs Advanced)

Guiding principle: **basic = identity + amount** (minimum to be useful). Advanced = scheduling + terms.

| Panel | Basic (always visible) | Advanced (on expand) |
|---|---|---|
| UtangPribadi | `label`, `sisaPokok` | `cicilanPerBulan`, `tempoBulan`, `tanggalJatuhTempo` |
| Gadai | `label`, `jaminan`, `piutangIdr` | `gramTertahan` or `asetRef` (depends on `jaminan`), `bungaPerBulanPercent`, `tempoBulan`, `tanggalJatuhTempo` |
| CicilanAktif | `label`, `tipe`, `sisaPokok` | `cicilanPerBulan`, `bungaPercent` / `bungaPerBulanPercent`, `tempoBulan`, `tanggalJatuhTempo`, `jenisBunga` |

The remove (X) button always lives in the basic slot so users can delete a row without expanding it.

## 7. Data Flow

```
User keystroke
  → <input> @input / InputCurrency @update:model-value
  → snap.updateXxx(rowId, patch)  [UNCHANGED]
  → Pinia store mutation
  → derived getters recompute
  → CollapsiblePanel :value re-renders
  → AnimatedTotal tweens to new value  [NEW — visual only]
```

Progressive disclosure state:
```
Local component ref<boolean> expanded
  → click on chevron toggles
  → useExpandTransition animates height
  → slot content revealed/hidden
```

No store interaction, no persistence. State resets on remount.

## 8. Error Handling

### 8.1 Existing validation preserved as-is

All current warnings remain functionally identical:
- `overPenghasilan` (CicilanAktifPanel): monthly cicilan > monthly penghasilan
- `emasNotEntered` (GadaiRow): chosen emas category has 0g owned
- `overOwned` (GadaiRow): cross-row pawned grams > owned grams
- `nonEmasEmptyMsgKey` (GadaiRow): properti/kendaraan referenced but no aset rows exist
- FX stale warnings (PenghasilanForm, PenghasilanLain)
- All `InputCurrency` / `InputQuantity` validation

### 8.2 New behavior: collapsed-warning indicator

When a `ProgressiveRowCard` is collapsed but its advanced slot contains active validation messages, render a small amber dot on the expand chevron. This prevents users from missing warnings hidden inside collapsed advanced sections.

Implementation: parent computes `warningCount` based on the same reactive conditions that drive the warning messages, passes to `ProgressiveRowCard` as prop.

### 8.3 Edge cases

- **Empty state** (`rows.length === 0`): unchanged, current "Belum ada data" pattern preserved
- **Single row** with progressive disclosure: card renders normally; expand chevron still works
- **AnimatedTotal on initial mount**: renders immediately, no count-up from 0 (avoids jarring animation on page load)
- **Rapid value changes** (user typing fast): count-up tween interrupts and restarts toward new target; no animation pile-up

## 9. Testing Strategy

### 9.1 Unit tests (new components)

- `ProgressiveRowCard.spec.ts`: renders basic slot by default, advanced slot hidden; click chevron toggles; chevron rotates; amber dot appears when `warningCount > 0` and collapsed; a11y attributes correct
- `AnimatedTotal.spec.ts`: renders initial value immediately; tweens to new value on change (use fake timers + rAF mock); settles to final value; rapid changes interrupt cleanly
- `SectionCompleteIndicator.spec.ts`: renders nothing / faint circle when not complete; renders checkmark when complete; pulse animation triggers on false→true transition
- `useCountUp.spec.ts`: returns source on mount; tweens on change; cleans up rAF on unmount
- `useExpandTransition.spec.ts`: hooks produce correct height measurements; overflow hidden during transition

### 9.2 Regression tests

- All 457 existing tests must pass with no changes
- Specifically verify:
  - Snapshot store writes still fire on every keystroke
  - Per-row validation still appears (now inside advanced slot when collapsed, with amber dot indicator)
  - Aggregate totals (UtangPribadiPanel, CicilanAktifPanel) still compute correctly
  - Quick-add buttons (CicilanAktifPanel) still add rows with correct presets
  - Live price integration (SahamPanel, CryptoPanel, EmasPanel) unaffected — these panels are NOT being refactored in Phase 8.1

### 9.3 Manual QA matrix

For each of 6 tabs, verify on desktop (1280px) and mobile (375px):

| Check | Pass criterion |
|---|---|
| Add row | Row slides in smoothly, focus moves to label input |
| Remove row | Row slides out, totals update with count-up |
| Expand advanced | Smooth height transition, chevron rotates, focus moves to first advanced field |
| Collapse advanced | Smooth height transition, basic slot remains visible |
| Collapsed warning | Amber dot appears on chevron when advanced slot has validation error |
| Section complete | Indicator appears/pulses when minimum data filled |
| Tab navigation | All tab transitions still work, no layout shift |
| Mobile layout | Basic slot stacks gracefully, advanced slot readable when expanded |

## 10. Implementation Order

| Day | Work |
|---|---|
| 1 (morning) | `useCountUp` + `useExpandTransition` composables + unit tests |
| 1 (afternoon) | `ProgressiveRowCard` component + unit tests |
| 2 (morning) | **Pilot:** extract `UtangPribadiRow.vue`, wrap in `ProgressiveRowCard`, manually verify |
| 2 (afternoon) | Wrap `GadaiRow.vue` in `ProgressiveRowCard` |
| 3 (morning) | Wrap `CicilanRow.vue` in `ProgressiveRowCard` |
| 3 (afternoon) | `AssetRowList` inline variant + unit tests |
| 4 (morning) | Refactor `PenghasilanForm` Penghasilan Lain section to inline-list |
| 4 (afternoon) | Refactor `PengeluaranForm` Pengeluaran Lain section to inline-list |
| 5 (morning) | `AnimatedTotal` component + integrate into `CollapsiblePanel :value` rendering |
| 5 (afternoon) | `SectionCompleteIndicator` + integrate into `CollapsiblePanel` |
| 6 | Full manual QA matrix (all 6 tabs × desktop + mobile), fix regressions, final commit |

## 11. Success Criteria

- All 457 existing tests pass
- New unit tests pass for all 5 new components and 2 composables
- Manual QA matrix shows zero regressions
- No store, calculation, or OJK posture changes (verifiable by diffing `stores/`, `lib/finance/`, `lib/ojk/`)
- Visual comparison: complex-row panels show fewer simultaneous fields at default state; simple-row panels show less visual chrome at 3+ rows

## 12. Risks and Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| `useExpandTransition` height measurement breaks on dynamic content (e.g., gadai warning messages appearing inside advanced slot) | Medium | Measure on each expand, re-measure if slot content mutates via `MutationObserver`; manual QA specifically tests gadai warning appears inside expanded slot |
| Count-up animation feels laggy on rapid input | Low | Cap tween duration at 400ms, interrupt-and-restart on new value |
| Amber-dot warning indicator confuses users (looks like notification) | Low | Use small 6px dot, not a badge; pair with chevron rotation; verify in manual QA |
| Refactoring `UtangPribadiPanel` inline pattern to extracted row component introduces bug | Medium | Pilot this refactor first (Day 2 morning) before touching GadaiRow / CicilanRow; full manual verification of UtangPribidi flow before proceeding |
| `AssetRowList` inline variant disrupts other surfaces using the component | Low | Default variant is `'card'` (current behavior); only snapshot panels pass `variant="inline"` |

## 13. Files Touched

**New:**
- `components/snapshot/ProgressiveRowCard.vue`
- `components/snapshot/AnimatedTotal.vue`
- `components/snapshot/SectionCompleteIndicator.vue`
- `components/snapshot/UtangPribadiRow.vue`
- `composables/useCountUp.ts`
- `composables/useExpandTransition.ts`
- Test files for each new component / composable

**Modified:**
- `components/snapshot/AssetRowList.vue` — add `variant` prop
- `components/snapshot/UtangPribadiPanel.vue` — use new `UtangPribadiRow.vue`
- `components/snapshot/GadaiRow.vue` — wrap in `ProgressiveRowCard`
- `components/snapshot/CicilanRow.vue` — wrap in `ProgressiveRowCard`
- `components/snapshot/PenghasilanForm.vue` — inline-list for Penghasilan Lain
- `components/snapshot/PengeluaranForm.vue` — inline-list for Pengeluaran Lain
- `components/snapshot/AsetLikuidPanel.vue` — pass `variant="inline"` to `AssetRowList`
- `components/snapshot/AsetNonLikuidPanel.vue` — pass `variant="inline"` to `AssetRowList`
- `components/snapshot/CollapsiblePanel.vue` — use `AnimatedTotal` for `:value`, add optional `:sectionComplete` prop

**Untouched (explicitly):**
- `stores/*` — no store changes
- `lib/finance/*` — no calculation changes
- `lib/ojk/*` — no OJK posture changes
- `components/snapshot/SahamPanel.vue`, `CryptoPanel.vue`, `EmasPanel.vue` — out of scope (live-price panels; complex in a different way; deferred to future spec)
- `pages/app/snapshot.vue` — no structural changes; benefits flow from component-level refactors

## 14. Open Questions

None at spec time. Implementation may surface edge cases to resolve inline; major deviations from this spec require re-review.
