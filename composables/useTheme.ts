import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'cermat-theme'

const mode = ref<ThemeMode>('light')
const resolved = ref<'light' | 'dark'>('light')
let mediaQuery: MediaQueryList | null = null
let mediaHandler: ((e: MediaQueryListEvent) => void) | null = null

function applyTheme(dark: boolean) {
  if (import.meta.client) {
    document.documentElement.classList.toggle('dark', dark)
    resolved.value = dark ? 'dark' : 'light'
  }
}

function resolveSystem(): boolean {
  if (!import.meta.client) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function computeResolved() {
  if (mode.value === 'system') {
    applyTheme(resolveSystem())
  } else {
    applyTheme(mode.value === 'dark')
  }
}

export function useTheme() {
  onMounted(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      mode.value = stored
    }
    computeResolved()

    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaHandler = () => {
      if (mode.value === 'system') computeResolved()
    }
    mediaQuery.addEventListener('change', mediaHandler)
  })

  onUnmounted(() => {
    if (mediaQuery && mediaHandler) {
      mediaQuery.removeEventListener('change', mediaHandler)
    }
  })

  watch(mode, (val) => {
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, val)
    }
    computeResolved()
  })

  function toggle() {
    if (resolved.value === 'dark') {
      mode.value = 'light'
    } else {
      mode.value = 'dark'
    }
  }

  return {
    mode,
    resolved: computed(() => resolved.value),
    toggle,
  }
}
