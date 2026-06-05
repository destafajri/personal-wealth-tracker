# Tech Plan: Priority 1 — Persona & Gamification

**Status:** DRAFT v2 — codex-reviewed, findings addressed
**Date:** 2026-06-05
**Prerequisite:** Codex-reviewed Phase 3 docs (commit `7204413`)

---

## Goal

Create a deterministic persona system that assigns a financial "identity" to users based on their snapshot data. This is the most impactful feature for the Mamikos Vibe Coding Contest.

---

## 1. Interfaces / Types

### Domain layer — `lib/finance/persona.ts`

The resolver returns **semantic data only**. No UI strings, no Tailwind classes, no emoji. Single source of truth for persona identity.

```typescript
// lib/finance/persona.ts

export type PersonaKey =
  | 'sultanKos'
  | 'investorKos'
  | 'anakKosBijak'
  | 'pejuangAkhirBulan'
  | 'sobatIndomie'

export type PersonaTone = 'celebration' | 'positive' | 'nudge' | 'empathy' | 'humor'

export interface PersonaResult {
  key: PersonaKey
  tone: PersonaTone   // semantic tone only — UI layer maps this to colors/styles
}

export interface PersonaInput {
  savingsRate: number | null   // from derived store (read-only)
  runway: number | null        // from derived store (read-only)
  hasInvestments: boolean      // computed from snapshot (read-only)
  isSnapshotReady: boolean     // true when minimum viable snapshot exists
}
```

### Presentation layer — `components/dashboard/PersonaCard.vue`

All display strings (label, tagline, emoji) come from `lib/copy/strings.ts`. All visual styling (gradient, colors) lives in a `PERSONA_STYLE_MAP` constant inside the component. The resolver does NOT own these.

---

## 2. Logic Flow

### resolvePersona() — pure function, read-only

```typescript
function resolvePersona(input: PersonaInput): PersonaResult | null
```

**Snapshot readiness guard** (stricter than v1):
```
isSnapshotReady = penghasilan > 0 && pengeluaran > 0
```

Both income AND expense must be filled. This prevents persona assignment from accidental/partial input (e.g., user types income but hasn't reached expenses yet). Values come from `stores/derived.ts` computed properties (`penghasilanMonthlyIdr`, `totalPengeluaran`).

**Rules — deterministic, first match wins:**
```
// Guard: not ready = no persona
if (!input.isSnapshotReady) return null

Rule 1: savingsRate >= 40 && hasInvestments        → { key: 'sultanKos',      tone: 'celebration' }
Rule 2: hasInvestments && savingsRate >= 0          → { key: 'investorKos',    tone: 'positive' }
Rule 3: savingsRate >= 15                           → { key: 'anakKosBijak',   tone: 'nudge' }
Rule 4: runway < 1 (month)                          → { key: 'pejuangAkhirBulan', tone: 'empathy' }
Rule 5: fallback (savingsRate < 15, no investments) → { key: 'sobatIndomie',   tone: 'humor' }
```

**Intended precedence (why this ordering):**
- Rule 1 before Rule 2: Someone with both high savings AND investments gets the "top tier" label, not the generic investor label.
- Rule 3 before Rule 4: A user with 15%+ savings rate but <1 month runway likely just started tracking — "Bijak" is more encouraging than "Pejuang" for their first impression.
- Rule 4 before fallback: Low runway is urgent regardless of savings rate — catch it before defaulting to Sobat Indomie.
- Rule 5 is always last: If nothing else matches, this is the relatable default.

### hasInvestments — helper (NOT a new metric)

```
hasInvestments = snapshot.saham.length > 0
              || snapshot.crypto.length > 0
              || sum of deposito rows > 0
              || sum of reksaDana rows > 0
```

Emas (gold) is deliberately excluded — anak kos often inherit/receive gold as gifts, which doesn't indicate active investment behavior.

---

## 3. Persona Visual Map (presentation layer only)

Owned by `PersonaCard.vue`, not by the resolver.

| Persona | Gradient Classes | Emoji | Tone |
|---------|-----------------|-------|------|
| sultanKos | `from-amber-400 to-yellow-500` | 👑 | celebration |
| investorKos | `from-emerald-400 to-teal-500` | 📈 | positive |
| anakKosBijak | `from-blue-400 to-indigo-500` | 👍 | nudge |
| pejuangAkhirBulan | `from-rose-400 to-pink-500` | 🔥 | empathy |
| sobatIndomie | `from-orange-400 to-amber-500` | 🍜 | humor |

---

## 4. Component Architecture

### PersonaCard.vue

**Location:** `components/dashboard/PersonaCard.vue`
**Props:** none — reads directly from derived + snapshot stores

### Exact mount point

In `components/layout/DashboardPanel.vue`, insert **between `HeroPair` and the SurplusGauge/EmergencyFund row**:

```vue
<!-- Current structure -->
<section class="flex flex-col gap-5 p-3">
  <HeroPair />
  <!-- >>> INSERT PersonaCard HERE <<< -->
  <div class="grid gap-4 sm:grid-cols-2">
    <SurplusGauge />
    <EmergencyFundMeter />
  </div>
  <MetricGrid />
  ...
</section>
```

Why this position: persona is the first thing the user sees after the hero summary — it's a "reward" for filling in data, placed before the detailed metrics.

### Card skeleton

```
┌──────────────────────────────────────────┐
│  👑  Sultan Kos                          │
│  "Gaji mewah, investasi jalan, top!"     │
│                                          │
│  ┌──────────┐ ┌──────────┐               │
│  │ Sisa Uang│ │ Bertahan │               │
│  │ 45%      │ │ 8 bulan  │               │
│  └──────────┘ └──────────┘               │
└──────────────────────────────────────────┘
```

- Reads `derived.savingsRate`, `derived.runway`
- Calls `resolvePersona()` as a computed property
- Re-renders automatically when snapshot updates
- `v-if="persona"` — hidden when snapshot not ready
- **No netWorth in stats row** — privacy-safe, only ratios/percentages
- **No share button** — completely absent (not even a placeholder). Share Card is Priority 4 and will be added then. No broken/placeholder UI in contest build.

---

## 5. Copy Registry

Persona labels and taglines in `lib/copy/strings.ts` under a `persona` namespace:

```typescript
persona: {
  sultanKos: { label: 'Sultan Kos', tagline: 'Gaji mewah, investasi jalan, top!' },
  investorKos: { label: 'Investor Kos', tagline: 'Sudah mulai investasi, masa depan cerah!' },
  anakKosBijak: { label: 'Anak Kos Bijak', tagline: 'Disiplin ngatur keuangan, Respect!' },
  pejuangAkhirBulan: { label: 'Pejuang Akhir Bulan', tagline: 'Tahan dulu, ada tips buat kamu!' },
  sobatIndomie: { label: 'Sobat Indomie', tagline: 'Hemat itu pilihan, tapi yang penting happy!' },
  stats: {
    savingsRate: 'Sisa Uang/Bulan',
    runway: 'Bisa Bertahan',
  },
}
```

Single source of truth: `PersonaResult.key` is used to look up copy from this registry. The resolver never contains display strings.

---

## 6. Execution Steps

| # | Action | File | Detail |
|---|--------|------|--------|
| 1 | **Create** persona types + logic | `lib/finance/persona.ts` | `PersonaKey`, `PersonaResult`, `PersonaInput`, `PersonaTone`, `resolvePersona()`, `hasInvestments()`, `isSnapshotReady()` |
| 2 | **Append** persona copy | `lib/copy/strings.ts` | Add `persona.*` entries for all 5 personas + stat labels |
| 3 | **Create** PersonaCard component | `components/dashboard/PersonaCard.vue` | Gradient card + 2 stats row (savingsRate %, runway months) + `PERSONA_STYLE_MAP` |
| 4 | **Mount** PersonaCard | `components/layout/DashboardPanel.vue` | Insert between `<HeroPair />` and the SurplusGauge/EmergencyFund grid |
| 5 | **Create** unit tests | `tests/finance/persona.test.ts` | Test all 5 personas + fallback + null (not ready) + edge cases (negative savingsRate, null values) |
| 6 | **Verify** typecheck + tests | `vue-tsc --noEmit` + `vitest run` | Zero regressions |

---

## 7. Preservation Boundary

### Files NOT touched
- `lib/finance/metrics.ts` ❌
- `lib/finance/emas.ts` ❌
- `lib/finance/thresholds.ts` ❌
- `stores/derived.ts` ❌
- `stores/snapshot.ts` ❌

### Files modified (append/insert only)
- `lib/copy/strings.ts` — append persona copy namespace
- `components/layout/DashboardPanel.vue` — insert one `<PersonaCard />` line

### Files created (new)
- `lib/finance/persona.ts`
- `components/dashboard/PersonaCard.vue`
- `tests/finance/persona.test.ts`

---

## 8. Open Questions for Reviewers

1. **Persona thresholds** — Are the cutoff values reasonable? (40% for Sultan, 15% for Bijak, runway <1 month for Pejuang)
2. **`hasInvestments` definition** — Emas excluded (gold is often inherited/gifted for anak kos). Agree?
3. **Snapshot readiness** — Requiring both `penghasilan > 0 && pengeluaran > 0` before showing persona. Too strict or just right?
4. **Stats row** — Only 2 stats (savingsRate %, runway months), no netWorth. Privacy-safe. Want more?
