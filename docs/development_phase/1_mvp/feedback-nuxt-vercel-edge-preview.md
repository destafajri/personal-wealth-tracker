---
name: feedback-nuxt-vercel-edge-preview
description: "Nuxt vercel-edge preset doesn't support `nuxt preview`; need a different preset (node-server / static) or deploy to verify production Lighthouse scores"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 2cc03fc4-4431-4dd3-a0d8-29cb920cd7a0
---

`pnpm preview` (alias for `nuxt preview`) fails with **"Preview is not supported for this build"** when `nitro.preset: 'vercel-edge'` is set in `nuxt.config.ts`. The vercel-edge preset outputs an edge function (`.vercel/output/functions/__fallback.func/index.mjs`) that needs the Vercel Edge runtime to execute — no local-equivalent runtime ships with Nuxt.

**Why:** Hit this on 2026-06-03 during D11.6 Lighthouse work. Wanted to measure Performance score against the production build locally; dev-mode Lighthouse hit 49 (FCP 9.3s, unminified, no gzip) which is unrepresentative. Couldn't switch presets temporarily without disrupting the actual Cermat production setup.

**How to apply:**
- Don't promise local Lighthouse runs against production builds when the project ships on vercel-edge — say up front that the verification step needs Vercel deploy.
- If a Lighthouse measurement is genuinely blocking, options are:
  - Temporarily set `nitro.preset: 'node-server'` (or `'static'` if all routes are pre-renderable), build, run `nuxt preview`, measure, revert. Note: results will differ from edge runtime.
  - Push to Vercel preview and run Lighthouse from Chrome DevTools or `npx lighthouse <preview-url>`.
  - Use Vercel's built-in [Speed Insights](https://vercel.com/docs/speed-insights) which captures real-user Lighthouse-style data after deploy.
- For Cermat specifically: dev-mode Lighthouse is fine as a *direction* check ("did my bundle change make it worse?"), but never as an absolute score reading.

Related: [[project-cermat-state]] documents that D11.6 Lighthouse measurement is deferred to the first Vercel deploy.
