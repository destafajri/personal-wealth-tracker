# Personal Wealth Platform — PRD (v2, ide_2)

**Status:** Draft
**Last updated:** 2026-05-25
**Owner:** TBD
**Supersedes:** `ide/ide_1/personal-wealth-platform-prd.md` (still valid for the lean "Andi" wedge — see §0)
**Source artifacts reviewed:** `ide/Aset Tracker.xlsx` (5 sheets, ~40 named cells of formulas), shared Google Sheets, ide_1 PRD + design guidelines

---

## 0. What changed from v1 — and why this is a different product

The v1 PRD targeted **"Andi"** — a generic salaried Jakarta professional who wants a quick net-worth gut-check. The xlsx you actually use reveals a **different, more sophisticated user** with a specific investment philosophy. Pretending both are one product will produce something that fits neither.

| Dimension | v1 (Andi) | v2 (You / xlsx user) |
|---|---|---|
| Primary job | "Am I financially healthy?" | "Am I executing my accumulation plan on schedule?" |
| Asset focus | Show totals + allocation donut | **Per-emiten progress to target lot** |
| Metrics | Net Worth, DSR, Runway, Savings Rate | + **DAR, DER, Target Bobot, Modal Siap Distribusi, Safe Haven Ratio** |
| Stocks | Ticker + lots + current price | **Target lots, Bobot %, accumulation ladders (10/30/50/70/80/100%), dual dividend yield (avg + last)** |
| Gold | Grams × live price = value | + **Cadangan vs. Tertahan (pawned), Pegadaian interest tracking** |
| Liabilities | Simple total outstanding | + **Piutang Gadai with monthly interest, Sisa Tempo, Defisit projection by month** |
| Income breakdown | Salary + dividend | + **"Modal Siap Distribusi" = cash + RD − debt obligations** |
| Output | One-shot xlsx download | **Bidirectional: web ↔ xlsx round-trip** |
| Live price | USD/IDR + gold only | + **IDX equities (GOOGLEFINANCE replacement)** |

**Recommendation: ship v2 as the actual product.** The v1 "Andi" scope is a *subset* of v2 — the casual user simply doesn't fill the advanced fields. Don't build two products.

**Counter-argument (push back on me here):** if you want fast market validation with the broadest TAM, ship v1 first and add v2 features as a "Pro mode." But your own behavior is the strongest signal — you've already built v2 by hand in a spreadsheet. The wedge isn't "show me net worth," it's "**replace my Aset Tracker xlsx with a less fragile UI**."

---

## 1. Problem & Personas

### 1.1 Problem (revised)

Indonesian retail investors who run **disciplined accumulation strategies** (value investing, DCA, lot-targeted portfolios) end up maintaining elaborate Google Sheets / Excel files. These files:

- Break when GOOGLEFINANCE or IMPORTDATA scrapers fail
- Don't survive being shared (formulas leak credentials / break on re-open)
- Can't be opened comfortably on mobile
- Require manual recalculation when allocation targets shift
- Mix accumulation tracking with debt tracking with cashflow — but no single tool does all three for the Indonesian context (KPR, Gadai Emas, BPJS, IDX lots)

Existing tools (Stockbit, Pintu, Bibit) require account linking and only see one slice. Spreadsheets are flexible but fragile.

### 1.2 Target Persona (Primary — revised)

**"Bayu" — 30–45, Indonesian retail investor running an accumulation thesis**
- Monthly income IDR 25–80jt (often non-salary: business owner, freelancer, dual-income)
- Holds **10–25 IDX stocks** with explicit target weights per emiten
- Uses **gold as collateral** (pawns at Pegadaian to fund stock accumulation — very common in this segment)
- Tracks Safe Haven (gold, cash, RD) vs. Productive (saham, lain-lain) ratio
- Cares about dividend yield as recurring cashflow, not just capital appreciation
- Will tolerate complexity if the tool earns it; will not tolerate fragility
- Currently maintains a Google Sheets file like `Aset Tracker.xlsx`

### 1.3 Target Persona (Secondary — preserved from v1)

**"Andi"** — casual salaried professional who wants a quick health check. Lives in the simplified subset of the v2 UI. No accumulation targeting, no Gadai, just the 4 v1 metrics.

### 1.4 Why now

- Local exchange (IDX) is growing retail base — Stockbit alone reports 3M+ users
- Pegadaian Gadai Emas volume rising as inflation hedge tactic
- Distrust of bank-linked apps after recurring data-breach incidents
- Plus Jakarta Sans, modern web tooling, and live-price APIs are all good enough now

---

## 2. Goals & Non-Goals

### 2.1 Goals (MVP v2)

1. **Replace the user's existing tracker spreadsheet** with a web UI that's friendlier to use but no less powerful
2. **xlsx round-trip parity** — every web feature must serialize to xlsx and deserialize back without loss
3. **Resolve the fragility of GOOGLEFINANCE / IMPORTDATA** by proxying live prices via our own backend (and writing *values*, not formulas, into the xlsx)
4. Preserve v1 promises: no signup, no server-side persistence of user data, Bahasa Indonesia primary, desktop-first

### 2.2 Non-Goals (explicitly NOT in v2)

- Order execution / brokerage integration
- Tax (PPh, capital gains) — defer to v3
- Backtesting, screeners, analyst content — out of scope forever
- Goal planning beyond accumulation targets (e.g. retirement calculators) — defer to v3
- Multi-portfolio / household sharing — defer to v3
- Native mobile — defer to v3
- US stocks, international equities — defer to v3
- Real-time intraday tick data — 15-minute delayed (same as user's current xlsx) is fine

---

## 3. The Core Loop — xlsx as Canonical State

> **The single most important architectural decision in this PRD.**

The xlsx is **not an export artifact**. It is the **canonical, portable representation of the user's data**. The web app is a friendlier UI on top of it.

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│   FIRST SESSION:                                                      │
│      Empty form → fill in → [Download .xlsx] → file on disk           │
│                                                                       │
│   RETURN SESSION (n+1):                                               │
│      [Import .xlsx] → file parsed → web populated → edit →            │
│         → [Download .xlsx] → overwrites previous file on disk         │
│                                                                       │
│   ZERO SERVER-SIDE STATE FOR USER DATA AT ANY POINT.                  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.1 Why this matters

- **No accounts, no logins, no leaks** — the trust pitch from v1 holds, but now with continuity
- **User owns their data, physically** — xlsx on disk, in Drive, in iCloud, wherever they choose
- **Power-users keep escape hatch** — can open xlsx in Excel/Sheets and do their own thing
- **Schema evolution is portable** — we version the file (`pwp_schema_version`), migrations run on import
- **Backup / multi-device is solved without us building sync** — user copies the file

### 3.2 Trade-off being made

You lose: zero-friction multi-device, autosave continuity, sharing.
You gain: privacy story, zero-cost infrastructure, user control, no auth surface to attack.

This is the v1 wedge made *operational* instead of *aspirational*.

---

## 4. User Flow

### 4.1 First-time user
1. Lands on page → sees "Mulai Baru" + "Import .xlsx kamu" side by side
2. Picks "Mulai Baru" → empty form with empty dashboard
3. Fills in data across tabs (Aset / Cashflow / Utang / Target)
4. Dashboard updates live
5. Clicks "Download .xlsx" → file saves
6. Closes tab

### 4.2 Returning user
1. Lands on page → sees same two CTAs
2. Picks "Import .xlsx" → drag-drop or file picker
3. App validates schema version, reads `_meta` sheet, reconstructs state, hydrates form + dashboard
4. User makes changes
5. Downloads xlsx (same filename pattern → overwrite the previous file)

### 4.3 Edge cases
- **Import schema mismatch:** show diff, run migration if available, refuse if too old
- **Import corrupted file:** specific error, offer "Mulai Baru" as fallback
- **Import partial / hand-edited xlsx:** read what we can, flag fields we couldn't parse, never silently drop data

---

## 5. Functional Requirements

### 5.1 Aset Module — extended

**Liquid Assets**
| Type | Input | Auto-Calculated | Live Source |
|---|---|---|---|
| Kas / Tabungan | Amount + currency (IDR/USD) | IDR if USD | USD→IDR live |
| Deposito | Amount IDR | — | — |
| Logam Mulia (Cadangan) | **Grams** | **IDR = grams × live IDR/gr** | Pegadaian gold proxy |
| Logam Mulia (Tertahan) | **Grams pawned (Gadai)** | **Net IDR = (Cadangan − Tertahan) × price** | (see Gadai §5.3) |
| Saham | **Emiten + Lots + Price/lembar** | **Equity = Lots × 100 × price** | IDX proxy (replaces GOOGLEFINANCE) |
| Reksa Dana | RD name + IDR value | — | Manual |
| SBN | Face value IDR | — | Manual |
| Crypto | Coin + qty + price (IDR) | IDR value | Manual price |

**Non-Liquid Assets** (unchanged from v1)
- Properti, Kendaraan, Dana Pensiun (BPJS / DPLK)

### 5.2 Per-Emiten Stock Accumulation Tracking (NEW)

Each saham row tracks:
- `Emiten` (ticker)
- `Lots Sekarang` (current holding)
- `Lots Target 100%` (final accumulation goal)
- `Harga Live` (auto, from proxy)
- `Valuasi = Lots × 100 × Harga Live`
- `Modal Akumulatif = Lots Target × 100 × Harga Live`
- `Target Bobot %` (manual, user's intended allocation)
- `Bobot Live %` (auto, current % of total saham portfolio)
- `Progress to Target % = Lots Sekarang / Lots Target`
- **Accumulation ladders:** Modal needed to reach 10%/30%/50%/70%/80%/100% of remaining lots
- `Avg Dividend Yield %` (manual, expected)
- `Last Dividend per Lembar (Rp)` (manual, most recent payout)
- `Potential Dividend (Rp) = Lots × 100 × Last Dividend`

**Display:** the saham tab is the heart of the product. Per-row visual progress bar (lots filled / target). Sortable by progress %, bobot gap, or modal needed.

### 5.3 Gadai (Gold-Backed Lending) Module (NEW)

Indonesian-specific. Users pawn gold to fund stock purchases. The module tracks:

| Field | Definition |
|---|---|
| `Berat Cadangan Emas` (gram) | Total gold owned |
| `Emas Tertahan` (gram) | Gold currently at pawnshop |
| `Piutang Gadai` (IDR) | Outstanding loan principal |
| `Interest Rate` (%/month) | Pegadaian Gadai rate, default 1.5%/month |
| `Lama Tempo` (months) | Loan term |
| `Total Interest = Pokok × Rate × Tempo` | Auto |
| `Total Beban = Pokok + Interest` | Auto |
| `Defisit per Bulan = Total Beban / Tempo − Kemampuan Bayar` | Auto |

**Why this matters:** if a user has Tertahan > Cadangan-buffer, they're at risk of forced sale. The dashboard should surface a warning badge.

### 5.4 Cashflow Module (carried from ide_1)

- Salary
- Estimated Dividend Income (Mode A yield-based / Mode B per-emiten — from ide_1 §4.2.1)
- Other income

Expenses: Fixed + Variable (unchanged).

### 5.5 Dashboard & Metrics — extended

Keep the v1 four (Net Worth, DSR, Runway, Savings Rate) — they remain useful. Add:

| Metric | Formula | Why |
|---|---|---|
| **Modal Siap Distribusi** | `Cash + RD + Aset Lain − Piutang` | "How much can I deploy right now?" |
| **DAR (Debt-to-Asset)** | `Total Piutang ÷ Total Aset Kotor` | Solvency |
| **DER (Debt-to-Equity)** | `Total Piutang ÷ Total Aset Bersih` | Leverage |
| **Safe Haven Ratio** | `(Emas + Cash + RD) ÷ Total Aset` | Risk posture |
| **Productive Ratio** | `(Saham + Aset Lain) ÷ Total Aset` | Growth posture |
| **Allocation Discipline** | `Σ \|Bobot Live − Target Bobot\|` per saham | Drift indicator |

**Threshold copy** (Indonesian, casual):
- DAR < 20% & DER < 50% → "💎 Sangat Aman (Investor Grade)"
- Safe Haven > 60% → "🛡️ AMAN (Safe Haven Dominan)"
- Safe Haven 40–60% → "⚖️ Seimbang"
- Safe Haven < 40% → "🚀 Agresif (Produktif Dominan)"

### 5.6 Visualization
- **Allocation Donut** (carried from v1) — by category
- **Per-emiten progress bars** — horizontal bar per stock showing lots filled / target
- **Safe Haven vs Produktif** — single stacked bar with target line
- (Deferred to v3: Sankey, historical timeline)

### 5.7 Export & Import (xlsx round-trip)

**Export — sheets generated:**
| Sheet | Purpose |
|---|---|
| `Summary` | Human-readable: net worth, all metrics, allocation %, Gadai status |
| `Stocks Progress` | One row per emiten, mirroring `Aset Tracker.xlsx` Stocks Progress |
| `Stocks Check Point Data` | Accumulation milestones per stock (2.5–95%) |
| `Data Modal` | Aset/Beban summary, mirroring user's existing layout |
| `Debt Detail` | Gadai detail by tempo |
| `Next Target` | Per-stock lot gap + modal needed |
| `CashFlow` | Income / expense / liabilities |
| `_meta` (hidden) | Schema version + JSON state for round-trip |

**Critical:** sheets use **values, not formulas.** Re-import reads values. Web app re-computes derived fields on load. This means the xlsx works fine even when opened on a machine that can't run GOOGLEFINANCE.

**Import — flow:**
1. User drops `.xlsx` file
2. App reads `_meta.A1` → checks `pwp_schema_version`
3. If supported: parses `_meta.B3` (full JSON state) → hydrates
4. If older version: runs migration chain → hydrates
5. If hand-edited or unrecognized: parses readable sheets best-effort, flags missing fields to user
6. If completely incompatible: errors out, suggests "Mulai Baru"

---

## 6. Live Price Proxy Architecture

Replaces the user's GOOGLEFINANCE / IMPORTDATA scrapers.

| Data | Source candidate | Cache TTL | Fallback |
|---|---|---|---|
| IDX equity prices | Goapi.id / IDX official / Stockbit unofficial (TBD §9) | 15 min | Last known value + stale badge |
| USD → IDR | exchangerate.host | 1 hour | Last known + stale badge |
| Gold per gram | Pegadaian scrape | 1 hour | Manual override field |

**Privacy:** all calls proxied through our own Go backend (this repo). User IP never sent to third-party APIs. **No user portfolio data ever sent over the wire** — backend only knows "someone asked for BBCA price."

---

## 7. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Platform | Web, desktop-first, responsive-tolerated mobile |
| Browser support | Latest Chrome, Safari, Firefox, Edge |
| Language | Bahasa Indonesia primary; English in v3 |
| Performance | Dashboard recalculation <300ms with full 25-stock portfolio |
| Privacy | No user financial data leaves the browser. Only price-fetch calls go to backend, with no user payload |
| Persistence | None server-side. Optional `localStorage` autosave with explicit opt-in (deferred to v3) |
| Accessibility | WCAG AA, keyboard-navigable, tabular figures for all numbers |
| Analytics | Page-level only via Plausible-style tool |

---

## 8. Data Model / xlsx Schema (v2)

`_meta` sheet (hidden):
| Cell | Value |
|---|---|
| A1 | `pwp_schema_version` |
| B1 | `2` |
| A2 | `exported_at` (ISO timestamp) |
| A3 | `data_json` (full state, JSON-stringified) |
| A4 | `source` (`web-app-v2` or `manual-edit`) |

`Stocks Progress`:
`No, Emiten, Lot Sekarang, Lot Target 100%, Harga Live, Valuasi, Modal Akumulatif, Target Bobot %, Bobot Live %, Progress %, Avg Div Yield %, Last Div/lembar, Potential Div`

`Data Modal`:
`Kategori, Deskripsi, Nilai` (mirroring user's layout — Aset / Beban / Target / Progress sections)

`Debt Detail` (Gadai):
`Item, Pokok, Tempo, Interest Rate, Total Interest, Total Beban, Sisa Pinjaman`

`Next Target`:
`No, Emiten, Target Lot, Kekurangan Lot, Modal Dibutuhkan`

`CashFlow`:
`Section, Label, Amount IDR`

`Summary`: display-only; not re-import source.

---

## 9. Success Metrics

**Launch criteria (v2 is "done" when):**
- A new user can complete asset entry + download xlsx in <15 min
- A returning user can import xlsx and resume in <30s
- All v1 metrics + 6 new metrics (§5.5) render correctly across 15 test scenarios
- xlsx round-trip preserves 100% of state (export → import → re-export → diff = 0)
- Lighthouse performance ≥85 with 25-stock portfolio loaded

**Post-launch (first 90 days):**
- 200+ unique visitors complete the download action
- ≥50 visitors successfully import a previously-exported xlsx (round-trip proof)
- 10+ Reddit r/finansial / Twitter mentions
- Time-on-page p50 ≥6 min

---

## 10. Open Questions

1. **IDX live-price source** — Goapi.id (paid), Stockbit unofficial (ToS risk), or scrape IDX directly? Need to confirm cost + legality before locking architecture.
2. **Gold source** — confirmed Pegadaian, but their HTML scrape was the fragile point of the user's xlsx. Need official-ish endpoint or robust scrape.
3. **Schema migration tooling** — when v2 → v3, we need a migration framework. Pick a strategy now or defer?
4. **Multi-portfolio support** — user has only one xlsx now, but if v3 adds household / shared, schema must support multiple portfolios per file. Worth designing in now or later?
5. **Dual dividend methodology** — user's xlsx tracks both "Avg Yield Potential" and "Last Yield." Show both, or pick one? (Recommend: show both, label them clearly.)
6. **Gadai warning thresholds** — at what Tertahan-to-Cadangan ratio do we show a red warning? Field expertise needed.
7. **"Andi" downgrade mode** — should v2 ship with a simplified "Lite" view that hides accumulation/Gadai/etc.? Or trust users to leave those tabs empty?

---

## 11. Roadmap (Post-MVP)

**v3 (target Q4 2026)**
- Historical snapshots (read multiple xlsx files → timeline)
- Goal tracking ("hit Target Bobot for BBCA by 2027-Q2")
- Sankey cashflow diagram
- localStorage opt-in autosave
- English language toggle
- Mobile-optimized layout

**v4+ (exploratory)**
- US stocks (yfinance proxy)
- Tax estimator (PPh21, capital gains, dividend tax)
- Read-only shareable links (explicit user action, ephemeral token)
- Broker integration via *manual statement upload* (not API)

---

## 12. Notes for the Designer (Round 2 brief lives in ide_1/)

The Round 2 feedback in `ide/ide_1/stitch_personal_wealth_ide_1/design_review_round_1.md` still stands. v2 adds:

- A **fourth tab** in the input panel: "Target" (or "Akumulasi") for per-stock target lots & bobot
- A **Gadai** sub-section under Utang tab
- The dashboard gets **2 new metric cards** (Modal Siap Distribusi, Safe Haven Ratio) — place near the existing 4
- New screen state: **Import flow** — drag-drop zone, schema check, hydration progress
- New screen state: **Per-stock detail row** — expanded view showing accumulation ladders

The brand "Zenith Wealth" still works (it's premium enough to land with Bayu, not too elite for Andi).
