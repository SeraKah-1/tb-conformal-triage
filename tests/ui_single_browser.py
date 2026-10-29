"""Single-input workflow regression. Real file decode; mocked model, no inference."""
import json
import os
from pathlib import Path
import socket
import subprocess
import time
import urllib.request
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
SAMPLE = ROOT / 'tb_pwa_offline_workstation/samples/nitrd_apical_tb.png'


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
            except OSError:
                time.sleep(.05)
        with sync_playwright() as pw:
            browser = pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'),
                args=['--no-sandbox'])
            context = browser.new_context(service_workers='block')
            page = context.new_page(); errors=[]
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.add_init_script("localStorage.setItem('tb_triage_disclaimer_accepted','true')")
            page.goto(base); page.wait_for_function('window.caseWorkspace && !caseWorkspace.state.loadingArchives')
            check('single input is the default', page.evaluate('caseWorkspace.state.view === "single"'))
            check('upload and Process visible immediately', page.locator('#drop-zone').is_visible() and page.locator('#btn-submit').is_visible())
            check('queue dashboard hidden on landing', not page.locator('#case-workspace').is_visible())
            check('Process disabled before input', page.locator('#btn-submit').is_disabled())
            page.evaluate('''() => {
                window.modelCalls = 0;
                window.fixture = file => ({filename:file.name, triage_action:'REFER_AMBIGUOUS_TO_DOCTOR',
                    probability_tb:.1, probability_normal:.9,
                    conformal_details:{conformal_set:['Normal'],safety_interlock_engaged:true},
                    ood_report:{available:false,is_ood:null}, iqa_report:{quality_passed:true,has_quality_advisory:false,warnings:[]},
                    inference_latency_ms:1, allow_autonomous_release:false});
                evaluatePreAnalyticQuality = () => ({quality_passed:true,has_quality_advisory:false,warnings:[]});
                getOrtSession = async () => ({});
                runClientSideInference = async file => {modelCalls++; return fixture(file);};
            }''')
            page.locator('#file-input').set_input_files({'name':'first.png','mimeType':'image/png','buffer':SAMPLE.read_bytes()})
            check('input enables Process and shows filename', page.locator('#btn-submit').is_enabled() and page.locator('#file-name-label').inner_text()=='first.png')
            page.locator('#btn-submit').click()
            page.wait_for_function('!isSubmitting && currentResultData && caseWorkspace.state.records.length===1')
            check('Process shows result in place', page.locator('#results-display').is_visible() and page.evaluate('currentResultData.filename === "first.png"'))
            check('single processing does not open Batch', page.evaluate('caseWorkspace.state.view === "single"') and not page.locator('#case-workspace').is_visible())
            check('successful result captured once', page.evaluate('modelCalls===1 && caseWorkspace.state.records.length===1'))
            first = page.evaluate('caseWorkspace.state.records[0].id')
            # Notes can be an optional disclosure; explicitly open the result actions.
            page.locator('#case-detail-tools').evaluate('(el)=>{for(let p=el.parentElement;p;p=p.parentElement)if(p.tagName==="DETAILS")p.open=true;}')
            page.locator('#case-notes').fill('Single workflow note')
            page.evaluate('caseWorkspace.save()')
            check('single result saves image and note', page.evaluate('caseWorkspace.state.records[0].saved && caseWorkspace.state.records[0].notes === "Single workflow note"'))
            page.locator('[data-case-view=saved]').click()
            check('Saved is a secondary destination', page.evaluate('caseWorkspace.state.view === "saved"') and page.locator('#case-workspace').is_visible())
            page.evaluate('(id)=>caseWorkspace.open(id)', first)
            check('saved record opens without inference', page.evaluate('modelCalls===1') and page.locator('#case-notes').input_value()=='Single workflow note')
            page.locator('#case-detail-tools button').filter(has_text='Selesai ditinjau').click()
            page.evaluate('caseWorkspace.save()')
            page.locator('[data-case-view=single]').click()
            check('returning to Check restores upload and result', page.locator('#drop-zone').is_visible() and page.locator('#results-display').is_visible())
            page.evaluate('''() => {runClientSideInference = file => {modelCalls++;return new Promise(resolve=>window.releaseRerun=()=>resolve({...fixture(file),probability_tb:.2,probability_normal:.8}));};}''')
            page.locator('#btn-submit').click(); page.wait_for_function('typeof releaseRerun === "function"')
            page.locator('[data-case-view=queue]').click(); page.locator('[data-case-view=single]').click()
            check('rerun navigation hides the old score while busy', page.locator('#loading-state').is_visible() and not page.locator('#results-display').is_visible() and page.evaluate('currentResultData===null'))
            page.evaluate('releaseRerun()');page.wait_for_function('!isSubmitting && modelCalls===2')
            check('rerun displays only the new result', page.evaluate('currentResultData.probability_tb===.2'))
            check('rerunning same input reuses case identity', page.evaluate('(id)=>caseWorkspace.state.records.length===1 && caseWorkspace.state.records[0].id===id',first))
            check('rerun requires a new review', page.evaluate('caseWorkspace.state.records[0].reviewed===false'))
            page.evaluate('caseWorkspace.save()')
            page.evaluate('resetSingleTriage()')
            check('Reset clears current result and save controls', page.evaluate('currentResultData===null && selectedFile===null') and not page.locator('#case-detail-tools').is_visible())
            page.evaluate('''() => {
                runClientSideInference = file => {modelCalls++; return new Promise(resolve=>window.releaseOld=()=>resolve(fixture(file)));};
            }''')
            page.locator('#file-input').set_input_files({'name':'old.png','mimeType':'image/png','buffer':SAMPLE.read_bytes()})
            page.locator('#btn-submit').click(); page.wait_for_function('typeof releaseOld === "function"')
            page.locator('#file-input').set_input_files({'name':'new.png','mimeType':'image/png','buffer':SAMPLE.read_bytes()})
            page.evaluate('releaseOld()'); page.wait_for_function('!isSubmitting')
            check('late old result never replaces new input', page.evaluate('currentResultData===null && selectedFile.name==="new.png" && !caseWorkspace.state.records.some(r=>r.filename==="old.png")'))
            page.evaluate('() => {runClientSideInference = async file => {modelCalls++;return fixture(file)};}')
            page.locator('#btn-submit').click(); page.wait_for_function('!isSubmitting && currentResultData?.filename==="new.png"')
            check('new input gets its own case', page.evaluate('caseWorkspace.state.records.length===2 && caseWorkspace.state.records.some(r=>r.filename==="new.png")'))
            page.evaluate('resetSingleTriage()')
            page.evaluate('''() => {runClientSideInference = file => {modelCalls++;return new Promise(resolve=>window.releaseNav=()=>resolve(fixture(file)));};}''')
            page.locator('#file-input').set_input_files({'name':'background.png','mimeType':'image/png','buffer':SAMPLE.read_bytes()})
            page.locator('#btn-submit').click(); page.wait_for_function('typeof releaseNav === "function"')
            page.locator('[data-case-view=queue]').click()
            page.locator('[data-case-view=single]').click()
            check('returning during inference still shows Processing', page.locator('#loading-state').is_visible() and page.locator('#btn-submit').is_disabled())
            page.locator('[data-case-view=queue]').click()
            page.evaluate('releaseNav()'); page.wait_for_function('!isSubmitting')
            check('finishing in background preserves Batch navigation', page.evaluate('caseWorkspace.state.view==="queue" && caseWorkspace.state.activeId===null'))
            check('background completion still records the correct case', page.evaluate('caseWorkspace.state.records.some(r=>r.filename==="background.png")'))
            page.locator('[data-case-view=single]').click()
            check('returning to Check restores background result', page.evaluate('currentResultData?.filename==="background.png"') and page.locator('#drop-zone').is_visible())
            page.evaluate('resetSingleTriage()')
            page.evaluate('''() => {runClientSideInference = file => {modelCalls++;return new Promise(resolve=>window.releaseArchive=()=>resolve(fixture(file)));};}''')
            page.locator('#file-input').set_input_files({'name':'do-not-overwrite.png','mimeType':'image/png','buffer':SAMPLE.read_bytes()})
            page.locator('#btn-submit').click(); page.wait_for_function('typeof releaseArchive === "function"')
            page.locator('[data-case-view=saved]').click(); page.evaluate('(id)=>caseWorkspace.open(id)',first)
            check('archive stays selected during another pending request', page.evaluate('(id)=>caseWorkspace.state.activeId===id && currentResultData?.filename==="first.png"',first))
            page.locator('[data-case-view=single]').click()
            page.evaluate('releaseArchive()'); page.wait_for_function('!isSubmitting')
            check('opening archive invalidates pending single capture', page.evaluate('currentResultData===null && !caseWorkspace.state.records.some(r=>r.filename==="do-not-overwrite.png")'))
            check('invalidated request leaves an explicit empty state', page.locator('#empty-state').is_visible() and not page.locator('#loading-state').is_visible())
            page.evaluate('''evaluatePreAnalyticQuality = () => ({quality_passed:false,reject_code:'REJECT_INVALID_ANATOMY_DOCUMENT',warnings:['fixture']})''')
            page.locator('#file-input').set_input_files({'name':'rejected.png','mimeType':'image/png','buffer':SAMPLE.read_bytes()})
            calls = page.evaluate('modelCalls')
            page.locator('#btn-submit').click();page.wait_for_function('!isSubmitting && caseWorkspace.state.records.some(r=>r.filename==="rejected.png")')
            check('IQA rejection avoids model and records correct image', page.evaluate('(calls)=>modelCalls===calls && caseWorkspace.state.records.find(r=>r.filename==="rejected.png").result.triage_action.startsWith("REJECT_")',calls))
            check('rejection clears previous score', page.locator('#val-prob-tb').inner_text()=='N/A')
            page.locator('#file-input').set_input_files({'name':'corrupt.png','mimeType':'image/png','buffer':b'not an image'})
            page.locator('#btn-submit').click();page.wait_for_function('!isSubmitting && caseWorkspace.state.records.some(r=>r.filename==="corrupt.png")')
            check('corrupt input has no stale result', page.evaluate('currentResultData===null') and page.locator('#val-prob-tb').inner_text()=='N/A')
            page.evaluate('applyLanguage("en")')
            check('English retains simple workflow', page.locator('#txt-btn-submit').inner_text()=='Process' and page.locator('#drop-zone').is_visible())
            page.set_viewport_size({'width':390,'height':844})
            check('single workflow fits mobile', page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
            page.once('dialog',lambda dialog:dialog.accept())
            page.evaluate('caseWorkspace.remove([caseWorkspace.state.activeId])')
            check('deleting active single clears input and old result', page.evaluate('selectedFile===null && currentResultData===null') and not page.locator('#results-display').is_visible())
            page.evaluate('''() => {
                evaluatePreAnalyticQuality = () => ({quality_passed:true,has_quality_advisory:false,warnings:[]});
                runClientSideInference = async file => {modelCalls++;return fixture(file);};
            }''')
            page.locator('#file-input').set_input_files({'name':'delete-from-batch.png','mimeType':'image/png','buffer':SAMPLE.read_bytes()})
            page.locator('#btn-submit').click();page.wait_for_function('!isSubmitting && currentResultData?.filename==="delete-from-batch.png"')
            page.evaluate('caseWorkspace.save()');deleting=page.evaluate('caseWorkspace.state.activeId')
            page.locator('[data-case-view=queue]').click()
            page.once('dialog',lambda dialog:dialog.accept())
            page.evaluate('(id)=>caseWorkspace.remove([id])',deleting)
            page.locator('[data-case-view=single]').click()
            check('Batch deletion clears the cached single snapshot', page.evaluate('selectedFile===null && currentResultData===null') and page.locator('#empty-state').is_visible() and not page.locator('#results-display').is_visible())
            check('no browser errors', not errors)
            context.close();browser.close()
    finally:
        server.terminate();server.wait()
    print(json.dumps({'checks':checks},indent=2))
    return checks


if __name__ == '__main__': main()
