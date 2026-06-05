# Phase 3: Mamikos Alignment — Anak Kos Persona

**Priority:** HIGH (the soul of the mini-product for the Mamikos Vibe Coding Contest)
**Primary persona:** Anak Kos (rental budget, lifestyle, frugal living)
**Secondary persona:** Juragan Kos (tease as "coming soon", not fully built)
**Status:** ✅ Implemented on branch `alignment` (codex-reviewed 2026-06-05, all findings resolved)

---

## Goal

Make Cermat feel like a **Mamikos product**, not a generic wealth tracker. Judges must instantly feel the brand connection when they first open the app.

---

## Implementation Priority

This is the canonical build order. Both docs in this folder follow this ordering:

1. **Persona & Gamification** — most impactful for contest judging
2. **CTA Mamikos** — brand affinity
3. **Copy rewrite** — feel "Mamikos" throughout
4. **Share Card** — viral growth engine
5. **Kos Rent Budget** — feature depth (stretch goal)

---

## Architecture Decision: Separate Pages

Phase 3 was originally planned as a single `/app/snapshot` page with mode branching. During implementation, this was changed to **two completely separate pages** to avoid contaminating the Wealth Tracker:

| Aspect | Budget Kos (`/app/budget-kos`) | Wealth Tracker (`/app/snapshot`) |
|--------|-------------------------------|----------------------------------|
| Layout | `default` (no sidebar) | `app` (sidebar + tab bar) |
| Tabs | 4 (Cash Flow, Kas, Utang, Ringkasan) | 6 (Cash Flow, Kas, Investasi, Aset Tetap, Utang, Ringkasan) |
| Ringkasan | Gamified persona hero + surplus + health cards | DashboardPanel + DashboardSummary + charts |
| Copy tone | Casual anak kos | Professional (`wt.*` overrides via `tm()`) |
| Demo data | Anak kos profile (gaji 3.5jt, paylater, motor) | Rio profile (gaji 6.5jt, KPR, saham, crypto) |
| CTA Mamikos | Shown in Ringkasan | Hidden |
| Persona card | Shown in Ringkasan (inline gradient hero) | Hidden |
| Emas panel | Not shown | Shown (with Maintenance badge) |

### Mode system
`stores/snapshot.ts` has `mode: AppMode | null` where `AppMode = 'budgetKos' | 'wealthTracker'`. Each page sets its mode on mount. The `tm()` helper in `lib/copy/strings.ts` resolves copy based on mode.

---

## Scope

### 3.1 Persona & Gamification ✅
- Persona system based on financial profile (deterministic rules, see `inspiration-and-ideas.md` §2)
- Persona hero card with gradient background, emoji, and glass-morphism stat boxes
- Appears in Budget Kos Ringkasan tab only

### 3.2 CTA Mamikos Integration ✅
- "Cari Kos Sesuai Budgetmu" link in Budget Kos Ringkasan
- Deep link to `https://mamikos.com`
- Hidden in Wealth Tracker

### 3.3 Copywriting & Branding ✅
- Dual copy system: base labels (casual) + `wt.*` overrides (professional)
- `tm()` helper resolves labels based on current mode
- Wealth Tracker shows: "Net Worth", "DSR", "Savings Rate", "Mau KPR"
- Budget Kos shows: "Total Kekayaanku", "Rasio Utang", "Sisa Uang/Bulan"

### 3.4 Share Feature (Next session)
- Share persona + key stats to social media
- Privacy: users must explicitly opt-in; amounts hidden by default
- Planned as P4 — not yet implemented

### 3.5 Kos Rent Budget (Stretch Goal)
- Track kos rent as a dedicated expense category
- Rent vs income ratio (ideal ≤30%)
- Only if time permits — not required for contest MVP

---

## Preservation Boundary

This phase adds **new layers** on top of existing finance logic. The boundary is:

### Allowed (done)
- Display-copy changes in `lib/copy/strings.ts` (base labels + `wt.*` overrides)
- New components that only **read** from existing stores
- Mode flag in `stores/snapshot.ts` (`mode: AppMode | null`)
- Conditional rendering via `v-if="isBudgetKos"` in existing components
- New page (`pages/app/budget-kos.vue`) with its own Ringkasan

### Zero-diff verified (Wealth Tracker untouched)
- `lib/finance/metrics.ts` — no changes
- `lib/finance/derived.ts` — no changes
- `lib/finance/goals.ts` — no changes
- `lib/finance/thresholds.ts` — no changes
- `lib/finance/emas.ts` — no changes
- All Wealth Tracker calculations, charts, and flows identical to main branch

---

## Out of Scope
- Juragan Kos full experience (tease "coming soon" only)
- Multi-currency (local target market)
- Bilingual (ID-only is sufficient)

---

## Success Criteria
- [x] Landing page instantly feels "Mamikos" (not a generic finance app)
- [x] Persona system works with deterministic rules (no ambiguous precedence)
- [x] CTA "Cari Kos di Mamikos" appears naturally in Budget Kos Ringkasan
- [x] Budget Kos and Wealth Tracker are completely separate pages with different dashboards
- [x] Wealth Tracker is zero-diff from main branch (verified via codex review)
- [x] Dual copy system: casual for Budget Kos, professional for Wealth Tracker
- [x] Separate demo data for each mode (anak kos profile vs Rio profile)
- [ ] Share button generates privacy-safe content (P4 — next session)

---

## References
- Visual refs: `docs/ide_4_revamp/reff/`
- Design guidelines: `docs/ide_3/personal-wealth-platform-design-guidelines-en.md`
- PRD: `docs/ide_3/personal-wealth-platform-prd-en.md`
