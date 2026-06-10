# Phase 7.1: Shareable Persona Card

**Priority:** HIGH (viral growth lever — direct response feedback juri demo)
**Prerequisite:** Phase 6+6.1+6.2 merged
**Effort estimate:** M-L (**6-7 hari**, tergantung hasil capture spike Day 1 — html2canvas pass = 6 hari, swap ke html-to-image = 7 hari. Jangan dikejar mepet; nilai fitur ini = polish visual.)
**Scope status:** 🔒 **LOCKED v3** — post AI tetangga round 2 (verdict 🟢 lock-able). Siap masuk implementasi setelah final ack tetangga di versi locked ini.

> **⛔ IMPLEMENTATION GATE — JANGAN GAS DULU:** Per instruksi tetangga + user, **jangan mulai ngoding** sebelum tetangga konfirmasi versi locked v3 ini. Update spec final dulu, tunggu lampu hijau, baru implementasi.

> **Catatan reviewer:** Spec ini sengaja **tidak menulis kode**. Field "Files to Touch" dan "Design hint" memberi konteks, tapi keputusan akhir (canvas vs html-to-image, struktur generic-nya, dll) sengaja dipertahankan terbuka sampai review tetangga selesai. Bagian "Open Questions" di bawah adalah daftar eksplisit yang gua mau dikritisi.

---

## Revision History

### v3 (2026-06-08) — post AI tetangga round 2 — 🔒 LOCKED

Tetangga round 2 verdict: **🟢 spec lock-able.** 6 amendment v2 verified di file (bukan ringkasan). Beberapa execution malah dinilai *lebih bagus dari yang diminta* (capture spike protocol pass/fail/escalate, Indomie display-only rename keep internal key). 1 cosmetic leftover + 5 substantive refinement dari jawaban 7 pertanyaan round 2.

**Round 2 refinements applied:**

| # | Title | Trigger | Section |
|---|---|---|---|
| 7 | **Cosmetic: hapus §4 intro basi** | ⚪ Tetangga round 2: line 162 masih kalimat lama "tetap A atau pindah B?" — kontradiksi sama rekomendasi flip di bawah | §4 intro rewrite |
| 8 | **Effort naik 6-7 hari** | 🟡 Tetangga round 2 Q7: Day 1 spike penuh + risiko swap lib. Range "tergantung hasil spike". | Header, §8 |
| 9 | **Day 1 = spike PENUH, refactor `useShare` geser ke Day 2** | 🟡 Tetangga round 2 Q1: spike = decision gate, jangan dikompres setengah hari | §8 |
| 10 | **Native share default: mobile primary, desktop fallback grid primary** | 🟡 Tetangga round 2 Q2: desktop yang support `navigator.share` (Safari macOS/Edge) UX-nya aneh — deteksi touch/pointer, bukan cuma feature-detect | §5.2 (UI pattern), §6.3 |
| 11 | **Banner copy dipangkas: "Temenmu <persona> 👀 Kamu tipe apa?" + microcopy privacy di bawah tombol** | 🟡 Tetangga round 2 Q4: copy v2 = 3 ide ditumpuk (hasil temen + ajakan + privacy). Banner = 1.5 detik attention, headline harus 1 hook. | §7 visual hint, §9 strings.ts list |
| 12 | **Anti-pattern: hindari vh/vw & %-height (Amendment 5 follow-up)** | 🟡 Tetangga round 2 Q5: html2canvas render di logical fixed (1080×1080), elemen viewport-unit-based bisa geser | §6.2 anti-pattern list |

**Status keputusan yang tetangga konfirmasi (no further bikeshedding):**
- "Sobat Mie" = LOCKED (Q3 — alternatif "Anak Kos Sejati" / "Pejuang Mie" dicatat tapi tidak dipilih, biar tidak habisin ronde review)
- §10 open Q v2 → clear, no new open items (Q6)

**⛔ Implementation gate:** spec ini LOCKED tapi **belum dikasih lampu hijau ngoding**. Tetangga & user minta tahan sampai versi locked v3 ini di-review final. Jangan gas implementasi sebelum konfirmasi.

---

### v2 (2026-06-08) — post AI tetangga round 1

Tetangga verdict: **🟡 minor revision, arsitektur solid, refinement saja.** Yang verified beres dari v1: privacy guardrails (§3), generic 3-layer architecture (§5), Teleport di-drop, reuse map jujur.

**Amendments applied:**

| # | Title | Trigger | Section yang berubah |
|---|---|---|---|
| 1 | **Capture spike Day 1, jangan lock engine** | 🟠 Tetangga #1: kualitas visual = value utama, html2canvas lemah di gradient → validate dulu, jangan belakangan | §4, §8, §11 |
| 2 | **Native `navigator.share({ files })` masuk Layer 1** | 🟠 Tetangga #2: target mobile-first; WA/X intent = teks+URL (bukan gambar), download = drop-off tinggi; native share sheet = jalur konversi utama | §5.2, §6.3, §8, §9, §11 |
| 3 | **Rename "Sobat Indomie" → "Sobat Mie"** | 🟠 Tetangga #3: produk komersial pihak ketiga di artefak publik dengan co-branding Mamikos = risiko asosiasi tanpa izin | §6.5 (NEW), §9 |
| 4 | **Deep link `?from=share` promote MUST-HAVE** | 🟡 Tetangga #4: tanpa loop landing, share → homepage generik → bounce; ½ hari yang nutup loop viral persis yang juri minta | §7, §8, §9, §11 |
| 5 | **Layout vertical-friendly dari awal (9:16-ready)** | 🟡 Tetangga #5: WA Status + IG Story = surface share dominan di anak kos Indonesia; minimal layout disiapkan biar 9:16 tinggal flip config, bukan redesign | §6.1, §6.2, §11 |
| 6 | **Privacy test greylist-boundary assertion** | ⚪ Tetangga minor: stats ON → assert cuma % & bln yang muncul, no derived number nyelip | §3.4 |

**Tetangga verdict 8 Open Questions** (diintegrate ke §10):

| # | Q v1 | Verdict tetangga | Action |
|---|---|---|---|
| 1 | WT entry point | Defer 7.2 ✅ — **catatan**: tier-share (Bibit→Hutan) kandidat kuat 7.2 (paling flexy) | Tambah ke Phase 7+ Backlog (README) |
| 2 | html2canvas cukup? | Test dulu jangan lock | → Amendment 1 |
| 3 | Stats default OFF/ON? | **OFF** — persona+emoji udah jadi wow-nya, stats nambah privacy risk tanpa nambah viral | Confirmed (no change) |
| 4 | 1:1 vs 9:16 | → Amendment 5 | → Amendment 5 |
| 5 | CTA generic vs per-persona | Generic dulu, per-persona = polish 7.2 | Confirmed (no change) |
| 6 | Branding text vs logo | Text-only, setuju | Confirmed (no change) |
| 7 | Deep link must vs nice | → Amendment 4 | → Amendment 4 |
| 8 | Generic timing | Setuju, seam sekarang satu consumer, tahan spekulatif | Confirmed (no change) |

**Effort impact:** 4-5 hari → 5-6 hari (deep link +½, capture spike +½, buffer swap engine +1 kalau gradient test gagal).

---

### v1 (2026-06-08) — initial draft

Initial spec post recon kode existing (`useShare.ts` + `ShareCard.vue` + `html2canvas` udah ada). Lihat git history untuk diff full.

---

## 1. Motivation

Feedback juri demo: Cermat perlu **viral growth lever**. Phase 6.2 udah ngasih persona archetype (Sultan Kos, Bibit Investor, Anak Kos Bijak, Pejuang Akhir Bulan, Sobat Indomie) — user dapet identitas finansial 1-baris yang relatable. Tapi:

- Hasil persona "mati di layar" — user tahu dia "Anak Kos Bijak", terus apa?
- Tidak ada artefak yang bisa di-pamerin keluar app.
- Tidak ada hook yang ngajak orang lain nyoba ("eh lo tipe apa?").

**Hipotesis:** Ubah hasil persona jadi **kartu visual yang shareable** → user share di sosmed/WA → tiap share = ajakan organik ke Cermat × Mamikos → low-cost viral growth.

**Sejalan dengan brand affinity Mamikos** — kalau persona-nya bilang "Anak Kos Bijak", ada touchpoint Mamikos yang halus (logo lock-up "Cermat × Mamikos"), bukan banner norak.

---

## 2. Existing State (apa yang udah ada — peta reuse)

Ini bagian KRITIS — banyak infra share sudah ada di repo. Phase 7.1 bukan greenfield. Sebelum draft solusi, audit dulu apa yang udah jalan vs apa yang gap.

### 2.1. Persona engine (READY — jangan sentuh)

| File | Role | Phase 7.1 stance |
|---|---|---|
| `lib/finance/persona.ts` | `resolvePersona({ savingsRate, runway, hasInvestments, isSnapshotReady }) → PersonaResult` | ✅ Reuse as-is |
| `lib/copy/strings.ts` (`persona.*` block) | 5 label + 5 tagline + 2 stats label | ✅ Reuse as-is. Mungkin tambah copy CTA share. |
| `lib/finance/persona.ts` → `PERSONA_STYLE_MAP` (di `PersonaCard.vue`) | gradient + emoji per persona | ⚠️ Saat ini hidup di komponen, bukan source-of-truth terpusat. Pertimbangkan pindahkan ke `lib/finance/persona.ts` agar `ShareCard` dan `PersonaCard` baca dari sumber sama (DRY). |

### 2.2. Share infrastructure (PARTIAL — perlu rework)

| File | Status | Gap untuk Phase 7.1 |
|---|---|---|
| `components/dashboard/PersonaCard.vue` | Card hasil persona + tombol Share2 di pojok | ✅ Tombol ada — tinggal pastikan keliatan jelas (ukurannya 7×7, agak kecil — pertimbangkan diperjelas) |
| `components/common/ShareCard.vue` | Modal share (4 button: Salin/WA/X/Download) + card visual | ⚠️ Major rework needed:<br>• Pakai `<Teleport>` ⇒ memory `feedback-nuxt-teleport-hydration.md` ⇒ refactor jadi inline fixed overlay<br>• Hard-coded persona — perlu generic<br>• Stats toggle expose `savingsRate %` & `runway bulan` — perlu audit privacy<br>• Aspect ratio modal `max-w-sm` belum tentu 1:1 atau 9:16 |
| `composables/useShare.ts` | `useShare(personaKey: Ref<PersonaKey \| null>)` + `html2canvas` capture | ⚠️ Signature terikat ke `PersonaKey` — perlu generic (Phase 7.2-ready) |
| `html2canvas@1.4.1` (package) | Terinstall, dynamic-import (lazy) | ✅ Reuse — atau evaluasi alternatif (lihat §4) |

### 2.3. Entry points (current vs target)

| Lokasi | Current | Phase 7.1 target |
|---|---|---|
| **Budget-kos Ringkasan** (`pages/app/budget-kos.vue` via `DashboardPanel.vue` → `PersonaCard.vue`) | ✅ Tombol Share2 ada | ✅ Stays — jadi entry point utama |
| **Wealth-tracker Ringkasan** (`/app/snapshot`) | ❌ Tidak ada PersonaCard di wealth-tracker (`v-if="isBudgetKos"`) | 🟡 **Open question** — apakah perlu? (lihat §10 Open Questions) |
| **Cermat Score Hero** (wealth-tracker) | Belum punya tombol share | 🟡 Defer ke Phase 7.2 (share score = beda artefak, beda privacy) |

### 2.4. Reuse matrix (apa yang panen vs apa yang baru)

| Aspek | Status |
|---|---|
| Persona resolver logic | 🟢 Panen 100% |
| Persona label + tagline + emoji | 🟢 Panen 100% |
| Persona gradient palette | 🟡 Panen tapi pindahkan ke source-of-truth terpusat |
| Image capture mechanism | 🟢 Panen `html2canvas` (atau evaluasi alternatif — lihat §4) |
| Modal/overlay component | 🔴 Rebuild (drop Teleport, restructure) |
| Card visual layout | 🟡 Reuse tapi resize ke aspect ratio share-friendly (1:1 atau 9:16) |
| Action buttons (Salin/WA/X/Download) | 🟢 Panen 100% |
| Share text generator | 🟡 Panen tapi pastikan tidak leak angka dalam text |
| **Generic card generator architecture** | 🔴 Baru — saat ini hard-coded persona |
| **Privacy whitelist explicit** | 🔴 Baru — saat ini implisit |
| **Deep link "Cek tipe temenmu"** | 🔴 Baru (opsional) |

---

## 3. Privacy Guardrails (hard requirement)

Sejalan dengan stance Cermat: **100% client-side, zero server upload, zero data leak**. Kartu yang di-share keluar app **wajib tidak bocorin keuangan asli user**.

### 3.1. Whitelist (boleh muncul di kartu)

| Item | Boleh muncul | Alasan |
|---|---|---|
| Nama persona (label) | ✅ | Hasil klasifikasi — tidak reveal angka |
| Tagline persona | ✅ | Copy statis dari `strings.ts` |
| Emoji + gradient | ✅ | Visual saja |
| Branding "Cermat × Mamikos" | ✅ | Identitas app |
| CTA "tipe keuangan kamu apa?" | ✅ | Ajakan, bukan data |
| URL `cermat.vercel.app` | ✅ | Public URL |

### 3.2. Greylist (boleh muncul TAPI dengan guardrail — DEFAULT OFF)

| Item | Boleh? | Guardrail |
|---|---|---|
| Savings Rate % | ⚠️ Default OFF | Toggle "Tampilkan stats" — eksplisit user consent. Saat ini sudah ada di `ShareCard.vue`. Tapi default state perlu dipertimbangkan: aman default OFF (privacy-first). |
| Runway (bulan) | ⚠️ Default OFF | Idem |
| Cermat Score (0-1000) | ⚠️ Default OFF (kalau diaktifkan) | Score komposit — tidak reveal angka tunggal, tapi tetap revealing kualitatif. **Phase 7.1: tidak masuk dulu** (Phase 7.2 evaluasi). |

### 3.3. Blacklist (DILARANG muncul di kartu)

| Item | Rule |
|---|---|
| Nominal Rupiah (saldo, utang, gaji, pengeluaran) | ❌ NEVER |
| Detail rincian (label akun, ticker saham, nama bank) | ❌ NEVER |
| Net Worth nominal | ❌ NEVER |
| Surplus nominal | ❌ NEVER |
| Goals nominal | ❌ NEVER |
| Apapun dari `snapshot.*` raw | ❌ NEVER |

### 3.4. Privacy audit checklist (wajib lulus sebelum implementasi merge)

- [ ] Card komponen hanya menerima props dari **whitelist** (atau toggled greylist)
- [ ] Tidak ada akses langsung ke `useSnapshotStore` di dalam komponen card (sumber data harus di-funnel via parent)
- [ ] Share text (yang di-copy ke clipboard / WA / X) tidak mengandung angka apapun
- [ ] Default state: stats toggle = OFF
- [ ] Toggle stats ada label jelas: "Tampilkan stats saya (terlihat publik)" — bukan ambiguous
- [ ] Filename download = `cermat-<persona-id>.png` (tidak mengandung data user)
- [ ] **Test unit (blacklist):** snapshot dengan saldo Rp 999.999.999 → output card DOM textContent + share text + PNG metadata tidak boleh mengandung substring "999"
- [ ] **Test unit (greylist boundary, Amendment 6):** stats toggle ON → assert *hanya* dua angka muncul di DOM: `<savingsRate>%` dan `<runway> bln`. Tidak ada derived number lain nyelip (mis. Cermat Score, net worth, nominal apa pun). Cara: query semua text node, regex `/\d/`, exclude whitelist pattern, assert count = 2.

---

## 4. Image Generation Approach

Tiga opsi dipertimbangkan. Saat ini repo pakai opsi A (`html2canvas`). Per Amendment 1 (v2), keputusan engine ditahan sampai capture spike Day 1 selesai — lihat rekomendasi di bawah.

### Opsi A: `html2canvas` (current) — kandidat default, dimulai dulu di spike

**Mekanisme:** Render card sebagai DOM normal (Tailwind), lalu capture jadi PNG via DOM-to-canvas painting.

**Pros:**
- Sudah terinstall + dipakai (zero setup baru)
- Designer tinggal bikin Tailwind component biasa
- Hot reload friendly (DOM = source of truth)
- Reuse existing card visual nyaris 100%

**Cons:**
- Bundle: `html2canvas` ~50kb gzip (sudah lazy-loaded — bukan blocker)
- Quirks rendering: gradient kadang aliasing, custom font kadang miss, CSS variables (`var(--color-*)`) kadang bermasalah → perlu test thorough di dark mode
- Tidak pixel-perfect dibanding desain

### Opsi B: Native `<canvas>` API + manual draw

**Mekanisme:** Draw text + shapes manual pakai Canvas 2D context.

**Pros:**
- Pixel-perfect, full control
- Lighter (zero new dep)
- Konsisten cross-browser (no DOM quirk)

**Cons:**
- Reinvent layout system (alignment, wrapping, padding)
- Designer iteration jadi mahal (tiap perubahan = ngoding Canvas)
- Reuse visual card existing = 0% (rewrite)

### Opsi C: `html-to-image` (alternative DOM-capture lib)

**Mekanisme:** Sama kategori `html2canvas`, lib berbeda. Lebih kecil (~25kb), kadang lebih baik handle modern CSS.

**Pros:**
- Lebih kecil
- Lebih baik di gradient / CSS modern

**Cons:**
- Migrasi = swap lib + retest semua quirk
- Sama-sama DOM-capture, kemungkinan tetap kena quirk lain

### Rekomendasi (Amendment 1 — flipped per tetangga review)

**Capture spike dulu di Day 1, baru lock engine.** v1 rekomendasi "stick A" — di-overrule tetangga: value fitur ini = kualitas visual buat dipamerin di IG/Story, dan `html2canvas` punya weakness terkenal di gradient (aliasing) padahal seluruh kartu kita berbasis gradient per persona. Lock-first → ketauan jelek di Day 4 setelah Layer 2+3 di-build di atasnya.

**Day 1 spike protocol (paralel dengan refactor `useShare` jadi generic):**

1. Build minimal kartu gradient (1 persona, hard-coded, no architecture) — tujuan: validate output quality, bukan code structure.
2. Capture pakai `html2canvas` → PNG → buka di:
   - Chrome desktop
   - Safari mobile (iOS) — historically engine paling rewel sama DOM-capture libs
   - WhatsApp / IG preview (apakah upload-back retain quality)
3. Gradient pass criteria: smooth, no banding, no clipping. Drop-shadow render. Font Inter/Plus Jakarta Sans render (not fallback).
4. **Pass:** lanjut Layer 2+3 dengan `html2canvas`.
5. **Fail:** swap ke `html-to-image` (Opsi C — lib lebih kecil + reputasi lebih baik di gradient). Re-spike sama lib baru, +1 hari effort.
6. **Fail keduanya:** eskalasi — pertimbangan: drop gradient → flat color per persona (lebih aman lib-agnostic) atau go Opsi B (native canvas, full control, mahal di iteration).

**Decision artifact:** simpan PNG hasil spike di `.review/spike-capture-day1/` + 1-paragraf temuan, sebelum proceed.

---

## 5. Card Generator: Generic Architecture (untuk Phase 7.2-readiness)

AI tetangga minta: **"image-generation-nya reusable/generic, jangan hardcode khusus persona card. Kedepannya hasil lain (misal hasil kalkulator di Phase 7.2) bakal mau di-share pakai mesin yang sama."**

### 5.1. Saat ini (anti-pattern yang harus dihindari)

```ts
// composables/useShare.ts (current)
useShare(personaKey: Ref<PersonaKey | null>) { ... }
//        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//        Signature terikat ke domain "persona"
```

Kalau Phase 7.2 mau share hasil kalkulator, opsinya:
- Tambah parameter union → signature bloat
- Bikin `useShareKalkulator()` → duplikat logic capture

Dua-duanya jelek. Solusi: **separation of concerns**.

### 5.2. Generic architecture (proposed)

Tiga lapis, satu domain (`share/`):

```
┌─────────────────────────────────────┐
│ Layer 3: Use-case card komponen     │
│ - PersonaShareCard.vue (Phase 7.1)  │
│ - KalkulatorShareCard.vue (7.2)     │
│ - BadgeShareCard.vue (future)       │
└─────────────────────────────────────┘
                  ↓ slot/children
┌─────────────────────────────────────┐
│ Layer 2: Generic share modal/UI     │
│ - ShareDialog.vue                   │
│   (inline overlay, action buttons,  │
│    aspect-ratio constraint, accepts │
│    arbitrary card content via slot) │
└─────────────────────────────────────┘
                  ↓ ref + payload
┌─────────────────────────────────────┐
│ Layer 1: Pure share primitives      │
│ - useShare()                        │
│   (captureElementAsPng, copyText,   │
│    shareToWa, shareToTwitter)       │
│   ← agnostic, no domain knowledge   │
└─────────────────────────────────────┘
```

**Layer 1 — `useShare()`:**
- Signature: `useShare()` (no args) → return functions yang menerima payload eksplisit per-call
- Functions:
  - `captureAsPng(el, opts) → Promise<Blob>` — capture DOM jadi PNG (engine yang menang spike Day 1)
  - `copyText(text) → Promise<void>` — clipboard
  - `shareToWa(text)` — `https://wa.me/?text=...` intent (teks+URL fallback)
  - `shareToTwitter(text)` — `https://twitter.com/intent/tweet?text=...` intent (teks+URL fallback)
  - **`shareNative({ files, text, title }) → Promise<boolean>` (Amendment 2)** — wrapper di atas `navigator.share()` Web Share API. Return `true` kalau native sheet kebuka, `false` kalau unsupported / user-cancelled / file-share unsupported (browser old). Layer 3 pakai return value buat decide: show fallback grid (Salin/WA/X/Download) atau hide button-nya.
- Zero domain knowledge — gak tau apa itu PersonaKey.

**Kenapa `shareNative` di Layer 1, bukan Layer 3 (Amendment 2 — per tetangga #2):**

Target user = anak kos Indonesia mobile-first. Realitas UX:
- WhatsApp/Twitter intent = **teks+URL doang** (PNG-nya ketinggalan).
- Download → buka Files → upload manual ke IG = **drop-off besar**, terutama di Safari iOS yang nyimpen ke Photos lewat extra step.
- `navigator.share({ files: [pngBlob] })` = OS-level share sheet → IG / TikTok / Story / WA / Telegram / Twitter app langsung dapet gambar.

**Browser support (per 2026):** Web Share API Level 2 (file share) stable di Chrome Android, Safari iOS 15+, Edge. Desktop spotty (Chrome desktop OK, Firefox no). Fallback grid tetap wajib.

**UI pattern di Layer 3 — Amendment 10 (round 2 Q2): split default mobile vs desktop:**

```
Device detection (touch/pointer-based, BUKAN cuma feature-detect navigator.share):
  ├─ Mobile (touch primary) + shareNative supported →
  │     Tombol "Bagikan 📤" primary
  │     Grid 4 fallback tersembunyi (atau muncul kalau native gagal/cancelled)
  │
  └─ Desktop (pointer/mouse primary) →
        Grid 4 button (Salin/WA/X/Download) primary
        Native share tombol HIDDEN — meskipun browser support
        (Safari macOS/Edge support navigator.share tapi UX desktop sheet
         aneh & user desktop tidak expect — lebih natural pakai grid)
```

**Kenapa deteksi touch/pointer, bukan murni `navigator.share` exists:** Safari macOS + Edge desktop support `navigator.share`, tapi:
- Native share sheet desktop = window kecil aneh, jarang dipakai user
- User desktop expect copy/download flow tradisional
- Mobile user expect share sheet OS (sudah jadi muscle memory IG/WA Story)

**Implementation hint:** pakai `matchMedia('(pointer: coarse)')` atau `'ontouchstart' in window` untuk deteksi. Atau combo: `pointer: coarse` AND `navigator.share` AND `navigator.canShare({ files })`. Layer 1 expose `isMobileShareCapable()` helper.

Bukan: tampilkan tombol "Share" terpisah dari grid di atas mobile (redundant). Native share di mobile = primary path; grid di desktop = primary path. Konsisten = 1 primary path per platform.

**Layer 2 — `ShareDialog.vue`:**
- Props: `open: boolean`, `aspectRatio?: '1:1' | '9:16'` (default `'1:1'` — Amendment 5: layout slot harus vertical-friendly biar seam `aspectRatio` beneran tinggal flip config), `downloadName?: string`, `shareText: string`
- Slot: `default` (the card visual content)
- Renders: inline fixed overlay (NOT Teleport) + native-share-first action area (fallback grid). Captures whatever's in the slot.
- Zero domain knowledge.

**Layer 3 — `PersonaShareCard.vue`:**
- Domain-specific. Composes Layer 2 + Layer 1.
- Knows about `PersonaKey`, gradient, emoji, tagline.
- Phase 7.2: bikin `KalkulatorShareCard.vue` yang juga compose Layer 2 + Layer 1 dengan visual berbeda.

### 5.3. Scope discipline (penting!)

**Phase 7.1 implementasi:** Layer 1 + Layer 2 + Layer 3 (persona only).
**Phase 7.1 BUKAN:** bikin Layer 3 buat use-case lain. Hanya persona.

Kenapa? Karena "generic" yang dibikin tanpa real second use-case = over-engineering. Phase 7.2 pas implementasi use-case kedua = momen real-validation buat apakah Layer 1+2-nya beneran generic atau perlu refactor.

**Risiko & mitigasi:** Kalau Phase 7.2 ternyata butuh feature yang Layer 2 saat ini gak provide (mis. multi-page card), itu refactor wajar — itulah gunanya iterasi. Yang dilarang: bikin Layer 2 yang spekulatif (multi-page support, animation, dll) tanpa real consumer.

---

## 6. Card Visual Spec (Phase 7.1 — persona card)

### 6.1. Aspect ratio (Amendment 5 — vertical-friendly seam)

- **Default render: 1:1 (square)** — paling universal (IG post, FB post, WA status thumb).
- **Phase 7.1 ship:** 1:1 only sebagai output yang available di UI.
- **TAPI layout slot wajib disusun vertical-friendly dari awal** — sehingga seam `aspectRatio` prop di `ShareDialog` (§5.2) tinggal flip config buat 9:16 di Phase 7.2 / hotfix, bukan redesign visual.

**Konkretnya:** stack vertikal (emoji → label → tagline → stats → CTA → branding), single-column, padding generous. Hindari layout horizontal 2-kolom atau elemen yang assume aspect 1:1 (mis. circle background yang touch 4 edges). Center-align semuanya. Margin atas/bawah longgar — jadi waktu container di-stretch vertikal (9:16), proporsi gak rusak.

### 6.2. Layout (default render 1:1, vertical-friendly biar 9:16 tinggal flip — Amendment 5)

```
┌──────────────────────────────┐
│                              │  ← padding atas (longgar, scale-friendly)
│         [EMOJI BESAR]        │  ← 96-128px, drop-shadow
│                              │
│      Anak Kos Bijak          │  ← persona label, 2xl/3xl bold
│   Disiplin ngatur keuangan   │  ← tagline, base, opacity 90%
│                              │
│   ┌─ (optional toggle) ──┐   │
│   │ Sisa Uang   Bertahan │   │  ← stats card (kalau toggle ON)
│   │   35%       6 bln    │   │     -- DEFAULT OFF
│   └──────────────────────┘   │
│                              │  ← spacer (di 9:16 lebih besar — pakai flex grow)
│  tipe keuanganmu apa?        │  ← CTA, sm italic
│  Coba di Cermat × Mamikos    │  ← branding
│  cermat.vercel.app           │  ← URL, xs mono
│                              │  ← padding bawah (longgar)
└──────────────────────────────┘
```

**Anti-pattern (tolak):**
- 2-kolom (emoji kiri, copy kanan) — break di 9:16
- Absolute-positioned dengan persen yang assume 1:1
- Circle background ber-radius = 50% width = jadi oval di 9:16
- **`vh` / `vw` units** atau **`%`-height yang depend ke parent dynamic** (Amendment 12, round 2 Q5) — html2canvas render di **logical fixed size** (mis. 1080×1080), elemen viewport-unit-based bisa geser pas capture lintas device. Pakai fixed/aspect-based sizing (px, em, rem, atau aspect-ratio CSS).

**Pattern OK:**
- `flex flex-col items-center justify-between` + `flex-grow` di spacer middle
- Gradient via `bg-gradient-to-b` (top→bottom) — natural di portrait
- Padding pakai `px-8 py-12` (uniform, scale-friendly)
- Sizing: `w-[1080px] aspect-square` atau `aspect-[9/16]`, font pakai `text-base/lg/xl/2xl` (rem-based) — bukan `text-[3vw]`

Gradient background per persona (reuse + pindahkan `PERSONA_STYLE_MAP` ke `lib/finance/persona.ts` jadi source-of-truth).

### 6.3. Visual rules

- **Logo Mamikos:** lock-up text "Cermat × Mamikos" (no logo image — privacy concern, dependency hassle). Halus, di footer.
- **URL:** static `cermat.vercel.app` di footer (font monospace kecil).
- **CTA copy:** *"tipe keuangan kamu apa? Coba di Cermat"* — atau iterasi lain. Tone casual, ngajak.
- **Stats toggle (kalau ON):** card kecil 2-kolom (Sisa Uang %, Bertahan bln) — sudah ada di `ShareCard.vue`, tinggal pastikan default OFF.
- **Dark mode:** card sebaiknya **selalu light** (gradient warna) — independen dari theme app. Alasannya: dark mode jadi inkonsisten dengan IG/sosmed feed yang dominan light.
- **Native share button (Amendment 2 + 10):** **mobile-only primary** — label "Bagikan" + emoji 📤. **Desktop:** tombol native ini HIDDEN, grid 4 button (Salin/WA/X/Download) jadi primary (lihat §5.2 UI pattern). Di mobile, kalau `shareNative` return `false` (unsupported/cancelled) → fall back ke grid 4 button.

### 6.4. Font

Gunakan font yang sudah di-load app (Inter/Plus Jakarta Sans). **Catatan:** `html2canvas` kadang gagal capture custom font kalau belum fully loaded — wajib tunggu `document.fonts.ready` sebelum capture.

### 6.5. Persona naming untuk konteks publik (Amendment 3)

Tetangga flag: persona ke-5 saat ini bernama **"Sobat Indomie"**. Di v1, persona cuma muncul in-app sebagai label — aman. Di v2, persona jadi **artefak publik dengan co-branding "Cermat × Mamikos"**. Naro nama produk komersial pihak ketiga (Indomie / Indofood) di kartu yang di-share = risiko:

1. Asosiasi brand pihak ketiga tanpa izin (Indofood gak approve usage).
2. Implikasi "lo gembel sampe makan Indomie" yang nempel ke co-branding Mamikos (Mamikos ikut kebawa).

**Recommendation:** Rename ke **"Sobat Mie"** (tetangga's primary suggestion). Alasan:
- "Sobat Mie" generik (mie instan jenisnya banyak) — tidak asosiasi brand spesifik.
- Tone hangat & relatable tetap terjaga (sesuai persona empati hemat).
- 1-kata-beda dari original → minimal disruption ke recognition kalau ada user lama.

**Alternatif (kalau "Sobat Mie" gak click):**
- "Sobat Hemat" — paling netral, OJK-friendly, tapi flat (kehilangan warmth).
- "Anak Kos Hemat" — masuk theme "Anak Kos *" tapi numpuk dengan "Anak Kos Bijak".

**Implementasi:**
- Update `lib/copy/strings.ts`: `persona.sobatIndomie.label` value `"Sobat Indomie"` → `"Sobat Mie"`. Update `persona.sobatIndomie.tagline` kalau referencing "indomie" specifically (current: `"Hemat itu pilihan, tapi yang penting happy!"` — aman, tidak perlu ubah).
- **Keep internal `PersonaKey` = `'sobatIndomie'`** untuk menghindari breaking change ke localStorage, tests, dan fixtures yang reference key. Display-only rename.
- Note di kode: comment di `persona.ts` jelaskan kenapa key beda dari display label (technical debt yang reasonable).

**Open untuk override:** kalau user/tetangga prefer rename internal key juga (consistency > backwards-compat), itu juga acceptable — cost: update 3-5 file + test snapshot regen.

---

## 7. Deep Link "Cek Tipe Temenmu" — MUST-HAVE (Amendment 4)

Status: **MUST-HAVE Phase 7.1** (promote dari opsional per tetangga review).

### Konsep

Pas user share kartu di sosmed/WA, link yang dibagikan = URL ke landing Cermat yang ngajak orang **nyoba quiz persona singkat** (atau langsung ke onboarding budget-kos). Beda dari sekadar share URL homepage.

### Kenapa MUST, bukan opsional (Amendment 4)

Tanpa loop landing:
```
User A share kartu → User B klik link → mendarat di homepage generik → bounce
```

Dengan loop landing:
```
User A share kartu → User B klik link → banner "penasaran tipe kamu?" → CTA → budget-kos onboarding → konversi
```

Tetangga: *"Ngapain ship fitur viral tapi pengalaman pendaratan buat yang ngeklik-nya rusak?"* Setuju — fitur viral tanpa landing loop = bocor di mulut botol. Opsi A cuma ½ hari, masuk akal.

### Opsi A: URL parameter (PILIH untuk 7.1)

```
https://cermat.vercel.app/?from=share&persona=sobatMie
```

**Behavior:**
- Landing page (`pages/index.vue`) baca query string `from=share` di mount
- Kalau `from=share` ada → render banner overlay di hero: **"Penasaran tipe kamu? Yuk isi data, gratis & 100% di HP kamu — gak ke server"**
- Banner punya 1 CTA: **"Cek tipe saya"** → `navigateTo('/app/budget-kos?onboard=1')`
- Optional: kalau `persona=<key>` valid, banner show preview *"Temanmu adalah Sobat Mie 🍜"* → bikin lebih personal
- Banner dismissible (X button) — no localStorage persist (next visit, kalau klik link share lain, muncul lagi)

**Effort:** S (½ hari) — parse query + conditional banner component + 1 string copy.

**Privacy:** `persona=<key>` di URL = nama persona doang, no nominal. Aman (whitelist §3.1).

**Analytics:** boleh nyusul (Phase 7.2 / setelah validasi viral). Loop dulu, ukur belakangan.

### Opsi B: Dedicated landing `/persona` (DEFER ke Phase 7.3)

Halaman terpisah `/persona?ref=share` dengan quiz singkat (3-4 pertanyaan ringan) → output preview persona → CTA ke full app.

**Effort:** L (2-3 hari) — desain quiz, copy, scoring sederhana. Defer karena Opsi A udah nutup loop minimum viable.

### Visual hint banner — Amendment 11 (round 2 Q4): dipangkas, 1 hook headline

Copy v2 (3 ide ditumpuk: hasil temen + ajakan + privacy) → dipangkas jadi headline 1 hook + privacy ke microcopy bawah tombol. Banner mendarat = ±1.5 detik attention, tidak boleh paragraf.

```
┌─────────────────────────────────────────────┐
│  Temenmu Sobat Mie 🍜👀                     │  ← headline = 1 hook
│  Kamu tipe apa?                             │
│                                             │
│  [ Cek gratis → ]              [ × tutup ]  │  ← CTA tegas
│                                             │
│  🔒 100% di HP kamu — gak ke server         │  ← microcopy privacy
└─────────────────────────────────────────────┘
```

**Copy spec:**
- **Headline (1 hook):** `"Temenmu {personaLabel} 👀"` + sub-baris `"Kamu tipe apa?"` (kalau `?persona=<key>` valid). Kalau invalid → fallback: `"Cek tipe keuangan kamu 👀"`.
- **CTA:** `"Cek gratis →"` (tegas, action-oriented).
- **Microcopy privacy:** `"🔒 100% di HP kamu — gak ke server"` (kecil, di bawah tombol — bukan di headline).

**Behavior:**
- Card kecil di atas hero, soft shadow, gradient sesuai persona kalau `persona=` valid (atau emerald default).
- Bukan modal — non-blocking, biar user bisa langsung scroll-explore kalau gak mau klik.
- Dismissible (X). No localStorage persist — next visit dari share link lain, muncul lagi.

---

## 8. Implementation Order (LOCKED v3 — post round 2)

**Catatan:** ini urutan implementasi yang sudah di-lock. **Belum dieksekusi** — tunggu konfirmasi tetangga di versi locked v3.

**Per Amendment 9 (round 2 Q1):** Day 1 = **capture spike PENUH** (decision gate, jangan dikompres). Refactor `useShare` geser ke Day 2. Spike pondasi → kalau fail dan harus swap engine, itu +1 hari yang real. Effort 6 hari (spike pass first try) sampai 7 hari (perlu swap lib).

| Hari | Task | Files |
|---|---|---|
| **1 (PENUH)** | **🟠 Capture-quality spike (Amendment 1 + 9)** — minimal kartu gradient hard-coded, capture pakai html2canvas, test di Chrome desktop + Safari iOS + WhatsApp/IG preview. Pass criteria: §4 protocol. Simpan PNG ke `.review/spike-capture-day1/`. **Tidak dipaksa setengah hari — spike ini decision gate.** Pas hasilnya fail → swap ke `html-to-image`, re-spike (+1 hari). Fail keduanya → eskalasi (flat color atau native canvas). | spike branch / throwaway component, decision artifact: 1-paragraf temuan |
| **2 — pagi** | Refactor `useShare.ts` → generic (Layer 1), no domain coupling. **Tambah `shareNative({ files, text, title })` + `isMobileShareCapable()` helper** (Amendment 2 + 10) — feature-detect combo `pointer: coarse` + `navigator.canShare({ files })`. | `composables/useShare.ts` |
| **2 — siang** | Audit privacy: write unit tests yang assert no-leak (blacklist §3.4) + greylist boundary (Amendment 6) | `tests/composables/useShare.test.ts` (NEW) |
| **2 — sore** | Build `ShareDialog.vue` (Layer 2): inline fixed overlay (NOT Teleport), `aspectRatio` prop seam (default `'1:1'`), **action area dengan split mobile-primary-native vs desktop-primary-grid (Amendment 10)** | `components/common/ShareDialog.vue` (NEW) |
| 3 | Build `PersonaShareCard.vue` (Layer 3) — **vertical-friendly layout (Amendment 5 + 12)**, no `vh`/`vw`/`%`-height, default stats OFF, gradient via `bg-gradient-to-b` | `components/share/PersonaShareCard.vue` (NEW) |
| 4 — pagi | Pindahkan `PERSONA_STYLE_MAP` ke `lib/finance/persona.ts` (source-of-truth) | `lib/finance/persona.ts`, `components/dashboard/PersonaCard.vue` |
| 4 — siang | **Rename "Sobat Indomie" → "Sobat Mie" (Amendment 3 — LOCKED)** di `lib/copy/strings.ts` label. Keep internal `PersonaKey`. Update tests yang assert string. | `lib/copy/strings.ts`, `tests/finance/persona.test.ts` |
| 4 — sore | Wire entry point di `PersonaCard.vue` (tombol Share → `ShareDialog` baru) + perjelas tombol (size 9×9 + tooltip "Bagikan kartu") | `components/dashboard/PersonaCard.vue` |
| **5** | **🟡 Deep link `?from=share` handler (Amendment 4 + 11 — MUST)** — landing banner dengan copy yang dipangkas (`"Temenmu <persona> 👀 Kamu tipe apa?"` + CTA "Cek gratis →" + microcopy privacy), parse query, conditional render, dismissible | `pages/index.vue` + `components/landing/ShareInviteBanner.vue` (NEW) |
| 5 | Cross-browser test capture (Chrome/Safari mobile + desktop), dark mode, slow network 3G, font-loading race, native share di iOS Safari + Chrome Android | manual QA |
| 6 | Polish: font loading wait (`document.fonts.ready`), error state (capture fail toast), loading state ("Sedang membuat kartu…"), native-share fallback UX, banner gradient per persona | sesuai temuan |
| **7 (buffer)** | Buffer kalau spike Day 1 fail → swap ke html-to-image + re-spike + revisit Layer 3 styling. Atau polish iteration based on QA. | sesuai temuan |

**Effort estimate (LOCKED):** **6 hari** kalau spike pass percobaan pertama (html2canvas oke); **7 hari** kalau perlu swap ke html-to-image. Range "6-7 hari, tergantung hasil spike Day 1" — jangan dipaksa lebih cepat, nilai fitur ini = polish visual.

---

## 9. Files to Create / Modify

### To Create

| File | Purpose |
|------|---------|
| `components/common/ShareDialog.vue` | Layer 2 — generic share modal (inline overlay, native-share-first + fallback grid) |
| `components/share/PersonaShareCard.vue` | Layer 3 — persona-specific card visual (vertical-friendly, Amendment 5) |
| `components/landing/ShareInviteBanner.vue` | **NEW (Amendment 4)** — banner di landing yang muncul kalau `?from=share` |
| `tests/composables/useShare.test.ts` | Privacy assertion + capture function tests + `shareNative` feature-detect test |
| `tests/components/PersonaShareCard.test.ts` | Snapshot test — assert no nominal in DOM (blacklist §3.4) + greylist boundary (Amendment 6) |

### To Modify

| File | Change |
|------|--------|
| `composables/useShare.ts` | Refactor jadi generic (Layer 1). Hapus dependensi `PersonaKey`. **Tambah `shareNative({ files, text, title })` (Amendment 2)** dengan feature-detect `navigator.canShare({ files })`. |
| `components/dashboard/PersonaCard.vue` | Tukar `<ShareCard>` jadi `<ShareDialog>` + `<PersonaShareCard>`. Tombol Share2 sedikit diperjelas (size 9×9 + tooltip "Bagikan kartu"). |
| `lib/finance/persona.ts` | Tambah `PERSONA_VISUALS: Record<PersonaKey, { gradient, emoji }>` sebagai source-of-truth. Comment di `'sobatIndomie'` key: kenapa display label beda (Amendment 3). |
| `lib/copy/strings.ts` | (a) Tambah copy CTA share: `share.cta`, `share.toggleStats`, `share.brandLockup`, `share.nativeButton` (`"Bagikan"`). (b) **Amendment 3:** ubah value `persona.sobatIndomie.label`: `"Sobat Indomie"` → `"Sobat Mie"`. (c) **Amendment 4 + 11 (round 2):** tambah copy banner dengan template pangkas:<br>• `landing.shareInvite.headlineTemplate`: `"Temenmu {persona} 👀"` (template, persona dari query)<br>• `landing.shareInvite.headlineFallback`: `"Cek tipe keuangan kamu 👀"` (kalau persona invalid)<br>• `landing.shareInvite.sub`: `"Kamu tipe apa?"`<br>• `landing.shareInvite.cta`: `"Cek gratis →"`<br>• `landing.shareInvite.microcopyPrivacy`: `"🔒 100% di HP kamu — gak ke server"` |
| `pages/index.vue` (landing) | **Amendment 4:** baca `?from=share` & optional `?persona=<key>` di mount → render `<ShareInviteBanner>` di atas hero. |
| `tests/finance/persona.test.ts` | Update string assertion `"Sobat Indomie"` → `"Sobat Mie"` (kalau test reference label). |

### To Deprecate / Delete

| File | Status |
|------|--------|
| `components/common/ShareCard.vue` | DELETE setelah `PersonaCard.vue` migrate ke `ShareDialog + PersonaShareCard` |

---

## 10. Open Questions — RESOLVED (post tetangga round 1)

8 open questions v1 udah dijawab tetangga round 1. Diringkas di Revision History → "Tetangga verdict 8 Open Questions". Detail per item:

| # | Q | Verdict | Status |
|---|---|---|---|
| 1 | WT entry point | Defer 7.2 ✅. Catat: **tier-share (Bibit→Hutan) = kandidat kuat 7.2** (paling flexy). | Tutup. Tier-share ditambahkan ke Phase 7+ Backlog (README). |
| 2 | html2canvas cukup? | Test dulu, jangan lock | → Amendment 1 (§4, §8) |
| 3 | Stats default OFF/ON? | **OFF** — persona+emoji udah jadi wow-nya, stats nambah privacy risk tanpa nambah viral | Tutup (no change) |
| 4 | 1:1 vs 9:16 | Layout vertical-friendly dari awal, ship 1:1 sekarang | → Amendment 5 (§6.1, §6.2) |
| 5 | CTA generic vs per-persona | Generic dulu, per-persona = polish 7.2 | Tutup (no change) |
| 6 | Branding text vs logo | Text-only, setuju (logo = risiko render + hassle dark/light) | Tutup (no change) |
| 7 | Deep link must vs nice | **Must-have** — nutup loop viral | → Amendment 4 (§7, §8) |
| 8 | Generic timing | Seam sekarang, satu consumer, tahan spekulatif | Tutup (no change) |

### Open untuk round 2 (kalau ada)

- **Persona rename: cuma display label, atau termasuk internal `PersonaKey`?** Rekomendasi v2: display-only (avoid migration). Override possible.
- **Native share button label & icon** — "Bagikan" + 📤 cukup atau perlu copy yang lebih persuasif?
- **Banner deep link copy** — *"Penasaran tipe kamu? Yuk isi data, gratis & 100% di HP kamu — gak ke server"* — terlalu panjang? Bisa lebih punchy?

---

## 11. Success Criteria

- [ ] **Capture spike Day 1 (Amendment 1):** PNG hasil html2canvas (atau swap engine) di Chrome desktop + Safari iOS pass quality bar — gradient smooth no banding, font Inter/Plus Jakarta render (no fallback), drop-shadow render. Artifact `.review/spike-capture-day1/` ada.
- [ ] User di budget-kos Ringkasan klik Share di PersonaCard → modal share muncul **tanpa hydration warning (no Teleport)**
- [ ] Card visual aspect ratio 1:1, layout vertical-friendly (Amendment 5) — `ShareDialog` prop `aspectRatio="9:16"` di test bench tidak break layout
- [ ] Default state: stats toggle OFF (privacy-first)
- [ ] Toggle stats ON → muncul Sisa Uang % + Bertahan bln (whitelist greylist only)
- [ ] **Privacy test (blacklist, §3.4):** PNG hasil + share text tidak mengandung nominal Rp manapun, untuk semua 5 persona (test snapshot saldo Rp 999.999.999 → DOM/text tidak ada "999")
- [ ] **Privacy test (greylist boundary, Amendment 6):** stats ON → DOM hanya mengandung 2 angka (savingsRate% + runway bln), no derived number lain
- [ ] **Native share (Amendment 2):** di browser yang support `navigator.canShare({ files })` → tombol "Bagikan 📤" muncul + native sheet kebuka dengan PNG attached. Di browser unsupported → tombol hidden, grid 4 button (Salin/WA/X/Download) muncul sebagai fallback.
- [ ] 4 fallback action buttons (Salin, WhatsApp, X, Download) jalan
- [ ] `useShare.ts` signature generic — tidak terikat `PersonaKey` lagi
- [ ] `ShareDialog.vue` menerima slot content, bukan hard-coded persona
- [ ] **Persona rename (Amendment 3):** display label `"Sobat Indomie"` → `"Sobat Mie"` di semua surface (PersonaCard in-app + share card). Internal `PersonaKey` = `'sobatIndomie'` unchanged.
- [ ] **Deep link banner (Amendment 4):** buka `https://cermat.vercel.app/?from=share&persona=sobatMie` → banner muncul di landing dengan persona preview + CTA. Tanpa `?from=share` → banner tidak muncul. Klik X → banner hilang (no localStorage persist).
- [ ] `npm run typecheck` clean (vue-tsc)
- [ ] Existing tests masih lulus, plus 2-3 file test baru
- [ ] Dark mode app aktif → card share tetap render light (independen)
- [ ] `document.fonts.ready` ditunggu sebelum capture (no font fallback)
- [ ] Filename download = `cermat-<persona-id>.png` (no user data)

---

## 12. Verification

1. **Capture spike Day 1 (Amendment 1):** hasil PNG dari spike branch di-review manual, simpan di `.review/spike-capture-day1/` dengan 1-paragraf temuan. Pass → lock engine. Fail → swap + re-spike.
2. `npm run dev` → buka `/app/budget-kos`, load sample persona Mahasiswa Mandiri → klik Share → cek modal (no Teleport jank, no hydration warning di console)
3. Toggle "Tampilkan stats (terlihat publik)" → verifikasi stats muncul/hilang
4. Klik Download → cek file PNG: aspect 1:1, no nominal, branding ada
5. Klik Salin → paste di notepad: verifikasi tidak ada angka
6. Klik WhatsApp → cek URL `wa.me/?text=...` tidak ada angka
7. **Native share (Amendment 2):** buka di Chrome Android / Safari iOS → tombol "Bagikan 📤" primary → klik → native sheet kebuka dengan PNG attached. Pilih app (IG / WA / TG) → cek gambar terkirim.
8. **Native share fallback:** buka di Firefox desktop → tombol "Bagikan 📤" hidden → grid 4 button muncul.
9. **Deep link (Amendment 4):** buka tab baru `http://localhost:3000/?from=share&persona=sobatMie` → banner muncul di landing dengan emoji 🍜 + label "Sobat Mie" + CTA "Cek tipe saya". Klik CTA → navigate ke `/app/budget-kos?onboard=1`. Tutup tab, buka lagi tanpa `?from=share` → banner tidak muncul.
10. Toggle dark mode app → reload → klik Share lagi: card tetap light
11. Network throttle slow 3G → reload page → klik Share langsung: verifikasi font loaded sebelum capture (no fallback render)
12. `npx vue-tsc --noEmit` → clean
13. `npm run test` → all pass, plus 2-3 new test files
14. **Privacy test (blacklist) programmatic:** snapshot dengan saldo Rp 999.999.999 → render `PersonaShareCard` → query DOM textContent → assert tidak ada substring "999"
15. **Privacy test (greylist boundary, Amendment 6) programmatic:** stats ON → query semua text node, regex `/\d/`, exclude pattern `<savingsRate>%` + `<runway> bln` → assert match count = 0 (no derived number lain)
16. **Persona rename verification (Amendment 3):** load Sobat Indomie scenario di PersonaCard in-app + share card → label keduanya tampilkan "Sobat Mie", bukan "Sobat Indomie". Test snapshot regen kalau ada.

---

## 13. Out of Scope (Phase 7.1)

- Multiple card templates / persona variants
- 9:16 story aspect ratio **sebagai output yang available di UI** (Amendment 5: layout *vertical-friendly* WAJIB disiapkan, tapi ship output 1:1 only — switch ke 9:16 jadi config flip nanti)
- Server-side image generation / OG image
- Analytics tracking (share count, viral coefficient) — boleh nyusul setelah 7.1 ship
- Custom user photo upload to card
- Cermat Score share card (Phase 7.2)
- Kalkulator share card (Phase 7.2)
- Badge unlock share card (Phase 7.2)
- **Tier-share Bibit→Hutan (Phase 7.2 — flagged tetangga sebagai kandidat kuat)**
- Quiz persona dedicated landing page (Phase 7.3)
- Logo image Mamikos (text lock-up only)
- Confetti / micro-animation pas card di-generate
- Wealth-tracker persona share (defer 7.2)
- A/B test CTA copy
- Rename internal `PersonaKey` (display-only rename di Amendment 3)

---

## 14. Demo Storyboard (kalau implemented — v2)

**Mobile-first flow (target audience):**

1. **Sample persona "Mahasiswa Mandiri"** loaded di budget-kos (HP)
2. Scroll ke PersonaCard → label "💪 Anak Kos Bijak"
3. **Klik tombol Share** → modal share muncul inline (no Teleport jank), card 1:1 dengan emoji besar + persona label
4. **Tombol primary: "Bagikan 📤"** → native share sheet OS kebuka (PNG attached)
5. User pilih **Instagram Story** → PNG masuk ke Story composer → post → live
6. Temennya buka Story → klik link bio / sticker `cermat.vercel.app/?from=share&persona=anakKosBijak`
7. Landing terbuka → **banner muncul:** *"Temanmu adalah Anak Kos Bijak! Penasaran tipe kamu? Gratis & 100% di HP kamu — gak ke server"* + CTA "Cek tipe saya"
8. Klik CTA → langsung masuk `/app/budget-kos?onboard=1` → loop tertutup ✅

**Desktop fallback flow:**

1. Klik Share di card budget-kos
2. Native share unsupported (Firefox desktop) → grid 4 button: Salin / WhatsApp / X / Download
3. Klik Download → PNG masuk Downloads
4. Klik Salin → paste di chat: `"Aku Anak Kos Bijak! ✨ Cek keuanganmu juga di Cermat × Mamikos! https://cermat.vercel.app/?from=share&persona=anakKosBijak"`

**Privacy flow:**

1. User buka modal → default state: stats OFF, gambar cuma persona + emoji + tagline
2. User toggle "Tampilkan stats saya (terlihat publik)" → muncul Sisa Uang 35% + Bertahan 6 bln (consent eksplisit)
3. User download / share → PNG sesuai pilihan terakhir

---

## 15. Catatan Reviewer Tetangga — round 2 RESOLVED (v3 LOCKED)

**Round 1 verified (✅):** privacy guardrails, generic architecture, Teleport drop, reuse map jujur, persona scope (5 budget-kos).

**Round 2 verified (✅):** 6 amendment v2 nyangkut di file, beberapa di-eksekusi lebih bagus dari yang diminta (capture spike protocol, Indomie display-only rename keep internal key).

**Round 2 jawaban 7 pertanyaan — semua applied di spec v3:**

| Q | Question | Tetangga jawaban | Applied di |
|---|---|---|---|
| 1 | Day 1 split realistis? | **Tidak.** Spike = Day 1 PENUH. Refactor `useShare` geser ke Day 2. Effort jadi 6 hari fix (bukan 5-6). | Amendment 9 → §8 |
| 2 | Native primary + fallback grid pattern? | Bener buat mobile. Tapi **desktop: grid primary, native HIDDEN** (Safari macOS/Edge support `navigator.share` tapi UX aneh). Deteksi touch/pointer, bukan cuma feature-detect. | Amendment 10 → §5.2, §6.3 |
| 3 | "Sobat Mie" ada nama lebih kena? | "Sobat Mie" **aman & cukup hangat, lock aja.** Alternatif "Anak Kos Sejati" / "Pejuang Mie" — bikeshedding, jangan habisin ronde. | LOCKED, tidak diubah (catatan dicatat) |
| 4 | Banner copy kepanjangan? | **Iya.** 3 ide ditumpuk. Pangkas headline 1 hook + microcopy privacy di bawah tombol. Headline = 1 hook. | Amendment 11 → §7 |
| 5 | Anti-pattern §6.2 cukup? | Cukup, tambah 1: **hindari `vh`/`vw` & `%`-height** (html2canvas render di logical fixed size, viewport-unit elements bisa geser). | Amendment 12 → §6.2 |
| 6 | Open round 2 §10? | Clear, no new open items. | — |
| 7 | Effort 5-6 hari plausibel? | Naikin ke **6-7 hari** (Day 1 spike penuh + risiko swap lib). Kasih catatan "tergantung hasil spike Day 1". Jangan overpromise. | Amendment 8 → header, §8 |

**Cosmetic leftover (resolved):** §4 intro line basi *"tetap A atau pindah B?"* — sudah dihapus (Amendment 7).

---

### ⛔ Implementation gate — JANGAN MULAI NGODING

Per instruksi tetangga + user (mau mabar 🎮):

> *"Update spec final (3 hal di atas), lock, terus STOP di situ. Gua mau review versi locked-nya dulu sebelum ngoding. Tunggu konfirmasi."*

Spec ini sekarang status **🔒 LOCKED v3** — refinements applied, 6+5 amendments verified, cosmetic leftover dihapus. **Tetangga akan review versi locked v3 ini → lampu hijau → baru implementasi.** Sampai konfirmasi datang, jangan gas.

🫡🎮
