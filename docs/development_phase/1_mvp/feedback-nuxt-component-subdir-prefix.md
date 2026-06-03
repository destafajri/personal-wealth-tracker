---
name: feedback-nuxt-component-subdir-prefix
description: Nuxt auto-imports prefix components in subdirs (components/layout/X.vue → LayoutX); bare name silently fails — explicit import is the safer default in layouts
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 2cc03fc4-4431-4dd3-a0d8-29cb920cd7a0
---

In Nuxt, components in subdirectories under `components/` are auto-imported with the **subdirectory name prefixed**:

- `components/Foo.vue` → `<Foo />` ✅
- `components/layout/FooterDisclaimer.vue` → `<LayoutFooterDisclaimer />` ✅
- `components/layout/FooterDisclaimer.vue` → `<FooterDisclaimer />` ❌ silently fails with `[Vue warn]: Failed to resolve component`

**Why:** This bit us on 2026-06-03 in Cermat. `layouts/default.vue` used `<FooterDisclaimer />` (Day 1 commit `e6ef514`), so the footer was silently missing from the landing the entire MVP build. Caught only when D10 landing-polish work prompted a curl smoke that surfaced the SSR warn. Fixed in `d578aff` by mirroring `layouts/app.vue`'s explicit import: `import FooterDisclaimer from '~/components/layout/FooterDisclaimer.vue'`.

**How to apply:**
- In **layouts** (which fewer tests touch than pages do), prefer an explicit `import` for components living in `components/<subdir>/` — it's failure-loud at build, not silent at SSR.
- When refactoring a component into a subdir, grep for bare `<ComponentName />` usages across `layouts/`, `pages/`, and other components before assuming auto-import will pick it up.
- When investigating "this rendered last week, why is it missing now," check Vue SSR warns in the dev server log — they appear in the rendered HTML inside the Nuxt logs script tag too.
- If you want unprefixed auto-imports across the board, set `components: [{ path: '~/components', pathPrefix: false }]` in `nuxt.config.ts` — but Cermat deliberately kept the prefix to avoid component name collisions across `dashboard/`, `snapshot/`, `simulator/` namespaces.

Related: [[feedback-no-overclaim-checklist]] — "footer renders" is a status claim worth verifying against curl output, not assumed from the layout template.
