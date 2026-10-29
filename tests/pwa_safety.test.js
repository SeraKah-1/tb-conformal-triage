// Real app functions in a VM, simulated DOM/ORT. Browser tests cover actual WASM separately.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { webcrypto } = require('node:crypto');
const app = fs.readFileSync(path.join(__dirname, '../tb_pwa_offline_workstation/static/js/app.js'), 'utf8');
function setup() {
 const elements = new Map();
 const element = id => {
  if (!elements.has(id)) elements.set(id, {style:{}, classList:{add(){},remove(){},toggle(){}},setAttribute(){},src:'',innerText:'',innerHTML:''});
  return elements.get(id);
 };
 const readers=[];
 const c = {I18N_DICT:{en:{},id:{}},navigator:{},window:{addEventListener(){},scrollTo(){}},document:{addEventListener(){},getElementById:element},console,performance,crypto:webcrypto,setTimeout,
 Image:class {complete=true;naturalWidth=512;naturalHeight=512;set src(v){this._src=v;if(this.onload)this.onload();}get src(){return this._src;}},
 FileReader:class {readAsDataURL(f){if(c.delayedReaders)readers.push(()=>this.onload({target:{result:'data:'+f.name}}));else this.onload({target:{result:'data:'+f.name}});}}};
 vm.createContext(c);vm.runInContext(app,c);
 vm.runInContext("setSliderMode=()=>{};currentLang='en';preprocessImageForONNX=()=>({});generateHeatmapDataUrl=()=>null;",c);
 return {c,element,readers};
}
function setRef(c, change='') {
 vm.runInContext(`OOD_REFERENCE_CALIBRATION={feature_dim:1024,mu_0:new Float32Array(1024),mu_1:new Float32Array(1024),std_inv:new Float32Array(1024).fill(1),threshold_diag:41.94};${change}`,c);
}
async function probe(c,p,opts={}) {
 c.testLogits=opts.logits || [0,Math.log(p/(1-p))*2.1161616];
 c.testLatents=opts.missing ? null : new Float32Array(1024).fill(opts.ood ? 100 : 0);
 vm.runInContext(`getOrtSession=async()=>({run:async()=>({logits:{data:testLogits},...(testLatents?{latents:{data:testLatents}}:{})}),outputNames:['logits','cam','latents']});`,c);
 c.testIqa=opts.iqa===undefined?{quality_passed:true}:opts.iqa;
 return vm.runInContext("runClientSideInference({name:'test.png'},{},testIqa)",c);
}
(async()=>{
 const {c}=setup();setRef(c);
 for (const [p,action] of [[.01,'ASSISTIVE_NORMAL_DOCTOR_VERIFY'],[.1,'REFER_AMBIGUOUS_TO_DOCTOR'],[.3,'REFER_AMBIGUOUS_TO_DOCTOR'],[.64,'REFER_AMBIGUOUS_TO_DOCTOR'],[.65001,'AUTO_FLAG_TB_URGENT'],[.99,'AUTO_FLAG_TB_URGENT']]) {
  const r=await probe(c,p);assert.equal(r.triage_action,action);assert.equal(r.allow_autonomous_release,false);assert.equal(r.logit_margin_tb_normal,c.testLogits[1]-c.testLogits[0]);assert.equal(r.conformal_details.safety_interlock_engaged,true);
 }
 for (const p of [.01,.99]) {
  let r=await probe(c,p,{missing:true});assert.equal(r.triage_action,'REFER_AMBIGUOUS_TO_DOCTOR');assert.equal(r.ood_report.available,false);assert.equal(r.ood_report.mahalanobis_distance,null);
  r=await probe(c,p,{ood:true});assert.equal(r.triage_action,'REFER_AMBIGUOUS_TO_DOCTOR');assert.equal(r.ood_report.is_ood,true);
  for(const iqa of [null,{}, {quality_passed:false},{quality_passed:true,has_quality_advisory:true}])assert.equal((await probe(c,p,{iqa})).triage_action,'REFER_AMBIGUOUS_TO_DOCTOR');
 }
 for (const broken of ["mu_1:new Float32Array(1)","std_inv:new Float32Array(1024)","threshold_diag:NaN","feature_dim:512","mu_0:new Float32Array(1024).fill(NaN)"]) {
  setRef(c,`Object.assign(OOD_REFERENCE_CALIBRATION,{${broken}});`);
  assert.equal((await probe(c,.01)).ood_report.available,false);
 }
 setRef(c);
 for(const logits of [[NaN,0],[0,Infinity],[0],[0,0,0]]) await assert.rejects(probe(c,.5,{logits}),/Invalid binary logits/);
 // Patient changes after model await must suppress stale render and stale identity.
 {
  const {c,element}=setup();let release; c.gate=new Promise(r=>release=r);c.rendered=[];
  vm.runInContext("setLoadingState=()=>{};evaluatePreAnalyticQuality=()=>({quality_passed:true});getOrtSession=()=>gate;runClientSideInference=async(f,img)=>({filename:f.name,analyzedImage:img.src});renderSingleResults=r=>rendered.push(r);handleSingleFile({name:'A.png',type:'image/png',size:10});",c);
  const pending=vm.runInContext('submitSingleTriage()',c);await new Promise(r=>setImmediate(r));
  vm.runInContext("handleSingleFile({name:'B.png',type:'image/png',size:10});",c);release();await pending;
  assert.equal(c.rendered.length,0);assert.equal(element('img-base').src,'data:B.png');
  vm.runInContext('getOrtSession=async()=>({});',c);await vm.runInContext('submitSingleTriage()',c);
  assert.equal(c.rendered.length,1);assert.equal(c.rendered[0].filename,'B.png');assert.equal(c.rendered[0].source_image,'data:B.png');
 }
 // Out-of-order preview readers cannot restore an old patient.
 {
  const {c,element,readers}=setup();c.delayedReaders=true;
  vm.runInContext("handleSingleFile({name:'A.png',type:'image/png',size:1});handleSingleFile({name:'B.png',type:'image/png',size:1});",c);
  readers[1]();readers[0]();assert.equal(element('img-base').src,'data:B.png');
  vm.runInContext('resetSingleTriage()',c);readers[1]();assert.equal(element('img-base').src,'');
 }
 // Runtime errors must never retain another patient's diagnostic evidence.
 {
  const {c,element}=setup();
  for(const id of ['val-prob-tb','val-prob-norm','met-set','met-action','met-ood','met-lat'])element(id).innerText='OLD PATIENT';
  vm.runInContext("renderRuntimeError('failed','data:B.png')",c);
  for(const id of ['val-prob-tb','val-prob-norm','met-set','met-lat'])assert.equal(element(id).innerText,'N/A');
  assert.equal(element('met-action').innerText,'ERROR_RUNTIME');assert.equal(element('met-ood').innerText,'UNAVAILABLE');assert.equal(element('img-base').src,'data:B.png');
 }
 assert.equal(vm.runInContext("escapeHtml('<img onerror=alert(1)>')",c),'&lt;img onerror=alert(1)&gt;');
 assert.equal(vm.runInContext(`csvCell('=1+1')`,c),`"'=1+1"`);
 assert.equal(vm.runInContext(`csvCell('a"b\\nc')`,c),'"a""b\nc"');
 c.csvProbe=await probe(c,.123456789);
 const exported=vm.runInContext('buildBatchCsv([csvProbe])',c);
 assert.ok(exported.includes('Logit_Margin_TB_Normal'));
 assert.ok(exported.includes(String(c.csvProbe.logit_margin_tb_normal)));
 assert.ok(exported.includes(String(c.csvProbe.probability_tb)));
 assert.notEqual(c.csvProbe.probability_tb,Number(c.csvProbe.probability_tb.toFixed(4)));
 const model=fs.readFileSync(path.join(__dirname,'../tb_pwa_offline_workstation/models/tb_conformal_distilled_v11_cam.onnx'));
 c.modelBuffer=model.buffer.slice(model.byteOffset,model.byteOffset+model.byteLength);
 await vm.runInContext('verifyModelBuffer(modelBuffer)',c);
 c.modelBuffer=new Uint8Array([1,2,3]).buffer;await assert.rejects(vm.runInContext('verifyModelBuffer(modelBuffer)',c),/SHA-256 mismatch/);
 console.log('PASS: assistive policy, OOD unavailable/malformed/OOD, IQA gates, invalid logits, patient/reader races, HTML/CSV, real model SHA256.');
})().catch(e=>{console.error(e);process.exit(1);});
