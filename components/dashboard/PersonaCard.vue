<script setup lang="ts">
import { computed, ref } from 'vue'
import { Share2 } from 'lucide-vue-next'
import { useDerivedStore } from '~/stores/derived'
import { useSnapshotStore } from '~/stores/snapshot'
import { resolvePersona, hasInvestments, isSnapshotReady, PERSONA_VISUALS } from '~/lib/finance/persona'
import { t } from '~/lib/copy/strings'
import { APP_URL } from '~/composables/useShare'
import ShareDialog from '~/components/common/ShareDialog.vue'
import PersonaShareCard from '~/components/share/PersonaShareCard.vue'

const derived = useDerivedStore()
const snap = useSnapshotStore()
const shareOpen = ref(false)
const showStats = ref(false)

const snapshotState = computed(() => ({
  penghasilan: snap.penghasilan,
  penghasilanLain: snap.penghasilanLain,
  pengeluaran: snap.pengeluaran,
  pengeluaranLain: snap.pengeluaranLain,
  asetLikuid: snap.asetLikuid,
  asetNonLikuid: snap.asetNonLikuid,
  emas: snap.emas,
  saham: snap.saham,
  crypto: snap.crypto,
  cicilanAktif: snap.cicilanAktif,
  utangPribadi: snap.utangPribadi,
  gadai: snap.gadai,
}))

const persona = computed(() =>
  resolvePersona({
    savingsRate: derived.savingsRate,
    runway: derived.runway,
    hasInvestments: hasInvestments(snapshotState.value),
    isSnapshotReady: isSnapshotReady(snapshotState.value),
  }),
)

const personaKey = computed(() => persona.value?.key ?? null)
const style = computed(() => personaKey.value ? PERSONA_VISUALS[personaKey.value] : null)

const shareText = computed(() => {
  if (!personaKey.value) return ''
  const label = t(`persona.${personaKey.value}.label` as import('~/lib/copy/strings').CopyKey)
  return `Aku ${label}! ✨ Cek keuanganmu juga di Cermat × Mamikos!\n${APP_URL}`
})

const downloadName = computed(() => `cermat-${personaKey.value ?? 'share'}.png`)
</script>

<template>
  <div
    v-if="persona && style"
    class="rounded-xl bg-gradient-to-r p-4 text-white shadow-sm"
    :class="style.gradient"
  >
    <div class="flex items-center gap-2">
      <span class="text-2xl" aria-hidden="true">{{ style.emoji }}</span>
      <h3 class="text-lg font-semibold">
        {{ t(`persona.${persona.key}.label` as import('~/lib/copy/strings').CopyKey) }}
      </h3>
      <button
        type="button"
        class="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
        aria-label="Bagikan kartu"
        @click="shareOpen = true"
      >
        <Share2 :size="16" />
      </button>
    </div>
    <p class="mt-1 text-sm opacity-90">
      {{ t(`persona.${persona.key}.tagline` as import('~/lib/copy/strings').CopyKey) }}
    </p>
    <div class="mt-3 flex gap-3">
      <div class="rounded-lg bg-white/20 px-3 py-1.5 text-sm">
        <div class="text-xs opacity-75">{{ t('persona.stats.savingsRate') }}</div>
        <div class="font-semibold">{{ derived.savingsRate != null ? `${Math.round(derived.savingsRate)}%` : '—' }}</div>
      </div>
      <div class="rounded-lg bg-white/20 px-3 py-1.5 text-sm">
        <div class="text-xs opacity-75">{{ t('persona.stats.runway') }}</div>
        <div class="font-semibold">{{ derived.runway != null ? `${Math.round(derived.runway)} bulan` : '—' }}</div>
      </div>
    </div>

    <!-- Share dialog (Layer 2 + Layer 3) -->
    <ShareDialog
      :open="shareOpen"
      :share-text="shareText"
      :download-name="downloadName"
      @close="shareOpen = false"
    >
      <PersonaShareCard
        :persona-key="persona.key"
        :savings-rate="derived.savingsRate"
        :runway="derived.runway"
        :show-stats="showStats"
      />
      <!-- Stats toggle (inside the dialog, below the card) -->
      <div class="mt-2 text-center">
        <button
          type="button"
          class="text-[11px] font-medium text-[var(--color-text-muted)] underline decoration-current/40 hover:text-[var(--color-text-secondary)]"
          @click="showStats = !showStats"
        >
          {{ showStats ? t('share.toggleStatsOff') : t('share.toggleStats') }}
        </button>
      </div>
    </ShareDialog>
  </div>
</template>
