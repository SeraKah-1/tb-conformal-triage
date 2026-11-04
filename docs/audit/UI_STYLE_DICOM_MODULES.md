# Gaya UI, sakelar modul dan input DICOM

Implementasi lokal 4 November 2026. Belum dipush/deploy. Menu, urutan panel, alur input–hasil, penyimpanan dan ekspor dipertahankan. Model/threshold numerik tidak diganti.

## Perubahan

- Skin netral seperti referensi: putih/abu-abu, garis tipis, kontrol membulat, tanpa font eksternal atau framework tambahan. Merah untuk perhatian/skor tinggi, amber untuk review, hijau untuk status pemeriksaan lolos/aktif. Status juga mempunyai teks, bukan hanya warna.
- Tiga sakelar IQA, OOD dan conformal. Default aktif, disimpan lokal, ID/EN. Snapshot pengaturan dicatat per proses; hasil tersimpan tidak dihitung ulang ketika sakelar berubah.
- IQA nonaktif mematikan interpretasi advisory pada hasil; decode/blank dan kontrak preprocessing tetap aktif. OOD nonaktif melewati perhitungan jarak. Conformal nonaktif tidak membuat set prediksi palsu. Setiap modul nonaktif diberi alasan eksplisit dan tetap wajib review.
- Upload tunggal, banyak berkas dan folder menerima .dcm/.dicom melalui decoder lokal terbatas. DICOM dikonversi menjadi PNG untuk pipeline penelitian yang ada. Transfer syntax uncompressed implicitLE/explicitLE/explicitBE, single-frame monochrome8/16, signed pixels, rescale/window LINEAR dan MONOCHROME1 didukung. Compressed/multiframe/color/LUT/struktur unsupported ditolak. Tidak ada klaim deidentifikasi atau dukungan DICOM diagnostik lengkap.
- Metadata rendering DICOM dipertahankan; koreksi MONOCHROME1 tidak dibalik lagi oleh heuristic polarity model legacy. Batch mempertahankan path sumber DICOM walau berkas rendering bernama PNG.
- Launcher buka_aplikasi_offline.bat memakai Node/server.js yang sama, memeriksa port dan HTTP readiness sebelum membuka browser. Tidak ada fallback file:// atau klaim performa perangkat yang belum diukur.
- Asset/service-worker versi4.8.0-style; file JS baru dimasukkan cache dan builder overlay Space.

## Verifikasi

25 Node checks lulus (module controls, DICOM, evidence dan kebijakan keselamatan). Tes DICOM mencakup endianness, signed bits, window, polarity, malformed, unsupported serta batas input. Tujuh pemeriksaan integrasi browser lulus: default modul, DICOM single/batch, skor tetap ada ketika conformal off, alasan nonaktif, mandatory review dan tidak menjalankan model. Suite evidence-integration22, batch28, evidence24 dan offline juga lulus. Screenshot desktop/mobile dibuka untuk pemeriksaan visual. Fixture DICOM adalah citra sintetis2×2, bukan pasien atau evaluasi akurasi klinis.

Eksekusi launcher pada Windows asli, DICOM dari berbagai vendor klinis, dan parity inferensi model kandidat di browser masih belum diverifikasi. Perubahan ini tidak menyelesaikan validasi klinis atau eksperimen independen yang masih tertunda.
