<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useDerivedStore } from '~/stores/derived'
import { isNewUnlock, markBadgeSeen, type Badge } from '~/lib/finance/badges'

const derived = useDerivedStore()
const celebrating = ref<Set<string>>(new Set())

function checkCelebrations(badges: Badge[]) {
  for (const b of badges) {
    if (b.unlocked && isNewUnlock(b)) {
      celebrating.value.add(b.id)
      markBadgeSeen(b)
      setTimeout(() => celebrating.value.delete(b.id), 1500)
    }
  }
}

onMounted(() => checkCelebrations(derived.badges))
watch(() => derived.badges, checkCelebrations)

const unlockedCount = computed(() => derived.badges.filter((b) => b.unlocked).length)
</script>

<template>
  <article
    class="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-4"
  >
    <header class="mb-3 flex items-center justify-between">
      <h3 class="text-xs font-medium uppercase tracking-wide text-[var(--color-text-secondary)]">
        Pencapaian
      </h3>
      <span class="text-xs text-[var(--color-text-muted)]">
        {{ unlockedCount }}/{{ derived.badges.length }}
      </span>
    </header>

    <div class="grid grid-cols-3 gap-2 sm:grid-cols-5">
      <div
        v-for="(badge, i) in derived.badges"
        :key="badge.id"
        class="animate-fade-slide-up group relative flex flex-col items-center gap-1 rounded-lg py-3 px-1 text-center transition-transform"
        :style="{ animationDelay: `${i * 80}ms` }"
        :class="{
          'scale-105': celebrating.has(badge.id),
        }"
      >
        <span
          class="text-2xl transition-all duration-300"
          :class="{
            'grayscale opacity-30': !badge.unlocked,
            'drop-shadow-md': badge.unlocked,
            'animate-bounce': celebrating.has(badge.id),
          }"
        >
          {{ badge.icon }}
        </span>
        <span
          class="text-[10px] font-semibold leading-tight tracking-tight"
          :class="
            badge.unlocked
              ? 'text-[var(--color-text-primary)]'
              : 'text-[var(--color-text-muted)]'
          "
        >
          {{ badge.label }}
        </span>

        <!-- Tooltip on hover -->
        <div
          class="pointer-events-none absolute -top-12 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--color-surface-low)] px-2 py-1 text-[10px] text-[var(--color-text-secondary)] opacity-0 shadow-md transition-opacity group-hover:opacity-100"
          :class="{ 'pointer-events-auto': false }"
        >
          {{ badge.description }}
        </div>
      </div>
    </div>
  </article>
</template>
