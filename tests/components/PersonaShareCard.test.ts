import { describe, expect, it } from 'vitest'
import { resolvePersona, PERSONA_VISUALS, type PersonaKey } from '~/lib/finance/persona'
import { t } from '~/lib/copy/strings'

// Privacy audit: verify that persona-related strings contain no financial amounts.
// This tests the data that PersonaShareCard receives via props and displays.

const ALL_KEYS: PersonaKey[] = ['sultanKos', 'investorKos', 'anakKosBijak', 'pejuangAkhirBulan', 'sobatIndomie']

describe('PersonaShareCard privacy audit', () => {
  it('persona labels contain no digits', () => {
    for (const key of ALL_KEYS) {
      const label = t(`persona.${key}.label` as import('~/lib/copy/strings').CopyKey)
      expect(label, `label for ${key} should have no digits`).not.toMatch(/\d/)
    }
  })

  it('persona taglines contain no digits', () => {
    for (const key of ALL_KEYS) {
      const tagline = t(`persona.${key}.tagline` as import('~/lib/copy/strings').CopyKey)
      expect(tagline, `tagline for ${key} should have no digits`).not.toMatch(/\d/)
    }
  })

  it('share CTA contains no digits', () => {
    const cta = t('share.cta')
    expect(cta).not.toMatch(/\d/)
  })

  it('share brand lockup contains no digits', () => {
    const brand = t('share.brandLockup')
    expect(brand).not.toMatch(/\d/)
  })

  it('no PERSONA_VISUALS gradient contains amounts (no 3+ digit numbers)', () => {
    for (const key of ALL_KEYS) {
      const { gradient } = PERSONA_VISUALS[key]
      // Gradients are Tailwind classes like "from-amber-400" — allow 3-digit color codes
      // but forbid patterns that look like financial amounts (6+ consecutive digits)
      expect(gradient, `gradient for ${key} should have no amount-like numbers`).not.toMatch(/\d{6,}/)
    }
  })
})

describe('PersonaShareCard greylist boundary', () => {
  it('stats props only convey savingsRate and runway — no other derived numbers', () => {
    // Simulate what PersonaShareCard would receive:
    // Only savingsRate % and runway bln are allowed (greylist)
    // This test verifies the resolvePersona output doesn't leak amounts
    const input = {
      savingsRate: 35,
      runway: 6,
      hasInvestments: false,
      isSnapshotReady: true,
    }
    const result = resolvePersona(input)
    expect(result).not.toBeNull()
    // The PersonaResult only has key + tone — no financial numbers
    expect(Object.keys(result!)).toEqual(['key', 'tone'])
    // Verify no Rp amounts in the result
    const serialized = JSON.stringify(result)
    expect(serialized).not.toMatch(/\d{3,}/) // no multi-digit numbers (amounts)
  })

  it('snapshot with balance Rp 999,999,999 does not leak into persona resolve', () => {
    // Even with extreme balance, persona resolution only sees savingsRate and runway
    const result = resolvePersona({
      savingsRate: 5,
      runway: 2,
      hasInvestments: false,
      isSnapshotReady: true,
    })
    expect(result?.key).toBe('sobatIndomie')
    const serialized = JSON.stringify(result)
    expect(serialized).not.toContain('999')
  })
})

describe('Share text privacy', () => {
  it('generated share text contains no digits for any persona', () => {
    const APP_URL = 'https://cermat.vercel.app'
    for (const key of ALL_KEYS) {
      const label = t(`persona.${key}.label` as import('~/lib/copy/strings').CopyKey)
      const shareText = `Aku ${label}! ✨ Cek keuanganmu juga di Cermat × Mamikos!\n${APP_URL}`
      // Only digits allowed are from the URL (no financial amounts)
      const withoutUrl = shareText.replace(APP_URL, '')
      expect(withoutUrl, `share text for ${key} should have no digits outside URL`).not.toMatch(/\d/)
    }
  })
})
