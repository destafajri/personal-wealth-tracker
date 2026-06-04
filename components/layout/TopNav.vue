<script setup lang="ts">
import { Download, ShieldCheck } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { t } from '~/lib/copy/strings'
import { useDerivedStore } from '~/stores/derived'
import { useXlsx } from '~/composables/useXlsx'

const derived = useDerivedStore()
const downloadDisabled = computed(() => derived.totalAset === 0)

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
          {{ t('nav.brand.subtitle') }}
        </span>
      </NuxtLink>

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
  </header>
</template>
