<script setup lang="ts">
import { Lock } from 'lucide-vue-next'
import { t } from '~/lib/copy/strings'
</script>

<template>
  <footer class="bg-[var(--color-surface)]">
    <div class="mx-auto flex max-w-[1440px] flex-wrap items-center gap-2 px-6 pb-4 pt-2 text-[11px] text-[var(--color-text-muted)] sm:px-10">
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
