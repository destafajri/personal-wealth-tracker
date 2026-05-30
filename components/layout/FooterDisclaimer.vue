<script setup lang="ts">
import { Lock } from 'lucide-vue-next'
import { t } from '~/lib/copy/strings'
</script>

<template>
  <footer class="border-t border-[var(--color-border)] bg-[var(--color-surface-card)]">
    <div class="mx-auto flex max-w-[1440px] items-center gap-2 px-6 py-4 text-xs text-[var(--color-text-secondary)] sm:px-10">
      <Lock class="h-3.5 w-3.5 shrink-0" />
      <p>{{ t('footer.disclaimer') }}</p>
    </div>
  </footer>
</template>
