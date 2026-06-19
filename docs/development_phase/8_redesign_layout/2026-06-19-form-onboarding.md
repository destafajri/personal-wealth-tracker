# Phase 8.2 — Form Onboarding: Empty-State Redesign + Persona Template Picker

**Status:** Spec — awaiting user review
**Branch:** `improvement-ui-and-layout` (continuation of Phase 8.1 / 8.5 / 8.6)
**Scope:** All empty-state surfaces on `/app/snapshot` + new first-run persona picker banner + global "Ganti Profil" reset action
**Estimated effort:** ~1.5 working days
**Phase-2 constraint:** Visual / journey changes only. No calculation, OJK posture, or core store-behaviour changes. New personas write through existing `snap.reset()` + `snap.addXxx()` APIs.

---

## 1. Background

Phase 8.1 (structural) + 8.5/8.6 (interaction) made the snapshot form cleaner and safer. Phase 8.2 tackles the **first-run intimidation problem**: a brand-new user landing on `/app/snapshot` faces 6 empty tabs and ~30 empty input fields. Current empty states are minimal one-liners ("Belum ada cicilan aktif.") that give no guidance on what typical values look like or how to start.

Two coordinated improvements:

1. **Empty-state redesign** — replace one-liners with icon + 2-sentence context + (where applicable) 1-click quick-add chips that re-use Phase 8.5's smart-default presets.
2. **Persona template picker banner** — inline dismissible banner above the tab bar offering 5 starting-template personas. Selecting one pre-fills a realistic minimal snapshot the user can edit.

**Existing infrastructure** (per spec survey 2026-06-19):
- 5 wealthTracker personas already in `lib/fixtures/personas.ts` (Anak Konglo, Bocor, Paylater Numpuk, Hutan, Tanpa Utang). These are **diagnostic** personas for demo mode, not first-run templates — we add NEW templates separately (§4).
- Demo banner pattern at top of `pages/app/snapshot.vue` (shown when `snap.isDemo`) — we mirror this pattern for the persona picker.
- Quick-add chips exist for CicilanAktifPanel (Phase 8.5) and GadaiPanel (Phase 8.5) — we re-use these in empty states.

## 2. Goals

- **Reduce first-run intimidation** by offering a 1-click "start from realistic template" path via persona picker.
- **Make empty states useful** by showing typical values + 1-click presets where applicable.
- **Preserve user control** — every preset/template is editable; user can always dismiss the banner and start fresh.
- **Re-think reset** — current "Ganti Profil" lives only in demo banner; we add a global reset switch in the top nav for non-demo users.

## 3. Non-Goals

- **First-run modal** — dismissed as too heavy-handed per design discussion 2026-06-19. Inline banner chosen instead.
- **Progressive tab unlock** — dismissed as anti-pattern for finance apps (users often want to jump straight to Utang to check their debt situation).
- **Onboarding walkthrough / tooltip tour** — out of scope; would require new tour library.
- **Example chips for panels without quick-adds** (Utang Pribadi, Penghasilan Lain, etc.) — explicitly avoided per user decision §6.3; would risk users accidentally clicking mock data they didn't intend to add.
- **Diagnostic personas reuse** — existing 5 wealthTracker personas (Anak Konglo, Bocor, etc.) stay demo-only; new templates are a separate set with `kind: 'template'`.

## 4. Architecture

### 4.1 Persona templates (5 new)

Added to `lib/fixtures/personas.ts` with a new optional `kind` field discriminating `'diagnostic'` (existing) from `'template'` (new). The picker filters by `kind: 'template'`.

| id | emoji | label | gaji/bln | key snapshot fields |
|---|---|---|---|---|
| `pegawai-kpr` | 👔 | Pegawai KPR | 12jt | KPR cicilan 4jt/bln tenor 240bln bunga 7.5%, kas 50jt, RD 20jt |
| `freelancer` | 💻 | Freelancer | 10jt (variabel) | No KPR, kas darurat 30jt, aset likuid aja |
| `mahasiswa` | 🎓 | Mahasiswa | 3jt (uang saku) | No utang, kas 5jt, no investasi |
| `pasangan-muda` | 💑 | Pasangan Muda | 25jt (combined) | KPR 8jt/bln, cicilan motor 1.5jt, planning anak |
| `pensiunan` | 🌿 | Pensiunan | 6jt (pensiun) | Aset properti 500jt, kas 100jt, no KPR |

Each `apply(snap)` calls `snap.reset()` then seeds realistic minimal data. Numbers are **deliberate rough estimates** — copy makes clear user is expected to edit. Implementation note: the snapshot store's `addXxx` methods support partial patches (Phase 8.5 used this), so each persona is ~20 lines.

### 4.2 Persona picker banner

**New component** `components/snapshot/PersonaPickerBanner.vue`:

- Inline banner above the tab bar (same visual position as existing demo banner)
- Condition: `!snap.isDemo && !hasData && !bannerDismissed`
- Layout: info icon + heading "Pilih profil yang paling mirip" + 5 persona chips (emoji + label) + "Lewati, aku isi sendiri" link button
- Selecting a persona calls `applyPersona(snap, p, goals)` (existing helper) then auto-hides banner
- "Lewati" click sets `localStorage['cermat.personaBannerDismissed'] = '1'` then hides banner

### 4.3 Empty-state card component

**New component** `components/snapshot/EmptyStateCard.vue`:

- Props: `icon: Component`, `title: string`, `body: string`
- Slot `#actions` for optional quick-add chips
- Visual: rounded-card, surface-low bg, icon in colored circle (variant prop), title H3, body muted text
- Used by all panel empty states — replaces inline `t('xxx.empty')` one-liners

### 4.4 "Ganti Profil" reset action

**New component** `components/layout/HeaderResetButton.vue`:

- Mounts in `layouts/app.vue` top nav, next to theme toggle / export buttons
- Confirm dialog: "Reset semua data dan mulai dari profil?" → OK calls `snap.reset()` + clears `localStorage['cermat.personaBannerDismissed']` → persona picker banner reappears on snapshot page
- Hidden when `snap.isDemo` (demo banner has its own reset already)
- Icon: `RotateCcw` from lucide

### 4.5 Phase-2 invariant preservation

- All calculations in `lib/finance/`, `lib/ojk/`, `lib/derive.ts` — untouched
- New personas use existing `snap.addXxx` API (no new store methods needed; Phase 8.6 added `restoreXxx` but those aren't needed here)
- `localStorage` writes are UI-state only (banner dismissal); not user financial data
- Per-input store writes on every keystroke (B1 invariant) — preserved

## 5. Components

### 5.1 New components (3)

#### `components/snapshot/PersonaPickerBanner.vue`

Props: none (reads from store + localStorage directly).

Behaviour:
- Visible when `!snap.isDemo && !hasData && !bannerDismissed`
- 5 persona chips in flex-wrap row; clicking calls `applyPersona` then hides banner (does NOT set localStorage flag)
- "Lewati, aku isi sendiri" link button — sets `localStorage['cermat.personaBannerDismissed'] = '1'`, hides banner
- Auto-hides when `hasData` becomes true (user typed something manually) — does NOT set localStorage flag (so banner can resurface if user later clears all data)
- Reactive to `hasData` changes via `watch`

Accessibility:
- `role="region"` + `aria-label="Pemilih profil"`
- Persona chips are `<button>` with descriptive aria-labels
- Dismiss button has `aria-label="Lewati pemilih profil"`

Styling mirrors existing demo banner: `border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5` + Info icon.

#### `components/snapshot/EmptyStateCard.vue`

```ts
withDefaults(defineProps<{
  icon?: Component
  iconVariant?: 'emerald' | 'amber' | 'rose' | 'sky' | 'neutral'
  title: string
  body: string
}>(), { iconVariant: 'neutral' })
```

Layout:
```
┌─────────────────────────────────────────────┐
│  [icon]   Belum ada cicilan aktif            │
│           KPR umumnya Rp3-5jt/bln dengan     │
│           tenor 15-20thn. Klik preset atau   │
│           tambah custom.                     │
│           [Tambah KPR] [Tambah KPM] [+]      │  ← slot #actions
└─────────────────────────────────────────────┘
```

Slot `#actions` for chips — empty when panel has no chips (Utang Pribadi, Penghasilan Lain, etc.).

#### `components/layout/HeaderResetButton.vue`

Props: none.

Behaviour:
- Hidden when `snap.isDemo` (demo banner has its own reset)
- On click: `window.confirm('Reset semua data dan mulai dari profil?')`
- On confirm: `snap.reset()` + `localStorage.removeItem('cermat.personaBannerDismissed')` + `navigateTo('/app/snapshot')`
- Icon button with `RotateCcw` from lucide + tooltip "Reset data & ganti profil"

### 5.2 Modified components (8+)

- `lib/fixtures/personas.ts` — add `kind?: 'diagnostic' | 'template'` field to `SamplePersona` type + 5 new template persona entries
- `pages/app/snapshot.vue` — mount `<PersonaPickerBanner />` between unsaved-data warning + tab bar. **CRITICAL:** update existing demo banner filter from `PERSONAS.filter(p => p.mode === 'wealthTracker')` to `PERSONAS.filter(p => p.mode === 'wealthTracker' && p.kind !== 'template')` — otherwise the demo banner would leak all 5 new template personas into the demo picker. See §13 risk row "Demo Banner Leak".
- `layouts/app.vue` — mount `<HeaderResetButton />` in top nav
- `components/snapshot/CicilanAktifPanel.vue` — replace `t('cicilan.empty')` with `<EmptyStateCard>` + chip slot
- `components/snapshot/UtangPribadiPanel.vue` — same with no chips
- `components/snapshot/GadaiPanel.vue` — same with quick-add chips
- `components/snapshot/PenghasilanForm.vue` — empty state for Penghasilan Lain
- `components/snapshot/PengeluaranForm.vue` — empty state for Pengeluaran Lain
- `components/snapshot/AsetLikuidPanel.vue` + `AssetRowList.vue` — empty state per category (Kas, Deposito, RD, SBN)
- `components/snapshot/AsetNonLikuidPanel.vue` — empty state per category (Properti, Kendaraan, Pensiun)
- `lib/copy/strings.ts` — replace `xxx.empty` keys with richer 2-sentence variants + add new keys where needed

### 5.3 Untouched

- `stores/snapshot.ts` — uses existing `reset()` + `addXxx()` methods; no new store methods
- `lib/finance/*`, `lib/ojk/*` — no calculation changes
- Existing wealthTracker diagnostic personas (Anak Konglo, Bocor, etc.) — stay as-is for demo mode. Their `kind` field remains `undefined`; the demo banner's updated filter (`kind !== 'template'`) still matches them correctly via the negation.

## 6. UI / Copy Design

### 6.1 Empty-state copy (replaces existing one-liners)

| Panel | Old copy | New copy (title + body) |
|---|---|---|
| Cicilan Aktif | "Belum ada cicilan aktif." | **"Belum ada cicilan aktif."** KPR umumnya Rp3-5jt/bln dengan tenor 15-20thn. Klik preset di bawah atau tambah custom. |
| Utang Pribadi | "Belum ada utang pribadi." | **"Belum ada utang pribadi."** Pinjam ke keluarga / teman tanpa skema formal? Catat di sini biar masuk Net Worth. |
| Gadai | "Belum ada kontrak gadai." | **"Belum ada kontrak gadai."** Pegadaian emas standar 1%/bln tenor 4bln. Klik preset atau tambah custom. |
| Penghasilan Lain | "Belum ada penghasilan lain. Tambah kalau ada sampingan." | **"Belum ada penghasilan lain."** Freelance, THR, komisi, dividen — semua sampingan masuk sini. |
| Pengeluaran Lain | "Sewa, asuransi, biaya anak, dan lain-lain yang ga masuk pokok/lifestyle." | **"Belum ada pengeluaran lain."** Sewa, asuransi, biaya anak, langganan — yang ga masuk pokok/lifestyle. |
| Kas | (no current empty copy) | **"Belum ada catatan kas."** BCA, Mandiri, Jenius, dana darurat, dompet kas — semua saldo bank + tunai. |
| Deposito / RD / SBN | (no current empty copy) | **"Belum ada investasi pasif."** Deposito, reksa dana, SBN — yielding atau store-of-value. |
| Properti | (no current empty copy) | **"Belum ada properti."** Rumah, apartemen, tanah — nilai pasar sekarang. |
| Kendaraan | (no current empty copy) | **"Belum ada kendaraan."** Motor, mobil — nilai pasar (bukan harga beli). |
| Dana Pensiun | (no current empty copy) | **"Belum ada dana pensiun."** BPJS Ketengakerjaan, DPLK, dana pensiun lainnya. |

### 6.2 Persona picker banner copy

> ℹ️ **Pilih profil yang paling mirip, data otomatis keisi.** Kamu bisa edit bebas setelahnya.
>
> [👔 Pegawai KPR] [💻 Freelancer] [🎓 Mahasiswa] [💑 Pasangan Muda] [🌿 Pensiunan]
>
> *Lewati, aku isi sendiri*

### 6.3 Visual — persona chip

```
┌──────────────────┐
│ 👔  Pegawai KPR   │   ← bg-surface-card border-border, hover:border-primary
└──────────────────┘
```

Same pattern as existing persona chips in demo banner. Variant: white bg, primary border on hover/active.

### 6.4 Visual — "Ganti Profil" button in top nav

```
[↻ Reset Data]  [🌙]  [⬇]  [⚙]
```

Icon button (no label on mobile, optional tooltip on desktop). Confirm dialog prevents accidental reset.

## 7. Banner Mechanics (per user decision 2026-06-19)

**Show condition:**
```ts
const showBanner = computed(() =>
  !snap.isDemo
  && !hasData.value
  && !bannerDismissed.value
)
```

**`bannerDismissed` ref initialisation:**
```ts
const bannerDismissed = ref<boolean>(
  import.meta.client && localStorage.getItem('cermat.personaBannerDismissed') === '1'
)
```

**Three hide paths (hybrid A+B per user decision 2026-06-19):**

| Trigger | Set localStorage flag? | Resurface if data cleared later? | Rationale |
|---|---|---|---|
| User clicks persona chip | ✅ Yes | ❌ No | User committed to a profile; don't loop them back through picker if they later edit data |
| User clicks "Lewati" | ✅ Yes | ❌ No | Explicit dismissal — respect it permanently |
| User starts typing data manually | ❌ No | ✅ Yes | No explicit choice made; if user clears all data later, they might want the picker back |

Implementation: the localStorage flag is set inside `PersonaPickerBanner.vue`'s click handlers (not inside `applyPersona` itself — keep that helper pure so it stays reusable for demo flows).

## 8. "Ganti Profil" Reset Flow

```ts
// In HeaderResetButton.vue
function handleReset() {
  if (!window.confirm('Reset semua data dan mulai dari profil?')) return
  snap.reset()
  if (import.meta.client) {
    localStorage.removeItem('cermat.personaBannerDismissed')
  }
  navigateTo('/app/snapshot')
}
```

After reset:
- `snap.reset()` clears all data → `hasData` becomes false
- localStorage flag cleared → `bannerDismissed` becomes false
- Navigates to `/app/snapshot` → banner shows again

## 9. Testing Strategy

### 9.1 Unit tests

- `lib/fixtures/personas.ts` — verify all 5 template personas:
  - Have `kind: 'template'`
  - Are filtered correctly by `PERSONAS.filter(p => p.kind === 'template' && p.mode === 'wealthTracker')`
  - `apply(snap)` leaves a non-empty snapshot (penghasilan amount > 0 OR at least one row in any panel)
  - Numeric values are within realistic Indonesian ranges (e.g. KPR cicilanPerBulan between 1jt-15jt, not 1 or 1bn)
- `PersonaPickerBanner` show/hide logic — test the 3 hide paths from §7

### 9.2 Regression tests

- All 553 existing tests pass (no regression from Phase 8.1 + 8.5 + 8.6)
- Specifically verify:
  - Existing diagnostic personas (Anak Konglo, etc.) still filter by `mode: 'wealthTracker'` correctly with the new `kind` discriminator
  - Demo banner still shows when `snap.isDemo` (PersonaPickerBanner hidden in demo mode)
  - applyPersona still works as before for the demo personas

### 9.3 Manual QA matrix

For each tab × empty state, verify:
- Empty state card renders with icon + title + body
- CicilanAktifPanel empty state shows 4 quick-add chips that work
- GadaiPanel empty state shows 4 quick-add chips that work
- Other panels show plain "+ Tambah" button (no chips)
- Persona picker banner shows on first visit (clean localStorage)
- Clicking persona chip applies data, banner hides, snapshot has the persona's values
- Clicking "Lewati" hides banner permanently (verify localStorage)
- Manually typing data hides banner (no localStorage set)
- "Ganti Profil" button in top nav resets + brings banner back
- Banner doesn't show in demo mode

## 10. Implementation Order

| Day | Work |
|---|---|
| 1 morning | **FIRST: fix demo banner filter in `pages/app/snapshot.vue`** (`p.kind !== 'template'` added). Verify existing diagnostic personas still show in demo mode BEFORE adding any template personas. |
| 1 morning | Add 5 template personas to `lib/fixtures/personas.ts` + tests. Verify demo banner now shows 5 (not 10) personas. |
| 1 morning | `EmptyStateCard.vue` component |
| 1 afternoon | Wire all 8 empty-state upgrade points (copy + chips where applicable) |
| 1 afternoon | `PersonaPickerBanner.vue` + localStorage flag logic |
| 2 morning | `HeaderResetButton.vue` + mount in `layouts/app.vue` |
| 2 morning | Tests for banner show/hide logic |
| 2 afternoon | Manual QA across all tabs × empty + populated states + persona flows |

## 11. Files Touched

**New (4):**
- `components/snapshot/PersonaPickerBanner.vue`
- `components/snapshot/EmptyStateCard.vue`
- `components/layout/HeaderResetButton.vue`
- Test file(s) for personas + banner logic

**Modified (8+):**
- `lib/fixtures/personas.ts` — 5 new template personas + `kind` discriminator field
- `pages/app/snapshot.vue` — mount `<PersonaPickerBanner />`
- `layouts/app.vue` — mount `<HeaderResetButton />`
- 8 panel files for empty-state upgrades
- `lib/copy/strings.ts` — enrich existing `xxx.empty` keys, add new ones

**Untouched:**
- `stores/snapshot.ts` — uses existing `reset()` + `addXxx()` APIs
- `lib/finance/*`, `lib/ojk/*` — no calculation changes

## 12. Success Criteria

- All 553 existing tests pass + new tests pass
- Manual QA matrix shows zero regressions
- First-run experience: brand-new user lands on `/app/snapshot`, sees banner within 1 second, can pick a profile in 1 click and see realistic pre-filled data
- Empty states: every panel's empty state has icon + 2-sentence body + 1-click add (chips or plain button)
- Reset flow: "Ganti Profil" button clears data + brings banner back, works from any page in the app
- Phase-2 constraint honoured — verifiable by diffing `stores/`, `lib/finance/`, `lib/ojk/`

## 13. Risks and Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| **Demo Banner Leak** — existing demo banner filters by `mode === 'wealthTracker'` only; adding template personas would surface them in the demo picker | **High** (would ship broken) | **MUST** update demo banner filter to `p.mode === 'wealthTracker' && p.kind !== 'template'` in `pages/app/snapshot.vue`. This is the first implementation task before adding any template personas. Alternative (cleaner long-term): update the 5 existing personas with explicit `kind: 'diagnostic'` and filter strictly by `kind === 'diagnostic'`. Spec recommends the filter tweak for lower churn, with explicit-`kind` as a follow-up hardening. |
| Persona template values feel prescriptive / wrong | Medium | Copy explicitly says "data otomatis keisi, edit bebas setelahnya". Numbers are typical market values, not authoritative. |
| User accidentally clicks "Ganti Profil" and loses data | Medium | `window.confirm()` guard before reset. Future: toast with 5s undo (similar to Phase 8.6) |
| localStorage flag conflicts with browser privacy mode | Low | Wrap localStorage access in `import.meta.client` + try/catch; banner just always shows if storage unavailable |
| Banner shows too aggressively (resurfaces on every data clear) | Low | Only resurfaces if user typed-then-cleared without ever picking persona or clicking Lewati. Both pick + Lewati set the permanent flag. |
| EmptyStateCard copy doesn't fit mobile width | Low | Test in QA; use `text-sm` body + responsive line-height |
| Diagnostic personas accidentally show in template picker | Low | Filter explicitly by `kind === 'template'` — diagnostic personas have no `kind` field (undefined) so won't match |

## 14. Open Questions

None at spec time. User decisions captured in §6.3, §7, §8.

## 15. Out of Scope (Future Phases)

- **Phase 8.3** — Layout polish (sidebar + segmented tab control with count badges)
- **Phase 8.4** — Gamification (Cermat Score badges, achievement toasts)
- **Phase 8.7** — Contextual placeholder rotation per panel
- **Phase 8.8** — Multi-level undo history
- **Phase 8.9** — Cross-session undo persistence
- **Phase 8.10** — Onboarding tooltip tour (would need new tour library)
- **Phase 8.11** — Progressive tab unlock with opt-in "guided mode" (current decision: out of scope, anti-pattern)
- **Undo for "Ganti Profil" reset** — current spec uses window.confirm; future could integrate with Phase 8.6 UndoToast for 5s restore window
