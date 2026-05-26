# Design Review — Zenith Wealth Round 3 (Studio output)

**From:** Product
**To:** Designer / Studio
**Date:** 2026-05-25
**Status:** Feedback for Round 4 revisions
**Files reviewed:** 10 screens — 6 new (Entry Choice, Empty State, Import Hydration, Migration Diff Modal, Negative Net Worth, Stale Price) + 4 revised (Aset Saham v3, Akumulasi Plan v3, Asset Details v3, Cashflow Tab v3) + updated `zenith_wealth/DESIGN.md`
**References:**
- Round 1 feedback: `../../ide_1/stitch_personal_wealth_ide_1/design_review_round_1.md`
- Round 2 feedback: `../stitch_personal_wealth_studio/design_review_round_2.md`

---

## TL;DR

Studio implicitly accepted **Option A (dark mode / terminal aesthetic)** and built on it. Most Round 2 P0/P1 items are fixed and 4 of 6 missing screens are delivered. Substantial progress.

However, Round 3 introduces **4 new P0 issues**, including one that pulls back into the prescriptive-advice territory we explicitly flagged in Round 2. The persistent sidebar-label inconsistency is now in its third round unresolved.

**Status:** the product is close. With the 4 new P0s fixed + the missing screens delivered, Round 4 should be ready for engineering handoff.

Please prioritize: **P0 → missing screens → P1 → P2**.

---

## Brand decision — implicitly resolved

Round 2 review opened with a forced decision: A (accept terminal) / B (revert to forest green) / C (hybrid). Studio shipped Round 3 fully committed to **Option A**, and the aesthetic is now coherent across most screens. PM accepts.

**Implication:** the v1 + v2 design guidelines (`ide_1/.../personal-wealth-platform-design-guidelines.md` and `ide_2/personal-wealth-platform-design-guidelines.md`) need a color-system update to reflect the new palette (deep navy `#051424` + gold `#e8c444` + emerald accents). That's a PM action, not a designer action — flagging for awareness.

---

## What Studio FIXED — give credit ✓

| Round 2 issue | Status |
|---|---|
| **P0-1** OJK / financial-advice copy | ✅ **Fixed** on Aset Saham + Akumulasi + Asset Details. "Saran" panels renamed *"Simulasi"* / *"Terminal Status"* — purely descriptive. Disclaimer footer added: *"Analisis berdasarkan data kamu sendiri. Bukan saran investasi — selalu konsultasi profesional."* |
| **P0-2** Collapsed stock rows showed literal "Collapsed" text | ✅ **Fixed.** BMRI/ASII/BBNI now display real lots, bobot, live price in collapsed state |
| **P0-3** English mid-Indonesian | ✅ **Mostly fixed.** "DONE" → *"✓ SELESAI"*, "Spread/Fokus" → *"Sebar/Fokus"*. (Year typo still present on one screen — see P1-2 below) |
| **P1-3** DSR threshold copy bug ("Waspada" at 12.4%) | ✅ **Fixed.** 12.4% now correctly shows *"Sehat"* (green) |
| **6 missing screens** | 4/6 delivered: Entry Choice ✓, Empty State ✓, Import Hydration ✓, Migration Diff ✓, Negative Net Worth ✓, Stale Price ✓ |

Particularly strong work:

- **Import Hydration modal** — itemized log (*"Memuat 14 saham, 5 cadangan emas, 1 KPR, 7 pengeluaran tetap..."*) with the *"Local-Only Mode · Data tidak dikirim ke server"* footer is exactly the trust-building flow we asked for.
- **Migration Diff modal** — clear side-by-side v1 → v2 with green `+` highlights for new fields (Target Lot, Gadai Detail). The *"Batal / Konversi ke v2"* CTAs are well-balanced.
- **Stale Price state** — yellow banner + retry CTA + inline manual override field — all three escape hatches in one screen.
- **Empty State** — *"MULAI DARI SINI ↑"* nudge with primary-color CTA is sharp.

---

## P0 — Must fix before Round 4 ships

### P0-1. "Saran Sistem" on Negative Net Worth pulls back into financial advice

**Where:** Negative Net Worth v3 screen — "Saran Sistem: Restrukturisasi Diperlukan" panel.

**Current copy:**
> *"Likuiditas lebih besar dari aset. Fokus pada **penjualan utang berbunga tinggi (Kartu Kredit & Pinjol) terlebih dahulu**. Pertimbangkan **likuidasi Reksadana untuk menutup utang konsumtif**."*

**Problem:** This is prescriptive advice — names specific debt instruments to pay first (Kartu Kredit, Pinjol), names a specific asset class to liquidate (Reksadana). Exactly what we asked you not to do in Round 2 P0-1. The fix was applied successfully on Asset Details and Akumulasi screens, then re-introduced here.

**Required fix:** Rewrite as descriptive observation only.

**Suggested copy:**
> *"DAR berada di zona defisit (aset bersih negatif). Lihat komposisi utang dan aset likuid di panel kanan untuk evaluasi prioritas."*

Or even tighter:
> *"Aset bersih negatif: utang melebihi aset. Periksa komposisi utang & likuiditas di panel kanan."*

**Rule of thumb (repeated from Round 2):** if the panel suggests *what to do*, rewrite to show *what is*. The user does the inference, not us.

### P0-2. Cashflow Breakdown donut STILL renders as rotated diamond/square

**Where:** Cashflow Tab v3 — "CASHFLOW_BREAKDOWN" donut.

**History:** This bug has now appeared in **three consecutive rounds**:
- Round 1: Utang tab donut → diamond
- Round 2: Cashflow donut → diamond
- Round 3: Cashflow donut → still diamond

The Akumulasi screen's "Komposisi Portfolio Saat Ini" donut renders **correctly as a circle** (Round 2 ✓, Round 3 ✓). That's the component to use everywhere.

**Required fix:** replace every donut instance in the product with the working circular component from Akumulasi. Audit all screens for stray diamond donuts.

### P0-3. Cashflow Tab v3 crosses from "terminal" into "developer roleplay"

**Where:** Cashflow Tab v3 screen.

**What landed:**
- Header: `CASHFLOW.EXE`
- Subtitle: *"Monitoring incoming/outgoing streams"* (English)
- File-path display: `/root/data/canonical.json`
- Tab labels in brackets: `[01] ASET`, `[02] CASHFLOW`, `[03] UTANG & GADAI`, `[04] AKUMULASI`
- Wordmark prefix: `> ZENITH_WEALTH`
- Metric labels in snake_case CAPS: `NET_WORTH`, `SAVINGS_RATE`, `DEBT_SERVICE_RATIO`, `LIQUID_CAPITAL`, `ALLOCATION (SAFE:PROD)`, `CASHFLOW_BREAKDOWN`

**Problem:** This is no longer a Bloomberg Terminal aesthetic — it's **Linux server / hacker-movie roleplay**. Real financial professionals never see `.EXE` extensions, `/root/` paths, or `[01]` bracket numbering. Those signals belong to a different context (terminal emulators, dev tools) that don't fit a wealth platform.

The other v3 screens (Aset Saham, Akumulasi, Asset Details) got the terminal aesthetic *right* — refined, professional, dense, with proper labels. Cashflow needs to be pulled back to match those.

**Required fix:**
- Drop the `.EXE` from the screen title (just *"Cashflow"*)
- Drop the `/root/data/canonical.json` file path
- Drop the `[01]` bracket numbering on tabs
- Drop the `>` prompt prefix on the wordmark
- Replace snake_case labels with proper labels: *"Net Worth"*, *"Savings Rate"*, *"DSR"*, *"Modal Siap Distribusi"*, *"Alokasi Safe Haven vs Produktif"*, *"Breakdown Cashflow"*

Keep the monospaced data tables, dark navy surface, gold accents, and dense layout. Those are working.

### P0-4. "Anda" formal voice regression on Asset Details footer

**Where:** Asset Details v3 — footer.

**Current:** *"Data Anda tetap sepenuhnya lokal di peramban Anda."*

**Problem:** Throughout Rounds 1, 2, and 3 we've held the line on **casual "kamu" register, never "Anda."** Three other screens in Round 3 use the correct version: *"Data kamu tetap di komputer kamu sendiri."* This is the single most important trust string in the product — it cannot be inconsistent.

**Required fix:** Lock one phrasing — *"Data kamu tetap di komputer kamu sendiri"* — as a component string. Use it everywhere.

---

## P1 — Should fix this round

### P1-1. Sidebar identity badge — STILL inconsistent across 3 rounds

This is the third consecutive round flagging the same issue. Across the 10 Round 3 screens there are at least 4 different label variants:

| Variant | Screens |
|---|---|
| `BAYU · LOCAL DATA ONLY` (uppercase) | Aset Saham v3, Asset Details v3 |
| `Bayu · Local Data Only` (titlecase) | Akumulasi v3 |
| `Canonical File · Local-Only Mode` | Empty State v3, Negative Net Worth v3 |
| `CanonicalFile · Local-Only Mode` (no space) | Stale Price v3 |

**Required fix:** Lock **one** label as a shared component. Recommended:

> `Bayu · Local Data Only`

Apply across every sidebar. This is a Figma component-level fix — not 10 individual edits.

### P1-2. Akumulasi v3 still shows © 2024 (third round, third reminder)

Asset Details v3 has the correct *"© 2026 Zenith Wealth"*. Akumulasi v3 still shows *"© 2024 Zenith Wealth"* in the sidebar footer. Same component, two different values. Lock it.

### P1-3. Dual-mode dividend — toggle visible but incomplete

**Where:** Cashflow Tab v3 — Penghasilan section.

The toggle is now visible (`MODE: AUTO` badge with `Toggle Manual` switch). Good. But:
- **No mock of Mode B (manual)** — when the toggle is flipped, what does the per-emiten dividend table look like? Pre-populated rows? Editable per-stock dividen-per-lembar input? We spec'd it; we need to see it.
- **Asset Details v3** still only shows *"AVG YIELD Y/Y 4.2%"* — the dual methodology (avg yield + last dividen per lembar) from the original xlsx isn't surfaced on the per-stock detail.

**Required:** One additional mock — Cashflow Tab with toggle flipped to Manual, showing the per-emiten dividen detail table.

### P1-4. Still missing screens (Round 2 ask, deferred to Round 4)

Round 2 listed 6 missing-screen categories. 4 delivered, **2 still outstanding**:

- [ ] **Mobile layout** — at least one representative screen at <768px
- [ ] **Remaining import error states** — corrupted file (unreadable), hand-edited warning (with missing-fields list). The Migration Diff covers the happy v1→v2 migration; we still need the failure paths.
- [ ] **API failure edge state** — total upstream price-feed failure (not just stale). Banner copy: *"Gagal ambil harga emas dan saham. Pakai harga manual untuk sementara?"*
- [ ] **Zero income edge state** — DSR / Savings Rate showing "—" with tooltip, while Net Worth and Runway compute normally

### P1-5. Negative Net Worth screen — minor copy issue

The screen is otherwise strong. Beyond the P0-1 advice rewrite, two minor strings need a pass:

- DAR card label: *"4.53× ▲ +0.5 Bahaya"* — the *"Bahaya"* threshold copy is correct, but the *"▲ +0.5"* delta is unclear. Delta from what? (No history.) Either show a baseline reference or drop the delta arrow.
- *"Buku Besar"* as the page title — accurate accounting term but might read formal. Consider *"Ringkasan Posisi"* or just *"Posisi Keuangan"*. PM call.

---

## P2 — Worth noting / decide on

| Observation | Where | Recommendation |
|---|---|---|
| **"Terminal Status" panel** with `[SYS_OK]` / `[STATUS]` log lines | Aset Saham v3 | **Keep.** Descriptive, fits the aesthetic, no prescriptive language. |
| **"Estimasi Kekayaan Bersih"** label for Net Worth (vs. "Net Worth Kamu" on Aset tab) | Asset Details v3 | Both are valid — but **pick one label and use globally**. Recommend "Net Worth" (terminology) on the dashboard hero, "Estimasi Kekayaan Bersih" only where the figure is computed from non-realized values (dividend estimates etc.). |
| **DAR "DEFISIT" badge** | Negative Net Worth v3 | **Keep.** Useful framing. |
| **DAR delta arrow** (*"▲ +0.5"*) without baseline | Negative Net Worth v3 | **Cut for v2.** No history = misleading. (See P1-5 above.) |
| **File path display** `/root/data/canonical.json` | Cashflow Tab v3 | **Cut.** Already covered in P0-3. |

---

## Deliverables expected in Round 4

| # | Item | Format | Notes |
|---|---|---|---|
| 1 | All 4 P0 fixes applied | Updated mocks | **Non-negotiable** |
| 2 | Sidebar identity label locked as shared component | Figma component | P1-1 |
| 3 | Year (© 2026) locked as shared component | Figma | P1-2 |
| 4 | Cashflow Tab — Mode B (manual dividend) mock | New mock | P1-3 |
| 5 | Asset Details — dual yield methodology displayed | Updated mock | P1-3 |
| 6 | Mobile layout — 1 representative screen (≤768px) | New mock | P1-4 |
| 7 | Import error — corrupted file state | New mock | P1-4 |
| 8 | Import error — hand-edited warning with missing-fields list | New mock | P1-4 |
| 9 | API failure edge state | New mock | P1-4 |
| 10 | Zero income edge state | New mock | P1-4 |
| 11 | All donut instances replaced with circular component | Audit + updates | P0-2 |
| 12 | Cashflow Tab pulled back from `.EXE` / `/root/` aesthetic | Updated mock | P0-3 |
| 13 | Microcopy doc: revised Negative Net Worth panel + locked privacy footer string | Markdown, PM-reviewed | P0-1, P0-4 |

---

## Notes on process

Studio is getting consistently better at executing on feedback, and Round 3 fixed a lot. Two recurring patterns to address before Round 4:

1. **One-shot bugs vs. component bugs.** The donut shape, sidebar label, and year typo have all been flagged before because they were fixed *on one screen* but not *as a Figma component*. Round 4 should treat these as component-level fixes: lock once, propagate.

2. **Aesthetic drift between screens.** Aset Saham v3, Akumulasi v3, Asset Details v3, and Stale Price v3 all share the same refined dark-mode language. Cashflow Tab v3 jumped to a different aesthetic (developer/CLI roleplay), and Empty State + Negative Net Worth use yet a third label convention. Before Round 4 finalizes, do a **one-screen audit pass** to ensure all screens read as the same product.

If anything in this feedback is unclear or you want to push back, please raise it before starting Round 4 — we're close enough that a single more focused pass should be the last one.
