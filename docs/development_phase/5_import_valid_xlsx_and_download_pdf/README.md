# Phase 5: Import XLSX + Unduh Laporan (XLSX & PDF)

**Priority:** MEDIUM (completed MVP features, now adds portability & reporting)
**Prerequisite:** Phase 4 complete
**Effort estimate:** L (Large — ~3-5 sessions: import logic, PDF generation, chart rendering, QA)

---

## Scope

### 5.1 Import XLSX

**What it does:** User uploads a previously-exported Cermat XLSX → data is parsed, validated, previewed → on confirm, overwrites current in-memory snapshot.

**Import scope — which sheets are read:**
- `Snapshot` sheet → restores core input data (pemasukan, pengeluaran, aset, utang) via 8-column schema
- `Goals` sheet → restores goal input fields only (see input vs derived below)
- `_meta` sheet → schema version check (reject if unsupported major version)
- Other sheets (`Ringkasan`, `Per-Emiten`, `Cicilan-Aktif`) are derived data and **ignored** during import — they will be regenerated from the restored input data

**Goals sheet — input vs derived fields:**
- **Imported (input fields):** `goal_id`, `goal_type`, `label`, `target_amount`, `target_date`, `fi_multiplier`, `bucket_json`
- **Recalculated after import (derived):** `current_progress`, `monthly_contribution_needed`, `status`, `projected_completion` — these are NOT trusted from the file and will be recomputed from the restored Snapshot data
- `bucket_json` validation:
  - Malformed JSON → skip that goal, collect for summary toast
  - References unknown rowId (deleted asset) → import goal but log warning

**Import UX flow:**
1. User clicks "Import Data" button
2. File picker opens → user selects XLSX
3. Validation runs (see matrix below)
4. If valid → preview screen shows parsed data before confirming
5. On confirm → overwrite current in-memory snapshot state
6. If invalid → show specific error message (see error matrix below)

**Validation & error matrix:**

| Condition | Behavior |
|---|---|
| File is not XLSX | Reject: "File harus berformat .xlsx" |
| File size > 5MB | Reject: "Ukuran file terlalu besar (maks 5MB)" |
| Missing `_meta` sheet | Reject: "File bukan template Cermat" |
| Unsupported major schema version in `_meta` | Reject: "Versi template tidak didukung. Export ulang dari Cermat terbaru." |
| Minor version difference (e.g., v1.0 → v1.1) | Allow — additive fields handled gracefully |
| Missing `Snapshot` sheet | Reject: "Sheet Snapshot tidak ditemukan" |
| `Snapshot` has wrong column count | Reject: "Format sheet Snapshot tidak sesuai" |
| Row has invalid/NaN numeric value | Skip row, collect for summary |
| Row has negative value where forbidden | Skip row, collect for summary |
| Unknown section key in Snapshot | Skip row, collect for summary |
| `Goals` sheet missing | Allow — goals section optional |
| `bucket_json` malformed in Goals | Skip that goal, collect for summary |
| `bucket_json` references unknown rowId | Import goal, log warning |
| Partial errors (some rows skipped) | Import remaining valid rows + toast: "X baris dilewati karena format tidak valid" |
| Empty Snapshot sheet (header only, no data rows) | Reject: "File kosong, tidak ada data untuk diimpor" |

**Security notes:**
- SheetJS does not evaluate formulas by default — no risk of `=IMPORTDATA` / `=WEBSERVICE` formula injection
- File size cap (5MB) mitigates zip bomb risk
- No macros executed — XLSX parsing is data-read only

**Round-trip contract — what "consistent" means:**
- Clean round-trip (no skipped rows): rowId set identical before and after, per-row amount diff ≤ Rp 10, sum(amount) per section diff ≤ 0.01%
- Round-trip with skipped rows: documented in import summary, not considered round-trip success
- Preserved schema version in `_meta`

### 5.2 PDF Report

**Data source of truth:** All PDF metrics and tables use the **same derived/store values** shown in the dashboard. Specifically:
- Key metrics → from same computed properties that feed `MetricGrid` and `HeroPair`
- Charts → from same data that feeds dashboard chart components
- Tables → from same store data that feeds detail views
- All values in **IDR-normalized** form (matching dashboard display)
- Missing prices → shown as "N/A" consistently (single canonical placeholder across all PDF sections)

**Localization format (must match dashboard):**
- Currency: `Rp 1.500.000` (titik as thousand separator, no decimal)
- Date: `6 Juni 2026` (Indonesian month names)
- Percentage: `32,5%` (koma as decimal separator)

**Page 1 — Summary:**
- Header: "Cermat — Laporan Keuangan" + generation date (Indonesian format)
- Key metrics grid (6 cards): Net Worth, Surplus/Deficit, Total Aset, Total Utang, Dana Darurat (in months), Savings Rate (%)
- Charts section (side-by-side layout):
  - Alokasi Aset donut — visually matches dashboard `AllocationDonut` (same colors, same labels, with legend)
  - Pengeluaran donut — visually matches dashboard `ExpenseBreakdownDonut` (same colors, same labels, with legend)
  - Net Worth bar chart — 2 vertical bars side-by-side (Aset = hijau, Utang = merah), value labels above each bar in Rp format
- When data is missing (e.g., no expenses → no donut): show "Belum ada data" placeholder text in chart area
- Footer: Disclaimer text + "Dibuat dengan Cermat"

**Page 2+ — Detail:**
- Detail Aset table: nama, jenis, nilai (IDR), perubahan vs harga akuisisi (%)
  - Perubahan = (harga sekarang − harga beli) / harga beli × 100%
  - For emas: use buyback price for current value, acquisition price for buy price
- Cicilan Aktif table: nama, sisa utang, sisa tenor, cicilan/bulan
- Goals table: nama, target, terkini, progress (%)
- Each section only rendered if data exists (skip entirely if no cicilan, no goals, etc.)
- **Pagination:** Detail tables auto-paginate — if a table exceeds page height, it continues on the next page with repeated header row. Page numbers shown as footer (hal. 1, 2, 3...).

**Technical approach:**
- `jspdf` for PDF structure and text layout (to be added as dependency)
- `html2canvas` (already installed) for chart rendering — hybrid approach:
  1. Render dashboard chart component in hidden div
  2. `await nextTick()` + `await new Promise(r => setTimeout(r, 100))` to ensure full paint
  3. Capture with html2canvas at `scale: 2` for retina-quality (minimum 2x resolution)
  4. Embed captured canvas as image in PDF
- This ensures charts match dashboard appearance (same font, same colors, same proportions)
- Text elements use jspdf layout (headers, tables, metrics) for crisp rendering
- Chart capture QA: verify legend visibility, no text overflow, no partial renders

### 5.3 Combined CTA — "Unduh Laporan"

**Button behavior:**
- Replace current "Unduh xlsx" button in `TopNav.vue` with "Unduh Laporan"
- Disabled state: only when snapshot is completely empty (no income, no expense, no asset, no debt). User with only pemasukan/pengeluaran can still download report.
- Tooltip when disabled: "Isi data keuangan dulu untuk mengunduh laporan"

**Progress indicator (step-based):**
- Show step progress in button text:
  1. "Menyusun XLSX..."
  2. "Menyusun PDF..."
  3. Done → reset button
- Use `setTimeout(0)` between steps to yield to event loop for UI update
- Known limitation: jspdf/html2canvas generation is synchronous, main thread may freeze ~1-3s during PDF generation. Acceptable for MVP.

**Sequential download flow:**
1. User clicks "Unduh Laporan"
2. Generate XLSX → trigger download
3. Generate PDF → trigger download
4. Both downloads land in browser's download folder

**Failure handling:**

| Scenario | Behavior |
|---|---|
| XLSX succeeds, PDF fails | XLSX already downloaded. Show toast error: "PDF gagal dibuat. Silakan coba lagi." |
| XLSX fails | Do not attempt PDF. Show toast error: "Laporan gagal dibuat. Silakan coba lagi." |
| Both succeed | No toast needed — downloads speak for themselves |

**Mobile strategy (pre-decided):**
- Strategy: attempt both downloads with 500ms delay between them
- Detection: no user-agent sniffing — same code path on all devices
- After generation completes, always show toast for 5s: *"PDF & XLSX sedang diunduh. Tidak terlihat? [Unduh Ulang PDF] [Unduh Ulang XLSX]"* — avoids unreliable download-failure detection, handles iOS Safari quirks elegantly
- Tested on: iOS Safari, Chrome Mobile, Chrome/Firefox/Safari/Edge desktop

---

## Out of Scope
- Sharing PDF via link (just download)
- Custom date range filtering in report (snapshot is point-in-time)
- Password-protected PDF
- ZIP packaging for combined download (two sequential downloads is simpler)
- Server-side PDF generation (client-only for now)
- Web Worker for PDF generation (MVP uses main thread; migrate if dataset grows significantly)

---

## Technical Notes
- `html2canvas` already installed in project — used for chart rendering in PDF
- `jspdf` to be added as dependency for PDF structure and text layout
- Existing `composables/useXlsx.ts` handles XLSX export with 6-sheet structure
- `Snapshot` sheet uses 8-column schema: `section | rowId | name | category | amount | freq | note | extra`
- `_meta` sheet stores `schemaVersion` (currently `1`) for compatibility checks
- Import reads `Snapshot` + `Goals` + `_meta` only; derived sheets ignored
- Goals derived fields (`current_progress`, `status`, etc.) recalculated after import, not trusted from file
- PDF uses same store/computed values as dashboard — no separate calculation path
- Chart rendering: hybrid canvas (charts) + jspdf (text/tables) for visual match + performance
- Chart capture: `scale: 2` retina, `await nextTick()` + 100ms settle delay, verify legend/text visibility
- Schema versioning: major version mismatch = reject; minor version difference = allow (backward compatible for additive fields)
- Detail table pagination: manual page-break logic in jspdf (auto-pagination not built-in)
- PDF generation synchronous on main thread (~1-3s for typical dataset), acceptable for MVP

---

## Testing Approach

### Unit tests
- XLSX parsing: valid file → correct snapshot state
- Validation rules: each error matrix case covered individually
- Goals input/derived split: derived fields not imported
- bucket_json parsing: valid, malformed, unknown rowId

### Integration tests
- Round-trip: export → import → re-export → semantic equality (rowId set identical, per-row ≤ Rp 10, section sum < 0.01%)
- Import with partial errors: valid rows imported, invalid rows skipped, toast message correct

### Manual QA — PDF visual fidelity
- 3 sample snapshots tested:
  1. Rich data (20+ assets, multiple goals, cicilan, all chart types populated)
  2. Sparse data (income + 1 expense, no assets — minimal report)
  3. Edge case (emas buyback price, missing prices → "N/A", no goals/cicilan)
- Verify per sample: metrics match dashboard, charts legible, tables paginated, localization correct, no broken layout (defined as: no overlapping text, footer at consistent y-position, no orphaned section headers)

### Cross-browser
- Desktop: Chrome, Firefox, Safari, Edge
- Mobile: iOS Safari, Chrome Mobile
- Verify: both files download on all platforms, or manual retry fallback appears

### Performance
- PDF generation < 5s for typical dataset (20 assets, 3 charts)
- No memory leak after generation (chart hidden div cleaned up)

---

## Demo Flow (for judges)
1. Show snapshot data sudah diisi user
2. Klik "Unduh Laporan" → progress indicator (Menyusun XLSX... → Menyusun PDF...)
3. PDF terbuka → tunjukin Page 1 summary (3 charts + 6 metrics)
4. Scroll ke Page 2+ → tunjukin detail tables (aset, cicilan, goals)
5. Tunjukin XLSX bisa di-edit & di-import balik = persistence "tanpa cloud"
6. Import flow: upload XLSX → preview → confirm → data restored

---

## Success Criteria
- [ ] XLSX import works with valid Cermat-exported files
- [ ] Import shows preview screen before overwriting data
- [ ] All validation error cases produce correct error messages per matrix above
- [ ] Partial import works: valid rows imported, invalid rows skipped with summary toast
- [ ] Goals derived fields recalculated (not trusted from file)
- [ ] bucket_json malformed/invalid reference handled gracefully
- [ ] File size > 5MB rejected with clear message
- [ ] PDF report generates with summary page (metrics + 3 charts) + detail page(s) (tables)
- [ ] PDF values match dashboard values (same store/computed sources, IDR-normalized)
- [ ] PDF charts captured at 2x resolution, same color palette, same legend order as dashboard
- [ ] PDF localization consistent: Rp format, Indonesian dates, comma decimal
- [ ] Empty data sections skipped in PDF — no overlapping text, footer at consistent y-position, no orphaned section headers
- [ ] Detail tables paginate correctly when exceeding page height (header repeated, page numbers in footer)
- [ ] Net Worth bar chart: 2 vertical bars (Aset hijau, Utang merah), value labels in Rp format above each bar
- [ ] "Unduh Laporan" CTA downloads both XLSX and PDF in one click
- [ ] Button disabled only when snapshot completely empty (no income, no expense, no asset, no debt)
- [ ] Step-based progress shown (Menyusun XLSX... → Menyusun PDF...)
- [ ] Failure handling: partial success shows specific toast, full failure blocks both downloads
- [ ] Mobile: both files download, or manual retry fallback toast appears
- [ ] Round-trip clean: rowId set identical, per-row amount diff ≤ Rp 10, section sum diff ≤ 0.01%
- [ ] Chart hidden div cleaned up after generation (no memory leak)
- [ ] PDF generation < 5s for typical dataset
