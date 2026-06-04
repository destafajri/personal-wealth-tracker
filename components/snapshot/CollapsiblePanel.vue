<script setup lang="ts">
import { ref } from 'vue'
import type { Component } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import IconChip from '~/components/common/IconChip.vue'
import { idr } from '~/lib/format/idr'

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    icon?: Component
    variant?: 'emerald' | 'neutral' | 'amber' | 'rose'
    defaultOpen?: boolean
    value?: number | null
  }>(),
  {
    subtitle: undefined,
    icon: undefined,
    variant: 'neutral',
    defaultOpen: false,
    value: undefined,
  },
)

// Local UI state only — per-input writes inside <slot/> still hit the snapshot
// store on every keystroke (B1 preserved); collapsing just hides the DOM, so
// the dashboard sidebar keeps reading store values regardless of expand state.
const open = ref<boolean>(props.defaultOpen)
</script>

<template>
  <section
    class="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)]"
  >
    <button
      type="button"
      class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--color-surface-low)]/50 sm:px-5"
      :aria-expanded="open"
      @click="open = !open"
    >
      <IconChip v-if="icon" :variant="variant" size="md">
        <component :is="icon" :size="18" :stroke-width="1.75" />
      </IconChip>
      <div class="min-w-0 flex-1">
        <h3 class="text-base font-semibold text-[var(--color-text-primary)]">
          {{ title }}
        </h3>
        <p
          v-if="subtitle"
          class="mt-0.5 text-xs text-[var(--color-text-secondary)]"
        >
          {{ subtitle }}
        </p>
        <p
          v-if="props.value !== undefined && props.value !== null"
          class="mt-1 break-all text-sm font-semibold tabular-nums text-[var(--color-text-secondary)]"
        >
          {{ idr(props.value) }}
        </p>
      </div>
      <ChevronDown
        :size="18"
        :stroke-width="2"
        :class="[
          'shrink-0 text-[var(--color-text-secondary)] transition-transform duration-200',
          open && 'rotate-180',
        ]"
      />
    </button>
    <div v-show="open" class="border-t border-[var(--color-border)] p-4 sm:p-5">
      <slot />
    </div>
  </section>
</template>
