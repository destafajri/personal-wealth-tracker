# Phase 7: Shareable Persona Card & Viral Growth

**Branch:** `shareable_pesona_card`
**Status:** 🔒 **SPEC LOCKED v3** — implementation committed (`33b7f47`). Codex review findings addressed.
**Prerequisite:** Phase 6+6.1+6.2 merged into main

---

## Overview

Phase 7 answers the demo jury's feedback: a feature that drives **lightweight viral growth, a share-and-invite culture, and Mamikos brand affinity**. Phase 6.2 already built a strong persona system — Phase 7 turns that persona output into a visual artifact that **can be shared outside the app**, so every user share becomes an organic invitation into Cermat × Mamikos.

| Sub-phase | Focus | Key Deliverables |
|-----------|-------|------------------|
| **7.1** | Shareable Persona Card | Generic card generator (image-gen), privacy guardrails, persona card as first use-case, share deep link (MUST-HAVE per Amendment 4) |
| **7.2** | (TBD) | Reuse the card generator for other outputs (e.g. calculator summary, milestone badge) — designed later |

---

## Phase 7.1 — Shareable Persona Card

**Spec:** [`phase-7.1-spec.md`](./phase-7.1-spec.md) (LOCKED v3 — post neighbor-AI round 2)

### Quick context

- Cermat already has a **persona engine** (`lib/finance/persona.ts`, 5 archetypes: Sultan Kos, Bibit Investor, Anak Kos Bijak, Pejuang Akhir Bulan, Sobat Mie).
- Phase 7.1 = implement a **3-layer share architecture** with privacy guardrails, native mobile share, and a deep link viral loop.

### Implementation status

| Asset | Status | Notes |
|---|---|---|
| `lib/finance/persona.ts` | ✅ updated | `PERSONA_VISUALS` added — gradient + `gradientCSS` (inline) + emoji per persona |
| `lib/copy/strings.ts` | ✅ updated | "Sobat Indomie" → "Sobat Mie" (display-only). 12 new share + landing copy strings (`share.url` removed — now dynamic via `getAppUrl()`) |
| `composables/useShare.ts` | ✅ refactored | Generic Layer 1 — no `PersonaKey` dependency. Uses `html-to-image` (not html2canvas). Exports: `getAppUrl`, `downloadAsPng`, `captureAsBlob`, `copyText`, `shareToWa`, `shareToTwitter`, `shareNative`, `isMobileShareCapable` |
| `components/common/ShareDialog.vue` | ✅ new (Layer 2) | Generic share modal — inline overlay (no Teleport), slot-based. Same 4-button grid (Salin, WA, X, Download) on both mobile and desktop |
| `components/share/PersonaShareCard.vue` | ✅ new (Layer 3) | Persona card visual — props-only (no store access), inline styles for capture fidelity, vertical-friendly layout, stats default OFF, dynamic URL via `getAppUrl()` |
| `components/landing/ShareInviteBanner.vue` | ✅ new | Deep link banner for `?from=share` — trimmed 1-hook headline, dismissible, no localStorage |
| `components/dashboard/PersonaCard.vue` | ✅ updated | Uses new ShareDialog + PersonaShareCard. Share button enlarged. Deep link URL carries `?from=share&persona=<key>` |
| `pages/app/budget-kos.vue` | ✅ updated | Share entry point added directly (budget-kos uses default layout, not app layout with DashboardPanel) |
| `pages/index.vue` | ✅ updated | Reads `?from=share` + `?persona=<key>` query, renders ShareInviteBanner |
| `components/common/ShareCard.vue` | ✅ deleted | Replaced by 3-layer architecture |
| `tests/composables/useShare.test.ts` | ✅ new | 5 tests for API shape, native share fallback, mobile detect |
| `tests/components/PersonaShareCard.test.ts` | ✅ new | 9 privacy tests — blacklist audit, greylist boundary, stats default OFF, share text audit |
| `tests/finance/persona.test.ts` | ✅ updated | Updated for "Sobat Mie" + PERSONA_VISUALS (incl. gradientCSS) test suite |
| `html-to-image` | ✅ installed | Replaced html2canvas — better SVG foreignObject capture for Vue slotted components |
| `.review/spike-capture-day1/` | ⚠️ pending | Day 1 capture spike artifact — must be created manually before final merge |

### Constraints (inherited from neighbor-AI idea-7.1)

- ❌ DO NOT reuse the PDF infra (`composables/usePdf.ts`, `lib/pdf/*`) — different pipeline
- ❌ DO NOT touch the scoring engine, persona fixtures, or existing modes
- ✅ Everything client-side (no image upload to server)
- ✅ Do not expose raw financial data on the card (mask/aggregate)
- ✅ Mamikos branding stays subtle
- ✅ The card generator is **designed generic** (Phase 7.2-ready), but 7.1 ships only one use-case

---

## Review Workflow

Follows the Phase 6.2 pattern:

1. **Draft spec** → committed in this folder
2. **Neighbor AI review** → 2 rounds, 12 amendments, LOCKED v3
3. **Implementation** → committed
4. **Codex review** → findings addressed (deep link fix, mobile share fix, README update)

---

## Out of Scope (Phase 7.1)

- Multi-template card (single persona template)
- Server-side image generation
- Share analytics (count, viral coefficient)
- Reuse for calculator results (Phase 7.2)
- Confetti / animation
- Custom image (user-uploaded photo)

---

## Phase 7+ Backlog (deferred)

**Phase 7.2 candidates** (sorted by neighbor signal strength):
- 🟢 **Tier-share Bibit→Hutan** (flagged by the neighbor as the **most flexible** candidate)
- Reuse the card generator for calculator results / What-If projection
- Wealth-tracker persona share entry point
- 9:16 story aspect ratio as a UI-selectable output
- Share analytics

**Phase 7.3+ candidates:**
- "Check your friend's type" dedicated landing `/persona` with a short quiz
- Per-persona CTA copy variation
- Pawn (gadai) generalization (carried over from Phase 6 backlog)

---

## File Index

| File | Purpose |
|------|---------|
| [`README.md`](./README.md) | (this file) Phase 7 overview |
| [`phase-7.1-spec.md`](./phase-7.1-spec.md) | Full Phase 7.1 spec (LOCKED v3) |
