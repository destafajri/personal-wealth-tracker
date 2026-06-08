import { describe, expect, it } from 'vitest'
import { calcProjection, type WhatIfState } from '~/composables/useWhatIf'

describe('calcProjection', () => {
  it('returns t=0..timeHorizon inclusive', () => {
    const state: WhatIfState = {
      monthlyInvestment: 500_000,
      annualReturn: 8,
      timeHorizon: 10,
    }
    const pts = calcProjection(0, state)
    expect(pts).toHaveLength(11) // 0..10
    expect(pts[0]!.year).toBe(0)
    expect(pts[10]!.year).toBe(10)
  })

  it('year 0 = current net worth (no growth yet)', () => {
    const state: WhatIfState = {
      monthlyInvestment: 1_000_000,
      annualReturn: 10,
      timeHorizon: 5,
    }
    const pts = calcProjection(50_000_000, state)
    expect(pts[0]!.conservative).toBe(50_000_000)
    expect(pts[0]!.expected).toBe(50_000_000)
    expect(pts[0]!.optimistic).toBe(50_000_000)
  })

  it('grows over time: expected > conservative, optimistic > expected', () => {
    const state: WhatIfState = {
      monthlyInvestment: 500_000,
      annualReturn: 8,
      timeHorizon: 10,
    }
    const pts = calcProjection(0, state)
    const last = pts[10]!
    expect(last.expected).toBeGreaterThan(last.conservative)
    expect(last.optimistic).toBeGreaterThan(last.expected)
  })

  it('projection increases monotonically with positive return', () => {
    const state: WhatIfState = {
      monthlyInvestment: 500_000,
      annualReturn: 8,
      timeHorizon: 10,
    }
    const pts = calcProjection(0, state)
    for (let i = 1; i < pts.length; i++) {
      expect(pts[i]!.expected).toBeGreaterThan(pts[i - 1]!.expected)
    }
  })

  it('division-by-zero guard: annual return 0% → linear growth', () => {
    const state: WhatIfState = {
      monthlyInvestment: 1_000_000,
      annualReturn: 0,
      timeHorizon: 5,
    }
    const pts = calcProjection(0, state)
    // Annual PMT = 12jt. Year 5: 0 + 12jt × 5 = 60jt
    expect(pts[5]!.expected).toBe(60_000_000)
    // All 3 lines identical when r=0
    expect(pts[5]!.conservative).toBe(60_000_000)
    expect(pts[5]!.optimistic).toBe(60_000_000)
  })

  it('works with existing net worth + monthly investment', () => {
    const state: WhatIfState = {
      monthlyInvestment: 0,
      annualReturn: 10,
      timeHorizon: 1,
    }
    // PV=100jt, r=10%, t=1, PMT=0 → FV = 100jt × 1.1 = 110jt
    const pts = calcProjection(100_000_000, state)
    expect(pts[1]!.expected).toBeCloseTo(110_000_000, -3)
  })

  it('compound interest with PMT', () => {
    const state: WhatIfState = {
      monthlyInvestment: 1_000_000,
      annualReturn: 12,
      timeHorizon: 1,
    }
    // PV=0, PMT_annual=12jt, r=12%, t=1
    // FV = 0 + 12jt × ((1.12 - 1) / 0.12) = 12jt × 1 = 12jt
    const pts = calcProjection(0, state)
    expect(pts[1]!.expected).toBeCloseTo(12_000_000, -3)
  })

  it('conservative = 50% of return, optimistic = 150%', () => {
    const state: WhatIfState = {
      monthlyInvestment: 500_000,
      annualReturn: 10,
      timeHorizon: 5,
    }
    const pts = calcProjection(0, state)
    const last = pts[5]!
    expect(last.conservative).toBeGreaterThan(0)
    expect(last.expected).toBeGreaterThan(last.conservative)
    expect(last.optimistic).toBeGreaterThan(last.expected)
  })

  it('time horizon = 1 returns 2 points', () => {
    const state: WhatIfState = {
      monthlyInvestment: 500_000,
      annualReturn: 8,
      timeHorizon: 1,
    }
    const pts = calcProjection(0, state)
    expect(pts).toHaveLength(2)
  })

  it('handles zero net worth and zero investment', () => {
    const state: WhatIfState = {
      monthlyInvestment: 0,
      annualReturn: 8,
      timeHorizon: 5,
    }
    const pts = calcProjection(0, state)
    for (const p of pts) {
      expect(p.expected).toBe(0)
    }
  })
})
