# Phase 4: Dark Mode + Polish + Gold Price Fix

**Priority:** MEDIUM
**Prerequisite:** Phase 3 complete

---

## Scope

### 4.1 Dark Mode
- Implement dark mode theme
- Light/dark toggle in settings or nav
- Dark mode color tokens in `@theme` Tailwind
- Great for demo/presentation to judges

### 4.2 Visual Polish
- Final polish on all judge-facing screens (landing, snapshot, result)
- Micro-interactions & transitions
- Responsive check

### 4.3 Gold Price
- Fix Pegadaian fetch that frequently fails (403 from Vercel)
- Fallback to PAXG price if Pegadaian is down
- Info badge about which price source is being used
- Multiple source fallback (Pegadaian → PAXG → manual input)
- Historical price chart (nice-to-have)

---

## Out of Scope
- Bilingual (EN/ID) — Mamikos target market is very local
- Multi-currency overview — anak kos rarely have multi-currency portfolios

---

## Success Criteria
- [ ] Dark mode toggle works smoothly without flash
- [ ] All screens polished
- [ ] Gold price fetch reliable (Pegadaian + PAXG fallback)
