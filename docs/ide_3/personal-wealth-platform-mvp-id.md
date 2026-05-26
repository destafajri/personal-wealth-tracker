# Cermat — Brief Konsep MVP

**Status:** Konsep
**Update terakhir:** 2026-05-26
**Nama brand kerja:** **Cermat** *(Bahasa Indonesia: hati-hati, teliti)*. Alternatif: *Hitungin*, *Tepat*, *Bobot*, *Sehat Finansial*. Final TBD.
**Dokumen pendamping:** `personal-wealth-platform-prd-id.md` (PRD lengkap)

---

## 1. Produk dalam satu kalimat

**Cermat adalah web app privacy-first untuk orang dewasa Indonesia agar bisa track gambaran keuangan lengkap (dengan harga saham IDX live dan akumulasi per-emiten), set goals (DP rumah, FI, dana pendidikan), simulasikan keputusan besar ("Mau KPR?" "Mau Gadai?" "Mau cicil?"), DAN lihat opsi berbasis kapasitas ("Berapa max utang aman?" "Apa yang bisa gw lakukan dengan modal likuid?") — semuanya tanpa signup atau kirim data ke server.**

---

## 2. Konsep Inti — Empat Mode

### Mode 1 — Snapshot

User input kondisi saat ini lewat form terpandu. Termasuk:

- Aset standar: kas, emas (dengan IDR/gram live), deposito, RD, SBN, properti, kendaraan, dana pensiun
- **Subsection saham per-emiten**: ticker + lots sekarang + lots target 100% + target bobot % + avg dividend yield + last dividend per lembar — dengan **harga IDX live** auto-fetched (Yahoo Finance pattern `BBCA.JK`)
- Utang & pengeluaran (dengan sub-section Gadai)
- App menghitung **9 metric** (8 kesehatan + 1 kapasitas) dengan threshold hijau/kuning/merah dimana applicable.

Power user lihat kedalaman per-emiten. User basic bisa biarkan section saham kosong. **Progressive disclosure** — field advanced collapsed by default.

### Mode 2 — Simulator ⭐ (killer feature — dua wizard family, 7 wizard total)

**Family A — Wizard Keputusan (4): "Mau gw X?"** *(forward-looking)*

| Wizard | Input | Yang ditampilkan |
|---|---|---|
| **"Mau ambil KPR"** | Harga rumah, DP, tenor, suku bunga | Shift DSR + Runway + **dampak goal** (contoh: "FI mundur 3 tahun") |
| **"Mau Gadai Emas"** | Gram digadai, tempo, bunga | Modal cair, Defisit/bulan, Rasio Tertahan |
| **"Mau cicil"** (kendaraan/elektronik) | Harga, DP, tenor, bunga | DSR setelah cicilan baru + dampak Savings Rate |
| **"Custom skenario"** | Tweak bebas | Side-by-side delta semua metric + shift goal |

**Family B — Wizard Kapasitas (3): "Bisa gw apa?" / "Berapa max?"** *(reverse-looking)*

| Wizard | Yang dijawab | Sample output |
|---|---|---|
| **"Max Utang Aman"** | Berdasarkan income + cicilan aktif, berapa max cicilan BARU yang masih masuk threshold "Sehat" (DSR <30%)? | *"Berdasarkan gaji Rp 18jt + cicilan aktif Rp 1.5jt, max cicilan baru biar DSR di zona Sehat: Rp 3.9jt/bln. Setara KPR ~Rp 480jt @ 15 tahun @ 7%, atau cicil mobil ~Rp 200jt @ 5 tahun @ 8%."* |
| **"Lunasi Utang Sekarang"** | Kalau user lunasi utang spesifik (penuh atau sebagian) dari modal likuid, apa yang berubah? | Pilih utang → preview side-by-side: likuid turun, pokok utang turun, DSR turun, goal shift. |
| **"Modal Likuid Options"** | Auto-generated list opsi deployment dari Modal Siap Distribusi dengan preview dampak | *"Modal Siap Rp 52jt. Opsi yang dihitungkan: lunasi KK (Rp 8jt) → DSR −2pp; prepay KPR (Rp 20jt) → tenor mundur 14 bln; beli BBCA 30 lot (Rp 18jt) → bobot 15→18%; tambah RD → kontribusi Goal FI."* |

Setiap wizard render **side-by-side**: *"Posisi Sekarang"* vs. *"Setelah Skenario"*, setiap metric diberi delta (▲ / ▼ / ●) dan flip threshold. **Proyeksi goal juga shift.**

### Mode 3 — Goals (dengan FI auto-formula)

User definisikan goal finansial. Per goal:

- **Tipe goal**: DP Rumah / Dana Pendidikan / Financial Independence / Custom
- **Target amount** (IDR) + **target date**
- **Bucket** — aset mana yang dihitung untuk goal ini (user tag)
- **Progress saat ini** (auto-computed dari aset yang di-tag)
- **Kontribusi bulanan dibutuhkan** untuk capai target tepat waktu
- **Status**: *On-Track* / *Off-Track* / *At-Risk* (deskriptif — tanpa saran)
- **Integrasi simulator**: skenario tampilkan dampak goal

**Goal Financial Independence — auto-formula:**

Saat user pilih goal type `FINANCIAL_INDEPENDENCE`, target_amount auto-compute dari snapshot:

```
FI Number = Pengeluaran Bulanan × 300
          (= 25 tahun × 12 bulan, ekuivalen dengan rumus 4% safe withdrawal)
```

Tampilan: *"FI Number kamu: Rp 5.4M (asumsi pengeluaran bulanan Rp 18jt × 300)."* User bisa override multiplier (contoh: 240 untuk conservative 4.2%, 360 untuk ultra-conservative 3.3%).

Multiple goal di-track simultan. Setiap punya progress bar dan proyeksi tanggal selesai sendiri.

### Mode 4 — Insight (deskriptif, tidak pernah preskriptif — diterapkan di semua mode)

Setiap metric, card per-emiten, card goal, dan output kapasitas punya penjelasan Bahasa Indonesia santai.

✅ **Boleh:** *"DSR kamu 33% — di zona Waspada (30–40%). Threshold sehat: <30%."*
✅ **Boleh:** *"Modal Siap Distribusi kamu Rp 52jt — cukup untuk lunasi Kartu Kredit (Rp 8jt) dan masih sisa Rp 44jt."*
✅ **Boleh:** *"Max utang baru yang masuk threshold sehat: Rp 3.9jt/bln cicilan."*
✅ **Boleh:** *"Goal FI kamu progress 18% — Rp 970jt dari Rp 5.4M target."*

❌ **Dilarang:** *"Sebaiknya kamu lunasi KK dulu sebelum ambil KPR."*

Tidak bisa ditawar. Lihat PRD §9 (mitigasi risiko OJK).

---

## 3. Kenapa ini penting

Orang dewasa Indonesia menghadapi sedikit tapi keputusan finansial besar, jarang, mostly tidak bisa di-undo setiap tahun — KPR, Gadai Emas, kendaraan kredit, mulai habit investasi, plan pendidikan anak, plan FI. Toolkit yang ada terfragmentasi:

- **Stockbit / Bibit / Pluang** mengelola portfolio yang sudah ada; tidak simulasi keputusan baru
- **Loan calculator** kasih angka cicilan in isolation; gak ngasih tau apakah keuangan *kamu* bisa absorb itu
- **Spreadsheet** handle tracking dengan baik tapi rusak saat di-share, gak bisa simulasi skenario, gak compute opsi berbasis kapasitas
- **Proyeksi bank/dealer** by design optimis
- **Cerita teman/keluarga** bias survivor
- **Tidak ada yang jawab "apa yang bisa gw lakukan sekarang?"** — pertanyaan kapasitas absen dari tools yang ada

**Cermat menyatukan empat mental model** — Track (Snapshot), Plan (Goals), Decide (Wizard Keputusan), dan Discover (Wizard Kapasitas) — dalam satu produk yang respect privacy.

### Angle differentiator

| Faktor | Kenapa penting |
|---|---|
| **Bisa di-demo dalam 60 detik** | Slider digeser → DSR flip + tanggal goal shift. Atau: panel Modal Options → 5 opsi deployment di-rank by dampak metric. |
| **Hook universal** | KPR / Gadai / Cicilan = keputusan finansial Indonesia universal. DP rumah / FI = goal hidup universal. |
| **Dua mode pertanyaan** | "Aman gak kalau gw X?" (forward) DAN "Apa yang bisa gw lakukan?" (reverse) — kompetitor cuma yang pertama |
| **Depth untuk sophistication** | Per-emiten + harga IDX live = depth fintech-grade nyata, bukan toy |
| **Privacy-first** | Tanpa signup, tanpa data user di server, tanpa bank linking |
| **Bisa di-ship sendiri** | Tanpa auth, tanpa DB user, client-side React + price-proxy kecil |

---

## 4. Minimum Lovable Scope — sprint 11 hari

| Hari | Milestone | Kriteria "selesai" |
|---|---|---|
| 1 | Project scaffold + design tokens + landing page | Deploy Vercel jalan; route styleguide render |
| 2 | Backend price proxy (IDX via Yahoo + emas Pegadaian + USD/IDR) | Ketiga endpoint return cached response |
| 3 | Form Snapshot — section basic + 9 metric (incl. Modal Siap Distribusi) | Semua metric compute live |
| 4 | Form Snapshot — subsection saham per-emiten dengan harga live | Card per-emiten render; harga IDX live update |
| 5 | Modul Goals — CRUD + bucket tagging + **FI auto-formula** | Multiple goal addable; FI target auto-compute dari pengeluaran × 300 |
| 6 | **Wizard Keputusan** — "Mau KPR" + side-by-side dengan dampak goal | Wizard KPR tunjukkan shift DSR + goal |
| 7 | **Wizard Keputusan** — "Mau Gadai" + "Mau cicil" + Custom | Keempat wizard keputusan fungsional |
| 8 | **Wizard Kapasitas** — "Max Utang Aman" + "Lunasi Utang" | Keduanya compute live; output deskriptif |
| 9 | **Wizard Kapasitas** — Panel "Modal Likuid Options" + Insight engine | Auto-generated options list jalan; ~50 string copy di-audit OJK |
| 10 | Export xlsx (6-sheet: Ringkasan, Snapshot, Per-Emiten, Goals, Skenario, Kapasitas) + polish landing | Download bersih, buka di Excel/Sheets |
| 11 | Pass microcopy, disclaimer OJK, edge state, mobile-tolerance | Lighthouse ≥85; ready to ship |

**Kalau waktu ketat, drop urutan ini:**
1. Wizard "Custom skenario"
2. Wizard "Modal Likuid Options" (pertahankan Max Utang + Lunasi Utang karena highest-value)
3. Polish mobile (cukup stack dengan hint)
4. Sheet xlsx export selain Snapshot + Per-Emiten

**Hard floor untuk launch viable:** Snapshot (basic + per-emiten) + wizard KPR + Max Utang Aman + Lunasi Utang + Goal tracker dengan FI formula + 9 metric + export xlsx. ~8 hari minimum.

---

## 5. Yang TIDAK ada di scope

| Fitur yang dicut | Kenapa |
|---|---|
| **Import** xlsx / round-trip | Defer ke fase berikutnya |
| Akun user / login | Pitch privacy + ship lebih cepat |
| localStorage autosave | Defer dengan opt-in |
| Perbandingan multi-skenario (3-arah) | Current vs. satu skenario saja |
| Snapshot historis / timeline | Eksploratoris |
| Diagram Sankey | Kompleksitas visual gak align |
| Fitur saran / robo-advisor | Garis keras — tidak akan pernah |
| Native mobile / PWA | Web-only; mobile-tolerant lewat responsive |
| Saham US, equities internasional | IDX saja |
| Harga crypto live | Manual entry cukup |
| Estimator pajak | Kategori beda |
| Data tick intraday real-time | 15-min Yahoo delay cukup |
| Accumulation ladders per-emiten (milestone 10/30/50/70/80/100%) | Defer |
| Shareable read-only link | Eksploratoris |

---

## 6. Pertanyaan strategis / terbuka

1. **Nama brand** — *Cermat* sebagai working. Alternatif: *Hitungin*, *Tepat*, *Bobot*, *Sehat Finansial*. Perlu keputusan sebelum design.
2. **Sumber harga IDX live** — Yahoo Finance via `BBCA.JK` (rekomendasi), Goapi.id (berbayar), atau Stockbit unofficial (risky)?
3. **Multiplier FI formula** — Lock ke 300 (4% safe withdrawal), atau expose slider multiplier ke user (240/300/360)?
4. **Rumus Modal Siap Distribusi** — Cash + Deposito + RD + Crypto liquid? Atau juga kurangi buffer dana darurat (6× pengeluaran)?
5. **Scope wizard kapasitas** — Ship ketiga (Max Utang + Lunasi + Modal Options), atau hanya top 2?
6. **Copy disclaimer** — Harus kuat. Anchor: *"Cermat adalah kalkulator dan alat bantu visualisasi. Bukan saran investasi atau perencanaan keuangan profesional."*
7. **Tipe goal** — 4 template (DP Rumah / Dana Pendidikan / FI / Custom). Konfirmasi.
8. **Kedalaman per-emiten** — Lots + target + bobot + dual dividend (tanpa ladder) untuk scope awal. Konfirmasi.
9. **Snapshot-first atau simulator-first?** — Rekomendasi snapshot-first dengan escape "Coba dengan data contoh".
10. **UX bucket goal** — Tag-based (rekomendasi), atau fixed asset-category mapping?
11. **Investasi mobile** — Strict desktop-first, atau invest karena mayoritas orang Indonesia di HP?

---

## 7. Apa yang BUKAN Cermat

- ❌ **Bukan robo-advisor** — tanpa rekomendasi beli/jual, tanpa saran rebalancing portfolio
- ❌ **Bukan aggregator bank-linked** — tanpa Open Finance, tanpa auto-import; hanya input manual
- ❌ **Bukan screener / trader tool** — tanpa buy signal, tanpa analisis teknikal
- ❌ **Bukan budgeting app** — tanpa kategorisasi transaksi
- ❌ **Bukan produk community / social** — tanpa leaderboard, tanpa sharing, tanpa profile
- ❌ **Bukan loan calculator bank** — tools bank dioptimasi untuk institusi; Cermat dioptimasi untuk user

---

## 8. Taruhannya

**Orang dewasa Indonesia track keuangan mereka, set goal hidup, dan ambil 1–3 keputusan finansial besar per tahun** — KPR, kendaraan, gadai, plan FI, dana pendidikan, mulai investasi rutin. Hari ini toolkit-nya terfragmentasi: Stockbit untuk saham, Bibit untuk RD, xlsx custom untuk tracking akumulasi, tidak ada untuk simulasi skenario, tidak ada untuk reasoning kapasitas, tidak ada untuk decision support goal-aware.

**Cermat adalah artifact privacy-first terpadu** untuk workflow itu. Track → Plan (Goals) → Decide (Wizard Keputusan) → Discover (Wizard Kapasitas). Tanpa signup, tanpa kebocoran, tanpa saran — hanya tooling yang lebih baik.

Selain itu juga:
- Bisa di-ship dalam ~11 hari sendiri dengan bantuan AI
- Bisa di-demo dalam 60 detik (slider flip + shift goal ATAU reveal panel kapasitas)
- Differentiated dari setiap kompetitor di pasar Indonesia
- Clear dari zona abu-abu regulasi OJK *kalau* garis descriptive-only ditahan

Itu paketnya.

---

**Selanjutnya:** Baca `personal-wealth-platform-prd-id.md` untuk spek fungsional lengkap, lalu lanjut ke design guidelines.
