import { describe, expect, it } from 'vitest'
import {
  bucketValueIdr,
  calcGoalHealth,
  defaultAllocation,
  fiNumber,
  goalProgress,
  goalStatus,
  projectCompletion,
  resolveTargetIdr,
  surplus,
} from '~/lib/finance/goals'
import { emptySnapshot, type PricesView, type SnapshotState } from '~/lib/types/snapshot'
import type { Goal } from '~/lib/types/goals'

function baseSnap(): SnapshotState {
  return emptySnapshot()
}

function emptyPrices(): PricesView {
  return {
    goldDigitalIdrPerGram: null,
    goldAntam1gIdr: null,
    fxRates: { USD: null, SGD: null, EUR: null, JPY: null, KRW: null },
    idxByTicker: {},
    cryptoByCoinId: {},
  }
}

describe('fiNumber', () => {
  it('returns monthly expense × multiplier', () => {
    expect(fiNumber(18_000_000)).toBe(5_400_000_000)
    expect(fiNumber(10_000_000, 240)).toBe(2_400_000_000)
  })
  it('clamps negative to 0', () => {
    expect(fiNumber(-1)).toBe(0)
    expect(fiNumber(0)).toBe(0)
  })
})

describe('surplus / defaultAllocation', () => {
  it('surplus = penghasilan − pengeluaran (incl. cicilan)', () => {
    const s = baseSnap()
    s.penghasilan = { amount: 20_000_000, currency: 'IDR' }
    s.pengeluaran = { pokok: 6_000_000, lifestyle: 2_000_000 }
    s.cicilanAktif.push({
      id: '1',
      tipe: 'KPR',
      label: 'KPR',
      sisaPokok: 0,
      cicilanPerBulan: 4_000_000,
      jenisBunga: 'Anuitas',
    })
    expect(surplus(s)).toBe(8_000_000) // 20jt − (6+2+4)jt
  })

  it('defaultAllocation = surplus / N', () => {
    const s = baseSnap()
    s.penghasilan = { amount: 15_000_000, currency: 'IDR' }
    s.pengeluaran = { pokok: 5_000_000, lifestyle: 0 }
    expect(defaultAllocation(s, 2)).toBe(5_000_000) // 10jt / 2
  })

  it('returns 0 on negative surplus or zero goal count', () => {
    const s = baseSnap()
    s.penghasilan = { amount: 5_000_000, currency: 'IDR' }
    s.pengeluaran = { pokok: 8_000_000, lifestyle: 0 }
    expect(defaultAllocation(s, 3)).toBe(0)

    const s2 = baseSnap()
    s2.penghasilan = { amount: 20_000_000, currency: 'IDR' }
    expect(defaultAllocation(s2, 0)).toBe(0)
  })
})

describe('bucketValueIdr', () => {
  it('sums tagged liquid categories (FX-aware via existing helpers)', () => {
    const s = baseSnap()
    s.asetLikuid.kas.push({ id: '1', label: 'BCA', amount: 10_000_000 })
    s.asetLikuid.deposito.push({ id: '2', label: 'Depo', amount: 30_000_000 })
    s.asetLikuid.reksaDana.push({ id: '3', label: 'RD', amount: 20_000_000 })
    expect(bucketValueIdr(['kas', 'deposito'], s)).toBe(40_000_000)
    expect(bucketValueIdr(['reksaDana'], s)).toBe(20_000_000)
    expect(bucketValueIdr([], s)).toBe(0)
  })

  it('includes saham at effective price × lot × 100', () => {
    const s = baseSnap()
    s.saham.push({ id: '1', ticker: 'BBCA', lot: 5, hargaRataRata: 9_000 })
    const prices: PricesView = { ...emptyPrices(), idxByTicker: { BBCA: 10_000 } }
    expect(bucketValueIdr(['saham'], s, prices)).toBe(5 * 100 * 10_000)
  })

  it('includes emas via breakdownGoldIdr', () => {
    const s = baseSnap()
    s.emas.fisikAntamGram = 50
    const prices: PricesView = {
      ...emptyPrices(),
      goldAntam1gIdr: 2_000_000,
    }
    // 50g × 2jt × 0.897 = 89.7jt
    expect(bucketValueIdr(['emas'], s, prices)).toBe(89_700_000)
  })
})

describe('resolveTargetIdr', () => {
  it('FI = totalPengeluaran × multiplier (overrides goal.targetIdr)', () => {
    const s = baseSnap()
    s.pengeluaran = { pokok: 15_000_000, lifestyle: 3_000_000 }
    const fi: Goal = {
      id: 'g',
      kind: 'FI',
      label: 'FI',
      targetIdr: 999_999, // ignored for FI
      targetDate: '2040-01',
      buckets: [],
    }
    expect(resolveTargetIdr(fi, s, 300)).toBe(18_000_000 * 300)
  })

  it('non-FI returns goal.targetIdr (clamped ≥ 0)', () => {
    const s = baseSnap()
    const dp: Goal = {
      id: 'g',
      kind: 'DP_RUMAH',
      label: 'DP',
      targetIdr: 500_000_000,
      targetDate: '2028-03',
      buckets: ['kas', 'deposito'],
    }
    expect(resolveTargetIdr(dp, s, 300)).toBe(500_000_000)
    expect(resolveTargetIdr({ ...dp, targetIdr: -100 }, s, 300)).toBe(0)
  })
})

describe('projectCompletion', () => {
  const today = new Date(2026, 0, 1) // Jan 1 2026

  it('returns 0 months when already at target', () => {
    const r = projectCompletion({ current: 500, monthlyInflow: 100, target: 500, today })
    expect(r.months).toBe(0)
    expect(r.date).toBe('2026-01-01')
  })

  it('linear when real return ≈ 0', () => {
    const r = projectCompletion({
      current: 0,
      monthlyInflow: 1_000_000,
      target: 12_000_000,
      annualReturnReal: 0,
      today,
    })
    expect(r.months).toBe(12)
    expect(r.date).toBe('2027-01-01')
  })

  it('compound growth shortens months vs linear', () => {
    const r0 = projectCompletion({
      current: 0,
      monthlyInflow: 5_000_000,
      target: 5_400_000_000,
      annualReturnReal: 0,
      today,
    })
    const r5 = projectCompletion({
      current: 0,
      monthlyInflow: 5_000_000,
      target: 5_400_000_000,
      annualReturnReal: 0.05,
      today,
    })
    expect(r5.months).toBeLessThan(r0.months)
    expect(r5.months).toBeGreaterThan(0)
  })

  it('returns null when current=0 + monthlyInflow≤0 (unreachable)', () => {
    const r = projectCompletion({
      current: 0,
      monthlyInflow: 0,
      target: 1_000_000,
      annualReturnReal: 0.05,
      today,
    })
    expect(r.months).toBe(Infinity)
    expect(r.date).toBeNull()
  })

  it('reachable via growth alone when current > 0 + inflow=0', () => {
    const r = projectCompletion({
      current: 100_000_000,
      monthlyInflow: 0,
      target: 200_000_000,
      annualReturnReal: 0.05,
      today,
    })
    expect(r.months).toBeGreaterThan(0)
    expect(r.months).toBeLessThan(20 * 12) // doubles in ~14 yrs at 5%
    expect(r.date).not.toBeNull()
  })
})

describe('goalStatus', () => {
  it("'on' when projected ≤ target", () => {
    expect(goalStatus('2028-01-01', '2028-03-01')).toBe('on')
    expect(goalStatus('2028-03-01', '2028-03-01')).toBe('on')
  })
  it("'at-risk' when projected runs over by ≤ 24 months", () => {
    expect(goalStatus('2029-01-01', '2028-01-01')).toBe('at-risk') // 12 mo
    expect(goalStatus('2030-01-01', '2028-01-01')).toBe('at-risk') // 24 mo
  })
  it("'off' when projected runs over by > 24 months", () => {
    expect(goalStatus('2031-01-01', '2028-01-01')).toBe('off') // 36 mo
  })
  it("'off' when projected is null or targetDate empty", () => {
    expect(goalStatus(null, '2028-01-01')).toBe('off')
    expect(goalStatus('2028-01-01', '')).toBe('off')
  })
})

describe('goalProgress + calcGoalHealth', () => {
  const today = new Date(2026, 0, 1)

  it('progress percent reflects bucketValue / targetIdr', () => {
    const s = baseSnap()
    s.asetLikuid.kas.push({ id: '1', label: 'BCA', amount: 90_000_000 })
    s.penghasilan = { amount: 20_000_000, currency: 'IDR' }
    s.pengeluaran = { pokok: 5_000_000, lifestyle: 0 }
    const dp: Goal = {
      id: 'g',
      kind: 'DP_RUMAH',
      label: 'DP',
      targetIdr: 500_000_000,
      targetDate: '2030-01',
      buckets: ['kas'],
    }
    const p = goalProgress(dp, s, {
      fiMultiplier: 300,
      annualReturnReal: 0.05,
      activeGoalsCount: 1,
      today,
    })
    expect(p.currentIdr).toBe(90_000_000)
    expect(p.targetIdr).toBe(500_000_000)
    expect(p.percent).toBeCloseTo(18, 0)
    expect(p.monthlyInflow).toBe(15_000_000) // surplus 15jt / 1 goal
  })

  it('calcGoalHealth: null when no goals; percent when mixed', () => {
    const s = baseSnap()
    s.penghasilan = { amount: 30_000_000, currency: 'IDR' }
    s.pengeluaran = { pokok: 10_000_000, lifestyle: 0 }
    expect(calcGoalHealth([], s, { fiMultiplier: 300, annualReturnReal: 0.05 })).toBeNull()

    // Goal 1: easily on-track (small target, surplus covers it fast). Date far in future.
    s.asetLikuid.kas.push({ id: '1', label: 'BCA', amount: 50_000_000 })
    const onTrack: Goal = {
      id: 'a',
      kind: 'DP_RUMAH',
      label: 'On',
      targetIdr: 60_000_000,
      targetDate: '2030-01-01',
      buckets: ['kas'],
    }
    // Goal 2: impossible — empty bucket, no contribution path.
    const off: Goal = {
      id: 'b',
      kind: 'CUSTOM',
      label: 'Off',
      targetIdr: 999_999_999_999,
      targetDate: '2026-06-01',
      buckets: ['saham'],
      monthlyAllocationIdr: 0,
    }
    const pct = calcGoalHealth([onTrack, off], s, {
      fiMultiplier: 300,
      annualReturnReal: 0.05,
    })
    expect(pct).toBe(50) // 1 of 2 on-track
  })
})
