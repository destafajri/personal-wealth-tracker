<script setup lang="ts">
import { computed } from 'vue'
import { PERSONA_VISUALS, type PersonaKey } from '~/lib/finance/persona'
import { t } from '~/lib/copy/strings'
import { getAppUrl } from '~/composables/useShare'

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
const appHost = computed(() => {
  const url = getAppUrl()
  return url.replace(/^https?:\/\//, '')
})
</script>

<template>
  <!-- Card always renders light (independent of app dark mode) -->
  <div
    class="flex min-w-[280px] max-w-[360px] flex-col items-center justify-between bg-gradient-to-b px-8 py-12 text-center"
    :class="visuals.gradient"
    :style="{ backgroundImage: visuals.gradientCSS }"
  >
    <!-- Top: emoji -->
    <p class="text-7xl drop-shadow-lg" aria-hidden="true">{{ visuals.emoji }}</p>

    <!-- Persona identity -->
    <div class="mt-4">
      <h3 class="text-2xl font-black tracking-tight drop-shadow-md" style="color: #fff">
        {{ label }}
      </h3>
      <p class="mt-1 text-base font-medium" style="color: rgba(255,255,255,0.9)">
        {{ tagline }}
      </p>
    </div>

    <!-- Optional stats (default OFF — privacy-first) -->
    <div v-if="showStats" class="mt-4 flex justify-center gap-3">
      <div class="rounded-xl px-4 py-2 backdrop-blur-sm" style="background: rgba(255,255,255,0.2)">
        <p class="text-[10px] font-bold uppercase tracking-wide" style="color: rgba(255,255,255,0.8)">
          {{ t('persona.stats.savingsRate') }}
        </p>
        <p class="text-lg font-black" style="color: #fff">
          {{ savingsRate != null ? `${Math.round(savingsRate)}%` : '—' }}
        </p>
      </div>
      <div class="rounded-xl px-4 py-2 backdrop-blur-sm" style="background: rgba(255,255,255,0.2)">
        <p class="text-[10px] font-bold uppercase tracking-wide" style="color: rgba(255,255,255,0.8)">
          {{ t('persona.stats.runway') }}
        </p>
        <p class="text-lg font-black" style="color: #fff">
          {{ runway != null ? `${Math.round(runway)} bln` : '—' }}
        </p>
      </div>
    </div>

    <!-- Spacer (grows in 9:16) -->
    <div class="flex-grow" />

    <!-- Footer: CTA + branding -->
    <div class="mt-4">
      <p class="text-sm italic" style="color: rgba(255,255,255,0.8)">{{ t('share.cta') }}</p>
      <p class="mt-1 text-xs font-semibold" style="color: rgba(255,255,255,0.6)">{{ t('share.brandLockup') }}</p>
      <p class="text-[10px] font-mono" style="color: rgba(255,255,255,0.5)">{{ appHost }}</p>
    </div>
  </div>
</template>
