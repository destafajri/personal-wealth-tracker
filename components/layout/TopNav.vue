<script setup lang="ts">
import { Download, Moon, ShieldCheck, Sun, Upload } from 'lucide-vue-next'
import { computed, nextTick, ref } from 'vue'
import { t, tm } from '~/lib/copy/strings'
import { useDerivedStore } from '~/stores/derived'
import { useSnapshotStore } from '~/stores/snapshot'
import { useXlsx } from '~/composables/useXlsx'
import { usePdf } from '~/composables/usePdf'
import { useTheme } from '~/composables/useTheme'
import { useToast } from '~/composables/useToast'
import { useImportXlsx } from '~/composables/useImportXlsx'
import ImportModal from '~/components/layout/ImportModal.vue'

const derived = useDerivedStore()
const snap = useSnapshotStore()
const toast = useToast()
const { resolved, toggle: toggleTheme } = useTheme()

// Disabled only when snapshot is completely empty
const downloadDisabled = computed(() =>
  derived.totalAset === 0 &&
  derived.totalUtang === 0 &&
  derived.penghasilanMonthlyIdr === 0,
)

type DownloadPhase = 'idle' | 'xlsx' | 'pdf'
const phase = ref<DownloadPhase>('idle')

const xlsx = useXlsx()
const pdf = usePdf()

async function onDownloadReport() {
  if (downloadDisabled.value || phase.value !== 'idle') return
  try {
    phase.value = 'xlsx'
    await nextTick()
    await xlsx.download()

    phase.value = 'pdf'
    await nextTick()
    await pdf.generatePdf()

    // Success toast with retry links
    toast.showToast(t('toast.download.downloading'), {
      type: 'info',
      durationMs: 5000,
      actions: [
        { label: t('toast.download.retryPdf'), handler: () => pdf.generatePdf() },
        { label: t('toast.download.retryXlsx'), handler: () => xlsx.download() },
      ],
    })
  } catch {
    if (phase.value === 'xlsx') {
      toast.showToast(t('toast.download.allFailed'), { type: 'error' })
    } else {
      toast.showToast(t('toast.download.pdfFailed'), {
        type: 'error',
        actions: [
          { label: t('toast.download.retryPdf'), handler: () => pdf.generatePdf() },
        ],
      })
    }
  } finally {
    phase.value = 'idle'
  }
}

function downloadLabel(): string {
  if (phase.value === 'xlsx') return t('nav.download.pendingXlsx')
  if (phase.value === 'pdf') return t('nav.download.pendingPdf')
  return t('nav.download.label')
}

// Import flow
const { selectFile } = useImportXlsx()
const importOpen = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function onImportClick() {
  fileInput.value?.click()
}

async function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  importOpen.value = true
  await selectFile(file)
  input.value = ''
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

        <input
          ref="fileInput"
          type="file"
          accept=".xlsx"
          class="hidden"
          @change="onFileSelected"
        />
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] px-4 py-1.5 text-sm font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-surface-low)]"
          @click="onImportClick"
        >
          <Upload :size="16" />
          <span class="hidden sm:inline">Import</span>
        </button>

        <button
          type="button"
          :disabled="downloadDisabled || phase !== 'idle'"
          :title="downloadDisabled ? t('nav.download.empty') : undefined"
          class="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border)] px-4 py-1.5 text-sm font-medium text-[var(--color-text-primary)] transition hover:bg-[var(--color-surface-low)] disabled:cursor-not-allowed disabled:opacity-50"
          @click="onDownloadReport"
        >
          <Download :size="16" />
          <span class="hidden sm:inline">{{ downloadLabel() }}</span>
        </button>
      </div>
    </div>
  </header>

  <ImportModal :open="importOpen" @close="importOpen = false" />
</template>
