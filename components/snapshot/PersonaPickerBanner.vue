<script setup lang="ts">
import { ref } from 'vue'
import { Sparkles, X } from 'lucide-vue-next'
import { PERSONAS, applyPersona, type SamplePersona } from '~/lib/fixtures/personas'
import { useSnapshotStore } from '~/stores/snapshot'
import { useGoalsStore } from '~/stores/goals'

// Phase 8.2 — Inline dismissible banner shown above the tab bar on /app/snapshot
// when the snapshot is empty + not in demo mode + not previously dismissed.
// Offers 5 template personas that pre-fill a realistic editable starting snapshot.
//
// Hide paths (hybrid A+B per spec §7):
// - User picks persona → applyPersona + set localStorage flag (permanent)
// - User clicks "Lewati" → set localStorage flag (permanent)
// - User starts typing data (hasData becomes true) → auto-hide, NO flag set
//   (so banner can resurface if data is later cleared)
//
// Phase-2 constraint: UI state only. No store changes beyond applyPersona.

const props = defineProps<{ hasData: boolean }>()

const snap = useSnapshotStore()
const goals = useGoalsStore()

const STORAGE_KEY = 'cermat.personaBannerDismissed'
const bannerDismissed = ref(false)

// Client-only localStorage init (avoid SSR hydration mismatch)
function initFromStorage() {
  if (!import.meta.client) return
  try {
    bannerDismissed.value = localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    // localStorage unavailable (privacy mode) — leave as false, banner just always shows
  }
}
initFromStorage()

const templatePersonas = PERSONAS.filter((p) => p.kind === 'template')

function setPermanentFlag() {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // best-effort; ignore storage failures
  }
  bannerDismissed.value = true
}

function pickPersona(p: SamplePersona) {
  applyPersona(snap, p, goals)
  setPermanentFlag()
}

function lewati() {
  setPermanentFlag()
}

// Visible only when: not demo, no data, not dismissed
const visible = () => !snap.isDemo && !props.hasData && !bannerDismissed.value
</script>

<template>
  <div
    v-if="visible()"
    class="rounded-[var(--radius-card)] border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 px-4 py-3 text-sm text-[var(--color-text-secondary)]"
    role="region"
    aria-label="Pemilih profil"
  >
    <div class="flex items-start gap-3">
      <Sparkles class="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary)]" />
      <div class="min-w-0 flex-1 space-y-2">
        <p class="font-medium text-[var(--color-text-primary)]">
          Pilih profil yang paling mirip, data otomatis keisi.
        </p>
        <p class="text-xs text-[var(--color-text-secondary)]">
          Kamu bisa edit bebas setelahnya.
        </p>
        <div class="flex flex-wrap gap-2 pt-1">
          <button
            v-for="p in templatePersonas"
            :key="p.id"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-[var(--color-border)] bg-[var(--color-surface-card)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
            @click="pickPersona(p)"
          >
            <span>{{ p.emoji }}</span>
            <span>{{ p.nama }}</span>
          </button>
        </div>
        <button
          type="button"
          class="text-xs text-[var(--color-text-muted)] underline-offset-2 transition hover:text-[var(--color-text-secondary)] hover:underline"
          @click="lewati"
        >
          Lewati, aku isi sendiri
        </button>
      </div>
      <button
        type="button"
        aria-label="Tutup pemilih profil"
        class="shrink-0 rounded p-1 text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-card)] hover:text-[var(--color-text-primary)]"
        @click="lewati"
      >
        <X :size="14" />
      </button>
    </div>
  </div>
</template>
