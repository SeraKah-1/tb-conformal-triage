"""Synthetic1,001-case pagination/filter checks. No real model inference."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
import os,socket,subprocess,time,urllib.request,json
from playwright.sync_api import sync_playwright
with socket.socket() as s:s.bind(('127.0.0.1',0));port=s.getsockname()[1]
server=subprocess.Popen(['node','tb_pwa_offline_workstation/server.js'],cwd=ROOT,env={**os.environ,'PORT':str(port)},stdout=subprocess.DEVNULL)
checks=[]
def ck(name,condition):
 assert condition,name
 checks.append(name)
try:
 for _ in range(100):
  try:urllib.request.urlopen(f'http://127.0.0.1:{port}',timeout=.3).close();break
  except OSError:time.sleep(.05)
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),args=['--no-sandbox']);c=b.new_context(service_workers='block',accept_downloads=True)
  page=c.new_page();page.add_init_script("localStorage.setItem('tb_triage_disclaimer_accepted','true')");page.goto(f'http://127.0.0.1:{port}');page.wait_for_function('window.caseWorkspace && !caseWorkspace.state.loadingArchives')
  page.evaluate('''()=>{
   caseWorkspace.addFiles(Array.from({length:1001},(_,i)=>new File(['x'],`image-${String(i).padStart(4,'0')}.png`,{type:'image/png'})));
   caseWorkspace.state.records.forEach((r,i)=>{r.state='complete';r.saved=true;r.savedRevision=r.revision;r.result={filename:r.filename,triage_action:i===1000?'REJECT_CORRUPT_IMAGE':'REFER_AMBIGUOUS_TO_DOCTOR',probability_tb:.1,probability_normal:.9,conformal_details:{conformal_set:i>=800&&i<1000?['Normal','TB']:i>=600&&i<800?[]:['Normal'],safety_interlock_engaged:true},ood_report:{available:!(i>=400&&i<600),is_ood:i>=200&&i<400,mahalanobis_distance:1,threshold:3},iqa_report:{quality_passed:true,has_quality_advisory:i%17===0},inference_latency_ms:1};});
   caseWorkspace.setLanguage('id');
  }''')
  ck('1001cases render only50rows',page.locator('.case-row').count()==50)
  ck('21pages reported','/21' in page.locator('.case-page-status').inner_text())
  page.locator('.case-checks > summary').click()
  ck('OOD groups exclude technical rejection',page.locator('[data-filter=oodIssue] strong').inner_text()=='400')
  ck('200multiple-label sets counted',page.locator('[data-filter=conformalAmbiguous] strong').inner_text()=='200')
  ck('200empty sets counted',page.locator('[data-filter=conformalEmpty] strong').inner_text()=='200')
  page.evaluate('caseWorkspace.open(caseWorkspace.state.records[49].id)')
  ck('IQA badge derives actual pass',page.locator('[data-mechanism=IQA] strong').inner_text()=='Lolos')
  ck('OOD badge derives actual within-reference',page.locator('[data-mechanism=OOD] strong').inner_text()=='Dalam referensi')
  ck('conformal badge derives singleton',page.locator('[data-mechanism=Conformal] strong').inner_text()=='Label tunggal')
  page.locator('#case-detail-tools button').filter(has_text='Berikutnya').click()
  ck('review Next crosses page boundary',page.evaluate('caseWorkspace.state.pageIndex===1&&caseWorkspace.state.activeId===caseWorkspace.state.records[50].id'))
  ck('active row rendered',page.locator('.case-open').first.get_attribute('data-case-id')==page.evaluate('caseWorkspace.state.activeId'))
  page.locator('#case-filter').select_option('conformalAmbiguous')
  ck('filter resets page',page.evaluate('caseWorkspace.state.pageIndex===0'))
  ck('filter preserves bounded DOM',page.locator('.case-row').count()==50)
  ck('filter exposes reason','lebih dari satu label' in page.locator('.case-filter-reason').inner_text())
  with page.expect_download() as d:page.evaluate("caseWorkspace.export('csv')")
  text=open(d.value.path(),encoding='utf-8-sig').read();ck('export includes200filtered records',len(text.splitlines())==201)
  page.locator('#case-filter').select_option('oodOutside');ck('outside count200','/200' in page.locator('.case-page-status').inner_text())
  page.locator('#case-filter').select_option('oodUnavailable');ck('unavailable count200','/200' in page.locator('.case-page-status').inner_text())
  page.locator('#case-filter').select_option('all');page.evaluate('caseWorkspace.open(caseWorkspace.state.records[1000].id)');ck('open last case reveals page21',page.evaluate('caseWorkspace.state.pageIndex===20') and page.locator('.case-row').count()==1)
  page.once('dialog',lambda d:d.accept());page.evaluate('caseWorkspace.remove([caseWorkspace.state.records[1000].id])');ck('delete last page clamps',page.evaluate('caseWorkspace.state.pageIndex===19') and page.locator('.case-row').count()==50)
  c.close();b.close()
 print(json.dumps({'passed':len(checks),'checks':checks},indent=2))
finally:server.terminate();server.wait()
