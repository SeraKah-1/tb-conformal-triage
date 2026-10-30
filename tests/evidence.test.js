const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../tb_pwa_offline_workstation/static/js/evidence.js'),'utf8'),context);
const api=context.window.caseEvidence;
const plain=x=>JSON.parse(JSON.stringify(x));
const fixture=(p=.03,set=['Normal'],overrides={})=>({probability_tb:p,probability_normal:1-p,triage_action:'REFER_AMBIGUOUS_TO_DOCTOR',iqa_report:{quality_passed:true,has_quality_advisory:false},ood_report:{available:true,is_ood:false,mahalanobis_distance:1,threshold:3,reference_status:'verified'},conformal_details:{conformal_set:set},allow_autonomous_release:false,...overrides});
test('high raw score remains high with an outside-reference compatibility referral',()=>{
 const input=fixture(.933,['Tuberculosis'],{ood_report:{available:true,is_ood:true,mahalanobis_distance:4,threshold:3,reference_status:'legacy_unverified'}});const before=JSON.stringify(input);const value=api.derive(input);
 assert.equal(value.score_band,'high');assert.equal(value.score_tb,.933);assert.equal(value.ood_state,'outside');assert.ok(value.review_reasons.includes('ood_outside'));assert.ok(value.review_reasons.includes('ood_reference_unverified'));assert.ok(!value.review_reasons.includes('conformal_multiple'));assert.equal(JSON.stringify(input),before);assert.equal(value.review_required,true);assert.equal(value.allow_autonomous_release,false);
});
test('singleton TB intermediate is a policy reason, not conformal ambiguity',()=>{
 const value=api.derive(fixture(.4,['TB']));assert.equal(value.conformal_state,'singleton');assert.equal(value.score_band,'intermediate');assert.deepEqual(plain(value.review_reasons),['policy_intermediate']);
});
test('low singleton score stays visible with separate OOD review',()=>{
 const value=api.derive(fixture(.03,['Normal'],{ood_report:{available:true,is_ood:true,mahalanobis_distance:4,threshold:3,reference_status:'verified'}}));assert.equal(value.score_band,'low');assert.equal(value.review_required,true);assert.deepEqual(plain(value.review_reasons),['ood_outside']);
});
test('multiple and empty sets retain actual conformal reasons',()=>{
 const multiple=api.derive(fixture(.1,['Normal','TB']));assert.equal(multiple.conformal_state,'multiple');assert.ok(multiple.review_reasons.includes('conformal_multiple'));assert.ok(!multiple.review_reasons.includes('policy_intermediate'));
 const empty=api.derive(fixture(.3,[]));assert.equal(empty.conformal_state,'empty');assert.ok(empty.review_reasons.includes('conformal_empty'));assert.ok(!empty.review_reasons.includes('policy_intermediate'));
});
test('legacy reference qualification remains separate from available distance',()=>{
 const old=fixture();delete old.ood_report.reference_status;const value=api.derive(old);assert.equal(value.ood_state,'within');assert.equal(value.ood_reference_status,'legacy_unverified');assert.ok(value.review_reasons.includes('ood_reference_unverified'));assert.ok(!value.review_reasons.includes('ood_unavailable'));
});
test('inconsistent or malformed OOD measurements cannot claim within reference',()=>{
 for(const change of [{is_ood:true},{threshold:0},{mahalanobis_distance:NaN},{available:'true'},{is_ood:null}]){const f=fixture();Object.assign(f.ood_report,change);const value=api.derive(f);assert.equal(value.ood_state,'unavailable');assert.equal(value.evidence_unknown,true);assert.ok(value.review_reasons.includes('ood_unavailable'));}
});
test('missing or malformed score/set data remains unknown without a normal fallback',()=>{
 for(const score of [undefined,null,NaN,Infinity,-.1,1.1,'0.03',false]){const input=fixture();input.probability_tb=score;const value=api.derive(input);assert.equal(value.score_available,false);assert.equal(value.score_band,'unknown');assert.equal(value.evidence_unknown,true);}
 for(const set of [undefined,null,['Healthy'],['Normal','non_tb'],['TB','TB'],[1]]){const input=fixture();input.conformal_details.conformal_set=set;const value=api.derive(input);assert.equal(value.conformal_state,'unavailable');assert.notEqual(value.score_band,'low');assert.equal(value.evidence_unknown,true);}
 const bad=api.derive(fixture(.03,['Normal'],{probability_normal:.8}));assert.equal(bad.score_available,false);
});
test('high score remains visible even when conformal data is unavailable',()=>{
 const value=api.derive(fixture(.9,null));assert.equal(value.score_band,'high');assert.equal(value.evidence_unknown,true);assert.ok(value.review_reasons.includes('conformal_unavailable'));
});
test('quality advisories stay separate and do not erase the score',()=>{
 const value=api.derive(fixture(.9,['TB'],{iqa_report:{quality_passed:true,has_quality_advisory:true,warnings:['compression']}}));assert.equal(value.score_band,'high');assert.equal(value.iqa_state,'advisory');assert.ok(value.review_reasons.includes('quality_advisory'));
 const old=api.derive(fixture(.9,['TB'],{iqa_report:{quality_passed:false,is_heavy_compression:true,warnings:['compression']}}));assert.equal(old.score_band,'high');assert.equal(old.iqa_state,'advisory');assert.ok(old.review_reasons.includes('quality_advisory'));assert.ok(!old.review_reasons.includes('quality_rejected'));
 const malformed=api.derive(fixture(.9,['TB'],{iqa_report:{quality_passed:true,warnings:'bad'}}));assert.equal(malformed.evidence_unknown,true);
 const unknown=api.derive(fixture(.9,['TB'],{iqa_report:null}));assert.equal(unknown.iqa_state,'unavailable');assert.equal(unknown.evidence_unknown,true);
});
test('technical rejections are not relabeled as conformal or OOD ambiguity',()=>{
 for(const action of ['ERROR_RUNTIME','REJECT_CORRUPT_IMAGE','REJECT_INVALID_ANATOMY_DOCUMENT']){const value=api.derive(fixture(.9,['TB'],{triage_action:action,iqa_report:{quality_passed:false}}));assert.equal(value.score_available,false);assert.equal(value.conformal_state,'not_applicable');assert.equal(value.ood_state,'not_applicable');assert.ok(!value.review_reasons.includes('conformal_multiple'));assert.ok(!value.review_reasons.includes('ood_unavailable'));}
});
test('all score boundaries preserve clinician review and short ID/EN reason labels',()=>{
 assert.equal(api.derive(fixture(.65,['TB'])).score_band,'high');assert.equal(api.derive(fixture(.2,['Normal'])).score_band,'intermediate');assert.equal(api.derive(fixture(.199999,['Normal'])).score_band,'low');
 for(let i=0;i<=100;i++){const value=api.derive(fixture(i/100,['TB']));assert.equal(value.review_required,true);assert.equal(value.allow_autonomous_release,false);for(const reason of value.review_reasons){assert.notEqual(api.label(reason,'en'),reason);assert.notEqual(api.label(reason,'id'),reason);}}
});
