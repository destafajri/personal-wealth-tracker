<script setup lang="ts">
import { RotateCcw } from 'lucide-vue-next'
import { useSnapshotStore } from '~/stores/snapshot'

// Phase 8.2 — Global "Ganti Profil" reset button in app layout top nav.
// Clears snapshot + localStorage persona flag, then navigates to /app/snapshot
// where the PersonaPickerBanner reappears (since both data + flag are gone).
//
// Hidden when snap.isDemo (demo banner has its own reset already).
// Guarded by window.confirm() to prevent accidental data loss.

const snap = useSnapshotStore()

function handleReset() {
  if (!window.confirm('Reset semua data dan mulai dari profil?')) return
  snap.reset()
  if (import.meta.client) {
    try {
      localStorage.removeItem('cermat.personaBannerDismissed')
    } catch {
      // best-effort
    }
  }
  navigateTo('/app/snapshot')
}
</script>

<template>
  <button
    v-if="!snap.isDemo"
    type="button"
    aria-label="Reset data & ganti profil"
    title="Reset data & ganti profil"
    class="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-surface-card)] text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
    @click="handleReset"
  >
    <RotateCcw :size="16" :stroke-width="1.75" />
  </button>
</template>
