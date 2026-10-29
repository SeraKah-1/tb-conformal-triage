/* Local archive interchange. No network, inference, or third-party dependencies. */
(() => {
    'use strict';
    const FORMAT = 'tb-case-backup-v1';
    const LIMITS = Object.freeze({fileBytes:64*1024*1024, decodedBytes:48*1024*1024, imageBytes:16*1024*1024, records:500, pixels:64*1024*1024, dimension:16384});
    const DB = 'tb_case_archive_v1', STORE = 'cases';
    const STATES = new Set(['pending','cancelled','complete','failed']);
    const LABELS = new Set(['Normal','Tuberculosis','TB']);
    const ACTIONS = new Set(['ASSISTIVE_NORMAL_DOCTOR_VERIFY','REFER_AMBIGUOUS_TO_DOCTOR','AUTO_FLAG_TB_URGENT','LEGACY_NORMAL_REQUIRES_REVIEW','PRESUMPTIVE_TB_DOCTOR_EVAL','ERROR_RUNTIME']);
    const META_KEYS = ['schemaVersion','id','filename','modelVersion','createdAt','updatedAt','reviewed','flagged','notes','state','result','resultGeneration','reviewedGeneration','importedAt'];
    let busy = false;
    class ArchiveError extends Error { constructor(code) { super(code); this.name='ArchiveError'; this.code=code; } }
    const fail = code => { throw new ArchiveError(code); };
    const plain = value => Boolean(value && typeof value==='object' && !Array.isArray(value) && (Object.getPrototypeOf(value)===Object.prototype || Object.getPrototypeOf(value)===null));
    function string(value,max=1000) { return typeof value==='string' && value.length>0 && value.length<=max && !/[\u0000-\u001f\u007f]/.test(value); }
    function finite(value) { return typeof value==='number' && Number.isFinite(value); }
    function safeJson(value,depth=0) {
        if(depth>24) fail('archiveInvalid');
        if(value===null || typeof value==='string' || typeof value==='boolean') return;
        if(typeof value==='number') {if(!Number.isFinite(value))fail('archiveInvalid');return;}
        if(Array.isArray(value)) {for(const item of value)safeJson(item,depth+1);return;}
        if(!plain(value))fail('archiveInvalid');
        for(const key of Object.keys(value)) {
            if(['__proto__','constructor','prototype'].includes(key))fail('archiveInvalid');
            safeJson(value[key],depth+1);
        }
    }
    function validateResult(result,state,filename) {
        if(result===null) {if(state==='complete')fail('archiveInvalid');return;}
        if(!plain(result))fail('archiveInvalid');safeJson(result);
        const action=result.triage_action;
        if(!string(action,100) || (!ACTIONS.has(action) && !/^REJECT_[A-Z0-9_]{1,80}$/.test(action)))fail('archiveInvalid');
        if(result.filename!==undefined && result.filename!==filename)fail('archiveInvalid');
        if(result.allow_autonomous_release!==undefined && result.allow_autonomous_release!==false)fail('archiveInvalid');
        if(result.source_image!==undefined && result.source_image!==null)fail('archiveInvalid');
        for(const key of ['hirescam_heatmap_base64','hirescam_overlay_url']) {
            const image=result[key];
            if(image!=null && (typeof image!=='string' || image.length>LIMITS.fileBytes || !/^(?:data:image\/png;base64,)?[A-Za-z0-9+/]*={0,2}$/.test(image)))fail('archiveInvalid');
        }
        const technical=action==='ERROR_RUNTIME'||action.startsWith('REJECT_');
        if(!plain(result.conformal_details)||!Array.isArray(result.conformal_details.conformal_set))fail('archiveInvalid');
        const set=result.conformal_details.conformal_set;
        if(set.length>2 || new Set(set).size!==set.length || set.some(label=>!LABELS.has(label)) || (set.includes('TB')&&set.includes('Tuberculosis')))fail('archiveInvalid');
        if(result.conformal_details.safety_interlock_engaged!==undefined && result.conformal_details.safety_interlock_engaged!==true)fail('archiveInvalid');
        if(technical) {
            if(result.probability_tb!==null || result.probability_normal!==null || set.length)fail('archiveInvalid');
        } else {
            if(!finite(result.probability_tb)||!finite(result.probability_normal)||result.probability_tb<0||result.probability_tb>1||result.probability_normal<0||result.probability_normal>1||Math.abs(result.probability_tb+result.probability_normal-1)>1e-6)fail('archiveInvalid');
        }
        if(state==='failed' && action!=='ERROR_RUNTIME')fail('archiveInvalid');
        if(state==='complete' && action==='ERROR_RUNTIME')fail('archiveInvalid');
        for(const key of ['inference_latency_ms','decision_threshold_used','logit_margin_tb_normal'])if(result[key]!==undefined&&result[key]!==null&&!finite(result[key]))fail('archiveInvalid');
        if(result.inference_latency_ms!=null&&result.inference_latency_ms<0)fail('archiveInvalid');
        if(result.iqa_report!==undefined&&result.iqa_report!==null) {
            if(!plain(result.iqa_report)||typeof result.iqa_report.quality_passed!=='boolean')fail('archiveInvalid');
            if(result.iqa_report.has_quality_advisory!==undefined&&typeof result.iqa_report.has_quality_advisory!=='boolean')fail('archiveInvalid');
        }
        const ood=result.ood_report;
        if(!plain(ood)||typeof ood.available!=='boolean')fail('archiveInvalid');
        if(ood.available) {
            if(!finite(ood.mahalanobis_distance)||ood.mahalanobis_distance<0||!finite(ood.threshold)||ood.threshold<=0||typeof ood.is_ood!=='boolean')fail('archiveInvalid');
            if(ood.is_ood!==(ood.mahalanobis_distance>ood.threshold))fail('archiveInvalid');
            for(const key of ['distance_to_normal','distance_to_tb'])if(ood[key]!==undefined&&(!finite(ood[key])||ood[key]<0))fail('archiveInvalid');
        } else if(ood.is_ood!==undefined&&ood.is_ood!==null)fail('archiveInvalid');
    }
    function validateMetadata(record) {
        if(!plain(record)||record.schemaVersion!==1)fail(record?.schemaVersion!==1?'archiveVersion':'archiveInvalid');
        if(!string(record.id,200)||!string(record.filename,1000)||!string(record.modelVersion,1000)||!finite(record.createdAt)||record.createdAt<0||!finite(record.updatedAt)||record.updatedAt<0||typeof record.reviewed!=='boolean'||typeof record.flagged!=='boolean'||typeof record.notes!=='string'||record.notes.length>1000000||!STATES.has(record.state))fail('archiveInvalid');
        if(record.reviewed && (record.state!=='complete'||!record.result))fail('archiveInvalid');
        for(const key of ['resultGeneration','reviewedGeneration'])if(record[key]!==undefined&&record[key]!==null&&(!Number.isSafeInteger(record[key])||record[key]<0))fail('archiveInvalid');
        if(record.reviewed&&record.resultGeneration!==undefined&&record.reviewedGeneration!==record.resultGeneration)fail('archiveInvalid');
        if(record.importedAt!==undefined&&(!finite(record.importedAt)||record.importedAt<0))fail('archiveInvalid');
        validateResult(record.result,record.state,record.filename);
        const metadata={};for(const key of META_KEYS)if(record[key]!==undefined)metadata[key]=record[key];
        safeJson(metadata);return metadata;
    }
    const ascii=(bytes,start,count)=>String.fromCharCode(...bytes.subarray(start,start+count));
    const be32=(b,p)=>(b[p]*0x1000000)+(b[p+1]<<16)+(b[p+2]<<8)+b[p+3];
    const le32=(b,p)=>b[p]+b[p+1]*256+b[p+2]*65536+b[p+3]*16777216;
    function imageHeader(bytes) {
        let mime,width,height;
        if(bytes.length>=33 && bytes[0]===137 && ascii(bytes,1,3)==='PNG' && bytes[4]===13&&bytes[5]===10&&bytes[6]===26&&bytes[7]===10) {
            mime='image/png';if(be32(bytes,8)!==13||ascii(bytes,12,4)!=='IHDR')fail('archiveImage');width=be32(bytes,16);height=be32(bytes,20);
            for(let pos=8;pos+12<=bytes.length;) {const length=be32(bytes,pos);if(length>bytes.length-pos-12)fail('archiveImage');if(ascii(bytes,pos+4,4)==='acTL')fail('archiveUnsupported');pos+=length+12;}
        } else if(bytes.length>=4&&bytes[0]===255&&bytes[1]===216) {
            mime='image/jpeg';let pos=2;
            while(pos+1<bytes.length) {
                if(bytes[pos++]!==255)fail('archiveImage');while(bytes[pos]===255)pos++;const marker=bytes[pos++];
                if(marker===0xda||marker===0xd9)break;
                if(marker===0x01||marker===0xd8||(marker>=0xd0&&marker<=0xd7))continue;
                if(pos+2>bytes.length)fail('archiveImage');const length=bytes[pos]*256+bytes[pos+1];if(length<2||pos+length>bytes.length)fail('archiveImage');
                if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)) {if(length<8)fail('archiveImage');height=bytes[pos+3]*256+bytes[pos+4];width=bytes[pos+5]*256+bytes[pos+6];break;}pos+=length;
            }
        } else if(bytes.length>=30&&ascii(bytes,0,4)==='RIFF'&&ascii(bytes,8,4)==='WEBP') {
            mime='image/webp';if(le32(bytes,4)+8!==bytes.length)fail('archiveImage');const kind=ascii(bytes,12,4);
            if(kind==='VP8X') {if(bytes[20]&2)fail('archiveUnsupported');width=1+bytes[24]+bytes[25]*256+bytes[26]*65536;height=1+bytes[27]+bytes[28]*256+bytes[29]*65536;}
            else if(kind==='VP8 '&&bytes[23]===157&&bytes[24]===1&&bytes[25]===42) {width=(bytes[26]+bytes[27]*256)&16383;height=(bytes[28]+bytes[29]*256)&16383;}
            else if(kind==='VP8L'&&bytes[20]===47) {width=1+bytes[21]+((bytes[22]&63)<<8);height=1+(bytes[22]>>6)+(bytes[23]<<2)+((bytes[24]&15)<<10);}
        }
        if(!mime||!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1)fail('archiveImage');
        if(width>LIMITS.dimension||height>LIMITS.dimension||width*height>LIMITS.pixels)fail('archiveTooLarge');
        return {mime,width,height};
    }
    async function decodeImage(blob,expected) {
        if(typeof createImageBitmap==='function') {
            let bitmap;
            try {bitmap=await createImageBitmap(blob);if(bitmap.width!==expected.width||bitmap.height!==expected.height)fail('archiveImage');}
            catch(error){if(error instanceof ArchiveError)throw error;fail('archiveImage');}
            finally {bitmap?.close();}
        } else {
            const url=URL.createObjectURL(blob);
            try {const image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=url;});if(image.naturalWidth!==expected.width||image.naturalHeight!==expected.height)fail('archiveImage');}
            catch(error){if(error instanceof ArchiveError)throw error;fail('archiveImage');}finally{URL.revokeObjectURL(url);}
        }
    }
    async function hash(bytes) {
        if(!globalThis.crypto?.subtle)fail('archiveUnsupported');
        const digest=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
    }
    function base64(bytes) {let out='';for(let i=0;i<bytes.length;i+=24576)out+=btoa(String.fromCharCode(...bytes.subarray(i,i+24576)));return out;}
    function unbase64(text) {
        if(typeof text!=='string'||!text.length||text.length%4||text.length>Math.ceil(LIMITS.imageBytes/3)*4||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(text))fail('archiveImage');
        let raw;try{raw=atob(text);}catch(_){fail('archiveImage');}const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));if(base64(bytes)!==text)fail('archiveImage');return bytes;
    }
    function openDatabase() {
        return new Promise((resolve,reject)=>{
            if(!window.indexedDB)return reject(new ArchiveError('archiveStorage'));
            let req;try{req=indexedDB.open(DB,1);}catch(_){reject(new ArchiveError('archiveStorage'));return;}
            req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:'id'});};
            req.onerror=req.onblocked=()=>reject(new ArchiveError('archiveStorage'));
            req.onsuccess=()=>{const db=req.result;db.onversionchange=()=>db.close();resolve(db);};
        });
    }
    async function snapshots(ids) {
        if(ids!==undefined&&(!Array.isArray(ids)||ids.length>LIMITS.records||new Set(ids).size!==ids.length||ids.some(id=>!string(id,200))))fail('archiveInvalid');
        if(ids?.length===0)fail('archiveEmpty');
        const db=await openDatabase();
        return new Promise((resolve,reject)=>{
            const records=[];let bytes=0,error;
            const tx=db.transaction(STORE,'readonly'),store=tx.objectStore(STORE);
            function collect(record) {
                if(!record){error=new ArchiveError('archiveUnsaved');tx.abort();return;}
                records.push(record);bytes+=record.image instanceof Blob?record.image.size:0;
                if(records.length>LIMITS.records||bytes>LIMITS.decodedBytes){error=new ArchiveError('archiveTooLarge');tx.abort();}
            }
            if(ids)for(const id of ids){const req=store.get(id);req.onsuccess=()=>collect(req.result);}
            else {const req=store.openCursor();req.onsuccess=()=>{const cursor=req.result;if(cursor){collect(cursor.value);if(!error)cursor.continue();}};}
            tx.oncomplete=()=>{db.close();resolve(records);};
            tx.onabort=tx.onerror=()=>{db.close();reject(error||new ArchiveError('archiveStorage'));};
        });
    }
    function status(kind,key,counts) {window.dispatchEvent(new CustomEvent('tb-archive-status',{detail:{kind,key,counts:counts||null}}));}
    async function operation(kind,fn) {
        if(busy){status(kind,'archiveBusy');fail('archiveBusy');}busy=true;status(kind,'archiveWorking');
        try{return await fn();}catch(error){const normalized=error instanceof ArchiveError?error:new ArchiveError('archiveStorage');status(kind,normalized.code);throw normalized;}finally{busy=false;}
    }
    async function backup(ids) {
        return operation('backup',async()=>{
            const records=await snapshots(ids);if(!records.length)fail('archiveEmpty');
            const exported=[];let decoded=0;
            for(const record of records) {
                const metadata=validateMetadata(record),image=record.image;
                if(!(image instanceof Blob)||image.size===0)fail('archiveImage');if(image.size>LIMITS.imageBytes)fail('archiveTooLarge');
                decoded+=image.size;if(decoded>LIMITS.decodedBytes)fail('archiveTooLarge');
                const bytes=new Uint8Array(await image.arrayBuffer()),header=imageHeader(bytes);
                if(image.type&&image.type!==header.mime)fail('archiveUnsupported');
                await decodeImage(new Blob([bytes],{type:header.mime}),header);
                exported.push({...metadata,image:{mime:header.mime,sha256:await hash(bytes),base64:base64(bytes)}});
            }
            const container={format:FORMAT,schemaVersion:1,createdAt:Date.now(),records:exported};
            const blob=new Blob([JSON.stringify(container)],{type:'application/json'});if(blob.size>LIMITS.fileBytes)fail('archiveTooLarge');
            const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`tb-case-backup-${new Date().toISOString().slice(0,10)}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
            const counts={total:exported.length,bytes:blob.size};status('backup','archiveBackupDone',counts);return counts;
        });
    }
    async function restore(file) {
        return operation('restore',async()=>{
            if(!(file instanceof Blob)||file.size===0)fail('archiveInvalid');if(file.size>LIMITS.fileBytes)fail('archiveTooLarge');
            let container;try{container=JSON.parse(await file.text());}catch(_){fail('archiveInvalid');}
            if(!plain(container)||container.format!==FORMAT||container.schemaVersion!==1)fail('archiveVersion');
            if(!finite(container.createdAt)||container.createdAt<0||!Array.isArray(container.records))fail('archiveInvalid');
            if(!container.records.length)fail('archiveEmpty');if(container.records.length>LIMITS.records)fail('archiveTooLarge');
            safeJson(container);
            const ids=new Set(),prepared=[];let decoded=0;const importedAt=Date.now();
            for(const record of container.records) {
                const metadata=validateMetadata(record);
                if(ids.has(metadata.id))fail('archiveInvalid');ids.add(metadata.id);
                if(!plain(record.image)||!['image/png','image/jpeg','image/webp'].includes(record.image.mime)||typeof record.image.sha256!=='string'||!/^[a-f0-9]{64}$/.test(record.image.sha256))fail('archiveImage');
                const bytes=unbase64(record.image.base64);decoded+=bytes.length;
                if(decoded>LIMITS.decodedBytes)fail('archiveTooLarge');
                if(await hash(bytes)!==record.image.sha256)fail('archiveHash');
                const header=imageHeader(bytes);if(header.mime!==record.image.mime)fail('archiveImage');
                const image=new Blob([bytes],{type:header.mime});await decodeImage(image,header);
                prepared.push({...metadata,image,importedAt});
            }
            const db=await openDatabase();
            const counts=await new Promise((resolve,reject)=>{
                let added=0,skipped=0;
                const tx=db.transaction(STORE,'readwrite'),store=tx.objectStore(STORE);
                for(const record of prepared) {
                    const req=store.get(record.id);
                    req.onsuccess=()=>{if(req.result!==undefined)skipped++;else{store.add(record);added++;}};
                }
                tx.oncomplete=()=>{db.close();resolve({added,skipped,total:prepared.length});};
                tx.onerror=tx.onabort=()=>{db.close();reject(new ArchiveError('archiveStorage'));};
            });
            status('restore','archiveRestoreDone',counts);
            window.dispatchEvent(new CustomEvent('tb-archive-restored',{detail:counts}));return counts;
        });
    }
    window.caseArchive=Object.freeze({backup,restore,limits:LIMITS,get busy(){return busy;}});
})();
