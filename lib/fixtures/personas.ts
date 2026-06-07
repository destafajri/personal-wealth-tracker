import type { useSnapshotStore } from '~/stores/snapshot'
import type { SnapshotState } from '~/lib/types/snapshot'

type SnapshotStore = ReturnType<typeof useSnapshotStore>

export interface SamplePersona {
  id: string
  nama: string
  emoji: string
  mode: 'wealthTracker' | 'budgetKos'
  blurb: string
  apply: (snap: SnapshotStore) => void
}

// ---------- #1 Mahasiswa Pas-pasan (budget-kos) ----------
const mahasiswaPasPasan: SamplePersona = {
  id: 'mahasiswa-pas-pasan',
  nama: 'Mahasiswa Pas-pasan',
  emoji: '🎓',
  mode: 'budgetKos',
  blurb: 'Kiriman ortu tipis, akhir bulan ngos-ngosan',
  apply(snap) {
    snap.reset()
    snap.mode = 'budgetKos' as any
    snap.setPenghasilanAmount(1_500_000)
    snap.setPenghasilanCurrency('IDR')
    snap.addPenghasilanLain({ label: 'Part-time kafe', amount: 800_000, currency: 'IDR' })
    snap.setPengeluaran({
      biayaKos: 800_000,
      biayaKosCurrency: 'IDR',
      pokok: 1_000_000,
      lifestyle: 300_000,
    })
    snap.addCicilan({
      tipe: 'PAYLATER',
      label: 'Cicilan Laptop',
      sisaPokok: 1_500_000,
      cicilanPerBulan: 200_000,
      sukuBunga: 12,
      tenorSisaBulan: 8,
      jenisBunga: 'Flat',
    })
    snap.addLikuid('kas', { label: 'GoPay', amount: 150_000 })
    snap.addLikuid('kas', { label: 'Dana', amount: 350_000 })
    snap.setDemo(true)
  },
}

// ---------- #2 Mahasiswa Mandiri (budget-kos) ----------
const mahasiswaMandiri: SamplePersona = {
  id: 'mahasiswa-mandiri',
  nama: 'Mahasiswa Mandiri',
  emoji: '💪',
  mode: 'budgetKos',
  blurb: 'Self-funded, disiplin, surplus sehat',
  apply(snap) {
    snap.reset()
    snap.mode = 'budgetKos' as any
    snap.setPenghasilanAmount(0)
    snap.setPenghasilanCurrency('IDR')
    snap.addPenghasilanLain({ label: 'Freelance design', amount: 1_800_000, currency: 'IDR' })
    snap.addPenghasilanLain({ label: 'Tutor les', amount: 1_200_000, currency: 'IDR' })
    snap.setPengeluaran({
      biayaKos: 700_000,
      biayaKosCurrency: 'IDR',
      pokok: 1_200_000,
      lifestyle: 400_000,
    })
    snap.addLikuid('kas', { label: 'BCA', amount: 3_000_000 })
    snap.addLikuid('kas', { label: 'GoPay', amount: 2_000_000 })
    snap.addLikuid('reksaDana', { label: 'RD Pasar Uang', amount: 1_000_000, rdJenis: 'pasarUang' })
    snap.setDemo(true)
  },
}

// ---------- #3 Mahasiswa Sultan (wealth-tracker) ----------
const mahasiswaSultan: SamplePersona = {
  id: 'mahasiswa-sultan',
  nama: 'Mahasiswa Sultan',
  emoji: '🃏',
  mode: 'wealthTracker',
  blurb: 'Anak konglo, duit numpuk, nol literasi keuangan',
  apply(snap) {
    snap.reset()
    snap.setPenghasilanAmount(15_000_000)
    snap.setPenghasilanCurrency('IDR')
    snap.setPengeluaran({ pokok: 3_500_000, lifestyle: 10_500_000 })
    // No debt, no investments — cash piles up
    snap.addLikuid('kas', { label: 'BCA', amount: 40_000_000 })
    snap.addLikuid('kas', { label: 'GoPay', amount: 20_000_000 })
    snap.setDemo(true)
  },
}

// ---------- #4 Korban Judol (wealth-tracker) ----------
const korbanJudol: SamplePersona = {
  id: 'korban-judol',
  nama: 'Korban Judol',
  emoji: '🎰',
  mode: 'wealthTracker',
  blurb: 'DSR sehat, tapi Sankey bongkar kebocoran',
  apply(snap) {
    snap.reset()
    snap.setPenghasilanAmount(6_000_000)
    snap.setPenghasilanCurrency('IDR')
    snap.addPenghasilanLain({ label: 'Sampingan', amount: 2_000_000, currency: 'IDR' })
    snap.setPengeluaran({ pokok: 2_500_000, lifestyle: 1_000_000 })
    snap.addPengeluaranLain({ label: 'Top-up / Hobi Online', amount: 4_000_000 })
    snap.addCicilan({
      tipe: 'PINJOL',
      label: 'Pinjol A',
      sisaPokok: 8_000_000,
      cicilanPerBulan: 900_000,
      sukuBunga: 36,
      tenorSisaBulan: 12,
      jenisBunga: 'Flat',
    })
    snap.addCicilan({
      tipe: 'PINJOL',
      label: 'Pinjol B',
      sisaPokok: 7_000_000,
      cicilanPerBulan: 600_000,
      sukuBunga: 30,
      tenorSisaBulan: 15,
      jenisBunga: 'Flat',
    })
    snap.addLikuid('kas', { label: 'BCA', amount: 1_000_000 })
    snap.addSaham({ ticker: 'BBRI', lot: 2, hargaRataRata: 4500 })
    snap.setDemo(true)
  },
}

// ---------- #5 Terjebak Cicilan (wealth-tracker) ----------
const terjebakCicilan: SamplePersona = {
  id: 'terjebak-cicilan',
  nama: 'Terjebak Cicilan',
  emoji: '⛓️',
  mode: 'wealthTracker',
  blurb: 'Paylater numpuk, Sankey defisit merah total',
  apply(snap) {
    snap.reset()
    snap.setPenghasilanAmount(3_500_000)
    snap.setPenghasilanCurrency('IDR')
    snap.addPenghasilanLain({ label: 'Sampingan', amount: 500_000, currency: 'IDR' })
    snap.setPengeluaran({ pokok: 2_500_000, lifestyle: 1_000_000 })
    snap.addCicilan({
      tipe: 'PAYLATER',
      label: 'Shopee PayLater',
      sisaPokok: 1_200_000,
      cicilanPerBulan: 400_000,
      sukuBunga: 15,
      tenorSisaBulan: 3,
      jenisBunga: 'Flat',
    })
    snap.addCicilan({
      tipe: 'PINJOL',
      label: 'Pinjol X',
      sisaPokok: 4_000_000,
      cicilanPerBulan: 900_000,
      sukuBunga: 36,
      tenorSisaBulan: 6,
      jenisBunga: 'Flat',
    })
    snap.addCicilan({
      tipe: 'BANK_KTA',
      label: 'KTA Bank',
      sisaPokok: 4_300_000,
      cicilanPerBulan: 800_000,
      sukuBunga: 18,
      tenorSisaBulan: 6,
      jenisBunga: 'Flat',
    })
    snap.addLikuid('kas', { label: 'GoPay', amount: 350_000 })
    snap.addLikuid('kas', { label: 'BCA', amount: 800_000 })
    snap.setDemo(true)
  },
}

// ---------- #6 Pegawai Muda + KPR (wealth-tracker) — flagship ----------
const pegawaiMudaKpr: SamplePersona = {
  id: 'pegawai-muda-kpr',
  nama: 'Pegawai Muda + KPR',
  emoji: '💼',
  mode: 'wealthTracker',
  blurb: 'Balanced, flagship — Hutan tier',
  apply(snap) {
    snap.reset()
    snap.setPenghasilanAmount(6_500_000)
    snap.setPenghasilanCurrency('IDR')
    snap.addPenghasilanLain({ label: 'Freelance design', amount: 1_500_000, currency: 'IDR' })
    snap.addPenghasilanLain({ label: 'Sewa kos (1 kamar)', amount: 800_000, currency: 'IDR' })
    snap.setPengeluaran({ pokok: 3_500_000, lifestyle: 1_200_000 })
    snap.addLikuid('kas', { label: 'BCA', amount: 2_500_000 })
    snap.addLikuid('kas', { label: 'Jenius', amount: 800_000 })
    snap.addLikuid('deposito', { label: 'Deposito BCA 12bln', amount: 8_000_000, sukuBungaPercent: 4.25 })
    snap.addLikuid('reksaDana', { label: 'Mandiri Pasar Uang', amount: 5_000_000, rdJenis: 'pasarUang' })
    snap.addLikuid('reksaDana', { label: 'Schroder Dana Mantap Plus II', amount: 4_000_000, rdJenis: 'pendapatanTetap' })
    snap.addLikuid('reksaDana', { label: 'BNP Paribas Pesona', amount: 2_000_000, rdJenis: 'campuran' })
    snap.addLikuid('sbn', { label: 'SBR013', amount: 5_000_000, sukuBungaPercent: 6.5 })
    snap.addLikuid('sbn', { label: 'ORI022', amount: 3_000_000, sukuBungaPercent: 5.75 })
    snap.addNonLikuid('properti', { label: 'Rumah Bekasi', amount: 280_000_000 })
    snap.addNonLikuid('kendaraan', { label: 'Motor Vario', amount: 22_000_000 })
    snap.addNonLikuid('pensiun', { label: 'BPJS Ketenagakerjaan', amount: 12_000_000 })
    snap.addNonLikuid('pensiun', { label: 'DPLK Mandiri', amount: 6_000_000 })
    snap.setEmas({ digitalGram: 3, fisikAntamGram: 8, perhiasan18KGram: 5, perhiasan14KGram: 0, perhiasan10KGram: 0 })
    // Simplified stock holdings
    const saham = [
      { ticker: 'BBRI', lot: 400, avg: 2500, target: 500 },
      { ticker: 'BMRI', lot: 350, avg: 3500, target: 400 },
      { ticker: 'BBCA', lot: 100, avg: 4800, target: 150 },
      { ticker: 'TLKM', lot: 3, avg: 2500, target: 10 },
      { ticker: 'ASII', lot: 2, avg: 4100, target: 8 },
    ]
    for (const s of saham) {
      snap.addSaham({ ticker: s.ticker, lot: s.lot, hargaRataRata: s.avg, lotsTarget: s.target })
    }
    snap.addCrypto({ coinId: 'bitcoin', mode: 'unit', units: 0.005, label: 'BTC', costBasisPerUnit: 60_000, costBasisCurrency: 'USD' })
    snap.addCrypto({ coinId: 'ethereum', mode: 'idr', units: 0, amount: 2_400_000, label: 'ETH' })
    snap.addCicilan({
      tipe: 'KPR', label: 'KPR BTN Rumah Bekasi',
      sisaPokok: 200_000_000, cicilanPerBulan: 1_500_000, sukuBunga: 6.5, tenorSisaBulan: 240, jenisBunga: 'Anuitas',
    })
    snap.addCicilan({
      tipe: 'KK', label: 'Kartu Kredit Mandiri',
      sisaPokok: 1_500_000, cicilanPerBulan: 300_000, sukuBunga: 26, jenisBunga: 'Revolving',
    })
    snap.addUtangPribadi({ label: 'Pinjam ke kakak', sisaPokok: 2_500_000, cicilanPerBulan: 250_000, tempoBulan: 10 })
    snap.addGadai({
      label: 'Gadai emas Pegadaian', jaminan: 'emas:fisikAntam',
      gramTertahan: 5, piutangIdr: 10_000_000, bungaPerBulanPercent: 1.5, tempoBulan: 4,
    })
    snap.setDemo(true)
  },
}

// ---------- #7 Freelancer Bebas Utang (wealth-tracker) ----------
const freelancerBebasUtang: SamplePersona = {
  id: 'freelancer-bebas-utang',
  nama: 'Freelancer Bebas Utang',
  emoji: '🎨',
  mode: 'wealthTracker',
  blurb: 'Tanpa utang sama sekali — null-handling proof',
  apply(snap) {
    snap.reset()
    snap.setPenghasilanAmount(0)
    snap.setPenghasilanCurrency('IDR')
    snap.addPenghasilanLain({ label: 'Freelance UI/UX', amount: 6_000_000, currency: 'IDR' })
    snap.setPengeluaran({ pokok: 3_500_000, lifestyle: 1_500_000 })
    snap.addLikuid('kas', { label: 'BCA', amount: 15_000_000 })
    snap.addSaham({ ticker: 'BBRI', lot: 10, hargaRataRata: 4500 })
    snap.addSaham({ ticker: 'BMRI', lot: 8, hargaRataRata: 5500 })
    snap.addCrypto({ coinId: 'bitcoin', mode: 'idr', units: 0, amount: 10_000_000, label: 'BTC' })
    snap.addLikuid('reksaDana', { label: 'RD Campuran', amount: 10_000_000, rdJenis: 'campuran' })
    // No debt at all — DSR/DAR null → full points
    snap.setDemo(true)
  },
}

// ---------- #8 Juragan Kos (wealth-tracker) ----------
const juraganKos: SamplePersona = {
  id: 'juragan-kos',
  nama: 'Juragan Kos',
  emoji: '🏠',
  mode: 'wealthTracker',
  blurb: 'Hutan tapi Safe Haven + Alloc merah — kekayaan beku',
  apply(snap) {
    snap.reset()
    snap.setPenghasilanAmount(5_000_000)
    snap.setPenghasilanCurrency('IDR')
    snap.addPenghasilanLain({ label: 'Sewa kos 20 kamar', amount: 25_000_000, currency: 'IDR' })
    snap.setPengeluaran({ pokok: 5_000_000, lifestyle: 5_000_000 })
    snap.addCicilan({
      tipe: 'KPR', label: 'KPR Kos',
      sisaPokok: 500_000_000, cicilanPerBulan: 5_000_000, sukuBunga: 7, tenorSisaBulan: 180, jenisBunga: 'Anuitas',
    })
    snap.addLikuid('kas', { label: 'BCA', amount: 20_000_000 })
    // Heavy stock allocation — very concentrated
    const saham = [
      { ticker: 'BBRI', lot: 200, avg: 4500, target: 100 },
      { ticker: 'BMRI', lot: 150, avg: 5500, target: 50 },
      { ticker: 'BBCA', lot: 80, avg: 9000, target: 300 },
      { ticker: 'TLKM', lot: 50, avg: 3000, target: 20 },
    ]
    for (const s of saham) {
      snap.addSaham({ ticker: s.ticker, lot: s.lot, hargaRataRata: s.avg, lotsTarget: s.target })
    }
    snap.addCrypto({ coinId: 'ethereum', mode: 'idr', units: 0, amount: 50_000_000, label: 'ETH' })
    snap.addLikuid('reksaDana', { label: 'RD Campuran', amount: 50_000_000, rdJenis: 'campuran' })
    snap.addNonLikuid('properti', { label: 'Bangunan Kos', amount: 3_000_000_000 })
    snap.setDemo(true)
  },
}

// ---------- #9 Pensiunan Mapan (wealth-tracker) ----------
const pensiunanMapan: SamplePersona = {
  id: 'pensiunan-mapan',
  nama: 'Pensiunan Mapan',
  emoji: '🧓',
  mode: 'wealthTracker',
  blurb: 'Diversifikasi sempurna — near-perfect ~975',
  apply(snap) {
    snap.reset()
    snap.setPenghasilanAmount(5_000_000)
    snap.setPenghasilanCurrency('IDR')
    snap.addPenghasilanLain({ label: 'Dividen saham', amount: 12_000_000, currency: 'IDR' })
    snap.addPenghasilanLain({ label: 'Bunga deposito+SBN', amount: 8_000_000, currency: 'IDR' })
    snap.setPengeluaran({ pokok: 8_000_000, lifestyle: 4_000_000 })
    snap.addLikuid('kas', { label: 'BCA', amount: 100_000_000 })
    snap.addLikuid('deposito', { label: 'Deposito BCA', amount: 200_000_000, sukuBungaPercent: 4.5 })
    snap.addLikuid('deposito', { label: 'Deposito Mandiri', amount: 100_000_000, sukuBungaPercent: 4.25 })
    snap.addLikuid('sbn', { label: 'SR020', amount: 200_000_000, sukuBungaPercent: 6.3 })
    snap.addLikuid('sbn', { label: 'ORI023', amount: 200_000_000, sukuBungaPercent: 5.9 })
    snap.addLikuid('reksaDana', { label: 'RDPU Syailendra', amount: 100_000_000, rdJenis: 'pasarUang' })
    snap.addLikuid('reksaDana', { label: 'Schroder Dana Mantap', amount: 150_000_000, rdJenis: 'pendapatanTetap' })
    snap.addNonLikuid('properti', { label: 'Rumah Cibubur', amount: 800_000_000 })
    const saham = [
      { ticker: 'BBRI', lot: 200, avg: 2500, target: 200 },
      { ticker: 'BMRI', lot: 150, avg: 3500, target: 150 },
      { ticker: 'BBCA', lot: 50, avg: 4800, target: 50 },
      { ticker: 'TLKM', lot: 30, avg: 2500, target: 30 },
      { ticker: 'ASII', lot: 20, avg: 4100, target: 20 },
      { ticker: 'UNVR', lot: 10, avg: 3000, target: 10 },
    ]
    for (const s of saham) {
      snap.addSaham({ ticker: s.ticker, lot: s.lot, hargaRataRata: s.avg, lotsTarget: s.target, avgDividendYieldPercent: 6 })
    }
    snap.setEmas({ digitalGram: 0, fisikAntamGram: 50, perhiasan18KGram: 20, perhiasan14KGram: 0, perhiasan10KGram: 0 })
    snap.setDemo(true)
  },
}

// ---------- #10 Sultan Properti (wealth-tracker) ----------
const sultanProperti: SamplePersona = {
  id: 'sultan-properti',
  nama: 'Sultan Properti',
  emoji: '👑',
  mode: 'wealthTracker',
  blurb: 'Net worth Rp13M — wow angka',
  apply(snap) {
    snap.reset()
    snap.setPenghasilanAmount(30_000_000)
    snap.setPenghasilanCurrency('IDR')
    snap.addPenghasilanLain({ label: 'Dividen perusahaan', amount: 50_000_000, currency: 'IDR' })
    snap.setPengeluaran({ pokok: 15_000_000, lifestyle: 15_000_000 })
    snap.addLikuid('kas', { label: 'BCA', amount: 500_000_000 })
    snap.addLikuid('deposito', { label: 'Deposito', amount: 1_000_000_000, sukuBungaPercent: 4.5 })
    snap.addLikuid('sbn', { label: 'SBN', amount: 2_000_000_000, sukuBungaPercent: 6.0 })
    const saham = [
      { ticker: 'BBRI', lot: 2000, avg: 2500, target: 2500 },
      { ticker: 'BMRI', lot: 1500, avg: 3500, target: 1500 },
      { ticker: 'BBCA', lot: 500, avg: 4800, target: 500 },
      { ticker: 'TLKM', lot: 200, avg: 2500, target: 200 },
      { ticker: 'ASII', lot: 100, avg: 4100, target: 100 },
    ]
    for (const s of saham) {
      snap.addSaham({ ticker: s.ticker, lot: s.lot, hargaRataRata: s.avg, lotsTarget: s.target })
    }
    snap.addNonLikuid('properti', { label: 'Gedung perkantoran', amount: 5_000_000_000 })
    snap.addNonLikuid('properti', { label: 'Rumah Pondok Indah', amount: 3_000_000_000 })
    snap.addNonLikuid('properti', { label: 'Ruko 5 unit', amount: 2_000_000_000 })
    snap.setDemo(true)
  },
}

// ---------- Registry ----------
export const PERSONAS: SamplePersona[] = [
  mahasiswaPasPasan,
  mahasiswaMandiri,
  mahasiswaSultan,
  korbanJudol,
  terjebakCicilan,
  pegawaiMudaKpr,
  freelancerBebasUtang,
  juraganKos,
  pensiunanMapan,
  sultanProperti,
]

export function getPersona(id: string): SamplePersona | undefined {
  return PERSONAS.find((p) => p.id === id)
}

export function applyPersona(snap: SnapshotStore, persona: SamplePersona): void {
  snap.reset()
  // Set mode before applying so the dashboard renders correctly
  if (persona.mode === 'budgetKos') {
    snap.mode = 'budgetKos' as any
  }
  persona.apply(snap)
}
