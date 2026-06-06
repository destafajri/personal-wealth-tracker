import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'auto'

const STORAGE_KEY = 'cermat-theme'
const DARK_START = 18 // 18:00
const DARK_END = 6   // 06:00

function isNightTime(): boolean {
  const h = new Date().getHours()
  return h >= DARK_START || h < DARK_END
}

// Module-scope singleton — avoids duplicate onMounted/watch when multiple
// components call useTheme() in the same page (TopNav + layout).
const mode = ref<ThemeMode>('auto')
const resolved = ref<'light' | 'dark'>('light')
let initialized = false
let autoInterval: ReturnType<typeof setInterval> | null = null

function applyTheme(dark: boolean) {
  if (import.meta.client) {
    document.documentElement.classList.toggle('dark', dark)
    resolved.value = dark ? 'dark' : 'light'
  }
}

function resolveAuto(): 'light' | 'dark' {
  return isNightTime() ? 'dark' : 'light'
}

function applyFromMode() {
  if (mode.value === 'auto') {
    applyTheme(resolveAuto() === 'dark')
  } else {
    applyTheme(mode.value === 'dark')
  }
}

function startAutoTick() {
  if (autoInterval) return
  autoInterval = setInterval(() => {
    if (mode.value === 'auto') applyFromMode()
  }, 60_000) // check every minute
}

function stopAutoTick() {
  if (autoInterval) {
    clearInterval(autoInterval)
    autoInterval = null
  }
}

function initOnce() {
  if (initialized || !import.meta.client) return
  initialized = true
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'auto') {
    mode.value = stored
  }
  applyFromMode()
  startAutoTick()
}

watch(mode, (val) => {
  if (import.meta.client) {
    localStorage.setItem(STORAGE_KEY, val)
  }
  applyFromMode()
  if (val === 'auto') startAutoTick()
  else stopAutoTick()
})

export function useTheme() {
  onMounted(initOnce)
  onUnmounted(stopAutoTick)

  const nextMap: Record<ThemeMode, ThemeMode> = { light: 'dark', dark: 'auto', auto: 'light' }

  function toggle() {
    mode.value = nextMap[mode.value]
  }

  return {
    mode,
    resolved: computed(() => resolved.value),
    toggle,
  }
}
