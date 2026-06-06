import { formatIdrPdf, formatPercentPdf } from '~/lib/pdf/format'

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
        ? `${derived.runway.toFixed(1).replace('.', ',')} bulan`
        : 'N/A',
    },
    { label: 'Savings Rate', value: formatPercentPdf(derived.savingsRate) },
  ]
}

export function gatherPdfTables(
  snap: {
    asetLikuid: Record<string, Array<{ id: string; label: string; amount: number }>>
    asetNonLikuid: Record<string, Array<{ id: string; label: string; amount: number }>>
    saham: Array<{ id: string; ticker: string; lot: number; hargaRataRata: number }>
    emas: { digitalGram: number; fisikAntamGram: number; perhiasan18KGram: number; perhiasan14KGram: number; perhiasan10KGram: number }
    cicilanAktif: Array<{ id: string; tipe: string; label: string; sisaPokok: number; cicilanPerBulan: number; tenorSisaBulan?: number }>
    utangPribadi: Array<{ id: string; label: string; sisaPokok: number }>
  },
  goals: Array<{ id: string; kind: string; label: string; targetIdr: number }>,
  goalProgressData: Array<{ label: string; targetIdr: number; currentIdr: number; progressPct: number }>,
): TableData[] {
  const tables: TableData[] = []

  // Aset table — all categories combined
  const asetRows: string[][] = []
  for (const [cat, rows] of Object.entries(snap.asetLikuid)) {
    for (const r of rows) {
      asetRows.push([cat, r.label, formatIdrPdf(r.amount), '-'])
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

  // Cicilan table
  const cicilanRows: string[][] = []
  for (const c of snap.cicilanAktif) {
    cicilanRows.push([c.label, formatIdrPdf(c.sisaPokok), c.tenorSisaBulan != null ? `${c.tenorSisaBulan} bln` : '-', formatIdrPdf(c.cicilanPerBulan)])
  }
  for (const u of snap.utangPribadi) {
    cicilanRows.push([u.label, formatIdrPdf(u.sisaPokok), '-', '-'])
  }
  if (cicilanRows.length > 0) {
    tables.push({
      title: 'Cicilan Aktif',
      headers: ['Nama', 'Sisa Utang', 'Sisa Tenor', 'Cicilan/Bulan'],
      rows: cicilanRows,
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
