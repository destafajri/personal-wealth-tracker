import { computed, onMounted, ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'cermat-theme'

const mode = ref<ThemeMode>('light')
const resolved = ref<'light' | 'dark'>('light')

function applyTheme(dark: boolean) {
  if (import.meta.client) {
    document.documentElement.classList.toggle('dark', dark)
    resolved.value = dark ? 'dark' : 'light'
  }
}

export function useTheme() {
  onMounted(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') {
      mode.value = stored
    }
    applyTheme(mode.value === 'dark')
  })

  watch(mode, (val) => {
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, val)
    }
    applyTheme(val === 'dark')
  })

  function toggle() {
    mode.value = resolved.value === 'dark' ? 'light' : 'dark'
  }

  return {
    mode,
    resolved: computed(() => resolved.value),
    toggle,
  }
}
