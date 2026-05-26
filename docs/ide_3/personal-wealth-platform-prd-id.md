# Cermat — Product Requirements Document

**Status:** Draft
**Update terakhir:** 2026-05-26
**Owner:** TBD
**Nama brand kerja:** **Cermat** *(Bahasa Indonesia: hati-hati, teliti, cermat)*
**Dokumen pendamping:**
- `personal-wealth-platform-mvp-id.md` — brief konsep
- `personal-wealth-platform-design-guidelines-id.md` — brief design *(akan ditulis berikutnya)*

---

## 1. Masalah & Persona

### 1.1 Masalah

Orang dewasa Indonesia track keuangan mereka, set goal hidup, dan ambil 1–3 keputusan finansial besar, jarang, mostly tidak bisa di-undo setiap tahun. Toolkit mereka untuk workflow lengkap terfragmentasi:

- **Stockbit / Bibit / Pluang** fokus mengelola portfolio yang sudah ada — tanpa simulasi skenario, tanpa reasoning goal-aware, tanpa reasoning kapasitas
- **Loan calculator** kasih angka cicilan in isolation — gak ngasih tau apakah keuangan *kamu* bisa absorb itu atau dampaknya ke goal
- **Spreadsheet** handle tracking akumulasi dengan baik, tapi rusak saat di-share, gak bisa simulasi skenario, gak compute opsi berbasis kapasitas
- **Proyeksi bank / dealer** by design optimis
- **Cerita teman / keluarga** bias survivor
- **Tidak ada yang jawab "apa yang bisa gw lakukan sekarang?"** — pertanyaan kapasitas seperti *"berapa max utang yang bisa gw tambah?"* atau *"apa yang bisa gw lakukan dengan modal likuid gw?"* absen dari tools yang ada
- **Tidak ada satu tool pun yang integrasikan** snapshot + akumulasi + goal tracking + simulasi skenario + reasoning kapasitas dalam satu produk yang respect privacy

Cermat adalah produk terpadu itu.

### 1.2 Persona Co-Primary

**"Sari" — 28–38, rumah tangga dual-income, karyawan atau freelancer**
- Penghasilan rumah tangga IDR 15–50jt/bulan
- Saat ini mempertimbangkan salah satu: KPR, KPM, Gadai Emas, tambah investasi bulanan
- Punya tabungan, mungkin emas, mungkin Reksa Dana basic — bukan investor hardcore
- Tidak percaya app yang minta kredensial bank
- Mau guidance forward (*"aman gak kalau gw ___?"*) DAN reverse (*"berapa max yang aman?"*)

**"Bayu" — 30–45, investor retail Indonesia dengan thesis akumulasi**
- Penghasilan bulanan IDR 25–80jt (sering non-salary)
- Punya 10–25 saham IDX dengan target weight eksplisit per emiten
- Pakai emas sebagai kolateral (Gadai)
- Track Safe Haven vs Productive ratio sebagai posture risiko
- Saat ini maintain xlsx personal yang kompleks
- Mau kedalaman per-emiten + decision support goal-aware + reasoning kapasitas

**Kedua persona dilayani oleh satu produk** lewat progressive disclosure. User basic lihat Snapshot + Wizard. User advanced unlock Per-Emiten dan Multi-Goal tracking. Tidak ada toggle "Pro mode" — UI scale dengan gracefully.

### 1.3 Kenapa sekarang

- Rasio utang rumah tangga vs GDP Indonesia naik signifikan 2023–2025; adopsi KPR + paylater + pinjol melonjak — dan biasanya hidup berdampingan di rumah tangga yang sama
- Volatilitas emas (2024–2026) bikin Gadai jadi funding tool aktif
- Distrust fintech lokal masih ada setelah berulang kali data breach
- AI-assisted development bikin solo build dengan kualitas competent realistis dalam hari

---

## 2. Tujuan & Bukan-Tujuan

### 2.1 Tujuan

1. User selesaikan Snapshot (basic ATAU dengan kedalaman per-emiten) dalam <10 menit
2. User definisikan 1+ goal dalam <2 menit (FI goal auto-compute target = pengeluaran × 300)
3. User jalankan **wizard keputusan** ("Mau X?") dalam <2 menit; lihat side-by-side dengan delta semua metric + dampak goal
4. User jalankan **wizard kapasitas** ("Bisa apa?" / "Berapa max?") dalam <2 menit
5. **8 metric kesehatan + 1 metric kapasitas (Modal Siap Distribusi)** dengan threshold + explainer Bahasa Indonesia santai
6. **Harga IDX live** untuk saham per-emiten (Yahoo Finance via `BBCA.JK`), USD/IDR live, emas/gram live
7. Export xlsx berisi snapshot + per-emiten + goals + skenario + output kapasitas — buka bersih di Excel/Sheets
8. **Fully usable tanpa sign-up**, tidak ada data user di server
9. **Audit risiko OJK** — tidak ada saran preskriptif dimanapun

### 2.2 Bukan-Tujuan

- Akun user, login, manajemen password
- Persistensi server-side data finansial user
- Bank linking / Open Finance / aggregation
- Rekomendasi produk investasi/asuransi *(garis merah OJK)*
- Estimator pajak (PPh21, capital gains, pajak dividen)
- Native mobile (iOS / Android)
- Push notification, scheduled report, email alert
- **Import** xlsx / round-trip
- Saham US, equities internasional
- Harga crypto live
- Diagram Sankey, timeline historis
- Accumulation ladders per-emiten (milestone modal 10/30/50/70/80/100%)
- localStorage autosave
- Perbandingan multi-skenario (3-way+)
- Toggle bahasa Inggris
- Data tick intraday real-time
- Shareable read-only link

---

## 3. Core Loop — Track → Plan → Decide → Discover

> **Keputusan arsitektural produk.** Semua yang lain melayani loop ini.

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                       │
│  STEP 1 — TRACK / SNAPSHOT (5–10 menit)                               │
│     Input: kas, emas (live), saham per-emiten (IDX live),             │
│            RD, SBN, properti, kendaraan, dana pensiun                 │
│            + pengeluaran + utang (Cicilan Aktif + Gadai)              │
│     Output: 9 metric termasuk Modal Siap Distribusi                   │
│                                                                       │
│  STEP 2 — PLAN / GOALS (2 menit/goal)                                 │
│     Definisikan: DP Rumah / Dana Pendidikan / FI / Custom             │
│     FI auto-formula: target = pengeluaran × 300                       │
│     Tag bucket: aset mana yang dihitung untuk goal ini                │
│     System compute: progress, kontribusi bulanan dibutuhkan,          │
│                     proyeksi tanggal selesai                          │
│                                                                       │
│  STEP 3A — DECIDE / WIZARD KEPUTUSAN (forward: "Mau X?")              │
│     KPR / Gadai Emas / Cicilan / Custom                               │
│     Side-by-side: "Posisi Sekarang" | "Setelah Skenario"             │
│     Delta di setiap metric DAN setiap proyeksi goal                   │
│                                                                       │
│  STEP 3B — DISCOVER / WIZARD KAPASITAS (reverse: "Bisa apa?")         │
│     Max Utang Aman / Lunasi Utang / Modal Likuid Options              │
│     Compute: "berapa maximum / optimal / available?"                  │
│                                                                       │
│  STEP 4 — DOWNLOAD                                                    │
│     User simpan xlsx sebagai record. App tidak simpan apapun.         │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 4. Alur User

### 4.1 First-time use — happy path

| # | Aksi User | Respon Sistem | Mental State |
|---|---|---|---|
| 1 | Landing di `cermat.id` | Hero copy: *"Aman gak kalau gw [KPR / Gadai / Cicil]? Berapa max utang yang aman? Cek dalam 10 menit."* + 2 CTA | Curious |
| 2 | Pilih "Mulai dari Snapshot" | Form buka (kiri), placeholder dashboard di kanan dengan "—" | Engaged |
| 3 | Isi Penghasilan | Income + estimasi dividen populated | Building |
| 4 | Isi Aset Likuid + emas | Net Worth computing; rate emas live visible; **Modal Siap Distribusi** mulai populated | First "aha" |
| 5 | Expand "Saham per-emiten" — tambah BBCA 162 lot target 450 | Harga BBCA live di-fetch; equity + % akumulasi render | Trust signal (data live) |
| 6 | Isi Pengeluaran + Utang | DSR, Savings Rate, Runway aktif dengan warna | Self-recognition |
| 7 | Lihat 9 metric ter-compute | Hero Net Worth + Modal Siap Distribusi prominent + 7 card supporting | **★ Momen baseline kritikal** |
| 8 | Ke tab "Goals" → tambah goal Financial Independence | FI target auto-compute: Rp 5.4M (= pengeluaran Rp 18jt × 300). Progress 18%, kontribusi 4.2jt/bln dibutuhkan. | Plan jadi tangible |
| 9 | Klik "Coba Simulasi → Mau KPR" *(Wizard Keputusan)* | Wizard buka; state saat ini mirror di kanan | Curious + sedikit cemas |
| 10 | Input KPR: 1.2M / 20% DP / 20 thn / 7% | Side-by-side: DSR 22% → 38% (Sehat → Waspada). Runway 8 → 4 bulan. **Goal FI: mundur 3 tahun.** | **★★ Killer moment** |
| 11 | Tweak tenor jadi 25 thn | DSR turun ke 33%; shift FI jadi 2 tahun bukan 3 | Engaged, eksplorasi |
| 12 | Balik, coba "Max Utang Aman" *(Wizard Kapasitas)* | Panel: *"Berdasarkan gaji + cicilan aktif, max cicilan baru biar DSR Sehat: Rp 3.9jt/bln. Setara KPR ~Rp 480jt @ 15 thn @ 7%."* | Reverse insight |
| 13 | Coba "Modal Likuid Options" | Panel auto-generate: *"Modal Siap Rp 52jt. Opsi: lunasi KK → DSR −2pp; prepay KPR → tenor mundur 14 bln; beli BBCA 30 lot → bobot naik..."* | Discovery |
| 14 | Klik "Download .xlsx" | `cermat-snapshot-2026-05-26.xlsx` ke-download — 7 sheet | Ownership |
| 15 | Tutup tab | Tidak ada yang persist | Done |

**Make-or-break moments:**
- **Step 10**: First decision wizard dengan goal impact + threshold flip
- **Step 13**: First time user lihat "apa yang BISA dilakukan" bukan cuma "apa yang HARUS diketahui"

### 4.2 Alur alternatif — "Coba dengan data contoh"

Profile sample pre-fill: gaji 18jt, emas 30gr, BBCA 50 lot / target 200, tabungan 80jt, KPR sisa 600jt, goal "FI by 2035" sudah di-tag.

User bisa langsung ke wizard. CTA di bawah: *"Suka tools-nya? Ganti dengan data kamu sendiri →"*

### 4.3 Edge case

| Skenario | Perilaku |
|---|---|
| Refresh tidak sengaja | Prompt `beforeunload`: *"Data kamu belum tersimpan. Yakin refresh?"* |
| User mobile | Stacked layout; functional dengan hint *"Lebih nyaman di desktop"* |
| User skip Pengeluaran | DSR / Savings / Runway tampil "—"; Net Worth + DAR tetap compute; **FI auto-formula disabled sampai pengeluaran diisi** |
| API harga emas gagal | Cached + badge STALE + manual override |
| API harga IDX gagal per-ticker | Cached value + badge STALE per row + manual price |
| API IDX full down | Banner + override global manual di semua card per-emiten |
| User jalankan wizard sebelum Snapshot selesai | Banner: *"Lengkapi Penghasilan & Pengeluaran biar simulasi akurat"* + opsi skip |
| Input wizard bikin DSR >100% | Tampilan merah, copy: *"Skenario ini melebihi kemampuan bayar — DSR tembus 100%"* (deskriptif) |
| **Max Utang Aman compute 0 atau negatif** | Copy: *"DSR kamu sudah di atas threshold sehat (>30%). Tidak ada ruang untuk tambah cicilan tanpa lewat Waspada."* |
| **Lunasi Utang melebihi Modal Siap** | Copy: *"Modal Siap (Rp 52jt) tidak cukup untuk lunasi total Rp 75jt. Bisa lunasi sebagian."* + slider partial |
| Goal target date di masa lalu | Validasi: pilih tanggal future |
| Goal bucket aset total 0 | Tampilkan progress 0%, copy: *"Bucket kosong — pilih aset yang dihitung untuk goal ini"* |

### 4.4 Return visit

Tidak ada return continuity di scope ini. Re-import xlsx ada di roadmap.

---

## 5. Kebutuhan Fungsional

### 5.1 Modul Snapshot — form input

Di-organize ke dalam 4 grup collapsible di panel kiri:

#### 5.1.1 Penghasilan (Bulanan, IDR)
| Field | Catatan |
|---|---|
| Gaji Bersih | Setelah PPh21 |
| Penghasilan Lainnya | Sampingan, sewa, dll — single field |
| Estimasi Dividen Saham | Auto-computed dari section per-emiten (lihat §5.7). Mode A (asumsi yield) / Mode B (manual per-emiten). |

#### 5.1.2 Aset (Likuid + Non-Likuid)

**Likuid:**
| Jenis | Input | Auto-calc | Sumber live |
|---|---|---|---|
| Kas / Tabungan | Amount + currency (IDR/USD) | IDR kalau USD | USD→IDR |
| Deposito | IDR | — | — |
| Emas (Cadangan) | **Gram** | **IDR = gram × harga gram live** | Pegadaian |
| Emas (Tertahan) | **Gram dipawned** | (Lihat Gadai §5.3) | — |
| **Saham (per-emiten)** | Lihat §5.7 | Lihat §5.7 | Yahoo Finance |
| Reksa Dana | Total IDR | — | Manual |
| SBN | IDR | — | Manual |
| Crypto | Coin + qty + price IDR | IDR = qty × price | Manual |

**Non-Likuid:** Properti / Kendaraan / Dana Pensiun

#### 5.1.3 Pengeluaran (Bulanan, IDR)
- Cicilan Aktif (total)
- Kebutuhan Pokok
- Lifestyle / Variabel

#### 5.1.4 Utang

Dua sub-modul terstruktur. Tidak ada lagi field flat outstanding — semua utang masuk lewat salah satu modul ini biar DSR / DAR / kalkulasi prepay punya data yang cukup:

- **Cicilan Aktif** — satu row per utang amortisasi: KPR / KPM / Pinjaman Bank-KTA / Pinjol / Paylater / KK / Lain (lihat §5.3.1)
- **Gadai Pegadaian** — gadai emas berkolateral (lihat §5.3.2)

Kedua modul kontribusi ke agregat Total Utang (DAR) dan Cicilan Aktif Total (DSR) di §5.4, dan keduanya expose row yang bisa dipilih oleh Wizard Lunasi Utang (§5.2.6) dan panel Modal Options (§5.2.7).

**Aturan:** Kosong = 0, inline editing, auto-format IDR, lenient parsing (`25jt`, `25 juta`, dll.).

### 5.2 Scenario Simulator — Dua Wizard Family, 7 Wizard Total

Pattern struktural sama untuk semua wizard: modal buka, snapshot mirror di kanan, form wizard di kiri, panel perbandingan side-by-side di bawah, "Simpan Skenario" / "Edit Snapshot" / "Tutup" di bawah.

### 5.2.A Wizard Keputusan (4) — *forward-looking* "Mau gw X?"

**Setiap wizard report dampak goal selain delta metric.** Contoh output KPR:

| | Sebelum | Sesudah | Δ |
|---|---|---|---|
| Net Worth | Rp 391jt | Rp 391jt | — |
| DSR | 22% (Sehat) | 38% (Waspada) | ▲ +16 |
| Runway | 8 bulan | 4 bulan | ▼ −4 |
| DAR | 12% | 45% | ▲ +33 |
| Modal Siap Distribusi | Rp 52jt | Rp 28jt | ▼ −24 (DP) |
| **Goal: FI 2035** | On-Track | Off-Track (mundur ~3 tahun) | ▼ |

#### 5.2.1 Wizard "Mau Ambil KPR"
**Input:** Harga rumah, DP%, Tenor, Suku bunga, Tipe bunga (Anuitas / Flat / Floating)
**Computed:** Cicilan/bulan, Total bunga
**Efek:** Net Worth (properti +, DP kas −, utang KPR +); DSR + cicilan baru; proyeksi goal shift

#### 5.2.2 Wizard "Mau Gadai Emas"
**Input:** Gram digadai, Tempo, Bunga/bulan (default 1.5%), Taksiran% (default 80%)
**Computed:** Modal cair, Total Beban, Defisit/bulan, Rasio Tertahan
**Efek:** Kas + Modal cair; Emas Tertahan + gram; Utang Gadai + Modal

#### 5.2.3 Wizard "Mau Cicil"
**Input:** Kategori, Harga, DP, Tenor, Bunga
**Computed:** Cicilan/bulan
**Efek:** Efek cicilan standar ke Net Worth + DSR

#### 5.2.4 Wizard "Custom Skenario"
**Input:** Free-form: pilih field, adjust by delta atau nilai baru, label skenario
**Efek:** Apply delta, recompute semua metric + goal

### 5.2.B Wizard Kapasitas (3) — *reverse-looking* "Bisa apa?" / "Berapa max?"

Wizard ini tidak mengambil *keputusan* hipotetis sebagai input — sebaliknya, **mereka derive apa yang user BISA lakukan** berdasarkan state saat ini.

#### 5.2.5 Wizard "Max Utang Aman"

**Input:** Pilihan tipe utang (KPR / KPM / Cicil umum). Untuk KPR: tenor + rate asumsi (default 15 thn / 7%).
**Computed:**
```
max_cicilan_baru = (Penghasilan × 0.30) − Cicilan_Aktif
→ reverse-derive principal dari cicilan + tenor + rate
```
**Output (deskriptif):**
> *"Berdasarkan gaji Rp 18jt + cicilan aktif Rp 1.5jt, max cicilan baru biar DSR tetap di zona Sehat (<30%): Rp 3.9jt/bln. Setara KPR ~Rp 480jt @ 15 tahun @ 7%, atau cicil mobil ~Rp 200jt @ 5 tahun @ 8%, atau cicil elektronik ~Rp 70jt @ 24 bulan."*

Kalau user sudah di >30% DSR: *"DSR kamu sudah di atas threshold sehat. Tidak ada ruang untuk tambah cicilan tanpa lewat Waspada."*

#### 5.2.6 Wizard "Lunasi Utang Sekarang"

**Input:** Pilih row utang dari §5.3.1 Cicilan Aktif ATAU §5.3.2 Gadai. Penuh atau Sebagian. Slider 0 ke min(debt_principal, Modal_Siap).
**Computed:**
- Kas dikurangi sebesar amount repayment
- Pokok utang dikurangi (`sisa_pokok` di row yang dipilih)
- Perilaku recompute **derived dari `jenis_bunga`** di row yang dipilih:
  - **Anuitas / Flat / Floating**: toggle — tenor lebih cepat (cicilan tetap) ATAU cicilan turun (tenor tetap). Default: tenor lebih cepat.
  - **Revolving** (KK / Paylater / sebagian Pinjol): sisa pokok turun langsung; minimum-payment cicilan di-recalc kalau user kasih `min_payment_pct`, kalau tidak diasumsikan tetap.
  - **Gadai**: lihat §5.3.2 — partial tebus kurangi gram tertahan secara proporsional.
- DSR + DAR shift; Modal Siap Distribusi update
**Output:** side-by-side dampak metric + summary deskriptif.
> *"Lunasi Kartu Kredit Rp 8jt dari Modal Siap (Rp 52jt → Rp 44jt). DSR turun 33% → 31%, masih di zona Waspada tapi lebih dekat ke Sehat. Goal FI tidak terdampak."*

#### 5.2.7 Wizard "Modal Likuid Options" — panel auto-generated

Bukan input-driven oleh user. Auto-analyze state saat ini dan list opsi deployable dengan preview dampak. Selalu visible di dashboard ketika Modal Siap > 0.

**Tampilan:**
> **Modal Siap Distribusi: Rp 52jt**
>
> Beberapa opsi yang bisa dihitungkan:
>
> 1. **Lunasi Kartu Kredit (Rp 8jt)** → DSR 33% → 31%; sisa modal Rp 44jt
> 2. **Prepay KPR (Rp 20jt)** → tenor mundur ~14 bulan ATAU cicilan turun ~Rp 200rb/bln; sisa modal Rp 32jt
> 3. **Beli BBCA 30 lot (Rp 18jt)** → bobot live 15% → 18%, progress to target 36% → 43%
> 4. **Tambah ke Reksa Dana** → kontribusi Goal FI; +Rp 52jt mendorong proyeksi FI ~6 bulan
> 5. **Tambah Deposito** → kontribusi Goal FI; +Rp 52jt mendorong proyeksi FI ~6 bulan

Setiap opsi adalah button clickable yang buka wizard relevan dengan values pre-filled, ATAU apply opsi langsung dengan confirmation modal.

**Aturan Insight copy berlaku** — tidak pernah *"sebaiknya lunasi KK dulu"*, selalu *"opsi yang bisa dihitungkan"*.

### 5.3 Modul Utang Aktif

Dua sub-modul terstruktur — utang amortisasi (§5.3.1) dan gadai emas berkolateral (§5.3.2). Keduanya feed DSR + DAR (§5.4) dan keduanya expose row yang bisa dipilih ke wizard Lunasi Utang (§5.2.6) dan panel Modal Options (§5.2.7). Semua utang aktif non-Gadai routing lewat §5.3.1 — tidak ada lagi field flat "Sisa KPR" / "Sisa KPM" di tempat lain.

#### 5.3.1 Cicilan Aktif

Tabel row-based — satu row per utang amortisasi aktif. Setiap row:

| Field | Definisi | Manual / Auto |
|---|---|---|
| `tipe` | enum: `KPR` / `KPM` / `BANK_KTA` / `PINJOL` / `PAYLATER` / `KK` / `LAIN` | Manual |
| `label` | string (contoh: "KPR BCA Bandung 2024") | Manual |
| `sisa_pokok` | Pokok outstanding (IDR) | Manual |
| `cicilan_per_bulan` | Cicilan bulanan (IDR) | Manual |
| `suku_bunga` | Rate tahunan (%) | Manual |
| `tenor_sisa_bulan` | Tenor sisa dalam bulan | Manual |
| `jenis_bunga` | enum: `Anuitas` / `Flat` / `Floating` / `Revolving` | Manual |
| `total_beban_sisa` | `cicilan_per_bulan × tenor_sisa_bulan` | Auto |
| `tanggal_jatuh_tempo` | ISO date (opsional, untuk sorting / timeline payoff) | Manual |

**Agregasi:**
- `Cicilan Aktif Total` (numerator DSR, §5.4) = Σ `cicilan_per_bulan` di semua row
- `Utang Cicilan Total` = Σ `sisa_pokok` di semua row → digabung dengan outstanding Gadai (§5.3.2) jadi **Total Utang** yang dipakai di DAR + Net Worth + semua tempat lain

**Tampilan:** subsection di panel kiri Snapshot — row collapsed tampilkan `tipe + label + sisa pokok + cicilan/bln`; expanded reveal bunga + tenor + jenis bunga. Quick-add button untuk tipe umum (KPR, KPM, KK, Pinjol).

**Perilaku per-`jenis_bunga`:**

| Jenis | Perilaku §5.2.6 Lunasi | Perilaku §5.2.7 Modal Options |
|---|---|---|
| **Anuitas / Flat** | Toggle: tenor mundur ATAU cicilan turun. Recompute amortisasi standar di row yang dipilih. | *"Prepay X → tenor mundur ~N bulan ATAU cicilan turun ~Rp Y/bln"* |
| **Floating** | Sama seperti Anuitas, tapi proyeksi pakai current rate; badge: *"Bunga floating — proyeksi pakai rate sekarang"* | Sama seperti Anuitas + badge floating |
| **Revolving** (KK / Paylater / sebagian Pinjol) | `tenor_sisa_bulan` opsional (auto-estimasi months-to-clear di minimum payment kalau `suku_bunga` diisi); prepay → kurangi `sisa_pokok` langsung, tidak ada recompute tenor | *"Lunasi X → sisa pokok turun Rp N; minimum payment ikut turun kalau bank pakai % saldo"* |

**Threshold:** tidak ada threshold per-row (DSR agregat adalah gate). Optional baris kontekstual di UI Snapshot: *"Cicilan terbesar: KPR Rp 4.2jt/bln (47% dari total cicilan)."*

**Edge case:**

| Skenario | Perilaku |
|---|---|
| Row dengan `cicilan_per_bulan = 0` dan `tenor_sisa = 0` | Dianggap lunas, di-exclude dari DSR. Banner: *"Row ini sudah lunas — hapus atau pindahkan ke Catatan."* |
| Row dengan `suku_bunga` kosong, `jenis_bunga = Revolving` | Tetap usable di §5.2.6 (cuma kurangi sisa pokok); dampak prepay-to-tenor di §5.2.7 disabled dengan catatan: *"Isi suku bunga biar dampak prepay ke tenor terhitung."* |
| Row tandai `Floating` tanpa rate | Badge: *"Isi suku bunga sekarang biar proyeksi akurat"*; calcs fall back ke rate terakhir atau default sistem. |
| Row dengan `cicilan_per_bulan` > `sisa_pokok` (overpay tenor pendek) | Validasi: warning — kemungkinan input error. |
| Sum `cicilan_per_bulan` > Penghasilan | DSR > 100%, tampilan merah, copy: *"Total cicilan melebihi penghasilan — periksa data."* |

**OJK copy guard (§9 berlaku):** deskripsi tampilkan state setiap row; tidak pernah resepkan *"sebaiknya lunasi pinjol dulu"* meskipun pinjol biasanya rate-nya tinggi. Konvensi ranking Modal Options: debt-reduction-then-asset-acquisition, bukan high-rate-first.

#### 5.3.2 Modul Gadai

| Field | Definisi |
|---|---|
| Berat Cadangan Emas (gram) | Total yang dimiliki |
| Emas Tertahan (gram) | Yang sedang digadai |
| Piutang Gadai (IDR) | Pokok outstanding |
| Interest Rate (%/bulan) | Default 1.5% |
| Tempo (bulan) | Term pinjaman |
| Total Beban (auto) | Pokok + Bunga |
| Defisit/bulan (auto) | (Total Beban / Tempo) − Kemampuan Bayar |
| **Rasio Tertahan** | Gram Tertahan ÷ Gram Cadangan |

Threshold Rasio Tertahan: <50% Aman · 50–70% Waspada · >70% Risiko Likuidasi (deskriptif — tidak pernah *"sebaiknya tebus dulu"*).

### 5.4 Metrics — Katalog (9 metric)

| # | Metric | Rumus | Threshold |
|---|---|---|---|
| 1 | **Net Worth** | `Total Aset − Total Utang` | Negatif merah; positif hijau |
| 2 | **DSR** | `Cicilan Aktif ÷ Penghasilan` | <30% Sehat · 30–40% Waspada · >40% Bahaya |
| 3 | **Financial Runway** | `Aset Likuid ÷ Pengeluaran` (bulan) | Single ≥6 / 3–6 / <3; Tanggungan ≥12 / 9–12 / <9 |
| 4 | **Savings Rate** | `(Income − Expense) ÷ Income` | ≥20% / 10–20% / <10% |
| 5 | **DAR** | `Total Utang ÷ Total Aset Kotor` | <30% / 30–50% / >50% |
| 6 | **Safe Haven Ratio** | `(Kas + Emas + RD + Deposito) ÷ Total Aset` | Posture: ≥60% Konservatif · 40–60% Seimbang · <40% Agresif |
| 7 | **Allocation Discipline** | `Σ \|Bobot Live − Target Bobot\|` per saham | <5pp Tight · 5–15pp Drift · >15pp Off-Plan |
| 8 | **Goal Health (komposit)** | % goal "On-Track" | ≥80% Sehat · 50–80% Mixed · <50% Off-Plan |
| 9 | **Modal Siap Distribusi** | `Kas + Deposito + RD + Crypto Liquid` (formula default — lihat open question §11.4) | Capacity number, tidak ada threshold; companion note: *"Pertimbangkan keep dana darurat 3–6 bulan pengeluaran terpisah."* |

**Layout:** Net Worth dan Modal Siap Distribusi adalah **angka absolut prominent** di top dashboard (paired). Di bawahnya: 6 metric kesehatan dalam grid. Goal Health komposit ditampilkan bersama panel card Goal.

Catatan untuk metric 6, 7, 8, 9: metric posture / discipline / capacity, bukan "safety" — Insight copy harus deskripsikan state, bukan resepkan koreksi.

### 5.5 Visualisasi

- **Donut Alokasi** — % breakdown per kategori
- **Panel perbandingan side-by-side** — untuk hasil skenario (visual hero demo)
- **Threshold bar** — horizontal bar per metric, ala termometer
- **Bar progress per-emiten** — satu row per saham, rasio lots/target
- **Bar stacked Safe Haven vs Produktif** — single horizontal bar
- **Bar progress goal** — satu per goal dengan proyeksi tanggal selesai
- **Panel Modal Likuid Options** — persistent di dashboard, auto-generated opsi deployable

### 5.6 Export

Tombol single: **"Download .xlsx"** di header.

| Sheet | Tujuan |
|---|---|
| `Ringkasan` | Hero: Net Worth, Modal Siap Distribusi, 9 metric, alokasi %, summary goal, status Gadai + Cicilan Aktif, timestamp |
| `Snapshot` | Input snapshot raw |
| `Per-Emiten` | Satu row per saham: lots, target, bobot, dividend, valuasi, progress |
| `Cicilan-Aktif` | Satu row per utang aktif: tipe, label, sisa pokok, cicilan/bln, bunga, tenor sisa, jenis bunga, total beban sisa |
| `Goals` | Satu row per goal: type, target, bucket, progress, kontribusi bulanan dibutuhkan, proyeksi tanggal selesai |
| `Skenario` | Skenario decision-wizard yang di-save dengan input dan delta before/after |
| `Kapasitas` | Output wizard kapasitas: max safe debt, simulasi pelunasan utang, modal options ranked by impact |
| `_meta` (hidden) | Schema version + JSON state |

**Default filename:** `cermat-snapshot-YYYY-MM-DD.xlsx`

### 5.7 Modul Saham Per-Emiten

Untuk setiap row saham:

| Field | Manual / Auto |
|---|---|
| Emiten (ticker) | Manual |
| Lots Sekarang | Manual |
| Lots Target 100% | Manual |
| Harga Live (Rp/lembar) | Auto — Yahoo Finance |
| Valuasi = Lots × 100 × Harga | Auto |
| Target Bobot % | Manual |
| Bobot Live % | Auto (relatif terhadap total saham) |
| Progress to Target % | Auto (Lots Sekarang / Lots Target) |
| Avg Dividend Yield % | Manual (opsional) |
| Last Dividen per Lembar (Rp) | Manual (opsional) |
| Potential Dividend | Auto (Lots × 100 × Last Dividen) |

**Tampilan:** Subsection saham menampilkan card per-emiten (collapsed: ticker + progress lots + dot drift bobot + harga LIVE). Expanded view tampilkan detail dividend + drift.

### 5.8 Modul Goal Tracking (dengan FI auto-formula)

User tambah goal. Setiap goal:

| Field | Type |
|---|---|
| `goal_type` | enum: `DP_RUMAH` / `DANA_PENDIDIKAN` / `FINANCIAL_INDEPENDENCE` / `CUSTOM` |
| `label` | string (contoh: "DP Rumah Bandung 2028") |
| `target_amount_idr` | number — **auto-computed untuk goal FI** (lihat di bawah); manual untuk yang lain |
| `target_date` | ISO date |
| `bucket_asset_types` | array tipe/ID aset untuk di-tag |
| `current_progress` | auto-computed sum value aset bucket |
| `monthly_contribution_needed` | auto = (target − current) ÷ bulan tersisa |
| `status` | derived: `ON_TRACK` / `OFF_TRACK` / `AT_RISK` (deskriptif murni) |
| `projected_completion_date` | auto, berdasarkan trajectory bucket saat ini + inflow bulanan |

#### 5.8.1 Financial Independence — auto-formula

Saat `goal_type = FINANCIAL_INDEPENDENCE`, `target_amount_idr` default ke:

```
FI Number = Pengeluaran Bulanan × 300
          (= 25 tahun × 12 bulan, ekuivalen dengan rumus 4% safe withdrawal)
```

Tampilan: *"FI Number kamu: Rp 5.4M (asumsi pengeluaran bulanan Rp 18jt × 300)."*

User bisa override multiplier:
- **240** — conservative (lebih banyak spending, ~5% withdrawal)
- **300** — default (4% rule)
- **360** — ultra-conservative (3.3% withdrawal)
- Custom number

Kalau Pengeluaran Bulanan belum diisi, goal FI creation di-block dengan prompt: *"Isi Pengeluaran dulu di Snapshot — FI Number dihitung dari pengeluaran kamu."*

**Bucket default untuk goal FI:** semua aset investment-class (RD + Saham + SBN + Deposito + Crypto). User bisa modify.

**Aturan:**
- Multiple goal didukung (cap: 5 goal)
- Bucket bisa include partial asset category
- Card goal di dashboard tampilkan: target amount, progress bar %, proyeksi tanggal, badge status
- Wizard simulator (Decision & Capacity) report **dampak per-goal** di panel side-by-side

**Aturan Insight copy berlaku:**
- ✅ *"Goal FI projected selesai 2038 — 3 tahun lebih lambat dari target 2035."*
- ❌ *"Untuk capai goal FI lebih cepat, tambah kontribusi ke RD X."*

---

## 6. Kebutuhan Non-Fungsional

| Area | Kebutuhan |
|---|---|
| Platform | Web, desktop-first, mobile-tolerated |
| Browser | Chrome, Safari, Firefox, Edge versi terbaru |
| Bahasa | Bahasa Indonesia primary, register santai ("kamu") |
| Performa | Recalc dashboard <300ms dengan 25-stock portfolio + 5 goal; apply wizard <500ms; wizard kapasitas <200ms (pure derivasi) |
| Privacy | **Tidak ada data finansial user yang keluar browser.** Hanya price-fetch ke backend, tanpa payload user |
| Persistensi | Tidak ada di server. Tidak ada localStorage. |
| Aksesibilitas | WCAG AA contrast; full keyboard navigation; ARIA live region di metric / goal / capacity card |
| Analytics | Page-level via Plausible / Umami. Tidak ada event-level data finansial di-log. |
| Risiko OJK | Semua copy produk di-review terhadap checklist §9 sebelum launch |

---

## 7. Data Model / Schema xlsx

**Sheet `_meta` (hidden):**
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
**`Kapasitas`:** `output_id, wizard_type, computed_at, input_json, output_json` (store hasil max-utang, simulasi lunasi-utang, snapshot modal-options)
**`Ringkasan`:** display-only

---

## 8. Integrasi Harga Live

| Data | Sumber | Cache TTL | Fallback |
|---|---|---|---|
| **IDX equities** | **Yahoo Finance via pattern `BBCA.JK`** (gratis, tanpa key, delay 15-min) | 15 menit | Cached + badge STALE per ticker + field manual price |
| Emas (IDR/gram) | Scrape Pegadaian Sahabat (`cheerio` server-side) | 1 jam | Manual override + badge STALE |
| USD → IDR | exchangerate.host (gratis) | 1 jam | Last known + badge STALE |

**Privacy:** semua call di-proxy via Next.js Route Handler. IP user tidak pernah dikirim ke API upstream. **Request payload berisi HANYA ticker symbol** — tanpa konteks portfolio.

**Kontrak API (sketch):**
```
GET /api/prices/idx?tickers=BBCA,BBRI,BMRI
→ { prices: [{ ticker, price, currency, fetched_at, stale }], missing: [] }

GET /api/prices/gold
→ { source: "pegadaian", idr_per_gram, fetched_at, stale }

GET /api/prices/forex?pair=USDIDR
→ { pair, rate, fetched_at, stale }
```

Mitigasi bundle size: lazy-load Recharts (~70KB) dan SheetJS (~700KB) hanya ketika dibutuhkan.

---

## 9. ⚠️ Compliance & Mitigasi Risiko OJK

> **Tidak bisa ditawar.** Cermat "advice-adjacent" di wizard keputusan, wizard kapasitas, card per-emiten, DAN card goal. Setiap surface harus ikuti aturan di bawah.

### 9.1 Aturan keras (tanpa pengecualian)

**Jangan pernah resepkan aksi spesifik:**
- ❌ *"Sebaiknya kamu lunasi KK dulu sebelum ambil KPR"*
- ❌ *"Pertimbangkan rotasi BBCA ke TLKM"*
- ❌ *"Likuidasi Reksadana untuk menutup utang"*
- ❌ *"Untuk capai goal FI lebih cepat, tambah kontribusi ke RD"*
- ❌ *"Sebaiknya pilih opsi prepay KPR karena tenor lebih cepat"* (di Modal Options)

**Jangan pernah rekomendasikan produk / instrumen spesifik by name:**
- ❌ *"Pakai DPLK dari Bank X"*
- ❌ *"Mulai di Reksa Dana [merek Z]"*

**Jangan pakai modal verb yang implikasinya kewajiban:**
- ❌ "kamu harus", "kamu wajib", "kamu sebaiknya", "saya rekomendasikan", "pilihan terbaik adalah"
- ✅ "kamu **di** zona X", "ambang sehat **adalah** Y", "skenario ini **menghasilkan** Z", "opsi yang bisa dihitungkan adalah"

### 9.2 Aturan lunak (intent matters)

**Boleh (deskriptif):**
- *"DSR kamu 38% — di zona Waspada (30–40%). Threshold sehat: <30%."*
- *"BBCA progress 36% dari target 450 lot. Bobot live 17% vs target 20%."*
- *"Goal FI projected selesai 2038 — 3 tahun lebih lambat dari target."*
- *"Max cicilan baru yang masuk threshold sehat: Rp 3.9jt/bln."*
- *"Lunasi Kartu Kredit (Rp 8jt) → DSR 33% → 31%."*
- *"Modal Siap Rp 52jt. Beberapa opsi yang bisa dihitungkan: ..."*

**Dilarang (preskriptif):**
- *"Goal kamu off-track — sebaiknya tambah kontribusi."*
- *"Bobot BBCA terlalu tinggi — pertimbangkan rotasi."*
- *"Opsi terbaik berdasarkan profile kamu: prepay KPR."*

**Rule of thumb:** kalau copy menyarankan *apa yang harus dilakukan*, rewrite jadi *apa adanya*. User yang inference sendiri. Panel Modal Options harus bilang *"opsi yang bisa dihitungkan"* — tidak pernah *"pilihan terbaik"* atau *"rekomendasi sistem"*.

### 9.3 Disclaimer wajib

Footer persistent di setiap layar:

> *"Cermat adalah kalkulator dan alat bantu visualisasi data kamu sendiri. Bukan saran investasi, perencanaan keuangan, atau produk keuangan tertentu. Selalu konsultasi profesional bersertifikat untuk keputusan besar."*

Versi prominent sebelum setiap Wizard dan sebelum simpan Goal:

> *"⚠️ Hasil simulasi adalah ilustrasi berdasarkan input kamu — bukan jaminan dan bukan saran. Konsultasi profesional sebelum keputusan final."*

### 9.4 Proses review

Sebelum launch, review:
1. **18 string copy metric kesehatan** (6 metric × 3 zona)
2. **6 string copy metric portfolio** (Allocation Discipline + Goal Health × 3 zona)
3. **Explainer Modal Siap Distribusi**
4. **Explainer card per-emiten**
5. **Explainer card goal**
6. **Label panel side-by-side wizard keputusan**
7. **Output wizard kapasitas** — khususnya list Modal Options auto-generated
8. **Microcopy empty-state dan error**

Estimasi ~60 string total (tambah ~10 untuk surface kapasitas). PM + (idealnya) advisor yang paham legal review sebelum launch.

### 9.5 Label panel default

Asumsikan **panel apapun yang dilabeli "Saran" atau "Rekomendasi" akan drift jadi advice**. Label panel default:

**"Ringkasan"** · **"Status"** · **"Analisis Posisi"** · **"Threshold"** · **"Proyeksi"** · **"Opsi yang Bisa Dihitungkan"** · **"Kapasitas"**

Card goal harus bilang *"Status: On-Track"*, tidak pernah *"Saran: Tambah kontribusi"*.

Panel Modal Options harus pakai *"Opsi yang bisa dihitungkan"*, tidak pernah *"Rekomendasi"* atau *"Pilihan terbaik"*.

---

## 10. Metric Sukses

### 10.1 Kriteria launch (produk "selesai" kalau)

- User baru selesaikan Snapshot (basic) dalam <10 menit
- User baru selesaikan Snapshot (dengan per-emiten) dalam <20 menit
- User tambah 1+ goal (FI auto-formula jalan) dalam <2 menit
- User jalankan **wizard keputusan** + lihat side-by-side dengan delta metric + goal dalam <2 menit
- User jalankan **wizard kapasitas** + lihat output deskriptif dalam <2 menit
- Semua 9 metric + per-emiten + goal + output kapasitas compute benar di **15 test scenario**
- Semua ~60 string Insight copy ditulis, di-review PM, di-audit terhadap §9
- Export xlsx ke-download, buka di Excel + Google Sheets, berisi 8 sheet
- Lighthouse performance ≥85 dengan snapshot (25 saham) + 5 goal + 2 skenario + capacity outputs loaded
- Self-checklist OJK §9 pass
- Harga IDX live jalan untuk ticker sample (BBCA, BBRI, BMRI, ASII, BBNI) dengan cache yang benar

### 10.2 Kriteria demo user-facing

- Demo path hero jalan dalam **60 detik**: landing → "Coba dengan data contoh" → Goal FI visible → wizard KPR → **vonis flip + shift goal** → Wizard Kapasitas "Max Utang" → reveal max aman → Panel Modal Options → done
- Dua reaksi visible dalam 60 detik: flip warna badge DSR + tanggal Goal mundur
- Wizard kapasitas bikin "second wow" dengan menjawab reverse question
- Mobile render gracefully

### 10.3 Post-launch (90 hari)

- 500+ unique visitor selesaikan Snapshot
- ≥150 visitor jalankan minimal satu Wizard Keputusan
- ≥100 visitor jalankan minimal satu Wizard Kapasitas
- ≥100 visitor tambah minimal satu Goal
- p50 time on page ≥6 menit
- ≥10 mention tidak diminta (r/finansial, X, grup Telegram FIRE)

---

## 11. Pertanyaan Terbuka

1. **Nama brand** — *Cermat* working. Alternatif: *Hitungin*, *Tepat*, *Bobot*. Perlu keputusan sebelum design.
2. **Sumber harga IDX live** — Yahoo Finance via `BBCA.JK` (rekomendasi), Goapi.id (berbayar), atau Stockbit unofficial (risky)?
3. **Multiplier FI formula** — Lock ke 300 (4% safe withdrawal), atau expose multiplier (240/300/360) ke user?
4. **Rumus Modal Siap Distribusi** — Cash + Deposito + RD + Crypto liquid? Atau juga kurangi buffer dana darurat (6× pengeluaran)? Atau biarkan user tag aset mana yang "deployable"?
5. **Scope wizard kapasitas** — Ship ketiga (Max Utang + Lunasi + Modal Options), atau top 2 saja?
6. **Ranking Modal Options** — Gimana opsi di-order di panel? By "improvement metric terbesar", by IDR amount, by user preference? *(Rekomendasi: by kategori — debt reduction → asset acquisition — tanpa framing "terbaik ke terburuk" biar gak preskriptif.)*
7. **Threshold Max Utang Aman** — Lock ke DSR<30%, atau biarkan user pilih threshold (Sehat/Waspada)?
8. **Handling tenor Lunasi Utang** — Saat partial KPR repayment: tenor lebih cepat (default) atau cicilan turun? Atau biarkan user toggle?
9. **Kedalaman per-emiten** — Lots + target + bobot + dual dividend (tanpa ladder), atau include ladder?
10. **Tipe goal** — 4 template (DP Rumah / Dana Pendidikan / FI / Custom). Konfirmasi.
11. **Cap goal** — 5 goal max? Lebih?
12. **Placement disclaimer OJK** — Footer + pre-wizard + pre-goal-save — seberapa prominent?
13. **Landing snapshot-first atau simulator-first?** — Rekomendasi snapshot-first dengan escape "Coba dengan data contoh".
14. **Investasi mobile** — Desktop-first, atau invest karena mayoritas orang Indonesia di HP?
15. **Profile data sample** — Konservatif (Sari) atau sophisticated (Bayu) untuk "Coba dengan data contoh"?
16. **Field required Cicilan Aktif** — Spec saat ini wajibkan `suku_bunga` + `tenor_sisa_bulan` + `jenis_bunga` di setiap row. Realistis untuk KPR/KPM (user punya dokumen akad), lebih sulit untuk Pinjol/Paylater (APR sering opaque). Opsi: relax ke "sisa + cicilan" minimum untuk `tipe ∈ {PINJOL, PAYLATER, KK}`, dengan proyeksi prepay-to-tenor §5.2.7 di-disable kalau bunga tidak diisi. Konfirmasi.
17. **Estimasi tenor utang revolving** — Untuk row KK/Paylater, kita auto-estimasi `tenor_sisa_bulan` dari sisa + minimum payment + bunga, atau selalu wajib user isi? Auto-estimasi lebih akurat tapi nambah UX surprise ("kenapa tenor berubah pas saya isi bunga?").
18. **Ordering Lunasi Utang di Modal Options** — Spec bilang "debt-reduction-then-asset-acquisition, bukan high-rate-first." Konfirmasi konvensi ini OJK-safe meskipun Pinjol rate tinggi sebelahan dengan KPR rate rendah di list opsi.

---

## 12. Roadmap

### Phase 2 (target: 4–6 minggu setelah launch)
- **Import xlsx** / round-trip + schema migration
- localStorage autosave dengan opt-in
- Perbandingan multi-skenario (3-way: Snapshot vs. A vs. B)
- Wizard keputusan tambahan: *Mau pindah kerja*, *Mau resign + bisnis*, *Mau anak*
- Wizard kapasitas tambahan: *Optimal Allocation* (rebalance ke target bobot), *Goal Acceleration Options*
- Accumulation ladder per-emiten (milestone 10/30/50/70/80/100%)
- Estimator pajak (PPh21, capital gains, pajak dividen)
- Toggle bahasa Inggris

### Phase 3 (eksploratoris)
- Snapshot historis (timeline multi-xlsx)
- Diagram Sankey cash flow
- Shareable read-only link (ephemeral token)
- Layout mobile-optimized
- Saham US (proxy yfinance)
- App native mobile

### Future (belum di-commit)
- Integrasi broker via upload statement manual
- Multi-portfolio / household / shared view
- Data intraday real-time untuk user aktif

---

## 13. Referensi & Anti-Referensi

**Produk ini harus terasa seperti:**
- Form pajak yang bersih dan menghargai waktu user
- Kalkulator fokus (Coda doc / tabel Notion) dengan sidebar pintar
- Alat medical-screening (Apple Health) — klinis tapi hangat
- Spreadsheet loan officer — tapi di pihak user
- Order pad broker — quiet, dense, precise *(khusus card per-emiten)*

**Produk ini TIDAK boleh terasa seperti:**
- Bibit / Pluang — terlalu gamified, warna growth-marketing
- Stockbit — terlalu padat, energi trader-floor
- Mint / Personal Capital — bank-blue, US-centric
- Loan calculator bank — terlalu kering, dioptimasi untuk institusi bukan user
- Robo-advisor — over-promising, preskriptif
- Spreadsheet — dingin, tanpa live feedback

---

## 14. Taruhannya

**Orang dewasa Indonesia track keuangan mereka, set goal hidup, dan ambil 1–3 keputusan finansial besar per tahun.** Hari ini toolkit-nya terfragmentasi: Stockbit untuk saham, Bibit untuk RD, xlsx custom untuk tracking akumulasi, tidak ada untuk simulasi skenario, tidak ada untuk reasoning kapasitas, tidak ada untuk decision support goal-aware.

**Cermat adalah artifact privacy-first terpadu** untuk workflow itu. Track → Plan → Decide → Discover. Tanpa signup, tanpa kebocoran, tanpa saran — hanya tooling yang lebih baik.

Selain itu juga:
- Bisa di-ship dalam ~11 hari sendiri dengan bantuan AI
- Bisa di-demo dalam 60 detik (slider flip + shift goal + reveal kapasitas)
- Differentiated dari setiap kompetitor di pasar Indonesia
- Clear dari zona abu-abu regulasi OJK *kalau* garis descriptive-only ditahan

Itu paketnya.

---

**Selanjutnya:** `personal-wealth-platform-design-guidelines-id.md` — brief design.
