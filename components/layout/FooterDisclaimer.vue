<script setup lang="ts">
import { Lock } from 'lucide-vue-next'
import { t } from '~/lib/copy/strings'
</script>

<template>
  <footer class="border-t border-[var(--color-border)] bg-[var(--color-surface-card)]/60">
    <div class="mx-auto flex max-w-[1440px] flex-wrap items-center gap-2 px-6 py-4 text-xs text-[var(--color-text-secondary)] sm:px-10">
      <Lock class="h-3.5 w-3.5 shrink-0" />
      <p>{{ t('footer.disclaimer') }}</p>
      <!-- D11.4 — Screen 13 mobile-only desktop hint. Sits inside the same
           footer row on mobile, hidden on md+. -->
      <p class="ml-auto italic text-[var(--color-text-muted)] md:hidden">
        {{ t('mobile.desktopHint') }}
      </p>
    </div>
  </footer>
</template>
