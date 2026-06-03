// Demo snapshot fixture — seeds the snapshot store with an anonymized, rounded
// persona ("Rio, 32; Jakarta; karyawan mid-senior + freelance") so first-time
// visitors who click "Coba dengan data contoh" land on a fully populated
// dashboard. Numbers are intentionally rounded and NOT anyone's real holdings;
// composition mirrors a realistic Safe Haven ~50/50 profile.
import type { useSnapshotStore } from '~/stores/snapshot'

type SnapshotStore = ReturnType<typeof useSnapshotStore>

export function applyDemoSnapshot(snap: SnapshotStore): void {
  snap.reset()

  // ----- Penghasilan + Pengeluaran -----
  snap.setPenghasilanAmount(18_000_000)
  snap.setPenghasilanCurrency('IDR')
  snap.addPenghasilanLain({ label: 'Freelance design', amount: 2_000_000, currency: 'IDR' })
  snap.setPengeluaran({ pokok: 5_500_000, lifestyle: 2_000_000 })

  // ----- Aset Likuid -----
  snap.addLikuid('kas', { label: 'BCA', amount: 6_000_000 })
  snap.addLikuid('kas', { label: 'Jenius', amount: 2_500_000 })
  snap.addLikuid('deposito', { label: 'Deposito BCA 12bln', amount: 30_000_000, sukuBungaPercent: 4.25 })
  snap.addLikuid('reksaDana', {
    label: 'Mandiri Pasar Uang',
    amount: 25_000_000,
    rdJenis: 'pasarUang',
  })
  snap.addLikuid('reksaDana', {
    label: 'Schroder Dana Mantap Plus II',
    amount: 15_000_000,
    rdJenis: 'pendapatanTetap',
  })
  snap.addLikuid('sbn', { label: 'SBR013', amount: 20_000_000, sukuBungaPercent: 6.5 })

  // ----- Aset Non-Likuid -----
  snap.addNonLikuid('properti', { label: 'Rumah Depok', amount: 750_000_000 })
  snap.addNonLikuid('kendaraan', { label: 'Motor Vario', amount: 22_000_000 })
  snap.addNonLikuid('pensiun', { label: 'BPJS Ketenagakerjaan', amount: 35_000_000 })
  snap.addNonLikuid('pensiun', { label: 'DPLK Mandiri', amount: 18_000_000 })

  // ----- Emas (gram "di rumah" — yang tergadai dihitung di gadai[]) -----
  snap.setEmas({
    digitalGram: 8,
    fisikAntamGram: 30,
    perhiasan18KGram: 15,
    perhiasan14KGram: 0,
    perhiasan10KGram: 0,
  })

  // ----- Saham (12 emiten — subset dari list IDX populer, lot dibulatkan) -----
  // hargaRataRata dipasang ~15% di bawah harga live khas pertengahan 2026 supaya
  // kartu nampak unrealized gain yang masuk akal. Dividend yield % dari catatan
  // historis publik (Stockbit/RTI), bukan angka pribadi.
  const saham: Array<{
    ticker: string
    lot: number
    avg: number
    target: number
    divYield: number
  }> = [
    { ticker: 'BBRI', lot: 100, avg: 2500, target: 250, divYield: 8.6 },
    { ticker: 'BMRI', lot: 60, avg: 3500, target: 200, divYield: 7.5 },
    { ticker: 'BBCA', lot: 15, avg: 4800, target: 100, divYield: 3.75 },
    { ticker: 'ASII', lot: 10, avg: 4100, target: 50, divYield: 6.0 },
    { ticker: 'BBNI', lot: 10, avg: 3100, target: 50, divYield: 6.4 },
    { ticker: 'ADRO', lot: 10, avg: 1900, target: 30, divYield: 7.0 },
    { ticker: 'TLKM', lot: 5, avg: 2500, target: 25, divYield: 5.7 },
    { ticker: 'SIDO', lot: 50, avg: 320, target: 200, divYield: 6.0 },
    { ticker: 'UNTR', lot: 2, avg: 18500, target: 5, divYield: 6.0 },
    { ticker: 'PTBA', lot: 10, avg: 2300, target: 30, divYield: 10.0 },
    { ticker: 'PGAS', lot: 10, avg: 1500, target: 30, divYield: 8.0 },
    { ticker: 'BNGA', lot: 20, avg: 1400, target: 100, divYield: 7.5 },
  ]
  for (const s of saham) {
    snap.addSaham({
      ticker: s.ticker,
      lot: s.lot,
      hargaRataRata: s.avg,
      lotsTarget: s.target,
      avgDividendYieldPercent: s.divYield,
    })
  }

  // ----- Crypto (live by unit) -----
  snap.addCrypto({
    coinId: 'bitcoin',
    mode: 'unit',
    units: 0.05,
    label: 'BTC di Indodax',
    costBasisPerUnit: 60_000,
    costBasisCurrency: 'USD',
  })
  snap.addCrypto({
    coinId: 'ethereum',
    mode: 'unit',
    units: 0.5,
    label: 'ETH di Tokocrypto',
    costBasisPerUnit: 3_000,
    costBasisCurrency: 'USD',
  })

  // ----- Cicilan aktif -----
  // KPR 300jt sisa, 18 tahun, 6.5%/thn anuitas → cicilan ~2.3jt/bln.
  snap.addCicilan({
    tipe: 'KPR',
    label: 'KPR BTN Rumah Depok',
    sisaPokok: 300_000_000,
    cicilanPerBulan: 2_300_000,
    sukuBunga: 6.5,
    tenorSisaBulan: 216,
    jenisBunga: 'Anuitas',
  })
  snap.addCicilan({
    tipe: 'KK',
    label: 'Kartu Kredit Mandiri',
    sisaPokok: 3_000_000,
    cicilanPerBulan: 500_000,
    sukuBunga: 26,
    jenisBunga: 'Revolving',
  })

  // ----- Utang pribadi -----
  snap.addUtangPribadi({
    label: 'Pinjam ke kakak',
    sisaPokok: 5_000_000,
    cicilanPerBulan: 500_000,
    tempoBulan: 10,
  })

  // ----- Gadai emas -----
  snap.addGadai({
    label: 'Gadai emas Pegadaian',
    jaminan: 'emas:fisikAntam',
    gramTertahan: 12,
    piutangIdr: 20_000_000,
    bungaPerBulanPercent: 1.5,
    tempoBulan: 4,
  })

  snap.setDemo(true)
}

// Minimal subset of vue-router's RouteLocationNormalized + Router so the helper
// is testable without pulling in a fake router. The page passes `useRoute()`
// and `useRouter()` straight through; tests pass plain mocks. Value type must
// match vue-router's LocationQuery exactly (string | null, possibly arrayed)
// — narrower won't accept the real `useRoute().query`.
type DemoQueryValue = string | null
type DemoQuery = Record<string, DemoQueryValue | DemoQueryValue[]>
interface DemoRouteLike {
  query: DemoQuery
}
interface DemoRouterLike {
  replace(loc: { query: DemoQuery }): unknown
}

// Glue between snapshot.vue's onMounted and applyDemoSnapshot. Lives here (not in
// the page) so we can unit-test the trigger + URL-cleanup behavior without
// mounting the page or wiring Nuxt's auto-imports. The page is then a thin
// 1-line delegate — if the helper test passes and the page calls it, behavior
// is covered. Returns true if a seed was applied (useful in tests).
export function triggerDemoFromQuery(
  snap: SnapshotStore,
  route: DemoRouteLike,
  router: DemoRouterLike,
): boolean {
  if (route.query.demo !== '1') return false
  applyDemoSnapshot(snap)
  const { demo: _demo, ...rest } = route.query
  router.replace({ query: rest })
  return true
}
