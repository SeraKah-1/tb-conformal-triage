/* Actual job stages and counts. No simulated percentages or duration estimates. */
(() => {
    'use strict';
    const jobs=new Map();let sequence=0,timer=null,card;
    const dict={id:{files:'Baca berkas',folder:'Baca folder',decode:'Baca gambar',quality:'Periksa kualitas',model:'Siapkan model',download:'Unduh model',initializing:'Siapkan model',inference:'Proses gambar',heatmap:'Buat heatmap',archive:'Buka arsip',done:'Selesai',failed:'Gagal',cancelled:'Dibatalkan',attention:'Perlu review',processed:'Diproses',failedCount:'Gagal',cancelCount:'Dibatalkan',skipped:'Dihapus',found:'Ditemukan',seconds:'detik',slow:'Masih diproses. Durasi bergantung pada perangkat dan ukuran gambar. Biarkan tab terbuka.',local:'Proses berlangsung di perangkat ini.',waiting:'Menunggu proses aktif selesai.'},en:{files:'Read files',folder:'Read folder',decode:'Read image',quality:'Check quality',model:'Prepare model',download:'Download model',initializing:'Prepare model',inference:'Process image',heatmap:'Build heatmap',archive:'Open archive',done:'Done',failed:'Failed',cancelled:'Cancelled',attention:'Review required',processed:'Processed',failedCount:'Failed',cancelCount:'Cancelled',skipped:'Removed',found:'Found',seconds:'seconds',slow:'Still processing. Duration depends on the device and image size. Keep this tab open.',local:'Processing runs on this device.',waiting:'Waiting for the current operation to finish.'}};
    const language=()=>typeof currentLang==='string'&&currentLang==='en'?'en':'id';
    const word=k=>dict[language()][k]||k;
    function ensure(){
        if(card)return;
        card=document.createElement('section');card.id='work-progress';card.className='work-progress';card.hidden=true;
        card.innerHTML='<div class="work-progress-heading"><span class="work-spinner" aria-hidden="true"></span><strong id="work-phase" role="status" aria-live="polite"></strong><span id="work-elapsed" aria-hidden="true"></span></div><p id="work-file"></p><progress id="work-meter" max="100"></progress><p id="work-count" role="status" aria-live="polite"></p><p id="work-help"></p>';
        (document.querySelector('.workspace-heading')||document.body).after(card);
    }
    const text=(id,value)=>{const el=document.getElementById(id);if(el&&el.textContent!==value)el.textContent=value;};
    function render(){
        ensure();const all=Array.from(jobs.values()),job=all.filter(j=>!j.ended).sort((a,b)=>b.id-a.id)[0]||all.sort((a,b)=>b.id-a.id)[0];
        if(!job){card.hidden=true;stopTimer();return;}
        card.hidden=false;card.dataset.state=job.ended?job.status:'busy';card.dataset.busy=String(!job.ended);
        text('work-phase',word(job.ended?job.status:job.phase));
        text('work-file',job.filename||'');document.getElementById('work-file').title=job.filename||'';
        const elapsed=Math.floor(((job.ended||performance.now())-job.started)/1000);text('work-elapsed',elapsed+' '+word('seconds'));
        const meter=document.getElementById('work-meter');meter.setAttribute('aria-label',word(job.phase));
        const counts=job.total!==undefined?`${word('processed')}: ${job.completed||0}/${job.total} · ${word('failedCount')}: ${job.failed||0}${job.cancelled?' · '+word('cancelCount')+': '+job.cancelled:''}${job.skipped?' · '+word('skipped')+': '+job.skipped:''}`:job.found!==undefined?`${word('found')}: ${job.found}`:'';
        text('work-count',counts);
        if(job.phase==='download'&&!job.ended&&Number.isFinite(job.percent)){meter.value=Math.min(100,Math.max(0,job.percent));text('work-count',`${Math.round(meter.value)}%${Number.isFinite(job.received)?' · '+(job.received/1048576).toFixed(1)+' MB':''}`);}
        else if(job.total>0){meter.value=100*((job.completed||0)+(job.failed||0)+(job.cancelled||0)+(job.skipped||0))/job.total;}
        else if(job.ended){meter.value=100;}else meter.removeAttribute('value');
        const slow=!job.ended&&performance.now()-job.stageStarted>=15000;
        text('work-help',job.ended?'':job.cancelling?word('waiting'):slow?word('slow'):word('local'));
        if(all.some(j=>!j.ended)){if(!timer)timer=setInterval(render,500);}else stopTimer();
    }
    function stopTimer(){if(timer){clearInterval(timer);timer=null;}}
    function start(key,data={}){const id=++sequence;const now=performance.now();jobs.set(key,{id,key,started:now,stageStarted:now,phase:'decode',...data});render();return id;}
    function update(key,data={},id){const job=jobs.get(key);if(!job||job.ended||(id!==undefined&&job.id!==id))return;if(data.phase&&data.phase!==job.phase)job.stageStarted=performance.now();Object.assign(job,data);render();}
    function finish(key,data={},id){const job=jobs.get(key);if(!job||(id!==undefined&&job.id!==id))return;Object.assign(job,{status:'done',...data,ended:performance.now()});if(key==='archive')jobs.delete(key);render();}
    const paint=()=>new Promise(resolve=>{let frame;const fallback=setTimeout(()=>{cancelAnimationFrame(frame);resolve();},50);frame=requestAnimationFrame(()=>setTimeout(()=>{clearTimeout(fallback);resolve();},0));});
    function clear(){for(const [key,job] of jobs)if(job.ended)jobs.delete(key);render();}
    window.workProgress={start,update,finish,paint,clear};
    window.addEventListener('tb-language-change',render);
})();
