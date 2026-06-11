export const APP_URL = 'https://cermat.vercel.app'

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Capture timed out')), ms)
    promise.then(
      (val) => { clearTimeout(timer); resolve(val) },
      (err) => { clearTimeout(timer); reject(err) },
    )
  })
}

export function useShare() {
  async function downloadAsPng(el: HTMLElement, filename: string): Promise<void> {
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await withTimeout(
      html2canvas(el, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      }),
      15_000,
    )
    const link = document.createElement('a')
    link.download = filename
    link.href = canvas.toDataURL('image/png')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  async function captureAsBlob(el: HTMLElement): Promise<Blob> {
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await withTimeout(
      html2canvas(el, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      }),
      15_000,
    )
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas toBlob returned null'))
      }, 'image/png')
    })
  }

  async function copyText(text: string): Promise<void> {
    await navigator.clipboard.writeText(text)
  }

  function shareToWa(text: string): void {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  function shareToTwitter(text: string): void {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  async function shareNative(opts: {
    files: File[]
    text: string
    title: string
  }): Promise<boolean> {
    if (!navigator.share || !navigator.canShare?.({ files: opts.files })) {
      return false
    }
    try {
      await navigator.share({ files: opts.files, text: opts.text, title: opts.title })
      return true
    } catch {
      return false
    }
  }

  function isMobileShareCapable(): boolean {
    if (typeof window === 'undefined') return false
    const hasCoarse = window.matchMedia?.('(pointer: coarse)')?.matches ?? false
    const canShareFiles =
      !!navigator.share && !!navigator.canShare?.({ files: [new File([], 'test.png', { type: 'image/png' })] })
    return hasCoarse && canShareFiles
  }

  return {
    downloadAsPng,
    captureAsBlob,
    copyText,
    shareToWa,
    shareToTwitter,
    shareNative,
    isMobileShareCapable,
  }
}
