// Integration smoke test for the xlsx export. Assembles the full workbook
// the same way useXlsx does in the browser, writes to a temp file, then
// reads it back via SheetJS to verify the structural contract: 5 visible
// sheets + 1 hidden _meta, schema_version persisted, sample cells round-trip
// faithfully.
//
// Runs in Node — `XLSX.writeFile` writes to disk synchronously when the
// platform isn't a browser. This catches workbook-assembly regressions
// (wrong hidden flag, missing sheet, AOA → cell coercion drift) without
// needing a browser harness.

import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as XLSX from 'xlsx'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { applyDemoSnapshot } from '~/lib/fixtures/demoSnapshot'
import { SCHEMA_VERSION, type XlsxContext } from '~/lib/xlsx/sheets'
import { buildWorkbook } from '~/lib/xlsx/workbook'
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

describe('xlsx integration (write → read round-trip)', () => {
  let workdir: string

  beforeEach(() => {
    setActivePinia(createPinia())
    workdir = mkdtempSync(join(tmpdir(), 'cermat-xlsx-'))
  })

  // Run even when the test body throws — otherwise mid-run failures leak
  // tmp dirs across test runs (Codex hygiene note 2026-06-03).
  afterEach(() => {
    rmSync(workdir, { recursive: true, force: true })
  })

  it('produces 6 sheets in order, _meta marked hidden', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const goals = useGoalsStore()
    const ctx = makeCtx(snapStateFrom(snap), goals.goals)
    const wb = buildWorkbook(ctx, XLSX)
    const out = join(workdir, 'smoke.xlsx')
    XLSX.writeFile(wb, out)

    const reopened = XLSX.readFile(out)
    expect(reopened.SheetNames).toEqual([
      'Ringkasan',
      'Snapshot',
      'Per-Emiten',
      'Cicilan-Aktif',
      'Goals',
      '_meta',
    ])
    const metaIdx = reopened.SheetNames.indexOf('_meta')
    const wbMeta = reopened.Workbook?.Sheets?.[metaIdx]
    expect(wbMeta?.Hidden).toBe(1)
  })

  it('_meta round-trips schema_version + JSON state intact', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const goals = useGoalsStore()
    const ctx = makeCtx(snapStateFrom(snap), goals.goals)
    const wb = buildWorkbook(ctx, XLSX)
    const out = join(workdir, 'meta.xlsx')
    XLSX.writeFile(wb, out)

    const reopened = XLSX.readFile(out)
    const metaSheet = reopened.Sheets['_meta']!
    const rows = XLSX.utils.sheet_to_json(metaSheet, { header: 1 }) as unknown[][]

    expect(rows[0]?.[0]).toBe('cermat_schema_version')
    expect(rows[0]?.[1]).toBe(SCHEMA_VERSION)
    expect(rows[1]?.[0]).toBe('exported_at')
    expect(rows[2]?.[0]).toBe('data_json')

    const parsed = JSON.parse(String(rows[2]?.[1])) as {
      snapshot: SnapshotState
      goals: { goals: unknown[]; fiMultiplier: number }
    }
    expect(parsed.snapshot.saham.length).toBe(snap.saham.length)
    expect(parsed.goals.fiMultiplier).toBe(FI_MULTIPLIER)
  })

  it('Snapshot sheet preserves 8-col parser-friendly schema + sample IDR identity', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const goals = useGoalsStore()
    const ctx = makeCtx(snapStateFrom(snap), goals.goals)
    const wb = buildWorkbook(ctx, XLSX)
    const out = join(workdir, 'snapshot.xlsx')
    XLSX.writeFile(wb, out)

    const reopened = XLSX.readFile(out)
    const snapSheet = reopened.Sheets['Snapshot']!
    const rows = XLSX.utils.sheet_to_json(snapSheet, { header: 1 }) as unknown[][]

    expect(rows[0]).toEqual([
      'section',
      'id',
      'label',
      'value_source',
      'source_currency',
      'value_idr',
      'suku_bunga_percent',
      'rd_jenis',
    ])
    // Penghasilan gaji round-trips: IDR row → value_idr === value_source.
    const gajiRow = rows.find((r) => r[0] === 'penghasilan')!
    expect(gajiRow[1]).toBe('gaji') // singleton id key
    expect(gajiRow[3]).toBe(gajiRow[5]) // value_source === value_idr for IDR
  })

  it('Per-Emiten sheet preserves id + ticker for every saham row (target_bobot dropped)', () => {
    const snap = useSnapshotStore()
    applyDemoSnapshot(snap)
    const goals = useGoalsStore()
    const ctx = makeCtx(snapStateFrom(snap), goals.goals)
    const wb = buildWorkbook(ctx, XLSX)
    const out = join(workdir, 'peremiten.xlsx')
    XLSX.writeFile(wb, out)

    const reopened = XLSX.readFile(out)
    const sheet = reopened.Sheets['Per-Emiten']!
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][]
    // 1 header + N saham rows
    expect(rows.length - 1).toBe(snap.saham.length)
    // Col 0 is id (uuid), col 1 is ticker
    expect(rows[0]?.[0]).toBe('id')
    expect(rows[0]?.[1]).toBe('ticker')
    expect((rows[0] as string[]).includes('target_bobot')).toBe(false)
    const tickers = rows.slice(1).map((r) => r[1])
    expect(tickers).toContain('BBRI')
    expect(tickers).toContain('BMRI')
    expect(tickers).toContain('BBCA')
  })
})
