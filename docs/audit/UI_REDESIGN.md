Halaman awal kembali ke alur langsung: pilih gambar, tekan Proses, lalu lihat hasil di sebelah input. Antrean dan arsip menjadi menu tambahan agar pemeriksaan satu gambar tidak memerlukan dashboard. Bahasa Indonesia dan Inggris tersedia sejak dialog awal. Tombol memakai label singkat tanpa promosi.

## Alur penggunaan

1. Buka aplikasi dengan `npm start`, lalu akses alamat lokal yang dicetak server. Pilih ID / EN dan terima pemberitahuan penggunaan penelitian.
2. Pada **Periksa / Check**, pilih **Tambah gambar / Add images**, lalu **Proses / Process**. Hasil tampil langsung di panel sebelahnya. **Batch** digunakan hanya jika ingin memproses banyak gambar. PNG, JPEG, dan WebP diterima; nama berkas sama tetap menjadi kasus berbeda.
3. Pada Batch, tambahkan beberapa gambar lalu pilih **Proses / Process**. Gambar diproses satu per satu. **Batal / Cancel** menghentikan antrean setelah gambar aktif selesai; hasil sebelumnya tetap ada.
4. Pada Periksa, hasil langsung terlihat setelah proses selesai; pada Batch/Tersimpan, buka kasus yang dipilih. Catatan dan tindakan simpan berada setelah hasil. Isi **Catatan / Notes** bila perlu. Hasil model tetap memerlukan review manusia.
5. Pilih **Simpan / Save** untuk menyimpan gambar, hasil, versi model, catatan, tanda, dan status review di browser ini. Pesan berhasil baru muncul setelah penyimpanan selesai.
6. Pilih **Selesai ditinjau / Mark reviewed** untuk mencatat bahwa kasus sudah ditinjau. Ini terpisah dari penyimpanan: tekan Simpan lagi jika perubahan status juga perlu disimpan.
7. **Tersimpan / Saved** membuka arsip, termasuk setelah reload. Membuka arsip tidak menjalankan model kembali. **Ekspor / Export** mengekspor hasil dan catatan yang ditampilkan atau dipilih sebagai CSV; gambar tidak ikut CSV.

Antrean bawaan menampilkan kasus belum ditinjau dahulu, lalu waktu masuk terlama. Ini urutan kerja, bukan penetapan urgensi klinis. Pencarian memakai ID atau nama berkas. Filter tersedia untuk review, tanda, penyimpanan, keluaran model, dan masalah gambar.

## Penyimpanan dan offline

**IndexedDB** (penyimpanan data di browser) memakai database kasus terpisah dari cache model. Gambar tidak masuk cache service worker. Simpan bersifat eksplisit; kasus belum disimpan akan hilang saat sesi ditutup. Storage penuh atau diblokir menghasilkan pesan gagal, bukan status simpan palsu.

Arsip hanya berada pada browser, profil, dan alamat aplikasi ini. Arsip Space dan PWA pada alamat berbeda tidak tersinkron. Menghapus data browser dapat menghapus arsip. Penyimpanan tidak diklaim terenkripsi. CSV merupakan ekspor hasil, bukan backup gambar atau format impor arsip.

Status offline mengikuti keberadaan aset aplikasi dan model di cache versi4.2.0-workflow. Memuat halaman saja tidak diklaim cukup untuk offline. Model baru dimuat ke sesi inferensi ketika pengguna meminta pemrosesan. Riwayat tersimpan memakai versi model saat kasus diproses, bukan otomatis berpindah ke bobot eksperimen baru.

## Bukti pemeriksaan

- `python tests/ui_single_browser.py`:34pemeriksaan alur satu gambar lulus; decode/FileReader/submit nyata, model diganti fixture.
- `python tests/ui_workflow_browser.py`:39pemeriksaan batch/arsip lulus; model diganti fixture, penyimpanan IndexedDB nyata.
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

## Koreksi alur v4.2

Umpan balik pengguna mengganti dashboard sebagai halaman awal. Menu sekarang Periksa, Batch, Tersimpan, dan Panduan. Input, Proses, dan hasil kembali terlihat bersamaan pada Periksa. Ringkasan/filter tetap berada di Batch. Tidak ada langkah membuka kasus tambahan setelah inferensi tunggal. Catatan/simpan berada setelah gambar dan hasil; informasi model tetap dapat dibuka bila diperlukan.

Hasil tunggal masuk daftar sesi agar dapat disimpan, tanpa auto-save. Proses ulang file yang sama memakai ID yang sama dan mengembalikan status review menjadi belum ditinjau. Nama berkas sama tidak menggabungkan file berbeda. Pindah menu mempertahankan pilihan file dan hasil; hasil lama tidak muncul selama proses ulang. Memilih file baru atau membuka kasus lain tetap mempertahankan pengaman identitas hasil.

Koreksi ini diuji lokal dan dikemas terpisah. Pengguna kemudian mengizinkan pembaruan UI v4.3. Status rilis harus diperiksa dari commit remote dan aplikasi live. Tidak ada bobot atau parameter penelitian baru dipasang.

## Perbaikan menu dan arsip v4.3

Status sudah ditinjau kini terikat pada generasi hasil. Kasus mengantre/diproses/gagal tidak dapat diberi status review, dan hasil baru selalu memerlukan review baru. Pesan Simpan hanya berlaku pada kasus serta revisi yang benar. Menghapus kasus juga membatalkan penerapan hasil tertunda untuk file itu, sehingga kasus tidak muncul kembali.

Batch memiliki Proses daftar dan Proses terpilih dengan jumlah cakupan eksplisit; filter berlaku untuk seluruh halaman daftar, bukan hanya50baris DOM. Progress dihitung per run, bukan dicampur riwayat. Gambar yang ditambahkan ketika run berjalan tetap mengantre untuk run berikutnya. Retry bersifat eksplisit untuk kegagalan teknis; tidak ada retry otomatis tanpa batas. Tersimpan tidak menampilkan atau menjalankan tombol unggah/proses.

Periksa menampilkan preview sebelum Proses dan tombol Baru. Panel Pengaturan menyediakan estimasi penyimpanan, status offline, identitas model, serta Backup/Pulihkan. Backup mencakup snapshot tersimpan beserta bytes gambar, hasil dan catatan. Perubahan belum disimpan tidak diklaim ikut; pemilihan kasus kotor ditolak sampai disimpan. CSV tetap hanya ekspor hasil, bukan backup.

Pemulihan memvalidasi seluruh container, versi, metadata hasil, tipe/ukuran/gambar yang dapat didecode dan SHA256 gambar sebelum transaksi penambahan atomik. ID yang sudah ada dilewati tanpa overwrite; duplikasi ID di dalam berkas ditolak. Kesalahan/quota membatalkan seluruh transaksi. Batas64MiB/berkas,48MiBbytes gambar,16MiB/gambar,500kasus diberitahukan; pilih lebih sedikit kasus bila melebihi. Arsip tidak ditandatangani secara kriptografis dan bukan bukti kebenaran klinis. File/gambar nonvalid tidak dipulihkan. Tidak ada inferensi atau pengiriman gambar ke server selama Backup/Pulihkan.

Pembaruan UI v4.3 diizinkan pengguna; bukti rilis dicatat terpisah dari hasil pengujian lokal. Keterbatasan memori/getAll/heatmap serta belum adanya antrean komputasi berbasis disk dengan resume tetap berlaku; fitur backup tidak mengubahnya menjadi sistem ribuan gambar yang sudah dibenchmark.


## Batch v4.4

Unggah mendukung banyak berkas, pemilih folder beserta subfolder, dan seret folder. Nama lokasi relatif disimpan agar nama berkas yang sama dapat dibedakan. Pemrosesan tetap satu per satu; menerima 1.000 berkas bukan bukti throughput atau batas memori inferensi 1.000 gambar.

Baris hasil memiliki tombol Heatmap; Kembali tersedia pada daftar dan penampil. Heatmap memakai hasil tersimpan dan tidak menjalankan model lagi. Jika heatmap tidak tersedia, hanya gambar asli yang ditampilkan dan mode aktivasi dinonaktifkan.

Satu aksi Proses utama mengikuti ada/tidaknya pilihan. Aksi sekunder ada di Lainnya; kelompok pemeriksaan tambahan dapat dibuka sesuai kebutuhan. Merah menandai skor tinggi atau kegagalan, kuning peringatan/ambiguitas, hijau pemeriksaan yang lolos atau status tersimpan, biru informasi. Warna selalu disertai teks dan tidak menetapkan urgensi klinis atau kelayakan pemulangan.

Ekspor utama XLSX: header beku, filter kolom, lebar kolom, catatan multibaris, skor numerik dalam format persen. Teks yang diawali `=` tetap sel teks. CSV UTF-8 tetap tersedia di Lainnya. Ekspor memakai pilihan lintas halaman, atau daftar sesuai filter jika tidak ada pilihan. Sel melebihi batas 32.767 karakter menampilkan pesan agar memakai CSV; isi tidak dipotong diam-diam.

Reset sesi meminta konfirmasi, diblokir saat proses/impor/penyimpanan aktif, membuang sesi dan perubahan belum disimpan, serta mempertahankan IndexedDB. Kasus tersimpan dibuka kembali lewat Tersimpan. Reset bukan Hapus arsip.

Uji browser mencakup pemilih folder nyata 1.000 gambar kecil, 50 baris per halaman, pilihan seluruh halaman, XLSX dibaca kembali oleh openpyxl, formula/Unicode/baris baru, heatmap tersedia/tidak tersedia, pembatalan reset, arsip tetap tersimpan, dan kegagalan baca folder tanpa impor parsial. Tidak ada training atau inferensi berat lokal.


## Loading v4.5

Panel status ID/EN menampilkan fase nyata: baca folder/berkas, decode gambar, IQA, persiapan atau unduhan model, inferensi, dan pembuatan heatmap. Persentase unduhan berasal dari byte yang diterima; bukan persentase keseluruhan inferensi. Model dari cache diberi status persiapan, bukan unduhan jaringan. Antrean menampilkan nama gambar aktif, jumlah berhasil diproses, gagal, dibatalkan, dan dihapus dari antrean. Waktu berjalan diukur dari pekerjaan aktual, tanpa perkiraan selesai palsu.

Pengecatan UI diberi kesempatan sebelum komputasi; fallback timer mencegah proses bergantung sepenuhnya pada animation frame di tab tersembunyi. Animasi menghormati reduced motion. Setelah fase berjalan 15 detik, keterangan menjelaskan proses masih berlangsung dan durasi bergantung pada perangkat. Loading tidak mempercepat komputasi atau menjamin kelancaran animasi saat WASM memakai main thread.

Token pekerjaan mencegah callback lama menutup pekerjaan yang lebih baru. Reset sesi membersihkan status pekerjaan yang telah selesai; pembatalan menunggu gambar aktif lalu menghentikan antrean. Skor TB ditampilkan di setiap baris, dengan nilai presisi penuh di tooltip dan nilai numerik tetap tersedia pada Excel.

Paket contoh 100 gambar berlabel healthy sengaja diambil dari bagian training proyek. Prediksi yang sama kelasnya tidak berarti nilai skornya sama. Kode menghitung skor dari logits per input dan tidak menetapkan hasil dari label/nama berkas. Pengujian dua input memakai decode nyata dan sesi ORT tiruan dengan logits berbeda untuk memeriksa pemetaan hasil serta loading; ini bukan pemeriksaan ulang akurasi 100 gambar oleh model asli. Tidak ada inferensi berat lokal atau perubahan model/ambang keputusan.
