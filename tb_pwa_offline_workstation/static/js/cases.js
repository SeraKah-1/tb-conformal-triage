/* Local case workflow. Images and notes stay in this browser origin. */
(() => {
    'use strict';
    const words = {
        en: {queue:'Queue',saved:'Saved',guide:'Guide',process:'Process',install:'Install',research:'Research',researchNotice:'Research use. Clinician review is required for every result.',add:'Add images',cancel:'Cancel',search:'Search',all:'All',unreviewed:'Unreviewed',reviewed:'Reviewed',flagged:'Flagged',unsaved:'Unsaved',imageIssue:'Image issue',low:'Low score',high:'High score',uncertain:'Uncertain',oldest:'Oldest',newest:'Newest',defaultSort:'Review order',flagSort:'Flagged first',open:'Open',remove:'Delete',export:'Export',print:'Print',save:'Save',flag:'Flag',unflag:'Unflag',markReviewed:'Mark reviewed',markUnreviewed:'Mark unreviewed',next:'Next',back:'Back',notes:'Notes',pending:'Queued',processing:'Processing',complete:'Processed',failed:'Failed',cancelled:'Cancelled',empty:'No cases',emptyHelp:'Add images to start. Saved cases appear here after reopening this browser.',count:'Cases',selected:'Selected',result:'Result',status:'Status',review:'Review',filename:'Filename',date:'Added',score:'Model score',model:'Model',changed:'Unsaved changes',saving:'Saving',savedMessage:'Saved on this device.',saveError:'Save failed. Check browser storage and try again. The case remains in this session.',loadError:'Saved cases could not be opened. Browser storage may be unavailable.',deleteError:'Delete failed. Stored cases have not been removed.',deleteConfirm:'Delete selected cases and their stored images? This cannot be undone.',leaveConfirm:'This case has unsaved changes. Continue without saving? Changes remain in this session.',unsupported:'Unsupported file. Use PNG, JPEG or WebP.',storage:'Images, results and notes are saved only in this browser on this device. Space and installed PWA archives may be separate. Clearing browser data removes saved cases.',limits:'Model results support review. They do not establish a diagnosis or permit discharge.',steps:'Add images, select Process, open a case, review the result, add notes, then Save. Mark reviewed records your review separately from saving.',cancelHelp:'Cancellation stops after the current image. Completed results remain available.',orderHelp:'Unreviewed first, then oldest. This order does not indicate clinical urgency.',noResult:'No result',detail:'Case',progress:'Processed',savedOnly:'Saved cases',reviewRequired:'Review required',savedVersion:'Saved model',storedNote:'Opening an archive does not run the model again.',dirtyHelp:'Save includes the image, result, notes and review status.',notePlaceholder:'Add a note',deleteOne:'Delete case',modelUnavailable:'Not recorded',deleted:'Cases deleted.',source:'Image',filter:'Filter',sort:'Sort',unknownVersion:'Unsupported archive version. The record was not changed.'},
        id: {queue:'Antrean',saved:'Tersimpan',guide:'Panduan',process:'Proses',install:'Pasang',research:'Penelitian',researchNotice:'Penggunaan penelitian. Setiap hasil wajib ditinjau tenaga medis.',add:'Tambah gambar',cancel:'Batal',search:'Cari',all:'Semua',unreviewed:'Belum ditinjau',reviewed:'Sudah ditinjau',flagged:'Ditandai',unsaved:'Belum disimpan',imageIssue:'Masalah gambar',low:'Skor rendah',high:'Skor tinggi',uncertain:'Ambigu',oldest:'Terlama',newest:'Terbaru',defaultSort:'Urutan review',flagSort:'Ditandai dahulu',open:'Buka',remove:'Hapus',export:'Ekspor',print:'Cetak',save:'Simpan',flag:'Tandai',unflag:'Hapus tanda',markReviewed:'Selesai ditinjau',markUnreviewed:'Belum ditinjau',next:'Berikutnya',back:'Kembali',notes:'Catatan',pending:'Mengantre',processing:'Diproses',complete:'Selesai',failed:'Gagal',cancelled:'Dibatalkan',empty:'Belum ada',emptyHelp:'Tambahkan gambar untuk memulai. Kasus tersimpan dapat dibuka kembali di browser ini.',count:'Kasus',selected:'Dipilih',result:'Hasil',status:'Status',review:'Review',filename:'Berkas',date:'Ditambahkan',score:'Skor model',model:'Model',changed:'Belum disimpan',saving:'Menyimpan',savedMessage:'Disimpan di perangkat ini.',saveError:'Gagal menyimpan. Periksa penyimpanan browser lalu coba lagi. Kasus tetap ada dalam sesi ini.',loadError:'Kasus tersimpan gagal dibuka. Penyimpanan browser mungkin tidak tersedia.',deleteError:'Gagal menghapus. Kasus tersimpan belum dihapus.',deleteConfirm:'Hapus kasus terpilih beserta gambar tersimpan? Tindakan ini tidak dapat dibatalkan.',leaveConfirm:'Perubahan kasus belum disimpan. Lanjut tanpa menyimpan? Perubahan tetap ada dalam sesi ini.',unsupported:'Berkas tidak didukung. Gunakan PNG, JPEG, atau WebP.',storage:'Gambar, hasil, dan catatan hanya tersimpan di browser perangkat ini. Arsip Space dan PWA terpasang dapat berbeda. Menghapus data browser menghapus kasus tersimpan.',limits:'Hasil model membantu peninjauan. Hasil tidak menetapkan diagnosis atau izin pemulangan pasien.',steps:'Tambah gambar, pilih Proses, buka kasus, tinjau hasil, isi catatan, lalu Simpan. Status review dicatat terpisah dari penyimpanan.',cancelHelp:'Pembatalan berhenti setelah gambar aktif selesai. Hasil yang selesai tetap tersedia.',orderHelp:'Belum ditinjau dahulu, lalu terlama. Urutan ini tidak menunjukkan urgensi klinis.',noResult:'Belum tersedia',detail:'Kasus',progress:'Selesai',savedOnly:'Kasus tersimpan',reviewRequired:'Wajib ditinjau',savedVersion:'Model tersimpan',storedNote:'Membuka arsip tidak menjalankan model kembali.',dirtyHelp:'Simpan mencakup gambar, hasil, catatan, dan status review.',notePlaceholder:'Tambah catatan',deleteOne:'Hapus kasus',modelUnavailable:'Tidak tercatat',deleted:'Kasus dihapus.',source:'Gambar',filter:'Filter',sort:'Urutkan',unknownVersion:'Versi arsip tidak didukung. Data tidak diubah.'}
    };
    Object.assign(words.en, {passed:'Passed',qualityWarning:'Warning',unavailable:'Unavailable',within:'Within reference',outside:'Outside reference',singleton:'Single label',multiple:'Multiple labels',emptySet:'Empty set',previousPage:'Previous',nextPage:'Next',page:'Page',showing:'Showing',iqaWarning:'IQA warnings',oodOutside:'Outside reference',oodUnavailable:'OOD unavailable',oodIssue:'OOD issues',conformalAmbiguous:'Multiple labels',conformalEmpty:'Empty set',filterReason:'Filter reason',summary:'Review groups',summaryHelp:'Counts may overlap. These groups organize review; they do not determine clinical urgency or remove cases from review.',reasonAll:'All matching cases.',reasonUnreviewed:'Cases not yet marked reviewed.',reasonImageIssue:'Unreadable or rejected images, or a processing failure.',reasonIqaWarning:'Image quality failed or a quality advisory was recorded.',reasonOodOutside:'The model reported an image outside its reference distribution.',reasonOodUnavailable:'The reference-distribution check was unavailable for a model result.',reasonOodIssue:'The reference-distribution check was outside reference or unavailable.',reasonConformalAmbiguous:'The conformal set contains more than one label.',reasonConformalEmpty:'The conformal set contains no labels.',reasonHigh:'The recorded assistive policy returned a high-score flag.',reasonLow:'The recorded assistive policy returned a low-score result. Review remains required.',reasonUncertain:'The recorded assistive policy requested review without a high- or low-score category.'});
    Object.assign(words.id, {passed:'Lolos',qualityWarning:'Peringatan',unavailable:'Tidak tersedia',within:'Dalam referensi',outside:'Luar referensi',singleton:'Label tunggal',multiple:'Label ganda',emptySet:'Set kosong',previousPage:'Sebelumnya',nextPage:'Berikutnya',page:'Halaman',showing:'Ditampilkan',iqaWarning:'Peringatan IQA',oodOutside:'Luar referensi',oodUnavailable:'Tanpa OOD',oodIssue:'Masalah OOD',conformalAmbiguous:'Label ganda',conformalEmpty:'Set kosong',filterReason:'Alasan filter',summary:'Kelompok review',summaryHelp:'Jumlah dapat tumpang tindih. Kelompok ini mengatur review; bukan penetapan urgensi klinis atau alasan melewatkan review.',reasonAll:'Semua kasus yang cocok.',reasonUnreviewed:'Kasus yang belum ditandai sudah ditinjau.',reasonImageIssue:'Gambar tidak terbaca atau ditolak, atau proses gagal.',reasonIqaWarning:'Pemeriksaan kualitas gambar gagal atau mencatat peringatan kualitas.',reasonOodOutside:'Model melaporkan gambar di luar distribusi referensi.',reasonOodUnavailable:'Pemeriksaan distribusi referensi tidak tersedia pada hasil model.',reasonOodIssue:'Pemeriksaan distribusi referensi di luar referensi atau tidak tersedia.',reasonConformalAmbiguous:'Set conformal berisi lebih dari satu label.',reasonConformalEmpty:'Set conformal tidak berisi label.',reasonHigh:'Kebijakan asistif tersimpan menghasilkan tanda skor tinggi.',reasonLow:'Kebijakan asistif tersimpan menghasilkan skor rendah. Review tetap wajib.',reasonUncertain:'Kebijakan asistif tersimpan meminta review tanpa kategori skor tinggi atau rendah.'});
    const records = new Map();
    const selected = new Set();
    const DB = 'tb_case_archive_v1', STORE = 'cases', SCHEMA = 1;
    let language = typeof currentLang === 'string' ? currentLang : 'id';
    let activeId = null, view = 'queue', running = false, cancelled = false;
    let query = '', filter = 'all', sort = 'defaultSort', activeUrl = null, openVersion = 0;
    let workspace, tools, guide, list, live, detailTitle, note, message, progress;
    const PAGE_SIZE = 50;
    let pageIndex = 0, summaryBox, pager, filterReason;
    let loadingArchives = true;
    let rejectedNames = [];
    const t = key => (words[language] || words.id)[key] || key;
    const make = (tag, cls, value) => {
        const el = document.createElement(tag); if (cls) el.className = cls;
        if (value !== undefined) el.textContent = value; return el;
    };
    const icons = {add:'M12 5v14M5 12h14',process:'m9 5 10 7-10 7V5Z',cancel:'M6 6l12 12M6 18 18 6',save:'M5 3h12l4 4v14H3V3h2Zm2 0v7h10V3M7 21v-7h10v7',flag:'M5 21V3h14l-3 5 3 5H5',unflag:'M5 21V3h14l-3 5 3 5H5',remove:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15',export:'M12 3v12m-5-5 5 5 5-5M4 15v6h16v-6',print:'M6 9V3h12v6M6 17H3V9h18v8h-3M6 14h12v7H6Z',next:'m9 5 7 7-7 7',back:'m15 5-7 7 7 7',markReviewed:'m4 12 5 5L20 6',markUnreviewed:'M12 8v5m0 4v.1M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z'};
    function button(key, action, cls = '') {
        const b=make('button',`case-button ${cls}`); b.type='button';
        if(icons[key]) {
            const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
            for(const [name,value] of Object.entries({viewBox:'0 0 24 24',width:'15',height:'15',fill:'none',stroke:'currentColor','stroke-width':'1.7','stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true'})) svg.setAttribute(name,value);
            const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',icons[key]);svg.append(path);b.append(svg);
        }
        b.append(make('span','',t(key))); b.addEventListener('click', action); return b;
    }
    function announce(key) { if(message) {message.dataset.messageKey=key; message.textContent=t(key)+(key==='unsupported' && rejectedNames.length ? ' '+rejectedNames.join(', ') : '');} }
    function uid() { return globalThis.crypto && crypto.randomUUID ? crypto.randomUUID() : `case-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`; }
    function modelVersion() { return typeof MODEL_CACHE_KEY === 'string' ? MODEL_CACHE_KEY : t('modelUnavailable'); }
    function dirty(r) { return !r.saved || r.revision !== r.savedRevision; }
    function outcome(r) {
        if (!r.result) return r.state === 'failed' ? 'imageIssue' : 'noResult';
        const a = r.result.triage_action || '';
        if (a.startsWith('REJECT_') || a === 'ERROR_RUNTIME') return 'imageIssue';
        if (a === 'ASSISTIVE_NORMAL_DOCTOR_VERIFY') return 'low';
        if (a === 'AUTO_FLAG_TB_URGENT') return 'high';
        return 'uncertain';
    }
    function hasPrediction(r) {
        return Boolean(r.result && !((r.result.triage_action || '').startsWith('REJECT_')) && r.result.triage_action !== 'ERROR_RUNTIME' && Number.isFinite(r.result.probability_tb));
    }
    function validOodReport(r) {
        const report=r.result?.ood_report;
        return Boolean(hasPrediction(r) && report?.available===true && typeof report.is_ood==='boolean'
            && Number.isFinite(report.mahalanobis_distance) && report.mahalanobis_distance>=0
            && Number.isFinite(report.threshold) && report.threshold>0);
    }
    function matchesFilter(r, key) {
        if(key === 'unreviewed') return !r.reviewed;
        if(key === 'reviewed') return r.reviewed;
        if(key === 'flagged') return r.flagged;
        if(key === 'saved') return r.saved;
        if(key === 'unsaved') return dirty(r);
        if(['imageIssue','low','high','uncertain'].includes(key)) return outcome(r) === key;
        if(key === 'iqaWarning') return Boolean(r.result?.iqa_report && (r.result.iqa_report.quality_passed === false || r.result.iqa_report.has_quality_advisory === true));
        if(key === 'oodOutside') return validOodReport(r) && r.result.ood_report.is_ood === true;
        if(key === 'oodUnavailable') return hasPrediction(r) && !validOodReport(r);
        if(key === 'oodIssue') return matchesFilter(r,'oodOutside') || matchesFilter(r,'oodUnavailable');
        const set = r.result?.conformal_details?.conformal_set;
        if(key === 'conformalAmbiguous') return hasPrediction(r) && Array.isArray(set) && set.length > 1;
        if(key === 'conformalEmpty') return hasPrediction(r) && Array.isArray(set) && set.length === 0;
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
        for(const key of ['unreviewed','high','imageIssue','iqaWarning','oodIssue','conformalAmbiguous','conformalEmpty']) {
            const count=pool.reduce((n,r)=>n+Number(matchesFilter(r,key)),0);
            const b=button(key,()=>chooseFilter(key));b.classList.add('case-summary-button');b.dataset.filter=key;
            b.append(make('strong','',String(count)));b.setAttribute('aria-pressed',String(filter===key));summaryBox.append(b);
        }
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
        try {
            const saved=await storage('readonly',s=>s.getAll());
            for(const item of saved || []) {
                if(item.schemaVersion!==SCHEMA || typeof item.id!=='string' || !(item.image instanceof Blob) || !Number.isFinite(item.createdAt)) {announce('unknownVersion');continue;}
                if(!records.has(item.id)) records.set(item.id,{...item, state:item.state || 'complete', revision:0,savedRevision:0,saved:true,saving:false});
            }
        } catch(e) {announce('loadError');}
        finally {loadingArchives=false;renderList();}
    }
    async function saveActive() {
        const r=records.get(activeId); if(!r || r.saving || r.state==='processing') return;
        r.saving=true;renderDetailTools();
        const revision=r.revision;
        const snapshot={schemaVersion:SCHEMA,id:r.id,filename:r.filename,image:r.image,result:r.result,modelVersion:r.modelVersion,createdAt:r.createdAt,updatedAt:Date.now(),reviewed:r.reviewed,flagged:r.flagged,notes:r.notes,state:r.state};
        try {
            await storage('readwrite',s=>s.put(snapshot));
            r.saved=true;r.savedRevision=revision;announce('savedMessage');
        } catch(e) {announce('saveError');}
        finally {r.saving=false;renderList();renderDetailTools();}
    }
    async function removeCases(ids) {
        const cases=ids.map(id=>records.get(id)).filter(Boolean);
        if(!cases.length || cases.some(r=>r.state==='processing' || r.saving) || !window.confirm(t('deleteConfirm'))) return;
        try {
            if(cases.some(r=>r.saved)) await storage('readwrite',s=> {for(const r of cases) if(r.saved) s.delete(r.id);});
        } catch(e) {announce('deleteError');return;}
        for(const r of cases) {records.delete(r.id);selected.delete(r.id);}
        if(cases.some(r=>r.id===activeId)) closeDetail(false);
        announce('deleted');renderList();
    }
    function canLeave() { const r=records.get(activeId); return !r || !dirty(r) || window.confirm(t('leaveConfirm')); }
    function closeDetail(ask=true) {
        if(ask && !canLeave()) return false;
        const previousId=activeId;
        ++openVersion;activeId=null;document.body.classList.remove('case-detail-open');
        if(activeUrl) URL.revokeObjectURL(activeUrl);activeUrl=null;
        if(tools) tools.hidden=true;
        const processing=document.getElementById('processing-workspace');
        if(processing) processing.open=false;
        const previousButton=Array.from(document.querySelectorAll('.case-open')).find(el=>el.dataset.caseId===previousId);
        (previousButton || workspace)?.focus();
        return true;
    }
    function addFiles(files) {
        if(view!=='queue' && !canLeave())return;
        const now=Date.now();rejectedNames=[];
        for(const [i,file] of Array.from(files).entries()) {
            if(!/\.(png|jpe?g|webp)$/i.test(file.name)) {rejectedNames.push(file.name);continue;}
            const id=uid();
            records.set(id,{id,schemaVersion:SCHEMA,filename:file.name,image:file,result:null,state:'pending',createdAt:now+i,reviewed:false,flagged:false,notes:'',saved:false,revision:0,savedRevision:-1,modelVersion:modelVersion()});
        }
        if(rejectedNames.length) announce('unsupported');
        else if(message?.dataset.messageKey==='unsupported'){message.textContent='';delete message.dataset.messageKey;}
        view='queue';pageIndex=0;renderNav();renderList();
    }
    async function process() {
        if(running || (typeof isSubmitting!=='undefined' && isSubmitting) || (typeof isBatchRunning!=='undefined' && isBatchRunning)) return;
        const pending=Array.from(records.values()).filter(r=>r.state==='pending' || r.state==='cancelled');
        if(!pending.length) return;
        running=true;cancelled=false;renderList();
        for(const r of pending) {
            if(cancelled) {if(records.has(r.id)) {r.state='cancelled';r.revision++;}continue;}
            if(!records.has(r.id)) continue;
            r.state='processing';r.revision++;renderList();renderDetailTools();
            if(activeId===r.id) await showResult(r);
            try {
                const file=r.image instanceof File ? r.image : new File([r.image],r.filename,{type:r.image.type});
                r.result=await processBatchItem(file);
                r.state=!r.result || r.result.triage_action==='ERROR_RUNTIME' ? 'failed' : 'complete';
            } catch(e) {r.result=null;r.state='failed';}
            r.revision++;
            renderList();
            if(activeId===r.id) await showResult(r);
        }
        running=false;renderList();renderDetailTools();
    }
    async function openCase(id) {
        if(id!==activeId && !canLeave()) return;
        const r=records.get(id);if(!r) return;
        const position=visibleRecords().findIndex(item=>item.id===id);if(position>=0)pageIndex=Math.floor(position/PAGE_SIZE);
        activeId=id;renderList();document.body.classList.add('case-detail-open');renderDetailTools();
        const p=document.getElementById('processing-workspace');if(p) p.open=true;
        if(typeof switchMode==='function') switchMode('single');
        const panel=document.getElementById('panel-single');if(panel) panel.dataset.caseDetail='true';
        await showResult(r);
        detailTitle?.focus({preventScroll:true});
        tools.scrollIntoView({block:'nearest',behavior:'auto'});
    }
    async function showResult(r) {
        const version=++openVersion;
        if(activeUrl) URL.revokeObjectURL(activeUrl);
        activeUrl=URL.createObjectURL(r.image);
        const source=activeUrl;
        // Invalidate legacy in-flight single-image renders before selecting another case.
        if(typeof singleSelectionVersion!=='undefined') ++singleSelectionVersion;
        if(typeof selectedFile!=='undefined') selectedFile=null;
        if(r.id!==activeId || version!==openVersion) return;
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
        if(!r.result) return {IQA:'noResult',OOD:'noResult',Conformal:'noResult'};
        const iqa=r.result.iqa_report;
        const IQA=!iqa || typeof iqa.quality_passed!=='boolean' ? 'unavailable'
            : matchesFilter(r,'iqaWarning') ? 'qualityWarning' : 'passed';
        const report=r.result.ood_report;
        const validOod=validOodReport(r);
        const OOD=!validOod ? 'unavailable' : report.is_ood ? 'outside' : 'within';
        const set=r.result.conformal_details?.conformal_set;
        const Conformal=!hasPrediction(r) || !Array.isArray(set) ? 'unavailable'
            : set.length===0 ? 'emptySet' : set.length===1 ? 'singleton' : 'multiple';
        return {IQA,OOD,Conformal};
    }
    function changeActive(key,value) {const r=records.get(activeId);if(!r)return;r[key]=value;r.revision++;renderList();renderDetailTools();}
    function renderDetailTools() {
        if(!tools) return;
        const r=records.get(activeId); tools.hidden=!r || view==='guide';if(!r)return;
        const focused=document.activeElement===note;
        if(focused) return; // typing must not replace the focused textarea
        tools.replaceChildren();
        const header=make('div','case-detail-header');
        detailTitle=make('h2','',r.filename);detailTitle.tabIndex=-1;header.append(detailTitle,button('back',()=>closeDetail()));tools.append(header);
        const state=make('p','case-meta',`${r.id} · ${t(r.reviewed?'reviewed':'unreviewed')} · ${t(dirty(r)?'changed':'saved')}`);tools.append(state);
        const mechanisms=make('div','case-mechanisms');
        for(const [name,value] of Object.entries(mechanismStates(r))) {
            const badge=make('div','case-mechanism');badge.dataset.mechanism=name;
            badge.append(make('span','case-mechanism-label',name),make('strong','case-mechanism-value',t(value)));mechanisms.append(badge);
        }
        tools.append(mechanisms);
        const label=make('label','case-label',t('notes'));label.htmlFor='case-notes';
        note=make('textarea','case-notes');note.id='case-notes';note.value=r.notes;note.placeholder=t('notePlaceholder');note.rows=3;
        note.addEventListener('input',()=> {r.notes=note.value;r.revision++;const printable=tools.querySelector('.case-print-notes');if(printable)printable.textContent=r.notes;state.textContent=`${r.id} · ${t(r.reviewed?'reviewed':'unreviewed')} · ${t('changed')}`;renderList();});
        const printNote=make('p','case-print-notes',r.notes);printNote.hidden=true;tools.append(label,note,printNote);
        const actions=make('div','case-actions');
        const save=button(r.saving?'saving':'save',saveActive,'case-primary');save.disabled=r.saving || r.state==='processing';
        actions.append(save,button(r.flagged?'unflag':'flag',()=>changeActive('flagged',!r.flagged)),button(r.reviewed?'markUnreviewed':'markReviewed',()=>changeActive('reviewed',!r.reviewed)));
        actions.append(button('next',()=> {const rows=visibleRecords();const index=rows.findIndex(x=>x.id===activeId);const next=rows[index+1]||rows.find(x=>x.id!==activeId&&!x.reviewed);if(next)openCase(next.id);}));
        actions.append(button('print',()=>window.print()),button('remove',()=>removeCases([r.id])));
        const printModel=make('p','case-print-model',`${t('model')}: ${r.modelVersion}`);printModel.hidden=true;tools.append(printModel);
        const modelDetails=make('details','case-model-details');modelDetails.append(make('summary','',t('model')),make('p','case-hint',`${t('savedVersion')}: ${r.modelVersion}`));
        tools.append(actions,make('p','case-hint',t('dirtyHelp')),modelDetails);
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
        const done=counts.filter(r=>r.state==='complete'||r.state==='failed').length;
        if(progress) progress.textContent=running ? `${t('progress')}: ${done}/${counts.length}` : `${t('count')}: ${rows.length}${selected.size ? ' · '+t('selected')+': '+selected.size : ''}`;
        const processBtn=document.getElementById('case-process');
        if(processBtn) processBtn.disabled=running || !counts.some(r=>r.state==='pending'||r.state==='cancelled');
        const cancelBtn=document.getElementById('case-cancel');if(cancelBtn) {cancelBtn.hidden=!running;cancelBtn.disabled=cancelled;}
        const deleteBtn=document.getElementById('case-delete');if(deleteBtn) deleteBtn.disabled=!selected.size || counts.some(r=>selected.has(r.id)&&(r.state==='processing'||r.saving));
        const exportButton=document.getElementById('case-export');if(exportButton)exportButton.disabled=!rows.length&&!selected.size;
        if(!rows.length) {list.append(make('h3','',t('empty')),make('p','case-hint',t('emptyHelp')));return;}
        for(const r of pageRows) {
            const row=make('article',`case-row${activeId===r.id?' is-active':''}`);
            const check=make('input');check.dataset.caseId=r.id;check.type='checkbox';check.checked=selected.has(r.id);check.setAttribute('aria-label',`${t('selected')}: ${r.filename}`);
            check.addEventListener('change',()=> {if(check.checked)selected.add(r.id);else selected.delete(r.id);renderList();Array.from(list.querySelectorAll('input[type=checkbox]')).find(el=>el.dataset.caseId===r.id)?.focus();});
            const body=make('div','case-row-content');
            const title=button('open',()=>openCase(r.id),'case-open');title.textContent=r.filename;title.dataset.caseId=r.id;
            const meta=make('p','case-meta',`${new Date(r.createdAt).toLocaleString(language==='en'?'en-GB':'id-ID')} · ${t(r.state)} · ${t(r.reviewed?'reviewed':'unreviewed')}`);
            const summary=make('p','case-result',`${r.flagged?'★ ':''}${t(outcome(r))}${r.saved ? ` · ${t('saved')}`:''}${r.saved&&dirty(r)?` · ${t('changed')}`:''}`);
            body.append(title,meta,summary);
            const issueKeys=['iqaWarning','oodOutside','oodUnavailable','conformalAmbiguous','conformalEmpty'].filter(key=>matchesFilter(r,key));
            if(issueKeys.length) body.append(make('p','case-row-issues',issueKeys.map(t).join(' · ')));
            row.append(check,body);list.append(row);
        }
    }
    function csv(value) {let s=value==null?'':String(value);if(/^[\s]*[=+\-@]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';}
    function exportCases() {
        const data=selected.size ? Array.from(records.values()).filter(r=>selected.has(r.id)) : visibleRecords();
        if(!data.length)return;
        const headers=['detail','filename','date','status','review','flagged','saved','score','result','notes','model'];
        const lines=[headers.map(k=>csv(t(k))).join(',')];
        for(const r of data) lines.push([r.id,r.filename,new Date(r.createdAt).toISOString(),t(r.state),t(r.reviewed?'reviewed':'unreviewed'),r.flagged,r.saved,r.result?.probability_tb,t(outcome(r)),r.notes,r.modelVersion].map(csv).join(','));
        const url=URL.createObjectURL(new Blob(['\uFEFF'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'}));
        const a=make('a');a.href=url;a.download='tb-cases.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }
    function renderNav() {
        for(const el of document.querySelectorAll('[data-case-view]')) {el.classList.toggle('active',el.dataset.caseView===view);el.setAttribute('aria-current',el.dataset.caseView===view?'page':'false');}
        if(workspace)workspace.hidden=view==='guide';if(guide)guide.hidden=view!=='guide';if(tools)tools.hidden=!activeId||view==='guide';
        const p=document.getElementById('processing-workspace');if(p)p.open=Boolean(activeId&&view!=='guide');
        document.body.classList.toggle('case-detail-open',Boolean(activeId&&view!=='guide'));
    }
    function setView(next) {if(next===view)return;if(!canLeave())return;view=next;pageIndex=0;renderNav();renderList();}
    function selectControl(label,options,value,onChange) {
        const wrap=make('label','case-control',t(label));const el=make('select');if(label==='filter')el.id='case-filter';
        for(const key of options){const o=make('option','',t(key));o.value=key;el.append(o);}el.value=value;el.addEventListener('change',()=>onChange(el.value));wrap.append(el);return wrap;
    }
    function build() {
        if(!workspace)return;
        const focusId=document.activeElement?.id;const start=document.activeElement?.selectionStart;const messageKey=message?.dataset.messageKey;
        workspace.replaceChildren();
        const toolbar=make('div','case-toolbar');
        const upload=make('input');upload.type='file';upload.multiple=true;upload.accept='.png,.jpg,.jpeg,.webp';upload.hidden=true;upload.id='case-files';upload.addEventListener('change',()=> {addFiles(upload.files);upload.value='';});
        toolbar.append(upload,button('add',()=>upload.click(),'case-primary'));
        const go=button('process',process);go.id='case-process';const cancel=button('cancel',()=> {cancelled=true;renderList();});cancel.id='case-cancel';cancel.title=t('cancelHelp');
        const del=button('remove',()=>removeCases([...selected]));del.id='case-delete';const exportButton=button('export',exportCases);exportButton.id='case-export';toolbar.append(go,cancel,exportButton,del);
        workspace.append(toolbar);
        const controls=make('div','case-filters');
        const searchLabel=make('label','case-control',t('search'));const input=make('input');input.id='case-search';input.type='search';input.placeholder=t('search');input.value=query;input.addEventListener('input',()=> {query=input.value;pageIndex=0;renderList();});searchLabel.append(input);controls.append(searchLabel);
        controls.append(selectControl('filter',['all','unreviewed','reviewed','flagged','saved','unsaved','imageIssue','iqaWarning','oodOutside','oodUnavailable','oodIssue','conformalAmbiguous','conformalEmpty','low','high','uncertain'],filter,chooseFilter),selectControl('sort',['defaultSort','oldest','newest','flagSort'],sort,value=>{sort=value;pageIndex=0;renderList();}));
        workspace.append(controls,make('p','case-hint',t('orderHelp')));
        summaryBox=make('div','case-summary');summaryBox.setAttribute('aria-label',t('summary'));workspace.append(summaryBox,make('p','case-hint',t('summaryHelp')));
        filterReason=make('p','case-filter-reason');workspace.append(filterReason);
        progress=make('p','case-progress');progress.setAttribute('role','status');progress.setAttribute('aria-live','polite');workspace.append(progress);
        message=make('p','case-message');message.setAttribute('role','status');message.setAttribute('aria-live','polite');workspace.append(message);if(messageKey)announce(messageKey);
        list=make('div','case-list');pager=make('nav','case-pagination');pager.setAttribute('aria-label',t('page'));workspace.append(pager,list,make('p','case-storage',t('storage')));
        workspace.ondragover=e=> {e.preventDefault();};workspace.ondrop=e=>{e.preventDefault();addFiles(e.dataTransfer.files);};
        guide.replaceChildren(make('h2','',t('guide')),make('p','',t('steps')),make('p','',t('limits')),make('p','',t('storage')),make('p','',t('storedNote')));
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
        const r=records.get(activeId);if(r&&view!=='guide')showResult(r);
    }
    function init() {
        workspace=document.getElementById('case-workspace');tools=document.getElementById('case-detail-tools');guide=document.getElementById('case-guide');
        if(!workspace||!tools||!guide)return;
        for(const el of document.querySelectorAll('[data-case-view]'))el.addEventListener('click',()=>setView(el.dataset.caseView));
        build();loadArchives();
        const p=document.getElementById('processing-workspace');if(p)p.open=false;
    }
    window.caseWorkspace={setLanguage,addFiles,open:openCase,process,save:saveActive,remove:removeCases,export:exportCases,setView,get state(){return {records:Array.from(records.values()),activeId,view,running,loadingArchives,pageIndex,pageSize:PAGE_SIZE,filter,sort};}};
    window.addEventListener('tb-language-change',e=>setLanguage(e.detail?.language||e.detail?.lang||'id'));
    window.addEventListener('beforeunload',e=> {if(Array.from(records.values()).some(r=>dirty(r))){e.preventDefault();e.returnValue='';}});
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
