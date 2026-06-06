import { describe, it, expect } from 'vitest'
import { validateFileMetadata, extractMetaSheet, validateSchemaVersion, parseDataJson, parseGoalsSheet, validateSnapshotSheet } from '~/lib/xlsx/import'
import { SCHEMA_VERSION } from '~/lib/xlsx/sheets'

describe('import: validateFileMetadata', () => {
  it('accepts .xlsx files under 5MB', () => {
    const file = { name: 'test.xlsx', size: 100 } as File
    expect(validateFileMetadata(file)).toBeNull()
  })

  it('rejects non-.xlsx files', () => {
    const file = { name: 'test.csv', size: 100 } as File
    const err = validateFileMetadata(file)
    expect(err?.code).toBe('FILE_TYPE')
  })

  it('rejects files > 5MB', () => {
    const bigFile = { name: 'big.xlsx', size: 6 * 1024 * 1024 } as File
    const err = validateFileMetadata(bigFile)
    expect(err?.code).toBe('FILE_SIZE')
  })
})

describe('import: extractMetaSheet', () => {
  it('parses valid _meta rows', () => {
    const rows = [
      ['cermat_schema_version', 1],
      ['exported_at', '2026-06-06T00:00:00.000Z'],
      ['data_json', '{"snapshot":{},"goals":{}}'],
    ]
    const result = extractMetaSheet(rows)
    if ('code' in result) throw new Error('should not fail')
    expect(result.schemaVersion).toBe(1)
    expect(result.dataJson).toBe('{"snapshot":{},"goals":{}}')
  })

  it('rejects empty _meta', () => {
    const err = extractMetaSheet([])
    if (!('code' in err)) throw new Error('should fail')
    expect(err.code).toBe('NO_META')
  })

  it('rejects _meta without schema version', () => {
    const rows = [['exported_at', '2026-06-06']]
    const err = extractMetaSheet(rows)
    if (!('code' in err)) throw new Error('should fail')
    expect(err.code).toBe('NO_META')
  })
})

describe('import: validateSchemaVersion', () => {
  it('accepts matching major version', () => {
    expect(validateSchemaVersion(SCHEMA_VERSION)).toBe(true)
  })

  it('rejects different major version', () => {
    expect(validateSchemaVersion(99)).toBe(false)
  })

  it('accepts same major with different minor', () => {
    // SCHEMA_VERSION is an integer, so same floor = same version
    expect(validateSchemaVersion(SCHEMA_VERSION + 0.1)).toBe(true)
  })
})

describe('import: parseDataJson', () => {
  const minimalSnapshot = {
    penghasilan: { amount: 0, currency: 'IDR' },
    penghasilanLain: [],
    pengeluaran: { pokok: 0, pokokCurrency: 'IDR', lifestyle: 0, lifestyleCurrency: 'IDR' },
    pengeluaranLain: [],
    asetLikuid: { kas: [], deposito: [], reksaDana: [], sbn: [] },
    asetNonLikuid: { properti: [], kendaraan: [], pensiun: [] },
    emas: { digitalGram: 0, fisikAntamGram: 0, perhiasan18KGram: 0, perhiasan14KGram: 0, perhiasan10KGram: 0 },
    saham: [],
    crypto: [],
    cicilanAktif: [],
    utangPribadi: [],
    gadai: [],
  }

  it('parses valid data_json with snapshot + goals', () => {
    const data = JSON.stringify({
      snapshot: minimalSnapshot,
      goals: {
        goals: [{ id: 'g1', kind: 'FI', label: 'FI', targetIdr: 0, targetDate: '', buckets: ['kas'] }],
        assumedAnnualReturnReal: 0.05,
        fiMultiplier: 300,
      },
    })
    const result = parseDataJson(data)
    if ('code' in result) throw new Error('should not fail')
    expect(result.snapshot.penghasilan.amount).toBe(0)
    expect(result.goalsData.goals.length).toBe(1)
  })

  it('parses valid data_json without goals', () => {
    const data = JSON.stringify({ snapshot: minimalSnapshot })
    const result = parseDataJson(data)
    if ('code' in result) throw new Error('should not fail')
    expect(result.snapshot).toBeDefined()
    expect(result.goalsData.goals.length).toBe(0)
  })

  it('rejects malformed JSON', () => {
    const result = parseDataJson('not json at all')
    if (!('code' in result)) throw new Error('should fail')
    expect(result.code).toBe('DATA_JSON_PARSE')
  })

  it('rejects JSON without snapshot', () => {
    const result = parseDataJson('{}')
    if (!('code' in result)) throw new Error('should fail')
    expect(result.code).toBe('DATA_JSON_PARSE')
  })
})

describe('import: parseGoalsSheet', () => {
  it('parses valid goals rows', () => {
    const rows = [
      ['goal_id', 'goal_type', 'label', 'target_amount', 'target_date', 'fi_multiplier', 'bucket_json'],
      ['g1', 'FI', 'Financial Independence', 300000000, '2030-01-01', 300, '["kas","saham"]'],
    ]
    const result = parseGoalsSheet(rows)
    expect(result.goals.length).toBe(1)
    expect(result.goals[0]!.buckets).toEqual(['kas', 'saham'])
    expect(result.warnings.length).toBe(0)
  })

  it('skips goals with malformed bucket_json', () => {
    const rows = [
      ['goal_id', 'goal_type', 'label', 'target_amount', 'target_date', 'fi_multiplier', 'bucket_json'],
      ['g1', 'FI', 'Good Goal', 1000000, '', null, '["kas"]'],
      ['g2', 'CUSTOM', 'Bad Goal', 2000000, '', null, 'not json'],
    ]
    const result = parseGoalsSheet(rows)
    expect(result.goals.length).toBe(1)
    expect(result.warnings.length).toBe(1)
  })

  it('returns empty for undefined sheet', () => {
    const result = parseGoalsSheet(undefined)
    expect(result.goals.length).toBe(0)
  })

  it('returns empty for header-only sheet', () => {
    const result = parseGoalsSheet([['goal_id', 'goal_type', 'label', 'target_amount', 'target_date', 'fi_multiplier', 'bucket_json']])
    expect(result.goals.length).toBe(0)
  })
})

describe('import: validateSnapshotSheet', () => {
  it('accepts valid Snapshot sheet with data rows', () => {
    const rows = [
      ['section', 'id', 'label', 'value_source', 'source_currency', 'value_idr', 'suku_bunga_percent', 'rd_jenis'],
      ['penghasilan', 'gaji', 'Gaji Bersih', 5000000, 'IDR', 5000000, null, null],
    ]
    expect(validateSnapshotSheet(rows)).toBeNull()
  })

  it('rejects missing Snapshot sheet', () => {
    const err = validateSnapshotSheet(undefined)
    expect(err?.code).toBe('NO_SNAPSHOT')
  })

  it('rejects wrong column count', () => {
    const rows = [['section', 'id', 'label']]
    const err = validateSnapshotSheet(rows)
    expect(err?.code).toBe('SNAPSHOT_FORMAT')
  })

  it('rejects empty Snapshot (header only)', () => {
    const rows = [['section', 'id', 'label', 'value_source', 'source_currency', 'value_idr', 'suku_bunga_percent', 'rd_jenis']]
    const err = validateSnapshotSheet(rows)
    expect(err?.code).toBe('EMPTY_SNAPSHOT')
  })
})
