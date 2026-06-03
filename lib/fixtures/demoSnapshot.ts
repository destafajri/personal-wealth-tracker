// Demo snapshot fixture — seeds the snapshot store with an anonymized persona
// "Rio, 32; karyawan UMR-range Jakarta dengan kos-kosan + freelance" so first-time
// visitors who click "Coba dengan data contoh" land on a fully populated dashboard.
// Numbers are intentionally rounded and NOT anyone's real holdings; composition
// mirrors a realistic profile: gaji UMR (6.5jt) + 2 sumber penghasilan tambahan,
// safe-haven dominant (cocok untuk profil "baru mulai investasi serius"), DSR
// ~25% (sehat), savings rate ~20%.
import type { useSnapshotStore } from '~/stores/snapshot'

type SnapshotStore = ReturnType<typeof useSnapshotStore>

export function applyDemoSnapshot(snap: SnapshotStore): void {
  snap.reset()

  // ----- Penghasilan + Pengeluaran -----
  // Gaji bersih 6.5jt (kisaran UMR Jakarta 2026) + freelance + sewa kos 1 kamar.
  snap.setPenghasilanAmount(6_500_000)
  snap.setPenghasilanCurrency('IDR')
  snap.addPenghasilanLain({ label: 'Freelance design', amount: 1_500_000, currency: 'IDR' })
  snap.addPenghasilanLain({ label: 'Sewa kos (1 kamar)', amount: 800_000, currency: 'IDR' })
  snap.setPengeluaran({ pokok: 3_500_000, lifestyle: 1_200_000 })

  // ----- Aset Likuid -----
  snap.addLikuid('kas', { label: 'BCA', amount: 2_500_000 })
  snap.addLikuid('kas', { label: 'Jenius', amount: 800_000 })
  snap.addLikuid('deposito', {
    label: 'Deposito BCA 12bln',
    amount: 8_000_000,
    sukuBungaPercent: 4.25,
  })
  // Reksa Dana — 3 jenis untuk menunjukkan klasifikasi Safe Haven vs growth:
  // pasarUang + pendapatanTetap = Safe Haven; campuran = growth-oriented.
  snap.addLikuid('reksaDana', {
    label: 'Mandiri Pasar Uang',
    amount: 5_000_000,
    rdJenis: 'pasarUang',
  })
  snap.addLikuid('reksaDana', {
    label: 'Schroder Dana Mantap Plus II',
    amount: 4_000_000,
    rdJenis: 'pendapatanTetap',
  })
  snap.addLikuid('reksaDana', {
    label: 'BNP Paribas Pesona',
    amount: 2_000_000,
    rdJenis: 'campuran',
  })
  // SBN — 2 row dengan kupon berbeda biar nampak variasi yield.
  snap.addLikuid('sbn', { label: 'SBR013', amount: 5_000_000, sukuBungaPercent: 6.5 })
  snap.addLikuid('sbn', { label: 'ORI022', amount: 3_000_000, sukuBungaPercent: 5.75 })

  // ----- Aset Non-Likuid -----
  // Rumah Bekasi (kisaran beli rumah subsidi/semi-komersial) — cocok untuk profil
  // UMR yang nyicil KPR. Pensiun: BPJS-TK + DPLK kecil-kecilan.
  snap.addNonLikuid('properti', { label: 'Rumah Bekasi', amount: 280_000_000 })
  snap.addNonLikuid('kendaraan', { label: 'Motor Vario', amount: 22_000_000 })
  snap.addNonLikuid('pensiun', { label: 'BPJS Ketenagakerjaan', amount: 12_000_000 })
  snap.addNonLikuid('pensiun', { label: 'DPLK Mandiri', amount: 6_000_000 })

  // ----- Emas (gram "di rumah" — yang tergadai dihitung di gadai[]) -----
  snap.setEmas({
    digitalGram: 3,
    fisikAntamGram: 8,
    perhiasan18KGram: 5,
    perhiasan14KGram: 0,
    perhiasan10KGram: 0,
  })

  // ----- Saham (11 emiten) -----
  // hargaRataRata dipasang ~15% di bawah harga live khas pertengahan 2026 supaya
  // kartu nampak unrealized gain yang masuk akal. Dividend mode dicampur sengaja
  // untuk showcase: sebagian pakai avgDividendYieldPercent (estimasi yield), sebagian
  // pakai lastDividendPerLembar (literal rupiah/lembar — wins di compute precedence).
  // Last-dividend values diambil dari catatan historis publik (Stockbit/RTI), bukan
  // angka pribadi. UNTR di-drop karena lot terkecilnya (~2.1jt) terlalu mahal untuk
  // profil UMR.
  type DivInput =
    | { kind: 'yield'; value: number }
    | { kind: 'last'; value: number }
  const saham: Array<{
    ticker: string
    lot: number
    avg: number
    target: number
    div: DivInput
  }> = [
    { ticker: 'BBRI', lot: 400, avg: 2500, target: 500, div: { kind: 'last', value: 340 } },
    { ticker: 'BMRI', lot: 350, avg: 3500, target: 400, div: { kind: 'yield', value: 7.5 } },
    { ticker: 'BBCA', lot: 100, avg: 4800, target: 150, div: { kind: 'last', value: 330 } },
    { ticker: 'ASII', lot: 2, avg: 4100, target: 8, div: { kind: 'yield', value: 6.0 } },
    { ticker: 'BBNI', lot: 2, avg: 3100, target: 8, div: { kind: 'yield', value: 6.4 } },
    { ticker: 'ADRO', lot: 5, avg: 1900, target: 15, div: { kind: 'yield', value: 7.0 } },
    { ticker: 'TLKM', lot: 3, avg: 2500, target: 10, div: { kind: 'yield', value: 5.7 } },
    { ticker: 'SIDO', lot: 30, avg: 320, target: 150, div: { kind: 'yield', value: 6.0 } },
    { ticker: 'PTBA', lot: 5, avg: 2300, target: 15, div: { kind: 'last', value: 330 } },
    { ticker: 'PGAS', lot: 5, avg: 1500, target: 15, div: { kind: 'yield', value: 8.0 } },
    { ticker: 'BNGA', lot: 10, avg: 1400, target: 30, div: { kind: 'last', value: 160 } },
  ]
  for (const s of saham) {
    snap.addSaham({
      ticker: s.ticker,
      lot: s.lot,
      hargaRataRata: s.avg,
      lotsTarget: s.target,
      ...(s.div.kind === 'yield'
        ? { avgDividendYieldPercent: s.div.value }
        : { lastDividendPerLembar: s.div.value }),
    })
  }

  // ----- Crypto -----
  // Labels generic (drop exchange brand). BTC in unit mode shows live valuasi via
  // CoinGecko; ETH in idr mode is a manual IDR override — together they showcase
  // 2 of the 4 input modes the panel supports.
  snap.addCrypto({
    coinId: 'bitcoin',
    mode: 'unit',
    units: 0.005,
    label: 'BTC cold wallet',
    costBasisPerUnit: 60_000,
    costBasisCurrency: 'USD',
  })
  snap.addCrypto({
    coinId: 'ethereum',
    mode: 'idr',
    units: 0,
    amount: 2_400_000,
    label: 'ETH',
  })

  // ----- Cicilan aktif -----
  // KPR 200jt sisa, 20 tahun, 6.5%/thn anuitas → cicilan ~1.5jt/bln.
  snap.addCicilan({
    tipe: 'KPR',
    label: 'KPR BTN Rumah Bekasi',
    sisaPokok: 200_000_000,
    cicilanPerBulan: 1_500_000,
    sukuBunga: 6.5,
    tenorSisaBulan: 240,
    jenisBunga: 'Anuitas',
  })
  snap.addCicilan({
    tipe: 'KK',
    label: 'Kartu Kredit Mandiri',
    sisaPokok: 1_500_000,
    cicilanPerBulan: 300_000,
    sukuBunga: 26,
    jenisBunga: 'Revolving',
  })

  // ----- Utang pribadi -----
  snap.addUtangPribadi({
    label: 'Pinjam ke kakak',
    sisaPokok: 2_500_000,
    cicilanPerBulan: 250_000,
    tempoBulan: 10,
  })

  // ----- Gadai emas -----
  snap.addGadai({
    label: 'Gadai emas Pegadaian',
    jaminan: 'emas:fisikAntam',
    gramTertahan: 5,
    piutangIdr: 10_000_000,
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
