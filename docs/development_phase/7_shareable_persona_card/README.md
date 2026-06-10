# Phase 7: Shareable Persona Card & Viral Growth

**Branch:** TBD (proposed: `phase-7-shareable-card`)
**Status:** 🔒 **SPEC LOCKED v3** — post AI tetangga round 2 (verdict 🟢 lock-able). Round 1 + round 2 refinements applied. Menunggu lampu hijau final dari tetangga di versi locked v3 sebelum implementasi.
**Prerequisite:** Phase 6+6.1+6.2 merged ke main (saat ini di branch `improvement-ringkasan-and-pdf-phase-2`)

> **⛔ Implementation gate:** Spec locked, **tapi jangan mulai ngoding** sebelum tetangga konfirmasi versi locked v3.

---

## Overview

Phase 7 menjawab feedback juri demo: fitur yang dorong **viral growth ringan, budaya share & ngajak orang nyoba, brand affinity Mamikos**. Phase 6.2 udah bikin persona system yang kuat — Phase 7 ngubah hasil persona itu jadi artefak visual yang **bisa di-share keluar app**, sehingga tiap user yang share = ajakan organik ke Cermat × Mamikos.

| Sub-phase | Focus | Key Deliverables |
|-----------|-------|------------------|
| **7.1** | Shareable Persona Card | Generic card generator (image-gen), privacy guardrails, persona card use-case pertama, deep link share (opsional) |
| **7.2** | (TBD) | Reuse card generator buat hasil lain (mis. ringkasan kalkulator, badge milestone) — di-design later |

---

## Phase 7.1 — Shareable Persona Card

**Spec:** [`phase-7.1-spec.md`](./phase-7.1-spec.md) (draft v1 — belum dikunci, menunggu review tetangga)

### Konteks singkat

- Cermat udah punya **persona engine** (`lib/finance/persona.ts`, 5 archetype: Sultan Kos, Bibit Investor, Anak Kos Bijak, Pejuang Akhir Bulan, Sobat Indomie).
- Hasil persona saat ini "mati di layar" — di-render di `PersonaCard.vue` di budget-kos Ringkasan, dan ada modal `ShareCard.vue` yang sudah pakai `html2canvas` buat download PNG.
- **Gap-nya:** implementasi share existing belum diaudit untuk privacy, belum di-design generic (Phase 7.2 mau reuse buat hasil lain), masih pakai `<Teleport>` (kena memory note SSR hydration), dan belum ada entry point share yang natural di luar PersonaCard.
- Phase 7.1 = **rapikan + audit + generalisasi** infra share yang udah ada, dengan persona card sebagai use-case implementasinya.

### Status implementasi existing yang relevan (referensi recon awal — belum berubah, implementasi belum dimulai)

| Aset | Status | Catatan |
|---|---|---|
| `lib/finance/persona.ts` | ✅ ada | Engine resolve persona dari snapshot (5 keys) |
| `lib/copy/strings.ts` (`persona.*`) | ✅ ada | Label + tagline 5 persona |
| `components/dashboard/PersonaCard.vue` | ✅ ada | Card hasil persona + tombol Share2 → buka modal |
| `components/common/ShareCard.vue` | ⚠️ ada, perlu rework | Modal share (Salin/WhatsApp/X/Download). Pakai Teleport, hard-coded persona, belum diaudit privacy |
| `composables/useShare.ts` | ⚠️ ada, perlu rework | Logic share + `html2canvas` capture. Belum generic, signature terikat ke `PersonaKey` |
| `package.json` → `html2canvas: ^1.4.1` | ✅ terinstall | Dipakai dynamic-import di `useShare.ts`, lazy load |
| Wealth-tracker share entry | ❌ tidak ada | Tidak ada PersonaCard di mode wealth-tracker — share belum nyambung ke sana |

### Constraint (inherited dari AI tetangga ide-7.1)

- ❌ JANGAN reuse infra PDF (`composables/usePdf.ts`, `lib/pdf/*`) — beda jalur (laporan formal multi-page vs 1 image sosmed-ratio)
- ❌ JANGAN sentuh scoring engine, persona fixtures, atau mode existing
- ✅ Semua client-side (no upload gambar ke server — konsisten privacy stance)
- ✅ Jangan ekspos data keuangan asli di kartu (samarkan/agregat — spec wajib whitelist eksplisit)
- ✅ Branding Mamikos halus, jangan norak
- ✅ Card generator **di-design generic** (Phase 7.2-ready), tapi implementasi 7.1 tetap satu use-case (persona card)

---

## Review Workflow

Mengikuti pola Phase 6.2 (lihat memory `feedback-codex-review-workflow.md` & `feedback-spec-workflow.md`):

1. **Draft spec** (Claude/Zai) → committed di folder ini
2. **Lempar ke AI tetangga** → review dari luar (cek privacy beneran kepegang, cek generic vs hardcoded, cek reuse map realistis, cek scope nggak balloon)
3. **Iterasi spec** (Amendments) sampai tight
4. **Setelah spec locked** → baru implementasi (separate phase)

---

## Out of Scope (Phase 7.1)

- Implementasi (spec-only sampai locked)
- Multi-template card (1 template persona dulu)
- Server-side image generation (semua client-side)
- Deep link tracking / analytics (opsional — sebut di spec, tapi bukan must)
- Reuse buat hasil kalkulator (itu Phase 7.2 — generic design siap, tapi belum diimplementasi)
- Confetti / animation pas card di-generate
- Custom image (user upload foto) — privacy risk, tidak relevan

---

## Phase 7+ Backlog (deferred)

**Phase 7.2 candidates** (sorted by tetangga signal strength):
- 🟢 **Tier-share Bibit→Hutan** (flagged tetangga round 1 sebagai kandidat **paling flexy** — Cermat Score level system udah ada di Phase 6.2, tinggal pasang Layer 3 share card baru di atas seam Layer 1+2 dari 7.1)
- Reuse card generator buat hasil kalkulator / What-If projection
- Wealth-tracker persona share entry point (defer dari 7.1)
- 9:16 story aspect ratio sebagai output yang available di UI (layout udah disiapkan vertical-friendly di 7.1)
- Analytics tracking share (count, viral coefficient) — boleh nyusul setelah 7.1 ship

**Phase 7.3+ candidates:**
- "Cek tipe temenmu" dedicated landing `/persona` dengan quiz singkat
- Per-persona CTA copy variation
- Generalisasi gadai (carry-over dari Phase 6 backlog)
- Advisor mode vs User mode toggle (carry-over)
- Interactive kos slider di budget-kos (carry-over)

---

## File Index

| File | Purpose |
|------|---------|
| [`README.md`](./README.md) | (file ini) overview Phase 7 |
| [`phase-7.1-spec.md`](./phase-7.1-spec.md) | Draft spec lengkap Phase 7.1 |
