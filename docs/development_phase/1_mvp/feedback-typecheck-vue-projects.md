---
name: feedback-typecheck-vue-projects
description: "Di project Vue/Nuxt: 'typecheck clean' = vue-tsc clean, bukan tsc. tsc skip setup blocks + templates jadi miss type error di .vue file."
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 8d6c6ef9-9443-4497-9945-8762c73b2594
---

Saat verify typecheck di project Vue/Nuxt, **HARUS pakai `vue-tsc --noEmit`**, bukan `tsc --noEmit`. tsc tidak proses Vue setup blocks & templates → loloskan type error nyata di `.vue` file (misal helper signature gak match `useRoute().query` shape).

**Why:** 2026-06-03 Cermat demo seed feature — aku claim "tsc --noEmit clean" 2x di hand-off checklist. Vue-tsc justru flag `RouteLocationNormalizedLoadedGeneric` not assignable to my custom `DemoRouteLike` shape (LocationQuery's array branch boleh `(string|null)[]`, punyaku cuma `string[]`). User ketangkep dari IDE diagnostic; harus push fix commit terpisah (`d70160d`).

**How to apply:**
- Default verify command di project Vue: `npx vue-tsc --noEmit` (atau `pnpm exec vue-tsc --noEmit`). Bukan `tsc`.
- Kalau project pakai Nuxt + ada script `typecheck`, prefer `pnpm typecheck` / `nuxi typecheck`
- Kalau klaim "typecheck clean" di handoff/commit body, pastikan command yg dijalanin **vue-tsc**
- Trigger word: "typecheck clean" pada Vue project tanpa run vue-tsc dulu = potential overclaim

Related: [[feedback-no-overclaim-checklist]] [[project-cermat-state]]
