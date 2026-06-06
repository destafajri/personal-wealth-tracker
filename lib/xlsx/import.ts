import type { Goal, GoalBucketCategory, GoalKind } from '~/lib/types/goals'
import { GOAL_KINDS } from '~/lib/types/goals'
import type { SnapshotState } from '~/lib/types/snapshot'
import { SCHEMA_VERSION } from '~/lib/xlsx/sheets'
import { goalsPayloadSchema, snapshotSchema } from '~/lib/xlsx/import-schemas'

// ----- types -----

export type ImportErrorCode =
  | 'FILE_TYPE'
  | 'FILE_SIZE'
  | 'NO_META'
  | 'SCHEMA_VERSION'
  | 'NO_SNAPSHOT'
  | 'SNAPSHOT_FORMAT'
  | 'EMPTY_SNAPSHOT'
  | 'DATA_JSON_PARSE'
  | 'INTERNAL'

export interface ImportError {
  code: ImportErrorCode
  message: string
}

export interface ImportWarning {
  code: 'unknown_rowId' | 'bucket_json_ref'
  detail: string
}

export interface GoalsImportData {
  goals: Goal[]
  assumedAnnualReturnReal: number
}

export interface ImportResult {
  ok: boolean
  snapshot?: SnapshotState
  goalsData?: GoalsImportData
  errors: ImportError[]
  warnings: ImportWarning[]
  skippedRows: number
}

function fail(code: ImportErrorCode, message: string): ImportResult {
  return { ok: false, errors: [{ code, message }], warnings: [], skippedRows: 0 }
}

// ----- file metadata validation -----

export function validateFileMetadata(file: File): ImportError | null {
  if (!file.name.endsWith('.xlsx')) {
    return { code: 'FILE_TYPE', message: 'toast.import.error.fileType' }
  }
  if (file.size > 5 * 1024 * 1024) {
    return { code: 'FILE_SIZE', message: 'toast.import.error.fileSize' }
  }
  return null
}

// ----- _meta sheet extraction -----

export interface MetaSheetData {
  schemaVersion: number
  exportedAt: string
  dataJson: string
}

export function extractMetaSheet(
  sheetRows: unknown[][],
): MetaSheetData | ImportError {
  if (!sheetRows || sheetRows.length === 0) {
    return { code: 'NO_META', message: 'toast.import.error.notCermat' }
  }
  let schemaVersion: number | undefined
  let dataJson: string | undefined
  let exportedAt: string | undefined

  for (const row of sheetRows) {
    const key = row[0]
    const val = row[1]
    if (key === 'cermat_schema_version') schemaVersion = Number(val)
    else if (key === 'exported_at') exportedAt = String(val)
    else if (key === 'data_json') dataJson = String(val)
  }

  if (schemaVersion === undefined || dataJson === undefined) {
    return { code: 'NO_META', message: 'toast.import.error.notCermat' }
  }

  return { schemaVersion, exportedAt: exportedAt ?? '', dataJson }
}

// ----- schema version check -----

export function validateSchemaVersion(fileVersion: number): boolean {
  // Major version must match. Minor differences are additive and allowed.
  return Math.floor(fileVersion) === Math.floor(SCHEMA_VERSION)
}

// ----- data_json parsing (canonical source) -----

export function parseDataJson(
  dataJsonStr: string,
):
  | { snapshot: SnapshotState; goalsData: GoalsImportData }
  | ImportError {
  let raw: unknown
  try {
    raw = JSON.parse(dataJsonStr)
  } catch {
    return { code: 'DATA_JSON_PARSE', message: 'toast.import.error.notCermat' }
  }

  if (!raw || typeof raw !== 'object') {
    return { code: 'DATA_JSON_PARSE', message: 'toast.import.error.notCermat' }
  }

  const obj = raw as Record<string, unknown>

  // Parse snapshot
  const snapResult = snapshotSchema.safeParse(obj.snapshot)
  if (!snapResult.success) {
    return {
      code: 'DATA_JSON_PARSE',
      message: 'toast.import.error.snapshotFormat',
    }
  }

  // Parse goals (optional — old exports might not have them)
  let goalsData: GoalsImportData | undefined
  if (obj.goals && typeof obj.goals === 'object') {
    const goalsResult = goalsPayloadSchema.safeParse(obj.goals)
    if (goalsResult.success) {
      goalsData = {
        goals: goalsResult.data.goals as Goal[],
        assumedAnnualReturnReal: goalsResult.data.assumedAnnualReturnReal,
      }
    }
  }

  return {
    snapshot: snapResult.data as SnapshotState,
    goalsData: goalsData ?? { goals: [], assumedAnnualReturnReal: 0.05 },
  }
}

// ----- Goals sheet parsing (secondary — reads input fields only) -----

const GOALS_INPUT_COLS = 7

export function parseGoalsSheet(
  rows: unknown[][] | undefined,
): { goals: Goal[]; warnings: ImportWarning[] } {
  if (!rows || rows.length <= 1) {
    return { goals: [], warnings: [] }
  }

  const goals: Goal[] = []
  const warnings: ImportWarning[] = []

  // Skip header row
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.length < GOALS_INPUT_COLS) continue

    const goalId = String(row[0] ?? '')
    const rawKind = String(row[1] ?? 'CUSTOM')
    const goalType: GoalKind = (GOAL_KINDS as readonly string[]).includes(rawKind) ? rawKind as GoalKind : 'CUSTOM'
    const label = String(row[2] ?? '')
    const targetAmount = Number(row[3])
    const targetDate = String(row[4] ?? '')
    const fiMultiplier = row[5] // not used for import, informational
    const bucketJsonRaw = String(row[6] ?? '[]')

    if (!goalId || !label) continue

    let buckets: Goal['buckets']
    try {
      const parsed = JSON.parse(bucketJsonRaw)
      if (!Array.isArray(parsed)) {
        warnings.push({
          code: 'bucket_json_ref',
          detail: `Goal "${label}": bucket_json bukan array`,
        })
        continue
      }
      buckets = parsed.filter(
        (b: unknown): b is GoalBucketCategory => typeof b === 'string',
      )
    } catch {
      warnings.push({
        code: 'bucket_json_ref',
        detail: `Goal "${label}": bucket_json malformed`,
      })
      continue
    }

    goals.push({
      id: goalId,
      kind: goalType,
      label,
      targetIdr: Number.isFinite(targetAmount) ? targetAmount : 0,
      targetDate,
      buckets,
      // monthlyAllocationIdr is not in the Goals sheet input columns
    })

    // Consume fiMultiplier to avoid lint warning
    void fiMultiplier
  }

  return { goals, warnings }
}

// ----- Snapshot sheet validation (cross-check, not primary) -----

export function validateSnapshotSheet(
  rows: unknown[][] | undefined,
): ImportError | null {
  if (!rows || rows.length === 0) {
    return { code: 'NO_SNAPSHOT', message: 'toast.import.error.noSnapshot' }
  }
  // Check header row matches 8-column schema
  const header = rows[0]
  if (!header || header.length !== 8) {
    return {
      code: 'SNAPSHOT_FORMAT',
      message: 'toast.import.error.snapshotFormat',
    }
  }
  // Check that there is at least one data row
  if (rows.length <= 1) {
    return { code: 'EMPTY_SNAPSHOT', message: 'toast.import.error.empty' }
  }
  return null
}

// ----- main entry point -----

export async function parseImportFile(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  XLSX: any,
  file: File,
): Promise<ImportResult> {
  // 1. Validate file metadata
  const metaErr = validateFileMetadata(file)
  if (metaErr) return fail(metaErr.code, metaErr.message)

  // 2. Read file into workbook
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(new Uint8Array(buffer), { type: 'array', cellFormula: false })

  // 3. Extract _meta sheet
  const metaSheetName = wb.SheetNames.find(
    (n: string) => n.toLowerCase() === '_meta',
  )
  if (!metaSheetName) {
    return fail('NO_META', 'toast.import.error.notCermat')
  }
  const metaRows: unknown[][] = XLSX.utils.sheet_to_json(
    wb.Sheets[metaSheetName],
    { header: 1 },
  )
  const metaResult = extractMetaSheet(metaRows)
  if ('code' in metaResult) {
    return fail(metaResult.code, metaResult.message)
  }

  // 4. Validate schema version
  if (!validateSchemaVersion(metaResult.schemaVersion)) {
    return fail('SCHEMA_VERSION', 'toast.import.error.schemaVersion')
  }

  // 5. Validate Snapshot sheet presence (cross-check)
  const snapSheetName = wb.SheetNames.find((n: string) => n === 'Snapshot')
  if (snapSheetName) {
    const snapRows: unknown[][] = XLSX.utils.sheet_to_json(
      wb.Sheets[snapSheetName],
      { header: 1 },
    )
    const snapErr = validateSnapshotSheet(snapRows)
    if (snapErr) return fail(snapErr.code, snapErr.message)
  } else {
    return fail('NO_SNAPSHOT', 'toast.import.error.noSnapshot')
  }

  // 6. Parse data_json (canonical source)
  const dataResult = parseDataJson(metaResult.dataJson)
  if ('code' in dataResult) {
    return fail(dataResult.code, dataResult.message)
  }

  // 7. Parse Goals sheet (secondary, supplements data_json goals)
  const goalsSheetName = wb.SheetNames.find((n: string) => n === 'Goals')
  let goalsWarnings: ImportWarning[] = []
  if (goalsSheetName) {
    const goalsRows: unknown[][] = XLSX.utils.sheet_to_json(
      wb.Sheets[goalsSheetName],
      { header: 1 },
    )
    const goalsParsed = parseGoalsSheet(goalsRows)
    goalsWarnings = goalsParsed.warnings
    // If data_json didn't provide goals, use the Goals sheet as fallback
    if (dataResult.goalsData.goals.length === 0 && goalsParsed.goals.length > 0) {
      dataResult.goalsData = {
        goals: goalsParsed.goals,
        assumedAnnualReturnReal: 0.05,
      }
    }
  }

  return {
    ok: true,
    snapshot: dataResult.snapshot,
    goalsData: dataResult.goalsData,
    errors: [],
    warnings: goalsWarnings,
    skippedRows: 0,
  }
}
