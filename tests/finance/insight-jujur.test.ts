import { describe, expect, it, test } from 'vitest'
import { resolveInsight, pickNamedCategory, type ResolverInput } from '~/lib/finance/insight-jujur'

function input(overrides: Partial<ResolverInput> = {}): ResolverInput {
  return {
    income: 5_000_000,
    surplus: 1_000_000,
    pokok: 2_000_000,
    biayaKos: 0,
    lifestyle: 1_000_000,
    pengeluaranLain: [],
    cicilanTotal: 0,
    runwayDays: 180,
    ...overrides,
  }
}

describe('resolveInsight — priority logic', () => {
  it('returns null for healthy state', () => {
    expect(resolveInsight(input())).toBeNull()
  })

  it('bocor-dominant fires when surplus < 0 and leak > essentials', () => {
    // Judol-shape: surplus -1M, lifestyle 1M + top-up 4M = diskresioner 5M, essentials 4M
    const result = resolveInsight(input({
      surplus: -1_000_000,
      lifestyle: 1_000_000,
      pengeluaranLain: [{ label: 'Top-up / Hobi Online', amount: 4_000_000 }],
      pokok: 2_500_000,
      cicilanTotal: 1_500_000,
    }))
    expect(result?.kind).toBe('bocor-dominant')
    expect(result?.copy).toContain('Rp4.000.000')
    expect(result?.copy).toContain('Rp1.000.000')
    expect(result?.copy).not.toContain('Rp5.000.000')
    expect(result?.copy).toContain('Top-up / Hobi Online')
    expect(result?.copy).toContain('itu yang bikin kamu nombok')
  })

  it('defisit fires when surplus < 0 and leak does NOT dominate', () => {
    // Terjebak Cicilan-shape: surplus -1.6M, diskresioner 1M < essentials 4.6M
    const result = resolveInsight(input({
      surplus: -1_600_000,
      lifestyle: 1_000_000,
      pengeluaranLain: [],
      pokok: 2_500_000,
      cicilanTotal: 2_100_000,
    }))
    expect(result?.kind).toBe('defisit')
    expect(result?.copy).toContain('Rp1.600.000')
    expect(result?.copy).toContain('Pengeluaran lebih besar dari pemasukan')
  })

  it('bocor-normal fires when surplus > 0, leak > tabungan, Y >= 2.0', () => {
    // Sultan-shape: surplus 1M, lifestyle 10.5M, Y = 10.5
    const result = resolveInsight(input({
      surplus: 1_000_000,
      lifestyle: 10_500_000,
    }))
    expect(result?.kind).toBe('bocor-normal')
    expect(result?.copy).toContain('Rp10.500.000')
    expect(result?.copy).toContain('Lifestyle')
  })

  it('runway fires when runwayDays < 30', () => {
    const result = resolveInsight(input({ surplus: 200_000, lifestyle: 100_000, runwayDays: 7 }))
    expect(result?.kind).toBe('runway')
    expect(result?.copy).toContain('7 hari')
  })
})

describe('resolveInsight — Y gate boundary', () => {
  it('Yactual = 1.99 does NOT fire bocor', () => {
    const tabungan = 1_000_000
    const xAmount = 1_990_000
    const result = resolveInsight(input({
      surplus: tabungan,
      lifestyle: xAmount,
      runwayDays: 180,
    }))
    expect(result).toBeNull()
  })

  it('Yactual = 2.0 fires bocor', () => {
    const tabungan = 1_000_000
    const xAmount = 2_000_000
    const result = resolveInsight(input({
      surplus: tabungan,
      lifestyle: xAmount,
      runwayDays: 180,
    }))
    expect(result?.kind).toBe('bocor-normal')
    expect(result?.copy).toContain('2×')
  })

  it('Yactual = 1.5 does NOT fire bocor (Pas-pasan regression guard)', () => {
    const result = resolveInsight(input({
      surplus: 1_000_000,
      lifestyle: 1_500_000,
      runwayDays: 180,
    }))
    expect(result).toBeNull()
  })
})

describe('resolveInsight — edge cases', () => {
  it('runway = 0 fires "0 hari"', () => {
    const result = resolveInsight(input({ surplus: 0, lifestyle: 100_000, runwayDays: 0 }))
    expect(result?.kind).toBe('runway')
    expect(result?.copy).toContain('0 hari')
  })

  it('runway = 29 fires (below 30)', () => {
    const result = resolveInsight(input({ surplus: 200_000, lifestyle: 100_000, runwayDays: 29 }))
    expect(result?.kind).toBe('runway')
  })

  it('runway = 30 does NOT fire', () => {
    const result = resolveInsight(input({ surplus: 200_000, lifestyle: 100_000, runwayDays: 30 }))
    expect(result).toBeNull()
  })

  it('bocor-dominant requires strict leak > essentials (not >=)', () => {
    // leak === essentials → should NOT fire bocor-dominant
    const result = resolveInsight(input({
      surplus: -1_000_000,
      lifestyle: 3_000_000,
      pengeluaranLain: [],
      pokok: 3_000_000,
      cicilanTotal: 0,
    }))
    expect(result?.kind).toBe('defisit')
  })

  it('defisit bocor-dominant with no matched lain — uses lifestyle', () => {
    const result = resolveInsight(input({
      surplus: -1_000_000,
      lifestyle: 5_000_000,
      pengeluaranLain: [],
      pokok: 2_000_000,
      cicilanTotal: 1_000_000,
    }))
    expect(result?.kind).toBe('bocor-dominant')
    expect(result?.copy).toContain('Lifestyle')
    expect(result?.copy).toContain('Rp5.000.000')
  })
})

describe('pickNamedCategory', () => {
  it('picks largest matched lain when totalFromLain >= lifestyle', () => {
    const result = pickNamedCategory(1_000_000, [
      { label: 'Top-up / Hobi Online', amount: 4_000_000 },
    ])
    expect(result).toEqual({ name: 'Top-up / Hobi Online', amount: 4_000_000 })
  })

  it('picks Lifestyle when totalFromLain < lifestyle', () => {
    const result = pickNamedCategory(5_000_000, [
      { label: 'Hobi', amount: 1_000_000 },
    ])
    expect(result).toEqual({ name: 'Lifestyle', amount: 5_000_000 })
  })

  it('picks the largest from multiple matched lain rows', () => {
    const result = pickNamedCategory(1_000_000, [
      { label: 'Boba', amount: 2_000_000 },
      { label: 'Top-up', amount: 3_000_000 },
    ])
    expect(result).toEqual({ name: 'Top-up', amount: 3_000_000 })
  })

  it('picks Lifestyle when no matched lain rows', () => {
    const result = pickNamedCategory(10_500_000, [])
    expect(result).toEqual({ name: 'Lifestyle', amount: 10_500_000 })
  })

  it('tie: totalFromLain === lifestyle → picks lain (>= check)', () => {
    const result = pickNamedCategory(2_000_000, [
      { label: 'Top-up', amount: 2_000_000 },
    ])
    expect(result).toEqual({ name: 'Top-up', amount: 2_000_000 })
  })
})

describe('resolveInsight — {X} substitution boundary', () => {
  it('Judol-shape: X_amount = 4M (Top-up), NOT 5M (total diskresioner)', () => {
    const result = resolveInsight(input({
      surplus: -1_000_000,
      lifestyle: 1_000_000,
      pengeluaranLain: [{ label: 'Top-up / Hobi Online', amount: 4_000_000 }],
      pokok: 2_500_000,
      cicilanTotal: 1_500_000,
    }))
    expect(result?.copy).toContain('Rp4.000.000')
    expect(result?.copy).not.toContain('Rp5.000.000')
  })

  it('Sultan-shape: X_amount = 10.5M (= lifestyle, single category)', () => {
    const result = resolveInsight(input({
      surplus: 1_000_000,
      lifestyle: 10_500_000,
    }))
    expect(result?.copy).toContain('Rp10.500.000')
  })

  it('tie-shape: totalFromLain >= lifestyle → picks lain category', () => {
    const result = resolveInsight(input({
      surplus: 500_000,
      lifestyle: 2_000_000,
      pengeluaranLain: [{ label: 'Top-up', amount: 2_000_000 }],
    }))
    expect(result?.kind).toBe('bocor-normal')
    expect(result?.copy).toContain('Top-up')
    expect(result?.copy).toContain('Rp2.000.000')
  })

  it('multi-matched lain picks largest', () => {
    const result = resolveInsight(input({
      surplus: 1_000_000,
      lifestyle: 1_000_000,
      pengeluaranLain: [
        { label: 'Top-up', amount: 3_000_000 },
        { label: 'Boba', amount: 2_000_000 },
      ],
    }))
    expect(result?.kind).toBe('bocor-normal')
    expect(result?.copy).toContain('Top-up')
    expect(result?.copy).toContain('Rp3.000.000')
  })
})

describe('resolveInsight — persona walkthrough (§3.7 table)', () => {
  // Computed from lib/fixtures/personas.ts using calcTotalPengeluaran + sumCicilanPerBulan
  test.each([
    // [id, expectedKind, expectedXSubstring, input overrides]
    [
      'mahasiswa-pas-pasan',
      'runway',
      '7 hari',
      {
        income: 2_300_000,
        surplus: 200_000,
        pokok: 1_000_000,
        biayaKos: 800_000,
        lifestyle: 300_000,
        pengeluaranLain: [],
        cicilanTotal: 0,
        runwayDays: 7,
      },
    ],
    [
      'mahasiswa-mandiri',
      null,
      null,
      {
        income: 3_000_000,
        surplus: 700_000,
        pokok: 1_200_000,
        biayaKos: 700_000,
        lifestyle: 400_000,
        pengeluaranLain: [],
        cicilanTotal: 0,
        runwayDays: 78,
      },
    ],
    [
      'mahasiswa-sultan',
      'bocor-normal',
      'Rp10.500.000',
      {
        income: 15_000_000,
        surplus: 1_000_000,
        pokok: 3_500_000,
        biayaKos: 0,
        lifestyle: 10_500_000,
        pengeluaranLain: [],
        cicilanTotal: 0,
        runwayDays: 999,
      },
    ],
    [
      'korban-judol',
      'bocor-dominant',
      'Rp4.000.000',
      {
        income: 8_000_000,
        surplus: -1_000_000,
        pokok: 2_500_000,
        biayaKos: 0,
        lifestyle: 1_000_000,
        pengeluaranLain: [{ label: 'Top-up / Hobi Online', amount: 4_000_000 }],
        cicilanTotal: 1_500_000,
        runwayDays: 999,
      },
    ],
    [
      'terjebak-cicilan',
      'defisit',
      'Rp1.600.000',
      {
        income: 4_000_000,
        surplus: -1_600_000,
        pokok: 2_500_000,
        biayaKos: 0,
        lifestyle: 1_000_000,
        pengeluaranLain: [],
        cicilanTotal: 2_100_000,
        runwayDays: 999,
      },
    ],
    [
      'pegawai-muda-kpr',
      null,
      null,
      {
        income: 8_800_000,
        surplus: 2_050_000,
        pokok: 3_500_000,
        biayaKos: 0,
        lifestyle: 1_200_000,
        pengeluaranLain: [],
        cicilanTotal: 2_050_000,
        runwayDays: 999,
      },
    ],
    [
      'freelancer-bebas-utang',
      null,
      null,
      {
        income: 6_000_000,
        surplus: 1_000_000,
        pokok: 3_500_000,
        biayaKos: 0,
        lifestyle: 1_500_000,
        pengeluaranLain: [],
        cicilanTotal: 0,
        runwayDays: 999,
      },
    ],
    [
      'juragan-kos',
      null,
      null,
      {
        income: 30_000_000,
        surplus: 15_000_000,
        pokok: 5_000_000,
        biayaKos: 0,
        lifestyle: 5_000_000,
        pengeluaranLain: [],
        cicilanTotal: 5_000_000,
        runwayDays: 999,
      },
    ],
    [
      'pensiunan-mapan',
      null,
      null,
      {
        income: 25_000_000,
        surplus: 13_000_000,
        pokok: 8_000_000,
        biayaKos: 0,
        lifestyle: 4_000_000,
        pengeluaranLain: [],
        cicilanTotal: 0,
        runwayDays: 999,
      },
    ],
    [
      'sultan-properti',
      null,
      null,
      {
        income: 80_000_000,
        surplus: 50_000_000,
        pokok: 15_000_000,
        biayaKos: 0,
        lifestyle: 15_000_000,
        pengeluaranLain: [],
        cicilanTotal: 0,
        runwayDays: 999,
      },
    ],
  ])('persona %s fires %s with substring %s', (id, expectedKind, expectedSubstring, overrides) => {
    const result = resolveInsight(input(overrides))
    if (expectedKind === null) {
      expect(result).toBeNull()
    }
    else {
      expect(result?.kind).toBe(expectedKind)
      if (expectedSubstring) {
        expect(result?.copy).toContain(expectedSubstring)
      }
    }
  })
})

describe('resolveInsight — tone and emoji', () => {
  it('defisit uses rose tone and 💸 emoji', () => {
    const result = resolveInsight(input({ surplus: -500_000, pokok: 3_000_000, lifestyle: 500_000, cicilanTotal: 1_500_000 }))
    expect(result?.tone).toBe('rose')
    expect(result?.emoji).toBe('💸')
  })

  it('bocor uses rose tone and 🚰 emoji', () => {
    const result = resolveInsight(input({ surplus: 1_000_000, lifestyle: 10_500_000 }))
    expect(result?.tone).toBe('rose')
    expect(result?.emoji).toBe('🚰')
  })

  it('runway uses amber tone and ⏳ emoji', () => {
    const result = resolveInsight(input({ surplus: 200_000, lifestyle: 100_000, runwayDays: 7 }))
    expect(result?.tone).toBe('amber')
    expect(result?.emoji).toBe('⏳')
  })
})
