<script setup lang="ts">
import { computed } from 'vue'
import { Trash2, X } from 'lucide-vue-next'
import { useUndoDelete, type UndoPanelKind } from '~/composables/useUndoDelete'
import ButtonSecondary from '~/components/common/ButtonSecondary.vue'

// Phase 8.6 — Toast that surfaces the most recent deletion with an Undo action.
// Reads from useUndoDelete singleton state. Renders only when lastDeleted is
// non-null. Position: fixed bottom-right on desktop, bottom-center full-width
// on mobile. Slide-in/out via Vue <Transition>.
//
// Auto-dismiss after 5s is handled by the composable's timer; this component
// just reacts to lastDeleted going null by leave-transitioning out.

const { lastDeleted, undo, dismiss } = useUndoDelete()

const PANEL_LABELS: Record<UndoPanelKind, string> = {
  utangPribadi: 'Utang Pribadi',
  gadai: 'Gadai',
  cicilan: 'Cicilan Aktif',
  kas: 'Kas',
  deposito: 'Deposito',
  reksaDana: 'Reksa Dana',
  sbn: 'SBN',
  properti: 'Properti',
  kendaraan: 'Kendaraan',
  pensiun: 'Dana Pensiun',
  penghasilanLain: 'Penghasilan Lain',
  pengeluaranLain: 'Pengeluaran Lain',
}

const message = computed(() => {
  if (!lastDeleted.value) return ''
  return `${PANEL_LABELS[lastDeleted.value.panelKind]} dihapus`
})
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0 sm:translate-y-0 sm:translate-x-full"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0 sm:translate-y-0 sm:translate-x-full"
  >
    <div
      v-if="lastDeleted"
      class="fixed inset-x-4 bottom-4 z-50 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-w-md"
      role="status"
      aria-live="polite"
    >
      <div
        class="flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-4 py-3 shadow-lg backdrop-blur-sm"
      >
        <Trash2
          :size="18"
          :stroke-width="1.75"
          class="shrink-0 text-[var(--color-text-muted)]"
        />
        <span class="flex-1 text-sm text-[var(--color-text-primary)]">
          {{ message }}
        </span>
        <ButtonSecondary
          class="!px-3 !py-1 text-xs"
          @click="undo"
        >
          Undo
        </ButtonSecondary>
        <button
          type="button"
          aria-label="Tutup"
          class="shrink-0 rounded p-1 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
          @click="dismiss"
        >
          <X :size="14" />
        </button>
      </div>
    </div>
  </Transition>
</template>
