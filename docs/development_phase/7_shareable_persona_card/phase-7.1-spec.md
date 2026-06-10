# Phase 7.1: Shareable Persona Card

**Priority:** HIGH (viral growth lever — direct response to demo jury feedback)
**Prerequisite:** Phase 6+6.1+6.2 merged
**Effort estimate:** M-L (**6-7 days**, depending on the Day 1 capture spike outcome — html2canvas pass = 6 days, swap to html-to-image = 7 days. Don't rush; the value of this feature is visual polish.)
**Scope status:** 🔒 **LOCKED v3** — post neighbor-AI round 2 (verdict 🟢 lock-able). Ready to enter implementation after final neighbor ack on this locked version.

> **⛔ IMPLEMENTATION GATE — DO NOT START YET:** Per the neighbor's + the user's instruction, **do not start coding** before the neighbor confirms this locked v3. Finalize the spec, wait for the green light, then implement.

> **Reviewer note:** This spec deliberately **does not write code**. The "Files to Touch" and "Design hint" fields provide context, but the final decisions (canvas vs html-to-image, the shape of the generic structure, etc.) are deliberately left open until the neighbor review is complete. The "Open Questions" section below is the explicit list of things I want critiqued.

---

## Revision History

### v3 (2026-06-08) — post neighbor-AI round 2 — 🔒 LOCKED

Neighbor round 2 verdict: **🟢 spec lock-able.** 6 v2 amendments verified in the file (not just summarized). A few were judged to have been *executed better than asked* (the capture spike protocol's pass/fail/escalate, the Indomie display-only rename that keeps the internal key). 1 cosmetic leftover + 5 substantive refinements from the answers to the 7 round-2 questions.

**Round 2 refinements applied:**

| # | Title | Trigger | Section |
|---|---|---|---|
| 7 | **Cosmetic: drop the stale §4 intro line** | ⚪ Neighbor round 2: line 162 still had the old "stick with A or move to B?" line — contradicts the flip recommendation below | §4 intro rewrite |
| 8 | **Effort bumped to 6-7 days** | 🟡 Neighbor round 2 Q7: full Day 1 spike + lib-swap risk. Range "depends on spike outcome." | Header, §8 |
| 9 | **Day 1 = FULL spike, `useShare` refactor shifts to Day 2** | 🟡 Neighbor round 2 Q1: the spike is the decision gate, don't compress it into half a day | §8 |
| 10 | **Native share default: mobile primary, desktop fallback grid primary** | 🟡 Neighbor round 2 Q2: desktops that support `navigator.share` (Safari macOS/Edge) have weird UX — detect touch/pointer, not just feature-detect | §5.2 (UI pattern), §6.3 |
| 11 | **Banner copy trimmed: "Temenmu <persona> 👀 Kamu tipe apa?" + privacy microcopy below the button** | 🟡 Neighbor round 2 Q4: the v2 copy stacked 3 ideas (friend's result + invite + privacy). A banner gets ~1.5 seconds of attention — the headline must be a single hook. | §7 visual hint, §9 strings.ts list |
| 12 | **Anti-pattern: avoid vh/vw & %-height (Amendment 5 follow-up)** | 🟡 Neighbor round 2 Q5: html2canvas renders at a logical fixed size (1080×1080), viewport-unit-based elements can shift | §6.2 anti-pattern list |

**Decisions the neighbor confirmed (no further bikeshedding):**
- "Sobat Mie" = LOCKED (Q3 — alternatives "Anak Kos Sejati" / "Pejuang Mie" noted but not chosen, to avoid burning review rounds)
- §10 v2 open Qs → clear, no new open items (Q6)

**⛔ Implementation gate:** this spec is LOCKED but **has not been green-lit for coding**. The neighbor & user asked to hold until this locked v3 gets a final review. Don't push implementation before confirmation.

---

### v2 (2026-06-08) — post neighbor-AI round 1

Neighbor verdict: **🟡 minor revision, architecture is solid, refinement only.** What's verified done from v1: privacy guardrails (§3), generic 3-layer architecture (§5), Teleport dropped, honest reuse map.

**Amendments applied:**

| # | Title | Trigger | Section(s) changed |
|---|---|---|---|
| 1 | **Capture spike on Day 1, don't lock the engine** | 🟠 Neighbor #1: visual quality = the main value, html2canvas is weak on gradients → validate first, don't defer | §4, §8, §11 |
| 2 | **Native `navigator.share({ files })` goes into Layer 1** | 🟠 Neighbor #2: mobile-first target; WA/X intent = text+URL (not image), download = high drop-off; the native share sheet = the main conversion path | §5.2, §6.3, §8, §9, §11 |
| 3 | **Rename "Sobat Indomie" → "Sobat Mie"** | 🟠 Neighbor #3: a third-party commercial product on a public artifact co-branded with Mamikos = risk of unauthorized association | §6.5 (NEW), §9 |
| 4 | **Deep link `?from=share` promoted to MUST-HAVE** | 🟡 Neighbor #4: without a landing loop, share → generic homepage → bounce; ½ day that closes the viral loop is exactly what the jury asked for | §7, §8, §9, §11 |
| 5 | **Vertical-friendly layout from the start (9:16-ready)** | 🟡 Neighbor #5: WA Status + IG Story = the dominant share surfaces for Indonesian kos kids; at minimum the layout should be set up so 9:16 is a config flip, not a redesign | §6.1, §6.2, §11 |
| 6 | **Privacy test greylist-boundary assertion** | ⚪ Neighbor minor: stats ON → assert only % and "bln" appear, no derived number sneaks in | §3.4 |

**Neighbor's verdict on the 8 Open Questions** (integrated into §10):

| # | v1 Q | Neighbor verdict | Action |
|---|---|---|---|
| 1 | WT entry point | Defer 7.2 ✅ — **note**: tier-share (Bibit→Hutan) is a strong 7.2 candidate (most flexible) | Add to Phase 7+ Backlog (README) |
| 2 | Is html2canvas enough? | Test first, don't lock | → Amendment 1 |
| 3 | Stats default OFF/ON? | **OFF** — persona+emoji is already the wow factor, stats add privacy risk without adding virality | Confirmed (no change) |
| 4 | 1:1 vs 9:16 | → Amendment 5 | → Amendment 5 |
| 5 | CTA generic vs per-persona | Generic first, per-persona = 7.2 polish | Confirmed (no change) |
| 6 | Branding text vs logo | Text-only, agreed | Confirmed (no change) |
| 7 | Deep link must vs nice | → Amendment 4 | → Amendment 4 |
| 8 | Generic timing | Agreed, seam now has one consumer, resist speculation | Confirmed (no change) |

**Effort impact:** 4-5 days → 5-6 days (deep link +½, capture spike +½, engine-swap buffer +1 if the gradient test fails).

---

### v1 (2026-06-08) — initial draft

Initial spec after reconning the existing code (`useShare.ts` + `ShareCard.vue` + `html2canvas` already in place). See git history for the full diff.

---

## 1. Motivation

Demo jury feedback: Cermat needs a **viral growth lever**. Phase 6.2 already shipped persona archetypes (Sultan Kos, Bibit Investor, Anak Kos Bijak, Pejuang Akhir Bulan, Sobat Indomie) — users get a relatable one-line financial identity. But:

- The persona output is "dead on the screen" — the user knows they're "Anak Kos Bijak", then what?
- There's no artifact they can show off outside the app.
- There's no hook that invites others to try ("hey what type are you?").

**Hypothesis:** Turn the persona result into a **shareable visual card** → user shares on social/WA → every share = an organic invite to Cermat × Mamikos → low-cost viral growth.

**Aligned with Mamikos brand affinity** — when the persona says "Anak Kos Bijak", there's a subtle Mamikos touchpoint (lock-up logo "Cermat × Mamikos"), not a garish banner.

---

## 2. Existing State (what's already there — reuse map)

This section is CRITICAL — a lot of share infra already exists in the repo. Phase 7.1 is not greenfield. Before drafting a solution, audit what already works vs what's a gap.

### 2.1. Persona engine (READY — do not touch)

| File | Role | Phase 7.1 stance |
|---|---|---|
| `lib/finance/persona.ts` | `resolvePersona({ savingsRate, runway, hasInvestments, isSnapshotReady }) → PersonaResult` | ✅ Reuse as-is |
| `lib/copy/strings.ts` (`persona.*` block) | 5 labels + 5 taglines + 2 stats labels | ✅ Reuse as-is. May add share CTA copy. |
| `lib/finance/persona.ts` → `PERSONA_STYLE_MAP` (in `PersonaCard.vue`) | gradient + emoji per persona | ⚠️ Currently lives in the component, not a centralized source-of-truth. Consider moving it into `lib/finance/persona.ts` so `ShareCard` and `PersonaCard` read from the same source (DRY). |

### 2.2. Share infrastructure (PARTIAL — needs rework)

| File | Status | Gap for Phase 7.1 |
|---|---|---|
| `components/dashboard/PersonaCard.vue` | Persona result card + Share2 button in the corner | ✅ Button exists — just make sure it's clearly visible (size 7×7 is a bit small — consider making it more prominent) |
| `components/common/ShareCard.vue` | Share modal (4 buttons: Copy/WA/X/Download) + visual card | ⚠️ Major rework needed:<br>• Uses `<Teleport>` ⇒ memory `feedback-nuxt-teleport-hydration.md` ⇒ refactor into an inline fixed overlay<br>• Hard-coded persona — needs to be generic<br>• Stats toggle exposes `savingsRate %` & `runway months` — needs a privacy audit<br>• Modal aspect ratio `max-w-sm` is not guaranteed to be 1:1 or 9:16 |
| `composables/useShare.ts` | `useShare(personaKey: Ref<PersonaKey \| null>)` + `html2canvas` capture | ⚠️ Signature bound to `PersonaKey` — needs to be generic (Phase 7.2-ready) |
| `html2canvas@1.4.1` (package) | Installed, dynamic-imported (lazy) | ✅ Reuse — or evaluate alternatives (see §4) |

### 2.3. Entry points (current vs target)

| Location | Current | Phase 7.1 target |
|---|---|---|
| **Budget-kos Summary** (`pages/app/budget-kos.vue` via `DashboardPanel.vue` → `PersonaCard.vue`) | ✅ Share2 button exists | ✅ Stays — primary entry point |
| **Wealth-tracker Summary** (`/app/snapshot`) | ❌ No PersonaCard in wealth-tracker (`v-if="isBudgetKos"`) | 🟡 **Open question** — needed? (see §10 Open Questions) |
| **Cermat Score Hero** (wealth-tracker) | No share button yet | 🟡 Defer to Phase 7.2 (sharing the score = different artifact, different privacy profile) |

### 2.4. Reuse matrix (what we harvest vs what's new)

| Aspect | Status |
|---|---|
| Persona resolver logic | 🟢 Harvest 100% |
| Persona label + tagline + emoji | 🟢 Harvest 100% |
| Persona gradient palette | 🟡 Harvest, but move to a centralized source-of-truth |
| Image capture mechanism | 🟢 Harvest `html2canvas` (or evaluate alternatives — see §4) |
| Modal/overlay component | 🔴 Rebuild (drop Teleport, restructure) |
| Card visual layout | 🟡 Reuse, but resize to a share-friendly aspect ratio (1:1 or 9:16) |
| Action buttons (Copy/WA/X/Download) | 🟢 Harvest 100% |
| Share text generator | 🟡 Harvest but make sure no numbers leak into the text |
| **Generic card generator architecture** | 🔴 New — currently hard-coded persona |
| **Explicit privacy whitelist** | 🔴 New — currently implicit |
| **"Check your friend's type" deep link** | 🔴 New (optional) |

---

## 3. Privacy Guardrails (hard requirement)

Aligned with Cermat's stance: **100% client-side, zero server upload, zero data leak**. A card shared outside the app **must not leak the user's real finances**.

### 3.1. Whitelist (allowed on the card)

| Item | Allowed | Why |
|---|---|---|
| Persona name (label) | ✅ | Classification result — does not reveal numbers |
| Persona tagline | ✅ | Static copy from `strings.ts` |
| Emoji + gradient | ✅ | Visual only |
| Branding "Cermat × Mamikos" | ✅ | App identity |
| CTA "tipe keuangan kamu apa?" | ✅ | An invitation, not data |
| URL `cermat.vercel.app` | ✅ | Public URL |

### 3.2. Greylist (allowed BUT with a guardrail — DEFAULT OFF)

| Item | Allowed? | Guardrail |
|---|---|---|
| Savings Rate % | ⚠️ Default OFF | "Show stats" toggle — explicit user consent. Already present in `ShareCard.vue`. But the default state needs reconsideration: safer default OFF (privacy-first). |
| Runway (months) | ⚠️ Default OFF | Same |
| Cermat Score (0-1000) | ⚠️ Default OFF (if enabled) | Composite score — does not reveal a single number, but is still qualitatively revealing. **Phase 7.1: not included for now** (re-evaluate in Phase 7.2). |

### 3.3. Blacklist (NEVER allowed on the card)

| Item | Rule |
|---|---|
| Rupiah amounts (balance, debt, salary, expenses) | ❌ NEVER |
| Detail line items (account labels, stock tickers, bank names) | ❌ NEVER |
| Net Worth amount | ❌ NEVER |
| Surplus amount | ❌ NEVER |
| Goals amount | ❌ NEVER |
| Anything from `snapshot.*` raw | ❌ NEVER |

### 3.4. Privacy audit checklist (must pass before implementation merge)

- [ ] The card component only accepts props from the **whitelist** (or toggled greylist)
- [ ] No direct access to `useSnapshotStore` inside the card component (data source must be funneled in via the parent)
- [ ] The share text (copied to clipboard / WA / X) contains no numbers
- [ ] Default state: stats toggle = OFF
- [ ] The stats toggle has a clear label: "Tampilkan stats saya (terlihat publik)" — not ambiguous
- [ ] Download filename = `cermat-<persona-id>.png` (contains no user data)
- [ ] **Unit test (blacklist):** snapshot with balance Rp 999,999,999 → the resulting card DOM textContent + share text + PNG metadata must not contain the substring "999"
- [ ] **Unit test (greylist boundary, Amendment 6):** stats toggle ON → assert that *only* two numbers appear in the DOM: `<savingsRate>%` and `<runway> bln`. No other derived number sneaks in (e.g. Cermat Score, net worth, any amount). How: query all text nodes, regex `/\d/`, exclude the whitelist pattern, assert count = 2.

---

## 4. Image Generation Approach

Three options considered. The repo currently uses option A (`html2canvas`). Per Amendment 1 (v2), the engine decision is held until the Day 1 capture spike completes — see recommendation below.

### Option A: `html2canvas` (current) — default candidate, start here in the spike

**Mechanism:** Render the card as a normal DOM (Tailwind), then capture it as PNG via DOM-to-canvas painting.

**Pros:**
- Already installed + already used (zero new setup)
- Designer just builds a regular Tailwind component
- Hot reload friendly (DOM = source of truth)
- Reuse of the existing card visual is nearly 100%

**Cons:**
- Bundle: `html2canvas` ~50kb gzip (already lazy-loaded — not a blocker)
- Rendering quirks: gradients sometimes alias, custom fonts sometimes miss, CSS variables (`var(--color-*)`) are sometimes problematic → needs thorough testing in dark mode
- Not pixel-perfect against the design

### Option B: Native `<canvas>` API + manual draw

**Mechanism:** Draw text + shapes manually via the Canvas 2D context.

**Pros:**
- Pixel-perfect, full control
- Lighter (zero new dependency)
- Consistent across browsers (no DOM quirks)

**Cons:**
- Reinvent the layout system (alignment, wrapping, padding)
- Designer iteration becomes expensive (every change = Canvas coding)
- Reuse of the existing card visual = 0% (rewrite)

### Option C: `html-to-image` (alternative DOM-capture lib)

**Mechanism:** Same category as `html2canvas`, different library. Smaller (~25kb), sometimes handles modern CSS better.

**Pros:**
- Smaller
- Better at gradients / modern CSS

**Cons:**
- Migration = swap lib + retest all quirks
- Both are DOM-capture, may still hit other quirks

### Recommendation (Amendment 1 — flipped per neighbor review)

**Capture spike first on Day 1, then lock the engine.** The v1 recommendation "stick with A" was overruled by the neighbor: the value of this feature is visual quality for showing off on IG/Story, and `html2canvas` has a known weakness on gradients (aliasing), while our entire card is gradient-based per persona. Lock-first → discovers the problem on Day 4 after Layer 2+3 has been built on top.

**Day 1 spike protocol (in parallel with refactoring `useShare` into generic):**

1. Build a minimal gradient card (1 persona, hard-coded, no architecture) — goal: validate output quality, not code structure.
2. Capture with `html2canvas` → PNG → open it in:
   - Chrome desktop
   - Safari mobile (iOS) — historically the engine most temperamental with DOM-capture libs
   - WhatsApp / IG preview (does the upload-back retain quality?)
3. Gradient pass criteria: smooth, no banding, no clipping. Drop-shadow renders. Inter / Plus Jakarta Sans font renders (not fallback).
4. **Pass:** continue Layer 2+3 with `html2canvas`.
5. **Fail:** swap to `html-to-image` (Option C — smaller lib + better reputation on gradients). Re-spike with the new lib, +1 day effort.
6. **Fail on both:** escalate — consider: drop the gradient → flat color per persona (safer, lib-agnostic) or go Option B (native canvas, full control, expensive on iteration).

**Decision artifact:** save the PNG spike output to `.review/spike-capture-day1/` + a 1-paragraph finding, before proceeding.

---

## 5. Card Generator: Generic Architecture (for Phase 7.2-readiness)

Neighbor AI asks: **"the image-generation has to be reusable/generic, don't hardcode it specifically to the persona card. In the future other outputs (e.g. calculator results in Phase 7.2) will be shared with the same engine."**

### 5.1. Current state (anti-pattern to avoid)

```ts
// composables/useShare.ts (current)
useShare(personaKey: Ref<PersonaKey | null>) { ... }
//        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//        Signature is bound to the "persona" domain
```

If Phase 7.2 wants to share calculator output, the options are:
- Add union parameters → signature bloat
- Build `useShareKalkulator()` → duplicate capture logic

Both are ugly. The solution: **separation of concerns**.

### 5.2. Generic architecture (proposed)

Three layers, one domain (`share/`):

```
┌─────────────────────────────────────┐
│ Layer 3: Use-case card components   │
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
- Signature: `useShare()` (no args) → returns functions that accept an explicit payload per-call
- Functions:
  - `captureAsPng(el, opts) → Promise<Blob>` — capture DOM as PNG (the engine that wins the Day 1 spike)
  - `copyText(text) → Promise<void>` — clipboard
  - `shareToWa(text)` — `https://wa.me/?text=...` intent (text+URL fallback)
  - `shareToTwitter(text)` — `https://twitter.com/intent/tweet?text=...` intent (text+URL fallback)
  - **`shareNative({ files, text, title }) → Promise<boolean>` (Amendment 2)** — wrapper around the `navigator.share()` Web Share API. Returns `true` if the native sheet opens, `false` if unsupported / user-cancelled / file-share unsupported (old browser). Layer 3 uses the return value to decide: show the fallback grid (Copy/WA/X/Download) or hide the button.
- Zero domain knowledge — doesn't know what a PersonaKey is.

**Why `shareNative` lives in Layer 1, not Layer 3 (Amendment 2 — per neighbor #2):**

Target user = Indonesian kos kid, mobile-first. UX reality:
- WhatsApp/Twitter intent = **text+URL only** (the PNG gets lost).
- Download → open Files → upload manually to IG = **big drop-off**, especially on Safari iOS where saving to Photos requires an extra step.
- `navigator.share({ files: [pngBlob] })` = OS-level share sheet → IG / TikTok / Story / WA / Telegram / Twitter app receive the image directly.

**Browser support (as of 2026):** Web Share API Level 2 (file share) is stable on Chrome Android, Safari iOS 15+, Edge. Desktop is spotty (Chrome desktop OK, Firefox no). The fallback grid is still mandatory.

**UI pattern in Layer 3 — Amendment 10 (round 2 Q2): split default for mobile vs desktop:**

```
Device detection (touch/pointer-based, NOT just feature-detect navigator.share):
  ├─ Mobile (primary touch) + shareNative supported →
  │     "Bagikan 📤" button as primary
  │     Fallback grid of 4 hidden (or shown if native fails/cancelled)
  │
  └─ Desktop (primary pointer/mouse) →
        Grid of 4 buttons (Copy/WA/X/Download) as primary
        Native share button HIDDEN — even if the browser supports it
        (Safari macOS/Edge support navigator.share, but the desktop sheet UX
         is weird & desktop users don't expect it — the grid feels more natural)
```

**Why detect touch/pointer, not purely whether `navigator.share` exists:** Safari macOS + Edge desktop support `navigator.share`, but:
- The desktop native share sheet = an odd small window, rarely used
- Desktop users expect a traditional copy/download flow
- Mobile users expect an OS share sheet (already muscle memory from IG/WA Story)

**Implementation hint:** use `matchMedia('(pointer: coarse)')` or `'ontouchstart' in window` for detection. Or a combo: `pointer: coarse` AND `navigator.share` AND `navigator.canShare({ files })`. Layer 1 exposes an `isMobileShareCapable()` helper.

Don't: show a separate "Share" button alongside the grid on mobile (redundant). Native share on mobile = primary path; grid on desktop = primary path. Consistent = 1 primary path per platform.

**Layer 2 — `ShareDialog.vue`:**
- Props: `open: boolean`, `aspectRatio?: '1:1' | '9:16'` (default `'1:1'` — Amendment 5: the slot layout must be vertical-friendly so the `aspectRatio` seam is genuinely a config flip), `downloadName?: string`, `shareText: string`
- Slot: `default` (the card visual content)
- Renders: inline fixed overlay (NOT Teleport) + native-share-first action area (fallback grid). Captures whatever is in the slot.
- Zero domain knowledge.

**Layer 3 — `PersonaShareCard.vue`:**
- Domain-specific. Composes Layer 2 + Layer 1.
- Knows about `PersonaKey`, gradient, emoji, tagline.
- Phase 7.2: build `KalkulatorShareCard.vue` that also composes Layer 2 + Layer 1 with a different visual.

### 5.3. Scope discipline (important!)

**Phase 7.1 implementation:** Layer 1 + Layer 2 + Layer 3 (persona only).
**Phase 7.1 is NOT:** building Layer 3 for other use-cases. Persona only.

Why? Because "generic" built without a real second use-case = over-engineering. Phase 7.2, when implementing the second use-case, is the real-validation moment for whether Layer 1+2 is actually generic or needs refactoring.

**Risk & mitigation:** if Phase 7.2 turns out to need a feature Layer 2 currently doesn't provide (e.g. multi-page card), that's a fair refactor — that's the point of iteration. What's forbidden: building speculative Layer 2 features (multi-page support, animation, etc.) without a real consumer.

---

## 6. Card Visual Spec (Phase 7.1 — persona card)

### 6.1. Aspect ratio (Amendment 5 — vertical-friendly seam)

- **Default render: 1:1 (square)** — most universal (IG post, FB post, WA status thumb).
- **Phase 7.1 ship:** 1:1 only as the UI-available output.
- **BUT the slot layout must be structured vertical-friendly from the start** — so the `aspectRatio` prop on `ShareDialog` (§5.2) is just a config flip for 9:16 in Phase 7.2 / hotfix, not a visual redesign.

**Concretely:** vertical stack (emoji → label → tagline → stats → CTA → branding), single-column, generous padding. Avoid horizontal 2-column layouts or elements that assume aspect 1:1 (e.g. a circle background touching all 4 edges). Center-align everything. Generous top/bottom margins — so when the container is stretched vertically (9:16), proportions don't break.

### 6.2. Layout (default render 1:1, vertical-friendly so 9:16 is a flip — Amendment 5)

```
┌──────────────────────────────┐
│                              │  ← top padding (generous, scale-friendly)
│         [BIG EMOJI]          │  ← 96-128px, drop-shadow
│                              │
│      Anak Kos Bijak          │  ← persona label, 2xl/3xl bold
│   Disiplin ngatur keuangan   │  ← tagline, base, opacity 90%
│                              │
│   ┌─ (optional toggle) ──┐   │
│   │ Sisa Uang   Bertahan │   │  ← stats card (if toggle ON)
│   │   35%       6 bln    │   │     -- DEFAULT OFF
│   └──────────────────────┘   │
│                              │  ← spacer (larger in 9:16 — use flex grow)
│  tipe keuanganmu apa?        │  ← CTA, sm italic
│  Coba di Cermat × Mamikos    │  ← branding
│  cermat.vercel.app           │  ← URL, xs mono
│                              │  ← bottom padding (generous)
└──────────────────────────────┘
```

**Anti-pattern (reject):**
- 2-column (emoji left, copy right) — breaks in 9:16
- Absolute-positioned with percentages that assume 1:1
- Circle background with radius = 50% width → becomes an oval in 9:16
- **`vh` / `vw` units** or **`%`-height dependent on a dynamic parent** (Amendment 12, round 2 Q5) — html2canvas renders at a **logical fixed size** (e.g. 1080×1080), and viewport-unit-based elements can shift on capture across devices. Use fixed/aspect-based sizing (px, em, rem, or CSS aspect-ratio).

**OK patterns:**
- `flex flex-col items-center justify-between` + `flex-grow` on the middle spacer
- Gradient via `bg-gradient-to-b` (top→bottom) — natural in portrait
- Padding via `px-8 py-12` (uniform, scale-friendly)
- Sizing: `w-[1080px] aspect-square` or `aspect-[9/16]`, fonts via `text-base/lg/xl/2xl` (rem-based) — not `text-[3vw]`

Gradient background per persona (reuse + move `PERSONA_STYLE_MAP` into `lib/finance/persona.ts` as the source-of-truth).

### 6.3. Visual rules

- **Mamikos logo:** text lock-up "Cermat × Mamikos" (no logo image — privacy concern, dependency hassle). Subtle, in the footer.
- **URL:** static `cermat.vercel.app` in the footer (small monospace font).
- **CTA copy:** *"tipe keuangan kamu apa? Coba di Cermat"* — or other iterations. Casual, inviting tone.
- **Stats toggle (if ON):** small 2-column card (Sisa Uang %, Bertahan bln) — already in `ShareCard.vue`, just confirm default OFF.
- **Dark mode:** the card should **always be light** (color gradient) — independent of the app theme. Reason: dark mode is inconsistent with IG/social feeds, which are dominantly light.
- **Native share button (Amendment 2 + 10):** **mobile-only primary** — label "Bagikan" + emoji 📤. **Desktop:** this native button is HIDDEN, the grid of 4 buttons (Copy/WA/X/Download) is primary (see §5.2 UI pattern). On mobile, if `shareNative` returns `false` (unsupported/cancelled) → fall back to the grid.

### 6.4. Font

Use a font already loaded by the app (Inter/Plus Jakarta Sans). **Note:** `html2canvas` sometimes fails to capture a custom font if it hasn't fully loaded — must wait for `document.fonts.ready` before capture.

### 6.5. Persona naming for public context (Amendment 3)

The neighbor flagged: the 5th persona is currently named **"Sobat Indomie"**. In v1, the persona only appeared in-app as a label — safe. In v2, the persona becomes a **public artifact co-branded "Cermat × Mamikos"**. Putting a third-party commercial product name (Indomie / Indofood) on a shared card carries risk:

1. Unauthorized brand association (Indofood didn't approve the usage).
2. The "you're so broke you eat Indomie" implication, attached to Mamikos co-branding (Mamikos gets pulled in).

**Recommendation:** Rename to **"Sobat Mie"** (the neighbor's primary suggestion). Reasons:
- "Sobat Mie" is generic (instant noodles come in many brands) — no specific brand association.
- Warm & relatable tone is preserved (matches the empathy/budget persona).
- 1 word different from the original → minimal disruption to recognition for existing users.

**Alternatives (if "Sobat Mie" doesn't click):**
- "Sobat Hemat" — most neutral, OJK-friendly, but flat (loses warmth).
- "Anak Kos Hemat" — fits the "Anak Kos *" theme but overlaps with "Anak Kos Bijak".

**Implementation:**
- Update `lib/copy/strings.ts`: change `persona.sobatIndomie.label` value `"Sobat Indomie"` → `"Sobat Mie"`. Update `persona.sobatIndomie.tagline` if it references "indomie" specifically (current: `"Hemat itu pilihan, tapi yang penting happy!"` — safe, no change needed).
- **Keep the internal `PersonaKey` = `'sobatIndomie'`** to avoid breaking changes to localStorage, tests, and fixtures that reference the key. Display-only rename.
- Code note: a comment in `persona.ts` explains why the key differs from the display label (reasonable technical debt).

**Open to override:** if the user/neighbor prefers renaming the internal key too (consistency > backwards-compat), that's also acceptable — cost: update 3-5 files + regen test snapshots.

---

## 7. Deep Link "Check your friend's type" — MUST-HAVE (Amendment 4)

Status: **MUST-HAVE in Phase 7.1** (promoted from optional per neighbor review).

### Concept

When the user shares the card on social/WA, the shared link = a URL to the Cermat landing page that invites the visitor to **try a short persona quiz** (or go straight to budget-kos onboarding). Different from just sharing the homepage URL.

### Why MUST, not optional (Amendment 4)

Without the landing loop:
```
User A shares card → User B clicks link → lands on generic homepage → bounces
```

With the landing loop:
```
User A shares card → User B clicks link → "curious about your type?" banner → CTA → budget-kos onboarding → conversion
```

Neighbor: *"Why ship a viral feature but break the landing experience for whoever clicks?"* Agreed — a viral feature without a landing loop = leaking at the bottleneck. Option A is only ½ a day, makes sense.

### Option A: URL parameter (CHOSEN for 7.1)

```
https://cermat.vercel.app/?from=share&persona=sobatMie
```

**Behavior:**
- The landing page (`pages/index.vue`) reads the query string `from=share` on mount
- If `from=share` is present → render a banner overlay over the hero: **"Penasaran tipe kamu? Yuk isi data, gratis & 100% di HP kamu — gak ke server"**
- The banner has 1 CTA: **"Cek tipe saya"** → `navigateTo('/app/budget-kos?onboard=1')`
- Optional: if `persona=<key>` is valid, the banner shows a preview *"Temanmu adalah Sobat Mie 🍜"* → more personal
- Banner is dismissible (X button) — no localStorage persist (next visit, if clicking another share link, it reappears)

**Effort:** S (½ day) — parse query + conditional banner component + 1 copy string.

**Privacy:** `persona=<key>` in the URL = the persona name only, no amount. Safe (whitelist §3.1).

**Analytics:** can come later (Phase 7.2 / after viral validation). Close the loop first, measure later.

### Option B: Dedicated landing `/persona` (DEFER to Phase 7.3)

A separate page `/persona?ref=share` with a short quiz (3-4 light questions) → persona preview output → CTA to the full app.

**Effort:** L (2-3 days) — quiz design, copy, simple scoring. Defer because Option A already closes the minimum-viable loop.

### Banner visual hint — Amendment 11 (round 2 Q4): trimmed, single-hook headline

The v2 copy (3 ideas stacked: friend's result + invite + privacy) → trimmed to a 1-hook headline + privacy microcopy below the button. A landing banner gets ~1.5 seconds of attention, no paragraphs allowed.

```
┌─────────────────────────────────────────────┐
│  Temenmu Sobat Mie 🍜👀                     │  ← headline = 1 hook
│  Kamu tipe apa?                             │
│                                             │
│  [ Cek gratis → ]              [ × tutup ]  │  ← decisive CTA
│                                             │
│  🔒 100% di HP kamu — gak ke server         │  ← privacy microcopy
└─────────────────────────────────────────────┘
```

**Copy spec:**
- **Headline (1 hook):** `"Temenmu {personaLabel} 👀"` + sub-line `"Kamu tipe apa?"` (if `?persona=<key>` is valid). If invalid → fallback: `"Cek tipe keuangan kamu 👀"`.
- **CTA:** `"Cek gratis →"` (decisive, action-oriented).
- **Privacy microcopy:** `"🔒 100% di HP kamu — gak ke server"` (small, below the button — not in the headline).

**Behavior:**
- Small card above the hero, soft shadow, gradient matching the persona if `persona=` is valid (or default emerald).
- Not a modal — non-blocking, so the user can scroll-explore if they don't want to click.
- Dismissible (X). No localStorage persist — next visit from another share link, it reappears.

---

## 8. Implementation Order (LOCKED v3 — post round 2)

**Note:** this is the implementation order that's been locked. **Not yet executed** — wait for neighbor confirmation on the locked v3.

**Per Amendment 9 (round 2 Q1):** Day 1 = **FULL capture spike** (decision gate, do not compress). The `useShare` refactor shifts to Day 2. Spike is foundational → if it fails and the engine has to be swapped, that's +1 real day. Effort is 6 days (spike passes first try) up to 7 days (lib swap needed).

| Day | Task | Files |
|---|---|---|
| **1 (FULL)** | **🟠 Capture-quality spike (Amendment 1 + 9)** — minimal hard-coded gradient card, capture with html2canvas, test on Chrome desktop + Safari iOS + WhatsApp/IG preview. Pass criteria: §4 protocol. Save PNG into `.review/spike-capture-day1/`. **Do not force half-day — this spike is the decision gate.** If the result fails → swap to `html-to-image`, re-spike (+1 day). If both fail → escalate (flat color or native canvas). | spike branch / throwaway component, decision artifact: 1-paragraph finding |
| **2 — morning** | Refactor `useShare.ts` → generic (Layer 1), no domain coupling. **Add `shareNative({ files, text, title })` + `isMobileShareCapable()` helper** (Amendment 2 + 10) — feature-detect combo `pointer: coarse` + `navigator.canShare({ files })`. | `composables/useShare.ts` |
| **2 — midday** | Privacy audit: write unit tests that assert no-leak (blacklist §3.4) + greylist boundary (Amendment 6) | `tests/composables/useShare.test.ts` (NEW) |
| **2 — afternoon** | Build `ShareDialog.vue` (Layer 2): inline fixed overlay (NOT Teleport), `aspectRatio` prop seam (default `'1:1'`), **action area with split mobile-primary-native vs desktop-primary-grid (Amendment 10)** | `components/common/ShareDialog.vue` (NEW) |
| 3 | Build `PersonaShareCard.vue` (Layer 3) — **vertical-friendly layout (Amendment 5 + 12)**, no `vh`/`vw`/`%`-height, default stats OFF, gradient via `bg-gradient-to-b` | `components/share/PersonaShareCard.vue` (NEW) |
| 4 — morning | Move `PERSONA_STYLE_MAP` into `lib/finance/persona.ts` (source-of-truth) | `lib/finance/persona.ts`, `components/dashboard/PersonaCard.vue` |
| 4 — midday | **Rename "Sobat Indomie" → "Sobat Mie" (Amendment 3 — LOCKED)** in `lib/copy/strings.ts` label. Keep internal `PersonaKey`. Update tests that assert the string. | `lib/copy/strings.ts`, `tests/finance/persona.test.ts` |
| 4 — afternoon | Wire the entry point in `PersonaCard.vue` (Share button → new `ShareDialog`) + make the button more visible (size 9×9 + tooltip "Bagikan kartu") | `components/dashboard/PersonaCard.vue` |
| **5** | **🟡 Deep link `?from=share` handler (Amendment 4 + 11 — MUST)** — landing banner with trimmed copy (`"Temenmu <persona> 👀 Kamu tipe apa?"` + CTA "Cek gratis →" + privacy microcopy), parse query, conditional render, dismissible | `pages/index.vue` + `components/landing/ShareInviteBanner.vue` (NEW) |
| 5 | Cross-browser capture test (Chrome/Safari mobile + desktop), dark mode, slow network 3G, font-loading race, native share on iOS Safari + Chrome Android | manual QA |
| 6 | Polish: font loading wait (`document.fonts.ready`), error state (capture-fail toast), loading state ("Sedang membuat kartu…"), native-share fallback UX, per-persona banner gradient | as findings dictate |
| **7 (buffer)** | Buffer if Day 1 spike fails → swap to html-to-image + re-spike + revisit Layer 3 styling. Or polish iteration based on QA. | as findings dictate |

**Effort estimate (LOCKED):** **6 days** if the spike passes on the first try (html2canvas OK); **7 days** if a swap to html-to-image is needed. Range "6-7 days, depending on the Day 1 spike outcome" — don't force it shorter; the value of this feature is visual polish.

---

## 9. Files to Create / Modify

### To Create

| File | Purpose |
|------|---------|
| `components/common/ShareDialog.vue` | Layer 2 — generic share modal (inline overlay, native-share-first + fallback grid) |
| `components/share/PersonaShareCard.vue` | Layer 3 — persona-specific card visual (vertical-friendly, Amendment 5) |
| `components/landing/ShareInviteBanner.vue` | **NEW (Amendment 4)** — landing banner that appears when `?from=share` is present |
| `tests/composables/useShare.test.ts` | Privacy assertions + capture function tests + `shareNative` feature-detect test |
| `tests/components/PersonaShareCard.test.ts` | Snapshot test — assert no amounts in DOM (blacklist §3.4) + greylist boundary (Amendment 6) |

### To Modify

| File | Change |
|------|--------|
| `composables/useShare.ts` | Refactor into generic (Layer 1). Drop the `PersonaKey` dependency. **Add `shareNative({ files, text, title })` (Amendment 2)** with feature-detect `navigator.canShare({ files })`. |
| `components/dashboard/PersonaCard.vue` | Swap `<ShareCard>` for `<ShareDialog>` + `<PersonaShareCard>`. Make the Share2 button slightly more visible (size 9×9 + tooltip "Bagikan kartu"). |
| `lib/finance/persona.ts` | Add `PERSONA_VISUALS: Record<PersonaKey, { gradient, emoji }>` as the source-of-truth. Comment on the `'sobatIndomie'` key explaining why the display label differs (Amendment 3). |
| `lib/copy/strings.ts` | (a) Add share CTA copy: `share.cta`, `share.toggleStats`, `share.brandLockup`, `share.nativeButton` (`"Bagikan"`). (b) **Amendment 3:** change `persona.sobatIndomie.label` value: `"Sobat Indomie"` → `"Sobat Mie"`. (c) **Amendment 4 + 11 (round 2):** add banner copy with the trimmed template:<br>• `landing.shareInvite.headlineTemplate`: `"Temenmu {persona} 👀"` (template, persona from query)<br>• `landing.shareInvite.headlineFallback`: `"Cek tipe keuangan kamu 👀"` (if persona is invalid)<br>• `landing.shareInvite.sub`: `"Kamu tipe apa?"`<br>• `landing.shareInvite.cta`: `"Cek gratis →"`<br>• `landing.shareInvite.microcopyPrivacy`: `"🔒 100% di HP kamu — gak ke server"` |
| `pages/index.vue` (landing) | **Amendment 4:** read `?from=share` & optional `?persona=<key>` on mount → render `<ShareInviteBanner>` above the hero. |
| `tests/finance/persona.test.ts` | Update string assertion `"Sobat Indomie"` → `"Sobat Mie"` (if the test references the label). |

### To Deprecate / Delete

| File | Status |
|------|--------|
| `components/common/ShareCard.vue` | DELETE after `PersonaCard.vue` migrates to `ShareDialog + PersonaShareCard` |

---

## 10. Open Questions — RESOLVED (post neighbor round 1)

The 8 v1 open questions have been answered by the neighbor in round 1. Summarized in the Revision History → "Neighbor verdict on the 8 Open Questions". Detail per item:

| # | Q | Verdict | Status |
|---|---|---|---|
| 1 | WT entry point | Defer 7.2 ✅. Note: **tier-share (Bibit→Hutan) = strong 7.2 candidate** (most flexible). | Closed. Tier-share added to Phase 7+ Backlog (README). |
| 2 | Is html2canvas enough? | Test first, don't lock | → Amendment 1 (§4, §8) |
| 3 | Stats default OFF/ON? | **OFF** — persona+emoji is already the wow, stats add privacy risk without adding virality | Closed (no change) |
| 4 | 1:1 vs 9:16 | Vertical-friendly layout from the start, ship 1:1 now | → Amendment 5 (§6.1, §6.2) |
| 5 | CTA generic vs per-persona | Generic first, per-persona = 7.2 polish | Closed (no change) |
| 6 | Branding text vs logo | Text-only, agreed (logo = render risk + dark/light hassle) | Closed (no change) |
| 7 | Deep link must vs nice | **Must-have** — closes the viral loop | → Amendment 4 (§7, §8) |
| 8 | Generic timing | Seam now, one consumer, resist speculation | Closed (no change) |

### Open for round 2 (if any)

- **Persona rename: display label only, or internal `PersonaKey` too?** v2 recommendation: display-only (avoid migration). Override possible.
- **Native share button label & icon** — "Bagikan" + 📤 enough, or does it need more persuasive copy?
- **Deep link banner copy** — *"Penasaran tipe kamu? Yuk isi data, gratis & 100% di HP kamu — gak ke server"* — too long? Can it be punchier?

---

## 11. Success Criteria

- [ ] **Day 1 capture spike (Amendment 1):** the resulting PNG from html2canvas (or the swapped engine) on Chrome desktop + Safari iOS passes the quality bar — smooth gradient with no banding, Inter/Plus Jakarta font renders (no fallback), drop-shadow renders. The `.review/spike-capture-day1/` artifact exists.
- [ ] In budget-kos Summary, the user clicks Share on PersonaCard → the share modal appears **with no hydration warning (no Teleport)**
- [ ] Card visual aspect ratio is 1:1, vertical-friendly layout (Amendment 5) — `ShareDialog` prop `aspectRatio="9:16"` in the test bench doesn't break the layout
- [ ] Default state: stats toggle OFF (privacy-first)
- [ ] Stats toggle ON → Sisa Uang % + Bertahan bln appears (whitelist greylist only)
- [ ] **Privacy test (blacklist, §3.4):** the resulting PNG + share text contains no Rp amount, for all 5 personas (snapshot test with balance Rp 999,999,999 → DOM/text has no "999")
- [ ] **Privacy test (greylist boundary, Amendment 6):** stats ON → DOM contains only 2 numbers (savingsRate% + runway bln), no other derived number
- [ ] **Native share (Amendment 2):** in a browser that supports `navigator.canShare({ files })` → the "Bagikan 📤" button appears + the native sheet opens with the PNG attached. In an unsupported browser → the button is hidden, the grid of 4 buttons (Copy/WA/X/Download) appears as fallback.
- [ ] The 4 fallback action buttons (Copy, WhatsApp, X, Download) work
- [ ] `useShare.ts` signature is generic — no longer bound to `PersonaKey`
- [ ] `ShareDialog.vue` accepts slot content, not hard-coded persona
- [ ] **Persona rename (Amendment 3):** display label `"Sobat Indomie"` → `"Sobat Mie"` everywhere (in-app PersonaCard + share card). Internal `PersonaKey` = `'sobatIndomie'` unchanged.
- [ ] **Deep link banner (Amendment 4):** opening `https://cermat.vercel.app/?from=share&persona=sobatMie` → the banner appears on the landing with a persona preview + CTA. Without `?from=share` → no banner. Click X → banner disappears (no localStorage persist).
- [ ] `npm run typecheck` clean (vue-tsc)
- [ ] Existing tests still pass, plus 2-3 new test files
- [ ] App dark mode active → the share card still renders light (independent)
- [ ] `document.fonts.ready` is awaited before capture (no font fallback)
- [ ] Download filename = `cermat-<persona-id>.png` (no user data)

---

## 12. Verification

1. **Day 1 capture spike (Amendment 1):** the PNG output from the spike branch is reviewed manually, saved in `.review/spike-capture-day1/` with a 1-paragraph finding. Pass → lock the engine. Fail → swap + re-spike.
2. `npm run dev` → open `/app/budget-kos`, load sample persona Mahasiswa Mandiri → click Share → check the modal (no Teleport jank, no hydration warning in console)
3. Toggle "Tampilkan stats (terlihat publik)" → verify stats appear/disappear
4. Click Download → check PNG file: aspect 1:1, no amount, branding present
5. Click Copy → paste in notepad: verify no numbers
6. Click WhatsApp → check the `wa.me/?text=...` URL has no numbers
7. **Native share (Amendment 2):** open on Chrome Android / Safari iOS → primary "Bagikan 📤" button → click → native sheet opens with PNG attached. Pick an app (IG / WA / TG) → verify the image was delivered.
8. **Native share fallback:** open on Firefox desktop → "Bagikan 📤" button hidden → grid of 4 buttons appears.
9. **Deep link (Amendment 4):** open a new tab `http://localhost:3000/?from=share&persona=sobatMie` → banner appears on the landing with emoji 🍜 + label "Sobat Mie" + CTA "Cek tipe saya". Click CTA → navigates to `/app/budget-kos?onboard=1`. Close the tab, reopen without `?from=share` → no banner.
10. Toggle app dark mode → reload → click Share again: the card stays light
11. Network throttle slow 3G → reload page → click Share immediately: verify the font has loaded before capture (no fallback render)
12. `npx vue-tsc --noEmit` → clean
13. `npm run test` → all pass, plus 2-3 new test files
14. **Privacy test (blacklist) programmatic:** snapshot with balance Rp 999,999,999 → render `PersonaShareCard` → query DOM textContent → assert no "999" substring
15. **Privacy test (greylist boundary, Amendment 6) programmatic:** stats ON → query all text nodes, regex `/\d/`, exclude pattern `<savingsRate>%` + `<runway> bln` → assert match count = 0 (no other derived number)
16. **Persona rename verification (Amendment 3):** load the Sobat Indomie scenario in the in-app PersonaCard + share card → both labels show "Sobat Mie", not "Sobat Indomie". Regen test snapshots if needed.

---

## 13. Out of Scope (Phase 7.1)

- Multiple card templates / persona variants
- 9:16 story aspect ratio **as a UI-available output** (Amendment 5: vertical-friendly layout MUST be prepared, but ship 1:1 output only — switching to 9:16 becomes a later config flip)
- Server-side image generation / OG image
- Analytics tracking (share count, viral coefficient) — can follow after 7.1 ships
- Custom user photo upload onto the card
- Cermat Score share card (Phase 7.2)
- Calculator share card (Phase 7.2)
- Badge unlock share card (Phase 7.2)
- **Tier-share Bibit→Hutan (Phase 7.2 — flagged by the neighbor as a strong candidate)**
- Dedicated persona quiz landing page (Phase 7.3)
- Mamikos logo image (text lock-up only)
- Confetti / micro-animation when the card is generated
- Wealth-tracker persona share (defer 7.2)
- A/B test of CTA copy
- Rename of internal `PersonaKey` (display-only rename in Amendment 3)

---

## 14. Demo Storyboard (if implemented — v2)

**Mobile-first flow (target audience):**

1. **Sample persona "Mahasiswa Mandiri"** loaded in budget-kos (phone)
2. Scroll to PersonaCard → label "💪 Anak Kos Bijak"
3. **Click the Share button** → share modal appears inline (no Teleport jank), 1:1 card with a big emoji + persona label
4. **Primary button: "Bagikan 📤"** → the OS native share sheet opens (PNG attached)
5. User picks **Instagram Story** → PNG goes into the Story composer → post → live
6. Friend opens the Story → clicks the bio link / sticker `cermat.vercel.app/?from=share&persona=anakKosBijak`
7. Landing opens → **banner appears:** *"Temanmu adalah Anak Kos Bijak! Penasaran tipe kamu? Gratis & 100% di HP kamu — gak ke server"* + CTA "Cek tipe saya"
8. Click CTA → straight into `/app/budget-kos?onboard=1` → loop closed ✅

**Desktop fallback flow:**

1. Click Share on the budget-kos card
2. Native share unsupported (Firefox desktop) → grid of 4 buttons: Copy / WhatsApp / X / Download
3. Click Download → PNG goes into Downloads
4. Click Copy → paste in chat: `"Aku Anak Kos Bijak! ✨ Cek keuanganmu juga di Cermat × Mamikos! https://cermat.vercel.app/?from=share&persona=anakKosBijak"`

**Privacy flow:**

1. User opens the modal → default state: stats OFF, the image is just persona + emoji + tagline
2. User toggles "Tampilkan stats saya (terlihat publik)" → Sisa Uang 35% + Bertahan 6 bln appears (explicit consent)
3. User downloads / shares → the PNG follows the latest choice

---

## 15. Neighbor Reviewer Notes — round 2 RESOLVED (v3 LOCKED)

**Round 1 verified (✅):** privacy guardrails, generic architecture, Teleport drop, honest reuse map, persona scope (5 budget-kos).

**Round 2 verified (✅):** the 6 v2 amendments landed in the file, several were executed better than asked (capture spike protocol, Indomie display-only rename keeping the internal key).

**Round 2 answers to the 7 questions — all applied in spec v3:**

| Q | Question | Neighbor answer | Applied at |
|---|---|---|---|
| 1 | Is the Day 1 split realistic? | **No.** The spike is the FULL Day 1. The `useShare` refactor shifts to Day 2. Effort becomes a flat 6 days (not 5-6). | Amendment 9 → §8 |
| 2 | Native primary + fallback grid pattern? | Correct for mobile. But **desktop: grid primary, native HIDDEN** (Safari macOS/Edge support `navigator.share` but the UX is weird). Detect touch/pointer, not just feature-detect. | Amendment 10 → §5.2, §6.3 |
| 3 | "Sobat Mie" or is there a better name? | "Sobat Mie" **is safe and warm enough, lock it.** Alternatives "Anak Kos Sejati" / "Pejuang Mie" — bikeshedding, don't burn the round. | LOCKED, unchanged (noted) |
| 4 | Banner copy too long? | **Yes.** 3 ideas stacked. Trim the headline to 1 hook + privacy microcopy below the button. Headline = 1 hook. | Amendment 11 → §7 |
| 5 | Is the §6.2 anti-pattern list enough? | Enough, add 1: **avoid `vh`/`vw` & `%`-height** (html2canvas renders at a logical fixed size, viewport-unit elements can shift). | Amendment 12 → §6.2 |
| 6 | Anything open for round 2 in §10? | Clear, no new open items. | — |
| 7 | Is the 5-6 day effort plausible? | Bump it to **6-7 days** (full Day 1 spike + lib-swap risk). Add the note "depends on Day 1 spike outcome". Don't overpromise. | Amendment 8 → header, §8 |

**Cosmetic leftover (resolved):** the stale §4 intro line *"stick with A or move to B?"* — already removed (Amendment 7).

---

The spec is now status **🔒 LOCKED v3** — refinements applied, 6+5 amendments verified, cosmetic leftover removed. **The neighbor will review this locked v3 → green light → only then implementation.** Until confirmation arrives, don't push.

🫡🎮
