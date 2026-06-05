# Phase 3: Ideas & Inspiration — Mamikos Alignment

**Source:** Adapted from Gemini prompt + Cermat codebase analysis
**Date:** 2026-06-05

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
- `components/simulator/WizardLauncher.vue` — wizard card labels

### Notes
- Metric names in `lib/finance/metrics.ts` (internal) are NOT changed — only display copy
- OJK disclaimer text stays formal (regulatory requirement)

---

## 2. Gamification — Anak Kos Financial Persona

### Concept
After the user fills in their snapshot, the system assigns a "Persona" based on their financial profile. Rides on existing metrics.

### Persona ideas (based on Savings Rate + Modal Siap + assets):
| Persona | Criteria | Tone |
|---------|----------|------|
| Sultan Kos | Savings Rate >40%, has investments | Flex, but inspiring |
| Anak Kos Bijak | Savings Rate 15-40%, disciplined | Positive, relatable |
| Sobat Indomie | Savings Rate <15% or negative | Funny, with a nudge |
| Investor Kos | Has stocks/mutual funds/crypto despite living in kos | Cool, "bright future" |
| Pejuang Akhir Bulan | Runway <1 month | Empathy + actionable tips |

### Logic (pseudo):
```
if (savingsRate >= 40 && hasInvestments) → Sultan Kos
if (savingsRate >= 40 && !hasInvestments) → Anak Kos Bijak
if (savingsRate >= 15) → Anak Kos Bijak
if (hasInvestments && savingsRate >= 0) → Investor Kos
if (savingsRate < 0) → Pejuang Akhir Bulan
else → Sobat Indomie
```

### Implementation ideas
- Persona card appears on dashboard after snapshot is filled
- Eye-catching badge/icon
- Reveal animation (confetti? slide-in?)
- Persona can change as user updates data

### Files to create/modify
- New: `lib/finance/persona.ts` — pure function persona logic
- New: `components/dashboard/PersonaCard.vue` — persona display
- `components/layout/DashboardPanel.vue` — mount persona card
- `lib/copy/strings.ts` — persona copy registry

---

## 3. Share Card — Spotify Wrapped Style

### Concept
An aesthetic card summarizing persona + key stats for social media sharing. Like Spotify Wrapped — people share because it looks cool, not because they're asked to.

### Design ideas:
- Card with gradient background, instagrammable
- Persona + 3-4 key stats (Total Kekayaan, Savings Rate, Runway)
- "Cermat x Mamikos" branding
- QR code or link to app

### Share methods:
- **Copy text** — pre-filled template: "Aku [Persona]! 💰 Total kekayaanku Rp X, bisa bertahan Y bulan tanpa penghasilan. Cek keuanganmu juga di Cermat x Mamikos!"
- **Share to Twitter/X** — compose tweet with text + link
- **Share to WhatsApp** — wa.me deep link
- **Download as image** — html2canvas or similar (nice-to-have)

### Implementation ideas
- New: `components/common/ShareCard.vue` — share card component
- New: `composables/useShare.ts` — share logic (copy + social media deep links)
- Persona card has a share button that triggers ShareCard

### Notes
- Client-side only — no backend needed
- Privacy: user must explicitly click share, don't auto-generate

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
- Could be deep link to Mamikos search with budget range (if API available)

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
- Average rent comparison per city (nice-to-have)
- Tips for saving on kos expenses

---

## Implementation Priority

1. **Persona & Gamification** (most impactful for contest)
2. **CTA Mamikos** (brand affinity)
3. **Copy rewrite** (feel "Mamikos" throughout)
4. **Share Card** (viral growth engine)
5. **Kos Rent Budget** (feature depth)

---

## 6. Multiple Entry Points on Landing Page

### Concept
Instead of a single "Mulai Sekarang" CTA, create **two entry points** with different experiences but the same underlying app:

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

### Path 1: "Cek Budget Ngekos" (Anak Kos)
- Lightweight flow, quick snapshot
- Casual anak kos copy
- Instantly get Persona (Sultan Kos / Sobat Indomie / etc)
- Share card + CTA Mamikos
- Target: viral growth, brand affinity

### Path 2: "Wealth Tracker Lengkap" (Serious)
- Existing flow as-is
- Full snapshot + all wizards
- Professional but accessible copy
- For users who want to seriously track assets
- Target: functional depth

### Implementation
- Landing page (`pages/index.vue`) has two CTA cards
- Set entry mode via URL params or localStorage: `/app/snapshot?mode=kos` vs `/app/snapshot?mode=full`
- UI components detect mode → adjust copy, show/hide persona card, adjust form fields
- Both use the same calculation engine, only UX layer differs

### Why this works
- Judges see "Mamikos" in the first path → instant brand affinity score
- Serious users still get full power → no functionality lost
- One codebase, two experiences → efficient

---

## Constraints
- DO NOT change core calculation logic in `lib/finance/` — only read outputs
- DO NOT change behavior/calculation/OJK posture — preservation guard applies
- All client-side, no database needed
- Consistent with existing design system (Tailwind tokens)
- OJK disclaimer text stays formal (regulatory requirement)
