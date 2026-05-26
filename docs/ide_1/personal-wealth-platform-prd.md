# Personal Wealth Platform — Product Requirements Document (MVP v1)

**Status:** Draft
**Last updated:** 2026-05-25
**Owner:** TBD

---

## 1. Problem & Personas

### 1.1 Problem
Indonesian working professionals lack a simple, trustworthy way to see their complete financial picture. Existing apps (Mint-style aggregators, local fintech super-apps) require linking bank accounts or signing up — friction and privacy concerns most users won't accept. Spreadsheets work but don't compute financial-health metrics or visualize allocation.

### 1.2 Target Persona (Primary)
**"Andi" — 28–35, salaried professional in Jakarta/Bandung/Surabaya**
- Monthly income IDR 15–40jt
- Has 1 KPR (mortgage) or KPM (vehicle loan), some savings, may hold gold/stocks/crypto
- Distrusts apps that ask for bank credentials
- Comfortable with spreadsheets but doesn't enjoy maintaining them
- Wants a quick "am I financially healthy?" gut-check, not deep budgeting

### 1.3 Why now
Rising awareness of personal finance in Indonesia (FIRE community, financial influencers), combined with growing distrust of data sharing after several local data-breach incidents.

---

## 2. Goals & Non-Goals

### 2.1 Goals (MVP v1)
- Let a user enter their full financial position in **under 10 minutes**
- Show 4 financial-health metrics with clear green/yellow/red guidance
- Visualize asset allocation
- Let users download their data as an `.xlsx` file to keep locally
- Be **fully usable without sign-up, login, or any server-side data storage**

### 2.2 Non-Goals (explicitly NOT in v1)
- User accounts, authentication, or password management
- Server-side persistence of user financial data
- Bank account linking / Open Finance integration
- Investment or insurance product recommendations
- Tax calculations (PPh21, capital gains, etc.)
- Multi-user / household / shared portfolios
- Native mobile app (iOS / Android)
- Push notifications, reminders, or scheduled reports
- Re-uploading a previously saved xlsx file *(deferred to v2)*
- Live price integrations beyond USD/IDR and gold *(deferred to v2)*
- Sankey diagram *(deferred to v2)*
- Historical net-worth tracking / time-series charts *(deferred to v2)*

---

## 3. User Flow & Journey

No routes, no accounts, no session. The entire product is a single page. Refreshing = starting over (with a `beforeunload` warning).

### 3.1 Discovery → Entry

| Stage | Detail |
|---|---|
| **Channel** | Reddit r/finansial, finance Twitter/X, FIRE-community Telegram, word-of-mouth |
| **Trigger** | "Gw lagi cari tools buat ngitung net worth tapi gamau connect bank" |
| **Landing promise** | Hero must say in <2s: *"Hitung kondisi keuanganmu. Tanpa daftar. Tanpa kirim data ke server."* |
| **First friction test** | If user sees a "Sign up" button anywhere above the fold → wedge broken |

### 3.2 First-Time Use (Happy Path)

| # | User action | System response | Andi's mental state |
|---|---|---|---|
| 1 | Lands on URL | Single-page layout: form (left) / dashboard (right). Empty-state placeholders show what metrics *will* look like ("Net Worth: —", "DSR: —") | Skeptical → curious |
| 2 | Scans page, no signup prompt | Hero copy + 1-line privacy note visible | "Oke, beda sama yang lain" |
| 3 | Enters monthly salary | Income field accepted; dependent metrics still "—" until expenses added | Engaged |
| 4 | Adds first asset (cash savings) | Donut chart starts forming; Net Worth updates live | First "aha" |
| 5 | Adds gold (grams) | Auto-converted using live IDR/gram price; "Last updated 14:32" badge | Trust signal — sees price source is real |
| 6 | Adds KPR remaining + monthly installment | DSR widget activates; turns yellow at 33% | Self-recognition moment |
| 7 | Tweaks, adds forgotten items | All 4 metrics recalc <200ms | Confidence ↑ |
| 8 | Reviews dashboard | 4 colored badges + 1-line explanation each | **Critical moment — product's reason to exist** |
| 9 | Clicks "Download .xlsx" | Saves `wealth-snapshot-2026-05-25.xlsx` to disk | Ownership, control |
| 10 | Closes tab | Nothing persists server-side | Done |

**The make-or-break step is #8.** If the 4 metrics don't feel insightful at this exact moment, user churns and doesn't share. Microcopy here matters more than any other surface.

### 3.3 Edge Cases & Alternate Flows

| Scenario | Behavior |
|---|---|
| Accidental refresh | `beforeunload` prompt: *"Data kamu belum tersimpan. Yakin mau refresh?"* |
| User abandons mid-entry | No recovery in v1. (v2: optional localStorage autosave with explicit opt-in.) |
| User enters income = 0 | DSR & Savings Rate show "—" with tooltip. Net Worth & Runway still compute. |
| Live price API fails | Cached "last known" rate + stale badge; manual override field exposed |
| User on mobile | Layout collapses to stacked column. Functional but `<small>` hint: *"Lebih nyaman di desktop"* |
| User wants to redo from scratch | "Reset" button bottom of form with confirm dialog |

### 3.4 Return Visits — the v1 cost

In v1, there is **no real "return."** Every visit starts blank. The user's only continuity option is re-opening their downloaded `.xlsx` in Excel (read-only) and manually re-typing numbers into the app.

This is the single biggest UX cost of the no-server stance, and the strongest pull toward v2's upload feature. We should be **honest about it in onboarding**, not hide it:

> *"Setiap kunjungan dimulai dari awal — itu konsekuensi dari nggak nyimpen data kamu. Download dulu sebelum keluar, ya."*

If users churn here, the lesson is "ship v2 upload sooner," not "add server storage."

### 3.5 Journey Map Summary

```
DISCOVER → LAND → ORIENT → INPUT → SEE METRICS → DOWNLOAD → EXIT
  (trust)  (1s)   (5s)    (5-8m)   (★critical)   (10s)    (done)
                                       │
                                       └─ if weak here, no share, no return
```

---

## 4. Functional Requirements

### 4.1 Asset Module

Users enter assets, categorized into two groups by liquidity:

The input shape varies by asset type — some take a raw IDR value, others take **units** (grams, lots, coins) that the app auto-converts to IDR.

**Liquid Assets**
| Asset Type | User Input | Auto-Calculated | Live Price (v1) | Notes |
|---|---|---|---|---|
| Savings / Cash | Amount + currency (IDR or USD) | IDR value (if USD) | USD→IDR live | Multiple entries allowed |
| Time Deposits | Amount in IDR | — | — | Manual |
| Gold (Logam Mulia) | **Grams** | **IDR value = grams × live IDR/gram** | Live gold/gram | Single source (see §7) |
| Stocks (Saham) | **Emiten (ticker) + Lots + price per lembar** | **Equity = Lots × 100 × price/lembar** | Manual price/lembar in v1 | 1 Lot = 100 Lembar (IDX standard); show as inline helper text |
| Mutual Funds (Reksa Dana) | RD name + amount in IDR | — | — | Manual; entered as IDR value (no NAV/unit input in v1) |
| Government Bonds (SBN) | Face value in IDR | — | — | Manual |
| Crypto | Coin + quantity + price per coin (IDR) | **IDR value = quantity × price** | Manual price in v1 | Manual price entry |

**Non-Liquid Assets**
| Asset Type | User Input |
|---|---|
| Property (Land/House/Apartment) | Estimated market value in IDR |
| Vehicles (Car/Motorcycle) | Estimated market value in IDR |
| Pension Funds (BPJS, DPLK) | Current accumulated balance in IDR |

**Rules:**
- Every asset row: user can add/edit/delete
- All values stored and displayed in IDR (USD converted at live rate at time of entry)
- Empty fields = 0 (do not block dashboard render)

### 4.2 Cash Flow & Liabilities Module

**Income (monthly, in IDR)**
- **Salary** (net, after PPh21)
- **Estimated Dividend Income** — derived from stock holdings in §4.1 (see 4.2.1 below)
- **Other income** — deposit interest, rent, side income; single combined field for v1

#### 4.2.1 Estimated Dividend Income

This sub-section auto-populates from the stocks the user entered in §4.1 → Saham. It is always labeled **"Estimasi"** — never presented as a precise figure. Two input modes:

**Mode A — Assumption-based (default)**
- Single field: assumed annual dividend yield (%) — default **7%**, editable
- Calculation: `Σ(Equity per emiten) × Yield% ÷ 12 = Monthly Dividend Estimate`
- One number, fast, good enough for most users

**Mode B — Per-Emiten Manual Override**
- User expands "Detail Dividen Manual" to enter `Dividen per Lembar (Rp)` per emiten
- Pre-populated rows from the stocks already listed in §4.1 (ticker + lots already known)
- Calculation per row: `Lots × 100 × Dividen per Lembar = Annual Dividend per Emiten`
- Total: `Σ(per-emiten annual) ÷ 12 = Monthly Dividend Estimate`
- More accurate for users who know each stock's actual dividend payout

**Rules:**
- If user has zero stocks in §4.1 → entire dividend section is **hidden** (no orphan UI)
- Modes are **mutually exclusive**; switching modes preserves the other mode's stored data (so toggling back doesn't lose work)
- The resulting monthly dividend figure flows into `Monthly Net Income` used by DSR and Savings Rate
- **"Estimasi" badge** on the input row and on the dashboard income breakdown — clarifies this is not realized cash

**Edge cases:**
- User removes a stock from §4.1 that has Mode B detail → that row is dropped silently (no warning; data was opt-in)
- User enters yield = 0% → dividend contribution is 0; sub-section stays visible

**Liabilities (total outstanding, in IDR)**
- Remaining mortgage principal
- Remaining vehicle loan principal
- Credit card outstanding balance
- BNPL / paylater outstanding
- Other debts

**Expenses (monthly, in IDR)**
- *Fixed:* total monthly debt installments, rent, utilities, subscriptions
- *Variable:* food, transport, lifestyle (average)

### 4.3 Dashboard & Metrics

All metrics recalculate live as user edits inputs. No "Calculate" button.

#### Net Worth
```
Net Worth = Total Assets (Liquid + Non-Liquid) − Total Liabilities
```
- Display in IDR
- If negative: show red, with note "Liabilities exceed assets"

#### Debt Service Ratio (DSR)
```
DSR = Total Monthly Debt Installments ÷ Monthly Net Income
```
- Example: 5,000,000 ÷ 15,000,000 = 33% → yellow
- Thresholds: **Green <30% · Yellow 30–40% · Red >40%**
- Edge case: if income = 0 → show "—" with tooltip "Enter income to calculate"

#### Financial Runway (Emergency Fund)
```
Runway (months) = Total Liquid Assets ÷ (Fixed Expenses + Variable Expenses)
```
- User selects household status: **Single** or **Has Dependents**
- Thresholds (Single): Green ≥6 · Yellow 3–6 · Red <3
- Thresholds (Has Dependents): Green ≥12 · Yellow 9–12 · Red <9
- Edge case: if monthly expenses = 0 → show "—"

#### Savings Rate
```
Savings Rate = (Monthly Net Income − Total Monthly Expenses) ÷ Monthly Net Income
```
- Thresholds: **Green ≥20% · Yellow 10–20% · Red <10%**
- Edge case: if income = 0 → show "—"; if negative → show "0%" with red

### 4.4 Visualization

**v1:**
- **Allocation Donut Chart** — % breakdown of assets by category (Cash, Gold, Stocks, Property, etc.)

**Deferred to v2:** Sankey cash-flow diagram

### 4.5 Export

- Single button: **"Download .xlsx"**
- File contains:
  - Sheet 1: `Summary` — formatted, human-readable: net worth, metrics, allocation %
  - Sheet 2: `Assets` — full table of all asset entries
  - Sheet 3: `CashFlow` — income, expenses, liabilities
  - Sheet 4: `_meta` (hidden) — schema version + raw JSON of state, for future re-upload in v2
- Default filename: `wealth-snapshot-YYYY-MM-DD.xlsx`

---

## 5. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Platform | Web app, desktop-first (responsive tolerated, not optimized for mobile in v1) |
| Browser support | Latest Chrome, Safari, Firefox, Edge |
| Language | Bahasa Indonesia (primary); English (toggle, v2) |
| Performance | Dashboard recalculation <200ms on input change |
| Privacy | **No user financial data sent to any server.** All calc client-side. Only network calls: USD/IDR + gold price fetch (no user data attached) |
| Data persistence | None on server. Optional `localStorage` autosave with explicit user opt-in *(deferred to v2)* |
| Accessibility | Keyboard navigable; WCAG AA color contrast on metric badges |
| Analytics | Page-level only (no event-level user financial data); use privacy-respecting analytics (e.g., Plausible) |

---

## 6. Data Model / xlsx Schema

**Sheet `_meta` (hidden)** — required for v2 upload compatibility:
| Cell | Value |
|---|---|
| A1 | `pwp_schema_version` |
| B1 | `1` |
| A2 | `exported_at` |
| B2 | ISO timestamp |
| A3 | `data_json` |
| B3 | JSON string of full app state |

**Sheet `Assets`** — columns:
`type, category (liquid/non-liquid), name, quantity, unit, currency, price_per_unit, value_idr`

**Sheet `CashFlow`** — columns:
`section (income/fixed_expense/variable_expense/liability), label, amount_idr`

**Sheet `Summary`** — formatted display only; not used for re-import.

---

## 7. Live Price Integrations (v1)

| Data | Source (proposed) | Cache TTL | Fallback |
|---|---|---|---|
| USD → IDR | exchangerate.host (free, no key) | 1 hour | Last known rate + "stale" badge |
| Gold (IDR/gram) | Pegadaian or Antam (scrape or unofficial API) | 1 hour | Manual entry field |

- Calls proxied through our own backend (small Go service) so user IP is never sent to third-party APIs
- All other prices (stocks, crypto, etc.): **manual entry** in v1

---

## 8. Success Metrics

**Launch criteria (v1 is "done" when):**
- A new user can complete asset entry + download xlsx in <10 min (measured by user test, n=5)
- All 4 metrics render correctly across 10 hand-crafted test scenarios (zero income, negative net worth, etc.)
- Lighthouse performance score ≥90

**Post-launch (first 60 days):**
- 500+ unique visitors complete the download action
- Time-on-page p50 ≥4 min (proxy for "actually used it")
- Qualitative: 5+ unsolicited pieces of positive feedback (Reddit r/finansial, Twitter, etc.)

---

## 9. Open Questions

1. **Gold price source**: Pegadaian, Antam, or aggregate of both? Need to confirm scraping ToS.
2. **Bahasa Indonesia copy**: who writes the microcopy and metric explanations? Tone — friendly or formal?
3. **Hosting**: Vercel/Netlify for frontend + small Go backend for price proxy? Or all-in-one (e.g., Cloudflare Workers)?
4. **Stocks/crypto in v1**: confirmed manual price entry — but do we provide a *"last updated"* timestamp field per asset so users can see staleness?
5. **Negative net worth UX**: just show red number, or surface a contextual tip ("Focus on debt reduction first")?
6. **Branding & domain**: name, logo, URL — TBD.

---

## 10. Roadmap (Post-MVP)

**v2 (Q3 2026 target)**
- xlsx upload + resume session
- Schema migration logic (v1 → v2 files)
- Sankey cash-flow diagram
- Live prices: IDX stocks, US stocks, top crypto
- Optional localStorage autosave
- English language toggle

**v3+ (exploratory)**
- Historical snapshots (multi-file timeline)
- Goal tracking (e.g., "save 100jt for down payment by 2027")
- Shareable read-only links (with explicit user action)
- Mobile-optimized layout

---
