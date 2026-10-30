/* Read-only evidence projection. Scores, prediction sets, quality and reference checks
   remain separate from the legacy compatibility action. No clinical clearance. */
(() => {
    'use strict';
    const labels={
        en:{quality_advisory:'Quality warning',quality_rejected:'Image rejected',iqa_unavailable:'IQA unavailable',ood_outside:'Outside reference',ood_unavailable:'OOD unavailable',ood_reference_unverified:'Unverified reference',conformal_multiple:'Multiple labels',conformal_empty:'Empty set',conformal_unavailable:'Conformal unavailable',policy_intermediate:'Intermediate score',evidence_unknown:'Unknown evidence',input_unreadable:'Decode failure',processing_failure:'Processing failure',input_rejected:'Input rejected',review_required:'Review required',no_reason:'Clinician review remains required. A non-TB score does not establish healthy lungs.'},
        id:{quality_advisory:'Peringatan kualitas',quality_rejected:'Gambar ditolak',iqa_unavailable:'IQA tidak tersedia',ood_outside:'Luar referensi',ood_unavailable:'Tanpa OOD',ood_reference_unverified:'Referensi legacy',conformal_multiple:'Label ganda',conformal_empty:'Set kosong',conformal_unavailable:'Conformal tidak tersedia',policy_intermediate:'Skor intermediate',evidence_unknown:'Bukti tidak lengkap',input_unreadable:'Gagal dibaca',processing_failure:'Proses gagal',input_rejected:'Input ditolak',review_required:'Wajib ditinjau',no_reason:'Review tenaga medis tetap wajib. Skor non-TB tidak memastikan paru sehat.'}
    };
    const label=(key,language='id')=>(labels[language==='en'?'en':'id'][key]||key);
    const finiteProbability=value=>typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=1;
    const object=value=>Boolean(value&&typeof value==='object'&&!Array.isArray(value));
    function canonicalSet(value){
        if(!Array.isArray(value)||value.length>2)return null;
        const known={Normal:'non_tb','Non-TB':'non_tb',non_tb:'non_tb',Tuberculosis:'tb',TB:'tb'};
        const result=[];
        for(const item of value){if(typeof item!=='string'||!Object.hasOwn(known,item)||result.includes(known[item]))return null;result.push(known[item]);}
        return result;
    }
    function derive(result){
        const output={schema_version:1,score_available:false,score_tb:null,score_band:'unknown',canonical_set:null,conformal_state:'unavailable',ood_state:'unavailable',ood_reference_status:'unavailable',iqa_state:'unavailable',review_reasons:[],review_required:true,evidence_unknown:false,allow_autonomous_release:false};
        const add=reason=>{if(!output.review_reasons.includes(reason))output.review_reasons.push(reason);};
        const unknown=()=>{output.evidence_unknown=true;add('evidence_unknown');};
        if(!object(result)){unknown();return output;}
        const action=typeof result.triage_action==='string'?result.triage_action:'';
        if(action==='ERROR_RUNTIME'||action.startsWith('REJECT_')){
            output.ood_state='not_applicable';output.conformal_state='not_applicable';
            output.iqa_state=result.iqa_report?.quality_passed===false?'rejected':'unavailable';
            add(action==='ERROR_RUNTIME'?'processing_failure':action==='REJECT_CORRUPT_IMAGE'?'input_unreadable':output.iqa_state==='rejected'?'quality_rejected':'input_rejected');
            return output;
        }
        const p=result.probability_tb,normal=result.probability_normal;
        const normalConsistent=normal===undefined||(finiteProbability(normal)&&finiteProbability(p)&&Math.abs(p+normal-1)<=1e-5);
        output.score_available=finiteProbability(p)&&normalConsistent;
        if(output.score_available)output.score_tb=p;else unknown();
        const iqa=result.iqa_report;
        if(!object(iqa)||typeof iqa.quality_passed!=='boolean'||(iqa.has_quality_advisory!==undefined&&typeof iqa.has_quality_advisory!=='boolean')||(iqa.warnings!==undefined&&(!Array.isArray(iqa.warnings)||!iqa.warnings.every(value=>typeof value==='string')))){add('iqa_unavailable');unknown();}
        else if(!iqa.quality_passed){output.iqa_state='advisory';add('quality_advisory');}
        else if(iqa.has_quality_advisory===true){output.iqa_state='advisory';add('quality_advisory');}
        else output.iqa_state='passed';
        const set=canonicalSet(result.conformal_details?.conformal_set);
        if(!output.score_available||set===null){add('conformal_unavailable');unknown();}
        else{
            output.canonical_set=set;
            output.conformal_state=set.length===0?'empty':set.length===1?'singleton':'multiple';
            if(set.length===0)add('conformal_empty');else if(set.length>1)add('conformal_multiple');
        }
        const ood=result.ood_report;
        const distanceValid=object(ood)&&ood.available===true&&typeof ood.is_ood==='boolean'&&typeof ood.mahalanobis_distance==='number'&&Number.isFinite(ood.mahalanobis_distance)&&ood.mahalanobis_distance>=0&&typeof ood.threshold==='number'&&Number.isFinite(ood.threshold)&&ood.threshold>0&&ood.is_ood===(ood.mahalanobis_distance>ood.threshold);
        if(!output.score_available||!distanceValid){add('ood_unavailable');unknown();}
        else{
            output.ood_state=ood.is_ood?'outside':'within';
            const reference=ood.reference_status===undefined?'legacy_unverified':ood.reference_status;
            output.ood_reference_status=['verified','legacy_unverified','unavailable'].includes(reference)?reference:'unavailable';
            if(ood.is_ood)add('ood_outside');
            if(output.ood_reference_status!=='verified')add('ood_reference_unverified');
            if(output.ood_reference_status==='unavailable')unknown();
        }
        // A high raw score remains visible even if quality/reference checks require review.
        if(output.score_available){
            if(p>=.65)output.score_band='high';
            else if(set?.length===1&&set[0]==='non_tb'&&p<.20)output.score_band='low';
            else if(set!==null){output.score_band='intermediate';if(set.length===1)add('policy_intermediate');}
        }
        return output;
    }
    function renderReasons(container,result,language='id'){
        if(!container)return derive(result);
        const evidence=derive(result);container.replaceChildren();
        const title=document.createElement('strong');title.textContent=label('review_required',language);container.append(title);
        if(evidence.review_reasons.length){
            const list=document.createElement('ul');list.className='case-evidence-reasons';
            for(const reason of evidence.review_reasons){const item=document.createElement('li');item.dataset.reviewReason=reason;item.textContent=label(reason,language);list.append(item);}
            container.append(list);
        }else{const note=document.createElement('p');note.className='case-hint';note.textContent=label('no_reason',language);container.append(note);}
        return evidence;
    }
    window.caseEvidence=Object.freeze({derive,label,labels,renderReasons});
})();
