---
name: feedback-spec-workflow
description: "For PRD/spec editing on Cermat, the validated workflow is propose-with-tradeoff → AskUserQuestion to lock approach → batched parallel Edit calls → structured summary table with explicit \"what I sengaja tidak ubah\" list."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 01ed3a0f-4de5-489e-9035-75438b983071
---

On Cermat spec work (PRD, MVP, design guidelines), this 4-step pattern was confirmed by repeated "lanjut" sign-offs across the 2026-05-26 session:

1. **Identify the gap** in 2-3 sentences with the *why* and the main tradeoff. Don't jump to edit.
2. **AskUserQuestion** to lock the approach when there are non-trivial choices (e.g., "modul terstruktur penuh vs progressive disclosure vs hybrid", "EN dulu vs sync EN+ID sekaligus", "cakupan tipe utang"). Multi-select OK when choices aren't mutually exclusive.
3. **Batch parallel Edit calls** for unique-string edits — don't sequence unnecessarily. Verify each `old_string` is unique before batching.
4. **End with a structured summary table** showing § / Section + change description, plus an explicit *"yang sengaja tidak saya ubah"* list with brief reasoning for each skip.

**Why:** User is PM-style — wants alignment on approach *before* edits start, and wants to verify scope *after* edits land. The summary table doubles as a changelog the user can scan. The "sengaja tidak ubah" list prevents the user from wondering whether something was missed.

**How to apply:** Use this pattern for any future Cermat doc work or similar spec-editing tasks. For EN+ID synced docs, EN-first then ID-sync is OK — user accepts the brief lag. When adding a new cross-cutting concept (like Cicilan Aktif was), update docs in dependency order: **PRD → MVP brief → design guidelines** (because PRD is the source of truth that MVP summarizes and design guidelines visualizes).

**Communication style:** User mixes Bahasa Indonesia (casual register, "kamu", "yaa", "halu") with English technical terms. Match that register — casual Bahasa for narrative, English for code/spec terms. Don't switch to formal "Anda".
