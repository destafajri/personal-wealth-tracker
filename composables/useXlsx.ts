// Day 10 — xlsx export composable. Dynamic-imports SheetJS so its ~700KB
// payload stays out of the initial bundle (per PRD §8). Reads from
// snapshot/derived/goals stores, hands the data to the pure builders in
// lib/xlsx/sheets.ts, and triggers a browser download. No persistence side
// effects.

import { useDerivedStore } from '~/stores/derived'
import { FI_MULTIPLIER, useGoalsStore } from '~/stores/goals'
import { useSnapshotStore } from '~/stores/snapshot'
import type { PricesView, SnapshotState } from '~/lib/types/snapshot'
import { rateToIdr } from '~/lib/finance/fx'
import { SCHEMA_VERSION, type XlsxContext } from '~/lib/xlsx/sheets'
import { buildWorkbook } from '~/lib/xlsx/workbook'

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

    const prices: PricesView = derived.priceView ?? emptyPrices()
    const fx = prices.fxRates

    // Normalize pengeluaran to IDR at the export boundary so sheet builders
    // (which label these columns as IDR) stay consistent for non-IDR inputs.
    const pokokRate =
      snap.pengeluaran.pokokCurrency === 'IDR'
        ? 1
        : (rateToIdr(snap.pengeluaran.pokokCurrency, fx) ?? 0)
    const lifestyleRate =
      snap.pengeluaran.lifestyleCurrency === 'IDR'
        ? 1
        : (rateToIdr(snap.pengeluaran.lifestyleCurrency, fx) ?? 0)

    const snapState: SnapshotState = {
      penghasilan: {
        amount: snap.penghasilan.amount,
        currency: snap.penghasilan.currency,
      },
      penghasilanLain: [...snap.penghasilanLain],
      pengeluaran: {
        pokok: (snap.pengeluaran.pokok || 0) * pokokRate,
        pokokCurrency: 'IDR',
        lifestyle: (snap.pengeluaran.lifestyle || 0) * lifestyleRate,
        lifestyleCurrency: 'IDR',
      },
      pengeluaranLain: [...snap.pengeluaranLain],
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
      prices,
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

    // Dynamic import keeps initial bundle small (~700KB stays out per PRD §8).
    // Both the composable + the round-trip integration test feed into
    // buildWorkbook so they can't drift from production assembly behavior.
    const XLSX = await import('xlsx')
    const wb = buildWorkbook(ctx, XLSX)
    XLSX.writeFile(wb, `${FILENAME_PREFIX}-${todayISO()}.xlsx`)
  }

  return { download, schemaVersion: SCHEMA_VERSION }
}
