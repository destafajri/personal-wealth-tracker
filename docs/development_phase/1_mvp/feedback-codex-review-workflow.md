---
name: feedback-codex-review-workflow
description: "User pakai Codex sebagai external reviewer di antara phase build. Pola: aku build → user commit → user minta Codex review → aku triage feedback → fix → commit lagi → review lagi."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: be02b4a7-9e34-466b-890a-f660ae3e09e6
---

User pakai **Codex sebagai external code reviewer** di antara phase Cermat build. Setelah aku selesai satu phase (Day-N scaffold), user commit + minta Codex review independen. Codex balik dengan list structured (Blocker / High / Medium / Low) + file:line refs.

**Why:** Codex = second pair of eyes yang nggak terbias konteks percakapan kita. Bagus untuk catch overclaim, hardcode, hydration risk, type-safety gap yang aku miss saat build cepat. Day-1 review surface 11 isu valid yang aku miss (lihat [[project-cermat-state]] Day 1.5 section).

**How to apply:**
- Saat user balik dengan paste-an feedback Codex, JANGAN defensif. Verify cepat 2-3 klaim biggest-impact via Read/grep, lalu acknowledge gap honest.
- Triage format: (a) acknowledge yang accurate, (b) propose fix order grouped by severity (Round 1/2/3...), (c) AskUserQuestion untuk decision yang punya tradeoff nyata (e.g., stub vs anchor vs defer untuk broken route), (d) AskUserQuestion untuk execution mode (batch vs per-round-approve).
- Execute batched parallel edits per [[feedback-spec-workflow]] pattern.
- Verify dengan: `pnpm lint`, `pnpm test`, `pnpm exec nuxi typecheck`, `pnpm build` — semua harus hijau sebelum claim done.
- Summary akhir: table before/after (lint/test/typecheck/build), list file changed (R1/R2/R3 grouping), list "sengaja tidak diubah" + alasan defer, propose commit message dalam style commit log existing (lowercase, comma-separated highlights, "Day N: ...").
- Codex pakai exact file:line refs (`InputCurrency.vue:46`) — match this precision saat respond, jangan vague.
- Pola valid yang Codex pernah catch di Day 1: broken route CTA → 404, `typeCheck: false` masking errors, hardcoded compliance copy bypassing lint registry, `Math.random()` id = SSR hydration mismatch, `Number.isNaN` only guard missing Infinity, NBSP irregular-whitespace, default-prop warnings, void-element self-closing, test claim mismatch (aku tulis "1.5m"/"100k" padahal test pake "1,5jt"/"25k"/"25rb").

Related: [[feedback-no-overclaim-checklist]] [[feedback-spec-workflow]] [[project-cermat-state]]
