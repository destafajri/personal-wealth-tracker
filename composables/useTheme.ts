import { computed, onMounted, ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'cermat-theme'

// Module-scope singleton — avoids duplicate onMounted/watch when multiple
// components call useTheme() in the same page (TopNav + layout).
const mode = ref<ThemeMode>('light')
const resolved = ref<'light' | 'dark'>('light')
let initialized = false

function applyTheme(dark: boolean) {
  if (import.meta.client) {
    document.documentElement.classList.toggle('dark', dark)
    resolved.value = dark ? 'dark' : 'light'
  }
}

function initOnce() {
  if (initialized || !import.meta.client) return
  initialized = true
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') {
    mode.value = stored
  }
  applyTheme(mode.value === 'dark')
}

// Single watcher at module scope — fires once regardless of how many
// components call useTheme().
watch(mode, (val) => {
  if (import.meta.client) {
    localStorage.setItem(STORAGE_KEY, val)
  }
  applyTheme(val === 'dark')
})

export function useTheme() {
  onMounted(initOnce)

  function toggle() {
    mode.value = resolved.value === 'dark' ? 'light' : 'dark'
  }

  return {
    mode,
    resolved: computed(() => resolved.value),
    toggle,
  }
}
