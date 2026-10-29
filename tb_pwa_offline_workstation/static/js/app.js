// Main Clinical Workstation Application Controller (100% Offline PWA Mode)

// Service Worker Registration for Complete Air-Gapped Offline Operation
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js?v=4.4.0-batch').then((reg) => {
            console.log('[PWA ServiceWorker] Active with scope:', reg.scope);
            if (reg.update) {
                reg.update();
            }
        }).catch((err) => {
            console.warn('[PWA ServiceWorker] Registration failed:', err);
        });
    });
}

// PWA Installation Handling ("Tombol Paling Gede")
let deferredPrompt = null;

function isPWAStandaloneOrInstalled() {
    return Boolean(
        (window.matchMedia && (
            window.matchMedia('(display-mode: standalone)').matches ||
            window.matchMedia('(display-mode: fullscreen)').matches ||
            window.matchMedia('(display-mode: minimal-ui)').matches
        )) ||
        window.navigator.standalone === true ||
        safeStorage.getItem('tb_pwa_installed') === 'true'
    );
}

function syncPWAInstallBanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (!banner) return;
    if (isPWAStandaloneOrInstalled()) {
        banner.style.display = 'none';
    }
}

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('[PWA] beforeinstallprompt captured.');
    if (!isPWAStandaloneOrInstalled()) {
        const banner = document.getElementById('pwa-install-banner');
        if (banner) banner.style.display = 'block';
    }
});

window.addEventListener('appinstalled', () => {
    console.log('[PWA] Application successfully installed.');
    deferredPrompt = null;
    safeStorage.setItem('tb_pwa_installed', 'true');
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.style.display = 'none';
});

if (window.matchMedia) {
    try {
        window.matchMedia('(display-mode: standalone)').addEventListener('change', syncPWAInstallBanner);
    } catch(e) {}
}

async function triggerPWAInstall() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('[PWA] User choice outcome:', outcome);
        if (outcome === 'accepted') {
            safeStorage.setItem('tb_pwa_installed', 'true');
            const banner = document.getElementById('pwa-install-banner');
            if (banner) banner.style.display = 'none';
        }
        deferredPrompt = null;
    } else {
        alert(I18N_DICT[currentLang].installHelp);
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
let singleSelectionVersion = 0;

// Batch State
let batchFiles = [];
let batchResults = [];
let isBatchRunning = false;
let isBatchCancelled = false;

// 1. Theme Management
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    const btn = document.getElementById('txt-theme');
    if (btn) btn.innerText = currentTheme === 'light' ? I18N_DICT[currentLang].themeDark : I18N_DICT[currentLang].themeLight;
}

// 2. Mode Switching & Single State Management
function switchMode(mode) {
    const tabSingle = document.getElementById('tab-single');
    const tabBatch = document.getElementById('tab-batch');
    const panelSingle = document.getElementById('panel-single');
    const panelBatch = document.getElementById('panel-batch');
    const returnBtn = document.getElementById('btn-batch-return');

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
        if (returnBtn) returnBtn.style.display = 'none';
    }
}

function returnToBatchMode() {
    switchMode('batch');
}

// Invalidate the exact pending file without cancelling an unrelated case or model task.
function invalidateSingleRequest(file) {
    if (selectedFile !== file) return false;
    ++singleSelectionVersion;
    selectedFile = null;
    originalImageSrc = null;
    currentResultData = null;
    const input = document.getElementById('file-input');
    if (input) input.value = '';
    const status = document.getElementById('file-status');
    if (status) status.style.display = 'none';
    const submit = document.getElementById('btn-submit');
    if (submit) submit.disabled = true;
    if (document.body.dataset.workspaceView === 'single') {
        const results = document.getElementById('results-display');
        if (results) results.style.display = 'none';
        const empty = document.getElementById('empty-state');
        if (empty) empty.style.display = 'block';
        showInputPreview(null);
    }
    return true;
}

function showInputPreview(source) {
    const preview = document.getElementById('input-preview');
    const empty = document.getElementById('empty-state');
    if (!preview || !empty) return;
    preview.hidden = !source;
    preview.src = source || '';
    empty.classList.toggle('has-preview', Boolean(source));
    const t = I18N_DICT[currentLang];
    const title = document.getElementById('txt-empty-title');
    const desc = document.getElementById('txt-empty-desc');
    if (title) title.textContent = source ? t.inputReady : t.emptyTitle;
    if (desc) desc.textContent = source ? t.inputReadyDesc : t.emptyDesc;
}

function resetSingleTriage() {
    if (window.caseWorkspace?.clearSingle?.() === false) return;
    showInputPreview(null);
    ++singleSelectionVersion;
    selectedFile = null;
    originalImageSrc = null;
    currentResultData = null;
    activeTriageAction = null;
    activeTriageWarning = null;

    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
    const fileStatus = document.getElementById('file-status');
    if (fileStatus) fileStatus.style.display = 'none';
    const submitBtn = document.getElementById('btn-submit');
    if (submitBtn) submitBtn.disabled = true;

    const returnBtn = document.getElementById('btn-batch-return');
    if (returnBtn) returnBtn.style.display = 'none';

    const imgBase = document.getElementById('img-base');
    const imgHeat = document.getElementById('img-heat');
    if (imgBase) imgBase.src = '';
    if (imgHeat) imgHeat.src = '';

    const valTb = document.getElementById('val-prob-tb');
    const valNorm = document.getElementById('val-prob-norm');
    const barTb = document.getElementById('bar-prob-tb');
    const barNorm = document.getElementById('bar-prob-norm');
    if (valTb) valTb.innerText = '0.00%';
    if (valNorm) valNorm.innerText = '0.00%';
    if (barTb) barTb.style.width = '0%';
    if (barNorm) barNorm.style.width = '0%';

    const metSet = document.getElementById('met-set');
    const metAction = document.getElementById('met-action');
    const metOod = document.getElementById('met-ood');
    const metLat = document.getElementById('met-lat');
    if (metSet) metSet.innerText = '-';
    if (metAction) metAction.innerText = '-';
    if (metOod) metOod.innerText = '-';
    if (metLat) metLat.innerText = '0 ms';

    const emptyBox = document.getElementById('empty-state');
    const resultsBox = document.getElementById('results-display');
    const loadingBox = document.getElementById('loading-state');
    if (emptyBox) emptyBox.style.display = 'block';
    if (resultsBox) resultsBox.style.display = 'none';
    if (loadingBox) loadingBox.style.display = 'none';

    setSliderMode('split');
}

// 3. Disclaimer Modal
function checkDisclaimerStatus() {
    const accepted = safeStorage.getItem('tb_triage_disclaimer_accepted');
    const modal = document.getElementById('disclaimer-modal');
    if (!accepted && modal) {
        modal.style.display = 'flex';
        queueMicrotask(() => document.getElementById('modal-language')?.focus());
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
    const target = window.caseWorkspace?.state.view === 'single' ? 'drop-zone' : 'case-workspace';
    document.getElementById(target)?.focus();
}

// 4. System Status Indicator (100% Offline WASM Air-Gapped)
let systemStatusVersion = 0;
async function initSystemStatus() {
    const version = ++systemStatusVersion;
    const statusText = document.getElementById('txt-status');
    const statusDot = document.querySelector('.status-dot');
    const english = currentLang === 'en';
    let offlineReady = false;
    try {
        const registration = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
        if (registration && registration.active && 'caches' in window) {
            const cache = await caches.open('tb-conformal-offline-v4.4.0-batch');
            const required = ['./index.html','./static/js/cases.js', './static/js/reports.js','./static/js/archive.js','./static/js/settings.js','./static/js/app.js','./static/js/i18n.js',
                './static/css/workstation.css','./vendor/onnx/ort.min.js',
                './vendor/onnx/ort-wasm.wasm','./vendor/onnx/ort-wasm-simd.wasm',
                './models/tb_conformal_distilled_v11_cam.onnx'];
            offlineReady = (await Promise.all(required.map(path => cache.match(new URL(path, document.baseURI).href)))).every(Boolean);
        }
    } catch (_) {}
    if (version !== systemStatusVersion) return;
    if (statusText) statusText.textContent = offlineReady
        ? (english ? 'Offline ready' : 'Offline siap')
        : (navigator.onLine ? (english ? 'Online' : 'Daring') : (english ? 'Offline incomplete' : 'Offline belum siap'));
    if (statusDot) statusDot.style.background = offlineReady ? 'var(--color-normal)' : 'var(--color-referral)';
}
window.addEventListener('online', initSystemStatus);
window.addEventListener('offline', initSystemStatus);
window.addEventListener('tb-language-change', initSystemStatus);
if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('controllerchange', initSystemStatus);

// 5. Single CXR Drag & Drop, File Loading
function initSingleFileHandlers() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    if (dropZone) {
        dropZone.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); fileInput?.click(); }
        });
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
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.name.match(/\.(png|jpe?g|webp)$/i)) {
        alert(currentLang === 'en' ? 'Please upload a valid radiograph image (PNG, JPEG, WebP).' : 'Harap unggah file foto rontgen yang valid (PNG, JPEG, atau WebP).');
        return;
    }
    if (window.caseWorkspace?.clearSingle?.() === false) return false;
    showInputPreview(null);
    const selectionVersion = ++singleSelectionVersion;
    selectedFile = file;
    originalImageSrc = null;
    const labelName = document.getElementById('file-name-label') || document.getElementById('lbl-filename');
    const labelSize = document.getElementById('file-size-label') || document.getElementById('lbl-filesize');
    const statusBox = document.getElementById('file-status');
    const submitBtn = document.getElementById('btn-submit');

    if (labelName) labelName.innerText = file.name;
    if (labelSize) labelSize.innerText = (file.size / 1024).toFixed(1) + ' KB';
    if (statusBox) statusBox.style.display = 'block';
    if (submitBtn) submitBtn.disabled = isSubmitting;

    // Reset previous patient's results, heatmap, and UI state to prevent desynchronization
    currentResultData = null;
    const emptyBox = document.getElementById('empty-state');
    const resultsBox = document.getElementById('results-display');
    const loadingBox = document.getElementById('loading-state');
    if (emptyBox) emptyBox.style.display = 'block';
    if (resultsBox) resultsBox.style.display = 'none';
    if (loadingBox) loadingBox.style.display = 'none';

    const imgHeat = document.getElementById('img-heat');
    const imgBase = document.getElementById('img-base');
    if (imgBase) imgBase.src = '';
    if (imgHeat) imgHeat.src = '';
    const barTb = document.getElementById('bar-prob-tb');
    const barNorm = document.getElementById('bar-prob-norm');
    if (barTb) barTb.style.width = '0%';
    if (barNorm) barNorm.style.width = '0%';

    // Read preview
    const reader = new FileReader();
    reader.onload = function(e) {
        if (selectionVersion !== singleSelectionVersion || selectedFile !== file) return;
        originalImageSrc = e.target.result;
        showInputPreview(originalImageSrc);
        const imgBase = document.getElementById('img-base');
        if (imgBase) imgBase.src = originalImageSrc;
    };
    reader.readAsDataURL(file);
    return true;
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
    const selectionVersion = ++singleSelectionVersion;
    try {
        setLoadingState(true);
        const resp = await fetch('./samples/' + sampleName);
        if (!resp.ok) throw new Error('Sample file not found: ' + sampleName);
        const blob = await resp.blob();
        if (selectionVersion !== singleSelectionVersion) return;
        const file = new File([blob], sampleName, { type: blob.type || 'image/png' });
        if (handleSingleFile(file) === false) { setLoadingState(false); return; }
        await submitSingleTriage();
    } catch (err) {
        if (selectionVersion !== singleSelectionVersion) return;
        setLoadingState(false);
        alert(I18N_DICT[currentLang].errorSample + ' ' + err.message);
    }
}

// 7. In-Browser ONNX Runtime Web (WASM Engine)
let ortSession = null;
let isModelLoading = false;

// IndexedDB Model Blob Cache for 0ms offline retrieval
const MODEL_CACHE_DB = 'tb_triage_model_cache_v2';
const MODEL_CACHE_STORE = 'model_blobs';
const MODEL_SHA256 = '3f99751804bdd240ab3bea6b708456c51270acca6eeb71e659243ece0cd92592';
const MODEL_CACHE_KEY = 'tb_conformal_distilled_v11_cam.onnx:' + MODEL_SHA256;

async function verifyModelBuffer(buffer) {
    if (!globalThis.crypto || !crypto.subtle) throw new Error('Secure SHA-256 verification is unavailable.');
    const digest = await crypto.subtle.digest('SHA-256', buffer);
    const sha = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    if (sha !== MODEL_SHA256) throw new Error('Model SHA-256 mismatch; refusing unverified weights.');
    return buffer;
}

function getCachedModelBuffer() {
    return new Promise(function(resolve) {
        try {
            if (!window.indexedDB) return resolve(null);
            const req = indexedDB.open(MODEL_CACHE_DB, 1);
            req.onupgradeneeded = function(e) {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(MODEL_CACHE_STORE)) {
                    db.createObjectStore(MODEL_CACHE_STORE);
                }
            };
            req.onsuccess = function(e) {
                const db = e.target.result;
                const tx = db.transaction(MODEL_CACHE_STORE, 'readonly');
                const store = tx.objectStore(MODEL_CACHE_STORE);
                const getReq = store.get(MODEL_CACHE_KEY);
                getReq.onsuccess = function() {
                    const buf = getReq.result;
                    if (buf && buf.byteLength > 20000000) {
                        resolve(buf);
                    } else {
                        resolve(null);
                    }
                };
                getReq.onerror = function() { resolve(null); };
            };
            req.onerror = function() { resolve(null); };
        } catch (e) {
            resolve(null);
        }
    });
}

function saveCachedModelBuffer(buffer) {
    return new Promise(function(resolve) {
        try {
            if (!window.indexedDB || !buffer || buffer.byteLength < 20000000) return resolve(false);
            const req = indexedDB.open(MODEL_CACHE_DB, 1);
            req.onupgradeneeded = function(e) {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(MODEL_CACHE_STORE)) {
                    db.createObjectStore(MODEL_CACHE_STORE);
                }
            };
            req.onsuccess = function(e) {
                const db = e.target.result;
                const tx = db.transaction(MODEL_CACHE_STORE, 'readwrite');
                const store = tx.objectStore(MODEL_CACHE_STORE);
                store.put(buffer, MODEL_CACHE_KEY);
                tx.oncomplete = function() { resolve(true); };
                tx.onerror = function() { resolve(false); };
            };
            req.onerror = function() { resolve(false); };
        } catch (e) {
            resolve(false);
        }
    });
}

function canUseWasmSimd() {
    try {
        return typeof WebAssembly === 'object' && typeof WebAssembly.validate === 'function' &&
            WebAssembly.validate(new Uint8Array([
                0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11
            ]));
    } catch (e) {
        return false;
    }
}

async function fetchModelBufferWithFallback(onProgress) {
    // 1. Check local IndexedDB cache first (0 ms instant offline loading)
    const cached = await getCachedModelBuffer();
    if (cached) {
        try {
        await verifyModelBuffer(cached);
        console.log('[Model Loader] Loaded model from local IndexedDB cache (' + (cached.byteLength / (1024 * 1024)).toFixed(1) + ' MB). 0ms network latency.');
        if (onProgress) onProgress(100, cached.byteLength, cached.byteLength);
        return cached;
        } catch (err) { console.warn('[Model Loader] Ignoring invalid cached model:', err.message); }
    }

    // Local bundle only: no unpinned external model fallback.
    const candidateUrls = ['./models/tb_conformal_distilled_v11_cam.onnx'];

    const uniqueUrls = [];
    candidateUrls.forEach(function(u) {
        if (!uniqueUrls.includes(u)) uniqueUrls.push(u);
    });

    let lastError = null;
    for (let i = 0; i < uniqueUrls.length; i++) {
        const url = uniqueUrls[i];
        try {
            console.log('[Model Loader] Attempting download (' + (i + 1) + '/' + uniqueUrls.length + '): ' + url);
            const res = await fetch(url, { mode: 'cors' });
            if (!res.ok) {
                throw new Error('HTTP ' + res.status + ' ' + res.statusText);
            }

            const contentLengthHeader = res.headers.get('content-length');
            const totalBytes = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 28229016;

            if (!res.body || typeof res.body.getReader !== 'function') {
                const buffer = await res.arrayBuffer();
                if (buffer.byteLength < 1000000) {
                    throw new Error('Downloaded file too small (' + buffer.byteLength + ' bytes), unexpected body');
                }
                await verifyModelBuffer(buffer);
                await saveCachedModelBuffer(buffer);
                return buffer;
            }

            const reader = res.body.getReader();
            const chunks = [];
            let receivedBytes = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                receivedBytes += value.length;
                if (onProgress) {
                    const percent = Math.min(100, Math.round((receivedBytes / totalBytes) * 100));
                    onProgress(percent, receivedBytes, totalBytes);
                }
            }

            const totalBuffer = new Uint8Array(receivedBytes);
            let offset = 0;
            for (let c = 0; c < chunks.length; c++) {
                totalBuffer.set(chunks[c], offset);
                offset += chunks[c].length;
            }

            if (totalBuffer.byteLength < 1000000) {
                throw new Error('Downloaded file too small (' + totalBuffer.byteLength + ' bytes)');
            }

            const finalArrayBuffer = totalBuffer.buffer;
            await verifyModelBuffer(finalArrayBuffer);
            await saveCachedModelBuffer(finalArrayBuffer);
            console.log('[Model Loader] Model download successful (' + (finalArrayBuffer.byteLength / (1024 * 1024)).toFixed(1) + ' MB). Cached in IndexedDB.');
            return finalArrayBuffer;
        } catch (err) {
            console.warn('[Model Loader] Failed from source ' + url + ':', err.message);
            lastError = err;
        }
    }

    throw new Error('Semua sumber model gagal diunduh: ' + (lastError ? lastError.message : 'Network error'));
}

async function getOrtSession(progressCallback) {
    if (ortSession) return ortSession;
    if (isModelLoading) {
        while (isModelLoading) {
            await new Promise(r => setTimeout(r, 150));
        }
        if (ortSession) return ortSession;
    }

    isModelLoading = true;
    try {
        if (!window.ort) {
            throw new Error(currentLang === 'id' ? 'Script ONNX Runtime Web belum selesai dimuat.' : 'ONNX Runtime Web script not loaded.');
        }

        if (typeof ort !== 'undefined' && ort.env && ort.env.wasm) {
            const hasSimd = canUseWasmSimd();
            ort.env.wasm.simd = hasSimd;
            ort.env.wasm.numThreads = 1;

            const baseHref = document.baseURI || window.location.href;
            const localWasmPath = new URL('./vendor/onnx/', baseHref).href;
            ort.env.wasm.wasmPaths = window.useCdnWasm 
                ? "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/" 
                : localWasmPath;
        }

        const modelBuffer = await fetchModelBufferWithFallback(progressCallback);
        const uint8Data = new Uint8Array(modelBuffer);

        ortSession = await ort.InferenceSession.create(uint8Data, {
            executionProviders: ['wasm'],
            graphOptimizationLevel: 'all'
        });

        console.log('[ORT] DenseNet-121 in-browser inference session ready. Inputs:', ortSession.inputNames, 'Outputs:', ortSession.outputNames);
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
    const isValidAr = (ar >= 0.55 && ar <= 1.75);
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
    const isColor = meanSat > 140.0;

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

    // Modality / Anatomy Guard (True non-radiograph blank document / empty sensor)
    const whiteRatio = countWhite / totalPixels;
    const blackRatio = countBlack / totalPixels;
    const isInvalidAnatomyDoc = (whiteRatio > 0.90) || (blackRatio > 0.96) || (blackRatio > 0.88 && dynamicRange < 25.0);

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
                if ((patchCropX + margin + x + 1) % 8 === 0) {
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
            const isBoundaryRow = ((patchCropY + margin + y + 1) % 8 === 0);
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
    const isElevatedCompression = blockinessScore > 1.70;

    // SOTA Clinical Pre-Analytic Advisories (Informative Flagging: do NOT abort model inference)
    const advisoryWarnings = [];
    let hasQualityAdvisory = false;

    if (!isSufficientRes) {
        hasQualityAdvisory = true;
        advisoryWarnings.push('Low resolution (' + origW + 'x' + origH + ' px). Apical textures may require careful scrutiny.');
    }
    if (!isValidAr) {
        hasQualityAdvisory = true;
        advisoryWarnings.push('Non-standard aspect ratio (' + ar.toFixed(2) + '). Ensure full thoracic field is visible.');
    }
    if (isColor) {
        hasQualityAdvisory = true;
        advisoryWarnings.push('Chromatic saturation present (Index ' + meanSat.toFixed(1) + '). Monochromatic conversion applied.');
    }
    if (!isSufficientContrast) {
        hasQualityAdvisory = true;
        advisoryWarnings.push('Low dynamic contrast range (' + dynamicRange.toFixed(1) + ' < 35.0). Parenchymal detail may be attenuated.');
    }
    if (isElevatedCompression) {
        hasQualityAdvisory = true;
        advisoryWarnings.push('Elevated compression artifacts (Blockiness ' + blockinessScore.toFixed(2) + ' > 1.70). Interpreted under noise guard.');
    }

    // Hard Technical Abort only for True Physical/Modality Corruptions
    let rejectCode = null;
    let qualityPassed = true;

    if (isInvalidAnatomyDoc) {
        rejectCode = 'REJECT_INVALID_ANATOMY_DOCUMENT';
        qualityPassed = false;
        advisoryWarnings.push('Non-radiograph payload: Blank page or text document detected.');
    }

    if (isInverted) {
        advisoryWarnings.push('Photometric polarity inverted (MONOCHROME1). Auto-correction active.');
    }

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
        is_heavy_compression: isElevatedCompression,
        quality_passed: qualityPassed,
        has_quality_advisory: hasQualityAdvisory,
        reject_code: rejectCode,
        warnings: advisoryWarnings
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
    if (!camArray || !camArray.length) {
        return null;
    }

    // Clinically suppress heatmap only if TB probability is under 15% (clean normal).
    // For presumptive or subtle lesions (P(TB) >= 15%), generate CAM heatmap so clinicians can inspect focal activations.
    if (probTb !== undefined && probTb < 0.15) {
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

    const maxHeatDim = 1280;
    const scaleHeat = Math.min(1.0, maxHeatDim / Math.max(origWidth || 512, origHeight || 512));
    const outW = Math.round((origWidth || 512) * scaleHeat);
    const outH = Math.round((origHeight || 512) * scaleHeat);

    const outCanvas = document.createElement('canvas');
    outCanvas.width = outW;
    outCanvas.height = outH;
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

    // Defensive Multi-Tier Output Extraction
    const logitsTensor = results.logits || (session.outputNames && results[session.outputNames[0]]) || Object.values(results)[0];
    if (!logitsTensor || !logitsTensor.data) {
        throw new Error('Logits tensor missing from model output. Available outputs: ' + Object.keys(results).join(', '));
    }
    const logits = logitsTensor.data;
    if (logits.length !== 2 || !Array.from(logits).every(Number.isFinite)) {
        throw new Error('Invalid binary logits: expected exactly two finite values.');
    }

    const camTensor = results.cam || (session.outputNames && results[session.outputNames[1]]);
    const camData = (camTensor && camTensor.data) ? camTensor.data : null;

    const latentsTensor = results.latents || (session.outputNames && results[session.outputNames[2]]);
    const latents = (latentsTensor && latentsTensor.data) ? latentsTensor.data : null;

    // Missing or invalid OOD evidence is unknown, never in-distribution.
    const calibration = typeof OOD_REFERENCE_CALIBRATION !== 'undefined' ? OOD_REFERENCE_CALIBRATION : null;
    const validVector = (values, positive = false) => Boolean(values && values.length === 1024 &&
        Array.from(values).every(v => Number.isFinite(v) && (!positive || v > 0)));
    const hasOodCalib = Boolean(calibration && calibration.feature_dim === 1024 &&
        validVector(calibration.mu_0) && validVector(calibration.mu_1) &&
        validVector(calibration.std_inv, true) && Number.isFinite(calibration.threshold_diag) &&
        calibration.threshold_diag > 0 && validVector(latents));
    const thresholdDiag = hasOodCalib ? calibration.threshold_diag : null;
    let d0 = null, d1 = null, dMin = null;
    let oodAvailable = hasOodCalib;
    let isOod = false;
    if (hasOodCalib) {
        let sumSq0 = 0, sumSq1 = 0;
        for (let i = 0; i < 1024; i++) {
            const diff0 = (latents[i] - calibration.mu_0[i]) * calibration.std_inv[i];
            const diff1 = (latents[i] - calibration.mu_1[i]) * calibration.std_inv[i];
            sumSq0 += diff0 * diff0;
            sumSq1 += diff1 * diff1;
        }
        d0 = Math.sqrt(sumSq0);
        d1 = Math.sqrt(sumSq1);
        dMin = Math.min(d0, d1);
        oodAvailable = Number.isFinite(d0) && Number.isFinite(d1);
        if (!oodAvailable) d0 = d1 = dMin = null;
        isOod = oodAvailable && dMin > thresholdDiag;
    }
    const oodWarning = !oodAvailable
        ? (currentLang === 'id' ? 'Pemeriksaan OOD tidak tersedia atau tidak valid. Wajib telaah dokter.' : 'OOD assessment unavailable or invalid. Clinician review required.')
        : isOod ? (currentLang === 'id' ? 'Citra berada di luar distribusi referensi. Wajib telaah dokter.' : 'Image is outside the reference distribution. Clinician review required.') : null;
    const oodReport = {
        status: !oodAvailable ? 'unavailable' : isOod ? 'out_of_distribution' : 'in_distribution',
        available: oodAvailable,
        mahalanobis_distance: dMin,
        distance_to_normal: d0,
        distance_to_tb: d1,
        threshold: thresholdDiag,
        is_ood: oodAvailable ? isOod : null,
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

    const hasQualityAdvisory = Boolean(iqaResult && iqaResult.has_quality_advisory);
    const iqaAdvisoryWarning = (iqaResult && iqaResult.warnings && iqaResult.warnings.length > 0)
        ? iqaResult.warnings[0]
        : null;

    // Investigational assistive policy: no patient may be discharged by this app.
    // A valid OOD/IQA assessment is required before even an assistive model action.
    const qualityValid = Boolean(iqaResult && iqaResult.quality_passed === true && !hasQualityAdvisory);
    if (!qualityValid || !oodAvailable || isOod) {
        warningMsg = oodWarning || (currentLang === 'id'
            ? 'Kualitas citra memerlukan telaah dokter. Keputusan otomatis ditahan.'
            : 'Image quality requires clinician review. Automated decision withheld.');
    } else if (probTb >= 0.65) {
        triageAction = 'AUTO_FLAG_TB_URGENT';
        warningMsg = currentLang === 'id'
            ? 'Dugaan TB: prioritaskan telaah dokter dan konfirmasi molekuler sesuai protokol klinis. Hasil AI bukan diagnosis.'
            : 'Suspected TB: prioritize clinician review and molecular confirmation under the clinical protocol. AI output is not a diagnosis.';
    } else if (probTb < 0.20 && conformalSet.length === 1 && conformalSet[0] === 'Normal') {
        triageAction = 'ASSISTIVE_NORMAL_DOCTOR_VERIFY';
        warningMsg = currentLang === 'id'
            ? 'Skor model rendah dengan singleton Normal. Verifikasi dokter tetap wajib; tidak ada pelepasan pasien otomatis.'
            : 'Low model score with a Normal singleton. Clinician verification remains mandatory; no autonomous patient clearance.';
    } else {
        warningMsg = currentLang === 'id'
            ? 'Hasil model ambigu atau intermediate. Wajib telaah dokter; jangan gunakan hasil ini untuk melepas pasien.'
            : 'Ambiguous or intermediate model output. Clinician review required; do not use this output to clear a patient.';
    }
    if (iqaAdvisoryWarning) warningMsg += ' ' + iqaAdvisoryWarning;

    const heatDataUrl = (!camData) ? null : generateHeatmapDataUrl(camData, imageElement.naturalWidth || 512, imageElement.naturalHeight || 512, probTb);
    const heatBase64 = heatDataUrl;
    const latMs = Math.round(performance.now() - t0);

    return {
        filename: file.name,
        predicted_class: probTb >= 0.4401 ? 'Tuberculosis' : 'Normal',
        probability_tb: probTb,
        probability_normal: probNormal,
        logit_margin_tb_normal: logits[1] - logits[0],
        decision_threshold_used: 0.4401,
        triage_action: triageAction,
        conformal_details: {
            conformal_set: conformalSet,
            quantile_q0_normal: q0,
            quantile_q1_tb: q1,
            nominal_coverage_guarantee: '95% nominal target; requires exchangeability',
            policy_version: 'assistive-review-v1',
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
    if (window.caseWorkspace?.state.running) return;
    if (!selectedFile || isSubmitting) return;
    const file = selectedFile;
    const selectionVersion = singleSelectionVersion;
    const isCurrent = () => selectionVersion === singleSelectionVersion && selectedFile === file;
    isSubmitting = true;
    currentResultData = null;
    const reviewTools = document.getElementById('case-detail-tools');
    if (reviewTools) reviewTools.hidden = true;
    let requestSource = null;
    setLoadingState(true);
    try {
        // Always read this request's own file, including while its preview is still loading.
        const source = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Unable to read image file.'));
            reader.readAsDataURL(file);
        });
        if (!isCurrent()) return;
        requestSource = source;
        const tempImg = new Image();
        await new Promise((resolve, reject) => {
            tempImg.onload = resolve;
            tempImg.onerror = () => reject(new Error('Corrupt or unreadable image file.'));
            tempImg.src = source;
            if (tempImg.complete && tempImg.naturalWidth > 0) resolve();
        });
        if (!isCurrent()) return;
        const iqaResult = evaluatePreAnalyticQuality(tempImg);
        if (!iqaResult.quality_passed) {
            renderRejectionResults(file.name, iqaResult, source);
            window.caseWorkspace?.captureSingle?.(file, technicalBatchResult(file, iqaResult.reject_code || 'REJECT_NON_RADIOGRAPH', (iqaResult.warnings || []).join('; '), iqaResult, 0));
            return;
        }
        await getOrtSession();
        if (!isCurrent()) return;
        const data = await runClientSideInference(file, tempImg, iqaResult);
        if (!isCurrent()) return;
        data.source_image = source;
        renderSingleResults(data);
        window.caseWorkspace?.captureSingle?.(file, data);
    } catch (err) {
        if (!isCurrent()) return;
        renderRuntimeError(err.message || 'AI execution error', requestSource);
        window.caseWorkspace?.captureSingle?.(file, technicalBatchResult(file, 'ERROR_RUNTIME', err.message || 'Processing failed', null, 0));
    } finally {
        isSubmitting = false;
        setLoadingState(false);
    }
}

function renderRuntimeError(warning, sourceImage = null) {
    currentResultData = null;
    const results = document.getElementById('results-display');
    const empty = document.getElementById('empty-state');
    if (results) results.style.display = 'block';
    if (empty) empty.style.display = 'none';
    for (const id of ['val-prob-tb', 'val-prob-norm', 'met-set', 'met-lat']) {
        const el = document.getElementById(id);
        if (el) el.innerText = 'N/A';
    }
    for (const id of ['bar-prob-tb', 'bar-prob-norm']) {
        const el = document.getElementById(id);
        if (el) el.style.width = '0%';
    }
    for (const id of ['img-base', 'img-heat']) {
        const el = document.getElementById(id);
        if (el) el.src = sourceImage || '';
    }
    const action = document.getElementById('met-action');
    const ood = document.getElementById('met-ood');
    if (action) action.innerText = 'ERROR_RUNTIME';
    if (ood) ood.innerText = 'UNAVAILABLE';
    setSliderMode('orig');
    renderIdiograph('ERROR_RUNTIME', warning);
}

function setLoadingState(isLoading, titleText, subText) {
    const emptyBox = document.getElementById('empty-state');
    const loadingBox = document.getElementById('loading-state');
    const resultsBox = document.getElementById('results-display');
    const submitBtn = document.getElementById('btn-submit');
    const titleEl = document.getElementById('txt-loading-title');
    const subEl = document.getElementById('txt-loading-sub');

    if (submitBtn) submitBtn.disabled = isLoading || !selectedFile;

    if (isLoading) {
        if (titleText && titleEl) titleEl.innerText = titleText;
        if (subText && subEl) subEl.innerText = subText;
        if (emptyBox) emptyBox.style.display = 'none';
        if (resultsBox) resultsBox.style.display = 'none';
        if (loadingBox) loadingBox.style.display = 'block';
    } else {
        if (loadingBox) loadingBox.style.display = 'none';
        if (emptyBox && resultsBox && resultsBox.style.display === 'none' && !currentResultData) {
            emptyBox.style.display = 'block';
            const t = I18N_DICT[currentLang];
            const title = document.getElementById('txt-empty-title');
            const desc = document.getElementById('txt-empty-desc');
            if (title) title.textContent = t.emptyTitle;
            if (desc) desc.textContent = t.emptyDesc;
        }
    }
}

let currentResultData = null;

function renderSingleResults(data) {
    const ood = data?.ood_report;
    const invalidOod = ood?.available === true && (!Number.isFinite(ood.mahalanobis_distance)
        || ood.mahalanobis_distance < 0 || !Number.isFinite(ood.threshold) || ood.threshold <= 0
        || typeof ood.is_ood !== 'boolean');
    if (!data || !Number.isFinite(data.probability_tb) || !Number.isFinite(data.probability_normal)
        || data.probability_tb < 0 || data.probability_tb > 1 || data.probability_normal < 0
        || data.probability_normal > 1 || !Array.isArray(data.conformal_details?.conformal_set) || invalidOod) {
        renderRuntimeError(currentLang === 'en' ? 'Result data is incomplete. Review the source image.' : 'Data hasil tidak lengkap. Tinjau gambar asli.', data?.source_image || null);
        return;
    }
    currentResultData = data;
    const sourceImage = data.source_image;
    const emptyBox = document.getElementById('empty-state');
    const resultsBox = document.getElementById('results-display');
    if (emptyBox) emptyBox.style.display = 'none';
    if (resultsBox) resultsBox.style.display = 'block';

    const isOod = Boolean(data.ood_report && data.ood_report.is_ood);

    // 1. Idiograph & Action Banner
    renderIdiograph(data.triage_action, data.warning, isOod, null, data.ood_report);
    if (data.iqa_report?.warnings?.length) {
        const desc = document.getElementById('action-desc');
        if (desc) desc.textContent += currentLang === 'en' ? ' Image quality warnings are present. Review the original image.' : 'Ada peringatan kualitas gambar. Tinjau gambar asli.';
    }

    // 2. Images in Comparison Slider
    const imgBase = document.getElementById('img-base');
    const imgHeat = document.getElementById('img-heat');
    if (imgBase && sourceImage) imgBase.src = sourceImage;
    const rawHeat = data.hirescam_heatmap_base64 || data.hirescam_overlay_url;
    for(const id of ['btn-mode-heat','btn-mode-split']){const control=document.getElementById(id);if(control)control.disabled=!rawHeat;}
    let heatNotice=document.getElementById('case-heatmap-notice');
    if(!heatNotice){heatNotice=document.createElement('p');heatNotice.id='case-heatmap-notice';heatNotice.className='case-hint';document.querySelector('.viewer-card')?.append(heatNotice);}
    heatNotice.hidden=Boolean(rawHeat);heatNotice.textContent=rawHeat?'':currentLang==='en'?'No heatmap was stored for this result. Only the original image is shown.':'Heatmap tidak tersimpan untuk hasil ini. Hanya gambar asli yang ditampilkan.';
    if (imgHeat) {
        if (rawHeat) {
            if (rawHeat.startsWith('data:') || rawHeat.startsWith('http:') || rawHeat.startsWith('https:') || rawHeat.startsWith('./') || rawHeat.startsWith('/')) {
                imgHeat.src = rawHeat;
            } else {
                imgHeat.src = 'data:image/png;base64,' + rawHeat;
            }
        } else {
            if (sourceImage) imgHeat.src = sourceImage;
        }
    }
    setSliderMode(rawHeat?'split':'orig');

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
            metOod.innerText = I18N_DICT[currentLang].oodOutside + ' (D=' + data.ood_report.mahalanobis_distance.toFixed(2) + ' > ' + data.ood_report.threshold + ')';
            metOod.style.color = 'var(--color-referral)';
        } else if (data.ood_report && data.ood_report.available === true) {
            metOod.innerText = I18N_DICT[currentLang].oodWithin + ' (D=' + data.ood_report.mahalanobis_distance.toFixed(2) + ')';
            metOod.style.color = 'var(--color-normal)';
        } else {
            metOod.innerText = I18N_DICT[currentLang].oodUnavailable;
            metOod.style.color = 'var(--color-referral)';
        }
    }

    if (metLat) metLat.innerText = data.inference_latency_ms + ' ms';
}

function renderRejectionResults(filename, iqa, sourceImage = null) {
    currentResultData = { filename: filename, is_rejection: true, iqa_report: iqa, source_image: sourceImage };

    const emptyBox = document.getElementById('empty-state');
    const resultsBox = document.getElementById('results-display');
    if (emptyBox) emptyBox.style.display = 'none';
    if (resultsBox) resultsBox.style.display = 'block';

    // 1. Idiograph & Action Banner (Rejection Status)
    renderIdiograph(iqa.reject_code, iqa.warnings[0], false, iqa.reject_code);

    // 2. Images in Comparison Slider: Native radiograph only
    const imgBase = document.getElementById('img-base');
    const imgHeat = document.getElementById('img-heat');
    if (imgBase && sourceImage) imgBase.src = sourceImage;
    if (imgHeat && sourceImage) imgHeat.src = sourceImage;
    setSliderMode('orig');

    // 3. Probabilities: 0.00%
    const valTb = document.getElementById('val-prob-tb');
    const valNorm = document.getElementById('val-prob-norm');
    const barTb = document.getElementById('bar-prob-tb');
    const barNorm = document.getElementById('bar-prob-norm');

    if (valTb) valTb.innerText = 'N/A';
    if (valNorm) valNorm.innerText = 'N/A';
    if (barTb) barTb.style.width = '0%';
    if (barNorm) barNorm.style.width = '0%';

    // 4. Metadata Matrix
    const metSet = document.getElementById('met-set');
    const metAction = document.getElementById('met-action');
    const metOod = document.getElementById('met-ood');
    const metLat = document.getElementById('met-lat');

    if (metSet) metSet.innerText = I18N_DICT[currentLang].rejected;
    if (metAction) {
        metAction.innerText = iqa.reject_code;
        metAction.style.color = 'var(--color-tb)';
    }
    if (metOod) {
        metOod.innerText = I18N_DICT[currentLang].rejected;
        metOod.style.color = 'var(--color-tb)';
    }
    if (metLat) metLat.innerText = I18N_DICT[currentLang].latencyUnavailable;
}

let activeTriageAction = null;
let activeTriageWarning = null;

function refreshActiveIdiograph() {
    if (isSubmitting) return;
    if (currentResultData) {
        if (currentResultData.is_rejection) {
            renderRejectionResults(currentResultData.filename, currentResultData.iqa_report, currentResultData.source_image);
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

    // Case 0: Technical / Corrupt Image Runtime Error
    if (action === 'ERROR_RUNTIME') {
        banner.classList.add('action-reject');
        if (badge) badge.innerText = currentLang === 'en' ? 'Processing failed' : 'Proses gagal';
        if (title) title.innerText = I18N_DICT[currentLang].errorRuntimeTitle;
        if (desc) desc.innerText = warning || (currentLang === 'en' ? 'Model failed to initialize or execute.' : 'Terjadi kendala saat memuat atau menjalankan model AI.');
        if (iconContainer) {
            iconContainer.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
        }
        return;
    }

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

    // Case 2: 4-Tier SOTA Clinical AI Decision Engine
    if (action === 'ASSISTIVE_NORMAL_DOCTOR_VERIFY') {
        banner.classList.add('action-normal');
        if (badge) badge.innerText = currentLang === 'id' ? 'Review wajib' : 'Review required';
        if (title) title.innerText = currentLang === 'id' ? 'Skor rendah' : 'Low score';
        if (desc) desc.innerText = t.actionNormalDesc;
        if (iconContainer) {
            iconContainer.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
        }
    } else if (action === 'LEGACY_NORMAL_REQUIRES_REVIEW') {
        banner.classList.add('action-normal');
        if (badge) badge.innerText = t.actionNormalProbBadge || t.actionNormalBadge;
        if (title) title.innerText = t.actionNormalProbTitle || t.actionNormalTitle;
        if (desc) desc.innerText = t.actionNormalProbDesc || t.actionNormalDesc;
        if (iconContainer) {
            iconContainer.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
        }
    } else if (action === 'PRESUMPTIVE_TB_DOCTOR_EVAL') {
        banner.classList.add('action-referral');
        if (badge) badge.innerText = t.actionTbProbBadge || t.actionRefBadge;
        if (title) title.innerText = t.actionTbProbTitle || t.actionRefTitle;
        if (desc) desc.innerText = t.actionTbProbDesc || t.actionRefDesc;
        if (iconContainer) {
            iconContainer.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
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
    if (isBatchRunning) return;
    resetBatchTriage();
    batchFiles = files.filter(f => f.name.match(/\.(png|jpe?g|webp)$/i));
    const statusLabel = document.getElementById('batch-queue-status');
    const startBtn = document.getElementById('btn-batch-start');
    const kpiTotal = document.getElementById('kpi-total-val');
    const t = I18N_DICT[currentLang] || I18N_DICT.id;

    if (statusLabel) {
        statusLabel.innerText = currentLang === 'en'
            ? `${batchFiles.length} images queued.`
            : `${batchFiles.length} gambar mengantre.`;
    }
    if (kpiTotal) kpiTotal.innerText = batchFiles.length;
    if (startBtn) startBtn.disabled = batchFiles.length === 0;
}

function technicalBatchResult(file, action, warning, iqa, elapsed) {
    return {
        filename: file.name,
        predicted_class: action === 'ERROR_RUNTIME' ? 'Error' : 'Rejected',
        probability_tb: null, probability_normal: null,
        triage_action: action,
        conformal_details: { conformal_set: [], nominal_coverage_guarantee: 'N/A',
            clinical_action_code: action, safety_interlock_engaged: true, policy_version: 'assistive-review-v1' },
        warning, iqa_report: iqa || null,
        ood_report: { status: 'unavailable', available: false, mahalanobis_distance: null, threshold: null, is_ood: null },
        allow_autonomous_release: false, hirescam_heatmap_base64: null,
        inference_latency_ms: Math.round(elapsed), execution_mode: 'IN_BROWSER_WASM'
    };
}

async function processBatchItem(file) {
    const start = performance.now();
    const imgUrl = URL.createObjectURL(file);
    const tempImg = new Image();
    let decoded = false;
    try {
        await new Promise((resolve, reject) => {
            tempImg.onload = resolve;
            tempImg.onerror = () => reject(new Error('Corrupt or unreadable image file.'));
            tempImg.src = imgUrl;
            if (tempImg.complete && tempImg.naturalWidth > 0) resolve();
        });
        decoded = true;
        const iqaResult = evaluatePreAnalyticQuality(tempImg);
        if (!iqaResult.quality_passed) {
            return technicalBatchResult(file, iqaResult.reject_code || 'REJECT_NON_RADIOGRAPH',
                (iqaResult.warnings || []).join('; '), iqaResult, performance.now() - start);
        }
        return await runClientSideInference(file, tempImg, iqaResult);
    } catch (err) {
        return technicalBatchResult(file, decoded ? 'ERROR_RUNTIME' : 'REJECT_CORRUPT_IMAGE',
            err.message || 'Processing failed; clinician review required.', null, performance.now() - start);
    } finally {
        URL.revokeObjectURL(imgUrl);
    }
}

function cancelBatchProcessing() {
    if (!isBatchRunning) return;
    isBatchCancelled = true;
    const cancelBtn = document.getElementById('btn-batch-cancel');
    if (cancelBtn) cancelBtn.disabled = true;
}

async function startBatchProcessing() {
    if (window.caseWorkspace?.state.running) return;
    if (batchFiles.length === 0 || isBatchRunning) return;
    isBatchRunning = true;
    isBatchCancelled = false;
    batchResults = new Array(batchFiles.length);

    const startBtn = document.getElementById('btn-batch-start');
    const cancelBtn = document.getElementById('btn-batch-cancel');
    const csvBtn = document.getElementById('btn-batch-csv');
    const progressBox = document.getElementById('batch-progress-box');
    const progressBar = document.getElementById('batch-progress-bar');
    const tbody = document.getElementById('batch-tbody');

    if (startBtn) startBtn.disabled = true;
    if (cancelBtn) {
        cancelBtn.style.display = 'inline-flex';
        cancelBtn.disabled = false;
    }
    if (csvBtn) csvBtn.disabled = true;
    if (progressBox) progressBox.style.display = 'block';
    if (tbody) tbody.innerHTML = '';

    try {
        await getOrtSession();
    } catch(modelErr) {
        isBatchRunning = false;
        if (startBtn) startBtn.disabled = false;
        if (cancelBtn) cancelBtn.style.display = 'none';
        alert((currentLang === 'id' ? 'Gagal menyiapkan model AI: ' : 'Failed to prepare AI model: ') + modelErr.message);
        return;
    }

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
            if (isBatchCancelled) break;
            const currentIndex = index++;
            const file = batchFiles[currentIndex];

            const t = I18N_DICT[currentLang] || I18N_DICT.id;
            const row = document.createElement('tr');
            row.id = `batch-row-${currentIndex}`;
            row.className = 'clickable-row';
            row.innerHTML = `
                <td>${currentIndex + 1}</td>
                <td>${escapeHtml(file.name)}</td>
                <td id="status-${currentIndex}">${t.batchStatusProcessing}</td>
                <td id="prob-${currentIndex}">-</td>
                <td id="action-${currentIndex}">-</td>
                <td id="lat-${currentIndex}">-</td>
                <td id="opt-${currentIndex}">-</td>
            `;
            if (tbody) tbody.appendChild(row);

            try {
                const data = await processBatchItem(file);
                const lat = data.inference_latency_ms;

                if (data) {
                    batchResults[currentIndex] = data;
                    const isRejected = data.triage_action.startsWith('REJECT_') || data.predicted_class === 'Rejected';
                    const isRuntimeError = data.triage_action === 'ERROR_RUNTIME';
                    const statusCell = document.getElementById(`status-${currentIndex}`);
                    const probCell = document.getElementById(`prob-${currentIndex}`);
                    const actionCell = document.getElementById(`action-${currentIndex}`);
                    const latCell = document.getElementById(`lat-${currentIndex}`);
                    const optCell = document.getElementById(`opt-${currentIndex}`);

                    if (statusCell) statusCell.innerText = isRuntimeError ? t.batchStatusFailed : isRejected ? t.batchStatusRejected : t.batchStatusSuccess;
                    if (probCell) probCell.innerText = (isRejected || !Number.isFinite(data.probability_tb)) ? 'N/A' : (data.probability_tb * 100).toFixed(1) + '%';
                    if (actionCell) actionCell.innerText = data.triage_action;
                    if (latCell) latCell.innerText = lat + ' ms';
                    if (optCell) {
                        optCell.innerHTML = `<button class="btn-table-inspect" onclick="inspectBatchItem(${currentIndex}); event.stopPropagation();">👁️ ${t.btnInspect || 'Buka'}</button>`;
                    }
                    row.onclick = () => inspectBatchItem(currentIndex);

                    if (data.triage_action === 'ASSISTIVE_NORMAL_DOCTOR_VERIFY') {
                        normalCount++;
                    } else if (data.triage_action === 'AUTO_FLAG_TB_URGENT') {
                        tbCount++;
                    } else {
                        refCount++;
                    }
                } else {
                    batchResults[currentIndex] = null;
                    const statusCell = document.getElementById(`status-${currentIndex}`);
                    const actionCell = document.getElementById(`action-${currentIndex}`);
                    if (statusCell) statusCell.innerText = t.batchStatusFailed;
                    if (actionCell) actionCell.innerText = I18N_DICT[currentLang].inferenceFailed;
                }
            } catch(e) {
                batchResults[currentIndex] = null;
                const statusCell = document.getElementById(`status-${currentIndex}`);
                const actionCell = document.getElementById(`action-${currentIndex}`);
                if (statusCell) statusCell.innerText = t.batchStatusFailed;
                if (actionCell) actionCell.innerText = e.message || 'Error';
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

    if (isBatchCancelled) {
        const t = I18N_DICT[currentLang] || I18N_DICT.id;
        for (let i = index; i < total; i++) {
            const statusCell = document.getElementById(`status-${i}`);
            const actionCell = document.getElementById(`action-${i}`);
            if (statusCell) statusCell.innerText = t.batchStatusCancelled || 'Dibatalkan';
            if (actionCell) actionCell.innerText = 'Dibatalkan';
        }
    }

    isBatchRunning = false;
    isBatchCancelled = false;
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (startBtn) startBtn.disabled = false;
    if (csvBtn) csvBtn.disabled = batchResults.filter(Boolean).length === 0;
}

function inspectBatchItem(index) {
    const file = batchFiles[index];
    const data = batchResults[index];
    if (!file || !data) return;

    const selectionVersion = ++singleSelectionVersion;
    const reader = new FileReader();
    reader.onload = function(e) {
        if (selectionVersion !== singleSelectionVersion) return;
        selectedFile = file;
        originalImageSrc = e.target.result;

        // Switch tab to single patient mode
        switchMode('single');

        // Update file info labels in single mode
        const nameLabel = document.getElementById('file-name-label');
        const sizeLabel = document.getElementById('file-size-label');
        const statusBox = document.getElementById('file-status');
        const submitBtn = document.getElementById('btn-submit');
        if (nameLabel) nameLabel.innerText = `${file.name} (Kloter #${index + 1})`;
        if (sizeLabel) sizeLabel.innerText = (file.size / 1024).toFixed(1) + ' KB';
        if (statusBox) statusBox.style.display = 'block';
        if (submitBtn) submitBtn.disabled = false;

        // Show batch return button
        const returnBtn = document.getElementById('btn-batch-return');
        if (returnBtn) returnBtn.style.display = 'inline-flex';

        if (data.triage_action === 'ERROR_RUNTIME') {
            renderRuntimeError(data.warning, e.target.result);
        } else if (data.is_rejection || (data.triage_action && data.triage_action.startsWith('REJECT_'))) {
            renderRejectionResults(data.filename, data.iqa_report || { reject_code: data.triage_action, warnings: [data.warning || 'Pre-analytic rejection'] }, e.target.result);
        } else {
            renderSingleResults({ ...data, source_image: e.target.result });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    reader.onerror = function() {
        if (selectionVersion !== singleSelectionVersion) return;
        switchMode('single');
        const returnBtn = document.getElementById('btn-batch-return');
        if (returnBtn) returnBtn.style.display = 'inline-flex';
        renderRejectionResults(file.name, {
            reject_code: 'REJECT_CORRUPT_IMAGE',
            warnings: ['File rusak atau format tidak terbaca.']
        });
    };
    reader.readAsDataURL(file);
}

function resetBatchTriage() {
    if (isBatchRunning) return;
    batchFiles = [];
    batchResults = [];
    
    const batchInput = document.getElementById('batch-file-input');
    if (batchInput) batchInput.value = '';
    const statusLabel = document.getElementById('batch-queue-status');
    const t = I18N_DICT[currentLang] || I18N_DICT.id;
    if (statusLabel) statusLabel.innerText = t.batchQueueEmpty || 'Belum ada foto rontgen dalam antrean.';
    
    const startBtn = document.getElementById('btn-batch-start');
    const cancelBtn = document.getElementById('btn-batch-cancel');
    const csvBtn = document.getElementById('btn-batch-csv');
    const progressBox = document.getElementById('batch-progress-box');
    const progressBar = document.getElementById('batch-progress-bar');
    if (startBtn) startBtn.disabled = true;
    if (cancelBtn) cancelBtn.style.display = 'none';
    if (csvBtn) csvBtn.disabled = true;
    if (progressBox) progressBox.style.display = 'none';
    if (progressBar) progressBar.style.width = '0%';

    const kpiTotal = document.getElementById('kpi-total-val');
    const kpiNorm = document.getElementById('kpi-normal-val');
    const kpiTb = document.getElementById('kpi-tb-val');
    const kpiRef = document.getElementById('kpi-ref-val');
    if (kpiTotal) kpiTotal.innerText = '0';
    if (kpiNorm) kpiNorm.innerText = '0';
    if (kpiTb) kpiTb.innerText = '0';
    if (kpiRef) kpiRef.innerText = '0';

    const tbody = document.getElementById('batch-tbody');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">${t.batchTableEmpty || 'Belum ada hasil skrining massal.'}</td></tr>`;
    }
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
}

function csvCell(value) {
    let text = value == null ? '' : String(value);
    // Keep untrusted filenames from becoming spreadsheet formulas, including leading whitespace.
    if (/^[\s]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
}

function buildBatchCsv(results) {
    const headers = ['Index', 'Filename', 'Predicted_Class', 'Probability_TB', 'Probability_Normal', 'Conformal_Set', 'Triage_Action', 'Latency_ms', 'Safety_Interlock', 'OOD_Status', 'IQA_Passed', 'Warning', 'Policy_Version', 'Logit_Margin_TB_Normal'];
    const rows = results.filter(Boolean).map((r, i) => [
        i + 1, r.filename, r.predicted_class,
        Number.isFinite(r.probability_tb) ? r.probability_tb : null,
        Number.isFinite(r.probability_normal) ? r.probability_normal : null,
        r.conformal_details?.conformal_set?.join('; ') || '', r.triage_action, r.inference_latency_ms,
        r.conformal_details?.safety_interlock_engaged, r.ood_report?.status || 'unavailable',
        r.iqa_report?.quality_passed, r.warning, r.conformal_details?.policy_version || 'assistive-review-v1',
        Number.isFinite(r.logit_margin_tb_normal) ? r.logit_margin_tb_normal : null
    ]);
    return [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');
}

function exportBatchCsv() {
    if (!batchResults.some(Boolean)) return;
    const blob = new Blob([buildBatchCsv(batchResults)], { type: 'text/csv;charset=utf-8;' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `TB_Conformal_Triage_Roster_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}

// 9. Initialization
document.addEventListener('DOMContentLoaded', function() {
    syncPWAInstallBanner();
    checkDisclaimerStatus();
    initSingleFileHandlers();
    initBatchHandlers();
    initSystemStatus();
    applyLanguage(currentLang);
    
    // Load the inference session only after an explicit processing action.

});

// Keep keyboard focus inside the initial research notice until it is accepted.
document.addEventListener('keydown', event => {
    const modal = document.getElementById('disclaimer-modal');
    if (event.key !== 'Tab' || !modal || getComputedStyle(modal).display === 'none') return;
    const controls = Array.from(modal.querySelectorAll('button:not(:disabled), input:not(:disabled)'));
    if (!controls.length) return;
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
});
