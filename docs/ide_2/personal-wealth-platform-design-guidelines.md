---
name: Zenith Wealth v2
project_id: zenith-wealth-v2
target_market: Indonesian retail investors (Bayu persona — sophisticated value investor)
language_primary: Bahasa Indonesia (casual register, "kamu" not "Anda")
language_secondary: English (terminology only — Net Worth, DSR, etc.)
platform: Web, desktop-first
brand_personality: Professional · Trustworthy · Calm · Privacy-First · Disciplined
colors:
  primary: '#1B4332'             # Deep forest green — brand anchor, primary CTAs
  primary-dark: '#012D1D'        # Hero text, headers
  primary-container: '#274E3D'   # Hover states, container fills
  accent-emerald: '#2D6A4F'      # Healthy threshold, active progress
  accent-emerald-soft: '#86AF99' # Progress bar fills, secondary indicators
  warning-amber: '#D97706'       # Caution thresholds, stale data
  danger-rose: '#BE123C'         # Negative net worth, defisit warning
  gold: '#C9A961'                # Gold reserves (Cadangan) — physical asset signifier
  gold-muted: '#9C8554'          # Gold pawned (Tertahan) — not-yours-right-now
  surface: '#F8F9F5'             # Main canvas — warm off-white (NOT pure white)
  surface-card: '#FFFFFF'        # Elevated card surfaces
  surface-low: '#F3F4F1'         # Sub-card / table-row alternating
  surface-input: '#FFFFFF'       # Input field background
  border: '#E5E7EB'              # 1px input borders, row dividers
  border-strong: '#C1C8C2'       # Focused border, tab underline
  text-primary: '#1F2937'        # Body text, primary numbers
  text-secondary: '#6B7280'      # Helper text, "Rp" prefix, labels
  text-muted: '#9CA3AF'          # Disabled, empty-state placeholders
  text-on-primary: '#FFFFFF'     # Text on primary-color buttons
typography:
  font_family_primary: Plus Jakarta Sans
  font_family_numeric: Plus Jakarta Sans (font-variant-numeric: tabular-nums)
  headline-hero:       { size: 48px, weight: 700, leading: 1.2, tracking: -0.02em } # Net Worth
  headline-lg:         { size: 32px, weight: 600, leading: 1.3 }                    # Section titles
  headline-md:         { size: 24px, weight: 600, leading: 1.3 }                    # Sub-section
  metric-value:        { size: 24px, weight: 600, leading: 1.4, tabular: true }     # Metric card numbers
  body-md:             { size: 16px, weight: 400, leading: 1.6 }                    # Body text
  label-sm:            { size: 14px, weight: 500, leading: 1.4 }                    # Field labels
  label-xs:            { size: 12px, weight: 600, leading: 1.2, tracking: 0.04em }  # Tag/pill labels
spacing:
  baseline: 8px
  container_max: 1440px
  input_panel_width: 45%
  dashboard_panel_width: 55%
  gutter: 32px
  page_margin: 40px
  stack_xs: 4px
  stack_sm: 8px
  stack_md: 16px
  stack_lg: 24px
  stack_xl: 32px
shapes:
  radius_input: 4px      # Inputs, buttons, asset rows
  radius_card: 8px       # Metric cards, sub-panels
  radius_pill: 9999px    # Status dots, LIVE pills
elevation:
  level_0: none                                  # Background
  level_1: 1px solid #E5E7EB                     # Cards, inputs (border-based, not shadow)
  level_2: 0px 4px 12px rgba(0,0,0,0.03)         # Hero metric card only
  level_dropzone: 2px dashed #C1C8C2             # Idle drop zone
  level_dropzone_active: 2px solid #1B4332       # Drag-over drop zone
---

# Zenith Wealth v2 — Complete Design Prompt

> **How to use this document:** This is the complete brief for generating the Zenith Wealth v2 web application UI in [Stitch](https://stitch.withgoogle.com/). The frontmatter above contains all design tokens. The sections below describe brand, layout, components, and screens to generate. Use the "Screens to Generate" section (§9) as your Stitch screen prompts.

---

## 1. Project Intent (paste this as the Stitch project description)

**Zenith Wealth** is a privacy-first web app for Indonesian retail investors who run **disciplined stock-accumulation strategies**. It replaces the elaborate Google Sheets / Excel trackers these users already maintain (with per-stock target lots, gold-pawning ledgers, and live-price formulas) — but with a UI that doesn't break when GOOGLEFINANCE goes down.

**The core promise:**
1. No signup. No account. No server-side persistence of user data.
2. The user's `.xlsx` file is the canonical state. The web app is a friendlier renderer.
3. Live prices are proxied through our backend, but **no user portfolio data ever leaves the browser**.
4. Every session: **Import .xlsx → use → Export .xlsx → close tab.** Zero data residue.

**Primary persona — "Bayu":**
- 30–45, Indonesian, monthly income IDR 25–80jt (often self-employed or business owner)
- Holds 10–25 IDX stocks with explicit target weights per emiten (ticker)
- Pawns gold at Pegadaian to fund stock accumulation (very common locally)
- Cares about Safe Haven (gold + cash + RD) vs Productive (saham + lain) ratio
- Tracks dividend yield as recurring cashflow, not just capital appreciation
- Currently maintains a 5-sheet xlsx with ~50 formulas; wants to keep it but stop fighting it

**Secondary persona — "Andi":** casual salaried professional who only fills the basic Aset and Cashflow tabs and ignores Akumulasi / Gadai. Lives in the simplified subset.

---

## 2. Brand & Voice

**Brand personality:** Professional · Trustworthy · Calm · Privacy-First · Disciplined.

The aesthetic is **Modern Corporate with a Minimalist focus** — heavy whitespace, sophisticated off-white surfaces, precise typography. The product should feel like **a well-organized private banking ledger**, not a gamified retail-trading app.

**Reference anti-patterns** (what this product is NOT):
- ❌ Bibit / Pluang — too gamified, too saturated, too "growth marketing"
- ❌ Stockbit — too dense, too "trader floor"
- ❌ Mint / Personal Capital — too dense, US-centric, bank-blue heritage
- ❌ Generic Excel template — too cold, no personality, no live feedback
- ❌ Crypto dashboards — dark-mode-tradfi candle-chart energy

**Reference inspirations:**
- ✅ A clean tax form that respects your time
- ✅ A focused calculator (Coda doc / Notion table) with a smart sidebar
- ✅ Apple Health — clinical but warm, privacy-respecting
- ✅ Linear's information density without its developer-coded feel

**Voice / microcopy register:**

| Use ✓ | Avoid ✗ |
|---|---|
| "kamu" (casual second-person) | "Anda" (formal) |
| "Net Worth Kamu" | "TOTAL KEKAYAAN BERSIH PENGGUNA" |
| "Yakin refresh? Datanya hilang lho" | "Apakah Anda yakin ingin me-refresh halaman ini?" |
| "Skip aja, isi yang lain dulu" | "Lewati jika tidak berlaku" |
| "Cicilan kamu 33% dari gaji — masih oke" | "Rasio cicilan terhadap penghasilan: 33%" |
| "Data kamu tetap di komputer kamu sendiri" | "Your data stays on your device" *(must be Indonesian)* |

**Tone:** casual professional. Like a friend who works at a bank, not the bank itself.

---

## 3. Color System

The palette is anchored in **Forest Greens** and **Warm Off-Whites**, deliberately avoiding the ubiquitous "Bank Blue" of local fintech.

### 3.1 Semantic role of each color

| Token | Hex | Use |
|---|---|---|
| **Primary** | `#1B4332` | Wordmark, primary CTAs ("Download .xlsx"), tab underline, key headings |
| **Primary Dark** | `#012D1D` | Hero numerals (Net Worth), strongest headers |
| **Accent Emerald** | `#2D6A4F` | Healthy thresholds, active progress bars, success states |
| **Warning Amber** | `#D97706` | Caution thresholds (DSR 30–40%, Rasio Tertahan 50–70%), stale-price badges |
| **Danger Rose** | `#BE123C` | Negative net worth, monthly defisit > 0, critical Gadai liquidation risk. Use sparingly |
| **Gold** | `#C9A961` | Gold reserves (Cadangan) bar — physical-asset signifier |
| **Gold Muted** | `#9C8554` | Gold pawned (Tertahan) — visually says "not yours right now" |
| **Surface** | `#F8F9F5` | Main canvas, page background |
| **Surface Card** | `#FFFFFF` | Elevated cards (metric cards, drop zones) |
| **Border** | `#E5E7EB` | Default 1px borders on inputs, asset rows, dividers |

### 3.2 Color logic rules
- **Surfaces are tonal, not shadowed** — use color depth (`#F8F9F5` background, pure `#FFFFFF` cards) rather than drop shadows for hierarchy
- **Only the Net Worth hero card** gets a subtle shadow (`0px 4px 12px rgba(0,0,0,0.03)`)
- **Status dots are 8px circles** in green/amber/rose — placed top-right of each metric card, paired with a text label (color is never the sole signal)
- **Gold uses muted ochre** (`#C9A961`), never bright/yellow — gold is precious, not playful

---

## 4. Typography

**Plus Jakarta Sans** for everything. Tabular figures (`font-variant-numeric: tabular-nums`) is **non-negotiable** on every number — financial data must align in vertical scans.

### 4.1 Type scale

| Style | Size | Weight | Use |
|---|---|---|---|
| `headline-hero` | 48px / 700 | Net Worth hero number only |
| `headline-lg` | 32px / 600 | Page section titles ("Aset", "Akumulasi") |
| `headline-md` | 24px / 600 | Sub-section titles, expanded card titles |
| `metric-value` | 24px / 600 tabular | All metric card primary numbers |
| `body-md` | 16px / 400 | Body text, descriptions, microcopy |
| `label-sm` | 14px / 500 | Field labels, helper text |
| `label-xs` | 12px / 600 tracking 0.04em | Pills, tags, "LIVE" badges, "ESTIMASI" badges |

### 4.2 Currency rendering rules
- Always `Rp 25.000.000` format — period as thousand separator (Indonesian convention), space after `Rp`
- The `Rp` prefix is rendered in `text-secondary` (`#6B7280`) — slightly lighter than the number itself, so magnitude dominates
- Never abbreviate as default (no "Rp 25 jt") — abbreviation allowed only in tight chart labels with full value on hover
- Right-align all numeric inputs and table columns
- Hero number (Net Worth): tabular, semi-bold, `#012D1D`, 48px

---

## 5. Layout System

### 5.1 Container & grid
- Max container width: **1440px**, centered
- Page margin: **40px** left/right on desktop
- Split layout: **45% input panel / 55% dashboard panel** with **32px gutter**
- Dashboard panel is **sticky** while input panel scrolls
- 8px baseline spacing rhythm; component padding uses `stack_md` (16px) by default

### 5.2 Responsive breakpoints
| Breakpoint | Layout |
|---|---|
| ≥1280px | Side-by-side 45/55, dashboard sticky |
| 1024–1279px | Side-by-side 50/50, dashboard sticky |
| 768–1023px | Stacked: input form on top, dashboard below. Header anchor link *"↓ Lihat dashboard"* |
| <768px | Stacked single column. Persistent small hint: *"Lebih nyaman di desktop"* |

Mobile is **functional, not delightful** — don't over-invest.

### 5.3 Page anatomy (after entry)
```
┌──────────────────────────────────────────────────────────────────────┐
│  HEADER (sticky, 64px)                                                │
│  [Zenith Wealth wordmark]              [↓ Download .xlsx] [Import]   │
├──────────────────────────────────────────────────────────────────────┤
│  INPUT PANEL (45%)               │   DASHBOARD PANEL (55%, sticky)  │
│                                  │                                   │
│  [Aset · Cashflow · Utang & Gadai · Akumulasi]                       │
│                                  │   [10-metric dashboard]           │
│  [Scrollable form content]       │                                   │
│                                  │                                   │
├──────────────────────────────────┴───────────────────────────────────┤
│  FOOTER: 100% client-side · Data kamu tetap di komputer kamu sendiri │
└──────────────────────────────────────────────────────────────────────┘
```

### 5.4 Tab structure (the four input tabs)
1. **Aset** — Kas, Logam Mulia, Saham, Reksa Dana, SBN, Crypto, Properti, Kendaraan, Dana Pensiun
2. **Cashflow** — Income (Salary, Estimasi Dividen, Other), Expenses (Tetap, Variabel)
3. **Utang & Gadai** — Gadai Emas (Cadangan/Tertahan/Piutang), Utang Konsumsi, Utang Jangka Panjang
4. **Akumulasi** — Per-emiten target lots, progress bars, accumulation ladders, Saran panel *(the heart of v2)*

Active tab has `#1B4332` underline (2px), inactive tabs use `#6B7280` text.

---

## 6. Elevation & Depth

This is a **flat tonal system** — depth is built with color layers, not drop shadows.

| Level | Treatment | Use |
|---|---|---|
| **Level 0** | `#F8F9F5` background | Page canvas |
| **Level 1** | `#FFFFFF` + `1px solid #E5E7EB` border | Cards, inputs, asset rows |
| **Level 2** | Level 1 + `0px 4px 12px rgba(0,0,0,0.03)` | **Net Worth hero card only** |
| **Drop zone idle** | `2px dashed #C1C8C2` on `#F8F9F5` | Import drop zone, idle |
| **Drop zone active** | `2px solid #1B4332` on `#F3F4F1` | Drop zone, drag-over |

**Hover states:** subtle 2% darker background, never an elevation change. Keeps the interface feeling stable.

---

## 7. Shape Language

Soft, precise. Not cartoonish, not institutional.

| Component | Radius |
|---|---|
| Inputs, buttons, asset rows | **4px** (`radius_input`) |
| Cards, metric cards, sub-panels | **8px** (`radius_card`) |
| Status dots, LIVE pills, ESTIMASI badges | **fully rounded** (`radius_pill`) |
| Donut chart strokes | **flat caps** (not rounded ends) — preserves data-fidelity feel |
| Progress bar fills | flat caps |

---

## 8. Components

### 8.1 Header (sticky)

- Height 64px, surface `#FFFFFF`, 1px bottom border `#E5E7EB`
- Left: Zenith Wealth **wordmark** (NOT a building/columned-bank icon — explicitly avoid institutional iconography)
- Right: two CTAs side-by-side — `[Download .xlsx]` (primary filled `#1B4332`) and `[Import]` (secondary outlined)
- No login. No avatar. No menu. The absence is the trust signal.

### 8.2 Primary Button
- Filled `#1B4332`, white text, 4px radius
- Padding: 12px 20px
- Hover: background `#274E3D`
- Disabled: 40% opacity + tooltip with explanation ("Tambahkan minimal 1 aset")

### 8.3 Secondary Button
- Outlined `1px solid #E5E7EB`, text `#1F2937`, 4px radius
- Used for "Import", "Tambah aset", "Reset"

### 8.4 Ghost / Danger Button
- Transparent background, `#BE123C` text — used for "Reset Data"
- Always triggers confirm dialog

### 8.5 Input Field (currency)
- Surface `#FFFFFF`, 1px border `#E5E7EB`, 4px radius, 48px height
- Left: `Rp` prefix in `#6B7280` (inside field, fixed position)
- Right-aligned numeric input
- Auto-format with `.` thousand separator as user types
- Lenient parsing: accepts `25000000`, `25.000.000`, `25jt`, `25 juta`
- Mobile: `inputmode="decimal"`
- Active state: `1px solid #1B4332` border (no glow/halo)

### 8.6 Input Field (quantity — gold grams, stock lots, crypto qty)
- Same shell as currency but no `Rp` prefix
- Unit suffix ghosted: `50 gram`, `0.05 BTC`, `30 Lot`
- Live conversion shown below: *"≈ Rp 65.000.000 @ Rp 1.300.000/gr"*

### 8.7 LIVE Pill
- 12px radius pill, `accent-emerald-soft` background, `accent-emerald` text
- Used inline next to fetched prices (gold/gram, IDX stock price, USD/IDR)
- Companion text below: *"Last updated 14:32"*

### 8.8 ESTIMASI Pill
- Same shape as LIVE pill, but `warning-amber` background tone
- Used on Estimasi Dividen Income and any computed-not-realized figure
- Reinforces honesty — we don't pretend computed figures are realized cash

### 8.9 Metric Card (Dashboard)

```
┌──────────────────────────┐
│  DSR                  ●  │   ← color dot (green/amber/rose)
│  33%                     │   ← metric-value style, tabular
│  ┌────────────────────┐  │
│  │ Yellow Zone        │  │   ← amber pill label
│  └────────────────────┘  │
│  Cicilan 33% dari        │   ← 14px helper text, casual Indonesian
│  penghasilan bulanan     │
└──────────────────────────┘
```

- 8px radius, `#FFFFFF` surface, `1px solid #E5E7EB`
- Width: equal-thirds within the dashboard panel
- Hover reveals formula tooltip (e.g., *"Cicilan ÷ Penghasilan"*)
- Empty state: number replaced by "—" (em-dash), color dot greyed

### 8.10 Hero Metric Card (Net Worth)
- Full-width of dashboard panel
- Tonal level 2 (subtle shadow)
- Number is **headline-hero** (48px, 700) in `#012D1D`
- Below number: small trend hint only if data exists (skip in v1 — there's no history to compare)
- Label: *"Net Worth Kamu"* (not "TOTAL KEKAYAAN BERSIH" — casual register)

### 8.11 Asset Row (inline list item)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Tabungan BCA               Rp 25.000.000            [✎]  [×]        │
└──────────────────────────────────────────────────────────────────────┘
                       [ + Tambah tabungan ]
```

- 48px tall, `#FFFFFF` surface, 1px bottom border `#E5E7EB`
- Edit icon opens inline edit (no modal)
- Delete confirms only if value > 0
- "+ Tambah" is a text link below the list, never a floating + button

### 8.12 Per-Emiten Stock Card *(NEW in v2 — primary new component)*

**Collapsed state (default):**
```
┌──────────────────────────────────────────────────────────────────────┐
│  BBCA   Lots: 162 / 450 (36%)    [██████░░░░░░░░░░░░░░░░]      ▾    │
│  @Rp 10.667 LIVE  ·  Rp 173.005.400  ·  Bobot 17% (target 20% ●)   │
└──────────────────────────────────────────────────────────────────────┘
```

- 72px tall collapsed, soft `#FFFFFF` background, 1px border
- Progress bar: `accent-emerald-soft` filled portion, `surface-low` empty portion, 6px tall, full row width
- Bobot drift indicator (●): green if within ±2%, amber if 2–5% off, rose if >5%
- All bars align vertically across stocks in the list (tabular)

**Expanded state (click `▾`):**
```
┌──────────────────────────────────────────────────────────────────────┐
│  BBCA   Lots: 162 / 450 (36%)    [██████░░░░░░░░░░░░░░░░]      ▴    │
│  @Rp 10.667 LIVE  ·  Rp 173.005.400  ·  Bobot 17% (target 20% ●)   │
├──────────────────────────────────────────────────────────────────────┤
│   Akumulasi Ladder — modal untuk capai:                              │
│      10% sisa lot   ·  Rp  30.720.960     [ Beli ✎ ]                │
│      30% sisa lot   ·  Rp  92.162.880                                │
│      50% sisa lot   ·  Rp 153.604.800                                │
│      70% sisa lot   ·  Rp 215.046.720                                │
│      100% sisa lot  ·  Rp 307.209.600                                │
│                                                                       │
│   Dividen:                                                            │
│      Avg yield (estimasi)        4.2%  →  Rp ±7.265.000 / tahun     │
│      Last dividen / lembar       Rp 225                              │
│      Potensi by last dividen     Rp 3.645.000 / tahun                │
│                                                                       │
│   [Edit target lots] [Edit target bobot] [Hapus]                     │
└──────────────────────────────────────────────────────────────────────┘
```

- Accumulation ladder uses monospaced tabular layout — feels like a broker's order pad
- "Beli ✎" inline link marks a purchase (updates current lots in form)
- The most recently edited card stays auto-expanded; others collapse on tab leave

### 8.13 Gadai Panel *(NEW in v2 — under Utang & Gadai tab)*

```
┌──────────────────────────────────────────────────────────────────────┐
│  ▾ Gadai Emas (Pegadaian)                                            │
│                                                                       │
│  ┌── Emas Kamu ──────────────────────────────────────────────────┐  │
│  │  Cadangan total       70.06 gram      [█████████████████████] │  │
│  │  Tertahan (pawned)    20.49 gram      [█████░░░░░░░░░░░░░░░░] │  │
│  │  Free                 49.57 gram                                │  │
│  │  Rasio Tertahan       29%   ✓ Aman (<50%)                      │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌── Piutang Gadai ─────────────────────────────────────────────┐   │
│  │  Pokok Pinjaman    Rp 18.000.000                              │   │
│  │  Tempo             4 bulan                                     │   │
│  │  Bunga             1.5% / bulan                                │   │
│  │  Total Beban       Rp 19.080.000                               │   │
│  │  Defisit / bulan   Rp    250.000   ⚠️ Kemampuan bayar tipis    │   │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

- Cadangan bar uses `#C9A961` (gold)
- Tertahan bar uses `#9C8554` (gold-muted) — same hue, lower saturation
- Rasio Tertahan thresholds: <50% green ✓, 50–70% amber ⚠️, >70% rose 🚨 ("Risiko likuidasi")
- Defisit shown in `#BE123C` when > 0

### 8.14 Drop Zone *(NEW in v2 — Import flow)*

**Idle:**
```
┌──────────────────────────────────────────────┐
│                                              │
│             ⬇ DRAG FILE KE SINI              │
│             atau klik untuk pilih            │
│                                              │
│      Format: .xlsx dari Zenith Wealth        │
│                                              │
└──────────────────────────────────────────────┘
   2px dashed #C1C8C2 border, #F8F9F5 surface
```

**Drag-over:**
- 2px solid `#1B4332` border
- Background `#F3F4F1`
- Copy changes to *"Lepas di sini"*

**Validating / Hydrating:**
- Solid border, primary color
- Progress bar + itemized log: *"Memuat 14 saham, 5 cadangan emas, 1 KPR..."*
- Itemization is critical — reinforces "this is your data, we're just reading it"

### 8.15 Donut Chart (Allocation)
- 12px stroke width, flat caps
- Largest segments use `primary` (`#1B4332`) and `accent-emerald` (`#2D6A4F`)
- Smaller segments fade through `accent-emerald-soft` → grey tones
- Center text: **total IDR value** (NOT "100%" — meaningless)
- Legend on right with category, color dot, percentage

### 8.16 Safe Haven vs Produktif Bar
- Single horizontal stacked bar, full panel width
- Left half color `#C9A961` (Safe Haven — Emas/Cash/RD), right half color `#2D6A4F` (Produktif — Saham/Lain)
- Label above with percentage split: `Safe Haven 58% ████░░░ 42% Produktif`
- Status badge below: 🛡️ AMAN / ⚖️ Seimbang / 🚀 Agresif

### 8.17 Allocation Discipline Drift Bars
- One mini-bar per emiten, ordered by absolute drift (largest first)
- Bar centered on zero — positive drift extends right, negative drift extends left
- Hover/click jumps to that stock's card on the Aset tab

### 8.18 Trust Signal Footer
- Full-width, `#F3F4F1` background, centered text
- *"🔒 100% client-side · Data kamu tetap di komputer kamu sendiri"*
- Right-aligned secondary links: *Kebijakan Privasi · Metodologi · Bantuan*

---

## 9. Screens to Generate

> **For Stitch:** Each screen below is a separate generation prompt. Generate them in order — later screens reference patterns from earlier ones.

### Screen 1 — Landing / Entry Choice (NEW)

The first thing a fresh visitor sees. Pre-empts the main app.

```
┌──────────────────────────────────────────────────────────────────────┐
│  HEADER: [Zenith Wealth wordmark]                                     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│             Hitung wealth kamu. Tanpa daftar. Tanpa cloud.            │
│             Semua data tinggal di komputer kamu.                      │
│                                                                       │
│     ┌──────────────────────────┐  ┌──────────────────────────┐      │
│     │                          │  │                          │      │
│     │      MULAI BARU          │  │   IMPORT .XLSX KAMU      │      │
│     │   Mulai dari nol         │  │  Drag file ke sini       │      │
│     │                          │  │  atau klik untuk pilih   │      │
│     │    [ Start →  ]          │  │   [ Pilih file ]          │      │
│     │                          │  │                          │      │
│     └──────────────────────────┘  └──────────────────────────┘      │
│                                                                       │
│       💡 Belum pernah pakai? Pilih "Mulai Baru".                     │
│       Punya file dari sesi sebelumnya? Import aja.                   │
│                                                                       │
│  FOOTER: 🔒 100% client-side · Data kamu tetap di komputer kamu      │
└──────────────────────────────────────────────────────────────────────┘
```

**Design notes:**
- Both CTAs have equal visual weight — neither is "primary"
- The Import card is itself a drop zone (whole card area)
- No login button. No social proof. No marketing fluff. The trust pitch is the only message.

---

### Screen 2 — Aset Tab (Saham section, populated)

The main app, with the Aset tab active, scrolled to the Saham section.

**Required elements:**
- Header (sticky)
- Tab bar: `[Aset (active) · Cashflow · Utang & Gadai · Akumulasi]`
- Aset sub-section headers: "Aset Likuid" → "Saham"
- 5–8 per-emiten cards in collapsed state, sorted by Bobot Live %
- Inline "Tambah Saham" link below the list
- Sticky dashboard on the right with all 10 metrics (Net Worth hero + 4 health cards + 2 balance-sheet + 1 posture bar + 1 donut + 1 drift bars)

**Sample data to use:**
- BBCA: 162/450 lots, @Rp 10.667 LIVE, Bobot 17% / Target 20%
- BBRI: 149/450 lots, @Rp 4.580 LIVE, Bobot 11% / Target 15%
- BMRI: 134/368 lots, @Rp 6.250 LIVE, Bobot 12% / Target 12%
- ASII: 38/222 lots, @Rp 5.100 LIVE, Bobot 3% / Target 8%
- BBNI: 86/241 lots, @Rp 5.450 LIVE, Bobot 7% / Target 10%

---

### Screen 3 — Aset Tab (Logam Mulia + per-emiten expanded)

Same layout as Screen 2 but showing:
- The Logam Mulia (gold grams) input section with live IDR/gram price
- The BBCA per-emiten card in **expanded** state, showing accumulation ladder + dividend detail
- All other stocks collapsed

---

### Screen 4 — Akumulasi Tab (the heart of v2)

The tab Bayu opens first every visit.

**Top section — at-a-glance:**
- "Modal Siap Distribusi: Rp 200.000.000"
- "Target Total Akumulasi: Rp 4.250.000.000"
- "Progress: 36%" with a primary-color progress bar

**Controls row:** `[Sort: Progress ▾]  [Filter: Bobot Off-Target ☐]`

**Per-emiten list:** condensed cards sorted by Progress % ascending (most-behind-target first), each showing:
- Ticker, current lots / target lots, percent progress, Rp needed for next 10% accumulation

**Bottom — "Saran" panel (opinionated):**
- Card with `accent-emerald-soft` left border, padding 16px
- Copy: *"💡 Saran berdasarkan modal tersedia: Modal kamu (Rp 200jt) bisa cover 10% akumulasi BBRI + BMRI + BBCA — atau full 30% akumulasi BMRI."*
- Two action buttons: `[Lihat opsi A]` and `[Lihat opsi B]`

Sticky dashboard on right (same 10 metrics).

---

### Screen 5 — Utang & Gadai Tab

Input panel shows three sub-sections (top to bottom):
1. **Gadai Emas (Pegadaian)** — expanded by default with the Gadai panel (§8.13)
2. **Utang Konsumsi** — Kartu Kredit, Paylater rows
3. **Utang Jangka Panjang** — KPR, KPM rows

Dashboard on right shows the full 10-metric layout. DAR and DER cards should be prominent.

**Edge state variant:** show a version where Rasio Tertahan is 72% — Gadai panel shows red 🚨 *"Risiko likuidasi"* banner.

---

### Screen 6 — Cashflow Tab

Input panel:
- **Penghasilan**: Gaji Bersih, Penghasilan Lainnya, **Estimasi Dividen Saham** (with the dual-mode toggle: assumption-yield vs. per-emiten manual table)
- **Pengeluaran Tetap**: Sewa Tempat Tinggal, Listrik & Air, Cicilan
- **Pengeluaran Variabel**: Makan & Minum, Transportasi, Hiburan, Kesehatan

Dashboard right: full 10 metrics, with Savings Rate and DSR prominent (these are the Cashflow tab's primary outputs).

---

### Screen 7 — Import Flow (multi-state)

Generate as a sequence of states:
1. **Drop zone idle** (from entry screen, expanded view)
2. **Dragging over** — border solid, color shift
3. **Validating** — spinner + *"Memeriksa file kamu..."*
4. **Hydrating** — progress bar with itemized log: *"Memuat 14 saham, 5 cadangan emas, 1 KPR, 7 pengeluaran tetap..."*
5. **Success** — checkmark + *"Selesai — data kamu sudah dimuat"* + auto-redirect to main app

---

### Screen 8 — Import Error / Migration States

Three variants:
1. **Schema too old (v1 → v2 migration)** — modal with 2-column diff: "Sebelum (v1)" | "Sesudah (v2)", with field-level adds/changes marked. Primary action: `[Konversi ke v2]`. Secondary: `[Batal]`
2. **Corrupted file** — error card, copy: *"File rusak atau bukan format Zenith Wealth. Mau mulai baru?"* with `[Mulai Baru]` CTA
3. **Hand-edited warning** — warning card listing the 3 fields we couldn't parse, with options `[Tetap lanjut]` and `[Pilih file lain]`

---

### Screen 9 — Empty State (first 5 seconds after "Mulai Baru")

After choosing "Mulai Baru" on the entry screen.

- Aset tab active, no data anywhere
- All dashboard metric cards show "—" with greyed status dots
- Soft arrow + microcopy on the input panel pointing to first field: *"Mulai dari sini ↑ — isi yang paling gampang dulu"*
- Donut chart: dashed-outline empty circle with *"Tambahkan aset untuk lihat alokasi"*
- Download .xlsx button in header is disabled with tooltip *"Tambahkan minimal 1 aset"*

---

### Screen 10 — Negative Net Worth Edge State

Same layout as Screen 2 but with:
- Net Worth shown in `#BE123C` (rose)
- Contextual tip below the number: *"Liabilitas lebih besar dari aset. Fokus pelunasan utang dulu."*
- DAR shown in red

---

### Screen 11 — Stale Price / API Failure State

Same layout as Screen 2, but:
- A yellow inline banner near the Logam Mulia field: *"Harga emas terakhir update 2 jam lalu"* with `[Coba lagi]` icon button
- The LIVE pill on gold-price-related fields is replaced with a `STALE` amber pill
- Manual override field is exposed: *"Atau masukkan harga manual: Rp ______ / gram"*

---

### Screen 12 — Mobile Layout (<768px)

Single representative screen showing:
- Header collapses — wordmark left, hamburger right (only used for Download/Import)
- Input panel takes full width, dashboard appears below
- Anchor link at top: *"↓ Lihat dashboard"*
- Small persistent footer hint: *"Lebih nyaman di desktop"*
- All cards stack vertically; per-emiten cards retain progress bar but lose Bobot drift dot inline (shown only on tap)

---

## 10. Microcopy — Critical Strings

These five strings carry most of the product's emotional weight. They must be perfect — designer should flag for PM review before mocks are finalized.

| ID | Where | Text |
|---|---|---|
| `cta.entry.new` | Landing card | *"Mulai Baru"* / *"Mulai dari nol"* |
| `cta.entry.import` | Landing card | *"Import .xlsx kamu"* / *"Drag file ke sini atau klik untuk pilih"* |
| `tagline.hero` | Landing hero | *"Hitung wealth kamu. Tanpa daftar. Tanpa cloud. Semua data tinggal di komputer kamu."* |
| `footer.privacy` | All screens | *"🔒 100% client-side · Data kamu tetap di komputer kamu sendiri"* |
| `dialog.refresh` | Beforeunload | *"Data kamu belum tersimpan. Yakin mau refresh?"* |
| `dialog.import.success` | After import | *"Selesai — data kamu sudah dimuat. Mulai dari mana?"* |
| `empty.nudge` | Empty input | *"Mulai dari sini ↑ — isi yang paling gampang dulu"* |
| `download.confirm` | Post-download toast | *"Tersimpan. Simpan baik-baik ya."* |
| `gadai.risk` | Rasio Tertahan >70% | *"🚨 Risiko likuidasi — Tertahan terlalu tinggi"* |
| `saran.template` | Akumulasi tab | *"💡 Modal kamu bisa cover 10% akumulasi {tickers} — atau full 30% akumulasi {ticker}."* |

---

## 11. Accessibility Requirements

- All colored badges/dots **must pass WCAG AA** contrast on `#FFFFFF` and `#F8F9F5` surfaces — verify especially amber `#D97706`
- Color is **never the sole signal** — every status dot is paired with an icon and/or text label
- Full keyboard navigation through every input in logical order
- ARIA live regions on dashboard metric cards so screen readers announce updates
- Visible focus states on every interactive element (no `outline: none`)
- `inputmode="decimal"` on all number inputs for mobile keyboards
- Tabular figures globally on all numerical values

---

## 12. Out of Scope (do not design)

- Dark mode (v3)
- Custom illustrations / mascots
- Onboarding tour overlays
- Logo / wordmark final design (separate brand workstream)
- Animations beyond simple fades and the recalc transitions
- iOS / Android native parity
- Email / sharing flows
- Settings page (no user account = no settings)
- Notification or alert center
- Multi-portfolio / household / shared views

---

## 13. Deliverables Expected from Stitch / Designer

| # | Deliverable | Format |
|---|---|---|
| 1 | All 12 screens above | Figma frames |
| 2 | Per-emiten card component (collapsed + expanded) | Figma component with variants |
| 3 | Metric card component (with green/amber/rose variants + empty) | Figma component |
| 4 | Gadai panel (safe + warning + risk variants) | Figma component |
| 5 | Drop zone (idle / drag / validating / hydrating / error) | Figma component |
| 6 | Tab bar (4 tabs, active state per tab) | Figma component |
| 7 | LIVE pill + ESTIMASI pill + STALE pill | Figma components |
| 8 | Donut chart + drift bars + Safe Haven stacked bar | Figma components |
| 9 | Microcopy doc — all strings above + any new ones surfaced during design | Markdown for PM review |
| 10 | Color & type token export for engineering handoff | Style Dictionary or Tailwind config |

---

## 14. References & Anti-References

**This product should feel like:**
- A clean tax form that respects the user's time
- A focused calculator (Coda doc / Notion table) with a smart sidebar
- A privacy-respecting health tracker (Apple Health) — clinical but warm
- A broker's order pad — quiet, dense, precise

**This product should NOT feel like:**
- Bibit / Pluang — too gamified, too saturated
- Stockbit — too crowded, too "trader floor"
- Mint / Personal Capital — bank-blue, US-centric
- A generic Excel template — cold, no live feedback
- A crypto dashboard — dark-mode tradfi candle-chart energy

---

## 15. The xlsx this product replaces (context for Stitch)

The user currently maintains a 5-sheet Google Sheets workbook (`ide/Aset Tracker.xlsx`) containing:
- 14+ IDX stocks with target lots and accumulation ladders (10/30/50/70/80/100% milestones)
- Gold reserves (Cadangan) + gold pawned (Tertahan) tracking
- Gadai (Pegadaian gold loan) with 1.5%/month interest + tempo + monthly defisit projection
- DAR (Debt-to-Asset Ratio), DER (Debt-to-Equity Ratio)
- Safe Haven (Emas + Cash + RD) vs Productive (Saham + Aset Lain) ratio
- Dual dividend yield methodology (Avg Yield Potential + Last Dividend per Lembar)
- Live prices via `GOOGLEFINANCE("IDX:" & ticker)` and `IMPORTDATA("https://sahabat.pegadaian...")`

This file is the **canonical specification of what Bayu wants to see**. Open it (`ide/Aset Tracker.xlsx`) before generating the Akumulasi tab — its column structure is the most accurate ground truth.

---

**End of design prompt. Generate.**
