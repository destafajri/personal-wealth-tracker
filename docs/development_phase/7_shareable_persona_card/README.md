# Phase 7: Shareable Persona Card & Viral Growth

**Branch:** TBD (proposed: `phase-7-shareable-card`)
**Status:** 🔒 **SPEC LOCKED v3** — post neighbor-AI round 2 (verdict 🟢 lock-able). Round 1 + round 2 refinements applied. Awaiting final green light from the neighbor on the locked v3 before implementation.
**Prerequisite:** Phase 6+6.1+6.2 merged into main (currently on branch `improvement-ringkasan-and-pdf-phase-2`)

> **⛔ Implementation gate:** Spec is locked, **but do not start coding** before the neighbor confirms the locked v3.

---

## Overview

Phase 7 answers the demo jury's feedback: a feature that drives **lightweight viral growth, a share-and-invite culture, and Mamikos brand affinity**. Phase 6.2 already built a strong persona system — Phase 7 turns that persona output into a visual artifact that **can be shared outside the app**, so every user share becomes an organic invitation into Cermat × Mamikos.

| Sub-phase | Focus | Key Deliverables |
|-----------|-------|------------------|
| **7.1** | Shareable Persona Card | Generic card generator (image-gen), privacy guardrails, persona card as first use-case, share deep link (optional) |
| **7.2** | (TBD) | Reuse the card generator for other outputs (e.g. calculator summary, milestone badge) — designed later |

---

## Phase 7.1 — Shareable Persona Card

**Spec:** [`phase-7.1-spec.md`](./phase-7.1-spec.md) (draft v1 — not yet locked, awaiting neighbor review)

### Quick context

- Cermat already has a **persona engine** (`lib/finance/persona.ts`, 5 archetypes: Sultan Kos, Bibit Investor, Anak Kos Bijak, Pejuang Akhir Bulan, Sobat Indomie).
- The current persona output is "dead on the screen" — rendered in `PersonaCard.vue` inside the budget-kos Summary, and there is a `ShareCard.vue` modal that already uses `html2canvas` to download a PNG.
- **The gap:** the existing share implementation has not been audited for privacy, isn't designed to be generic (Phase 7.2 wants to reuse it for other outputs), still uses `<Teleport>` (which triggers the SSR hydration memory note), and there is no natural share entry point outside of PersonaCard.
- Phase 7.1 = **clean up + audit + generalize** the existing share infra, using the persona card as the implementation use-case.

### Existing implementation status (initial recon reference — unchanged, implementation not started)

| Asset | Status | Notes |
|---|---|---|
| `lib/finance/persona.ts` | ✅ exists | Engine that resolves a persona from a snapshot (5 keys) |
| `lib/copy/strings.ts` (`persona.*`) | ✅ exists | Label + tagline for the 5 personas |
| `components/dashboard/PersonaCard.vue` | ✅ exists | Persona result card + Share2 button → opens modal |
| `components/common/ShareCard.vue` | ⚠️ exists, needs rework | Share modal (Copy/WhatsApp/X/Download). Uses Teleport, hard-coded persona, no privacy audit |
| `composables/useShare.ts` | ⚠️ exists, needs rework | Share logic + `html2canvas` capture. Not generic, signature is bound to `PersonaKey` |
| `package.json` → `html2canvas: ^1.4.1` | ✅ installed | Used via dynamic-import in `useShare.ts`, lazy-loaded |
| Wealth-tracker share entry | ❌ missing | No PersonaCard in wealth-tracker mode — share isn't wired there |

### Constraints (inherited from neighbor-AI idea-7.1)

- ❌ DO NOT reuse the PDF infra (`composables/usePdf.ts`, `lib/pdf/*`) — different pipeline (formal multi-page report vs single social-ratio image)
- ❌ DO NOT touch the scoring engine, persona fixtures, or existing modes
- ✅ Everything client-side (no image upload to server — consistent with the privacy stance)
- ✅ Do not expose raw financial data on the card (mask/aggregate — the spec must specify an explicit whitelist)
- ✅ Mamikos branding stays subtle, not garish
- ✅ The card generator is **designed generic** (Phase 7.2-ready), but the 7.1 implementation still ships only one use-case (persona card)

---

## Review Workflow

Follows the Phase 6.2 pattern (see memory `feedback-codex-review-workflow.md` & `feedback-spec-workflow.md`):

1. **Draft spec** (Claude/Zai) → committed in this folder
2. **Send to neighbor AI** → external review (verify privacy is actually enforced, generic vs hardcoded, that the reuse map is honest, that scope doesn't balloon)
3. **Iterate on spec** (Amendments) until tight
4. **After spec is locked** → only then implementation (separate phase)

---

## Out of Scope (Phase 7.1)

- Implementation (spec-only until locked)
- Multi-template card (single persona template for now)
- Server-side image generation (everything stays client-side)
- Deep link tracking / analytics (optional — mentioned in the spec, but not a must)
- Reuse for calculator results (that's Phase 7.2 — generic design is ready, but not implemented)
- Confetti / animation when the card is generated
- Custom image (user-uploaded photo) — privacy risk, not relevant

---

## Phase 7+ Backlog (deferred)

**Phase 7.2 candidates** (sorted by neighbor signal strength):
- 🟢 **Tier-share Bibit→Hutan** (flagged by the neighbor in round 1 as the **most flexible** candidate — the Cermat Score level system already exists in Phase 6.2, so it's just bolting a new Layer 3 share card on top of the Layer 1+2 seam from 7.1)
- Reuse the card generator for calculator results / What-If projection
- Wealth-tracker persona share entry point (deferred from 7.1)
- 9:16 story aspect ratio as a UI-selectable output (the layout is already set up vertical-friendly in 7.1)
- Share analytics (count, viral coefficient) — can follow after 7.1 ships

**Phase 7.3+ candidates:**
- "Check your friend's type" dedicated landing `/persona` with a short quiz
- Per-persona CTA copy variation
- Pawn (gadai) generalization (carried over from the Phase 6 backlog)
- Advisor mode vs User mode toggle (carry-over)
- Interactive kos slider on budget-kos (carry-over)

---

## File Index

| File | Purpose |
|------|---------|
| [`README.md`](./README.md) | (this file) Phase 7 overview |
| [`phase-7.1-spec.md`](./phase-7.1-spec.md) | Full Phase 7.1 spec draft |
