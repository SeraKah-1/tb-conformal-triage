"""Independent UI evidence projection, archive compatibility, and malformed evidence regressions.
Uses existing image bytes and synthetic model results, with no model inference.
"""
import csv,io,json,os,socket,subprocess,time,urllib.request
from pathlib import Path
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
        browser=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);context=browser.new_context(service_workers='block',accept_downloads=True);page=context.new_page();errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
        page.add_init_script("localStorage.setItem('tb_triage_disclaimer_accepted','true')")
        page.goto(f'http://127.0.0.1:{port}');page.wait_for_function('window.caseWorkspace && window.caseEvidence && !caseWorkspace.state.loadingArchives')
        ck('evidence module loaded from page source',page.locator('script[src*="evidence.js"]').count()==1)
        page.evaluate('''async () => {
            const bytes=await (await fetch('/samples/nitrd_apical_tb.png')).blob();
            const names=['high-ood.png','intermediate-single.png','low-ood.png','quality-multiple.png','missing-set.png','inconsistent-score.png','rejected.png'];
            caseWorkspace.addFiles(names.map(name=>new File([bytes],name,{type:'image/png'})));
            const result=(p,set,ood={available:true,is_ood:false,mahalanobis_distance:1,threshold:3,reference_status:'verified'})=>({probability_tb:p,probability_normal:1-p,triage_action:'REFER_AMBIGUOUS_TO_DOCTOR',conformal_details:{conformal_set:set,safety_interlock_engaged:true},ood_report:ood,iqa_report:{quality_passed:true,has_quality_advisory:false},allow_autonomous_release:false,inference_latency_ms:1});
            const outside={available:true,is_ood:true,mahalanobis_distance:4,threshold:3,reference_status:'legacy_unverified'};
            const values=[result(.933,['Tuberculosis'],outside),result(.4,['TB']),result(.03,['Normal'],outside),result(.15,['Normal','TB']),result(.03,null),result(.8,['TB']),result(.999,['TB'])];
            values[3].iqa_report.has_quality_advisory=true;values[4].iqa_report=null;values[4].ood_report=null;values[5].probability_normal=.8;values[6].triage_action='REJECT_CORRUPT_IMAGE';
            caseWorkspace.state.records.forEach((record,i)=>{record.state='complete';record.result={...values[i],filename:record.filename};record.resultGeneration=1;});caseWorkspace.setLanguage('id');
        }''')
        page.locator('#case-filter').select_option('high');ck('high filter includes guarded .933 only',page.locator('.case-row').count()==1 and page.locator('.case-open').inner_text()=='high-ood.png')
        ck('raw high score visible',page.locator('.case-score').inner_text()=='Skor model: 93.30%')
        ck('outside reference reason visible independently','Luar referensi' in page.locator('.case-row-issues').inner_text())
        page.locator('.case-open').click();ck('detail has outside reason',page.locator('#case-review-reasons [data-review-reason=ood_outside]').is_visible());ck('legacy reference qualified',page.locator('#case-review-reasons [data-review-reason=ood_reference_unverified]').is_visible())
        ck('raw high score banner survives OOD',page.locator('#action-title').inner_text()=='Skor tinggi');ck('main evidence gives OOD reason',page.locator('#result-evidence-reasons [data-review-reason=ood_outside]').is_visible());page.locator('.tech-audit-details > summary').click();ck('clinical class displayed as TB',page.locator('#met-set').inner_text()=='{TB}');ck('legacy action preserved',page.evaluate('caseWorkspace.state.records[0].result.triage_action === "REFER_AMBIGUOUS_TO_DOCTOR"'))
        page.locator('#case-detail-tools').get_by_role('button',name='Kembali',exact=True).click()
        page.locator('#case-filter').select_option('policyIntermediate');ck('singleton intermediate isolated',page.locator('.case-row').count()==1 and page.locator('.case-open').inner_text()=='intermediate-single.png');ck('intermediate is not conformal ambiguity','Skor intermediate' in page.locator('.case-row-issues').inner_text() and 'Label ganda' not in page.locator('.case-row-issues').inner_text())
        page.locator('#case-filter').select_option('conformalAmbiguous');ck('only actual multiple set matches',page.locator('.case-row').count()==1 and page.locator('.case-open').inner_text()=='quality-multiple.png')
        page.locator('#case-filter').select_option('iqaWarning');ck('quality warning independent filter',page.locator('.case-row').count()==1 and page.locator('.case-open').inner_text()=='quality-multiple.png')
        page.locator('#case-filter').select_option('low');ck('low score remains visible with OOD review',page.locator('.case-row').count()==1 and page.locator('.case-open').inner_text()=='low-ood.png' and 'Luar referensi' in page.locator('.case-row-issues').inner_text())
        page.locator('#case-filter').select_option('evidenceUnknown');ck('missing or malformed evidence isolated',page.locator('.case-row').count()==2);ck('malformed score not printed as a probability',page.locator('.case-score').count()==1)
        page.locator('#case-filter').select_option('oodReferenceUnverified');ck('legacy reference filter independent of distance',page.locator('.case-row').count()==2)
        page.evaluate('toggleLanguage()');ck('reason language switches to English','Unverified reference' in page.locator('.case-row-issues').first.inner_text())
        page.locator('#case-filter').select_option('high')
        with page.expect_download() as down:page.evaluate("caseWorkspace.export('csv')")
        text=Path(down.value.path()).read_text(encoding='utf-8-sig');rows=list(csv.reader(io.StringIO(text)));ck('export retains raw high score and reference qualification',rows[1][8]=='93.30%' and 'Reference unverified' in rows[1][11] and len(rows[1])==16 and 'Outside reference' in rows[1][15])
        page.locator('.case-open').click();page.evaluate('caseWorkspace.save()');page.wait_for_function('caseWorkspace.state.records[0].saved&&!caseWorkspace.state.records[0].saving')
        page.once('dialog',lambda dialog:dialog.accept());page.reload();page.wait_for_function('window.caseWorkspace && !caseWorkspace.state.loadingArchives');page.locator('[data-case-view=queue]').click();page.locator('#case-filter').select_option('high');ck('archived compatibility result derives high after reload',page.locator('.case-row').count()==1 and page.locator('.case-open').inner_text()=='high-ood.png');ck('archived legacy action unchanged',page.evaluate('caseWorkspace.state.records[0].result.triage_action === "REFER_AMBIGUOUS_TO_DOCTOR"'))
        ck('no autonomous release',page.evaluate('caseWorkspace.state.records.every(r=>caseEvidence.derive(r.result).review_required&&caseEvidence.derive(r.result).allow_autonomous_release===false)'))
        ck('no browser errors',not errors);context.close();browser.close()
    print(json.dumps({'passed':len(checks),'checks':checks},indent=2))
finally:server.terminate();server.wait()
