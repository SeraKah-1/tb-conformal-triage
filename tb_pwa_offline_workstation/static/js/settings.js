/* Device settings and local archive actions. No server or account synchronization. */
(() => {
    'use strict';
    const words={
        en:{settings:'Settings',close:'Close',storage:'Storage',model:'Model',offline:'Offline',backup:'Backup',restore:'Restore',backupHelp:'Backup contains saved images, results and notes. Unsaved edits are excluded. Select fewer cases if the file would exceed 64 MiB or 500 cases.',restoreHelp:'Restore adds valid cases and skips existing IDs. It does not overwrite existing cases or run the model.',saveFirst:'Save the selected cases and pending edits before backup.',estimateUnavailable:'Unavailable',archiveWorking:'Working…',archiveBackupDone:'Backup downloaded.',archiveRestoreDone:'Restore completed.',archiveBusy:'An archive operation is already running.',archiveTooLarge:'Archive too large. Select fewer cases; limits are 64 MiB per file, 16 MiB per image and 500 cases.',archiveEmpty:'No saved cases.',archiveInvalid:'Invalid archive. Existing cases were not changed.',archiveVersion:'Unsupported archive version. Existing cases were not changed.',archiveStorage:'Storage operation failed. Existing cases were not overwritten.',archiveImage:'An image is unreadable. Select cases with valid PNG, JPEG or WebP images.',archiveHash:'Image checksum mismatch. Existing cases were not changed.',archiveUnsupported:'Unsupported image format.',archiveUnsaved:'Some selected cases are not saved. Save them first.',selected:'Selected',added:'Added',skipped:'Skipped',modelHash:'Model hash'},
        id:{settings:'Pengaturan',close:'Tutup',storage:'Penyimpanan',model:'Model',offline:'Offline',backup:'Backup',restore:'Pulihkan',backupHelp:'Backup berisi gambar, hasil, dan catatan tersimpan. Perubahan belum disimpan tidak ikut. Pilih lebih sedikit kasus jika melebihi 64 MiB atau 500 kasus.',restoreHelp:'Pulihkan menambahkan kasus valid dan melewati ID yang sudah ada. Kasus lama tidak ditimpa dan model tidak dijalankan.',saveFirst:'Simpan kasus terpilih dan perubahan catatan sebelum backup.',estimateUnavailable:'Tidak tersedia',archiveWorking:'Memproses…',archiveBackupDone:'Backup diunduh.',archiveRestoreDone:'Pemulihan selesai.',archiveBusy:'Proses arsip masih berjalan.',archiveTooLarge:'Arsip terlalu besar. Pilih lebih sedikit kasus; batas 64 MiB per berkas, 16 MiB per gambar, dan 500 kasus.',archiveEmpty:'Belum ada kasus tersimpan.',archiveInvalid:'Arsip tidak valid. Kasus lama tidak diubah.',archiveVersion:'Versi arsip tidak didukung. Kasus lama tidak diubah.',archiveStorage:'Penyimpanan gagal. Kasus lama tidak ditimpa.',archiveImage:'Gambar tidak terbaca. Pilih kasus dengan PNG, JPEG, atau WebP yang valid.',archiveHash:'Checksum gambar tidak cocok. Kasus lama tidak diubah.',archiveUnsupported:'Format gambar tidak didukung.',archiveUnsaved:'Sebagian kasus terpilih belum disimpan. Simpan terlebih dahulu.',selected:'Dipilih',added:'Ditambahkan',skipped:'Dilewati',modelHash:'Hash model'}
    };
    let dialog,live,language=typeof currentLang==='string'?currentLang:'id',messageKey='',counts=null,busy=false;
    const t=key=>words[language][key]||words[language].archiveInvalid;
    function message(key,details=null){messageKey=key;counts=details;renderMessage();}
    function renderMessage(){if(!live)return;live.textContent=messageKey?t(messageKey):'';if(counts&&messageKey==='archiveRestoreDone')live.textContent+=` ${t('added')}: ${counts.added}; ${t('skipped')}: ${counts.skipped}.`;}
    function translate(){document.querySelectorAll('[data-settings-label]').forEach(e=>e.textContent=t('settings'));if(!dialog)return;dialog.querySelectorAll('[data-setting-key]').forEach(e=>e.textContent=t(e.dataset.settingKey));renderMessage();}
    async function refresh(){
        if(!dialog)return;
        const offline=document.getElementById('settings-offline');if(typeof initSystemStatus==='function')await initSystemStatus();offline.textContent=document.getElementById('txt-status')?.textContent||t('estimateUnavailable');
        document.getElementById('settings-model').textContent='DenseNet-121 · v11';
        document.getElementById('settings-model-hash').textContent=typeof MODEL_SHA256==='string'?MODEL_SHA256:t('estimateUnavailable');
        const storage=document.getElementById('settings-storage');storage.textContent=t('estimateUnavailable');
        try{if(navigator.storage?.estimate){const estimate=await navigator.storage.estimate();if(Number.isFinite(estimate.usage)&&Number.isFinite(estimate.quota))storage.textContent=`${(estimate.usage/1048576).toFixed(1)} / ${(estimate.quota/1048576).toFixed(0)} MiB`;}}catch(_){}
    }
    function open(){if(!dialog)return;if(!dialog.open)dialog.showModal();translate();refresh();}
    function close(){dialog?.close();document.getElementById('btn-settings')?.focus();}
    function disable(value){busy=value;for(const id of ['settings-backup','settings-restore']){const el=document.getElementById(id);if(el)el.disabled=value;}}
    async function backup(){
        open();if(busy)return;const state=window.caseWorkspace?.state;const ids=state?.selectedIds?.length?[...state.selectedIds]:undefined;
        const candidates=(state?.records||[]).filter(r=>ids?ids.includes(r.id):r.saved);
        if(candidates.some(r=>!r.saved||r.revision!==r.savedRevision)){message('saveFirst');return;}
        disable(true);try{await window.caseArchive.backup(ids);}catch(e){message(e.code||'archiveStorage');}finally{disable(false);refresh();}
    }
    function restore(){open();if(!busy)document.getElementById('settings-restore-file')?.click();}
    function init(){
        dialog=document.createElement('dialog');dialog.id='settings-dialog';dialog.setAttribute('aria-labelledby','settings-title');
        dialog.innerHTML='<div class="settings-header"><h2 id="settings-title" data-setting-key="settings"></h2><button id="settings-close" type="button" data-setting-key="close"></button></div><dl class="settings-facts"><dt data-setting-key="storage"></dt><dd id="settings-storage"></dd><dt data-setting-key="model"></dt><dd id="settings-model"></dd><dt data-setting-key="offline"></dt><dd id="settings-offline"></dd></dl><details><summary data-setting-key="modelHash"></summary><p id="settings-model-hash" class="case-hint"></p></details><p class="case-hint" data-setting-key="backupHelp"></p><div class="case-actions"><button id="settings-backup" type="button" data-setting-key="backup"></button><button id="settings-restore" type="button" data-setting-key="restore"></button></div><input id="settings-restore-file" type="file" accept="application/json,.json" hidden><p class="case-hint" data-setting-key="restoreHelp"></p><p id="settings-status" role="status" aria-live="polite"></p>';
        document.body.append(dialog);live=document.getElementById('settings-status');
        document.getElementById('settings-close').addEventListener('click',close);document.getElementById('settings-backup').addEventListener('click',backup);document.getElementById('settings-restore').addEventListener('click',restore);
        document.getElementById('settings-restore-file').addEventListener('change',async e=>{const file=e.target.files[0];e.target.value='';if(!file||busy)return;disable(true);try{await window.caseArchive.restore(file);}catch(error){message(error.code||'archiveStorage');}finally{disable(false);refresh();}});
        translate();
    }
    window.addEventListener('tb-language-change',e=>{language=e.detail?.language==='en'?'en':'id';translate();if(dialog?.open)refresh();});
    window.addEventListener('tb-archive-status',e=>message(e.detail.key,e.detail.counts));
    window.addEventListener('tb-archive-restored',async()=>{await window.caseWorkspace?.refreshArchives();refresh();});
    window.caseSettings={open,close,backup,restore};
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
