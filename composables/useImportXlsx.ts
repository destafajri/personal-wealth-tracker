import { ref } from 'vue'
import type { ImportResult } from '~/lib/xlsx/import'
import { parseImportFile } from '~/lib/xlsx/import'
import { useSnapshotStore } from '~/stores/snapshot'
import { useGoalsStore } from '~/stores/goals'
import { useToast } from '~/composables/useToast'
import { t } from '~/lib/copy/strings'

export type ImportPhase = 'idle' | 'validating' | 'preview' | 'importing' | 'done' | 'error'

const phase = ref<ImportPhase>('idle')
const result = ref<ImportResult | null>(null)
const errorMessage = ref<string>('')

export function useImportXlsx() {
  const toast = useToast()

  async function selectFile(file: File): Promise<void> {
    phase.value = 'validating'
    result.value = null
    errorMessage.value = ''

    try {
      const XLSX = await import('xlsx')
      const importResult = await parseImportFile(XLSX, file)
      result.value = importResult

      if (importResult.ok) {
        phase.value = 'preview'
      } else {
        const firstError = importResult.errors[0]
        errorMessage.value = firstError?.message ?? 'toast.download.allFailed'
        phase.value = 'error'
      }
    } catch {
      errorMessage.value = 'toast.download.allFailed'
      phase.value = 'error'
    }
  }

  function confirmImport(): void {
    if (!result.value?.ok || !result.value.snapshot) return

    phase.value = 'importing'

    const snap = useSnapshotStore()
    const goalsStore = useGoalsStore()

    snap.applyImportedState(result.value.snapshot)

    if (result.value.goalsData) {
      goalsStore.applyImportedGoals(
        result.value.goalsData.goals,
        result.value.goalsData.assumedAnnualReturnReal,
      )
    }

    if (result.value.warnings.length > 0 || result.value.skippedRows > 0) {
      toast.showToast(
        t('toast.import.partial', { skipped: result.value.skippedRows || result.value.warnings.length }),
        { type: 'warning' },
      )
    } else {
      toast.showToast(t('toast.import.success'), { type: 'success' })
    }

    phase.value = 'done'
  }

  function cancelImport(): void {
    phase.value = 'idle'
    result.value = null
    errorMessage.value = ''
  }

  function resetToIdle(): void {
    phase.value = 'idle'
    result.value = null
    errorMessage.value = ''
  }

  return { phase, result, errorMessage, selectFile, confirmImport, cancelImport, resetToIdle }
}
