<script setup lang="ts">
import { Download } from 'lucide-vue-next'
import { computed } from 'vue'
import { t } from '~/lib/copy/strings'
import { useDerivedStore } from '~/stores/derived'

const derived = useDerivedStore()
const downloadDisabled = computed(() => derived.totalAset === 0)
</script>

<template>
  <header
    class="sticky top-0 z-30 h-16 border-b border-[var(--color-border)] bg-[var(--color-surface-card)]/95 backdrop-blur"
  >
    <div class="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 sm:px-10">
      <NuxtLink to="/" class="flex items-baseline gap-2">
        <span class="text-xl font-bold tracking-tight text-[var(--color-primary-dark)]">
          {{ t('brand.name') }}
        </span>
        <span class="hidden text-xs text-[var(--color-text-secondary)] sm:inline">
          {{ t('nav.brand.subtitle') }}
        </span>
      </NuxtLink>

      <button
        type="button"
        :disabled="downloadDisabled"
        :title="downloadDisabled ? t('nav.download.empty') : undefined"
        class="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] px-4 py-1.5 text-sm font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-surface-low)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download :size="16" />
        <span class="hidden sm:inline">{{ t('nav.download.label') }}</span>
      </button>
    </div>
  </header>
</template>
