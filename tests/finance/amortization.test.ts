import { describe, expect, it } from 'vitest'
import { anuitas, flat, floating, revolving } from '~/lib/finance/amortization'

describe('anuitas', () => {
  it('matches textbook formula for KPR-ish input', () => {
    // Pokok 500jt, 7%/tahun, 180 bulan → cicilan ≈ Rp 4.494.144/bln (textbook)
    const a = anuitas(500_000_000, 7, 180)
    expect(a.cicilanPerBulan).toBeCloseTo(4_494_144, -2) // within Rp 100
    expect(a.schedule).toHaveLength(180)
    // schedule last row sisa should be ~0 (accumulated float error over 180 iterations)
    expect(Math.abs(a.schedule[179]!.sisa)).toBeLessThan(0.01)
    expect(a.totalBayar).toBeCloseTo(a.cicilanPerBulan * 180, 0)
  })

  it('0% bunga reduces to pokok / tenor with zero total bunga', () => {
    const a = anuitas(120_000_000, 0, 12)
    expect(a.cicilanPerBulan).toBe(10_000_000)
    expect(a.totalBunga).toBeCloseTo(0, 6)
    expect(a.totalBayar).toBe(120_000_000)
  })

  it('tenor 0 or pokok 0 yields empty result', () => {
    expect(anuitas(100_000_000, 5, 0).cicilanPerBulan).toBe(0)
    expect(anuitas(0, 5, 12).schedule).toHaveLength(0)
  })

  it('totalBunga equals sum of schedule bunga', () => {
    const a = anuitas(100_000_000, 10, 24)
    const sumBunga = a.schedule.reduce((s, r) => s + r.bunga, 0)
    expect(a.totalBunga).toBeCloseTo(sumBunga, 2)
  })
})

describe('flat', () => {
  it('cicilan = pokok/tenor + pokok×bunga/12; interest constant each month', () => {
    // Pokok 60jt, 12%/tahun, 12 bulan: pokok/bulan = 5jt, bunga = 600rb, cicilan = 5.6jt
    const a = flat(60_000_000, 12, 12)
    expect(a.cicilanPerBulan).toBeCloseTo(5_600_000, 0)
    expect(a.totalBunga).toBeCloseTo(7_200_000, 0)
    expect(a.schedule.every((r) => Math.abs(r.bunga - 600_000) < 1)).toBe(true)
  })

  it('0% bunga yields cicilan = pokok / tenor', () => {
    const a = flat(50_000_000, 0, 10)
    expect(a.cicilanPerBulan).toBe(5_000_000)
    expect(a.totalBunga).toBe(0)
  })
})

describe('floating', () => {
  it('delegates to anuitas with the supplied current rate', () => {
    const f = floating(200_000_000, 8, 60)
    const a = anuitas(200_000_000, 8, 60)
    expect(f.cicilanPerBulan).toBe(a.cicilanPerBulan)
  })
})

describe('revolving', () => {
  it('clears in N months given a payment > monthly interest', () => {
    // Sisa 5jt @ 2.5%/bulan, minPayRate 10%, floor 100rb
    const r = revolving(5_000_000, 2.5, 0.1, 100_000)
    expect(r.monthsToClear).not.toBeNull()
    expect(r.monthsToClear).toBeGreaterThan(0)
    expect(r.schedule[r.schedule.length - 1]!.sisa).toBeCloseTo(0, 6)
  })

  it('returns null when min-payment doesn’t cover interest', () => {
    // Sisa 10jt @ 3%/bulan = 300rb bunga; minPayRate 1% = 100rb → diverges
    const r = revolving(10_000_000, 3, 0.01, 0)
    expect(r.monthsToClear).toBeNull()
    expect(r.totalBunga).toBeNull()
  })

  it('sisaPokok 0 → 0 months, empty schedule', () => {
    expect(revolving(0, 2, 0.1).monthsToClear).toBe(0)
  })

  it('minPaymentFloor accelerates payoff', () => {
    const slow = revolving(5_000_000, 2, 0.05, 0)
    const fast = revolving(5_000_000, 2, 0.05, 500_000)
    expect(fast.monthsToClear).not.toBeNull()
    expect(slow.monthsToClear).not.toBeNull()
    expect(fast.monthsToClear!).toBeLessThan(slow.monthsToClear!)
  })
})
