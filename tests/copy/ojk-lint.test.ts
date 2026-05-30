import { describe, it, expect } from 'vitest'
import { copy } from '~/lib/copy/strings'
import { lintCopy } from '~/lib/copy/ojk-lint'

describe('ojk-lint', () => {
  it('the copy registry has zero forbidden lemmas', () => {
    const violations = lintCopy(copy as unknown as Record<string, string>)
    if (violations.length > 0) {
      console.log('OJK violations:', violations)
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
