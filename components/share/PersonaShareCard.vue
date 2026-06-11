<script setup lang="ts">
import { computed } from 'vue'
import { PERSONA_VISUALS, type PersonaKey } from '~/lib/finance/persona'
import { t } from '~/lib/copy/strings'

const props = withDefaults(
  defineProps<{
    personaKey: PersonaKey
    savingsRate?: number | null
    runway?: number | null
    showStats?: boolean
  }>(),
  { savingsRate: null, runway: null, showStats: false },
)

const visuals = computed(() => PERSONA_VISUALS[props.personaKey])
const label = computed(() => t(`persona.${props.personaKey}.label` as import('~/lib/copy/strings').CopyKey))
const tagline = computed(() => t(`persona.${props.personaKey}.tagline` as import('~/lib/copy/strings').CopyKey))
</script>

<template>
  <!-- Card always renders light (independent of app dark mode) -->
  <div
    class="flex min-w-[280px] max-w-[360px] flex-col items-center justify-between bg-gradient-to-b px-8 py-12 text-center"
    :class="visuals.gradient"
  >
    <!-- Top: emoji -->
    <p class="text-7xl drop-shadow-lg" aria-hidden="true">{{ visuals.emoji }}</p>

    <!-- Persona identity -->
    <div class="mt-4">
      <h3 class="text-2xl font-black tracking-tight text-white drop-shadow-md">
        {{ label }}
      </h3>
      <p class="mt-1 text-base font-medium text-white/90">
        {{ tagline }}
      </p>
    </div>

    <!-- Optional stats (default OFF — privacy-first) -->
    <div v-if="showStats" class="mt-4 flex justify-center gap-3">
      <div class="rounded-xl bg-white/20 px-4 py-2 backdrop-blur-sm">
        <p class="text-[10px] font-bold uppercase tracking-wide text-white/80">
          {{ t('persona.stats.savingsRate') }}
        </p>
        <p class="text-lg font-black text-white">
          {{ savingsRate != null ? `${Math.round(savingsRate)}%` : '—' }}
        </p>
      </div>
      <div class="rounded-xl bg-white/20 px-4 py-2 backdrop-blur-sm">
        <p class="text-[10px] font-bold uppercase tracking-wide text-white/80">
          {{ t('persona.stats.runway') }}
        </p>
        <p class="text-lg font-black text-white">
          {{ runway != null ? `${Math.round(runway)} bln` : '—' }}
        </p>
      </div>
    </div>

    <!-- Spacer (grows in 9:16) -->
    <div class="flex-grow" />

    <!-- Footer: CTA + branding -->
    <div class="mt-4">
      <p class="text-sm italic text-white/80">{{ t('share.cta') }}</p>
      <p class="mt-1 text-xs font-semibold text-white/60">{{ t('share.brandLockup') }}</p>
      <p class="text-[10px] font-mono text-white/50">{{ t('share.url') }}</p>
    </div>
  </div>
</template>
