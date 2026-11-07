"""Browser orchestration failure/retry/admission checks; no model inference."""
import os,socket,subprocess,time,urllib.request,json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];checks=[]
def ck(name,value):
 assert value,name
 checks.append(name)
with socket.socket() as s:s.bind(('127.0.0.1',0));port=s.getsockname()[1]
server=subprocess.Popen(['node','tb_pwa_offline_workstation/server.js'],cwd=ROOT,env={**os.environ,'PORT':str(port)},stdout=subprocess.DEVNULL)
try:
 for _ in range(100):
  try:urllib.request.urlopen(f'http://127.0.0.1:{port}',timeout=.2).close();break
  except OSError:time.sleep(.05)
 with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=browser.new_page(service_workers='block');errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.add_init_script("localStorage.setItem('tb_triage_disclaimer_accepted','true')")
  page.goto(f'http://127.0.0.1:{port}');page.wait_for_function('window.caseWorkspace && !caseWorkspace.state.loadingArchives')
  page.evaluate('''()=>{window.fetches=0;window.creates=0;window.runtimeCloses=0;fetchModelBufferWithFallback=async()=>{fetches++;await new Promise(r=>setTimeout(r,20));return new ArrayBuffer(1)};tbRuntime.create=async()=>{creates++;return {close(){runtimeCloses++},run:async()=>{throw new Error('RUNTIME_TIMEOUT')}}};window.starts=Promise.all([getOrtSession(),getOrtSession()]);}''')
  ck('concurrent requests share one session',page.evaluate('async()=>{const s=await starts;return s[0]===s[1]&&fetches===1&&creates===1&&!isModelLoading}'))
  ck('failed runtime clears owner and closes worker',page.evaluate("async()=>{try{await ortSession.run({})}catch(e){}return ortSession===null&&runtimeCloses===1}"))
  ck('explicit retry creates a fresh session',page.evaluate('async()=>{await getOrtSession();return creates===2&&!isModelLoading}'))
  page.evaluate('''()=>{ortSession.close();ortSession=null;tbRuntime.create=async()=>{throw new Error('WORKER_FAILED')};}''')
  ck('initialization failure clears loading and can retry',page.evaluate("async()=>{try{await getOrtSession()}catch(e){}return !isModelLoading&&runtimeInitialization===null&&ortSession===null}"))
  page.evaluate('''()=>{caseWorkspace.setView('queue');window.calls=0;processBatchItem=async file=>{calls++;return technicalBatchResult(file,'ERROR_RUNTIME','RUNTIME_TIMEOUT',null,1,{iqa:false,ood:false,conformal:false});};caseWorkspace.addFiles(['a.png','b.png','c.png'].map(n=>new File(['x'],n)));window.batch=caseWorkspace.process();}''')
  page.wait_for_function('!caseWorkspace.state.running');ck('runtime failure stops batch after one call',page.evaluate('calls===1&&caseWorkspace.state.records[0].state==="failed"&&caseWorkspace.state.records.slice(1).every(r=>r.state==="pending")'))
  ck('failure reason preserved for retry',page.evaluate('caseWorkspace.state.records[0].result.warning.includes("RUNTIME_TIMEOUT")'))
  ck('progress ends explicitly, remaining count not presented as done',page.locator('#work-progress').get_attribute('data-state')=='attention' and '0/3' in page.locator('#work-count').inner_text())
  page.evaluate("caseWorkspace.addFiles(Array.from({length:1998},(_,i)=>new File(['x'],'extra'+i+'.png')))")
  ck('over-limit admission is atomic',page.evaluate('caseWorkspace.state.records.length===3'))
  page.evaluate("caseWorkspace.addFiles([new File([new Uint8Array(16*1024*1024+1)],'large.png')])")
  ck('oversized file does not enter queue',page.evaluate('caseWorkspace.state.records.length===3'))
  ck('decode deadline clears handlers and abandons source',page.evaluate("async()=>{const im={src:'',complete:false};try{await decodeImageForRun(im,'test',5)}catch(e){return e.message==='IMAGE_DECODE_TIMEOUT'&&im.src===''&&im.onload===null&&im.onerror===null}return false}"))
  ck('no uncaught browser errors',not errors)
  Path('/workspace/audit-tb/runtime-structural-20261107').mkdir(exist_ok=True)
  page.screenshot(path='/workspace/audit-tb/runtime-structural-20261107/failure-state.png',full_page=True)
  browser.close()
 print(json.dumps({'passed':len(checks),'checks':checks},indent=2))
finally:server.terminate();server.wait()
