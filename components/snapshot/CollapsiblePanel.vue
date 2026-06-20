<script setup lang="ts">
import { ref } from 'vue'
import type { Component } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import IconChip from '~/components/common/IconChip.vue'
import AnimatedTotal from '~/components/snapshot/AnimatedTotal.vue'
import SectionCompleteIndicator from '~/components/snapshot/SectionCompleteIndicator.vue'

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    icon?: Component
    variant?: 'emerald' | 'neutral' | 'amber' | 'rose' | 'sky'
    defaultOpen?: boolean
    value?: number | null
    disabled?: boolean
    badge?: string
    sectionComplete?: boolean
    // When true, removes the outer panel border + header/body separator border.
    // Used in Investasi where inner sub-cards (AssetRowList bordered variant) provide
    // the structural framing — adding an outer panel border on top creates the
    // "Russian nesting doll" over-bordering look. Default false preserves other tabs.
    frameless?: boolean
  }>(),
  {
    subtitle: undefined,
    icon: undefined,
    variant: 'neutral',
    defaultOpen: false,
    value: undefined,
    disabled: false,
    badge: undefined,
    sectionComplete: false,
    frameless: false,
  },
)

// Local UI state only — per-input writes inside <slot/> still hit the snapshot
// store on every keystroke (B1 preserved); collapsing just hides the DOM, so
// the dashboard sidebar keeps reading store values regardless of expand state.
const open = ref<boolean>(props.defaultOpen)
</script>

<template>
  <section
    :class="
      frameless
        ? 'overflow-hidden rounded-[var(--radius-card)] bg-transparent'
        : 'overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)]'
    "
  >
    <button
      type="button"
      class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors sm:px-5"
      :class="
        disabled
          ? 'cursor-not-allowed opacity-60'
          : frameless
            ? 'hover:bg-[var(--color-surface-low)]/50'
            : 'hover:bg-[var(--color-surface-low)]/50'
      "
      :aria-expanded="open"
      @click="!disabled && (open = !open)"
    >
      <IconChip v-if="icon" :variant="variant" size="md">
        <component :is="icon" :size="18" :stroke-width="1.75" />
      </IconChip>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <h3 class="text-base font-semibold text-[var(--color-text-primary)]">
            {{ title }}
          </h3>
          <span
            v-if="badge"
            class="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700"
          >
            {{ badge }}
          </span>
          <SectionCompleteIndicator v-if="sectionComplete" :complete="true" />
        </div>
        <p
          v-if="subtitle"
          class="mt-0.5 text-xs text-[var(--color-text-secondary)]"
        >
          {{ subtitle }}
        </p>
        <p
          v-if="props.value !== undefined && props.value !== null"
          class="mt-1 text-base font-bold text-[var(--color-text-primary)]"
        >
          <AnimatedTotal :value="props.value" />
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
    <div
      v-show="open"
      :class="
        frameless
          ? 'p-4 sm:p-5'
          : 'border-t border-[var(--color-border)] p-4 sm:p-5'
      "
    >
      <slot />
    </div>
  </section>
</template>
