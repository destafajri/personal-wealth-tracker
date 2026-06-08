import { computed, ref, type Ref } from 'vue'

export interface WhatIfState {
  monthlyInvestment: number
  annualReturn: number
  timeHorizon: number
}

export interface ProjectionPoint {
  year: number
  conservative: number
  expected: number
  optimistic: number
}

// FV = PV × (1+r)^t + PMT × [((1+r)^t - 1) / r]
// When r === 0: FV = PV + PMT × t (linear, no compounding)
function futureValue(pv: number, pmt: number, r: number, t: number): number {
  if (r === 0) return pv + pmt * t
  const compound = Math.pow(1 + r, t)
  return pv * compound + pmt * ((compound - 1) / r)
}

export function calcProjection(
  currentNetWorth: number,
  state: WhatIfState,
): ProjectionPoint[] {
  const years = state.timeHorizon
  const annualPmt = state.monthlyInvestment * 12
  const r = state.annualReturn / 100

  const points: ProjectionPoint[] = []

  for (let t = 0; t <= years; t++) {
    points.push({
      year: t,
      conservative: futureValue(currentNetWorth, annualPmt, r * 0.5, t),
      expected: futureValue(currentNetWorth, annualPmt, r, t),
      optimistic: futureValue(currentNetWorth, annualPmt, r * 1.5, t),
    })
  }

  return points
}

export function useWhatIf(
  netWorth: Ref<number>,
  monthlyIncome: Ref<number>,
) {
  const monthlyInvestment = ref(
    Math.min(Math.round(monthlyIncome.value * 0.1), 10_000_000),
  )
  const annualReturn = ref(8)
  const timeHorizon = ref(10)

  const state = computed<WhatIfState>(() => ({
    monthlyInvestment: monthlyInvestment.value,
    annualReturn: annualReturn.value,
    timeHorizon: timeHorizon.value,
  }))

  const projection = computed(() =>
    calcProjection(netWorth.value, state.value),
  )

  const finalYear = computed(() => {
    const pts = projection.value
    return pts[pts.length - 1]
  })

  return {
    monthlyInvestment,
    annualReturn,
    timeHorizon,
    projection,
    finalYear,
  }
}
