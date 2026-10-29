"""Progress uses real job counts/stages; model sessions are stubbed, never clinical validation."""
import json,os,socket,subprocess,time,urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
checks=[]
def ck(name,ok):
 assert ok,name
 checks.append(name)
with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
server=subprocess.Popen(['node','tb_pwa_offline_workstation/server.js'],cwd=ROOT,env={**os.environ,'PORT':str(port)},stdout=subprocess.DEVNULL)
try:
 for _ in range(100):
  try:urllib.request.urlopen(f'http://127.0.0.1:{port}',timeout=.2).close();break
  except OSError:time.sleep(.05)
 with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);context=browser.new_context(service_workers='block');page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.add_init_script("localStorage.setItem('tb_triage_disclaimer_accepted','true')");page.goto(f'http://127.0.0.1:{port}');page.wait_for_function('window.caseWorkspace && !caseWorkspace.state.loadingArchives')
  ck('idle loader hidden',not page.locator('#work-progress').is_visible())
  page.evaluate('''() => {window.realProcessItem=processBatchItem;window.callbacks=[];processBatchItem=(file,report)=>new Promise(resolve=>{callbacks.push({file,report,resolve});report({phase:'inference'});});caseWorkspace.addFiles(['one.png','two.png','three.png'].map(name=>new File(['x'],name,{type:'image/png'})));window.job=caseWorkspace.process();}''')
  page.wait_for_function('callbacks.length===1')
  ck('busy progress immediately visible',page.locator('#work-progress').is_visible() and page.locator('#work-progress').get_attribute('data-state')=='busy')
  ck('current filename shown',page.locator('#work-file').inner_text()=='one.png')
  ck('no fake overall percentage before first result',page.locator('#work-meter').get_attribute('value')=='0')
  ck('scope count reflects three inputs','0/3' in page.locator('#work-count').inner_text())
  ck('duplicate processing disabled',page.locator('#case-process').is_disabled())
  page.evaluate("callbacks[0].report({phase:'download',percent:25,received:1048576})")
  ck('download has explicit stage and measured percentage',page.locator('#work-phase').inner_text()=='Unduh model' and '25%' in page.locator('#work-count').inner_text())
  page.evaluate('toggleLanguage()');ck('language switch preserves active loading','Download model' in page.locator('#work-phase').inner_text() and page.locator('#work-file').inner_text()=='one.png')
  page.evaluate('''() => {window.makeResult=(name,p)=>({filename:name,probability_tb:p,probability_normal:1-p,triage_action:p>.5?'AUTO_FLAG_TB_URGENT':'ASSISTIVE_NORMAL_DOCTOR_VERIFY',conformal_details:{conformal_set:[p>.5?'Tuberculosis':'Normal']},ood_report:{available:false,is_ood:null},iqa_report:{quality_passed:true},allow_autonomous_release:false});callbacks[0].resolve(makeResult(callbacks[0].file.name,.01));}''')
  page.wait_for_function('callbacks.length===2');ck('first result advances measured progress','1/3' in page.locator('#work-count').inner_text());ck('next image updates filename',page.locator('#work-file').inner_text()=='two.png')
  page.evaluate('callbacks[1].resolve(makeResult(callbacks[1].file.name,.9))');page.wait_for_function('callbacks.length===3');page.evaluate('callbacks[2].resolve({filename:callbacks[2].file.name,triage_action:"ERROR_RUNTIME"})');page.wait_for_function('!caseWorkspace.state.running')
  ck('errors counted separately','2/3' in page.locator('#work-count').inner_text() and 'Failed: 1' in page.locator('#work-count').inner_text());ck('completion stops spinner state',page.locator('#work-progress').get_attribute('data-state')=='attention')
  ck('distinct results stay attached to own files',page.evaluate('caseWorkspace.state.records[0].result.probability_tb===.01&&caseWorkspace.state.records[1].result.probability_tb===.9&&caseWorkspace.state.records[2].state==="failed"'))
  ck('row scores show differences',page.locator('.case-score').all_text_contents()==['Model score: 1.00%','Model score: 90.00%'])
  page.once('dialog',lambda d:d.accept());page.evaluate('caseWorkspace.resetSession()');ck('reset clears previous progress',not page.locator('#work-progress').is_visible())
  page.evaluate('''() => {window.callbacks=[];caseWorkspace.addFiles(['cancel1.png','cancel2.png'].map(name=>new File(['x'],name)));window.job=caseWorkspace.process();}''');page.wait_for_function('callbacks.length===1');page.locator('#case-cancel').click();ck('cancellation shows waiting state','Waiting' in page.locator('#work-help').inner_text());page.evaluate('callbacks[0].resolve(makeResult(callbacks[0].file.name,.1))');page.wait_for_function('!caseWorkspace.state.running');ck('cancelled counts not called processed','1/2' in page.locator('#work-count').inner_text() and 'Cancelled: 1' in page.locator('#work-count').inner_text())
  page.evaluate('''() => {window.old=workProgress.start('test',{phase:'model'});window.newJob=workProgress.start('test',{phase:'decode',filename:'new.png'});workProgress.finish('test',{status:'done'},old);}''');ck('stale token cannot finish newer job',page.locator('#work-progress').get_attribute('data-state')=='busy' and page.locator('#work-file').inner_text()=='new.png');page.evaluate('workProgress.finish("test",{},newJob);workProgress.clear()')
  # Real file decoding/preprocessing path, fake ORT output: verifies per-image invocation without heavy inference.
  page.evaluate('''() => {processBatchItem=realProcessItem;window.ortCalls=0;evaluatePreAnalyticQuality=()=>({quality_passed:true});preprocessImageForONNX=img=>({width:img.naturalWidth,height:img.naturalHeight});getOrtSession=async()=>({outputNames:['logits'],run:async()=>({logits:{data:new Float32Array(++ortCalls===1?[8,-8]:[-8,8])}})});}''')
  a=ROOT/'tb_pwa_offline_workstation/samples/nitrd_apical_tb.png';b=ROOT/'tb_pwa_offline_workstation/samples/normal_healthy_case.png'
  page.locator('#case-files').set_input_files([str(a),str(b)]);page.wait_for_function('caseWorkspace.state.records.length===4');ck('import completion has actual count','2/2' in page.locator('#work-count').inner_text());page.locator('#case-filter').select_option('pending');page.evaluate('window.actualJob=caseWorkspace.process();void 0');page.wait_for_function('!caseWorkspace.state.running&&ortCalls===2')
  ck('real pipeline consumes both image files',page.evaluate('ortCalls===2&&caseWorkspace.state.records.slice(2).every(r=>r.result.filename===r.filename)'))
  ck('stubbed differing logits produce differing predictions',page.evaluate('caseWorkspace.state.records[2].result.probability_tb<.01&&caseWorkspace.state.records[3].result.probability_tb>.99'))
  ck('no autonomous release',page.evaluate('caseWorkspace.state.records.slice(2).every(r=>r.result.allow_autonomous_release===false)'))
  ck('no browser errors',not errors)
  page.screenshot(path='/workspace/audit-tb/deployment-v4.5/loading-reviewed.png',full_page=False)
  context.close();browser.close()
 print(json.dumps({'passed':len(checks),'checks':checks},indent=2))
finally:server.terminate();server.wait()
