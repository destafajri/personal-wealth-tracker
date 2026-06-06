<script setup lang="ts">
import { Download, Moon, ShieldCheck, Sun } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { t, tm } from '~/lib/copy/strings'
import { useDerivedStore } from '~/stores/derived'
import { useSnapshotStore } from '~/stores/snapshot'
import { useXlsx } from '~/composables/useXlsx'
import { useTheme } from '~/composables/useTheme'

const derived = useDerivedStore()
const snap = useSnapshotStore()
const downloadDisabled = computed(() => derived.totalAset === 0)
const { resolved, toggle: toggleTheme } = useTheme()

// useXlsx dynamic-imports SheetJS on first call, so the first click pays the
// ~700KB chunk cost. Subsequent clicks reuse the cached module — keep
// `downloading` to gate concurrent clicks and surface "Menyusun…" affordance.
const xlsx = useXlsx()
const downloading = ref(false)
async function onDownload() {
  if (downloadDisabled.value || downloading.value) return
  downloading.value = true
  try {
    await xlsx.download()
  } finally {
    downloading.value = false
  }
}
</script>

<template>
  <header
    class="sticky top-0 z-30 h-16 border-b border-[var(--color-border)] bg-[var(--color-surface-card)]/90 backdrop-blur"
  >
    <div class="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 sm:px-10">
      <NuxtLink to="/" class="flex items-center gap-2">
        <span
          class="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-input)] bg-[var(--color-primary)] shadow-[var(--shadow-sm)]"
        >
          <ShieldCheck class="h-3.5 w-3.5 text-white" :stroke-width="2.5" />
        </span>
        <span class="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
          {{ t('brand.name') }}
        </span>
        <span class="hidden text-xs text-[var(--color-text-secondary)] sm:inline">
          {{ tm('nav.brand.subtitle', snap.mode) }}
        </span>
      </NuxtLink>

      <div class="flex items-center gap-2">
        <button
          type="button"
          :aria-label="resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
          class="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-low)] hover:text-[var(--color-text-primary)]"
          @click="toggleTheme"
        >
          <Sun v-if="resolved === 'dark'" :size="18" />
          <Moon v-else :size="18" />
        </button>

        <button
          type="button"
        :disabled="downloadDisabled || downloading"
        :title="downloadDisabled ? t('nav.download.empty') : undefined"
        class="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] px-4 py-1.5 text-sm font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-surface-low)] disabled:cursor-not-allowed disabled:opacity-50"
        @click="onDownload"
      >
        <Download :size="16" />
        <span class="hidden sm:inline">
          {{ downloading ? t('nav.download.pending') : t('nav.download.label') }}
        </span>
      </button>
      </div>
    </div>
  </header>
</template>
