<script setup lang="ts">
import { computed, ref } from 'vue'
import { Copy, Download, MessageCircle, X } from 'lucide-vue-next'
import { useDerivedStore } from '~/stores/derived'
import { useSnapshotStore } from '~/stores/snapshot'
import { resolvePersona, hasInvestments, isSnapshotReady, type PersonaKey } from '~/lib/finance/persona'
import { t } from '~/lib/copy/strings'
import { useShare } from '~/composables/useShare'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const derived = useDerivedStore()
const snap = useSnapshotStore()

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

const PERSONA_STYLE: Record<PersonaKey, { gradient: string; emoji: string }> = {
  sultanKos: { gradient: 'from-amber-400 to-yellow-500', emoji: '\u{1F451}' },
  investorKos: { gradient: 'from-emerald-400 to-teal-500', emoji: '\u{1F4C8}' },
  anakKosBijak: { gradient: 'from-blue-400 to-indigo-500', emoji: '\u{1F44D}' },
  pejuangAkhirBulan: { gradient: 'from-rose-400 to-pink-500', emoji: '\u{1F525}' },
  sobatIndomie: { gradient: 'from-orange-400 to-amber-500', emoji: '\u{1F35C}' },
}

const personaKey = computed(() => persona.value?.key ?? null)
const style = computed(() => personaKey.value ? PERSONA_STYLE[personaKey.value] : null)
const showStats = ref(false)

const { copying, copyToClipboard, shareWhatsApp, shareTwitter, downloadImage } = useShare(personaKey)
const cardRef = ref<HTMLElement | null>(null)
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open && persona && style"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      @click.self="emit('close')"
    >
      <div class="relative w-full max-w-sm">
        <!-- Close button -->
        <button
          type="button"
          class="absolute -top-2 -right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 shadow-lg hover:bg-gray-100"
          @click="emit('close')"
        >
          <X :size="16" />
        </button>

        <!-- Share card -->
        <div
          ref="cardRef"
          class="overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-center shadow-2xl"
          :class="style.gradient"
        >
          <p class="text-6xl drop-shadow-lg">{{ style.emoji }}</p>
          <h3 class="mt-3 text-2xl font-black tracking-tight text-white drop-shadow-md">
            {{ t(`persona.${persona.key}.label` as import('~/lib/copy/strings').CopyKey) }}
          </h3>
          <p class="mt-1 text-base font-medium text-white/90">
            {{ t(`persona.${persona.key}.tagline` as import('~/lib/copy/strings').CopyKey) }}
          </p>

          <!-- Optional stats -->
          <div v-if="showStats" class="mt-4 flex justify-center gap-3">
            <div class="rounded-xl bg-white/20 px-4 py-2 backdrop-blur-sm">
              <p class="text-[10px] font-bold uppercase tracking-wide text-white/80">Sisa Uang</p>
              <p class="text-lg font-black text-white">
                {{ derived.savingsRate != null ? `${Math.round(derived.savingsRate)}%` : '—' }}
              </p>
            </div>
            <div class="rounded-xl bg-white/20 px-4 py-2 backdrop-blur-sm">
              <p class="text-[10px] font-bold uppercase tracking-wide text-white/80">Bisa Bertahan</p>
              <p class="text-lg font-black text-white">
                {{ derived.runway != null ? `${Math.round(derived.runway)} bln` : '—' }}
              </p>
            </div>
          </div>

          <!-- Stats toggle -->
          <button
            type="button"
            class="mt-3 text-[11px] font-medium text-white/70 underline decoration-white/40 hover:text-white"
            @click="showStats = !showStats"
          >
            {{ showStats ? 'Sembunyikan stats' : 'Tampilkan stats saya' }}
          </button>

          <!-- Branding -->
          <div class="mt-5 flex items-center justify-center gap-1.5 text-xs font-semibold text-white/60">
            <span>Cermat</span>
            <span>×</span>
            <span>Mamikos</span>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="mt-3 grid grid-cols-4 gap-2">
          <button
            type="button"
            class="flex flex-col items-center gap-1 rounded-xl bg-[var(--color-surface-card)] px-2 py-3 text-[10px] font-medium text-[var(--color-text-secondary)] shadow-sm transition hover:bg-[var(--color-surface-low)]"
            @click="copyToClipboard"
          >
            <Copy :size="18" :class="copying ? 'text-[var(--color-primary)]' : ''" />
            {{ copying ? 'Tersalin!' : 'Salin' }}
          </button>
          <button
            type="button"
            class="flex flex-col items-center gap-1 rounded-xl bg-[var(--color-surface-card)] px-2 py-3 text-[10px] font-medium text-[var(--color-text-secondary)] shadow-sm transition hover:bg-[var(--color-surface-low)]"
            @click="shareWhatsApp"
          >
            <MessageCircle :size="18" />
            WhatsApp
          </button>
          <button
            type="button"
            class="flex flex-col items-center gap-1 rounded-xl bg-[var(--color-surface-card)] px-2 py-3 text-[10px] font-medium text-[var(--color-text-secondary)] shadow-sm transition hover:bg-[var(--color-surface-low)]"
            @click="shareTwitter"
          >
            <svg xmlns="http://www.w3.org/2000/svg" :width="18" :height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            X
          </button>
          <button
            type="button"
            class="flex flex-col items-center gap-1 rounded-xl bg-[var(--color-surface-card)] px-2 py-3 text-[10px] font-medium text-[var(--color-text-secondary)] shadow-sm transition hover:bg-[var(--color-surface-low)]"
            @click="downloadImage(cardRef)"
          >
            <Download :size="18" />
            Download
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
