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

interface DetailSection { title: string; items: Array<{ label: string; value: string }> }

function fmtCur(amount: number, currency?: string): string {
  if (!currency || currency === 'IDR') return idr(amount)
  return `${amount.toLocaleString('id-ID')} ${currency}`
}

function detailSections(): DetailSection[] {
  const snap = result.value?.snapshot
  if (!snap) return []
  const sections: DetailSection[] = []

  // Penghasilan
  const pengItems: DetailSection['items'] = []
  if (snap.penghasilan.amount) pengItems.push({ label: 'Gaji', value: fmtCur(snap.penghasilan.amount, snap.penghasilan.currency) })
  for (const r of snap.penghasilanLain) {
    if (r.amount) pengItems.push({ label: r.label, value: fmtCur(r.amount, r.currency) })
  }
  if (pengItems.length) sections.push({ title: 'Penghasilan', items: pengItems })

  // Pengeluaran
  const pgjItems: DetailSection['items'] = []
  if (snap.pengeluaran.pokok) pgjItems.push({ label: 'Pokok', value: fmtCur(snap.pengeluaran.pokok, snap.pengeluaran.pokokCurrency) })
  if (snap.pengeluaran.lifestyle) pgjItems.push({ label: 'Lifestyle', value: fmtCur(snap.pengeluaran.lifestyle, snap.pengeluaran.lifestyleCurrency) })
  for (const r of snap.pengeluaranLain) {
    if (r.amount) pgjItems.push({ label: r.label, value: fmtCur(r.amount, r.currency) })
  }
  if (pgjItems.length) sections.push({ title: 'Pengeluaran', items: pgjItems })

  // Aset Likuid
  const likuidMap: Record<string, string> = { kas: 'Kas', deposito: 'Deposito', reksaDana: 'Reksa Dana', sbn: 'SBN' }
  for (const [key, label] of Object.entries(likuidMap)) {
    const rows = (snap.asetLikuid as Record<string, Array<{ label: string; amount: number; currency?: string }>>)[key]
    if (rows?.length) {
      sections.push({ title: label, items: rows.map(r => ({ label: r.label, value: fmtCur(r.amount, r.currency) })) })
    }
  }

  // Aset Non-Likuid
  const nonLikuidMap: Record<string, string> = { properti: 'Properti', kendaraan: 'Kendaraan', pensiun: 'Pensiun' }
  for (const [key, label] of Object.entries(nonLikuidMap)) {
    const rows = (snap.asetNonLikuid as Record<string, Array<{ label: string; amount: number }>>)[key]
    if (rows?.length) {
      sections.push({ title: label, items: rows.map(r => ({ label: r.label, value: idr(r.amount) })) })
    }
  }

  // Saham
  if (snap.saham.length) {
    sections.push({ title: 'Saham', items: snap.saham.map(s => ({ label: s.ticker, value: `${s.lot} lot` })) })
  }

  // Emas — gram per kategori
  const emasItems: DetailSection['items'] = []
  const emasLabels: Record<string, string> = {
    digitalGram: 'Emas Digital',
    fisikAntamGram: 'Emas Antam',
    perhiasan18KGram: 'Perhiasan 18K',
    perhiasan14KGram: 'Perhiasan 14K',
    perhiasan10KGram: 'Perhiasan 10K',
  }
  for (const [key, label] of Object.entries(emasLabels)) {
    const gram = (snap.emas as Record<string, number>)[key]
    if (gram) emasItems.push({ label, value: `${gram.toFixed(1)} g` })
  }
  if (emasItems.length) sections.push({ title: 'Emas', items: emasItems })

  // Crypto — units or amount depending on mode
  if (snap.crypto.length) {
    sections.push({
      title: 'Crypto',
      items: snap.crypto.map(c => ({
        label: c.coinId,
        value: c.mode === 'unit' ? `${c.units} unit` : idr(c.amount),
      })),
    })
  }

  // Cicilan
  if (snap.cicilanAktif.length) {
    sections.push({ title: 'Cicilan', items: snap.cicilanAktif.map(c => ({ label: c.label, value: idr(c.sisaPokok) })) })
  }

  // Utang Pribadi
  if (snap.utangPribadi.length) {
    sections.push({ title: 'Utang Pribadi', items: snap.utangPribadi.map(u => ({ label: u.label, value: idr(u.sisaPokok) })) })
  }

  // Gadai
  if (snap.gadai.length) {
    sections.push({ title: 'Gadai', items: snap.gadai.map(g => ({ label: g.label, value: idr(g.piutangIdr) })) })
  }

  return sections
}

function financialSummary(): { penghasilan: number; pengeluaran: number; totalAset: number; totalUtang: number } {
  const snap = result.value?.snapshot
  if (!snap) return { penghasilan: 0, pengeluaran: 0, totalAset: 0, totalUtang: 0 }
  const sumAmount = (rows: Array<{ amount?: number }>) => rows.reduce((s, r) => s + (r.amount || 0), 0)
  const sumLikuid = (obj: Record<string, Array<{ amount?: number }>>) => Object.values(obj).reduce((s, rows) => s + sumAmount(rows), 0)
  const sumSisa = (rows: Array<{ sisaPokok?: number }>) => rows.reduce((s, r) => s + (r.sisaPokok || 0), 0)
  return {
    penghasilan: (snap.penghasilan.amount || 0) + sumAmount(snap.penghasilanLain as unknown as Array<{ amount?: number }>),
    pengeluaran: (snap.pengeluaran.pokok || 0) + (snap.pengeluaran.lifestyle || 0) + sumAmount(snap.pengeluaranLain as unknown as Array<{ amount?: number }>),
    totalAset: sumLikuid(snap.asetLikuid as unknown as Record<string, Array<{ amount?: number }>>) + sumLikuid(snap.asetNonLikuid as unknown as Record<string, Array<{ amount?: number }>>),
    totalUtang: sumSisa(snap.cicilanAktif as unknown as Array<{ sisaPokok?: number }>) + sumSisa(snap.utangPribadi as unknown as Array<{ sisaPokok?: number }>),
  }
}

function formatExportDate(iso?: string): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return iso
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
          <div class="flex items-center justify-between">
            <p class="text-sm text-[var(--color-text-primary)]">
              Data ditemukan dalam file:
            </p>
            <span v-if="result.exportedAt" class="text-xs text-[var(--color-text-muted)]">
              {{ formatExportDate(result.exportedAt) }}
            </span>
          </div>

          <!-- Financial summary -->
          <div class="grid grid-cols-2 gap-2">
            <div class="rounded-[var(--radius-input)] bg-[var(--color-surface-low)] px-3 py-2">
              <p class="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">Penghasilan</p>
              <p class="text-sm font-semibold tabular-nums text-[var(--color-accent-emerald)]">{{ idr(financialSummary().penghasilan) }}</p>
            </div>
            <div class="rounded-[var(--radius-input)] bg-[var(--color-surface-low)] px-3 py-2">
              <p class="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">Pengeluaran</p>
              <p class="text-sm font-semibold tabular-nums text-[var(--color-danger-rose)]">{{ idr(financialSummary().pengeluaran) }}</p>
            </div>
            <div class="rounded-[var(--radius-input)] bg-[var(--color-surface-low)] px-3 py-2">
              <p class="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">Total Aset</p>
              <p class="text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">{{ idr(financialSummary().totalAset) }}</p>
            </div>
            <div class="rounded-[var(--radius-input)] bg-[var(--color-surface-low)] px-3 py-2">
              <p class="text-[10px] uppercase tracking-wide text-[var(--color-text-muted)]">Total Utang</p>
              <p class="text-sm font-semibold tabular-nums text-[var(--color-danger-rose)]">{{ idr(financialSummary().totalUtang) }}</p>
            </div>
          </div>

          <!-- Detail breakdown per section -->
          <div class="space-y-2.5">
            <details
              v-for="(section, si) in detailSections()"
              :key="si"
              class="rounded-[var(--radius-input)] bg-[var(--color-surface-low)]"
            >
              <summary class="flex cursor-pointer items-center justify-between px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                <span>{{ section.title }}</span>
                <span class="tabular-nums text-[var(--color-text-muted)]">{{ section.items.length }} item</span>
              </summary>
              <div class="border-t border-[var(--color-border)] px-3 py-1.5">
                <div
                  v-for="(item, ii) in section.items"
                  :key="ii"
                  class="flex items-center justify-between py-1 text-xs"
                >
                  <span class="text-[var(--color-text-secondary)]">{{ item.label }}</span>
                  <span class="tabular-nums font-medium text-[var(--color-text-primary)]">{{ item.value }}</span>
                </div>
              </div>
            </details>

            <!-- Goals summary -->
            <div
              v-if="result.goalsData?.goals.length"
              class="rounded-[var(--radius-input)] bg-[var(--color-surface-low)] px-3 py-2"
            >
              <div class="flex items-center justify-between text-xs">
                <span class="font-medium text-[var(--color-text-secondary)]">Goals</span>
                <span class="tabular-nums text-[var(--color-text-muted)]">{{ result.goalsData.goals.length }} goal</span>
              </div>
              <div class="mt-1 space-y-1">
                <div
                  v-for="(g, gi) in result.goalsData.goals"
                  :key="gi"
                  class="flex items-center justify-between text-xs"
                >
                  <span class="text-[var(--color-text-secondary)]">{{ g.label }}</span>
                  <span class="tabular-nums font-medium text-[var(--color-text-primary)]">{{ idr(g.targetIdr) }}</span>
                </div>
              </div>
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
