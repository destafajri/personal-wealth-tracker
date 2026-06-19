# Phase 8.3 — Layout Polish: Count Badges + Sidebar Hero + Mobile Tabs + Color + Typography

**Status:** Spec — awaiting user review
**Branch:** `improvement-ui-and-layout` (continuation of Phase 8.1 / 8.2 / 8.5 / 8.6)
**Scope:** `SnapshotTabBar`, `DashboardSummary`, `assets/css/main.css`, app-wide type scale
**Estimated effort:** ~2.5 working days
**Phase-2 constraint:** Visual / layout changes only. No calculation, OJK posture, store, or behaviour changes.

---

## 1. Background

Phase 8.1 (structural), 8.5/8.6 (interaction), 8.2 (onboarding) reshaped the snapshot form. Phase 8.3 polishes the **frame around the form**: the tab bar (navigation), the sidebar (always-visible summary), the color system (dark mode refinement), and the typography scale.

The current state is solid but has 5 incremental opportunities surfaced during Phase 8.1–8.2 work:

1. **Tab bar shows no row counts** — user can't see at-a-glance which tabs have data without clicking each one.
2. **Sidebar treats all stats equally** — `netWorth` (the most important number) sits at the same visual weight as Kas/Investasi/AsetTetap subtotal rows.
3. **Mobile tabs hide labels** — `sm:inline` collapses to icon-only on phone, making tabs ambiguous (Cash Flow icon vs Kas icon vs Aset Tetap icon all look similar).
4. **Dark mode emerald reads slightly hot** — `--color-primary` at full saturation in dark mode causes eye strain per screenshot analysis.
5. **Typography is informal** — sizes/weights follow convention but aren't codified into a scale; risk of drift over time.

## 2. Goals

- **At-a-glance progress** via count badges on tabs
- **Visual hierarchy in sidebar** with Net Worth as hero
- **Mobile tab legibility** with always-visible labels
- **Dark mode eye comfort** via primary color softening
- **Codified type scale** that prevents drift

## 3. Non-Goals

- Sidebar information architecture redesign (which stats to show) — out of scope, current set is well-tuned
- Adding new tabs or removing existing ones
- Light mode color changes — light mode is already well-tuned
- Font family changes (Inter/Plus Jakarta Sans stay)
- Replacing ECharts donut with a different visualization
- Re-introducing the heavy Phase-1 dashboard panel (the current compact sidebar stays)

## 4. Architecture

### 4.1 Count badges on tabs

Extend `SnapshotTabBar.vue` to accept a `counts: Record<string, number>` prop. Parent (`pages/app/snapshot.vue`) computes per-tab counts from store and passes them down.

Counts per tab:
- `cash-flow`: `penghasilanCount` + `pengeluaranCount` (1 each if filled, 0 if empty)
- `kas-tabungan`: `asetLikuid.kas.length`
- `investasi`: `asetLikuid.deposito.length + reksaDana.length + sbn.length + emasEntries + saham.length + crypto.length`
- `aset-non-likuid`: `asetNonLikuid.properti.length + kendaraan.length + pensiun.length`
- `utang`: `cicilanAktif.length + utangPribadi.length + gadai.length`
- `ringkasan`: always 0 (this is the dashboard, no entries)

Badge visual:
- Hidden when count === 0
- When count > 0: small pill `bg-[var(--color-primary)]/15 text-[var(--color-primary)] text-[10px] font-semibold rounded-full px-1.5 min-w-[1.25rem] text-center`
- Sits inline after the label, before the icon-chevron

### 4.2 Sidebar hero number

Refactor `DashboardSummary.vue` to promote `netWorth` to a hero treatment at the top:

```
┌────────────────────────────────┐
│  Net Worth                      │
│  Rp 1,234,567,890              │   ← 32px bold tabular-nums
│  ↑ Rp 12jt dari surplus bln ini │   ← 12px muted, contextual
└────────────────────────────────┘
─── small divider ───
[ existing stats grid below unchanged ]
```

Hero number:
- Label: "Net Worth" — `text-xs uppercase tracking-wider text-muted`
- Value: `text-3xl font-bold tabular-nums text-text-primary` (32px)
- Subtitle: surplus-derived context — `text-xs text-muted`

Existing stats grid (Kas, Investasi, Aset Tetap, Utang, Surplus, DSR) stays as the secondary block below.

### 4.3 Mobile tab redesign

Current: `sm:inline` hides labels on phone (icons only).
Proposed: horizontally scrollable tab bar with **icons + labels always visible**, overflow-x-auto.

```vue
<div class="flex items-center gap-1 overflow-x-auto rounded-[var(--radius-card)] ...">
  <button v-for="tab" class="flex shrink-0 items-center gap-2 ...">
    <component :is="tab.icon" />
    <span class="text-xs whitespace-nowrap">{{ tab.label }}</span>
    <CountBadge v-if="counts[tab.id] > 0" :count="counts[tab.id]" />
  </button>
</div>
```

- Each tab `shrink-0` so they don't compress
- Container `overflow-x-auto` for horizontal swipe
- Hide scrollbar via `scrollbar-width: none` + `::-webkit-scrollbar { display: none }`
- Active tab gets same primary treatment as before

### 4.4 Dark mode color softening

In `assets/css/main.css`, add dark-mode overrides for **all three semantic accent colors** (per user decision 2026-06-19):

```css
@media (prefers-color-scheme: dark) {
  :root[data-theme="dark"] {
    /* Soften accents for eye comfort in dark mode */
    --color-primary: oklch(0.72 0.14 165);        /* emerald — slightly muted */
    --color-warning-amber: oklch(0.75 0.13 75);   /* amber — slightly muted */
    --color-danger-rose: oklch(0.70 0.16 15);     /* rose — slightly muted */
  }
}
```

(approximate values — actual tuning happens during implementation by sampling in browser)

Effect: all three accent colors read slightly softer in dark mode, less radioactive against dark surfaces. Light mode unchanged. Goal: cohesive, comfortable palette across the dark theme.

### 4.5 Typography scale

Codify in `assets/css/main.css` as utility classes:

```css
@layer components {
  .text-hero    { @apply text-3xl font-bold tabular-nums; }     /* 32px — sidebar hero */
  .text-h1      { @apply text-xl font-bold; }                   /* 20px — page title */
  .text-h2      { @apply text-lg font-semibold; }               /* 18px — section title */
  .text-h3      { @apply text-base font-semibold; }             /* 16px — subsection */
  .text-body    { @apply text-sm font-normal; }                 /* 14px — body */
  .text-caption { @apply text-xs font-normal; }                 /* 12px — caption */
  .text-micro   { @apply text-[11px] font-normal; }             /* 11px — meta */
}
```

Apply opportunistically — replace inline `text-lg font-semibold` etc. with the utility classes **only where the change is a clean swap**. No global find-replace; risk of regressions too high. Focus on:
- `CollapsiblePanel` headers → `.text-h3`
- `EmptyStateCard` title → `.text-h3`, body → `.text-caption`
- `PersonaPickerBanner` heading → `.text-h3`
- `DashboardSummary` hero → `.text-hero`, section labels → `.text-caption`

Other components keep their existing inline classes (already follow the scale informally).

## 5. Components

### 5.1 New (1)

#### `components/snapshot/TabCountBadge.vue`

Tiny pill for tab counts.

Props: `count: number`, `maxDisplay?: number` (default 99 — shows "99+" for higher).

Behaviour:
- Returns null when count === 0 (caller uses v-if, but defensive)
- Renders `<span>` with primary tint bg + tabular-nums count

### 5.2 Modified (5)

- `components/snapshot/SnapshotTabBar.vue` — accept `counts?: Record<string, number>` prop, render `TabCountBadge` per tab, mobile-friendly horizontal scroll
- `components/layout/DashboardSummary.vue` — add Net Worth hero block at top, push existing stats below
- `pages/app/snapshot.vue` — compute tab counts map from store, pass to SnapshotTabBar
- `assets/css/main.css` — dark mode primary override + typography utility classes
- `components/snapshot/CollapsiblePanel.vue` + `EmptyStateCard.vue` + `PersonaPickerBanner.vue` — opportunistic typography utility adoption (clean swaps only)

### 5.3 Untouched

- `stores/`, `lib/finance/`, `lib/ojk/` — no changes
- All calculation logic — preserved
- Existing color tokens (light mode values) — preserved

## 6. Implementation Order

| Day | Work |
|---|---|
| 1 morning | `TabCountBadge.vue` + extend `SnapshotTabBar` to accept counts + render badges |
| 1 morning | Compute tab counts map in `snapshot.vue`, pass to tab bar |
| 1 afternoon | Mobile horizontal scroll for tab bar (always-visible labels + scrollbar hidden) |
| 1 afternoon | `DashboardSummary` hero number block + tests |
| 2 morning | Dark mode primary color override in `main.css` + manual eye-comfort QA |
| 2 morning | Typography utility classes in `main.css` |
| 2 afternoon | Opportunistic typography class adoption in 3-4 components |
| 2 afternoon | Manual QA across all 6 tabs × desktop + mobile + dark/light modes |

## 7. Files Touched

**New (1):** `components/snapshot/TabCountBadge.vue`  
**Modified (5):**
- `components/snapshot/SnapshotTabBar.vue`
- `components/layout/DashboardSummary.vue`
- `pages/app/snapshot.vue`
- `assets/css/main.css`
- `components/snapshot/{CollapsiblePanel,EmptyStateCard,PersonaPickerBanner}.vue` (typography adoption)

**Untouched:** `stores/*`, `lib/finance/*`, `lib/ojk/*`

## 8. Success Criteria

- All 569 existing tests pass + new tests for tab count logic
- Manual QA shows count badges appear on tabs with data, hidden on empty tabs
- Sidebar hero shows Net Worth prominently (3x larger than other stats)
- Mobile tabs show icons + labels + counts in horizontally scrollable bar
- Dark mode emerald reads slightly softer (eye comfort)
- Typography utility classes used in ≥3 components without regression
- Phase-2 constraint honoured — no store / calc / OJK changes

## 9. Risks and Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Count badge crowds tab on narrow mobile | Medium | `whitespace-nowrap` on label + badge; horizontal scroll absorbs overflow |
| Hero number crowds sidebar at small heights | Low | Hero block uses existing surface-card padding; stats grid below scrolls in sticky sidebar |
| Dark mode color change affects screenshots / brand consistency | Medium | Tune incrementally (sample 3-4 values in browser); keep light mode identical |
| Typography utility adoption causes layout regressions in components | Low | Only adopt where current classes are a clean swap (same size + weight). Skip components with bespoke sizing. |
| Mobile tab scroll feels janky | Low | Use native `overflow-x-auto` with `-webkit-overflow-scrolling: touch` + hide scrollbar via CSS |
| Count for "investasi" tab is misleading (sums 6 categories) | Medium | Use total row count across all investasi sub-panels; consider tooltip "X rows across Deposito/RD/SBN/Emas/Saham/Kripto" via title attribute |

## 10. Resolved Open Questions (user decisions 2026-06-19)

1. **Count badge format:** ✅ **Plain pill, no brackets.** Just the number in a smooth rounded background — `bg-[var(--color-primary)]/15 text-[var(--color-primary)] rounded-full text-[10px] font-semibold px-1.5 min-w-[1.25rem] text-center`. No literal `[`, `]`, `·`, or `③` characters. Modern minimal pill.
2. **Hero subtitle:** ✅ **Dynamic surplus-derived** with three branches:
   - `surplus > 0` → `↑ Rp {surplus} dari surplus bln ini` (emerald up-arrow)
   - `surplus === 0` → `Nilai bersih kamu` (static, muted)
   - `surplus < 0` → `↓ Rp {|surplus|} karena defisit` (rose down-arrow)
3. **Dark mode scope:** ✅ **Soften ALL three accent colors** — primary (emerald), warning (amber), danger (rose). Tune each toward slightly lower lightness + saturation in dark mode only. Goal: cohesive, comfortable palette. Light mode unchanged.

## 11. Out of Scope (Future Phases)

- **Phase 8.3.1** — Tune additional accent colors for dark mode (emerald/amber/rose)
- **Phase 8.3.2** — Sidebar information architecture review (add/remove stats based on user feedback)
- **Phase 8.4** — Gamification (Cermat Score badges, achievement toasts)
- **Phase 8.7** — Contextual placeholder rotation
- **Phase 8.8** — Multi-level undo history
- **Phase 8.9** — Cross-session undo persistence
- **Phase 8.10** — Onboarding tooltip tour
