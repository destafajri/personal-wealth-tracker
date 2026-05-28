# Cermat — Design Decisions Addendum

**Status:** Locked
**Last updated:** 2026-05-26
**Companion docs:** `personal-wealth-platform-prd-en.md`, `personal-wealth-platform-mvp-en.md`, `stitch_mvp_ui_design_process/personal_wealth_platform_design_guidelines_en.md`

---

## 1. Purpose

This doc captures decisions made after reviewing Stitch-generated UI outputs against PRD/MVP/OJK constraints. It supersedes any conflicting detail in the Stitch outputs and serves as the single source of truth for the implementation phase. Stitch was used as a starter — these decisions lock the patterns and document what to drop.

---

## 2. Locked Decisions

### 2.1 Navigation chrome — **Top tab-bar**

```
┌─────────────────────────────────────────────────┐
│ Cermat                            [↓ .xlsx]     │  ← TopNav (h-16)
├─────────────────────────────────────────────────┤
│ [Snapshot]  Goals  Simulator                    │  ← Tab-bar (h-12)
├─────────────────────────────────────────────────┤
│                  │                              │
│  Left Panel 45%  │  Right Panel 55%             │
│  (Input)         │  (Dashboard)                 │
│                  │                              │
└─────────────────────────────────────────────────┘
```

- Brand "Cermat" left, `.xlsx Download` button right in TopNav
- Tab labels: **Snapshot · Goals · Simulator**
- Active tab: 2px bottom border in `primary`; inactive in `on-surface-variant`
- Mobile fallback: tab-bar collapses to bottom-nav OR becomes hamburger (decide at mobile-polish stage, MVP Day 11)

**Why this over sidebar:** maximizes horizontal real estate for the dense 45/55 split-panel; matches what 4 of 5 Stitch Snapshot screens already prototyped; cleaner mobile fallback.

### 2.2 Wizard delta layout — **4-column table**

Format: `Metrik | Sebelum | Sesudah | Δ`

```
┌─────────────┬──────────┬──────────┬────────────┐
│ Metrik      │ Sebelum  │ Sesudah  │  Δ         │
├─────────────┼──────────┼──────────┼────────────┤
│ DSR         │ 22% Shat │ 38% Wspd │ ▲ +16 pp   │
│ Runway      │ 8 bln    │ 4 bln    │ ▼ −4       │
│ DAR         │ 12%      │ 45%      │ ▲ +33 pp   │
│ Modal Siap  │ Rp 52jt  │ Rp 28jt  │ ▼ −Rp 24jt │
│ Goal: FI'35 │ On-Track │ Off-Track│ ▼ 3 thn    │
└─────────────┴──────────┴──────────┴────────────┘
```

- Matches PRD §5.2.1 example verbatim
- Column 4 uses `▲` (up, may be good or bad depending on metric) / `▼` (down) / `●` (no change)
- Color: green when delta improves health, amber/rose when it degrades, neutral otherwise. **No prescriptive copy** — only state the change.
- Goal rows appear in the same table — goal name in col 1, status in cols 2/3, year-shift in col 4
- Header row sticky inside scrollable container
- Applies to all 7 wizards (4 Decision + 3 Capacity)

**Why this over vertical cards:** scales to 9 metrics + 2-3 goal rows without exploding vertical height; matches "Smart Spreadsheet" principle from DESIGN.md §2; PRD already wrote the canonical example.

### 2.3 9-metric layout — **Per PRD §5.4**

| Position | Element |
|---|---|
| Hero pair (top of right panel) | Net Worth · Modal Siap Distribusi |
| 6-card grid below hero | DSR · Runway · Savings Rate · DAR · Safe Haven · **Allocation Discipline** |
| Alongside Goal cards section | **Goal Health composite chip** (% goals On-Track) |

> ⚠️ Stitch screens only render 5 cards in the grid. Add **Allocation Discipline** as the 6th. Add **Goal Health** as a chip in the Goals row. These two are the missing pieces from §5.4.

---

## 3. Stitch Outputs — Keep / Drop / Salvage

### KEEP (faithful to spec)

| File | What it gives us |
|---|---|
| `cermat_beranda` | Landing pattern: hero copy, dual-CTA, trust panel, footer disclaimer |
| `cermat_snapshot_debt_gadai_entry_simulation` | Canonical Snapshot full layout (left input + right dashboard) |
| `cermat_snapshot_add_cicilan_simulation` | Inline KPR simulation card pattern (left panel) |
| `cermat_snapshot_add_gadai_simulation_state` | Single-gadai simulation pattern |
| `cermat_snapshot_tambah_emas_simulation` | Wizard drill-down chrome + OJK disclaimer banner |
| `cermat/DESIGN.md` | Design tokens (colors, type, spacing, radius) — adopt as-is |

### DROP (hallucinations)

| File | Why dropped |
|---|---|
| `cermat_snapshot_synced_simulated` (whole screen) | Avatar icon (no auth), "LIVE SYNC" indicator (no cloud), "+2.4% vs last month" (no history), **"Disarankan" pill (prescriptive)**, **"Cermat terdaftar dan diawasi oleh OJK" footer (false regulatory claim)** |
| `cermat_snapshot_multiple_gadai_simulation` | Multi-scenario sim (#1 + #2) violates MVP §5: "Current vs. one scenario only" |

### SALVAGE (extract pattern from a dropped screen)

| Source | Salvage |
|---|---|
| `cermat_snapshot_synced_simulated` | The wizard modal pattern at the bottom (Simulasi Pelunasan KPR with 3-col compare). Reformat as 4-col table per §2.2 above, keep the chrome (modal header, close button, footer with Batal/Terapkan). |

### FIX (small hallucinations across kept screens)

- Strip "LIVE" badge from Crypto (BTC) row — MVP cuts crypto live prices; manual entry only
- Beranda hero text `[KPR / Gadai / Cicil]` literal brackets — replace with rotating word or chip selector
- Add Allocation Discipline + Goal Health (§2.3)

---

## 4. Screens to Extrapolate at Implementation

Stitch did not generate, but patterns from kept screens extrapolate cleanly:

| Missing screen | Extrapolate from |
|---|---|
| **Goals page** (Mode 3 — CRUD, FI auto-formula, bucket tagging) | Snapshot left/right split: left = goal form (type, target, date, bucket tags), right = goal cards + Goal Health chip + projected timeline |
| **Wizard: Mau Gadai Emas** (dedicated) | Tambah Emas drill-down chrome + 4-col delta table |
| **Wizard: Mau cicil** | KPR inline card pattern, lifted into dedicated wizard chrome |
| **Wizard: Custom Skenario** | Same chrome + free-form delta sliders |
| **Wizard: Max Utang Aman** (Capacity) | Capacity reveals as a panel result, not a side-by-side. Show input form (target DSR threshold) + 3-row output table (max cicilan/bln; equivalent KPR; equivalent KPM) |
| **Wizard: Lunasi Utang** | Selectable debt-row picker + slider for partial → 4-col delta table |
| **Wizard: Modal Likuid Options** | Existing "Opsi yang Bisa Dihitungkan" panel on Snapshot already does this. Drill-down per option = Tambah Emas pattern. |
| **Edge states** (stale price badge, empty form, gold API fail, etc.) | Standard component variants per PRD §5.4–5.8 |
| **Mobile fallback** | "Better on Desktop" advisory + stacked single-column flow — design at MVP Day 11 |

---

## 5. OJK Copy Guard — Reminder

Every Insight string must pass these:

✅ State a fact, threshold, or computed result
❌ Use prescriptive verbs: *sebaiknya*, *disarankan*, *kamu harus*, *rekomendasi kami*

❌ Claim regulatory status: *"terdaftar dan diawasi oleh OJK"*, *"diawasi OJK"*, *"berizin OJK"*
✅ Disclaim: *"Cermat tidak berafiliasi dengan Otoritas Jasa Keuangan (OJK). Data diproses lokal di perangkat kamu. Hasil simulasi adalah estimasi berdasarkan input."*

Audit ~50 copy strings before Day 11 ship (MVP §4 Day 9 milestone).

---

## 6. Open Items for Implementation Phase

These can wait until coding starts but should be resolved before final polish:

1. **Brand name lock** — *Cermat* is working title (MVP §6.1)
2. **FI multiplier** — 300 fixed or expose 240/300/360 slider (MVP §6.3)
3. **Modal Siap formula edge case** — subtract dana darurat 3–6 bln buffer? (PRD §11.4)
4. **Mobile breakpoint behavior** — bottom-nav vs hamburger (§2.1 above)
5. **9-metric: when do "—" / disabled states show?** (e.g., Pengeluaran empty → DSR/Savings/Runway show "—")

---

**Next step:** Move to code. This addendum + the kept Stitch HTML files + the design tokens from `cermat/DESIGN.md` are sufficient reference. Goals + remaining wizards extrapolate from established patterns.
