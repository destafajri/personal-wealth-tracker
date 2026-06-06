# Phase 6: Advisor-Grade PDF Report + Ringkasan Improvements

**Priority:** HIGH (differentiator — transforms PDF from data dump to actionable report)
**Prerequisite:** Phase 5 merged
**Effort estimate:** L (Large — ~3-5 sessions: health metrics, insight engine, table enhancements, methodology note, QA)

---

## Motivation

Phase 5 shipped a functional PDF (summary page + detail tables) and XLSX round-trip import. However, the PDF is still a "data display" — it shows numbers but doesn't explain what they mean or what to do next. The AI tetangga review identified this as the biggest gap:

> "Tracker lain cuma kasih angka, Cermat kasih action. Hilangin ini = PDF jadi sama kayak Excel template biasa."

Phase 6 closes this gap by adding:
1. **Financial Health Metrics page** — benchmark ratios with status badges (Sehat/Waspada/Kritis)
2. **Insight & Rekomendasi page** — "Opsi yang Bisa Dihitungkan" as actionable next steps
3. **Detail table enhancements** — income breakdown, subtotals per category, hide empty columns, methodology note

The web dashboard already computes all the underlying metrics (DSR, DAR, Runway, Safe Haven, Savings Rate, Modal Siap Distribusi, goal projections). Phase 6 surfaces them in the PDF with professional formatting suitable for both users and financial advisors.

---

## Scope

### 6.1 Page 2 — Financial Health Metrics

**What it adds:** A dedicated page between Summary and Detail that shows 6 health ratios in a structured grid, each with a status badge and benchmark target.

**Layout — 2-column grid, 3 rows:**

```
DSR (Debt Service Ratio)        18,3%    ● Sehat
Beban cicilan vs pendapatan     Target: <30%

DAR (Debt to Asset Ratio)       30,7%    ● Waspada
Total utang vs total aset       Target: <50%

Runway                           4 thn 6 bln    ● Sehat
Berapa lama bisa hidup tanpa    Target: >6 bulan
pemasukan baru

Safe Haven Ratio                 9,3%    ● Agresif
% aset defensif                  Target: 20-30%

Savings Rate                     39,6%    ● Sehat
% pendapatan yang ditabung       Target: >20%

Target Alokasi Saham             1,3 pp   ● Sesuai
Deviasi dari alokasi target      Target: <5 pp
```

**Status badge logic (maps to existing dashboard thresholds):**

| Metric | Sehat | Waspada | Agresif/Bahaya |
|--------|-------|---------|----------------|
| DSR | <30% | 30-40% | >40% |
| DAR | <50% | 50-70% | >70% |
| Runway | >6 bulan | 3-6 bulan | <3 bulan |
| Safe Haven | 20-30% | 10-20% | <10% |
| Savings Rate | >20% | 10-20% | <10% |
| Target Alokasi Saham | <5 pp | 5-10 pp | >10 pp |

**Edge cases:**
- No debt → DSR and DAR show "N/A" with Sehat badge (no debt = no problem)
- No income → metrics that need income show "Belum ada data"
- Runway null (no expenses) → show "N/A"

**Composite "Status Keuangan" logic (shown on Page 1 Executive Summary):**
- All available metrics Sehat → "Sehat" (green)
- Any metric Waspada but no Agresif/Bahaya → "Perlu Perhatian" (amber)
- Any metric Agresif/Bahaya → "Kritis" (red)
- Mostly N/A (sparse data — <3 non-N/A metrics evaluated) → "Data belum lengkap" (gray)
- N/A metrics don't count toward the composite — only evaluated metrics determine status

**Data source:** All values already computed in `stores/derived.ts`. Status badge thresholds already exist in `lib/finance/thresholds.ts`. Reuse, don't recompute.

### 6.2 Page 3 — Rekomendasi Distribusi Modal

**What it adds:** A page that opens with 1-2 static insight statements, then shows Modal Siap Distribusi and ranks actionable debt-payoff options sorted by financial impact.

**Layout:**

```
Insight:
• DAR 30,7% — di atas threshold ideal 25%, fokus reduksi utang akan improve ratio
  significantly.
• Modal Siap Distribusi Rp 30jt = 4,3 bulan pengeluaran, cukup untuk lunasi semua
  utang non-KPR sekaligus.

Modal Siap Distribusi: Rp 30.228.675
(Dana setelah dana darurat 3-6 bulan terpenuhi)

REKOMENDASI:

1. Lunasi Kartu Kredit Mandiri
   Alokasi: Rp 1.500.000
   Impact: DSR 18,3% → 15,7% (-2,7 pp); sisa modal Rp 28.728.675

2. Lunasi Pinjam ke kakak
   Alokasi: Rp 2.500.000
   Impact: DSR 15,7% → 13,4% (-2,2 pp); sisa modal Rp 26.228.675

3. Tebus Gadai Emas Pegadaian
   Alokasi: Rp 10.000.000
   Impact: Aset gadai balik ke snapshot; sisa modal Rp 16.228.675

4. Prepay KPR BTN Rumah Bekasi
   Alokasi: Rp 16.228.675
   Impact: Tenor mundur; sisa modal Rp 0

CATATAN: Pertimbangkan keep dana darurat 3-6 bulan
pengeluaran terpisah dari Modal Siap Distribusi.
```

*DSR cascade verification (demo reference only — actual values computed at runtime):*
- Initial: cicilan 2.050.000 / income 11.174.195 = 18,34%
- After #1 (KK Rp 300rb/bln lunas): cicilan 1.750.000 → DSR 15,66%
- After #2 (Kakak Rp 250rb/bln lunas): cicilan 1.500.000 → DSR 13,43%

**Priority ranking logic (based on effective interest rate by debt type):**

Cermat does not collect interest rate per debt row — ranking uses debt type as proxy for typical rate:

1. **High-interest unsecured** (KK, PINJOL, PAYLATER) — typically >18% APR → highest priority
2. **Mid-interest unsecured** (KTA, BANK_KTA, LAIN) — typically 10-18% APR
3. **Mid-interest secured** (KPM, KKB) — typically 8-12% APR
4. **Low-interest secured** (KPR) — typically 6-10% APR
5. **Zero-interest informal** (utang pribadi / family & friends) — 0% APR → lowest priority
6. **Gadai redemption** — special case (asset recovery + freed-up collateral, no interest savings)

Within same priority tier: **higher monthly cicilan first** (bigger DSR impact per Rp allocated).

**Note on 0% informal debt:** Utang pribadi to family/friends is treated as lowest priority because the opportunity cost of not paying it off is 0%. The money is better used to reduce higher-interest debt first. This is financially optimal even though it may feel counterintuitive socially.

**Modal Siap Distribusi calculation** (already exists in derived store):
- `modalSiap = totalLiquidAssets − (monthlyExpenses × 6)`
- If negative → show "Modal belum tersedia. Fokus bangun dana darurat 3-6 bulan dulu."
- If no debt → show "Tidak ada utang yang perlu dilunasi. Pertimbangkan investasi tambahan."

**Edge cases:**
- No debt at all → skip recommendation items, show positive note
- Modal Siap Distribusi = 0 or negative → show "bangun dana darurat dulu" message
- Gadai with no liquid assets to redeem → skip that recommendation
- Modal > total debt → after all debt settled, show surplus recommendation: *"Sisa modal Rp X — pertimbangkan investasi tambahan (lihat opsi di app)."*
- All recommendations are suggestions, not mandates — always show disclaimer

**Insight statement template strategy (template-based, 3-4 branches per metric):**

Each metric generates 1 insight statement using a conditional template:

```
DAR {value}% — {status_branch}
  Kritis:  "utang melebihi setengah aset, prioritas reduksi utang sangat tinggi"
  Waspada: "di atas threshold ideal {threshold}%, fokus reduksi utang akan improve ratio"
  Sehat:   "rasio utang terkontrol, pertahankan dan tingkatkan tabungan"
```

```
Safe Haven {value}% — {status_branch}
  Agresif: "aset defensif kurang dari {threshold}%, pertimbangkan rebalance ke defensive"
  Waspada: "cukup tapi di bawah ideal {threshold}%, tambah deposito/SBN/emas"
  Sehat:   "aset defensif memadai untuk proteksi pasar turun"
```

```
Modal Siap Distribusi Rp {value} — {modal_months} bulan pengeluaran, {action}
  Sufficient for all non-KPR debt: "cukup lunasi semua utang non-KPR sekaligus"
  Partial payoff only: "prioritaskan utang bunga tinggi dulu"
  Negative/zero: "belum tersedia, fokus bangun dana darurat dulu"
```

Only show top 2 most relevant insights (avoid wall of text).

### 6.3 Page 4+ — Detail Table Enhancements

#### 6.3.1 Income Breakdown Table (new)

Add before Detail Aset:

```
Sumber Pendapatan              Per Bulan
─────────────────────────────────────────
Gaji Bersih                    Rp 6.500.000
Freelance design               Rp 1.500.000
Sewa kos (1 kamar)             Rp 800.000
Estimasi dividen saham         Rp 2.304.404 (estimasi)
Estimasi bunga SBN             Rp 41.458 (estimasi)
Estimasi bunga deposito        Rp 28.333 (estimasi)
─────────────────────────────────────────
Total                          Rp 11.174.195
```

- Gaji + penghasilanLain from store (user-entered)
- `penghasilanLain` is a granular array of `{ id, label, amount, currency }` — each entry is a separate income source with its own label, so the breakdown table renders one row per entry
- Auto-estimated income: dividend (`calcPotentialDividendIdr` × 12 / 12), SBN interest, deposito interest
- Show "(estimasi)" label for estimated rows — more formal than "(auto)"
- Only show rows with non-zero values

#### 6.3.2 Detail Aset Table Improvements

Current columns: `Jenis | Nama | Nilai (Rp) | Perubahan`

New columns: `Jenis | Nama | Nilai (Rp) | % Aset`

Changes:
- **Replace "Perubahan" column with "% Aset"** — shows share of total assets (more useful for advisors)
  - Formula: `(rowIdr / totalAset) × 100`
  - Format: `12,5%` (koma decimal)
- **Add subtotal rows per category:**

```
KAS & TABUNGAN                          Rp 3.300.000     0,5%
  BCA                                   Rp 2.500.000
  Jenius                                Rp 800.000
INVESTASI PASIF                         Rp 50.666.768    7,3%
  Deposito BCA 12bln                    Rp 8.000.000
  Mandiri Pasar Uang                    Rp 5.000.000
  ...
ASET TETAP                              Rp 320.000.000   45,9%
  Rumah Bekasi                          Rp 280.000.000
  ...
```

- Subtotal rows styled bold, with a thin border separator above
- Category labels from existing i18n keys

#### 6.3.3 Cicilan + Utang Pribadi Table — Split Sections

Split the combined debt table into clearly labeled sub-sections:

```
CICILAN AKTIF                           Rp 201.500.000
  KPR BTN Rumah Bekasi  Rp 200.000.000   240 bln   Rp 1.500.000/bln
  KK Kartu Kredit Mandiri Rp 1.500.000   -         Rp 300.000/bln

UTANG PRIBADI                           Rp 2.500.000
  Pinjam ke kakak       Rp 2.500.000     -         -

GADAI                                   Rp 10.000.000
  emas:fisikAntam (5g)  Rp 10.000.000    -         -
```

- Each sub-section has its own subtotal header
- Only rendered if data exists for that sub-section

#### 6.3.4 Methodology Note (new section at end)

Add a small methodology section at the bottom of the last detail page:

```
CATATAN METODOLOGI
- Harga emas pakai harga buyback (Pegadaian/Antam reference)
- Estimasi dividen saham: rata-rata yield per emiten × jumlah lembar
- Estimasi bunga deposito: rate × saldo / 12
- Estimasi bunga SBN: kupon rate aktual × nominal / 12
- Dana darurat: pengeluaran bulanan × bulan tertanggung
- Modal Siap Distribusi: aset likuid − (pengeluaran bulanan × 6)
- DSR: total cicilan/bulan ÷ total pendapatan/bulan × 100%
- DAR: total utang ÷ total aset × 100%
- Safe Haven: (kas + deposito + SBN + RD pasar uang + emas) ÷ total aset × 100%
- Semua angka bersifat estimasi dan bukan rekomendasi investasi
```

---

## PDF Page Order (after Phase 6)

1. **Executive Summary** — 6 metrics + 3 charts + 1-line health status (existing, add status line)
2. **Financial Health Metrics** — 6 ratios with benchmarks (new)
3. **Rekomendasi Distribusi Modal** — insight statements + Modal Siap Distribusi + ranked actions (new)
4. **Income Breakdown** — user + estimated income table (new)
5. **Detail Aset** — improved with subtotals + % Aset (enhanced)
6. **Cicilan + Utang + Gadai** — split sub-sections (enhanced)
7. **Goals** — target, current, progress (existing, **skip page entirely if no goals**)
8. **Methodology Note** — assumptions & calculation basis (new)

---

## Implementation Plan

### Session 1: Health Metrics Page
- Add `drawHealthMetrics()` to `lib/pdf/layout.ts`
- Create `gatherHealthMetrics()` in `lib/pdf/metrics.ts` — pulls from derived store + thresholds
- Status badge rendering (colored dots + text)
- Edge cases: no debt, no income, no expenses

### Session 2: Rekomendasi Distribusi Modal Page
- Create `gatherInsights()` in `lib/pdf/metrics.ts` — template-based insight statements + ranks debt payoff options by 6-tier interest rate proxy
- Add `drawRecommendationSection()` to `lib/pdf/layout.ts`
- Priority ranking: KK/PINJOL/PAYLATER → KTA/BANK_KTA → KPM/KKB → KPR → utang pribadi 0% → gadai
- Within-tier secondary sort: higher monthly cicilan first
- Modal Siap Distribusi display + surplus edge case (sisa → investasi)

### Session 3: Detail Table Enhancements
- Income breakdown table (new `gatherIncomeBreakdown()`)
- Detail Aset: replace "Perubahan" with "% Aset", add subtotals
- Split Cicilan/Utang/Gadai into sub-sections
- Methodology note

### Session 4: QA + Polish
- Visual fidelity: verify with 3 sample datasets (rich, sparse, edge)
- Typecheck + test suite
- Codex review

---

## Out of Scope

- User mode vs Advisor mode toggle (single comprehensive PDF for MVP)
- Time-series / historical data (snapshot is point-in-time)
- Password-protected PDF
- PDF sharing via link
- Custom date range filtering
- Server-side PDF generation
- Web Worker for PDF generation
- Localization other than Indonesian

---

## Technical Notes

- All health metric thresholds already exist in `lib/finance/thresholds.ts` — reuse, don't duplicate
- Modal Siap Distribusi already computed in `stores/derived.ts` as `modalSiap`
- DSR, DAR, Runway, Safe Haven, Savings Rate all already computed in derived store
- Debt payoff priority logic should be a pure function in `lib/pdf/metrics.ts` for testability
- Income breakdown: dividend/SBN/deposito estimation functions already exist in `lib/finance/metrics.ts`
- PDF page count will increase from ~3 to ~6-8 pages — acceptable for advisor-grade report
- jsPDF pagination: manual page-break logic continues from Phase 5 approach

---

## Testing Approach

### Unit tests
- `gatherHealthMetrics()`: verify status badge assignment for each threshold boundary
- `gatherInsights()`: verify ranking order, Modal Siap Distribusi calculation, edge cases (no debt, negative modal)
- `gatherIncomeBreakdown()`: verify auto-estimated income calculations
- Subtotal calculation per category

### Manual QA — PDF visual fidelity
Test with 3 sample snapshots:
1. **Rich data** — 20+ assets, multiple goals, cicilan + utang + gadai, all metrics populated
2. **Sparse data** — income + 1 expense, no assets, no debt → health page shows mostly "N/A"
3. **Edge case** — all USD income, emas only, no cicilan, negative surplus

Verify per sample:
- Health metrics match dashboard badge colors
- Insight recommendations ordered correctly
- Income breakdown shows "(estimasi)" for estimated rows
- Detail Aset subtotals sum correctly
- No overlapping text, footer at consistent y-position
- Methodology note visible on last page

### Performance
- PDF generation < 8s for rich dataset (acceptable increase from Phase 5's 5s target due to additional pages)

---

## Success Criteria

- [ ] Financial Health Metrics page renders with 6 ratios + status badges + benchmarks
- [ ] Status badges use same thresholds as dashboard (thresholds.ts)
- [ ] Edge cases handled: no debt → "N/A Sehat", no income → "Belum ada data"
- [ ] Insight page shows Modal Siap Distribusi + ranked recommendations
- [ ] Recommendation ranking uses 6-tier interest rate proxy: KK/PINJOL/PAYLATER → KTA/BANK_KTA → KPM/KKB → KPR → utang pribadi 0% → gadai
- [ ] Negative Modal Siap Distribusi shows "bangun dana darurat dulu" message
- [ ] No debt scenario shows positive note instead of empty page
- [ ] Income breakdown table shows user-entered + auto-estimated income
- [ ] "(estimasi)" label on estimated income rows (dividend, SBN, deposito interest)
- [ ] Detail Aset: "Perubahan" column replaced with "% Aset"
- [ ] Detail Aset: subtotal rows per category (bold, border separator)
- [ ] Cicilan/Utang/Gadai split into labeled sub-sections with subtotals
- [ ] Methodology note at end with calculation basis for all metrics
- [ ] Executive Summary page gets composite "Status Keuangan" line with deterministic logic (all-Sehat=Sehat, any-Waspada=Perlu Perhatian, any-Kritis=Kritis, sparse=Data belum lengkap)
- [ ] Section renamed to "Rekomendasi Distribusi Modal" with static insight statements before recommendations
- [ ] Debt payoff ranking uses effective interest rate via debt type (KK > KTA > KPM > KPR > utang pribadi 0% > gadai)
- [ ] Within same tier: higher monthly cicilan first (bigger DSR impact)
- [ ] Edge case handled: Modal > total debt → surplus shows investment recommendation
- [ ] All PDF values match dashboard values (same store/computed sources)
- [ ] PDF generation < 8s for rich dataset
- [ ] vue-tsc clean, existing test suite passes

---

## Demo Flow (for judges)

1. Show snapshot data with rich demo (assets, debt, goals, multi-currency)
2. Click "Unduh Laporan" → PDF downloads
3. **Page 1:** "Status Keuangan: Perlu Perhatian" — 3 charts + 6 metrics
4. **Page 2:** Health Metrics grid — "DSR 18,3% Sehat, Safe Haven 9,3% Agresif"
5. **Page 3:** "Insight: DAR 30,7% di atas ideal" → "Modal Siap Distribusi Rp 30jt" → ranked recommendations → "Lunasi KK dulu, baru tebus gadai"
6. **Page 4:** Income breakdown — "Gaji Rp 6.5M + dividend auto Rp 2.3M"
7. **Page 5:** Detail Aset with subtotals + % allocation → advisor can audit
8. **Page 6:** Methodology note → transparency builds trust
9. Key message: "Satu PDF, tiga audiens — user buat self-reflection, advisor buat konsultasi, dokumen formal buat lampiran KPR"

---

## Phase 6.1: Gadai Transparency + PDF Polish

**Priority:** MEDIUM (trust gap for users with gadai — asset transparency)
**Prerequisite:** Phase 6 v2 fixes merged
**Effort estimate:** S (Small — ~1 session)

### Motivation

AI tetangga reviewed Phase 6 v2 PDF output and identified:
1. **Gadai transparency gap**: Emas yang di-gadai tetap masuk total aset (accounting correct), tapi PDF ga nunjukin mana aset yang "locked" sebagai jaminan gadai. User dengan gadai besar bisa misinterpret total aset sebagai available.
2. **Composite status over-alarming**: Single Safe Haven "bahaya" metric → composite "Kritis" too alarming. Fixed in Phase 6 v2 with new "Agresif" tier.
3. **Insight kurang**: PDF cuma show 1 insight padahal spec bilang "top 2 most relevant".

### 6.1.1 Emas Breakdown + "(digadaikan)" Badge **(emas-only)**

**Current behavior**: Single emas line — `Emas 16.0 g N/A -`

**New behavior**: Per-category breakdown with pawned indicator

```
Emas   Digital            5.0 g              Rp 12.935.000   2.0%
Emas   Antam              8.0 g (3.0g digadaikan)  Rp 20.696.000   3.3%
Emas   Perhiasan 18K      3.0 g              N/A             -
Emas   SUBTOTAL                              Rp 33.631.000   5.3%
```

**Implementation:**
- Loop through `EMAS_CATEGORIES` from `lib/finance/emas.ts`
- For each category with grams > 0, show: category label, grams, IDR value
- If `pawnedGramOf(snap, cat) > 0`, append `(Xg digadaikan)` to gram label
- IDR value uses `ratePerGram(cat, prices)` — N/A if no price data
- Keep subtotal row

### 6.1.2 "Aset Likuid Tersedia" Metric Card

**What it adds:** 7th metric card on Page 1 showing available liquid assets after subtracting gadai-pledged value.

```
Net Worth          Surplus/Bulan     Total Aset
Rp 361.393.794     Rp 4.429.402      Rp 631.819.994

Total Utang        Aset Likuid Tersedia   Dana Darurat
Rp 270.426.200     Rp 588.427.994         4 thn 6 bln

Savings Rate
39,6%
```

**Formula:** `Aset Likuid Tersedia = Total Aset - tertahanGoldIdr` (current scope: emas only)

This gives a more honest picture of what assets are actually available vs locked as gadai collateral. Note: current implementation only deducts emas-collateral value. Non-emas gadai (BPKB kendaraan, sertifikat tanah) are not yet deducted — deferred to Phase 7.

### 6.1.3 Insight Enrichment (Safe Haven)

Add 2nd insight for portfolio balance:

- **Safe Haven > 40%**: "Safe Haven {value}% di atas target 30% - portfolio terlalu defensif, pertimbangkan diversifikasi ke growth assets."
- **Safe Haven < 15%**: "Safe Haven {value}% sangat rendah - pertimbangkan menambah aset defensif (kas, deposito, emas)."

These count toward the existing "top 2 most relevant" limit.

### 6.1.4 Methodology Note Update

Add row: `Aset Likuid Tersedia: total aset - nilai aset yang dijaminkan (current scope: emas)`

### 6.1.5 Phase 6 v2 Bug Fixes (completed)

These were fixed before Phase 6.1:

1. **Composite status "Kritis" over-alarming**: Added "Agresif" tier — single bahaya metric → "Agresif" (orange), 2+ bahaya → "Kritis" (red)
2. **Metric-specific zone labels**: Safe Haven uses Konservatif/Seimbang/Agresif; Deviasi uses Sesuai Rencana/Perlu Rebalance/Off-Plan
3. **"Lunasi" vs "Prepay"**: Partial payoff shows "Prepay" + honest framing ("Pokok berkurang Rp X, cicilan/bulan tetap")
4. **Pensiun separate category**: BPJS + DPLK now separate subtotal from Aset Tetap
5. **Unicode rendering**: Replaced ×, ÷, −, → with ASCII for reliable jsPDF Helvetica output

### Verification

- `npx vue-tsc --noEmit` — typecheck clean
- `npx vitest run` — all tests pass
- Manual: PDF with gadai shows "(Xg digadaikan)" + Aset Likuid Tersedia card
- Manual: PDF without gadai shows no digadaikan text

### Known Limitations (Phase 6.1)

- **Gadai handling is emas-only**: Current implementation only detects and badges gold-collateral gadai contracts. Non-emas gadai (BPKB kendaraan, sertifikat tanah, elektronik, saham) are not reflected in "(digadaikan)" badge or Aset Likuid Tersedia deduction.
- **KPR/KKB not treated as "locked"**: Aset rumah/kendaraan tetap dihitung sebagai fully owned — user mental model: "rumah ini punya gue meskipun KPR belum lunas". This is an explicit design decision, not a bug.

### Phase 7 Backlog — Gadai Generalization

- Generalize gadai handling to support any collateral type via `gadai.assetType` field
- Dynamic badge wording: "(dijaminkan BPKB)", "(dijaminkan sertifikat)"
- Aset Likuid Tersedia formula update: deduct all pledged asset values, not just emas
- Document KPR/KKB decision boundary explicitly
- Rename internal variable `tertahanGoldIdr` → `tertahanGadaiIdr` for semantic clarity
