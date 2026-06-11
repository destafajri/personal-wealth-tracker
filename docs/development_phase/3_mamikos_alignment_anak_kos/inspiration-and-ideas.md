# Phase 3: Ideas & Inspiration — Mamikos Alignment

**Source:** Adapted from Gemini prompt + Cermat codebase analysis
**Date:** 2026-06-05
**Status:** ✅ Implemented on branch `alignment`

---

## Implementation Priority

This is the canonical build order (also stated in README.md):

1. **Persona & Gamification** (most impactful for contest)
2. **CTA Mamikos** (brand affinity)
3. **Copy rewrite** (feel "Mamikos" throughout)
4. **Share Card** (viral growth engine)
5. **Kos Rent Budget** (feature depth — stretch goal)

---

## 1. Rewrite Copy & Parameters — Anak Kos Vibe

### Approach
Map existing copy in `lib/copy/strings.ts` to anak kos versions. Not a full replacement — change user-facing items (form labels, hints, metric names) so it feels "Mamikos".

### Example mapping (to be confirmed):
| Current | Anak Kos Version |
|---------|------------------|
| Pendapatan Bulanan | Uang Saku / Gaji Bulanan |
| Pengeluaran | Biaya Hidup Bulanan |
| Cicilan Aktif | Utang / Cicilan |
| Modal Siap | Tabungan Darurat |
| Net Worth | Total Kekayaanku |
| Savings Rate | Sisa Uang per Bulan |
| Runway | Bisa Bertahan ... Bulan |
| DSR | Rasio Utang |
| Cek KPR | Simulasi Budget Ngekos |
| Mau KPR | Mau Kos / Sewa? |
| Mau Gadai | Butuh Dana Darurat? |

### Files to touch
- `lib/copy/strings.ts` — main copy registry
- `lib/copy/metric-explainers.ts` — metric explanations
- `components/snapshot/` — panel form labels
- `pages/index.vue` — landing copy
- `components/simulator/SimLauncher.vue` — wizard card labels

### Notes
- Metric names in `lib/finance/metrics.ts` (internal) are NOT changed — only display copy
- OJK disclaimer text stays formal (regulatory requirement)

---

## 2. Gamification — Anak Kos Financial Persona

### Concept
After the user fills in their snapshot, the system assigns a "Persona" based on their financial profile. Rides on existing metrics.

### Persona table (deterministic — first match wins, top to bottom):
| # | Persona | Criteria | Tone |
|---|---------|----------|------|
| 1 | Sultan Kos | `savingsRate >= 40 && hasInvestments` | Flex, but inspiring |
| 2 | Bibit Investor | `hasInvestments && savingsRate >= 0` | Cool, "bright future" |
| 3 | Anak Kos Bijak | `savingsRate >= 15` | Positive, relatable |
| 4 | Pejuang Akhir Bulan | `runway < 1` (month) | Empathy + actionable tips |
| 5 | Sobat Indomie | fallback (everything else) | Funny, with a nudge |

### Precedence rules
- Rules are evaluated top-to-bottom. **First match wins.**
- `hasInvestments` = any of `saham`, `reksaDana`, `crypto`, or `deposito` > 0
- `savingsRate` = existing metric from `lib/finance/metrics.ts` (read-only)
- `runway` = existing metric (read-only)
- If all inputs are zero/empty, show "Isi snapshot dulu ya!" (no persona)

### Implementation ideas
- Persona card appears on dashboard after snapshot is filled
- Eye-catching badge/icon
- Reveal animation (confetti? slide-in?)
- Persona can change as user updates data

### Files to create/modify
- New: `lib/finance/persona.ts` — pure function, reads existing metrics only
- New: `components/dashboard/PersonaCard.vue` — persona display
- `lib/copy/strings.ts` — persona copy registry

---

## 3. Share Card — Spotify Wrapped Style

### Concept
An aesthetic card summarizing persona + key stats for social media sharing. Like Spotify Wrapped — people share because it looks cool, not because they're asked to.

### Privacy model
- **Default share content:** persona name + badge only (no amounts)
- **User opt-in:** toggle to include ratios (savings rate %, runway months) — still no raw IDR amounts
- **Never shared without explicit tap:** raw net worth, asset values, debt values
- Rationale: finance-adjacent product in a public contest — safe defaults prevent accidental oversharing

### Design ideas:
- Card with gradient background, instagrammable
- Persona badge + optional ratios (savings rate %, runway)
- "Cermat x Mamikos" branding
- QR code or link to app

### Share methods:
- **Copy text** — pre-filled template: "Aku [Persona]! Cek keuanganmu juga di Cermat x Mamikos!"
- **Share to Twitter/X** — compose tweet with text + link
- **Share to WhatsApp** — wa.me deep link
- **Download as image** — html2canvas or similar (nice-to-have)

### Implementation ideas
- New: `components/common/ShareCard.vue` — share card component
- New: `composables/useShare.ts` — share logic (copy + social media deep links)
- Persona card has a share button that triggers ShareCard

### Notes
- Client-side only — no backend needed
- Card output must match on-screen persona (no stale data)

---

## 4. CTA Mamikos Integration

### Concept
Natural CTAs that appear at the right moment, not a generic banner.

### CTA placement ideas:
| Moment | CTA | Relevance |
|--------|-----|-----------|
| After viewing persona | "Cari Kos Sesuai Budgetmu di Mamikos" | Natural next step |
| Rent ratio >30% of income | "Budget sewamu terlalu besar! Cari kos yang lebih murah?" | Actionable |
| Landing page | "Mulai Cek Keuangan, Cari Kos Sekitar Kamu" | Entry point |
| Bottom of dashboard | "Mau pindah kos? Cek dulu budgetmu" | Soft nudge |

### Target URL
- `https://mamikos.com` (default)

### Implementation ideas
- New: `components/common/CtaMamikos.vue` — reusable CTA component
- Placed at strategic locations
- Styling: eye-catching but not intrusive

---

## 5. Kos Rent Budget (from ex-Phase 6)

### Concept
Track kos rent as part of expenses. Not a new module, but an enhancement to the snapshot form.

### Ideas:
- Kos rent as a dedicated expense category
- Rent vs income ratio (ideal ≤30%)
- Tips for saving on kos expenses

---

## 6. Multiple Entry Points on Landing Page — ✅ Implemented

### Architecture: Separate pages (not mode branching)

Each CTA on the landing page now routes to its own page with a completely different experience:

| Aspect | Budget Kos (`/app/budget-kos`) | Wealth Tracker (`/app/snapshot`) |
|--------|-------------------------------|----------------------------------|
| Layout | `default` (no sidebar, no top tab bar) | `app` (sidebar + Track/Plan/Decide tabs) |
| Tabs | 4 (Cash Flow, Kas, Utang, Ringkasan) | 6 (full) |
| Ringkasan | Gamified persona hero + surplus + health cards | DashboardPanel + charts + goals |
| Copy tone | Casual anak kos (base labels) | Professional (`wt.*` overrides via `tm()`) |
| Demo data | Anak kos profile (gaji 3.5jt, paylater, motor) | Rio profile (gaji 6.5jt, KPR, saham, crypto) |
| CTA Mamikos | Shown in Ringkasan | Hidden |
| Persona card | Shown in Ringkasan (inline gradient hero) | Hidden |

### Mode system
`stores/snapshot.ts` has `mode: AppMode | null` where `AppMode = 'budgetKos' | 'wealthTracker'`. Each page sets its mode on mount:
- `budget-kos.vue`: `snap.mode = 'budgetKos'` then `triggerBudgetKosDemo()`
- `snapshot.vue`: `triggerDemoFromQuery()` first (which calls `reset()`), then `snap.mode = 'wealthTracker'`

### Dual copy system
`lib/copy/strings.ts` has:
- Base labels: casual anak kos tone (e.g., "Total Kekayaanku", "Rasio Utang")
- `wt.*` overrides: professional tone (e.g., "Net Worth", "DSR")
- `tm(key, mode)` helper: returns `wt.*` version when mode=`wealthTracker`, base otherwise

### Landing page routing
Landing modal routes are dynamic based on which CTA card was clicked:
- "Cek Tipe Anak Kos Kamu" → `/app/budget-kos` (fresh) or `/app/budget-kos?demo=1` (with data)
- "Wealth Tracker Lengkap" → `/app/snapshot` (fresh) or `/app/snapshot?demo=1` (with data)

### Landing layout
```
┌─────────────────────────────────────────────┐
│              CERMAT x MAMIKOS               │
│                                             │
│    "Cermat ngatur keuangan, biar ngekos     │
│     makin tenang"                            │
│                                             │
│   ┌──────────────┐  ┌──────────────────┐    │
│   │ 🏠 Cek       │  │ 📊 Wealth        │    │
│   │ Budget       │  │ Tracker          │    │
│   │ Ngekos       │  │ Lengkap          │    │
│   │              │  │                  │    │
│   │ Cek dulu     │  │ Track aset,      │    │
│   │ kamu tipe    │  │ utang, investasi │    │
│   │ anak kos     │  │ secara detail    │    │
│   │ apa?         │  │                  │    │
│   │              │  │                  │    │
│   │ [Mulai →]    │  │ [Mulai →]        │    │
│   └──────────────┘  └──────────────────┘    │
└─────────────────────────────────────────────┘
```

### Files changed
- `pages/app/budget-kos.vue` — **new** page with inline Ringkasan
- `pages/app/snapshot.vue` — mode set after demo trigger
- `stores/snapshot.ts` — `AppMode` type + `mode` ref
- `lib/copy/strings.ts` — `wt.*` overrides + `tm()` helper
- `lib/fixtures/demoSnapshot.ts` — `applyBudgetKosDemo()` + `triggerBudgetKosDemo()`
- `components/layout/DashboardPanel.vue` — `v-if="isBudgetKos"` on PersonaCard/CtaMamikos
- `components/dashboard/HeroPair.vue` — `tm()` for metric labels
- `components/dashboard/MetricCard.vue` — `tm()` for metric labels
- `components/layout/TopNav.vue` — `tm()` for brand subtitle
- `components/simulator/SimLauncher.vue` — `tm()` for card labels
- `pages/app/simulator.vue` — `tm()` for title/subtitle
- `pages/index.vue` — dynamic modal route based on `pendingMode`

---

## Constraints
- DO NOT change core calculation logic in `lib/finance/` — only read outputs
- DO NOT change behavior/calculation/OJK posture — preservation guard applies
- All client-side, no database needed
- Consistent with existing design system (Tailwind tokens)
- OJK disclaimer text stays formal (regulatory requirement)
