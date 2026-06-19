<script setup lang="ts">
// Plain pill for tab row counts. Renders nothing when count is 0 (defensive —
// caller should also gate with v-if). Modern minimal style per Phase 8.3 §10.1
// user decision: no brackets, no middot, just the number in a smooth rounded
// background.

withDefaults(
  defineProps<{
    count: number
    maxDisplay?: number
  }>(),
  { maxDisplay: 99 },
)
</script>

<template>
  <span
    v-if="count > 0"
    class="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--color-primary)]/15 px-1.5 text-[10px] font-semibold tabular-nums text-[var(--color-primary)]"
    :aria-label="`${count} item`"
  >
    {{ count > maxDisplay ? `${maxDisplay}+` : count }}
  </span>
</template>
