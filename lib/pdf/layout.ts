import { jsPDF } from 'jspdf'
import type { MetricCardData, TableData, HealthMetric } from '~/lib/pdf/metrics'
import type { CompositeStatus } from '~/lib/pdf/metrics'
import type { Zone } from '~/lib/finance/thresholds'
import { formatIndonesianDate, formatIdrPdf } from '~/lib/pdf/format'

const PAGE_W = 297
const PAGE_H = 210
const MARGIN = 15
const CONTENT_W = PAGE_W - MARGIN * 2
const FOOTER_H = 12

export { MARGIN, CONTENT_W, PAGE_W, PAGE_H, FOOTER_H }

export function createPdfDocument(): jsPDF {
  return new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
}

export function drawHeader(doc: jsPDF): void {
  const dateStr = formatIndonesianDate(new Date())
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Cermat - Laporan Keuangan', MARGIN, 18)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text(dateStr, PAGE_W - MARGIN, 18, { align: 'right' })
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(MARGIN, 22, PAGE_W - MARGIN, 22)
}

export function drawFooter(doc: jsPDF, pageNum: number): void {
  const y = PAGE_H - MARGIN + 2
  doc.setFontSize(7)
  doc.setTextColor(130, 130, 130)
  doc.setFont('helvetica', 'italic')
  doc.text('100% client-side. Cermat bukan penasihat keuangan atau produk berizin.', MARGIN, y)
  doc.setFont('helvetica', 'normal')
  doc.text('Dibuat dengan Cermat', PAGE_W - MARGIN - 20, y, { align: 'right' })
  doc.text(`hal. ${pageNum}`, PAGE_W - MARGIN, y + 4, { align: 'right' })
  doc.setTextColor(0, 0, 0)
}

export function drawMetricCards(doc: jsPDF, metrics: MetricCardData[], startY: number): number {
  const cols = 3
  const rows = Math.ceil(metrics.length / cols)
  const gapX = 5
  const gapY = 5
  const cardW = (CONTENT_W - (cols - 1) * gapX) / cols
  const cardH = 20

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c
      if (idx >= metrics.length) break
      const m = metrics[idx]!
      const x = MARGIN + c * (cardW + gapX)
      const y = startY + r * (cardH + gapY)

      doc.setFillColor(240, 240, 240)
      doc.rect(x, y, cardW, cardH, 'F')
      doc.setDrawColor(210, 210, 210)
      doc.setLineWidth(0.2)
      doc.rect(x, y, cardW, cardH, 'S')

      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text(m.label, x + 4, y + 7)

      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text(m.value, x + 4, y + 16)
    }
  }

  return startY + rows * (cardH + gapY)
}

export function drawCompositeStatus(doc: jsPDF, status: CompositeStatus, y: number): number {
  const labels: Record<CompositeStatus, string> = { sehat: 'Status Keuangan: Sehat', waspada: 'Status Keuangan: Perlu Perhatian', agresif: 'Status Keuangan: Agresif', bahaya: 'Status Keuangan: Kritis', sparse: 'Status Keuangan: Data belum lengkap' }
  const colors: Record<CompositeStatus, [number, number, number]> = { sehat: [16, 185, 129], waspada: [245, 158, 11], agresif: [220, 80, 40], bahaya: [239, 68, 68], sparse: [156, 163, 175] }
  const c = colors[status]
  const label = labels[status]

  doc.setFillColor(c[0], c[1], c[2])
  doc.roundedRect(MARGIN, y, 70, 8, 2, 2, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text(label, MARGIN + 4, y + 5.5)
  doc.setTextColor(0, 0, 0)

  return y + 12
}

function zoneColor(zone: Zone): [number, number, number] {
  if (zone === 'sehat') return [16, 185, 129]
  if (zone === 'waspada') return [245, 158, 11]
  return [239, 68, 68]
}

export function drawHealthMetrics(doc: jsPDF, metrics: HealthMetric[], startY: number): number {
  const cols = 2
  const gapX = 8
  const gapY = 6
  const cardW = (CONTENT_W - (cols - 1) * gapX) / cols
  const cardH = 26
  let y = startY

  for (let i = 0; i < metrics.length; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = MARGIN + col * (cardW + gapX)
    y = startY + row * (cardH + gapY)
    const m = metrics[i]!
    const [cr, cg, cb] = zoneColor(m.zone)

    // Card background
    doc.setFillColor(245, 245, 245)
    doc.rect(x, y, cardW, cardH, 'F')
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(0.2)
    doc.rect(x, y, cardW, cardH, 'S')

    // Metric name
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text(m.label, x + 4, y + 7)

    // Value
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(m.value, x + 4, y + 16)

    // Status badge
    const badgeX = x + cardW - 34
    const badgeW = 30
    doc.setFillColor(cr, cg, cb)
    doc.roundedRect(badgeX, y + 4, badgeW, 6, 1.5, 1.5, 'F')
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(m.zoneLabel, badgeX + badgeW / 2, y + 8.2, { align: 'center' })
    doc.setTextColor(0, 0, 0)

    // Description line
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(120, 120, 120)
    doc.text(m.description, x + 4, y + 21)

    // Target line
    doc.setTextColor(100, 100, 100)
    doc.text(m.target, x + 4, y + 24.5)
    doc.setTextColor(0, 0, 0)
  }

  const totalRows = Math.ceil(metrics.length / cols)
  return startY + totalRows * (cardH + gapY) + 2
}

import type { RecommendationData } from '~/lib/pdf/metrics'

export function drawRecommendationPage(doc: jsPDF, data: RecommendationData, startY: number): void {
  let y = startY

  // Modal Siap Distribusi header
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(`Modal Siap Distribusi: ${formatIdrPdf(data.modalSiap)}`, MARGIN, y)
  y += 5
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(120, 120, 120)
  doc.text('(Dana setelah dana darurat 3-6 bulan terpenuhi)', MARGIN, y)
  y += 7

  // Insight statements
  if (data.insights.length > 0) {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 100, 180)
    doc.text('Insight:', MARGIN, y)
    y += 4
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)
    for (const insight of data.insights) {
      const lines = doc.splitTextToSize(`• ${insight}`, CONTENT_W - 4)
      doc.text(lines, MARGIN + 2, y)
      y += lines.length * 3.5 + 1
    }
    y += 3
  }

  // Recommendations
  if (data.recommendations.length > 0) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('REKOMENDASI:', MARGIN, y)
    y += 6

    for (let i = 0; i < data.recommendations.length; i++) {
      if (y > PAGE_H - MARGIN - 15) break
      const r = data.recommendations[i]!

      // Number + label
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text(`${i + 1}. ${r.label}`, MARGIN + 2, y)
      y += 4

      // Allocation
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text(`Alokasi: ${formatIdrPdf(r.allocation)}`, MARGIN + 6, y)
      y += 3.5

      // Impact (may wrap)
      const impactLines = doc.splitTextToSize(`Impact: ${r.impact}`, CONTENT_W - 12)
      doc.text(impactLines, MARGIN + 6, y)
      y += impactLines.length * 3.2 + 3
      doc.setTextColor(0, 0, 0)
    }
  } else if (data.modalSiap <= 0) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(180, 100, 0)
    doc.text('Modal belum tersedia. Fokus bangun dana darurat 3-6 bulan dulu.', MARGIN + 4, y)
    doc.setTextColor(0, 0, 0)
  } else {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(16, 185, 129)
    doc.text('Tidak ada utang yang perlu dilunasi. Pertimbangkan investasi tambahan.', MARGIN + 4, y)
    doc.setTextColor(0, 0, 0)
  }

  // Surplus note
  if (data.surplusAfterAllDebt > 0 && data.recommendations.length > 0) {
    y += 4
    doc.setFontSize(7)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(100, 100, 100)
    doc.text(`Sisa modal ${formatIdrPdf(data.surplusAfterAllDebt)} — pertimbangkan investasi tambahan (lihat opsi di app).`, MARGIN + 2, y)
    doc.setTextColor(0, 0, 0)
  }

  // Disclaimer
  y += 6
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(150, 150, 150)
  const disclaimer = 'CATATAN: Pertimbangkan keep dana darurat 3-6 bulan pengeluaran terpisah dari Modal Siap Distribusi. Semua rekomendasi bersifat saran, bukan rekomendasi investasi.'
  const dLines = doc.splitTextToSize(disclaimer, CONTENT_W)
  doc.text(dLines, MARGIN, y)
}

export interface DonutSegment {
  label: string
  value: number
  color: string // hex like '#10b981'
}

function renderDonutCanvas(
  segments: DonutSegment[],
  canvasW: number,
  canvasH: number,
): string {
  if (typeof document === 'undefined') return ''
  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasW, canvasH)

  const total = segments.reduce((s, seg) => s + seg.value, 0)
  if (total <= 0 || segments.length === 0) {
    ctx.fillStyle = '#999999'
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Belum ada data', canvasW / 2, canvasH / 2)
    return canvas.toDataURL('image/png')
  }

  // Donut geometry
  const legendW = 130
  const chartAreaW = canvasW - legendW
  const cx = chartAreaW / 2
  const cy = canvasH / 2
  const outerR = Math.min(cx, cy) * 0.78
  const innerR = outerR * 0.58

  // Draw segments
  let startAngle = -Math.PI / 2
  for (const seg of segments) {
    const sweep = (seg.value / total) * 2 * Math.PI
    ctx.beginPath()
    ctx.arc(cx, cy, outerR, startAngle, startAngle + sweep)
    ctx.arc(cx, cy, innerR, startAngle + sweep, startAngle, true)
    ctx.closePath()
    ctx.fillStyle = seg.color
    ctx.fill()
    startAngle += sweep
  }

  // Center label
  ctx.fillStyle = '#333333'
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('Total', cx, cy - 8)
  ctx.font = '11px sans-serif'
  ctx.fillStyle = '#666666'
  // Format a compact number
  if (total >= 1_000_000_000) {
    ctx.fillText(`Rp ${(total / 1_000_000_000).toFixed(1)}M`, cx, cy + 8)
  } else if (total >= 1_000_000) {
    ctx.fillText(`Rp ${(total / 1_000_000).toFixed(1)}jt`, cx, cy + 8)
  } else {
    ctx.fillText(`Rp ${total.toLocaleString('id-ID')}`, cx, cy + 8)
  }

  // Legend on the right
  const legendX = chartAreaW + 8
  let legendY = 20
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  for (const seg of segments) {
    if (legendY > canvasH - 16) break
    // Color square
    ctx.fillStyle = seg.color
    ctx.fillRect(legendX, legendY, 10, 10)
    // Label
    ctx.fillStyle = '#333333'
    ctx.font = '10px sans-serif'
    const pct = ((seg.value / total) * 100).toFixed(1).replace('.', ',')
    ctx.fillText(`${seg.label} (${pct}%)`, legendX + 14, legendY)
    legendY += 16
  }

  const dataUrl = canvas.toDataURL('image/png')
  // Release canvas memory
  canvas.width = 0
  canvas.height = 0
  return dataUrl
}

export function drawDonutChart(
  doc: jsPDF,
  title: string,
  segments: DonutSegment[],
  startX: number,
  startY: number,
  w: number,
  h: number,
): number {
  // Title
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(title, startX + w / 2, startY + 5, { align: 'center' })

  // Render donut on canvas and embed as image
  const pxW = Math.round(w * 4)  // 4x for mm→px at ~96dpi
  const pxH = Math.round((h - 8) * 4)
  const dataUrl = renderDonutCanvas(segments, pxW, pxH)
  doc.addImage(dataUrl, 'PNG', startX, startY + 7, w, h - 7)

  // Border around chart area
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.2)
  doc.rect(startX, startY, w, h, 'S')

  return startY + h
}

// Native jsPDF bar chart for Net Worth
export function drawNetWorthBars(
  doc: jsPDF,
  totalAset: number,
  totalUtang: number,
  formatIdr: (v: number) => string,
  startX: number,
  startY: number,
  w: number,
  h: number,
): number {
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.2)
  doc.rect(startX, startY, w, h, 'S')

  const maxVal = Math.max(totalAset, totalUtang, 1)
  const barW = 22
  const gap = w / 3
  const baseY = startY + h - 14

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text('Rasio Aset vs Utang', startX + w / 2, startY + 8, { align: 'center' })

  // Aset bar
  const asetBarH = Math.max((totalAset / maxVal) * (h - 35), 3)
  const asetX = startX + gap - barW / 2
  doc.setFillColor(16, 185, 129)
  doc.rect(asetX, baseY - asetBarH, barW, asetBarH, 'F')
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(5, 150, 105)
  doc.text(formatIdr(totalAset), asetX + barW / 2, baseY - asetBarH - 3, { align: 'center' })
  doc.setTextColor(80, 80, 80)
  doc.setFont('helvetica', 'normal')
  doc.text('Aset', asetX + barW / 2, baseY + 5, { align: 'center' })

  // Utang bar
  const utangBarH = Math.max((totalUtang / maxVal) * (h - 35), 3)
  const utangX = startX + gap * 2 - barW / 2
  doc.setFillColor(244, 63, 94)
  doc.rect(utangX, baseY - utangBarH, barW, utangBarH, 'F')
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(225, 29, 72)
  doc.text(formatIdr(totalUtang), utangX + barW / 2, baseY - utangBarH - 3, { align: 'center' })
  doc.setTextColor(80, 80, 80)
  doc.setFont('helvetica', 'normal')
  doc.text('Utang', utangX + barW / 2, baseY + 5, { align: 'center' })

  doc.setTextColor(0, 0, 0)
  return startY + h
}

export function drawDetailTable(
  doc: jsPDF,
  table: TableData,
  startY: number,
  pageNum: number,
): { endY: number; pageNum: number } {
  let y = startY
  const rowH = 7
  const headerH = 9
  const colCount = table.headers.length
  const colW = CONTENT_W / colCount
  const maxY = PAGE_H - MARGIN - FOOTER_H

  if (y + headerH + rowH * 2 > maxY) {
    doc.addPage()
    pageNum++
    drawHeader(doc)
    drawFooter(doc, pageNum)
    y = 28
  }

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(table.title, MARGIN, y + 6)
  y += headerH

  doc.setFillColor(230, 230, 230)
  doc.rect(MARGIN, y, CONTENT_W, rowH, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(50, 50, 50)
  for (let c = 0; c < colCount; c++) {
    const align: 'left' | 'right' = c >= 2 ? 'right' : 'left'
    const x = align === 'right' ? MARGIN + (c + 1) * colW - 3 : MARGIN + c * colW + 3
    doc.text(table.headers[c] ?? '', x, y + 5, { align })
  }
  y += rowH

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  for (let r = 0; r < table.rows.length; r++) {
    if (y + rowH > maxY) {
      doc.addPage()
      pageNum++
      drawHeader(doc)
      drawFooter(doc, pageNum)
      y = 28
      doc.setFillColor(230, 230, 230)
      doc.rect(MARGIN, y, CONTENT_W, rowH, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(50, 50, 50)
      for (let c = 0; c < colCount; c++) {
        const align: 'left' | 'right' = c >= 2 ? 'right' : 'left'
        const x = align === 'right' ? MARGIN + (c + 1) * colW - 3 : MARGIN + c * colW + 3
        doc.text(table.headers[c] ?? '', x, y + 5, { align })
      }
      y += rowH
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
    }

    const row = table.rows[r]!
    if (r % 2 === 1) {
      doc.setFillColor(248, 248, 248)
      doc.rect(MARGIN, y, CONTENT_W, rowH, 'F')
    }
    doc.setTextColor(30, 30, 30)
    for (let c = 0; c < colCount; c++) {
      const align: 'left' | 'right' = c >= 2 ? 'right' : 'left'
      const x = align === 'right' ? MARGIN + (c + 1) * colW - 3 : MARGIN + c * colW + 3
      doc.text(row[c] ?? '', x, y + 5, { align })
    }
    y += rowH
  }

  y += 6
  return { endY: y, pageNum }
}
