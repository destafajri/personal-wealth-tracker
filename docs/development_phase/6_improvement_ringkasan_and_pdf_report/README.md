# Phase 6: Advisor-Grade PDF + Visualization & Gamification

**Branch:** `improvement-ringkasan-and-pdf-phase-2`
**Status:** ✅ COMPLETE, features FROZEN for demo
**Commits:** 20 (4 docs + 6 feat + 6 fix + 4 misc)

---

## Overview

Phase 6 transforms Cermat from a data-entry app into an advisor-grade financial health platform across three sub-phases:

| Sub-phase | Focus | Key Deliverables |
|-----------|-------|------------------|
| **6** | Advisor-Grade PDF Report | Health metrics page, recommendation engine, income breakdown, table enhancements, methodology note |
| **6.1** | Gadai Transparency | Emas per-category breakdown with "(digadaikan)" badge, Aset Likuid Tersedia card, insight enrichment |
| **6.2** | Visualization & Gamification | Cermat Score 0-1000, 5 badges, Sankey cash flow, What-If simulator, 10 demo personas, budget-kos enrichment |

---

## Phase 6 — Advisor-Grade PDF Report

### What it adds

A professional multi-page PDF that transforms snapshot data into actionable financial advice:

1. **Page 1 — Executive Summary** (enhanced): 6 metric cards + 3 charts + composite "Status Keuangan" line
2. **Page 2 — Financial Health Metrics**: 6 ratios with benchmark targets and status badges (Sehat/Waspada/Agresif/Kritis)
3. **Page 3 — Rekomendasi Distribusi Modal**: Insight statements + Modal Siap Distribusi + ranked debt-payoff options
4. **Page 4 — Income Breakdown**: User-entered + auto-estimated income (dividends, SBN/deposito interest)
5. **Page 5 — Detail Aset**: Subtotals per category + % Aset column
6. **Page 6 — Cicilan/Utang/Gadai**: Split sub-sections with subtotals
7. **Page 7 — Goals** (skip if empty): Target, current, progress
8. **Page 8 — Methodology Note**: Calculation basis for all metrics

### Key files

- `lib/pdf/metrics.ts` — Health metrics gathering, insight engine, debt ranking, income breakdown
- `lib/pdf/layout.ts` — PDF page rendering (health grid, recommendations, tables, methodology)
- `composables/usePdf.ts` — PDF generation orchestration
- `lib/finance/thresholds.ts` — Zone thresholds (shared with dashboard)

### Composite Status Keuangan logic

- All evaluated metrics Sehat → "Sehat" (green)
- Any Waspada but no Agresif/Bahaya → "Perlu Perhatian" (amber)
- Any single Agresif/Bahaya → "Agresif" (orange); 2+ → "Kritis" (red)
- Sparse data (<3 non-N/A metrics) → "Data belum lengkap" (gray)

### Debt payoff ranking (6-tier interest rate proxy)

1. KK / PINJOL / PAYLATER (>18% APR)
2. KTA / BANK_KTA (10-18% APR)
3. KPM / KKB (8-12% APR)
4. KPR (6-10% APR)
5. Utang pribadi / family (0% APR)
6. Gadai redemption (asset recovery)

Within same tier: higher monthly cicilan first (bigger DSR impact).

---

## Phase 6.1 — Gadai Transparency + PDF Polish

### What it adds

1. **Emas per-category breakdown** with "(Xg digadaikan)" badge for pawned gold
2. **"Aset Likuid Tersedia" metric card** on Page 1 (= Total Aset − tertahanGoldIdr)
3. **Insight enrichment**: Safe Haven portfolio balance insights (too defensive / too aggressive)
4. **Phase 6 v2 bug fixes**: Composite over-alarming, metric-specific zone labels, "Prepay" wording, Pensiun category, Unicode rendering

### Known limitation

Gadai handling is **emas-only**. Non-emas gadai (BPKB, sertifikat, etc.) deferred to Phase 7.

---

## Phase 6.2 — Visualization & Gamification

**Spec:** `phase-6.2-spec.md` (locked, Amendments 1-4)

### Cermat Score (0-1000)

Weighted zone scoring across 8 metrics:

| Metric | Max Points | Weight |
|--------|-----------|--------|
| Beban Cicilan (DSR) | 200 | 40% |
| Sisa Uang (Savings Rate) | 200 | 40% |
| Bisa Bertahan (Runway) | 150 | 30% |
| Rasio Utang (DAR) | 150 | 30% |
| Safe Haven | 100 | 20% |
| Progress Tujuan | 100 | 20% |
| Bantalan Kekayaan (NW vs Expense) | 50 | 10% |
| Target Alokasi Saham | 50 | 10% |

Zone scoring: sehat = full points, waspada = half, bahaya = 0.

**Level system:**

| Tier | Label | Subtitle | Icon | Score Range |
|------|-------|----------|------|-------------|
| 0 | Belum Dinilai | Mulai isi data | — | 0 |
| 1 | Bibit | Langkah Awal | 🌱 | 1-200 |
| 2 | Tunas | Tumbuh Stabil | 🌿 | 201-400 |
| 3 | Pohon | Kokoh Finansial | 🌴 | 401-600 |
| 4 | Rimbun | Hampir Mapan | 🌾 | 601-800 |
| 5 | Hutan | Mapan Finansial | 👑 | 801-1000 |

**Key edge cases:**
- Debt-free → DSR & DAR get full points (Not Applicable)
- No goals → Goal Health gets full points
- <2 stocks → Allocation Discipline gets full points
- <3 metrics with data → Belum Dinilai regardless
- Safe Haven floor: assets < 3× expenses → forced to 0
- Deficit tone gate: surplus < 0 → subtitle shows "Hati-hati Defisit" (red)

### Badges (5 OJK-friendly)

Dana Darurat Aman, Utang Terkontrol, Cashflow Positif, Diversifikasi, Tabungan Disiplin. Each with unlock condition + localStorage celebration on first unlock.

### Sankey Cash Flow (wealth-tracker only)

ECharts Sankey with top-5 income + top-6 expense flows. "Lainnya" grouping for remaining. Color palette aligned with expense donut. Hidden on mobile (<640px).

### What-If Investment Simulator (wealth-tracker only)

ECharts line chart with 3 scenarios (Konservatif 50%, Ekspektasi 100%, Optimis 150% of expected return). 3 sliders: investment amount, return rate, time horizon. Inflation disclaimer.

### 10 Demo Personas

| # | Persona | Mode | Profile |
|---|---------|------|---------|
| 1 | Mahasiswa Pas-pasan | budget-kos | Income 2.3jt, surplus +200k, no debt |
| 2 | Mahasiswa Mandiri | budget-kos | Freelance 3jt, surplus +700k, has RD |
| 3 | Mahasiswa Sultan | wealth-tracker | Income 15jt, no discipline, cash piles |
| 4 | Korban Judol | wealth-tracker | Income 8jt, deficit -1jt, lifestyle leak |
| 5 | Terjebak Cicilan | wealth-tracker | Income 9.5jt, DSR 52%, trapped |
| 6 | Pegawai Muda + KPR | wealth-tracker | Income 12jt, balanced, score ~900 |
| 7 | Freelancer Bebas Utang | wealth-tracker | Irregular income, no debt |
| 8 | Juragan Kos | wealth-tracker | Property income, diversified |
| 9 | Pensiunan Mapan | wealth-tracker | Fixed income, conservative |
| 10 | Sultan Properti | wealth-tracker | Massive assets, income from properties |

### Budget-kos Ringkasan Enrichment (Amendment 4)

Three additions to fix the "dead-end" problem on budget-kos:

1. **Kos-to-surplus action bridge**: Shows potential surplus gain if moving to recommended kos (mid-range 27.5% of income). Merged into existing Rent-to-income card.
2. **Mini savings projection**: Dynamic months to reach 3-month emergency fund. Guard: >24 months shows motivational message instead of absurd number. Deficit shows runway warning.
3. **Mini cashflow bar**: CSS horizontal stacked bar (no ECharts). Reuses expense palette. Segments: Kos=blue, Pokok=emerald, Lifestyle=amber, Cicilan=rose, Sisa=green/red.

### Key files

- `lib/finance/cermat-score.ts` — Score calculation engine, level system
- `lib/finance/badges.ts` — Badge unlock conditions + celebration tracking
- `composables/useWhatIf.ts` — Investment projection with 3 scenarios
- `composables/useCountUp.ts` — Animated score counter
- `components/dashboard/CermatScoreHero.vue` — Score ring + contribution breakdown
- `components/dashboard/AchievementGrid.vue` — Badge grid with staggered animation
- `components/dashboard/CashFlowSankey.vue` — ECharts Sankey (wealth-tracker)
- `components/dashboard/WhatIfSimulator.vue` — ECharts line chart + sliders (wealth-tracker)
- `components/dashboard/charts-register.ts` — Tree-shaken ECharts registration
- `lib/fixtures/personas.ts` — 10 demo personas
- `pages/app/budget-kos.vue` — Budget-kos enrichment (cashflow bar, projection, bridge)
- `stores/derived.ts` — cermatScore + badges computeds
- `lib/copy/strings.ts` — DSR "Beban Cicilan", DAR "Rasio Utang" (3-zone consistent)

### Amendments (locked)

| # | Title | Key Changes |
|---|-------|-------------|
| 1 | Tier icons, metric labels, Safe Haven floor | 👑 for Hutan, subtitle field, assets < 3× exp → 0 |
| 2 | 10 persona roster | Dual-mode picker, spectrum bottom→top |
| 3 | Label & tone fixes | DSR→"Beban Cicilan", DAR→"Rasio Utang", deficit gate |
| 4 | Budget-kos enrichment | Action bridge, savings projection, cashflow bar |

---

## Review History

- **AI tetangga:** 11 rounds of review across Phase 6, 6.1, and 6.2. All verified from screenshots/data.
- **Codex:** Phase 6 review — 3 medium + 3 nits addressed. Phase 6.2 score/persona verified.

---

## Test Coverage

439 tests passing, typecheck clean (vue-tsc).

Key test files:
- `tests/finance/cermat-score.test.ts` — 17 tests (empty snapshot, debt-free, null handling, Safe Haven floor, NW thresholds, persona calibration)
- `tests/finance/badges.test.ts` — 17 tests (each badge lock/unlock, diversification edge cases, localStorage celebration)
- `tests/composables/useWhatIf.test.ts` — 10 tests (projection math, div-by-zero, monotonic growth)

---

## Demo Flow (60-second path)

1. **Landing page** → scroll hero
2. **Sultan Properti** → wow net worth, Hutan tier 👑
3. **Switch to Korban Judol** → Sankey gut-punch, "Hati-hati Defisit" warning
4. **Switch to Pegawai Muda** → 900 Hutan, balanced profile
5. **Switch to budget-kos** → Mahasiswa Mandiri → cashflow bar + "3 bulan lagi dana darurat"
6. **Unduh Laporan** → PDF with all 8 pages

---

## Phase 7 Backlog

- Generalize gadai handling (multi-type collateral: BPKB, sertifikat)
- Rename `tertahanGoldIdr` → `tertahanGadaiIdr`
- Composite logic nuance weighting (DSR/DAR > Safe Haven)
- Recommendation: show all options vs strict ranking
- Emas N/A → estimasi + disclaimer
- Font embedding (Inter/Plus Jakarta Sans)
- Advisor mode vs User mode toggle
- Interactive kos slider (budget-kos)
- Rasio Utang >100% display polish ("utang 8× aset")
