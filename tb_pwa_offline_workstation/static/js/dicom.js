/* Bounded, local DICOM Part10 decoder. No network and no patient tags returned. */
(function(root){
'use strict';
const errors={
 DICOM_FORMAT:'DICOM Part 10 required / Perlu DICOM Part 10',
 DICOM_SYNTAX:'Compressed DICOM unsupported / DICOM terkompresi belum didukung',
 DICOM_SEQUENCE:'Undefined-length DICOM unsupported / Struktur DICOM ini belum didukung',
 DICOM_PIXELS:'Unsupported or invalid pixels / Piksel tidak didukung atau rusak',
 DICOM_FRAME:'Single-frame only / Hanya satu frame',
 DICOM_COLOR:'Monochrome only / Hanya monokrom',
 DICOM_SIZE:'DICOM exceeds limits / Ukuran DICOM melebihi batas'
};
function fail(code){const e=new Error(errors[code]||code);e.code=code;throw e;}
function decode(input){
 const bytes=new Uint8Array(input);if(bytes.length>64*1024*1024)fail('DICOM_SIZE');
 if(bytes.length<144||String.fromCharCode(...bytes.slice(128,132))!=='DICM')fail('DICOM_FORMAT');
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let pos=132,little=true,explicit=true;
 const text=(p,n)=>new TextDecoder('ascii').decode(bytes.subarray(p,p+n)).replace(/\0/g,'').trim();
 function element(){
  if(pos+8>bytes.length)fail('DICOM_PIXELS');
  const group=view.getUint16(pos,little),tag=view.getUint16(pos+2,little);let length,start;
  if(explicit){const vr=text(pos+4,2);if(!/^[A-Z]{2}$/.test(vr))fail('DICOM_FORMAT');const long=['OB','OD','OF','OL','OV','OW','SQ','UC','UR','UT','UN'].includes(vr);if(long&&pos+12>bytes.length)fail('DICOM_PIXELS');length=long?view.getUint32(pos+8,little):view.getUint16(pos+6,little);start=pos+(long?12:8);}
  else {length=view.getUint32(pos+4,little);start=pos+8;}
  if(length===0xffffffff)fail('DICOM_SEQUENCE');if(start+length>bytes.length)fail('DICOM_PIXELS');pos=start+length;return {key:group.toString(16).padStart(4,'0')+tag.toString(16).padStart(4,'0'),start,length};
 }
 let syntax=null;
 while(pos+8<=bytes.length&&view.getUint16(pos,true)===2){const e=element();if(e.key==='00020010')syntax=text(e.start,e.length);}
 if(!['1.2.840.10008.1.2','1.2.840.10008.1.2.1','1.2.840.10008.1.2.2'].includes(syntax))fail('DICOM_SYNTAX');
 little=syntax!=='1.2.840.10008.1.2.2';explicit=syntax!=='1.2.840.10008.1.2';
 const values={};let pixel;
 const wanted=new Set(['00280002','00280004','00280008','00280010','00280011','00280100','00280101','00280102','00280103','00281050','00281051','00281052','00281053']);
 while(pos<bytes.length){const e=element();if(e.key==='7fe00010'){pixel=e;break;}if(['00283000','00283010'].includes(e.key))fail('DICOM_PIXELS');if(e.key==='00281056'&&text(e.start,e.length)!=='LINEAR')fail('DICOM_PIXELS');if(wanted.has(e.key)){if(values[e.key])fail('DICOM_PIXELS');values[e.key]=e;}}
 const number=(key,otherwise)=>{const e=values[key];if(!e)return otherwise;const v=Number(text(e.start,e.length).split('\\')[0]);if(!Number.isFinite(v))fail('DICOM_PIXELS');return v;};
 const ushort=(key,otherwise)=>{const e=values[key];if(!e)return otherwise;if(e.length!==2)fail('DICOM_PIXELS');return view.getUint16(e.start,little);};
 const rows=ushort('00280010',0),columns=ushort('00280011',0),allocated=ushort('00280100',0),stored=ushort('00280101',allocated),high=ushort('00280102',stored-1),signed=ushort('00280103',0),samples=ushort('00280002',1),frames=number('00280008',1);
 const photo=values['00280004']?text(values['00280004'].start,values['00280004'].length):'';
 if(frames!==1)fail('DICOM_FRAME');if(samples!==1||!['MONOCHROME1','MONOCHROME2'].includes(photo))fail('DICOM_COLOR');
 if(!rows||!columns||rows*columns>16*1024*1024)fail('DICOM_SIZE');
 const expected=rows*columns*allocated/8;
 if(!pixel||![8,16].includes(allocated)||stored<1||stored>allocated||high<stored-1||high>=allocated||![0,1].includes(signed)||pixel.length<expected||pixel.length>expected+1)fail('DICOM_PIXELS');
 const slope=number('00281053',1),intercept=number('00281052',0);if(slope===0)fail('DICOM_PIXELS');
 const count=rows*columns,data=new Float64Array(count),shift=high-stored+1,mask=2**stored-1,sign=2**(stored-1);let low=Infinity,upper=-Infinity;
 for(let i=0;i<count;i++){const raw=allocated===8?bytes[pixel.start+i]:view.getUint16(pixel.start+2*i,little);let v=(raw>>>shift)&mask;if(signed&&v>=sign)v-=2**stored;v=v*slope+intercept;if(!Number.isFinite(v))fail('DICOM_PIXELS');data[i]=v;low=Math.min(low,v);upper=Math.max(upper,v);}
 const center=number('00281050',null),width=number('00281051',null);if(width!==null&&width<1)fail('DICOM_PIXELS');
 if((center===null)!==(width===null))fail('DICOM_PIXELS');
 const windowed=center!==null&&width!==null;const gray=new Uint8Array(count);
 for(let i=0;i<count;i++){let v;if(windowed){const lo=center-.5-(width-1)/2,hi=center-.5+(width-1)/2;v=data[i]<=lo?0:data[i]>hi?255:((data[i]-(center-.5))/(width-1)+.5)*255;}else v=upper===low?0:(data[i]-low)/(upper-low)*255;v=Math.max(0,Math.min(255,v));gray[i]=Math.round(photo==='MONOCHROME1'?255-v:v);}
 return {gray,rows,columns,metadata:{rows,columns,photometric:photo,transferSyntax:syntax,bitsAllocated:allocated,bitsStored:stored,signed:Boolean(signed),windowing:windowed?'DICOM LINEAR':'min-max fallback',rescaleSlope:slope,rescaleIntercept:intercept}};
}
async function toPng(file){if(file.size>64*1024*1024)fail('DICOM_SIZE');const result=decode(await file.arrayBuffer());const canvas=document.createElement('canvas');canvas.width=result.columns;canvas.height=result.rows;const context=canvas.getContext('2d');if(!context)fail('DICOM_PIXELS');const pixels=context.createImageData(result.columns,result.rows);for(let i=0;i<result.gray.length;i++){pixels.data[4*i]=pixels.data[4*i+1]=pixels.data[4*i+2]=result.gray[i];pixels.data[4*i+3]=255;}context.putImageData(pixels,0,0);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)fail('DICOM_PIXELS');return {file:new File([blob],file.name.replace(/\.(dcm|dicom)$/i,'')+'.png',{type:'image/png'}),metadata:result.metadata};}
const api=Object.freeze({decode,toPng,isDicom:file=>/\.(dcm|dicom)$/i.test(file.name),limits:'Part10 single-frame uncompressed monochrome8/16 only; rendered PNG is not diagnostic DICOM; no patient metadata exported'});if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.dicomInput=api;
})(typeof window==='undefined'?globalThis:window);
