<script setup lang="ts">
import { ref, watch } from 'vue'
import { Check } from 'lucide-vue-next'

// Renders a small emerald checkmark next to a section title when the section
// meets its "minimum useful data" criterion (defined by the parent). When
// `complete` transitions from false → true, plays a brief scale-pulse to draw
// the eye. When not complete, renders nothing — keeps incomplete headers clean.
//
// Phase-2 constraint: visual feedback only. The criterion itself is computed
// by the parent from existing store state; this component does NOT decide what
// "complete" means or write any state.

const props = defineProps<{
  complete: boolean
}>()

const pulsing = ref(false)
watch(
  () => props.complete,
  (now, prev) => {
    if (now && !prev) {
      pulsing.value = true
      window.setTimeout(() => {
        pulsing.value = false
      }, 600)
    }
  },
)
</script>

<template>
  <span
    v-if="complete"
    class="inline-flex shrink-0 items-center"
    :class="pulsing ? 'animate-pulse' : ''"
    aria-label="Section lengkap"
  >
    <span
      class="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-accent-emerald-soft)]"
      :class="pulsing ? 'scale-125' : 'scale-100'"
      style="transition: transform 300ms ease-out"
    >
      <Check
        :size="10"
        :stroke-width="3"
        class="text-[var(--color-accent-emerald)]"
      />
    </span>
  </span>
</template>
