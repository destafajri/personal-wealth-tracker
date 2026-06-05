// D11.3 — beforeunload guard. Trips when the user has typed *anything* into
// snapshot or goals, so a stray Cmd-R or tab close doesn't wipe in-progress
// input. State is client-only (no persistence yet), so the prompt is the only
// safety net we have for accidental reloads.
//
// Demo sessions skip the prompt: demo state is throwaway by design (re-seeded
// via ?demo=1, "Pakai data sendiri" resets in one click), so the warning would
// just be noise.
//
// Call once from layouts/app.vue so the guard is active across all /app/*
// routes without each page needing to opt in. Landing (/) has no input state,
// so it's not wired there.

import { computed, onBeforeUnmount, onMounted } from 'vue'
import { t } from '~/lib/copy/strings'
import { useDerivedStore } from '~/stores/derived'
import { useGoalsStore } from '~/stores/goals'
import { useSnapshotStore } from '~/stores/snapshot'

export interface DirtySignals {
  isDemo: boolean
  goalsCount: number
  penghasilanAmount: number
  penghasilanLainCount: number
  pengeluaranPokok: number
  pengeluaranLifestyle: number
  pengeluaranBiayaKos: number
  pengeluaranLainCount: number
  totalAset: number
  cicilanCount: number
  utangPribadiCount: number
  gadaiCount: number
}

// Pure predicate — extracted so it can be unit-tested without mounting Vue.
// Demo sessions always return false: demo state is throwaway by design
// (re-seedable via ?demo=1), so the prompt would just be noise.
export function isSnapshotDirty(s: DirtySignals): boolean {
  if (s.isDemo) return false
  if (s.goalsCount > 0) return true
  if (s.penghasilanAmount > 0) return true
  if (s.penghasilanLainCount > 0) return true
  if (s.pengeluaranPokok > 0 || s.pengeluaranLifestyle > 0 || s.pengeluaranBiayaKos > 0) return true
  if (s.pengeluaranLainCount > 0) return true
  if (s.totalAset > 0) return true
  if (s.cicilanCount > 0) return true
  if (s.utangPribadiCount > 0) return true
  if (s.gadaiCount > 0) return true
  return false
}

export function useDirtyGuard(): void {
  const snap = useSnapshotStore()
  const goals = useGoalsStore()
  const derived = useDerivedStore()

  const isDirty = computed(() =>
    isSnapshotDirty({
      isDemo: snap.isDemo,
      goalsCount: goals.goals.length,
      penghasilanAmount: snap.penghasilan.amount,
      penghasilanLainCount: snap.penghasilanLain.length,
      pengeluaranPokok: snap.pengeluaran.pokok,
      pengeluaranLifestyle: snap.pengeluaran.lifestyle,
      pengeluaranBiayaKos: snap.pengeluaran.biayaKos ?? 0,
      pengeluaranLainCount: snap.pengeluaranLain.length,
      totalAset: derived.totalAset,
      cicilanCount: snap.cicilanAktif.length,
      utangPribadiCount: snap.utangPribadi.length,
      gadaiCount: snap.gadai.length,
    }),
  )

  function handler(event: BeforeUnloadEvent): string | undefined {
    if (!isDirty.value) return undefined
    const message = t('dialog.refresh')
    // Modern Chrome/Edge/Safari ignore the custom string and show a generic
    // "Leave site?" prompt — preventDefault + a non-empty returnValue is what
    // actually triggers it. Returning the string keeps older Firefox happy.
    event.preventDefault()
    event.returnValue = message
    return message
  }

  onMounted(() => {
    window.addEventListener('beforeunload', handler)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handler)
  })
}
