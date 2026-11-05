"""Real-browser control regressions; synthetic results, no model inference."""
import os,socket,subprocess,time,urllib.request,json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];checks=[]
def check(name,ok):
 assert ok,name
 checks.append(name)
with socket.socket() as s:s.bind(('127.0.0.1',0));port=s.getsockname()[1]
server=subprocess.Popen(['node','tb_pwa_offline_workstation/server.js'],cwd=ROOT,env={**os.environ,'PORT':str(port)},stdout=subprocess.DEVNULL)
try:
 for _ in range(100):
  try:urllib.request.urlopen(f'http://127.0.0.1:{port}',timeout=.2).close();break
  except OSError:time.sleep(.05)
 with sync_playwright() as pw:
  b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  p=b.new_page(service_workers='block');p.add_init_script("localStorage.setItem('tb_triage_disclaimer_accepted','true')");p.goto(f'http://127.0.0.1:{port}');p.wait_for_function('window.caseWorkspace && !caseWorkspace.state.loadingArchives')
  p.evaluate("""()=>{for(const key of ['iqa','ood','conformal'])moduleControls.set(key,false);const r=moduleControls.decorate({probability_tb:.0023,probability_normal:.9977,triage_action:'REFER_AMBIGUOUS_TO_DOCTOR',iqa_report:{quality_passed:true},ood_report:{available:false},conformal_details:{conformal_set:[]}});window.testResult=r;renderSingleResults(r);}""")
  check('low raw score independent of conformal',p.locator('#action-title').inner_text()=='Skor rendah')
  check('not rendered as rejection',p.locator('#idiograph-banner').evaluate('(e)=>e.classList.contains("action-normal")'))
  check('captured settings visible','Conformal: Nonaktif' in p.locator('#result-module-config').inner_text())
  check('disabled not empty',p.evaluate('caseEvidence.derive(testResult).conformal_state')=='disabled')
  check('disabled is not missing evidence',p.evaluate('!caseEvidence.derive(testResult).evidence_unknown'))
  check('raw score retained',p.evaluate('testResult.probability_tb===.0023'))
  check('all-off does not veto low score',p.evaluate("testResult.triage_action==='ASSISTIVE_NORMAL_DOCTOR_VERIFY'"))
  check('all-off preserves high score',p.evaluate("moduleControls.decorate({...testResult,probability_tb:.99,probability_normal:.01}).triage_action==='AUTO_FLAG_TB_URGENT'"))
  check('technical rejection preserved',p.evaluate("moduleControls.decorate({triage_action:'REJECT_CORRUPT_IMAGE'}).triage_action==='REJECT_CORRUPT_IMAGE'"))
  check('eight switch combinations',p.evaluate("""()=>{for(let mask=0;mask<8;mask++){const cfg={iqa:!!(mask&1),ood:!!(mask&2),conformal:!!(mask&4)};const r=moduleControls.decorate({probability_tb:.0023,probability_normal:.9977,iqa_report:{quality_passed:true,has_quality_advisory:false},ood_report:{available:true,is_ood:false,mahalanobis_distance:1,threshold:2,reference_status:'verified'},conformal_details:{conformal_set:['Normal']}},cfg);if(r.triage_action!=='ASSISTIVE_NORMAL_DOCTOR_VERIFY'||caseEvidence.derive(r).score_band!=='low')return false;}return true;}"""))
  p.evaluate('toggleLanguage()');check('English low score',p.locator('#action-title').inner_text()=='Low score')
  b.close()
 print(json.dumps({'passed':len(checks),'checks':checks},indent=2))
finally:server.terminate();server.wait()
