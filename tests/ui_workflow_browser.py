"""Independent browser workflow checks with mocked inference; no model computation."""
import json
import os
from pathlib import Path
import socket
import subprocess
import time
import urllib.request
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]

def main():
    checks=[]
    def check(name, condition):
        checks.append({'name':name,'passed':bool(condition)})
        assert condition,name
    with socket.socket() as s:
        s.bind(('127.0.0.1',0));port=s.getsockname()[1]
    server=subprocess.Popen(['node','tb_pwa_offline_workstation/server.js'],cwd=ROOT,env={**os.environ,'PORT':str(port),'HOST':'127.0.0.1'},stdout=subprocess.DEVNULL)
    base=f'http://127.0.0.1:{port}'
    try:
        for _ in range(100):
            try:urllib.request.urlopen(base,timeout=.2).close();break
            except OSError:time.sleep(.05)
        with sync_playwright() as p:
            browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
            context=browser.new_context(accept_downloads=True,service_workers='block')
            page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
            page.add_init_script("localStorage.setItem('tb_triage_disclaimer_accepted','true');")
            page.goto(base);page.wait_for_function('window.caseWorkspace && !caseWorkspace.state.loadingArchives')
            check('single upload is the initial view',page.locator('#drop-zone').is_visible() and not page.locator('#case-workspace').is_visible())
            page.locator('[data-case-view=queue]').click()
            check('Batch opens the queue workspace',page.locator('#case-workspace').is_visible())
            check('empty export is disabled',page.locator('#case-export').is_disabled())
            check('legacy processing collapsed',not page.locator('#processing-workspace').evaluate('(e)=>e.open'))
            page.evaluate('''() => {
                window.mockCalls=0;
                processBatchItem=async file=> {mockCalls++;await new Promise(r=>setTimeout(r,80));return {filename:file.name,triage_action:file.name==='broken.png'?'ERROR_RUNTIME':'ASSISTIVE_NORMAL_DOCTOR_VERIFY',probability_tb:.1,probability_normal:.9,conformal_details:{conformal_set:['Normal'],safety_interlock_engaged:true},ood_report:{available:false,is_ood:null},inference_latency_ms:1,allow_autonomous_release:false};};
                caseWorkspace.addFiles(['same.png','same.png','=formula.png','broken.png'].map(name=>new File(['image'],name,{type:'image/png'})));
            }''')
            check('duplicate filenames retain four unique IDs',page.evaluate('new Set(caseWorkspace.state.records.map(r=>r.id)).size===4'))
            check('new cases unreviewed and unsaved',page.evaluate('caseWorkspace.state.records.every(r=>!r.reviewed&&!r.saved)'))
            page.evaluate('caseWorkspace.process()')
            check('all four processed',page.evaluate('mockCalls===4&&!caseWorkspace.state.running'))
            ids=page.evaluate('caseWorkspace.state.records.map(r=>r.id)')
            page.evaluate('(id)=>caseWorkspace.open(id)',ids[0])
            check('detail shows correct file',page.locator('#case-detail-tools h2').inner_text()=='same.png')
            check('opening detail focuses its heading',page.locator('#case-detail-tools h2').evaluate('(e)=>e===document.activeElement'))
            page.locator('#case-notes').fill('=SUM(1,2)')
            page.evaluate('caseWorkspace.save()')
            check('save persists independent review',page.evaluate('caseWorkspace.state.records[0].saved&&!caseWorkspace.state.records[0].reviewed'))
            page.locator('#case-detail-tools button').filter(has_text='Selesai ditinjau').click()
            check('review status updates',page.evaluate('caseWorkspace.state.records[0].reviewed'))
            page.evaluate('caseWorkspace.save()')
            page.locator('#case-workspace select').nth(0).select_option('reviewed')
            check('review filter includes reviewed case only',page.locator('.case-row').count()==1)
            page.locator('#case-workspace select').nth(0).select_option('all')
            page.locator('#case-workspace select').nth(1).select_option('newest')
            check('newest sort orders latest case first',page.locator('.case-row .case-open').first.inner_text()=='broken.png')
            page.locator('#case-workspace select').nth(1).select_option('defaultSort')
            check('default sort puts unreviewed first',page.locator('.case-row .case-meta').first.inner_text().endswith('Belum ditinjau'))
            page.evaluate('toggleLanguage()')
            check('English applies',page.locator('#case-process').inner_text()=='Process shown' and page.locator('html').get_attribute('lang')=='en')
            check('language switch preserves notes',page.locator('#case-notes').input_value()=='=SUM(1,2)')
            with page.expect_download() as info:page.evaluate('caseWorkspace.export()')
            csv=Path(info.value.path()).read_text()
            check('CSV formula escaping',"'=SUM(1,2)" in csv and "'=formula.png" in csv)
            page.locator('#case-search').fill('broken')
            check('search filters to one row',page.locator('.case-row').count()==1)
            page.locator('#case-search').fill('')
            page.evaluate('(id)=>caseWorkspace.open(id)',ids[3])
            check('runtime error clears old probability',page.locator('#val-prob-tb').inner_text()=='N/A')
            check('runtime error clears result payload',page.evaluate('currentResultData===null'))
            page.once('dialog',lambda dialog:dialog.accept())
            page.reload();page.wait_for_function('window.caseWorkspace && !caseWorkspace.state.loadingArchives')
            check('archive survives reload',page.evaluate('caseWorkspace.state.records.length===1&&caseWorkspace.state.records[0].saved'))
            check('English persists reload',page.locator('#case-process').inner_text()=='Process shown')
            page.locator('[data-case-view=saved]').click()
            page.evaluate('caseWorkspace.open(caseWorkspace.state.records[0].id)')
            check('saved notes and review restored',page.locator('#case-notes').input_value()=='=SUM(1,2)' and page.evaluate('caseWorkspace.state.records[0].reviewed'))
            check('opening archive does not infer',page.evaluate('typeof mockCalls==="undefined"'))
            page.set_viewport_size({'width':390,'height':844})
            check('mobile has no horizontal overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
            page.locator('#case-notes').fill('changed')
            page.once('dialog',lambda dialog:dialog.dismiss())
            page.evaluate("caseWorkspace.setView('guide')")
            check('dirty navigation cancellation works',page.evaluate('caseWorkspace.state.view!=="guide"'))
            page.once('dialog',lambda dialog:dialog.accept())
            page.evaluate('caseWorkspace.remove([caseWorkspace.state.records[0].id])')
            check('delete removes saved case',page.evaluate('caseWorkspace.state.records.length===0'))
            page.evaluate('''() => {
                window.mockCalls=0;window.finishInference=null;
                processBatchItem=file=> {mockCalls++;return new Promise(resolve=>window.finishInference=()=>resolve({filename:file.name,triage_action:'REJECT_CORRUPT_IMAGE',iqa_report:null}));};
                caseWorkspace.addFiles(['first.png','second.png'].map(name=>new File(['bad'],name,{type:'image/png'})));
                window.processingPromise=caseWorkspace.process();
            }''')
            check('processing starts one case at a time',page.evaluate('mockCalls===1&&caseWorkspace.state.running'))
            page.evaluate('toggleLanguage()')
            check('language switch during processing preserves queue',page.evaluate('caseWorkspace.state.records.length===2&&caseWorkspace.state.running') and page.locator('#case-process').inner_text()=='Proses daftar')
            page.locator('#case-cancel').click()
            page.evaluate('finishInference();')
            page.wait_for_function('!caseWorkspace.state.running')
            check('cancel preserves completed and pending cases',page.evaluate('mockCalls===1&&caseWorkspace.state.records[0].state==="complete"&&caseWorkspace.state.records[1].state==="cancelled"'))
            page.evaluate('caseWorkspace.open(caseWorkspace.state.records[0].id)')
            check('corrupt image clears probability',page.locator('#val-prob-tb').inner_text()=='N/A')
            page.evaluate('''() => {window.originalOpen=indexedDB.open.bind(indexedDB);indexedDB.open=()=>{throw new Error('quota');};}''')
            page.evaluate('caseWorkspace.save()')
            check('storage failure never claims saved',page.evaluate('!caseWorkspace.state.records[0].saved') and 'Gagal menyimpan' in page.locator('#case-detail-tools .case-message').inner_text())
            page.evaluate('indexedDB.open=originalOpen')
            page.evaluate('''() => new Promise((resolve,reject)=> {
                const request=indexedDB.open('tb_case_archive_v1',1);
                request.onsuccess=()=> {const db=request.result;const tx=db.transaction('cases','readwrite');
                    tx.objectStore('cases').put({id:'future-record',schemaVersion:999,image:new Blob(['x']),createdAt:Date.now()});
                    tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);};
            })''')
            page.once('dialog',lambda dialog:dialog.accept())
            page.reload();page.wait_for_function('window.caseWorkspace && !caseWorkspace.state.loadingArchives')
            check('unsupported archive schema is not loaded',page.evaluate('caseWorkspace.state.records.length===0'))
            check('unsupported archive schema reports problem',bool(page.locator('.case-message').first.inner_text()))
            check('no page JS errors',not errors)
            context.close()
            modal_context=browser.new_context(service_workers='block')
            modal_page=modal_context.new_page();modal_page.goto(base)
            modal_page.wait_for_function('document.activeElement?.id==="modal-language"')
            check('first-run dialog focuses language control',modal_page.locator('#modal-language').evaluate('(e)=>e===document.activeElement'))
            modal_page.locator('#modal-language').click()
            check('first-run dialog can switch to English',modal_page.locator('html').get_attribute('lang')=='en' and modal_page.locator('#btn-modal-accept').inner_text()=='Continue')
            modal_page.locator('#chk-disclaimer').focus();modal_page.keyboard.press('Tab')
            check('dialog Tab wraps past disabled Continue',modal_page.locator('#modal-language').evaluate('(e)=>e===document.activeElement'))
            modal_page.locator('#chk-disclaimer').check();modal_page.locator('#btn-modal-accept').click()
            check('accepting dialog focuses single upload',modal_page.locator('#drop-zone').evaluate('(e)=>e===document.activeElement') and not modal_page.locator('#disclaimer-modal').is_visible())
            modal_context.close();browser.close()
    finally:server.terminate();server.wait()
    print(json.dumps({'checks':checks},indent=2))
    return checks

if __name__=='__main__':main()
