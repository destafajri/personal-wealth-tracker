import { formatIdrPdf, formatPercentPdf } from '~/lib/pdf/format'
import { rateToIdr } from '~/lib/finance/fx'
import type { PricesView, CicilanRow } from '~/lib/types/snapshot'
import { zoneOf, type Zone, type MetricKey } from '~/lib/finance/thresholds'
import { EMAS_CATEGORIES, ratePerGram, type EmasCategory } from '~/lib/finance/emas'

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
  zoneLabel: string
  description: string
  target: string
}

const METRIC_ZONE_LABELS: Partial<Record<MetricKey, [string, string, string]>> = {
  safeHaven: ['Konservatif', 'Seimbang', 'Agresif'],
  allocationDiscipline: ['Sesuai Rencana', 'Perlu Rebalance', 'Off-Plan'],
}

function metricZoneLabel(key: MetricKey, zone: Zone): string {
  const labels = METRIC_ZONE_LABELS[key]
  if (labels) {
    const idx = zone === 'sehat' ? 0 : zone === 'waspada' ? 1 : 2
    return labels[idx]!
  }
  if (zone === 'sehat') return 'Sehat'
  if (zone === 'waspada') return 'Waspada'
  return 'Kritis'
}

export type CompositeStatus = 'sehat' | 'waspada' | 'agresif' | 'bahaya' | 'sparse'

export function gatherHealthMetrics(derived: {
  dsr: number | null
  dar: number | null
  runway: number | null
  savingsRate: number | null
  safeHaven: number | null
  allocationDiscipline: number | null
}): { metrics: HealthMetric[]; compositeStatus: CompositeStatus } {
  const metrics: HealthMetric[] = []

  const add = (key: MetricKey, label: string, raw: number | null, formatValue: (v: number) => string, description: string, target: string) => {
    if (raw === null) return
    const zone = zoneOf(key, raw)
    metrics.push({ key, label, value: formatValue(raw), zone, zoneLabel: metricZoneLabel(key, zone), description, target })
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

  // Composite status:
  //   2+ bahaya → bahaya (Kritis)
  //   1 bahaya  → agresif (single aggressive metric, not crisis)
  //   any waspada (no bahaya) → waspada (Perlu Perhatian)
  //   all sehat → sehat
  //   <3 metrics → sparse
  let compositeStatus: CompositeStatus = 'sehat'
  if (metrics.length < 3) {
    compositeStatus = 'sparse'
  } else {
    const bahayaCount = metrics.filter(m => m.zone === 'bahaya').length
    if (bahayaCount >= 2) {
      compositeStatus = 'bahaya'
    } else if (bahayaCount === 1) {
      compositeStatus = 'agresif'
    } else if (metrics.some(m => m.zone === 'waspada')) {
      compositeStatus = 'waspada'
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
  tertahanGoldIdr: number
}): MetricCardData[] {
  const asetLikuidTersedia = Math.max(0, derived.totalAset - derived.tertahanGoldIdr)
  return [
    { label: 'Net Worth', value: formatIdrPdf(derived.netWorth) },
    {
      label: derived.surplusIdr >= 0 ? 'Surplus/Bulan' : 'Defisit/Bulan',
      value: formatIdrPdf(derived.surplusIdr),
    },
    { label: 'Total Aset', value: formatIdrPdf(derived.totalAset) },
    { label: 'Total Utang', value: formatIdrPdf(derived.totalUtang) },
    { label: 'Aset Likuid Tersedia', value: formatIdrPdf(asetLikuidTersedia) },
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
    gadai: Array<{ id: string; label: string; jaminan: string; piutangIdr: number; gramTertahan?: number }>
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
  // Denominator: IDR-normalized total matching dashboard's totalAset
  const fxToIdr = (amt: number, cur?: string) => {
    if (!cur || cur === 'IDR') return amt
    return amt * (rateToIdr(cur as 'USD', prices?.fxRates) ?? 0)
  }
  const EMAS_GRAM_FIELDS: Record<EmasCategory, keyof typeof snap.emas> = {
    digital: 'digitalGram',
    fisikAntam: 'fisikAntamGram',
    perhiasan18K: 'perhiasan18KGram',
    perhiasan14K: 'perhiasan14KGram',
    perhiasan10K: 'perhiasan10KGram',
  }
  const likuidIdr = Object.values(snap.asetLikuid).flat().reduce((s, r) => s + fxToIdr(r.amount || 0, r.currency), 0)
  const nonLikuidIdr = Object.values(snap.asetNonLikuid).flat().reduce((s, r) => s + (r.amount || 0), 0)
  const sahamIdr = snap.saham.reduce((s, r) => s + (r.lot * 100 * r.hargaRataRata), 0)
  let emasTotalIdr = 0
  for (const cat of EMAS_CATEGORIES) {
    const grams = snap.emas[EMAS_GRAM_FIELDS[cat]] || 0
    emasTotalIdr += grams * ratePerGram(cat, prices)
  }
  const cryptoIdr = (snap as { crypto?: Array<{ amount: number; currency?: string }> }).crypto?.reduce((s, r) => s + fxToIdr(r.amount || 0, r.currency), 0) ?? 0
  const totalAset = likuidIdr + nonLikuidIdr + sahamIdr + emasTotalIdr + cryptoIdr

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

  const nonLikuidLabels: Record<string, string> = { properti: 'Aset Tetap', kendaraan: 'Aset Tetap', pensiun: 'Pensiun' }
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

  // Emas — per-category breakdown with digadaikan badge
  const EMAS_LABELS: Record<EmasCategory, string> = {
    digital: 'Digital',
    fisikAntam: 'Antam',
    perhiasan18K: 'Perhiasan 18K',
    perhiasan14K: 'Perhiasan 14K',
    perhiasan10K: 'Perhiasan 10K',
  }
  let emasCatTotal = 0
  let hasEmas = false
  for (const cat of EMAS_CATEGORIES) {
    const grams = snap.emas[EMAS_GRAM_FIELDS[cat]] || 0
    if (grams <= 0) continue
    hasEmas = true
    const rate = ratePerGram(cat, prices)
    const value = grams * rate
    emasCatTotal += value
    const pawned = snap.gadai.reduce((s, g) => {
      if (g.jaminan !== `emas:${cat}`) return s
      return s + (g.gramTertahan || 0)
    }, 0)
    const gramLabel = pawned > 0
      ? `${grams.toFixed(1)} g (${pawned.toFixed(1)}g digadaikan)`
      : `${grams.toFixed(1)} g`
    const valueStr = rate > 0 ? formatIdrPdf(value) : 'N/A'
    asetRows.push(['Emas', `  ${EMAS_LABELS[cat]}`, `${gramLabel}  ${valueStr}`, totalAset > 0 ? `${((value / totalAset) * 100).toFixed(1).replace('.', ',')}%` : '-'])
  }
  if (hasEmas) {
    asetRows.push(['Emas', 'SUBTOTAL', formatIdrPdf(emasCatTotal), totalAset > 0 ? `${((emasCatTotal / totalAset) * 100).toFixed(1).replace('.', ',')}%` : '-'])
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
      ['Estimasi dividen saham: rata-rata yield per emiten x jumlah lembar'],
      ['Estimasi bunga deposito: rate x saldo / 12'],
      ['Estimasi bunga SBN: kupon rate aktual x nominal / 12'],
      ['Dana darurat: pengeluaran bulanan x bulan tertanggung'],
      ['Modal Siap Distribusi: aset likuid - (pengeluaran bulanan x 6)'],
      ['DSR: total cicilan/bulan / total pendapatan/bulan x 100%'],
      ['DAR: total utang / total aset x 100%'],
      ['Safe Haven: (kas + deposito + SBN + RD pasar uang + emas) / total aset x 100%'],
      ['Aset Likuid Tersedia: total aset - nilai aset yang dijaminkan (current scope: emas)'],
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
  safeHaven: number | null
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
  if (derived.safeHaven !== null) {
    if (derived.safeHaven > 40) {
      insights.push(`Safe Haven ${derived.safeHaven.toFixed(1).replace('.', ',')}% di atas target 30% - portfolio terlalu defensif, pertimbangkan diversifikasi ke growth assets.`)
    } else if (derived.safeHaven < 15) {
      insights.push(`Safe Haven ${derived.safeHaven.toFixed(1).replace('.', ',')}% sangat rendah - pertimbangkan menambah aset defensif (kas, deposito, emas).`)
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
    const isFullPayoff = allocation >= c.sisaPokok
    remaining -= allocation

    let impact = ''
    if (isFullPayoff && c.cicilanPerBulan > 0 && income > 0 && currentDsr !== null) {
      const dsrDrop = (c.cicilanPerBulan / income) * 100
      const newDsr = currentDsr - dsrDrop
      impact = `DSR ${currentDsr.toFixed(1).replace('.', ',')}% -> ${newDsr.toFixed(1).replace('.', ',')}% (-${dsrDrop.toFixed(1).replace('.', ',')} pp)`
      currentDsr = newDsr
    } else if (!isFullPayoff && c.sisaPokok > 0) {
      const pctReduced = ((allocation / c.sisaPokok) * 100).toFixed(0)
      impact = `Pokok berkurang ${formatIdrPdf(allocation)} (${pctReduced}% sisa pokok); cicilan/bulan tetap`
    } else {
      impact = `Sisa utang berkurang ${formatIdrPdf(allocation)}`
    }
    if (remaining > 0) impact += `; sisa modal ${formatIdrPdf(remaining)}`

    const verb = isFullPayoff ? 'Lunasi' : 'Prepay'
    recommendations.push({ label: `${verb} ${c.label}`, allocation, impact })
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
