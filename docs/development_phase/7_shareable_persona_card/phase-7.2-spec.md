# Phase 7.2 — Insight Jujur

**Branch (planned):** `insight-jujur-phase-7.2`
**Status:** 🔒 **LOCKED v4** — neighbor-AI round-3 green light + `{X}` semantic fix applied (`{X}` = named-category amount, not total diskresioner)
**Prerequisite:** Phase 7.1 merged (shareable persona card)
**Brief source:** `.review/ide-ai-tetangga-phase-7.2.md`
**Review feedback:** `.review/feedback-ai-tetangga-phase-7.2-1.md`, `.review/feedback-ai-tetangga-phase-7.2-2.md`, `.review/feedback-ai-tetangga-phase-7.2-3.md`

---

## Changelog v1 → v2 → v3 → v4

### v3 → v4 (round-3 review — `{X}` semantic fix, must apply before resolver implementation)

| # | Section | Change | Driver |
|---|---|---|---|
| F1 | §3.3, §3.5, §4.3 | **`{X}` in bocor copy = named-category amount, NOT total diskresioner.** Y (bocor normal) = `X_amount / tabungan`, consistent with `{X}`. Dominance gate (`diskresioner_total > essential_total`) unchanged — gate detects "is leak dominant?", copy names ONE category honestly. | Reviewer round-3 🔴 |
| F2 | §3.7 | Judol copy preview corrected: `Rp5jt` → `Rp4jt` (Top-up / Hobi Online actual amount). Sultan unaffected (single category, X = total). | Consequence of F1 |
| F3 | §4.2 | Worked example updated to `Rp4.000.000`. Causal hook preserved: 4M leak > 1M deficit → cut leak, +3M surplus. | Consequence of F1 |
| F4 | §8.1 | Persona test assertion for Judol must check `Rp4.000.000` (named category), NOT `Rp5.000.000` (total). Test sequence emphasized: resolver `{X}` fix FIRST → THEN write test → green = proven correct. | Reviewer warning: wrong order locks bug as "truth" |

### v2 → v3 (LOCK — round-2 review resolved)

| # | Section | Change | Driver |
|---|---|---|---|
| L1 | §4.2 | **Option A LOCKED** with reviewer's exact wording (`Rp{X} bulan ini lari ke {kategori} — itu yang bikin kamu nombok Rp{|surplus|} tiap bulan.`). Option B removed. | Q-NEW-1 approved by reviewer |
| L2 | §3.7 | Replaced approximate numbers with **verified exact numbers** computed from persona fixtures using `calcTotalPengeluaran` formula (`metrics.ts:171`) + `sumCicilanPerBulan` (`metrics.ts:154`). **Judol bocor-dominant PROVEN: leak 5.0M > essentials 4.0M.** | Reviewer lock condition #2 |
| L3 | §5.4 | Expanded suppression matrix to include `components/layout/DashboardSummary.vue:91–95` `surplusStatus` (3 variants: "Keuangan kamu sehat" / "Defisit bulanan" / "Mepet — pas-pasan"). CermatScoreHero audit confirmed only `:117` is competing copy. | Q-NEW-3 audit done |
| L4 | §3.1 | Dominance gate margin REJECTED (`leak > essential_total` strict). A 1.2× margin would have endangered Judol if real essentials > 4.17M. | Q-NEW-2 reviewer rejection |
| L5 | §10 | All Q-NEW-1/2/3/4 resolved. Spec lock-able. | Round-2 conclusion |

### v1 → v2 (round-1 review)

| # | Section | Change | Driver |
|---|---|---|---|
| C1 | §3.3 | Removed `online` + `belanja` from keyword list (substring false-positives on essentials like "Belanja Bulanan", "Kursus Online") | Finding 🔴 #1 |
| C2 | §3.1 | Added **bocor dominance gate** — bocor can win over defisit when leak > essentials. Strict priority loosened only for this case. | Finding 🔴 #2 (Judol demo risk) |
| C3 | §3.5 | Tightened Y gate to `Yactual >= 2.0` (real, not rounded). Display still rounded. | Avoid Y=1.5 → "2×" overclaim (Pas-pasan, Freelancer) |
| C4 | §3.7 | NEW — Persona fire-prediction table verifying all 10 personas | Finding 🔴 #2 audit requirement |
| C5 | §4 | Added **proposed copy variant** for bocor-over-defisit case (flagged for review per brief rule) | Consequence of C2 |
| C6 | §5.2 | Budget-kos placement: bar → InsightJujur → projection card (was undecided) | Open Q5 answered |
| C7 | §5.4 | Replaced ADD model with **CONDITIONAL** — Insight Jujur suppresses overlapping existing copy when it fires | Finding 🟠 #3 (3-deficit-message stacking) |
| C8 | §8.1 | Added tests: keyword trim cases, bocor-over-defisit, Y gate boundary | Coverage for C1, C2, C3 |
| C9 | §10 | Updated open questions — most resolved; new question on bocor-over-defisit copy approval | Review round-trip |

---

## 1. Goal

Cermat already has seed insights scattered through the Ringkasan tab (e.g. *"Surplus masih tipis — fokus naikin dulu"*, *"Hati-hati Defisit"*). Phase 7.2 promotes these into **a single sharp, honest headline insight**, auto-derived from the user's actual numbers, that makes them stop and think *"anjir bener juga"*.

**Tier 2 framing:** one moment executed until it lands > four moments that pass by unnoticed. Demo focus: the deficit/leak insight is the punch line that sticks with the jury within seconds.

---

## 2. Scope

- **One insight, one screen.** Not a list, not an insight dashboard. Detect the strongest signal for this user, render one punchy line.
- **Surface:** Ringkasan tab in both modes (wealth-tracker + budget-kos).
- **Copy templates:** locked from brief — no creative latitude in implementation. (Exception: §4.2 new variant, approved in round 2.)
- **No new metric.** Reuse `derived.ts`, `metrics.ts`, `pengeluaranLain` rows. Do not touch the scoring engine, persona fixtures, or other modes.
- **Existing copy:** CONDITIONAL — suppressed when Insight Jujur fires (see §5.4).

### Out of scope (Phase 7.2)

- ❌ Multi-insight rotation / carousel
- ❌ Insight on the Phase 7.1 share card (card stays privacy-pure; different concern)
- ❌ Prescriptive advice ("sebaiknya investasi di X") — OJK line, forbidden
- ❌ Onboarding/empty state copy improvements
- ❌ Insight in the PDF report (defer to 7.3+)
- ❌ Analytics on fire rate / persona breakdown
- ❌ Insight outside the Ringkasan tab (calculators, snapshot input page, etc.)

---

## 3. Signal detection

### 3.1 Priority logic (revised — dominance gate)

**Two distinct semantics — keep them separate in implementation:**
- **Gate decisions** use `diskresioner_total` (lifestyle + Σ matched lain) — "is the leak dominant overall?"
- **Copy display** uses `X_amount` (the amount of the SPECIFICALLY NAMED category) — "the number must match the category named."

```
1. Bocor diskresioner (DOMINANT case):
   if surplus < 0 AND diskresioner_total > essential_total
   → bocor fires (over defisit) — dominant leak wins over thin defisit
   uses copy variant §4.2 (round-2 LOCKED Option A)
   {X} in copy = X_amount (NOT diskresioner_total)

2. Defisit:
   if surplus < 0
   → defisit fires (generic) uses copy §4.1

3. Bocor diskresioner (NORMAL case):
   if surplus > 0 AND X_amount > tabungan AND Yactual >= 2.0
     where Yactual = X_amount / tabungan
   → bocor fires uses copy §4.1
   {X} in copy = X_amount

4. Runway kritis:
   if runwayDays < 30
   → runway fires uses copy §4.1

5. (no signal) → silence; existing copy stays (§5.4)
```

Definition of `essential_total`:
```
essential_total = pokok + biayaKos + sumCicilanPerBulan
```

Lifestyle is NOT considered essential — it counts as discretionary.

**Why dominance gate instead of strict priority:** The brief's strict-priority rule would lose the Judol demo moment (Judol = thin deficit of −1M, but 5M leak to "Top-up/Hobi Online" — the entire point of this persona). The reviewer flagged this as critical. The dominance gate keeps generic deficit copy for debt-driven deficits (Terjebak Cicilan: leak 1M < essentials 4.6M → deficit wins, correctly) but lets leak-driven deficits surface the leak (Judol: leak 5M > essentials 4M → bocor wins, correctly).

### 3.2 Input data (reuse only)

| Variable | Source | Notes |
|---|---|---|
| `surplus` | `derived.ts → surplusIdr` | income − totalPengeluaran (incl. cicilan) |
| `tabungan` | `max(0, surplus)` | derived inline, no new field |
| `lifestyle` | `snap.pengeluaran.lifestyle` | fixed category |
| `pokok` | `snap.pengeluaran.pokok` | fixed category |
| `biayaKos` | `snap.pengeluaran.biayaKos` | fixed category (budget-kos) |
| `pengeluaranLain[]` | `snap.pengeluaranLain` (array of `{ label, amount }`) | free-form labels |
| `cicilanTotal` | `sumCicilanPerBulan(snap)` from `lib/finance/metrics.ts` | existing helper |
| `runwayMonths` | `derived.ts → runway` | months at current burn |
| `runwayDays` | `round(runwayMonths × 30)` | derived inline |

### 3.3 Discretionary detection — keyword heuristic (revised)

```ts
// lib/finance/discretionary-keywords.ts
export const DISCRETIONARY_KEYWORDS = [
  'top-up', 'topup', 'top up',
  'hobi', 'judol', 'judi', 'slot',
  'game', 'gaming',
  'rokok', 'vape', 'boba', 'kopi',
  'club', 'nightlife',
  'streaming', 'subscription',
];

export function isDiscretionary(label: string): boolean {
  const lower = label.toLowerCase();
  return DISCRETIONARY_KEYWORDS.some(kw => lower.includes(kw));
}
```

**Removed from v1:** `online`, `belanja` — both substring-matched essentials ("Belanja Bulanan" = groceries, "Kursus Online" = education, "Belanja Online" mixed). Reviewer finding 🔴 #1.

**Verified safe:** "Top-up / Hobi Online" still matches (via `top-up` AND `hobi`), so the Judol case is preserved.

**Calculation:**
```ts
const diskresionerFromLain = pengeluaranLain
  .filter(row => isDiscretionary(row.label))
  .reduce((sum, row) => sum + row.amount, 0);

const diskresioner = lifestyle + diskresionerFromLain;
```

**Dominant category + `X_amount` (used for the "lari ke {kategori}" + `Rp{X}` copy slots):**

```ts
function pickNamedCategory(lifestyle, matchedLainRows) {
  const totalFromLain = matchedLainRows.reduce((s, r) => s + r.amount, 0);
  if (totalFromLain >= lifestyle) {
    // Pick the LARGEST single matched lain row
    const top = matchedLainRows.reduce((max, r) => r.amount > max.amount ? r : max);
    return { name: top.label, amount: top.amount };
  }
  return { name: 'Lifestyle', amount: lifestyle };
}
```

**Critical:** `X_amount` is the amount of the SINGLE named category, NOT the total diskresioner. This is what `{X}` substitutes in the copy. The feature is called *Insight Jujur* — the number must match the category named (round-3 reviewer fix).

Judol case: lifestyle 1M, matched lain `"Top-up / Hobi Online" 4M` → totalFromLain 4M ≥ lifestyle 1M → category = `"Top-up / Hobi Online"`, **X_amount = 4M** (not 5M).

Sultan case: lifestyle 10.5M, no matched lain → totalFromLain 0 < lifestyle 10.5M → category = `"Lifestyle"`, X_amount = 10.5M (matches total here because only one category exists).

**Keyword list scope notes** (reviewer-confirmed):
- `Sampingan` (income side) — not matched, correct.
- `paylater`, `cicilan` — NOT added; debt has its own treatment via DSR/DAR. Not a "discretionary leak."
- Future keyword additions = FLAG for review, do not add ad-hoc.

### 3.4 Tabungan guard

Bocor NORMAL case (§3.1 path 3) requires `tabungan > 0`. Bocor DOMINANT case (path 1) doesn't need this guard (tabungan = 0 is already implied by surplus < 0).

### 3.5 Y multiplier (tightened gate, named-category basis)

```ts
const Yactual = X_amount / tabungan;   // named-category amount, not total diskresioner
const Ydisplay = Math.round(Yactual);
```

**Gate:** `Yactual >= 2.0` (real value, not rounded). Avoids the `Y=1.5 → "2×"` overclaim (Mahasiswa Pas-pasan would otherwise fire with Y=1.5 misrepresented as 2×).

**Display:** `Ydisplay` is used for copy substitution (rounded for readability).

**Why named-category basis (round-3 fix):** The copy reads *"Rp{X} lari ke {kategori}. Itu {Y}× lebih besar dari yang kamu tabung."* — the "Itu" refers to the named amount. If `{X}` is named-category but Y uses total, the multiplier mis-represents the relationship. Keep them consistent.

### 3.6 Runway threshold

```
runwayDays < 30 → fire
```

Below 1 month = emergency. Reviewer-confirmed: keep 30. Personas with 60–90 days "thin but not urgent" fall through to the existing soft copy ("Surplus masih tipis").

`runwayDays === 0` (no liquid assets) → still fires, displays "0 hari".

### 3.7 Persona verification table (VERIFIED v3)

Computed precisely from `lib/fixtures/personas.ts` using:
- `calcTotalPengeluaran` formula (`lib/finance/metrics.ts:171`): `pokok + lifestyle + biayaKos + Σ pengeluaranLain + sumCicilanPerBulan`
- `sumCicilanPerBulan` (`metrics.ts:154`): `Σ cicilanAktif.cicilanPerBulan + Σ utangPribadi.cicilanPerBulan` (gadai NOT included)
- Diskresioner: `lifestyle + Σ pengeluaranLain.filter(isDiscretionary)` per §3.3
- Essential: `pokok + biayaKos + cicilanTotal`

| # | Persona | Income (M) | Expense (M) | Surplus (M) | Diskresioner (M) | Essential (M) | Predicted fire | Copy preview |
|---|---|---|---|---|---|---|---|---|
| 1 | Mahasiswa Pas-pasan | 2.3 | 2.1 | +0.2 | 0.3 (LS) | 1.8 | **Runway** (Y=1.5 fails gate; cashlike 0.5M ÷ 2.1M = 7.1 days) | "⏳ Kalau pemasukan berhenti, dana kamu cukup buat 7 hari." |
| 2 | Mahasiswa Mandiri | 3.0 | 2.3 | +0.7 | 0.4 (LS) | 1.9 | Silence (Y=0.57, runway 78d) | — |
| 3 | Mahasiswa Sultan | 15.0 | 14.0 | +1.0 | 10.5 (LS) | 3.5 | **Bocor normal** (Yactual=10.5 ≥ 2.0) | "🚰 Rp10.500.000 bulan ini lari ke Lifestyle. Itu 11× lebih besar dari yang kamu tabung." |
| 4 | **Korban Judol** | **8.0** | **9.0** | **−1.0** | **5.0** (LS 1 + Top-up/Hobi 4) | **4.0** (pokok 2.5 + cicilan 1.5) | **Bocor dominant** (5.0 > 4.0 ✓; X_amount = Top-up 4.0) | "🚰 Rp4.000.000 bulan ini lari ke Top-up / Hobi Online — itu yang bikin kamu nombok Rp1.000.000 tiap bulan." [§4.2] |
| 5 | Terjebak Cicilan | 4.0 | 5.6 | −1.6 | 1.0 (LS) | 4.6 (pokok 2.5 + cicilan 2.1) | **Defisit** (1.0 ≯ 4.6) | "💸 Tiap bulan kamu nombok Rp1.600.000. Pengeluaran lebih besar dari pemasukan." |
| 6 | Pegawai Muda+KPR | 8.8 | 6.75 | +2.05 | 1.2 (LS) | 5.55 (pokok 3.5 + cicilan 2.05) | Silence (Y=0.59, runway many months) | — |
| 7 | Freelancer Bebas Utang | 6.0 | 5.0 | +1.0 | 1.5 (LS) | 3.5 | Silence (Yactual=1.5 fails gate, runway many months) | — |
| 8 | Juragan Kos | 30.0 | 15.0 | +15.0 | 5.0 (LS) | 10.0 (pokok 5 + cicilan 5) | Silence (Y=0.33, runway many months) | — |
| 9 | Pensiunan Mapan | 25.0 | 12.0 | +13.0 | 4.0 (LS) | 8.0 | Silence (Y=0.31, runway many months) | — |
| 10 | Sultan Properti | 80.0 | 30.0 | +50.0 | 15.0 (LS) | 15.0 | Silence (Y=0.30, runway many months) | — |

**Coverage:** 4 fires (1 bocor-normal Sultan, 1 bocor-dominant Judol, 1 defisit Terjebak, 1 runway Pas-pasan) + 6 silence. Healthy demo variety.

**Critical proof:** The Judol persona has surplus **= −1.0M** (deficit by strict surplus). Diskresioner_total **= 5.0M** (lifestyle 1 + matched lain "Top-up / Hobi Online" 4). Essential **= 4.0M** (pokok 2.5 + cicilan 1.5). The bocor dominance gate `5.0 > 4.0` evaluates true → bocor-dominant fires, deficit is suppressed.

**Copy substitution (post round-3 `{X}` fix):** `{X}` = X_amount (named-category, NOT total). Named category for Judol = "Top-up / Hobi Online" (totalFromLain 4 ≥ lifestyle 1 → pick largest matched lain). X_amount = **4M** (not 5M). Causal claim *"itu yang bikin kamu nombok Rp1jt"* is accurate: removing the 4M Top-up leak alone turns −1M deficit into +3M surplus. **The Judol demo moment is preserved AND honest.**

**Notes:**
- LS = Lifestyle.
- "Top-up / Hobi Online" matches via `top-up` AND `hobi` (independent of the removed `online` keyword).
- All cicilan numbers include both `cicilanAktif` and `utangPribadi` per `sumCicilanPerBulan`. Pegawai Muda+KPR: KPR 1.5 + KK 0.3 + Pinjam-kakak 0.25 = 2.05M.
- Runway for Pas-pasan: cashlike = GoPay 150k + Dana 350k = 500k. Burn = 2.1M. (500k/2.1M)×30 = 7.14 → 7 days.
- §8.1 `test.each` table mirrors this exactly — any drift trips a regression test.

---

## 4. Copy templates

### 4.1 Locked from brief (no creative latitude)

| Signal | Template |
|---|---|
| **Defisit** | *"Tiap bulan kamu nombok Rp{X}. Pengeluaran lebih besar dari pemasukan."* |
| **Bocor (normal — surplus > 0)** | *"Rp{X} bulan ini lari ke {kategori}. Itu {Y}× lebih besar dari yang kamu tabung."* |
| **Runway kritis** | *"Kalau pemasukan berhenti, dana kamu cukup buat {Z} hari."* |

### 4.2 Bocor dominant copy variant — **LOCKED** ✅

> *"Rp{X} bulan ini lari ke {kategori} — itu yang bikin kamu nombok Rp{|surplus|} tiap bulan."*

**Why this works (reviewer reasoning, not just "shorter"):** *"itu yang bikin kamu nombok"* IS the insight. It's not just "you're in deficit" or "you spend on judol" — it draws the **causal link**: the leak is what causes the deficit. Without the 5M leak, Judol is +4M surplus. That causal claim is accurate and it's the gut-punch.

**On the "nombok" vocab repeating in the deficit copy:** non-issue. Defisit and bocor-dominant are mutually exclusive (they never appear on screen together). If anything it's a feature — the same word intuitively links leak → deficit.

**Worked example (Judol, post round-3 fix):** *"Rp4.000.000 bulan ini lari ke Top-up / Hobi Online — itu yang bikin kamu nombok Rp1.000.000 tiap bulan."*

`{X}` here = `4M` = the Top-up / Hobi Online row's amount specifically, NOT the 5M total diskresioner. The other 1M (Lifestyle) is a different category and is not named in this insight. Causal claim still holds and is more honest: leak 4M > deficit 1M → cut leak, gain +3M surplus.

### 4.3 Variable substitution

- `{X}` for **defisit** → `formatIdr(Math.abs(surplus))` (the nombok amount)
- `{X}` for **bocor (both normal and dominant)** → `formatIdr(X_amount)` where `X_amount` is the **named-category amount** per §3.3 (NOT total diskresioner — round-3 fix)
- `{kategori}` → resolved per §3.3 (name of the single dominant category)
- `{Y}` → `Math.round(Yactual)` where `Yactual = X_amount / tabungan` (named-category basis, §3.5)
- `{Z}` → `runwayDays`, integer
- `{|surplus|}` → `formatIdr(Math.abs(surplus))` (used in bocor-dominant copy §4.2)

### 4.4 Icon prefix

Each insight is prefixed with one emoji (icon role, not decoration):

| Signal | Emoji | Rationale |
|---|---|---|
| Defisit | 💸 | money leaving |
| Bocor (any variant) | 🚰 | leak |
| Runway | ⏳ | time running out |

The emoji is hardcoded in the component, not in the copy template (keeps the template as one clean sentence).

---

## 5. UI placement & visual treatment

### 5.1 Wealth-tracker (snapshot.vue)

- Mount: **below** `CashFlowSankey` (caption role — chart first, verdict below)
- Location: `components/dashboard/DashboardPanel.vue`, after the `<CashFlowSankey>` render block (line ~126)

```
┌─────────────────────────┐
│   Alur Kas              │
│   [Sankey chart]        │
└─────────────────────────┘
┌─────────────────────────┐
│ 🚰 Rp5jt lari ke         │  ← InsightJujur
│   Top-up / Hobi Online…  │
└─────────────────────────┘
```

### 5.2 Budget-kos (budget-kos.vue) — order locked

Reviewer-confirmed order:

```
1. Mini cashflow bar (lines ~324–340 / ~605–625)
2. InsightJujur (verdict on cashflow)
3. Savings projection card (forward-looking close)
```

Insight = verdict directly after the visual. Projection (forward-looking) closes the section.

### 5.3 Visual treatment

- **Single line card** — px-4 py-3, rounded-lg
- **Background:** subtle warning tint per signal:
  - Defisit / Bocor: `bg-rose-50` (light) / `bg-rose-950/30` (dark) — serious but not loud
  - Runway kritis: `bg-amber-50` / `bg-amber-950/30` — amber, distinct from red
- **Text:** `text-rose-900` / `text-amber-900` (light), `text-rose-100` / `text-amber-100` (dark)
- **Typography:** `text-sm font-medium leading-snug` — numbers `font-semibold`
- **Layout:** emoji + sentence in one row, emoji size `text-base`, no left/right borders
- **No entry animation** — existing card animation (fade-slide-up) is enough. Insight renders as part of normal flow, no special motion.

### 5.4 CONDITIONAL model — suppression matrix (replaces v1 ADD model)

Reviewer finding 🟠 #3: ADD model stacks 3 deficit warnings for a deficit persona — noise, not punch. Switch to CONDITIONAL.

**Rule:** when `InsightJujur` fires (any variant), suppress overlapping existing copy. When silent, existing copy renders normally.

**Suppression matrix (v3 — audited against source, Q-NEW-3 resolved):**

| When fires | File / line | Existing copy | Action |
|---|---|---|---|
| Defisit OR Bocor dominant | `components/dashboard/CermatScoreHero.vue:117` | `"· Hati-hati Defisit"` suffix | Hide suffix (gate `v-if="!insightJujurFires"`) |
| Defisit OR Bocor dominant | `components/layout/DashboardSummary.vue:93` | `"Defisit bulanan"` (surplusStatus) | Hide row (gate on insight fire) |
| Bocor normal (surplus > 0) | `components/layout/DashboardSummary.vue:92` | `"Keuangan kamu sehat"` (surplusStatus) | Hide row — tone-clash if "sehat" while flagging a leak |
| Any fire when `surplus === 0` (edge) | `components/layout/DashboardSummary.vue:94` | `"Mepet — pas-pasan"` | Hide row — edge case, consistent suppression |
| Defisit OR Bocor dominant | `pages/app/budget-kos.vue:319` | `"Surplus minus — utang bisa membesar tiap bulan."` (savings projection deficit variant) | Hide deficit-tone variant of projection card |
| Bocor normal (surplus > 0) | `pages/app/budget-kos.vue:314` | `"Surplus masih tipis — fokus naikin dulu sebelum mikir target."` | Hide thin-tone projection card |
| Runway | (no direct overlap currently) | — | No suppression needed |

**CermatScoreHero audit (Q-NEW-3):** grep'd the file for all subtitle/tone variants. Only `:117` "Hati-hati Defisit" is competing copy. `:119–121` (`level.subtitle`) is tier-descriptive (e.g. "Bibit, masih awal") — not an insight headline, no clash. The contribution breakdown (zone dots + metric labels) is a detail layer, not narrative.

**Sankey carve-out:** `components/dashboard/CashFlowSankey.vue:169,206,214` uses "Defisit" as a chart node label — part of the visualization, NOT competing narrative copy. Leave alone.

**Non-suppressed (always rendered regardless of fire):**
- Action bridge card (`pages/app/budget-kos.vue:708–717`)
- Rent ratio advisory (`pages/app/budget-kos.vue:795–803`)
- All onTrack / achieved variants of the projection card
- The Sankey chart itself + its node labels
- Score number, level name, contribution breakdown on CermatScoreHero

**Implementation hint:** compose a `useInsightJujur()` consumer at the Ringkasan page level, expose `insightFires` + `insightKind` reactive, pass down as a prop or via provide/inject to the components above so they can gate their respective copy.

**Constraint:** suppression touches 3 files outside the new component (CermatScoreHero, DashboardSummary, budget-kos page). No scoring engine, no metric file, no persona fixture.

### 5.5 Empty / silence state

If no signal fires (healthy state), `InsightJujur` **does not render** at all (`v-if`). No "Kondisi sehat ✅" placeholder — silence = success. Existing copy takes over (suppression OFF).

---

## 6. Architecture

### 6.1 File map

| File | Type | Purpose |
|---|---|---|
| `lib/finance/insight-jujur.ts` | new | Pure resolver: `resolveInsight(input) → Insight \| null` |
| `lib/finance/discretionary-keywords.ts` | new | Keyword list + `isDiscretionary(label)` predicate |
| `composables/useInsightJujur.ts` | new | Store adapter: derived + snap → calls resolver |
| `components/dashboard/InsightJujur.vue` | new | Presentational — props: `insight: Insight \| null` |
| `components/dashboard/DashboardPanel.vue` | edit | Mount `<InsightJujur>` after `<CashFlowSankey>` |
| `components/dashboard/CermatScoreHero.vue` | edit | Add suppression gate on `:117` deficit suffix (§5.4) |
| `components/layout/DashboardSummary.vue` | edit | Add suppression gate on `surplusStatus` row (§5.4) |
| `pages/app/budget-kos.vue` | edit | Mount `<InsightJujur>` after cashflow bar + suppression gates on projection card variants (§5.4) |
| `tests/finance/insight-jujur.test.ts` | new | Resolver tests — see §8 |
| `tests/finance/discretionary-keywords.test.ts` | new | Keyword predicate edge cases |
| `tests/components/InsightJujur.test.ts` | new | Copy rendering tests |

### 6.2 Composable shape

```ts
export type InsightKind = 'defisit' | 'bocor-normal' | 'bocor-dominant' | 'runway';

export interface InsightJujur {
  kind: InsightKind;
  emoji: string;
  copy: string;       // pre-formatted, ready to render
  tone: 'rose' | 'amber';
}

export function useInsightJujur(): {
  insight: ComputedRef<InsightJujur | null>;
  fires: ComputedRef<boolean>;
};
```

`fires` is exposed separately so other components can use it for gating (CermatScoreHero, DashboardSummary, budget-kos projection card).

### 6.3 Pure resolver (testable)

```ts
// lib/finance/insight-jujur.ts
export interface ResolverInput {
  income: number;
  surplus: number;
  pokok: number;
  biayaKos: number;
  lifestyle: number;
  pengeluaranLain: Array<{ label: string; amount: number }>;
  cicilanTotal: number;
  runwayDays: number;
}

export function resolveInsight(input: ResolverInput): InsightJujur | null
```

The resolver is pure — no Pinia/Nuxt context. The composable is just an adapter.

**Internal pipeline (post round-3 `{X}` fix):**

```
1. Compute essential_total = pokok + biayaKos + cicilanTotal
2. Compute discretionary breakdown via pickNamedCategory(lifestyle, matched_lain):
   → returns { name, amount } = { kategori, X_amount }
3. Compute diskresioner_total = lifestyle + Σ matched_lain (for gate only)
4. Apply priority logic §3.1:
   - Bocor dominant: surplus < 0 AND diskresioner_total > essential_total
     Render copy §4.2 with X = X_amount
   - Defisit: surplus < 0
     Render copy §4.1 with X = |surplus|
   - Bocor normal: surplus > 0 AND X_amount > tabungan AND (X_amount / tabungan) >= 2.0
     Render copy §4.1 with X = X_amount, Y = round(X_amount / tabungan)
   - Runway: runwayDays < 30
     Render copy §4.1 with Z = runwayDays
   - Else: return null
```

---

## 7. Reuse map

| Existing | Reused for | Modified? |
|---|---|---|
| `stores/derived.ts → surplusIdr, runway` | input signal | ❌ no |
| `snap.pengeluaran.lifestyle, .pokok, .biayaKos` | discretionary + essential | ❌ no |
| `snap.pengeluaranLain` | discretionary lain | ❌ no |
| `lib/finance/metrics.ts → sumCicilanPerBulan` | essential_total | ❌ no |
| `lib/format/idr.ts → formatIdr` | copy substitution | ❌ no |
| `lib/finance/thresholds.ts` | NOT used (custom threshold in §3.6) | ❌ no |
| `lib/finance/cermat-score.ts` | NOT touched | ❌ no |
| `lib/fixtures/personas.ts` | NOT touched | ❌ no |
| `composables/useShare.ts` | NOT touched | ❌ no |
| `components/dashboard/CermatScoreHero.vue` | suppression gate only (1 v-if on `:117`) | ⚠️ minor edit |
| `components/layout/DashboardSummary.vue` | suppression gate on `surplusStatus` row | ⚠️ minor edit |
| `pages/app/budget-kos.vue` | mount + 2 suppression gates | ⚠️ edit |

---

## 8. Test scope

### 8.1 Resolver unit tests (`tests/finance/insight-jujur.test.ts`)

**Priority order (revised dominance gate):**
- Bocor dominant fires when surplus < 0 AND leak > essentials (Judol-shape input)
- Defisit fires when surplus < 0 AND leak ≤ essentials (Terjebak Cicilan-shape input)
- Bocor normal fires when surplus > 0 AND diskresioner > tabungan AND Yactual >= 2.0
- Runway fires when no defisit/bocor AND runwayDays < 30
- All silent → returns null

**Y gate boundary:**
- Yactual = 1.99 → does NOT fire
- Yactual = 2.0 → fires, display Y = 2
- Yactual = 1.5 → does NOT fire (Pas-pasan, Freelancer regression guard)

**Keyword detection:**
- `"Top-up / Hobi Online"` → matched (via `top-up` + `hobi`)
- `"Belanja Bulanan"` → NOT matched (regression guard, was a v1 bug)
- `"Kursus Online"` → NOT matched (regression guard)
- `"Belanja Online"` → NOT matched (intentional — `online` substring removed)
- `"TOP-UP MOBA"` → matched (case insensitive)
- `"Cicilan Mobil"` → not matched
- `"Pinjaman Paylater"` → not matched (debt, not discretionary)

**Dominant category:**
- lifestyle 1M + pengeluaranLain "Top-up" 4M → category = "Top-up / Hobi Online" (largest match)
- lifestyle 5M + pengeluaranLain "Hobi" 1M → category = "Lifestyle" (lifestyle dominates)
- multiple matched rows — pick the largest

**Edge cases:**
- runway = 0 → fires "0 hari"
- runway = 29.9 → fires "30 hari"
- runway = 30.1 → does NOT fire
- diskresioner = tabungan × exactly 2.0 → fires (gate closes at 2.0)
- bocor-dominant requires leak > essentials (strict greater than)

**Persona walkthrough (snapshot-driven tests):**

Bind to the actual `PERSONAS` exported from `lib/fixtures/personas.ts`. Each persona runs through the resolver, asserts the predicted fire per the §3.7 table AND the correct `{X}` substitution:

```ts
test.each([
  ['mahasiswa-pas-pasan', 'runway', null],
  ['mahasiswa-mandiri', null, null],
  ['mahasiswa-sultan', 'bocor-normal', 'Rp10.500.000'],   // X_amount = Lifestyle 10.5M
  ['korban-judol', 'bocor-dominant', 'Rp4.000.000'],      // X_amount = Top-up 4M (NOT 5M)
  ['terjebak-cicilan', 'defisit', 'Rp1.600.000'],         // X = |surplus|
  ['pegawai-muda-kpr', null, null],
  ['freelancer-bebas-utang', null, null],
  ['juragan-kos', null, null],
  ['pensiunan-mapan', null, null],
  ['sultan-properti', null, null],
])('persona %s fires %s with X=%s', (id, expectedKind, expectedX) => { ... });
```

**🔴 CRITICAL TEST ORDER (round-3 reviewer warning):** This persona test must be written AFTER the resolver's `{X}` logic is implemented per §3.3 + §4.3 (X_amount = named-category amount, NOT total diskresioner). If the test is written before the fix lands, it would assert `Rp5.000.000` for Judol — locking the bug in as "truth." Resolver fix → THEN test → green = actually proven.

This is the test that fails if the §3.7 table drifts from reality. Critical regression guard — the reviewer's lock condition #2.

**`{X}` substitution boundary tests (`X_amount` semantics):**

- Judol-shape input (lifestyle 1M + matched lain "Top-up" 4M, surplus −1M): X_amount = 4M (the Top-up row), NOT 5M (total). Category = "Top-up / Hobi Online".
- Sultan-shape (lifestyle 10.5M only, surplus +1M): X_amount = 10.5M (= lifestyle). Category = "Lifestyle".
- Tie-shape (lifestyle 2M + matched lain "Top-up" 2M, surplus +0.5M): totalFromLain 2 ≥ lifestyle 2 → category = "Top-up", X_amount = 2M (NOT 4M total).
- Multi-matched lain (lifestyle 1M + "Top-up" 3M + "Boba" 2M, surplus +1M): largest matched = Top-up 3M → X_amount = 3M, category = "Top-up".

### 8.2 Component tests (`tests/components/InsightJujur.test.ts`)

- Renders nothing when `insight === null`
- Defisit copy: includes formatted IDR + literal "Pengeluaran lebih besar dari pemasukan."
- Bocor normal: includes Y×, kategori, "yang kamu tabung"
- Bocor dominant: includes kategori + `X_amount` formatted (NOT total diskresioner) + "itu yang bikin kamu nombok" + `|surplus|` formatted + "tiap bulan" tail. Specifically for Judol-shape input: copy contains "Rp4.000.000" and "Rp1.000.000", does NOT contain "Rp5.000.000".
- Runway: includes day count
- Tone class: rose for defisit/bocor, amber for runway
- Emoji prefix matches kind

### 8.3 No regression

- `tests/finance/persona.test.ts` still passes (persona resolution unchanged)
- `tests/finance/cermat-score.test.ts` still passes (score engine unchanged)
- `tests/finance/metrics.test.ts` still passes
- Existing copy suppression: snapshot test on the budget-kos page if available (verify "Surplus masih tipis" is hidden when bocor-normal fires)

---

## 9. Effort estimate (revised)

| Task | v1 est | v2 est | Δ reason |
|---|---|---|---|
| Resolver + keyword module + tests | 3–4 h | 4–5 h | + dominance gate logic + Y tightening tests |
| `InsightJujur.vue` + styling | 2 h | 2 h | unchanged |
| Mount on 2 Ringkasan pages + composable wiring | 1 h | 1.5 h | + `fires` consumer wiring |
| **Suppression gates on existing copy** | — | 1.5 h | NEW (CermatScoreHero + DashboardSummary + budget-kos projection card variants) |
| Resolver unit tests + component tests | 3 h | 4 h | + persona walkthrough table + keyword regression + Y boundary |
| Manual QA across 10 personas | 1 h | 1.5 h | + verify §3.7 table matches reality |
| **Total** | **~10 h** | **~14 h** | ~1.5–2 days of work |

---

## 10. Resolved questions

**Round 1 (v1 → v2):**
- ✅ Tone audit (ADD vs CONDITIONAL) → CONDITIONAL adopted (§5.4)
- ✅ Keyword scope → `online`/`belanja` removed; no paylater/cicilan (§3.3)
- ✅ Runway 30 days threshold → keep
- ✅ Bocor Y minimum → keep 2× but tighten to `Yactual >= 2.0` real value (§3.5)
- ✅ Budget-kos placement → bar → InsightJujur → projection (§5.2)

**Round 2 (v2 → v3 LOCK):**
- ✅ **Q-NEW-1:** Bocor dominant copy → **Option A LOCKED** with reviewer's exact wording incl. the `tiap bulan` tail (§4.2). Reasoning: "itu yang bikin kamu nombok" IS the insight — the causal link from leak → deficit is the gut-punch.
- ✅ **Q-NEW-2:** Dominance gate margin → **REJECTED**, keep strict `leak > essential_total`. A 1.2× margin would endanger Judol if real essentials grow to 4.17M (Judol leak 5 vs threshold 5.04 → falls to deficit, demo lost). The margin solves a false-positive problem that doesn't exist in current data (Terjebak Cicilan: leak 1 vs essentials 4.6 — nowhere near). The persona test §8.1 is the real guard, not a margin.
- ✅ **Q-NEW-3:** Suppression matrix audit → **expanded** to include `DashboardSummary.vue:91–95` (all 3 surplusStatus variants). CermatScoreHero grep'd; only `:117` is competing copy. Sankey's "Defisit" node is a chart label, leave alone. See §5.4 v3 matrix.
- ✅ **Q-NEW-4:** Mahasiswa Pas-pasan Runway 7 hari → **CONFIRMED** by reviewer. Sharper than thin bocor; positive side effect of Y tightening. Keep.

**Housekeeping (carry-over from 7.1, noted by reviewer):**
- ⚪ `.review/spike-capture-day1/` artifact still pending. Not a 7.2 blocker but worth resolving before merge to main.

**Lock conditions met (per the round-2 verdict):**
1. ✅ Option A locked into §4.2 with the reviewer's exact wording
2. ✅ §3.7 persona numbers verified from `calcTotalPengeluaran` + `sumCicilanPerBulan` applied to actual fixtures. Judol bocor-dominant proven: leak 5.0M > essentials 4.0M with exact inputs (income 8M, expense 9M = surplus −1M; diskresioner = lifestyle 1 + "Top-up/Hobi Online" 4 = 5M; essential = pokok 2.5 + cicilan 1.5 = 4M).
3. ✅ CermatScoreHero variant list produced (`:117` only competing line; `:119–121` is tier subtitle, no clash). DashboardSummary `surplusStatus` added to the matrix.

**Round 3 (v3 → v4):**
- ✅ **Round-3 finding 🔴:** `{X}` for bocor copy = named-category amount, NOT total diskresioner. Applied to §3.3 (`X_amount` derivation), §3.5 (Y also uses `X_amount`), §4.3 (substitution rules), §3.7 (Judol preview Rp5M → Rp4M), §4.2 (worked example), §8.1 (persona test must assert Rp4M, not Rp5M).
- 🔴 **Build order enforcement:** §8.1 test must be written AFTER the resolver's `{X}` logic is fixed. Writing the test first would assert the wrong number and lock the bug in as "truth."

**Verdict: 🟢 LOCKED v4. Ready for implementation.**

---

## 11. References

- Brief from neighbor-AI: `.review/ide-ai-tetangga-phase-7.2.md`
- Round-1 feedback: `.review/feedback-ai-tetangga-phase-7.2-1.md`
- Round-2 feedback: `.review/feedback-ai-tetangga-phase-7.2-2.md`
- Round-3 feedback (`{X}` semantic fix): `.review/feedback-ai-tetangga-phase-7.2-3.md`
- Phase 7.1 spec (precedent for privacy-pure, 3-layer pattern): `./phase-7.1-spec.md`
- Persona fixtures: `lib/fixtures/personas.ts`
- Derived store: `stores/derived.ts`
- `calcTotalPengeluaran` definition (incl. cicilan): `lib/finance/metrics.ts:171`
- Existing insight copy (subjects of §5.4 suppression):
  - `pages/app/budget-kos.vue:314` — *"Surplus masih tipis — fokus naikin dulu sebelum mikir target."*
  - `pages/app/budget-kos.vue:319` — *"Surplus minus — utang bisa membesar tiap bulan."*
  - `components/dashboard/CermatScoreHero.vue:117` — *"· Hati-hati Defisit"*
  - `components/layout/DashboardSummary.vue:91–95` — `surplusStatus` (3 variants)

---

**Next step:** Spec LOCKED v4. Ready for implementation on branch `insight-jujur-phase-7.2`. **Strict build order (do not reorder):**

1. `lib/finance/discretionary-keywords.ts` + tests (keyword predicate, regression guards for "Belanja Bulanan"/"Kursus Online" non-match)
2. `lib/finance/insight-jujur.ts` resolver — implement `pickNamedCategory` returning `{ name, amount }` FIRST. `X_amount = picked.amount`. NEVER use `diskresioner_total` for `{X}` substitution.
3. `tests/finance/insight-jujur.test.ts` persona walkthrough — assert Judol = `bocor-dominant` with `Rp4.000.000` substring (NOT `Rp5.000.000`). Test must turn green naturally; if it fails with "expected 4M got 5M", the resolver still has the round-3 bug — fix the resolver, not the test.
4. `composables/useInsightJujur.ts` adapter
5. `components/dashboard/InsightJujur.vue`
6. Mount + suppression gates (DashboardPanel, CermatScoreHero, DashboardSummary, budget-kos)
7. Manual QA across all 10 personas — visual check: Judol screen shows `Rp4jt`, not `Rp5jt`.
