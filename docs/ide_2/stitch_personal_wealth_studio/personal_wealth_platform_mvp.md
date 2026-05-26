# Personal Wealth Platform — MVP Concept Brief (v2, ide_2)

**Status:** Concept
**Last updated:** 2026-05-25
**Companion doc:** `personal-wealth-platform-prd.md` (full PRD, this folder)
**Origin:** Combines the privacy-first wedge from `ide/ide_1/personal-wealth-platform-mvp.md` with the workflow patterns in the user's existing `Aset Tracker.xlsx`

---

## The product, in one sentence

**A privacy-first web app that replaces your `Aset Tracker.xlsx` — same fields, same xlsx round-trip, but a UI that doesn't break when GOOGLEFINANCE goes down.**

## The user's actual workflow today (observed)

The user maintains an xlsx (`Aset Tracker.xlsx`, ~5 sheets, ~50 formulas) that tracks:
- 14+ IDX stocks with per-emiten target lots and accumulation progress
- Gold reserves (Cadangan) and gold currently pawned (Tertahan)
- Gadai (Pegadaian gold loans) with monthly interest + tempo
- Cash, Reksa Dana, and other productive assets
- Safe Haven (gold + cash + RD) vs Productive (saham + lain) ratio
- Capital deployment ladders per stock (10/30/50/70/80/100% accumulation paths)
- Dividend yield in two methods: average expected + last actual

Live prices come from `GOOGLEFINANCE("IDX:" & ticker)` and `IMPORTDATA("https://sahabat.pegadaian...")`. Both are fragile: they fail silently, can't be opened outside Google Sheets, and leak the schema if shared.

## Why a web app, not just a better spreadsheet

| Pain (today) | Web app solution |
|---|---|
| GOOGLEFINANCE breaks on offline / re-share | Backend proxy fetches & writes *values* into the xlsx |
| Can't open meaningfully on mobile | Responsive layout, read-only mobile view |
| Visualizing accumulation gap = pivot table gymnastics | Built-in per-emiten progress bars |
| Sharing the file leaks the formula logic | Web app has no shared logic to leak |
| Schema drift across versions | Versioned xlsx schema with migrations |
| Onboarding a friend = copy-paste a 1MB file | Onboarding = open URL, import their own xlsx |

## The wedge

> **Privacy-first means your data lives in your xlsx, on your disk. The web app is just a friendlier renderer.**

- No login. No account. No server-side persistence.
- Live prices proxied through our backend — but **no user data ever leaves the browser**.
- xlsx is the canonical state. Import → use → export → close tab. Every session.

This is the v1 promise made *operational*: continuity through user-owned files, not server-side accounts.

## Why this differs from v1 (ide_1)

The v1 MVP targeted **Andi** — casual professional, wants a 10-minute net-worth check, downloads once.

v2 targets **Bayu** — sophisticated retail investor, runs an accumulation thesis, returns weekly to track progress, *re-imports* their previous xlsx each time.

**Andi is a subset of Bayu.** If we build the v2 features and let Andi leave the advanced tabs empty, we serve both with one product. If we build v1 first, we'll have to rebuild for Bayu anyway because **Bayu is the actual user** (you are Bayu).

## Minimum lovable v2 (12-week build)

| Week | Milestone |
|---|---|
| 1–2 | Backend price proxy (IDX, USD/IDR, gold) — most fragile dependency, ship it first |
| 3–4 | Input form: Aset Likuid + Saham per-emiten with target lots |
| 5 | Cashflow + Utang (incl. Gadai sub-module) |
| 6 | Dashboard: 4 v1 metrics + 6 v2 metrics + allocation donut |
| 7 | Per-emiten accumulation progress bars |
| 8 | xlsx **export** — value-only, all 8 sheets, schema v2 |
| 9–10 | xlsx **import** — parse `_meta`, hydrate state, handle hand-edited files gracefully |
| 11 | Empty/partial/edge states, microcopy pass with PM |
| 12 | Beta with 5 testers from r/finansial, fix top issues |

## What's explicitly NOT in v2

- User accounts
- Server-side storage
- Brokerage / bank integration
- Tax (PPh, capital gains)
- Portfolio recommendations / screeners
- Historical snapshots (planned for v3 — import multiple xlsx → timeline)
- Mobile-native app
- US equities
- Real-time intraday tick data
- Sharing / household / multi-portfolio per file
- localStorage autosave (defer until users actually complain)

## Open strategic questions (covered in PRD §10)

1. IDX live-price source: paid API, scrape, or unofficial endpoint?
2. Gold price: keep Pegadaian scrape or find official feed?
3. Should we ship a "Lite" mode for Andi, or trust the empty-state to handle it?
4. Dual dividend methodology: show both, or simplify to one?
5. Gadai warning thresholds — need domain expertise to set red-line ratios.

## What this is not trying to be

- **Not Stockbit.** No order execution, no community, no analyst content.
- **Not Bibit.** No investment recommendations, no risk profiling questionnaire.
- **Not Mint.** No bank linking, no auto-categorization.
- **Not a spreadsheet replacement for everyone.** This is for users who already maintain a tracker. If you don't, this isn't your tool yet.

The bet: **the existing-tracker-maintainer is a small but real market, with extremely high willingness to switch** if we honor their workflow.
