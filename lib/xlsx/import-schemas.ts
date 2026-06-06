import { z } from 'zod'

const currencySchema = z.enum(['IDR', 'USD', 'SGD', 'EUR', 'JPY', 'KRW'])

const assetRowSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    amount: z.number(),
    currency: currencySchema.optional(),
    sukuBungaPercent: z.number().optional(),
    rdJenis: z
      .enum([
        'pasarUang',
        'pendapatanTetap',
        'campuran',
        'saham',
        'indeks',
        'lain',
      ])
      .optional(),
  })
  .passthrough()

const penghasilanGajiSchema = z.object({
  amount: z.number(),
  currency: currencySchema,
})

const pengeluaranSchema = z
  .object({
    pokok: z.number(),
    pokokCurrency: currencySchema,
    lifestyle: z.number(),
    lifestyleCurrency: currencySchema,
    biayaKos: z.number().optional(),
    biayaKosCurrency: currencySchema.optional(),
  })
  .passthrough()

const emasStateSchema = z
  .object({
    digitalGram: z.number(),
    fisikAntamGram: z.number(),
    perhiasan18KGram: z.number(),
    perhiasan14KGram: z.number(),
    perhiasan10KGram: z.number(),
  })
  .passthrough()

const stockHoldingSchema = z
  .object({
    id: z.string(),
    ticker: z.string(),
    lot: z.number(),
    hargaRataRata: z.number(),
    bobotTargetPercent: z.number().optional(),
    lotsTarget: z.number().optional(),
    hargaOverride: z.number().optional(),
    lastDividendPerLembar: z.number().optional(),
    avgDividendYieldPercent: z.number().optional(),
  })
  .passthrough()

const cryptoModeSchema = z.enum(['unit', 'idr', 'usd', 'krw'])

const cryptoHoldingSchema = z
  .object({
    id: z.string(),
    coinId: z.string(),
    mode: cryptoModeSchema,
    units: z.number(),
    amount: z.number(),
    label: z.string().optional(),
    costBasisPerUnit: z.number().optional(),
    costBasisCurrency: currencySchema.optional(),
  })
  .passthrough()

const cicilanRowSchema = z
  .object({
    id: z.string(),
    tipe: z.string(),
    label: z.string(),
    sisaPokok: z.number(),
    cicilanPerBulan: z.number(),
    sukuBunga: z.number().optional(),
    tenorSisaBulan: z.number().optional(),
    jenisBunga: z.string(),
    tanggalJatuhTempo: z.string().optional(),
  })
  .passthrough()

const utangPribadiRowSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    sisaPokok: z.number(),
    cicilanPerBulan: z.number().optional(),
    tempoBulan: z.number().optional(),
    tanggalJatuhTempo: z.string().optional(),
  })
  .passthrough()

const gadaiRowSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    jaminan: z.string(),
    gramTertahan: z.number().optional(),
    asetRefId: z.string().optional(),
    piutangIdr: z.number(),
    bungaPerBulanPercent: z.number(),
    tempoBulan: z.number(),
    tanggalJatuhTempo: z.string().optional(),
  })
  .passthrough()

export const snapshotSchema = z
  .object({
    penghasilan: penghasilanGajiSchema,
    penghasilanLain: z.array(assetRowSchema),
    pengeluaran: pengeluaranSchema,
    pengeluaranLain: z.array(assetRowSchema),
    asetLikuid: z.object({
      kas: z.array(assetRowSchema),
      deposito: z.array(assetRowSchema),
      reksaDana: z.array(assetRowSchema),
      sbn: z.array(assetRowSchema),
    }),
    asetNonLikuid: z.object({
      properti: z.array(assetRowSchema),
      kendaraan: z.array(assetRowSchema),
      pensiun: z.array(assetRowSchema),
    }),
    emas: emasStateSchema,
    saham: z.array(stockHoldingSchema),
    crypto: z.array(cryptoHoldingSchema),
    cicilanAktif: z.array(cicilanRowSchema),
    utangPribadi: z.array(utangPribadiRowSchema),
    gadai: z.array(gadaiRowSchema),
  })
  .passthrough()

const goalBucketCategorySchema = z.enum([
  'kas',
  'deposito',
  'reksaDana',
  'sbn',
  'saham',
  'crypto',
  'emas',
  'properti',
  'kendaraan',
  'pensiun',
])

const goalSchema = z
  .object({
    id: z.string(),
    kind: z.enum(['FI', 'DP_RUMAH', 'DANA_PENDIDIKAN', 'CUSTOM']),
    label: z.string(),
    targetIdr: z.number(),
    targetDate: z.string(),
    buckets: z.array(goalBucketCategorySchema),
    monthlyAllocationIdr: z.number().optional(),
  })
  .passthrough()

export const goalsPayloadSchema = z.object({
  goals: z.array(goalSchema),
  assumedAnnualReturnReal: z.number(),
  fiMultiplier: z.number(),
})
