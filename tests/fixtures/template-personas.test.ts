import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { PERSONAS, applyPersona } from '~/lib/fixtures/personas'
import { useSnapshotStore } from '~/stores/snapshot'
import { useGoalsStore } from '~/stores/goals'

// Tests for Phase 8.2 template personas. Verifies:
// - Exactly 5 templates exist with kind: 'template' + mode: 'wealthTracker'
// - Diagnostic personas (existing) still excluded from template filter
// - Each template's apply() leaves a non-empty snapshot
// - Numeric values are within realistic Indonesian market ranges

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('template persona registry', () => {
  it('has exactly 5 template personas', () => {
    const templates = PERSONAS.filter((p) => p.kind === 'template')
    expect(templates).toHaveLength(5)
  })

  it('all templates have mode: wealthTracker', () => {
    const templates = PERSONAS.filter((p) => p.kind === 'template')
    for (const t of templates) {
      expect(t.mode).toBe('wealthTracker')
    }
  })

  it('all templates have unique ids', () => {
    const ids = PERSONAS.filter((p) => p.kind === 'template').map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('expected template ids are present', () => {
    const ids = PERSONAS.filter((p) => p.kind === 'template').map((p) => p.id)
    expect(ids).toContain('template-pegawai-kpr')
    expect(ids).toContain('template-freelancer')
    expect(ids).toContain('template-mahasiswa')
    expect(ids).toContain('template-pasangan-muda')
    expect(ids).toContain('template-pensiunan')
  })

  it('all templates have non-empty emoji + nama + blurb', () => {
    const templates = PERSONAS.filter((p) => p.kind === 'template')
    for (const t of templates) {
      expect(t.emoji).toBeTruthy()
      expect(t.nama).toBeTruthy()
      expect(t.blurb).toBeTruthy()
    }
  })
})

describe('diagnostic vs template filter isolation', () => {
  it('demo banner filter (mode + kind !== template) returns exactly 8 wealthTracker diagnostic personas', () => {
    // This mirrors pages/app/snapshot.vue:125 — the leak-prevention filter
    const demoBannerPersonas = PERSONAS.filter(
      (p) => p.mode === 'wealthTracker' && p.kind !== 'template',
    )
    expect(demoBannerPersonas).toHaveLength(8)
  })

  it('template picker filter (kind === template) returns 5 (does not include diagnostic)', () => {
    const templatePickerPersonas = PERSONAS.filter((p) => p.kind === 'template')
    expect(templatePickerPersonas).toHaveLength(5)
    // Sanity: all template ids start with `template-` prefix
    for (const t of templatePickerPersonas) {
      expect(t.id.startsWith('template-')).toBe(true)
    }
  })

  it('budget-kos personas are unaffected by template additions', () => {
    const budgetKos = PERSONAS.filter((p) => p.mode === 'budgetKos')
    // 2 budget-kos personas existed pre-Phase 8.2; templates are all wealthTracker
    expect(budgetKos.length).toBeGreaterThanOrEqual(2)
    expect(budgetKos.every((p) => p.kind !== 'template')).toBe(true)
  })
})

describe('template apply() leaves a realistic non-empty snapshot', () => {
  const templates = PERSONAS.filter((p) => p.kind === 'template')

  for (const persona of templates) {
    it(`${persona.id} seeds non-empty snapshot with realistic values`, () => {
      const snap = useSnapshotStore()
      const goals = useGoalsStore()
      applyPersona(snap, persona, goals)

      // Snapshot should NOT be in demo mode (templates are not demos)
      expect(snap.isDemo).toBe(false)

      // At least one meaningful data point: penghasilan amount > 0
      expect(snap.penghasilan.amount).toBeGreaterThan(0)

      // At least one kas row
      expect(snap.asetLikuid.kas.length).toBeGreaterThan(0)
      const totalKas = snap.asetLikuid.kas.reduce((s, r) => s + (r.amount || 0), 0)
      expect(totalKas).toBeGreaterThan(0)

      // Penghasilan within realistic Indonesian range (1jt - 50jt/month)
      expect(snap.penghasilan.amount).toBeGreaterThanOrEqual(1_000_000)
      expect(snap.penghasilan.amount).toBeLessThanOrEqual(50_000_000)
    })
  }

  it('pegawai-kpr template seeds KPR cicilan with realistic terms', () => {
    const snap = useSnapshotStore()
    const pegawaiKpr = PERSONAS.find((p) => p.id === 'template-pegawai-kpr')!
    applyPersona(snap, pegawaiKpr)
    const kpr = snap.cicilanAktif.find((c) => c.tipe === 'KPR')
    expect(kpr).toBeDefined()
    expect(kpr!.tenorSisaBulan).toBeGreaterThanOrEqual(60) // at least 5yr
    expect(kpr!.tenorSisaBulan).toBeLessThanOrEqual(360) // max 30yr
    expect(kpr!.sukuBunga).toBeGreaterThanOrEqual(5)
    expect(kpr!.sukuBunga).toBeLessThanOrEqual(12)
  })

  it('mahasiswa template seeds no utang (debt-free profile)', () => {
    const snap = useSnapshotStore()
    const mahasiswa = PERSONAS.find((p) => p.id === 'template-mahasiswa')!
    applyPersona(snap, mahasiswa)
    expect(snap.cicilanAktif.length).toBe(0)
    expect(snap.utangPribadi.length).toBe(0)
    expect(snap.gadai.length).toBe(0)
  })

  it('pensiunan template seeds no cicilan (debt-free profile)', () => {
    const snap = useSnapshotStore()
    const pensiunan = PERSONAS.find((p) => p.id === 'template-pensiunan')!
    applyPersona(snap, pensiunan)
    expect(snap.cicilanAktif.length).toBe(0)
  })
})
