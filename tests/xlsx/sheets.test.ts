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
    pengeluaranLain: [...snap.pengeluaranLain],
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

  it('opens with the 8-column parser-friendly header then a row per section item', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const rows = buildSnapshot(snapStateFrom(snap), emptyPrices())

    expect(rows[0]).toEqual(SNAPSHOT_HEADER)
    expect(SNAPSHOT_HEADER).toEqual([
      'section',
      'id',
      'label',
      'value_source',
      'source_currency',
      'value_idr',
      'suku_bunga_percent',
      'rd_jenis',
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

  it('every row carries a non-empty id (singletons get stable keys, arrays get uuids)', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const rows = buildSnapshot(snapStateFrom(snap), emptyPrices())
    for (const r of rows.slice(1)) {
      const id = String(r[1] ?? '')
      expect(id.length).toBeGreaterThan(0)
    }
    // Singleton ids known up front
    expect(rows.find((r) => r[0] === 'penghasilan')?.[1]).toBe('gaji')
    expect(rows.find((r) => r[0] === 'pengeluaran' && r[2] === 'Pokok')?.[1]).toBe('pokok')
    expect(rows.find((r) => r[0] === 'emas' && r[2] === 'Fisik Antam')?.[1]).toBe('fisikAntam')
  })

  it('IDR rows: value_idr equals value_source (identity)', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const rows = buildSnapshot(snapStateFrom(snap), emptyPrices())
    const idrRows = rows
      .slice(1)
      .filter((r) => r[4] === 'IDR' && typeof r[3] === 'number' && (r[3] as number) > 0)
    expect(idrRows.length).toBeGreaterThan(0)
    for (const r of idrRows) {
      expect(r[5]).toBe(r[3]) // value_idr === value_source
    }
  })

  it('emas rows: source_currency="gram", value_idr null when prices missing', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const rows = buildSnapshot(snapStateFrom(snap), emptyPrices())
    const emasRows = rows.filter((r) => r[0] === 'emas')
    expect(emasRows.length).toBe(5)
    for (const r of emasRows) {
      expect(r[4]).toBe('gram')
      const gram = r[3] as number
      if (gram > 0) expect(r[5]).toBeNull()
      else expect(r[5]).toBe(0)
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
    const fisikRow = rows.find((r) => r[0] === 'emas' && r[2] === 'Fisik Antam')!
    const gram = fisikRow[3] as number
    const expectedIdr = gram * 2_500_000 * 0.897 // fisikAntamSpread
    expect(fisikRow[5]).toBeCloseTo(expectedIdr, 0)
  })

  it('foreign-currency row: value_idr stays null when FX missing; populates when loaded', () => {
    const snap = useSnapshotStore()
    snap.setPenghasilanAmount(1000)
    snap.setPenghasilanCurrency('USD')
    const rowsEmpty = buildSnapshot(snapStateFrom(snap), emptyPrices())
    const gajiEmpty = rowsEmpty.find((r) => r[0] === 'penghasilan')!
    expect(gajiEmpty[4]).toBe('USD')
    expect(gajiEmpty[5]).toBeNull()
    const rowsWithFx = buildSnapshot(snapStateFrom(snap), {
      ...emptyPrices(),
      fxRates: { USD: 16_000, SGD: null, EUR: null, JPY: null, KRW: null },
    })
    const gajiFx = rowsWithFx.find((r) => r[0] === 'penghasilan')!
    expect(gajiFx[5]).toBe(16_000_000)
  })

  it('crypto rows: label = coinId only, source_currency = mode marker (unit/IDR/USD/KRW)', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const rows = buildSnapshot(snapStateFrom(snap), emptyPrices())
    const cryptoRows = rows.filter((r) => r[0] === 'crypto')
    expect(cryptoRows.length).toBeGreaterThan(0)
    // Fixture seeds BTC (unit mode) + ETH (idr mode); both labels must be the
    // canonical coinId only — no mixing with c.label or coin-name suffix.
    const labels = cryptoRows.map((r) => String(r[2]))
    expect(labels).toContain('bitcoin')
    expect(labels).toContain('ethereum')
    for (const r of cryptoRows) {
      // Label must NOT contain " — " separator (sign of old "coinId — nickname"
      // format) or a "unit" suffix (sign of old "coinId unit" in source_currency).
      expect(String(r[2])).not.toContain(' — ')
      expect(String(r[2])).not.toContain(' unit')
      // source_currency must be a clean mode marker
      const sc = String(r[4])
      expect(['unit', 'IDR', 'USD', 'KRW']).toContain(sc)
    }
  })

  it('sukuBungaPercent + rdJenis ride in their own columns (cols 6 and 7)', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const rows = buildSnapshot(snapStateFrom(snap), emptyPrices())
    // Deposito row should expose sukuBungaPercent in col index 6
    const depo = rows.find((r) => r[0] === 'asetLikuid.deposito')
    expect(depo).toBeDefined()
    expect(typeof depo?.[6]).toBe('number')
    expect(depo?.[6]).toBeGreaterThan(0)
    expect(depo?.[7]).toBeNull() // no rd_jenis on deposito

    // At least one RD row should carry rd_jenis in col index 7
    const rdRows = rows.filter((r) => r[0] === 'asetLikuid.reksaDana')
    expect(rdRows.length).toBeGreaterThan(0)
    const validJenis = new Set([
      'pasarUang',
      'pendapatanTetap',
      'campuran',
      'saham',
      'indeks',
      'lain',
    ])
    for (const r of rdRows) {
      expect(typeof r[7]).toBe('string')
      expect(validJenis.has(String(r[7]))).toBe(true)
    }
  })
})

describe('buildPerEmiten', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('header has 11 columns starting with id; row count matches saham count', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const rows = buildPerEmiten(snapStateFrom(snap).saham, emptyPrices())
    expect(rows[0]).toEqual(PER_EMITEN_HEADER)
    expect(PER_EMITEN_HEADER).toHaveLength(11)
    expect(PER_EMITEN_HEADER[0]).toBe('id')
    // target_bobot dropped per Day 4.7 product decision (field hidden in UI)
    expect(PER_EMITEN_HEADER).not.toContain('target_bobot')
    expect(rows.length - 1).toBe(snap.saham.length)
  })

  it('every saham row carries its store id in col 0', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const rows = buildPerEmiten(snapStateFrom(snap).saham, emptyPrices())
    for (let i = 1; i < rows.length; i++) {
      expect(String(rows[i]?.[0] ?? '').length).toBeGreaterThan(0)
    }
  })

  it('uses cost basis as price fallback when live IDX is missing; valuasi > 0', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const rows = buildPerEmiten(snapStateFrom(snap).saham, emptyPrices())
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]!
      const price = row[4] as number // price_live now col 4 (id, ticker, lots_current, lots_target, price_live)
      const valuasi = row[5] as number
      expect(price).toBeGreaterThan(0)
      expect(valuasi).toBeGreaterThan(0)
    }
  })

  it('writes potential_dividend for both div input modes (literal + yield)', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const rows = buildPerEmiten(snapStateFrom(snap).saham, emptyPrices())
    // Column shifted to index 10 (id at front pushes by 1; target_bobot dropped
    // pulls back by 1 — net same). potential_dividend stays last col.
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
