# Panduan Operasional Workstation Triase TB Conformal
### Petunjuk Teknis Implementasi Fasilitas Pelayanan Kesehatan Primer (Puskesmas & Daerah 3T)

Dokumen ini menyediakan panduan operasional klinis dan teknis bagi tenaga kesehatan di Puskesmas, klinik pratama, dan rumah sakit daerah dalam mengoperasikan **Workstation Triase TB Conformal (Model v11 Distilled)** secara mandiri dan offline tanpa ketergantungan koneksi internet.

---

## 1. Status Regulasi & Batasan Klinis (SaMD Kelas B)

> [!IMPORTANT]
> **Peringatan Regulasi SaMD (Kemenkes RI / WHO CAD TPP):**
> Perangkat lunak ini diklasifikasikan sebagai *Software as a Medical Device* (SaMD) investigasional Kelas B untuk triase dan skrining awal tuberkulosis paru berbasis foto rontgen dada (CXR). Sistem ini dirancang untuk **triase terarah**, BUKAN penegak diagnosis mutlak.
> * Kasus dengan keluaran **Suspect TB** wajib dirujuk untuk konfirmasi pemeriksaan radiologis formal atau uji molekuler cepat (TCM / GeneXpert MTB/RIF).
> * Kasus dengan status **Defer to Expert / Indeterminate** menandakan citra memiliki ketidakpastian tinggi atau artefak kualitas yang tidak memenuhi syarat kepastian statistik. Kasus ini harus ditinjau langsung oleh dokter atau radiolog.

---

## 2. Privasi Data Medis & Kepatuhan Regulasi

Sesuai dengan **Undang-Undang Perlindungan Data Pribadi (UU PDP No. 27/2022)** dan **Permenkes No. 24/2022 tentang Rekam Medis**:
* **Eksekusi 100% di Memori Lokal (Client-Side RAM):** Seluruh proses inferensi kecerdasan buatan berjalan langsung di peramban (browser) menggunakan teknologi WebAssembly SIMD.
* **Nol Pengiriman Data ke Luar (Zero External Network Transfer):** Citra rontgen dada dan data identitas pasien tidak pernah dikirim ke server luar, cloud, atau pihak ketiga.
* **Dapat Dijalankan Permanen Tanpa Internet (Air-Gapped):** Komputer dapat diputus total dari kabel LAN maupun sambungan Wi-Fi setelah aplikasi tersimpan.

---

## 3. Pilihan Metode Penerapan di Puskesmas

Tersedia 2 metode penerapan fleksibel yang dapat disesuaikan dengan ketersediaan jaringan di faskes:

### Jalur A: Pemasangan Mandiri via Peramban (PWA)
*Pilihan ideal untuk komputer yang memiliki akses internet sesaat saat penyiapan awal.*

1. **Akses Workstation:** Buka peramban Google Chrome atau Microsoft Edge, lalu buka tautan:  
   `https://huggingface.co/spaces/Ressshh/tb-conformal-triage-workstation`
2. **Pasang ke Desktop:** Klik tombol **"Install Application"** di bilah antarmuka atau klik ikon instalasi di ujung kanan bilah alamat URL peramban (Add to Desktop / Install App).
3. **Penyimpanan Berkas Otomatis:** Service Worker (`sw.js`) akan secara otomatis mengunduh dan mengunci bobot model ONNX (26.9 MB) dan pustaka pendukung ke dalam penyimpanan Cache lokal peramban.
4. **Siap Pakai Offline:** Ikon pintasan "TB Conformal Triage" akan muncul di Desktop atau daftar program. Sambungan internet dapat dimatikan seutuhnya.

---

### Jalur B: Paket USB Flashdisk Portabel (100% Air-Gapped)
*Pilihan utama untuk komputer faskes terpencil yang tidak memiliki sambungan internet sama sekali.*

1. **Unduh Paket:** Unduh arsip mandiri [TB_Triage_Portable_Offline_Bundle.zip](https://github.com/SeraKah-1/tb-conformal-triage/releases/download/v2.1.0-workstation/TB_Triage_Portable_Offline_Bundle.zip) (ukuran berkas: 32.8 MB) pada komputer yang memiliki internet.
2. **Ekstrak ke Flashdisk:** Ekstrak seluruh isi arsip ZIP ke dalam USB Flashdisk.
3. **Hubungkan ke Komputer Puskesmas:** Tancapkan USB Flashdisk ke komputer poli atau unit radiologi Puskesmas.
4. **Jalankan Peluncur:**
   * **Untuk Windows:** Klik ganda berkas `buka_aplikasi_offline.bat`.
   * **Untuk Linux:** Jalankan berkas `buka_aplikasi_offline.sh` melalui terminal atau klik ganda.
5. Peramban web lokal akan otomatis terbuka pada alamat `http://localhost:8080/index.html` dengan seluruh aset lokal siap digunakan.

---

## 4. Alur Operasional Pemeriksaan Klinis (5 Langkah)

```
[1. Unggah CXR] -> [2. Audit IQA] -> [3. Inferensi WASM] -> [4. Keputusan Triase] -> [5. Peta Panas HiResCAM]
```

1. **Langkah 1: Unggah Citra Rontgen (CXR)**  
   Tarik dan lepas (drag-and-drop) berkas citra toraks (format JPEG, PNG, atau hasil ekspor DICOM) ke area kanvas kerja di layar.
2. **Langkah 2: Pemeriksaan Kualitas Citra (Pre-Analytic Quality Assurance)**  
   Sistem secara otomatis memeriksa tingkat kecerahan, kontras, serta mendeteksi artefak pemindaian dan kompresi eksternal. Jika citra rusak atau terlalu buram, sistem akan memberikan peringatan pre-analitik.
3. **Langkah 3: Pemrosesan Inferensi Cepat**  
   Model terdistilasi BioMedCLIP mengeksekusi komputasi forward-pass dalam waktu rata-rata 77.5 milidetik pada prosesor CPU standar.
4. **Langkah 4: Evaluasi Keputusan Triase (Conformal Prediction)**  
   Sistem menampilkan skor probabilitas terkalibrasi bersama himpunan prediksi conformal (tingkat keyakinan 90%):
   * **Non-TB:** Himpunan tunggal `{Non-TB}`, risiko rendah lesi aktif.
   * **Suspect TB:** Himpunan tunggal `{TB}`, memerlukan prioritas konfirmasi klinis/TCM.
   * **Rujukan Ahli (Defer to Expert):** Himpunan kosong `∅` atau ganda `{Non-TB, TB}`. Terjadi pada kasus batas (ambigu), variasi anatomi langka, atau noise kompresi tinggi. Keputusan otomatis ditahan demi keselamatan pasien.
5. **Langkah 5: Verifikasi Peta Panas (HiResCAM Localization)**  
   Tinjau visualisasi atensi resolusi tinggi untuk memverifikasi apakah model memfokuskan atensi pada parenkim paru (misalnya kavitas apeks atau infiltrat) dan bukan pada artefak tulang atau label teks.

---

## 5. Spesifikasi Teknis Minimum Komputer

* **Sistem Operasi:** Windows 7/8/10/11 (32-bit atau 64-bit), Linux (Ubuntu, Debian, dsb.), atau macOS.
* **Prosesor (CPU):** Intel Core i3 / AMD setara (generasi 2012 ke atas, mendukung instruksi SIMD dasar).
* **Memori RAM:** Minimum 2 GB RAM (disarankan 4 GB RAM).
* **Peramban Web:** Google Chrome (versi 90+), Microsoft Edge (versi 90+), atau Mozilla Firefox versi baru.
* **Akselerator GPU:** TIDAK DIPERLUKAN (model telah dioptimasi penuh untuk CPU berdaya rendah).

---

## 6. Kontak Peneliti & Dukungan Teknis

Untuk pertanyaan teknis implementasi, pelaporan kendala perangkat keras, atau kebutuhan kolaborasi validasi multisentra:
* **Peneliti Utama:** M. Farrel Aditya
* **Afiliasi:** Fakultas Kedokteran, Universitas Riau, Pekanbaru, Indonesia
* **Surel Korespondensi:** farreladitya38@gmail.com
