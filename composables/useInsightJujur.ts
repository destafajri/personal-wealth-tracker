import { computed } from 'vue'
import { useDerivedStore } from '~/stores/derived'
import { useSnapshotStore } from '~/stores/snapshot'
import { resolveInsight, type InsightJujur } from '~/lib/finance/insight-jujur'
import type { ResolverInput } from '~/lib/finance/insight-jujur'

export type { InsightJujur }
export type { InsightKind } from '~/lib/finance/insight-jujur'

export function useInsightJujur() {
  const derived = useDerivedStore()
  const snap = useSnapshotStore()

  const insight = computed<InsightJujur | null>(() => {
    const cicilanTotal =
      snap.cicilanAktif.reduce((s, c) => s + (c.cicilanPerBulan || 0), 0)
      + snap.utangPribadi.reduce((s, u) => s + (u.cicilanPerBulan || 0), 0)
    const resolverInput: ResolverInput = {
      income: derived.penghasilanMonthlyIdr,
      surplus: derived.surplusIdr,
      pokok: snap.pengeluaran.pokok ?? 0,
      biayaKos: snap.pengeluaran.biayaKos ?? 0,
      lifestyle: snap.pengeluaran.lifestyle ?? 0,
      pengeluaranLain: snap.pengeluaranLain.map(r => ({ label: r.label, amount: r.amount })),
      cicilanTotal,
      runwayDays: derived.runway !== null ? Math.round(derived.runway * 30) : 999,
    }
    return resolveInsight(resolverInput)
  })

  const fires = computed(() => insight.value !== null)

  return { insight, fires }
}
