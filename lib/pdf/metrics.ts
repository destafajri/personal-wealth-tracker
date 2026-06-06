import { formatIdrPdf, formatPercentPdf } from '~/lib/pdf/format'
import { rateToIdr } from '~/lib/finance/fx'
import type { PricesView } from '~/lib/types/snapshot'

export interface MetricCardData {
  label: string
  value: string
}

export interface TableData {
  title: string
  headers: string[]
  rows: string[][]
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
    asetLikuid: Record<string, Array<{ id: string; label: string; amount: number; currency?: string }>>
    asetNonLikuid: Record<string, Array<{ id: string; label: string; amount: number }>>
    saham: Array<{ id: string; ticker: string; lot: number; hargaRataRata: number }>
    emas: { digitalGram: number; fisikAntamGram: number; perhiasan18KGram: number; perhiasan14KGram: number; perhiasan10KGram: number }
    cicilanAktif: Array<{ id: string; tipe: string; label: string; sisaPokok: number; cicilanPerBulan: number; tenorSisaBulan?: number }>
    utangPribadi: Array<{ id: string; label: string; sisaPokok: number; cicilanPerBulan?: number; tempoBulan?: number }>
  },
  _goals: Array<{ id: string; kind: string; label: string; targetIdr: number }>,
  goalProgressData: Array<{ label: string; targetIdr: number; currentIdr: number; progressPct: number }>,
  prices?: PricesView,
): TableData[] {
  const tables: TableData[] = []

  // Aset table — all categories combined
  const asetRows: string[][] = []
  for (const [cat, rows] of Object.entries(snap.asetLikuid)) {
    for (const r of rows) {
      const cur = (r as { currency?: string }).currency ?? 'IDR'
      const rate = cur === 'IDR' ? 1 : (rateToIdr(cur as 'USD', prices?.fxRates) ?? 0)
      const rowIdr = r.amount * rate
      asetRows.push([cat, r.label, formatIdrPdf(rowIdr), '-'])
    }
  }
  for (const [cat, rows] of Object.entries(snap.asetNonLikuid)) {
    for (const r of rows) {
      asetRows.push([cat, r.label, formatIdrPdf(r.amount), '-'])
    }
  }
  // Saham
  for (const s of snap.saham) {
    asetRows.push(['Saham', s.ticker, formatIdrPdf(s.lot * 100 * s.hargaRataRata), '-'])
  }
  // Emas
  const totalGram = snap.emas.digitalGram + snap.emas.fisikAntamGram + snap.emas.perhiasan18KGram + snap.emas.perhiasan14KGram + snap.emas.perhiasan10KGram
  if (totalGram > 0) {
    asetRows.push(['Emas', `${totalGram.toFixed(1)} g`, 'N/A', '-'])
  }
  if (asetRows.length > 0) {
    tables.push({
      title: 'Detail Aset',
      headers: ['Jenis', 'Nama', 'Nilai (Rp)', 'Perubahan'],
      rows: asetRows,
    })
  }

  // Cicilan Aktif table
  const cicilanRows: string[][] = []
  for (const c of snap.cicilanAktif) {
    cicilanRows.push([c.label, formatIdrPdf(c.sisaPokok), c.tenorSisaBulan != null ? `${c.tenorSisaBulan} bln` : '-', formatIdrPdf(c.cicilanPerBulan)])
  }
  if (cicilanRows.length > 0) {
    tables.push({
      title: 'Cicilan Aktif',
      headers: ['Nama', 'Sisa Utang', 'Sisa Tenor', 'Cicilan/Bulan'],
      rows: cicilanRows,
    })
  }

  // Utang Pribadi table
  const utangPribadiRows: string[][] = []
  for (const u of snap.utangPribadi) {
    utangPribadiRows.push([
      u.label,
      formatIdrPdf(u.sisaPokok),
      u.tempoBulan != null ? `${u.tempoBulan} bln` : '-',
      u.cicilanPerBulan ? formatIdrPdf(u.cicilanPerBulan) : '-',
    ])
  }
  if (utangPribadiRows.length > 0) {
    tables.push({
      title: 'Utang Pribadi',
      headers: ['Nama', 'Sisa Utang', 'Tempo', 'Cicilan/Bulan'],
      rows: utangPribadiRows,
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

  return tables
}
