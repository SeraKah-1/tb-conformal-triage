from playwright.sync_api import sync_playwright
import json,os,socket,subprocess,time,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
server=subprocess.Popen(['node','tb_pwa_offline_workstation/server.js'],cwd=ROOT,env={**os.environ,'PORT':str(port)},stdout=subprocess.DEVNULL)
import atexit
atexit.register(lambda: (server.terminate(),server.wait()))
for _ in range(100):
 try:urllib.request.urlopen(f'http://127.0.0.1:{port}',timeout=.2).close();break
 except OSError:time.sleep(.05)
checks=[]
def ck(n,b):assert b,n;checks.append(n)
with sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);p=b.new_page(service_workers='block');p.add_init_script("localStorage.setItem('tb_triage_disclaimer_accepted','true')");p.goto(f'http://127.0.0.1:{port}');p.wait_for_function('window.moduleControls && window.dicomInput && window.caseWorkspace && !caseWorkspace.state.loadingArchives')
 ck('all three switches default on',p.locator('#module-controls input:checked').count()==3)
 p.locator('#file-input').set_input_files(str(ROOT/'tests/fixtures/uncompressed_2x2.dcm'));p.wait_for_function('selectedFile && selectedFile.type==="image/png"');ck('DICOM converted locally before preview',p.evaluate('selectedFile.dicomMetadata.rows===2 && selectedFile.dicomMetadata.columns===2'))
 p.evaluate("() => {moduleControls.set('conformal',false);const r={filename:'mock.png',triage_action:'ASSISTIVE_NORMAL_DOCTOR_VERIFY',probability_tb:.1,probability_normal:.9,conformal_details:{conformal_set:['Normal']},iqa_report:{quality_passed:true},ood_report:{available:false},allow_autonomous_release:false};window.mock=moduleControls.decorate(r,moduleControls.snapshot());renderSingleResults(mock);}")
 ck('conformal off retains numeric score',p.locator('#val-prob-tb').inner_text()=='10.00%');ck('disabled module forces review',p.evaluate('mock.triage_action==="REFER_AMBIGUOUS_TO_DOCTOR" && mock.conformal_details.conformal_set===null'));ck('off reason visible',p.locator('[data-review-reason=conformal_disabled]').count()>0)
 p.evaluate("moduleControls.set('conformal',true);caseWorkspace.setView('queue')");p.locator('#case-files').set_input_files(str(ROOT/'tests/fixtures/uncompressed_2x2.dcm'));p.wait_for_function('caseWorkspace.state.records.some(r=>r.filename==="uncompressed_2x2.png")');ck('batch imports converted DICOM',p.evaluate('caseWorkspace.state.records.some(r=>r.image.type==="image/png" && r.sourcePath.endsWith(".dcm"))'))
 ck('no model inference',p.evaluate('ortSession===null'));b.close()
print(json.dumps({'passed':len(checks),'checks':checks},indent=2))
