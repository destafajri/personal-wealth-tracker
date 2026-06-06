import { formatIdrPdf, formatPercentPdf } from '~/lib/pdf/format'
import { rateToIdr } from '~/lib/finance/fx'
import type { PricesView, CicilanRow } from '~/lib/types/snapshot'
import { zoneOf, type Zone, type MetricKey } from '~/lib/finance/thresholds'

export interface MetricCardData {
  label: string
  value: string
}

export interface TableData {
  title: string
  headers: string[]
  rows: string[][]
}

export interface HealthMetric {
  key: MetricKey
  label: string
  value: string
  zone: Zone
  description: string
  target: string
}

export function gatherHealthMetrics(derived: {
  dsr: number | null
  dar: number | null
  runway: number | null
  savingsRate: number | null
  safeHaven: number | null
  allocationDiscipline: number | null
}): { metrics: HealthMetric[]; compositeStatus: 'sehat' | 'waspada' | 'bahaya' | 'sparse' } {
  const metrics: HealthMetric[] = []

  const add = (key: MetricKey, label: string, raw: number | null, formatValue: (v: number) => string, description: string, target: string) => {
    if (raw === null) return
    metrics.push({ key, label, value: formatValue(raw), zone: zoneOf(key, raw), description, target })
  }

  add('dsr', 'DSR (Debt Service Ratio)', derived.dsr, v => formatPercentPdf(v), 'Beban cicilan vs pendapatan', 'Target: <30%')
  add('dar', 'DAR (Debt to Asset Ratio)', derived.dar, v => formatPercentPdf(v), 'Total utang vs total aset', 'Target: <50%')
  add('runway', 'Runway', derived.runway, v => {
    if (v >= 12) return `${Math.floor(v / 12)} tahun ${Math.round(v % 12)} bulan`
    return `${v.toFixed(1).replace('.', ',')} bulan`
  }, 'Berapa lama bisa hidup tanpa pemasukan baru', 'Target: >6 bulan')
  add('savingsRate', 'Savings Rate', derived.savingsRate, v => formatPercentPdf(v), '% pendapatan yang ditabung', 'Target: >20%')
  add('safeHaven', 'Safe Haven Ratio', derived.safeHaven, v => formatPercentPdf(v), '% aset defensif (kas, deposito, SBN, RD pasar uang, emas)', 'Target: 20-30%')
  add('allocationDiscipline', 'Deviasi Alokasi Saham', derived.allocationDiscipline, v => `${v.toFixed(1).replace('.', ',')} pp`, 'Deviasi dari alokasi target', 'Target: <5 pp')

  // Composite status: any bahaya → bahaya, any waspada → waspada, sparse → sparse, else sehat
  let compositeStatus: 'sehat' | 'waspada' | 'bahaya' | 'sparse' = 'sehat'
  if (metrics.length < 3) {
    compositeStatus = 'sparse'
  } else {
    for (const m of metrics) {
      if (m.zone === 'bahaya') { compositeStatus = 'bahaya'; break }
      if (m.zone === 'waspada') { compositeStatus = 'waspada' }
    }
  }

  return { metrics, compositeStatus }
}

export function gatherPdfMetrics(derived: {
  netWorth: number
  surplusIdr: number
  totalAset: number
  totalUtang: number
  runway: number | null
  savingsRate: number | null
}): MetricCardData[] {
  return [
    { label: 'Net Worth', value: formatIdrPdf(derived.netWorth) },
    {
      label: derived.surplusIdr >= 0 ? 'Surplus/Bulan' : 'Defisit/Bulan',
      value: formatIdrPdf(derived.surplusIdr),
    },
    { label: 'Total Aset', value: formatIdrPdf(derived.totalAset) },
    { label: 'Total Utang', value: formatIdrPdf(derived.totalUtang) },
    {
      label: 'Dana Darurat',
      value: derived.runway !== null
        ? derived.runway >= 12 ? '12+ bulan' : `${derived.runway.toFixed(1).replace('.', ',')} bulan`
        : 'N/A',
    },
    { label: 'Savings Rate', value: formatPercentPdf(derived.savingsRate) },
  ]
}

export function gatherPdfTables(
  snap: {
    asetLikuid: Record<string, Array<{ id: string; label: string; amount: number; currency?: string; sukuBungaPercent?: number; rdJenis?: string }>>
    asetNonLikuid: Record<string, Array<{ id: string; label: string; amount: number }>>
    saham: Array<{ id: string; ticker: string; lot: number; hargaRataRata: number }>
    emas: { digitalGram: number; fisikAntamGram: number; perhiasan18KGram: number; perhiasan14KGram: number; perhiasan10KGram: number }
    cicilanAktif: Array<{ id: string; tipe: string; label: string; sisaPokok: number; cicilanPerBulan: number; tenorSisaBulan?: number }>
    utangPribadi: Array<{ id: string; label: string; sisaPokok: number; cicilanPerBulan?: number; tempoBulan?: number }>
    gadai: Array<{ id: string; label: string; jaminan: string; piutangIdr: number }>
  },
  _goals: Array<{ id: string; kind: string; label: string; targetIdr: number }>,
  goalProgressData: Array<{ label: string; targetIdr: number; currentIdr: number; progressPct: number }>,
  prices?: PricesView,
  incomeData?: {
    gaji: number
    gajiCurrency: string
    penghasilanLain: Array<{ label: string; amount: number; currency?: string }>
    dividendAnnual: number
    bungaSbnAnnual: number
    bungaDepositoAnnual: number
  },
): TableData[] {
  const tables: TableData[] = []

  // Income breakdown table
  if (incomeData) {
    const incomeRows: string[][] = []
    const fx = prices?.fxRates
    const toIdr = (amt: number, cur?: string) => {
      if (!cur || cur === 'IDR') return amt
      const rate = rateToIdr(cur as 'USD', fx) ?? 0
      return amt * rate
    }
    let totalIncome = 0
    const gajiIdr = toIdr(incomeData.gaji, incomeData.gajiCurrency)
    if (gajiIdr) { incomeRows.push(['Gaji Bersih', formatIdrPdf(gajiIdr)]); totalIncome += gajiIdr }
    for (const r of incomeData.penghasilanLain) {
      const idr = toIdr(r.amount, r.currency)
      if (idr) { incomeRows.push([r.label, formatIdrPdf(idr)]); totalIncome += idr }
    }
    if (incomeData.dividendAnnual > 0) { incomeRows.push(['Estimasi dividen saham', `${formatIdrPdf(incomeData.dividendAnnual / 12)} (estimasi)`]); totalIncome += incomeData.dividendAnnual / 12 }
    if (incomeData.bungaSbnAnnual > 0) { incomeRows.push(['Estimasi bunga SBN', `${formatIdrPdf(incomeData.bungaSbnAnnual / 12)} (estimasi)`]); totalIncome += incomeData.bungaSbnAnnual / 12 }
    if (incomeData.bungaDepositoAnnual > 0) { incomeRows.push(['Estimasi bunga deposito', `${formatIdrPdf(incomeData.bungaDepositoAnnual / 12)} (estimasi)`]); totalIncome += incomeData.bungaDepositoAnnual / 12 }
    if (incomeRows.length > 0) {
      incomeRows.push(['Total', formatIdrPdf(totalIncome)])
      tables.push({ title: 'Sumber Pendapatan', headers: ['Sumber', 'Per Bulan'], rows: incomeRows })
    }
  }

  // Aset table — subtotals per category + % Aset
  const totalAset = (snap.asetLikuid.kas ?? []).reduce((s, r) => s + r.amount, 0) +
    Object.values(snap.asetLikuid).flat().reduce((s, r) => s + (r.amount || 0), 0) +
    Object.values(snap.asetNonLikuid).flat().reduce((s, r) => s + (r.amount || 0), 0) +
    snap.saham.reduce((s, r) => s + (r.lot * 100 * r.hargaRataRata), 0)

  const asetRows: string[][] = []
  const likuidLabels: Record<string, string> = { kas: 'Kas & Tabungan', deposito: 'Deposito & Bunga', reksaDana: 'Reksa Dana', sbn: 'SBN' }
  for (const [key, label] of Object.entries(likuidLabels)) {
    const rows = (snap.asetLikuid as Record<string, Array<{ id: string; label: string; amount: number; currency?: string }>>)[key]
    if (!rows?.length) continue
    let catTotal = 0
    for (const r of rows) {
      const cur = r.currency ?? 'IDR'
      const rate = cur === 'IDR' ? 1 : (rateToIdr(cur as 'USD', prices?.fxRates) ?? 0)
      const rowIdr = r.amount * rate
      catTotal += rowIdr
      asetRows.push([label, `  ${r.label}`, formatIdrPdf(rowIdr), totalAset > 0 ? `${((rowIdr / totalAset) * 100).toFixed(1).replace('.', ',')}%` : '-'])
    }
    asetRows.push([label, `SUBTOTAL`, formatIdrPdf(catTotal), totalAset > 0 ? `${((catTotal / totalAset) * 100).toFixed(1).replace('.', ',')}%` : '-'])
  }

  const nonLikuidLabels: Record<string, string> = { properti: 'Aset Tetap', kendaraan: 'Aset Tetap', pensiun: 'Aset Tetap' }
  const nonLikuidByLabel: Record<string, Array<{ id: string; label: string; amount: number }>> = {}
  for (const [key, label] of Object.entries(nonLikuidLabels)) {
    const rows = (snap.asetNonLikuid as Record<string, Array<{ id: string; label: string; amount: number }>>)[key]
    if (!rows?.length) continue
    if (!nonLikuidByLabel[label]) nonLikuidByLabel[label] = []
    nonLikuidByLabel[label]!.push(...rows)
  }
  for (const [label, rows] of Object.entries(nonLikuidByLabel)) {
    let catTotal = 0
    for (const r of rows) {
      catTotal += r.amount
      asetRows.push([label, `  ${r.label}`, formatIdrPdf(r.amount), totalAset > 0 ? `${((r.amount / totalAset) * 100).toFixed(1).replace('.', ',')}%` : '-'])
    }
    asetRows.push([label, `SUBTOTAL`, formatIdrPdf(catTotal), totalAset > 0 ? `${((catTotal / totalAset) * 100).toFixed(1).replace('.', ',')}%` : '-'])
  }

  // Saham
  if (snap.saham.length) {
    let catTotal = snap.saham.reduce((s, sh) => s + sh.lot * 100 * sh.hargaRataRata, 0)
    for (const sh of snap.saham) {
      asetRows.push(['Saham', `  ${sh.ticker}`, formatIdrPdf(sh.lot * 100 * sh.hargaRataRata), totalAset > 0 ? `${((sh.lot * 100 * sh.hargaRataRata / totalAset) * 100).toFixed(1).replace('.', ',')}%` : '-'])
    }
    asetRows.push(['Saham', 'SUBTOTAL', formatIdrPdf(catTotal), totalAset > 0 ? `${((catTotal / totalAset) * 100).toFixed(1).replace('.', ',')}%` : '-'])
  }

  // Emas
  const totalGram = snap.emas.digitalGram + snap.emas.fisikAntamGram + snap.emas.perhiasan18KGram + snap.emas.perhiasan14KGram + snap.emas.perhiasan10KGram
  if (totalGram > 0) {
    asetRows.push(['Emas', `${totalGram.toFixed(1)} g`, 'N/A', '-'])
  }

  if (asetRows.length > 0) {
    tables.push({
      title: 'Detail Aset',
      headers: ['Jenis', 'Nama', 'Nilai (Rp)', '% Aset'],
      rows: asetRows,
    })
  }

  // Debt table — split sub-sections
  const debtRows: string[][] = []
  if (snap.cicilanAktif.length) {
    const sub = snap.cicilanAktif.reduce((s, c) => s + c.sisaPokok, 0)
    debtRows.push(['CICILAN AKTIF', '', formatIdrPdf(sub), ''])
    for (const c of snap.cicilanAktif) {
      debtRows.push([`  ${c.label}`, formatIdrPdf(c.sisaPokok), c.tenorSisaBulan != null ? `${c.tenorSisaBulan} bln` : '-', formatIdrPdf(c.cicilanPerBulan)])
    }
  }
  if (snap.utangPribadi.length) {
    const sub = snap.utangPribadi.reduce((s, u) => s + u.sisaPokok, 0)
    debtRows.push(['UTANG PRIBADI', '', formatIdrPdf(sub), ''])
    for (const u of snap.utangPribadi) {
      debtRows.push([`  ${u.label}`, formatIdrPdf(u.sisaPokok), u.tempoBulan != null ? `${u.tempoBulan} bln` : '-', u.cicilanPerBulan ? formatIdrPdf(u.cicilanPerBulan) : '-'])
    }
  }
  if (snap.gadai.length) {
    const sub = snap.gadai.reduce((s, g) => s + g.piutangIdr, 0)
    debtRows.push(['GADAI', '', formatIdrPdf(sub), ''])
    for (const g of snap.gadai) {
      debtRows.push([`  ${g.label}`, formatIdrPdf(g.piutangIdr), '-', '-'])
    }
  }
  if (debtRows.length > 0) {
    tables.push({
      title: 'Utang & Gadai',
      headers: ['Nama', 'Sisa Utang', 'Tenor', 'Cicilan/Bulan'],
      rows: debtRows,
    })
  }

  // Goals table
  const goalRows = goalProgressData.map((g) => [
    g.label,
    formatIdrPdf(g.targetIdr),
    formatIdrPdf(g.currentIdr),
    `${g.progressPct.toFixed(1).replace('.', ',')}%`,
  ])
  if (goalRows.length > 0) {
    tables.push({
      title: 'Goals',
      headers: ['Nama', 'Target', 'Terkini', 'Progress'],
      rows: goalRows,
    })
  }

  // Methodology note
  tables.push({
    title: 'Catatan Metodologi',
    headers: ['Asumsi & Dasar Perhitungan'],
    rows: [
      ['Harga emas: harga buyback (Pegadaian/Antam reference)'],
      ['Estimasi dividen saham: rata-rata yield per emiten × jumlah lembar'],
      ['Estimasi bunga deposito: rate × saldo / 12'],
      ['Estimasi bunga SBN: kupon rate aktual × nominal / 12'],
      ['Dana darurat: pengeluaran bulanan × bulan tertanggung'],
      ['Modal Siap Distribusi: aset likuid − (pengeluaran bulanan × 6)'],
      ['DSR: total cicilan/bulan ÷ total pendapatan/bulan × 100%'],
      ['DAR: total utang ÷ total aset × 100%'],
      ['Safe Haven: (kas + deposito + SBN + RD pasar uang + emas) ÷ total aset × 100%'],
      ['Semua angka bersifat estimasi dan bukan rekomendasi investasi'],
    ],
  })

  return tables
}

// --- Recommendation engine ---

export interface RecommendationItem {
  label: string
  allocation: number
  impact: string
}

export interface RecommendationData {
  modalSiap: number
  modalMonths: number | null
  insights: string[]
  recommendations: RecommendationItem[]
  surplusAfterAllDebt: number
}

// Priority tiers by debt type (proxy for effective interest rate)
const CICILAN_PRIORITY: Record<string, number> = {
  KK: 1, PINJOL: 1, PAYLATER: 1,
  BANK_KTA: 2, LAIN: 2,
  KPM: 3,
  KPR: 4,
}

export function gatherRecommendations(snap: {
  cicilanAktif: CicilanRow[]
  utangPribadi: Array<{ id: string; label: string; sisaPokok: number; cicilanPerBulan?: number }>
  gadai: Array<{ id: string; label: string; jaminan: string; piutangIdr: number }>
  pengeluaranLain: Array<{ amount: number }>
}, derived: {
  modalSiap: number
  surplusIdr: number
  dsr: number | null
  penghasilanMonthlyIdr: number
  pengeluaranMonthlyIdr: number
}): RecommendationData {
  const { modalSiap, dsr, penghasilanMonthlyIdr, pengeluaranMonthlyIdr } = derived

  // Calculate insight statements
  const insights: string[] = []
  const modalMonths = pengeluaranMonthlyIdr > 0 ? modalSiap / pengeluaranMonthlyIdr : null

  if (dsr !== null && dsr > 25) {
    insights.push(`DSR ${dsr.toFixed(1).replace('.', ',')}% — di atas threshold ideal 25%, fokus reduksi utang akan improve ratio significantly.`)
  }
  if (modalSiap > 0 && modalMonths !== null) {
    if (modalMonths >= 3) {
      insights.push(`Modal Siap Distribusi ${formatIdrPdf(modalSiap)} = ${modalMonths.toFixed(1).replace('.', ',')} bulan pengeluaran, cukup untuk lunasi utang prioritas.`)
    } else {
      insights.push(`Modal Siap Distribusi ${formatIdrPdf(modalSiap)} = ${modalMonths.toFixed(1).replace('.', ',')} bulan pengeluaran, prioritas utang bunga tinggi dulu.`)
    }
  }

  // Build recommendation candidates
  type Candidate = { label: string; sisaPokok: number; cicilanPerBulan: number; priority: number }
  const candidates: Candidate[] = []

  for (const c of snap.cicilanAktif) {
    candidates.push({
      label: c.label,
      sisaPokok: c.sisaPokok,
      cicilanPerBulan: c.cicilanPerBulan,
      priority: CICILAN_PRIORITY[c.tipe] ?? 2,
    })
  }

  // Utang pribadi = tier 5 (0% interest, informal)
  for (const u of snap.utangPribadi) {
    candidates.push({
      label: u.label,
      sisaPokok: u.sisaPokok,
      cicilanPerBulan: u.cicilanPerBulan ?? 0,
      priority: 5,
    })
  }

  // Sort: lower priority number first, then higher cicilanPerBulan within tier
  candidates.sort((a, b) => a.priority !== b.priority ? a.priority - b.priority : b.cicilanPerBulan - a.cicilanPerBulan)

  const recommendations: RecommendationItem[] = []
  let remaining = modalSiap
  let currentDsr = dsr
  const income = penghasilanMonthlyIdr

  for (const c of candidates) {
    if (remaining <= 0) break
    const allocation = Math.min(c.sisaPokok, remaining)
    remaining -= allocation

    let impact = ''
    if (c.cicilanPerBulan > 0 && income > 0 && currentDsr !== null) {
      const dsrDrop = (c.cicilanPerBulan / income) * 100
      const newDsr = currentDsr - dsrDrop
      impact = `DSR ${currentDsr.toFixed(1).replace('.', ',')}% → ${newDsr.toFixed(1).replace('.', ',')}% (-${dsrDrop.toFixed(1).replace('.', ',')} pp)`
      currentDsr = newDsr
    } else {
      impact = `Sisa utang berkurang ${formatIdrPdf(allocation)}`
    }
    if (remaining > 0) impact += `; sisa modal ${formatIdrPdf(remaining)}`

    recommendations.push({ label: `Lunasi ${c.label}`, allocation, impact })
  }

  // Gadai redemption (tier 6)
  for (const g of snap.gadai) {
    if (remaining <= 0) break
    const allocation = Math.min(g.piutangIdr, remaining)
    remaining -= allocation
    let impact = 'Aset gadai balik ke snapshot'
    if (remaining > 0) impact += `; sisa modal ${formatIdrPdf(remaining)}`
    recommendations.push({ label: `Tebus ${g.label}`, allocation, impact })
  }

  return {
    modalSiap,
    modalMonths,
    insights: insights.slice(0, 2),
    recommendations,
    surplusAfterAllDebt: remaining,
  }
}
