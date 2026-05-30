export interface LintViolation {
  key: string
  value: string
  pattern: string
  match: string
}

const FORBIDDEN: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /\bsebaiknya\b/i, name: 'sebaiknya' },
  { pattern: /\bdisarankan\b/i, name: 'disarankan' },
  { pattern: /\bharus(?:nya)?\b/i, name: 'harus(nya)' },
  { pattern: /\bwajib\b/i, name: 'wajib' },
  { pattern: /\brekomendasi\b/i, name: 'rekomendasi' },
  { pattern: /\bdirekomendasikan\b/i, name: 'direkomendasikan' },
  { pattern: /\bsaran(?:nya|kan|kannya)?\b/i, name: 'saran' },
  { pattern: /\bpilihan terbaik\b/i, name: 'pilihan terbaik' },
  { pattern: /\bterdaftar[^.]*ojk\b/i, name: 'terdaftar OJK' },
  { pattern: /\bdiawasi[^.]*ojk\b/i, name: 'diawasi OJK' },
  { pattern: /\bberizin[^.]*ojk\b/i, name: 'berizin OJK' },
]

export function lintCopy(strings: Record<string, string>): LintViolation[] {
  const violations: LintViolation[] = []
  for (const [key, value] of Object.entries(strings)) {
    for (const { pattern, name } of FORBIDDEN) {
      const match = value.match(pattern)
      if (match) {
        violations.push({ key, value, pattern: name, match: match[0] })
      }
    }
  }
  return violations
}
