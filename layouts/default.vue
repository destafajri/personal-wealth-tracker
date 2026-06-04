<script setup lang="ts">
import { Clock, ShieldCheck } from 'lucide-vue-next'
import FooterDisclaimer from '~/components/layout/FooterDisclaimer.vue'
import { t } from '~/lib/copy/strings'
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
        </NuxtLink>
        <span
          class="hidden items-center gap-1.5 text-sm text-[var(--color-text-secondary)] sm:inline-flex"
        >
          <Clock class="h-4 w-4" />
          {{ t('nav.tagline.tenMinutes') }}
        </span>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <FooterDisclaimer />
  </div>
</template>
