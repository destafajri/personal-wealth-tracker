// Day 10 — xlsx export composable. Dynamic-imports SheetJS so its ~700KB
// payload stays out of the initial bundle (per PRD §8). Reads from
// snapshot/derived/goals stores, hands the data to the pure builders in
// lib/xlsx/sheets.ts, and triggers a browser download. No persistence side
// effects.

import { useDerivedStore } from '~/stores/derived'
import { FI_MULTIPLIER, useGoalsStore } from '~/stores/goals'
import { useSnapshotStore } from '~/stores/snapshot'
import type { PricesView, SnapshotState } from '~/lib/types/snapshot'
import {
  SCHEMA_VERSION,
  buildCicilanAktif,
  buildGoals,
  buildMeta,
  buildPerEmiten,
  buildRingkasan,
  buildSnapshot,
  type XlsxContext,
} from '~/lib/xlsx/sheets'

const FILENAME_PREFIX = 'cermat-snapshot'

// PricesView fallback for the case where the price layer hasn't fetched yet
// (or all endpoints failed). effectiveStockPrice + emas helpers already null-
// safe; this just keeps builders from null-guarding the entire view shape.
function emptyPrices(): PricesView {
  return {
    goldDigitalIdrPerGram: null,
    goldAntam1gIdr: null,
    fxRates: { USD: null, SGD: null, EUR: null, JPY: null, KRW: null },
    idxByTicker: {},
    cryptoByCoinId: {},
  }
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function nowISO(): string {
  return new Date().toISOString()
}

export function useXlsx() {
  async function download(): Promise<void> {
    const snap = useSnapshotStore()
    const derived = useDerivedStore()
    const goalsStore = useGoalsStore()

    // Snapshot plain (Pinia auto-unwrap returns the live reactive proxies;
    // shallow-clone arrays/objects so SheetJS writes stable values rather
    // than read traps on the proxy).
    const snapState: SnapshotState = {
      penghasilan: {
        amount: snap.penghasilan.amount,
        currency: snap.penghasilan.currency,
      },
      penghasilanLain: [...snap.penghasilanLain],
      pengeluaran: {
        pokok: snap.pengeluaran.pokok,
        lifestyle: snap.pengeluaran.lifestyle,
      },
      asetLikuid: {
        kas: [...snap.asetLikuid.kas],
        deposito: [...snap.asetLikuid.deposito],
        reksaDana: [...snap.asetLikuid.reksaDana],
        sbn: [...snap.asetLikuid.sbn],
      },
      asetNonLikuid: {
        properti: [...snap.asetNonLikuid.properti],
        kendaraan: [...snap.asetNonLikuid.kendaraan],
        pensiun: [...snap.asetNonLikuid.pensiun],
      },
      emas: { ...snap.emas },
      saham: [...snap.saham],
      crypto: [...snap.crypto],
      cicilanAktif: [...snap.cicilanAktif],
      utangPribadi: [...snap.utangPribadi],
      gadai: [...snap.gadai],
    }

    const ctx: XlsxContext = {
      snap: snapState,
      prices: derived.priceView ?? emptyPrices(),
      goals: [...goalsStore.goals],
      derived: {
        totalAset: derived.totalAset,
        totalUtang: derived.totalUtang,
        netWorth: derived.netWorth,
        modalSiap: derived.modalSiap,
        dsr: derived.dsr,
        dar: derived.dar,
        runway: derived.runway,
        savingsRate: derived.savingsRate,
        safeHaven: derived.safeHaven,
        allocationDiscipline: derived.allocationDiscipline,
        goalHealth: derived.goalHealth,
        surplusIdr: derived.surplusIdr,
        penghasilanMonthlyIdr: derived.penghasilanMonthlyIdr,
        dividendAnnual: derived.dividendAnnual,
        bungaSbnAnnual: derived.bungaSbnAnnual,
        bungaDepositoAnnual: derived.bungaDepositoAnnual,
      },
      exportedAt: nowISO(),
      fiMultiplier: FI_MULTIPLIER,
      annualReturnReal: goalsStore.assumedAnnualReturnReal,
    }

    const XLSX = await import('xlsx')
    const wb = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(buildRingkasan(ctx)),
      'Ringkasan',
    )
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(buildSnapshot(ctx.snap, ctx.prices)),
      'Snapshot',
    )
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(buildPerEmiten(ctx.snap.saham, ctx.prices)),
      'Per-Emiten',
    )
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(buildCicilanAktif(ctx.snap.cicilanAktif)),
      'Cicilan-Aktif',
    )
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(
        buildGoals(ctx.goals, ctx.snap, {
          fiMultiplier: ctx.fiMultiplier,
          annualReturnReal: ctx.annualReturnReal,
          prices: ctx.prices,
        }),
      ),
      'Goals',
    )
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(buildMeta(ctx)),
      '_meta',
    )

    // Mark _meta hidden. SheetJS reads Workbook.Sheets[i].Hidden when writing
    // — 1 = "hidden" (Excel-style), 2 = "very hidden" (unhidable from UI).
    // Use 1 so power users can unhide for inspection if curious.
    const metaIdx = wb.SheetNames.indexOf('_meta')
    if (metaIdx >= 0) {
      wb.Workbook = wb.Workbook ?? { Sheets: [] }
      wb.Workbook.Sheets = wb.Workbook.Sheets ?? []
      wb.Workbook.Sheets[metaIdx] = {
        ...wb.Workbook.Sheets[metaIdx],
        Hidden: 1,
      }
    }

    XLSX.writeFile(wb, `${FILENAME_PREFIX}-${todayISO()}.xlsx`)
  }

  return { download, schemaVersion: SCHEMA_VERSION }
}
