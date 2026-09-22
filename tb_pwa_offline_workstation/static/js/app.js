// Main Clinical Workstation Application Controller (100% Offline PWA Mode)

// Service Worker Registration for Complete Air-Gapped Offline Operation
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then((reg) => {
            console.log('[PWA ServiceWorker] Active with scope:', reg.scope);
        }).catch((err) => {
            console.warn('[PWA ServiceWorker] Registration failed:', err);
        });
    });
}

// PWA Installation Handling ("Tombol Paling Gede")
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('[PWA] beforeinstallprompt captured.');
});

window.addEventListener('appinstalled', () => {
    console.log('[PWA] Application successfully installed.');
    deferredPrompt = null;
    const title = document.getElementById('txt-install-title');
    if (title) title.innerText = '✅ APLIKASI TELAH TERPASANG DI KOMPUTER INI (100% OFFLINE)';
    const sub = document.getElementById('txt-install-sub');
    if (sub) sub.innerText = 'Buka langsung melalui ikon TB Conformal Triage di Desktop kapan saja tanpa koneksi internet.';
});

async function triggerPWAInstall() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('[PWA] User choice outcome:', outcome);
        deferredPrompt = null;
    } else {
        alert('Panduan Pemasangan Aplikasi Offline:\n1. Pada Microsoft Edge atau Google Chrome, klik ikon menu (titik tiga di kanan atas layar).\n2. Pilih "Apps" (Aplikasi) -> "Install this site as an app" (Pasang situs ini sebagai aplikasi).\n3. Ikon "TB Triage" akan otomatis terpasang di Desktop komputer Anda dan siap dipakai tanpa internet.');
    }
}

// Safe Storage Helper (Handles iframe sandboxing & storage partitioning)
const memoryStore = {};
const safeStorage = {
    getItem: function(key) {
        try {
            return window.localStorage ? localStorage.getItem(key) : memoryStore[key];
        } catch(e) {
            return memoryStore[key] || null;
        }
    },
    setItem: function(key, val) {
        try {
            if (window.localStorage) localStorage.setItem(key, val);
        } catch(e) {}
        memoryStore[key] = val;
    }
};

let currentTheme = 'light';
let selectedFile = null;
let originalImageSrc = null;
let isSubmitting = false;

// Batch State
let batchFiles = [];
let batchResults = [];
let isBatchRunning = false;

// 1. Theme Management
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    const btn = document.getElementById('txt-theme');
    if (btn) btn.innerText = currentTheme === 'light' ? 'Dark' : 'Light';
}

// 2. Mode Switching
function switchMode(mode) {
    const tabSingle = document.getElementById('tab-single');
    const tabBatch = document.getElementById('tab-batch');
    const panelSingle = document.getElementById('panel-single');
    const panelBatch = document.getElementById('panel-batch');

    if (mode === 'single') {
        tabSingle.classList.add('active');
        tabBatch.classList.remove('active');
        panelSingle.style.display = 'grid';
        panelBatch.style.display = 'none';
    } else {
        tabBatch.classList.add('active');
        tabSingle.classList.remove('active');
        panelSingle.style.display = 'none';
        panelBatch.style.display = 'block';
    }
}

// 3. Disclaimer Modal
function checkDisclaimerStatus() {
    const accepted = safeStorage.getItem('tb_triage_disclaimer_accepted');
    const modal = document.getElementById('disclaimer-modal');
    if (!accepted && modal) {
        modal.style.display = 'flex';
    }
}

function toggleDisclaimerAccept() {
    const chk = document.getElementById('chk-disclaimer');
    const btn = document.getElementById('btn-modal-accept');
    if (btn) btn.disabled = !chk.checked;
}

function acceptDisclaimer() {
    safeStorage.setItem('tb_triage_disclaimer_accepted', 'true');
    const modal = document.getElementById('disclaimer-modal');
    if (modal) modal.style.display = 'none';
}

// 4. System Status Indicator (100% Offline WASM Air-Gapped)
function initSystemStatus() {
    const statusText = document.getElementById('txt-status');
    const statusDot = document.querySelector('.status-dot');
    const t = I18N_DICT[currentLang] || I18N_DICT.en;
    if (statusText) {
        statusText.innerText = t.statusDegraded || 'OFFLINE MODE (WASM)';
    }
    if (statusDot) {
        statusDot.className = 'status-dot';
        statusDot.style.background = 'var(--color-normal)';
    }
}

// 5. Single CXR Drag & Drop, File Loading
function initSingleFileHandlers() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    if (dropZone) {
        dropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        dropZone.addEventListener('dragleave', function(e) {
            dropZone.classList.remove('drag-over');
        });
        dropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            if (e.dataTransfer.files.length > 0) {
                handleSingleFile(e.dataTransfer.files[0]);
            }
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            if (fileInput.files.length > 0) {
                handleSingleFile(fileInput.files[0]);
            }
        });
    }
}

function handleSingleFile(file) {
    selectedFile = file;
    const labelName = document.getElementById('file-name-label') || document.getElementById('lbl-filename');
    const labelSize = document.getElementById('file-size-label') || document.getElementById('lbl-filesize');
    const statusBox = document.getElementById('file-status');
    const submitBtn = document.getElementById('btn-submit');

    if (labelName) labelName.innerText = file.name;
    if (labelSize) labelSize.innerText = (file.size / 1024).toFixed(1) + ' KB';
    if (statusBox) statusBox.style.display = 'block';
    if (submitBtn) submitBtn.disabled = false;

    // Reset previous patient's results, heatmap, and UI state to prevent desynchronization
    currentResultData = null;
    const emptyBox = document.getElementById('empty-state');
    const resultsBox = document.getElementById('results-display');
    const loadingBox = document.getElementById('loading-state');
    if (emptyBox) emptyBox.style.display = 'block';
    if (resultsBox) resultsBox.style.display = 'none';
    if (loadingBox) loadingBox.style.display = 'none';

    const imgHeat = document.getElementById('img-heat');
    if (imgHeat) imgHeat.src = '';
    const barTb = document.getElementById('bar-prob-tb');
    const barNorm = document.getElementById('bar-prob-norm');
    if (barTb) barTb.style.width = '0%';
    if (barNorm) barNorm.style.width = '0%';

    // Read preview
    const reader = new FileReader();
    reader.onload = function(e) {
        originalImageSrc = e.target.result;
        const imgBase = document.getElementById('img-base');
        if (imgBase) imgBase.src = originalImageSrc;
    };
    reader.readAsDataURL(file);
}

function captureCamera() {
    const input = document.getElementById('file-input');
    if (input) {
        input.setAttribute('capture', 'environment');
        input.click();
    }
}

// // 6. Clinical Benchmark Samples Loader
// Enforces 100% in-browser WebAssembly ONNX forward pass (Zero Mock Invariant)

async function loadBenchmarkCase(sampleName) {
    try {
        setLoadingState(true);
        const url = './samples/' + sampleName;
        originalImageSrc = url;
        const imgBase = document.getElementById('img-base');
        if (imgBase) imgBase.src = url;

        const resp = await fetch(url);
        if (!resp.ok) throw new Error('Sample file not found: ' + sampleName);
        const blob = await resp.blob();

        const file = new File([blob], sampleName, { type: blob.type || 'image/png' });
        handleSingleFile(file);

        // Auto execute triage
        await submitSingleTriage();
    } catch(err) {
        setLoadingState(false);
        alert('Failed to load clinical benchmark: ' + err.message);
    }
}

// 7. In-Browser ONNX Runtime Web (WASM Engine)
let ortSession = null;
let isModelLoading = false;

async function getOrtSession() {
    if (ortSession) return ortSession;
    if (isModelLoading) {
        while (isModelLoading) {
            await new Promise(r => setTimeout(r, 150));
        }
        return ortSession;
    }

    isModelLoading = true;
    try {
        if (!window.ort) {
            throw new Error('ONNX Runtime Web script not loaded from ./vendor/onnx/ort.min.js');
        }
        ort.env.wasm.wasmPaths = "./vendor/onnx/";
        ort.env.wasm.numThreads = 1;
        ort.env.wasm.simd = true;

        const modelUrl = (window.location.hostname.includes('hf.space') || window.location.hostname.includes('huggingface.co'))
            ? 'https://huggingface.co/spaces/Ressshh/tb-conformal-triage-workstation/resolve/main/models/tb_conformal_distilled_v11_cam.onnx'
            : './models/tb_conformal_distilled_v11_cam.onnx';
        ortSession = await ort.InferenceSession.create(modelUrl, {
            executionProviders: ['wasm']
        });
        console.log('[ORT] DenseNet-121 in-browser inference session ready from:', modelUrl);
    } catch(err) {
        console.error('[ORT INIT ERROR]', err);
        throw err;
    } finally {
        isModelLoading = false;
    }
    return ortSession;
}

// Pre-Analytic Image Quality Assurance (IQA) & Guardrails
function evaluatePreAnalyticQuality(imgElement, canvas, ctx) {
    const origW = imgElement.naturalWidth || imgElement.videoWidth || imgElement.width;
    const origH = imgElement.naturalHeight || imgElement.videoHeight || imgElement.height;

    if (!origW || !origH) {
        return {
            quality_passed: false,
            reject_code: 'REJECT_INVALID_DIMENSIONS',
            aspect_ratio: 1.0,
            dynamic_range: 0,
            is_inverted: false,
            blockiness_score: 1.0,
            warnings: ['Image dimensions could not be resolved from element.']
        };
    }

    const ar = origW / origH;
    const isValidAr = (ar >= 0.65 && ar <= 1.55);
    const isSufficientRes = (origW >= 256 && origH >= 256);

    // Standardize analysis canvas dimensions to max 512px for instant (< 5ms) processing
    const scale = Math.min(1.0, 512.0 / Math.max(origW, origH));
    const analysisW = Math.max(64, Math.round(origW * scale));
    const analysisH = Math.max(64, Math.round(origH * scale));

    let targetCanvas = canvas;
    let targetCtx = ctx;
    if (!targetCanvas) {
        targetCanvas = document.createElement('canvas');
    }
    targetCanvas.width = analysisW;
    targetCanvas.height = analysisH;
    if (!targetCtx) {
        targetCtx = targetCanvas.getContext('2d', { willReadFrequently: true });
    }
    targetCtx.drawImage(imgElement, 0, 0, analysisW, analysisH);

    const imgData = targetCtx.getImageData(0, 0, analysisW, analysisH);
    const raw = imgData.data;
    const totalPixels = analysisW * analysisH;
    const w = analysisW;
    const h = analysisH;

    const gray = new Float32Array(totalPixels);
    let totalSatDelta = 0;
    let countWhite = 0;
    let countBlack = 0;
    const hist = new Uint32Array(256);

    for (let i = 0; i < totalPixels; i++) {
        const idx = i * 4;
        const r = raw[idx];
        const g = raw[idx + 1];
        const b = raw[idx + 2];

        // Color Saturation Index
        totalSatDelta += Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);

        // Grayscale Luminance (Rec. 601)
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        gray[i] = lum;

        const bin = Math.min(255, Math.max(0, Math.round(lum)));
        hist[bin]++;

        if (lum > 245) countWhite++;
        if (lum < 10) countBlack++;
    }

    const meanSat = totalSatDelta / totalPixels;
    const isColor = meanSat > 25.0;

    // Dynamic contrast range via histogram percentiles P1 & P99
    const countP1 = Math.floor(totalPixels * 0.01);
    const countP99 = Math.floor(totalPixels * 0.99);
    let cum = 0;
    let p1 = 0;
    let p99 = 255;
    let foundP1 = false;
    for (let b = 0; b < 256; b++) {
        cum += hist[b];
        if (!foundP1 && cum >= countP1) {
            p1 = b;
            foundP1 = true;
        }
        if (cum >= countP99) {
            p99 = b;
            break;
        }
    }
    const dynamicRange = p99 - p1;
    const isSufficientContrast = dynamicRange >= 35.0;

    // Modality / Anatomy Guard
    const whiteRatio = countWhite / totalPixels;
    const blackRatio = countBlack / totalPixels;
    const isInvalidAnatomyDoc = (whiteRatio > 0.60) || (blackRatio > 0.70);

    // Photometric Polarity Check: 4 corners (8% margin, min 4 px) vs center zone (x: 40-60%, y: 35-65%)
    const cH = Math.max(4, Math.floor(0.08 * h));
    const cW = Math.max(4, Math.floor(0.08 * w));
    let cornerSum = 0;
    let cornerCount = 0;

    for (let y = 0; y < cH; y++) {
        const rowOff = y * w;
        for (let x = 0; x < cW; x++) {
            cornerSum += gray[rowOff + x];
            cornerCount++;
        }
        for (let x = w - cW; x < w; x++) {
            cornerSum += gray[rowOff + x];
            cornerCount++;
        }
    }
    for (let y = h - cH; y < h; y++) {
        const rowOff = y * w;
        for (let x = 0; x < cW; x++) {
            cornerSum += gray[rowOff + x];
            cornerCount++;
        }
        for (let x = w - cW; x < w; x++) {
            cornerSum += gray[rowOff + x];
            cornerCount++;
        }
    }
    const meanCorner = cornerCount > 0 ? (cornerSum / cornerCount) : 0;

    const midY1 = Math.floor(0.35 * h);
    const midY2 = Math.floor(0.65 * h);
    const midX1 = Math.floor(0.40 * w);
    const midX2 = Math.floor(0.60 * w);
    let centerSum = 0;
    let centerCount = 0;
    for (let y = midY1; y < midY2; y++) {
        const rowOff = y * w;
        for (let x = midX1; x < midX2; x++) {
            centerSum += gray[rowOff + x];
            centerCount++;
        }
    }
    const meanCenter = centerCount > 0 ? (centerSum / centerCount) : 0;

    const isInverted = (meanCorner > 120.0) || (meanCorner > 75.0 && meanCorner > 1.30 * meanCenter);

    // 8x8 DCT Grid Discontinuity (Blockiness Score) on 1:1 Native Resolution
    let blockinessScore = 1.0;
    if (origW >= 64 && origH >= 64) {
        const patchW = Math.min(256, origW);
        const patchH = Math.min(256, origH);
        const patchCropX = Math.floor((origW - patchW) / 2);
        const patchCropY = Math.floor((origH - patchH) / 2);

        const patchCanvas = document.createElement('canvas');
        patchCanvas.width = patchW;
        patchCanvas.height = patchH;
        const patchCtx = patchCanvas.getContext('2d', { willReadFrequently: true });
        patchCtx.drawImage(imgElement, patchCropX, patchCropY, patchW, patchH, 0, 0, patchW, patchH);
        const patchRaw = patchCtx.getImageData(0, 0, patchW, patchH).data;

        // Grayscale conversion of native patch
        const patchPixels = patchW * patchH;
        const patchGray = new Float32Array(patchPixels);
        for (let i = 0; i < patchPixels; i++) {
            const idx = i * 4;
            patchGray[i] = 0.299 * patchRaw[idx] + 0.587 * patchRaw[idx + 1] + 0.114 * patchRaw[idx + 2];
        }

        const margin = 8;
        const sh = patchH - 2 * margin;
        const sw = patchW - 2 * margin;
        let sumBh = 0, countBh = 0;
        let sumIh = 0, countIh = 0;
        let sumBv = 0, countBv = 0;
        let sumIv = 0, countIv = 0;

        for (let y = 0; y < sh; y++) {
            const rowOff = (y + margin) * patchW + margin;
            for (let x = 0; x < sw - 1; x++) {
                const diff = Math.abs(patchGray[rowOff + x] - patchGray[rowOff + x + 1]);
                if ((x + 1) % 8 === 0) {
                    sumBh += diff;
                    countBh++;
                } else {
                    sumIh += diff;
                    countIh++;
                }
            }
        }

        for (let y = 0; y < sh - 1; y++) {
            const rowOff1 = (y + margin) * patchW + margin;
            const rowOff2 = (y + margin + 1) * patchW + margin;
            const isBoundaryRow = ((y + 1) % 8 === 0);
            for (let x = 0; x < sw; x++) {
                const diff = Math.abs(patchGray[rowOff1 + x] - patchGray[rowOff2 + x]);
                if (isBoundaryRow) {
                    sumBv += diff;
                    countBv++;
                } else {
                    sumIv += diff;
                    countIv++;
                }
            }
        }

        if (countBh > 0 && countIh > 0 && countBv > 0 && countIv > 0) {
            const meanBh = sumBh / countBh;
            const meanIh = sumIh / countIh + 1e-5;
            const meanBv = sumBv / countBv;
            const meanIv = sumIv / countIv + 1e-5;
            blockinessScore = 0.5 * ((meanBh / meanIh) + (meanBv / meanIv));
        }
    }
    const isHeavyCompression = blockinessScore > 1.40;

    const warnings = [];
    let rejectCode = null;

    if (!isSufficientRes) {
        rejectCode = 'REJECT_LOW_RESOLUTION';
        warnings.push('Low resolution (' + w + 'x' + h + ' px). Apical textures cannot be verified.');
    } else if (!isValidAr) {
        rejectCode = 'REJECT_INVALID_ASPECT_RATIO';
        warnings.push('Non-standard aspect ratio (' + ar.toFixed(2) + '). Valid CXR range is 0.65 - 1.55.');
    } else if (isColor) {
        rejectCode = 'REJECT_NON_RADIOGRAPH_COLOR';
        warnings.push('Full color image detected (Saturation index ' + meanSat.toFixed(1) + ' > 25.0). CXR must be monochrome.');
    } else if (isInvalidAnatomyDoc) {
        rejectCode = 'REJECT_INVALID_ANATOMY_DOCUMENT';
        warnings.push('Invalid anatomy: Document or blank page detected (White: ' + (whiteRatio * 100).toFixed(1) + '%, Black: ' + (blackRatio * 100).toFixed(1) + '%).');
    } else if (!isSufficientContrast) {
        rejectCode = 'REJECT_LOW_CONTRAST';
        warnings.push('Low dynamic contrast range (' + dynamicRange.toFixed(1) + ' < 35.0). Image is washed out or flat.');
    } else if (isHeavyCompression) {
        rejectCode = 'REJECT_HEAVY_COMPRESSION';
        warnings.push('Severe compression artifacts (Blockiness ' + blockinessScore.toFixed(2) + ' > 1.40). Risk of spurious reticular noise.');
    }

    if (isInverted) {
        warnings.push('Photometric polarity inverted (MONOCHROME1). Auto-correction active.');
    }

    const qualityPassed = (rejectCode === null);

    return {
        aspect_ratio: parseFloat(ar.toFixed(3)),
        is_valid_aspect_ratio: isValidAr,
        resolution: origW + 'x' + origH,
        is_sufficient_resolution: isSufficientRes,
        saturation_index: parseFloat(meanSat.toFixed(2)),
        is_color: isColor,
        dynamic_range: parseFloat(dynamicRange.toFixed(1)),
        is_sufficient_contrast: isSufficientContrast,
        is_invalid_anatomy: isInvalidAnatomyDoc,
        white_pixel_ratio: parseFloat(whiteRatio.toFixed(3)),
        black_pixel_ratio: parseFloat(blackRatio.toFixed(3)),
        is_inverted: isInverted,
        blockiness_score: parseFloat(blockinessScore.toFixed(3)),
        is_heavy_compression: isHeavyCompression,
        quality_passed: qualityPassed,
        reject_code: rejectCode,
        warnings: warnings
    };
}

function preprocessImageForONNX(imageElement, isInverted = false) {
    const canvas512 = document.createElement('canvas');
    canvas512.width = 512;
    canvas512.height = 512;
    const ctx512 = canvas512.getContext('2d');
    ctx512.imageSmoothingEnabled = true;
    ctx512.imageSmoothingQuality = 'high';
    ctx512.drawImage(imageElement, 0, 0, 512, 512);

    const rawData = ctx512.getImageData(0, 0, 512, 512).data;
    const totalPixels = 512 * 512;

    // Convert to grayscale luminance with non-destructive auto-correction if inverted
    const gray = new Float32Array(totalPixels);
    for (let i = 0; i < totalPixels; i++) {
        const idx = i * 4;
        let lum = 0.299 * rawData[idx] + 0.587 * rawData[idx + 1] + 0.114 * rawData[idx + 2];
        if (isInverted) {
            lum = 255.0 - lum;
        }
        gray[i] = lum;
    }

    // Central-thorax percentile windowing (15% to 85% horizontal and vertical)
    const y1 = Math.floor(0.15 * 512), y2 = Math.floor(0.85 * 512);
    const x1 = Math.floor(0.15 * 512), x2 = Math.floor(0.85 * 512);
    const thoraxCount = (y2 - y1) * (x2 - x1);
    const thoraxPixels = new Float32Array(thoraxCount);
    let tIdx = 0;
    for (let y = y1; y < y2; y++) {
        const rowOffset = y * 512;
        for (let x = x1; x < x2; x++) {
            thoraxPixels[tIdx++] = gray[rowOffset + x];
        }
    }

    thoraxPixels.sort();
    const p1 = thoraxPixels[Math.floor(thoraxCount * 0.01)];
    const p99 = thoraxPixels[Math.floor(thoraxCount * 0.99)];
    const denom = Math.max(1.0, p99 - p1);

    // ImageNet normalization across 3 grayscale channels in planar NCHW format
    const mean = [0.485, 0.456, 0.406];
    const std = [0.229, 0.224, 0.225];
    const floatData = new Float32Array(3 * totalPixels);

    for (let i = 0; i < totalPixels; i++) {
        let val = (gray[i] - p1) / denom;
        if (val < 0.0) val = 0.0;
        else if (val > 1.0) val = 1.0;

        floatData[i] = (val - mean[0]) / std[0];
        floatData[totalPixels + i] = (val - mean[1]) / std[1];
        floatData[2 * totalPixels + i] = (val - mean[2]) / std[2];
    }
    return new ort.Tensor('float32', floatData, [1, 3, 512, 512]);
}

function generateHeatmapDataUrl(camArray, origWidth, origHeight, probTb) {
    // If patient is Normal or TB probability is under 50% (Normal favored), suppress heatmap.
    // Clinically, normal or equivocal radiographs must not display false positive lesion hotspots on cortical bone.
    if (probTb !== undefined && probTb < 0.50) {
        return null;
    }

    const camDim = Math.round(Math.sqrt(camArray.length)) || 512;
    let maxVal = 0;
    const taperedCam = new Float32Array(camArray.length);
    for (let i = 0; i < camArray.length; i++) {
        const y = Math.floor(i / camDim);
        const x = i % camDim;
        const ny = (y / (camDim - 1)) * 2.0 - 1.0;
        const nx = (x / (camDim - 1)) * 2.0 - 1.0;
        const r = Math.sqrt(nx * nx + ny * ny);
        
        let taper = 1.0;
        if (r > 0.6) {
            taper = Math.max(0.0, 1.0 - Math.pow((r - 0.6) / 0.4, 2.0));
        }
        taperedCam[i] = camArray[i] * taper;
        if (taperedCam[i] > maxVal) maxVal = taperedCam[i];
    }

    // Suppress if activation is essentially zero
    if (maxVal <= 0.05) {
        return null;
    }

    const camCanvas = document.createElement('canvas');
    camCanvas.width = camDim;
    camCanvas.height = camDim;
    const camCtx = camCanvas.getContext('2d');
    const imgData = camCtx.createImageData(camDim, camDim);

    // Confidence-modulated alpha: higher TB probability produces more visible contrast
    const baseAlphaScale = probTb !== undefined ? Math.min(1.0, Math.max(0.4, probTb)) : 0.8;

    for (let i = 0; i < taperedCam.length; i++) {
        const norm = taperedCam[i] / maxVal;
        
        // Colormap (Jet / Turbo: Blue -> Cyan -> Yellow -> Red)
        const four_v = 4.0 * norm;
        const r = Math.min(Math.max(1.5 - Math.abs(four_v - 3.0), 0.0), 1.0);
        const g = Math.min(Math.max(1.5 - Math.abs(four_v - 2.0), 0.0), 1.0);
        const b = Math.min(Math.max(1.5 - Math.abs(four_v - 1.0), 0.0), 1.0);

        // Alpha thresholding: only show focal significant activations (> 35% of max)
        const alpha = norm > 0.35 ? Math.min(210, Math.round(norm * 240 * baseAlphaScale)) : 0;
        const idx = i * 4;
        imgData.data[idx] = Math.round(r * 255);
        imgData.data[idx + 1] = Math.round(g * 255);
        imgData.data[idx + 2] = Math.round(b * 255);
        imgData.data[idx + 3] = alpha;
    }
    camCtx.putImageData(imgData, 0, 0);

    const outCanvas = document.createElement('canvas');
    outCanvas.width = origWidth || 512;
    outCanvas.height = origHeight || 512;
    const outCtx = outCanvas.getContext('2d');
    outCtx.imageSmoothingEnabled = true;
    outCtx.imageSmoothingQuality = 'high';
    outCtx.drawImage(camCanvas, 0, 0, outCanvas.width, outCanvas.height);

    return outCanvas.toDataURL('image/png');
}

async function runClientSideInference(file, imageElement, iqaResult) {
    const session = await getOrtSession();
    const t0 = performance.now();
    const isInverted = iqaResult ? iqaResult.is_inverted : false;
    const tensor = preprocessImageForONNX(imageElement, isInverted);

    const results = await session.run({ input: tensor });
    const logits = results.logits.data;
    const camData = results.cam.data;
    const latents = results.latents.data;

    // Real Latent Feature OOD Detection (Mahalanobis Distance to Reference Cohort)
    let sumSq0 = 0.0;
    let sumSq1 = 0.0;
    const mu0 = OOD_REFERENCE_CALIBRATION.mu_0;
    const mu1 = OOD_REFERENCE_CALIBRATION.mu_1;
    const stdInv = OOD_REFERENCE_CALIBRATION.std_inv;

    for (let i = 0; i < 1024; i++) {
        const diff0 = (latents[i] - mu0[i]) * stdInv[i];
        const diff1 = (latents[i] - mu1[i]) * stdInv[i];
        sumSq0 += diff0 * diff0;
        sumSq1 += diff1 * diff1;
    }
    const d0 = Math.sqrt(sumSq0);
    const d1 = Math.sqrt(sumSq1);
    const dMin = Math.min(d0, d1);
    const isOod = (dMin > OOD_REFERENCE_CALIBRATION.threshold_diag);

    const oodWarning = isOod
        ? (currentLang === 'id'
            ? 'Anomali OOD: Representasi fitur laten citra menyimpang dari populasi kalibrasi rontgen toraks (Jarak ' + dMin.toFixed(2) + ' > ' + OOD_REFERENCE_CALIBRATION.threshold_diag + '). Wajib telaah dokter spesialis.'
            : 'OOD Anomaly: Latent feature representation diverges from thoracic reference population (Distance ' + dMin.toFixed(2) + ' > ' + OOD_REFERENCE_CALIBRATION.threshold_diag + '). Expert physician review mandatory.')
        : null;

    const oodReport = {
        mahalanobis_distance: parseFloat(dMin.toFixed(2)),
        distance_to_normal: parseFloat(d0.toFixed(2)),
        distance_to_tb: parseFloat(d1.toFixed(2)),
        threshold: OOD_REFERENCE_CALIBRATION.threshold_diag,
        is_ood: isOod,
        warning: oodWarning
    };

    const T = 2.1161616;
    const maxLogit = Math.max(logits[0], logits[1]);
    const exp0 = Math.exp((logits[0] - maxLogit) / T);
    const exp1 = Math.exp((logits[1] - maxLogit) / T);
    const probTb = exp1 / (exp0 + exp1);
    const probNormal = 1.0 - probTb;

    const q0 = 0.281667;
    const q1 = 0.955110;

    // Standard Split Conformal Set Construction: include y iff P(Y=y|X) >= 1 - q_y
    const conformalSet = [];
    const includeNormal = (probNormal >= (1.0 - q0));
    const includeTb = (probTb >= (1.0 - q1));

    if (includeNormal) conformalSet.push('Normal');
    if (includeTb) conformalSet.push('Tuberculosis');

    let triageAction = 'REFER_AMBIGUOUS_TO_DOCTOR';
    let safetyInterlock = true;
    let warningMsg = null;

    // Strict Decision Rules with OOD Safety Interlock
    if (isOod) {
        triageAction = 'REFER_AMBIGUOUS_TO_DOCTOR';
        safetyInterlock = true;
        warningMsg = oodReport.warning;
    } else if (conformalSet.includes('Tuberculosis') && probTb >= 0.65 && probTb > probNormal) {
        triageAction = 'AUTO_FLAG_TB_URGENT';
        safetyInterlock = false;
        warningMsg = 'High Risk Pulmonary TB suspected (Calibrated P(TB)=' + (probTb * 100).toFixed(1) + '% exceeds high-risk threshold 65.0%). Immediate microbiological sputum GeneXpert test and urgent clinician evaluation indicated.';
    } else if (conformalSet.length === 1 && conformalSet[0] === 'Normal' && probTb < 0.20 && probNormal >= 0.80) {
        triageAction = 'ASSISTIVE_NORMAL_DOCTOR_VERIFY';
        safetyInterlock = true;
        warningMsg = 'Assistive normal verification: No focal pulmonary consolidation or cavitary infiltrate detected. Physician confirmation required.';
    } else {
        triageAction = 'REFER_AMBIGUOUS_TO_DOCTOR';
        safetyInterlock = true;
        if (Math.abs(probTb - probNormal) < 0.15 || (probTb >= 0.40 && probTb <= 0.60)) {
            warningMsg = 'Equivocal / Borderline Triage: Posterior probability (P(TB)=' + (probTb * 100).toFixed(1) + '%, P(Normal)=' + (probNormal * 100).toFixed(1) + '%) is split near the 50/50 decision boundary. Autonomous classification prohibited; expert physician radiologist evaluation mandatory.';
        } else if (conformalSet.length === 0) {
            warningMsg = 'Non-conformal sample (empty prediction set): Model uncertain under distribution shift. Clinical referral mandatory.';
        } else if (conformalSet.length > 1) {
            warningMsg = 'Conformal ambiguity (multi-label set {Normal, Tuberculosis}): Radiograph exhibits mixed or subtle thoracic features. Autonomous release prohibited. Physician evaluation mandatory.';
        } else {
            warningMsg = 'Intermediate suspicion: Posterior P(TB)=' + (probTb * 100).toFixed(1) + '%. Clinical referral mandatory before initiating treatment or discharge.';
        }
    }

    const heatDataUrl = isOod ? null : generateHeatmapDataUrl(camData, imageElement.naturalWidth || 512, imageElement.naturalHeight || 512, probTb);
    const heatBase64 = heatDataUrl;
    const latMs = Math.round(performance.now() - t0);

    return {
        filename: file.name,
        predicted_class: probTb >= 0.4401 ? 'Tuberculosis' : 'Normal',
        probability_tb: parseFloat(probTb.toFixed(4)),
        probability_normal: parseFloat(probNormal.toFixed(4)),
        decision_threshold_used: 0.4401,
        triage_action: triageAction,
        conformal_details: {
            conformal_set: conformalSet,
            quantile_q0_normal: q0,
            quantile_q1_tb: q1,
            nominal_coverage_guarantee: '>= 95.0%',
            clinical_action_code: triageAction,
            safety_interlock_engaged: safetyInterlock
        },
        warning: warningMsg,
        iqa_report: iqaResult,
        ood_report: oodReport,
        allow_autonomous_release: false,
        hirescam_heatmap_base64: heatBase64,
        inference_latency_ms: latMs,
        execution_mode: 'IN_BROWSER_WASM'
    };
}

// 8. Single CXR Triage Execution (Dual Mode Live/Static)
async function submitSingleTriage() {
    if (!selectedFile || isSubmitting) return;
    isSubmitting = true;
    setLoadingState(true);

    try {
        if (!originalImageSrc && selectedFile) {
            originalImageSrc = await new Promise((resolve, reject) => {
                const r = new FileReader();
                r.onload = () => resolve(r.result);
                r.onerror = reject;
                r.readAsDataURL(selectedFile);
            });
        }
        const tempImg = new Image();
        tempImg.src = originalImageSrc;
        await new Promise((resolve, reject) => {
            if (tempImg.complete) resolve();
            else {
                tempImg.onload = resolve;
                tempImg.onerror = reject;
            }
        });

        // 1. Pre-Analytic IQA Gatekeeper Evaluation (Fail-Fast)
        const iqaResult = evaluatePreAnalyticQuality(tempImg);
        if (!iqaResult.quality_passed) {
            setLoadingState(false);
            isSubmitting = false;
            renderRejectionResults(selectedFile.name, iqaResult);
            return;
        }

        // 2. Pure 100% In-Browser WebAssembly Inference (0ms Network Latency, Air-Gapped Local RAM)
        const data = await runClientSideInference(selectedFile, tempImg, iqaResult);
        setLoadingState(false);
        isSubmitting = false;
        renderSingleResults(data);
    } catch(wasmErr) {
        setLoadingState(false);
        isSubmitting = false;
        console.error('[WASM INFERENCE ERROR]', wasmErr);
        renderIdiograph('ERROR_RUNTIME', wasmErr.message || 'WASM Execution Error');
    }
}

function setLoadingState(isLoading) {
    const emptyBox = document.getElementById('empty-state');
    const loadingBox = document.getElementById('loading-state');
    const resultsBox = document.getElementById('results-display');
    const submitBtn = document.getElementById('btn-submit');

    if (submitBtn) submitBtn.disabled = isLoading;

    if (isLoading) {
        if (emptyBox) emptyBox.style.display = 'none';
        if (resultsBox) resultsBox.style.display = 'none';
        if (loadingBox) loadingBox.style.display = 'block';
    } else {
        if (loadingBox) loadingBox.style.display = 'none';
    }
}

let currentResultData = null;

function renderSingleResults(data) {
    currentResultData = data;
    const emptyBox = document.getElementById('empty-state');
    const resultsBox = document.getElementById('results-display');
    if (emptyBox) emptyBox.style.display = 'none';
    if (resultsBox) resultsBox.style.display = 'block';

    const isOod = Boolean(data.ood_report && data.ood_report.is_ood);

    // 1. Idiograph & Action Banner
    renderIdiograph(data.triage_action, data.warning, isOod, null, data.ood_report);

    // 2. Images in Comparison Slider
    const imgBase = document.getElementById('img-base');
    const imgHeat = document.getElementById('img-heat');
    if (imgBase && originalImageSrc) imgBase.src = originalImageSrc;
    const rawHeat = data.hirescam_heatmap_base64 || data.hirescam_overlay_url;
    if (imgHeat) {
        if (rawHeat) {
            if (rawHeat.startsWith('data:') || rawHeat.startsWith('http:') || rawHeat.startsWith('https:') || rawHeat.startsWith('./') || rawHeat.startsWith('/')) {
                imgHeat.src = rawHeat;
            } else {
                imgHeat.src = 'data:image/png;base64,' + rawHeat;
            }
        } else {
            if (originalImageSrc) imgHeat.src = originalImageSrc;
        }
    }
    setSliderMode('split');

    // 3. Probabilities
    const pTbPct = (data.probability_tb * 100).toFixed(2);
    const pNormPct = (data.probability_normal * 100).toFixed(2);
    const valTb = document.getElementById('val-prob-tb');
    const valNorm = document.getElementById('val-prob-norm');
    const barTb = document.getElementById('bar-prob-tb');
    const barNorm = document.getElementById('bar-prob-norm');

    if (valTb) valTb.innerText = pTbPct + '%';
    if (valNorm) valNorm.innerText = pNormPct + '%';
    if (barTb) barTb.style.width = pTbPct + '%';
    if (barNorm) barNorm.style.width = pNormPct + '%';

    // 4. Metadata Matrix
    const metSet = document.getElementById('met-set');
    const metAction = document.getElementById('met-action');
    const metOod = document.getElementById('met-ood');
    const metLat = document.getElementById('met-lat');

    if (metSet) metSet.innerText = '{' + data.conformal_details.conformal_set.join(', ') + '}';
    if (metAction) {
        metAction.innerText = data.triage_action;
        metAction.style.color = 'var(--text-main)';
    }
    
    if (metOod) {
        if (isOod) {
            metOod.innerText = 'OOD ANOMALY (D=' + data.ood_report.mahalanobis_distance.toFixed(2) + ' > ' + data.ood_report.threshold + ')';
            metOod.style.color = 'var(--color-referral)';
        } else if (data.ood_report) {
            metOod.innerText = 'IN-DISTRIBUTION (D=' + data.ood_report.mahalanobis_distance.toFixed(2) + ')';
            metOod.style.color = 'var(--color-normal)';
        }
    }

    if (metLat) metLat.innerText = data.inference_latency_ms + ' ms';
}

function renderRejectionResults(filename, iqa) {
    currentResultData = { filename: filename, is_rejection: true, iqa_report: iqa };

    const emptyBox = document.getElementById('empty-state');
    const resultsBox = document.getElementById('results-display');
    if (emptyBox) emptyBox.style.display = 'none';
    if (resultsBox) resultsBox.style.display = 'block';

    // 1. Idiograph & Action Banner (Rejection Status)
    renderIdiograph(iqa.reject_code, iqa.warnings[0], false, iqa.reject_code);

    // 2. Images in Comparison Slider: Native radiograph only
    const imgBase = document.getElementById('img-base');
    const imgHeat = document.getElementById('img-heat');
    if (imgBase && originalImageSrc) imgBase.src = originalImageSrc;
    if (imgHeat && originalImageSrc) imgHeat.src = originalImageSrc;
    setSliderMode('orig');

    // 3. Probabilities: 0.00%
    const valTb = document.getElementById('val-prob-tb');
    const valNorm = document.getElementById('val-prob-norm');
    const barTb = document.getElementById('bar-prob-tb');
    const barNorm = document.getElementById('bar-prob-norm');

    if (valTb) valTb.innerText = '0.00%';
    if (valNorm) valNorm.innerText = '0.00%';
    if (barTb) barTb.style.width = '0%';
    if (barNorm) barNorm.style.width = '0%';

    // 4. Metadata Matrix
    const metSet = document.getElementById('met-set');
    const metAction = document.getElementById('met-action');
    const metOod = document.getElementById('met-ood');
    const metLat = document.getElementById('met-lat');

    if (metSet) metSet.innerText = '{Ditolak / Rejected}';
    if (metAction) {
        metAction.innerText = iqa.reject_code;
        metAction.style.color = 'var(--color-tb)';
    }
    if (metOod) {
        metOod.innerText = 'REJECTED (PRE-ANALYTIC)';
        metOod.style.color = 'var(--color-tb)';
    }
    if (metLat) metLat.innerText = '< 5 ms (IQA Gatekeeper)';
}

let activeTriageAction = null;
let activeTriageWarning = null;

function refreshActiveIdiograph() {
    if (currentResultData) {
        if (currentResultData.is_rejection) {
            renderRejectionResults(currentResultData.filename, currentResultData.iqa_report);
        } else {
            renderSingleResults(currentResultData);
        }
    }
}

function renderIdiograph(action, warning, isOod = false, iqaRejectCode = null, oodReport = null) {
    activeTriageAction = action;
    activeTriageWarning = warning;

    const banner = document.getElementById('idiograph-banner');
    const badge = document.getElementById('action-badge');
    const title = document.getElementById('action-title');
    const desc = document.getElementById('action-desc');
    const iconContainer = document.getElementById('action-icon-container');
    const t = I18N_DICT[currentLang] || I18N_DICT.en;

    if (!banner) return;
    banner.className = 'idiograph-banner';

    // Case 1: Pre-Analytic Rejection
    if (iqaRejectCode || (action && action.startsWith('REJECT_'))) {
        const code = iqaRejectCode || action;
        banner.classList.add('action-reject');
        if (badge) badge.innerText = t.actionRejectBadge;

        if (code === 'REJECT_NON_RADIOGRAPH_COLOR') {
            if (title) title.innerText = t.rejectColorTitle;
            if (desc) desc.innerText = t.rejectColorDesc;
        } else if (code === 'REJECT_INVALID_ANATOMY_DOCUMENT') {
            if (title) title.innerText = t.rejectDocTitle;
            if (desc) desc.innerText = t.rejectDocDesc;
        } else if (code === 'REJECT_LOW_CONTRAST') {
            if (title) title.innerText = t.rejectContrastTitle;
            if (desc) desc.innerText = t.rejectContrastDesc;
        } else if (code === 'REJECT_INVALID_ASPECT_RATIO') {
            if (title) title.innerText = t.rejectAspectTitle;
            if (desc) desc.innerText = t.rejectAspectDesc;
        } else if (code === 'REJECT_LOW_RESOLUTION') {
            if (title) title.innerText = t.rejectResTitle;
            if (desc) desc.innerText = t.rejectResDesc;
        } else if (code === 'REJECT_HEAVY_COMPRESSION') {
            if (title) title.innerText = t.rejectCompressionTitle;
            if (desc) desc.innerText = t.rejectCompressionDesc;
        } else {
            if (title) title.innerText = t.actionRejectBadge;
            if (desc) desc.innerText = warning || t.rejectDocDesc;
        }

        if (iconContainer) {
            iconContainer.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>';
        }
        return;
    }

    // Case 2: OOD Anomaly
    if (isOod) {
        banner.classList.add('action-ood');
        if (badge) badge.innerText = t.actionOodBadge;
        if (title) title.innerText = t.actionOodTitle;
        if (desc) desc.innerText = t.actionOodDesc;
        if (iconContainer) {
            iconContainer.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
        }
        return;
    }

    // Case 3: Standard In-Distribution Outcomes
    if (action === 'AUTO_RELEASE_NORMAL' || action === 'ASSISTIVE_NORMAL_DOCTOR_VERIFY') {
        banner.classList.add('action-normal');
        if (badge) badge.innerText = t.actionNormalBadge;
        if (title) title.innerText = t.actionNormalTitle;
        if (desc) desc.innerText = t.actionNormalDesc;
        if (iconContainer) {
            iconContainer.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
        }
    } else if (action === 'AUTO_FLAG_TB_URGENT') {
        banner.classList.add('action-tb');
        if (badge) badge.innerText = t.actionTbBadge;
        if (title) title.innerText = t.actionTbTitle;
        if (desc) desc.innerText = t.actionTbDesc;
        if (iconContainer) {
            iconContainer.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
        }
    } else {
        banner.classList.add('action-referral');
        if (badge) badge.innerText = t.actionRefBadge;
        if (title) title.innerText = t.actionRefTitle;
        if (desc) desc.innerText = t.actionRefDesc;
        if (iconContainer) {
            iconContainer.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
        }
    }
}

// 8. Parallel Batch Screening Handlers
function initBatchHandlers() {
    const batchDrop = document.getElementById('batch-drop-zone');
    const batchInput = document.getElementById('batch-file-input');

    if (batchDrop) {
        batchDrop.addEventListener('dragover', function(e) {
            e.preventDefault();
            batchDrop.classList.add('drag-over');
        });
        batchDrop.addEventListener('dragleave', function(e) {
            batchDrop.classList.remove('drag-over');
        });
        batchDrop.addEventListener('drop', function(e) {
            e.preventDefault();
            batchDrop.classList.remove('drag-over');
            if (e.dataTransfer.files.length > 0) {
                queueBatchFiles(Array.from(e.dataTransfer.files));
            }
        });
    }

    if (batchInput) {
        batchInput.addEventListener('change', function(e) {
            if (batchInput.files.length > 0) {
                queueBatchFiles(Array.from(batchInput.files));
            }
        });
    }
}

function queueBatchFiles(files) {
    batchFiles = files.filter(f => f.name.match(/\.(png|jpe?g|dcm)$/i));
    const statusLabel = document.getElementById('batch-queue-status');
    const startBtn = document.getElementById('btn-batch-start');
    const kpiTotal = document.getElementById('kpi-total-val');

    if (statusLabel) statusLabel.innerText = batchFiles.length + ' radiographs queued for parallel triage.';
    if (kpiTotal) kpiTotal.innerText = batchFiles.length;
    if (startBtn) startBtn.disabled = batchFiles.length === 0;
}

async function processBatchItem(file) {
    const imgUrl = URL.createObjectURL(file);
    const tempImg = new Image();
    tempImg.src = imgUrl;

    try {
        await new Promise((resolve, reject) => {
            tempImg.onload = resolve;
            tempImg.onerror = reject;
        });

        // 1. Pre-Analytic Quality Assessment (Fail-Fast for Batch Items)
        const iqaResult = evaluatePreAnalyticQuality(tempImg);
        if (!iqaResult.quality_passed) {
            const rejectAction = iqaResult.reject_code || 'REJECT_NON_RADIOGRAPH';
            return {
                filename: file.name,
                predicted_class: 'Rejected',
                probability_tb: 0.0,
                probability_normal: 0.0,
                decision_threshold_used: 0.4401,
                triage_action: rejectAction,
                conformal_details: {
                    conformal_set: ['Rejected'],
                    quantile_q0_normal: 0.2817,
                    quantile_q1_tb: 0.9551,
                    nominal_coverage_guarantee: 'N/A',
                    clinical_action_code: rejectAction,
                    safety_interlock_engaged: true
                },
                warning: iqaResult.warnings.join('; '),
                iqa_report: iqaResult,
                ood_report: {
                    mahalanobis_distance: 0,
                    threshold: (typeof OOD_REFERENCE_CALIBRATION !== 'undefined') ? OOD_REFERENCE_CALIBRATION.threshold_diag : 41.94,
                    is_ood: false,
                    warning: 'Pre-analytic rejection: ' + rejectAction
                },
                allow_autonomous_release: false,
                hirescam_heatmap_base64: null,
                inference_latency_ms: 2,
                execution_mode: 'IN_BROWSER_WASM'
            };
        }

        // 2. Client-Side WASM Inference with Real Latent OOD Check
        const data = await runClientSideInference(file, tempImg, iqaResult);
        return data;
    } finally {
        URL.revokeObjectURL(imgUrl);
    }
}

async function startBatchProcessing() {
    if (batchFiles.length === 0 || isBatchRunning) return;
    isBatchRunning = true;
    batchResults = new Array(batchFiles.length);

    const startBtn = document.getElementById('btn-batch-start');
    const csvBtn = document.getElementById('btn-batch-csv');
    const progressBox = document.getElementById('batch-progress-box');
    const progressBar = document.getElementById('batch-progress-bar');
    const tbody = document.getElementById('batch-tbody');

    if (startBtn) startBtn.disabled = true;
    if (csvBtn) csvBtn.disabled = true;
    if (progressBox) progressBox.style.display = 'block';
    if (tbody) tbody.innerHTML = '';

    let normalCount = 0;
    let tbCount = 0;
    let refCount = 0;
    let completed = 0;
    const total = batchFiles.length;

    // Worker pool concurrency = 4
    const concurrency = 4;
    let index = 0;

    async function worker() {
        while (index < total) {
            const currentIndex = index++;
            const file = batchFiles[currentIndex];

            const t = I18N_DICT[currentLang] || I18N_DICT.id;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${currentIndex + 1}</td>
                <td>${file.name}</td>
                <td id="status-${currentIndex}">${t.batchStatusProcessing}</td>
                <td id="prob-${currentIndex}">-</td>
                <td id="action-${currentIndex}">-</td>
                <td id="lat-${currentIndex}">-</td>
            `;
            if (tbody) tbody.appendChild(row);

            try {
                const data = await processBatchItem(file);
                const lat = data.inference_latency_ms;

                if (data) {
                    batchResults[currentIndex] = data;
                    const isRejected = data.triage_action.startsWith('REJECT_') || data.predicted_class === 'Rejected';
                    document.getElementById(`status-${currentIndex}`).innerText = isRejected ? t.batchStatusRejected : t.batchStatusSuccess;
                    document.getElementById(`prob-${currentIndex}`).innerText = isRejected ? '0.0%' : (data.probability_tb * 100).toFixed(1) + '%';
                    document.getElementById(`action-${currentIndex}`).innerText = data.triage_action;
                    document.getElementById(`lat-${currentIndex}`).innerText = lat + ' ms';

                    if (data.triage_action === 'AUTO_RELEASE_NORMAL') normalCount++;
                    else if (data.triage_action === 'AUTO_FLAG_TB_URGENT') tbCount++;
                    else refCount++;
                } else {
                    batchResults[currentIndex] = null;
                    document.getElementById(`status-${currentIndex}`).innerText = t.batchStatusFailed;
                    document.getElementById(`action-${currentIndex}`).innerText = 'Inference failed';
                }
            } catch(e) {
                batchResults[currentIndex] = null;
                document.getElementById(`status-${currentIndex}`).innerText = t.batchStatusFailed;
                document.getElementById(`action-${currentIndex}`).innerText = e.message;
            }

            completed++;
            const pct = Math.round((completed / total) * 100);
            if (progressBar) progressBar.style.width = pct + '%';
            document.getElementById('kpi-normal-val').innerText = normalCount;
            document.getElementById('kpi-tb-val').innerText = tbCount;
            document.getElementById('kpi-ref-val').innerText = refCount;
        }
    }

    const workers = [];
    for (let i = 0; i < Math.min(concurrency, total); i++) {
        workers.push(worker());
    }
    await Promise.all(workers);

    isBatchRunning = false;
    if (startBtn) startBtn.disabled = false;
    if (csvBtn) csvBtn.disabled = batchResults.filter(Boolean).length === 0;
}

function exportBatchCsv() {
    const validResults = batchResults.filter(Boolean);
    if (validResults.length === 0) return;
    const headers = ['Index', 'Filename', 'Predicted_Class', 'Probability_TB', 'Probability_Normal', 'Conformal_Set', 'Triage_Action', 'Latency_ms'];
    const rows = validResults.map((r, i) => [
        i + 1,
        `"${r.filename}"`,
        r.predicted_class,
        r.probability_tb.toFixed(4),
        r.probability_normal.toFixed(4),
        `"${(r.conformal_details && r.conformal_details.conformal_set) ? r.conformal_details.conformal_set.join('; ') : ''}"`,
        r.triage_action,
        r.inference_latency_ms
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `TB_Conformal_Triage_Roster_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
}

// 9. Initialization
document.addEventListener('DOMContentLoaded', function() {
    checkDisclaimerStatus();
    initSingleFileHandlers();
    initBatchHandlers();
    initSystemStatus();
    applyLanguage(currentLang);
    
    // Background preload ONNX model into browser RAM so inference is instant
    setTimeout(function() {
        if (!ortSession && !isModelLoading) {
            getOrtSession().then(function() {
                console.log('[ORT PRELOAD] DenseNet-121 model cached in RAM.');
            }).catch(function(e) {
                console.log('[ORT PRELOAD NOTICE] Background preload deferred to user interaction:', e);
            });
        }
    }, 1500);
});
