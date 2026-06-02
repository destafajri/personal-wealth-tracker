import { describe, expect, it } from 'vitest'
import {
  deployablePool,
  runDeployPreview,
  type DeployAction,
} from '~/lib/finance/wizards/deploy-preview'
import { calcModalSiap, calcNetWorth, type ModalSiapIncludes } from '~/lib/finance/metrics'
import { emptySnapshot, type SnapshotState } from '~/lib/types/snapshot'

const OPTS = {
  fiMultiplier: 300,
  assumedAnnualReturnReal: 0.05,
}

const NO_INCLUDES: ModalSiapIncludes = { saham: false, emas: false, sbn: false }
const ALL_INCLUDES: ModalSiapIncludes = { saham: true, emas: true, sbn: true }

function baseSnap(): SnapshotState {
  const s = emptySnapshot()
  s.penghasilan = { amount: 20_000_000, currency: 'IDR' }
  s.pengeluaran = { pokok: 8_000_000, lifestyle: 0 }
  return s
}

describe('deployablePool', () => {
  it('= modalSiap when destination not in baseline', () => {
    const s = baseSnap()
    s.asetLikuid.kas.push({ id: 'k1', label: 'BCA', amount: 50_000_000 })
    // Destination = SBN, not toggled IN → SBN not in Modal Siap → overlap 0
    const pool = deployablePool(s, undefined, NO_INCLUDES, {
      kind: 'liquidCategory',
      category: 'sbn',
    })
    expect(pool).toBe(50_000_000)
  })

  it('subtracts destination overlap (kas → tambah kas)', () => {
    const s = baseSnap()
    s.asetLikuid.kas.push({ id: 'k1', label: 'BCA', amount: 70_000_000 })
    s.asetLikuid.reksaDana.push({ id: 'r1', label: 'Sucor', amount: 30_000_000 })
    // Modal Siap = 100jt baseline. Dest = kas. Overlap = kas total (70jt). Pool = 30jt.
    const pool = deployablePool(s, undefined, NO_INCLUDES, {
      kind: 'liquidCategory',
      category: 'reksaDana',
    })
    // Pool excluding RD (overlap = 30jt) = 100jt − 30jt = 70jt
    expect(pool).toBe(70_000_000)
  })

  it('saham destination excludes THIS emiten only when saham toggled IN', () => {
    const s = baseSnap()
    s.saham.push({ id: 's1', ticker: 'BBRI', lot: 80, hargaRataRata: 5_000 })
    s.saham.push({ id: 's2', ticker: 'BBCA', lot: 20, hargaRataRata: 10_000 })
    // Saham toggled IN, dest = BBRI (80×100×5000 = 40jt). Pool = full Modal Siap − BBRI.
    const pool = deployablePool(
      s,
      undefined,
      { saham: true, emas: false, sbn: false },
      { kind: 'saham', stockId: 's1' },
    )
    // Modal Siap = 0 (no liquid) + 60jt (saham 80×5000=40 + 20×10000=20 wait 20×100×10000=20jt) = 60jt
    // BBRI value = 80×100×5000 = 40_000_000
    // BBCA value = 20×100×10000 = 20_000_000
    // Modal Siap (saham IN) = 60jt; Pool for BBRI = 60 − 40 = 20jt
    expect(pool).toBe(20_000_000)
  })

  it('saham destination = 0 when saham NOT toggled IN', () => {
    const s = baseSnap()
    s.saham.push({ id: 's1', ticker: 'BBRI', lot: 80, hargaRataRata: 5_000 })
    // saham not toggled → Modal Siap doesn't include saham → pool = baseline (0 here)
    const pool = deployablePool(s, undefined, NO_INCLUDES, {
      kind: 'saham',
      stockId: 's1',
    })
    expect(pool).toBe(0)
  })

  it('emas destination excludes all emas when toggled IN', () => {
    const s = baseSnap()
    s.emas.digitalGram = 10 // assume rate makes this Rp 10jt if rate = 1M/gram
    // Without prices, ratePerGram returns 0 → emas value = 0. Set prices.
    const prices = {
      idxByTicker: {},
      cryptoByCoinId: {},
      fxRates: {
        USD: null,
        SGD: null,
        EUR: null,
        JPY: null,
        KRW: null,
      },
      goldDigitalIdrPerGram: 1_000_000,
      goldAntam1gIdr: 1_200_000,
      fetchedAt: '',
      stale: false,
    } as const
    s.asetLikuid.kas.push({ id: 'k1', label: 'BCA', amount: 5_000_000 })
    // Modal Siap (emas IN) = 5jt + 10jt = 15jt. Pool excluding emas = 15 − 10 = 5jt.
    const pool = deployablePool(
      s,
      prices as never,
      { saham: false, emas: true, sbn: false },
      { kind: 'emas' },
    )
    expect(pool).toBe(5_000_000)
  })
})

describe('runDeployPreview — Net Worth invariance', () => {
  function buildAddLiquid(amount: number): DeployAction {
    return {
      kind: 'addLiquidRow',
      category: 'reksaDana',
      label: 'Dari Modal Siap',
      amountIdr: amount,
    }
  }

  it('Net Worth before === after when full action covered (tambah RD from kas)', () => {
    const s = baseSnap()
    s.asetLikuid.kas.push({ id: 'k1', label: 'BCA', amount: 100_000_000 })
    const before = calcNetWorth(s)
    const r = runDeployPreview(
      { action: buildAddLiquid(50_000_000), includes: NO_INCLUDES },
      s,
      [],
      OPTS,
    )
    const after = calcNetWorth(r.scenarioSnapshot)
    expect(Math.abs(after - before)).toBeLessThan(1) // within rounding
  })

  it('Net Worth invariant when source = saham (BBCA drains for BBRI buy)', () => {
    const s = baseSnap()
    s.saham.push({ id: 's1', ticker: 'BBRI', lot: 0, hargaRataRata: 5_000, lotsTarget: 100 })
    s.saham.push({ id: 's2', ticker: 'BBCA', lot: 20, hargaRataRata: 10_000 })
    // Buy 20jt of BBRI; source comes from BBCA (only other saham value).
    const action: DeployAction = {
      kind: 'addStockLots',
      stockId: 's1',
      stockTicker: 'BBRI',
      lotsToAdd: 40, // 40 × 100 × 5000 = 20jt
      costIdr: 20_000_000,
    }
    const before = calcNetWorth(s)
    const r = runDeployPreview({ action, includes: ALL_INCLUDES }, s, [], OPTS)
    const after = calcNetWorth(r.scenarioSnapshot)
    expect(Math.abs(after - before)).toBeLessThan(1)
  })

  it('Net Worth still invariant even when partial cover (shortfall path)', () => {
    const s = baseSnap()
    s.asetLikuid.kas.push({ id: 'k1', label: 'BCA', amount: 10_000_000 })
    // Request 50jt but only 10jt liquid available; scenario applies 10jt at dest + warning.
    const before = calcNetWorth(s)
    const r = runDeployPreview(
      { action: buildAddLiquid(50_000_000), includes: NO_INCLUDES },
      s,
      [],
      OPTS,
    )
    const after = calcNetWorth(r.scenarioSnapshot)
    expect(Math.abs(after - before)).toBeLessThan(1)
    expect(r.warnings.length).toBeGreaterThan(0)
  })

  it('Net Worth invariant when source spans multiple classes (liquid + emas)', () => {
    const s = baseSnap()
    s.asetLikuid.kas.push({ id: 'k1', label: 'BCA', amount: 5_000_000 })
    s.emas.digitalGram = 10
    const prices = {
      idxByTicker: {},
      cryptoByCoinId: {},
      fxRates: {
        USD: null,
        SGD: null,
        EUR: null,
        JPY: null,
        KRW: null,
      },
      goldDigitalIdrPerGram: 1_000_000,
      goldAntam1gIdr: 1_200_000,
      fetchedAt: '',
      stale: false,
    } as const
    // Need 12jt for RD → 5jt from kas + 7jt from emas (7 grams) → invariant.
    const before = calcNetWorth(s, prices as never)
    const r = runDeployPreview(
      { action: buildAddLiquid(12_000_000), includes: { saham: false, emas: true, sbn: false } },
      s,
      [],
      { ...OPTS, prices: prices as never },
    )
    const after = calcNetWorth(r.scenarioSnapshot, prices as never)
    expect(Math.abs(after - before)).toBeLessThan(1)
  })
})

describe('runDeployPreview — drain priority', () => {
  it('drains kas first (waterfall order: kas → dep → RD)', () => {
    const s = baseSnap()
    s.asetLikuid.kas.push({ id: 'k1', label: 'BCA', amount: 30_000_000 })
    s.asetLikuid.deposito.push({ id: 'd1', label: 'Mandiri', amount: 50_000_000 })
    const action: DeployAction = {
      kind: 'addLiquidRow',
      category: 'reksaDana',
      label: 'Test',
      amountIdr: 20_000_000,
    }
    const r = runDeployPreview({ action, includes: NO_INCLUDES }, s, [], OPTS)
    // 20jt < 30jt kas → kas drains fully to 10jt, deposito untouched.
    expect(r.scenarioSnapshot.asetLikuid.kas[0]!.amount).toBe(10_000_000)
    expect(r.scenarioSnapshot.asetLikuid.deposito[0]!.amount).toBe(50_000_000)
  })

  it('drains liquid before saham (saham toggled IN)', () => {
    const s = baseSnap()
    s.asetLikuid.kas.push({ id: 'k1', label: 'BCA', amount: 10_000_000 })
    s.saham.push({ id: 's1', ticker: 'BBRI', lot: 0, hargaRataRata: 5_000, lotsTarget: 100 })
    s.saham.push({ id: 's2', ticker: 'BBCA', lot: 20, hargaRataRata: 10_000 })
    const action: DeployAction = {
      kind: 'addStockLots',
      stockId: 's1',
      stockTicker: 'BBRI',
      lotsToAdd: 30, // 30 × 100 × 5000 = 15jt → 10jt from kas + 5jt from BBCA (1 lot @ 10jt? but 5jt = 0.5 lot)
      costIdr: 15_000_000,
    }
    const r = runDeployPreview({ action, includes: ALL_INCLUDES }, s, [], OPTS)
    // Kas drained fully (10jt) first; remaining 5jt from BBCA.
    expect(r.scenarioSnapshot.asetLikuid.kas[0]!.amount).toBeLessThan(1)
    // BBCA value before = 20×100×10_000 = 20jt; drained 5jt → 15jt left; lots = 15jt / (100×10000) = 15 lots.
    const bbca = r.scenarioSnapshot.saham.find((s) => s.id === 's2')!
    expect(bbca.lot).toBeCloseTo(15, 1)
  })

  it('excludes destination emiten from saham drain (BBRI not sold to buy BBRI)', () => {
    const s = baseSnap()
    s.saham.push({ id: 's1', ticker: 'BBRI', lot: 10, hargaRataRata: 5_000, lotsTarget: 100 })
    s.saham.push({ id: 's2', ticker: 'BBCA', lot: 20, hargaRataRata: 10_000 })
    const action: DeployAction = {
      kind: 'addStockLots',
      stockId: 's1',
      stockTicker: 'BBRI',
      lotsToAdd: 20, // 20 × 100 × 5000 = 10jt → from BBCA (20jt value, 1 lot @ 10jt)
      costIdr: 10_000_000,
    }
    const r = runDeployPreview({ action, includes: ALL_INCLUDES }, s, [], OPTS)
    // BBRI lots increased (was 10 + 20 = 30); BBCA drained.
    const bbri = r.scenarioSnapshot.saham.find((s) => s.id === 's1')!
    const bbca = r.scenarioSnapshot.saham.find((s) => s.id === 's2')!
    expect(bbri.lot).toBe(30) // unchanged-by-drain + added
    expect(bbca.lot).toBeLessThan(20) // drained
  })
})

describe('runDeployPreview — delta Modal Siap honors includes', () => {
  // Codex round-17: computeStandardDelta was using baseline calcModalSiap regardless
  // of input.includes, so wizard Sebelum/Sesudah drifted from the dashboard headline
  // whenever user toggled saham/emas/sbn ON. These two cases pin the contract.

  it('Sebelum Modal Siap matches headline when saham toggled IN', () => {
    const s = baseSnap()
    s.asetLikuid.kas.push({ id: 'k1', label: 'BCA', amount: 10_000_000 })
    s.saham.push({ id: 's1', ticker: 'BBRI', lot: 0, hargaRataRata: 5_000, lotsTarget: 100 })
    s.saham.push({ id: 's2', ticker: 'BBCA', lot: 20, hargaRataRata: 10_000 }) // 20jt
    const includes: ModalSiapIncludes = { saham: true, emas: false, sbn: false }
    // Dashboard headline = baseline 10jt + saham 20jt = 30jt
    const headline = calcModalSiap(s, undefined, includes)
    const action: DeployAction = {
      kind: 'addStockLots',
      stockId: 's1',
      stockTicker: 'BBRI',
      lotsToAdd: 30,
      costIdr: 15_000_000,
    }
    const r = runDeployPreview({ action, includes }, s, [], OPTS)
    const modalRow = r.delta.find((row) => row.metricKey === 'modalSiap')!
    expect(modalRow.before.value).toBe(headline)
  })

  it('Sesudah Modal Siap matches scenario headline (zero-sum saham→deposito = 0 delta)', () => {
    const s = baseSnap()
    s.saham.push({ id: 's1', ticker: 'BBCA', lot: 20, hargaRataRata: 10_000 }) // 20jt
    const includes: ModalSiapIncludes = { saham: true, emas: false, sbn: false }
    // Drain saham to fund deposito. Saham IN → both sides of the move are inside Modal
    // Siap → delta MUST be 0 (zero-sum). Pre-fix this read as +5jt because baseline-only
    // delta saw deposito grow but missed the offsetting saham reduction.
    const action: DeployAction = {
      kind: 'addLiquidRow',
      category: 'deposito',
      label: 'Mandiri',
      amountIdr: 5_000_000,
    }
    const r = runDeployPreview({ action, includes }, s, [], OPTS)
    const modalRow = r.delta.find((row) => row.metricKey === 'modalSiap')!
    expect(modalRow.before.value).not.toBeNull()
    expect(modalRow.after.value).not.toBeNull()
    expect(Math.abs((modalRow.after.value as number) - (modalRow.before.value as number))).toBeLessThan(1)
  })
})
