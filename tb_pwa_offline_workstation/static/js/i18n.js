// Bilingual Localization Module (EN / ID)
// Idiograph-First Clinical UX: Simple, Actionable, Zero Pretentious Academic Slop

const I18N_DICT = {
    en: {
        brandTitle: "TB-CXR Rapid Clinical Screening",
        brandSub: "Early Pulmonary Tuberculosis Screening &bull; WHO-Calibrated &bull; Instant In-Browser Triage",
        tabSingle: "Single CXR Triage",
        tabBatch: "Parallel Batch Screening",
        uploadTitle: "Drop Chest Radiograph or Click to Browse",
        uploadDesc: "DICOM, PNG, and JPEG supported. Automated quality assurance applied.",
        btnSubmit: "Analyze Radiograph",
        btnCamera: "Take Photo via Camera",
        samplesTitle: "Verified Benchmark Clinical Cases",
        sample1: "Active TB Case (Cavitary Lesion)",
        sample2: "Healthy Control (Normal Lungs)",
        sample3: "Apical TB Case (Upper Infiltrate)",
        emptyTitle: "Ready for Radiograph",
        emptyDesc: "Upload a chest X-ray or select a benchmark case to run calibrated instant screening.",
        loadingTitle: "Analyzing Chest Radiograph...",
        loadingSub: "Detecting lung lesion locations & calculating calibrated risk scores",
        viewerTitle: "Lung Lesion Detection Map",
        viewerBadge: "Suspected TB Lesions",
        modeSplit: "Split 50%",
        modeOrig: "Native CXR",
        modeHeat: "Lesion Heatmap",
        legendLeft: "< Native Radiograph (Thoracic Anatomy)",
        legendRight: "Lesion Heatmap >",
        probTb: "TB Risk Score",
        probNorm: "Normal Confidence",
        probTbSub: "Operating Decision Threshold: 44.0%",
        probNormSub: "Rule-Out Operating Threshold: >= 95.0%",
        techAuditTitle: "Technical Audit & Algorithmic Details (Regulatory & Research)",
        lblSet: "Conformal Prediction Set",
        lblAction: "System Decision Code",
        lblOod: "Image Distribution Quality",
        lblLatency: "Processing Speed",
        batchDropTitle: "Drop Batch Radiographs or Folder for Parallel Screening",
        batchDropDesc: "Asynchronously processed via multi-worker queue. Real-time KPI aggregation and CSV roster export.",
        btnBatchStart: "Start Batch Screening",
        btnBatchCsv: "Export Clinical CSV Roster",
        kpiTotal: "Total Queued",
        kpiNormal: "Normal (Released)",
        kpiTb: "TB Urgent (Flagged)",
        kpiRef: "Doctor Review Needed",
        modalTitle: "Clinical Decision Support Notice",
        modalDesc1: "This application is an investigational Clinical Decision Support (CDS) tool designed to assist certified clinicians in rapid triage of pulmonary tuberculosis on chest radiographs.",
        modalPoint1: "Clinical Confirmation Required: AI recommendations must never supersede expert clinical evaluation or microbiological bacteriological confirmation (sputum GeneXpert / culture).",
        modalPoint2: "Patient Data Privacy: Radiographs are processed ephemerally in volatile memory directly inside your browser and immediately discarded. No patient identifiers are stored.",
        modalAgree: "I certify that I am a qualified clinician or researcher, and I accept the terms above.",
        modalAccept: "Enter Clinical Workstation",
        statusConnecting: "CONNECTING...",
        statusOnline: "READY (ONLINE)",
        statusDegraded: "OFFLINE MODE",
        actionNormalBadge: "LOW RISK (NORMAL)",
        actionNormalTitle: "Normal: No Evidence of Active Pulmonary TB",
        actionNormalDesc: "Statistically verified under 95% conformal coverage. No focal consolidation or cavitary lesions detected. Safe for standard clinical release.",
        actionTbBadge: "HIGH RISK TB (URGENT)",
        actionTbTitle: "TB Indication: Prompt Microbiological Action Required",
        actionTbDesc: "Posterior probability exceeds triage cut-off. Immediate microbiological sputum GeneXpert test and physician evaluation indicated.",
        actionRefBadge: "DOCTOR REVIEW NEEDED",
        actionRefTitle: "Equivocal Finding: Physician Evaluation Required",
        actionRefDesc: "Sample falls in conformal uncertainty region or exhibits sensor distribution shift. Primum Non Nocere interlock active: specialist review required."
    },
    id: {
        brandTitle: "Skrining Rontgen Dada Tuberkulosis (TB-CXR)",
        brandSub: "Deteksi Dini TB Paru Cepat &bull; Terkalibrasi Standar WHO &bull; Triase Instan Tanpa Server",
        tabSingle: "Triase Satu Foto",
        tabBatch: "Skrining Masal (Banyak Foto)",
        uploadTitle: "Tarik Foto Rontgen Dada atau Klik untuk Memilih",
        uploadDesc: "Mendukung format DICOM, PNG, dan JPEG. Pemeriksaan kualitas citra otomatis.",
        btnSubmit: "Analisis Foto Rontgen",
        btnCamera: "Ambil Foto via Kamera Ponsel",
        samplesTitle: "Contoh Kasus Klinis Terverifikasi",
        sample1: "Kasus TB Aktif (Kavitas Paru)",
        sample2: "Kontrol Sehat (Paru Normal)",
        sample3: "TB Puncak Paru (Infiltrat Apikal)",
        emptyTitle: "Siap Menganalisis Rontgen",
        emptyDesc: "Unggah foto rontgen dada atau pilih contoh kasus di bawah untuk memulai analisis triase instan.",
        loadingTitle: "Menganalisis Foto Rontgen Dada...",
        loadingSub: "Memetakan lokasi lesi paru dan menghitung tingkat risiko terkalibrasi",
        viewerTitle: "Peta Deteksi Lesi Paru",
        viewerBadge: "Lokasi Curiga TB",
        modeSplit: "Bagi 50%",
        modeOrig: "Foto Asli",
        modeHeat: "Peta Lesi",
        legendLeft: "< Foto Rontgen Asli (Anatomi)",
        legendRight: "Peta Lokasi Lesi >",
        probTb: "Tingkat Risiko TB",
        probNorm: "Tingkat Keyakinan Normal",
        probTbSub: "Ambang batas anjuran tes dahak TCM: 44.0%",
        probNormSub: "Batas aman pelepasan mandiri: >= 95.0%",
        techAuditTitle: "Data Teknis & Audit Algoritma (Untuk Peneliti & Auditor)",
        lblSet: "Himpunan Prediksi Konformal",
        lblAction: "Kode Keputusan Sistem",
        lblOod: "Kualitas Distribusi Citra",
        lblLatency: "Kecepatan Analisis",
        batchDropTitle: "Tarik Banyak Foto Rontgen untuk Skrining Sekaligus",
        batchDropDesc: "Diproses cepat secara paralel melalui antrean multi-worker. Ringkasan KPI langsung dan ekspor CSV.",
        btnBatchStart: "Mulai Skrining Masal",
        btnBatchCsv: "Ekspor Laporan CSV",
        kpiTotal: "Total Foto",
        kpiNormal: "Normal (Aman)",
        kpiTb: "Risiko Tinggi (TB)",
        kpiRef: "Perlu Evaluasi Dokter",
        modalTitle: "Pemberitahuan Sistem Pendukung Keputusan Klinis",
        modalDesc1: "Aplikasi ini adalah asisten Pendukung Keputusan Klinis (Clinical Decision Support) untuk membantu dokter dan tenaga medis melakukan triase cepat Tuberkulosis paru pada foto rontgen dada.",
        modalPoint1: "Wajib Konfirmasi Klinis: Hasil analisis AI tidak menggantikan penilaian dokter spesialis dan konfirmasi mikrobiologis dahak (TCM / GeneXpert).",
        modalPoint2: "Privasi Pasien Terjamin: Citra rontgen diproses secara aman langsung di peramban Anda dan segera dihapus dari memori. Tidak ada data pasien yang disimpan di server.",
        modalAgree: "Saya menyatakan bahwa saya adalah tenaga medis atau peneliti klinis, dan saya menyetujui ketentuan di atas.",
        modalAccept: "Masuk ke Stasiun Kerja Klinis",
        statusConnecting: "MENGHUBUNGKAN...",
        statusOnline: "SIAP (ONLINE)",
        statusDegraded: "MODE OFFLINE",
        actionNormalBadge: "RISIKO RENDAH (NORMAL)",
        actionNormalTitle: "Normal: Tidak Ditemukan Tanda TB Paru Aktif",
        actionNormalDesc: "Terverifikasi secara statistik pada cakupan konformal 95%. Tidak tampak konsolidasi fokal atau kavitas aktif. Pasien aman dipulangkan secara rutin.",
        actionTbBadge: "DUGAAN KUAT TB (URGEN)",
        actionTbTitle: "Indikasi TB: Diperlukan Tindakan Cepat",
        actionTbDesc: "Probabilitas posterior melampaui batas triase. Segera jadwalkan tes mikrobiologi dahak GeneXpert dan konsultasi dokter.",
        actionRefBadge: "PERLU EVALUASI DOKTER",
        actionRefTitle: "Hasil Meragukan: Butuh Pemeriksaan Dokter",
        actionRefDesc: "Tampak gambaran paru yang meragukan atau tidak spesifik. Penguncian keselamatan aktif: wajib dievaluasi langsung oleh dokter."
    }
};

let currentLang = 'en';

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'id' : 'en';
    applyLanguage(currentLang);
    const badge = document.getElementById('txt-lang-badge');
    if (badge) badge.innerText = currentLang.toUpperCase();
}

function applyLanguage(lang) {
    const t = I18N_DICT[lang] || I18N_DICT.en;
    
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
