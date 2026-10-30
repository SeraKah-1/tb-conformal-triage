"""Presentation regressions for raw score/evidence separation and stale technical states.
All result payloads are synthetic. No model inference or threshold changes.
"""
from pathlib import Path
import json,os,socket,subprocess,time,urllib.request
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
checks=[]
def ck(name,condition):
    assert condition,name
    checks.append(name)
with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
server=subprocess.Popen(['node','tb_pwa_offline_workstation/server.js'],cwd=ROOT,env={**os.environ,'PORT':str(port)},stdout=subprocess.DEVNULL)
try:
    for _ in range(100):
        try:urllib.request.urlopen(f'http://127.0.0.1:{port}',timeout=.2).close();break
        except OSError:time.sleep(.05)
    with sync_playwright() as pw:
        browser=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=browser.new_page(service_workers='block');errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        page.add_init_script("localStorage.setItem('tb_triage_disclaimer_accepted','true')");page.goto(f'http://127.0.0.1:{port}');page.wait_for_function('window.caseEvidence && window.caseWorkspace && !caseWorkspace.state.loadingArchives')
        page.evaluate('''() => {
            window.probeResult=(p=.933)=>({filename:'probe.png',triage_action:'REFER_AMBIGUOUS_TO_DOCTOR',probability_tb:p,probability_normal:1-p,conformal_details:{conformal_set:['Tuberculosis'],safety_interlock_engaged:true,calibration_status:'legacy_unverified'},ood_report:{available:true,is_ood:true,mahalanobis_distance:4,threshold:3,reference_status:'legacy_unverified'},iqa_report:{quality_passed:true,has_quality_advisory:false,warnings:[]},allow_autonomous_release:false,inference_latency_ms:1});
            window.prepareHeat=()=>{const result=probeResult();result.hirescam_heatmap_base64='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jUVkAAAAASUVORK5CYII=';result.source_image=result.hirescam_heatmap_base64;renderSingleResults(result);return result;};
        }''')
        page.evaluate('renderSingleResults(probeResult())')
        ck('outside-reference result retains raw high-score banner',page.locator('#action-title').inner_text()=='Skor tinggi' and page.locator('#val-prob-tb').inner_text()=='93.30%')
        ck('high-score review remains mandatory',page.locator('#action-badge').text_content()=='Review wajib')
        ck('outside and unverified reference have distinct reasons',page.locator('#result-evidence [data-review-reason=ood_outside]').is_visible() and page.locator('#result-evidence [data-review-reason=ood_reference_unverified]').is_visible())
        ck('compatibility action remains unchanged',page.evaluate('currentResultData.triage_action==="REFER_AMBIGUOUS_TO_DOCTOR"'))
        page.evaluate("toggleLanguage()")
        ck('high-score banner translates without changing evidence',page.locator('#action-title').inner_text()=='High score' and page.locator('#result-evidence [data-review-reason=ood_outside]').inner_text()=='Outside reference')
        page.evaluate('''() => {const r=probeResult(.4);r.ood_report={available:true,is_ood:false,mahalanobis_distance:1,threshold:3,reference_status:'legacy_unverified'};renderSingleResults(r);}''')
        page.locator('.tech-audit-details > summary').click()
        ck('singleton TB intermediate is not an ambiguous conformal banner',page.locator('#action-title').inner_text()=='Intermediate score' and page.locator('#met-set').inner_text()=='{TB}')
        ck('singleton intermediate has specific policy reason',page.locator('#result-evidence [data-review-reason=policy_intermediate]').is_visible() and page.locator('#result-evidence [data-review-reason=conformal_multiple]').count()==0)
        page.evaluate('''() => {const r=probeResult(.03);r.conformal_details.conformal_set=['Normal'];renderSingleResults(r);}''')
        ck('negative model label is displayed as non-TB, not healthy',page.locator('#met-set').inner_text()=='{Non-TB}' and page.locator('#action-title').inner_text()=='Low score')
        for case in ['null','finite']:
            page.evaluate('''kind => {const r=probeResult();r.ood_report=kind==='null'?{available:false,is_ood:true,mahalanobis_distance:null,threshold:null}:{available:false,is_ood:true,mahalanobis_distance:4,threshold:3};renderSingleResults(r);}''',case)
            ck('unavailable OOD '+case+' cannot reuse outside/within metadata',page.locator('#met-ood').inner_text().startswith('Unavailable') and page.locator('#result-evidence [data-review-reason=ood_unavailable]').is_visible())
            ck('unavailable OOD '+case+' retains independent raw score',page.locator('#val-prob-tb').inner_text()=='93.30%' and page.locator('#action-title').inner_text()=='High score')
        page.evaluate("() => {const r=probeResult();r.conformal_details.conformal_set=['Healthy'];renderSingleResults(r);}")
        ck('malformed class name is unavailable instead of a healthy finding',page.locator('#met-set').inner_text()=='Unavailable' and page.locator('#result-evidence [data-review-reason=conformal_unavailable]').is_visible())
        page.evaluate("() => {const r=probeResult();r.probability_normal=.9;renderSingleResults(r);}")
        ck('inconsistent probability pair clears all displayed scores',page.locator('#val-prob-tb').inner_text()=='N/A' and page.locator('#val-prob-norm').inner_text()=='N/A')
        ck('malformed result hides previous evidence panel',not page.locator('#result-evidence').is_visible())
        page.evaluate("() => {const r=prepareHeat();renderRuntimeError('test error',r.source_image);}")
        ck('technical error disables old heatmap controls',page.locator('#btn-mode-heat').is_disabled() and page.locator('#btn-mode-split').is_disabled())
        ck('technical error cannot expose previous patient evidence',not page.locator('#result-evidence').is_visible() and not page.locator('#case-heatmap-notice').is_visible())
        page.evaluate("() => {const r=prepareHeat();renderRejectionResults('blank.png',{reject_code:'REJECT_INVALID_ANATOMY_DOCUMENT',quality_passed:false,warnings:['blank']},r.source_image);}")
        ck('rejected image disables old heatmap controls',page.locator('#btn-mode-heat').is_disabled() and page.locator('#btn-mode-split').is_disabled())
        ck('rejected image does not show stale evidence or percentages',not page.locator('#result-evidence').is_visible() and page.locator('#val-prob-tb').inner_text()=='N/A')
        page.evaluate('toggleLanguage()')
        ck('rejection translation keeps technical state without old evidence',page.locator('#action-title').inner_text()=='Gambar kosong' and not page.locator('#result-evidence').is_visible())
        ck('no model inference was initialized',page.evaluate('ortSession===null'))
        ck('no browser errors',not errors);browser.close()
    print(json.dumps({'passed':len(checks),'checks':checks},indent=2))
finally:server.terminate();server.wait()
