<script setup lang="ts">
import { X, AlertTriangle, CheckCircle, Loader2 } from 'lucide-vue-next'
import { watch, nextTick, ref, onBeforeUnmount, onMounted } from 'vue'
import { useImportXlsx, type ImportPhase } from '~/composables/useImportXlsx'
import { t } from '~/lib/copy/strings'
import { idr } from '~/lib/format/idr'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const { phase, result, errorMessage, confirmImport, cancelImport, resetToIdle } = useImportXlsx()
const panelRef = ref<HTMLElement | null>(null)

let prevBodyOverflow: string | null = null

function lockBodyScroll() {
  if (typeof document === 'undefined') return
  prevBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
}

function unlockBodyScroll() {
  if (typeof document === 'undefined') return
  if (prevBodyOverflow !== null) {
    document.body.style.overflow = prevBodyOverflow
    prevBodyOverflow = null
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close')
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      lockBodyScroll()
      await nextTick()
      panelRef.value?.focus()
    } else {
      unlockBodyScroll()
      resetToIdle()
    }
  },
)

watch(phase, (p) => {
  if (p === 'done') {
    setTimeout(() => emit('close'), 800)
  }
})

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  unlockBodyScroll()
})

function formatPhase(p: ImportPhase): string {
  switch (p) {
    case 'validating': return 'Memvalidasi file…'
    case 'importing': return 'Mengimpor data…'
    default: return ''
  }
}

// Summary counts for preview
function countItems(): Record<string, number> {
  const snap = result.value?.snapshot
  if (!snap) return {}
  return {
    'Penghasilan lain': snap.penghasilanLain.length,
    'Aset likuid':
      snap.asetLikuid.kas.length +
      snap.asetLikuid.deposito.length +
      snap.asetLikuid.reksaDana.length +
      snap.asetLikuid.sbn.length,
    'Aset non-likuid':
      snap.asetNonLikuid.properti.length +
      snap.asetNonLikuid.kendaraan.length +
      snap.asetNonLikuid.pensiun.length,
    'Saham': snap.saham.length,
    'Crypto': snap.crypto.length,
    'Cicilan': snap.cicilanAktif.length,
    'Utang pribadi': snap.utangPribadi.length,
    'Gadai': snap.gadai.length,
  }
}

function errorDisplay(): string {
  const key = errorMessage.value
  try {
    return t(key as keyof typeof import('~/lib/copy/strings').copy)
  } catch {
    return key
  }
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      role="dialog"
      aria-modal="true"
      @click.self="emit('close')"
    >
      <div
        ref="panelRef"
        tabindex="-1"
        class="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[var(--radius-card)] bg-[var(--color-surface-card)] p-6 shadow-[var(--shadow-modal)] focus:outline-none"
      >
        <header class="mb-4 flex items-start justify-between gap-4">
          <h2 class="text-lg font-bold text-[var(--color-text-primary)]">
            Import Data
          </h2>
          <button
            type="button"
            aria-label="Tutup"
            class="rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-low)] hover:text-[var(--color-text-primary)]"
            @click="emit('close')"
          >
            <X :size="18" />
          </button>
        </header>

        <!-- Validating / Importing spinner -->
        <div
          v-if="phase === 'validating' || phase === 'importing'"
          class="flex flex-col items-center gap-3 py-8"
        >
          <Loader2 class="h-8 w-8 animate-spin text-[var(--color-primary)]" />
          <p class="text-sm text-[var(--color-text-secondary)]">
            {{ formatPhase(phase) }}
          </p>
        </div>

        <!-- Preview -->
        <div v-if="phase === 'preview' && result?.ok" class="space-y-4">
          <p class="text-sm text-[var(--color-text-primary)]">
            Data ditemukan dalam file:
          </p>

          <div class="rounded-[var(--radius-input)] bg-[var(--color-surface-low)] p-3">
            <div
              v-for="(count, label) in countItems()"
              :key="label"
              class="flex items-center justify-between py-1 text-xs"
            >
              <span class="text-[var(--color-text-secondary)]">{{ label }}</span>
              <span class="tabular-nums font-medium text-[var(--color-text-primary)]">{{ count }}</span>
            </div>
            <div
              v-if="result.goalsData?.goals.length"
              class="flex items-center justify-between border-t border-[var(--color-border)] py-1 text-xs"
            >
              <span class="text-[var(--color-text-secondary)]">Goals</span>
              <span class="tabular-nums font-medium text-[var(--color-text-primary)]">
                {{ result.goalsData.goals.length }}
              </span>
            </div>
          </div>

          <div
            v-if="result.warnings.length > 0"
            class="rounded-[var(--radius-input)] border border-[var(--color-warning-amber)] bg-[var(--color-warning-amber-soft)] p-3"
          >
            <div class="mb-1 flex items-center gap-1.5 text-xs font-medium text-[var(--color-warning-amber)]">
              <AlertTriangle :size="14" />
              Peringatan
            </div>
            <ul class="list-inside list-disc text-xs text-[var(--color-text-primary)]">
              <li v-for="(w, i) in result.warnings" :key="i">{{ w.detail }}</li>
            </ul>
          </div>

          <p class="text-xs text-[var(--color-text-muted)]">
            Data saat ini akan ditimpa dengan data dari file ini.
          </p>

          <footer class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              class="rounded-[var(--radius-input)] border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-low)]"
              @click="cancelImport(); emit('close')"
            >
              Batal
            </button>
            <button
              type="button"
              class="rounded-[var(--radius-input)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
              @click="confirmImport()"
            >
              Konfirmasi Import
            </button>
          </footer>
        </div>

        <!-- Done -->
        <div
          v-if="phase === 'done'"
          class="flex flex-col items-center gap-3 py-8"
        >
          <CheckCircle class="h-8 w-8 text-[var(--color-accent-emerald)]" />
          <p class="text-sm text-[var(--color-text-primary)]">Data berhasil diimpor</p>
        </div>

        <!-- Error -->
        <div
          v-if="phase === 'error'"
          class="space-y-4"
        >
          <div class="rounded-[var(--radius-input)] border border-[var(--color-danger-rose)] bg-[var(--color-danger-rose-soft)] p-4">
            <p class="text-sm text-[var(--color-danger-rose)]">{{ errorDisplay() }}</p>
          </div>
          <footer class="flex justify-end">
            <button
              type="button"
              class="rounded-[var(--radius-input)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
              @click="emit('close')"
            >
              Tutup
            </button>
          </footer>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 120ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
