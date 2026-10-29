"""Independent regressions for menu/state bugs, using real Chromium/IDB and mocked inference."""
import json
import os
from pathlib import Path
import socket
import subprocess
import time
import urllib.request
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = '''() => {
 window.fixture=file=>({filename:file.name,triage_action:'REFER_AMBIGUOUS_TO_DOCTOR',probability_tb:.2,probability_normal:.8,conformal_details:{conformal_set:['Normal','Tuberculosis'],safety_interlock_engaged:true},ood_report:{available:false,is_ood:null},iqa_report:{quality_passed:true,has_quality_advisory:false,warnings:[]},inference_latency_ms:1,allow_autonomous_release:false});
 processBatchItem=async file=>fixture(file);
}'''


def main():
    checks = []
    def check(name, condition):
        checks.append({'name': name, 'passed': bool(condition)})
        assert condition, name
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0)); port = sock.getsockname()[1]
    server = subprocess.Popen(['node', 'tb_pwa_offline_workstation/server.js'], cwd=ROOT,
        env={**os.environ, 'PORT': str(port), 'HOST': '127.0.0.1'}, stdout=subprocess.DEVNULL)
    base = f'http://127.0.0.1:{port}'
    try:
        for _ in range(100):
            try:
                urllib.request.urlopen(base, timeout=.2).close(); break
            except OSError: time.sleep(.05)
        with sync_playwright() as pw:
            browser = pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'), args=['--no-sandbox'])
            contexts = []
            errors = []
            def fresh():
                context = browser.new_context(service_workers='block', accept_downloads=True)
                contexts.append(context)
                page = context.new_page()
                page.on('pageerror', lambda e: errors.append(str(e)))
                page.add_init_script("localStorage.setItem('tb_triage_disclaimer_accepted','true')")
                page.goto(base)
                page.wait_for_function('window.caseWorkspace && !caseWorkspace.state.loadingArchives')
                page.evaluate(FIXTURE)
                return page

            page = fresh()
            page.evaluate("caseWorkspace.addFiles([new File(['x'],'pending.png',{type:'image/png'})]);caseWorkspace.open(caseWorkspace.state.records[0].id)")
            reviewed_button = page.locator('#case-detail-tools button').filter(has_text='Selesai ditinjau')
            check('pending result cannot be marked reviewed', reviewed_button.is_disabled())
            page.evaluate('''() => {
                window.finishBatch=null;
                processBatchItem=file=>new Promise(resolve=>window.finishBatch=()=>resolve(fixture(file)));
                window.job=caseWorkspace.process('visible');
            }''')
            page.wait_for_function('typeof finishBatch === "function"')
            check('processing result cannot be marked reviewed', reviewed_button.is_disabled())
            page.evaluate('finishBatch()'); page.wait_for_function('!caseWorkspace.state.running')
            check('new result is unreviewed', page.evaluate('!caseWorkspace.state.records[0].reviewed'))
            reviewed_button.click()
            check('completed result can be marked reviewed', page.evaluate('caseWorkspace.state.records[0].reviewed'))
            check('review is bound to current result generation', page.evaluate('caseWorkspace.state.records[0].reviewedGeneration===caseWorkspace.state.records[0].resultGeneration'))

            page = fresh()
            page.evaluate('''async()=>{
                const a=new File(['x'],'A.png',{type:'image/png'});
                caseWorkspace.captureSingle(a,fixture(a));await caseWorkspace.save();
                const b=new File(['x'],'B.png',{type:'image/png'});
                caseWorkspace.captureSingle(b,fixture(b));
            }''')
            check('Save A does not claim B saved', page.evaluate("!caseWorkspace.state.records.find(r=>r.filename==='B.png').saved") and 'Disimpan di perangkat ini.' not in page.locator('#case-detail-tools .case-message').inner_text())
            page.locator('#case-notes').fill('snapshot note')
            page.evaluate('''()=>{
                window.saveJob=caseWorkspace.save();
                const note=document.querySelector('#case-notes');note.value='edited during save';note.dispatchEvent(new Event('input',{bubbles:true}));
            }''')
            page.evaluate('saveJob')
            check('edit during Save remains unsaved', 'Belum disimpan' in page.locator('#case-detail-tools .case-meta').inner_text())
            check('Save completion keeps note focus and enables Save', page.evaluate("document.activeElement.id==='case-notes'") and not page.locator('#case-detail-tools .case-primary').is_disabled())
            check('stale Save success not claimed for new edit', 'Disimpan di perangkat ini.' not in page.locator('#case-detail-tools .case-message').inner_text())
            stored_note=page.evaluate('''()=>new Promise((resolve,reject)=>{
                const q=indexedDB.open('tb_case_archive_v1',1);q.onerror=()=>reject(q.error);q.onsuccess=()=>{const db=q.result;const t=db.transaction('cases');const r=t.objectStore('cases').get(caseWorkspace.state.activeId);r.onsuccess=()=>resolve(r.result.notes);t.oncomplete=()=>db.close();};
            })''')
            check('actual stored snapshot excludes later edit', stored_note == 'snapshot note')

            page = fresh()
            page.evaluate("caseWorkspace.addFiles(['visible.png','hidden1.png','hidden2.png'].map(n=>new File(['x'],n,{type:'image/png'})))")
            page.locator('#case-search').fill('visible')
            page.evaluate('''()=>{window.calls=[];processBatchItem=async file=>{calls.push(file.name);return fixture(file)};}''')
            page.evaluate("caseWorkspace.process('visible')")
            check('Process shown does not process hidden results', page.evaluate('JSON.stringify(calls)===' + json.dumps(json.dumps(['visible.png']))))
            check('hidden queued records remain queued', page.evaluate("caseWorkspace.state.records.filter(r=>r.state==='pending').length===2"))
            page.locator('#case-search').fill('hidden1')
            page.locator('.case-row input[type=checkbox]').check()
            page.locator('#case-search').fill('hidden2')
            page.evaluate("caseWorkspace.process('selected')")
            check('explicit selected processing uses selected record across filter', page.evaluate("calls.join(',')==='visible.png,hidden1.png'"))
            check('unselected filtered record stays queued', page.evaluate("caseWorkspace.state.records.find(r=>r.filename==='hidden2.png').state==='pending'"))
            page.locator('[data-case-view=saved]').click()
            check('Saved has no processing action', page.locator('#case-process').count()==0 and page.locator('#case-process-selected').count()==0)
            check('Saved has no upload action', page.locator('#case-files').count()==0)
            page.evaluate("caseWorkspace.process('visible')")
            check('programmatic Process in Saved does not run queue', page.evaluate("calls.length===2"))

            page = fresh()
            page.evaluate("caseWorkspace.addFiles(['old1.png','old2.png','new.png'].map(n=>new File(['x'],n,{type:'image/png'})));caseWorkspace.state.records.slice(0,2).forEach(r=>{r.state='complete';r.result=fixture(r.image)})")
            page.evaluate('''()=>{processBatchItem=file=>new Promise(resolve=>window.finishBatch=()=>resolve(fixture(file)));window.job=caseWorkspace.process('visible');}''')
            page.wait_for_function('typeof finishBatch === "function"')
            check('new job progress excludes historical completions', page.evaluate('caseWorkspace.state.run.total===1&&caseWorkspace.state.run.completed===0'))
            check('visible progress starts at zero of one', '0/1' in page.locator('.case-progress').inner_text())
            page.evaluate('finishBatch()');page.wait_for_function('!caseWorkspace.state.running')
            check('current run completes one of one', page.evaluate('caseWorkspace.state.run.total===1&&caseWorkspace.state.run.completed===1'))

            page = fresh()
            page.evaluate("caseWorkspace.addFiles([new File(['x'],'transient.png',{type:'image/png'})])")
            page.evaluate('''()=>{
                window.attempts=0;processBatchItem=async file=>{attempts++;return attempts===1?{...fixture(file),triage_action:'ERROR_RUNTIME',probability_tb:null,probability_normal:null}:fixture(file);};
            }''')
            page.evaluate("caseWorkspace.process('visible')")
            check('technical runtime failure is retryable', page.evaluate("caseWorkspace.state.records[0].state==='failed'"))
            check('failure is not retried automatically', page.evaluate('attempts===1'))
            page.evaluate('caseWorkspace.open(caseWorkspace.state.records[0].id)')
            check('failed output cannot be marked reviewed', page.locator('#case-detail-tools button').filter(has_text='Selesai ditinjau').is_disabled())
            page.evaluate('caseWorkspace.retry(caseWorkspace.state.records[0].id)')
            check('Retry executes failed image once', page.evaluate("attempts===2&&caseWorkspace.state.records[0].state==='complete'"))
            check('retried result requires review', page.evaluate('!caseWorkspace.state.records[0].reviewed'))
            check('no autonomous patient clearance', page.evaluate('caseWorkspace.state.records[0].result.allow_autonomous_release===false'))

            page = fresh()
            page.evaluate('''()=>{
                evaluatePreAnalyticQuality=()=>({quality_passed:true,has_quality_advisory:false,warnings:[]});getOrtSession=async()=>({});runClientSideInference=async file=>fixture(file);
            }''')
            sample=(ROOT/'tb_pwa_offline_workstation/samples/nitrd_apical_tb.png').read_bytes()
            page.locator('#file-input').set_input_files({'name':'deleted.png','mimeType':'image/png','buffer':sample})
            page.locator('#btn-submit').click();page.wait_for_function('!isSubmitting&&caseWorkspace.state.records.length===1')
            old_id=page.evaluate('caseWorkspace.state.records[0].id')
            page.evaluate('''()=>{runClientSideInference=file=>new Promise(resolve=>window.finishSingle=()=>resolve(fixture(file)));}''')
            page.locator('#btn-submit').click();page.wait_for_function('typeof finishSingle === "function"')
            page.locator('[data-case-view=queue]').click()
            page.once('dialog',lambda d:d.accept())
            page.evaluate('(id)=>caseWorkspace.remove([id])',old_id)
            check('case removed during deferred single request',page.evaluate('caseWorkspace.state.records.length===0'))
            page.evaluate('finishSingle()');page.wait_for_function('!isSubmitting')
            check('late result cannot resurrect deleted record',page.evaluate('caseWorkspace.state.records.length===0'))
            page.locator('[data-case-view=single]').click()
            check('deleted single is not restored on Check',page.evaluate('currentResultData===null&&selectedFile===null'))
            check('no page JavaScript errors',not errors)
            for context in contexts:context.close()
            browser.close()
    finally:
        server.terminate();server.wait()
    print(json.dumps({'checks':checks},indent=2))
    return checks

if __name__=='__main__':main()
