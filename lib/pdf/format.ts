const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

export function formatIndonesianDate(date: Date): string {
  const d = date.getDate()
  const m = MONTHS_ID[date.getMonth()] ?? '???'
  const y = date.getFullYear()
  return `${d} ${m} ${y}`
}

export function formatIdrPdf(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return 'N/A'
  if (value === 0) return 'Rp 0'
  const abs = Math.abs(value)
  const formatted = Math.round(abs).toLocaleString('id-ID')
  return value < 0 ? `-Rp ${formatted}` : `Rp ${formatted}`
}

export function formatPercentPdf(value: number | null | undefined, fractionDigits = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return 'N/A'
  return `${value.toFixed(fractionDigits).replace('.', ',')}%`
}
