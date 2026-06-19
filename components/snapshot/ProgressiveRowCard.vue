<script setup lang="ts">
import { ref, useId } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { useExpandTransition } from '~/composables/useExpandTransition'

// Progressive disclosure wrapper for complex repeatable rows (UtangPribadi, Gadai,
// CicilanAktif). Basic slot is always visible (identity + amount + remove button);
// advanced slot is revealed via chevron toggle with a smooth height transition.
//
// When the advanced slot is collapsed but contains active validation warnings,
// pass `warningCount > 0` to render an amber dot on the chevron — prevents users
// from missing hidden warnings. The chevron rotates 180deg when expanded.
//
// Advanced slot content stays mounted (v-show, not v-if) so any inputs inside
// continue writing to the snapshot store on every keystroke regardless of expand
// state (Phase-2 B1 invariant: per-input store writes preserved).

const props = withDefaults(
  defineProps<{
    expanded?: boolean
    warningCount?: number
    expandLabel?: string
  }>(),
  {
    expanded: false,
    warningCount: 0,
    expandLabel: 'Tampilkan field lanjutan',
  },
)

const open = ref<boolean>(props.expanded)
const advancedId = `prc-adv-${useId()}`
const tx = useExpandTransition(250)
</script>

<template>
  <article
    class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-low)] p-4"
  >
    <div class="flex items-start gap-2">
      <div class="min-w-0 flex-1">
        <slot name="basic" />
      </div>
      <button
        type="button"
        :aria-expanded="open"
        :aria-controls="advancedId"
        :aria-label="expandLabel"
        class="relative shrink-0 rounded p-2 text-[var(--color-text-muted)] transition-all duration-200 hover:bg-[var(--color-surface-card)] hover:text-[var(--color-text-primary)]"
        @click="open = !open"
      >
        <ChevronDown
          :size="16"
          :stroke-width="2"
          :class="[
            'transition-transform duration-200',
            open && 'rotate-180',
          ]"
        />
        <span
          v-if="!open && warningCount > 0"
          class="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[var(--color-warning-amber)] ring-2 ring-[var(--color-surface-low)]"
          :aria-label="`${warningCount} peringatan di field lanjutan`"
        />
      </button>
    </div>
    <Transition
      :css="false"
      @enter="tx.onEnter"
      @after-enter="tx.onAfterEnter"
      @leave="tx.onLeave"
      @after-leave="tx.onAfterLeave"
    >
      <div
        v-show="open"
        :id="advancedId"
        role="region"
        :aria-hidden="!open"
        class="mt-3"
      >
        <slot name="advanced" />
      </div>
    </Transition>
  </article>
</template>
