// Shared ID/EN strings. Labels are short; safety and error explanations stay explicit.
const I18N_DICT = {
    "en": {
        "brandTitle": "TB-CXR",
        "brandSub": "Research tool. Clinician review required.",
        "tabSingle": "Single image",
        "tabBatch": "Multiple images",
        "uploadTitle": "Add image",
        "uploadDesc": "Choose a PNG, JPEG, or WebP image.",
        "uploadSub": "Use a clear frontal chest radiograph.",
        "btnSubmit": "Process",
        "btnCamera": "Camera",
        "samplesTitle": "Sample images",
        "sample1": "TB sample",
        "sample2": "Non-TB sample",
        "sample3": "Apical sample",
        "emptyTitle": "Not processed",
        "emptyDesc": "Add an image, then select Process.",
        "loadingTitle": "Processing",
        "loadingSub": "Wait for processing to finish.",
        "viewerTitle": "Model map",
        "viewerBadge": "Model activation",
        "modeSplit": "Compare",
        "modeOrig": "Original",
        "modeHeat": "Overlay",
        "legendLeft": "Original image",
        "legendRight": "Model activation",
        "probTb": "TB score",
        "probNorm": "Non-TB score",
        "probTbSub": "The model score is not a diagnosis. A clinician determines further assessment.",
        "probNormSub": "This score does not establish healthy lungs or exclude TB.",
        "techAuditTitle": "Technical details",
        "lblSet": "Prediction set",
        "lblAction": "Result code",
        "lblOod": "Image distribution",
        "lblLatency": "Processing time",
        "batchDropTitle": "Add images",
        "batchDropDesc": "Add images, then process. Results can be exported as CSV.",
        "btnBatchStart": "Process",
        "btnBatchCsv": "Export CSV",
        "kpiTotal": "Total",
        "kpiNormal": "Low score",
        "kpiTb": "High score",
        "kpiRef": "Review needed",
        "modalTitle": "Research use",
        "modalDesc1": "This application supports review of model outputs on chest radiographs for research.",
        "modalPoint1": "Clinician review is required. Results do not replace clinical assessment or confirmatory TB testing.",
        "modalPoint2": "Images are processed in the browser. Selecting Save stores the image and result in this browser on this device.",
        "modalAgree": "I am a healthcare professional or researcher and understand these limitations.",
        "modalAccept": "Continue",
        "statusConnecting": "Preparing",
        "statusOnline": "Connected",
        "statusDegraded": "Local processing",
        "actionNormalBadge": "Review required",
        "actionNormalTitle": "Low score",
        "actionNormalDesc": "Low model score. Clinician review remains required; this result does not exclude TB or authorize patient discharge.",
        "actionNormalProbBadge": "Review required",
        "actionNormalProbTitle": "Indeterminate result",
        "actionNormalProbDesc": "Previous or indeterminate results require clinician review. Do not use this result to clear a patient.",
        "actionTbProbBadge": "Review required",
        "actionTbProbTitle": "Elevated score",
        "actionTbProbDesc": "The model output requires clinician review. A clinician determines confirmatory testing and follow-up.",
        "actionTbBadge": "Review required",
        "actionTbTitle": "High score",
        "actionTbDesc": "A high model score is not an active TB diagnosis. A clinician must assess the image, symptoms, and need for confirmatory testing.",
        "actionRefBadge": "Review required",
        "actionRefTitle": "Ambiguous result",
        "actionRefDesc": "The model output is inconclusive. Image review and clinical assessment by a clinician are required.",
        "rejectColorTitle": "Color image",
        "rejectColorDesc": "Use a frontal chest radiograph. Photos of everyday objects cannot be processed.",
        "rejectDocTitle": "Not radiograph",
        "rejectDocDesc": "The image pattern resembles a document or blank page. Choose a radiograph.",
        "rejectContrastTitle": "Low contrast",
        "rejectContrastDesc": "The image is too dark or bright to process. Choose a clearer image.",
        "rejectAspectTitle": "Image ratio",
        "rejectAspectDesc": "The image ratio is outside 0.55–1.75. Check whether the chest is cropped.",
        "rejectResTitle": "Low resolution",
        "rejectResDesc": "The minimum size is 256 × 256 pixels. Choose a higher-resolution image.",
        "rejectCompressionTitle": "Heavy compression",
        "rejectCompressionDesc": "Compression artifacts affect the image. Use the original file.",
        "actionRejectBadge": "Not processed",
        "actionOodBadge": "Review required",
        "actionOodTitle": "Outside reference",
        "actionOodDesc": "Image features differ from the model reference distribution. Clinician review is required.",
        "batchStatusProcessing": "Processing",
        "batchStatusRejected": "Rejected",
        "batchStatusSuccess": "Complete",
        "batchStatusFailed": "Failed",
        "batchStatusCancelled": "Cancelled",
        "btnSingleReset": "Reset",
        "btnBatchReset": "Reset",
        "btnBatchReturn": "Back",
        "btnBatchCancel": "Cancel",
        "colAction": "Action",
        "btnInspect": "Open",
        "batchQueueEmpty": "No images yet.",
        "batchTableEmpty": "No results yet.",
        "errorRuntimeTitle": "Processing failed",
        "errorRuntimeDesc": "The image is unreadable or unsupported. Choose a valid PNG, JPEG, or WebP.",
        "installHelp": "Open the browser menu, then select Install app if available. Offline access requires cached application assets and model.",
        "errorSample": "The sample could not be loaded.",
        "themeLight": "Light",
        "themeDark": "Dark",
        "notAvailable": "Unavailable",
        "oodUnavailable": "Unavailable; clinician review required.",
        "oodOutside": "Outside reference",
        "oodWithin": "Within reference",
        "rejected": "Rejected",
        "latencyUnavailable": "Not measured",
        "inferenceFailed": "Processing failed",
        "queue": "Queue",
        "saved": "Saved",
        "guide": "Guide",
        "install": "Install",
        "print": "Print",
        "processingTools": "Processing tools",
        "reviewNotice": "Research tool. All results require clinician review. Results are not a diagnosis or authorization for patient discharge."
    },
    "id": {
        "brandTitle": "TB-CXR",
        "brandSub": "Alat penelitian. Review dokter wajib.",
        "tabSingle": "Satu gambar",
        "tabBatch": "Banyak gambar",
        "uploadTitle": "Tambah gambar",
        "uploadDesc": "Pilih gambar PNG, JPEG, atau WebP.",
        "uploadSub": "Gunakan gambar rontgen dada frontal yang jelas.",
        "btnSubmit": "Proses",
        "btnCamera": "Kamera",
        "samplesTitle": "Contoh gambar",
        "sample1": "Contoh TB",
        "sample2": "Contoh non-TB",
        "sample3": "Contoh apikal",
        "emptyTitle": "Belum diproses",
        "emptyDesc": "Tambahkan gambar, lalu pilih Proses.",
        "loadingTitle": "Memproses",
        "loadingSub": "Tunggu hingga proses selesai.",
        "viewerTitle": "Peta model",
        "viewerBadge": "Aktivasi model",
        "modeSplit": "Bandingkan",
        "modeOrig": "Asli",
        "modeHeat": "Overlay",
        "legendLeft": "Gambar asli",
        "legendRight": "Aktivasi model",
        "probTb": "Skor TB",
        "probNorm": "Skor non-TB",
        "probTbSub": "Skor model bukan diagnosis. Dokter menentukan pemeriksaan lanjutan.",
        "probNormSub": "Skor ini tidak memastikan paru sehat atau menyingkirkan TB.",
        "techAuditTitle": "Detail teknis",
        "lblSet": "Set prediksi",
        "lblAction": "Kode hasil",
        "lblOod": "Distribusi gambar",
        "lblLatency": "Waktu proses",
        "batchDropTitle": "Tambah gambar",
        "batchDropDesc": "Tambahkan gambar, lalu proses. Hasil dapat diekspor sebagai CSV.",
        "btnBatchStart": "Proses",
        "btnBatchCsv": "Ekspor CSV",
        "kpiTotal": "Total",
        "kpiNormal": "Skor rendah",
        "kpiTb": "Skor tinggi",
        "kpiRef": "Perlu review",
        "modalTitle": "Penggunaan penelitian",
        "modalDesc1": "Aplikasi ini membantu meninjau hasil model pada rontgen dada untuk penelitian.",
        "modalPoint1": "Review dokter wajib. Hasil tidak menggantikan penilaian klinis atau pemeriksaan konfirmasi TB.",
        "modalPoint2": "Gambar diproses di browser. Jika memilih Simpan, gambar dan hasil tersimpan di browser perangkat ini.",
        "modalAgree": "Saya tenaga medis atau peneliti dan memahami batas penggunaan.",
        "modalAccept": "Lanjut",
        "statusConnecting": "Menyiapkan",
        "statusOnline": "Terhubung",
        "statusDegraded": "Proses lokal",
        "actionNormalBadge": "Review wajib",
        "actionNormalTitle": "Skor rendah",
        "actionNormalDesc": "Skor model rendah. Review dokter tetap wajib; hasil ini tidak menyingkirkan TB atau membolehkan pelepasan pasien.",
        "actionNormalProbBadge": "Review wajib",
        "actionNormalProbTitle": "Hasil tidak pasti",
        "actionNormalProbDesc": "Hasil sebelumnya atau tidak pasti perlu review dokter. Jangan gunakan hasil ini untuk melepas pasien.",
        "actionTbProbBadge": "Review wajib",
        "actionTbProbTitle": "Skor meningkat",
        "actionTbProbDesc": "Keluaran model memerlukan review dokter. Dokter menentukan pemeriksaan konfirmasi dan tindak lanjut.",
        "actionTbBadge": "Review wajib",
        "actionTbTitle": "Skor tinggi",
        "actionTbDesc": "Skor model tinggi bukan diagnosis TB aktif. Dokter perlu menilai gambar, gejala, dan kebutuhan pemeriksaan konfirmasi.",
        "actionRefBadge": "Review wajib",
        "actionRefTitle": "Hasil ambigu",
        "actionRefDesc": "Keluaran model tidak memberikan kesimpulan pasti. Review gambar dan penilaian klinis dokter diperlukan.",
        "rejectColorTitle": "Gambar berwarna",
        "rejectColorDesc": "Gunakan rontgen dada frontal. Foto objek sehari-hari tidak dapat diproses.",
        "rejectDocTitle": "Bukan rontgen",
        "rejectDocDesc": "Pola gambar menyerupai dokumen atau halaman kosong. Pilih gambar rontgen.",
        "rejectContrastTitle": "Kontras rendah",
        "rejectContrastDesc": "Gambar terlalu gelap atau terang untuk diproses. Pilih gambar yang lebih jelas.",
        "rejectAspectTitle": "Rasio gambar",
        "rejectAspectDesc": "Rasio gambar di luar rentang 0,55–1,75. Periksa apakah dada terpotong.",
        "rejectResTitle": "Resolusi rendah",
        "rejectResDesc": "Ukuran minimum 256 × 256 piksel. Pilih gambar dengan resolusi lebih tinggi.",
        "rejectCompressionTitle": "Kompresi berat",
        "rejectCompressionDesc": "Artefak kompresi mengganggu gambar. Gunakan berkas asli.",
        "actionRejectBadge": "Tidak diproses",
        "actionOodBadge": "Review wajib",
        "actionOodTitle": "Di luar referensi",
        "actionOodDesc": "Fitur gambar berbeda dari distribusi referensi model. Review dokter diperlukan.",
        "batchStatusProcessing": "Memproses",
        "batchStatusRejected": "Ditolak",
        "batchStatusSuccess": "Selesai",
        "batchStatusFailed": "Gagal",
        "batchStatusCancelled": "Dibatalkan",
        "btnSingleReset": "Reset",
        "btnBatchReset": "Reset",
        "btnBatchReturn": "Kembali",
        "btnBatchCancel": "Batal",
        "colAction": "Aksi",
        "btnInspect": "Buka",
        "batchQueueEmpty": "Belum ada gambar.",
        "batchTableEmpty": "Belum ada hasil.",
        "errorRuntimeTitle": "Proses gagal",
        "errorRuntimeDesc": "Gambar tidak terbaca atau format tidak didukung. Pilih PNG, JPEG, atau WebP yang valid.",
        "installHelp": "Buka menu browser, lalu pilih Pasang aplikasi jika tersedia. Akses offline memerlukan aset aplikasi dan model yang telah tersimpan.",
        "errorSample": "Contoh gagal dimuat.",
        "themeLight": "Terang",
        "themeDark": "Gelap",
        "notAvailable": "Tidak tersedia",
        "oodUnavailable": "Tidak tersedia; review dokter wajib.",
        "oodOutside": "Di luar referensi",
        "oodWithin": "Dalam referensi",
        "rejected": "Ditolak",
        "latencyUnavailable": "Tidak diukur",
        "inferenceFailed": "Proses gagal",
        "queue": "Antrean",
        "saved": "Tersimpan",
        "guide": "Panduan",
        "install": "Pasang",
        "print": "Cetak",
        "processingTools": "Alat proses",
        "reviewNotice": "Alat penelitian. Semua hasil perlu review dokter. Hasil bukan diagnosis atau izin melepas pasien."
    }
};

let currentLang = 'id';
try {
    const storedLanguage = localStorage.getItem('tb_ui_language');
    if (storedLanguage === 'en' || storedLanguage === 'id') currentLang = storedLanguage;
} catch (_) { /* Storage may be blocked in an embedded Space. */ }

function toggleLanguage() {
    applyLanguage(currentLang === 'en' ? 'id' : 'en');
}

function applyLanguage(lang) {
    currentLang = lang === 'en' ? 'en' : 'id';
    const t = I18N_DICT[currentLang];
    document.documentElement.lang = currentLang;
    document.title = 'TB-CXR';
    try { localStorage.setItem('tb_ui_language', currentLang); } catch (_) {}
    const ids = {
        "txt-brand-title": "brandTitle",
        "txt-sub": "brandSub",
        "txt-tab-single": "tabSingle",
        "txt-tab-batch": "tabBatch",
        "txt-upload-title": "uploadTitle",
        "txt-upload-desc": "uploadDesc",
        "txt-upload-sub": "uploadSub",
        "txt-btn-submit": "btnSubmit",
        "txt-btn-camera": "btnCamera",
        "txt-samples-title": "samplesTitle",
        "sample-1-name": "sample1",
        "sample-2-name": "sample2",
        "sample-3-name": "sample3",
        "txt-empty-title": "emptyTitle",
        "txt-empty-desc": "emptyDesc",
        "txt-loading-title": "loadingTitle",
        "txt-loading-sub": "loadingSub",
        "txt-viewer-title": "viewerTitle",
        "txt-viewer-badge": "viewerBadge",
        "btn-mode-split": "modeSplit",
        "btn-mode-orig": "modeOrig",
        "btn-mode-heat": "modeHeat",
        "txt-legend-left": "legendLeft",
        "txt-legend-right": "legendRight",
        "txt-prob-tb": "probTb",
        "txt-prob-norm": "probNorm",
        "txt-prob-tb-sub": "probTbSub",
        "txt-prob-norm-sub": "probNormSub",
        "txt-tech-summary-title": "techAuditTitle",
        "lbl-set": "lblSet",
        "lbl-action": "lblAction",
        "lbl-ood": "lblOod",
        "lbl-lat": "lblLatency",
        "txt-batch-drop-title": "batchDropTitle",
        "txt-batch-drop-desc": "batchDropDesc",
        "txt-btn-batch-start": "btnBatchStart",
        "txt-btn-batch-csv": "btnBatchCsv",
        "txt-kpi-total": "kpiTotal",
        "txt-kpi-normal": "kpiNormal",
        "txt-kpi-tb": "kpiTb",
        "txt-kpi-ref": "kpiRef",
        "txt-btn-single-reset": "btnSingleReset",
        "txt-btn-batch-reset": "btnBatchReset",
        "txt-btn-batch-return": "btnBatchReturn",
        "txt-btn-batch-cancel": "btnBatchCancel",
        "batch-th-action": "colAction",
        "txt-modal-title": "modalTitle",
        "txt-modal-desc-1": "modalDesc1",
        "txt-modal-point-1": "modalPoint1",
        "txt-modal-point-2": "modalPoint2",
        "txt-modal-agree": "modalAgree",
        "btn-modal-accept": "modalAccept"
};
    for (const [id, key] of Object.entries(ids)) {
        const element = document.getElementById(id);
        if (element) element.textContent = t[key];
    }
    const skip = document.querySelector('.skip-link');
    if (skip) skip.textContent = currentLang === 'en' ? 'Skip navigation' : 'Lewati navigasi';
    const modalLanguage = document.getElementById('modal-language');
    if (modalLanguage) modalLanguage.setAttribute('aria-label', currentLang === 'en' ? 'Change language' : 'Ganti bahasa');
    const badge = document.getElementById('txt-lang-badge');
    if (badge) badge.textContent = currentLang.toUpperCase();
    const languageButton = badge && badge.closest('button');
    if (languageButton) languageButton.setAttribute('aria-label', currentLang === 'id' ? 'Ganti bahasa' : 'Change language');
    const translate = (selector, value) => {
        document.querySelectorAll(selector).forEach(element => { element.textContent = value; });
    };
    // Static elements that previously had no translation hook.
    translate('[data-case-view="queue"]', t.queue);
    translate('[data-case-view="saved"]', t.saved);
    translate('[data-case-view="guide"]', t.guide);
    translate('#txt-print', t.print);
    translate('#txt-theme', typeof currentTheme !== 'undefined' && currentTheme === 'dark' ? t.themeLight : t.themeDark);
    translate('#txt-install-title', t.install);
    translate('#processing-workspace > summary', t.processingTools);
    translate('.samd-regulatory-bar', t.reviewNotice);
    const landmarks = currentLang === 'id'
        ? {'.case-nav':'Navigasi', '#case-workspace':'Kasus', '#case-detail-tools':'Review', '#case-guide':'Panduan'}
        : {'.case-nav':'Navigation', '#case-workspace':'Cases', '#case-detail-tools':'Review', '#case-guide':'Guide'};
    for (const [selector, label] of Object.entries(landmarks)) {
        document.querySelectorAll(selector).forEach(element => element.setAttribute('aria-label', label));
    }
    const headings = currentLang === 'id'
        ? ['#', 'Berkas', 'Status', 'Skor TB (%)', 'Kode hasil', 'Durasi', 'Aksi']
        : ['#', 'File', 'Status', 'TB score (%)', 'Result code', 'Duration', 'Action'];
    document.querySelectorAll('.batch-table thead th').forEach((element, i) => { element.textContent = headings[i] || ''; });
    const sampleLabels = currentLang === 'id' ? ['Label TB', 'Label non-TB', 'Label TB'] : ['TB label', 'Non-TB label', 'TB label'];
    document.querySelectorAll('.sample-btn').forEach((button, i) => {
        const label = button.querySelector('span:last-child');
        if (label && sampleLabels[i]) label.textContent = sampleLabels[i];
    });
    const baseImage = document.getElementById('img-base');
    const heatImage = document.getElementById('img-heat');
    if (baseImage) baseImage.alt = currentLang === 'id' ? 'Rontgen asli' : 'Original radiograph';
    if (heatImage) heatImage.alt = currentLang === 'id' ? 'Aktivasi model' : 'Model activation';
    const slider = document.getElementById('slider-control');
    if (slider) slider.setAttribute('aria-label', currentLang === 'id' ? 'Bandingkan overlay' : 'Compare overlay');
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (Object.hasOwn(t, key)) element.textContent = t[key];
    });
    if (typeof refreshActiveIdiograph === 'function') refreshActiveIdiograph();
    window.dispatchEvent(new CustomEvent('tb-language-change', {detail: {language: currentLang}}));
}
