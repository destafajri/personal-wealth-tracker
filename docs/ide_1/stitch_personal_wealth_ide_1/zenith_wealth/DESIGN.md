---
name: Zenith Wealth
colors:
  surface: '#f9faf6'
  surface-dim: '#dadad7'
  surface-bright: '#f9faf6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f1'
  surface-container: '#eeeeeb'
  surface-container-high: '#e8e8e5'
  surface-container-highest: '#e2e3e0'
  on-surface: '#1a1c1a'
  on-surface-variant: '#414844'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f0f1ee'
  outline: '#717973'
  outline-variant: '#c1c8c2'
  surface-tint: '#3f6653'
  primary: '#012d1d'
  on-primary: '#ffffff'
  primary-container: '#1b4332'
  on-primary-container: '#86af99'
  inverse-primary: '#a5d0b9'
  secondary: '#5d5f5c'
  on-secondary: '#ffffff'
  secondary-container: '#dfe0dc'
  on-secondary-container: '#616360'
  tertiary: '#401b1b'
  on-tertiary: '#ffffff'
  tertiary-container: '#5a302f'
  on-tertiary-container: '#d29895'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c1ecd4'
  primary-fixed-dim: '#a5d0b9'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#274e3d'
  secondary-fixed: '#e2e3df'
  secondary-fixed-dim: '#c5c7c3'
  on-secondary-fixed: '#1a1c1a'
  on-secondary-fixed-variant: '#454745'
  tertiary-fixed: '#ffdad8'
  tertiary-fixed-dim: '#f5b7b4'
  on-tertiary-fixed: '#331111'
  on-tertiary-fixed-variant: '#673a39'
  background: '#f9faf6'
  on-background: '#1a1c1a'
  surface-variant: '#e2e3e0'
  accent-emerald: '#2D6A4F'
  warning-amber: '#D97706'
  danger-rose: '#BE123C'
  neutral-silver: '#E5E7EB'
  text-main: '#1F2937'
  text-muted: '#6B7280'
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
  headline-lg-mobile:
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
    letterSpacing: 0.01em
  label-xs:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-max: 1440px
  input-panel-width: 45%
  dashboard-panel-width: 55%
  gutter: 32px
  margin-page: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style

The brand personality is **Professional, Trustworthy, and Calm**. It is designed to feel like a high-fidelity financial instrument—a tool of clarity for the Indonesian professional. The design system rejects the "attention economy" of typical fintech (gamification, saturated colors, urgent notifications) in favor of a "Privacy-First" sanctuary where data is processed locally and transparently.

The chosen style is **Modern Corporate with a Minimalist focus**. It utilizes heavy whitespace, a sophisticated off-white foundation, and precise typography to evoke the feeling of a well-organized, private banking ledger. 

**Key Brand Pillars:**
- **Privacy as a Service:** The UI must visually communicate that data never leaves the client. Absence of "Login" or "Cloud" indicators is a primary design choice.
- **Financial Clarity:** Complex data is distilled into four core metrics (Net Worth, DSR, Runway, Savings Rate) using high-contrast, large-scale typography.
- **Local Nuance:** Tailored specifically for the Indonesian market, using "kamu" (casual professional) and Rupiah formatting that respects local decimal conventions.

## Colors

The palette is anchored in **Forest Greens** and **Off-Whites**, avoiding the ubiquitous "Bank Blue" to differentiate as a modern, independent tool. 

- **Primary (#1B4332):** A deep, professional green used for primary brand touchpoints and heavy text elements.
- **Secondary / Background (#F8F9F5):** An off-white/bone background that reduces eye strain and distinguishes the app from a generic spreadsheet or blank document.
- **Accent Emerald (#2D6A4F):** Used for "Healthy" state indicators and primary Call-to-Actions (CTAs).
- **Warning Amber (#D97706):** A sophisticated ochre used for caution/warning states (DSR > 30%). It must always be paired with an icon or text label for accessibility.
- **Danger Rose (#BE123C):** A muted red used sparingly for negative net worth or critical debt levels.

**Color Logic:**
- **Surfaces:** Use `#F8F9F5` for the main canvas and pure `#FFFFFF` for elevated cards to create a subtle layered effect.
- **Borders:** Use low-contrast `#E5E7EB` for input fields and asset rows to keep the UI feeling "light."

## Typography

**Plus Jakarta Sans** is the primary typeface, chosen for its modern, clean geometry that feels approachable yet professional.

**Tabular Figures (Non-Negotiable):** All numerical values, especially in the Dashboard Panel and Asset Rows, must use `font-variant-numeric: tabular-nums`. This ensures that decimals and thousand separators align perfectly in vertical scans, which is critical for financial data fidelity.

**Hierarchy Rules:**
- **Net Worth (Hero):** Uses the `headline-hero` style. It is the single most important number on the screen.
- **Metric Cards:** Use `metric-value` for the percentage or month values to ensure they are glanceable.
- **Microcopy:** Secondary explainers and "trust signals" use `label-sm` in a muted gray color to maintain the "Calm" aesthetic.
- **Currency Symbols:** The "Rp" prefix should be slightly lighter in weight or color than the value itself to emphasize the magnitude of the number.

## Layout & Spacing

The system uses a **Fixed Split-Grid** model for desktop, prioritizing a side-by-side view where the dashboard remains sticky.

**Layout Philosophy:**
- **Desktop (≥1280px):** A two-pane layout. The left pane (Input) is scrollable, while the right pane (Dashboard) is sticky to the viewport. This provides immediate visual feedback as the user types.
- **Mobile (<768px):** The layout reflows to a single column. The dashboard moves below the input forms, with a floating "Jump to Dashboard" button appearing once initial data is entered.
- **Spacing Rhythm:** Based on an 8px baseline. Asset rows and input fields use `stack-md` (16px) for internal padding to ensure touch targets are comfortable and data is legible.
- **Margins:** Generous 40px outer margins on desktop to prevent the "crowded spreadsheet" feeling.

## Elevation & Depth

To maintain a "Calm" and "Privacy-First" atmosphere, this design system avoids heavy shadows and skeuomorphism. It uses **Tonal Layers** and **Low-Contrast Outlines** to define hierarchy.

**Layering Strategy:**
- **Level 0 (Background):** `#F8F9F5` (Off-white canvas).
- **Level 1 (Cards/Inputs):** Pure `#FFFFFF` surfaces with a subtle 1px border (`#E5E7EB`). 
- **Level 2 (Active States):** A very soft, diffused shadow (0px 4px 12px rgba(0,0,0,0.03)) is applied only to the primary Dashboard Metric cards to give them a slight "hero" prominence over the background.

**Depth via Color:**
- Interactive elements (buttons, inputs) use a subtle hover state change (background becomes 2% darker) rather than an elevation change. This keeps the interface feeling "flat" and stable.

## Shapes

The shape language is **Soft (0.25rem)**. 

While the brand is professional, strictly sharp corners feel too "institutional" or "legacy." A subtle 4px corner radius on inputs, buttons, and asset rows softens the experience, making the platform feel like a modern digital tool. 

- **Cards:** 8px (rounded-lg) for the main dashboard metrics.
- **Inputs/Buttons:** 4px (base roundedness) for a precise, crisp look.
- **Progress Bars/Donut Segments:** Use flat caps rather than rounded ends to maintain the "high-fidelity data" aesthetic.

## Components

**Buttons**
- **Primary:** Filled `primary-color` (#1B4332) with white text. Used for "Download .xlsx". No heavy gradients.
- **Secondary:** Outlined with `neutral-silver`. Used for adding asset rows.
- **Ghost/Danger:** Transparent background with `danger-rose` text for "Reset Data" functions.

**Input Fields (Financial)**
- **Prefix:** "Rp" is permanently fixed to the left of the input, rendered in `text-muted`.
- **Formatting:** Must auto-format with period separators as the user types (e.g., 10.000.000).
- **Active State:** 1px solid `primary-color` border. No glow/halo.

**Metric Cards**
- **Structure:** Metric name (Label), Primary Value (Hero Number), Status Dot (Color-coded), and a 1-line plain-language explainer at the bottom.
- **Interactivity:** On hover, show the mathematical formula (e.g., "Cicilan ÷ Gaji") as a subtle tooltip.

**Asset Rows**
- A horizontal strip containing: Asset Name, Value in IDR, Edit Icon, and Delete Icon.
- Rows are separated by a 1px `#E5E7EB` divider. 
- "Add" actions are links placed directly below the list of items, never floating.

**Donut Chart**
- Use a 12px stroke width for the donut. 
- Use the `primary-color` and `accent-emerald` for the largest segments, with shades of gray for smaller/other segments to avoid a "rainbow" look.
- Centered in the donut: Total Asset Value (Small).