---
name: Cermat
colors:
  surface: '#f9faf6'
  surface-dim: '#d9dad7'
  surface-bright: '#f9faf6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f0'
  surface-container: '#edeeea'
  surface-container-high: '#e7e9e5'
  surface-container-highest: '#e2e3df'
  on-surface: '#1a1c1a'
  on-surface-variant: '#414844'
  inverse-surface: '#2e312f'
  inverse-on-surface: '#f0f1ed'
  outline: '#717973'
  outline-variant: '#c1c8c2'
  surface-tint: '#3f6653'
  primary: '#012d1d'
  on-primary: '#ffffff'
  primary-container: '#274E3D'
  on-primary-container: '#86af99'
  inverse-primary: '#a5d0b9'
  secondary: '#2c694e'
  on-secondary: '#ffffff'
  secondary-container: '#aeeecb'
  on-secondary-container: '#316e52'
  tertiary: '#322400'
  on-tertiary: '#ffffff'
  tertiary-container: '#4d3900'
  on-tertiary-container: '#c2a35b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c1ecd4'
  primary-fixed-dim: '#a5d0b9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#274e3d'
  secondary-fixed: '#b1f0ce'
  secondary-fixed-dim: '#95d4b3'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#0e5138'
  tertiary-fixed: '#ffdf9b'
  tertiary-fixed-dim: '#e4c278'
  on-tertiary-fixed: '#251a00'
  on-tertiary-fixed-variant: '#5a4302'
  background: '#f9faf6'
  on-background: '#1a1c1a'
  surface-variant: '#e2e3df'
  primary-dark: '#012D1D'
  accent-emerald-soft: '#86AF99'
  warning-amber: '#D97706'
  danger-rose: '#BE123C'
  gold-muted: '#9C8554'
  capacity-teal: '#0891B2'
  surface-card: '#FFFFFF'
  surface-low: '#F3F4F1'
  border-strong: '#C1C8C2'
typography:
  headline-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  metric-value:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
  label-xs:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  stack_xs: 4px
  stack_sm: 8px
  stack_md: 16px
  stack_lg: 24px
  stack_xl: 32px
  gutter: 32px
  margin: 40px
  max-width: 1440px
---

## Brand & Style

The design system embodies the persona of a **Prudent Private Banker**: meticulous, calm, and unfailingly disciplined. It is designed for Indonesian adults navigating high-stakes financial decisions like KPR (mortgages) or gold pawning, where clarity is a form of respect.

The visual style is **Corporate / Modern with a "Clinical-Warm" edge**. It rejects the frantic "gamification" and bright neons of typical fintech apps in favor of a sophisticated, high-density utility aesthetic. 

### Key Principles:
- **Privacy-First Minimalist:** The absence of login or cloud features is signaled through a stable, local-first interface that feels like a high-end personal tool rather than a data-harvesting service.
- **Descriptive, Not Prescriptive:** The UI acts as a "neutral mirror." It reports status through clear hierarchy and data visualization without offering unsolicited financial advice.
- **Data Integrity:** High information density is managed through progressive disclosure, ensuring the UI remains "smart" but never overwhelming.

## Colors

The palette is anchored in **Forest Greens and Warm Off-Whites**, deliberately moving away from the "Bank Blue" standard. 

- **Primary (#1B4332):** Used for brand anchors, primary CTAs, and active interactive states. It conveys stability.
- **Secondary/Accent Emerald (#2D6A4F):** Reserved for "Healthy" status zones and positive progress.
- **Tertiary/Gold (#C9A961):** A specialized accent for physical asset reserves (Gold/Emas) and decorative indicators.
- **Neutral/Surface (#F8F9F5):** A warm, medical-clean background that reduces eye strain during long modeling sessions.

**Semantic Logic:**
- **Success (Emerald):** DSR &lt; 30%, Savings &gt; 20%.
- **Warning (Amber):** DSR 30–40%, "Stale" data badges.
- **Danger (Rose):** Negative net worth, DSR &gt; 40%.

## Typography

The design system exclusively utilizes **Plus Jakarta Sans**. 

**Strict Requirement: Tabular Numerals**
For all financial data, metrics, and currency displays, `font-variant-numeric: tabular-nums` must be enabled. This ensures vertical alignment of decimals and digits, critical for "Smart Spreadsheet" scanning.

**Hierarchy Strategy:**
- **Hero Metrics:** Used for the absolute "North Star" numbers (Net Worth, Modal Siap).
- **Metric Values:** Used in the 6-card dashboard grid for immediate health checks.
- **Labels:** Used for metadata, status pills, and form field descriptors. The `label-xs` is specifically for high-density badges like "LIVE" or "ESTIMASI."

## Layout & Spacing

This design system employs a **Split-Panel Desktop-First** approach, optimized for high-density financial modeling.

### Layout Model:
- **Left Panel (45%):** Scrollable input area for data entry, organized into collapsible groups.
- **Right Panel (55%):** Sticky dashboard/results area that provides immediate visual feedback as inputs change.
- **Grid:** On desktop, major metrics follow a 6-column grid; on mobile, these reflow into a single column with a "Better on Desktop" advisory.

### Spacing Rhythm:
A strict **8px baseline** is used. `stack_md` (16px) is the default internal padding for components. Use `stack_xs` (4px) only for tight groupings, such as a label and its corresponding helper icon.

## Elevation & Depth

The system follows a **"Flat Tonal"** philosophy. Depth is created through surface color layering and borders rather than ambient shadows, maintaining a "Smart Spreadsheet" utility feel.

- **Level 0:** Main page background (`surface`).
- **Level 1:** Individual asset rows, input fields, and standard cards. Defined by a 1px solid border (`#E5E7EB`).
- **Level 2 (Hero):** Only the Net Worth and Modal Siap cards receive a subtle elevation to highlight their importance (0px 4px 12px rgba(0,0,0,0.03)).
- **Modals:** Reserved for Wizards, using a deeper shadow (0px 20px 40px rgba(0,0,0,0.08)) to separate the simulation task from the main data set.

**Interactive States:** Hovering over list items or buttons does not trigger elevation; instead, use a subtle 2% background darken for immediate feedback.

## Shapes

Shapes are **Soft and Precise**. The system avoids overly rounded or "bubbly" geometry to maintain a professional, clinical tone.

- **4px (Soft):** Applied to buttons, input fields, and individual list rows. This provides a clean, modern feel that aligns with standard data-dense tools.
- **8px (Rounded-lg):** Applied to Metric Cards, Dashboard panels, and Wizard modals to create clear container boundaries.
- **9999px (Pill):** Used exclusively for status badges (LIVE, STALE, ON-TRACK) and quick-add chips.

## Components

### Buttons
- **Primary:** Forest Green (`#1B4332`) with white text. High emphasis.
- **Secondary:** Surface-low background with Primary text. Used for "Add Row" or "Collapse" actions.
- **Danger:** Ghost style with Rose (`#BE123C`) text/border, reserved for "Delete" or "Clear Data."

### Input Fields
- **Default:** White background, 1px border.
- **Focused:** 1px border in Primary Green.
- **Specialty:** Inputs should accept shorthand (e.g., "25jt") but instantly format to tabular IDR with separators (Rp 25.000.000).

### Cards & Metrics
- **Metric Cards:** Should feature a "Thermometer" threshold bar at the bottom, colored Emerald, Amber, or Rose based on the data value.
- **Asset Rows:** 1px bottom border for separation. Use a 16px line icon to identify asset types (🏠, 🚗, 💳).

### Status Indicators (Pills)
- **Status Badges:** `On-Track`, `At-Risk`, `Off-Track`.
- **Drift Dots:** Used in per-emiten lists to show allocation variance.
- **Delta (Δ):** In Wizards, use side-by-side comparison boxes showing the change in metrics (e.g., "DSR: 28% → 33% ▲").

### Iconography
Use 16px Lucide-style line icons. Avoid "institutional" bank icons; favor functional, minimalist symbols.