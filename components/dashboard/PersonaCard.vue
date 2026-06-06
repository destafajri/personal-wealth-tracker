<script setup lang="ts">
import { computed, ref } from 'vue'
import { Share2 } from 'lucide-vue-next'
import { useDerivedStore } from '~/stores/derived'
import { useSnapshotStore } from '~/stores/snapshot'
import { resolvePersona, hasInvestments, isSnapshotReady, type PersonaKey } from '~/lib/finance/persona'
import { t } from '~/lib/copy/strings'
import ShareCard from '~/components/common/ShareCard.vue'

const derived = useDerivedStore()
const snap = useSnapshotStore()
const shareOpen = ref(false)

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

const PERSONA_STYLE_MAP: Record<PersonaKey, { gradient: string; emoji: string }> = {
  sultanKos: { gradient: 'from-amber-400 to-yellow-500', emoji: '\u{1F451}' },
  investorKos: { gradient: 'from-emerald-400 to-teal-500', emoji: '\u{1F4C8}' },
  anakKosBijak: { gradient: 'from-blue-400 to-indigo-500', emoji: '\u{1F44D}' },
  pejuangAkhirBulan: { gradient: 'from-rose-400 to-pink-500', emoji: '\u{1F525}' },
  sobatIndomie: { gradient: 'from-orange-400 to-amber-500', emoji: '\u{1F35C}' },
}

const style = computed(() => persona.value ? PERSONA_STYLE_MAP[persona.value.key] : null)
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
        class="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
        aria-label="Share persona"
        @click="shareOpen = true"
      >
        <Share2 :size="14" />
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
    <ShareCard :open="shareOpen" @close="shareOpen = false" />
  </div>
</template>
