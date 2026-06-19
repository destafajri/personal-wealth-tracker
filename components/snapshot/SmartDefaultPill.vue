<script setup lang="ts">
import { onMounted, ref } from 'vue'

// Tiny inline "SARAN" pill rendered next to a field label when the field's value
// came from a smart-default preset (Cicilan / Gadai quick-add chips).
//
// Lifecycle:
// - Renders for 5 seconds from mount, then fades out over 300ms and unmounts.
// - Parent component controls whether the pill is rendered (v-if on parent's side)
//   based on whether the user has touched that specific field. First keystroke
//   in the field → parent removes the pill instantly via v-if.
//
// Phase-2 constraint: pure visual affordance, no state writes.

const props = withDefaults(
  defineProps<{
    label?: string
    durationMs?: number
  }>(),
  {
    label: 'Saran',
    durationMs: 5000,
  },
)

const fading = ref(false)
onMounted(() => {
  window.setTimeout(() => {
    fading.value = true
  }, props.durationMs)
})
</script>

<template>
  <span
    class="inline-flex items-center rounded-full bg-[var(--color-accent-emerald-soft)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--color-accent-emerald)] transition-opacity duration-300"
    :class="fading ? 'opacity-0' : 'opacity-100'"
    :aria-label="`Nilai ${label.toLowerCase()} dari preset`"
  >
    {{ label }}
  </span>
</template>
