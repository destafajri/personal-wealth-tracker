export const DISCRETIONARY_KEYWORDS = [
  'top-up', 'topup', 'top up',
  'hobi', 'judol', 'judi', 'slot',
  'game', 'gaming',
  'rokok', 'vape', 'boba', 'kopi',
  'club', 'nightlife',
  'streaming', 'subscription',
]

export function isDiscretionary(label: string): boolean {
  const lower = label.toLowerCase()
  return DISCRETIONARY_KEYWORDS.some(kw => lower.includes(kw))
}
