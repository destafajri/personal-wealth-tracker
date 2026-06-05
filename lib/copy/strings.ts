export const copy = {
  'brand.name': 'Cermat',
  'brand.tagline': 'Cermat ngatur keuangan, biar ngekos makin tenang',

  'landing.hero.title': 'Cermat ngatur keuangan, biar ngekos makin tenang',
  'landing.hero.subtitle': 'Cek tipe keuangan anak kos kamu — isi data, langsung keluar persona kamu.',
  'landing.hero.trust': 'Tanpa daftar. Tanpa cloud.',

  // Phase-2a Day 3: hero title fragment keys for emerald-accented hero
  // rendered as <span class="text-primary">). Existing `landing.hero.title` retained for SEO
  // meta + accessibility fallback.
  'landing.hero.titlePrefix': 'Cermat ngatur keuangan, biar',
  'landing.hero.titleWord1': 'ngekos',
  'landing.hero.titleWord2': 'makin',
  'landing.hero.titleWord3': 'tenang',

  // Phase-2a Day 3: trust pills above H1 (v0auto-inspired hero layout).
  'landing.trust.pill.noRegister': 'Tanpa daftar',
  'landing.trust.pill.noCloud': 'Tanpa cloud',

  'landing.cta.snapshot.label': 'Cek Budget Ngekos',
  'landing.cta.snapshot.body': 'Cek dulu kamu tipe anak kos apa? Isi data, langsung keluar persona kamu.',
  'landing.cta.snapshot.action': 'Mulai',

  'landing.cta.demo.label': 'Wealth Tracker Lengkap',
  'landing.cta.demo.body': 'Track aset, utang, investasi secara detail — pakai data contoh.',
  'landing.cta.demo.action': 'Mulai',

  // Phase-2a Day 3: default layout navbar right-side tagline (with Clock icon).
  'nav.tagline.tenMinutes': 'Cek Keuangan dalam 10 Menit',

  'footer.disclaimer':
    '100% client-side. Data kamu tetap di komputer kamu. Cermat bukan penasihat keuangan atau produk berizin.',

  'banner.simulation.disclaimer':
    'Hasil di sini cuma simulasi pakai data kamu. Cermat bukan penasihat keuangan atau produk berizin.',

  'dialog.refresh': 'Data kamu belum tersimpan. Yakin mau refresh?',
  'dialog.leave.title': 'Yakin mau keluar?',
  'dialog.leave.body': 'Data kamu belum tersimpan permanen. Kalau kamu pindah halaman sekarang, data yang sudah diisi akan hilang.',
  'snapshot.unsaved.banner': 'Data disimpan sementara di memori browser — refresh atau tutup tab akan menghapusnya.',

  // D11.2 — Screen 12 negative Net Worth Status framing. Per design-guidelines
  // §10 + OJK posture: "Status" only, NEVER "Saran"/"Sebaiknya". Descriptive
  // composition, no prescription. Renders below the rose-tinted NW number in
  // HeroPair when derived.netWorth < 0.
  'metric.netWorth.statusNegative':
    'Status: Aset bersih negatif. Utang {liabilities} melebihi total aset {assets}. Cek komposisi utang & likuiditas di panel kanan buat evaluasi posisi kamu.',

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
  'nav.download.pending': 'Menyusun…',
  'nav.brand.subtitle': 'Cermat ngatur keuangan, biar ngekos makin tenang 💸',

  // ----- snapshot page -----
  'snapshot.title': 'Snapshot',
  'snapshot.section.penghasilan': 'Uang Masuk',
  'snapshot.section.pengeluaran': 'Biaya Hidup/Bulan',
  'snapshot.section.asetLikuid': 'Aset likuid',
  'snapshot.section.asetNonLikuid': 'Aset non-likuid',
  'snapshot.section.crypto': 'Crypto (live, by unit)',
  'snapshot.section.emas': 'Emas',
  'snapshot.section.cicilanAktif': 'Utang & Cicilan',
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
  'gadai.field.asetRef.pick': 'Pilih aset…',
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
  'metric.netWorth.label': 'Total Kekayaanku',
  'metric.modalSiap.label': 'Tabungan Siap Pakai',
  'metric.modalSiap.advisory': 'Pertimbangkan keep dana darurat 3–6 bulan terpisah.',
  'metric.dsr.label': 'Rasio Utang',
  'metric.dar.label': 'DAR',
  'metric.runway.label': 'Bisa Bertahan',
  'metric.savingsRate.label': 'Sisa Uang/Bulan',
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
  'simulator.title': 'Simulasi Keputusan',
  'simulator.subtitle': 'Simulasi keputusan keuangan — pakai data kamu langsung.',
  'simulator.launcher.decisions': 'Simulasi Keputusan',
  'simulator.launcher.capacity': 'Cek Kapasitas',

  'simulator.card.kpr.label': 'Mau Kos/Sewa?',
  'simulator.card.kpr.body': 'Hitung budget ngekos atau sewa tempat tinggal.',
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

  'sim.host.close': 'Tutup simulasi',
  'sim.host.loading': 'Memuat simulasi…',

  // D11.4 — Screen 13 mobile fallback strings.
  'mobile.viewDashboard': '↓ Lihat dashboard',
  'mobile.desktopHint': 'Lebih nyaman di desktop',

  'sim.kpr.title': 'Mau KPR?',
  'sim.kpr.subtitle': 'Isi spesifikasi KPR untuk lihat dampak ke metrik + goals.',
  'sim.kpr.form.label': 'Nama / catatan (opsional)',
  'sim.kpr.form.labelPlaceholder': 'mis. Rumah Bandung 2028',
  'sim.kpr.form.hargaRumah': 'Harga rumah',
  'sim.kpr.form.dpPercent': 'DP (%)',
  'sim.kpr.form.tenor': 'Tenor (tahun)',
  'sim.kpr.form.bunga': 'Suku bunga (%/tahun)',
  'sim.kpr.form.jenisBunga': 'Jenis bunga',
  'sim.kpr.form.submit': 'Hitung skenario',
  'sim.kpr.form.reset': 'Reset',

  'sim.kpr.summary.title': 'Ringkasan KPR',
  'sim.kpr.summary.dp': 'DP: {amount}',
  'sim.kpr.summary.pokok': 'Pokok pinjaman: {amount}',
  'sim.kpr.summary.cicilan': 'Cicilan/bulan: {amount}',
  'sim.kpr.summary.totalBunga': 'Total bunga (sepanjang tenor): {amount}',

  'sim.delta.title': 'Dampak ke Metrik',
  'sim.delta.col.metric': 'Metrik',
  'sim.delta.col.before': 'Sebelum',
  'sim.delta.col.after': 'Sesudah',
  'sim.delta.col.delta': 'Δ',

  'sim.goalImpact.title': 'Dampak ke Goals',
  'sim.goalImpact.empty': 'Belum ada goal. Tambah dulu di tab Plan biar kelihatan dampaknya.',
  'sim.goalImpact.shift.late': '{label}: mundur ~{months} bulan',
  'sim.goalImpact.shift.early': '{label}: lebih cepat ~{months} bulan',
  'sim.goalImpact.shift.none': '{label}: gak berubah',
  'sim.goalImpact.unreachable': '{label}: jadi tidak tercapai dengan alokasi sekarang',

  'sim.warning.dpExceedsLiquid':
    'DP melebihi tabungan + deposito + reksa dana kamu — turunin DP% atau tambah likuid dulu. (Saham, crypto, emas, SBN tidak otomatis ditarik di skenario ini.)',

  'metric.label.netWorth': 'Net Worth',
  'metric.label.modalSiap': 'Modal Siap',
  'metric.label.dsr': 'DSR',
  'metric.label.dar': 'DAR',
  'metric.label.runway': 'Runway',
  'metric.label.savingsRate': 'Savings Rate',
  'metric.label.safeHaven': 'Safe Haven',

  // ----- sim: Mau Gadai -----
  'sim.gadai.title': 'Mau Gadai?',
  'sim.gadai.subtitle': 'Simulasi gadai aset (emas / properti / kendaraan) → cash piutang.',
  'sim.gadai.form.label': 'Nama / catatan (opsional)',
  'sim.gadai.form.labelPlaceholder': 'mis. Gadai emas Antam 20g',
  'sim.gadai.form.jaminan': 'Jenis jaminan',
  'sim.gadai.form.gram': 'Gram tertahan',
  'sim.gadai.form.asetRef': 'Pilih aset',
  'sim.gadai.form.asetRefEmpty': '— belum ada aset di kategori ini —',
  'sim.gadai.form.piutang': 'Piutang diterima (Rp)',
  'sim.gadai.form.bunga': 'Bunga (%/bulan)',
  'sim.gadai.form.tempo': 'Tempo (bulan)',
  'sim.gadai.form.submit': 'Hitung skenario',

  'sim.gadai.summary.title': 'Ringkasan Gadai',
  'sim.gadai.summary.piutang': 'Piutang diterima: {amount}',
  'sim.gadai.summary.totalBunga': 'Total bunga selama tempo: {amount}',

  'sim.gadai.warning.zeroPiutang': 'Isi piutang yang kamu terima dari Pegadaian.',
  'sim.gadai.warning.zeroGram': 'Untuk jaminan emas, isi gram yang tertahan.',
  'sim.gadai.warning.gramExceedsOwned':
    'Mau gadai {requested}g tapi cuma punya {available}g yang available di kategori ini.',
  'sim.gadai.form.gramAvailable':
    'Tersedia: {available}g (total ownership dikurang yang sudah digadai).',

  'sim.gadai.jaminan.emasDigital': 'Emas digital (Pegadaian / e-mas)',
  'sim.gadai.jaminan.emasFisikAntam': 'Emas fisik Antam',
  'sim.gadai.jaminan.emasPerhiasan18K': 'Perhiasan emas 18K',
  'sim.gadai.jaminan.emasPerhiasan14K': 'Perhiasan emas 14K',
  'sim.gadai.jaminan.emasPerhiasan10K': 'Perhiasan emas 10K',
  'sim.gadai.jaminan.properti': 'Properti (SHM/SHGB)',
  'sim.gadai.jaminan.kendaraan': 'Kendaraan (BPKB)',

  // ----- sim: Mau Cicil -----
  'sim.cicil.title': 'Mau Cicil?',
  'sim.cicil.subtitle': 'Simulasi cicilan KPM / elektronik / KK / paylater / pinjol (non-KPR).',
  'sim.cicil.form.label': 'Nama / catatan (opsional)',
  'sim.cicil.form.labelPlaceholder': 'mis. Motor Honda',
  'sim.cicil.form.tipe': 'Tipe cicilan',
  'sim.cicil.form.harga': 'Harga barang',
  'sim.cicil.form.dp': 'DP (%)',
  'sim.cicil.form.tenor': 'Tenor (bulan)',
  'sim.cicil.form.bunga': 'Suku bunga (%/tahun)',
  'sim.cicil.form.jenisBunga': 'Jenis bunga',
  'sim.cicil.form.asetKategori': 'Kategori aset (opsional)',
  'sim.cicil.form.asetSkip': '— skip aset tracking —',
  'sim.cicil.form.asetValue': 'Nilai aset',
  'sim.cicil.form.asetHint': 'Isi kalau pembelian ini bisa di-track sebagai aset (mis. motor → kendaraan). Skip untuk KK/Paylater.',
  'sim.cicil.form.submit': 'Hitung skenario',

  'sim.cicil.summary.title': 'Ringkasan Cicilan',
  'sim.cicil.summary.dp': 'DP: {amount}',
  'sim.cicil.summary.pokok': 'Pokok pinjaman: {amount}',
  'sim.cicil.summary.cicilan': 'Cicilan/bulan: {amount}',
  'sim.cicil.summary.totalBunga': 'Total bunga (sepanjang tenor): {amount}',

  // ----- sim: Custom -----
  'sim.custom.title': 'Skenario Custom',
  'sim.custom.subtitle': 'Tambah 1 cicilan + opsional 1 aset. Buat skenario bebas yang gak fit simulasi standar.',
  'sim.custom.cicilan.title': 'Cicilan baru',
  'sim.custom.cicilan.label': 'Nama',
  'sim.custom.cicilan.tipe': 'Tipe',
  'sim.custom.cicilan.sisaPokok': 'Sisa pokok',
  'sim.custom.cicilan.cicilanPerBulan': 'Cicilan/bulan',
  'sim.custom.cicilan.jenisBunga': 'Jenis bunga',
  'sim.custom.cicilan.sukuBunga': 'Suku bunga %/tahun (opsional)',
  'sim.custom.cicilan.tenor': 'Tenor sisa bulan (opsional)',
  'sim.custom.aset.title': 'Tambah aset (opsional)',
  'sim.custom.aset.skipHint': 'Kosongkan kategori kalau cuma simulasi cicilan tanpa nambah aset.',
  'sim.custom.aset.kategori': 'Kategori',
  'sim.custom.aset.none': '— skip aset —',
  'sim.custom.aset.label': 'Nama',
  'sim.custom.aset.amount': 'Nilai',
  'sim.custom.aset.currency': 'Mata uang',
  'sim.custom.form.submit': 'Hitung skenario',

  // ----- sim: Max Utang Aman (capacity) -----
  'sim.maxUtang.title': 'Max Utang Aman',
  'sim.maxUtang.subtitle':
    'Berapa max cicilan baru/bulan biar DSR tetap aman (di bawah target)?',
  'sim.maxUtang.form.targetDsr': 'Target DSR (%)',
  'sim.maxUtang.form.targetDsrHelp': 'Default 30% (sehat band per dashboard).',
  'sim.maxUtang.form.tipe': 'Mau utang apa? (pilih satu atau lebih)',
  'sim.maxUtang.form.tipeKpr': 'KPR (rumah)',
  'sim.maxUtang.form.tipeKpm': 'KPM (motor/mobil)',
  'sim.maxUtang.form.tipePaylater': 'Paylater / cicilan barang',
  'sim.maxUtang.form.tipeEmpty': 'Pilih minimal 1 tipe utang.',
  'sim.maxUtang.form.advancedToggle': 'Tampilkan override',
  'sim.maxUtang.form.kprTenor': 'Tenor (tahun)',
  'sim.maxUtang.form.kprBunga': 'Bunga (%/tahun)',
  'sim.maxUtang.form.tenorBulan': 'Tenor (bulan)',
  'sim.maxUtang.form.bunga': 'Bunga (%/tahun)',
  'sim.maxUtang.form.submit': 'Hitung skenario',

  'sim.maxUtang.hero.label': 'Max cicilan baru / bulan',
  'sim.maxUtang.warning.noPenghasilan':
    'Belum ada penghasilan di snapshot. Isi gaji bersih dulu di tab Track.',
  'sim.maxUtang.warning.zeroHeadroom':
    'Cicilan kamu sekarang sudah di atas target DSR — gak ada headroom untuk utang baru.',
  'sim.maxUtang.warning.burnOverIncome':
    'Pengeluaran total kamu sudah lebih besar dari penghasilan — headroom ini misleading. Cek pos lifestyle / cicilan dulu.',

  'sim.maxUtang.scenarios.title': 'Setara dengan',
  'sim.maxUtang.scenario.kpr.label': 'Setara KPR',
  'sim.maxUtang.scenario.kpr.body':
    'Sampai ~{harga} harga rumah ({tenor} tahun, DP 20%, bunga {bunga}% Anuitas).',
  'sim.maxUtang.scenario.kpm.label': 'Setara KPM (motor/mobil)',
  'sim.maxUtang.scenario.kpm.body':
    'Sampai ~{harga} harga kendaraan ({tenor} bln, DP 20%, bunga {bunga}% Anuitas).',
  'sim.maxUtang.scenario.paylater.label': 'Setara Paylater / cicilan barang',
  'sim.maxUtang.scenario.paylater.body':
    'Sampai ~{harga} harga barang ({tenor} bln, bunga {bunga}%/tahun).',

  // ----- sim: Lunasi Utang (capacity) -----
  'sim.lunasi.title': 'Lunasi Utang Sekarang',
  'sim.lunasi.subtitle':
    'Bayar utang dari Modal Siap kamu. Pilih utang yang mau dilunasi + jumlah bayar.',
  'sim.lunasi.form.debt': 'Pilih utang',
  'sim.lunasi.form.debtEmpty': 'Belum ada utang aktif di snapshot kamu.',
  'sim.lunasi.form.payment': 'Jumlah bayar (Rp)',
  'sim.lunasi.form.paymentHelp': 'Default = sisa pokok (lunas). Edit untuk bayar partial.',
  'sim.lunasi.form.modeTitle': 'Behavior untuk Anuitas / Flat',
  'sim.lunasi.form.modeTenor': 'Tenor lebih cepat (cicilan/bln tetap)',
  'sim.lunasi.form.modeCicilan': 'Cicilan turun (tenor tetap)',
  'sim.lunasi.form.submit': 'Hitung skenario',

  'sim.lunasi.debt.cicilanLabel': '{label} ({tipe}) — sisa {amount}',
  'sim.lunasi.debt.utangLabel': '{label} (utang pribadi) — sisa {amount}',
  'sim.lunasi.debt.gadaiLabel': '{label} (gadai) — piutang {amount}',

  'sim.lunasi.summary.title': 'Ringkasan Pembayaran',
  'sim.lunasi.summary.paid': 'Yang dibayar: {amount}',
  'sim.lunasi.summary.lunas': 'Status: LUNAS ✓ (utang dihapus dari snapshot)',
  'sim.lunasi.summary.postSisa': 'Sisa pokok setelah lunasi: {amount}',
  'sim.lunasi.summary.postCicilan': 'Cicilan/bulan jadi: {amount}',
  'sim.lunasi.summary.postTenor': 'Tenor sisa: {months} bulan',

  'sim.lunasi.warning.zeroPayment': 'Isi jumlah bayar yang lebih dari 0.',
  'sim.lunasi.warning.modalShortfall':
    'Modal Siap kamu gak cukup untuk bayar segini — sebagian aja yang ke-apply. Pertimbangkan partial pay lebih kecil atau tambah likuid dulu.',

  // ----- sim: Modal Likuid Options (Day 9) -----
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
    'Tenor mundur (lihat detailnya di simulasi Lunasi); sisa modal {modalSisa}',
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

  // Day 9 — deploy-preview simulator (replaces apply-direct path; preview-only, no mutation).
  'sim.deployPreview.title': 'Preview Distribusi',
  'sim.deployPreview.subtitle':
    'Simulasi distribusi Modal Siap — preview saja, tidak mengubah snapshot kamu.',
  'sim.deployPreview.summary.title': 'Ringkasan Aksi',
  'sim.deployPreview.summary.action.addLiquid': 'Tambah {amount} ke {category}',
  'sim.deployPreview.summary.action.addStock': 'Beli {ticker} {lots} lot ({amount})',
  'sim.deployPreview.summary.action.addEmas': 'Tambah {grams} gram emas digital ({amount})',
  'sim.deployPreview.summary.source':
    'Sumber: tarik via waterfall kas → deposito → reksa dana → crypto.',
  'sim.deployPreview.warning.shortfall':
    'Modal Siap kamu (likuid) gak cukup buat aksi ini — sebagian gak ke-cover di skenario. Tambah likuid dulu atau turunin amount.',
  'sim.deployPreview.note':
    'Aksi ini tidak otomatis ke-apply ke snapshot. Buat eksekusi, tambah row-nya manual di panel Snapshot.',
  'sim.deployPreview.conflictNotice':
    'Toggle {category} di Modal Siap di-off-in dulu karena kamu lagi distribusi ke kategori itu (biar gak double-count).',
  'sim.deployPreview.category.reksaDana': 'Reksa Dana',
  'sim.deployPreview.category.deposito': 'Deposito',
  'sim.deployPreview.category.sbn': 'SBN / Obligasi',

  // ----- persona (Phase 3 Priority 1) -----
  'persona.sultanKos.label': 'Sultan Kos',
  'persona.sultanKos.tagline': 'Gaji mewah, investasi jalan, top!',
  'persona.investorKos.label': 'Investor Kos',
  'persona.investorKos.tagline': 'Sudah mulai investasi, masa depan cerah!',
  'persona.anakKosBijak.label': 'Anak Kos Bijak',
  'persona.anakKosBijak.tagline': 'Disiplin ngatur keuangan, Respect!',
  'persona.pejuangAkhirBulan.label': 'Pejuang Akhir Bulan',
  'persona.pejuangAkhirBulan.tagline': 'Akhir bulan keras, tapi kamu gak sendiri!',
  'persona.sobatIndomie.label': 'Sobat Indomie',
  'persona.sobatIndomie.tagline': 'Hemat itu pilihan, tapi yang penting happy!',
  'persona.stats.savingsRate': 'Sisa Uang/Bulan',
  'persona.stats.runway': 'Bisa Bertahan',

  // ----- CTA Mamikos (Phase 3 Priority 2) -----
  'cta.mamikos.afterPersona.label': 'Cari Kos Sesuai Budgetmu',
  'cta.mamikos.afterPersona.body': 'Temukan kos pas di Mamikos — hemat tanpa ribet.',
  'cta.mamikos.dashboardBottom.label': 'Mau Pindah Kos?',
  'cta.mamikos.dashboardBottom.body': 'Cek kos available di Mamikos, sesuai budget kamu.',
  'cta.mamikos.landing.label': 'Cari Kos Pas di Mamikos',
  'cta.mamikos.landing.body': 'Mulai cek keuangan, lalu cari kos yang pas.',
  'cta.mamikos.action': 'Cari di Mamikos →',
} as const

export type CopyKey = keyof typeof copy

export function t(key: CopyKey, vars?: Record<string, string | number>): string {
  const raw = copy[key]
  if (!vars) return raw
  return raw.replace(/\{(\w+)\}/g, (_, name: string) =>
    vars[name] !== undefined ? String(vars[name]) : `{${name}}`,
  )
}
