export function duration(totalMonths: number | null | undefined): string {
  if (totalMonths === null || totalMonths === undefined || !Number.isFinite(totalMonths)) return '—'
  if (totalMonths < 1) return 'kurang dari 1 bulan'

  const months = Math.round(totalMonths)
  const years = Math.floor(months / 12)
  const rem = months % 12

  if (years === 0) return `${rem} bulan`
  if (rem === 0) return `${years} tahun`
  return `${years} tahun ${rem} bulan`
}
