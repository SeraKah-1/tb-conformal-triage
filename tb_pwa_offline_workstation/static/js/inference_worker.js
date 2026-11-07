'use strict';
let session;
self.onmessage=async({data:m})=>{
 try{
  if(m.kind==='init'){
   importScripts(m.runtimeUrl);
   ort.env.wasm.wasmPaths=m.wasmPath;
   ort.env.wasm.numThreads=m.threads;
   session=await ort.InferenceSession.create(new Uint8Array(m.model),{executionProviders:['wasm'],graphOptimizationLevel:'all'});
   self.postMessage({id:m.id,value:{inputNames:session.inputNames,outputNames:session.outputNames,backend:'wasm',threads:m.threads}});
  }else if(m.kind==='run'){
   if(!session)throw new Error('Runtime not ready');
   const inputs=Object.fromEntries(Object.entries(m.inputs).map(([k,t])=>[k,new ort.Tensor(t.type,t.data,t.dims)]));
   const result=await session.run(inputs),value={};
   for(const [k,t] of Object.entries(result))value[k]={data:t.data,dims:t.dims,type:t.type};
   self.postMessage({id:m.id,value});
  }
 }catch(e){self.postMessage({id:m.id,error:String(e.message||e)});}
};
