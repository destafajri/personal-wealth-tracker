<script setup lang="ts">
import { computed } from 'vue'
import { useCountUp } from '~/composables/useCountUp'
import { idr as idrFormat } from '~/lib/format/idr'

// Wraps a reactive numeric value and animates the displayed text from previous
// to new value on change. Uses useCountUp with skipInitial so panels don't
// count up from 0 on first paint (avoids jarring flicker against surrounding
// static UI). On subsequent changes (user adds/removes a row, edits amount),
// the value tweens smoothly to the new total.

const props = withDefaults(
  defineProps<{
    value: number
    format?: (n: number) => string
    durationMs?: number
  }>(),
  {
    format: idrFormat,
    durationMs: 600,
  },
)

const target = computed(() => props.value)
const displayed = useCountUp(target, {
  duration: props.durationMs,
  skipInitial: true,
})
const text = computed(() => props.format(displayed.value))
</script>

<template>
  <span class="tabular">{{ text }}</span>
</template>
