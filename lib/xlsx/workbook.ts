// Workbook assembly — single source of truth for sheet order, naming, and
// hidden flags. Both the production composable and the round-trip integration
// test consume this helper so they can't drift (a Codex review caught the
// original drift risk when the test maintained its own copy of the assembly
// logic).
//
// XLSX is injected as a parameter so callers control how they obtain the
// module — composables/useXlsx.ts uses `await import('xlsx')` to keep the
// ~700KB SheetJS payload out of the initial bundle; the test imports it
// statically. `import type` here doesn't generate a runtime require, so this
// file stays bundle-split-friendly.
import type * as XLSXType from 'xlsx'

import {
  buildCicilanAktif,
  buildGoals,
  buildMeta,
  buildPerEmiten,
  buildRingkasan,
  buildSnapshot,
  type XlsxContext,
} from '~/lib/xlsx/sheets'

export function buildWorkbook(
  ctx: XlsxContext,
  XLSX: typeof XLSXType,
): XLSXType.WorkBook {
  const wb = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(buildRingkasan(ctx)),
    'Ringkasan',
  )
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(buildSnapshot(ctx.snap, ctx.prices)),
    'Snapshot',
  )
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(buildPerEmiten(ctx.snap.saham, ctx.prices)),
    'Per-Emiten',
  )
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(buildCicilanAktif(ctx.snap.cicilanAktif)),
    'Cicilan-Aktif',
  )
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(
      buildGoals(ctx.goals, ctx.snap, {
        fiMultiplier: ctx.fiMultiplier,
        annualReturnReal: ctx.annualReturnReal,
        prices: ctx.prices,
      }),
    ),
    'Goals',
  )
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(buildMeta(ctx)),
    '_meta',
  )

  // Mark _meta hidden. SheetJS reads Workbook.Sheets[i].Hidden when writing —
  // 1 = "hidden" (Excel-style), 2 = "very hidden" (unhidable from UI). Use 1
  // so power users can unhide for inspection if curious.
  const metaIdx = wb.SheetNames.indexOf('_meta')
  if (metaIdx >= 0) {
    wb.Workbook = wb.Workbook ?? { Sheets: [] }
    wb.Workbook.Sheets = wb.Workbook.Sheets ?? []
    wb.Workbook.Sheets[metaIdx] = {
      ...wb.Workbook.Sheets[metaIdx],
      Hidden: 1,
    }
  }

  return wb
}
