# Phase 3: Ideas & Inspiration — Mamikos Alignment

**Source:** Adapted from Gemini prompt + Cermat codebase analysis
**Date:** 2026-06-05
**Status:** Codex-reviewed 2026-06-05, findings addressed

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
| 2 | Investor Kos | `hasInvestments && savingsRate >= 0` | Cool, "bright future" |
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
| Landing page | "Mulai Cek Keuangan, Cari Kos Pas di Mamikos" | Entry point |
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

## 6. Multiple Entry Points on Landing Page

### Concept
Two entry points on the landing page with different experiences but the same underlying engine.

### Mode-difference matrix
Defines exactly which screens/components differ by mode and which remain identical:

| Screen / Component | `mode=kos` | `mode=full` | Diff? |
|--------------------|------------|-------------|-------|
| Landing page (`pages/index.vue`) | Two CTA cards | Two CTA cards | No |
| Snapshot form (`components/snapshot/`) | Full form (same) | Full form (same) | **No** |
| Snapshot field visibility | All fields shown | All fields shown | **No** |
| Dashboard sidebar | Same | Same | **No** |
| Persona card | Shown | Shown | **No** |
| CTA Mamikos | Shown | Shown | **No** |
| Share card | Shown | Shown | **No** |
| Copy tone | Anak kos casual | Current professional | **Yes** |

### Decision: defer mode branching
After analysis, the **only difference** between modes is copy tone. The actual screens, fields, and components are identical. Rather than implementing a `mode` param that branches copy logic throughout the app, we will:

1. **Rewrite all copy to anak kos tone** (single mode, no branching)
2. Keep "Wealth Tracker Lengkap" link on landing as a second CTA pointing to the same `/app/snapshot` route
3. No `?mode=` param, no conditional UI, no forked flows

This eliminates the implementation risk of a partial app fork while still providing two distinct CTAs on the landing page.

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

Both CTAs navigate to `/app/snapshot` — no mode param, no branching.

---

## Constraints
- DO NOT change core calculation logic in `lib/finance/` — only read outputs
- DO NOT change behavior/calculation/OJK posture — preservation guard applies
- All client-side, no database needed
- Consistent with existing design system (Tailwind tokens)
- OJK disclaimer text stays formal (regulatory requirement)
