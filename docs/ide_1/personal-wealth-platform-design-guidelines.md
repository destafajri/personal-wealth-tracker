# Personal Wealth Platform — UI/UX Design Guidelines (MVP v1)

**Status:** Draft for Designer handoff
**Last updated:** 2026-05-25
**Source of truth for product scope:** `personal-wealth-platform-prd.md`
**Audience:** Designer (mid-to-senior product designer, Indonesian fintech context preferred)

---

## 1. Design Principles (non-negotiable)

1. **Trust is the product.** Every visual decision should reinforce "your data isn't going anywhere." If a component creates even a whiff of "this might be sending stuff somewhere," redesign it.
2. **Calm, not gamified.** This is finance, not Duolingo. No confetti, no streaks, no badges with shadows.
3. **Live feedback beats batched.** The dashboard breathes as the user types — no "Calculate" button anywhere.
4. **Honest about state.** Empty = empty. Stale = stale. "—" means "we don't have enough data yet" — never fake a number.
5. **Indonesian first.** Rupiah formatting, "kamu" not "Anda", local fintech context (KPR, BPJS, Pegadaian — designer must recognize these terms).
6. **Desktop-first, mobile-tolerated.** The job-to-be-done is sit-down financial review, not on-the-go. Don't waste design effort optimizing mobile beyond "works fine."

---

## 2. Page Structure & Layout

Single page. No routes. No nav. No modals except confirm dialogs.

### 2.1 Desktop layout (≥1280px)

```
┌──────────────────────────────────────────────────────────────────────┐
│  HEADER (sticky, 64px)                                                │
│  [Logo] Hitung wealth kamu. Tanpa daftar.       [↓ Download .xlsx]   │
├──────────────────────────────────┬───────────────────────────────────┤
│                                  │                                   │
│   INPUT PANEL (45%)              │   DASHBOARD PANEL (55%, sticky)   │
│   [Scrollable]                   │                                   │
│                                  │   ╔═══════════════════════════╗   │
│   [Tab: Aset · Cashflow · Utang] │   ║ NET WORTH                 ║   │
│                                  │   ║ Rp 1.245.000.000   ▲       ║   │
│   ▸ Aset Likuid                  │   ╚═══════════════════════════╝   │
│     • Kas & Tabungan      [ + ]  │                                   │
│     • Emas (gram)         [ + ]  │   ┌──────┬──────┬──────┐         │
│     • Deposito            [ + ]  │   │ DSR  │ Save │ Runway│        │
│     • Saham / RD          [ + ]  │   │ 33%● │ 22%● │ 8mo ● │        │
│     • SBN                 [ + ]  │   └──────┴──────┴──────┘         │
│     • Crypto              [ + ]  │                                   │
│                                  │   ALLOCATION                      │
│   ▸ Aset Non-Likuid              │   ┌───────────────┐               │
│     • Properti            [ + ]  │   │    ╱──╲       │  ● Kas 30%   │
│     • Kendaraan           [ + ]  │   │   │ Donut│    │  ● Emas 20%  │
│     • Dana Pensiun        [ + ]  │   │    ╲──╱       │  ● Saham 25% │
│                                  │   └───────────────┘  ● Prop 25%  │
│                                  │                                   │
├──────────────────────────────────┴───────────────────────────────────┤
│  FOOTER: 100% client-side · Tidak ada data dikirim ke server         │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 Critical layout rules

- **Dashboard panel is sticky** as user scrolls the input form. The whole point is live feedback — they must see it react.
- **Net Worth dominates** — it's the hero metric, full-width, 2× the size of supporting metrics.
- **Download CTA always visible** in header. Never hidden behind a menu.
- **No sidebar nav.** Tabs inside the input panel are fine (Aset / Cashflow / Utang) — those switch input context, not pages.

---

## 3. Key Screens & States

The designer should mock all four:

### 3.1 Empty state (first 5 seconds)
- Dashboard placeholders with greyed "—" for every metric
- Soft arrow + microcopy: *"Mulai dari sini ↑ — isi yang paling gampang dulu"*
- All metric badges neutral grey (no green/yellow/red until data exists)
- Donut chart: dashed-outline empty circle with *"Tambahkan aset untuk lihat alokasi"*

### 3.2 Partial state (during input)
- Metrics that can compute, do
- Metrics waiting on inputs show "—" + tooltip explaining what's still needed
  - Example: DSR tooltip → *"Butuh penghasilan + cicilan bulanan"*
- Skeleton animation only on first paint, not on every recalc

### 3.3 Healthy state (post-entry)
- All 4 metric badges colored
- Donut fully populated with hover-reveal of % breakdown
- Download button gets a subtle one-time pulse animation to draw attention

### 3.4 Edge / error states
- **Stale price:** Yellow inline badge near affected field — *"Harga emas terakhir update 2 jam lalu"* + retry icon + manual override field
- **Negative net worth:** Red number + small contextual tip — *"Liabilitas lebih besar dari aset. Fokus ke pelunasan utang dulu."*
- **Zero income:** DSR / Savings Rate cards show "—" with tooltip, not "0%" (distinguish "unknown" from "bad")

---

## 4. Component Library

### 4.1 Asset Row

```
┌────────────────────────────────────────────────────────────┐
│  Tabungan BCA              Rp 25.000.000     [✎]  [×]      │
└────────────────────────────────────────────────────────────┘
                     [ + Tambah tabungan ]
```

- Inline edit (no modal)
- Delete confirms only if value > 0
- "+ Tambah" link below each category, never a floating + button

### 4.2 Metric Card

```
┌──────────────────────────┐
│  DSR                  ●  │   ← color dot (green/yellow/red)
│  33%                     │   ← large tabular number
│  ┌────────────────────┐  │
│  │ Yellow Zone        │  │   ← threshold label
│  └────────────────────┘  │
│  Cicilan 33% dari        │   ← one-line plain-language explainer
│  penghasilan bulanan     │
└──────────────────────────┘
```

- Hero card (Net Worth): full width of dashboard panel
- Supporting cards (DSR, Savings Rate, Runway): 3 equal columns below
- Hover/focus: reveals formula (*"Cicilan ÷ Penghasilan"*)

### 4.3 Input field (currency)

- Right-aligned numeric input
- `Rp` prefix locked inside field on left
- Auto-format with `.` thousand separator as user types (`25000000` → `Rp 25.000.000`)
- Lenient parsing: accept `25.000.000`, `25000000`, `25jt` (parse as 25,000,000), `25 juta`
- Numeric mode on mobile: `inputmode="decimal"`

### 4.4 Input field (quantity, e.g. gold grams)

- Same as currency but no `Rp` prefix
- Suffix unit shown ghosted: `50 gram`
- Live conversion shown below: *"≈ Rp 65.000.000 @ Rp 1.300.000/gr"*

### 4.5 Download CTA

- Primary button, header right
- Default: *"↓ Download .xlsx"*
- Disabled when no data: *"Tambahkan minimal 1 aset"* (with tooltip explaining why)
- Hover preview: *"wealth-snapshot-2026-05-25.xlsx"*
- Post-click: brief inline success toast — *"Tersimpan. Simpan baik-baik ya."*

### 4.6 Reset button
- Secondary/ghost button at bottom of form
- Confirm dialog required: *"Hapus semua data yang kamu input? Aksi ini tidak bisa di-undo."*

---

## 5. Visual System

### 5.1 Color

| Token | Use | Notes |
|---|---|---|
| Green | Healthy thresholds | Must pass WCAG AA on white |
| Yellow | Warning thresholds | **Hardest to get right** — avoid pure yellow (#FFFF00); use amber/ochre. Pair with icon, never color alone |
| Red | Danger thresholds | Use sparingly — only on actual problem states |
| Neutral grey | Body, borders, empty states | Off-white background, not pure `#FFFFFF` (avoids spreadsheet feel) |
| Accent | Single brand accent for CTAs | TBD with brand work — avoid bank-blue (overdone by local fintech) |

**Anti-pattern to avoid:** Bibit/Pluang's saturated, child-like palettes. Andi is 28–35, not 18.

### 5.2 Typography

- **Numbers**: tabular figures (monospaced digits) for clean column alignment — non-negotiable
- **Headings**: Inter, Plus Jakarta Sans, or similar geometric sans
- **Body**: 16px minimum; 14px only for secondary labels
- **Hero numbers** (Net Worth): 40–48px, tabular, semi-bold

### 5.3 Indonesian Rupiah formatting

- `Rp 25.000.000` — period as thousand sep, space after `Rp`
- Large displays: never abbreviate as default. *"Rp 1,2 jt"* allowed only in space-constrained chart labels, with full value on hover
- Always show full value in primary positions (hero metric, asset rows)

---

## 6. Microcopy Tone Guide

| Use | Don't use |
|---|---|
| "kamu" | "Anda" |
| "wealth kamu" | "Total Kekayaan Bersih Pengguna" |
| "Yakin refresh? Datanya hilang lho" | "Apakah Anda yakin ingin me-refresh halaman ini?" |
| "Skip aja kalau gak ada" | "Lewati jika tidak berlaku" |
| "Cicilan kamu 33% dari gaji — masih oke" | "Rasio cicilan terhadap penghasilan: 33%" |

**Register:** casual professional. Like a friend who works at a bank, not the bank itself.

**Critical microcopy (must be perfect):**
- The 4 metric-card explainers (1 line each, plain language)
- The empty-state nudge
- The download confirmation
- The privacy footer
- The refresh-warning dialog

These deserve a dedicated copy pass — designer should flag them for PM review, not invent solo.

---

## 7. Trust Signals (visual)

Trust must be felt, not declared. Distribute across the page:

| Where | What |
|---|---|
| Header | No login button. Ever. Its absence is the signal. |
| Sub-hero | One line: *"Semua hitungan terjadi di browser kamu. Kita gak punya server buat nyimpen data."* |
| Near price fields | Mini network icon + *"Cuma harga emas/USD yang di-fetch, bukan data kamu"* |
| Footer | *"100% client-side. Open source — [lihat code]"* (if/when we OSS the FE) |
| On price API failure | Honest banner: *"Gagal ambil harga. Pakai harga manual aja."* — not a generic "Something went wrong" |

**Anti-pattern:** Don't add a giant "🔒 SECURE" badge. That's what scammy sites do.

---

## 8. Accessibility (WCAG AA target)

- All colored badges must pass AA contrast — **especially yellow** (designers consistently get this wrong)
- Color is never the sole signal — pair with icon or text label
- Full keyboard navigation through every input, in logical order
- ARIA live regions on dashboard cards so screen readers announce metric updates
- Focus states visible (not just `outline: none`)
- `inputmode="decimal"` on all number inputs for mobile keyboards

---

## 9. Responsive Behavior

| Breakpoint | Layout |
|---|---|
| ≥1280px | Side-by-side, 45 / 55 split, dashboard sticky |
| 1024–1279px | Side-by-side, 50 / 50, dashboard sticky |
| 768–1023px | Stacked: form on top, dashboard below. Anchor link in header: *"↓ Lihat dashboard"* |
| <768px | Stacked, single column. Small persistent hint: *"Lebih nyaman di desktop"* |

Mobile is **functional, not delightful**. Don't over-invest.

---

## 10. Out of Scope for v1 Designer

Do not spend time on:
- Dark mode (defer to v2)
- Animations beyond simple opacity/scale transitions
- Custom illustrations or mascots
- Onboarding tour / walkthrough overlays
- Logo and brand identity (separate workstream, do not block on it)
- iOS/Android native parity

---

## 11. Deliverables Expected

| Artifact | Format | Notes |
|---|---|---|
| Hi-fi mocks: empty / partial / healthy / mobile | Figma | All 4 states, desktop + mobile |
| Edge-state mocks | Figma | Stale price, negative net worth, zero income, API failure |
| Component library | Figma | All components in §4, with variants |
| Microcopy doc | Markdown / Figma comments | Must be reviewed with PM before mock finalization |
| Animation spec | Lottie or text | Recalc transition timing, download success toast |
| Accessibility QA checklist | Markdown | Contrast checks, keyboard flow, focus states |

---

## 12. Open Design Questions (designer to resolve with PM)

1. **Tab structure inside input panel** — is Aset / Cashflow / Utang the right grouping? Or one long scrollable list with section headers?
2. **Donut chart interaction** — hover-to-segment, click-to-drill, or pure display?
3. **Net Worth trend indicator (▲ / ▼)** — what does it compare to in v1 where there's no history? (Cut it? Or compare to "as you've been typing"?)
4. **Currency switcher** — IDR/USD toggle in header, or per-field? (Likely per-field, but confirm.)
5. **Asset row icons** — every asset type gets a small icon, or text-only for v1 lean scope?
6. **Print stylesheet** — do users want to print the dashboard? (Probably skip for v1.)

---

## 13. Reference Anti-Patterns

What this product should **not** look or feel like:

- **Bibit / Pluang** — too gamified, too saturated, too "growth marketing"
- **Mint / Personal Capital** — too dense, too chart-heavy, US-centric formatting
- **Generic Excel template** — too cold, no live feedback, no personality
- **Crypto dashboards** — too dark-mode-tradfi, candle-chart energy

What this **could** feel like:
- A clean, considered tax form that respects your time
- A focused calculator (Coda doc / Notion table) with a smart sidebar
- A privacy-respecting health tracker (Apple Health) — clinical but warm
