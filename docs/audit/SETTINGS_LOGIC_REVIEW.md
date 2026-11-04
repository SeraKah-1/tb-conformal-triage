# Pengaturan dan konsistensi proses

4 November2026. Sakelar sebelumnya tersedia di panel utama, tetapi tidak ada di Pengaturan. Penempatan tersebut diperbaiki: IQA/OOD/conformal berada di dialog Pengaturan, sementara halaman utama menampilkan status dan akses ke dialog. Tidak ada sakelar duplikat. Keyboard tetap fokus pada sakelar setelah nilainya berubah.

Perbaikan logika yang dibuktikan:

- Satu batch memakai satu snapshot pengaturan, diambil saat proses dimulai. Perubahan pengaturan berlaku untuk proses berikutnya, tidak mengubah gambar berikut di batch yang sedang berjalan.
- Hasil teknis reject/error menyimpan module_configuration dan source_dicom. Metadata bertahan setelah penyimpanan dan reload IndexedDB sehingga retry tidak kehilangan asal rendering DICOM.
- Input DICOM baru membersihkan hasil sebelumnya sebelum conversion; berkas gagal dibaca menampilkan kegagalan dengan skorN/A. Perlindungan perubahan belum disimpan tetap diperiksa sebelum clear.
- Hasil menampilkan konfigurasi yang melekat padanya. Hasil lama tanpa metadata tidak diasumsikan memakai konfigurasi saat ini.
- Decode/blank guards dan mandatoryreview tetap aktif. Tidak ada perubahan bobot atau threshold.

Uji browser9kasus khusus mencakup mid-batchtoggle, snapshot hasil, rejectionDICOM, persistensiIndexedDB/reload dan stale-resultsetelahinvalidDICOM. Pengujian memakai fixture dan mock tanpa inferensi model. Dukungan DICOM tetap terbatas; Windows native, full-modelWASMparity dan validasi klinis belum dibuktikan oleh perbaikan ini.
