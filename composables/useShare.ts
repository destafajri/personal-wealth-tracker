import { computed, ref, type Ref } from 'vue'
import { t } from '~/lib/copy/strings'
import type { PersonaKey } from '~/lib/finance/persona'

const APP_URL = 'https://cermat.vercel.app'

export function useShare(personaKey: Ref<PersonaKey | null>) {
  const copying = ref(false)

  const shareText = computed(() => {
    const label = personaKey.value
      ? t(`persona.${personaKey.value}.label` as import('~/lib/copy/strings').CopyKey)
      : 'Financially Cermat'
    return `Aku ${label}! ✨ Cek keuanganmu juga di Cermat × Mamikos!\n${APP_URL}`
  })

  async function copyToClipboard() {
    copying.value = true
    try {
      await navigator.clipboard.writeText(shareText.value)
    } finally {
      setTimeout(() => { copying.value = false }, 1500)
    }
  }

  function shareWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText.value)}`
    window.open(url, '_blank')
  }

  function shareTwitter() {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText.value)}`
    window.open(url, '_blank')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function downloadImage(el: any) {
    if (!el) return
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(el, {
      scale: 2,
      backgroundColor: null,
      useCORS: true,
    })
    const link = document.createElement('a')
    link.download = `cermat-${personaKey.value ?? 'share'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return {
    shareText,
    copying,
    copyToClipboard,
    shareWhatsApp,
    shareTwitter,
    downloadImage,
  }
}
