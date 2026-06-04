<script setup lang="ts">
import { Compass, FileText, Sparkles, Target } from 'lucide-vue-next'
import { t } from '~/lib/copy/strings'
import type { CopyKey } from '~/lib/copy/strings'

interface Tab {
  to: string
  labelKey: CopyKey
  icon: typeof FileText
  enabled: boolean
}

// Only /app/snapshot exists in Day 3; other tabs come online Day 5 (Plan) / Day 6 (Decide)
// / Day 9 (Discover). Disabled tabs are kept visible so the mental model is consistent.
// Plan → /app/goals, Decide → /app/simulator. Active-class matching uses path equality,
// so the routes don't have to mirror the labelKey verbatim.
const tabs: Tab[] = [
  { to: '/app/snapshot', labelKey: 'nav.track', icon: FileText, enabled: true },
  { to: '/app/goals', labelKey: 'nav.plan', icon: Target, enabled: true },
  { to: '/app/simulator', labelKey: 'nav.decide', icon: Sparkles, enabled: true },
  { to: '/app/discover', labelKey: 'nav.discover', icon: Compass, enabled: false },
]
</script>

<template>
  <!-- Desktop: row above the page content -->
  <nav
    class="sticky top-16 z-20 hidden border-b border-[var(--color-border)] bg-[var(--color-surface-card)]/90 backdrop-blur md:block"
  >
    <ul class="flex gap-1 px-2">
      <li v-for="tab in tabs" :key="tab.to">
        <NuxtLink
          v-if="tab.enabled"
          :to="tab.to"
          class="inline-flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary-dark)]"
          active-class="border-[var(--color-primary)] text-[var(--color-primary-dark)]"
        >
          <component :is="tab.icon" :size="16" />
          {{ t(tab.labelKey) }}
        </NuxtLink>
        <span
          v-else
          class="inline-flex cursor-not-allowed items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-[var(--color-text-muted)]"
        >
          <component :is="tab.icon" :size="16" />
          {{ t(tab.labelKey) }}
          <span
            class="rounded-[var(--radius-pill)] bg-[var(--color-surface-low)] px-2 py-0.5 text-[10px] uppercase tracking-wide"
          >
            {{ t('nav.soon') }}
          </span>
        </span>
      </li>
    </ul>
  </nav>

  <!-- Mobile: fixed bottom-nav (Day 0 lock: 4 modul = 4 tabs) -->
  <nav
    class="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-surface-card)] md:hidden"
  >
    <ul class="grid grid-cols-4">
      <li v-for="tab in tabs" :key="tab.to">
        <NuxtLink
          v-if="tab.enabled"
          :to="tab.to"
          class="flex flex-col items-center gap-1 py-2 text-[11px] font-medium text-[var(--color-text-secondary)]"
          active-class="text-[var(--color-primary-dark)]"
        >
          <component :is="tab.icon" :size="20" />
          {{ t(tab.labelKey) }}
        </NuxtLink>
        <span
          v-else
          class="flex cursor-not-allowed flex-col items-center gap-1 py-2 text-[11px] font-medium text-[var(--color-text-muted)]"
        >
          <component :is="tab.icon" :size="20" />
          {{ t(tab.labelKey) }}
        </span>
      </li>
    </ul>
  </nav>
</template>
