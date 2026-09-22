// Bilingual Localization Module (EN / ID)
// Idiograph-First Clinical UX: Simple, Actionable, 2-Second Visual Rule, Zero Pretentious Academic Slop
// Anti-Emdash Invariant: Strictly Zero Unicode U+2014 characters.

const I18N_DICT = {
    en: {
        brandTitle: "Rapid Chest X-Ray Screening (TB-CXR)",
        brandSub: "Rapid Chest X-Ray Screening Assistant &bull; 100% Offline In-Browser &bull; WHO Standard Calibrated",
        tabSingle: "Single Patient Screening",
        tabBatch: "Batch Multi-Patient Screening",
        uploadTitle: "Drop Chest Radiograph or Click to Browse",
        uploadDesc: "Supports JPG or PNG radiographs. Image brightness and contrast are auto-adjusted.",
        uploadSub: "Accepts digital radiograph files or direct camera photos of X-ray films.",
        btnSubmit: "Analyze Radiograph",
        btnCamera: "Take Photo via Camera",
        samplesTitle: "Verified Clinical Benchmark Cases",
        sample1: "Sample 1: Active TB (Evident Lesion)",
        sample2: "Sample 2: Healthy Control (Clear Lungs)",
        sample3: "Sample 3: Subtle TB (Upper Lung Infiltrate)",
        emptyTitle: "Ready for Chest Radiograph",
        emptyDesc: "Upload a chest X-ray or select a benchmark case on the left to run calibrated instant screening.",
        loadingTitle: "Analyzing Chest Radiograph...",
        loadingSub: "Screening lung fields and detecting signs of active TB lesions...",
        viewerTitle: "Lung Lesion Detection Map",
        viewerBadge: "Suspected TB Zones",
        modeSplit: "Split Slider",
        modeOrig: "Original",
        modeHeat: "Highlight Lesions",
        legendLeft: "< Original Chest X-Ray (Thoracic Anatomy)",
        legendRight: "Suspected Lesion Area (Color) >",
        probTb: "TB Risk Score",
        probNorm: "Clear Lungs Confidence",
        probTbSub: "TCM sputum test advised if risk exceeds 44.0%",
        probNormSub: "WHO clear benchmark: confidence at or above 95.0%",
        techAuditTitle: "Technical Audit & Regulatory Data (For Clinicians & Auditors)",
        lblSet: "Conformal Prediction Set",
        lblAction: "System Decision Code",
        lblOod: "Image Distribution Quality",
        lblLatency: "Local Processing Speed",
        batchDropTitle: "Drop Batch Radiographs or Folder for Parallel Screening",
        batchDropDesc: "Screen dozens of chest radiographs in seconds on this computer without internet. Results summarize in real time and export to CSV/Excel.",
        btnBatchStart: "Start Batch Screening",
        btnBatchCsv: "Export Clinical CSV Roster",
        kpiTotal: "Total Screened",
        kpiNormal: "Normal (Clear)",
        kpiTb: "High Risk (TCM Test)",
        kpiRef: "Doctor Review Needed",
        modalTitle: "Clinical Decision Support Notice (Early Chest Radiograph Triage)",
        modalDesc1: "This application is a clinical decision support assistant designed to assist physicians and healthcare providers in rapid screening of pulmonary tuberculosis on chest radiographs at primary care facilities.",
        modalPoint1: "Clinical Confirmation Required: AI recommendations serve as an early triage aid and never supersede expert clinical evaluation or microbiological bacteriological confirmation (sputum GeneXpert / culture).",
        modalPoint2: "Patient Data Privacy: Radiographs are processed ephemerally in volatile memory directly inside your browser and immediately discarded. No patient identifiers are stored or transmitted.",
        modalAgree: "I certify that I am a qualified clinician or researcher, and I accept the terms above.",
        modalAccept: "Start Screening Examination",
        statusConnecting: "PREPARING...",
        statusOnline: "READY (ONLINE)",
        statusDegraded: "LOCAL OFFLINE MODE",
        actionNormalBadge: "LOW RISK (NORMAL)",
        actionNormalTitle: "Result: Clear Lungs (No Active TB Signs Detected)",
        actionNormalDesc: "Both lung fields appear clear with no active TB infiltrates or cavities. No further sputum testing required at this time; safe for routine follow-up.",
        actionTbBadge: "HIGH RISK (TB SUSPECTED)",
        actionTbTitle: "WARNING: Suspected Active Pulmonary TB",
        actionTbDesc: "Significant suspicious lesions detected in highlighted lung zones. CLINICAL ACTION: Collect sputum for TCM GeneXpert test immediately and refer to attending physician.",
        actionRefBadge: "DOCTOR REVIEW NEEDED",
        actionRefTitle: "BORDERLINE: Physician Evaluation Required",
        actionRefDesc: "Lung markings fall between normal vascular shadows and subtle infiltrates. System withholds automatic conclusion for patient safety. CLINICAL ACTION: Direct physician review and clinical symptom check required.",
        rejectColorTitle: "Color Photo / Not a Chest X-Ray",
        rejectColorDesc: "This system only analyzes monochrome frontal chest radiographs. Color photos or everyday objects cannot be screened.",
        rejectDocTitle: "Non-Radiograph Image (Document / Blank Page)",
        rejectDocDesc: "Image pattern indicates a text document, paper form, or blank page.",
        rejectContrastTitle: "Low Image Dynamic Range / Contrast",
        rejectContrastDesc: "The radiograph is too dark, overexposed, or washed out; lung markings cannot be resolved.",
        rejectAspectTitle: "Non-Standard Aspect Ratio",
        rejectAspectDesc: "Image aspect ratio is outside standard thoracic range (0.65 - 1.55). Ensure the thoracic cavity is not cropped.",
        rejectResTitle: "Insufficient Resolution",
        rejectResDesc: "Image resolution is below 256x256 pixels. A sharper image is required to resolve subtle infiltrates.",
        rejectCompressionTitle: "Image Compression Too Heavy",
        rejectCompressionDesc: "The image is degraded by heavy compression artifacts; lung textures cannot be resolved. Please upload the original image file.",
        actionRejectBadge: "PRE-ANALYTIC REJECTION",
        actionOodBadge: "NON-STANDARD IMAGE QUALITY",
        actionOodTitle: "X-Ray Does Not Match Standard Chest View",
        actionOodDesc: "Image anatomy deviates from standard upright chest views (e.g. rotated, clipped edges, or non-chest image). ACTION: Retake upright frontal chest radiograph.",
        batchStatusProcessing: "Processing...",
        batchStatusRejected: "Rejected",
        batchStatusSuccess: "Completed",
        batchStatusFailed: "Failed"
    },
    id: {
        brandTitle: "Skrining Rontgen Dada Tuberkulosis (TB-CXR)",
        brandSub: "Asisten Skrining Rontgen Dada Cepat &bull; 100% Offline Tanpa Internet &bull; Terkalibrasi Standar WHO",
        tabSingle: "Pemeriksaan Satu Pasien",
        tabBatch: "Skrining Banyak Pasien Sekaligus",
        uploadTitle: "Pilih atau Tarik Foto Rontgen Dada ke Sini",
        uploadDesc: "Mendukung file foto rontgen JPG atau PNG. Kecerahan dan kontras gambar disesuaikan secara otomatis.",
        uploadSub: "Bisa menggunakan file rontgen digital maupun foto langsung dari film rontgen.",
        btnSubmit: "Periksa Foto Rontgen",
        btnCamera: "Ambil Foto via Kamera Ponsel",
        samplesTitle: "Contoh Kasus Klinis Terverifikasi",
        sample1: "Contoh 1: TB Aktif Jelas (Bercak Nyata)",
        sample2: "Contoh 2: Pasien Sehat (Paru Bersih Normal)",
        sample3: "Contoh 3: TB Bercak Halus (Puncak Paru)",
        emptyTitle: "Siap Memeriksa Foto Rontgen",
        emptyDesc: "Unggah foto rontgen dada atau pilih salah satu contoh kasus di sebelah kiri untuk menjalankan pemeriksaan triase instan.",
        loadingTitle: "Memeriksa Foto Rontgen Dada...",
        loadingSub: "Sedang meneliti corakan paru dan mencari tanda bercak TB aktif...",
        viewerTitle: "Peta Deteksi Lesi Paru",
        viewerBadge: "Area Curiga TB",
        modeSplit: "Bagi Dua (Geser)",
        modeOrig: "Foto Asli",
        modeHeat: "Sorot Bercak",
        legendLeft: "< Foto Rontgen Asli (Anatomi)",
        legendRight: "Area Curiga TB (Warna) >",
        probTb: "Tingkat Risiko TB",
        probNorm: "Keyakinan Paru Bersih",
        probTbSub: "Batas anjuran tes dahak TCM: jika risiko di atas 44.0%",
        probNormSub: "Standar acuan WHO paru sehat: keyakinan di atas 95.0%",
        techAuditTitle: "Rincian Teknis & Audit Regulasi AI (Untuk Dokter & Auditor)",
        lblSet: "Himpunan Prediksi Konformal",
        lblAction: "Kode Keputusan Sistem",
        lblOod: "Validitas Distribusi Citra",
        lblLatency: "Kecepatan Proses Lokal",
        batchDropTitle: "Tarik Kumpulan Foto Rontgen atau Folder ke Sini",
        batchDropDesc: "Periksa puluhan foto rontgen dalam hitungan detik langsung di komputer ini tanpa internet. Hasil terangkum otomatis dan dapat diunduh ke tabel CSV/Excel.",
        btnBatchStart: "Mulai Skrining Massal",
        btnBatchCsv: "Ekspor Daftar Hasil (CSV)",
        kpiTotal: "Total Foto Diperiksa",
        kpiNormal: "Paru Bersih (Aman)",
        kpiTb: "Curiga TB (Tes Dahak)",
        kpiRef: "Perlu Dicek Dokter",
        modalTitle: "Pemberitahuan Pendukung Keputusan Medis (Triase Awal Rontgen Dada)",
        modalDesc1: "Aplikasi ini adalah asisten pendukung keputusan klinis untuk membantu dokter dan perawat menyaring dugaan Tuberkulosis paru secara cepat pada foto rontgen dada di fasyankes primer.",
        modalPoint1: "Konfirmasi Medis Wajib: Hasil sistem bertindak sebagai pemilah awal dan tidak pernah menggantikan pemeriksaan dokter serta uji laboratorium dahak (TCM GeneXpert / kultur).",
        modalPoint2: "Privasi Pasien 100% Terjamin: Seluruh foto rontgen diproses secara aman langsung di memori komputer Anda dan tidak pernah dikirim ke internet atau server pihak ketiga.",
        modalAgree: "Saya mengonfirmasi bahwa saya adalah tenaga medis atau peneliti, dan memahami batasan klinis di atas.",
        modalAccept: "Mulai Pemeriksaan Rontgen",
        statusConnecting: "MEMPERSIAPKAN...",
        statusOnline: "SIAP (ONLINE)",
        statusDegraded: "MODE OFFLINE LOKAL",
        actionNormalBadge: "RISIKO RENDAH (NORMAL)",
        actionNormalTitle: "Hasil: Paru Bersih (Tidak Tampak Tanda TB)",
        actionNormalDesc: "Kedua lapang paru tampak bersih tanpa infiltrat atau kavitas TB aktif. Pasien tidak memerlukan pemeriksaan dahak lanjutan saat ini dan aman untuk kontrol rutin.",
        actionTbBadge: "RISIKO TINGGI (CURIGA TB PARU)",
        actionTbTitle: "PERHATIAN: Dicurigai Kuat Terdapat TB Paru Aktif",
        actionTbDesc: "Ditemukan kecurigaan kuat lesi/bercak aktif pada area paru yang ditandai warna merah. TINDAKAN MEDIS: Segera kumpulkan dahak pasien untuk tes TCM (GeneXpert) dan laporkan ke dokter penanggung jawab.",
        actionRefBadge: "PERLU PEMERIKSAAN DOKTER",
        actionRefTitle: "HASIL MERAGUKAN: Wajib Dievaluasi Dokter",
        actionRefDesc: "Tampak bayangan paru yang meragukan antara corakan normal atau bercak awal. Sistem menahan kesimpulan otomatis demi keselamatan pasien. TINDAKAN MEDIS: Mintakan pembacaan langsung oleh dokter atau lakukan evaluasi gejala klinis (batuk/demam).",
        rejectColorTitle: "Foto Berwarna / Bukan Rontgen Dada",
        rejectColorDesc: "Sistem ini hanya dapat menganalisis foto rontgen dada hitam-putih. Foto benda sehari-hari atau foto berwarna tidak dapat diperiksa.",
        rejectDocTitle: "Bukan Foto Rontgen Dada (Dokumen / Halaman Kosong)",
        rejectDocDesc: "Pola gambar mengindikasikan dokumen teks, kertas resep, atau halaman kosong.",
        rejectContrastTitle: "Kontras Foto Terlalu Rendah / Gelap / Putih",
        rejectContrastDesc: "Foto rontgen terlalu gelap atau terlalu terang sehingga corakan lapang paru tidak terbaca.",
        rejectAspectTitle: "Bentuk / Rasio Foto Tidak Sesuai",
        rejectAspectDesc: "Proporsi bentuk foto di luar batas rontgen dada wajar (0.65 - 1.55). Pastikan rongga dada tidak terpotong.",
        rejectResTitle: "Resolusi Foto Terlalu Kecil",
        rejectResDesc: "Ukuran foto di bawah 256x256 piksel. Dibutuhkan foto yang lebih tajam agar bercak halus terlihat.",
        rejectCompressionTitle: "Kualitas Foto Terlalu Pecah / Buram",
        rejectCompressionDesc: "Foto mengalami kompresi yang sangat berat sehingga gambar berkotak-kotak/pecah. Mohon gunakan file foto asli.",
        actionRejectBadge: "FOTO TIDAK SESUAI SYARAT",
        actionOodBadge: "POSISI / KUALITAS FOTO TIDAK SESUAI",
        actionOodTitle: "Foto Rontgen Berbeda dari Standar Dada",
        actionOodDesc: "Susunan gambar berbeda dari foto rontgen dada standar (misalnya posisi miring, rongga dada terpotong, atau bukan rontgen dada). TINDAKAN: Ulangi pemotretan rontgen dengan posisi dada tegak lurus.",
        batchStatusProcessing: "Sedang Memeriksa...",
        batchStatusRejected: "Ditolak (Foto Rusak)",
        batchStatusSuccess: "Selesai",
        batchStatusFailed: "Gagal"
    }
};

let currentLang = 'id';

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'id' : 'en';
    applyLanguage(currentLang);
    const badge = document.getElementById('txt-lang-badge');
    if (badge) badge.innerText = currentLang.toUpperCase();
}

function applyLanguage(lang) {
    const t = I18N_DICT[lang] || I18N_DICT.id;
    
    // Header
    const brandTitle = document.getElementById('txt-brand-title');
    if (brandTitle) brandTitle.innerText = t.brandTitle;
    const brandSub = document.getElementById('txt-sub');
    if (brandSub) brandSub.innerHTML = t.brandSub;

    // Tabs
    const tabSingle = document.getElementById('txt-tab-single');
    if (tabSingle) tabSingle.innerText = t.tabSingle;
    const tabBatch = document.getElementById('txt-tab-batch');
    if (tabBatch) tabBatch.innerText = t.tabBatch;

    // Single Panel
    const uploadTitle = document.getElementById('txt-upload-title');
    if (uploadTitle) uploadTitle.innerText = t.uploadTitle;
    const uploadDesc = document.getElementById('txt-upload-desc');
    if (uploadDesc) uploadDesc.innerText = t.uploadDesc;
    const uploadSub = document.getElementById('txt-upload-sub');
    if (uploadSub && t.uploadSub) uploadSub.innerText = t.uploadSub;
    const btnSubmit = document.getElementById('txt-btn-submit');
    if (btnSubmit) btnSubmit.innerText = t.btnSubmit;
    const btnCamera = document.getElementById('txt-btn-camera');
    if (btnCamera) btnCamera.innerText = t.btnCamera;
    const samplesTitle = document.getElementById('txt-samples-title');
    if (samplesTitle) samplesTitle.innerText = t.samplesTitle;

    // Sample Case Labels
    const sample1Name = document.getElementById('sample-1-name');
    if (sample1Name) sample1Name.innerText = t.sample1;
    const sample2Name = document.getElementById('sample-2-name');
    if (sample2Name) sample2Name.innerText = t.sample2;
    const sample3Name = document.getElementById('sample-3-name');
    if (sample3Name) sample3Name.innerText = t.sample3;

    // Empty & Loading States
    const emptyTitle = document.getElementById('txt-empty-title');
    if (emptyTitle) emptyTitle.innerText = t.emptyTitle;
    const emptyDesc = document.getElementById('txt-empty-desc');
    if (emptyDesc) emptyDesc.innerText = t.emptyDesc;
    const loadingTitle = document.getElementById('txt-loading-title');
    if (loadingTitle) loadingTitle.innerText = t.loadingTitle;
    const loadingSub = document.getElementById('txt-loading-sub');
    if (loadingSub) loadingSub.innerText = t.loadingSub;

    // Viewer
    const viewerTitle = document.getElementById('txt-viewer-title');
    if (viewerTitle) viewerTitle.innerText = t.viewerTitle;
    const viewerBadge = document.getElementById('txt-viewer-badge');
    if (viewerBadge) viewerBadge.innerText = t.viewerBadge;
    const btnSplit = document.getElementById('btn-mode-split');
    if (btnSplit) btnSplit.innerText = t.modeSplit;
    const btnOrig = document.getElementById('btn-mode-orig');
    if (btnOrig) btnOrig.innerText = t.modeOrig;
    const btnHeat = document.getElementById('btn-mode-heat');
    if (btnHeat) btnHeat.innerText = t.modeHeat;
    const legLeft = document.getElementById('txt-legend-left');
    if (legLeft) legLeft.innerText = t.legendLeft;
    const legRight = document.getElementById('txt-legend-right');
    if (legRight) legRight.innerText = t.legendRight;

    // Probabilities
    const probTb = document.getElementById('txt-prob-tb');
    if (probTb) probTb.innerText = t.probTb;
    const probNorm = document.getElementById('txt-prob-norm');
    if (probNorm) probNorm.innerText = t.probNorm;
    const probTbSub = document.getElementById('txt-prob-tb-sub');
    if (probTbSub) probTbSub.innerText = t.probTbSub;
    const probNormSub = document.getElementById('txt-prob-norm-sub');
    if (probNormSub) probNormSub.innerText = t.probNormSub;

    // Tech Audit Accordion & Meta labels
    const techSummaryTitle = document.getElementById('txt-tech-summary-title');
    if (techSummaryTitle) techSummaryTitle.innerText = t.techAuditTitle;
    const lblSet = document.getElementById('lbl-set');
    if (lblSet) lblSet.innerText = t.lblSet;
    const lblAction = document.getElementById('lbl-action');
    if (lblAction) lblAction.innerText = t.lblAction;
    const lblOod = document.getElementById('lbl-ood');
    if (lblOod) lblOod.innerText = t.lblOod;
    const lblLat = document.getElementById('lbl-lat');
    if (lblLat) lblLat.innerText = t.lblLatency;

    // Batch strings
    const batchDropTitle = document.getElementById('txt-batch-drop-title');
    if (batchDropTitle) batchDropTitle.innerText = t.batchDropTitle;
    const batchDropDesc = document.getElementById('txt-batch-drop-desc');
    if (batchDropDesc) batchDropDesc.innerText = t.batchDropDesc;
    const btnBatchStart = document.getElementById('txt-btn-batch-start');
    if (btnBatchStart) btnBatchStart.innerText = t.btnBatchStart;
    const btnBatchCsv = document.getElementById('txt-btn-batch-csv');
    if (btnBatchCsv) btnBatchCsv.innerText = t.btnBatchCsv;
    const kpiTotal = document.getElementById('txt-kpi-total');
    if (kpiTotal) kpiTotal.innerText = t.kpiTotal;
    const kpiNormal = document.getElementById('txt-kpi-normal');
    if (kpiNormal) kpiNormal.innerText = t.kpiNormal;
    const kpiTb = document.getElementById('txt-kpi-tb');
    if (kpiTb) kpiTb.innerText = t.kpiTb;
    const kpiRef = document.getElementById('txt-kpi-ref');
    if (kpiRef) kpiRef.innerText = t.kpiRef;

    // Modal
    const modalTitle = document.getElementById('txt-modal-title');
    if (modalTitle) modalTitle.innerText = t.modalTitle;
    const modalDesc1 = document.getElementById('txt-modal-desc-1');
    if (modalDesc1) modalDesc1.innerText = t.modalDesc1;
    const modalPoint1 = document.getElementById('txt-modal-point-1');
    if (modalPoint1) modalPoint1.innerText = t.modalPoint1;
    const modalPoint2 = document.getElementById('txt-modal-point-2');
    if (modalPoint2) modalPoint2.innerText = t.modalPoint2;
    const modalAgree = document.getElementById('txt-modal-agree');
    if (modalAgree) modalAgree.innerText = t.modalAgree;
    const btnModalAccept = document.getElementById('btn-modal-accept');
    if (btnModalAccept) btnModalAccept.innerText = t.modalAccept;

    // Refresh idiograph banner if active
    if (typeof refreshActiveIdiograph === 'function') {
        refreshActiveIdiograph();
    }
}
