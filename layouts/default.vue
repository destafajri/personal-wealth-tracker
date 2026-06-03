<script setup lang="ts">
import FooterDisclaimer from '~/components/layout/FooterDisclaimer.vue'
import { t } from '~/lib/copy/strings'
</script>

<template>
  <div class="flex min-h-screen flex-col bg-[var(--color-surface)]">
    <header
      class="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface-card)]"
    >
      <div class="mx-auto flex h-16 max-w-[1440px] items-center px-6 sm:px-10">
        <NuxtLink
          to="/"
          class="text-lg font-semibold tracking-tight text-[var(--color-primary-dark)]"
        >
          {{ t('brand.name') }}
        </NuxtLink>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <FooterDisclaimer />
  </div>
</template>
