<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Copy, Download, MessageCircle, Share, X } from 'lucide-vue-next'
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

const { captureAsPng, copyText, shareToWa, shareToTwitter, shareNative, isMobileShareCapable } = useShare()
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
  props.aspectRatio === '9:16' ? 'w-[360px] h-[640px]' : 'w-[360px] h-[360px]',
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
  try {
    const blob = await captureAsPng(cardRef.value as HTMLElement)
    const link = document.createElement('a')
    link.download = props.downloadName
    link.href = URL.createObjectURL(blob)
    link.click()
    URL.revokeObjectURL(link.href)
    toast.showToast('Kartu berhasil diunduh!', { type: 'success', durationMs: 2000 })
  } catch {
    toast.showToast(t('share.captureError'), { type: 'error', durationMs: 3000 })
  } finally {
    capturing.value = false
  }
}

async function handleNativeShare() {
  if (!cardRef.value) {
    toast.showToast(t('share.captureError'), { type: 'error', durationMs: 3000 })
    return
  }
  capturing.value = true
  try {
    const blob = await captureAsPng(cardRef.value as HTMLElement)
    const file = new File([blob], props.downloadName, { type: 'image/png' })
    const ok = await shareNative({ files: [file], text: props.shareText, title: 'Cermat' })
    if (!ok) {
      await handleDownload()
    }
  } catch {
    toast.showToast(t('share.captureError'), { type: 'error', durationMs: 3000 })
  } finally {
    capturing.value = false
  }
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    @click.self="handleClose"
  >
    <div class="relative w-full max-w-sm">
      <!-- Close button -->
      <button
        type="button"
        class="absolute -top-2 -right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 shadow-lg hover:bg-gray-100"
        @click="handleClose"
      >
        <X :size="16" />
      </button>

      <!-- Card content slot (captured for PNG) -->
      <div ref="cardRef" :class="['overflow-hidden rounded-2xl', cardDimensions]">
        <slot />
      </div>

      <!-- Controls slot (NOT captured — stats toggle, etc.) -->
      <div v-if="$slots.controls" class="mt-2">
        <slot name="controls" />
      </div>

      <!-- Loading overlay -->
      <div
        v-if="capturing"
        class="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-black/40"
      >
        <p class="text-sm font-medium text-white">{{ t('share.captureLoading') }}</p>
      </div>

      <!-- Mobile: native share primary -->
      <button
        v-if="isMobile"
        type="button"
        class="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        @click="handleNativeShare"
      >
        <Share :size="18" />
        {{ t('share.nativeButton') }}
      </button>

      <!-- Desktop: grid of 4 buttons -->
      <div v-else class="mt-3 grid grid-cols-4 gap-2">
        <button
          type="button"
          class="flex flex-col items-center gap-1 rounded-xl bg-[var(--color-surface-card)] px-2 py-3 text-[10px] font-medium text-[var(--color-text-secondary)] shadow-sm transition hover:bg-[var(--color-surface-low)]"
          @click="handleCopy"
        >
          <Copy :size="18" :class="copying ? 'text-[var(--color-primary)]' : ''" />
          {{ copying ? 'Tersalin!' : 'Salin' }}
        </button>
        <button
          type="button"
          class="flex flex-col items-center gap-1 rounded-xl bg-[var(--color-surface-card)] px-2 py-3 text-[10px] font-medium text-[var(--color-text-secondary)] shadow-sm transition hover:bg-[var(--color-surface-low)]"
          @click="handleWhatsApp"
        >
          <MessageCircle :size="18" />
          WhatsApp
        </button>
        <button
          type="button"
          class="flex flex-col items-center gap-1 rounded-xl bg-[var(--color-surface-card)] px-2 py-3 text-[10px] font-medium text-[var(--color-text-secondary)] shadow-sm transition hover:bg-[var(--color-surface-low)]"
          @click="handleTwitter"
        >
          <svg xmlns="http://www.w3.org/2000/svg" :width="18" :height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
          X
        </button>
        <button
          type="button"
          class="flex flex-col items-center gap-1 rounded-xl bg-[var(--color-surface-card)] px-2 py-3 text-[10px] font-medium text-[var(--color-text-secondary)] shadow-sm transition hover:bg-[var(--color-surface-low)]"
          @click="handleDownload"
        >
          <Download :size="18" />
          Download
        </button>
      </div>
    </div>
  </div>
</template>
