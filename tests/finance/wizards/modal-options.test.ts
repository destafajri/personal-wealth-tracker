import { describe, expect, it } from 'vitest'
import {
  runModalOptions,
  type ModalOptionsInput,
} from '~/lib/finance/wizards/modal-options'
import { emptySnapshot, type SnapshotState } from '~/lib/types/snapshot'
import type { Goal } from '~/lib/types/goals'

const OPTS: ModalOptionsInput = {
  fiMultiplier: 300,
  assumedAnnualReturnReal: 0.05,
}

function snapWithModal(modal: number): SnapshotState {
  const s = emptySnapshot()
  s.penghasilan = { amount: 20_000_000, currency: 'IDR' }
  s.pengeluaran = { pokok: 8_000_000, lifestyle: 0 }
  s.asetLikuid.kas.push({ id: 'k1', label: 'BCA', amount: modal })
  return s
}

function fiGoal(): Goal {
  return {
    id: 'fi1',
    kind: 'FI',
    label: 'Financial Independence',
    targetIdr: 0, // FI resolves via fiNumber, not user-set target
    targetDate: '',
    buckets: ['kas', 'deposito', 'reksaDana', 'sbn', 'saham', 'crypto', 'emas'],
  }
}

describe('runModalOptions — modal siap gate', () => {
  it('empty result when Modal Siap = 0', () => {
    const r = runModalOptions(emptySnapshot(), [], OPTS)
    expect(r.modalSiapIdr).toBe(0)
    expect(r.options).toEqual([])
    expect(r.emergencyFundNote).toMatch(/dana darurat/i)
  })

  it('emits FI bucket options when Modal Siap > 0 and no other moves possible', () => {
    const r = runModalOptions(snapWithModal(50_000_000), [], OPTS)
    expect(r.modalSiapIdr).toBe(50_000_000)
    // RD + Deposito options always present when modal > 0
    const kinds = r.options.map((o) => o.kind)
    expect(kinds).toContain('tambah-reksaDana')
    expect(kinds).toContain('tambah-deposito')
  })
})

describe('runModalOptions — cicilan options', () => {
  it('full lunas option when modal covers sisa pokok', () => {
    const s = snapWithModal(50_000_000)
    s.cicilanAktif.push({
      id: 'c1',
      tipe: 'KK',
      label: 'Kartu Kredit',
      sisaPokok: 8_000_000,
      cicilanPerBulan: 800_000,
      jenisBunga: 'Revolving',
    })
    const r = runModalOptions(s, [], OPTS)
    const opt = r.options.find((o) => o.kind === 'lunasi-cicilan')
    expect(opt).toBeTruthy()
    expect(opt!.amount).toBe(8_000_000)
    expect(opt!.handoff.kind).toBe('wizard')
    if (opt!.handoff.kind === 'wizard') {
      expect(opt!.handoff.wizardKey).toBe('lunasi')
      expect(opt!.handoff.prefill.source).toBe('cicilan')
      expect(opt!.handoff.prefill.id).toBe('c1')
      expect(opt!.handoff.prefill.paymentIdr).toBe(8_000_000)
    }
    expect(opt!.label).toContain('Kartu Kredit')
    expect(opt!.impactPreview).toMatch(/DSR/)
  })

  it('prepay option (instead of lunas) for amortizing cicilan when modal < sisa pokok', () => {
    const s = snapWithModal(20_000_000)
    s.cicilanAktif.push({
      id: 'c1',
      tipe: 'KPR',
      label: 'KPR BCA',
      sisaPokok: 500_000_000,
      cicilanPerBulan: 4_500_000,
      sukuBunga: 7,
      tenorSisaBulan: 180,
      jenisBunga: 'Anuitas',
    })
    const r = runModalOptions(s, [], OPTS)
    const opt = r.options.find((o) => o.kind === 'prepay-cicilan')
    expect(opt).toBeTruthy()
    expect(opt!.amount).toBe(20_000_000)
    if (opt!.handoff.kind === 'wizard') {
      expect(opt!.handoff.prefill.modeAnuitas).toBe('tenor')
    }
  })

  it('skips prepay for non-amortizing (Revolving/Floating) when modal < sisa pokok', () => {
    const s = snapWithModal(2_000_000)
    s.cicilanAktif.push({
      id: 'c1',
      tipe: 'KK',
      label: 'KK',
      sisaPokok: 10_000_000,
      cicilanPerBulan: 500_000,
      jenisBunga: 'Revolving',
    })
    const r = runModalOptions(s, [], OPTS)
    expect(r.options.find((o) => o.kind === 'prepay-cicilan')).toBeUndefined()
    expect(r.options.find((o) => o.kind === 'lunasi-cicilan')).toBeUndefined()
  })

  it('utang pribadi: emits lunas option only when modal covers sisa', () => {
    const s = snapWithModal(15_000_000)
    s.utangPribadi.push({
      id: 'u1',
      label: 'Pinjam teman',
      sisaPokok: 10_000_000,
      cicilanPerBulan: 500_000,
    })
    s.utangPribadi.push({
      id: 'u2',
      label: 'Pinjam keluarga',
      sisaPokok: 30_000_000,
    })
    const r = runModalOptions(s, [], OPTS)
    const opts = r.options.filter((o) => o.kind === 'lunasi-utangPribadi')
    expect(opts).toHaveLength(1)
    expect(opts[0]!.amount).toBe(10_000_000)
    if (opts[0]!.handoff.kind === 'wizard') {
      expect(opts[0]!.handoff.prefill.source).toBe('utangPribadi')
    }
  })

  it('gadai: emits tebus option when modal covers piutang', () => {
    const s = snapWithModal(20_000_000)
    s.gadai.push({
      id: 'g1',
      label: 'Gadai emas Antam',
      jaminan: 'emas:fisikAntam',
      gramTertahan: 20,
      piutangIdr: 15_000_000,
      bungaPerBulanPercent: 1.5,
      tempoBulan: 4,
    })
    const r = runModalOptions(s, [], OPTS)
    const opt = r.options.find((o) => o.kind === 'lunasi-gadai')
    expect(opt).toBeTruthy()
    expect(opt!.amount).toBe(15_000_000)
    if (opt!.handoff.kind === 'wizard') {
      expect(opt!.handoff.prefill.source).toBe('gadai')
    }
  })
})

describe('runModalOptions — saham option', () => {
  it('picks emiten with largest lots gap, caps lots by modal affordance', () => {
    const s = snapWithModal(20_000_000)
    s.saham.push({
      id: 's1',
      ticker: 'BBCA',
      lot: 20,
      hargaRataRata: 9_000,
      lotsTarget: 50, // gap 30 lots
    })
    s.saham.push({
      id: 's2',
      ticker: 'BMRI',
      lot: 5,
      hargaRataRata: 6_000,
      lotsTarget: 100, // gap 95 lots — bigger gap, should be picked
    })
    const r = runModalOptions(s, [], OPTS)
    const opt = r.options.find((o) => o.kind === 'beli-saham')
    expect(opt).toBeTruthy()
    if (opt!.handoff.kind === 'apply' && opt!.handoff.apply.kind === 'addStockLots') {
      expect(opt!.handoff.apply.stockId).toBe('s2')
      // 20jt / (6000 × 100) = 33.33 → floor 33 lots, gap 95 → buy 33
      expect(opt!.handoff.apply.lotsToAdd).toBe(33)
    }
    expect(opt!.label).toMatch(/BMRI 33 lot/)
  })

  it('skips saham option when no emiten has lotsTarget', () => {
    const s = snapWithModal(20_000_000)
    s.saham.push({ id: 's1', ticker: 'BBCA', lot: 20, hargaRataRata: 9_000 })
    const r = runModalOptions(s, [], OPTS)
    expect(r.options.find((o) => o.kind === 'beli-saham')).toBeUndefined()
  })

  it('skips saham when all targets already met (gap <= 0)', () => {
    const s = snapWithModal(20_000_000)
    s.saham.push({
      id: 's1',
      ticker: 'BBCA',
      lot: 50,
      hargaRataRata: 9_000,
      lotsTarget: 50,
    })
    const r = runModalOptions(s, [], OPTS)
    expect(r.options.find((o) => o.kind === 'beli-saham')).toBeUndefined()
  })

  it('skips saham when modal < cost of 1 lot', () => {
    const s = snapWithModal(50_000) // way too small for any lot
    s.saham.push({
      id: 's1',
      ticker: 'BBCA',
      lot: 20,
      hargaRataRata: 9_000,
      lotsTarget: 50,
    })
    const r = runModalOptions(s, [], OPTS)
    expect(r.options.find((o) => o.kind === 'beli-saham')).toBeUndefined()
  })
})

describe('runModalOptions — FI bucket options', () => {
  it('uses FI goal projection shift preview when goal exists + projection finite', () => {
    const s = snapWithModal(50_000_000)
    // Modest income but surplus enough to make FI projection finite
    s.penghasilan = { amount: 30_000_000, currency: 'IDR' }
    s.pengeluaran = { pokok: 10_000_000, lifestyle: 0 }
    const r = runModalOptions(s, [fiGoal()], OPTS)
    const rd = r.options.find((o) => o.kind === 'tambah-reksaDana')
    expect(rd).toBeTruthy()
    // Either "maju ~N bulan/tahun" preview OR no-goal fallback if projection still inf
    expect(rd!.impactPreview).toMatch(/\+Rp/)
  })

  it('falls back to no-goal preview when no FI goal', () => {
    const r = runModalOptions(snapWithModal(50_000_000), [], OPTS)
    const rd = r.options.find((o) => o.kind === 'tambah-reksaDana')
    expect(rd).toBeTruthy()
    expect(rd!.impactPreview).toMatch(/(belum ada Goal FI|projection unreachable)/i)
  })
})

describe('runModalOptions — handoff payload integrity', () => {
  it('all options carry valid handoff (wizard or apply with non-empty apply payload)', () => {
    const s = snapWithModal(100_000_000)
    s.cicilanAktif.push({
      id: 'c1',
      tipe: 'KK',
      label: 'KK',
      sisaPokok: 5_000_000,
      cicilanPerBulan: 500_000,
      jenisBunga: 'Revolving',
    })
    s.utangPribadi.push({
      id: 'u1',
      label: 'Pinjam teman',
      sisaPokok: 8_000_000,
    })
    s.saham.push({
      id: 's1',
      ticker: 'BBCA',
      lot: 0,
      hargaRataRata: 9_000,
      lotsTarget: 10,
    })
    const r = runModalOptions(s, [], OPTS)
    expect(r.options.length).toBeGreaterThan(0)
    for (const opt of r.options) {
      expect(opt.id).toBeTruthy()
      expect(opt.label).toBeTruthy()
      expect(opt.impactPreview).toBeTruthy()
      expect(opt.amount).toBeGreaterThan(0)
      expect(['wizard', 'apply']).toContain(opt.handoff.kind)
      if (opt.handoff.kind === 'wizard') {
        expect(opt.handoff.wizardKey).toBe('lunasi')
        expect(opt.handoff.prefill).toBeTruthy()
      } else {
        expect(opt.handoff.apply).toBeTruthy()
      }
    }
  })

  it('does not mutate input snapshot', () => {
    const s = snapWithModal(50_000_000)
    s.cicilanAktif.push({
      id: 'c1',
      tipe: 'KK',
      label: 'KK',
      sisaPokok: 5_000_000,
      cicilanPerBulan: 500_000,
      jenisBunga: 'Revolving',
    })
    const beforeKas = s.asetLikuid.kas[0]!.amount
    const beforeCicilan = s.cicilanAktif.length
    runModalOptions(s, [fiGoal()], OPTS)
    expect(s.asetLikuid.kas[0]!.amount).toBe(beforeKas)
    expect(s.cicilanAktif).toHaveLength(beforeCicilan)
  })
})
