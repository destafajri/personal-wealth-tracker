<script setup lang="ts">
import { Clock, ShieldCheck, Sun } from 'lucide-vue-next'
import FooterDisclaimer from '~/components/layout/FooterDisclaimer.vue'
import MetricExplainerModal from '~/components/dashboard/MetricExplainerModal.vue'
import { t } from '~/lib/copy/strings'
import { useTheme } from '~/composables/useTheme'

const route = useRoute()
const { mode: themeMode, resolved, toggle: toggleTheme } = useTheme()
</script>

<template>
  <div class="bg-gradient-subtle flex min-h-screen flex-col">
    <header
      class="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface-card)]/90 backdrop-blur"
    >
      <div
        class="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 sm:px-10"
      >
        <NuxtLink to="/" class="flex items-center gap-2">
          <span
            class="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-input)] bg-[var(--color-primary)] shadow-[var(--shadow-sm)]"
          >
            <ShieldCheck class="h-4 w-4 text-white" :stroke-width="2.5" />
          </span>
          <span
            class="text-xl font-bold tracking-tight text-[var(--color-text-primary)]"
          >
            {{ t('brand.name') }}
          </span>
          <span
            class="hidden items-center gap-1.5 text-xs text-[var(--color-text-secondary)] sm:inline-flex sm:text-sm"
            :class="route.path.startsWith('/app/budget-kos') ? 'inline-flex' : 'hidden sm:inline-flex'"
          >
            <template v-if="route.path.startsWith('/app/budget-kos')">
              {{ t('nav.brand.subtitle') }}
            </template>
            <template v-else>
              <Clock class="h-4 w-4" />
              {{ t('nav.tagline.tenMinutes') }}
            </template>
          </span>
        </NuxtLink>
        <button
          type="button"
          :aria-label="themeMode === 'auto' ? 'Auto (time-based)' : resolved === 'dark' ? 'Dark mode' : 'Light mode'"
          class="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-low)] hover:text-[var(--color-text-primary)]"
          :title="themeMode === 'auto' ? 'Auto' : resolved === 'dark' ? 'Dark' : 'Light'"
          @click="toggleTheme"
        >
          <Sun v-if="themeMode === 'light'" :size="18" />
          <svg v-else-if="themeMode === 'dark'" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2.5" /><path d="M5.6 5.6l1.8 1.8" /><path d="M2 12h2.5" />
            <path d="M20 14.5A7 7 0 0 1 14.5 20 7 7 0 0 0 20 14.5z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <FooterDisclaimer />
    <MetricExplainerModal />
  </div>
</template>
