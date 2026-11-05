/* Optional research-layer controls. Decode and blank-image guards remain mandatory. */
(() => {
    'use strict';
    const keys=['iqa','ood','conformal'],storageKey='tb_research_modules_v1';
    let state={iqa:true,ood:true,conformal:true};
    try{const value=JSON.parse(localStorage.getItem(storageKey)||'null');if(value&&typeof value==='object')for(const key of keys)if(typeof value[key]==='boolean')state[key]=value[key];}catch(_){}
    function snapshot(){return Object.freeze({iqa:state.iqa,ood:state.ood,conformal:state.conformal});}
    function enabled(key){if(!keys.includes(key))throw new TypeError('Unknown module');return state[key];}
    function set(key,value){if(!keys.includes(key)||typeof value!=='boolean')throw new TypeError('Invalid module setting');const focused=typeof document!=='undefined'?document.activeElement?.dataset?.module:null;state={...state,[key]:value};try{localStorage.setItem(storageKey,JSON.stringify(state));}catch(_){}render();if(focused)document.querySelector('[data-module="'+focused+'"]')?.focus();window.dispatchEvent?.(new CustomEvent('tb-modules-change',{detail:snapshot()}));return snapshot();}
    function decorate(result,settings=snapshot()){
        if(!result||typeof result!=='object'||Array.isArray(result))throw new TypeError('Result object required');
        const config={};for(const key of keys){if(typeof settings?.[key]!=='boolean')throw new TypeError('Module snapshot required');config[key]=settings[key];}
        const out={...result,module_configuration:Object.freeze(config),allow_autonomous_release:false,clinician_review_required:true};
        // Technical rejections/errors retain their original state and cannot gain a score.
        if(result.triage_action==='ERROR_RUNTIME'||String(result.triage_action||'').startsWith('REJECT_'))return out;
        if(!config.iqa)out.iqa_report={...result.iqa_report,available:false,disabled:true,quality_passed:null,has_quality_advisory:false,warnings:[],technical_guards_active:true};
        if(!config.ood)out.ood_report={available:false,disabled:true,is_ood:null,mahalanobis_distance:null,threshold:null,reference_status:'unavailable'};
        if(!config.conformal)out.conformal_details={...result.conformal_details,available:false,disabled:true,conformal_set:null,safety_interlock_engaged:true};
        if(keys.some(key=>!config[key]))out.triage_action='REFER_AMBIGUOUS_TO_DOCTOR';
        return out;
    }
    function render(){
        if(typeof document==='undefined')return;
        const host=document.getElementById('module-controls');if(!host)return;
        const en=document.documentElement.lang==='en';host.replaceChildren();host.classList.add('module-controls');
        const summary=document.getElementById('module-summary');
        if(summary){summary.replaceChildren();const status=document.createElement('span');status.textContent=keys.map(key=>(key==='conformal'?'Conformal':key.toUpperCase())+': '+(state[key]?(en?'On':'Aktif'):(en?'Off':'Nonaktif'))).join(' · ');summary.dataset.disabled=String(keys.some(key=>!state[key]));const open=document.createElement('button');open.type='button';open.className='btn-icon';open.textContent=en?'Settings':'Pengaturan';open.addEventListener('click',()=>window.caseSettings?.open());summary.append(status,open);}
        const title=document.createElement('strong');title.textContent=en?'Checks':'Pemeriksaan';host.append(title);
        const reference=document.createElement('p');reference.className='case-hint';reference.textContent=en?'Research model · OOD reference unverified':'Model penelitian · Referensi OOD belum terverifikasi';if(summary)summary.append(reference);
        for(const key of keys){const label=document.createElement('label');label.className='module-switch';label.dataset.enabled=String(state[key]);const input=document.createElement('input');input.type='checkbox';input.checked=state[key];input.dataset.module=key;input.setAttribute('role','switch');input.setAttribute('aria-label',key==='conformal'?'Conformal':key.toUpperCase());input.addEventListener('change',()=>set(key,input.checked));const name=document.createElement('span');name.textContent=key==='iqa'?(en?'Image quality':'Kualitas gambar'):key==='ood'?(en?'Reference check':'Cek referensi'):'Conformal';const status=document.createElement('span');status.className='module-status';status.textContent=state[key]?(en?'On':'Aktif'):(en?'Off':'Nonaktif');label.append(input,name,status);host.append(label);}
        const note=document.createElement('p');note.className='case-hint';note.textContent=keys.some(key=>!state[key])?(en?'Checks disabled. Results require review. Decode and blank-image guards stay active.':'Pemeriksaan dinonaktifkan. Hasil wajib ditinjau. Pemeriksaan berkas dan gambar kosong tetap aktif.'):(en?'Settings apply to the next process. Stored results keep their original settings.':'Pengaturan berlaku untuk proses berikutnya. Hasil tersimpan memakai pengaturan semula.');host.append(note);
    }
    window.moduleControls=Object.freeze({enabled,snapshot,set,decorate,render});
    if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();window.addEventListener('tb-language-change',render);}
})();
