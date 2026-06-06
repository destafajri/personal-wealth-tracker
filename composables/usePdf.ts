import { useDerivedStore } from '~/stores/derived'
import { useSnapshotStore } from '~/stores/snapshot'
import { useGoalsStore } from '~/stores/goals'
import { FI_MULTIPLIER } from '~/stores/goals'
import { goalProgress } from '~/lib/finance/goals'
import { formatIdrPdf } from '~/lib/pdf/format'
import { gatherPdfMetrics, gatherPdfTables, gatherHealthMetrics, gatherRecommendations } from '~/lib/pdf/metrics'
import {
  createPdfDocument,
  drawHeader,
  drawFooter,
  drawMetricCards,
  drawCompositeStatus,
  drawHealthMetrics,
  drawRecommendationPage,
  drawNetWorthBars,
  drawDonutChart,
  drawDetailTable,
  MARGIN,
  CONTENT_W,
} from '~/lib/pdf/layout'
import type { DonutSegment } from '~/lib/pdf/layout'
import { sumRowsToIdr, sumCryptoIdr, sumStockIdr } from '~/lib/finance/metrics'
import { rateToIdr } from '~/lib/finance/fx'
import { totalGoldIdr, tertahanGoldIdr } from '~/lib/finance/emas'

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function usePdf() {
  async function generatePdf(): Promise<void> {
    const derived = useDerivedStore()
    const snap = useSnapshotStore()
    const goalsStore = useGoalsStore()

    // Yield to event loop so button label updates first
    await new Promise((r) => setTimeout(r, 0))

    const prices = derived.priceView ?? undefined

    const tertahanGold = tertahanGoldIdr(snap, prices)

    // 1. Gather metrics
    const metrics = gatherPdfMetrics({
      netWorth: derived.netWorth,
      surplusIdr: derived.surplusIdr,
      totalAset: derived.totalAset,
      totalUtang: derived.totalUtang,
      runway: derived.runway,
      savingsRate: derived.savingsRate,
      tertahanGoldIdr: tertahanGold,
    })

    // 2. Gather goals progress
    const goalsProgress = goalsStore.goals.map((g) => {
      const p = goalProgress(g, {
        penghasilan: snap.penghasilan,
        penghasilanLain: snap.penghasilanLain,
        pengeluaran: snap.pengeluaran,
        pengeluaranLain: snap.pengeluaranLain,
        asetLikuid: snap.asetLikuid,
        asetNonLikuid: snap.asetNonLikuid,
        emas: snap.emas,
        saham: snap.saham,
        crypto: snap.crypto,
        cicilanAktif: snap.cicilanAktif,
        utangPribadi: snap.utangPribadi,
        gadai: snap.gadai,
      }, {
        fiMultiplier: FI_MULTIPLIER,
        annualReturnReal: goalsStore.assumedAnnualReturnReal,
        prices,
        activeGoalsCount: goalsStore.goals.length,
      })
      return {
        label: g.label,
        targetIdr: p.targetIdr,
        currentIdr: p.currentIdr,
        progressPct: p.targetIdr > 0 ? (p.currentIdr / p.targetIdr) * 100 : 0,
      }
    })

    const tables = gatherPdfTables(snap, goalsStore.goals, goalsProgress, prices, {
      gaji: snap.penghasilan.amount,
      gajiCurrency: snap.penghasilan.currency,
      penghasilanLain: snap.penghasilanLain,
      dividendAnnual: derived.dividendAnnual,
      bungaSbnAnnual: derived.bungaSbnAnnual,
      bungaDepositoAnnual: derived.bungaDepositoAnnual,
    })

    // 2b. Gather health metrics
    const { metrics: healthMetrics, compositeStatus } = gatherHealthMetrics({
      dsr: derived.dsr,
      dar: derived.dar,
      runway: derived.runway,
      savingsRate: derived.savingsRate,
      safeHaven: derived.safeHaven,
      allocationDiscipline: derived.allocationDiscipline,
    })

    // 2c. Gather recommendations
    const monthlyExpenses = derived.penghasilanMonthlyIdr - derived.surplusIdr
    const recommendations = gatherRecommendations(snap, {
      modalSiap: derived.modalSiap,
      surplusIdr: derived.surplusIdr,
      dsr: derived.dsr,
      penghasilanMonthlyIdr: derived.penghasilanMonthlyIdr,
      pengeluaranMonthlyIdr: monthlyExpenses,
      safeHaven: derived.safeHaven,
    })

    // 3. Prepare chart data

    // --- Asset allocation donut (ALL categories) ---
    const assetSegments: DonutSegment[] = []

    const kasVal = sumRowsToIdr(snap.asetLikuid.kas, prices)
    if (kasVal > 0) assetSegments.push({ label: 'Kas', value: kasVal, color: '#10b981' })

    const depositoVal = sumRowsToIdr(snap.asetLikuid.deposito, prices)
    if (depositoVal > 0) assetSegments.push({ label: 'Deposito', value: depositoVal, color: '#0ea5e9' })

    const rdVal = sumRowsToIdr(snap.asetLikuid.reksaDana, prices)
    if (rdVal > 0) assetSegments.push({ label: 'Reksa Dana', value: rdVal, color: '#0d9488' })

    const sbnVal = sumRowsToIdr(snap.asetLikuid.sbn, prices)
    if (sbnVal > 0) assetSegments.push({ label: 'SBN', value: sbnVal, color: '#6366f1' })

    const emasVal = totalGoldIdr({ emas: snap.emas, asetLikuid: snap.asetLikuid, asetNonLikuid: snap.asetNonLikuid, penghasilan: snap.penghasilan, penghasilanLain: snap.penghasilanLain, pengeluaran: snap.pengeluaran, pengeluaranLain: snap.pengeluaranLain, saham: snap.saham, crypto: snap.crypto, cicilanAktif: snap.cicilanAktif, utangPribadi: snap.utangPribadi, gadai: snap.gadai }, prices)
    if (emasVal > 0) assetSegments.push({ label: 'Emas', value: emasVal, color: '#eab308' })

    const sahamVal = sumStockIdr(snap.saham, prices)
    if (sahamVal > 0) assetSegments.push({ label: 'Saham', value: sahamVal, color: '#2453eb' })

    const cryptoVal = sumCryptoIdr(snap.crypto, prices)
    if (cryptoVal > 0) assetSegments.push({ label: 'Crypto', value: cryptoVal, color: '#7c3aed' })

    const propertiVal = snap.asetNonLikuid.properti.reduce((s, r) => s + (r.amount || 0), 0)
    if (propertiVal > 0) assetSegments.push({ label: 'Properti', value: propertiVal, color: '#f59e0b' })

    const kendaraanVal = snap.asetNonLikuid.kendaraan.reduce((s, r) => s + (r.amount || 0), 0)
    if (kendaraanVal > 0) assetSegments.push({ label: 'Kendaraan', value: kendaraanVal, color: '#ec4899' })

    const pensiunVal = snap.asetNonLikuid.pensiun.reduce((s, r) => s + (r.amount || 0), 0)
    if (pensiunVal > 0) assetSegments.push({ label: 'Pensiun', value: pensiunVal, color: '#c084fc' })

    // --- Expense breakdown donut ---
    const fxRates = prices?.fxRates
    const expenseSegments: DonutSegment[] = []
    const pokokRate = snap.pengeluaran.pokokCurrency === 'IDR' ? 1 : (rateToIdr(snap.pengeluaran.pokokCurrency, fxRates) ?? 0)
    const lifestyleRate = snap.pengeluaran.lifestyleCurrency === 'IDR' ? 1 : (rateToIdr(snap.pengeluaran.lifestyleCurrency, fxRates) ?? 0)
    const pokok = (snap.pengeluaran.pokok || 0) * pokokRate
    const lifestyle = (snap.pengeluaran.lifestyle || 0) * lifestyleRate
    const lainTotal = sumRowsToIdr(snap.pengeluaranLain, prices)
    const cicilanTotal =
      snap.cicilanAktif.reduce((s, r) => s + (r.cicilanPerBulan || 0), 0) +
      snap.utangPribadi.reduce((s, r) => s + (r.cicilanPerBulan || 0), 0)

    if (pokok > 0) expenseSegments.push({ label: 'Pokok', value: pokok, color: '#10b981' })
    if (lifestyle > 0) expenseSegments.push({ label: 'Lifestyle', value: lifestyle, color: '#f59e0b' })
    if (lainTotal > 0) expenseSegments.push({ label: 'Lainnya', value: lainTotal, color: '#7c3aed' })
    if (cicilanTotal > 0) expenseSegments.push({ label: 'Cicilan', value: cicilanTotal, color: '#f43f5e' })

    // 4. Build PDF
    const doc = createPdfDocument()
    let pageNum = 1

    // ---- Page 1: Summary ----
    drawHeader(doc)
    drawFooter(doc, pageNum)

    let y = 28
    y = drawMetricCards(doc, metrics, y)
    y = drawCompositeStatus(doc, compositeStatus, y)
    y += 4

    // Charts row: 3 side by side
    const chartGap = 5
    const chartW = (CONTENT_W - chartGap * 2) / 3
    const chartH = 70

    // Net Worth bar chart
    drawNetWorthBars(doc, derived.totalAset, derived.totalUtang, formatIdrPdf, MARGIN, y, chartW, chartH)

    // Alokasi Aset donut
    drawDonutChart(doc, 'Alokasi Aset', assetSegments, MARGIN + chartW + chartGap, y, chartW, chartH)

    // Pengeluaran donut
    drawDonutChart(doc, 'Komposisi Pengeluaran', expenseSegments, MARGIN + (chartW + chartGap) * 2, y, chartW, chartH)

    y += chartH + 4

    // ---- Page 2: Financial Health Metrics ----
    if (healthMetrics.length > 0) {
      doc.addPage()
      pageNum++
      drawHeader(doc)
      drawFooter(doc, pageNum)
      drawHealthMetrics(doc, healthMetrics, 28)
    }

    // ---- Page 3: Rekomendasi Distribusi Modal ----
    if (recommendations.recommendations.length > 0 || recommendations.modalSiap > 0) {
      doc.addPage()
      pageNum++
      drawHeader(doc)
      drawFooter(doc, pageNum)
      drawRecommendationPage(doc, recommendations, 28)
    }

    // ---- Page 4+: Detail tables ----
    for (const table of tables) {
      doc.addPage()
      pageNum++
      drawHeader(doc)
      drawFooter(doc, pageNum)
      const result = drawDetailTable(doc, table, 28, pageNum)
      pageNum = result.pageNum
    }

    // 5. Save
    doc.save(`cermat-laporan-${todayISO()}.pdf`)
  }

  return { generatePdf }
}
