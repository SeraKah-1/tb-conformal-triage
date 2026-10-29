UI baru memakai antrean dan detail kasus agar pengguna bisa melihat apa yang belum ditinjau, membuka hasil, lalu menyimpan gambar dan catatan dalam satu alur. Bahasa Indonesia dan Inggris tersedia sejak dialog awal. Tombol memakai label singkat tanpa promosi.

## Alur penggunaan

1. Buka aplikasi dengan `npm start`, lalu akses alamat lokal yang dicetak server. Pilih ID / EN dan terima pemberitahuan penggunaan penelitian.
2. Pilih **Tambah gambar / Add images**. PNG, JPEG, dan WebP diterima; nama berkas sama tetap menjadi kasus berbeda.
3. Pilih **Proses / Process**. Gambar diproses satu per satu. **Batal / Cancel** menghentikan antrean setelah gambar aktif selesai; hasil sebelumnya tetap ada.
4. Buka kasus. Tinjau gambar dan hasil, lalu isi **Catatan / Notes** bila perlu. Hasil model tetap memerlukan review manusia.
5. Pilih **Simpan / Save** untuk menyimpan gambar, hasil, versi model, catatan, tanda, dan status review di browser ini. Pesan berhasil baru muncul setelah penyimpanan selesai.
6. Pilih **Selesai ditinjau / Mark reviewed** untuk mencatat bahwa kasus sudah ditinjau. Ini terpisah dari penyimpanan: tekan Simpan lagi jika perubahan status juga perlu disimpan.
7. **Tersimpan / Saved** membuka arsip, termasuk setelah reload. Membuka arsip tidak menjalankan model kembali. **Ekspor / Export** mengekspor hasil dan catatan yang ditampilkan atau dipilih sebagai CSV; gambar tidak ikut CSV.

Antrean bawaan menampilkan kasus belum ditinjau dahulu, lalu waktu masuk terlama. Ini urutan kerja, bukan penetapan urgensi klinis. Pencarian memakai ID atau nama berkas. Filter tersedia untuk review, tanda, penyimpanan, keluaran model, dan masalah gambar.

## Penyimpanan dan offline

**IndexedDB** (penyimpanan data di browser) memakai database kasus terpisah dari cache model. Gambar tidak masuk cache service worker. Simpan bersifat eksplisit; kasus belum disimpan akan hilang saat sesi ditutup. Storage penuh atau diblokir menghasilkan pesan gagal, bukan status simpan palsu.

Arsip hanya berada pada browser, profil, dan alamat aplikasi ini. Arsip Space dan PWA pada alamat berbeda tidak tersinkron. Menghapus data browser dapat menghapus arsip. Penyimpanan tidak diklaim terenkripsi. CSV merupakan ekspor hasil, bukan backup gambar atau format impor arsip.

Status offline mengikuti keberadaan aset aplikasi dan model di cache versi4.1.0-workflow. Memuat halaman saja tidak diklaim cukup untuk offline. Model baru dimuat ke sesi inferensi ketika pengguna meminta pemrosesan. Riwayat tersimpan memakai versi model saat kasus diproses, bukan otomatis berpindah ke bobot eksperimen baru.

## Bukti pemeriksaan

- `python tests/ui_workflow_browser.py`:38pemeriksaan browser lulus; inferensi diganti fixture, penyimpanan IndexedDB nyata.
- `python tests/ui_offline_browser.py`:8pemeriksaan service worker/offline lulus, tanpa menjalankan model.
- `node --test tests/pwa_safety.test.js tests/server.integration.js`:regresi kebijakan hasil, race pasien, escaping, hash model, dan server lulus.
- Dialog awal diperiksa langsung: ID/EN dapat dipilih, Tab tetap dalam dialog, dan Lanjut mengembalikan fokus ke area utama.
- Review independen dan batas pengujian tercatat di [UI_WORKFLOW_REVIEW.md](UI_WORKFLOW_REVIEW.md). Ini bukan pengujian akurasi model atau validasi klinis.

Preview di `/workspace/audit-tb/ui-review/` memakai hasil sintetis yang diberi catatan. Tidak ada angka eksperimen baru di preview tersebut. Ukuran layar diuji390px dan1440px; performa perangkat kentang belum dibenchmark.

## Paket Space

`tools/build_space_ui_bundle.py` membuat ZIP overlay dari sumber PWA yang sama untuk Space statis `Ressshh/tb-conformal-triage-workstation`. ZIP memuat UI, cache worker, dan manifest hash; vendor, model, ikon aplikasi, serta sampel lama harus tetap tersedia di Space. Tidak ada token, arsip kasus, atau gambar pengguna dalam paket. Tool tidak melakukan deploy.

Buat paket baru dengan path yang belum ada:

```bash
python tools/build_space_ui_bundle.py --output /workspace/audit-tb/ui-review/space-ui-overlay.zip
```

Source dan paket dipisahkan dari deployment. Status push dan Space harus dinilai dari commit remote serta pemeriksaan aplikasi live, bukan keberadaan ZIP.

## Antrean besar dan logo

Versi4.1 menampilkan maksimal50kasus per halaman, dengan jumlah hasil sesuai pencarian/filter dan kontrol halaman. Ekspor CSV tetap memuat semua hasil yang difilter atau dipilih, bukan hanya halaman aktif. Ringkasan yang dapat diklik memisahkan belum ditinjau, masalah gambar, peringatan IQA, masalah OOD, dan set conformal ambigu/kosong. Kelompok dapat tumpang tindih; jumlahnya tidak boleh dijumlahkan sebagai pasien unik. Detail kasus memperlihatkan status ketiga mekanisme secara terpisah.

`python tests/ui_scale_browser.py` memeriksa1001record sintetis, bukan1001inferensi radiograf asli. Pembatasan DOM mengurangi beban tampilan; seluruh record/file dan heatmap masih ditahan di memori, serta arsip masih dimuat melalui getAll. Tidak ada klaim kapasitas atau kecepatan ribuan gambar asli pada perangkat terbatas. Browser tertutup tetap menghilangkan kasus yang belum disimpan. Antrean baru berurutan; empat promise legacy bukan bukti inferensi paralel.

Logo baru di `assets/brand.svg` berukuran522byte. PNG untuk ikon pemasangan berukuran sekitar7KB dan20KB; tidak menambah library, font, atau animasi. Logo SVG yang sama dipakai header dan favicon, dengan ikon pemasangan sebagai fallback. Paket Space menyertakan aset baru ini.

Audit IQA/conformal/OOD dan perbaikan grid kompresi dijelaskan di [PWA_MECHANISM_REVIEW.md](PWA_MECHANISM_REVIEW.md). Formula conformal dan OOD browser berjalan, tetapi parameter legacy serta perbedaan OOD Python/browser membatasi kesimpulan. Model eksperimen baru tidak dipasang sebelum verifikasi hasil selesai.
