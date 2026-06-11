export function getAppUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin
  return 'https://cermat-personal-wealth-tracker.vercel.app'
}

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
    const { toPng } = await import('html-to-image')
    const dataUrl = await withTimeout(
      toPng(el, { pixelRatio: 2 }),
      15_000,
    )
    const link = document.createElement('a')
    link.download = filename
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  async function captureAsBlob(el: HTMLElement): Promise<Blob> {
    const { toBlob } = await import('html-to-image')
    const blob = await withTimeout(
      toBlob(el, { pixelRatio: 2 }),
      15_000,
    )
    if (!blob) throw new Error('toBlob returned null')
    return blob
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
