/* One owned worker/session, bounded queue, explicit failure and retry. */
(()=>{
 'use strict';
 const policy=Object.freeze({maxThreads:4,maxQueuedRuns:4,initTimeoutMs:180000,runTimeoutMs:180000});
 function threadsFor(cap){return cap.isolated&&cap.threadAssets?Math.max(1,Math.min(policy.maxThreads,Math.floor((cap.cores||2)/2))):1;}
 function connect(worker){
  let seq=0,dead=false;const pending=new Map();
  const fail=error=>{if(dead)return;dead=true;worker.terminate();for(const p of pending.values()){clearTimeout(p.timer);p.reject(error);}pending.clear();};
  worker.onmessage=({data:m})=>{const p=pending.get(m.id);if(!p)return;clearTimeout(p.timer);pending.delete(m.id);if(m.error){p.reject(new Error(m.error));}else p.resolve(m.value);};
  worker.onerror=()=>fail(new Error('WORKER_FAILED'));
  worker.onmessageerror=()=>fail(new Error('WORKER_MESSAGE_FAILED'));
  const request=(kind,data,timeout)=>new Promise((resolve,reject)=>{if(dead){reject(new Error('RUNTIME_CLOSED'));return;}const id=++seq;const timer=setTimeout(()=>fail(new Error('RUNTIME_TIMEOUT')),timeout);pending.set(id,{resolve,reject,timer});try{worker.postMessage({id,kind,...data});}catch(e){fail(e);}});
  return {request,close:()=>fail(new Error('RUNTIME_CLOSED'))};
 }
 async function create(model,base,{threadAssets=false}={}){
  if(typeof Worker==='undefined')throw new Error('WORKER_UNAVAILABLE');
  const cap={isolated:globalThis.crossOriginIsolated===true,cores:navigator.hardwareConcurrency,threadAssets};
  const threads=threadsFor(cap);const bridge=connect(new Worker(new URL('static/js/inference_worker.js',base)));
  let info;
  try{info=await bridge.request('init',{model,runtimeUrl:new URL('vendor/onnx/ort.min.js',base).href,wasmPath:new URL('vendor/onnx/',base).href,threads},policy.initTimeoutMs);}catch(e){bridge.close();if(threads>1){const fallback=await create(model,base,{threadAssets:false});return {...fallback,fallbackReason:'THREAD_INITIALIZATION_FAILED'};}throw e;}
  let tail=Promise.resolve(),queued=0;
  return {...info,execution:'worker',close:bridge.close,run(inputs){
   if(queued>=policy.maxQueuedRuns)return Promise.reject(new Error('RUNTIME_QUEUE_FULL'));
   const plain=Object.fromEntries(Object.entries(inputs).map(([k,t])=>[k,{type:t.type,dims:t.dims,data:t.data}]));queued++;
   const job=tail.then(()=>bridge.request('run',{inputs:plain},policy.runTimeoutMs));
   tail=job.catch(()=>{});return job.finally(()=>{queued--;});
  }};
 }
 const api={policy,threadsFor,connect,create};
 if(typeof module!=='undefined')module.exports=api;else window.tbRuntime=api;
})();
