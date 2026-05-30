import { describe, expect, it } from 'vitest'
import { zoneOf } from '~/lib/finance/thresholds'

describe('zoneOf — lower-better metrics', () => {
  it('dsr: < 30 sehat, 30 waspada, 40 bahaya', () => {
    expect(zoneOf('dsr', 0)).toBe('sehat')
    expect(zoneOf('dsr', 29.99)).toBe('sehat')
    expect(zoneOf('dsr', 30)).toBe('waspada')
    expect(zoneOf('dsr', 39.99)).toBe('waspada')
    expect(zoneOf('dsr', 40)).toBe('bahaya')
    expect(zoneOf('dsr', 120)).toBe('bahaya')
  })

  it('dar: < 30 sehat, 30 waspada, 50 bahaya', () => {
    expect(zoneOf('dar', 29.99)).toBe('sehat')
    expect(zoneOf('dar', 30)).toBe('waspada')
    expect(zoneOf('dar', 49.99)).toBe('waspada')
    expect(zoneOf('dar', 50)).toBe('bahaya')
  })

  it('allocationDiscipline (pp): < 5 sehat, 5 waspada, 15 bahaya', () => {
    expect(zoneOf('allocationDiscipline', 4.99)).toBe('sehat')
    expect(zoneOf('allocationDiscipline', 5)).toBe('waspada')
    expect(zoneOf('allocationDiscipline', 14.99)).toBe('waspada')
    expect(zoneOf('allocationDiscipline', 15)).toBe('bahaya')
  })

  it('rasioTertahan: < 50 sehat, 50 waspada, 70 bahaya', () => {
    expect(zoneOf('rasioTertahan', 49.99)).toBe('sehat')
    expect(zoneOf('rasioTertahan', 50)).toBe('waspada')
    expect(zoneOf('rasioTertahan', 69.99)).toBe('waspada')
    expect(zoneOf('rasioTertahan', 70)).toBe('bahaya')
  })
})

describe('zoneOf — higher-better metrics', () => {
  it('runway (bulan): ≥ 6 sehat, 3 waspada, < 3 bahaya', () => {
    expect(zoneOf('runway', 6)).toBe('sehat')
    expect(zoneOf('runway', 12)).toBe('sehat')
    expect(zoneOf('runway', 5.99)).toBe('waspada')
    expect(zoneOf('runway', 3)).toBe('waspada')
    expect(zoneOf('runway', 2.99)).toBe('bahaya')
    expect(zoneOf('runway', 0)).toBe('bahaya')
  })

  it('savingsRate: ≥ 20 sehat, 10 waspada, < 10 bahaya', () => {
    expect(zoneOf('savingsRate', 20)).toBe('sehat')
    expect(zoneOf('savingsRate', 19.99)).toBe('waspada')
    expect(zoneOf('savingsRate', 10)).toBe('waspada')
    expect(zoneOf('savingsRate', 9.99)).toBe('bahaya')
  })

  it('safeHaven: ≥ 60 konservatif/sehat, 40 seimbang/waspada, < 40 agresif/bahaya', () => {
    expect(zoneOf('safeHaven', 60)).toBe('sehat')
    expect(zoneOf('safeHaven', 59.99)).toBe('waspada')
    expect(zoneOf('safeHaven', 40)).toBe('waspada')
    expect(zoneOf('safeHaven', 39.99)).toBe('bahaya')
  })

  it('goalHealth: ≥ 80 sehat, 50 mixed/waspada, < 50 off/bahaya', () => {
    expect(zoneOf('goalHealth', 80)).toBe('sehat')
    expect(zoneOf('goalHealth', 79.99)).toBe('waspada')
    expect(zoneOf('goalHealth', 50)).toBe('waspada')
    expect(zoneOf('goalHealth', 49.99)).toBe('bahaya')
  })
})
