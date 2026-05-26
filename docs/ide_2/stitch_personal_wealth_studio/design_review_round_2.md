# Design Review — Zenith Wealth Round 2 (Studio output)

**From:** Product
**To:** Designer / Studio
**Date:** 2026-05-25
**Status:** Feedback for Round 3 revisions
**Files reviewed:** 6 screens (Aset Saham, Akumulasi Plan, Expanded Asset Details, Utang & Gadai, Cashflow Tab, Cashflow Scrolled View) + `zenith_wealth/DESIGN.md`
**Reference:** Round 1 feedback at `../../ide_1/stitch_personal_wealth_ide_1/design_review_round_1.md`

---

## TL;DR

Round 2 made **one major brand pivot** (dark mode / Bloomberg Terminal aesthetic) that contradicts our existing design system. Before any tactical fixes, we need an explicit PM decision on whether to accept this pivot — everything else cascades from it.

Outside the brand pivot, Round 2 is **a real step forward**: Net Worth hierarchy is fixed, the Akumulasi tab works, Gadai is well-modeled, and the sidebar nav is a strong choice. But there are 3 P0 issues (one of them legal/OJK), 6 P1 issues, and 6 missing screens that must be delivered in Round 3.

Please prioritize: **Brand decision → P0 → P1 → missing screens → P2**.

---

## ⚠️ Before reading anything else — the brand pivot decision

Round 1 was approved with a **warm off-white (`#F8F9F5`) + forest green (`#1B4332`)** palette. The Round 2 design system is **deep navy (`#051424`) + gold (`#e8c444`)** — a Bloomberg Terminal aesthetic. Studio's own `DESIGN.md` explicitly frames this as *"moving away from 'fintech-lite' toward a professional financial terminal aesthetic."*

This directly contradicts:
- Our anti-pattern list (crypto/tradfi dark-mode was explicitly called out as DON'T)
- The "Calm, not gamified" principle
- The approved v1+v2 design system

**It is, however, a defensible argument.** Bayu (the v2 persona) is sophisticated and executes deliberate accumulation — a Bloomberg vibe fits the workflow better than an Apple Health vibe.

| Option | Implication |
|---|---|
| **A. Accept terminal aesthetic** | Update design-guidelines.md (color, anti-patterns), retire ide_1 mocks, Round 3 builds on this palette |
| **B. Reject and revert to forest green / off-white** | Round 3 redoes color across all 6 delivered screens + missing ones |
| **C. Hybrid (light default + dark toggle)** | Adds scope; v2 guidelines explicitly excluded dark mode — would need to renegotiate v2/v3 boundary |

**PM recommendation: Option A.** The terminal aesthetic actually serves Bayu's job better than the warm minimalist would. Bayu is operating a portfolio, not journaling about money. We should accept the pivot and update our docs.

**Studio: do not start Round 3 until this is resolved.** Everything below assumes the answer; if PM picks B or C, several P1/P2 items become moot.

---

## What's working — keep doing this ✓

| Area | Why it works |
|---|---|
| **Sidebar nav** (replaces top tabs) | Better information density for a power-user workflow; persistent "Bayu · Local Data Only" identity badge becomes a constant trust signal |
| **Net Worth hierarchy** | Round 1 P0-2 issue is **resolved**. Net Worth now dominates the dashboard with 48px tabular numeric in gold. Hero/supporting ratio is right. |
| **Akumulasi screen — color-coded left borders** (red / amber / green per stock) | Instant visual sort of "which positions are most behind target." This is the killer pattern of the screen. |
| **Milestone ladder with execution states** (DONE / BELI / pending) | Action-oriented — turns the spreadsheet's static "ladder" into an executable plan. Exactly what Bayu needs. |
| **Gadai three-bar visualization** (Cadangan / Tertahan / Free) | Clear story of gold liquidity at a glance. Status fisik framing is sharp. |
| **"Local Data Only" persistent badge** | Trust pitch reinforced across every screen, not just the footer. |
| **P/L column on Top 5 Holdings** | Not in spec — but adds high-signal info for Bayu. Keep. |
| **"Health Dashboard" framing on Utang tab** | Clearer than just listing debts. Renders solvency as a single composite view. |
| **Live Sync badge on Komposisi Portfolio** | Reinforces live-price story without being noisy. |

---

## P0 — Must fix before Round 3 ships

### P0-1. "Analisa Terminal" and "Rekomendasi Tindakan" panels cross into financial advice

**Where:** Expanded Asset Details screen, and Utang & Gadai screen.

**Current copy (Expanded Asset Details):**
> *"Bobot BBCA saat ini mendominasi 53% portofolio saham. Pertimbangan untuk merealisasikan sebagian profit (TP 10%) untuk diputar ke TLKM guna menurunkan Avg Price, atau menambah cadangan Kas."*

**Problem:** This recommends a specific ticker rotation (BBCA → TLKM) with a target profit percentage. In Indonesia, this kind of statement borders on OJK-regulated investment advice. We are not a licensed advisor.

**Required fix:**
- Strip all directional / prescriptive language (*"Pertimbangkan rotasi..."*, *"realisasikan profit..."*)
- Make panels descriptive only (*"Bobot BBCA 53% — di atas target 20% (drift +33pp)"*)
- Add a persistent disclaimer footer to any opinionated panel: *"Analisis berdasarkan data kamu sendiri. Bukan saran investasi — selalu konsultasi profesional."*
- Apply the same treatment to the "Rekomendasi Tindakan" panel on Utang screen.

**Rule of thumb for Round 3:** if a panel suggests *what to do*, rewrite it to show *what is*. The user does the inference, not us.

### P0-2. Collapsed stock rows show literal placeholder text "Collapsed"

**Where:** Aset Saham screen — BMRI, ASII, BBNI rows.

**Current state:** the rows display the ticker followed by the literal word *"Collapsed"* and a chevron. That is mockup placeholder text, not a real collapsed-state design.

**Required collapsed state** (per design guidelines §8.12):
- Single row, ~56–72px tall
- Ticker · `Lots: X / Y (Z%)` · progress bar · `@Rp …` LIVE · `Bobot live (target ●)`
- All info present, just condensed
- Reuse the layout from the expanded row's header

### P0-3. English mid-Indonesian copy

The product is Indonesian-first. Multiple strings break this voice:

| Where | Current | Should be |
|---|---|---|
| Saran panel CTA (Akumulasi) | *"Lihat Opsi A (Spread)"* | *"Lihat Opsi A (Sebar)"* |
| Saran panel CTA (Akumulasi) | *"Lihat Opsi B (Fokus)"* | OK as-is, but verify "Fokus" reads naturally |
| Milestone ladder action column | *"DONE"* | *"✓ Selesai"* or just *"✓"* |
| Milestone ladder action column | *"BELI"* | OK — Indonesian + action. Leave. |
| Footer copyright | *"© 2024 Zenith Wealth"* | *"© 2026 Zenith Wealth"* (year typo) |

Do a full audit pass — if a string is mid-Indonesian English (other than universal terms like *Net Worth, DSR, KPR*), rewrite.

---

## P1 — Should fix this round

### P1-1. Six screens are missing

Our brief specified 12 screens. Studio delivered 6 — all "happy filled-in" states. Round 3 must deliver:

- [ ] **Landing / Entry choice** — Mulai Baru vs. Import .xlsx (the first 5 seconds of every visit)
- [ ] **Import flow — all states** — idle drop / dragging-over / validating / hydrating with item-by-item log / success
- [ ] **Import errors** — schema mismatch (with v1→v2 migration diff), corrupted file, hand-edited warning
- [ ] **Empty state** — post "Mulai Baru" before any input; nudge arrow + "—" placeholders
- [ ] **Edge states** — stale price, negative net worth, API failure, zero income
- [ ] **Mobile layout** — at least one representative screen at <768px

These were called out in design-guidelines §9 (screens 1, 7, 8, 9, 10, 11, 12). The "happy filled-in" path is only ~20% of a real user's time.

### P1-2. Dual-mode dividend UI not shown

**Where:** Cashflow screen — Penghasilan section.

**Current state:** Estimasi Dividen Saham is shown as a single line with `[ESTIMASI]` badge and `Rp 2.500.000`.

**PRD spec'd two modes:**
- **Mode A (default)** — assumed yield % field (e.g., 7%) × total equity ÷ 12
- **Mode B (manual override)** — per-emiten `Dividen per Lembar (Rp)` table, pre-populated from the stocks list

The mode toggle and Mode B detail table aren't visible anywhere. Both modes are required for Round 3.

### P1-3. DSR threshold copy is wrong ("Waspada" at 12.4%)

**Where:** Cashflow screen — DSR card.

**Current:** *"DSR 12.4% — Waspada"*

Per the v1 thresholds (still in force):
- Green <30% (*"Sehat"*)
- Yellow 30–40% (*"Waspada"* / *"Hati-hati"*)
- Red >40% (*"Bahaya"*)

12.4% must be **Sehat** (green), not Waspada (amber).

**Action:** verify threshold-to-copy wiring across ALL metric cards — this is likely a bug, not a one-off. If DSR is wired wrong, others may be too.

### P1-4. Sidebar identity badge is inconsistent across screens

- Aset Saham: *"Bayu | Local Data Only"*
- Cashflow: *"Local-Only Mode | CanonicalFile"*

Pick **one** label and use it everywhere. Recommend: *"Bayu · Local Data Only"*.

### P1-5. Saran panel placement vs. content

**Where:** Akumulasi screen — bottom "Saran berdasarkan modal tersedia" panel.

The copy is good (*"Modal kamu (Rp 200jt) bisa cover 10% akumulasi BBRI + BMRI + BBCA — atau full 30% akumulasi BMRI"*) — it shows *options*, not *recommendations*. Keep.

But the same restraint isn't applied to the Expanded Asset Details "Analisa Terminal" panel — see P0-1. Designer should align tone across both panels: **descriptive options, never directional commands.**

### P1-6. Cashflow Breakdown donut shape is rotated

**Where:** Cashflow screen — bottom right.

The donut chart for Tabungan/Kebutuhan/Variabel renders as a **rotated diamond/square** (same bug as Round 1's Utang donut). Should be circular.

Use the same circular donut component from the Akumulasi screen's "Komposisi Portfolio."

---

## P2 — Out-of-spec additions to decide on

Studio added several features that weren't requested. None are wrong — but they need product decisions before Round 3 finalizes:

| Addition | Location | PM recommendation |
|---|---|---|
| **Target Financial Independence** metric (Rp 2B / 19.2% progress) | Expanded Asset Details | **Cut for v2.** Needs a goal-setting UX we haven't designed; defer to v3 (per PRD roadmap §11). |
| **Watchlist states** (*"Wait Rp.6.900"*, *"Avg Down"*) on Portofolio Lainnya | Expanded Asset Details | **Cut.** This is a trader feature. Bayu is buy-and-accumulate, not technical. Out of scope. |
| **Live Sync badge** on Komposisi Portfolio | Akumulasi | **Keep.** Reinforces the live-price story. |
| **P/L column** on Top 5 Holdings | Akumulasi | **Keep.** High signal-to-noise for Bayu. |
| **Cashflow Breakdown donut** (Tabungan/Kebutuhan/Variabel) | Cashflow | **Keep** (once it's actually round — see P1-6). |
| **"Health Dashboard" framing** on Utang | Utang & Gadai | **Keep.** Clearer than a flat debt list. |

---

## Deliverables expected in Round 3

| # | Item | Format | Notes |
|---|---|---|---|
| 1 | Brand decision applied — color updates if Option A | All 6 existing screens + new ones | After PM picks A/B/C |
| 2 | All P0 fixes | Updated mocks | Non-negotiable |
| 3 | All P1 fixes | Updated mocks | |
| 4 | Landing / Entry choice screen | New mock | §9.1 of design guidelines |
| 5 | Import flow — 5 states | New mocks | §9.7 |
| 6 | Import error states — 3 variants | New mocks | §9.8 |
| 7 | Empty state | New mock | §9.9 |
| 8 | Edge states — stale price, negative net worth, API failure, zero income | New mocks | §9.10–11 |
| 9 | Mobile layout — 1 representative screen | New mock | §9.12 |
| 10 | Dual-mode dividend UI | New mock — Cashflow tab variant | |
| 11 | OJK disclaimer microcopy + revised descriptive panels | Markdown, PM review required | Replaces P0-1 issue |
| 12 | Component library: collapsed stock card + dropzone + migration diff modal | Figma components | |

---

## Notes on tone & process

Round 2 made bold design choices. That's good — designers who only execute briefs produce mediocre work. But two of those choices (dark mode pivot, prescriptive "Analisa Terminal") are decisions only PM can sign off on, and they shouldn't have shipped without flagging.

**For Round 3:** if you're tempted to make another bold call, **send a one-paragraph rationale to PM first** (Slack / inline comment). We'd rather discuss before you spend hours on mocks that may need to be redone.

Strong work on the new components — Akumulasi screen and Gadai panel are particularly good. Carry that momentum into the missing screens; we're closer than the open count suggests.
