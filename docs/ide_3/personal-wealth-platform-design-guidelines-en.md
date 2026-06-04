---
name: Cermat
project_id: cermat
target_market: Indonesian adults (Sari persona — broad audience; Bayu persona — sophisticated investor)
language_primary: Bahasa Indonesia (casual register, "kamu" not "Anda")
language_secondary: English (terminology only — Net Worth, DSR, etc.)
platform: Web, desktop-first
brand_personality: Calm · Trustworthy · Privacy-First · Disciplined · Honest
colors:
  primary: '#1B4332'             # Deep forest green — brand anchor, primary CTAs
  primary-dark: '#012D1D'        # Hero numerals (Net Worth), strongest headers
  primary-container: '#274E3D'   # Hover, container fills
  accent-emerald: '#2D6A4F'      # Healthy thresholds, active progress
  accent-emerald-soft: '#86AF99' # Progress bar fills, secondary indicators
  warning-amber: '#D97706'       # Caution thresholds, stale data, ESTIMASI pills
  danger-rose: '#BE123C'         # Negative net worth, Bahaya zones, Risiko Likuidasi
  gold: '#C9A961'                # Emas Cadangan (physical reserve)
  gold-muted: '#9C8554'          # Emas Tertahan (gold pawned — visually says "not yours right now")
  capacity-teal: '#0891B2'       # Modal Siap Distribusi accent (paired with Net Worth)
  surface: '#F8F9F5'             # Page canvas — warm off-white (NOT pure white)
  surface-card: '#FFFFFF'        # Elevated card surfaces
  surface-low: '#F3F4F1'         # Sub-card / table-row alternating
  surface-input: '#FFFFFF'       # Input field background
  border: '#E5E7EB'              # Default 1px borders
  border-strong: '#C1C8C2'       # Focused border, tab underline
  text-primary: '#1F2937'        # Body text, primary numbers
  text-secondary: '#6B7280'      # Helper text, "Rp" prefix, labels
  text-muted: '#9CA3AF'          # Disabled, empty-state placeholders
  text-on-primary: '#FFFFFF'     # Text on primary-color buttons
typography:
  font_family_primary: Plus Jakarta Sans
  font_family_numeric: Plus Jakarta Sans (font-variant-numeric: tabular-nums)
  headline-hero:       { size: 48px, weight: 700, leading: 1.2, tracking: -0.02em } # Net Worth, Modal Siap
  headline-lg:         { size: 32px, weight: 600, leading: 1.3 }                    # Section titles
  headline-md:         { size: 24px, weight: 600, leading: 1.3 }                    # Sub-section
  metric-value:        { size: 24px, weight: 600, leading: 1.4, tabular: true }     # Metric card numbers
  body-md:             { size: 16px, weight: 400, leading: 1.6 }                    # Body text
  label-sm:            { size: 14px, weight: 500, leading: 1.4 }                    # Field labels
  label-xs:            { size: 12px, weight: 600, leading: 1.2, tracking: 0.04em }  # Pills, tags, LIVE badges
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
  level_2: 0px 4px 12px rgba(0,0,0,0.03)         # Hero metric pair only (Net Worth + Modal Siap)
  level_modal: 0px 20px 40px rgba(0,0,0,0.08)    # Simulator modals, confirm dialogs
---

# Cermat — Complete Design Prompt for Stitch

> **How to use this document:** This is the complete brief for generating the Cermat web application UI in [Stitch](https://stitch.withgoogle.com/). The frontmatter above contains all design tokens. The sections below describe brand, layout, components, and screens to generate. Use the "Screens to Generate" section (§9) as your Stitch screen prompts.

---

## 1. Project Intent

**Cermat** is a privacy-first web app for Indonesian adults to:
- **Track** their full financial picture (with live IDX stock prices and per-emiten accumulation)
- **Plan** life goals (DP rumah, FI = expenses × 300, dana pendidikan, custom)
- **Decide** big decisions via forward-looking simulators (Mau KPR? Mau Gadai? Mau cicil?)
- **Discover** capacity-based options via reverse-looking simulators (Berapa max utang aman? Apa yang bisa gw lakukan dengan modal likuid?)

**Core promises:**
1. No signup. No account. No server-side persistence of user data.
2. Live prices proxied through our backend, but **no user portfolio data ever leaves the browser**.
3. Every metric, simulation, and option is **descriptive — never prescriptive** (OJK risk mitigation).
4. Output: downloadable `.xlsx` snapshot for the user to keep.

**Primary personas (both served by one product):**
- **"Sari"** — 28–38, dual-income household, considering KPR / KPM / Gadai / first investment. Wants forward and reverse guidance: *"aman gak kalau gw ___?"* and *"berapa max yang aman?"*
- **"Bayu"** — 30–45, sophisticated investor running per-emiten accumulation thesis with gold-pawn funding cycle.

Both share the screen; progressive disclosure scales complexity. **No "Pro mode" toggle.**

---

## 2. Brand & Voice

**Brand personality:** Calm · Trustworthy · Privacy-First · Disciplined · Honest.

The aesthetic is **modern minimalist with a clinical-warm character** — heavy whitespace, sophisticated off-white surfaces, precise typography. The product should feel like **a well-organized financial review session at a private banker who is on your side**, not a gamified retail trading app and not a Bloomberg terminal.

**Reference inspirations:**
- ✅ A clean tax form that respects your time
- ✅ A focused calculator (Coda doc / Notion table) with a smart sidebar
- ✅ Apple Health — clinical but warm, privacy-respecting
- ✅ Linear's information density without its developer-coded feel

**Reference anti-patterns** (what Cermat is NOT):
- ❌ Bibit / Pluang — too gamified, too saturated, growth-marketing energy
- ❌ Stockbit — too dense, "trader floor" energy
- ❌ Mint / Personal Capital — bank-blue, US-centric, ad-heavy
- ❌ Generic Excel template — cold, no personality, no live feedback
- ❌ Crypto / Bloomberg terminal dashboards — dark-mode tradfi candle-chart energy

**No dark mode in this scope.** Don't propose one. (This was a recurring drift in past projects.)

**Voice / microcopy register:**

| Use ✓ | Avoid ✗ |
|---|---|
| "kamu" (casual second-person) | "Anda" (formal) |
| "Net Worth Kamu" | "TOTAL KEKAYAAN BERSIH PENGGUNA" |
| "Yakin refresh? Datanya hilang lho" | "Apakah Anda yakin ingin me-refresh halaman ini?" |
| "Modal Siap Distribusi" | "Liquid Asset Deployment Capacity" |
| "Opsi yang bisa dihitungkan" | "Rekomendasi Sistem" / "Pilihan Terbaik" |
| "DSR kamu 33% — di zona Waspada" | "Sebaiknya kamu kurangi cicilan" |
| "Data kamu tetap di komputer kamu sendiri" | "Your data stays on your device" *(must be Indonesian)* |

**Tone:** casual professional. Like a friend who works at a bank — and is on your side, not the bank's.

---

## 3. Color System

The palette is anchored in **forest greens + warm off-whites**, deliberately avoiding the ubiquitous "bank-blue" of local fintech, and the saturated palettes of consumer investing apps.

### 3.1 Semantic role of each color

| Token | Hex | Use |
|---|---|---|
| **Primary** | `#1B4332` | Wordmark, primary CTAs ("Download .xlsx"), tab underline, key headings |
| **Primary Dark** | `#012D1D` | **Hero numerals** (Net Worth + Modal Siap Distribusi), strongest headers |
| **Accent Emerald** | `#2D6A4F` | Healthy thresholds, active progress bars, success states |
| **Warning Amber** | `#D97706` | Caution thresholds (DSR 30–40%, Rasio Tertahan 50–70%), STALE badges, ESTIMASI pills |
| **Danger Rose** | `#BE123C` | Negative net worth, Bahaya zones, Risiko Likuidasi. Use sparingly. |
| **Gold** | `#C9A961` | Emas Cadangan (physical reserve) — precious-asset signifier |
| **Gold Muted** | `#9C8554` | Emas Tertahan (pawned) — visually says "not yours right now" |
| **Capacity Teal** | `#0891B2` | Modal Siap Distribusi value + accents (subtle differentiation from health-metric green) |
| **Surface** | `#F8F9F5` | Page canvas, warm off-white |
| **Surface Card** | `#FFFFFF` | Elevated cards |
| **Border** | `#E5E7EB` | Default 1px borders on inputs, asset rows, dividers |

### 3.2 Color logic rules

- **Surfaces are tonal, not shadowed** — use color depth (`#F8F9F5` background, pure `#FFFFFF` cards) rather than drop shadows for hierarchy
- **Only Net Worth + Modal Siap Distribusi hero pair** gets a subtle shadow (`0px 4px 12px rgba(0,0,0,0.03)`)
- **Status dots are 8px circles** in green/amber/rose — top-right of each metric card, ALWAYS paired with a text label (color is never the sole signal)
- **Gold uses muted ochre** (`#C9A961`), never bright/yellow — gold is precious, not playful
- **Capacity Teal is reserved for Modal Siap Distribusi UI** — not used elsewhere, to keep its meaning specific
- **No dark mode** in this scope

### 3.3 Phase-2 revamp delta (2026-06-04, Day 1)

Phase-2 swaps the **forest-green-led** Phase-1 palette for an **emerald-led** Tailwind palette. Rationale: revamp aesthetic targets a shadcn-inspired "lebih tampan" trust signal. Forest-green tokens are kept aliased during Day 1 only and removed during Day 2 primitives refactor.

| Token | Phase-1 | Phase-2 revamp |
|---|---|---|
| **Primary** | `#1B4332` forest | `#059669` emerald-600 |
| **Primary Dark** | `#012D1D` | `#065F46` emerald-800 |
| **Accent Emerald** | `#2D6A4F` | `#059669` emerald-600 |
| **Accent Emerald Soft** | `#86AF99` | `#D1FAE5` emerald-100 |
| **Surface** | `#F8F9F5` warm | `#FFFFFF` neutral white |
| **Surface Low** | `#F3F4F1` warm | `#F9FAFB` gray-50 |
| **Border** | `#E5E7EB` | `#E5E7EB` (unchanged) |
| **Border Strong** | `#C1C8C2` warm | `#D1D5DB` gray-300 |
| **Text Primary** | `#1F2937` | `#0F172A` slate-900 |
| **Text Secondary** | `#6B7280` | `#475569` slate-600 |
| **Text Muted** | `#9CA3AF` | `#94A3B8` slate-400 |

Unchanged across Phase-2: warning amber, danger rose, gold + gold-muted, capacity teal — these still carry their Phase-1 semantic meaning.

**Gradient bg note:** revamp introduces a subtle page-level gradient via `@utility bg-gradient-subtle` (`linear-gradient(to bottom, #fff, #f9fafb)`). Used as page canvas under split-screen shell + landing hero. Not applied to cards (cards remain solid `#FFFFFF` per §3.1).

**`theme-color` meta:** updated `#1B4332` → `#059669` to match new primary; affects mobile browser chrome.

---

## 4. Typography

**Plus Jakarta Sans** for everything. **Tabular figures (`font-variant-numeric: tabular-nums`) is non-negotiable on every number** — financial data must align in vertical scans.

> **Phase-2 revamp delta (2026-06-04, Day 1):** typeface swapped to **Geist Sans** (self-hosted via `@fontsource/geist-sans`, weights 400/500/600/700). Geist's tighter forms + neutral character set match the shadcn-inspired aesthetic and the "lebih tampan" trust target. **Type scale (§4.1) unchanged** — same step ladder, same tabular-nums rule. Plus Jakarta Sans is uninstalled after Day 2 confirms no fallback usage.

### 4.1 Type scale

| Style | Size | Weight | Use |
|---|---|---|---|
| `headline-hero` | 48px / 700 | Net Worth + Modal Siap Distribusi hero numbers |
| `headline-lg` | 32px / 600 | Page section titles ("Snapshot", "Goals", "Simulator") |
| `headline-md` | 24px / 600 | Sub-section titles, expanded card titles |
| `metric-value` | 24px / 600 tabular | All metric card primary numbers |
| `body-md` | 16px / 400 | Body text, descriptions, microcopy |
| `label-sm` | 14px / 500 | Field labels, helper text |
| `label-xs` | 12px / 600 tracking 0.04em | Pills, tags, LIVE / ESTIMASI / STALE badges |

### 4.2 Currency rendering rules

- Always `Rp 25.000.000` format — period as thousand separator (Indonesian convention), space after `Rp`
- The `Rp` prefix is rendered in `text-secondary` (`#6B7280`) — slightly lighter than the number itself, so magnitude dominates
- Never abbreviate as default (no "Rp 25 jt") — abbreviation allowed only in tight chart labels with full value on hover
- Right-align all numeric inputs and table columns
- **Hero numbers** (Net Worth, Modal Siap Distribusi): tabular, 48px, `#012D1D`, semi-bold

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

### 5.3 Page anatomy

```
┌──────────────────────────────────────────────────────────────────────┐
│  HEADER (sticky, 64px)                                                │
│  [Cermat wordmark]                          [↓ Download .xlsx]        │
├──────────────────────────────────────────────────────────────────────┤
│  INPUT PANEL (45%)               │   DASHBOARD PANEL (55%, sticky)  │
│                                  │                                   │
│  [Snapshot · Goals · Simulator]  │   [Hero pair: Net Worth + Modal] │
│                                  │   [9-metric grid]                │
│  [Scrollable content per tab]    │   [Allocation donut]             │
│                                  │   [Modal Likuid Options panel]   │
│                                  │   [Goals progress cards]         │
├──────────────────────────────────┴───────────────────────────────────┤
│  FOOTER: 🔒 100% client-side · Data kamu tetap di komputer kamu     │
└──────────────────────────────────────────────────────────────────────┘
```

### 5.4 Tab structure (input panel)

3 tabs in the input panel:
1. **Snapshot** — Aset, Pengeluaran, Utang (Cicilan Aktif rows + Gadai), with per-emiten Saham subsection
2. **Goals** — Multi-goal list with FI auto-formula
3. **Simulator** — Simulator launcher: Decision (4) and Capacity (3)

Active tab has `#1B4332` underline (2px), inactive tabs use `#6B7280` text.

---

## 6. Elevation & Depth

Flat tonal system — depth is built with color layers, not drop shadows.

| Level | Treatment | Use |
|---|---|---|
| **Level 0** | `#F8F9F5` background | Page canvas |
| **Level 1** | `#FFFFFF` + `1px solid #E5E7EB` border | Cards, inputs, asset rows |
| **Level 2** | Level 1 + `0px 4px 12px rgba(0,0,0,0.03)` | **Net Worth + Modal Siap hero pair only** |
| **Modal** | `0px 20px 40px rgba(0,0,0,0.08)` | Simulator modals, confirm dialogs |
| **Drop zone idle** | `2px dashed #C1C8C2` on `#F8F9F5` | (Reserved — import is roadmap, not in scope) |

**Hover states:** subtle 2% darker background, never an elevation change.

---

## 7. Shape Language

Soft, precise. Not cartoonish, not institutional.

| Component | Radius |
|---|---|
| Inputs, buttons, asset rows | **4px** (`radius_input`) |
| Cards, metric cards, sub-panels, simulator modals | **8px** (`radius_card`) |
| Status dots, LIVE / ESTIMASI / STALE pills | **fully rounded** (`radius_pill`) |
| Donut chart strokes | **flat caps** (preserves data-fidelity feel) |
| Progress bar fills | flat caps |

### 7.1 Phase-2 revamp delta (2026-06-04, Day 1)

Phase-2 adopts a **softer, rounder** shape language. Radii scale up; depth shifts from flat tonal layers (§6) to soft drop-shadows.

| Component | Phase-1 | Phase-2 revamp |
|---|---|---|
| Inputs, buttons | 4px | **8px** (`radius_input` = `0.5rem`) |
| Cards, metric cards, sub-panels, modals | 8px | **16px** (`radius_card` = `radius_2xl` = `1rem`, ~Tailwind `rounded-2xl`) |
| Pills | fully rounded | fully rounded (unchanged) |
| Asset rows | 4px | 8px (matches new input radius) |

**Soft shadow scale** (replaces §6 "flat tonal" elevation for Phase-2 cards):

| Token | Hex equivalent | Use |
|---|---|---|
| `shadow-sm` | `0 1px 2px 0 rgba(15, 23, 42, 0.04)` | Default card resting state |
| `shadow-md` | `0 4px 12px 0 rgba(15, 23, 42, 0.06)` | Hero pair + card hover lift |
| `shadow-lg` | `0 10px 24px 0 rgba(15, 23, 42, 0.08)` | Sticky dashboard sidebar accent |
| `shadow-modal` | `0 20px 40px rgba(15, 23, 42, 0.12)` | Simulator modals, confirm dialogs |

§6 flat-tonal rules still apply where shadow is visually inappropriate (table rows, inline asset rows, dividers). The hero-pair-only shadow rule is **relaxed** in Phase-2: all metric cards may take `shadow-sm` at rest.

---

## 8. Components

### 8.1 Header (sticky)

- Height 64px, surface `#FFFFFF`, 1px bottom border `#E5E7EB`
- Left: Cermat **wordmark** (NOT a building/columned-bank icon — explicitly avoid institutional iconography)
- Right: primary CTA `[↓ Download .xlsx]` filled `#1B4332`
- **No login. No avatar. No menu.** The absence is the trust signal.

### 8.2 Primary Button

- Filled `#1B4332`, white text, 4px radius, 12px × 20px padding
- Hover: background `#274E3D`
- Disabled: 40% opacity + tooltip explaining why ("Tambahkan minimal 1 aset")

### 8.3 Secondary Button

- Outlined `1px solid #E5E7EB`, text `#1F2937`, 4px radius
- Used for "Tambah aset", "Reset", "Tutup"

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

### 8.9 STALE Pill

- Same shape, `warning-amber` background, with retry icon
- Companion text: *"Last update 2 jam lalu"*

### 8.10 Standard Metric Card (Dashboard)

```
┌──────────────────────────┐
│  DSR                  ●  │   ← color dot (green/amber/rose)
│  33%                     │   ← metric-value style, tabular
│  ┌────────────────────┐  │
│  │ Zona Waspada       │  │   ← amber pill label
│  └────────────────────┘  │
│  Cicilan 33% dari        │   ← 14px helper text, casual Indonesian
│  penghasilan bulanan     │
└──────────────────────────┘
```

- 8px radius, `#FFFFFF` surface, `1px solid #E5E7EB`
- Width: equal-thirds within the dashboard panel
- Hover reveals formula tooltip (e.g., *"Cicilan ÷ Penghasilan"*)
- Empty state: number replaced by "—" (em-dash), color dot greyed

### 8.11 Hero Metric Card Pair (Net Worth + Modal Siap Distribusi)

Two cards side-by-side at top of dashboard panel:

```
┌───────────────────────────────┬───────────────────────────────┐
│  Net Worth Kamu               │  Modal Siap Distribusi   ▽   │
│  Rp 391.485.971               │  Rp 51.924.971                │
│  ↑ paired green dot           │  Capacity Teal accent (#0891B2)│
└───────────────────────────────┴───────────────────────────────┘
```

- Both **headline-hero** (48px, 700) tabular numbers
- Net Worth in `#012D1D`; Modal Siap in `#0891B2`
- Both cards get Level 2 elevation (subtle shadow)
- Label is `body-md` `#6B7280`, casual: *"Net Worth Kamu"*, *"Modal Siap Distribusi"*
- Below Modal Siap: small toggle icon `▽` to expand "Opsi yang bisa dihitungkan" panel (see §8.20)
- Below Net Worth: optional small trend hint (cut in v1 — no history to compare)

### 8.12 Asset Row (inline list item)

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

### 8.13 Per-Emiten Stock Card (Snapshot tab → Saham subsection)

**Collapsed state (default):**
```
┌──────────────────────────────────────────────────────────────────────┐
│  BBCA   Lots: 162 / 450 (36%)    [██████░░░░░░░░░░░░░░░░]      ▾    │
│  @Rp 10.667 LIVE  ·  Rp 173.005.400  ·  Bobot 17% (target 20% ●)   │
└──────────────────────────────────────────────────────────────────────┘
```

- 72px tall collapsed, `#FFFFFF` background, 1px border
- Progress bar: `accent-emerald-soft` filled portion, `surface-low` empty portion, 6px tall, full row width
- Bobot drift indicator (●): green if within ±2%, amber if 2–5% off, rose if >5%
- All bars align vertically across stocks in the list

**Expanded state (click `▾`):**
```
┌──────────────────────────────────────────────────────────────────────┐
│  BBCA   Lots: 162 / 450 (36%)    [██████░░░░░░░░░░░░░░░░]      ▴    │
│  @Rp 10.667 LIVE  ·  Rp 173.005.400  ·  Bobot 17% (target 20% ●)   │
├──────────────────────────────────────────────────────────────────────┤
│   Dividen:                                                            │
│      Avg yield (estimasi)        4.2%  →  Rp ±7.265.000 / tahun     │
│      Last dividen / lembar       Rp 225                              │
│      Potensi by last dividen     Rp 3.645.000 / tahun                │
│                                                                       │
│   [Edit target lots] [Edit target bobot] [Hapus]                     │
└──────────────────────────────────────────────────────────────────────┘
```

### 8.14 Active Debt Panels (Snapshot tab → Utang section)

Two structured panels live inside the Utang section — Cicilan Aktif (§8.14.1) for amortizing debts, Gadai (§8.14.2) for collateralized gold pawn. Both feed DSR / DAR / Modal Options computations on the dashboard. No flat "Sisa KPR" text fields exist anywhere.

#### 8.14.1 Cicilan Aktif Panel

```
┌──────────────────────────────────────────────────────────────────────┐
│  ▾ Cicilan Aktif                                  [+ Tambah Cicilan] │
│                                                                       │
│  ┌── Cicilan #1 ────────────────────────────────────────────────┐  │
│  │  🏠 KPR BCA Bandung 2024                                       │  │
│  │  Sisa pokok: Rp 600.000.000  ·  Cicilan: Rp 4.200.000/bln     │  │
│  │  [Anuitas] · 7%/thn · Tenor sisa 168 bln              [✎] [×] │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌── Cicilan #2 ────────────────────────────────────────────────┐  │
│  │  💳 Kartu Kredit BNI                                           │  │
│  │  Sisa pokok: Rp 8.000.000  ·  Min payment: Rp 400.000/bln     │  │
│  │  [Revolving] · 26%/thn · Tenor ~24 bln (estimasi)     [✎] [×] │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌── Cicilan #3 ────────────────────────────────────────────────┐  │
│  │  🛍️ Shopee Paylater                                            │  │
│  │  Sisa pokok: Rp 2.500.000  ·  Min payment: Rp 250.000/bln     │  │
│  │  [Revolving] · ⚠ Bunga belum diisi                    [✎] [×] │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  Quick-add: [🏠 KPR] [🚗 KPM] [🏦 Bank/KTA] [📱 Pinjol] [🛍️ Paylater] [💳 KK] │
│                                                                       │
│  ────────────────────────────                                        │
│  Total cicilan/bulan: Rp 4.850.000                                   │
│  Cicilan terbesar: 🏠 KPR (87% dari total)                           │
└──────────────────────────────────────────────────────────────────────┘
```

- Row layout: 96px tall collapsed, `radius_input` (4px), `#FFFFFF` surface, 1px border `#E5E7EB`. Expanded reveals tenor + jenis_bunga + tanggal_jatuh_tempo + edit form.
- **Tipe icon** at row start, 16px lucide-style: 🏠 KPR / 🚗 KPM / 🏦 Bank-KTA / 📱 Pinjol / 🛍️ Paylater / 💳 KK / 📌 Lain
- **Jenis bunga** rendered as `label-xs` pill (`Anuitas` / `Flat` / `Floating` / `Revolving`), placed before the rate
- **Quick-add chips** at bottom of panel: `radius_pill` chips, secondary-button style, clicking inserts a new row with `tipe` pre-filled and focuses the `label` field
- **Missing-field warning** (e.g., *"⚠ Bunga belum diisi"*) renders inline in `warning-amber` `label-xs` — describes the gap, does NOT prescribe action
- **Aggregate strip** at bottom uses `body-md` `text-secondary` for total and `label-sm` for the largest-cicilan context line
- **OJK guard:** the largest-cicilan line MUST stay descriptive (*"Cicilan terbesar: KPR (87% dari total)"*) — never prescriptive (*"Fokus lunasi yang terbesar dulu"*). See §11.

**Empty state:** if no rows yet, panel shows centered helper text + primary CTA:
```
   Belum ada cicilan aktif.
   [+ Tambah Cicilan Pertama]
```

#### 8.14.2 Gadai Panel

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

- Cadangan bar uses `#C9A961` (gold); Tertahan bar uses `#9C8554` (gold-muted)
- Rasio Tertahan thresholds: <50% green ✓ Aman, 50–70% amber ⚠️ Waspada, >70% rose 🚨 Risiko Likuidasi
- Defisit shown in `#BE123C` when > 0

### 8.15 Goal Card (Goals tab + Dashboard)

**Standard goal card:**
```
┌──────────────────────────────────────────────────────────────────────┐
│  🏠 DP Rumah Bandung 2028               ● On-Track                  │
│  Rp 90.000.000 / Rp 500.000.000                                      │
│  [██████░░░░░░░░░░░░░░░░░░░░░░░░░░░] 18%                            │
│  Bucket: RD + Deposito + Kas                                          │
│  Kontribusi bulanan dibutuhkan: Rp 4.200.000                          │
│  Proyeksi selesai: 2028-Q2 (sesuai target)                            │
└──────────────────────────────────────────────────────────────────────┘
```

**Financial Independence goal card (special — has FI multiplier):**
```
┌──────────────────────────────────────────────────────────────────────┐
│  🌴 Financial Independence              ● On-Track                  │
│  Rp 970.000.000 / Rp 5.400.000.000   (FI Number)                    │
│  [█████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 18%                            │
│                                                                       │
│  Asumsi: Pengeluaran bulanan Rp 18jt × 300 = Rp 5.4M                │
│         ↑ multiplier fixed 300 (4% rule, Trinity baseline)           │
│                                                                       │
│  Bucket: RD + Saham + SBN + Deposito                                  │
│  Kontribusi bulanan dibutuhkan: Rp 4.800.000                          │
│  Proyeksi selesai: 2038 (3 tahun lebih lambat dari target 2035)      │
└──────────────────────────────────────────────────────────────────────┘
```

- Status badge color: green ON_TRACK / amber AT_RISK / rose OFF_TRACK
- Progress bar same accent-emerald-soft fill pattern as per-emiten cards
- FI multiplier shown inline (`× 300`) highlights the formula explicitly (descriptive, not advice; D0.2 closed = no dropdown for MVP)

### 8.16 Simulator Launcher (Simulator tab)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Simulator                                                            │
│                                                                       │
│  ▾ Simulasi Keputusan ("Mau gw X?")                                    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐│
│  │ 🏠 Mau KPR   │ │ 🥇 Mau Gadai │ │ 🚗 Mau Cicil │ │ ⚙️ Custom    ││
│  │ ────────►    │ │ ────────►    │ │ ────────►    │ │ ────────►    ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘│
│                                                                       │
│  ▾ Cek Kapasitas ("Bisa gw apa?")                                 │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐     │
│  │ 💰 Max Utang     │ │ 💸 Lunasi Utang  │ │ 🎯 Modal Options │     │
│  │   Aman          │ │   Sekarang       │ │                  │     │
│  │ ────────►        │ │ ────────►        │ │ ────────►        │     │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘     │
└──────────────────────────────────────────────────────────────────────┘
```

- Two families clearly visually separated
- Cards have 1px border, hover-darken background, 8px radius
- Click opens modal simulator

### 8.17 Simulator Modal — Decision (e.g., Mau KPR)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Mau Ambil KPR                                              [×]       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ ⚠️ Hasil simulasi adalah ilustrasi — bukan saran. Konsultasi │ │
│  │    profesional sebelum keputusan final.                        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  Input Skenario                          │   Posisi Sekarang         │
│  ┌────────────────────────────────────┐  │  ┌─────────────────────┐  │
│  │ Harga rumah   [Rp 1.200.000.000  ] │  │  │ Net Worth Rp 391jt  │  │
│  │ DP            [    20  %        ] │  │  │ DSR        22% ●    │  │
│  │ Tenor         [    20  tahun    ] │  │  │ Runway   8 bulan ●  │  │
│  │ Suku bunga    [     7  %/tahun  ] │  │  │ Modal Rp 52jt       │  │
│  │ Tipe bunga    [ Anuitas      ▼ ] │  │  │ Goal FI: On-Track   │  │
│  │                                    │  │  └─────────────────────┘  │
│  │ → Cicilan/bulan: Rp 9.300.000     │  │                            │
│  │ → Total bunga: Rp 1.032.000.000   │  │                            │
│  └────────────────────────────────────┘  │                            │
│                                                                       │
│  ───────────── Setelah Skenario ─────────────                        │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │            Sebelum    Sesudah     Δ                            │  │
│  │  Net Worth Rp 391jt   Rp 391jt    —                           │  │
│  │  DSR       22% ●      38% ●       ▲ +16 (Sehat → Waspada)     │  │
│  │  Runway    8 bulan    4 bulan ●   ▼ −4                        │  │
│  │  DAR       12% ●      45% ●       ▲ +33                       │  │
│  │  Modal     Rp 52jt    Rp 28jt     ▼ −24 (DP terpakai)        │  │
│  │  ──────────────────────────────────                            │  │
│  │  Goal: FI On-Track    Off-Track   ▼ (mundur ~3 tahun)         │  │
│  │  Goal: DP Rumah 18%   Selesai ★   ★                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  [Simpan Skenario]  [Edit Snapshot Dulu]  [Tutup]                   │
└──────────────────────────────────────────────────────────────────────┘
```

- Modal width: 90% of viewport up to max 1200px
- OJK disclaimer banner at top — non-dismissable
- Left: input form (`radius_input` fields)
- Right: mirrored "Posisi Sekarang" snapshot summary
- Below: side-by-side comparison table with delta arrows
- Goal impact section is visually separated (different background tint or divider)
- Bottom: 3 action buttons

### 8.18 Simulator Modal — Capacity (e.g., Max Utang Aman)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Max Utang Aman                                              [×]      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ ⚠️ Bukan saran. Kalkulasi berdasarkan threshold DSR < 30%.    │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  Input (opsional)                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │ Tipe utang   [ KPR    ▼ ]                                       │ │
│  │ Tenor        [   15   tahun ]                                   │ │
│  │ Suku bunga   [    7   %/tahun ]                                 │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  ───────────── Hasil Kalkulasi ─────────────                         │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Berdasarkan gaji Rp 18jt + cicilan aktif Rp 1.5jt,           │  │
│  │  max cicilan baru biar DSR tetap di zona Sehat (<30%):        │  │
│  │                                                                │  │
│  │            Rp 3.900.000 / bulan                                │  │
│  │            ════════════════════                                │  │
│  │                                                                │  │
│  │  Setara dengan:                                                │  │
│  │  • KPR ~Rp 480jt @ 15 tahun @ 7%                              │  │
│  │  • Cicil mobil ~Rp 200jt @ 5 tahun @ 8%                       │  │
│  │  • Cicil elektronik ~Rp 70jt @ 24 bulan                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  [Simpan Kapasitas]  [Coba Simulator "Mau KPR"]  [Tutup]               │
└──────────────────────────────────────────────────────────────────────┘
```

- Same modal pattern but no side-by-side (this is a single-direction calculation)
- Result number is hero-style (32–40px tabular)
- Companion list of equivalent scenarios in different debt categories
- CTA to launch related Decision simulator with pre-filled value

### 8.19 Simulator Modal — Lunasi Utang

```
┌──────────────────────────────────────────────────────────────────────┐
│  Lunasi Utang Sekarang                                       [×]      │
│  Modal Siap Distribusi tersedia: Rp 52.000.000                       │
│                                                                       │
│  Pilih utang (sumber: Cicilan Aktif + Gadai):                         │
│  ◯ 💳 Kartu Kredit BNI    [Revolving]  Rp   8.000.000                │
│  ◉ 🏠 KPR BCA Bandung     [Anuitas]    Rp 600.000.000                │
│  ◯ 🚗 KPM Avanza          [Flat]       Rp  80.000.000                │
│  ◯ 🥇 Gadai Pegadaian                  Rp  18.000.000                │
│                                                                       │
│  Jumlah:  [══════●═══════════] Rp 20.000.000  (full / partial)       │
│  Mode (Anuitas/Flat/Floating): ◉ Tenor mundur  ◯ Cicilan turun       │
│  (Untuk Revolving / Gadai: toggle disembunyikan — sisa pokok turun langsung) │
│                                                                       │
│  ───────────── Dampak ─────────────                                  │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │            Sebelum    Sesudah     Δ                           │  │
│  │  Modal      Rp 52jt   Rp 32jt    ▼ −20                        │  │
│  │  Sisa KPR   Rp 600jt  Rp 580jt   ▼ −20                        │  │
│  │  Tenor KPR  20 tahun  18 tahun 10 bln  ▼ −14 bulan            │  │
│  │  DSR        33% ●     31% ●      ▼ −2                         │  │
│  │  ──────────────────────────                                   │  │
│  │  Goal FI    On-Track  On-Track   —                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  [Simpan Simulasi]  [Tutup]                                          │
└──────────────────────────────────────────────────────────────────────┘
```

### 8.20 Modal Likuid Options Panel (persistent on dashboard)

Always-visible card below the Net Worth + Modal Siap hero pair, when Modal Siap > 0.

```
┌──────────────────────────────────────────────────────────────────────┐
│  Opsi yang Bisa Dihitungkan                                          │
│  Modal Siap Distribusi: Rp 52.000.000                                 │
│  ────────────────────────────────                                    │
│                                                                       │
│  1. Lunasi Kartu Kredit (Rp 8jt)                            [Hitung] │
│     → DSR 33% → 31%; sisa modal Rp 44jt                             │
│                                                                       │
│  2. Prepay KPR (Rp 20jt)                                    [Hitung] │
│     → Tenor mundur ~14 bulan; sisa modal Rp 32jt                    │
│                                                                       │
│  3. Beli BBCA 30 lot (Rp 18jt)                              [Hitung] │
│     → Bobot live 15% → 18%; progress 36% → 43%                      │
│                                                                       │
│  4. Tambah ke Reksa Dana                                    [Hitung] │
│     → +Rp 52jt mendorong proyeksi Goal FI ~6 bulan                  │
│                                                                       │
│  5. Tambah Deposito                                         [Hitung] │
│     → +Rp 52jt mendorong proyeksi Goal FI ~6 bulan                  │
│                                                                       │
│  Catatan: Pertimbangkan keep dana darurat 3–6 bulan pengeluaran     │
│           terpisah dari Modal Siap Distribusi.                       │
└──────────────────────────────────────────────────────────────────────┘
```

- Header label: **"Opsi yang Bisa Dihitungkan"** — NEVER "Rekomendasi" or "Pilihan terbaik"
- Each option: descriptive impact preview + `[Hitung]` button → opens relevant simulator with values pre-filled
- Options grouped by category (debt reduction, asset acquisition, FI bucket) without ranking
- Footer note about emergency fund — neutral, informational

### 8.21 Allocation Donut

- 12px stroke width, flat caps
- Largest segments use `primary` (`#1B4332`) and `accent-emerald` (`#2D6A4F`)
- Smaller segments fade through `accent-emerald-soft` → grey tones
- Center text: **total IDR value** (NOT "100%" — meaningless)
- Legend on right with category, color dot, percentage

### 8.22 Safe Haven vs. Produktif Stacked Bar

- Single horizontal stacked bar, full panel width
- Left half color `#C9A961` (Safe Haven — Emas/Cash/RD/Deposito), right half color `#2D6A4F` (Produktif — Saham/Lain)
- Label above with percentage split: `Safe Haven 58% ████░░░ 42% Produktif`
- Status badge below: 🛡️ Konservatif / ⚖️ Seimbang / 🚀 Agresif (descriptive — no judgment)

### 8.23 Threshold Bar (per metric, thermometer-style)

```
   Sehat    Waspada    Bahaya
   ░░░░░░░░░██████░░░░░░░░░░░░  ← user's position (vertical bar)
   <30%      30–40%    >40%
```

- Horizontal bar split into 3 colored zones (green, amber, rose)
- Vertical indicator line on user's exact position
- 4px tall, 100% panel width
- Used inside expanded metric card or hover detail

### 8.24 Disclaimer Footer (persistent)

```
┌──────────────────────────────────────────────────────────────────────┐
│  🔒 100% client-side · Data kamu tetap di komputer kamu sendiri      │
│  Cermat adalah kalkulator dan alat bantu visualisasi. Bukan saran    │
│  investasi atau perencanaan keuangan profesional.                    │
│                              [Kebijakan Privasi · Metodologi · Bantuan] │
└──────────────────────────────────────────────────────────────────────┘
```

- `#F3F4F1` background, centered text
- Two-line disclaimer — privacy + OJK
- Right-aligned secondary links

---

## 9. Screens to Generate

> **For Stitch:** Each screen below is a separate generation prompt. Generate them in order — later screens reference patterns from earlier ones.

### Screen 1 — Landing / Entry Choice

```
┌──────────────────────────────────────────────────────────────────────┐
│  HEADER: [Cermat wordmark]                                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│             Aman gak kalau gw [KPR / Gadai / Cicil]?                 │
│             Berapa max utang yang aman? Cek dalam 10 menit.          │
│             Tanpa daftar. Tanpa cloud.                                │
│                                                                       │
│     ┌──────────────────────────┐  ┌──────────────────────────┐      │
│     │                          │  │                          │      │
│     │   MULAI DARI SNAPSHOT    │  │   COBA DENGAN DATA       │      │
│     │   Isi data kamu sendiri  │  │   CONTOH                 │      │
│     │   (5–10 menit)           │  │   Skip dulu, lihat       │      │
│     │                          │  │   tools-nya.             │      │
│     │    [ Mulai →  ]          │  │   [ Coba →  ]            │      │
│     │                          │  │                          │      │
│     └──────────────────────────┘  └──────────────────────────┘      │
│                                                                       │
│  FOOTER: 🔒 100% client-side · Data kamu tetap di komputer kamu      │
└──────────────────────────────────────────────────────────────────────┘
```

**Design notes:**
- Both CTAs have equal visual weight
- Hero copy emphasizes BOTH forward ("aman gak?") and reverse ("berapa max?") questions
- No login button. No social proof. No marketing fluff.

---

### Screen 2 — Snapshot Tab (basic state, populated)

Main app, Snapshot tab active. Show form filled with sample data, dashboard fully computed.

**Required elements:**
- Header (sticky) with Download CTA
- Tab bar: `[Snapshot (active) · Goals · Simulator]`
- Form sections (left): Penghasilan, Aset Likuid, Aset Non-Likuid, Pengeluaran, Utang (Cicilan Aktif rows + Gadai panel)
- Dashboard (right, sticky):
  - **Hero pair**: Net Worth + Modal Siap Distribusi (large tabular numbers, paired)
  - 6 supporting metric cards in 3-column grid (DSR, Runway, Savings Rate, DAR, Safe Haven, Allocation Discipline)
  - Allocation donut + Safe Haven stacked bar
  - Modal Likuid Options panel
  - Goal cards summary + **Goal Health composite chip** alongside it (Goal Health is a chip beside the Goals, NOT a 7th grid card — per PRD §5.4 + design-decisions §2.3)

---

### Screen 3 — Snapshot Tab (with per-emiten Saham expanded)

Same as Screen 2 but Saham subsection in Aset Likuid is expanded, showing:
- 5 per-emiten cards in collapsed state (BBCA, BBRI, BMRI, ASII, BBNI) with sample data
- BBCA expanded showing dividend detail
- Inline `+ Tambah Saham` link below

**Sample data:**
- BBCA: 162/450 lots, @Rp 10.667 LIVE, Bobot 17% / Target 20%
- BBRI: 149/450 lots, @Rp 4.580 LIVE, Bobot 11% / Target 15%
- BMRI: 134/368 lots, @Rp 6.250 LIVE, Bobot 12% / Target 12%
- ASII: 38/222 lots, @Rp 5.100 LIVE, Bobot 3% / Target 8%
- BBNI: 86/241 lots, @Rp 5.450 LIVE, Bobot 7% / Target 10%

---

### Screen 4 — Goals Tab (with FI auto-formula + 2 other goals)

Goals tab active. Show 3 goal cards:

1. **Financial Independence** (special FI card with multiplier formula inline):
   - Target: Rp 5.400.000.000 (auto: pengeluaran 18jt × 300)
   - Progress: 18% (Rp 970.000.000)
   - Status: On-Track
   - Bucket: RD + Saham + SBN + Deposito
   - Multiplier rendered as inline label: `× 300` (D0.2 closed — fixed, no dropdown)

2. **DP Rumah Bandung 2028**:
   - Target: Rp 500.000.000, Date: 2028-03
   - Progress: 18%
   - Status: On-Track

3. **Dana Pendidikan Anak**:
   - Target: Rp 300.000.000, Date: 2035
   - Progress: 5%
   - Status: At-Risk

Below: `[ + Tambah Goal ]` button (secondary style).

Sticky dashboard on right.

---

### Screen 5 — Simulator Tab (Simulator Launcher)

Simulator tab active. Show the simulator launcher with both families clearly grouped:
- **Simulasi Keputusan** (4 cards): Mau KPR / Mau Gadai / Mau Cicil / Custom
- **Cek Kapasitas** (3 cards): Max Utang Aman / Lunasi Utang / Modal Options

Sticky dashboard on right.

---

### Screen 6 — Simulator Modal "Mau KPR" with side-by-side result

Generate the simulator modal in the **filled-in + result-rendered** state, showing:
- OJK disclaimer banner at top
- Input form (left): Harga 1.2M / DP 20% / Tenor 20 thn / Bunga 7% / Anuitas
- Computed: Cicilan Rp 9.3jt/bln, Total bunga Rp 1.032M
- Snapshot mirror (right top)
- Side-by-side comparison table with deltas
- **Goal impact section** visually separated: FI mundur 3 tahun, DP Rumah selesai ★
- Action buttons at bottom

---

### Screen 7 — Simulator Modal "Max Utang Aman" with output

Capacity simulator modal showing:
- OJK disclaimer
- Optional input (tenor, rate) collapsed by default
- **Hero output**: "Max cicilan baru: Rp 3.900.000 / bulan" (large tabular)
- Companion equivalent scenarios list (KPR / Cicil mobil / Cicil elektronik)
- Action buttons

---

### Screen 8 — Simulator Modal "Lunasi Utang"

Capacity simulator modal showing:
- "Modal Siap tersedia: Rp 52jt" banner
- Radio list of debts **sourced dynamically from Cicilan Aktif (§8.14.1) + Gadai (§8.14.2)** — each row shows `tipe` icon + `label` + `jenis_bunga` pill + `sisa_pokok`
- Slider for partial amount (0 → min(sisa_pokok, Modal Siap))
- **Conditional toggle**: for `Anuitas/Flat/Floating`, show "Tenor mundur" vs "Cicilan turun"; for `Revolving` (KK/Paylater/Pinjol) and Gadai, hide the toggle (sisa pokok turun langsung)
- Side-by-side impact table including Goal row
- Action buttons

---

### Screen 9 — Modal Likuid Options Panel (close-up)

Detail view of the Modal Likuid Options panel showing:
- Header: "Opsi yang Bisa Dihitungkan"
- Modal Siap value: Rp 52jt
- 5 options listed (lunasi KK, prepay KPR, beli BBCA, RD, Deposito)
- Each with descriptive impact + `[Hitung]` button
- Footer note about emergency fund

This can be a standalone variant or rendered within Screen 2.

---

### Screen 10 — Empty State (after "Mulai dari Snapshot", before any input)

- Snapshot tab active, no data anywhere
- All dashboard metric cards show "—" with greyed status dots
- Net Worth + Modal Siap hero pair both "—"
- Modal Likuid Options panel hidden (no modal yet)
- Goal cards: empty state with "Tambah goal pertama kamu" CTA
- Soft arrow + microcopy on the input panel pointing to first field: *"Mulai dari sini ↑ — isi yang paling gampang dulu"*
- Allocation donut: dashed-outline empty circle with *"Tambahkan aset untuk lihat alokasi"*
- Download .xlsx button in header disabled with tooltip *"Tambahkan minimal 1 aset"*

---

### Screen 11 — Stale Price / API Failure State

Same as Screen 2 but with:
- Yellow inline banner near Logam Mulia field: *"Harga emas terakhir update 2 jam lalu"* + `[Coba lagi]` icon button
- The LIVE pill on gold-price-related fields replaced with STALE amber pill
- Manual override field exposed: *"Atau masukkan harga manual: Rp ______ / gram"*
- One BBCA card showing STALE pill instead of LIVE
- Manual price input on that BBCA card

---

### Screen 12 — Negative Net Worth Edge State

Same as Screen 2 but with:
- Net Worth shown in `#BE123C` (rose) — "Rp −150.000.000"
- **Contextual descriptive panel** below the number — must use "Status" framing, NEVER "Saran":
  > *"Status: Aset bersih negatif. Utang Rp X melebihi total aset Rp Y. Lihat komposisi utang & likuiditas di panel kanan untuk evaluasi posisi."*
- DAR card in red zone
- DSR/Savings Rate possibly in Bahaya zone
- Modal Siap Distribusi card still shows actual liquid (might be small) — capacity is still a real number

---

### Screen 13 — Mobile Layout (<768px)

Single representative screen showing:
- Header collapses — wordmark left, Download icon right
- Tab bar full-width
- Input panel takes full width, dashboard appears below
- Anchor link at top: *"↓ Lihat dashboard"*
- Hero pair stacks vertically (Net Worth on top, Modal Siap below)
- Metric cards stack as full-width single column
- Per-emiten cards retain progress bar but lose bobot drift dot inline (shown on tap)
- Small persistent footer hint: *"Lebih nyaman di desktop"*

---

### Screen 14 — Simulator Modal "Mau Gadai Emas" (variant)

Generate as a sibling to Screen 6 to validate the simulator pattern works across decision-types. Show:
- Inputs: Gram 20 / Tempo 4 bln / Bunga 1.5%/bln / Taksiran 80%
- Computed: Modal cair Rp ~20jt, Total Beban, Defisit/bulan
- Side-by-side: Kas naik, Emas Tertahan naik, Rasio Tertahan shift
- Goal impact: "Modal Usaha" goal progress jumps (if exists)

---

## 10. Microcopy — Critical Strings

These strings carry most of the product's emotional weight. They must be perfect — designer should flag for PM review before mocks are finalized.

| ID | Where | Text |
|---|---|---|
| `cta.entry.snapshot` | Landing | *"Mulai dari Snapshot"* / *"Isi data kamu sendiri"* |
| `cta.entry.sample` | Landing | *"Coba dengan data contoh"* |
| `tagline.hero` | Landing | *"Aman gak kalau gw [KPR / Gadai / Cicil]? Berapa max utang yang aman? Cek dalam 10 menit. Tanpa daftar. Tanpa cloud."* |
| `footer.privacy` | All screens | *"🔒 100% client-side · Data kamu tetap di komputer kamu sendiri"* |
| `footer.ojk` | All screens | *"Cermat adalah kalkulator dan alat bantu visualisasi. Bukan saran investasi atau perencanaan keuangan profesional."* |
| `dialog.simulator.disclaimer` | Pre-simulator | *"⚠️ Hasil simulasi adalah ilustrasi berdasarkan input kamu — bukan jaminan dan bukan saran. Konsultasi profesional sebelum keputusan final."* |
| `dialog.refresh` | Beforeunload | *"Data kamu belum tersimpan. Yakin mau refresh?"* |
| `empty.nudge` | Empty input | *"Mulai dari sini ↑ — isi yang paling gampang dulu"* |
| `empty.goal` | No goals yet | *"Tambah goal pertama kamu — DP rumah? Dana pendidikan? FI?"* |
| `download.confirm` | Post-download toast | *"Tersimpan. Simpan baik-baik ya."* |
| `gadai.risk.high` | Rasio Tertahan >70% | *"🚨 Risiko likuidasi — Tertahan terlalu tinggi"* (descriptive, no advice) |
| `modal.options.header` | Modal Likuid Options panel | *"Opsi yang Bisa Dihitungkan"* — NEVER "Rekomendasi" or "Pilihan terbaik" |
| `fi.formula.label` | FI Goal card | *"Asumsi: Pengeluaran bulanan {X} × {multiplier} = FI Number {Y}"* |
| `capacity.max.zero` | Max Utang at 0 | *"DSR kamu sudah di atas threshold sehat (>30%). Tidak ada ruang untuk tambah cicilan tanpa lewat Waspada."* |
| `dsr.sehat` | DSR <30% | *"DSR kamu di zona Sehat (<30%). Punya buffer kalau ada cicilan baru."* |
| `dsr.waspada` | DSR 30–40% | *"DSR kamu di zona Waspada (30–40%). Tambahan cicilan bisa bikin keuangan ketat."* |
| `dsr.bahaya` | DSR >40% | *"DSR kamu di zona Bahaya (>40%). Beban cicilan udah berat."* (no advice — just description) |
| `cicilan.row.add_first` | Empty Cicilan Aktif panel | *"Belum ada cicilan aktif."* + CTA *"[+ Tambah Cicilan Pertama]"* |
| `cicilan.row.missing_bunga` | Row without `suku_bunga` | *"⚠ Bunga belum diisi"* (inline label-xs in warning-amber; describes gap, never says "sebaiknya diisi") |
| `cicilan.aggregate.terbesar` | Cicilan Aktif aggregate strip | *"Cicilan terbesar: {tipe_icon} {label} ({pct}% dari total)"* — descriptive context only. NEVER *"Fokus lunasi yang terbesar dulu"*. |
| `cicilan.quickadd.label` | Quick-add chips | *"Quick-add:"* followed by `[🏠 KPR] [🚗 KPM] [🏦 Bank/KTA] [📱 Pinjol] [🛍️ Paylater] [💳 KK]` |

**Total copy strings estimate:** ~60 across all metrics × thresholds + capacity outputs + empty states + error states. Lock as Figma component-level text variables when possible.

---

## 11. ⚠️ Critical OJK Constraints for the Designer

**Read this section before designing any panel.**

Cermat is "advice-adjacent" by design. To stay clear of OJK regulation around financial advice, every panel must adhere to:

### 11.1 Hard rules

**Never use these panel labels:**
- ❌ "Saran"
- ❌ "Rekomendasi"
- ❌ "Pilihan Terbaik"
- ❌ "Sistem Menyarankan"

**Always use these instead:**
- ✅ "Ringkasan"
- ✅ "Status"
- ✅ "Analisis Posisi"
- ✅ "Threshold"
- ✅ "Proyeksi"
- ✅ "Opsi yang Bisa Dihitungkan"
- ✅ "Kapasitas"

**Modal Likuid Options panel** is the most at-risk surface — it lists options. The header MUST be *"Opsi yang Bisa Dihitungkan"*. Each option's impact line must describe *what is*, never *what should be*.

**Cicilan Aktif panel** is the second-most at-risk surface — it shows debt rows side by side, including high-rate Pinjol next to low-rate KPR. Guard rails:
- The aggregate-strip line MUST stay descriptive: *"Cicilan terbesar: KPR (87% dari total)"* — NEVER prescriptive (*"Fokus lunasi yang terbesar dulu"*, *"Pinjol rate-nya paling tinggi — bayar dulu"*).
- Sort order of rows is `tanggal_jatuh_tempo` ascending OR insertion order — NEVER ranked by "urgency" or "rate". Ranking by rate implies prescriptive ordering.
- The Lunasi Utang simulator radio list (§8.19) inherits the same sort — no high-rate-first.

### 11.2 Copy rules

- Use indicative mood: *"DSR kamu **di** zona Waspada"*
- Avoid imperative / modal verbs: *"kamu harus / wajib / sebaiknya"*
- Never name specific products / instruments / brands as recommendations
- Threshold copy describes state, not action

### 11.3 Disclaimer placement

Three layers:
1. **Footer (persistent)** — every screen
2. **Pre-simulator banner** — top of every simulator modal
3. **Pre-goal-save banner** — confirmation when saving a goal

If you remove any of these, flag PM before doing so.

---

## 12. Accessibility Requirements

- All colored badges/dots **must pass WCAG AA** contrast on `#FFFFFF` and `#F8F9F5` surfaces — verify especially amber `#D97706`
- **Color is never the sole signal** — every status dot is paired with an icon and/or text label
- Full keyboard navigation through every input in logical order
- ARIA live regions on dashboard metric cards, goal cards, and capacity outputs so screen readers announce updates
- Visible focus states on every interactive element (no `outline: none`)
- `inputmode="decimal"` on all number inputs for mobile keyboards
- Tabular figures globally on all numerical values

---

## 13. Out of Scope (do not design)

- **Dark mode** (don't propose it — explicitly out for this scope)
- Custom illustrations / mascots
- Onboarding tour overlays
- Logo / wordmark final design (separate brand workstream)
- Animations beyond simple fades and recalc transitions
- iOS / Android native parity
- Email / sharing flows
- Settings page (no user account = no settings)
- Notification or alert center
- Multi-portfolio / household / shared views
- xlsx **import** flow (roadmap, not this scope)
- Per-emiten accumulation ladders (roadmap)

---

## 14. Deliverables Expected from Stitch / Designer

| # | Deliverable | Format |
|---|---|---|
| 1 | All 14 screens above | Figma frames |
| 2 | Per-emiten card component (collapsed + expanded) | Figma component with variants |
| 3 | Metric card component (green/amber/rose variants + empty) | Figma component |
| 4 | **Hero metric pair** (Net Worth + Modal Siap Distribusi) | Figma component |
| 5 | **Goal card** (standard + FI variant with multiplier) | Figma component |
| 6 | **Simulator modal** (Decision variant + Capacity variant + Lunasi Utang variant) | Figma components |
| 7 | **Modal Likuid Options panel** with auto-generated option list | Figma component |
| 8 | Gadai panel (safe + waspada + risiko likuidasi variants) | Figma component |
| 8b | **Cicilan Aktif panel** (row component with 4 jenis_bunga variants: Anuitas/Flat/Floating/Revolving × collapsed/expanded; plus empty-state, missing-bunga warning, aggregate strip) | Figma component |
| 9 | Tab bar (3 tabs, active state per tab) | Figma component |
| 10 | LIVE pill + ESTIMASI pill + STALE pill | Figma components |
| 11 | Allocation donut + Safe Haven stacked bar + Threshold bar | Figma components |
| 12 | Microcopy doc — all critical strings + variants | Markdown for PM review |
| 13 | Color & type token export | Style Dictionary or Tailwind config |
| 14 | Accessibility QA checklist | Markdown |

---

## 15. References & Anti-References

**This product should feel like:**
- A clean tax form that respects the user's time
- A focused calculator (Coda doc / Notion table) with a smart sidebar
- A privacy-respecting health tracker (Apple Health) — clinical but warm
- A loan officer's spreadsheet — but on the user's side
- A broker's order pad — quiet, dense, precise *(per-emiten cards specifically)*

**This product should NOT feel like:**
- Bibit / Pluang — too gamified, growth-marketing colors
- Stockbit — too dense, trader-floor energy
- Mint / Personal Capital — bank-blue, US-centric, ad-heavy
- Crypto / Bloomberg dashboards — dark-mode, candle-chart energy
- A bank loan calculator — too dry, institution-optimized
- A robo-advisor — prescriptive, over-promising
- A generic Excel template — cold, no live feedback

---

**End of design prompt. Generate.**
