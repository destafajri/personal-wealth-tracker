<script setup lang="ts">
import { Lock } from 'lucide-vue-next'
import { t } from '~/lib/copy/strings'
</script>

<template>
  <footer class="relative overflow-hidden bg-[var(--color-surface-low)]">
    <!-- Decorative gradient top border -->
    <div class="h-px bg-gradient-to-r from-transparent via-[var(--color-primary)]/30 to-transparent" />
    <div class="mx-auto flex max-w-[1440px] items-center gap-3 px-6 py-5 sm:px-10">
      <span class="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--color-primary)]/10">
        <Lock class="h-4 w-4 text-[var(--color-primary)]" :stroke-width="2" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="text-xs font-medium leading-snug text-[var(--color-text-secondary)]">
          {{ t('footer.disclaimer') }}
        </p>
        <!-- D11.4 — Screen 13 mobile-only desktop hint -->
        <p class="mt-1 text-[10px] italic text-[var(--color-text-muted)] md:hidden">
          {{ t('mobile.desktopHint') }}
        </p>
      </div>
    </div>
  </footer>
</template>
