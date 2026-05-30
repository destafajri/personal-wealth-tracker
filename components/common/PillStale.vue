<script setup lang="ts">
import { RotateCw } from 'lucide-vue-next'
import { t } from '~/lib/copy/strings'
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-[var(--color-warning-amber-soft)] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[var(--color-warning-amber)]"
  >
    <RotateCw class="h-3 w-3" />
    {{ t('pill.stale') }}
  </span>
</template>
