import { describe, it, expect } from 'vitest'
import { copy } from '~/lib/copy/strings'
import { metricExplainers } from '~/lib/copy/metric-explainers'
import { lintCopy } from '~/lib/copy/ojk-lint'

// Flatten the nested explainer registry into a key→string map for ojk-lint. Each scalar
// string in the nested spec contributes one entry under a dotted path.
function flattenExplainers(): Record<string, string> {
  const flat: Record<string, string> = {}
  for (const [key, spec] of Object.entries(metricExplainers)) {
    flat[`${key}.title`] = spec.title
    flat[`${key}.definition`] = spec.definition
    flat[`${key}.formula`] = spec.formula
    if (spec.note) flat[`${key}.note`] = spec.note
    spec.zones?.forEach((z, i) => {
      flat[`${key}.zones[${i}].label`] = z.label
      flat[`${key}.zones[${i}].range`] = z.range
      flat[`${key}.zones[${i}].body`] = z.body
    })
  }
  return flat
}

describe('ojk-lint', () => {
  it('the copy registry has zero forbidden lemmas', () => {
    const violations = lintCopy(copy as unknown as Record<string, string>)
    if (violations.length > 0) {
      console.log('OJK violations:', violations)
    }
    expect(violations).toEqual([])
  })

  it('the metric explainer registry has zero forbidden lemmas', () => {
    const violations = lintCopy(flattenExplainers())
    if (violations.length > 0) {
      console.log('OJK violations in metric-explainers:', violations)
    }
    expect(violations).toEqual([])
  })

  it('catches forbidden lemmas in arbitrary strings', () => {
    const bad = {
      a: 'Sebaiknya kamu coba opsi ini.',
      b: 'Kami sarankan untuk mulai sekarang.',
      c: 'Produk ini terdaftar di OJK.',
      ok: 'Cek dampak ke goal kamu.',
    }
    const v = lintCopy(bad)
    const keys = v.map((x) => x.key).sort()
    expect(keys).toEqual(['a', 'b', 'c'])
  })

  it('is case-insensitive', () => {
    expect(lintCopy({ x: 'WAJIB punya emergency fund' })).toHaveLength(1)
  })
})
