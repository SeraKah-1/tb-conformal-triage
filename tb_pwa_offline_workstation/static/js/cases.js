/* Local case workflow. Images and notes stay in this browser origin. */
(() => {
    'use strict';
    const words = {
        en: {queue:'Queue',saved:'Saved',guide:'Guide',process:'Process',install:'Install',research:'Research',researchNotice:'Research use. Clinician review is required for every result.',add:'Add images',cancel:'Cancel',search:'Search',all:'All',unreviewed:'Unreviewed',reviewed:'Reviewed',flagged:'Flagged',unsaved:'Unsaved',imageIssue:'Image issue',low:'Low score',high:'High score',uncertain:'Uncertain',oldest:'Oldest',newest:'Newest',defaultSort:'Review order',flagSort:'Flagged first',open:'Open',remove:'Delete',export:'Export',print:'Print',save:'Save',flag:'Flag',unflag:'Unflag',markReviewed:'Mark reviewed',markUnreviewed:'Mark unreviewed',next:'Next',back:'Back',notes:'Notes',pending:'Queued',processing:'Processing',complete:'Processed',failed:'Failed',cancelled:'Cancelled',empty:'No cases',emptyHelp:'Add images to start. Saved cases appear here after reopening this browser.',count:'Cases',selected:'Selected',result:'Result',status:'Status',review:'Review',filename:'Filename',date:'Added',score:'Model score',model:'Model',changed:'Unsaved changes',saving:'Saving',savedMessage:'Saved on this device.',saveError:'Save failed. Check browser storage and try again. The case remains in this session.',loadError:'Saved cases could not be opened. Browser storage may be unavailable.',deleteError:'Delete failed. Stored cases have not been removed.',deleteConfirm:'Delete selected cases and their stored images? This cannot be undone.',leaveConfirm:'This case has unsaved changes. Continue without saving? Changes remain in this session.',unsupported:'Unsupported file. Use PNG, JPEG or WebP.',storage:'Images, results and notes are saved only in this browser on this device. Space and installed PWA archives may be separate. Clearing browser data removes saved cases.',limits:'Model results support review. They do not establish a diagnosis or permit discharge.',steps:'Add images, select Process, open a case, review the result, add notes, then Save. Mark reviewed records your review separately from saving.',cancelHelp:'Cancellation stops after the current image. Completed results remain available.',orderHelp:'Unreviewed first, then oldest. This order does not indicate clinical urgency.',noResult:'No result',detail:'Case',progress:'Processed',savedOnly:'Saved cases',reviewRequired:'Review required',savedVersion:'Saved model',storedNote:'Opening an archive does not run the model again.',dirtyHelp:'Save includes the image, result, notes and review status.',notePlaceholder:'Add a note',deleteOne:'Delete case',modelUnavailable:'Not recorded',deleted:'Cases deleted.',source:'Image',filter:'Filter',sort:'Sort',unknownVersion:'Unsupported archive version. The record was not changed.'},
        id: {queue:'Antrean',saved:'Tersimpan',guide:'Panduan',process:'Proses',install:'Pasang',research:'Penelitian',researchNotice:'Penggunaan penelitian. Setiap hasil wajib ditinjau tenaga medis.',add:'Tambah gambar',cancel:'Batal',search:'Cari',all:'Semua',unreviewed:'Belum ditinjau',reviewed:'Sudah ditinjau',flagged:'Ditandai',unsaved:'Belum disimpan',imageIssue:'Masalah gambar',low:'Skor rendah',high:'Skor tinggi',uncertain:'Ambigu',oldest:'Terlama',newest:'Terbaru',defaultSort:'Urutan review',flagSort:'Ditandai dahulu',open:'Buka',remove:'Hapus',export:'Ekspor',print:'Cetak',save:'Simpan',flag:'Tandai',unflag:'Hapus tanda',markReviewed:'Selesai ditinjau',markUnreviewed:'Belum ditinjau',next:'Berikutnya',back:'Kembali',notes:'Catatan',pending:'Mengantre',processing:'Diproses',complete:'Selesai',failed:'Gagal',cancelled:'Dibatalkan',empty:'Belum ada',emptyHelp:'Tambahkan gambar untuk memulai. Kasus tersimpan dapat dibuka kembali di browser ini.',count:'Kasus',selected:'Dipilih',result:'Hasil',status:'Status',review:'Review',filename:'Berkas',date:'Ditambahkan',score:'Skor model',model:'Model',changed:'Belum disimpan',saving:'Menyimpan',savedMessage:'Disimpan di perangkat ini.',saveError:'Gagal menyimpan. Periksa penyimpanan browser lalu coba lagi. Kasus tetap ada dalam sesi ini.',loadError:'Kasus tersimpan gagal dibuka. Penyimpanan browser mungkin tidak tersedia.',deleteError:'Gagal menghapus. Kasus tersimpan belum dihapus.',deleteConfirm:'Hapus kasus terpilih beserta gambar tersimpan? Tindakan ini tidak dapat dibatalkan.',leaveConfirm:'Perubahan kasus belum disimpan. Lanjut tanpa menyimpan? Perubahan tetap ada dalam sesi ini.',unsupported:'Berkas tidak didukung. Gunakan PNG, JPEG, atau WebP.',storage:'Gambar, hasil, dan catatan hanya tersimpan di browser perangkat ini. Arsip Space dan PWA terpasang dapat berbeda. Menghapus data browser menghapus kasus tersimpan.',limits:'Hasil model membantu peninjauan. Hasil tidak menetapkan diagnosis atau izin pemulangan pasien.',steps:'Tambah gambar, pilih Proses, buka kasus, tinjau hasil, isi catatan, lalu Simpan. Status review dicatat terpisah dari penyimpanan.',cancelHelp:'Pembatalan berhenti setelah gambar aktif selesai. Hasil yang selesai tetap tersedia.',orderHelp:'Belum ditinjau dahulu, lalu terlama. Urutan ini tidak menunjukkan urgensi klinis.',noResult:'Belum tersedia',detail:'Kasus',progress:'Selesai',savedOnly:'Kasus tersimpan',reviewRequired:'Wajib ditinjau',savedVersion:'Model tersimpan',storedNote:'Membuka arsip tidak menjalankan model kembali.',dirtyHelp:'Simpan mencakup gambar, hasil, catatan, dan status review.',notePlaceholder:'Tambah catatan',deleteOne:'Hapus kasus',modelUnavailable:'Tidak tercatat',deleted:'Kasus dihapus.',source:'Gambar',filter:'Filter',sort:'Urutkan',unknownVersion:'Versi arsip tidak didukung. Data tidak diubah.'}
    };
    Object.assign(words.en, {screen:'Check',batch:'Batch',passed:'Technical pass',qualityWarning:'Warning',unavailable:'Unavailable',within:'Within reference',outside:'Outside reference',singleton:'Single label',multiple:'Multiple labels',emptySet:'Empty set',previousPage:'Previous',nextPage:'Next',page:'Page',showing:'Showing',iqaWarning:'IQA warnings',oodOutside:'Outside reference',oodUnavailable:'OOD unavailable',oodIssue:'OOD issues',conformalAmbiguous:'Multiple labels',conformalEmpty:'Empty set',filterReason:'Filter reason',summary:'Review groups',summaryHelp:'Counts may overlap. These groups organize review; they do not determine clinical urgency or remove cases from review.',reasonAll:'All matching cases.',reasonUnreviewed:'Cases not yet marked reviewed.',reasonImageIssue:'Unreadable or rejected images, or a processing failure.',reasonIqaWarning:'Image quality failed or a quality advisory was recorded.',reasonOodOutside:'The model reported an image outside its reference distribution.',reasonOodUnavailable:'The reference-distribution check was unavailable for a model result.',reasonOodIssue:'The reference-distribution check was outside reference or unavailable.',reasonConformalAmbiguous:'The conformal set contains more than one label.',reasonConformalEmpty:'The conformal set contains no labels.',reasonHigh:'Raw TB score is at least 65%, including results with quality or reference warnings. Review remains required.',reasonLow:'Raw TB score is below 20% with a single non-TB label. Review remains required.',reasonUncertain:'The recorded assistive policy requested review without a high- or low-score category.'});
    Object.assign(words.id, {screen:'Periksa',batch:'Batch',passed:'Teknis lolos',qualityWarning:'Peringatan',unavailable:'Tidak tersedia',within:'Dalam referensi',outside:'Luar referensi',singleton:'Label tunggal',multiple:'Label ganda',emptySet:'Set kosong',previousPage:'Sebelumnya',nextPage:'Berikutnya',page:'Halaman',showing:'Ditampilkan',iqaWarning:'Peringatan IQA',oodOutside:'Luar referensi',oodUnavailable:'Tanpa OOD',oodIssue:'Masalah OOD',conformalAmbiguous:'Label ganda',conformalEmpty:'Set kosong',filterReason:'Alasan filter',summary:'Kelompok review',summaryHelp:'Jumlah dapat tumpang tindih. Kelompok ini mengatur review; bukan penetapan urgensi klinis atau alasan melewatkan review.',reasonAll:'Semua kasus yang cocok.',reasonUnreviewed:'Kasus yang belum ditandai sudah ditinjau.',reasonImageIssue:'Gambar tidak terbaca atau ditolak, atau proses gagal.',reasonIqaWarning:'Pemeriksaan kualitas gambar gagal atau mencatat peringatan kualitas.',reasonOodOutside:'Model melaporkan gambar di luar distribusi referensi.',reasonOodUnavailable:'Pemeriksaan distribusi referensi tidak tersedia pada hasil model.',reasonOodIssue:'Pemeriksaan distribusi referensi di luar referensi atau tidak tersedia.',reasonConformalAmbiguous:'Set conformal berisi lebih dari satu label.',reasonConformalEmpty:'Set conformal tidak berisi label.',reasonHigh:'Skor TB mentah minimal 65%, termasuk hasil dengan peringatan kualitas atau referensi. Review tetap wajib.',reasonLow:'Skor TB mentah di bawah 20% dengan satu label non-TB. Review tetap wajib.',reasonUncertain:'Kebijakan asistif tersimpan meminta review tanpa kategori skor tinggi atau rendah.'});
    Object.assign(words.en,{processShown:'Process shown',processSelected:'Process selected',retry:'Retry',clearSelection:'Clear selection',processScope:'Queued images matching filters (all pages)',selectedScope:'Selected queued images',retryScope:'Shown failures',nextRun:'Images added during processing remain queued for the next run.',run:'Run',skipped:'Removed',legacyReview:'Older review statuses need confirmation for this result.',reasonPending:'Images waiting to be processed.',reasonProcessing:'Images currently being processed.',reasonComplete:'Images with completed processing.',reasonFailed:'Technical processing failures. Retry after resolving the error.',reasonCancelled:'Images cancelled before processing.'});
    Object.assign(words.id,{processShown:'Proses daftar',processSelected:'Proses terpilih',retry:'Ulangi',clearSelection:'Hapus pilihan',processScope:'Antrean sesuai filter (semua halaman)',selectedScope:'Antrean terpilih',retryScope:'Kegagalan yang tampil',nextRun:'Gambar yang ditambahkan saat proses berjalan tetap mengantre untuk proses berikutnya.',run:'Proses',skipped:'Dihapus',legacyReview:'Status review lama perlu dikonfirmasi untuk hasil ini.',reasonPending:'Gambar menunggu diproses.',reasonProcessing:'Gambar sedang diproses.',reasonComplete:'Gambar selesai diproses.',reasonFailed:'Kegagalan proses teknis. Ulangi setelah penyebabnya diatasi.',reasonCancelled:'Gambar dibatalkan sebelum diproses.'});
    Object.assign(words.en,{steps:'Check: add an image and select Process. The result appears directly. Batch: add files, choose Process shown or Process selected, then open a result. Save stores the image, result, notes and review status.',qualityHelp:'IQA warning: inspect the original image and use a better source image when available. These checks do not establish diagnostic image quality.',oodHelp:'OOD outside or unavailable: the input is not confirmed within the model reference. Review is required; an unavailable check is not a normal result.',setHelp:'A two-label or empty conformal set does not select a single class. Review the image; the set is not a diagnosis or discharge decision.',errorHelp:'Processing failure: check the format and model availability. Retry after fixing the technical error; unreadable input needs a replacement image.'});
    Object.assign(words.id,{steps:'Periksa: tambah gambar lalu pilih Proses; hasil langsung tampil. Batch: tambah berkas, pilih Proses daftar atau Proses terpilih, lalu buka hasil. Simpan menyimpan gambar, hasil, catatan, dan status review.',qualityHelp:'Peringatan IQA: periksa gambar asli dan gunakan sumber gambar yang lebih baik bila tersedia. Pemeriksaan ini tidak memastikan kualitas diagnostik gambar.',oodHelp:'OOD di luar referensi atau tidak tersedia: input belum dipastikan sesuai referensi model. Review wajib; pemeriksaan yang tidak tersedia bukan hasil normal.',setHelp:'Set conformal dua label atau kosong tidak memilih satu kelas. Tinjau gambar; set bukan diagnosis atau keputusan pemulangan.',errorHelp:'Proses gagal: periksa format dan ketersediaan model. Pilih Ulangi setelah masalah teknis diatasi; input tidak terbaca memerlukan gambar pengganti.'});
    Object.assign(words.en,{exportTooLong:'A cell exceeds the Excel limit. Use CSV to export the full text.',folder:'Folder',more:'More',heatmap:'Heatmap',heatmapMissing:'No heatmap was stored for this result. The original image is shown; no heatmap is generated when opening a case.',resetSession:'Reset session',resetConfirm:'Reset this session and discard unsaved images, results and edits? Saved cases stay on this device and can be opened in Saved.',resetDone:'Session reset. Saved cases remain in Saved.',bulkHelp:'Select multiple images, choose a folder, or drop files and folders here. Subfolders are included. PNG, JPEG and WebP only.',readingFolder:'Reading folder…',folderError:'Folder could not be read. Try the Folder button. No partial folder import was added.',selectAll:'Select all',selectionHelp:'Selection and export include matching cases across all pages.',yes:'Yes',no:'No',caseId:'Case ID',sourcePath:'Source path',excel:'Excel',csv:'CSV',exportHelp:'Export uses selected cases, or the filtered list if none are selected. Excel keeps columns and line breaks. Files stay on this device.',reviewFirst:'Review first',routine:'Other results'});
    Object.assign(words.id,{exportTooLong:'Isi sel melebihi batas Excel. Gunakan CSV untuk mengekspor teks lengkap.',folder:'Folder',more:'Lainnya',heatmap:'Heatmap',heatmapMissing:'Heatmap tidak tersimpan untuk hasil ini. Gambar asli ditampilkan; membuka kasus tidak membuat heatmap baru.',resetSession:'Reset sesi',resetConfirm:'Reset sesi dan buang gambar, hasil, serta perubahan yang belum disimpan? Kasus tersimpan tetap di perangkat dan dapat dibuka di Tersimpan.',resetDone:'Sesi direset. Kasus tersimpan tetap di Tersimpan.',bulkHelp:'Pilih banyak gambar sekaligus, pilih folder, atau seret berkas dan folder ke sini. Subfolder disertakan. Hanya PNG, JPEG, dan WebP.',readingFolder:'Membaca folder…',folderError:'Folder gagal dibaca. Coba tombol Folder. Isi folder tidak ditambahkan sebagian.',selectAll:'Pilih semua',selectionHelp:'Pilihan dan ekspor mencakup kasus sesuai filter pada semua halaman.',yes:'Ya',no:'Tidak',caseId:'ID kasus',sourcePath:'Lokasi sumber',excel:'Excel',csv:'CSV',exportHelp:'Ekspor memakai kasus terpilih, atau daftar sesuai filter bila tidak ada pilihan. Excel menjaga kolom dan baris catatan. Berkas tetap di perangkat.',reviewFirst:'Tinjau dahulu',routine:'Hasil lainnya'});
    Object.assign(words.en,{uncertain:'Set / score',policyIntermediate:'Intermediate score',evidenceUnknown:'Unknown evidence',oodReferenceUnverified:'Unverified reference',reviewReasons:'Review reasons',referenceUnverified:'Reference unverified',reasonHigh:'Raw TB score is at least 65%, including results with quality or reference warnings. Review remains required.',reasonLow:'Raw TB score is below 20% with a single non-TB label. This is not a healthy-lung finding; review remains required.',reasonUncertain:'A multiple-label/empty prediction set or an intermediate policy score; quality and OOD reasons are shown separately.',reasonPolicyIntermediate:'The prediction set has one label, but the score lies outside the high/low policy bands. This is not conformal ambiguity.',reasonEvidenceUnknown:'A score, prediction set, quality check or reference measurement is missing or malformed.',reasonOodReferenceUnverified:'An OOD distance was computed, but its reference binding has not been verified.'});
    Object.assign(words.id,{uncertain:'Set / skor',policyIntermediate:'Skor intermediate',evidenceUnknown:'Bukti tidak lengkap',oodReferenceUnverified:'Referensi legacy',reviewReasons:'Alasan review',referenceUnverified:'Referensi legacy',reasonHigh:'Skor TB mentah minimal 65%, termasuk hasil dengan peringatan kualitas atau referensi. Review tetap wajib.',reasonLow:'Skor TB mentah di bawah 20% dengan satu label non-TB. Ini bukan temuan paru sehat; review tetap wajib.',reasonUncertain:'Set prediksi label ganda/kosong atau skor intermediate kebijakan; alasan kualitas dan OOD ditampilkan terpisah.',reasonPolicyIntermediate:'Set prediksi berisi satu label, tetapi skor di luar rentang tinggi/rendah kebijakan. Ini bukan ambiguitas conformal.',reasonEvidenceUnknown:'Skor, set prediksi, pemeriksaan kualitas atau pengukuran referensi tidak tersedia atau tidak valid.',reasonOodReferenceUnverified:'Jarak OOD dihitung, tetapi keterikatan referensinya belum diverifikasi.'});
    const records = new Map();
    const selected = new Set();
    const singleIds = new WeakMap();
    const deletedImages = new WeakSet();
    let run = null, runSequence = 0;
    let singleRecordId = null, singleFile = null, singlePreview = null;
    const DB = 'tb_case_archive_v1', STORE = 'cases', SCHEMA = 1;
    let language = typeof currentLang === 'string' ? currentLang : 'id';
    let activeId = null, view = 'single', running = false, cancelled = false;
    let query = '', filter = 'all', sort = 'defaultSort', activeUrl = null, openVersion = 0;
    let workspace, tools, guide, list, live, detailTitle, note, message, progress, detailMessage;
    const PAGE_SIZE = 50;
    let pageIndex = 0, summaryBox, pager, filterReason, scopeHint;
    let loadingArchives = true, importing = false;
    let rejectedNames = [];
    const t = key => (words[language] || words.id)[key] || key;
    const make = (tag, cls, value) => {
        const el = document.createElement(tag); if (cls) el.className = cls;
        if (value !== undefined) el.textContent = value; return el;
    };
    const icons = {heatmap:'M3 3h18v18H3ZM7 13l3-5 4 9 3-6',folder:'M3 5h7l2 2h9v13H3Z',resetSession:'M4 11a8 8 0 1 1 2 7M4 4v7h7',add:'M12 5v14M5 12h14',process:'m9 5 10 7-10 7V5Z',cancel:'M6 6l12 12M6 18 18 6',save:'M5 3h12l4 4v14H3V3h2Zm2 0v7h10V3M7 21v-7h10v7',flag:'M5 21V3h14l-3 5 3 5H5',unflag:'M5 21V3h14l-3 5 3 5H5',remove:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15',export:'M12 3v12m-5-5 5 5 5-5M4 15v6h16v-6',print:'M6 9V3h12v6M6 17H3V9h18v8h-3M6 14h12v7H6Z',next:'m9 5 7 7-7 7',back:'m15 5-7 7 7 7',markReviewed:'m4 12 5 5L20 6',markUnreviewed:'M12 8v5m0 4v.1M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z'};
    function button(key, action, cls = '') {
        const b=make('button',`case-button ${cls}`); b.type='button';b.dataset.action=key;
        if(icons[key]) {
            const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
            for(const [name,value] of Object.entries({viewBox:'0 0 24 24',width:'15',height:'15',fill:'none',stroke:'currentColor','stroke-width':'1.7','stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true'})) svg.setAttribute(name,value);
            const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',icons[key]);svg.append(path);b.append(svg);
        }
        b.append(make('span','',t(key))); b.addEventListener('click', action); return b;
    }
    function announce(key) {
        const value=t(key)+(key==='unsupported' && rejectedNames.length ? ' '+rejectedNames.slice(0,5).join(', ')+(rejectedNames.length>5?' … ('+rejectedNames.length+')':'') : '');
        if(message){message.dataset.messageKey=key;message.textContent=value;}
    }
    function uid() { return globalThis.crypto && crypto.randomUUID ? crypto.randomUUID() : `case-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`; }
    function modelVersion() { return typeof MODEL_CACHE_KEY === 'string' ? MODEL_CACHE_KEY : t('modelUnavailable'); }
    function singleBusy() { return view==='single' && typeof isSubmitting!=='undefined' && isSubmitting; }
    function dirty(r) { return !r.saved || r.revision !== r.savedRevision; }
    function liveSingle(r) { return typeof isSubmitting!=='undefined' && isSubmitting && typeof selectedFile!=='undefined' && selectedFile===r.image; }
    function reviewable(r) { return r.state==='complete' && Boolean(r.result) && r.result.triage_action!=='ERROR_RUNTIME' && !liveSingle(r); }
    function resetReview(r) { r.reviewed=false;r.reviewedGeneration=null; }
    function finishResult(r,result) {
        r.modelVersion=modelVersion();r.result=result;r.state=!result || result.triage_action==='ERROR_RUNTIME'?'failed':'complete';
        r.resultGeneration=(Number.isSafeInteger(r.resultGeneration)?r.resultGeneration:0)+1;
        resetReview(r);r.revision++;r.feedback=null;
    }
    function showFeedback(r) {
        if(!detailMessage)return;
        const feedback=r?.feedback;
        const visible=feedback && (feedback.key!=='savedMessage' || (feedback.revision===r.revision && !dirty(r)));
        detailMessage.textContent=visible?t(feedback.key):'';
        if(visible)detailMessage.dataset.messageKey=feedback.key;else delete detailMessage.dataset.messageKey;
    }
    function eligible(r,retry=false) { return retry?r.state==='failed':r.state==='pending'||r.state==='cancelled'; }
    function scopeRecords(scope='visible',retry=false) {
        if(view!=='queue')return [];
        const pool=scope==='selected'?Array.from(records.values()).filter(r=>selected.has(r.id)):visibleRecords();
        return pool.filter(r=>eligible(r,retry));
    }
    function evidence(r) {
        return window.caseEvidence?.derive(r.result)||{score_available:false,score_tb:null,score_band:'unknown',canonical_set:null,conformal_state:'unavailable',ood_state:'unavailable',ood_reference_status:'unavailable',iqa_state:'unavailable',review_reasons:['evidence_unknown'],review_required:true,evidence_unknown:true};
    }
    function outcome(r) {
        if(!r.result)return r.state==='failed'?'imageIssue':'noResult';
        const action=typeof r.result.triage_action==='string'?r.result.triage_action:'';
        if(action.startsWith('REJECT_')||action==='ERROR_RUNTIME')return 'imageIssue';
        const value=evidence(r);return value.score_band==='high'?'high':value.score_band==='low'?'low':value.evidence_unknown?'evidenceUnknown':'uncertain';
    }
    function hasPrediction(r) {return Boolean(r.result&&evidence(r).score_available);}
    function validOodReport(r) {return ['within','outside'].includes(evidence(r).ood_state);}
    function matchesFilter(r, key) {
        if(['pending','processing','complete','failed','cancelled'].includes(key)) return r.state===key;
        if(key === 'unreviewed') return !r.reviewed;
        if(key === 'reviewed') return r.reviewed;
        if(key === 'flagged') return r.flagged;
        if(key === 'saved') return r.saved;
        if(key === 'unsaved') return dirty(r);
        const value=evidence(r);
        if(key==='imageIssue')return outcome(r)==='imageIssue';
        if(key==='high'||key==='low')return hasPrediction(r)&&value.score_band===key;
        if(key==='uncertain')return hasPrediction(r)&&(['multiple','empty'].includes(value.conformal_state)||value.review_reasons.includes('policy_intermediate'));
        if(key==='policyIntermediate')return value.review_reasons.includes('policy_intermediate');
        if(key==='evidenceUnknown')return Boolean(r.result&&value.evidence_unknown);
        if(key==='iqaWarning')return value.iqa_state==='advisory'||value.iqa_state==='rejected';
        if(key==='oodOutside')return value.ood_state==='outside';
        if(key==='oodUnavailable')return hasPrediction(r)&&value.ood_state==='unavailable';
        if(key==='oodReferenceUnverified')return value.review_reasons.includes('ood_reference_unverified');
        if(key==='oodIssue')return matchesFilter(r,'oodOutside')||matchesFilter(r,'oodUnavailable');
        if(key==='conformalAmbiguous')return hasPrediction(r)&&value.conformal_state==='multiple';
        if(key==='conformalEmpty')return hasPrediction(r)&&value.conformal_state==='empty';
        return true;
    }
    function matchingRecords() {
        return Array.from(records.values()).filter(r => (view !== 'saved' || r.saved) && (!query || `${r.id} ${r.filename}`.toLowerCase().includes(query.toLowerCase())));
    }
    function visibleRecords() {
        return matchingRecords().filter(r=>matchesFilter(r,filter)).sort((a,b) => {
            if(sort === 'defaultSort' && a.reviewed !== b.reviewed) return a.reviewed ? 1 : -1;
            if(sort === 'flagSort' && a.flagged !== b.flagged) return a.flagged ? -1 : 1;
            const time = sort === 'newest' ? b.createdAt-a.createdAt : a.createdAt-b.createdAt;
            return time || a.id.localeCompare(b.id);
        });
    }
    function chooseFilter(value) {
        filter=value; pageIndex=0;
        const control=document.getElementById('case-filter');if(control)control.value=value;
        renderList();
    }
    function renderSummary() {
        if(!summaryBox)return;
        summaryBox.replaceChildren();
        const pool=matchingRecords();
        const checks=make('details','case-checks'),groups=make('div','case-summary');checks.append(make('summary','',language==='en'?'Checks':'Pemeriksaan'),groups);
        for(const key of ['unreviewed','high','imageIssue','iqaWarning','oodIssue','conformalAmbiguous','conformalEmpty']) {
            const count=pool.reduce((n,r)=>n+Number(matchesFilter(r,key)),0);
            const b=button(key,()=>chooseFilter(key));b.classList.add('case-summary-button');b.dataset.tone=key==='high'?'danger':key==='unreviewed'?'info':'warning';b.dataset.filter=key;
            b.append(make('strong','',String(count)));b.setAttribute('aria-pressed',String(filter===key));if(['unreviewed','high','imageIssue'].includes(key))summaryBox.append(b);else {groups.append(b);if(filter===key)checks.open=true;}
        }
        summaryBox.append(checks);
        if(filterReason) {
            const reasonKey='reason'+filter[0].toUpperCase()+filter.slice(1);
            filterReason.textContent=`${t('filterReason')}: ${Object.hasOwn(words[language],reasonKey)?t(reasonKey):t(filter)}`;
        }
    }
    function dbOpen() {
        return new Promise((resolve,reject) => {
            if(!window.indexedDB) return reject(new Error('Storage unavailable'));
            let req; try { req=indexedDB.open(DB,1); } catch(e) {reject(e);return;}
            req.onupgradeneeded=()=> {if(!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE,{keyPath:'id'});};
            req.onerror=()=>reject(req.error || new Error('Storage unavailable'));
            req.onblocked=()=>reject(new Error('Storage blocked'));
            req.onsuccess=()=> {const db=req.result; db.onversionchange=()=>db.close(); resolve(db);};
        });
    }
    async function storage(mode, operation) {
        const db=await dbOpen();
        return new Promise((resolve,reject) => {
            let result;
            try {
                const tx=db.transaction(STORE,mode);
                const req=operation(tx.objectStore(STORE));
                if(req) req.onsuccess=()=> {result=req.result;};
                tx.oncomplete=()=> {db.close();resolve(result);};
                tx.onerror=tx.onabort=()=> {db.close();reject(tx.error || new Error('Storage transaction failed'));};
            } catch(e) {db.close();reject(e);}
        });
    }
    async function loadArchives() {
        const archiveToken=window.workProgress?.start('archive',{phase:'archive'});
        loadingArchives=true;renderList();
        try {
            const saved=await storage('readonly',s=>s.getAll());
            for(const item of saved || []) {
                if(item.schemaVersion!==SCHEMA || typeof item.id!=='string' || !(item.image instanceof Blob) || !Number.isFinite(item.createdAt)) {announce('unknownVersion');continue;}
                if(!records.has(item.id)) {
                    const generation=Number.isSafeInteger(item.resultGeneration)&&item.resultGeneration>0?item.resultGeneration:(item.result?1:0);
                    const reviewed=Boolean(item.reviewed && item.reviewedGeneration===generation && generation>0 && (item.state||'complete')==='complete' && item.result);
                    const migrated=Boolean(item.reviewed&&!reviewed);
                    records.set(item.id,{...item,state:item.state||'complete',resultGeneration:generation,reviewedGeneration:reviewed?generation:null,reviewed,revision:migrated?1:0,savedRevision:0,saved:true,saving:false,userRevision:0,savedUserRevision:0,feedback:null});
                    if(migrated)announce('legacyReview');
                }
            }
        } catch(e) {announce('loadError');}
        finally {window.workProgress?.finish('archive',{},archiveToken);loadingArchives=false;renderList();}
    }
    async function saveActive() {
        const r=records.get(activeId); if(!r || r.saving || r.state==='processing' || liveSingle(r)) return;
        r.saving=true;renderDetailTools();
        const revision=r.revision, userRevision=r.userRevision || 0;
        const snapshot={schemaVersion:SCHEMA,id:r.id,filename:r.filename,sourcePath:r.sourcePath||r.filename,image:r.image,result:r.result,modelVersion:r.modelVersion,createdAt:r.createdAt,updatedAt:Date.now(),reviewed:r.reviewed,flagged:r.flagged,notes:r.notes,state:r.state,resultGeneration:r.resultGeneration||0,reviewedGeneration:r.reviewed?r.reviewedGeneration:null};
        try {
            await storage('readwrite',s=>s.put(snapshot));
            r.saved=true;r.savedRevision=revision;r.savedUserRevision=userRevision;r.feedback={key:'savedMessage',revision};
        } catch(e) {r.feedback={key:'saveError',revision};}
        finally {r.saving=false;renderList();renderDetailTools();}
    }
    async function removeCases(ids) {
        const cases=ids.map(id=>records.get(id)).filter(Boolean);
        if(!cases.length || cases.some(r=>r.state==='processing' || r.saving) || !window.confirm(t('deleteConfirm'))) return;
        try {
            if(cases.some(r=>r.saved)) await storage('readwrite',s=> {for(const r of cases) if(r.saved) s.delete(r.id);});
        } catch(e) {announce('deleteError');return;}
        const removedSingle=cases.some(r=>r.id===singleRecordId);
        for(const r of cases) {deletedImages.add(r.image);if(typeof invalidateSingleRequest==='function')invalidateSingleRequest(r.image);records.delete(r.id);selected.delete(r.id);}
        if(cases.some(r=>r.id===activeId)) closeDetail(false);
        if(removedSingle) {
            singleRecordId=null;singleFile=null;singlePreview=null;
            if(view==='single'&&typeof resetSingleTriage==='function')resetSingleTriage();
        }
        announce('deleted');renderList();
    }
    function canLeave() { const r=records.get(activeId); return !r || (r.userRevision || 0)===(r.savedUserRevision || 0) || !dirty(r) || window.confirm(t('leaveConfirm')); }
    function closeDetail(ask=true) {
        if(ask && !canLeave()) return false;
        const previousId=activeId;
        ++openVersion;activeId=null;document.body.classList.remove('case-detail-open');
        if(activeUrl) URL.revokeObjectURL(activeUrl);activeUrl=null;
        if(tools) tools.hidden=true;
        const processing=document.getElementById('processing-workspace');
        if(processing) processing.open=view==='single';
        const previousButton=Array.from(document.querySelectorAll('.case-open')).find(el=>el.dataset.caseId===previousId);
        (previousButton || (view==='single'?document.getElementById('drop-zone'):workspace))?.focus();
        return true;
    }
    function addFiles(files) {
        if(view!=='queue' && !canLeave())return;
        if(view==='single')rememberSingle();
        const now=Date.now();rejectedNames=[];
        for(const [i,file] of Array.from(files).entries()) {
            if(!/\.(png|jpe?g|webp)$/i.test(file.name)) {rejectedNames.push(file.name);continue;}
            const id=uid();
            records.set(id,{id,schemaVersion:SCHEMA,filename:file.name,sourcePath:file.webkitRelativePath||file._batchPath||file.name,image:file,result:null,state:'pending',createdAt:now+i,reviewed:false,flagged:false,notes:'',saved:false,revision:0,savedRevision:-1,modelVersion:modelVersion()});
        }
        if(rejectedNames.length) announce('unsupported');
        else if(message?.dataset.messageKey==='unsupported'){message.textContent='';delete message.dataset.messageKey;}
        const changedView=view!=='queue';if(changedView)selected.clear();view='queue';pageIndex=0;if(changedView)build();renderNav();renderList();
    }
    async function executeRun(pending) {
        if(running || (typeof isSubmitting!=='undefined'&&isSubmitting) || (typeof isBatchRunning!=='undefined'&&isBatchRunning) || !pending.length)return;
        running=true;cancelled=false;run={id:++runSequence,total:pending.length,completed:0,failed:0,cancelled:0,skipped:0};renderList();
        const progressToken=window.workProgress?.start('batch',{phase:'decode',total:pending.length,completed:0});
        const updateProgress=extra=>window.workProgress?.update('batch',{completed:run.completed,failed:run.failed,cancelled:run.cancelled,skipped:run.skipped,...extra},progressToken);
        try {
            for(const r of pending) {
                if(!records.has(r.id)){run.skipped++;updateProgress({});continue;}
                if(cancelled){r.state='cancelled';r.revision++;resetReview(r);run.cancelled++;updateProgress({});renderList();continue;}
                r.state='processing';r.revision++;resetReview(r);r.feedback=null;renderList();renderDetailTools();
                if(activeId===r.id)await showResult(r);
                updateProgress({filename:r.filename,phase:'decode',percent:null});
                await window.workProgress?.paint();
                let result=null;
                try {
                    const file=r.image instanceof File?r.image:new File([r.image],r.filename,{type:r.image.type});
                    result=await processBatchItem(file,stage=>updateProgress(stage));
                } catch(e) { /* Failure remains explicit and can only be retried on request. */ }
                if(!records.has(r.id)){run.skipped++;updateProgress({});continue;}
                finishResult(r,result);if(r.state==='failed')run.failed++;else run.completed++;
                updateProgress({});renderList();if(activeId===r.id)await showResult(r);
            }
        } finally {window.workProgress?.finish('batch',{completed:run.completed,failed:run.failed,cancelled:run.cancelled,skipped:run.skipped,status:cancelled?'cancelled':run.failed?'attention':'done'},progressToken);running=false;renderList();renderDetailTools();}
    }
    async function process(scope='visible') {
        return executeRun(scopeRecords(scope==='selected'?'selected':'visible'));
    }
    async function retry(scope='visible') {
        if(view==='saved'||view==='guide')return;
        if(view==='single'){const r=records.get(activeId);if(r&&r.state==='failed'&&(scope===r.id||scope==='visible')&&typeof submitSingleTriage==='function')return submitSingleTriage();return;}
        if(typeof scope==='string'&&records.has(scope))return executeRun([records.get(scope)].filter(r=>eligible(r,true)));
        return executeRun(scopeRecords(scope==='selected'?'selected':'visible',true));
    }
    async function openCase(id, focusHeatmap=false) {
        if(id!==activeId && !canLeave()) return;
        const r=records.get(id);if(!r) return;
        const position=visibleRecords().findIndex(item=>item.id===id);if(position>=0)pageIndex=Math.floor(position/PAGE_SIZE);
        if(view==='single'||view==='guide') view='queue';
        activeId=id;renderNav();renderList();renderDetailTools();
        const p=document.getElementById('processing-workspace');if(p) p.open=true;
        if(typeof switchMode==='function') switchMode('single');
        const panel=document.getElementById('panel-single');if(panel) panel.dataset.caseDetail='true';
        await showResult(r);
        detailTitle?.focus({preventScroll:true});
        if(focusHeatmap && r.id===activeId) {
            if((r.result?.hirescam_heatmap_base64||r.result?.hirescam_overlay_url)&&typeof setSliderMode==='function')setSliderMode('heat');
            const target=document.querySelector('.viewer-card');target?.scrollIntoView({block:'start',behavior:'auto'});
            const heading=document.getElementById('txt-viewer-title');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
        } else tools.scrollIntoView({block:'nearest',behavior:'auto'});
    }
    async function showResult(r) {
        const version=++openVersion;
        if(activeUrl) URL.revokeObjectURL(activeUrl);
        activeUrl=URL.createObjectURL(r.image);
        const source=activeUrl;
        // Invalidate legacy in-flight single-image renders before selecting another case.
        if(view!=='single') {
            if(typeof singleSelectionVersion!=='undefined') ++singleSelectionVersion;
            if(typeof selectedFile!=='undefined') selectedFile=null;
        }
        if(r.id!==activeId || version!==openVersion) return;
        if(r.state==='processing') {
            if(typeof currentResultData!=='undefined')currentResultData=null;
            if(typeof setLoadingState==='function')setLoadingState(true);
            return;
        }
        const loading=document.getElementById('loading-state');if(loading)loading.style.display='none';
        if(!r.result) {
            if(r.state==='failed') renderRuntimeError(t('failed'),source);
            else {
                if(typeof currentResultData!=='undefined') currentResultData=null;
                for(const id of ['img-base','img-heat']) {const img=document.getElementById(id);if(img)img.src='';}
                const result=document.getElementById('results-display');if(result)result.style.display='none';
                const empty=document.getElementById('empty-state');if(empty)empty.style.display='block';
                const title=document.getElementById('txt-empty-title');if(title)title.textContent=t(r.state);
                const desc=document.getElementById('txt-empty-desc');if(desc)desc.textContent=t('noResult');
                for(const id of ['val-prob-tb','val-prob-norm','met-set','met-lat']){const el=document.getElementById(id);if(el)el.textContent='N/A';}
                const loading=document.getElementById('loading-state');if(loading)loading.style.display='none';
            }
            return;
        }
        const data={...r.result,source_image:source};
        if(data.triage_action==='ERROR_RUNTIME') renderRuntimeError(t('failed'),source);
        else if((data.triage_action||'').startsWith('REJECT_')) {
            const iqa={...(data.iqa_report||{}),reject_code:data.triage_action,warnings:[t('imageIssue')]};
            renderRejectionResults(r.filename,iqa,source);
        } else renderSingleResults(data);
    }
    function mechanismStates(r) {
        if(!r.result)return {IQA:'noResult',OOD:'noResult',Conformal:'noResult'};
        const value=evidence(r);
        return {IQA:value.iqa_state==='passed'?'passed':['advisory','rejected'].includes(value.iqa_state)?'qualityWarning':'unavailable',OOD:value.ood_state==='within'?'within':value.ood_state==='outside'?'outside':'unavailable',Conformal:value.conformal_state==='singleton'?'singleton':value.conformal_state==='multiple'?'multiple':value.conformal_state==='empty'?'emptySet':'unavailable'};
    }
    function changeActive(key,value) {const r=records.get(activeId);if(!r || (key==='reviewed'&&value&&!reviewable(r)))return;if(key==='reviewed')r.reviewedGeneration=value?r.resultGeneration:null;r[key]=value;r.revision++;r.userRevision=(r.userRevision||0)+1;renderList();renderDetailTools();}
    function renderDetailTools() {
        if(!tools) return;
        const r=records.get(activeId); tools.hidden=!r || view==='guide' || singleBusy();if(!r)return;
        const focused=document.activeElement===note && note?.dataset.caseId===r.id;
        const caret=focused?[note.selectionStart,note.selectionEnd]:null;
        tools.replaceChildren();
        const header=make('div','case-detail-header');
        detailTitle=make('h2','',r.filename);detailTitle.tabIndex=-1;header.append(detailTitle);if(view!=='single')header.append(button('back',()=>closeDetail()));tools.append(header);
        const state=make('p','case-meta',`${r.id} · ${t(r.reviewed?'reviewed':'unreviewed')} · ${t(dirty(r)?'changed':'saved')}`);tools.append(state);
        const mechanisms=make('div','case-mechanisms');
        for(const [name,value] of Object.entries(mechanismStates(r))) {
            const badge=make('div','case-mechanism');badge.dataset.mechanism=name;badge.dataset.tone=['passed','within','singleton'].includes(value)?'success':'warning';
            badge.append(make('span','case-mechanism-label',name),make('strong','case-mechanism-value',t(value)));mechanisms.append(badge);
        }
        tools.append(mechanisms);
        const reasons=make('section','case-hint');reasons.id='case-review-reasons';reasons.setAttribute('aria-label',t('reviewReasons'));window.caseEvidence?.renderReasons(reasons,r.result,language);tools.append(reasons);
        const label=make('label','case-label',t('notes'));label.htmlFor='case-notes';
        note=make('textarea','case-notes');note.id='case-notes';note.dataset.caseId=r.id;note.value=r.notes;note.placeholder=t('notePlaceholder');note.rows=3;
        note.addEventListener('input',()=> {r.notes=note.value;r.revision++;r.userRevision=(r.userRevision||0)+1;const printable=tools.querySelector('.case-print-notes');if(printable)printable.textContent=r.notes;state.textContent=`${r.id} · ${t(r.reviewed?'reviewed':'unreviewed')} · ${t('changed')}`;showFeedback(r);renderList();});
        const printNote=make('p','case-print-notes',r.notes);printNote.hidden=true;tools.append(label,note,printNote);
        const actions=make('div','case-actions');
        const save=button(r.saving?'saving':'save',saveActive,'case-primary');save.disabled=r.saving || r.state==='processing';
        const review=button(r.reviewed?'markUnreviewed':'markReviewed',()=>changeActive('reviewed',!r.reviewed));review.id='case-mark-reviewed';review.disabled=!reviewable(r);
        actions.append(save,button(r.flagged?'unflag':'flag',()=>changeActive('flagged',!r.flagged)),review);
        if(view!=='saved'&&r.state==='failed'){const again=button('retry',()=>retry(r.id));again.id='case-retry-one';again.disabled=running||singleBusy();actions.append(again);}
        if(view!=='single')actions.append(button('next',()=> {const rows=visibleRecords();const index=rows.findIndex(x=>x.id===activeId);const next=rows[index+1]||rows.find(x=>x.id!==activeId&&!x.reviewed);if(next)openCase(next.id);}));
        actions.append(button('print',()=>window.print()),button('remove',()=>removeCases([r.id])));
        const printModel=make('p','case-print-model',`${t('model')}: ${r.modelVersion}`);printModel.hidden=true;tools.append(printModel);
        const modelDetails=make('details','case-model-details');modelDetails.append(make('summary','',t('model')),make('p','case-hint',`${t('savedVersion')}: ${r.modelVersion}`));
        detailMessage=make('p','case-message');detailMessage.setAttribute('role','status');detailMessage.setAttribute('aria-live','polite');
        showFeedback(r);
        tools.append(actions,detailMessage,make('p','case-hint',t('dirtyHelp')),modelDetails);
        if(focused){note.focus({preventScroll:true});note.setSelectionRange(...caret);}
    }
    function renderList() {
        if(!list) return;
        list.replaceChildren();
        const rows=visibleRecords();
        const pageCount=Math.max(1,Math.ceil(rows.length/PAGE_SIZE));
        pageIndex=Math.max(0,Math.min(pageIndex,pageCount-1));
        const start=pageIndex*PAGE_SIZE;
        const pageRows=rows.slice(start,start+PAGE_SIZE);
        renderSummary();
        if(pager) {
            pager.replaceChildren();
            const previous=button('previousPage',()=>{pageIndex--;renderList();document.getElementById('case-page-previous')?.focus();});previous.id='case-page-previous';previous.disabled=pageIndex===0;
            const next=button('nextPage',()=>{pageIndex++;renderList();document.getElementById('case-page-next')?.focus();});next.id='case-page-next';next.disabled=pageIndex>=pageCount-1;
            const status=make('span','case-page-status',`${t('page')} ${pageIndex+1}/${pageCount} · ${t('showing')} ${rows.length?start+1:0}–${Math.min(start+PAGE_SIZE,rows.length)}/${rows.length}`);
            status.setAttribute('role','status');pager.append(previous,status,next);
        }
        const counts=Array.from(records.values());
        const runText=run&&view==='queue'?` · ${t('progress')}: ${run.completed+run.failed}/${run.total} · ${t('failed')}: ${run.failed} · ${t('cancelled')}: ${run.cancelled}${run.skipped?' · '+t('skipped')+': '+run.skipped:''}`:'';
        if(progress)progress.textContent=`${t('count')}: ${rows.length}${selected.size?' · '+t('selected')+': '+selected.size:''}${runText}`;
        for(const button of workspace.querySelectorAll('[data-action=add],[data-action=folder]'))button.disabled=importing;
        const blocked=running||importing||(typeof isSubmitting!=='undefined'&&isSubmitting);
        const processBtn=document.getElementById('case-process');if(processBtn){processBtn.disabled=blocked||!scopeRecords('visible').length;processBtn.hidden=selected.size>0;}
        const selectedBtn=document.getElementById('case-process-selected');if(selectedBtn){selectedBtn.disabled=blocked||!scopeRecords('selected').length;selectedBtn.hidden=!selected.size;}
        const retryBtn=document.getElementById('case-retry');if(retryBtn){retryBtn.disabled=blocked||!scopeRecords('visible',true).length;retryBtn.hidden=!scopeRecords('visible',true).length;}
        const clearBtn=document.getElementById('case-clear-selection');if(clearBtn)clearBtn.disabled=!selected.size;
        if(scopeHint)scopeHint.textContent=view==='queue'?`${t('processScope')}: ${scopeRecords('visible').length} · ${t('selectedScope')}: ${scopeRecords('selected').length} · ${t('retryScope')}: ${scopeRecords('visible',true).length}${running?' · '+t('nextRun'):''}`:'';
        const cancelBtn=document.getElementById('case-cancel');if(cancelBtn) {cancelBtn.hidden=!running;cancelBtn.disabled=cancelled;}
        const deleteBtn=document.getElementById('case-delete');if(deleteBtn) deleteBtn.disabled=!selected.size || counts.some(r=>selected.has(r.id)&&(r.state==='processing'||r.saving));
        const reset=document.getElementById('case-reset');if(reset)reset.disabled=blocked||loadingArchives||counts.some(r=>r.saving);
        const selectAll=document.getElementById('case-select-all');if(selectAll)selectAll.disabled=!rows.length;
        const exportButton=document.getElementById('case-export');if(exportButton)exportButton.disabled=!rows.length&&!selected.size;
        if(!rows.length) {list.append(make('h3','',t('empty')),make('p','case-hint',t('emptyHelp')));return;}
        for(const r of pageRows) {
            const row=make('article',`case-row${activeId===r.id?' is-active':''}`);row.dataset.state=r.state;row.setAttribute('aria-busy',String(r.state==='processing'));
            const check=make('input');check.dataset.caseId=r.id;check.type='checkbox';check.checked=selected.has(r.id);check.setAttribute('aria-label',`${t('selected')}: ${r.filename}`);
            check.addEventListener('change',()=> {if(check.checked)selected.add(r.id);else selected.delete(r.id);renderList();Array.from(list.querySelectorAll('input[type=checkbox]')).find(el=>el.dataset.caseId===r.id)?.focus();});
            const body=make('div','case-row-content');
            const title=button('open',()=>openCase(r.id),'case-open');title.textContent=r.filename;title.dataset.caseId=r.id;
            const meta=make('p','case-meta',`${new Date(r.createdAt).toLocaleString(language==='en'?'en-GB':'id-ID')} · ${t(r.state)} · ${t(r.reviewed?'reviewed':'unreviewed')}`);
            const summary=make('p','case-result',`${r.flagged?'★ ':''}${t(outcome(r))}${r.saved ? ` · ${t('saved')}`:''}${r.saved&&dirty(r)?` · ${t('changed')}`:''}`);
            body.append(title,meta,summary);if(hasPrediction(r)){const score=make('p','case-score',`${t('score')}: ${r.result.probability_tb>0&&r.result.probability_tb<.0001?'<0.01':(r.result.probability_tb*100).toFixed(2)}%`);score.title='P(TB) = '+r.result.probability_tb;body.append(score);}
            const reviewReasons=evidence(r).review_reasons;
            if(r.result&&reviewReasons.length){const reasons=make('p','case-row-issues',reviewReasons.map(key=>window.caseEvidence?.label(key,language)||key).join(' · '));reasons.dataset.reviewReasons=reviewReasons.join(' ');body.append(reasons);}
            const tone=outcome(r)==='high'||r.state==='failed'?'danger':outcome(r)==='low'?'info':r.result?'warning':'neutral';
            summary.dataset.tone=tone;row.dataset.tone=tone;
            const actions=make('div','case-row-actions');
            if(hasPrediction(r)) {const heat=button('heatmap',()=>openCase(r.id,true));heat.dataset.heatmapId=r.id;actions.append(heat);}
            else {const open=button('open',()=>openCase(r.id));open.dataset.openId=r.id;actions.append(open);}
            row.append(check,body,actions);list.append(row);
        }
    }
    function csv(value) {let s=value==null?'':String(value);if(/^[\s]*[=+\-@]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
    function exportCases(format='xlsx') {
        const data=selected.size ? Array.from(records.values()).filter(r=>selected.has(r.id)) : visibleRecords();
        if(!data.length)return;
        const headers=['caseId','filename','sourcePath','date','status','review','flagged','saved','score','result','IQA','OOD','Conformal','notes','model','reviewReasons'].map(t);
        const rows=data.map(r=>{const m=mechanismStates(r),score=evidence(r).score_available?evidence(r).score_tb:null;return [r.id,r.filename,r.sourcePath||r.filename,new Date(r.createdAt).toISOString(),t(r.state),t(r.reviewed?'reviewed':'unreviewed'),t(r.flagged?'yes':'no'),t(r.saved?'yes':'no'),Number.isFinite(score)?score:'',t(outcome(r)),t(m.IQA),t(m.OOD)+(validOodReport(r)&&evidence(r).ood_reference_status!=='verified'?' · '+t('referenceUnverified'):''),Array.isArray(evidence(r).canonical_set)?evidence(r).canonical_set.map(label=>label==='non_tb'?'Non-TB':'TB').join(' | '):t('unavailable'),r.notes,r.modelVersion,evidence(r).review_reasons.map(reason=>window.caseEvidence?.label(reason,language)||reason).join(' | ')];});
        let blob;try {blob=format==='csv'?new Blob(['\uFEFF'+[headers,...rows].map(row=>row.map((v,i)=>csv(i===8&&typeof v==='number'?(v*100).toFixed(2)+'%':v)).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}):window.caseReports.xlsx(headers,rows);}catch(error){announce('exportTooLong');return;}
        const url=URL.createObjectURL(blob),a=make('a');a.href=url;a.download=`tb-cases.${format==='csv'?'csv':'xlsx'}`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }
    async function resetSession() {
        if(running||importing||loadingArchives||Array.from(records.values()).some(r=>r.saving)||(typeof isSubmitting!=='undefined'&&isSubmitting))return;
        if(!window.confirm(t('resetConfirm')))return;
        for(const r of records.values()) {deletedImages.add(r.image);if(typeof invalidateSingleRequest==='function')invalidateSingleRequest(r.image);}
        window.workProgress?.clear();closeDetail(false);records.clear();selected.clear();singleRecordId=null;singleFile=null;singlePreview=null;run=null;query='';filter='all';sort='defaultSort';pageIndex=0;
        if(typeof resetSingleTriage==='function')resetSingleTriage();resetResultDisplay();build();announce('resetDone');
    }
    async function importFiles(files) {
        if(importing)return;
        const incoming=Array.from(files);if(!incoming.length)return;
        importing=true;renderList();
        const token=window.workProgress?.start('import',{phase:'files',total:incoming.length,completed:0});
        try {await window.workProgress?.paint();const before=records.size;addFiles(incoming);const added=records.size-before;window.workProgress?.finish('import',{completed:added,failed:incoming.length-added,status:added===incoming.length?'done':'attention'},token);}
        catch(error){window.workProgress?.finish('import',{status:'failed'},token);announce('folderError');}
        finally {importing=false;renderList();}
    }
    async function dropFiles(event) {
        event.preventDefault();if(view!=='queue'||importing)return;
        const items=Array.from(event.dataTransfer.items||[]),entries=items.map(x=>x.webkitGetAsEntry?.()).filter(Boolean);
        if(!entries.some(e=>e.isDirectory)){await importFiles(event.dataTransfer.files);return;}
        importing=true;announce('readingFolder');renderList();
        const token=window.workProgress?.start('import',{phase:'folder',found:0});
        const files=[];
        async function walk(entry,path='') {
            if(entry.isFile) {const file=await new Promise((resolve,reject)=>entry.file(resolve,reject));Object.defineProperty(file,'_batchPath',{value:path+file.name});files.push(file);if(files.length%25===0)window.workProgress?.update('import',{found:files.length},token);}
            else if(entry.isDirectory) {const reader=entry.createReader();for(;;){const batch=await new Promise((resolve,reject)=>reader.readEntries(resolve,reject));if(!batch.length)break;for(const child of batch)await walk(child,path+entry.name+'/');}}
        }
        try {for(const entry of entries)await walk(entry);await window.workProgress?.paint();addFiles(files);window.workProgress?.finish('import',{found:files.length},token);}catch(error){window.workProgress?.finish('import',{status:'failed'},token);announce('folderError');}finally{importing=false;renderList();}
    }
    function renderNav() {
        for(const el of document.querySelectorAll('[data-case-view]')) {el.classList.toggle('active',el.dataset.caseView===view);el.setAttribute('aria-current',el.dataset.caseView===view?'page':'false');}
        document.body.dataset.workspaceView=view;
        let viewerBack=document.getElementById('case-viewer-back');if(!viewerBack){viewerBack=button('back',()=>closeDetail());viewerBack.id='case-viewer-back';document.querySelector('.viewer-header')?.prepend(viewerBack);}viewerBack.hidden=!activeId||view==='single'||view==='guide';
        if(workspace)workspace.hidden=view==='single'||view==='guide';
        if(guide)guide.hidden=view!=='guide';
        if(tools)tools.hidden=!activeId||view==='guide'||singleBusy();
        const p=document.getElementById('processing-workspace');if(p)p.open=view==='single'||Boolean(activeId&&view!=='guide');
        document.body.classList.toggle('case-detail-open',Boolean(activeId&&view!=='single'&&view!=='guide'));
        if(view==='single'&&typeof switchMode==='function')switchMode('single');
    }
    function rememberSingle() {
        if(typeof selectedFile!=='undefined' && selectedFile instanceof Blob)singleFile=selectedFile;
        if(typeof originalImageSrc!=='undefined' && originalImageSrc)singlePreview=originalImageSrc;
    }
    function resetResultDisplay() {
        if(typeof currentResultData!=='undefined')currentResultData=null;
        const result=document.getElementById('results-display');if(result)result.style.display='none';
        const empty=document.getElementById('empty-state');if(empty)empty.style.display='block';
        const loading=document.getElementById('loading-state');if(loading)loading.style.display='none';
        for(const id of ['img-base','img-heat']){const el=document.getElementById(id);if(el)el.src='';}
        for(const id of ['val-prob-tb','val-prob-norm','met-set','met-lat','met-action','met-ood']){const el=document.getElementById(id);if(el)el.textContent='N/A';}
        const title=document.getElementById('txt-empty-title');if(title)title.textContent=(typeof I18N_DICT!=='undefined'?I18N_DICT[language]?.emptyTitle:null)||t('noResult');
        const desc=document.getElementById('txt-empty-desc');if(desc)desc.textContent=(typeof I18N_DICT!=='undefined'?I18N_DICT[language]?.emptyDesc:null)||t('noResult');
    }
    function restoreSingle() {
        const record=records.get(singleRecordId);
        if(record&&record.image===singleFile) {
            activeId=record.id;
            if(typeof selectedFile!=='undefined')selectedFile=singleFile;
            if(typeof originalImageSrc!=='undefined')originalImageSrc=singlePreview;
            if(singleBusy()){resetResultDisplay();if(typeof setLoadingState==='function')setLoadingState(true);}
            else showResult(record);
        } else {activeId=null;resetResultDisplay();if(typeof selectedFile!=='undefined')selectedFile=singleFile;if(typeof originalImageSrc!=='undefined')originalImageSrc=singlePreview;if(singleBusy()&&singleFile&&typeof setLoadingState==='function')setLoadingState(true);}
        const status=document.getElementById('file-status');if(status)status.style.display=singleFile?'block':'none';
        const name=document.getElementById('file-name-label');if(name)name.textContent=singleFile?.name||'';
        const size=document.getElementById('file-size-label');if(size)size.textContent=singleFile?`${(singleFile.size/1024).toFixed(1)} KB`:'';
        const submit=document.getElementById('btn-submit');if(submit)submit.disabled=!singleFile||(typeof isSubmitting!=='undefined'&&isSubmitting);
        if(!record&&singlePreview){const image=document.getElementById('img-base');if(image)image.src=singlePreview;}
        renderNav();renderDetailTools();
    }
    function setView(next) {
        if(!['single','queue','saved','guide'].includes(next)||next===view)return;
        if(!canLeave())return;
        if(view==='single') {
            rememberSingle();
        }
        selected.clear();view=next;pageIndex=0;build();if(next==='saved')loadArchives();
        if(next==='single')restoreSingle();
        else {activeId=null;renderNav();renderDetailTools();}
        renderList();
    }
    function captureSingle(file,result) {
        if(!(file instanceof Blob)||deletedImages.has(file)||!result||typeof result!=='object')return null;
        let id=singleIds.get(file),record=id?records.get(id):null;
        if(!record){id=uid();record={id,schemaVersion:SCHEMA,filename:file.name||t('source'),image:file,result:null,state:'complete',createdAt:Date.now(),reviewed:false,flagged:false,notes:'',saved:false,revision:0,savedRevision:-1,userRevision:0,savedUserRevision:0,modelVersion:modelVersion()};records.set(id,record);singleIds.set(file,id);}
        const {source_image,...storedResult}=result;
        finishResult(record,storedResult);
        singleRecordId=id;singleFile=file;singlePreview=source_image||(typeof originalImageSrc!=='undefined'?originalImageSrc:null);
        if(view==='single'){activeId=id;renderNav();renderDetailTools();}
        renderList();
        queueMicrotask(()=>{if(view==='single'&&activeId===id&&!singleBusy()){renderNav();renderDetailTools();}});
        return id;
    }
    function clearSingle() {
        if(view==='single'&&!canLeave())return false;
        singleRecordId=null;singleFile=null;singlePreview=null;
        if(view==='single'){activeId=null;if(activeUrl)URL.revokeObjectURL(activeUrl);activeUrl=null;++openVersion;renderNav();renderDetailTools();}
        return true;
    }
    function selectControl(label,options,value,onChange) {
        const wrap=make('label','case-control',t(label));const el=make('select');if(label==='filter')el.id='case-filter';
        for(const key of options){const o=make('option','',t(key));o.value=key;el.append(o);}el.value=value;el.addEventListener('change',()=>onChange(el.value));wrap.append(el);return wrap;
    }
    function build() {
        if(!workspace)return;
        const focusId=document.activeElement?.id;const start=document.activeElement?.selectionStart;const messageKey=message?.dataset.messageKey;
        workspace.replaceChildren();
        const heading=make('div','case-detail-header');heading.append(button('back',()=>setView('single')),make('h2','',t(view==='saved'?'saved':'batch')));workspace.append(heading);
        const toolbar=make('div','case-toolbar');
        const extra=make('details','case-more'),extraActions=make('div','case-actions');extra.append(make('summary','',t('more')),extraActions);
        if(view!=='saved') {
            const upload=make('input');upload.type='file';upload.multiple=true;upload.accept='.png,.jpg,.jpeg,.webp';upload.hidden=true;upload.id='case-files';upload.addEventListener('change',()=> {importFiles(upload.files);upload.value='';});
            const folder=make('input');folder.type='file';folder.multiple=true;folder.setAttribute('webkitdirectory','');folder.hidden=true;folder.id='case-folder';folder.addEventListener('change',()=>{importFiles(folder.files);folder.value='';});
            toolbar.append(upload,folder,button('add',()=>upload.click()),button('folder',()=>folder.click()));
            const go=button('processShown',()=>process('visible'));go.id='case-process';
            const chosen=button('processSelected',()=>process('selected'),'case-primary');chosen.id='case-process-selected';
            const again=button('retry',()=>retry('visible'));again.id='case-retry';
            const cancel=button('cancel',()=> {cancelled=true;window.workProgress?.update('batch',{cancelling:true});renderList();});cancel.id='case-cancel';cancel.title=t('cancelHelp');go.classList.add('case-primary');toolbar.append(go,chosen,cancel);extraActions.append(again);
        }
        const clear=button('clearSelection',()=>{selected.clear();renderList();});clear.id='case-clear-selection';
        const del=button('remove',()=>removeCases([...selected]));del.id='case-delete';const exportButton=button('export',exportCases);exportButton.id='case-export';exportButton.title=t('exportHelp');toolbar.append(exportButton);extraActions.append(button('csv',()=>exportCases('csv')),del,clear);
        const all=button('selectAll',()=>{for(const r of visibleRecords())selected.add(r.id);renderList();});all.id='case-select-all';all.title=t('selectionHelp');extraActions.prepend(all);
        if(view==='queue'){const reset=button('resetSession',resetSession,'case-danger');reset.id='case-reset';extraActions.append(reset);}
        toolbar.append(extra);
        workspace.append(toolbar);if(view==='queue')workspace.append(make('p','case-bulk-help',t('bulkHelp')));workspace.append(make('p','case-hint',t('exportHelp')));scopeHint=make('p','case-hint');scopeHint.id='case-process-scope';workspace.append(scopeHint);
        const controls=make('div','case-filters');
        const searchLabel=make('label','case-control',t('search'));const input=make('input');input.id='case-search';input.type='search';input.placeholder=t('search');input.value=query;input.addEventListener('input',()=> {query=input.value;pageIndex=0;renderList();});searchLabel.append(input);controls.append(searchLabel);
        controls.append(selectControl('filter',['all','pending','processing','complete','failed','cancelled','unreviewed','reviewed','flagged','saved','unsaved','imageIssue','iqaWarning','oodOutside','oodUnavailable','oodIssue','oodReferenceUnverified','conformalAmbiguous','conformalEmpty','policyIntermediate','evidenceUnknown','low','high','uncertain'],filter,chooseFilter),selectControl('sort',['defaultSort','oldest','newest','flagSort'],sort,value=>{sort=value;pageIndex=0;renderList();}));
        workspace.append(controls,make('p','case-hint',t('orderHelp')));
        summaryBox=make('div','case-summary');summaryBox.setAttribute('aria-label',t('summary'));workspace.append(summaryBox,make('p','case-hint',t('summaryHelp')));
        filterReason=make('p','case-filter-reason');workspace.append(filterReason);
        progress=make('p','case-progress');progress.setAttribute('role','status');progress.setAttribute('aria-live','polite');workspace.append(progress);
        message=make('p','case-message');message.setAttribute('role','status');message.setAttribute('aria-live','polite');workspace.append(message);if(messageKey)announce(messageKey);
        list=make('div','case-list');pager=make('nav','case-pagination');pager.setAttribute('aria-label',t('page'));workspace.append(pager,list,make('p','case-storage',t('storage')));
        workspace.ondragover=e=> {e.preventDefault();};workspace.ondrop=dropFiles;
        guide.replaceChildren(make('h2','',t('guide')),make('p','',t('steps')),make('p','',t('qualityHelp')),make('p','',t('oodHelp')),make('p','',t('setHelp')),make('p','',t('errorHelp')),make('p','',t('limits')),make('p','',t('storage')),make('p','',t('storedNote')));
        for(const el of document.querySelectorAll('[data-case-i18n]')) el.textContent=t(el.dataset.caseI18n);
        renderNav();renderList();renderDetailTools();
        if(focusId){const el=document.getElementById(focusId);if(el){el.focus();if(Number.isInteger(start)&&typeof el.setSelectionRange==='function')try{el.setSelectionRange(start,start);}catch(e){}}}
    }
    function setLanguage(lang) {
        language=lang==='en'?'en':'id';
        const noteFocused=note===document.activeElement;const selection=noteFocused?[note.selectionStart,note.selectionEnd]:null;const text=note?.value;if(activeId&&text!==undefined){const r=records.get(activeId);if(r)r.notes=text;}
        if(note===document.activeElement)note.blur();
        build();
        if(noteFocused&&note){note.focus();note.setSelectionRange(...selection);}
        const r=records.get(activeId);if(r&&view!=='guide'&&view!=='single')showResult(r);
    }
    function init() {
        workspace=document.getElementById('case-workspace');tools=document.getElementById('case-detail-tools');guide=document.getElementById('case-guide');
        if(!workspace||!tools||!guide)return;
        for(const el of document.querySelectorAll('[data-case-view]'))el.addEventListener('click',()=>setView(el.dataset.caseView));
        build();loadArchives();
        renderNav();
    }
    window.caseWorkspace={setLanguage,captureSingle,clearSingle,addFiles,open:openCase,process,retry,resetSession,refreshArchives:loadArchives,save:saveActive,remove:removeCases,export:exportCases,setView,get state(){return {records:Array.from(records.values()),activeId,view,running,loadingArchives,pageIndex,pageSize:PAGE_SIZE,filter,sort,selectedIds:Array.from(selected),run:run?{...run}:null};}};
    window.addEventListener('tb-language-change',e=>setLanguage(e.detail?.language||e.detail?.lang||'id'));
    window.addEventListener('beforeunload',e=> {if(Array.from(records.values()).some(r=>dirty(r))){e.preventDefault();e.returnValue='';}});
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
