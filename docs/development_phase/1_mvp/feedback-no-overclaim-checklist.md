---
name: feedback-no-overclaim-checklist
description: "Saat susun review/handoff checklist, JANGAN tulis klaim yang belum diverifikasi (covered, runs clean, lengkap, dll) — verify dulu via Read/grep, atau tulis \"claim: X — to verify\"."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: be02b4a7-9e34-466b-890a-f660ae3e09e6
---

Saat susun checklist review atau handoff doc, JANGAN tulis klaim status (covered, runs clean, lengkap, no hardcoded, consistent) yang belum diverifikasi terhadap kode aktual.

**Why:** 2026-05-30 Day-1 Cermat review — aku tulis checklist dengan klaim "tests cover 1.5m & 100k", "no hardcoded copy", "ESLint runs clean", "@theme block lengkap", "edge cases NaN/Infinity covered". Semua salah / partial saat user verify. Checklist jadi menyesatkan dan harus di-redo.

**How to apply:**
- Sebelum nulis bullet status di checklist, Read file yang diklaim
- Kalau belum sempat verify, tulis "to verify" atau format sebagai pertanyaan, bukan pernyataan
- Klaim "lengkap" / "covered" / "consistent" = trigger word — verify dulu sebelum tulis
- Untuk handoff doc (memory project state), pisahkan "fact terverifikasi" vs "claim handoff" dengan jelas
- Pola yang aman: tulis isi file dulu (apa yang ada), baru gap (apa yang missing) — bukan label kualitatif

Related: [[project-cermat-state]] [[feedback-spec-workflow]]
