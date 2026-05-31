# Cermat — Product Requirements Document

**Status:** Draft
**Last updated:** 2026-05-26
**Owner:** TBD
**Working brand name:** **Cermat** *(Indonesian: careful, prudent, meticulous)*
**Companion docs:**
- `personal-wealth-platform-mvp-en.md` — concept brief
- `personal-wealth-platform-design-guidelines-en.md` — design brief *(to be written)*

---

## 1. Problem & Personas

### 1.1 Problem

Indonesian adults track their finances, set life goals, and make 1–3 large, infrequent, mostly-irreversible financial decisions every year. Their toolkit for the full workflow is fragmented:

- **Stockbit / Bibit / Pluang** focus on managing existing portfolios — no scenario simulation, no goal-aware reasoning, no capacity reasoning
- **Loan calculators** give isolated cicilan numbers — they don't tell you whether *your* finances absorb them or what they do to your goals
- **Spreadsheets** handle accumulation tracking well, but break on share, can't simulate scenarios, and don't compute capacity-based options
- **Bank / dealer projections** are optimistic by design
- **Friend / family anecdotes** are heavily survivor-biased
- **Nothing answers "apa yang bisa gw lakukan sekarang?"** — capacity questions like *"berapa max utang yang bisa gw tambah?"* or *"apa yang bisa gw lakukan dengan modal likuid gw?"* are uniquely absent from existing tools
- **No single tool integrates** snapshot + accumulation + goal tracking + scenario simulation + capacity reasoning in one privacy-respecting product

Cermat is that unified product.

### 1.2 Co-Primary Personas

**"Sari" — 28–38, dual-income household, salaried or freelancer**
- Monthly household income IDR 15–50jt
- Currently considering one of: KPR, KPM, Gadai Emas, increased monthly investment
- Has savings, maybe gold, maybe basic Reksa Dana — not a hardcore investor
- Distrusts apps that ask for bank credentials
- Wants both forward guidance (*"aman gak kalau gw ___?"*) AND reverse guidance (*"berapa max yang aman?"*)

**"Bayu" — 30–45, Indonesian retail investor running an accumulation thesis**
- Monthly income IDR 25–80jt (often non-salary)
- Holds 10–25 IDX stocks with explicit target weights per emiten
- Uses gold as collateral (Gadai)
- Tracks Safe Haven vs. Productive ratio as risk posture
- Currently maintains a complex personal xlsx
- Wants per-emiten depth + goal-aware decision support + capacity reasoning

**Both personas served by one product** via progressive disclosure. Basic users see Snapshot + Wizards. Advanced users unlock Per-Emiten and Multi-Goal tracking. No "Pro mode" toggle — the UI scales gracefully.

### 1.3 Why now

- Indonesian household debt-to-GDP rose meaningfully 2023–2025; KPR + paylater + pinjol adoption surging — and they coexist in the same household
- Gold volatility (2024–2026) made Gadai an active funding tool
- Local fintech distrust persists after recurring data breaches
- AI-assisted development makes a competent solo build feasible in days

---

## 2. Goals & Non-Goals

### 2.1 Goals

1. User completes Snapshot (basic OR per-emiten depth) in <10 minutes
2. User defines 1+ goal in <2 minutes (FI goal auto-computes target = expenses × 300)
3. User runs a **decision wizard** ("Mau X?") in <2 minutes; sees side-by-side with delta on all metrics + goal impact
4. User runs a **capacity wizard** ("Bisa apa?" / "Berapa max?") in <2 minutes
5. **8 health metrics + 1 capacity metric (Modal Siap Distribusi)** with thresholds + plain-Indonesian explainers where applicable
6. **Live IDX prices** for per-emiten stocks (Yahoo Finance via `BBCA.JK`), live USD/IDR, live gold/gram
7. xlsx export contains snapshot + per-emiten + goals + scenarios + capacity outputs — opens cleanly in Excel/Sheets
8. **Fully usable without sign-up**, no server-side user data
9. **OJK-risk audited** — no prescriptive advice anywhere

### 2.2 Non-Goals

- User accounts, login, password management
- Server-side persistence of user financial data
- Bank linking / Open Finance / aggregation
- Investment / insurance product recommendations *(OJK red line)*
- Tax estimation (PPh21, capital gains, dividend tax)
- Native mobile (iOS / Android)
- Push notifications, scheduled reports, email alerts
- xlsx **import** / round-trip
- US stocks, international equities
- Crypto live prices *(manual entry sufficient)*
- Sankey diagram, historical timeline
- Per-emiten accumulation ladders (10/30/50/70/80/100% modal milestones)
- localStorage autosave
- Multi-scenario comparison (3-way+)
- English language toggle
- Real-time intraday tick data — 15-min Yahoo delay sufficient
- Shareable read-only links

---

## 3. The Core Loop — Track → Plan → Decide → Discover

> **The architectural decision of this product.** Everything else serves this loop.

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  STEP 1 — TRACK / SNAPSHOT (5–10 min)                                 │
│     Input: cash, gold (live), per-emiten stocks (live IDX),           │
│            RD, SBN, property, vehicles, pension                       │
│            + expenses + debts (Cicilan Aktif + Gadai)                 │
│     Output: 9 metrics including Modal Siap Distribusi                 │
│                                                                       │
│  STEP 2 — PLAN / GOALS (2 min/goal)                                   │
│     Define: DP Rumah / Dana Pendidikan / FI / Custom                  │
│     FI auto-formula: target = expenses × 300                          │
│     Tag bucket: which assets count toward this goal                   │
│     System computes: progress, monthly contribution needed,           │
│                      projected completion date                        │
│                                                                       │
│  STEP 3A — DECIDE / DECISION WIZARDS (forward: "Mau X?")              │
│     KPR / Gadai Emas / Cicilan / Custom                               │
│     Side-by-side: "Posisi Sekarang" | "Setelah Skenario"             │
│     Delta on every metric AND every goal projection                   │
│                                                                       │
│  STEP 3B — DISCOVER / CAPACITY WIZARDS (reverse: "Bisa apa?")         │
│     Max Utang Aman / Lunasi Utang / Modal Likuid Options              │
│     Compute: "what is the maximum / optimal / available?"             │
│                                                                       │
│  STEP 4 — DOWNLOAD                                                    │
│     User keeps the xlsx as record. App keeps nothing.                 │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 4. User Flow

### 4.1 First-time use — happy path

| # | User action | System response | Mental state |
|---|---|---|---|
| 1 | Lands on `cermat.id` | Hero copy: *"Aman gak kalau gw [KPR / Gadai / Cicil]? Berapa max utang yang aman? Cek dalam 10 menit."* + 2 CTAs: *"Mulai dari Snapshot"* / *"Coba dengan data contoh"* | Curious |
| 2 | Picks "Mulai dari Snapshot" | Form opens (left), dashboard placeholders on right with "—" | Engaged |
| 3 | Fills Penghasilan | Income + dividend estimasi populated | Building |
| 4 | Fills Aset Likuid + gold | Net Worth computing; live gold rate visible; **Modal Siap Distribusi** starts populating | First "aha" |
| 5 | Expands "Saham per-emiten" — adds BBCA 162 lot target 450 | Live BBCA price fetched; equity + accumulation % render | Trust signal (live data) |
| 6 | Fills Pengeluaran + Utang | DSR, Savings Rate, Runway activate with colors | Self-recognition |
| 7 | Sees 9 metrics computed | Hero Net Worth + Modal Siap Distribusi prominent + 7 supporting cards, allocation donut, Safe Haven bar | **★ Critical baseline moment** |
| 8 | Goes to "Goals" tab → adds Financial Independence goal | FI target auto-computes: Rp 5.4M (= pengeluaran Rp 18jt × 300). Progress 18%, kontribusi 4.2jt/bln needed. | Plan becomes tangible |
| 9 | Clicks "Coba Simulasi → Mau KPR" *(Decision Wizard)* | Wizard opens; current state mirrored on right | Curious + slightly anxious |
| 10 | Inputs KPR: 1.2M / 20% DP / 20 yr / 7% | Side-by-side: DSR 22% → 38% (Sehat → Waspada). Runway 8 → 4 mo. **Goal FI: mundur 3 tahun.** | **★★ THE killer moment** |
| 11 | Tweaks tenor to 25 yr | DSR drops to 33%; FI shift becomes 2 years instead of 3 | Engaged, exploring |
| 12 | Goes back, tries "Max Utang Aman" *(Capacity Wizard)* | Panel: *"Berdasarkan gaji + cicilan aktif, max cicilan baru biar DSR Sehat: Rp 3.9jt/bln. Setara KPR ~Rp 480jt @ 15 thn @ 7%."* | Reverse insight |
| 13 | Tries "Modal Likuid Options" | Panel auto-generates: *"Modal Siap Rp 52jt. Opsi: lunasi KK → DSR −2pp; prepay KPR → tenor mundur 14 bln; beli BBCA 30 lot → bobot naik..."* | Discovery |
| 14 | Clicks "Download .xlsx" | `cermat-snapshot-2026-05-26.xlsx` downloads — 7 sheets | Ownership |
| 15 | Closes tab | Nothing persists | Done |

**Make-or-break moments:**
- **Step 10**: First decision wizard with goal impact + threshold flip
- **Step 13**: First time user sees "what they CAN do" instead of just "what they SHOULD know"

### 4.2 Alternate flow — "Coba dengan data contoh"

Sample profile pre-fills: gaji 18jt, emas 30gr, BBCA 50 lot / target 200, tabungan 80jt, KPR sisa 600jt, goal "FI by 2035" tagged.

User can jump straight to wizards. CTA at the bottom: *"Suka tools-nya? Ganti dengan data kamu sendiri →"*

### 4.3 Edge cases

| Scenario | Behavior |
|---|---|
| Accidental refresh | `beforeunload` prompt: *"Data kamu belum tersimpan. Yakin refresh?"* |
| Mobile user | Stacked layout; functional with hint *"Lebih nyaman di desktop"* |
| User skips Pengeluaran | DSR / Savings / Runway show "—"; Net Worth + DAR still compute; **FI auto-formula disabled until expenses entered** |
| Gold price API fails | Cached + STALE badge + manual override |
| IDX price API fails per-ticker | Cached value + STALE badge per row + manual price field |
| IDX API fully down | Banner + global manual override on all per-emiten cards |
| User runs wizard before completing Snapshot | Banner: *"Lengkapi Penghasilan & Pengeluaran biar simulasi akurat"* + skip option |
| Wizard input pushes DSR >100% | Red display, copy: *"Skenario ini melebihi kemampuan bayar — DSR tembus 100%"* (descriptive, no advice) |
| **Max Utang Aman computes 0 or negative** | Copy: *"DSR kamu sudah di atas threshold sehat (>30%). Tidak ada ruang untuk tambah cicilan tanpa lewat Waspada."* |
| **Lunasi Utang exceeds Modal Siap** | Copy: *"Modal Siap (Rp 52jt) tidak cukup untuk lunasi total Rp 75jt. Bisa lunasi sebagian."* + slider for partial |
| Goal target date in the past | Validation: pick future date |
| Goal bucket assets total 0 | Show progress 0%, copy: *"Bucket kosong — pilih aset yang dihitung untuk goal ini"* |

### 4.4 Return visits

No return continuity in this scope. xlsx re-import is in the roadmap.

---

## 5. Functional Requirements

### 5.1 Snapshot Module — input form

Organized into 4 collapsible groups in the left panel:

#### 5.1.1 Penghasilan (Monthly, IDR)
| Field | Notes |
|---|---|
| Gaji Bersih | After PPh21 |
| Penghasilan Lainnya | Sampingan, sewa, dll — single field |
| Estimasi Dividen Saham | Auto-computed from per-emiten section (see §5.7). Mode A (assumption yield) / Mode B (per-emiten manual). |

#### 5.1.2 Aset (Likuid + Non-Likuid)

**Likuid** — every row carries an optional `currency` field (Day 3): IDR / USD / SGD / EUR / JPY / KRW. Foreign rows display `≈ Rp X` derived via live FX (`/api/prices/fx`, see §8 + tech-design §7.3). Stale rates show "≈ kurs belum kebaca" instead of an IDR figure, and the row contributes 0 to aggregates until rates load.

| Type | Input | Auto-calc | Live source |
|---|---|---|---|
| Kas / Tabungan | Amount + currency (multi) | IDR via FX | Yahoo FX |
| Deposito | Amount + currency (multi) | IDR via FX | Yahoo FX |
| Reksa Dana | Amount + currency (multi) | IDR via FX | Yahoo FX |
| SBN | Amount + currency (multi) | IDR via FX | Yahoo FX |
| Crypto (manual) | Amount + currency (multi) | IDR via FX | Yahoo FX |
| **Emas** | **Grams per category** (digital / fisik Antam / perhiasan 18K / 14K / 10K — Day 3 split) | **IDR per category × rate** (see §5.3.2 + tech-design §6.5) | Pegadaian (digital + Antam table) |
| **Saham (per-emiten)** | See §5.7 | See §5.7 | Yahoo Finance |

**Non-Likuid** (properti / kendaraan / pensiun): IDR only — Indonesians typically hold these in rupiah; multi-currency would over-engineer.

**Non-Likuid:** Properti / Kendaraan / Dana Pensiun

#### 5.1.3 Pengeluaran (Monthly, IDR)
- **Kebutuhan Pokok** (fixed) — manual
- **Lifestyle / Variabel** — manual
- **Cicilan Aktif (total)** — *auto, read-only*: `Σ cicilan_per_bulan` dari modul Cicilan Aktif (§5.3.1). **Tidak diinput manual di sini** — cicilan dientri sekali saja di §5.3.1 (hindari double-count).

> **Total Pengeluaran** = Kebutuhan Pokok + Lifestyle + Cicilan (auto). Ini satu-satunya definisi "pengeluaran bulanan" di seluruh app — dipakai oleh **Runway** (total burn) dan **Savings Rate**. DSR memakai komponen Cicilan saja (`Σ cicilan ÷ penghasilan`), bukan Total Pengeluaran.

#### 5.1.4 Utang

Two structured sub-modules. No flat outstanding fields — everything goes through one of these so DSR / DAR / prepay calcs have the data they need:

- **Cicilan Aktif** — one row per amortizing debt: KPR / KPM / Pinjaman Bank-KTA / Pinjol / Paylater / KK / Lain (see §5.3.1)
- **Gadai Pegadaian** — collateralized gold pawn (see §5.3.2)

Both modules feed Total Utang (DAR) and Cicilan Aktif Total (DSR) aggregates in §5.4, and both expose selectable rows to the Lunasi Utang Wizard (§5.2.6) and Modal Options panel (§5.2.7).

**Rules:** Empty = 0, inline editing, auto-format IDR, lenient parsing (`25jt`, `25 juta`, etc.).

### 5.2 Scenario Simulator — Two Wizard Families, 7 Wizards Total

Same structural pattern for all wizards: modal opens, snapshot mirrored on right, wizard form on left, side-by-side comparison panel below, "Simpan Skenario" / "Edit Snapshot" / "Tutup" at bottom.

### 5.2.A Decision Wizards (4) — *forward-looking* "Mau gw X?"

**Each reports goal impact in addition to metric deltas.** Example KPR output:

| | Sebelum | Sesudah | Δ |
|---|---|---|---|
| Net Worth | Rp 391jt | Rp 391jt | — |
| DSR | 22% (Sehat) | 38% (Waspada) | ▲ +16 |
| Runway | 8 bulan | 4 bulan | ▼ −4 |
| DAR | 12% | 45% | ▲ +33 |
| Modal Siap Distribusi | Rp 52jt | Rp 28jt | ▼ −24 (DP) |
| **Goal: FI 2035** | On-Track | Off-Track (mundur ~3 tahun) | ▼ |

#### 5.2.1 Wizard "Mau Ambil KPR"
**Inputs:** Harga rumah, DP%, Tenor, Suku bunga, Tipe bunga (Anuitas / Flat / Floating)
**Computed:** Cicilan/bulan, Total bunga
**Effect:** Net Worth (property +, DP cash −, KPR debt +); DSR + new cicilan; goal projections shift

#### 5.2.2 Wizard "Mau Gadai Emas"
**Inputs:** Gram pawned, Tempo, Bunga/bulan (default 1.5%), Taksiran% (default 80%)
**Computed:** Modal cair, Total Beban, Defisit/bulan, Rasio Tertahan
**Effect:** Kas + Modal cair; Emas Tertahan + grams; Utang Gadai + Modal

#### 5.2.3 Wizard "Mau Cicil"
**Inputs:** Kategori, Harga, DP, Tenor, Bunga
**Computed:** Cicilan/bulan
**Effect:** Standard cicilan effect on Net Worth + DSR

#### 5.2.4 Wizard "Custom Skenario"
**Inputs:** Free-form: pick fields, adjust by delta or new value, label scenario
**Effect:** Apply deltas, recompute all metrics + goals

### 5.2.B Capacity Wizards (3) — *reverse-looking* "Bisa apa?" / "Berapa max?"

These wizards do not take a hypothetical *decision* as input — instead they **derive what the user CAN do** given current state.

#### 5.2.5 Wizard "Max Utang Aman"

**Inputs:** Choice of debt type (KPR / KPM / Cicil umum). For KPR: tenor + assumed rate (defaults 15 thn / 7%).
**Computed:**
```
max_new_cicilan = (Penghasilan × 0.30) − Cicilan_Aktif
→ reverse-derive principal from cicilan + tenor + rate
```
**Output (descriptive):**
> *"Berdasarkan gaji Rp 18jt + cicilan aktif Rp 1.5jt, max cicilan baru biar DSR tetap di zona Sehat (<30%): Rp 3.9jt/bln. Setara KPR ~Rp 480jt @ 15 tahun @ 7%, atau cicil mobil ~Rp 200jt @ 5 tahun @ 8%, atau cicil elektronik ~Rp 70jt @ 24 bulan."*

If user already at >30% DSR: *"DSR kamu sudah di atas threshold sehat. Tidak ada ruang untuk tambah cicilan tanpa lewat Waspada."*

#### 5.2.6 Wizard "Lunasi Utang Sekarang"

**Inputs:** Select debt row from §5.3.1 Cicilan Aktif OR §5.3.2 Gadai. Full or Partial amount. Slider from 0 to min(debt_principal, Modal_Siap).
**Computed:**
- Kas reduced by repayment amount
- Debt principal reduced (`sisa_pokok` on the selected row)
- Recompute behavior **derived from `jenis_bunga`** on the selected row:
  - **Anuitas / Flat / Floating**: toggle — tenor shortens (cicilan remains) OR cicilan reduced (tenor remains). Default: tenor shortens.
  - **Revolving** (KK / Paylater / sebagian Pinjol): sisa pokok reduced directly; minimum-payment cicilan recalculated if user provided a `min_payment_pct`, else assumed unchanged.
  - **Gadai**: see §5.3.2 — partial tebus reduces grams tertahan proportionally.
- DSR + DAR shift; Modal Siap Distribusi updates
**Output:** side-by-side metric impact + descriptive summary.
> *"Lunasi Kartu Kredit Rp 8jt dari Modal Siap (Rp 52jt → Rp 44jt). DSR turun 33% → 31%, masih di zona Waspada tapi lebih dekat ke Sehat. Goal FI tidak terdampak."*

#### 5.2.7 Wizard "Modal Likuid Options" — auto-generated panel

Not user-input-driven. Auto-analyzes current state and lists deployable options with impact preview. Always visible on dashboard when Modal Siap > 0.

**Display:**
> **Modal Siap Distribusi: Rp 52jt**
>
> Beberapa opsi yang bisa dihitungkan:
>
> 1. **Lunasi Kartu Kredit (Rp 8jt)** → DSR 33% → 31%; sisa modal Rp 44jt
> 2. **Prepay KPR (Rp 20jt)** → tenor mundur ~14 bulan ATAU cicilan turun ~Rp 200rb/bln; sisa modal Rp 32jt
> 3. **Beli BBCA 30 lot (Rp 18jt)** → bobot live 15% → 18%, progress to target 36% → 43%
> 4. **Tambah ke Reksa Dana** → kontribusi Goal FI; +Rp 52jt mendorong proyeksi FI ~6 bulan
> 5. **Tambah Deposito** → kontribusi Goal FI; +Rp 52jt mendorong proyeksi FI ~6 bulan

Each option is a clickable button that opens the relevant wizard with values pre-filled, OR applies the option directly with a confirmation modal.

**Insight copy rules apply** — never *"sebaiknya lunasi KK dulu"*, always *"opsi yang bisa dihitungkan"*.

### 5.3 Active Debt Modules

Two structured sub-modules — amortizing debt (§5.3.1) and collateralized gold pawn (§5.3.2). Both feed DSR + DAR (§5.4) and both expose selectable rows to the Lunasi Utang wizard (§5.2.6) and Modal Options panel (§5.2.7). All non-Gadai active debt routes through §5.3.1 — there are no flat "Sisa KPR" / "Sisa KPM" fields anywhere else in the app.

#### 5.3.1 Cicilan Aktif

Row-based table — one row per active amortizing debt. Each row:

| Field | Definition | Manual / Auto |
|---|---|---|
| `tipe` | enum: `KPR` / `KPM` / `BANK_KTA` / `PINJOL` / `PAYLATER` / `KK` / `LAIN` | Manual |
| `label` | string (e.g., "KPR BCA Bandung 2024") | Manual |
| `sisa_pokok` | Outstanding principal (IDR) | Manual |
| `cicilan_per_bulan` | Monthly installment (IDR) | Manual |
| `suku_bunga` | Annual rate (%) | Manual |
| `tenor_sisa_bulan` | Remaining tenor in months | Manual |
| `jenis_bunga` | enum: `Anuitas` / `Flat` / `Floating` / `Revolving` | Manual |
| `total_beban_sisa` | `cicilan_per_bulan × tenor_sisa_bulan` | Auto |
| `tanggal_jatuh_tempo` | ISO date (optional, for sorting / payoff timeline) | Manual |

**Aggregations:**
- `Cicilan Aktif Total` (DSR numerator, §5.4) = Σ `cicilan_per_bulan` across all rows
- `Utang Cicilan Total` = Σ `sisa_pokok` across all rows → combined with Gadai outstanding (§5.3.2) for **Total Utang** used in DAR + Net Worth + everywhere else

**Display:** subsection in Snapshot left panel — collapsed row shows `tipe + label + sisa pokok + cicilan/bln`; expanded reveals bunga + tenor + jenis bunga. Quick-add buttons for common types (KPR, KPM, KK, Pinjol).

**Per-`jenis_bunga` behavior:**

| Jenis | §5.2.6 Lunasi behavior | §5.2.7 Modal Options behavior |
|---|---|---|
| **Anuitas / Flat** | Toggle: tenor mundur ATAU cicilan turun. Standard amortization recompute on the selected row. | *"Prepay X → tenor mundur ~N bulan ATAU cicilan turun ~Rp Y/bln"* |
| **Floating** | Same as Anuitas, but proyeksi pakai current rate; badge: *"Bunga floating — proyeksi pakai rate sekarang"* | Same as Anuitas + floating badge |
| **Revolving** (KK / Paylater / sebagian Pinjol) | `tenor_sisa_bulan` optional (auto-estimated months-to-clear at minimum payment if `suku_bunga` provided); prepay → reduces `sisa_pokok` directly, no tenor recompute | *"Lunasi X → sisa pokok turun Rp N; minimum payment ikut turun jika bank pakai % saldo"* |

**Threshold:** no per-row threshold (aggregate DSR is the gate). Optional contextual line on the Snapshot UI: *"Cicilan terbesar: KPR Rp 4.2jt/bln (47% dari total cicilan)."*

**Edge cases:**

| Scenario | Behavior |
|---|---|
| Row with `cicilan_per_bulan = 0` and `tenor_sisa = 0` | Treated as paid-off, excluded from DSR. Banner: *"Row ini sudah lunas — hapus atau pindahkan ke Catatan."* |
| Row with `suku_bunga` blank, `jenis_bunga = Revolving` | Still usable for §5.2.6 (sisa pokok reduction); §5.2.7 prepay-tenor-impact disabled with note: *"Isi suku bunga biar dampak prepay ke tenor terhitung."* |
| Row marked `Floating` with no rate | Badge: *"Isi suku bunga sekarang biar proyeksi akurat"*; calcs fall back to last entered rate or system default. |
| Row with `cicilan_per_bulan` > `sisa_pokok` (overpaying short-tenor) | Validation: warn — likely user input error. |
| Sum of `cicilan_per_bulan` > Penghasilan | DSR > 100%, red display, copy: *"Total cicilan melebihi penghasilan — periksa data."* |

**OJK copy guard (§9 applies):** descriptions describe state of each row; never prescribe *"sebaiknya lunasi pinjol dulu"* even though pinjol typically has higher rates. The Modal Options ranking convention is debt-reduction-then-asset-acquisition, not high-rate-first.

#### 5.3.2 Gadai Module

Multi-row table — one row per active gadai contract (Day-3 revision; original spec was single-row + gold-only). Each row carries a **jaminan kind** that determines which fields are active:

| Field | Definition |
|---|---|
| `label` | Free text (e.g., "Pegadaian Bandung 2024") |
| `jaminan` | Enum: `emas:digital` / `emas:fisikAntam` / `emas:perhiasan18K` / `emas:perhiasan14K` / `emas:perhiasan10K` / `properti` / `kendaraan` |
| `gramTertahan` | Grams pawned in this contract — **emas-* jaminan only**. Derived constraint: ≤ corresponding `emas.{cat}Gram` (warning if exceeded) |
| `asetRefId` | Link to an existing `asetNonLikuid.properti[]` or `asetNonLikuid.kendaraan[]` row — **properti/kendaraan only**. User picks from a dropdown of already-entered aset rows; the aset stays in its place (still in Net Worth), only the piutang sits on utang side |
| `piutangIdr` | Outstanding loan principal (IDR) |
| `bungaPerBulanPercent` | Default 1.5 (Pegadaian standard for emas; user-editable for non-Pegadaian or non-emas contracts) |
| `tempoBulan` | Loan term |
| `tanggalJatuhTempo` | Optional ISO date |

**Aggregates** (per Snapshot panel + dashboard):
- `Total tertahan` = Σ `gramTertahan` across emas-jaminan rows only (gram-comparable)
- `Total piutang` = Σ `piutangIdr` across all rows (any jaminan)
- `Rasio Tertahan` = `(Σ pawned emas gram) ÷ (Σ owned emas gram across all 5 categories + pawned)` — null when user owns no emas at all

**Cadangan emas** (the "at home" portion shown per category in EmasPanel) is **derived**, not stored: `emas.{cat}Gram − pawnedGramOf(snap, cat)`. The user inputs total ownership in each emas category once; pawning is a separate action that subtracts implicitly.

Threshold for Rasio Tertahan: <50% Aman · 50–70% Waspada · >70% Risiko Likuidasi (descriptive — never *"sebaiknya tebus dulu"*).

Properti / kendaraan UX guard: when the user picks `properti` jaminan but has no properti rows in `asetNonLikuid`, the row shows an empty-aset hint ("Belum ada properti di snapshot. Tambah dulu di Aset non-likuid → Properti.") instead of a broken dropdown. Same pattern for kendaraan and for empty emas categories (parallel UX across all jaminan kinds).

#### 5.3.3 Utang Pribadi (informal debt)

Day-3 addition (post-review). A separate sub-module for non-bank / informal debt — pinjam ke teman, keluarga, bos, atau pribadi — that doesn't fit Cicilan Aktif's amortization model (no fixed bunga, optional tenor, optional monthly payment).

| Field | Definition |
|---|---|
| `label` | Free text (e.g., "Pinjam Bro Andi", "Utang ke bos") |
| `sisaPokok` | Outstanding owed amount (IDR) |
| `cicilanPerBulan` | Optional — if set, feeds DSR + Total Pengeluaran the same way as Cicilan Aktif rows |
| `tempoBulan` | Optional |
| `tanggalJatuhTempo` | Optional |

**Contribution to metrics:**
- **Total Utang** (Net Worth, DAR): `Σ sisaPokok`
- **Total Pengeluaran** (Runway, Savings Rate): `Σ cicilanPerBulan` where set
- **DSR numerator**: `Σ cicilanPerBulan` where set (treated identically to formal cicilan)

No threshold; no bunga; no jenis_bunga. Pure liability tracker. The aggregate strip in the panel shows total pokok + total cicilan/bulan.

### 5.4 Metrics — Catalog (9 metrics)

| # | Metric | Formula | Thresholds |
|---|---|---|---|
| 1 | **Net Worth** | `Total Aset − Total Utang` | Negative red; positive green |
| 2 | **DSR** | `Cicilan Aktif ÷ Penghasilan` | <30% Sehat · 30–40% Waspada · >40% Bahaya |
| 3 | **Financial Runway** | `Aset Likuid ÷ Total Pengeluaran` (months) — **total burn** (Pokok + Lifestyle + Σ Cicilan); cicilan tetap dihitung penuh karena kreditur tidak ikut pause saat income berhenti | ≥6 bln Sehat · 3–6 Waspada · <3 Bahaya *(satu set threshold — tanpa cabang tanggungan)* |
| 4 | **Savings Rate** | `(Penghasilan − Total Pengeluaran) ÷ Penghasilan` — Expense = Total Pengeluaran (termasuk cicilan) | ≥20% / 10–20% / <10% |
| 5 | **DAR** | `Total Utang ÷ Total Aset Kotor` | <30% / 30–50% / >50% |
| 6 | **Safe Haven Ratio** | `(Kas + Emas + RD + Deposito) ÷ Total Aset` | Posture: ≥60% Konservatif · 40–60% Seimbang · <40% Agresif |
| 7 | **Allocation Discipline** | **rata-rata** `(1/n)·Σ \|Bobot Live − Target Bobot\|` antar saham (satuan pp) — *average*, bukan sum, biar threshold pp tetap konsisten berapa pun jumlah emiten; satuan pp sama seperti drift-dot per-kartu (§5.7) | <5pp Tight · 5–15pp Drift · >15pp Off-Plan |
| 8 | **Goal Health (composite)** | % of goals "On-Track" | ≥80% Sehat · 50–80% Mixed · <50% Off-Plan |
| 9 | **Modal Siap Distribusi** | `Kas + Deposito + RD + Crypto Liquid` (multi-currency rows converted to IDR via live FX, §8). **D0.3 closed (Day 3): no auto-subtract of emergency buffer.** Buffer surfaces as advisory copy only — user decides. | Capacity number, no threshold; companion note: *"Pertimbangkan keep dana darurat 3–6 bulan pengeluaran terpisah."* |

**Layout:** Net Worth and Modal Siap Distribusi are **prominent absolute numbers** at the top of the dashboard (paired). Below them: 6 health metrics in a grid (DSR, Runway, Savings Rate, DAR, Safe Haven, Allocation Discipline). Goal Health composite shown alongside the Goal cards panel.

Note on metrics 6, 7, 8, 9: posture / discipline / capacity metrics, not "safety" — Insight copy must describe state, not prescribe correction.

### 5.5 Visualization

- **Allocation Donut** — % breakdown by category
- **Side-by-side comparison panel** — for scenario results (hero demo visual)
- **Threshold bar** — horizontal bar per metric, thermometer-style
- **Per-emiten progress bars** — one row per stock, lots/target ratio
- **Safe Haven vs. Produktif stacked bar** — single horizontal bar
- **Goal progress bars** — one per goal with projected completion date
- **Modal Likuid Options panel** — persistent on dashboard, auto-generated deployable options list

### 5.6 Export

Single button: **"Download .xlsx"** in header.

| Sheet | Purpose |
|---|---|
| `Ringkasan` | Hero: Net Worth, Modal Siap Distribusi, 9 metrics, allocation %, goal summary, Gadai + Cicilan Aktif status, timestamp |
| `Snapshot` | Raw snapshot input |
| `Per-Emiten` | One row per saham: lots, target, bobot, dividend, valuasi, progress |
| `Cicilan-Aktif` | One row per active debt: tipe, label, sisa pokok, cicilan/bln, bunga, tenor sisa, jenis bunga, total beban sisa |
| `Goals` | One row per goal: type, target, bucket, progress, monthly contribution needed, projected completion |
| `Skenario` | Saved decision-wizard scenarios with inputs and before/after metric + goal deltas |
| `Kapasitas` | Capacity wizard outputs: max safe debt, debt-repayment simulations, modal options ranked by impact |
| `_meta` (hidden) | Schema version + JSON state |

**Default filename:** `cermat-snapshot-YYYY-MM-DD.xlsx`

### 5.7 Per-Emiten Stock Module

For each saham row:

| Field | Manual / Auto |
|---|---|
| Emiten (ticker) | Manual |
| Lots Sekarang | Manual |
| Lots Target 100% | Manual |
| Harga Live (Rp/lembar) | Auto — Yahoo Finance |
| Valuasi = Lots × 100 × Harga | Auto |
| Target Bobot % | Manual |
| Bobot Live % | Auto (relative to total saham) |
| Progress to Target % | Auto (Lots Sekarang / Lots Target) |
| Avg Dividend Yield % | Manual (optional) |
| Last Dividen per Lembar (Rp) | Manual (optional) |
| Potential Dividend | Auto (Lots × 100 × Last Dividen) |

**Display:** Saham subsection shows per-emiten cards (collapsed: ticker + lots progress + bobot drift dot + LIVE price). Expanded view shows dividend + drift detail.

### 5.8 Goal Tracking Module (with FI auto-formula)

User adds goals. Each goal:

| Field | Type |
|---|---|
| `goal_type` | enum: `DP_RUMAH` / `DANA_PENDIDIKAN` / `FINANCIAL_INDEPENDENCE` / `CUSTOM` |
| `label` | string (e.g., "DP Rumah Bandung 2028") |
| `target_amount_idr` | number — **auto-computed for FI goals** (see below); manual for others |
| `target_date` | ISO date |
| `bucket_asset_types` | array of asset types/IDs to tag |
| `current_progress` | auto-computed sum of bucket asset values |
| `monthly_allocation_idr` | kontribusi bulanan ke goal ini. **Default = surplus ÷ jumlah goal aktif** (surplus = Penghasilan − Total Pengeluaran §5.1.3); user-editable. `Σ alokasi` semua goal ditampilkan vs surplus (warning deskriptif kalau over-budget). See §5.8.2. |
| `monthly_contribution_needed` | auto = (target − current) ÷ months remaining — kontribusi yang *dibutuhkan* biar tepat waktu (beda dari `monthly_allocation_idr` yang rencana/aktual) |
| `status` | derived: `ON_TRACK` / `AT_RISK` / `OFF_TRACK` — bandingkan `projected_completion_date` vs `target_date` (purely descriptive) |
| `projected_completion_date` | auto — future-value: `current_progress` tumbuh dgn `monthly_allocation_idr` + asumsi return real (§5.8.2) sampai capai target |

#### 5.8.1 Financial Independence — auto-formula

When `goal_type = FINANCIAL_INDEPENDENCE`, `target_amount_idr` defaults to:

```
FI Number = Pengeluaran Bulanan × 300
          (= 25 tahun × 12 bulan, equivalent to the 4% safe withdrawal rule)
```

Displayed: *"FI Number kamu: Rp 5.4M (asumsi pengeluaran bulanan Rp 18jt × 300)."*

User can override the multiplier:
- **240** — conservative (more spending, ~5% withdrawal)
- **300** — default (4% rule)
- **360** — ultra-conservative (3.3% withdrawal)
- Custom number

If Pengeluaran Bulanan is not yet entered, FI goal creation is blocked with prompt: *"Isi Pengeluaran dulu di Snapshot — FI Number dihitung dari pengeluaran kamu."*

**Bucket default for FI goal:** all investment-class assets (RD + Saham + SBN + Deposito + Crypto). User can modify.

**Rules:**
- Multiple goals supported (cap: 5 goals)
- Bucket can include partial asset categories (e.g., 50% of cash + all of RD)
- Goal cards on dashboard show: target amount, % progress bar, projected date, status badge
- Simulator wizards (Decision & Capacity) report **per-goal impact** in the side-by-side panel

**Insight copy rules apply:**
- ✅ *"Goal FI projected selesai 2038 — 3 tahun lebih lambat dari target 2035."*
- ❌ *"Untuk capai goal FI lebih cepat, tambah kontribusi ke RD X."*

#### 5.8.2 Projection model (proyeksi penyelesaian goal)

Satu model untuk semua goal — dipakai goal card **dan** delta wizard (sumber angka *"FI mundur 3 tahun"*).

**Inflow (kapasitas → alokasi):**
- **Surplus bulanan** = `Penghasilan − Total Pengeluaran` (§5.1.3) = kapasitas nabung total.
- Tiap goal punya `monthly_allocation_idr`, **default = surplus ÷ jumlah goal aktif**, editable.
- `Σ monthly_allocation_idr` ditampilkan vs surplus; kalau melebihi → warning **deskriptif**: *"Total alokasi goal (Rp 7jt) lebih besar dari surplus (Rp 6jt)."* (fakta, bukan saran).
- **Kenapa default surplus, bukan input wajib:** biar wizard cascade otomatis — KPR → cicilan↑ → Total Pengeluaran↑ → surplus↓ → alokasi default↓ → proyeksi mundur, tanpa user ngapa-ngapain.

**Asumsi return — satu knob global:**
- `assumed_annual_return_real` (default **5%**, *real* / sudah dipotong inflasi), user-editable, ditandai **pill ESTIMASI** + disclaimer.
- Default *real* (bukan nominal) supaya inflasi ke-handle diam-diam — penting buat FI horizon panjang (target hari-ini ≠ target 2050).
- Goal berbasis kas (mis. DP rumah di deposito): user bisa turunin ke ~0.

**Formula:**
```
surplus         = Penghasilan − Total Pengeluaran
inflow_goal     = monthly_allocation_idr            (default surplus ÷ N goal aktif)
projected_date  = future_value(current_progress, inflow_goal, return_real) capai target_amount
status          = projected_date vs target_date → On-Track / At-Risk / Off-Track
```

**Wizard delta** (mis. Mau KPR): DP nyedot `current_progress` bucket + cicilan baru ngecilin surplus → `inflow_goal`↓ → `projected_date` mundur. Selisih tahun = *"FI mundur ~N tahun"*.

**Unreachable:** kalau `inflow_goal ≤ 0` atau growth ga nyampe target → `projected_date = null`, card tampil *"Belum tercapai dengan alokasi sekarang"* (deskriptif, tanpa saran).

**OJK:** semua deskriptif & berbasis asumsi yang user atur sendiri. ✅ *"Proyeksi selesai 2038 (asumsi return riil 5%, kontribusi Rp Xjt/bln)"* — ❌ NEVER *"kamu harus nabung lebih"*. Angka proyeksi **selalu** pakai ESTIMASI pill.

**Out of scope (Phase 2+), sengaja dihindari di MVP:** return per-bucket (blended), rentang volatilitas (pesimis/ekspektasi/optimis), sequence-of-returns risk — nambah kompleksitas + permukaan risiko OJK tanpa nilai sepadan buat "kalkulator ilustrasi".

---

## 6. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Platform | Web, desktop-first, mobile-tolerated |
| Browser | Latest Chrome, Safari, Firefox, Edge |
| Language | Bahasa Indonesia primary, casual register ("kamu") |
| Performance | Dashboard recalc <300ms with 25-stock portfolio + 5 goals; wizard apply <500ms; capacity wizards <200ms (pure derivations) |
| Privacy | **No user financial data leaves the browser.** Only price-fetch calls go to backend, with no user payload attached |
| Persistence | None server-side. No localStorage. |
| Accessibility | WCAG AA contrast; full keyboard navigation; ARIA live regions on metric / goal / capacity cards |
| Analytics | Page-level via Plausible / Umami. No event-level financial data logged. |
| OJK risk | All product copy reviewed against §9 checklist before launch |

---

## 7. Data Model / xlsx Schema

**`_meta` sheet (hidden):**
| Cell | Value |
|---|---|
| A1 | `cermat_schema_version` |
| B1 | `1` |
| A2 | `exported_at` |
| B2 | ISO timestamp |
| A3 | `data_json` |
| B3 | JSON-stringified state (snapshot + per-emiten + goals + scenarios + capacity) |

**`Snapshot`:** `section, label, value_idr, unit_or_currency`
**`Per-Emiten`:** `ticker, lots_current, lots_target, price_live, valuasi, target_bobot, bobot_live, progress_pct, avg_dividend_yield, last_dividend, potential_dividend`
**`Cicilan-Aktif`:** `cicilan_id, tipe, label, sisa_pokok, cicilan_per_bulan, suku_bunga, tenor_sisa_bulan, jenis_bunga, total_beban_sisa, tanggal_jatuh_tempo`
**`Goals`:** `goal_id, goal_type, label, target_amount, target_date, fi_multiplier, bucket_json, current_progress, monthly_contribution_needed, status, projected_completion`
**`Skenario`:** `scenario_id, scenario_label, wizard_type, input_json, before_metrics_json, after_metrics_json, before_goals_json, after_goals_json, created_at`
**`Kapasitas`:** `output_id, wizard_type, computed_at, input_json, output_json` (stores max-utang results, lunasi-utang simulations, modal-options snapshots)
**`Ringkasan`:** display-only

---

## 8. Live Price Integrations

> **Stack note:** This section predates the tech design. The proxy *concept* (server-side, ticker-only, cached) is unchanged, but the implementation stack is **Nuxt 3 / Nitro / vue-echarts** (see `cermat-tech-design-en.md`), **not** Next.js / Recharts as some older phrasing below implies. Endpoints confirmed working 2026-05-28.

| Data | Source | Cache TTL | Fallback |
|---|---|---|---|
| **IDX equities** | **Yahoo v7 `spark` (batch) + v8 `chart`** (free, no key, ~15-min delay) — tech-design §7.1 | 15 min | Cached + STALE badge per ticker + manual price field |
| Emas (IDR/gram) | Pegadaian Sahabat JSON `/gold/prices/savings` (no scrape needed) — tech-design §7.2 | 1 hour | Manual override + STALE badge |
| USD → IDR | Yahoo v8 `chart` `USDIDR=X` — tech-design §7.3 | 15 min | Last known + STALE badge |

**Privacy:** all calls proxied via Nitro server routes (tech-design). User IP never sent to upstream APIs. **Request payloads contain ONLY ticker symbols** — no portfolio context. Server can't tell who the user is or what they own.

**API contracts (sketch):**
```
GET /api/prices/idx?tickers=BBCA,BBRI,BMRI
→ { prices: [{ ticker, price, currency, fetched_at, stale }], missing: [] }

GET /api/prices/gold
→ { source: "pegadaian", idr_per_gram, fetched_at, stale }

GET /api/prices/forex?pair=USDIDR
→ { pair, rate, fetched_at, stale }
```

Bundle size mitigation: lazy-load the chart lib (vue-echarts) and SheetJS (~700KB) only when needed.

---

## 9. ⚠️ Compliance & OJK Risk Mitigation

> **Non-negotiable.** Cermat is "advice-adjacent" across decision wizards, capacity wizards, per-emiten cards, AND goal cards. Every surface must adhere to the rules below.

### 9.1 Hard rules (zero exceptions)

**Never prescribe specific actions:**
- ❌ *"Sebaiknya kamu lunasi KK dulu sebelum ambil KPR"*
- ❌ *"Pertimbangkan rotasi BBCA ke TLKM"*
- ❌ *"Likuidasi Reksadana untuk menutup utang"*
- ❌ *"Untuk capai goal FI lebih cepat, tambah kontribusi ke RD"*
- ❌ *"Sebaiknya pilih opsi prepay KPR karena tenor lebih cepat"* (in Modal Options)

**Never recommend specific products / instruments by name:**
- ❌ *"Pakai DPLK dari Bank X"*
- ❌ *"Mulai di Reksa Dana [merek Z]"*

**Never use obligation-implying modals:**
- ❌ "kamu harus", "kamu wajib", "kamu sebaiknya", "saya rekomendasikan", "pilihan terbaik adalah"
- ✅ "kamu **di** zona X", "ambang sehat **adalah** Y", "skenario ini **menghasilkan** Z", "opsi yang bisa dihitungkan adalah"

### 9.2 Soft rules (intent matters)

**Allowed (descriptive):**
- *"DSR kamu 38% — di zona Waspada (30–40%). Threshold sehat: <30%."*
- *"BBCA progress 36% dari target 450 lot. Bobot live 17% vs target 20%."*
- *"Goal FI projected selesai 2038 — 3 tahun lebih lambat dari target."*
- *"Max cicilan baru yang masuk threshold sehat: Rp 3.9jt/bln."*
- *"Lunasi Kartu Kredit (Rp 8jt) → DSR 33% → 31%."*
- *"Modal Siap Rp 52jt. Beberapa opsi yang bisa dihitungkan: ..."*

**Forbidden (prescriptive):**
- *"Goal kamu off-track — sebaiknya tambah kontribusi."*
- *"Bobot BBCA terlalu tinggi — pertimbangkan rotasi."*
- *"Opsi terbaik berdasarkan profil kamu: prepay KPR."*

**Rule of thumb:** if the copy suggests *what to do*, rewrite as *what is*. User does the inference. The Modal Options panel must say *"opsi yang bisa dihitungkan"* — never *"pilihan terbaik"* or *"rekomendasi sistem"*.

### 9.3 Mandatory disclaimer

Persistent footer on every screen:

> *"Cermat adalah kalkulator dan alat bantu visualisasi data kamu sendiri. Bukan saran investasi, perencanaan keuangan, atau produk keuangan tertentu. Selalu konsultasi profesional bersertifikat untuk keputusan besar."*

Prominent version before every Wizard and before saving a Goal:

> *"⚠️ Hasil simulasi adalah ilustrasi berdasarkan input kamu — bukan jaminan dan bukan saran. Konsultasi profesional sebelum keputusan final."*

### 9.4 Review process

Before launch, review:
1. **18 health metric copy strings** (6 metrics × 3 zones)
2. **6 portfolio metric copy strings** (Allocation Discipline + Goal Health × 3 zones)
3. **Modal Siap Distribusi explainer**
4. **Per-emiten card explainers**
5. **Goal card explainers**
6. **Decision wizard side-by-side panel labels**
7. **Capacity wizard outputs** — especially Modal Options auto-generated list
8. **Empty-state and error microcopy**

Estimated ~60 strings total (added ~10 for capacity surfaces). PM + (ideally) legal-savvy advisor review before launch.

### 9.5 Default panel labels

Assume **any panel labeled "Saran" or "Rekomendasi" will drift into advice**. Default panel labels:

**"Ringkasan"** · **"Status"** · **"Analisis Posisi"** · **"Threshold"** · **"Proyeksi"** · **"Opsi yang Bisa Dihitungkan"** · **"Kapasitas"**

Goal cards must say *"Status: On-Track"*, never *"Saran: Tambah kontribusi"*.

Modal Options panel must use *"Opsi yang bisa dihitungkan"*, never *"Rekomendasi"* or *"Pilihan terbaik"*.

---

## 10. Success Metrics

### 10.1 Launch criteria (product is "done" when)

- New user completes Snapshot (basic) in <10 min
- New user completes Snapshot (with per-emiten) in <20 min
- User adds 1+ goal (FI auto-formula working) in <2 min
- User runs **decision wizard** + sees side-by-side with metric + goal deltas in <2 min
- User runs **capacity wizard** + sees descriptive output in <2 min
- All 9 metrics + per-emiten + goals + capacity outputs compute correctly across **15 test scenarios**
- All ~60 Insight copy strings written, PM-reviewed, audited against §9
- xlsx export downloads, opens in Excel + Google Sheets, contains 8 sheets
- Lighthouse performance ≥85 with snapshot (25 stocks) + 5 goals + 2 scenarios + capacity outputs loaded
- OJK §9 self-checklist passes
- IDX live prices work for sample tickers (BBCA, BBRI, BMRI, ASII, BBNI) with proper cache

### 10.2 User-facing demo criteria

- Hero demo path runs in **60 seconds**: landing → "Coba dengan data contoh" → Goal FI visible → KPR wizard → **verdict flip + goal shift** → Capacity wizard "Max Utang" → reveal max safe → Modal Options panel → done
- Two visible reactions in 60s: DSR badge color flip + Goal date moving back
- Capacity wizard creates a "second wow" by answering reverse question
- Mobile renders gracefully

### 10.3 Post-launch (90 days)

- 500+ unique visitors complete Snapshot
- ≥150 visitors run at least one Decision Wizard
- ≥100 visitors run at least one Capacity Wizard
- ≥100 visitors add at least one Goal
- p50 time on page ≥6 min
- ≥10 unsolicited mentions (r/finansial, X, Telegram FIRE groups)

---

## 11. Open Questions

1. **Brand name** — *Cermat* working. Alternates: *Hitungin*, *Tepat*, *Bobot*. Decision needed before design.
2. **IDX live price source** — Yahoo Finance via `BBCA.JK` (recommended), Goapi.id (paid), or Stockbit unofficial (risky)?
3. ~~**FI formula multiplier** — Lock to 300 (4% safe withdrawal), or expose multiplier (240/300/360) as user-configurable?~~ **Closed 2026-05-31 (D0.2):** locked to `300`. Formula rendered inline on FiGoalCard so the assumption is visible; no dropdown for MVP.
4. ~~**Modal Siap Distribusi formula** — Cash + Deposito + RD + Crypto liquid? Or also subtract emergency-fund buffer (6× expenses)? Or let user tag which assets are "deployable"?~~ **Closed Day 3 (D0.3):** Kas + Deposito + RD + Crypto Liquid; no auto-subtract; emergency buffer surfaces as advisory copy only.
5. **Capacity wizard scope** — Ship all 3 (Max Utang + Lunasi + Modal Options), or top 2 only?
6. **Modal Options ranking** — How are options ordered in the panel? By "biggest metric improvement", by IDR amount, by user preference? *(Recommend: by category — debt reduction → asset acquisition — without "best to worst" framing to avoid prescriptive UX.)*
7. **Max Utang Aman threshold** — Lock to DSR<30%, or let user pick the threshold (Sehat/Waspada)?
8. **Lunasi Utang tenor handling** — When partial KPR repayment: shorten tenor (default) or reduce cicilan? Or let user toggle?
9. **Per-emiten depth** — Lots + target + bobot + dual dividend (no ladders), or include ladders?
10. **Goal types** — 4 templates (DP Rumah / Dana Pendidikan / FI / Custom). Confirm.
11. **Goal cap** — 5 goals max? More?
12. **OJK disclaimer placement** — Footer + pre-wizard + pre-goal-save — how prominent?
13. **Snapshot-first or simulator-first?** — Recommend snapshot-first with "Coba dengan data contoh" escape.
14. **Mobile investment** — Desktop-first, or invest because most Indonesians are on phones?
15. **Sample data profile** — Conservative (Sari) or sophisticated (Bayu) for "Coba dengan data contoh"?
16. **Cicilan Aktif required fields** — Spec currently requires `suku_bunga` + `tenor_sisa_bulan` + `jenis_bunga` for every row. Realistic for KPR/KPM (user has akad docs), tougher for Pinjol/Paylater (often opaque APR). Option: relax to "sisa + cicilan" minimum for `tipe ∈ {PINJOL, PAYLATER, KK}`, with §5.2.7 prepay-to-tenor projection disabled when bunga is missing. Confirm.
17. **Revolving debt tenor estimation** — For KK/Paylater rows, do we auto-estimate `tenor_sisa_bulan` from sisa + minimum payment + bunga, or always require user to enter it? Auto-estimate is more accurate but adds a UX surprise ("kenapa tenor berubah pas saya isi bunga?").
18. **Lunasi Utang ordering in Modal Options** — Spec says "debt-reduction-then-asset-acquisition, not high-rate-first." Confirm this convention is OJK-safe even when high-rate Pinjol sits next to low-rate KPR in the options list.

---

## 12. Roadmap

### Phase 2 (target: 4–6 weeks after launch)
- **xlsx import** / round-trip + schema migration
- localStorage autosave with opt-in
- Multi-scenario comparison (3-way: Snapshot vs. A vs. B)
- Additional decision wizards: *Mau pindah kerja*, *Mau resign + bisnis*, *Mau anak*
- Additional capacity wizards: *Optimal Allocation* (rebalance to target bobot), *Goal Acceleration Options*
- Per-emiten accumulation ladders (10/30/50/70/80/100% milestones)
- Tax estimator (PPh21, capital gains, dividend tax)
- English language toggle

### Phase 3 (exploratory)
- Historical snapshots (multi-xlsx timeline)
- Sankey cash flow diagram
- Shareable read-only links (ephemeral token)
- Mobile-optimized layout
- US stocks (yfinance proxy)
- Native mobile app

### Future (uncommitted)
- Broker integration via manual statement upload
- Multi-portfolio / household / shared views
- Real-time intraday data for active users

---

## 13. References & Anti-References

**This product should feel like:**
- A clean tax form that respects the user's time
- A focused calculator (Coda doc / Notion table) with a smart sidebar
- A medical-screening tool (Apple Health) — clinical but warm
- A loan officer's spreadsheet — but on the user's side
- A broker's order pad — quiet, dense, precise *(per-emiten cards specifically)*

**This product should NOT feel like:**
- Bibit / Pluang — too gamified, growth-marketing colors
- Stockbit — too dense, trader-floor energy
- Mint / Personal Capital — bank-blue, US-centric
- A bank loan calculator — too dry, optimized for institution not user
- A robo-advisor — over-promising, prescriptive
- A spreadsheet — cold, no live feedback

---

## 14. The bet

**Indonesian adults track their finances, set life goals, and make 1–3 big financial decisions per year.** Today's toolkit is fragmented: Stockbit for stocks, Bibit for RD, xlsx for accumulation tracking, no one for scenario simulation, no one for capacity reasoning, no one for goal-aware decision support.

**Cermat is a unified privacy-first artifact** for that workflow. Track → Plan → Decide → Discover. No signup, no leak, no advice — just better tooling.

It also happens to be:
- Shippable in ~11 days solo with AI assistance
- Demo-able in 60 seconds (slider flip + goal shift + capacity reveal)
- Differentiated against every competitor in the Indonesian market
- Clear of OJK regulation grey zone *if* the descriptive-only line is held

That's the package.

---

**Next:** `personal-wealth-platform-design-guidelines-en.md` — design brief.
