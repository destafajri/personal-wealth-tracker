import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { applyDemoSnapshot } from '~/lib/fixtures/demoSnapshot'
import {
  CICILAN_HEADER,
  GOALS_HEADER,
  PER_EMITEN_HEADER,
  SCHEMA_VERSION,
  SNAPSHOT_HEADER,
  buildCicilanAktif,
  buildGoals,
  buildMeta,
  buildPerEmiten,
  buildRingkasan,
  buildSnapshot,
  type XlsxContext,
} from '~/lib/xlsx/sheets'
import { FI_MULTIPLIER, useGoalsStore } from '~/stores/goals'
import { useSnapshotStore } from '~/stores/snapshot'
import type { PricesView, SnapshotState } from '~/lib/types/snapshot'

function emptyPrices(): PricesView {
  return {
    goldDigitalIdrPerGram: null,
    goldAntam1gIdr: null,
    fxRates: { USD: null, SGD: null, EUR: null, JPY: null, KRW: null },
    idxByTicker: {},
    cryptoByCoinId: {},
  }
}

// Read store into a plain SnapshotState, same shallow-clone pattern useXlsx
// uses in production. Builders take plain state, so this mirrors the boundary.
function snapStateFrom(snap: ReturnType<typeof useSnapshotStore>): SnapshotState {
  return {
    penghasilan: { ...snap.penghasilan },
    penghasilanLain: [...snap.penghasilanLain],
    pengeluaran: { ...snap.pengeluaran },
    asetLikuid: {
      kas: [...snap.asetLikuid.kas],
      deposito: [...snap.asetLikuid.deposito],
      reksaDana: [...snap.asetLikuid.reksaDana],
      sbn: [...snap.asetLikuid.sbn],
    },
    asetNonLikuid: {
      properti: [...snap.asetNonLikuid.properti],
      kendaraan: [...snap.asetNonLikuid.kendaraan],
      pensiun: [...snap.asetNonLikuid.pensiun],
    },
    emas: { ...snap.emas },
    saham: [...snap.saham],
    crypto: [...snap.crypto],
    cicilanAktif: [...snap.cicilanAktif],
    utangPribadi: [...snap.utangPribadi],
    gadai: [...snap.gadai],
  }
}

function makeCtx(
  snapState: SnapshotState,
  goals: ReturnType<typeof useGoalsStore>['goals'],
): XlsxContext {
  return {
    snap: snapState,
    prices: emptyPrices(),
    goals: [...goals],
    derived: {
      totalAset: 100_000_000,
      totalUtang: 50_000_000,
      netWorth: 50_000_000,
      modalSiap: 10_000_000,
      dsr: 23.5,
      dar: 50.0,
      runway: 12,
      savingsRate: 20,
      safeHaven: 55,
      allocationDiscipline: 0.85,
      goalHealth: null,
      surplusIdr: 2_000_000,
      penghasilanMonthlyIdr: 8_800_000,
      dividendAnnual: 5_000_000,
      bungaSbnAnnual: 400_000,
      bungaDepositoAnnual: 340_000,
    },
    exportedAt: '2026-06-03T05:00:00.000Z',
    fiMultiplier: FI_MULTIPLIER,
    annualReturnReal: 0.05,
  }
}

describe('buildRingkasan', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('emits hero + metric + counts blocks with stable labels', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const goals = useGoalsStore()
    const rows = buildRingkasan(makeCtx(snapStateFrom(snap), goals.goals))

    // Header row + exported_at row
    expect(rows[0]).toEqual(['Cermat Snapshot Report', null])
    expect(rows[1]?.[0]).toBe('Exported at')

    // Find hero labels — order matters for readability, but the test asserts
    // presence not row index (future row inserts shouldn't break the test).
    const labels = rows.map((r) => r[0])
    expect(labels).toContain('Net Worth')
    expect(labels).toContain('Total Aset')
    expect(labels).toContain('Modal Siap Distribusi')
    expect(labels).toContain('DSR (Debt Service Ratio %)')
    expect(labels).toContain('Runway (bulan)')
    expect(labels).toContain('Safe Haven (%)')
    expect(labels).toContain('Goal Health (%)')
    expect(labels).toContain('Saham emiten')
  })

  it('passes through null derived metrics as blank cells, not NaN', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const goals = useGoalsStore()
    const ctx = makeCtx(snapStateFrom(snap), goals.goals)
    ctx.derived = {
      ...ctx.derived,
      dsr: null,
      dar: null,
      runway: null,
      savingsRate: null,
      safeHaven: null,
      allocationDiscipline: null,
      goalHealth: null,
    }
    const rows = buildRingkasan(ctx)
    const dsrRow = rows.find((r) => r[0] === 'DSR (Debt Service Ratio %)')
    expect(dsrRow?.[1]).toBeNull()
  })
})

describe('buildSnapshot', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('opens with the 5-column hybrid header then a row per section item', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const rows = buildSnapshot(snapStateFrom(snap), emptyPrices())

    expect(rows[0]).toEqual(SNAPSHOT_HEADER)
    expect(SNAPSHOT_HEADER).toEqual([
      'section',
      'label',
      'value_source',
      'source_currency',
      'value_idr',
    ])

    // At least one row per section under demo persona
    const sections = new Set(rows.slice(1).map((r) => r[0]))
    for (const s of [
      'penghasilan',
      'penghasilanLain',
      'pengeluaran',
      'asetLikuid.kas',
      'asetLikuid.deposito',
      'asetLikuid.reksaDana',
      'asetLikuid.sbn',
      'asetNonLikuid.properti',
      'asetNonLikuid.kendaraan',
      'asetNonLikuid.pensiun',
      'emas',
      'crypto',
      'cicilanAktif',
      'utangPribadi',
      'gadai',
    ]) {
      expect(sections.has(s)).toBe(true)
    }
  })

  it('IDR rows: value_idr equals value_source (identity)', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const rows = buildSnapshot(snapStateFrom(snap), emptyPrices())
    const idrRows = rows
      .slice(1)
      .filter((r) => r[3] === 'IDR' && typeof r[2] === 'number' && (r[2] as number) > 0)
    expect(idrRows.length).toBeGreaterThan(0)
    for (const r of idrRows) {
      expect(r[4]).toBe(r[2]) // value_idr === value_source
    }
  })

  it('emas rows: value_source is gram, source_currency is "gram", value_idr is null when prices missing', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const rows = buildSnapshot(snapStateFrom(snap), emptyPrices())
    const emasRows = rows.filter((r) => r[0] === 'emas')
    expect(emasRows.length).toBe(5) // 5 emas categories always emitted
    for (const r of emasRows) {
      expect(r[3]).toBe('gram')
      // With empty prices, value_idr is null for gram>0 rows and 0 for gram=0
      const gram = r[2] as number
      if (gram > 0) {
        expect(r[4]).toBeNull()
      } else {
        expect(r[4]).toBe(0)
      }
    }
  })

  it('emas rows: value_idr converts via ratePerGram when gold prices loaded', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const prices: PricesView = {
      ...emptyPrices(),
      goldDigitalIdrPerGram: 1_500_000,
      goldAntam1gIdr: 2_500_000,
    }
    const rows = buildSnapshot(snapStateFrom(snap), prices)
    const fisikRow = rows.find((r) => r[0] === 'emas' && r[1] === 'Fisik Antam')!
    const gram = fisikRow[2] as number
    const expectedIdr = gram * 2_500_000 * 0.897 // fisikAntamSpread
    expect(fisikRow[4]).toBeCloseTo(expectedIdr, 0)
  })

  it('foreign-currency row: value_idr stays null when FX rate missing; populates when loaded', () => {
    const snap = useSnapshotStore()
    snap.setPenghasilanAmount(1000)
    snap.setPenghasilanCurrency('USD')
    // Empty FX
    const rowsEmpty = buildSnapshot(snapStateFrom(snap), emptyPrices())
    const gajiEmpty = rowsEmpty.find((r) => r[0] === 'penghasilan')!
    expect(gajiEmpty[3]).toBe('USD')
    expect(gajiEmpty[4]).toBeNull()
    // With FX
    const rowsWithFx = buildSnapshot(snapStateFrom(snap), {
      ...emptyPrices(),
      fxRates: { USD: 16_000, SGD: null, EUR: null, JPY: null, KRW: null },
    })
    const gajiFx = rowsWithFx.find((r) => r[0] === 'penghasilan')!
    expect(gajiFx[4]).toBe(16_000_000)
  })

  it('surfaces sukuBungaPercent + rdJenis inline in the label (label column unchanged)', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const rows = buildSnapshot(snapStateFrom(snap), emptyPrices())
    // Deposito label should carry "@4.25%/thn"
    const depo = rows.find(
      (r) => r[0] === 'asetLikuid.deposito' && typeof r[1] === 'string',
    )
    expect(depo).toBeDefined()
    expect(String(depo?.[1])).toMatch(/@\d+(\.\d+)?%\/thn/)
    // At least one RD row carries "[<jenis>]"
    const rdWithJenis = rows.find(
      (r) =>
        r[0] === 'asetLikuid.reksaDana' &&
        typeof r[1] === 'string' &&
        /\[(pasarUang|pendapatanTetap|campuran|saham|indeks|lain)\]/.test(
          String(r[1]),
        ),
    )
    expect(rdWithJenis).toBeDefined()
  })
})

describe('buildPerEmiten', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('header has the 11 PRD §7 columns; row count matches saham count', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const rows = buildPerEmiten(snapStateFrom(snap).saham, emptyPrices())
    expect(rows[0]).toEqual(PER_EMITEN_HEADER)
    expect(PER_EMITEN_HEADER).toHaveLength(11)
    expect(rows.length - 1).toBe(snap.saham.length)
  })

  it('uses cost basis as price fallback when live IDX is missing; valuasi > 0', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const rows = buildPerEmiten(snapStateFrom(snap).saham, emptyPrices())
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]!
      const price = row[3] as number
      const valuasi = row[4] as number
      expect(price).toBeGreaterThan(0)
      expect(valuasi).toBeGreaterThan(0)
    }
  })

  it('writes potential_dividend for both div input modes (literal + yield)', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const rows = buildPerEmiten(snapStateFrom(snap).saham, emptyPrices())
    // Fixture mixes lastDividendPerLembar + avgDividendYieldPercent. Either
    // path should emit a positive potential_dividend (column index 10).
    const positives = rows.slice(1).filter((r) => (r[10] as number) > 0)
    expect(positives.length).toBeGreaterThan(0)
  })
})

describe('buildCicilanAktif', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('emits header + total_beban_sisa for anuitas KPR (sisa pokok + projected bunga)', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const rows = buildCicilanAktif(snapStateFrom(snap).cicilanAktif)
    expect(rows[0]).toEqual(CICILAN_HEADER)
    const kprRow = rows.find((r) => r[1] === 'KPR')!
    expect(kprRow).toBeDefined()
    const sisaPokok = kprRow[3] as number
    const totalBeban = kprRow[8] as number
    expect(totalBeban).toBeGreaterThan(sisaPokok) // projected bunga adds to principal
  })
})

describe('buildGoals', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('renders header only when no goals exist', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const rows = buildGoals([], snapStateFrom(snap), {
      fiMultiplier: FI_MULTIPLIER,
      annualReturnReal: 0.05,
      prices: emptyPrices(),
    })
    expect(rows).toEqual([GOALS_HEADER])
  })

  it('emits a row with status + projected_completion when a goal is seeded', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const goalsStore = useGoalsStore()
    goalsStore.addGoal({
      kind: 'DP_RUMAH',
      label: 'DP Rumah Cibubur',
      targetIdr: 100_000_000,
      targetDate: '2030-12-01',
      buckets: ['kas', 'deposito', 'reksaDana'],
    })
    const rows = buildGoals(goalsStore.goals, snapStateFrom(snap), {
      fiMultiplier: FI_MULTIPLIER,
      annualReturnReal: 0.05,
      prices: emptyPrices(),
    })
    expect(rows.length).toBe(2)
    const goalRow = rows[1]!
    expect(goalRow[1]).toBe('DP_RUMAH')
    expect(goalRow[2]).toBe('DP Rumah Cibubur')
    expect(['on', 'at-risk', 'off']).toContain(String(goalRow[9]))
  })
})

describe('buildMeta', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('emits 3 rows: schema_version, exported_at, data_json (snapshot + goals round-trippable)', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const goals = useGoalsStore()
    const ctx = makeCtx(snapStateFrom(snap), goals.goals)
    const rows = buildMeta(ctx)

    expect(rows).toHaveLength(3)
    expect(rows[0]).toEqual(['cermat_schema_version', SCHEMA_VERSION])
    expect(rows[1]?.[0]).toBe('exported_at')
    expect(rows[2]?.[0]).toBe('data_json')

    // data_json must round-trip cleanly via JSON.parse with the right top-level shape.
    const parsed = JSON.parse(String(rows[2]?.[1])) as {
      snapshot: SnapshotState
      goals: { goals: unknown[]; assumedAnnualReturnReal: number; fiMultiplier: number }
    }
    expect(parsed.snapshot.penghasilan.amount).toBe(snap.penghasilan.amount)
    expect(parsed.snapshot.saham.length).toBe(snap.saham.length)
    expect(parsed.goals.fiMultiplier).toBe(FI_MULTIPLIER)
    expect(parsed.goals.assumedAnnualReturnReal).toBe(0.05)
  })
})
