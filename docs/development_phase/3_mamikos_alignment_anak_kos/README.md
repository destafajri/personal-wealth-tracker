# Phase 3: Mamikos Alignment — Anak Kos Persona

**Priority:** HIGH (the soul of the mini-product for the Mamikos Vibe Coding Contest)
**Primary persona:** Anak Kos (rental budget, lifestyle, frugal living)
**Secondary persona:** Juragan Kos (tease as "coming soon", not fully built)
**Status:** Implementation-ready (codex-reviewed 2026-06-05)

---

## Goal

Make Cermat feel like a **Mamikos product**, not a generic wealth tracker. Judges must instantly feel the brand connection when they first open the app.

---

## Implementation Priority

This is the canonical build order. Both docs in this folder follow this ordering:

1. **Persona & Gamification** — most impactful for contest judging
2. **CTA Mamikos** — brand affinity
3. **Copy rewrite** — feel "Mamikos" throughout
4. **Share Card** — viral growth engine
5. **Kos Rent Budget** — feature depth (stretch goal)

---

## Scope

### 3.1 Persona & Gamification
- Persona system based on financial profile (deterministic rules, see `inspiration-and-ideas.md` §2)
- Persona appears based on snapshot data (income, saving rate, total assets)
- Shareable badge/label

### 3.2 CTA Mamikos Integration
- "Cari Kos di Mamikos" button placed naturally in the flow
- Appears at relevant moments (e.g., rent budget too high → "Find a cheaper kos?")
- Deep link to `https://mamikos.com`

### 3.3 Copywriting & Branding (Anak Kos Theme)
- Rewrite UI copywriting in relatable anak kos language
- Terminology mapping in `inspiration-and-ideas.md` §1
- Tone: casual, friendly, helpful — not formal banking

### 3.4 Share Feature
- Share persona + key stats to social media
- Privacy: users must explicitly opt-in; amounts hidden by default, only persona + ratios shown
- Share methods: copy text, Twitter/X, WhatsApp (image export is nice-to-have)

### 3.5 Kos Rent Budget (Stretch Goal)
- Track kos rent as a dedicated expense category
- Rent vs income ratio (ideal ≤30%)
- Only if time permits — not required for contest MVP

---

## Preservation Boundary

This phase adds **new read-only layers** on top of existing finance logic. The boundary is:

### Allowed (no approval needed)
- Display-copy changes in `lib/copy/strings.ts` and `lib/copy/metric-explainers.ts`
- New read-only derived labels, cards, badges (persona, CTA)
- New components that only **read** from existing stores
- CTA/Mamikos link placement in templates

### Guarded but allowed (requires spec before coding)
- New derived metrics in a **new** file (e.g., `lib/finance/persona.ts`) — must not modify existing files in `lib/finance/`
- Conditional UI branching based on mode param (`?mode=kos` vs `?mode=full`)

### Not allowed in this phase
- Changing any existing finance formulas in `lib/finance/`
- Silently repurposing existing snapshot fields
- Modifying OJK disclaimer text (stays formal)
- Changing any behavior in the "Wealth Tracker Lengkap" path — it must remain identical to current production

---

## Out of Scope
- Juragan Kos full experience (tease "coming soon" only)
- Multi-currency (local target market)
- Bilingual (ID-only is sufficient)

---

## Success Criteria
- [ ] Landing page instantly feels "Mamikos" (not a generic finance app)
- [ ] Persona system works with deterministic rules (no ambiguous precedence)
- [ ] Share button generates privacy-safe content (no raw amounts unless user opts in)
- [ ] CTA "Cari Kos di Mamikos" appears naturally in relevant flows
- [ ] Existing "Wealth Tracker Lengkap" flow is zero-diff from current production

---

## References
- Visual refs: `docs/ide_4_revamp/reff/`
- Design guidelines: `docs/ide_3/personal-wealth-platform-design-guidelines-en.md`
- PRD: `docs/ide_3/personal-wealth-platform-prd-en.md`
