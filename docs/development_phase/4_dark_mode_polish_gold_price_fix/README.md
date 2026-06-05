# Phase 4: Dark Mode + Polish + Gold Price Fix

**Prioritas:** SEDANG
**Prerequisite:** Phase 3 selesai

---

## Scope

### 4.1 Dark Mode
- Implementasi dark mode theme
- Toggle light/dark di settings atau nav
- Token warna dark mode di `@theme` Tailwind
- Bagus untuk demo/presentasi ke juri

### 4.2 Visual Polish
- Final polish semua screen yang juri lihat (landing, snapshot, result)
- Micro-interactions & transitions
- Responsive check

### 4.3 Gold Price
- Fix Pegadaian fetch yang sering gagal (403 dari Vercel)
- Fallback ke PAXG price jika Pegadaian down
- Info badge tentang sumber harga yang dipakai
- Multiple source fallback (Pegadaian → PAXG → manual input)
- Historical price chart (nice-to-have)

---

## Out of Scope
- Bilingual (EN/ID) — target pasar Mamikos sangat lokal
- Multi-currency overview — anak kos jarang punya multi-currency portfolio

---

## Success Criteria
- [ ] Dark mode toggle bekerja smooth tanpa flash
- [ ] Semua screen polished
- [ ] Gold price fetch reliable (Pegadaian + PAXG fallback)
