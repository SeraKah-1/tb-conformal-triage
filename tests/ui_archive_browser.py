"""Local backup/restore integrity and Settings checks. No model inference."""
import json,os,socket,subprocess,time,urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]

def main():
    checks=[]
    def check(name,value):
        assert value,name
        checks.append({'name':name,'passed':True})
    with socket.socket() as s:s.bind(('127.0.0.1',0));port=s.getsockname()[1]
    server=subprocess.Popen(['node','tb_pwa_offline_workstation/server.js'],cwd=ROOT,env={**os.environ,'PORT':str(port)},stdout=subprocess.DEVNULL)
    base=f'http://127.0.0.1:{port}'
    try:
        for _ in range(100):
            try:urllib.request.urlopen(base,timeout=.2).close();break
            except OSError:time.sleep(.05)
        with sync_playwright() as pw:
            browser=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
            c=browser.new_context(service_workers='block',accept_downloads=True);page=c.new_page();page.add_init_script("localStorage.setItem('tb_triage_disclaimer_accepted','true')")
            errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto(base);page.wait_for_function('window.caseSettings&&window.caseArchive&&window.caseWorkspace&&!caseWorkspace.state.loadingArchives')
            page.set_input_files('#file-input',str(ROOT/'tb_pwa_offline_workstation/assets/brand-192.png'))
            page.wait_for_function("document.getElementById('input-preview').naturalWidth>0")
            check('selected image preview visible before inference',page.locator('#input-preview').is_visible() and page.evaluate('currentResultData===null'))
            page.locator('#btn-settings').click();check('settings dialog opens',page.locator('#settings-dialog').is_visible())
            page.evaluate('applyLanguage("en")');check('settings translates without closing',page.locator('#settings-title').inner_text()=='Settings' and page.locator('#settings-dialog').is_visible())
            page.locator('#settings-close').click()
            page.evaluate('''async()=>{
                const blob=await fetch('/assets/brand-192.png').then(r=>r.blob());
                const file=new File([blob],'demo.png',{type:'image/png'});
                caseWorkspace.captureSingle(file,{filename:'demo.png',triage_action:'ASSISTIVE_NORMAL_DOCTOR_VERIFY',probability_tb:.01,probability_normal:.99,conformal_details:{conformal_set:['Normal'],safety_interlock_engaged:true},ood_report:{available:false,is_ood:null},iqa_report:{quality_passed:true},allow_autonomous_release:false,inference_latency_ms:0});
                await caseWorkspace.save();
            }''')
            with page.expect_download() as downloaded:page.evaluate('caseSettings.backup()')
            backup=json.loads(Path(downloaded.value.path()).read_text());check('backup includes image bytes and model provenance',len(backup['records'])==1 and bool(backup['records'][0]['image']['base64']) and bool(backup['records'][0]['modelVersion']))
            page.evaluate('caseSettings.close()');page.once('dialog',lambda d:d.accept());page.evaluate('caseWorkspace.remove([caseWorkspace.state.records[0].id])')
            check('saved case removed before restore',page.evaluate('caseWorkspace.state.records.length===0'))
            result=page.evaluate('async data=>caseArchive.restore(new File([JSON.stringify(data)],"backup.json",{type:"application/json"}))',backup)
            page.wait_for_function('caseWorkspace.state.records.length===1')
            check('restore recovers image and record',result['added']==1 and page.evaluate('caseWorkspace.state.records[0].image instanceof Blob'))
            result=page.evaluate('async data=>caseArchive.restore(new File([JSON.stringify(data)],"backup.json"))',backup)
            check('duplicate restore skips existing ID',result=={'added':0,'skipped':1,'total':1})
            attempt='''async data=>{try{await caseArchive.restore(new File([JSON.stringify(data)],'bad.json'));return 'accepted';}catch(e){return e.code;}}'''
            bad=json.loads(json.dumps(backup));bad['schemaVersion']=99
            check('future container rejected',page.evaluate(attempt,bad)=='archiveVersion')
            bad=json.loads(json.dumps(backup));bad['records'].append(bad['records'][0])
            check('duplicate IDs in one file rejected',page.evaluate(attempt,bad)=='archiveInvalid')
            bad=json.loads(json.dumps(backup));bad['records'][0]['id']='bad-hash';raw=bad['records'][0]['image']['base64'];bad['records'][0]['image']['base64']=('A' if raw[0]!='A' else 'B')+raw[1:]
            check('image hash corruption rejected',page.evaluate(attempt,bad)=='archiveHash')
            bad=json.loads(json.dumps(backup));bad['records'][0]['result']['source_image']='https://example.com/patient.png'
            check('external image URL rejected',page.evaluate(attempt,bad)=='archiveInvalid')
            pair=json.loads(json.dumps(backup));a=json.loads(json.dumps(pair['records'][0]));b=json.loads(json.dumps(a));a['id']='atomic-a';b['id']='atomic-b';pair['records']=[a,b]
            result=page.evaluate('''async data=>{
                const original=IDBObjectStore.prototype.add;let calls=0;
                IDBObjectStore.prototype.add=function(...args){if(this.name==='cases'&&++calls===2){this.transaction.abort();return {};}return original.apply(this,args);};
                try{await caseArchive.restore(new File([JSON.stringify(data)],'atomic.json'));return 'accepted';}catch(e){return e.code;}finally{IDBObjectStore.prototype.add=original;}
            }''',pair)
            count=page.evaluate('''()=>new Promise((resolve,reject)=>{const r=indexedDB.open('tb_case_archive_v1',1);r.onsuccess=()=>{const db=r.result;const tx=db.transaction('cases');const q=tx.objectStore('cases').getAllKeys();q.onsuccess=()=>resolve(q.result);tx.oncomplete=()=>db.close();};r.onerror=reject;})''')
            check('failed write rolls back entire restore',result=='archiveStorage' and len(count)==1 and 'atomic-a' not in count and 'atomic-b' not in count)
            page.evaluate('caseSettings.open()');check('storage and model information visible',bool(page.locator('#settings-storage').inner_text()) and 'v11' in page.locator('#settings-model').inner_text())
            check('no model execution during archive actions',page.evaluate('ortSession===null'))
            check('no page JS errors',not errors)
            c.close();browser.close()
    finally:server.terminate();server.wait()
    print(json.dumps({'checks':checks},indent=2))

if __name__=='__main__':main()
