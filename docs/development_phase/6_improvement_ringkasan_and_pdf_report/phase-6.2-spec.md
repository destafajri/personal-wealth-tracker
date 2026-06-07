# Phase 6.2: Visualization & Gamification

**Priority:** HIGH (wow factor for vibe coding contest demo)
**Prerequisite:** Phase 6+6.1 merged
**Effort estimate:** XL (12 days — tight, no buffer)
**Scope status:** Locked after 6-round AI tetangga collaboration + Amendments 1-3

### Amendment 1 (2026-06-07)
- **A. Tier icons:** 🏆 → 👑 (crown = sultan/royal mastery), 🌳→🌴, 🌲→🌾 to differentiate tiers. Added `subtitle` field per tier (e.g., "Mapan Finansial").
- **B. Metric labels:** Created `lib/finance/metric-labels.ts` — centralized Indonesian display labels. ScoreHero breakdown no longer shows raw camelCase keys.
- **C. Safe Haven floor:** When `totalAssets < 3 × monthlyExpenses`, Safe Haven treated as Incomplete Data → 0 points (prevents "100% safe" on Rp 1jt cash-only user in deficit).

### Amendment 3 (2026-06-07) — Label & tone fixes (AI tetangga review 6)

- **A. DSR/DAR naming corrected:** DSR → "Beban Cicilan" (was "Rasio Utang"), DAR → "Rasio Utang" (was raw acronym). Semantics now match: DSR = beban cicilan bulanan, DAR = utang/aset. Consistent across sidebar, card, and breakdown (3-zone consistency).
- **B. Deficit tone gate:** When `surplusIdr < 0`, tier subtitle switches to "Hati-hati Defisit" (red) instead of positive labels like "Tumbuh Stabil". Formula unchanged — only display tone affected.

### Amendment 2 (2026-06-07) — Multi-persona sample data (SHOULD-HAVE / stretch)

**Status:** SHOULD-HAVE / stretch (Day 11-12). Above demo-critical MUST.

**Architecture:** Picker "Pakai Data Contoh" changed from 1-button→1-data to list of 10 personas. Each selection loads `(mode + snapshot)`.
```typescript
interface SamplePersona {
  id: string
  nama: string
  emoji: string
  mode: 'wealthTracker' | 'budgetKos'
  blurb: string
  snapshot: SnapshotState
}
```
§9 not violated: budget-kos personas load into budget-kos mode (own Ringkasan), wealth-tracker into wealth-tracker mode.

**Roster (10 personas, spectrum bottom→top):**

| # | Persona | Emoji | Mode | Showcase | Target |
|---|---|---|---|---|---|
| 1 | Mahasiswa Pas-pasan | 🎓 | budget-kos | Pejuang, runway tipis | survival |
| 2 | Mahasiswa Mandiri | 💪 | budget-kos | budget-kos "menang" | surplus sehat |
| 3 | Mahasiswa Sultan | 🃏 | wealth-tracker | "skor menipu" (lantai 500) | Rimbun ~675 |
| 4 | Korban Judol | 🎰 | wealth-tracker | Sankey gut-punch | Tunas ~200 |
| 5 | Terjebak Cicilan | ⛓️ | wealth-tracker | jebakan utang | Bibit ~50 |
| 6 | Pegawai Muda + KPR | 💼 | wealth-tracker | flagship balanced | Hutan 825 |
| 7 | Freelancer Bebas Utang | 🎨 | wealth-tracker | null-handling proof | Rimbun ~700 |
| 8 | Juragan Kos | 🏠 | wealth-tracker | tier-integrity (Hutan-tapi-merah) | Hutan ~850 |
| 9 | Pensiunan Mapan | 🧓 | wealth-tracker | near-perfect | Hutan ~975 |
| 10 | Sultan Properti | 👑 | wealth-tracker | wow net worth ~Rp13M | Hutan ~925 |

**Naming (OJK-friendly):** "Korban Judol" (victim framing), line items "Top-up/Hobi Online" (not "Judi"). Sultan = archetype "Sultan Properti", never real names.

**Sankey override:** node "Top-up/Hobi Online" (#4 Judol) MUST standalone, never grouped into "Lainnya" despite limit-N top-6 rule.

**Priority tiers:**
- Tier 1 (wajib): #6 Pegawai + #4 Judol
- Tier 2: #5 Cicilan + #8 Juragan Kos
- Tier 3 (bonus): #1, #2, #3, #7, #9, #10

**Calibration note:** debt-free users have a "floor 500" (DSR+DAR N/A→full + Goal N/A + Alloc N/A). #3 Mahasiswa Sultan intentionally scores ~675 (Rimbun) despite zero financial literacy — lesson is in the breakdown, not the total. Do NOT change formula.

---

## Motivation

Phase 6 ships advisor-grade health metrics + PDF. Phase 6.2 adds the **visual storytelling layer** that makes judges say "holy shit" in the first 30 seconds:

1. **Cermat Score** — single number (0-1000) that summarizes financial health
2. **Level System** — gamification tier progression (Bibit → Hutan)
3. **Achievement Badges** — OJK-friendly milestones that reward good habits
4. **Sankey Cash Flow** — visual income → expense flow diagram
5. **What-If Simulator** — interactive "what if I invest X per month?" projection
6. **Visual Polish** — count-up animation, color consistency, hover effects

---

## 1. Existing Phase 6 Health Metrics Architecture

### Where metrics live

| File | Role |
|---|---|
| `lib/finance/metrics.ts` | Pure metric functions (all calculations) |
| `lib/finance/thresholds.ts` | Zone thresholds + `zoneOf()` classifier |
| `stores/derived.ts` | Reactive computed properties wrapping metric functions |
| `components/dashboard/MetricGrid.vue` | 6-card grid displaying DSR, Runway, Savings Rate, DAR, Safe Haven, Allocation Discipline |
| `components/dashboard/MetricCard.vue` | Single metric card with zone color + info button |
| `components/dashboard/HeroPair.vue` | Net Worth + Modal Siap hero display |

### Current metrics (8 total)

| Metric | Function | Zone | Thresholds |
|---|---|---|---|
| DSR | `calcDsr()` | lower-better | <30% sehat, ≥40% bahaya |
| DAR | `calcDar()` | lower-better | <30% sehat, ≥50% bahaya |
| Runway | `calcRunway()` | higher-better | ≥6mo sehat, <3mo bahaya |
| Savings Rate | `calcSavingsRate()` | higher-better | ≥20% sehat, <10% bahaya |
| Safe Haven | `calcSafeHaven()` | higher-better | ≥60% sehat, <40% bahaya |
| Allocation Discipline | `calcAllocationDiscipline()` | lower-better | <5pp sehat, ≥15pp bahaya |
| Goal Health | `derived.goalHealth` | higher-better | ≥80% sehat, <50% bahaya |
| Rasio Tertahan | In GadaiPanel | lower-better | <50% sehat, ≥70% bahaya |

> **Note (threshold source):** Thresholds above are from `lib/finance/thresholds.ts` (code = source of truth). The Phase 6 spec document referenced different values (Safe Haven 20-30%, Allocation Discipline >10pp Off-Plan) but the actual code uses the values listed here. No redefinition — this spec follows the code.

### Zone system

```typescript
// lib/finance/thresholds.ts
type Zone = 'sehat' | 'waspada' | 'bahaya'
function zoneOf(metric: MetricKey, value: number): Zone
```

Each metric returns a Zone. UI maps: sehat → green, waspada → amber, bahaya → red.

### Data flow

```
snapshot store → derived store (computed) → metric functions (pure) → zoneOf() → UI components
```

---

## 2. Cermat Score Formula Proposal

### Approach: extend existing Zone system

Instead of building a new scoring system, **map existing Zone classifications to point values**. This reuses `zoneOf()` and `thresholds` — no new calculation logic.

### Formula: weighted sum of zone points

```typescript
interface ScoreContribution {
  metric: MetricKey
  zone: Zone
  points: number  // points earned
  maxPoints: number  // max possible for this metric
}

function calcCermatScore(snap, prices): { score: number, contributions: ScoreContribution[] }
```

### Scoring table (total max = 1000)

| Metric | Weight | Sehat | Waspada | Bahaya | Not Applicable |
|---|---|---|---|---|---|
| DSR | 200 | 200 | 100 | 0 | **200** (no debt = good) |
| Savings Rate | 200 | 200 | 100 | 0 | 0 (no income data) |
| Runway | 150 | 150 | 75 | 0 | 0 (no expense data) |
| DAR | 150 | 150 | 75 | 0 | **150** (no debt = good) |
| Safe Haven | 100 | 100 | 50 | 0 | 0 (no asset data) |
| Goal Health | 100 | 100 | 50 | 0 | **100** (no goals = neutral, not penalized) |
| Net Worth vs Expenses | 50 | 50 (≥12× expenses) | 25 (≥6× expenses) | 0 (<6×) | 0 |
| Allocation Discipline | 50 | 50 | 25 | 0 | **50** (no stocks = not applicable) |
| **Total** | **1000** | | | | |

### Null handling: "Not Applicable" vs "Incomplete Data"

Key design decision: **debt-free user is rewarded, not penalized.**

- **Not Applicable (full points):** Metric returns null because the category genuinely doesn't apply.
  - DSR null + `calcTotalUtang() === 0` → full 200 points (no debt = no problem)
  - DAR null + `calcTotalUtang() === 0` → full 150 points
  - Allocation Discipline null + no stock holdings → full 50 points (no stocks = not applicable)
  - Goal Health null + no goals defined → full 100 points (no goals yet = neutral)

- **Incomplete Data (0 points):** Metric returns null because user hasn't filled required inputs.
  - Savings Rate null + no income data → 0 points (push user to fill)
  - Runway null + no expense data → 0 points
  - Safe Haven null + no assets → 0 points
  - **Safe Haven floor (Amendment 1):** Safe Haven value is non-null BUT `totalAssets < 3 × monthlyExpenses` → treat as Incomplete Data → 0 points. Prevents "100% safe" score on users with minimal assets who are in deficit.

### Net Worth vs Expenses (threshold-based, not binary)

```
Net Worth ≥ 12× monthly expenses → 50 points (Sehat)
Net Worth ≥ 6× monthly expenses  → 25 points (Waspada)
Net Worth < 6× monthly expenses  → 0 points (Bahaya)
```

This aligns with the "dana darurat" concept. User with net worth Rp 1 barely positive gets 0, user with net worth covering 12+ months gets 50. Discontinuous jump avoided.

### Rasio Tertahan — intentionally excluded from scoring

Rasio Tertahan (gadai ratio) is excluded from Cermat Score because it only applies to users who have gadai (pledged gold). It's a niche metric — most users don't have gadai data. Including it would penalize non-gadai users or require complex "not applicable" handling for limited benefit. It remains visible in GadaiPanel as a standalone metric.

### Where to add

```typescript
// lib/finance/cermat-score.ts (NEW FILE)
export function calcCermatScore(snap: SnapshotState, prices?: PricesView): {
  score: number
  level: CermatLevel
  contributions: ScoreContribution[]
}
```

Exposed via `stores/derived.ts` as a new computed property.

---

## 3. Level System

### 5 tiers based on Cermat Score

| Tier | Score Range | Label | Subtitle | Icon | Color |
|---|---|---|---|---|---|
| 0 | — | Belum Dinilai | Mulai isi data | — | `gray-400` |
| 1 | 1-200 | Bibit | Langkah Awal | 🌱 | `emerald-300` |
| 2 | 201-400 | Tunas | Tumbuh Stabil | 🌿 | `emerald-400` |
| 3 | 401-600 | Pohon | Kokoh Finansial | 🌴 | `emerald-500` |
| 4 | 601-800 | Rimbun | Hampir Mapan | 🌾 | `emerald-600` |
| 5 | 801-1000 | Hutan | Mapan Finansial | 👑 | `amber-500` |

> **"Belum Dinilai" state:** Before user inputs minimum data (at least 3 metrics with values), display "Belum Dinilai" with placeholder ring. Avoid labeling new user as "Bibit" — that feels punishing during onboarding. Once ≥3 metrics have data, tier system activates.

> **Tier integrity:** "Hutan" (801-1000) can be reached even with one "bahaya" metric (e.g., Safe Haven 9,3% = 0 points, but other metrics compensate). ScoreHero must always show the full contribution breakdown so users see which metrics need work — never hide a bahaya metric behind a high tier.

### Visual

- Circular progress ring (SVG, no library needed) showing score/1000
- Big number in center with count-up animation on load
- Level label + progress bar to next tier below
- Animate ring fill on page load (CSS transition or `requestAnimationFrame`)

### Component

```typescript
// components/dashboard/CermatScoreHero.vue (NEW)
// Positioned in main content area (Ringkasan tab), above MetricGrid.
// NOT in sidebar — sidebar (DashboardSummary) is already compact with ~8 elements.
// ScoreHero + AchievementGrid sit in main content above existing MetricGrid.
```

---

## 4. Achievement Badges

### 5 Core Badges (OJK-friendly)

| Badge | Criteria | Check function |
|---|---|---|
| 🛡️ Dana Darurat Aman | `runway ≥ 6` | `calcRunway() >= 6` |
| ⚖️ Utang Terkontrol | `dsr < 30%` | `calcDsr() < 30` |
| 💰 Cashflow Positif | `surplus > 0` | `surplus() > 0` |
| 🌱 Diversifikasi Sehat | `≥ 4 asset categories, each ≥5% of total, total assets > Rp 1jt` | count qualifying categories in `calcAssetBreakdown()` |
| 📈 Tabungan Disiplin | `savingsRate ≥ 20%` | `calcSavingsRate() >= 20` |

### Unlock logic

```typescript
// lib/finance/badges.ts (NEW FILE)
interface Badge {
  id: string
  label: string
  icon: string
  description: string
  unlocked: boolean
  unlockedAt?: string // ISO timestamp — stored in localStorage
}

function calcBadges(snap: SnapshotState, prices?: PricesView): Badge[]
```

**Badge state is pure derived** from snapshot data + prices. No separate persistence needed — badges recalculate on every page load. If snapshot data changes, badges update instantly.

**localStorage persistence** for "first unlock timestamp" (required for celebration animation). Format:
```json
{ "cermat-badges": { "dana-darurat-aman": "2026-06-07T12:00:00Z" } }
```

**Celebration logic:** `unlocked === true && !localStorageTimestamp` → NEW unlock → trigger celebration animation (scale-up + glow) → save timestamp. Subsequent renders with timestamp present show unlocked but no animation. This makes localStorage persistence **required**, not optional.

### Visual

- Grid layout: `grid-cols-3 sm:grid-cols-5`
- Locked: grayscale + opacity 30%
- Unlocked: full color + subtle glow
- Hover: tooltip with criteria + how to unlock
- New unlock: brief scale-up animation

### Component

```typescript
// components/dashboard/AchievementGrid.vue (NEW)
// Positioned below CermatScoreHero in main content (not sidebar)
```

---

## 5. ECharts Tree-Shaking Strategy

### Current setup

```typescript
// components/dashboard/charts-register.ts
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components'
```

Already tree-shaken. Currently ~80kb gzip. We need to add:

### Additional modules for Phase 6.2

```typescript
// Add to charts-register.ts:
import { SankeyChart } from 'echarts/charts'        // ~15kb gzip
import { LineChart } from 'echarts/charts'           // ~8kb gzip (already small)
// No additional components needed — Sankey uses existing TooltipComponent
```

**No full ECharts import.** Only register what we use. Estimated bundle increase: ~25kb gzip for Sankey + Line.

### Color system consistency

All charts must share a **semantic** color system. Current app convention (from ExpenseBreakdownDonut + AssetAllocationDonut):

| Semantic | Color | Used by |
|---|---|---|
| Primary/Good | `--color-primary` (emerald) | Pokok expense slice, Kas asset slice, positive values |
| Warning/Moderate | `--color-warning-amber` | Lifestyle expense slice, amber badges |
| Danger/Negative | `--color-danger-rose` | Cicilan expense slice, negative values |
| Gold | `--color-gold` | Emas asset slice |
| Blue family | sky/indigo | Deposito, SBN asset slices |
| Teal | `#0d9488` | Reksa Dana slice |
| Violet | `#7c3aed` | Pengeluaran Lain, Crypto slices |

**Sankey palette** must align with existing convention:
- Income sources: emerald family (positive = green, matches existing "good" convention)
- Expense categories: **reuse exact same colors as ExpenseBreakdownDonut** (Pokok = emerald, Lifestyle = amber, Cicilan = rose, Lainnya = violet)
- Surplus/Tabungan: `--color-primary` (darker emerald to distinguish from Pokok)

**What-If Simulator:**
- Conservative: gray (`--color-text-muted`)
- Expected: `--color-primary` (emerald)
- Optimistic: `--color-gold` or amber

No new color definitions needed — extend existing convention.

---

## 6. Sankey Cash Flow Diagram

### Data structure

ECharts Sankey requires `nodes[]` and `links[]`:

```typescript
interface SankeyNode {
  name: string
  itemStyle?: { color: string }
}

interface SankeyLink {
  source: string
  target: string
  value: number
}

// Data mapping from snapshot:
function buildSankeyData(snap: SnapshotState, prices?: PricesView): {
  nodes: SankeyNode[]
  links: SankeyLink[]
}
```

### Node mapping

**Income nodes (left side):**
| Node | Source data |
|---|---|
| Gaji | `gajiBersihIdr()` |
| Freelance / Lainnya | `sumRowsToIdr(snap.penghasilanLain)` per label |
| Dividen | `calcPotentialDividendIdr() / 12` |
| Bunga Deposito | `calcBungaDepositoMonthly()` |
| Bunga SBN | `calcBungaSbnMonthly()` |

**Expense nodes (right side):**
| Node | Source data |
|---|---|
| Pokok | `snap.pengeluaran.pokok` |
| Lifestyle | `snap.pengeluaran.lifestyle` |
| Cicilan | `sumCicilanPerBulan()` |
| Pengeluaran Lain | `sumRowsToIdr(snap.pengeluaranLain)` per label |
| **Tabungan** | `surplus()` if positive — this is the "savings" flow |

**Middle aggregate node:**
| Node | Purpose |
|---|---|
| Total Pendapatan | Aggregates all income before splitting to expenses |
| Total Pengeluaran | Aggregates all expenses (excluding surplus) |

### Flow structure

```
Gaji ─────────┐
Freelance ────┤
Dividen ──────┼──→ Total Pendapatan ──→ Total Pengeluaran ──→ Pokok
Bunga Depo ───┤                                               ├──→ Lifestyle
Bunga SBN ────┘                                               ├──→ Cicilan
                                                              └──→ Lainnya
                                     ──→ Tabungan (surplus)
```

### Where to add

```typescript
// components/dashboard/CashFlowSankey.vue (NEW)
// Uses registerEcharts() from charts-register.ts
// Positioned in main content area as full-width section
```

### Edge cases

- **Deficit (surplus < 0):** No "Tabungan" node. Instead show "Defisit" node in red with negative flow warning.
- **Single income source:** Only show one income node, still flow through aggregate.
- **Zero income or zero expenses:** Show empty state with "Isi data dulu" message.

### Limit-N strategy (prevent visual crowding)

- **Income:** Top 5 sources by value. Remaining grouped as "Lainnya".
- **Expenses:** Top 6 categories by value. Remaining grouped as "Lainnya".
- ECharts Sankey auto-layout struggles with many nodes; this keeps it readable.
- **Mobile:** Sankey minimum supported viewport width: 640px (sm breakpoint). Below that, hide chart and show friendly message: *"Visual alur kas tersedia di layar lebih lebar. Buka di desktop untuk pengalaman lengkap."* Hiding preferred over showing a cramped, unreadable chart.

---

## 7. What-If Simulator

### State management

```typescript
// composables/useWhatIf.ts (NEW)
interface WhatIfState {
  monthlyInvestment: number   // slider: Rp 0 - Rp 10.000.000 (min 0 = explore "no investment" scenario)
  annualReturn: number        // slider: 0 - 20 (%)
  timeHorizon: number         // slider: 1 - 30 (years)
}

// Projection calculation (pure function):
function calcProjection(state: WhatIfState, currentNetWorth: number): {
  years: number[]       // [0, 1, 2, ..., timeHorizon]
  conservative: number[] // 50% of assumed return
  expected: number[]     // 100% of assumed return
  optimistic: number[]   // 150% of assumed return
}
```

### Projection formula

```
FV = PV × (1 + r)^t + PMT × [((1 + r)^t - 1) / r]
```
Where:
- PV = current net worth
- PMT = monthly investment × 12
- r = annual return rate
- t = years

Three lines: conservative (50% of r), expected (100%), optimistic (150%).

**Division-by-zero guard:** When `r === 0`, formula becomes `FV = PV + PMT × t` (linear growth, no compounding). This prevents NaN when user drags return slider to 0%.

**Return rate convention:** What-If uses **8% nominal** (not inflation-adjusted). This differs from the Goals page which uses **5% real** (inflation-adjusted). The inflation disclaimer below the chart explains this distinction. Both conventions are intentional — Goals projects real purchasing power, What-If projects nominal account balance.

### ECharts implementation

```typescript
// components/dashboard/WhatIfSimulator.vue (NEW)
// Line chart with 3 series: conservative, expected, optimistic
// Uses existing registerEcharts() + LineChart
// Sliders are native <input type="range"> with custom styling
// Reactive: sliders update chart in real-time
```

### Visual

- Full-width card with slider controls at top
- Line chart below showing 3 projection curves
- Current net worth shown as starting point
- Final year value displayed prominently: "Dalam 10 tahun: Rp 850 juta"
- Color: conservative = gray, expected = emerald, optimistic = amber

### Default values (auto-detect from user data)

- **Monthly investment:** 10% of current monthly income (auto-detect via `totalPenghasilanMonthly()`), min Rp 0, max Rp 10.000.000
- **Annual return:** 8% (realistic Indonesia stock market average)
- **Time horizon:** 10 years
- Rationale: judges open simulator → immediately see meaningful projection without configuring

### Inflation disclaimer

Tooltip/disclaimer below the chart:
> *"Nilai nominal, belum disesuaikan inflasi (~4%/tahun). Return asumsi bukan jaminan."*

Educational moment — financial advisors will appreciate the honesty. OJK-aligned (no over-promising returns).

---

## 8. Visual Polish

### Count-up animation

```typescript
// composables/useCountUp.ts (NEW)
function useCountUp(target: Ref<number>, duration = 1200): Ref<number>
```
- Uses `requestAnimationFrame`
- Easing: ease-out cubic
- Triggers when value changes or component mounts
- Applied to: Cermat Score number, Net Worth, Modal Siap, metric values in HeroPair

### Entrance animation

- Cards fade-in with `translateY(8px)` → `translateY(0)`, staggered 80ms apart
- Pure CSS: `@keyframes fadeSlideUp` + `animation-delay` per card
- Applied to: MetricGrid cards, AchievementGrid badges

### Hover microinteractions

- Metric cards: `scale(1.02)` + shadow lift on hover
- Badge cards: subtle brightness increase on hover
- Already partially exists; extend to new components

---

## 9. Scope: Wealth-Tracker Only

**Phase 6.2 = wealth-tracker mode only (`/app/snapshot`).** Budget-kos mode (`/app/budget-kos`) has its own gamification system (Pejuang/Sultan Kos/etc. personas, Rasio Kos/Penghasilan, "Cari Kos Sesuai Budgetmu") — running Cermat Score + pohon tier alongside it would create two competing gamification systems.

**Explicit decisions:**
- CermatScoreHero, AchievementGrid, Sankey, What-If → rendered only when `mode === 'wealthTracker'`
- Sankey has no `biayaKos` node (that's budget-kos specific data)
- Budget-kos mode keeps its existing Ringkasan layout unchanged

**Phase 3 persona reuse** (SHOULD-HAVE): mode-aware copy variation for Cermat Score description, badge labels. Not in MUST-HAVE scope.

---

## Implementation Order

| Day | Task | Files |
|---|---|---|
| 1-2 | Cermat Score + Level System + **unit tests** | `lib/finance/cermat-score.ts`, `cermat-score.test.ts`, `components/dashboard/CermatScoreHero.vue`, update `stores/derived.ts` |
| 3 | Achievement Badges + **unit tests** | `lib/finance/badges.ts`, `badges.test.ts`, `components/dashboard/AchievementGrid.vue` |
| 4-5 | Sankey Cash Flow | Update `charts-register.ts`, `components/dashboard/CashFlowSankey.vue` |
| **6** | **Mid-week checkpoint** | **Review progress. If on-track → gas What-If. If slow → cut What-If, ship Sankey + Score + Badges complete.** |
| 6-7 | What-If Simulator + **unit tests** | `composables/useWhatIf.ts`, `useWhatIf.test.ts`, `components/dashboard/WhatIfSimulator.vue` |
| 8 | Visual Polish | `composables/useCountUp.ts`, CSS animations, hover effects |
| 9-10 | Integration + Dashboard layout | Update dashboard main content layout, wire new components |
| 11 | **Manual QA + cross-browser** | Test empty state, sample data, dark mode, mobile, edge cases |
| 12 | **Final fix + demo rehearsal** | Bug fixes from QA, sample data finalization, dress rehearsal |

---

## Files to Create

| File | Purpose |
|---|---|
| `lib/finance/cermat-score.ts` | Score calculation + level classification |
| `lib/finance/badges.ts` | Badge definitions + unlock logic |
| `lib/finance/metric-labels.ts` | Centralized Indonesian display labels for score breakdown |
| `composables/useWhatIf.ts` | What-If Simulator state + projection math |
| `composables/useCountUp.ts` | Count-up animation utility |
| `components/dashboard/CermatScoreHero.vue` | Score ring + level display |
| `components/dashboard/AchievementGrid.vue` | Badge grid |
| `components/dashboard/CashFlowSankey.vue` | Sankey chart |
| `components/dashboard/WhatIfSimulator.vue` | Interactive projection |

## Files to Modify

| File | Change |
|---|---|
| `components/dashboard/charts-register.ts` | Add SankeyChart, LineChart imports |
| `stores/derived.ts` | Add cermatScore, badges computed properties |
| `components/dashboard/` (layout) | Integrate new components into main content area |

---

## Out of Scope

- D3 (cancelled — use ECharts)
- Chart.js (cancelled — use ECharts only)
- Multiple chart libraries
- WebLLM / AI commentary
- "Cermat's Take" sassy commentary
- Persistent server-side history
- Generalisasi gadai (non-emas)
- Multi-persona (5+ personas)
- Sunburst chart (Phase 7)

---

## Success Criteria

- [ ] Cermat Score renders with animated ring + level label
- [ ] Score formula uses existing health metrics (no new raw calculations)
- [ ] 5 badges show locked/unlocked state correctly based on snapshot data
- [ ] Sankey chart visualizes income → expense flow with real data
- [ ] What-If Simulator shows 3 projection lines updating in real-time
- [ ] Count-up animation on score + hero values
- [ ] All new ECharts modules tree-shaken (no full import)
- [ ] Bundle size: Sankey async chunk < 25kb gzip, total Phase 6.2 increase < 50kb gzip
- [ ] `npm run typecheck` clean (vue-tsc)
- [ ] All existing tests still pass
- [ ] New unit tests for score + badge logic

---

## Verification

1. `npm run dev` → check dashboard main content shows all new components
2. Toggle between empty snapshot and sample data → badges lock/unlock correctly
3. Drag What-If sliders → chart updates in real-time
4. Toggle dark/light mode → all charts render with correct colors
5. `npx vue-tsc --noEmit` → no type errors
6. `npm run test` → all tests pass including new ones
7. Check bundle size: Sankey async chunk < 25kb gzip, total Phase 6.2 increase < 50kb gzip

---

## Demo Storyboard (what judges experience in 60 seconds)

Judges access self-service — no narrator. Every visual must speak for itself.

1. **0-5s: Land on dashboard** → sample persona pre-loaded (Pegawai Muda + KPR)
2. **5-10s: Cermat Score 825** → animated count-up, "Hutan (Financial Master)" tier, progress ring fills
3. **10-15s: 3/5 badges unlocked** → immediate dopamine (Dana Darurat Aman ✓, Cashflow Positif ✓, Tabungan Disiplin ✓)
4. **15-25s: Sankey Cash Flow** → visual income → expense flow (wow moment)
5. **25-40s: What-If Simulator** → drag sliders, see projection update in real-time (interactive engagement)
6. **40-50s: Hover metric cards** → count-up animation + shadow lift microinteractions
7. **50-60s: Overall impression** → "This is a polished, intelligent financial app"

**Priority polish order:** Score ring > Sankey > Simulator > Badges > microinteractions. If time short, first 3 are the demo-critical path.

---

## SHOULD-HAVE (after MUST done)

- 4-6 additional badges (Investor Aktif, Aset Tetap, Pensiun Ready, Goal Achiever, etc.)
- ECharts Treemap for Alokasi Saham (replace paginated donut)
- ECharts Waterfall for Aset vs Utang
- Concentration risk indicator (single sector >50% warning)
- Phase 3 persona tone variation for Cermat Score copy
- Confetti milestone animation (canvas-confetti) on score increase >50, badge unlock, level up

## NICE-TO-HAVE (Phase 7)

- Sunburst Alokasi Aset
- "Investor Agresif" sample persona
- Spending heatmap
- Sparkline trend per metric
- Streak counter
