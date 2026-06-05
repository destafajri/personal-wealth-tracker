# Phase 3: Ide & Inspirasi — Mamikos Alignment

**Sumber:** Adaptasi dari prompt Gemini + analisis codebase Cermat
**Tanggal:** 2026-06-05

---

## 1. Rewrite Copy & Parameter — Nuansa Anak Kos

### Pendekatan
Map copy yang ada di `lib/copy/strings.ts` ke versi anak kos. Bukan ganti semua, tapi ubah yang user-facing (form labels, hints, metric names) biar terasa "Mamikos".

### Contoh mapping (perlu dikonfirmasi):
| Sekarang | Versi Anak Kos |
|----------|---------------|
| Pendapatan Bulanan | Uang Saku / Gaji Bulanan |
| Pengeluaran | Biaya Hidup Bulanan |
| Cicilan Aktif | Utang / Cicilan |
| Modal Siap | Tabungan Darurat |
| Net Worth | Total Kekayaanku |
| Savings Rate | Sisa Uang per Bulan |
| Runway | Bisa Bertahan ... Bulan |
| DSR | Rasio Utang |
| Cek KPR | Simulasi Budget Ngekos |
| Mau KPR | Mau Kos / Sewa? |
| Mau Gadai | Butuh Dana Darurat? |

### File yang perlu disentuh
- `lib/copy/strings.ts` — copy registry utama
- `lib/copy/metric-explainers.ts` — penjelasan metric
- `components/snapshot/` — panel form labels
- `pages/index.vue` — landing copy
- `components/simulator/WizardLauncher.vue` — wizard card labels

### Catatan
- Metric names di `lib/finance/metrics.ts` (internal) TIDAK diubah — cuma display copy
- OJK disclaimer text tetap formal (regulatory requirement)

---

## 2. Gamifikasi — Persona Finansial Anak Kos

### Konsep
Setelah user isi snapshot, system kasih "Persona" berdasarkan profil keuangan mereka. Ride on metrics yang sudah ada.

### Persona ideas (berdasarkan Savings Rate + Modal Siap + aset):
| Persona | Kriteria | Tone |
|---------|----------|------|
| Sultan Kos | Savings Rate >40%, punya investasi | Flex, tapi inspiratif |
| Anak Kos Bijak | Savings Rate 15-40%, disiplin | Positive, relatable |
| Sobat Indomie | Savings Rate <15% atau minus | Lucu, tapi ada nudge |
| Investor Kos | Punya saham/RD/crypto meski ngekos | Keren, "masa depan cerah" |
| Pejuang Akhir Bulan | Runway <1 bulan | Empati + actionable tips |

### Logic (pseudo):
```
if (savingsRate >= 40 && hasInvestments) → Sultan Kos
if (savingsRate >= 40 && !hasInvestments) → Anak Kos Bijak
if (savingsRate >= 15) → Anak Kos Bijak
if (hasInvestments && savingsRate >= 0) → Investor Kos
if (savingsRate < 0) → Pejuang Akhir Bulan
else → Sobat Indomie
```

### Implementasi ideas
- Persona card muncul di dashboard setelah snapshot terisi
- Badge/icon yang eye-catching
- Animasi reveal (confetti? slide-in?)
- Persona bisa berubah seiring user update data

### File yang mungkin disentuh
- New: `lib/finance/persona.ts` — pure function persona logic
- New: `components/dashboard/PersonaCard.vue` — persona display
- `components/layout/DashboardPanel.vue` — mount persona card
- `lib/copy/strings.ts` — persona copy registry

---

## 3. Share Card — Spotify Wrapped Style

### Konsep
Card aesthetic yang merangkum persona + key stats buat di-share ke social media. Mirip Spotify Wrapped — orang share karena keren, bukan karena diminta.

### Design ideas:
- Card dengan gradient background yang instagrammable
- Persona + 3-4 key stats (Total Kekayaan, Savings Rate, Runway)
- Branding "Cermat x Mamikos"
- QR code atau link ke app

### Share methods:
- **Copy text** — pre-filled template: "Aku [Persona]! 💰 Total kekayaanku Rp X, bisa bertahan Y bulan tanpa penghasilan. Cek keuanganmu juga di Cermat x Mamikos!"
- **Share ke Twitter/X** — compose tweet dengan text + link
- **Share ke WhatsApp** — deep link wa.me
- **Download as image** — html2canvas atau similar (nice-to-have)

### Implementasi ideas
- New: `components/common/ShareCard.vue` — share card component
- New: `composables/useShare.ts` — share logic (copy + social media deep links)
- Persona card punya tombol share yang trigger ShareCard

### Catatan
- Client-side only — tidak butuh backend
- Privacy: user harus explicit click share, jangan auto-generate

---

## 4. CTA Mamikos Integration

### Konsep
CTA natural yang muncul di momen yang tepat, bukan banner generic.

### CTA placement ideas:
| Momen | CTA | Relevansi |
|-------|-----|-----------|
| Setelah lihat persona | "Cari Kos Sesuai Budgetmu di Mamikos" | Natural next step |
| Rasio sewa >30% penghasilan | "Budget sewamu terlalu besar! Cari kos yang lebih murah?" | Actionable |
| Landing page | "Mulai Cek Keuangan, Cari Kos Pas di Mamikos" | Entry point |
| Bottom of dashboard | "Mau pindah kos? Cek dulu budgetmu" | Soft nudge |

### URL target
- `https://mamikos.com` (default)
- Could be deep link ke search Mamikos dengan budget range (kalau ada API)

### Implementasi ideas
- New: `components/common/CtaMamikos.vue` — reusable CTA component
- Dipasang di beberapa lokasi strategis
- Styling: eye-catching tapi tidak mengganggu

---

## 5. Budget Sewa Kos (dari eks-Phase 6)

### Konsep
Tracking biaya sewa kos sebagai bagian dari pengeluaran. Bukan module baru, tapi enhancement di snapshot form.

### Ideas:
- Sewa kos sebagai expense category khusus
- Rasio sewa vs penghasilan (ideal ≤30%)
- Perbandingan sewa rata-rata per kota (nice-to-have)
- Tips hemat biaya kos

---

## Prioritas Implementasi

1. **Persona + Gamifikasi** (paling impactful buat kontes)
2. **CTA Mamikos** (brand affinity)
3. **Copy rewrite** (feel "Mamikos" throughout)
4. **Share Card** (viral growth engine)
5. **Budget Sewa Kos** (feature depth)

---

## 6. Multiple Entry Points di Landing Page

### Konsep
Daripada satu CTA "Mulai Sekarang", buat **dua entry point** yang beda experience tapi masuk ke app yang sama:

```
┌─────────────────────────────────────────────┐
│              CERMAT x MAMIKOS               │
│                                             │
│    "Cermat ngatur keuangan, biar ngekos     │
│     makin tenang"                            │
│                                             │
│   ┌──────────────┐  ┌──────────────────┐    │
│   │ 🏠 Cek       │  │ 📊 Wealth        │    │
│   │ Budget       │  │ Tracker          │    │
│   │ Ngekos       │  │ Lengkap          │    │
│   │              │  │                  │    │
│   │ Cek dulu     │  │ Track aset,      │    │
│   │ kamu tipe    │  │ utang, investasi │    │
│   │ anak kos     │  │ secara detail    │    │
│   │ apa?         │  │                  │    │
│   │              │  │                  │    │
│   │ [Mulai →]    │  │ [Mulai →]        │    │
│   └──────────────┘  └──────────────────┘    │
└─────────────────────────────────────────────┘
```

### Path 1: "Cek Budget Ngekos" (Anak Kos)
- Flow ringan, quick snapshot
- Copy casual anak kos
- Langsung dapat Persona (Sultan Kos / Sobat Indomie / dll)
- Share card + CTA Mamikos
- Target: viral growth, brand affinity

### Path 2: "Wealth Tracker Lengkap" (Serius)
- Flow yang sudah ada sekarang
- Full snapshot + semua wizard
- Copy tetap profesional tapi accessible
- Untuk user yang mau serius ngitung aset
- Target: functional depth

### Implementasi
- Landing page (`pages/index.vue`) punya dua CTA cards
- Set entry mode di URL params atau localStorage: `/app/snapshot?mode=kos` vs `/app/snapshot?mode=full`
- UI components detect mode → adjust copy, show/hide persona card, adjust form fields
- Sama-sama pakai engine perhitungan yang sama, cuma UX layer beda

### Kenapa ini bagus
- Juri lihat "Mamikos" di path pertama → langsung score brand affinity
- User serius tetap bisa pakai full power → tidak kehilangan functionality
- Satu codebase, dua pengalaman → efisien

---

## Constraints
- JANGAN ubah core logic perhitungan di `lib/finance/` — cuma baca output
- JANGAN ubah behavior/calculation/OJK posture — preservation guard berlaku
- Semua client-side, tidak butuh database
- Konsisten dengan design system yang ada (Tailwind tokens)
- OJK disclaimer text tetap formal (regulatory requirement)
