<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowRight, X } from 'lucide-vue-next'
import { PERSONA_VISUALS, type PersonaKey } from '~/lib/finance/persona'
import { t } from '~/lib/copy/strings'

const VALID_KEYS: PersonaKey[] = ['sultanKos', 'investorKos', 'anakKosBijak', 'pejuangAkhirBulan', 'sobatIndomie']

const props = defineProps<{ personaQuery?: string }>()
const dismissed = ref(false)

const personaKey = computed<PersonaKey | null>(() => {
  const q = props.personaQuery
  if (q && (VALID_KEYS as string[]).includes(q)) return q as PersonaKey
  return null
})

const headline = computed(() => {
  if (personaKey.value) {
    const label = t(`persona.${personaKey.value}.label` as import('~/lib/copy/strings').CopyKey)
    return t('landing.shareInvite.headlineTemplate', { persona: label })
  }
  return t('landing.shareInvite.headlineFallback')
})

const gradientClass = computed(() => {
  if (personaKey.value) return `bg-gradient-to-r ${PERSONA_VISUALS[personaKey.value].gradient}`
  return 'bg-gradient-to-r from-emerald-400 to-teal-500'
})
</script>

<template>
  <div
    v-if="!dismissed"
    class="mx-auto mt-6 max-w-3xl"
  >
    <div
      class="flex items-center gap-4 rounded-xl p-4 text-white shadow-sm"
      :class="gradientClass"
    >
      <div class="min-w-0 flex-1">
        <p class="text-sm font-bold">{{ headline }}</p>
        <p class="text-xs text-white/80">{{ t('landing.shareInvite.sub') }}</p>
        <NuxtLink
          :to="'/app/budget-kos?onboard=1'"
          class="mt-2 inline-flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
        >
          {{ t('landing.shareInvite.cta') }}
          <ArrowRight :size="12" />
        </NuxtLink>
        <p class="mt-1.5 text-[10px] text-white/60">{{ t('landing.shareInvite.microcopyPrivacy') }}</p>
      </div>
      <button
        type="button"
        class="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
        aria-label="Tutup"
        @click="dismissed = true"
      >
        <X :size="12" />
      </button>
    </div>
  </div>
</template>
