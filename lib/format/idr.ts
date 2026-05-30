const formatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

const plainFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 })

export function idr(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  return formatter.format(value)
}

export function idrPlain(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  return plainFormatter.format(value)
}
