const SUFFIX_MAP: Record<string, number> = {
  triliun: 1_000_000_000_000,
  tri: 1_000_000_000_000,
  t: 1_000_000_000_000,
  miliar: 1_000_000_000,
  milyar: 1_000_000_000,
  bn: 1_000_000_000,
  b: 1_000_000_000,
  m: 1_000_000_000,
  juta: 1_000_000,
  jt: 1_000_000,
  mln: 1_000_000,
  ribu: 1_000,
  rb: 1_000,
  k: 1_000,
}

export function parseCurrency(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) return null
  if (typeof input === 'number') return Number.isFinite(input) ? input : null

  let s = String(input).trim().toLowerCase()
  if (s.length === 0) return null

  s = s.replace(/^rp\s*\.?\s*/i, '').trim()
  if (s.length === 0) return null

  let multiplier = 1
  const tail = /^(.*?)([a-z]+)\s*$/i.exec(s)
  if (tail) {
    const suffix = tail[2]!.toLowerCase()
    const mult = SUFFIX_MAP[suffix]
    if (mult !== undefined) {
      multiplier = mult
      s = tail[1]!.trim()
    } else {
      return null
    }
  }

  if (s.length === 0) return null

  const hasComma = s.includes(',')
  const hasDot = s.includes('.')

  let cleaned: string
  if (hasComma && hasDot) {
    const lastComma = s.lastIndexOf(',')
    const lastDot = s.lastIndexOf('.')
    if (lastComma > lastDot) {
      cleaned = s.replace(/\./g, '').replace(',', '.')
    } else {
      cleaned = s.replace(/,/g, '')
    }
  } else if (hasComma) {
    const parts = s.split(',')
    const last = parts[parts.length - 1] ?? ''
    if (parts.length === 2 && last.length <= 2) {
      cleaned = s.replace(',', '.')
    } else {
      cleaned = s.replace(/,/g, '')
    }
  } else if (hasDot) {
    const parts = s.split('.')
    const last = parts[parts.length - 1] ?? ''
    if (parts.length === 2 && last.length <= 2 && (parts[0]?.length ?? 0) <= 3) {
      cleaned = s
    } else {
      cleaned = s.replace(/\./g, '')
    }
  } else {
    cleaned = s
  }

  cleaned = cleaned.replace(/\s+/g, '')
  const n = Number(cleaned)
  if (!Number.isFinite(n)) return null
  return n * multiplier
}
