<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Copy, Download, Loader2, MessageCircle, X } from 'lucide-vue-next'
import { useShare } from '~/composables/useShare'
import { t } from '~/lib/copy/strings'
import { useToast } from '~/composables/useToast'

const props = withDefaults(
  defineProps<{
    open: boolean
    shareText: string
    aspectRatio?: '1:1' | '9:16'
    downloadName?: string
  }>(),
  { aspectRatio: '1:1', downloadName: 'cermat-share.png' },
)

const emit = defineEmits<{ close: [] }>()

const { downloadAsPng, copyText, shareToWa, shareToTwitter, isMobileShareCapable } = useShare()
const toast = useToast()

const cardRef = ref<HTMLElement | null>(null)
const copying = ref(false)
const capturing = ref(false)
const isMobile = ref(false)

watch(() => props.open, (val) => {
  if (val && typeof window !== 'undefined') {
    isMobile.value = isMobileShareCapable()
  }
})

const cardDimensions = computed(() =>
  props.aspectRatio === '9:16' ? 'max-w-[360px]' : 'max-w-[360px]',
)

async function handleCopy() {
  copying.value = true
  try {
    await copyText(props.shareText)
    toast.showToast('Tersalin!', { type: 'success', durationMs: 1500 })
  } catch {
    toast.showToast('Gagal menyalin teks.', { type: 'error', durationMs: 2000 })
  } finally {
    setTimeout(() => { copying.value = false }, 1500)
  }
}

function handleWhatsApp() {
  shareToWa(props.shareText)
}

function handleTwitter() {
  shareToTwitter(props.shareText)
}

async function handleDownload() {
  if (!cardRef.value) {
    toast.showToast(t('share.captureError'), { type: 'error', durationMs: 3000 })
    return
  }
  capturing.value = true
  toast.showToast(t('share.captureLoading'), { type: 'info', durationMs: 4000 })
  try {
    await downloadAsPng(cardRef.value as HTMLElement, props.downloadName)
    toast.showToast('Kartu berhasil diunduh!', { type: 'success', durationMs: 2000 })
  } catch {
    toast.showToast(t('share.captureError'), { type: 'error', durationMs: 3000 })
  } finally {
    capturing.value = false
  }
}

function handleClose() {
  if (capturing.value) return
  emit('close')
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    @click.self="handleClose"
  >
    <div class="relative flex w-full max-w-sm flex-col items-center">
      <!-- Card content slot (captured for PNG) -->
      <div ref="cardRef" :class="['relative overflow-hidden rounded-2xl', cardDimensions]">
        <!-- Close button inside card -->
        <button
          type="button"
          class="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
          :class="{ 'opacity-50 pointer-events-none': capturing }"
          @click="handleClose"
        >
          <X :size="14" />
        </button>
        <slot />
      </div>

      <!-- Controls slot (NOT captured) -->
      <div v-if="$slots.controls" class="mt-2">
        <slot name="controls" />
      </div>

      <!-- Share buttons (same on mobile & desktop) -->
      <div class="mt-3 grid grid-cols-4 gap-2">
        <button
          type="button"
          class="flex flex-col items-center gap-1 rounded-xl bg-[var(--color-surface-card)] px-2 py-3 text-[10px] font-medium text-[var(--color-text-secondary)] shadow-sm transition hover:bg-[var(--color-surface-low)] disabled:opacity-50"
          :disabled="capturing"
          @click="handleCopy"
        >
          <Copy :size="18" :class="copying ? 'text-[var(--color-primary)]' : ''" />
          {{ copying ? 'Tersalin!' : 'Salin' }}
        </button>
        <button
          type="button"
          class="flex flex-col items-center gap-1 rounded-xl bg-[var(--color-surface-card)] px-2 py-3 text-[10px] font-medium text-[var(--color-text-secondary)] shadow-sm transition hover:bg-[var(--color-surface-low)] disabled:opacity-50"
          :disabled="capturing"
          @click="handleWhatsApp"
        >
          <MessageCircle :size="18" />
          WhatsApp
        </button>
        <button
          type="button"
          class="flex flex-col items-center gap-1 rounded-xl bg-[var(--color-surface-card)] px-2 py-3 text-[10px] font-medium text-[var(--color-text-secondary)] shadow-sm transition hover:bg-[var(--color-surface-low)] disabled:opacity-50"
          :disabled="capturing"
          @click="handleTwitter"
        >
          <svg xmlns="http://www.w3.org/2000/svg" :width="18" :height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
          X
        </button>
        <button
          type="button"
          class="flex flex-col items-center gap-1 rounded-xl bg-[var(--color-surface-card)] px-2 py-3 text-[10px] font-medium text-[var(--color-text-secondary)] shadow-sm transition hover:bg-[var(--color-surface-low)] disabled:opacity-50"
          :disabled="capturing"
          @click="handleDownload"
        >
          <Loader2 v-if="capturing" :size="18" class="animate-spin text-[var(--color-primary)]" />
          <Download v-else :size="18" />
          {{ capturing ? '…' : 'Download' }}
        </button>
      </div>
    </div>
  </div>
</template>
