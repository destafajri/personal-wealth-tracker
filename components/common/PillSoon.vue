<script setup lang="ts">
import { t } from '~/lib/copy/strings'

withDefaults(
  defineProps<{
    size?: 'sm' | 'xs'
  }>(),
  { size: 'sm' },
)
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border border-dashed border-[var(--color-text-muted)]/40 bg-[var(--color-surface-low)]/60 font-medium tracking-wide text-[var(--color-text-muted)]"
    :class="size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-1.5 py-px text-[8px]'"
  >
    <span class="relative flex h-1.5 w-1.5">
      <span
        class="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-primary)] opacity-50"
      />
      <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
    </span>
    {{ t('nav.soon') }}
  </span>
</template>
