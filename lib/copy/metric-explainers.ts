// Metric explainer content (per Day 3.3). Modal panel pattern: title + definition +
// formula + zone breakdown + optional note. Bahasa, casual but OJK-descriptive — we
// describe state, not prescribe correction. The ojk-lint test runs over every string
// here just like it does over the main copy registry.

export type ExplainerKey =
  | 'netWorth'
  | 'modalSiap'
  | 'dsr'
  | 'dar'
  | 'runway'
  | 'savingsRate'
  | 'safeHaven'
  | 'allocationDiscipline'
  | 'rasioTertahan'
  | 'rentToIncome'
  | 'surplusBulanan'

// Union of every zone label used across all 9 metrics. Modal's color-class map keys
// on this type so any new label here forces a matching entry there at compile time.
export type ZoneLabel =
  | 'Sehat'
  | 'Waspada'
  | 'Bahaya'
  | 'Konservatif'
  | 'Seimbang'
  | 'Agresif'
  | 'Tight'
  | 'Sesuai'
  | 'Drift'
  | 'Mulai Melenceng'
  | 'Off-Plan'
  | 'Jauh dari Target'
  | 'Aman'
  | 'Risiko Likuidasi'

export interface ExplainerZone {
  label: ZoneLabel
  range: string // '<30%' / '30–40%' / '≥40%'
  body: string
}

export interface ExplainerSpec {
  title: string
  definition: string
  formula: string
  zones?: ExplainerZone[] // undefined for hero metrics that have no thresholds
  note?: string
}

export const metricExplainers: Record<ExplainerKey, ExplainerSpec> = {
  netWorth: {
    title: 'Net Worth',
    definition:
      'Total kekayaan bersih kamu — semua aset dikurangi semua utang. Angka ini ngegambarin posisi finansial kamu hari ini secara keseluruhan.',
    formula:
      'Net Worth = (Kas + Aset Likuid + Emas + Saham + Aset Non-Likuid) − (Cicilan + Utang Pribadi + Piutang Gadai)',
    note: 'Bisa minus kalau total utang lebih besar dari aset. Itu bukan akhir dunia — angkanya berubah seiring kamu nyicil dan nabung.',
  },

  modalSiap: {
    title: 'Modal Siap Distribusi',
    definition:
      'Berapa banyak uang yang langsung bisa kamu pakai untuk apapun — lunasin cicilan, beli aset baru, masukin ke goal, atau standby di tabungan.',
    formula:
      'Modal Siap = Kas + Deposito + Reksa Dana + Crypto Liquid (multi-currency dikonversi ke IDR pakai kurs live)',
    note: 'Pertimbangkan keep dana darurat 3–6 bulan pengeluaran terpisah dari angka ini. Yang ditampilin di sini total Modal Siap kasar — buffer-nya kamu yang nentuin.',
  },

  dsr: {
    title: 'DSR — Debt Service Ratio',
    definition:
      'Porsi penghasilan bulanan kamu yang habis buat bayar cicilan. Termasuk cicilan formal (KPR/KPM/KK/Pinjol) plus utang pribadi yang ada cicilan/bulan.',
    formula: 'DSR = Total Cicilan/bulan ÷ Penghasilan bulanan × 100%',
    zones: [
      {
        label: 'Sehat',
        range: '<30%',
        body: 'Cicilan masih dalam zona nyaman. Masih ada ruang gerak untuk nabung atau ambil cicilan baru tanpa pressure.',
      },
      {
        label: 'Waspada',
        range: '30–40%',
        body: 'Cicilan udah ngambil porsi besar dari penghasilan. Tambah cicilan baru bikin pressure naik lebih cepat.',
      },
      {
        label: 'Bahaya',
        range: '≥40%',
        body: 'Cicilan terlalu besar dibanding penghasilan. Ruang gerak finansial sempit — disrupsi kecil bisa langsung berdampak ke cash flow.',
      },
    ],
  },

  dar: {
    title: 'DAR — Debt to Asset Ratio',
    definition:
      'Seberapa besar porsi aset kamu yang dibiayai dari utang. Beda sama DSR (cash flow); DAR ngeliat di sisi neraca — berapa persen aset yang sebenarnya masih "milik" kreditur.',
    formula: 'DAR = Total Utang ÷ Total Aset Kotor × 100%',
    zones: [
      {
        label: 'Sehat',
        range: '<30%',
        body: 'Aset mostly milik kamu sendiri. Posisi neraca solid.',
      },
      {
        label: 'Waspada',
        range: '30–50%',
        body: 'Sebagian aset masih dibiayai utang — wajar terutama kalau lagi punya KPR aktif yang besar.',
      },
      {
        label: 'Bahaya',
        range: '>50%',
        body: 'Utang relatif besar dibanding aset. Posisi rentan kalau aset turun nilai atau ada disrupsi pendapatan.',
      },
    ],
  },

  runway: {
    title: 'Financial Runway',
    definition:
      'Berapa lama uang yang ada bisa nutup pengeluaran kalau pendapatan tiba-tiba berhenti. Asumsi pengeluaran tetap jalan termasuk cicilan (kreditur gak ikut pause).',
    formula:
      'Runway = (Kas + Deposito + RD + Saham + Emas di tangan) ÷ Total Pengeluaran/bulan',
    zones: [
      {
        label: 'Sehat',
        range: '≥6 bulan',
        body: 'Punya buffer cukup buat ngadepin situasi gak terduga — kehilangan kerjaan, sakit, atau biaya darurat.',
      },
      {
        label: 'Waspada',
        range: '3–6 bulan',
        body: 'Buffer ada, tapi tipis. Disrupsi panjang bisa bikin stress finansial.',
      },
      {
        label: 'Bahaya',
        range: '<3 bulan',
        body: 'Buffer sangat tipis. Satu kejadian gak terduga bisa langsung berdampak ke cash flow harian.',
      },
    ],
  },

  savingsRate: {
    title: 'Savings Rate',
    definition:
      'Berapa persen dari penghasilan yang berhasil kamu sisihkan — gak habis buat pengeluaran rutin atau bayar cicilan.',
    formula: 'Savings Rate = (Penghasilan − Total Pengeluaran) ÷ Penghasilan × 100%',
    zones: [
      {
        label: 'Sehat',
        range: '≥20%',
        body: 'Kamu konsisten nyisihin uang. Akselerasi goal akan kerasa dari sini.',
      },
      {
        label: 'Waspada',
        range: '10–20%',
        body: 'Nabung jalan tapi pelan. Surplus mendadak bisa dimasukin goal biar lebih cepat tercapai.',
      },
      {
        label: 'Bahaya',
        range: '<10%',
        body: 'Surplus tipis. Sedikit perubahan biaya bisa bikin defisit di akhir bulan.',
      },
    ],
  },

  safeHaven: {
    title: 'Safe Haven Ratio',
    definition:
      'Porsi aset kamu yang ada di instrumen "konservatif" — kas, deposito, SBN/obligasi, reksa dana defensif (RDPU + RD Pendapatan Tetap), dan emas. Sisanya (saham, RD saham/indeks/campuran, properti, crypto, dll) tergolong growth-oriented.',
    formula:
      'Safe Haven = (Kas + Deposito + SBN + RD-defensif + Emas) ÷ Total Aset × 100%',
    zones: [
      {
        label: 'Konservatif',
        range: '≥60%',
        body: 'Profil defensif. Volatilitas rendah, juga growth rendah — cocok kalau prioritas preservation.',
      },
      {
        label: 'Seimbang',
        range: '40–60%',
        body: 'Campuran defensif dan growth. Posisi tengah yang umum di profile multi-tujuan.',
      },
      {
        label: 'Agresif',
        range: '<40%',
        body: 'Profil growth-heavy. Potensi return tinggi, volatilitas juga tinggi.',
      },
    ],
    note: 'Ini posture metric, bukan safety metric. Yang "benar" tergantung profil risiko & tujuan kamu — gak ada satu angka yang universal.',
  },

  allocationDiscipline: {
    title: 'Target Alokasi Saham',
    definition:
      'Ngukur seberapa dekat komposisi saham kamu sekarang dibanding target yang kamu tentukan (via lots target). Makin kecil angkanya, makin sesuai dengan rencana alokasi kamu. Satuannya percentage point (pp).',
    formula:
      'Rata-rata selisih bobot aktual vs target (pp)\n\nΣ |Bobot Aktual − Bobot Target| ÷ n saham\n\nBobot Aktual = (lot × 100 × harga) ÷ total portofolio × 100%\nBobot Target = (lots target × harga) ÷ total target × 100%',
    zones: [
      {
        label: 'Sesuai',
        range: '<5pp',
        body: 'Portofolio kamu sudah sesuai target. Pertahankan!',
      },
      {
        label: 'Mulai Melenceng',
        range: '5-15pp',
        body: 'Ada beberapa saham yang bobotnya mulai jauh dari target. Bisa dipertimbangkan buat rebalance.',
      },
      {
        label: 'Jauh dari Target',
        range: '>15pp',
        body: 'Komposisi saham kamu udah cukup jauh dari rencana. Mungkin perlu rebalance atau cek ulang target alokasinya.',
      },
    ],
    note: 'Butuh ≥2 saham dengan lots target — composition drift gak meaningful dengan universe 1. Edge case yang sering bikin bingung: kalau semua emiten kurang lot-nya secara proporsional sama (mis. BBCA 10/100 + BBRI 10/100 lot), mix-nya tetap match target → drift 0pp. Buat lihat progress akumulasi per emiten, pakai lots progress bar di kartu saham. Bobot target juga bergeser kalau harga bergerak — by design buat akumulator (lots target tetap, bobot adaptif).',
  },

  rasioTertahan: {
    title: 'Rasio Tertahan (Gadai)',
    definition:
      'Porsi total emas kamu yang lagi digadai. Bukan tentang nilai rupiah-nya, tapi tentang berapa gram dari total yang gak bisa langsung dicairkan.',
    formula:
      'Rasio Tertahan = Σ gram digadai ÷ (Σ gram di tangan + Σ gram digadai) × 100%',
    zones: [
      {
        label: 'Aman',
        range: '<50%',
        body: 'Sebagian besar emas masih di tangan. Posisi fleksibel — sebagian gram bebas dicairin tanpa lewat tahapan tebus.',
      },
      {
        label: 'Waspada',
        range: '50–70%',
        body: 'Lebih dari separuh emas tertahan. Tebus belum critical, tapi posisi mulai kurang fleksibel.',
      },
      {
        label: 'Risiko Likuidasi',
        range: '>70%',
        body: 'Hampir semua emas tertahan. Risiko likuidasi naik kalau bunga gadai numpuk dan tebus tertunda.',
      },
    ],
  },

  rentToIncome: {
    title: 'Rasio Kos / Penghasilan',
    definition:
      'Berapa persen penghasilan bulanan kamu yang habis buat bayar kos. Ini metric paling penting buat anak kos — kalau sewa kebanyakan, pos lain (tabungan, makan, investasi) pasti kena imbasnya.',
    formula: 'Rasio Kos = Biaya Kos/bulan ÷ Penghasilan bulanan × 100%',
    zones: [
      {
        label: 'Aman',
        range: '≤25%',
        body: 'Sewa masih nyaman. Masih ada ruang buat tabungan, gaya hidup, dan investasi tanpa stress.',
      },
      {
        label: 'Waspada',
        range: '25–35%',
        body: 'Sewa mulai ngambil porsi besar. Di kota besar ini wajar, tapi pos lain perlu dikompensasi dengan sadar.',
      },
      {
        label: 'Bahaya',
        range: '>35%',
        body: 'Sewa terlalu besar. Tabungan jadi tipis, makan jadi hemat-hemat, investasi jadi ga kepikiran. Cari kos yang lebih murah atau tambah penghasilan sampingan.',
      },
    ],
    note: 'Di Jakarta/Surabaya wajar sampai 30–35% karena harga kos memang tinggi. Kalau kos all-in (include makan, laundry, wifi), angka sedikit lebih tinggi masih ok karena kamu nge-save di pos lain.',
  },

  surplusBulanan: {
    title: 'Surplus Bulanan',
    definition:
      'Sisa uang kamu setelah semua pengeluaran dan cicilan dibayar. Angka positif berarti kamu nabung, negatif berarti kamu defisit.',
    formula: 'Surplus = Penghasilan bulanan − Total Pengeluaran (termasuk cicilan)',
    zones: [
      {
        label: 'Aman',
        range: '≥20%',
        body: 'Sisa uang cukup buat nabung dan investasi. Rule of thumb: 50% kebutuhan, 30% keinginan, 20% tabungan.',
      },
      {
        label: 'Waspada',
        range: '10–20%',
        body: 'Sisa uang tipis. Bisa nabung tapi pelan — perubahan biaya kecil bisa bikin defisit.',
      },
      {
        label: 'Bahaya',
        range: '<10%',
        body: 'Hampir semua gaji habis. Dana darurat belum kepenuhi, investasi jadi ga kepikiran.',
      },
    ],
    note: 'Kalau minus, artinya pengeluaran lebih besar dari penghasilan — utang bakal numpuk kalau gak diubah.',
  },
}
