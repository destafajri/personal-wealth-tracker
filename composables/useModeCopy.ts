import { tm } from '~/lib/copy/strings'
import { useSnapshotStore } from '~/stores/snapshot'
import type { CopyKey } from '~/lib/copy/strings'

export function useModeCopy() {
  const snap = useSnapshotStore()
  function mc(key: CopyKey, vars?: Record<string, string | number>): string {
    return tm(key, snap.mode, vars)
  }
  return { mc }
}
