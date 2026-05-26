# Personal Wealth Platform v2 — Technical Architecture

**Status:** Draft for engineering kickoff
**Last updated:** 2026-05-25
**Companion docs:** `../personal-wealth-platform-prd.md`, `../personal-wealth-platform-design-guidelines.md`
**Audience:** Engineer building the MVP (could be one full-stack dev)

---

## 1. TL;DR

**Stack:** Next.js 15 (App Router) + TypeScript + Tailwind CSS. **No backend services beyond Next.js Route Handlers.** No database. No auth. Deploy to Vercel.

**Why one framework:**
- 95% of the app runs in the browser (xlsx parse/generate, all financial calc, all UI)
- Server-side work is **3 read-only price-proxy endpoints** — perfect fit for Route Handlers
- No user data ever touches the server, so we don't need to design data-at-rest security
- One codebase, one deploy, one mental model. Ship MVP in ~10 weeks, not 20.

**When to revisit:** after ≥1000 weekly active users, if price proxy becomes hot or we add scheduled jobs.

---

## 2. Stack Decision

### 2.1 The pick

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | React + API routes + edge runtime + Vercel deploy |
| Language | **TypeScript (strict)** | Type-safety from form input → xlsx schema → metric formulas |
| Styling | **Tailwind CSS** | Matches design tokens 1:1 (colors, spacing, type scale) |
| State | **Zustand** | Lighter than Redux, simpler than Context; survives drilling |
| Form | **React Hook Form + Zod** | Validation + xlsx schema reuse |
| xlsx I/O | **SheetJS (`xlsx`)** | Browser-native; reads + writes; battle-tested |
| Charts | **Recharts** | Lightweight, declarative; fits our minimalist style |
| HTTP (server-side) | **Native `fetch` + `undici`** | No need for axios on the server |
| HTML scraping | **`cheerio`** | For Pegadaian gold-price extraction |
| Testing | **Vitest + Testing Library** | Fast, ESM-native; jsdom for component tests |
| Deploy | **Vercel** (or Cloudflare Pages) | Free tier sufficient for MVP; zero ops |

### 2.2 Why NOT a separate Go backend

The existing repo (`riset-api`, Go) does not need to be involved in this product. Reasoning:

| Argument for Go | Reality for this MVP |
|---|---|
| "Better at concurrent scraping" | We have 3 endpoints with 15-min cache. Concurrent load is trivial. |
| "More efficient at scale" | At <10K users/month, the cost difference is rounding error |
| "Type safety end-to-end" | TypeScript + Zod gets us 95% there |
| "Already have the repo" | Sunk cost — don't let it dictate architecture |

**Recommended path:** start a new Next.js repo. Park `riset-api` for unrelated work. If price proxy ever needs to scale beyond Vercel function limits, extract just that piece to Go later — by then we'll know exactly what we need.

### 2.3 Why NOT alternatives we considered

| Alternative | Reason rejected |
|---|---|
| **Remix** | Comparable to Next.js but smaller ecosystem; Vercel/Next.js synergy wins |
| **SvelteKit** | Smaller talent pool in Indonesia; xlsx libraries lean React-heavy |
| **Astro + React islands** | Too much SSG bias for a highly interactive app |
| **Pure CRA / Vite + Express** | More setup, more decisions, no Edge runtime benefits |
| **Tauri / Electron desktop** | Defeats the "open URL, use it" wedge |
| **PWA with full offline** | v3 feature, not MVP — adds complexity to schema migration |

---

## 3. Project Structure

```
zenith-wealth/
├── app/
│   ├── (marketing)/
│   │   └── page.tsx                 # Landing: Mulai Baru / Import
│   ├── (app)/
│   │   ├── layout.tsx               # Sticky header + footer shell
│   │   ├── page.tsx                 # Main app (4 tabs + dashboard)
│   │   └── import/page.tsx          # Import flow (multi-step)
│   ├── api/
│   │   └── prices/
│   │       ├── idx/route.ts         # GET ?tickers=BBCA,BBRI
│   │       ├── gold/route.ts        # GET (Pegadaian)
│   │       └── forex/route.ts       # GET ?pair=USDIDR
│   ├── layout.tsx                   # Root layout (Plus Jakarta Sans, providers)
│   └── globals.css                  # Tailwind base + tabular-nums + design tokens
│
├── components/
│   ├── ui/                          # Primitives (Button, Input, Card, Pill)
│   ├── asset/                       # AssetRow, StockCard (per-emiten), GadaiPanel
│   ├── dashboard/                   # MetricCard, HeroMetric, AllocationDonut,
│   │                                # SafeHavenBar, DriftBars
│   ├── import/                      # DropZone, HydrationProgress, MigrationDiff
│   └── layout/                      # Header, Footer, TabBar
│
├── lib/
│   ├── calc/
│   │   ├── metrics.ts               # Pure functions: netWorth, dsr, dar, der,
│   │   │                            # runway, savingsRate, modalSiapDistribusi,
│   │   │                            # safeHavenRatio, allocationDrift
│   │   └── metrics.test.ts          # Unit tests — these are sacred
│   ├── xlsx/
│   │   ├── schema.ts                # Zod schemas per sheet
│   │   ├── export.ts                # State → workbook (8 sheets)
│   │   ├── import.ts                # Workbook → state (with migration)
│   │   └── migrations.ts            # v1 → v2 transforms
│   ├── prices/
│   │   ├── idx.ts                   # IDX fetcher (server-side only)
│   │   ├── gold.ts                  # Pegadaian scraper (server-side only)
│   │   ├── forex.ts                 # exchangerate.host wrapper
│   │   └── cache.ts                 # In-memory + KV-optional TTL cache
│   ├── store/
│   │   └── portfolio.ts             # Zustand store: form state, derived state
│   └── format/
│       ├── currency.ts              # Rp formatter (period thousands)
│       └── number.ts                # Tabular helpers
│
├── tests/
│   ├── xlsx-roundtrip.test.ts       # Export → import → diff = 0
│   ├── metrics.test.ts              # All 10 metrics across 15 scenarios
│   └── migration.test.ts            # v1 → v2 transforms
│
├── public/                          # Static assets (favicon, og-image)
├── package.json
├── tsconfig.json
├── tailwind.config.ts               # Design tokens here (mirror frontmatter)
├── next.config.ts
└── README.md
```

**Boundary rules:**
- `lib/calc/*` and `lib/format/*` are **pure functions** — no React, no I/O, no globals. Easy to test, reusable in export logic.
- `lib/xlsx/*` runs in **both** browser (import/export buttons) and server (none yet, but possible). Don't import browser-only APIs.
- `lib/prices/*` runs **only on the server** (Route Handlers). Mark with `"server-only"` package.
- `components/*` is React-only. Calls into `lib/calc` for derivations.

---

## 4. Data Flow

### 4.1 First-time user

```
Landing (Mulai Baru clicked)
    ↓
Empty form mounted → Zustand store initialized to defaults
    ↓
User types in fields → React Hook Form syncs to Zustand
    ↓
Zustand subscribers compute derived state (metrics, totals, etc.)
    ↓
Dashboard cards re-render with new values
    ↓
User clicks Download .xlsx
    ↓
lib/xlsx/export.ts reads Zustand state → builds 8-sheet workbook
    ↓
SheetJS writes Blob → browser downloads file
    ↓
Tab can be closed. No server contact for any of this.
```

### 4.2 Returning user (import)

```
Landing (Import .xlsx clicked, file dropped)
    ↓
DropZone reads File → ArrayBuffer
    ↓
lib/xlsx/import.ts: parse workbook → read _meta sheet
    ↓
Check pwp_schema_version:
    - v2 → parse data_json, hydrate Zustand directly
    - v1 → run migration chain in lib/xlsx/migrations.ts → hydrate
    - unknown → best-effort sheet parse → flag missing fields
    - corrupt → error UI, fallback to Mulai Baru
    ↓
Hydration progress UI shows item-by-item: "Memuat 14 saham..."
    ↓
Redirect to /app, form is pre-filled
    ↓
User edits → exports again, overwriting old file
```

### 4.3 Live-price fetch (only server interaction)

```
StockCard mounts with ticker "BBCA"
    ↓
useSWR('/api/prices/idx?tickers=BBCA', ...) — client cache 15min
    ↓
Browser → /api/prices/idx (Next.js Route Handler, edge runtime)
    ↓
Handler checks in-memory cache for "BBCA" (TTL 15min)
    - HIT → return cached value
    - MISS → fetch upstream (TBD source), parse, cache, return
    ↓
{ ticker: "BBCA", price: 10667, currency: "IDR", fetched_at: "...", stale: false }
    ↓
Component renders price + LIVE pill
```

**Critical:** the request payload to `/api/prices/*` contains ONLY ticker symbols, NEVER user portfolio data. No equity values, no lot counts, no auth tokens. The server can't tell who you are or what you own.

---

## 5. API Contract (Price Proxy)

### 5.1 `GET /api/prices/idx`

**Query:** `?tickers=BBCA,BBRI,BMRI` (comma-separated, max 25 per request)

**Response 200:**
```json
{
  "prices": [
    { "ticker": "BBCA", "price": 10667, "currency": "IDR",
      "fetched_at": "2026-05-25T07:32:18Z", "stale": false },
    { "ticker": "BBRI", "price": 4580, "currency": "IDR",
      "fetched_at": "2026-05-25T07:32:18Z", "stale": false }
  ],
  "missing": []
}
```

**Response 200 (partial — some tickers couldn't be resolved):**
```json
{
  "prices": [ ... ],
  "missing": ["XYZA"]
}
```

**Response 503 (upstream completely down):**
```json
{
  "error": "upstream_unavailable",
  "message": "IDX price feed temporarily unavailable",
  "retry_after_seconds": 60
}
```

**Cache headers:** `Cache-Control: public, max-age=900, stale-while-revalidate=3600`

### 5.2 `GET /api/prices/gold`

**Response 200:**
```json
{
  "source": "pegadaian",
  "idr_per_gram": 1300000,
  "fetched_at": "2026-05-25T07:32:18Z",
  "stale": false
}
```

If Pegadaian scrape fails, fall back to a secondary source (Antam) and indicate via `source`. If both fail, return last-known cached value with `stale: true`.

### 5.3 `GET /api/prices/forex`

**Query:** `?pair=USDIDR`

**Response 200:**
```json
{
  "pair": "USDIDR",
  "rate": 15820.5,
  "fetched_at": "2026-05-25T07:32:18Z",
  "stale": false
}
```

---

## 6. xlsx Schema (engineering form)

### 6.1 `_meta` sheet (hidden, source of truth for round-trip)

| Cell | Value |
|---|---|
| `A1` | `pwp_schema_version` |
| `B1` | `2` |
| `A2` | `exported_at` |
| `B2` | ISO 8601 timestamp |
| `A3` | `source` |
| `B3` | `web-app-v2` or `manual-edit` |
| `A4` | `data_json` |
| `B4` | Full Zod-validated JSON of `PortfolioState` |

**The round-trip relies on `B4`.** Other sheets are display-only and may be hand-edited; on import we trust `B4` and ignore the rest unless `B4` is missing/corrupt — then we fall back to best-effort parse of the display sheets.

### 6.2 Display sheets generated on export

| Sheet | Purpose | Re-import source? |
|---|---|---|
| `Summary` | Hero number + 10 metrics + allocation breakdown | No (display only) |
| `Stocks Progress` | Per-emiten: lots, target, equity, bobot, dividend | Yes (fallback) |
| `Stocks Check Point Data` | Accumulation milestones per stock | No (derivable) |
| `Data Modal` | Aset categories, totals | Yes (fallback) |
| `Debt Detail` | Gadai with tempo, interest, defisit | Yes (fallback) |
| `Next Target` | Per-stock lot gap + modal needed | No (derivable) |
| `CashFlow` | Income / expenses / liabilities | Yes (fallback) |
| `_meta` (hidden) | Schema + JSON | **Primary re-import source** |

**Critical rule: sheets contain VALUES, not formulas.** A user opening the file in Excel sees clean numbers; the file works offline forever.

### 6.3 Zod schema sketch

```ts
// lib/xlsx/schema.ts
import { z } from "zod";

export const StockHoldingSchema = z.object({
  ticker: z.string().regex(/^[A-Z]{4}$/),
  lotsCurrent: z.number().int().nonnegative(),
  lotsTarget: z.number().int().nonnegative(),
  priceLive: z.number().nonnegative(),       // Rp per lembar
  targetBobot: z.number().min(0).max(100),
  avgDividendYield: z.number().min(0).max(50).optional(),
  lastDividendPerLembar: z.number().nonnegative().optional(),
});

export const PortfolioStateSchema = z.object({
  schemaVersion: z.literal(2),
  cash: z.array(/* ... */),
  goldGrams: z.object({
    cadangan: z.number(),
    tertahan: z.number(),
  }),
  stocks: z.array(StockHoldingSchema),
  reksaDana: z.array(/* ... */),
  // ... rest
  gadai: z.object({
    pokokPinjaman: z.number(),
    bungaPerBulan: z.number(),
    tempoMonths: z.number(),
  }).optional(),
  cashflow: z.object({
    salary: z.number(),
    otherIncome: z.number(),
    fixedExpenses: z.array(/* ... */),
    variableExpenses: z.array(/* ... */),
  }),
});

export type PortfolioState = z.infer<typeof PortfolioStateSchema>;
```

### 6.4 Migrations

```ts
// lib/xlsx/migrations.ts
const migrations: Record<number, (oldState: any) => any> = {
  1: (v1) => ({
    schemaVersion: 2,
    cash: v1.cash ?? [],
    goldGrams: { cadangan: v1.goldGrams ?? 0, tertahan: 0 },
    // ... fill defaults for v2-new fields
    stocks: (v1.stocks ?? []).map((s) => ({
      ...s,
      lotsTarget: s.lotsCurrent,       // default target = current
      targetBobot: 100 / v1.stocks.length, // even distribution
    })),
  }),
};

export function migrate(state: any): PortfolioState {
  while (state.schemaVersion < CURRENT_VERSION) {
    state = migrations[state.schemaVersion](state);
  }
  return PortfolioStateSchema.parse(state);
}
```

Each migration is **append-only** and tested via `migration.test.ts`.

---

## 7. Live Price Sources — Detailed

### 7.1 IDX equities

This is the single biggest open question in `PRD §10`. Three viable paths:

| Source | Cost | Pros | Cons |
|---|---|---|---|
| **Goapi.id** | ~Rp 500K/month | Official-ish, reliable | Paid; API key management |
| **Stockbit unofficial** | Free | Available now | ToS-risky; may break/be rate-limited |
| **Yahoo Finance** (`BBCA.JK`) | Free | Stable for years | 15-min delayed; some IDX tickers missing |

**Recommendation for MVP:** start with Yahoo Finance via `yahoo-finance2` npm package. Free, no key, sufficient for 15-min delayed data (which matches the user's current GOOGLEFINANCE behavior). Plan to swap to Goapi.id at scale.

### 7.2 Gold (Pegadaian)

The user's xlsx scrapes `https://sahabat.pegadaian...` via `IMPORTDATA` + regex. We do the same server-side with `cheerio`.

**Fragility mitigation:**
- Aggressive cache: 1-hour TTL
- Secondary source: Antam HTML scrape (different page structure, hedges against single-source failure)
- Manual override field in UI (in `design-guidelines.md §8.6`) — user can type the gram price if both sources fail

### 7.3 USD/IDR

`exchangerate.host` (free, no key, hourly cache). Trivial.

### 7.4 Cache strategy

- **In-memory cache** per server instance (LRU, ~100 keys, 15-min TTL)
- For Vercel: each cold start = empty cache, but warm instances reuse. Hot tickers stay warm.
- **Optional later:** Vercel KV or Cloudflare KV for cross-instance cache. Not needed for MVP traffic.

---

## 8. Deployment

### 8.1 Vercel (recommended)

```
git push origin main → Vercel auto-deploy
```

- **Hobby plan (free)** — 100 GB bandwidth, 1M Edge function invocations, plenty for MVP launch
- **Pro plan ($20/month)** — needed if we exceed limits or want commercial use; bumps function timeout to 60s
- Route Handlers run on **Edge runtime** (fastest cold start, geographically distributed)

### 8.2 Cloudflare Pages (alternative)

- Cheaper at scale, more generous free tier
- Workers have stricter limits (10ms CPU/request on free) — fine for our cached price proxy
- Slightly more setup; Next.js adapter required

### 8.3 Domain & SSL

- Domain TBD (open question in PRD §10.6)
- SSL handled automatically by deploy platform
- No third-party CDN needed initially

### 8.4 Environment

```
NEXT_PUBLIC_APP_VERSION=2.0.0
PRICE_CACHE_TTL_SECONDS=900
SOURCE_IDX_PROVIDER=yahoo          # yahoo | goapi | stockbit
GOAPI_KEY=                         # only if SOURCE_IDX_PROVIDER=goapi
SENTRY_DSN=                        # optional error tracking
```

**Zero secrets needed for MVP** if we start with Yahoo Finance.

---

## 9. Cost Estimate

### 9.1 Infrastructure (per month)

| Service | Free tier covers | Estimated cost at 1K MAU | At 10K MAU |
|---|---|---|---|
| Vercel | Yes | $0 | $0 |
| Domain (`.com`) | — | ~$1 (amortized) | ~$1 |
| Sentry (optional) | Yes (5K events) | $0 | ~$25 |
| Goapi.id (if needed) | — | $0 (Yahoo) | ~Rp 500K (~$32) |
| **Total** | | **~$1** | **~$60** |

### 9.2 What can blow this up

- **Pegadaian rate-limiting us** → need rotating residential proxies (~$50–100/month)
- **A viral moment** → Vercel bandwidth overage charged at $40/100GB
- **Adding scheduled jobs** (refresh prices on cron) → Vercel cron requires Pro plan + invocation costs

None of these are MVP concerns.

---

## 10. Testing Strategy

### 10.1 Must-have tests

| Test | What it proves |
|---|---|
| `metrics.test.ts` (15 scenarios) | All 10 metrics produce correct values across edge cases (zero income, negative net worth, etc.) |
| `xlsx-roundtrip.test.ts` | export → import → re-export → diff = 0 |
| `migration.test.ts` | v1 files migrate to v2 without data loss |
| `import-handedited.test.ts` | A hand-edited xlsx with corrupted `_meta` still imports best-effort |

These are **non-negotiable**. The product's trust pitch dies if metrics are wrong or round-trip silently loses data.

### 10.2 Nice-to-have

- Component snapshot tests for key components
- E2E (Playwright) for the import flow — high signal because it touches the most code paths
- Lighthouse CI for performance regression

### 10.3 Anti-tests

Don't test:
- Pure UI styling (Tailwind classes)
- Trivial wrappers
- Third-party libs

---

## 11. Performance Budget

| Metric | Target |
|---|---|
| Initial load (Lighthouse) | ≥85 performance score |
| Dashboard recalc on input change | <300ms (full 25-stock portfolio) |
| xlsx export (25 stocks, all fields filled) | <2s |
| xlsx import (same payload) | <1s |
| Largest Contentful Paint | <2.5s on 4G |

**Where to spend perf budget:**
- Memoize derived state in Zustand (don't recompute donut every keystroke)
- Lazy-load Recharts (~70KB) — only when dashboard mounted
- Lazy-load SheetJS (~700KB!) — only on import/export click
- Inline critical CSS via Next.js defaults

---

## 12. Security & Privacy

### 12.1 Threat model

| Threat | Mitigation |
|---|---|
| User data sent to our server | Architectural — there is no endpoint that accepts user data |
| Third-party API sees user IP | Server proxies all upstream calls |
| Third-party API sees user portfolio | Only ticker symbols are sent upstream, no portfolio context |
| xlsx file leaks via shared link | Out of our hands — user controls their file storage |
| Malicious xlsx import (XLSX bomb / formula injection) | SheetJS option `{ raw: true, cellFormula: false }`; cap file size at 5MB |
| XSS via user-entered field names | React auto-escapes; no `dangerouslySetInnerHTML` |
| Supply-chain attack | Lock package.json to specific versions; renovate-bot for review |

### 12.2 What we will NOT do (anti-features)

- Track user behavior with cookies
- Use Google Analytics / Facebook Pixel
- Log price-fetch queries with any user identifier
- Add Sentry user context beyond browser/version (no user ID)

### 12.3 Analytics

- **Plausible** or **Umami** (privacy-respecting, no cookies)
- Page-level only — never event-level financial data

---

## 13. Risks & Open Technical Questions

### 13.1 Technical risks (engineering)

1. **SheetJS bundle size** (~700KB) is the largest single asset. If users on slow connections abandon during import, we have a problem. Mitigation: code-split, show loading state, consider `exceljs` as alternative (~400KB).

2. **Pegadaian HTML changes** will break gold price. Need monitoring (Sentry alert on scrape failure rate) and manual-override fallback.

3. **Vercel Edge runtime limitations** — no Node.js APIs, `cheerio` works but some libs don't. Test early.

4. **localStorage temptation** — once we add "remember my draft," we re-introduce stored user data and break the privacy pitch. Resist until v3.

### 13.2 Open questions for product/PM

1. **IDX price source for MVP** — Yahoo Finance OK as default? Confirm before sprint 1.
2. **Schema migration strategy when v3 lands** — append-only as proposed, or do we cut off old schemas?
3. **Cap on portfolio size** — 25 stocks max? 50? Affects perf tuning.
4. **Error tracking PII** — Sentry yes/no? If yes, what user-identifying info do we strip?
5. **i18n architecture** — start with Bahasa Indonesia only, leave English placeholder? Or build i18n from day 1?

---

## 14. 12-Week MVP Sprint Plan

Mirrors `personal-wealth-platform-mvp.md` but with engineering specificity.

| Week | Engineering work | "Done" criteria |
|---|---|---|
| 1 | Project setup, design tokens → Tailwind config, header/footer shell | Static deploy to Vercel works; design system visible in Storybook (or `/styleguide` page) |
| 2 | Price proxy endpoints (IDX, gold, forex) | All 3 endpoints return 200 with sample tickers; cache verified |
| 3 | Aset tab — Likuid section (Cash, Logam, Saham, RD) | Per-emiten stock card renders, calculator updates Net Worth live |
| 4 | Aset tab — Non-Likuid + asset row patterns | All asset categories addable/editable/deletable |
| 5 | Cashflow tab + dividend estimator (Mode A + B) | Savings Rate, DSR compute live from form |
| 6 | Utang + Gadai sub-module | DAR, DER, Gadai panel with warning states |
| 7 | Akumulasi tab + per-emiten expanded state + accumulation ladders | Bayu workflow: open Akumulasi, see stocks sorted by progress, deploy modal |
| 8 | xlsx export (8 sheets) | Workbook downloads; opens cleanly in Excel + Google Sheets |
| 9 | xlsx import (round-trip happy path) | Export → import → diff = 0 verified in test |
| 10 | xlsx import error handling + v1 migration + hand-edited fallback | All 4 error states from design §7.2 handled |
| 11 | Empty / edge / mobile states + microcopy pass with PM | 14 states from design guidelines §9 are all rendered |
| 12 | Beta with 5 testers from r/finansial, fix top issues | First 5 users complete full round-trip without help |

**Out of scope for these 12 weeks:** localStorage autosave, analytics integration, marketing site, share links, mobile-native, multi-portfolio.

---

## 15. After MVP

The cleanest extension points if we need them:

1. **Replace price proxy with Go service** — only if Vercel function limits become the bottleneck. Drop in a `riset-api` endpoint and swap the source in `lib/prices/`. Frontend doesn't change.
2. **Add Vercel KV for cross-instance cache** — when single-instance memory is no longer enough.
3. **Add Cron** (Vercel Cron Jobs) for scheduled price refresh — only useful if we add features that need up-to-date prices when no user is active (e.g., email alerts).
4. **Move to Cloudflare** if Vercel costs grow disproportionate to revenue.

---

## 16. Quick Start (for the engineer)

```bash
# Setup
pnpm create next-app@latest zenith-wealth --typescript --tailwind --app
cd zenith-wealth

# Core deps
pnpm add zustand react-hook-form zod
pnpm add xlsx recharts
pnpm add swr cheerio yahoo-finance2

# Dev
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
pnpm add -D @types/node prettier

# Run
pnpm dev    # http://localhost:3000
```

First two PRs:
1. **Design tokens → Tailwind config + `/styleguide` page.** Validates the whole system visually before writing any feature code.
2. **Price proxy endpoint for one ticker.** Validates the data-flow assumption before building anything that depends on it.
