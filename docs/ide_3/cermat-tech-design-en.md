# Cermat — Tech Design

**Status:** Draft v1
**Last updated:** 2026-05-28
**Companion docs:** `personal-wealth-platform-prd-en.md`, `personal-wealth-platform-mvp-en.md`, `personal-wealth-platform-design-guidelines-en.md`, `cermat-design-decisions-en.md`
**Target ship:** 11-day MVP sprint

---

## 0. TL;DR

- **Framework:** Nuxt 3 (Vue 3, Composition API, TypeScript strict).
- **Why Nuxt over a plain SPA:** Nitro server routes give us the price proxy + edge caching in the same project (no separate backend repo), SSG for the landing page (fast paint, indexable), client-only SPA for `/app/*` (privacy pitch held).
- **State:** Pinia stores per mode, all metrics derived via `computed`. No persistence in MVP (matches MVP §5 cut of localStorage).
- **Compute:** Pure-TS `lib/finance/*` module — fully unit-testable, zero DOM. The dashboard is a thin render layer over these functions.
- **Prices:** Nitro `/api/prices/*` endpoints proxy IDX (Yahoo), Pegadaian gold, USD/IDR with 15-min cache. Proxy never receives user portfolio data — only ticker symbols.
- **Copy:** Centralized in `lib/copy/strings.ts`, scanned by a CI linter for OJK forbidden lemmas (`sebaiknya`, `disarankan`, `harus`, `rekomendasi`, etc.).
- **Export:** Client-side `xlsx` (SheetJS) — 7 visible sheets + hidden `_meta` (state JSON for Phase-2 round-trip), generated and downloaded without ever leaving the browser.
- **Deploy:** Vercel, Nitro Vercel preset, edge-cache the 3 price endpoints.

---

## 1. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Nuxt 3** (latest stable) | SSR for landing, client-only for `/app/*` via `definePageMeta({ ssr: false })` |
| Language | **TypeScript strict** | `strict: true`, `noUncheckedIndexedAccess: true` |
| UI runtime | **Vue 3 + Composition API** | `<script setup lang="ts">` everywhere |
| Styling | **Tailwind CSS v4** | `@theme` directive holds design tokens from `DESIGN.md` |
| Fonts | **@fontsource/plus-jakarta-sans** | Self-hosted, no Google Fonts CDN (privacy + perf) |
| Icons | **lucide-vue-next** | Tree-shakable, matches the lightweight aesthetic |
| State | **Pinia** | Setup-store style, no Vuex |
| Server | **Nitro** (built into Nuxt) | Just `/api/prices/*`; no other server logic |
| HTTP fetch | **`$fetch` / `useFetch`** | Native Nuxt; no axios |
| Charts | **`vue-echarts` (ECharts 5)** | Donut + stacked bar + threshold bar; flat caps configurable |
| Numeric format | **`Intl.NumberFormat('id-ID')`** | No external dep; tabular handled via CSS |
| xlsx | **`xlsx` (SheetJS Community)** | Client-side workbook generation |
| Validation | **`zod`** | Form inputs + server route inputs |
| Testing | **Vitest** + **@nuxt/test-utils** | Unit tests for `lib/finance/*` + copy lint; smoke E2E later |
| Lint/format | **ESLint flat config** + **Prettier** | Plus a custom rule for OJK copy guard |
| Deploy | **Vercel** | Nitro preset `vercel-edge` for `/api/*`, static for everything else |

**Explicitly NOT using:**
- Tailwind plugins for forms/typography — tokens are exact, presets would fight them
- A UI kit (shadcn-vue, PrimeVue, Naive) — the spec is too prescriptive about pixels; build primitives ourselves
- i18n framework — strings are Indonesian-first, English-only for terminology; one `lib/copy/strings.ts` is enough
- localStorage / IndexedDB in MVP — MVP §5 cuts autosave. Adding it later is one composable swap

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser (the only place user data ever lives)                  │
│                                                                 │
│  ┌─────────────┐   ┌──────────────┐   ┌────────────────────┐   │
│  │  Pages      │──▶│  Pinia       │──▶│  lib/finance/*     │   │
│  │  (Vue)      │   │  stores      │   │  (pure functions)  │   │
│  └─────────────┘   └──────────────┘   └────────────────────┘   │
│         │                  │                                    │
│         │                  ▼                                    │
│         │           ┌──────────────┐                            │
│         │           │  lib/copy    │                            │
│         │           │  (strings)   │                            │
│         │           └──────────────┘                            │
│         │                                                       │
│         │           ┌──────────────┐                            │
│         └──────────▶│  composables │                            │
│                     │  usePrices() │ ──────────┐                │
│                     │  useXlsx()   │           │                │
│                     └──────────────┘           │                │
└────────────────────────────────────────────────│────────────────┘
                                                 │
                              only ticker symbols ▼ (no user data)
                                ┌──────────────────────┐
                                │  Nitro /api/prices/* │
                                │  (Vercel Edge)       │
                                │  - 15-min cache      │
                                └──────────────────────┘
                                                 │
                                                 ▼
                            Yahoo Finance · Pegadaian · BI/Yahoo
```

**Privacy invariants (enforced, not just claimed):**
1. No user-portfolio payload ever sent to `/api/*` — proxy endpoints accept only ticker symbols / commodity keys.
2. No analytics or telemetry script on `/app/*` routes. Landing page may have **Plausible** (cookieless) later — opt for `/` only.
3. No service worker that caches user input.
4. Beforeunload warning if state is dirty (`dialog.refresh` copy).

---

## 3. Folder Structure

```
cermat/
├── nuxt.config.ts
├── tailwind.config.ts            # exports nothing; tokens live in CSS @theme
├── tsconfig.json
├── package.json
├── app.vue                       # <NuxtLayout><NuxtPage/></NuxtLayout>
├── error.vue                     # fallback error page
│
├── assets/
│   └── css/
│       └── main.css              # @import "tailwindcss"; @theme {...}; font-face
│
├── layouts/
│   ├── default.vue               # landing layout (header only, no tabs)
│   └── app.vue                   # app layout (TopNav + 45/55 split + sticky dashboard)
│
├── pages/
│   ├── index.vue                 # Landing (Screen 1)
│   └── app/
│       ├── index.vue             # redirect → /app/snapshot
│       ├── snapshot.vue          # left panel content for Snapshot tab (Screens 2, 3, 10, 11, 12)
│       ├── goals.vue             # Screen 4
│       └── simulator.vue         # Screen 5 — wizard launcher
│
├── components/
│   ├── common/
│   │   ├── ButtonPrimary.vue
│   │   ├── ButtonSecondary.vue
│   │   ├── ButtonGhost.vue
│   │   ├── InputCurrency.vue     # Rp prefix, lenient parser ("25jt", "25 juta")
│   │   ├── InputQuantity.vue     # gram / lot / qty
│   │   ├── PillLive.vue
│   │   ├── PillEstimasi.vue
│   │   ├── PillStale.vue
│   │   ├── StatusDot.vue
│   │   ├── ThresholdBar.vue
│   │   └── DisclaimerBanner.vue  # OJK pre-wizard banner
│   ├── layout/
│   │   ├── TopNav.vue
│   │   ├── TabBar.vue
│   │   ├── DashboardPanel.vue    # the sticky right panel, shared across all 3 tabs
│   │   └── FooterDisclaimer.vue
│   ├── snapshot/
│   │   ├── PenghasilanForm.vue
│   │   ├── AsetLikuidPanel.vue
│   │   ├── AsetNonLikuidPanel.vue
│   │   ├── PengeluaranForm.vue
│   │   ├── CicilanAktifPanel.vue # §8.14.1
│   │   ├── CicilanRow.vue        # 4 jenis_bunga variants
│   │   ├── GadaiPanel.vue        # §8.14.2
│   │   ├── SahamPanel.vue
│   │   └── PerEmitenCard.vue     # collapsed + expanded
│   ├── goals/
│   │   ├── GoalCard.vue          # standard variant
│   │   ├── FiGoalCard.vue        # FI variant with multiplier dropdown
│   │   └── GoalForm.vue          # add/edit goal
│   ├── dashboard/
│   │   ├── HeroPair.vue          # Net Worth + Modal Siap, §8.11
│   │   ├── MetricCard.vue        # generic, takes metric prop
│   │   ├── AllocationDonut.vue
│   │   ├── SafeHavenBar.vue
│   │   ├── GoalHealthChip.vue
│   │   ├── GoalSummaryCards.vue
│   │   └── ModalOptionsPanel.vue # §8.20
│   └── simulator/
│       ├── WizardLauncher.vue
│       ├── WizardHost.vue        # global modal host bound to useSimulator()
│       ├── WizardDeltaTable.vue  # 4-col reusable (Metrik|Sebelum|Sesudah|Δ)
│       ├── decisions/
│       │   ├── WizardMauKpr.vue
│       │   ├── WizardMauGadai.vue
│       │   ├── WizardMauCicil.vue
│       │   └── WizardCustom.vue
│       └── capacity/
│           ├── WizardMaxUtang.vue
│           ├── WizardLunasiUtang.vue
│           └── WizardModalOptions.vue
│
├── composables/
│   ├── usePrices.ts              # client-side fetch + 15-min memo of /api/prices/*
│   ├── useXlsx.ts                # client-side workbook builder
│   ├── useSimulator.ts           # open/close wizard, current scenario state
│   └── useDirtyGuard.ts          # beforeunload listener
│
├── stores/                       # Pinia (auto-imported by @pinia/nuxt)
│   ├── snapshot.ts               # cash, gold, stocks, debts, income, expenses
│   ├── goals.ts                  # goal list + FI multiplier
│   └── derived.ts                # computed metrics — single source of "what dashboard shows"
│
├── lib/
│   ├── finance/
│   │   ├── metrics.ts            # DSR, DAR, Runway, SavingsRate, NetWorth, ModalSiap,
│   │   │                         #   AllocationDiscipline, SafeHaven, GoalHealth
│   │   ├── amortization.ts       # anuitas, flat, floating, revolving (min-payment model)
│   │   ├── goals.ts              # FI formula, goal projection, contribution-needed
│   │   ├── thresholds.ts         # zone(value, metric) → 'sehat'|'waspada'|'bahaya'
│   │   └── wizards/
│   │       ├── mau-kpr.ts
│   │       ├── mau-gadai.ts
│   │       ├── mau-cicil.ts
│   │       ├── custom.ts
│   │       ├── max-utang.ts
│   │       ├── lunasi-utang.ts
│   │       └── modal-options.ts  # generator → returns Option[]
│   ├── copy/
│   │   ├── strings.ts            # microcopy registry (keys from design §10)
│   │   └── ojk-lint.ts           # forbidden-word scanner (also run as Vitest)
│   ├── format/
│   │   ├── idr.ts                # "Rp 25.000.000" with id-ID locale
│   │   ├── percent.ts
│   │   ├── duration.ts           # "4 bulan", "2 tahun 3 bulan"
│   │   └── parse-currency.ts     # lenient parse: "25jt", "25 juta", "25.000.000"
│   └── types/
│       ├── snapshot.ts           # Asset, Debt, Stock, Gadai interfaces
│       ├── goals.ts
│       └── wizard.ts             # Scenario, Delta, Option types
│
├── server/
│   └── api/
│       └── prices/
│           ├── idx.get.ts        # ?tickers=BBCA,BBRI → Yahoo v7 spark (batch); v8 chart fallback
│           ├── gold.get.ts       # Pegadaian /gold/prices/savings (hargaJual = valuation)
│           └── usdidr.get.ts     # Yahoo or BI
│
├── public/
│   ├── favicon.svg
│   └── robots.txt                # disallow /app/*
│
└── tests/
    ├── finance/
    │   ├── metrics.test.ts
    │   ├── amortization.test.ts
    │   ├── goals.test.ts
    │   └── wizards.test.ts
    ├── copy/
    │   └── ojk-lint.test.ts
    └── format/
        └── parse-currency.test.ts
```

---

## 4. Routing & Layout

Two layouts:

**`layouts/default.vue`** — used by `pages/index.vue` only. Just header + landing content + footer.

**`layouts/app.vue`** — used by `pages/app/*`. Provides:
- `<TopNav>` (full width, sticky, 64px)
- `<TabBar>` at top of left panel
- 45/55 grid below: `<slot/>` (the page) on left, `<DashboardPanel>` on right (sticky)
- `<FooterDisclaimer>` at the bottom of the page (outside the grid)
- `<WizardHost>` mounted at layout level so any tab can open wizards

```vue
<!-- layouts/app.vue (sketch) -->
<template>
  <div class="min-h-screen bg-[var(--color-surface)]">
    <TopNav />
    <div class="mx-auto max-w-[1440px] px-10">
      <div class="grid grid-cols-[45fr_55fr] gap-8">
        <div>
          <TabBar />
          <slot />
        </div>
        <aside class="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
          <DashboardPanel />
        </aside>
      </div>
    </div>
    <FooterDisclaimer />
    <WizardHost />
  </div>
</template>
```

**Why nested routes (`/app/snapshot`, `/app/goals`, `/app/simulator`) and not state-driven tabs:**
- Deep-linkable: a user pasting `/app/simulator` opens the wizard launcher directly.
- Browser back works naturally between tabs.
- Lazy bundle per tab (Nuxt auto-splits).
- Shared dashboard is preserved via the layout `<aside>` — `<DashboardPanel>` re-renders zero times when switching tabs.

`/app/index.vue` just does `definePageMeta({ middleware: () => navigateTo('/app/snapshot') })`.

---

## 5. State Management — Pinia stores

Three stores. Anything dashboard-renderable is **derived**, never stored.

### 5.1 `stores/snapshot.ts`

```ts
export const useSnapshotStore = defineStore('snapshot', () => {
  const penghasilan = ref<number>(0)
  // Cicilan is NOT stored here — it comes from cicilanAktif (Σ cicilan_per_bulan), avoiding double-count.
  const pengeluaran = reactive<{ pokok: number; lifestyle: number }>({ pokok: 0, lifestyle: 0 })

  const asetLikuid = reactive<{
    kas: AssetRow[]      // Tabungan, Cash
    deposito: AssetRow[]
    reksaDana: AssetRow[]
    sbn: AssetRow[]
    cryptoManual: AssetRow[]
  }>({ kas: [], deposito: [], reksaDana: [], sbn: [], cryptoManual: [] })

  const saham = ref<StockHolding[]>([])         // per-emiten
  const emas = reactive({ cadanganGram: 0, tertahanGram: 0 })
  const asetNonLikuid = reactive<{ properti: AssetRow[], kendaraan: AssetRow[], pensiun: AssetRow[] }>(...)
  const cicilanAktif = ref<CicilanRow[]>([])    // §8.14.1
  const gadai = ref<GadaiRow | null>(null)       // §8.14.2

  // Mutations exposed as methods; no direct writes from components.
  return { penghasilan, pengeluaran, asetLikuid, saham, emas,
           asetNonLikuid, cicilanAktif, gadai,
           addCicilan, updateCicilan, removeCicilan, /* ... */ }
})
```

### 5.2 `stores/goals.ts`

```ts
export const useGoalsStore = defineStore('goals', () => {
  const goals = ref<Goal[]>([])               // each Goal may carry monthlyAllocationIdr? (override; default = surplus ÷ N)
  const fiMultiplier = ref<240 | 300 | 360 | number>(300)
  const assumedAnnualReturnReal = ref<number>(0.05)  // global, REAL (inflation-baked); results carry ESTIMASI pill
  // …add/edit/remove + getter for FI auto-target + projection via lib/finance/goals (§6.4)
})
```

### 5.3 `stores/derived.ts` — the single source of dashboard truth

This store does NO writes. It exposes `computed` getters that wrap pure functions from `lib/finance/*`. Every dashboard component reads from here, never from `snapshot`/`goals` directly.

```ts
export const useDerived = defineStore('derived', () => {
  const snap = useSnapshotStore()
  const goalsStore = useGoalsStore()
  const prices = usePrices()  // composable returning reactive prices

  const netWorth = computed(() => calcNetWorth(snap.$state, prices.value))
  const modalSiap = computed(() => calcModalSiap(snap.$state))
  const dsr = computed(() => calcDsr(snap.$state))
  const dar = computed(() => calcDar(snap.$state, netWorth.value))
  const runway = computed(() => calcRunway(snap.$state))
  const savingsRate = computed(() => calcSavingsRate(snap.$state))
  const safeHaven = computed(() => calcSafeHaven(snap.$state, netWorth.value))
  const allocationDiscipline = computed(() => calcAllocationDiscipline(snap.saham))
  const goalHealth = computed(() => calcGoalHealth(goalsStore.goals, snap.$state))

  const all9 = computed(() => ({ netWorth, modalSiap, dsr, dar, runway, savingsRate,
                                 safeHaven, allocationDiscipline, goalHealth }))
  return { ...all9, all9 }
})
```

**Why this split:** wizard scenarios run `calcDsr(modifiedState, …)` against a *cloned* snapshot — pure functions make "Sebelum vs Sesudah" computation trivial. The store is just a view.

---

## 6. Computation Engine — `lib/finance/`

All metric formulas live as pure TypeScript functions. They take a snapshot-shaped object + optional prices map and return a number or a structured result. No reactivity, no DOM, no I/O.

### 6.1 9-metric formulas (canonical, from PRD §5.4)

| Metric | Function | Returns | Empty-state |
|---|---|---|---|
| Net Worth | `calcNetWorth(snap, prices)` | IDR (number, can be negative) | 0 if no input |
| Modal Siap Distribusi | `calcModalSiap(snap)` | IDR (cash + deposito + RD + liquid crypto, optionally minus emergency buffer per open Q4) | 0 |
| DSR | `calcDsr(snap)` | percent (0–∞) | `null` if pengeluaran/penghasilan missing → render "—" |
| DAR | `calcDar(snap, netWorth)` | percent | `null` if total aset = 0 |
| Runway | `calcRunway(snap)` | months | `null` if pengeluaran missing |

> **Total Pengeluaran (single definition, used by Runway + Savings Rate)** = `pengeluaran.pokok + pengeluaran.lifestyle + Σ cicilanAktif[].cicilan_per_bulan`. Cicilan is summed from the debt module, never re-entered under pengeluaran (PRD §5.1.3). DSR uses only the `Σ cicilan` component (`÷ penghasilan`), not Total Pengeluaran.
| Savings Rate | `calcSavingsRate(snap)` | percent | `null` if penghasilan missing |
| Safe Haven % | `calcSafeHaven(snap, netWorth)` | percent | `null` if no aset |
| Allocation Discipline | `calcAllocationDiscipline(stocks)` | **avg pp drift** = `(1/n)·Σ \|bobot_live − bobot_target\|` (matches PRD §5.4 #7; lower = tighter). Zones: <5 Tight / 5–15 Drift / >15 Off-Plan | `null` if no stocks |
| Goal Health | `calcGoalHealth(goals, snap)` | percent on-track | `null` if no goals |

Thresholds live in `lib/finance/thresholds.ts`:

```ts
export const thresholds = {
  dsr:    { sehat: { max: 30 }, waspada: { min: 30, max: 40 }, bahaya: { min: 40 } },
  rasioTertahan: { sehat: { max: 50 }, waspada: { min: 50, max: 70 }, bahaya: { min: 70 } },
  // …
} as const

export function zoneOf(metric: keyof typeof thresholds, value: number): 'sehat' | 'waspada' | 'bahaya' {…}
```

### 6.2 Amortization — `lib/finance/amortization.ts`

```ts
// Returns monthly payment + amortization schedule
export function anuitas(pokok: number, bungaPerTahun: number, tenorBulan: number): Amortization
export function flat(pokok: number, bungaPerTahun: number, tenorBulan: number): Amortization
export function floating(pokok: number, /* current */ bungaPerTahun: number, tenorBulan: number): Amortization
export function revolving(sisaPokok: number, bungaPerBulan: number, minPaymentRate: number): RevolvingProjection
```

`Amortization` includes: `cicilanPerBulan`, `totalBunga`, `totalBayar`, `schedule[]` (month → pokok/bunga/sisa).

### 6.3 Wizard engines — `lib/finance/wizards/*.ts`

Each wizard exports a single function `run(inputs, currentSnapshot, currentGoals): WizardResult`.

`WizardResult` shape:
```ts
type WizardResult = {
  scenarioSnapshot: SnapshotState     // cloned + mutated
  scenarioGoals: Goal[]
  delta: Array<{
    metricKey: string                  // 'dsr' | 'runway' | 'goal:fi' | …
    label: string                      // 'DSR' | 'Goal: FI 2035'
    before: { display: string; value: number | null; zone?: Zone }
    after:  { display: string; value: number | null; zone?: Zone }
    deltaDisplay: string               // '▲ +16 pp' | '▼ −4' | '●'
    direction: 'better' | 'worse' | 'neutral'
  }>
  warnings?: string[]                  // from copy registry
}
```

`<WizardDeltaTable :delta="result.delta" />` is the shared renderer of the 4-col table — every wizard uses it.

### 6.4 Goal projection — `lib/finance/goals.ts`

Single projection model, pure functions (PRD §5.8.2). Powers goal cards **and** wizard goal-deltas.

```ts
export function fiNumber(monthlyExpense: number, multiplier = 300): number  // PRD §5.8.1

// surplus = penghasilan − totalPengeluaran (totalPengeluaran incl. Σ cicilan, §6.1)
export function surplus(snap: SnapshotState): number

// default per-goal contribution when user hasn't overridden: surplus ÷ active-goal count
export function defaultAllocation(snap: SnapshotState, activeGoalCount: number): number

// future-value projection → completion; date=null means unreachable at current inflow
export function projectCompletion(args: {
  current: number; monthlyInflow: number; target: number; annualReturnReal?: number
}): { months: number; date: string | null }

export function goalStatus(projectedDate: string | null, targetDate: string): 'on' | 'at-risk' | 'off'
```

- `annualReturnReal` default `0.05` (REAL, inflation-baked). Global (`useGoalsStore().assumedAnnualReturnReal`), user-editable; every projected figure carries the ESTIMASI pill.
- `monthlyInflow` = `goal.monthlyAllocationIdr ?? defaultAllocation(snap, activeGoalCount)`.
- `date: null` when `monthlyInflow ≤ 0` or growth can't reach target → card shows *"Belum tercapai dengan alokasi sekarang"* (descriptive).
- **Wizard delta:** re-run `projectCompletion` against the cloned/mutated snapshot (lower surplus + lower bucket) → year-shift = *"FI mundur ~N tahun"*. Same pure fn, no special-casing.

---

## 7. Price Proxy — Nitro server routes

### 7.1 `/api/prices/idx`

**Source confirmed (tested 2026-05-28):** Yahoo's old `/v7/finance/quote` endpoint is **dead** — returns `401 Unauthorized: "User is unable to access this feature"` without a crumb+cookie handshake. Two endpoints still work with **no auth, no key, free**, currency IDR:

- **Batch (primary):** `GET /v7/finance/spark?symbols=BBCA.JK,BBRI.JK,…` — many tickers in one call. Used for the whole per-emiten portfolio so a 25-stock snapshot is **one** request, not 25.
- **Single / failover:** `GET /v8/finance/chart/{TICKER}.JK` → `result[0].meta.regularMarketPrice` (+ `chartPreviousClose` for day-change).
- Hosts `query1` **and** `query2` both respond — default to query1, fail over to query2.

```ts
// server/api/prices/idx.get.ts  — batch contract: ?tickers=BBCA,BBRI,BMRI
export default defineCachedEventHandler(async (event) => {
  const tickers = String(getQuery(event).tickers ?? '')
    .split(',').map(t => t.trim().toUpperCase()).filter(Boolean)
  if (tickers.length === 0 || !tickers.every(t => /^[A-Z]{4}$/.test(t)))
    throw createError({ statusCode: 400, statusMessage: 'invalid ticker(s)' })

  const symbols = tickers.map(t => `${t}.JK`).join(',')
  const url = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${symbols}&interval=1d&range=1d`
  const res = await $fetch<YahooSpark>(url, { headers: { 'user-agent': 'Mozilla/5.0' } })

  const byTicker = new Map(res.spark.result.map(r => [r.symbol.replace('.JK', ''), r.response[0]?.meta]))
  return {
    prices: tickers.map(t => {
      const m = byTicker.get(t)
      return { ticker: t, price: m?.regularMarketPrice ?? null, prevClose: m?.chartPreviousClose ?? null,
               currency: 'IDR', stale: !m, fetchedAt: new Date().toISOString() }
    }),
    missing: tickers.filter(t => !byTicker.get(t))
  }
}, { maxAge: 60 * 15 /* 15 min */, swr: true })
```

**Validation note:** IDX equity codes are exactly 4 uppercase letters (BBCA, TLKM, ANTM) — no digits — so `^[A-Z]{4}$` per ticker is correct, applied to each entry in the comma-separated list.

**Edge-cached at Vercel** (Nitro `vercel-edge` preset) — single global cache across users, keyed on the sorted ticker list; no per-user state.

### 7.2 `/api/prices/gold`

**Confirmed source:** Pegadaian Tabungan Emas public JSON endpoint — `GET https://pegadaian.co.id/gold/prices/savings`. No params, no cookies, no auth (plain GET works). Privacy-clean: the proxy sends *nothing* user-specific upstream.

Response:
```json
{
  "responseCode": "2000000100",
  "data": {
    "hargaBeli": "26540",   // price user pays to BUY 1 g
    "hargaJual": "25340",   // buyback — price user RECEIVES selling 1 g
    "tglBerlaku": "2026-05-28",
    "isHargaBeliUp": true,
    "isHargaJualUp": true
  }
}
```

```ts
// server/api/prices/gold.get.ts
export default defineCachedEventHandler(async () => {
  const res = await $fetch<PegadaianGold>('https://pegadaian.co.id/gold/prices/savings')
  return {
    hargaJual: Number(res.data.hargaJual),  // valuation price (buyback)
    hargaBeli: Number(res.data.hargaBeli),
    tglBerlaku: res.data.tglBerlaku,
    stale: false,
    fetchedAt: new Date().toISOString()
  }
}, { maxAge: 60 * 60 /* 60 min */, swr: true })
```

**Valuation rule:** gold holdings in Net Worth are valued at `hargaJual` (buyback) — that's the realizable amount if the user sold today, so it's the honest, conservative figure. `hargaBeli` is surfaced only where the user is *acquiring* gold (e.g. a future "mau nabung emas" wizard).

Cache 60 min — Pegadaian moves the price at most once a day (`tglBerlaku`), so minute-level freshness is pointless for retail.

### 7.3 `/api/prices/usdidr`

**Confirmed (tested 2026-05-28):** same Yahoo v8 chart endpoint as IDX — `GET /v8/finance/chart/USDIDR=X` → `result[0].meta.regularMarketPrice` (≈17.784), currency IDR. Free, no auth.

```ts
// server/api/prices/usdidr.get.ts
export default defineCachedEventHandler(async () => {
  const res = await $fetch<YahooChart>(
    'https://query1.finance.yahoo.com/v8/finance/chart/USDIDR=X?interval=1d&range=1d',
    { headers: { 'user-agent': 'Mozilla/5.0' } })
  const m = res.chart.result[0]?.meta
  return { rate: m?.regularMarketPrice ?? null, currency: 'IDR', stale: !m, fetchedAt: new Date().toISOString() }
}, { maxAge: 60 * 15 /* 15 min */, swr: true })
```

> Supersedes PRD §8's `exchangerate.host` plan — that now requires an API key; Yahoo v8 keeps all three price sources on one provider/pattern (query1→query2 failover).

### 7.4 Response contract & failure behavior

**Common envelope:** every `/api/prices/*` response carries `{ stale: boolean, fetchedAt: string }`. There is **no single `value` field** — the payload is endpoint-specific (gold has two prices; idx is a list):

| Endpoint | Payload |
|---|---|
| `idx` | `{ prices: [{ ticker, price, prevClose, currency, stale, fetchedAt }], missing: [] }` |
| `gold` | `{ hargaJual, hargaBeli, tglBerlaku, stale, fetchedAt }` |
| `usdidr` | `{ rate, currency, stale, fetchedAt }` |

On upstream failure the handler returns the **last cached payload with `stale: true`** (value/rate/price = `null` if nothing cached) instead of throwing. Client maps:
- `stale: true` + value present → show old number with STALE pill (Screen 11)
- `stale: true` + `null` → STALE pill + manual override field
- Hard 5xx → empty state + "Coba lagi" button

---

## 8. Design Tokens → Tailwind v4

`assets/css/main.css`:

```css
@import "tailwindcss";

@theme {
  --color-primary: #1B4332;
  --color-primary-dark: #012D1D;
  --color-primary-container: #274E3D;
  --color-accent-emerald: #2D6A4F;
  --color-accent-emerald-soft: #86AF99;
  --color-warning-amber: #D97706;
  --color-danger-rose: #BE123C;
  --color-gold: #C9A961;
  --color-gold-muted: #9C8554;
  --color-capacity-teal: #0891B2;
  --color-surface: #F8F9F5;
  --color-surface-card: #FFFFFF;
  --color-surface-low: #F3F4F1;
  --color-border: #E5E7EB;
  --color-border-strong: #C1C8C2;
  --color-text-primary: #1F2937;
  --color-text-secondary: #6B7280;
  --color-text-muted: #9CA3AF;

  --font-sans: "Plus Jakarta Sans", system-ui, sans-serif;

  --radius-input: 4px;
  --radius-card: 8px;
  --radius-pill: 9999px;

  --shadow-hero: 0 4px 12px rgba(0,0,0,0.03);
  --shadow-modal: 0 20px 40px rgba(0,0,0,0.08);
}

@layer base {
  body { font-family: var(--font-sans); }
  .tabular { font-variant-numeric: tabular-nums; }
}
```

Component code uses utility classes (`bg-primary`, `text-danger-rose`, `rounded-[var(--radius-card)]`). Tabular figures are a single `.tabular` class applied to every number.

---

## 9. xlsx Export

`composables/useXlsx.ts` wraps SheetJS. Sheets per MVP Day 10:

| Sheet | Source |
|---|---|
| Ringkasan | `useDerived().all9` + sums |
| Snapshot | `useSnapshotStore` (every section flattened) |
| Per-Emiten | `useSnapshotStore().saham` |
| Cicilan-Aktif | `useSnapshotStore().cicilanAktif` |
| Goals | `useGoalsStore().goals` |
| Skenario | last computed `WizardResult` (if any) |
| Kapasitas | last computed Capacity wizard result (if any) |
| `_meta` (hidden) | schema version + JSON-stringified state (snapshot + goals + scenarios) — per PRD §7; enables Phase-2 xlsx round-trip import. Cheap to keep now even though import is out of MVP scope. |

Download triggered from `<TopNav>` button. Disabled until at least one asset exists (tooltip per spec §8.1).

---

## 10. OJK Copy Guard

### 10.1 Centralized strings

`lib/copy/strings.ts`:

```ts
export const copy = {
  'cta.entry.snapshot': 'Mulai dari Snapshot',
  'tagline.hero': 'Aman gak kalau gw {x}? Berapa max utang yang aman? …',
  'dsr.waspada': 'DSR kamu di zona Waspada (30–40%). Tambahan cicilan bisa bikin keuangan ketat.',
  'modal.options.header': 'Opsi yang Bisa Dihitungkan',
  // …~60 entries from design §10
} as const

export type CopyKey = keyof typeof copy
export const t = (key: CopyKey, vars?: Record<string, string|number>) => /* interpolate */
```

Templates use `t('dsr.waspada')` — never inline Indonesian strings.

### 10.2 Lint rule

`lib/copy/ojk-lint.ts`:

```ts
const forbidden = [
  /\bsebaiknya\b/i, /\bdisarankan\b/i, /\bharus(nya)?\b/i, /\bwajib\b/i,
  /\brekomendasi\b/i, /\bsaran\b/i, /\bpilihan terbaik\b/i,
  /terdaftar.*OJK/i, /diawasi.*OJK/i, /berizin.*OJK/i
]

export function lintCopy(strings: Record<string, string>): LintViolation[] {…}
```

Runs as a Vitest test (`tests/copy/ojk-lint.test.ts`) on every commit. Also scans component templates for inline Indonesian strings as a soft warning.

### 10.3 Pre-wizard banner enforcement

`<DisclaimerBanner>` is a required slot in `<WizardHost>` — wizards cannot render without it. Type-enforced.

---

## 11. Empty / Edge States

| State | Trigger | Render |
|---|---|---|
| All-empty | No fields filled | All metric cards show "—", greyed status dot. Download disabled. Modal Options panel hidden. |
| Partial | Penghasilan filled, Pengeluaran empty | DSR/Savings/Runway show "—"; others compute normally. |
| Stale price | `/api/prices/*` returns `stale: true` | STALE pill on affected card + manual override field. |
| Negative Net Worth | `netWorth < 0` | Number rendered in `danger-rose`. Status framing line (Screen 12) — NEVER prescriptive. |
| Mobile (<768px) | viewport | Stack columns; persistent "Lebih nyaman di desktop" hint. Polish on Day 11. |

---

## 12. Testing Strategy

| Layer | Tool | Coverage target |
|---|---|---|
| `lib/finance/*` | Vitest, pure-fn tests with fixture snapshots | 100% branches on metric formulas + amortization edge cases (revolving, floating, fully-prepaid) |
| `lib/copy/*` | Vitest, scans `copy` registry | 0 forbidden lemma matches |
| `lib/format/parse-currency` | Vitest table-driven | All input variants (`25jt`, `25 juta`, `25.000.000`, `25,000,000`, `25 ribu`) |
| Wizard engines | Vitest with golden-output fixtures | Sebelum/Sesudah deltas match expected for 1–2 canonical scenarios per wizard |
| Server `/api/prices/*` | Nitro test handler + mocked `$fetch` | Cache miss/hit, stale fallback, bad ticker rejection |
| E2E smoke (Day 11) | Playwright | Landing → Snapshot fill → KPR wizard → xlsx download |

CI runs on every push (Vercel preview + GitHub Actions for tests).

---

## 13. Deployment

- **Vercel** project linked to `main`. Preview deploys per PR.
- Nitro preset `vercel-edge` in `nuxt.config.ts` for `/api/*`; static for everything else.
- Env vars: none for MVP (no API keys — Yahoo public endpoint).
- Custom domain: defer to post-launch.
- `robots.txt` allows `/`, disallows `/app/*` (no need to index user-app routes).

---

## 14. Performance Budget

| Target | Budget |
|---|---|
| Landing LCP (4G) | < 2.0s |
| `/app/snapshot` TTI (4G, empty state) | < 3.5s |
| Lighthouse Performance | ≥ 85 (MVP Day 11 acceptance) |
| Initial JS (landing) | < 80 KB gzip |
| Initial JS (`/app/*`) | < 250 KB gzip (defer wizard bundles via async components) |

Defer-load per route:
- Wizard modal Vue components — `defineAsyncComponent`
- ECharts — async, only on first dashboard mount
- SheetJS — async, only on first export click

---

## 15. Open items (carried from `cermat-design-decisions-en.md` §6)

These must be answered before code that depends on them:

| # | Question | Blocks |
|---|---|---|
| 1 | Brand name lock — "Cermat" or alt? | Day 1 (wordmark in TopNav) |
| 2 | FI multiplier — fixed 300, or 240/300/360 dropdown? | Day 5 (Goals FI auto-formula) |
| 3 | Modal Siap formula — subtract 3–6 mo emergency buffer? | Day 3 (Modal Siap metric card) |
| 4 | Mobile breakpoint — bottom-nav vs hamburger? | Day 11 (mobile polish) |
| 5 | 9-metric "—" rules — explicit per-metric, or shared rule? | Day 3 (empty/partial states) |
| 6 | ~~IDX source — Yahoo confirmed?~~ **RESOLVED 2026-05-28** — Yahoo `/v7/quote` is dead; use `/v7/spark` (batch) + `/v8/chart` (single), free/no-auth, tested live. Goapi only if Yahoo blocks Vercel egress IPs. | ~~Day 2~~ done |
| 7 | Per-emiten depth — lots+target+bobot+dividen only, or ladders? | Day 4 (Saham subsection) — MVP says no ladders, confirm |
| 8 | Plausible analytics on `/` landing — yes/no? | Day 1 (landing wiring) |

I recommend resolving #1, #2, #3, #5, #6, #8 at the start of Day 1 (a 30-min decisions block before scaffolding).

---

## 16. What this design intentionally avoids

- **A backend for user data.** Privacy promise is the differentiator; adding a backend breaks the pitch.
- **localStorage in MVP.** MVP §5 cuts it; we ship without it. Refresh = data loss + warned via `beforeunload`. Opt-in autosave is a post-MVP composable.
- **A UI kit.** Spec is too prescriptive — primitives are cheaper than fighting a library's defaults.
- **i18n framework.** One Indonesian locale; English terms inline.
- **Service workers / PWA.** Out of scope per design §13.
- **Auth.** Out of scope; absence is the trust signal (§8.1).

---

**Next step:** break this design into an 11-day task plan with concrete deliverables per day (will write to `cermat-11-day-plan-en.md`).
