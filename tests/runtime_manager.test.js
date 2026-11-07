const {test}=require('node:test');const assert=require('node:assert/strict');
const R=require('../tb_pwa_offline_workstation/static/js/runtime_manager.js');
test('capability-driven threads with single fallback',()=>{assert.equal(R.threadsFor({isolated:true,threadAssets:true,cores:16}),4);assert.equal(R.threadsFor({isolated:false,threadAssets:true,cores:16}),1);assert.equal(R.threadsFor({isolated:true,threadAssets:false,cores:16}),1);assert.equal(R.threadsFor({isolated:true,threadAssets:true,cores:2}),1);});
test('responses are matched by id, stale responses ignored',async()=>{const w={postMessage(m){this.last=m},terminate(){}};const b=R.connect(w);const p=b.request('run',{},1000);w.onmessage({data:{id:99,value:'wrong'}});w.onmessage({data:{id:w.last.id,value:42}});assert.equal(await p,42);b.close();});
test('worker crash rejects work and future requests',async()=>{const w={postMessage(){},terminate(){this.killed=true}};const b=R.connect(w);const p=b.request('run',{},1000);w.onerror();await assert.rejects(p,/WORKER_FAILED/);assert.equal(w.killed,true);await assert.rejects(b.request('run',{},1000),/RUNTIME_CLOSED/);});
test('timeout terminates worker rather than leaving orphan job',async()=>{const w={postMessage(){},terminate(){this.killed=true}};const b=R.connect(w);await assert.rejects(b.request('run',{},10),/RUNTIME_TIMEOUT/);assert.equal(w.killed,true);});
test('queue stays bounded and session calls never overlap; close rejects queued work',async()=>{
 const oldWorker=global.Worker,oldNav=Object.getOwnPropertyDescriptor(global,'navigator');let worker;
 global.Worker=class {constructor(){worker=this;this.calls=[];}postMessage(m){if(m.kind==='init')queueMicrotask(()=>this.onmessage({data:{id:m.id,value:{threads:m.threads}}}));else this.calls.push(m);}terminate(){this.killed=true;}};
 Object.defineProperty(global,'navigator',{value:{hardwareConcurrency:8},configurable:true});
 try {
  const s=await R.create(new ArrayBuffer(1),'http://localhost/',{threadAssets:true});
  const inputs={x:{data:new Float32Array([1]),dims:[1],type:'float32'}};
  const jobs=Array.from({length:4},()=>s.run(inputs));const settled=Promise.allSettled(jobs);
  await assert.rejects(s.run(inputs),/RUNTIME_QUEUE_FULL/);assert.equal(worker.calls.length,1);
  worker.onmessage({data:{id:worker.calls[0].id,value:'first'}});assert.equal(await jobs[0],'first');
  await new Promise(r=>setImmediate(r));assert.equal(worker.calls.length,2);s.close();
  const outcomes=await settled;assert.equal(outcomes[0].status,'fulfilled');assert.ok(outcomes.slice(1).every(x=>x.status==='rejected'));assert.equal(worker.killed,true);
 }finally{global.Worker=oldWorker;if(oldNav)Object.defineProperty(global,'navigator',oldNav);else delete global.navigator;}
});
test('thread init failure creates a new single-thread worker and reports fallback',async()=>{
 const saved={worker:global.Worker,nav:Object.getOwnPropertyDescriptor(global,'navigator'),iso:global.crossOriginIsolated};let attempts=[];
 global.Worker=class {postMessage(m){attempts.push(m.threads);queueMicrotask(()=>this.onmessage({data:m.threads>1?{id:m.id,error:'threads unavailable'}:{id:m.id,value:{threads:1}}}));}terminate(){}};
 global.crossOriginIsolated=true;Object.defineProperty(global,'navigator',{value:{hardwareConcurrency:16},configurable:true});
 try{const s=await R.create(new ArrayBuffer(1),'http://localhost/',{threadAssets:true});assert.deepEqual(attempts,[4,1]);assert.equal(s.threads,1);assert.equal(s.fallbackReason,'THREAD_INITIALIZATION_FAILED');s.close();}
 finally{global.Worker=saved.worker;global.crossOriginIsolated=saved.iso;if(saved.nav)Object.defineProperty(global,'navigator',saved.nav);else delete global.navigator;}
});
