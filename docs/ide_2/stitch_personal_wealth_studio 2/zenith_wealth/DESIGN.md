---
name: Zenith Wealth
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#c6c6cd'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#909097'
  outline-variant: '#45464d'
  surface-tint: '#bec6e0'
  primary: '#bec6e0'
  on-primary: '#283044'
  primary-container: '#0f172a'
  on-primary-container: '#798098'
  inverse-primary: '#565e74'
  secondary: '#bcc7de'
  on-secondary: '#263143'
  secondary-container: '#3e495d'
  on-secondary-container: '#aeb9d0'
  tertiary: '#e8c444'
  on-tertiary: '#3c2f00'
  tertiary-container: '#cba829'
  on-tertiary-container: '#4e3e00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#ffe081'
  tertiary-fixed-dim: '#e8c344'
  on-tertiary-fixed: '#231b00'
  on-tertiary-fixed-variant: '#564500'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
  gold-cadangan: '#D4AF37'
  gold-tertahan: '#475569'
  status-safe: '#10B981'
  status-warning: '#F59E0B'
  status-danger: '#EF4444'
  status-info: '#3B82F6'
typography:
  hero-value:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  tabular-data:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  hero-value-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  panel-split: 45/55
  header-height: 64px
  gutter: 1.5rem
  container-padding: 2rem
  table-row-height: 40px
---

## Brand & Style

The design system is engineered for "Bayu," a sophisticated Indonesian retail investor who values precision, privacy, and data integrity. The brand personality is **Technical, Transparent, and Empowering**, moving away from "fintech-lite" toward a professional financial terminal aesthetic.

The chosen style is **Corporate / Modern** with a **Functional Density** overlay. It prioritizes information over decoration, mirroring the reliability of a high-end brokerage platform while maintaining the warmth of a premium personal tool. The visual narrative treats the UI as a "friendly renderer" for the user's canonical `.xlsx` data—structured, high-fidelity, and strictly professional.

**Design Principles:**
- **Fidelity to the File:** The UI must reflect the structure of the underlying spreadsheet.
- **Privacy-Centric:** Visual cues (lock icons, "Local-Only" badges) reinforce that data never leaves the browser.
- **Data over Decoration:** Whitespace is used strategically to group complex financial relationships rather than just to "breathe."

## Colors

The system uses a **Dark Mode** default to reduce eye strain during deep data analysis and to evoke a premium "terminal" feel. 

- **Primary & Secondary:** Deep Navy (`#0F172A`) and Slate (`#1E293B`) form the structural foundation, creating a sophisticated, low-distraction environment.
- **Tertiary (Gold):** A refined Gold (`#B59410`) is used sparingly for primary actions and brand accents, specifically tied to gold-tracking features.
- **Semantic Palette:** A strict "Traffic Light" system is used for financial health. 
    - **Green** for "Investor-Grade" metrics (DAR < 20%).
    - **Amber** for "Aggressive/Warning" states (Safe Haven < 40%).
    - **Red** for "Liquidation Risk" in the Gadai module.
- **Asset Specifics:** Gold reserves use a vibrant Gold (`#D4AF37`), while pawned assets (Tertahan) use a muted Slate (`#475569`) to indicate "unavailable" equity.

## Typography

**Plus Jakarta Sans** is the exclusive typeface, chosen for its modern Indonesian heritage and excellent legibility in data-dense environments.

**Key Requirements:**
- **Tabular Figures (`tnum`):** This is non-negotiable for all numeric data. All prices, lot counts, and percentages must use tabular lining to ensure vertical alignment in tables and dashboard cards.
- **Hierarchy:** The `hero-value` (48px) is reserved for the Net Worth at the top of the dashboard. `label-caps` is used for metadata and secondary axis labels in charts.
- **Contrast:** High-contrast white or near-white text should be used for all tabular data against the dark backgrounds to ensure WCAG AA accessibility for financial figures.

## Layout & Spacing

The system employs a **45/55 Split-Screen Layout** on desktop to balance input precision with real-time dashboard feedback.

- **Left Panel (45%):** Dedicated to the 4-Tab Input System (Aset, Cashflow, Utang, Target). This area uses a "broker-pad" density with 40px row heights.
- **Right Panel (55%):** The live Dashboard. Content is organized into 5 distinct rows (A through E) containing metric cards and visualizations.
- **Grid:** A rigid 12-column grid is used within the dashboard panel, allowing cards to span 4, 6, or 12 columns.
- **Mobile Reflow:** On mobile, the split-screen collapses into a single-column vertical scroll. The Dashboard metrics take priority at the top, followed by expandable input sections.
- **Sticky Header:** A 64px header remains fixed, housing the primary "Import/Export" actions and the session status.

## Elevation & Depth

Zenith Wealth uses **Tonal Layers** rather than shadows to convey depth, maintaining a flat, professional "terminal" aesthetic.

- **Base Layer:** The darkest navy (`#0F172A`) serves as the canvas.
- **Surface Layer:** Dashboard cards and input containers use a slightly lighter slate (`#1E293B`) to lift them from the base.
- **Interaction Overlays:** The "Import .xlsx" flow and "Migration Diff" use a centered modal with a 60% opacity black backdrop blur to isolate the task.
- **Borders:** Low-contrast outlines (1px Slate-700) are used to define table cells and card boundaries, avoiding heavy shadows that would clutter the high-density data.

## Shapes

The system uses a **Soft (1)** roundedness level. A `0.25rem` (4px) corner radius is applied to all standard components like input fields, chips, and small cards. 

This subtle rounding maintains the professional "serious" character of the tool while avoiding the aggressive sharpness of a pure brutalist UI. Progress bars and status badges also follow this 4px rule, ensuring a cohesive geometry across the dashboard.

## Components

**Buttons & Actions:**
- **Primary:** Tertiary Gold (`#B59410`) with white text. Reserved for "Mulai Baru" or "Export .xlsx".
- **Secondary/Ghost:** Outlined buttons with 1px Slate borders for "Import .xlsx" or "Add Row".

**Data Components:**
- **Progress Bars:** Dual-layered bars for stock accumulation. The background is a muted grey, the fill is Primary Navy or Green. For "Gadai Emas," use a stacked bar showing "Cadangan" vs "Tertahan."
- **Status Chips:** Small, pill-shaped badges with emojis (💎, 🛡️, ⚖️, 🚀) as prefixes for quick health checks.
- **Input Fields:** High-density, border-only inputs that mimic spreadsheet cells. On focus, the border transitions to a solid 1px Gold.
- **The "Saran" Panel:** A specialized card with a distinct left-border accent (Semantic Info Blue) to highlight opinionated financial advice.
- **Hydration Loader:** A linear progress bar at the top of the screen during `.xlsx` parsing, using the Gold accent.

**Tables:**
- Clean, header-less or minimal-header rows. Use zebra-striping (Slate-800/Slate-900) for rows exceeding 10 items to aid horizontal scanning.