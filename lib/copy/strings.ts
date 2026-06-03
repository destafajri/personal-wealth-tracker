export const copy = {
  'brand.name': 'Cermat',
  'brand.tagline': 'Cek keuangan kamu dalam 10 menit',

  'landing.hero.title': 'Aman gak kalau gw KPR, Gadai, atau Cicil?',
  'landing.hero.subtitle': 'Berapa max utang yang aman? Cek dalam 10 menit.',
  'landing.hero.trust': 'Tanpa daftar. Tanpa cloud.',

  'landing.cta.snapshot.label': 'Mulai dari Snapshot',
  'landing.cta.snapshot.body': 'Isi data kamu sendiri (5–10 menit).',
  'landing.cta.snapshot.action': 'Mulai',

  'landing.cta.demo.label': 'Coba dengan data contoh',
  'landing.cta.demo.body': 'Skip dulu, lihat tools-nya.',
  'landing.cta.demo.action': 'Coba',

  'footer.disclaimer':
    '100% client-side. Data kamu tetap di komputer kamu. Cermat bukan penasihat keuangan atau produk berizin.',

  'banner.simulation.disclaimer':
    'Hasil di sini cuma simulasi pakai data kamu. Cermat bukan penasihat keuangan atau produk berizin.',

  'snapshot.demo.banner':
    'Kamu lagi lihat data contoh — angka di sini cuma persona fiktif, bukan datamu.',
  'snapshot.demo.reset': 'Pakai data sendiri',

  // ----- app shell -----
  'nav.track': 'Track',
  'nav.plan': 'Plan',
  'nav.decide': 'Decide',
  'nav.discover': 'Discover',
  'nav.soon': 'Soon',
  'nav.download.label': 'Unduh xlsx',
  'nav.download.empty': 'Tambah minimal 1 aset dulu',
  'nav.brand.subtitle': 'Cek Rupiah Mu Agar Teratur 💸',

  // ----- snapshot page -----
  'snapshot.title': 'Snapshot',
  'snapshot.section.penghasilan': 'Penghasilan',
  'snapshot.section.pengeluaran': 'Pengeluaran rutin',
  'snapshot.section.asetLikuid': 'Aset likuid',
  'snapshot.section.asetNonLikuid': 'Aset non-likuid',
  'snapshot.section.crypto': 'Crypto (live, by unit)',
  'snapshot.section.emas': 'Emas',
  'snapshot.section.cicilanAktif': 'Cicilan aktif',
  'snapshot.section.utangPribadi': 'Utang pribadi',
  'snapshot.section.gadai': 'Gadai',
  'snapshot.penghasilan.gajiLabel': 'Gaji Bersih',
  'snapshot.penghasilan.gajiHelp': 'Take-home pay setelah PPh21.',
  'snapshot.penghasilan.lainLabel': 'Penghasilan Lain',
  'snapshot.penghasilan.lainHelp': 'Sampingan, sewa, freelance, dll.',
  'snapshot.pengeluaran.pokok.label': 'Pokok/bulan',
  'snapshot.pengeluaran.pokok.help': 'Makan, transport, listrik, sewa — yang rutin tiap bulan.',
  'snapshot.pengeluaran.lifestyle.label': 'Lifestyle/bulan',
  'snapshot.pengeluaran.lifestyle.help': 'Hiburan, langganan, belanja non-pokok.',
  'snapshot.pengeluaran.note':
    'Cicilan jangan dimasukin di sini — diisi di "Cicilan aktif" biar gak double-count.',
  'snapshot.aset.kas': 'Tabungan / Kas',
  'snapshot.aset.deposito': 'Deposito',
  'snapshot.aset.reksaDana': 'Reksa Dana',
  'snapshot.aset.sbn': 'SBN / Obligasi',
  'snapshot.aset.properti': 'Properti',
  'snapshot.aset.kendaraan': 'Kendaraan',
  'snapshot.aset.pensiun': 'Dana pensiun',
  'snapshot.row.add': '+ Tambah',
  'snapshot.row.labelPlaceholder': 'Nama (opsional)',
  'snapshot.row.idrPlaceholder': 'Nilai',
  'snapshot.row.remove': 'Hapus',
  'snapshot.row.fxStale': '≈ kurs belum kebaca',
  'snapshot.emas.help':
    'Isi gram di kategori yang sesuai. Estimasi rate per gram pakai sumber publik (Pegadaian Digital untuk digital, Antam 1gr × kadar/karat untuk fisik & perhiasan). Yang lagi digadai diisi per kontrak di seksi Gadai.',
  'snapshot.emas.tertahanDerived': 'Tertahan: {grams} gram (dari {count} kontrak gadai)',
  'snapshot.emas.tertahanZero': 'Belum ada gadai aktif.',
  'snapshot.emas.staleRate': 'Live rate belum kebaca.',
  'snapshot.emas.refresh': 'Refresh',
  'snapshot.emas.refreshError': 'Coba lagi',
  'snapshot.emas.refreshAria': 'Refresh harga emas live',
  'snapshot.emas.refreshCooldown': 'Tunggu {sec}s',
  'snapshot.emas.totalLabel': 'Total nilai emas',
  'snapshot.emas.subtotal': '{grams} g × {rate}/g = {value}',
  'snapshot.emas.atHomeBreakdown': '{available}g di tangan, {pawned}g digadai (total {total}g)',
  'snapshot.emas.rateLine': 'Estimasi ~{rate}/g',
  'snapshot.emas.digital.label': 'Digital (Pegadaian / e-mas)',
  'snapshot.emas.digital.note': 'Pakai harga jual Pegadaian Digital langsung.',
  'snapshot.emas.fisik.label': 'Fisik (Antam batangan)',
  'snapshot.emas.fisik.note': 'Estimasi pakai harga Antam 1gr × 0.897 (spread buyback ~10%).',
  'snapshot.emas.perhiasan.label': 'Perhiasan',
  'snapshot.emas.perhiasan.note':
    'Estimasi pakai harga Antam dikali persentase kadar (18K/14K/10K).',
  'snapshot.emas.perhiasan.18K.label': '18 Karat (~75% emas)',
  'snapshot.emas.perhiasan.18K.note': '~59.5% Antam (range 57–62%).',
  'snapshot.emas.perhiasan.14K.label': '14 Karat (~58% emas)',
  'snapshot.emas.perhiasan.14K.note': '~45.5% Antam (range 43–48%).',
  'snapshot.emas.perhiasan.10K.label': '10 Karat (~42% emas)',
  'snapshot.emas.perhiasan.10K.note': '~37.5% Antam (range 35–40%).',

  // ----- crypto (dropdown + 4 input modes) -----
  'snapshot.crypto.help':
    'Pilih coin dari dropdown (top 52 di CoinGecko, bisa di-search) lalu pilih mode input — Unit (jumlah coin), IDR / USD / KRW (nilai dalam mata uang itu). Total selalu dikonversi ke IDR.',
  'snapshot.crypto.refresh': 'Refresh',
  'snapshot.crypto.refreshError': 'Gagal · klik ulang',
  'snapshot.crypto.refreshAria': 'Refresh harga crypto live',
  'snapshot.crypto.refreshCooldown': 'Tunggu {sec}s',
  'snapshot.crypto.empty': 'Belum ada crypto. Klik "+ Tambah crypto" untuk mulai.',
  'snapshot.crypto.add': '+ Tambah crypto',
  'snapshot.crypto.remove': 'Hapus crypto',
  'snapshot.crypto.coinPlaceholder': 'Symbol coin (mis. BTC, ETH, XAUT)',
  'snapshot.crypto.coinAria': 'Symbol coin crypto',
  'snapshot.crypto.modeAria': 'Mode input crypto',
  'snapshot.crypto.modeUnit': 'Unit',
  'snapshot.crypto.modeIdr': 'IDR',
  'snapshot.crypto.modeUsd': 'USD',
  'snapshot.crypto.modeKrw': 'KRW',
  'snapshot.crypto.unitFallback': 'unit',
  'snapshot.crypto.ratePickCoin': 'Pilih coin dulu untuk lihat harga live.',
  'snapshot.crypto.rateStale': 'Live rate {sym} belum kebaca.',
  'snapshot.crypto.rateLine': '{rates} / 1 {sym}',
  'snapshot.crypto.idrStale': '≈ — (rate belum kebaca)',
  'snapshot.crypto.fxStale': '≈ — (kurs FX belum kebaca)',
  'snapshot.crypto.amountPlaceholder': 'Nilai',
  'snapshot.crypto.duplicateWarning':
    'Coin {sym} sudah dipakai di row lain. Hapus salah satu atau ubah biar gak double-count.',
  'snapshot.crypto.totalLabel': 'Total nilai crypto',
  'snapshot.crypto.costBasisLabel': 'Harga beli rata-rata / unit',
  'snapshot.crypto.costBasisHelp':
    'Cost basis per coin. Currency bebas (USD/IDR/dll); drives capital gain % vs harga live.',
  'snapshot.crypto.costBasisCurrencyAria': 'Currency cost basis',
  'snapshot.crypto.capitalGainHint': 'vs harga live',

  // ----- cicilan -----
  'cicilan.add': '+ Tambah cicilan',
  'cicilan.quickadd.kpr': '+ KPR',
  'cicilan.quickadd.kpm': '+ KPM',
  'cicilan.quickadd.kk': '+ Kartu Kredit',
  'cicilan.quickadd.pinjol': '+ Pinjol',
  'cicilan.empty': 'Belum ada cicilan aktif.',
  'cicilan.field.label': 'Nama (mis. KPR BCA 2024)',
  'cicilan.field.tipe': 'Tipe',
  'cicilan.field.sisaPokok': 'Sisa pokok (IDR)',
  'cicilan.field.cicilan': 'Cicilan/bulan (IDR)',
  'cicilan.field.sukuBunga': 'Bunga (%/tahun)',
  'cicilan.field.tenorSisa': 'Sisa tenor (bulan)',
  'cicilan.field.jenisBunga': 'Jenis bunga',
  'cicilan.field.tanggal': 'Jatuh tempo (opsional)',
  'cicilan.warning.missingBunga': 'Isi bunga biar proyeksi prepay akurat.',
  'cicilan.warning.floatingNoBunga': 'Floating tanpa rate — proyeksi pakai rate default.',
  'cicilan.warning.overPenghasilan': 'Total cicilan lebih dari penghasilan — cek lagi datanya.',
  'cicilan.aggregate.total': 'Total cicilan/bulan',
  'cicilan.aggregate.pokok': 'Total sisa pokok',
  'cicilan.aggregate.biggest': 'Cicilan terbesar',

  // ----- utang pribadi (informal debt) -----
  'utangPribadi.help':
    'Pinjaman informal/non-bank: ke teman, keluarga, atau orang lain. Tetap masuk Net Worth & DAR; cicilan/bulan (kalau ada) masuk ke DSR.',
  'utangPribadi.empty': 'Belum ada utang pribadi.',
  'utangPribadi.add': '+ Tambah utang pribadi',
  'utangPribadi.row.remove': 'Hapus',
  'utangPribadi.field.label': 'Nama (mis. Pinjam ke Bro Andi)',
  'utangPribadi.field.sisaPokok': 'Sisa pokok (IDR)',
  'utangPribadi.field.cicilan': 'Cicilan/bulan (opsional)',
  'utangPribadi.field.tempo': 'Tempo (bulan, opsional)',
  'utangPribadi.field.tanggal': 'Jatuh tempo (opsional)',
  'utangPribadi.aggregate.total': 'Total utang pribadi',
  'utangPribadi.aggregate.cicilan': 'Total cicilan/bulan',

  // ----- gadai -----
  'gadai.empty': 'Belum ada kontrak gadai.',
  'gadai.add': '+ Tambah kontrak gadai',
  'gadai.row.remove': 'Hapus kontrak',
  'gadai.field.label': 'Nama kontrak (mis. Pegadaian Bandung 2024)',
  'gadai.field.jaminan': 'Jaminan',
  'gadai.field.tertahan': 'Berapa gram digadai',
  'gadai.field.piutang': 'Piutang gadai (IDR)',
  'gadai.field.bunga': 'Bunga (%/bulan)',
  'gadai.field.tempo': 'Tempo (bulan)',
  'gadai.field.tanggal': 'Jatuh tempo (opsional)',
  'gadai.field.asetRef': 'Aset yang dijaminkan',
  'gadai.field.asetRef.pick': 'Pilih aset...',
  'gadai.asetRef.empty.properti':
    'Belum ada properti di snapshot. Tambah dulu di Aset non-likuid → Properti.',
  'gadai.asetRef.empty.kendaraan':
    'Belum ada kendaraan di snapshot. Tambah dulu di Aset non-likuid → Kendaraan.',
  'gadai.emasRef.empty': 'Belum ada {jenis} di snapshot. Tambah dulu di seksi Emas.',
  'gadai.warning.overOwned':
    'Total digadai di kategori ini {pawned}g, lebih dari yang dimiliki {owned}g.',
  'gadai.aggregate.totalEmasGram': 'Total emas digadai',
  'gadai.aggregate.piutang': 'Total piutang',
  'gadai.aggregate.kontrak': 'Jumlah kontrak',
  'gadai.jaminan.emas.digital': 'Emas Digital',
  'gadai.jaminan.emas.fisikAntam': 'Emas Fisik (Antam)',
  'gadai.jaminan.emas.perhiasan18K': 'Emas Perhiasan 18K',
  'gadai.jaminan.emas.perhiasan14K': 'Emas Perhiasan 14K',
  'gadai.jaminan.emas.perhiasan10K': 'Emas Perhiasan 10K',
  'gadai.jaminan.properti': 'Properti (SHM/SHGB)',
  'gadai.jaminan.kendaraan': 'Kendaraan (BPKB)',
  'gadai.rasioTertahan': 'Rasio Tertahan',
  'gadai.zone.aman': 'Aman',
  'gadai.zone.waspada': 'Waspada',
  'gadai.zone.bahaya': 'Risiko Likuidasi',

  // ----- dashboard / metrics -----
  'metric.netWorth.label': 'Net Worth',
  'metric.modalSiap.label': 'Modal Siap Distribusi',
  'metric.modalSiap.advisory': 'Pertimbangkan keep dana darurat 3–6 bulan terpisah.',
  'metric.dsr.label': 'DSR',
  'metric.dar.label': 'DAR',
  'metric.runway.label': 'Runway',
  'metric.savingsRate.label': 'Savings Rate',
  'metric.safeHaven.label': 'Safe Haven',
  'metric.allocationDiscipline.label': 'Allocation Discipline',
  'metric.empty.dsr': 'Isi penghasilan dulu.',
  'metric.empty.dar': 'Isi aset dulu.',
  'metric.empty.runway': 'Isi pengeluaran dulu.',
  'metric.empty.savingsRate': 'Isi penghasilan dulu.',
  'metric.empty.safeHaven': 'Isi aset dulu.',
  'metric.empty.allocationDiscipline':
    'Butuh ≥2 saham dengan lots target di expanded view buat lihat disiplin alokasi.',

  'pill.live': 'LIVE',
  'pill.estimasi': 'ESTIMASI',
  'pill.stale': 'STALE',

  'snapshot.section.saham': 'Saham',
  'snapshot.saham.help':
    'Per-emiten dengan harga live IDX. Set target bobot kalau mau ngeliat drift dari alokasi.',
  'snapshot.saham.empty': 'Belum ada saham. Tambah emiten pertama di bawah.',
  'snapshot.saham.add': '+ Tambah Saham',
  'snapshot.saham.tickerPlaceholder': 'BBCA',
  'snapshot.saham.tickerAria': 'Ticker IDX (4 huruf)',
  'snapshot.saham.lotLabel': 'Lot',
  'snapshot.saham.lotAria': 'Jumlah lot',
  'snapshot.saham.hargaRataRataLabel': 'Harga rata-rata',
  'snapshot.saham.hargaRataRataHelp':
    'Cost basis per lembar. Dipakai buat hitung capital gain % vs harga sekarang; juga fallback valuasi kalau live + override gak ada.',
  'snapshot.saham.capitalGainLabel': 'Capital gain',
  'snapshot.saham.capitalGainHint': 'vs harga rata-rata',
  'snapshot.saham.targetLabel': 'Target bobot (%)',
  'snapshot.saham.targetHelp': 'Optional. Tanpa target, drift gak keitung.',
  'snapshot.saham.overrideLabel': 'Override harga (manual)',
  'snapshot.saham.overrideHelp': 'Kosongin = pakai harga LIVE. Isi kalau live salah / stale.',
  'snapshot.saham.lastUpdated': 'Terakhir update {time}',
  'snapshot.saham.priceMissing': 'Harga live belum kebaca',
  'snapshot.saham.duplicateWarning':
    'Ticker {ticker} sudah dipakai di row lain. Hapus salah satu atau gabungin biar gak double-count.',
  'snapshot.saham.expand': 'Lihat detail',
  'snapshot.saham.collapse': 'Sembunyikan detail',
  'snapshot.saham.remove': 'Hapus saham',
  'snapshot.saham.totalLabel': 'Total Saham',
  'snapshot.saham.refresh': 'Refresh',
  'snapshot.saham.refreshError': 'Coba lagi',
  'snapshot.saham.refreshAria': 'Refresh harga saham',
  'snapshot.saham.refreshCooldown': 'Tunggu {sec}s',
  'snapshot.saham.driftSehat': 'Bobot mendekati target',
  'snapshot.saham.driftWaspada': 'Bobot mulai drift dari target',
  'snapshot.saham.driftBahaya': 'Bobot jauh dari target',
  'snapshot.saham.driftNoTarget': 'Belum ada target bobot',
  'snapshot.saham.lotsTargetLabel': 'Lots target',
  'snapshot.saham.lotsTargetHelp': 'Goal akumulasi lot. Drives progress bar — opsional.',
  'snapshot.saham.lotsProgress': 'Lots: {now} / {target}',
  'snapshot.saham.lastDivLabel': 'Last dividen / lembar',
  'snapshot.saham.lastDivHelp': 'Annual, IDR per lembar.',
  'snapshot.saham.yieldLabel': 'Yield %',
  'snapshot.saham.yieldHelp': 'Annual yield (0–100%). Dipakai kalau gak punya angka dividen literal.',
  'snapshot.saham.potentialDividend': 'Potential Dividend: {amount}/tahun',
  'snapshot.saham.dividendSection': 'Dividen (opsional)',
  'snapshot.saham.dividendModeLastDiv': 'Last div',
  'snapshot.saham.dividendModeYield': 'Yield %',
  'snapshot.saham.dividendModeAria': 'Pilih mode input dividen',

  'snapshot.penghasilan.dividenLabel': 'Estimasi Dividen Saham',
  'snapshot.penghasilan.dividenHint': 'Dihitung otomatis dari data saham kamu.',
  'snapshot.penghasilan.dividenAnnual': '≈ {amount}/tahun',
  'snapshot.penghasilan.bungaSbnLabel': 'Estimasi Bunga SBN / Obligasi',
  'snapshot.penghasilan.bungaSbnHint': 'Dihitung otomatis dari suku bunga SBN/Obligasi.',
  'snapshot.penghasilan.bungaDepositoLabel': 'Estimasi Bunga Deposito',
  'snapshot.penghasilan.bungaDepositoHint': 'Dihitung otomatis dari suku bunga deposito.',
  'snapshot.penghasilan.lainAdd': '+ Tambah Penghasilan Lain',
  'snapshot.penghasilan.lainLabelPlaceholder': 'Sumber (mis. Sewa kontrakan)',
  'snapshot.penghasilan.lainEmpty': 'Belum ada penghasilan lain. Tambah kalau ada sampingan.',
  'snapshot.penghasilan.lainRemove': 'Hapus penghasilan',

  'snapshot.aset.sukuBungaLabel': 'Bunga %/tahun',
  'snapshot.aset.sukuBungaAria': 'Suku bunga per tahun',

  // Day 9 — Reksa Dana jenis picker. Drives Safe Haven inclusion.
  'snapshot.aset.rdJenisLabel': 'Jenis',
  'snapshot.aset.rdJenisAria': 'Jenis reksa dana',
  'snapshot.aset.rdJenis.untagged': 'Belum dipilih',
  'snapshot.aset.rdJenis.pasarUang': 'RDPU (Pasar Uang)',
  'snapshot.aset.rdJenis.pendapatanTetap': 'RD Pendapatan Tetap',
  'snapshot.aset.rdJenis.campuran': 'RD Campuran',
  'snapshot.aset.rdJenis.saham': 'RD Saham',
  'snapshot.aset.rdJenis.indeks': 'RD Indeks',
  'snapshot.aset.rdJenis.lain': 'Lain (ETF / Syariah / Proteksi)',
  'snapshot.aset.rdJenis.safeHavenHint': 'Safe Haven: RDPU + Pendapatan Tetap',

  'chart.allocation.title': 'Alokasi Saham',
  'chart.allocation.empty': 'Belum ada saham di portofolio.',
  'chart.allocation.legendTotal': 'Total',
  'chart.safeHaven.title': 'Safe Haven vs Growth',
  'chart.safeHaven.empty': 'Belum ada aset untuk dipetakan.',
  'chart.safeHaven.safe': 'Safe Haven',
  'chart.safeHaven.growth': 'Growth',
  'chart.safeHaven.safeDesc': 'Kas + Deposito + SBN + RD defensif (RDPU/RDPT) + Emas',
  'chart.safeHaven.growthDesc': 'Saham + Crypto + RD agresif (saham/indeks/campuran/lain) + Aset Non-Likuid',
  'chart.loading': 'Memuat chart…',

  'error.generic.title': 'Ada yang gak beres',
  'error.generic.body': 'Coba muat ulang halaman, atau balik ke beranda.',
  'error.generic.cta': 'Kembali ke beranda',

  // ----- goals page -----
  'goals.title': 'Goals',
  'goals.subtitle': 'Tag asset ke goal — progress jalan otomatis.',
  'goals.banner.estimasi':
    'Proyeksi pakai asumsi return real {pct}%/tahun. ESTIMASI — bukan jaminan.',
  'goals.returnAssumption.label': 'Asumsi return real (per tahun)',
  'goals.returnAssumption.help': 'Real return = setelah dikurangi inflasi. Default 5%.',

  'goals.empty.title': 'Belum ada goal',
  'goals.empty.body': 'Tambah goal pertama kamu di form di atas.',

  'goals.kind.FI': 'Financial Independence',
  'goals.kind.DP_RUMAH': 'DP Rumah',
  'goals.kind.DANA_PENDIDIKAN': 'Dana Pendidikan',
  'goals.kind.CUSTOM': 'Goal kustom',

  'goals.form.title': 'Tambah goal',
  'goals.form.kindLabel': 'Tipe goal',
  'goals.form.labelLabel': 'Nama goal',
  'goals.form.labelPlaceholder': 'mis. DP Rumah Bandung 2028',
  'goals.form.targetLabel': 'Target (Rp)',
  'goals.form.targetDateLabel': 'Target tanggal',
  'goals.form.bucketsLabel': 'Bucket aset',
  'goals.form.bucketsHelp': 'Pilih kategori aset yang counted ke goal ini.',
  'goals.form.allocationLabel': 'Alokasi bulanan (opsional)',
  'goals.form.allocationHelp':
    'Kosongkan untuk pakai default = surplus ÷ jumlah goal aktif.',
  'goals.form.submit': '+ Tambah Goal',
  'goals.form.fiAuto':
    'Target FI auto-dihitung dari pengeluaran bulanan × 300 (4% rule).',
  'goals.form.fiBlocked': 'Sudah ada FI goal — cuma boleh satu.',
  'goals.form.targetRequired': 'Isi target Rp + tanggal dulu.',

  'goals.bucket.kas': 'Kas / Tabungan',
  'goals.bucket.deposito': 'Deposito',
  'goals.bucket.reksaDana': 'Reksa Dana',
  'goals.bucket.sbn': 'SBN / Obligasi',
  'goals.bucket.saham': 'Saham',
  'goals.bucket.crypto': 'Crypto',
  'goals.bucket.emas': 'Emas',
  'goals.bucket.properti': 'Properti',
  'goals.bucket.kendaraan': 'Kendaraan',
  'goals.bucket.pensiun': 'Dana Pensiun',

  'goal.status.on': 'On-Track',
  'goal.status.atRisk': 'Waspada',
  'goal.status.off': 'Off-Track',

  'goal.progress.label': '{current} / {target}',
  'goal.bucket.empty': 'Belum ada bucket. Pilih kategori aset di form.',
  'goal.contribution.label': 'Kontribusi bulanan: {amount}',
  'goal.contribution.default': '{amount} (default = surplus ÷ jumlah goal)',
  'goal.projection.complete': 'Sudah tercapai ✓',
  'goal.projection.date': 'Proyeksi selesai: {date}',
  'goal.projection.unreachable': 'Belum tercapai dengan alokasi sekarang',
  'goal.projection.diffOn': 'sesuai target',
  'goal.projection.diffEarly': '{months} bulan lebih cepat dari target',
  'goal.projection.diffLate': '{months} bulan lebih lambat dari target',
  'goal.fi.formula':
    'Asumsi: Pengeluaran bulanan {monthly} × {multiplier} = {fiNumber}',
  'goal.fi.formulaNote': 'Multiplier fixed 300 (4% rule, Trinity baseline).',
  'goal.fi.needsPengeluaran':
    'Isi pengeluaran di Snapshot dulu — FI Number butuh data itu.',
  'goal.remove': 'Hapus goal',
  'goal.edit.targetIdr': 'Target (Rp)',
  'goal.edit.targetDate': 'Target tanggal',
  'goal.edit.allocation': 'Alokasi /bulan (opsional)',
  'goal.edit.allocationPlaceholder': 'Default surplus ÷ N',

  // ----- dashboard goal summary -----
  'dashboard.goals.title': 'Goals',
  'dashboard.goals.empty': 'Belum ada goal. Tambah di tab Plan.',
  'dashboard.goalHealth.label': 'Goal Health',
  'dashboard.goalHealth.empty': 'Belum ada goal',
  'dashboard.goalHealth.value': '{pct}% on-track',

  // ----- simulator (Decide tab) -----
  'simulator.title': 'Simulator',
  'simulator.subtitle': 'Simulasi keputusan keuangan besar — semua hitungan pakai data snapshot kamu.',
  'simulator.launcher.decisions': 'Wizard Keputusan ("Mau gw X?")',
  'simulator.launcher.capacity': 'Wizard Kapasitas ("Bisa gw apa?")',

  'simulator.card.kpr.label': 'Mau KPR',
  'simulator.card.kpr.body': 'Cek dampak ambil KPR baru ke metrik + goals.',
  'simulator.card.gadai.label': 'Mau Gadai',
  'simulator.card.gadai.body': 'Simulasi gadai emas / aset.',
  'simulator.card.cicil.label': 'Mau Cicil',
  'simulator.card.cicil.body': 'Simulasi cicilan elektronik / KPM.',
  'simulator.card.custom.label': 'Custom',
  'simulator.card.custom.body': 'Skenario bebas tanpa template.',
  'simulator.card.maxUtang.label': 'Max Utang Aman',
  'simulator.card.maxUtang.body': 'Berapa max cicilan baru yang aman?',
  'simulator.card.lunasi.label': 'Lunasi Utang',
  'simulator.card.lunasi.body': 'Simulasi pelunasan dari modal likuid.',
  'simulator.card.modalOptions.label': 'Modal Options',
  'simulator.card.modalOptions.body': 'Opsi distribusi modal likuid.',
  'simulator.card.soon': 'Soon',

  'wizard.host.close': 'Tutup wizard',

  'wizard.kpr.title': 'Mau KPR?',
  'wizard.kpr.subtitle': 'Isi spesifikasi KPR untuk lihat dampak ke metrik + goals.',
  'wizard.kpr.form.label': 'Nama / catatan (opsional)',
  'wizard.kpr.form.labelPlaceholder': 'mis. Rumah Bandung 2028',
  'wizard.kpr.form.hargaRumah': 'Harga rumah',
  'wizard.kpr.form.dpPercent': 'DP (%)',
  'wizard.kpr.form.tenor': 'Tenor (tahun)',
  'wizard.kpr.form.bunga': 'Suku bunga (%/tahun)',
  'wizard.kpr.form.jenisBunga': 'Jenis bunga',
  'wizard.kpr.form.submit': 'Hitung skenario',
  'wizard.kpr.form.reset': 'Reset',

  'wizard.kpr.summary.title': 'Ringkasan KPR',
  'wizard.kpr.summary.dp': 'DP: {amount}',
  'wizard.kpr.summary.pokok': 'Pokok pinjaman: {amount}',
  'wizard.kpr.summary.cicilan': 'Cicilan/bulan: {amount}',
  'wizard.kpr.summary.totalBunga': 'Total bunga (sepanjang tenor): {amount}',

  'wizard.delta.title': 'Dampak ke Metrik',
  'wizard.delta.col.metric': 'Metrik',
  'wizard.delta.col.before': 'Sebelum',
  'wizard.delta.col.after': 'Sesudah',
  'wizard.delta.col.delta': 'Δ',

  'wizard.goalImpact.title': 'Dampak ke Goals',
  'wizard.goalImpact.empty': 'Belum ada goal. Tambah dulu di tab Plan biar kelihatan dampaknya.',
  'wizard.goalImpact.shift.late': '{label}: mundur ~{months} bulan',
  'wizard.goalImpact.shift.early': '{label}: lebih cepat ~{months} bulan',
  'wizard.goalImpact.shift.none': '{label}: gak berubah',
  'wizard.goalImpact.unreachable': '{label}: jadi tidak tercapai dengan alokasi sekarang',

  'wizard.warning.dpExceedsLiquid':
    'DP melebihi tabungan + deposito + reksa dana kamu — turunin DP% atau tambah likuid dulu. (Saham, crypto, emas, SBN tidak otomatis ditarik di skenario ini.)',

  'metric.label.netWorth': 'Net Worth',
  'metric.label.modalSiap': 'Modal Siap',
  'metric.label.dsr': 'DSR',
  'metric.label.dar': 'DAR',
  'metric.label.runway': 'Runway',
  'metric.label.savingsRate': 'Savings Rate',
  'metric.label.safeHaven': 'Safe Haven',

  // ----- wizard: Mau Gadai -----
  'wizard.gadai.title': 'Mau Gadai?',
  'wizard.gadai.subtitle': 'Simulasi gadai aset (emas / properti / kendaraan) → cash piutang.',
  'wizard.gadai.form.label': 'Nama / catatan (opsional)',
  'wizard.gadai.form.labelPlaceholder': 'mis. Gadai emas Antam 20g',
  'wizard.gadai.form.jaminan': 'Jenis jaminan',
  'wizard.gadai.form.gram': 'Gram tertahan',
  'wizard.gadai.form.asetRef': 'Pilih aset',
  'wizard.gadai.form.asetRefEmpty': '— belum ada aset di kategori ini —',
  'wizard.gadai.form.piutang': 'Piutang diterima (Rp)',
  'wizard.gadai.form.bunga': 'Bunga (%/bulan)',
  'wizard.gadai.form.tempo': 'Tempo (bulan)',
  'wizard.gadai.form.submit': 'Hitung skenario',

  'wizard.gadai.summary.title': 'Ringkasan Gadai',
  'wizard.gadai.summary.piutang': 'Piutang diterima: {amount}',
  'wizard.gadai.summary.totalBunga': 'Total bunga selama tempo: {amount}',

  'wizard.gadai.warning.zeroPiutang': 'Isi piutang yang kamu terima dari Pegadaian.',
  'wizard.gadai.warning.zeroGram': 'Untuk jaminan emas, isi gram yang tertahan.',
  'wizard.gadai.warning.gramExceedsOwned':
    'Mau gadai {requested}g tapi cuma punya {available}g yang available di kategori ini.',
  'wizard.gadai.form.gramAvailable':
    'Tersedia: {available}g (total ownership dikurang yang sudah digadai).',

  'wizard.gadai.jaminan.emasDigital': 'Emas digital (Pegadaian / e-mas)',
  'wizard.gadai.jaminan.emasFisikAntam': 'Emas fisik Antam',
  'wizard.gadai.jaminan.emasPerhiasan18K': 'Perhiasan emas 18K',
  'wizard.gadai.jaminan.emasPerhiasan14K': 'Perhiasan emas 14K',
  'wizard.gadai.jaminan.emasPerhiasan10K': 'Perhiasan emas 10K',
  'wizard.gadai.jaminan.properti': 'Properti (SHM/SHGB)',
  'wizard.gadai.jaminan.kendaraan': 'Kendaraan (BPKB)',

  // ----- wizard: Mau Cicil -----
  'wizard.cicil.title': 'Mau Cicil?',
  'wizard.cicil.subtitle': 'Simulasi cicilan KPM / elektronik / KK / paylater / pinjol (non-KPR).',
  'wizard.cicil.form.label': 'Nama / catatan (opsional)',
  'wizard.cicil.form.labelPlaceholder': 'mis. Motor Honda',
  'wizard.cicil.form.tipe': 'Tipe cicilan',
  'wizard.cicil.form.harga': 'Harga barang',
  'wizard.cicil.form.dp': 'DP (%)',
  'wizard.cicil.form.tenor': 'Tenor (bulan)',
  'wizard.cicil.form.bunga': 'Suku bunga (%/tahun)',
  'wizard.cicil.form.jenisBunga': 'Jenis bunga',
  'wizard.cicil.form.asetKategori': 'Kategori aset (opsional)',
  'wizard.cicil.form.asetSkip': '— skip aset tracking —',
  'wizard.cicil.form.asetValue': 'Nilai aset',
  'wizard.cicil.form.asetHint': 'Isi kalau pembelian ini bisa di-track sebagai aset (mis. motor → kendaraan). Skip untuk KK/Paylater.',
  'wizard.cicil.form.submit': 'Hitung skenario',

  'wizard.cicil.summary.title': 'Ringkasan Cicilan',
  'wizard.cicil.summary.dp': 'DP: {amount}',
  'wizard.cicil.summary.pokok': 'Pokok pinjaman: {amount}',
  'wizard.cicil.summary.cicilan': 'Cicilan/bulan: {amount}',
  'wizard.cicil.summary.totalBunga': 'Total bunga (sepanjang tenor): {amount}',

  // ----- wizard: Custom -----
  'wizard.custom.title': 'Skenario Custom',
  'wizard.custom.subtitle': 'Tambah 1 cicilan + opsional 1 aset. Buat skenario bebas yang gak fit wizard standar.',
  'wizard.custom.cicilan.title': 'Cicilan baru',
  'wizard.custom.cicilan.label': 'Nama',
  'wizard.custom.cicilan.tipe': 'Tipe',
  'wizard.custom.cicilan.sisaPokok': 'Sisa pokok',
  'wizard.custom.cicilan.cicilanPerBulan': 'Cicilan/bulan',
  'wizard.custom.cicilan.jenisBunga': 'Jenis bunga',
  'wizard.custom.cicilan.sukuBunga': 'Suku bunga %/tahun (opsional)',
  'wizard.custom.cicilan.tenor': 'Tenor sisa bulan (opsional)',
  'wizard.custom.aset.title': 'Tambah aset (opsional)',
  'wizard.custom.aset.skipHint': 'Kosongkan kategori kalau cuma simulasi cicilan tanpa nambah aset.',
  'wizard.custom.aset.kategori': 'Kategori',
  'wizard.custom.aset.none': '— skip aset —',
  'wizard.custom.aset.label': 'Nama',
  'wizard.custom.aset.amount': 'Nilai',
  'wizard.custom.aset.currency': 'Mata uang',
  'wizard.custom.form.submit': 'Hitung skenario',

  // ----- wizard: Max Utang Aman (capacity) -----
  'wizard.maxUtang.title': 'Max Utang Aman',
  'wizard.maxUtang.subtitle':
    'Berapa max cicilan baru/bulan biar DSR tetap aman (di bawah target)?',
  'wizard.maxUtang.form.targetDsr': 'Target DSR (%)',
  'wizard.maxUtang.form.targetDsrHelp': 'Default 30% (sehat band per dashboard).',
  'wizard.maxUtang.form.tipe': 'Mau utang apa? (pilih satu atau lebih)',
  'wizard.maxUtang.form.tipeKpr': 'KPR (rumah)',
  'wizard.maxUtang.form.tipeKpm': 'KPM (motor/mobil)',
  'wizard.maxUtang.form.tipePaylater': 'Paylater / cicilan barang',
  'wizard.maxUtang.form.tipeEmpty': 'Pilih minimal 1 tipe utang.',
  'wizard.maxUtang.form.advancedToggle': 'Tampilkan override',
  'wizard.maxUtang.form.kprTenor': 'Tenor (tahun)',
  'wizard.maxUtang.form.kprBunga': 'Bunga (%/tahun)',
  'wizard.maxUtang.form.tenorBulan': 'Tenor (bulan)',
  'wizard.maxUtang.form.bunga': 'Bunga (%/tahun)',
  'wizard.maxUtang.form.submit': 'Hitung skenario',

  'wizard.maxUtang.hero.label': 'Max cicilan baru / bulan',
  'wizard.maxUtang.warning.noPenghasilan':
    'Belum ada penghasilan di snapshot. Isi gaji bersih dulu di tab Track.',
  'wizard.maxUtang.warning.zeroHeadroom':
    'Cicilan kamu sekarang sudah di atas target DSR — gak ada headroom untuk utang baru.',
  'wizard.maxUtang.warning.burnOverIncome':
    'Pengeluaran total kamu sudah lebih besar dari penghasilan — headroom ini misleading. Cek pos lifestyle / cicilan dulu.',

  'wizard.maxUtang.scenarios.title': 'Setara dengan',
  'wizard.maxUtang.scenario.kpr.label': 'Setara KPR',
  'wizard.maxUtang.scenario.kpr.body':
    'Sampai ~{harga} harga rumah ({tenor} tahun, DP 20%, bunga {bunga}% Anuitas).',
  'wizard.maxUtang.scenario.kpm.label': 'Setara KPM (motor/mobil)',
  'wizard.maxUtang.scenario.kpm.body':
    'Sampai ~{harga} harga kendaraan ({tenor} bln, DP 20%, bunga {bunga}% Anuitas).',
  'wizard.maxUtang.scenario.paylater.label': 'Setara Paylater / cicilan barang',
  'wizard.maxUtang.scenario.paylater.body':
    'Sampai ~{harga} harga barang ({tenor} bln, bunga {bunga}%/tahun).',

  // ----- wizard: Lunasi Utang (capacity) -----
  'wizard.lunasi.title': 'Lunasi Utang Sekarang',
  'wizard.lunasi.subtitle':
    'Bayar utang dari Modal Siap kamu. Pilih utang yang mau dilunasi + jumlah bayar.',
  'wizard.lunasi.form.debt': 'Pilih utang',
  'wizard.lunasi.form.debtEmpty': 'Belum ada utang aktif di snapshot kamu.',
  'wizard.lunasi.form.payment': 'Jumlah bayar (Rp)',
  'wizard.lunasi.form.paymentHelp': 'Default = sisa pokok (lunas). Edit untuk bayar partial.',
  'wizard.lunasi.form.modeTitle': 'Behavior untuk Anuitas / Flat',
  'wizard.lunasi.form.modeTenor': 'Tenor lebih cepat (cicilan/bln tetap)',
  'wizard.lunasi.form.modeCicilan': 'Cicilan turun (tenor tetap)',
  'wizard.lunasi.form.submit': 'Hitung skenario',

  'wizard.lunasi.debt.cicilanLabel': '{label} ({tipe}) — sisa {amount}',
  'wizard.lunasi.debt.utangLabel': '{label} (utang pribadi) — sisa {amount}',
  'wizard.lunasi.debt.gadaiLabel': '{label} (gadai) — piutang {amount}',

  'wizard.lunasi.summary.title': 'Ringkasan Pembayaran',
  'wizard.lunasi.summary.paid': 'Yang dibayar: {amount}',
  'wizard.lunasi.summary.lunas': 'Status: LUNAS ✓ (utang dihapus dari snapshot)',
  'wizard.lunasi.summary.postSisa': 'Sisa pokok setelah lunasi: {amount}',
  'wizard.lunasi.summary.postCicilan': 'Cicilan/bulan jadi: {amount}',
  'wizard.lunasi.summary.postTenor': 'Tenor sisa: {months} bulan',

  'wizard.lunasi.warning.zeroPayment': 'Isi jumlah bayar yang lebih dari 0.',
  'wizard.lunasi.warning.modalShortfall':
    'Modal Siap kamu gak cukup untuk bayar segini — sebagian aja yang ke-apply. Pertimbangkan partial pay lebih kecil atau tambah likuid dulu.',

  // ----- wizard: Modal Likuid Options (Day 9) -----
  // Headers + framing. NEVER "Rekomendasi" / "Pilihan terbaik" (OJK §11.1, PRD §9).
  'modal.options.title': 'Opsi yang Bisa Dihitungkan',
  'modal.options.subtitle':
    'Daftar opsi distribusi Modal Siap kamu. Bukan ranking — pilih sesuai prioritas kamu sendiri.',
  'modal.options.modalSiapLabel': 'Modal Siap Distribusi: {amount}',
  'modal.options.empty':
    'Modal Siap kamu Rp 0. Tambah likuid (kas / deposito / RD / crypto) dulu biar opsi muncul.',
  'modal.options.emergencyFundNote':
    'Catatan: Pertimbangkan keep dana darurat 3–6 bulan pengeluaran terpisah dari Modal Siap Distribusi.',
  'modal.options.hitung': 'Hitung',
  'modal.options.hitungAria': 'Hitung opsi: {label}',

  // Confirmation modal copy for asset-acquisition apply path.
  'modal.options.confirm.title': 'Tambah aset langsung ke snapshot?',
  'modal.options.confirm.body':
    'Aksi ini akan menambah baris baru di snapshot kamu. Kamu bisa hapus kapan aja dari panel snapshot.',
  'modal.options.confirm.confirm': 'Tambahkan',
  'modal.options.confirm.cancel': 'Batal',
  'modal.options.applied': 'Aset ditambahkan ke snapshot.',

  // Per-option label/preview templates. Variables defined per row.
  // Lunasi penuh cicilan
  'modal.option.lunasiCicilan.label': 'Lunasi {label} ({amount})',
  'modal.option.lunasiCicilan.preview':
    'DSR {dsrBefore} → {dsrAfter} ({dsrDelta}); sisa modal {modalSisa}',
  // Prepay parsial cicilan (Anuitas/Flat saja)
  'modal.option.prepayCicilan.label': 'Prepay {label} ({amount})',
  'modal.option.prepayCicilan.preview':
    'Tenor mundur (cek di wizard Lunasi); sisa modal {modalSisa}',
  // Utang pribadi
  'modal.option.lunasiUtangPribadi.label': 'Lunasi {label} ({amount})',
  'modal.option.lunasiUtangPribadi.preview':
    'DSR {dsrBefore} → {dsrAfter}; sisa modal {modalSisa}',
  // Gadai
  'modal.option.lunasiGadai.label': 'Tebus {label} ({amount})',
  'modal.option.lunasiGadai.preview':
    'Aset gadai balik ke snapshot; sisa modal {modalSisa}',
  // Beli saham (top per-emiten target gap)
  'modal.option.beliSaham.label': 'Beli {ticker} {lots} lot ({amount})',
  'modal.option.beliSaham.preview':
    'Progress to lotsTarget {progressBefore} → {progressAfter}; drift {driftBefore} → {drift}',
  // Tambah Reksa Dana — preview line varies by FI goal presence
  'modal.option.tambahReksaDana.label': 'Tambah ke Reksa Dana',
  'modal.option.tambahReksaDana.preview':
    '+{amount} → proyeksi Goal FI maju ~{months}',
  'modal.option.tambahReksaDana.previewNoGoal':
    '+{amount} ke RD; kontribusi ke aset likuid (belum ada Goal FI, atau projection unreachable)',
  // Tambah Deposito — same pattern
  'modal.option.tambahDeposito.label': 'Tambah ke Deposito',
  'modal.option.tambahDeposito.preview':
    '+{amount} → proyeksi Goal FI maju ~{months}',
  'modal.option.tambahDeposito.previewNoGoal':
    '+{amount} ke Deposito; kontribusi ke aset likuid (belum ada Goal FI, atau projection unreachable)',
  // Tambah SBN — sama pattern; SBN harus di-toggle ON di Modal Siap biar overlap-aware
  'modal.option.tambahSbn.label': 'Tambah ke SBN / Obligasi',
  'modal.option.tambahSbn.preview':
    '+{amount} → proyeksi Goal FI maju ~{months}',
  'modal.option.tambahSbn.previewNoGoal':
    '+{amount} ke SBN; kontribusi ke aset likuid (belum ada Goal FI, atau projection unreachable)',
  // Tambah Emas — destination = emas digital (lowest spread). Amount → gram via live rate.
  'modal.option.tambahEmas.label': 'Tambah ke Emas (digital)',
  'modal.option.tambahEmas.preview':
    '+{amount} jadi gram emas digital (Pegadaian hargaJual); hedge inflasi.',
  // Generic label used when constructing the new asset row from a modal option apply.
  'modal.option.deployLabel': 'Tambahan dari Modal Siap',

  // Day 9 — pre-existing aria-labels migrated from inline strings during ojk-lint sweep.
  'metric.explainer.aria.netWorth': 'Penjelasan Net Worth',
  'metric.explainer.aria.modalSiap': 'Penjelasan Modal Siap',
  'metric.explainer.aria.rasioTertahan': 'Penjelasan Rasio Tertahan',
  'metric.explainer.modal.close': 'Tutup',
  'metric.explainer.modal.zonesTitle': 'Arti zona',

  // OJK 3rd disclaimer layer (PRD §9 §11.3) — pre-goal-save banner copy.
  'banner.goal.disclaimer':
    'Goal di sini cuma alat tracking + proyeksi pakai asumsi return real kamu sendiri. Bukan target tunggal dan bukan jaminan tercapai.',

  // Day 9 — Modal Siap include toggles (HeroPair). User-controlled inclusion of saham /
  // emas / sbn into the headline at full live value. Disclaimer surfaces realisasi gap.
  'modal.siap.includes.label': 'Termasuk:',
  'modal.siap.includes.saham': 'Saham',
  'modal.siap.includes.emas': 'Emas',
  'modal.siap.includes.sbn': 'SBN',
  'modal.siap.includes.disclaimer':
    'Nilai realisasi cair bisa lebih rendah dari nilai tercatat (spread + bea jual).',
  'modal.siap.includes.aria.toggle': 'Termasukkan {category} dalam Modal Siap',

  // Day 9 — deploy-preview wizard (replaces apply-direct path; preview-only, no mutation).
  'wizard.deployPreview.title': 'Preview Distribusi',
  'wizard.deployPreview.subtitle':
    'Simulasi distribusi Modal Siap — preview saja, tidak mengubah snapshot kamu.',
  'wizard.deployPreview.summary.title': 'Ringkasan Aksi',
  'wizard.deployPreview.summary.action.addLiquid': 'Tambah {amount} ke {category}',
  'wizard.deployPreview.summary.action.addStock': 'Beli {ticker} {lots} lot ({amount})',
  'wizard.deployPreview.summary.action.addEmas': 'Tambah {grams} gram emas digital ({amount})',
  'wizard.deployPreview.summary.source':
    'Sumber: tarik via waterfall kas → deposito → reksa dana → crypto.',
  'wizard.deployPreview.warning.shortfall':
    'Modal Siap kamu (likuid) gak cukup buat aksi ini — sebagian gak ke-cover di skenario. Tambah likuid dulu atau turunin amount.',
  'wizard.deployPreview.note':
    'Aksi ini tidak otomatis ke-apply ke snapshot. Buat eksekusi, tambah row-nya manual di panel Snapshot.',
  'wizard.deployPreview.conflictNotice':
    'Toggle {category} di Modal Siap di-off-in dulu karena lo lagi distribusi ke kategori itu (biar gak double-count).',
  'wizard.deployPreview.category.reksaDana': 'Reksa Dana',
  'wizard.deployPreview.category.deposito': 'Deposito',
  'wizard.deployPreview.category.sbn': 'SBN / Obligasi',
} as const

export type CopyKey = keyof typeof copy

export function t(key: CopyKey, vars?: Record<string, string | number>): string {
  const raw = copy[key]
  if (!vars) return raw
  return raw.replace(/\{(\w+)\}/g, (_, name: string) =>
    vars[name] !== undefined ? String(vars[name]) : `{${name}}`,
  )
}
