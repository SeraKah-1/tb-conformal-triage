"""Per-batch settings and technical-result provenance; no model inference."""
import os,socket,subprocess,time,urllib.request,json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];checks=[]
def ck(n,value):
 assert value,n
 checks.append(n)
with socket.socket() as sock:sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
server=subprocess.Popen(['node','tb_pwa_offline_workstation/server.js'],cwd=ROOT,env={**os.environ,'PORT':str(port)},stdout=subprocess.DEVNULL)
try:
 for _ in range(100):
  try:urllib.request.urlopen(f'http://127.0.0.1:{port}',timeout=.2).close();break
  except OSError:time.sleep(.05)
 with sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=browser.new_page(service_workers='block');page.add_init_script("localStorage.setItem('tb_triage_disclaimer_accepted','true')");page.goto(f'http://127.0.0.1:{port}');page.wait_for_function('window.moduleControls && window.caseWorkspace && !caseWorkspace.state.loadingArchives')
  page.evaluate('''async()=>{caseWorkspace.setView('queue');const bytes=await(await fetch('/samples/nitrd_apical_tb.png')).blob();caseWorkspace.addFiles([new File([bytes],'first.png',{type:'image/png'}),new File([bytes],'second.png',{type:'image/png'})]);window.observed=[];evaluatePreAnalyticQuality=()=>({quality_passed:true,has_quality_advisory:false,warnings:[]});runClientSideInference=async(file,img,iqa,report,captured)=>{observed.push(captured);if(observed.length===1)await new Promise(resolve=>window.releaseFirst=resolve);return moduleControls.decorate({filename:file.name,triage_action:'REFER_AMBIGUOUS_TO_DOCTOR',probability_tb:.3,probability_normal:.7,conformal_details:{conformal_set:['TB']},iqa_report:iqa,ood_report:{available:false},allow_autonomous_release:false},captured);};window.pendingBatch=caseWorkspace.process();}''')
  page.wait_for_function('typeof releaseFirst === "function"');page.evaluate("moduleControls.set('ood',false);releaseFirst()");page.wait_for_function('!caseWorkspace.state.running')
  ck('two cases processed',page.evaluate('observed.length===2'))
  ck('whole batch keeps captured configuration',page.evaluate('observed.every(x=>x.iqa===true&&x.ood===true&&x.conformal===true)'))
  ck('stored results keep per-run settings',page.evaluate('caseWorkspace.state.records.every(r=>r.result.module_configuration.ood===true)'))
  page.evaluate('''async()=>{const raw=await(await fetch('/samples/nitrd_apical_tb.png')).blob();window.dicomFile=new File([raw],'rendered.png',{type:'image/png'});dicomFile.dicomMetadata={photometric:'MONOCHROME1',rows:512,columns:512,transferSyntax:'1.2.840.10008.1.2.1'};evaluatePreAnalyticQuality=()=>({quality_passed:false,reject_code:'REJECT_INVALID_ANATOMY_DOCUMENT',warnings:['blank'],is_inverted:true});window.rejected=await processBatchItem(dicomFile,null,{iqa:true,ood:false,conformal:true});}''')
  ck('rejection keeps explicit captured settings',page.evaluate('rejected.module_configuration.ood===false&&rejected.triage_action.startsWith("REJECT_")'))
  ck('rejected DICOM keeps rendering provenance',page.evaluate('rejected.source_dicom.photometric==="MONOCHROME1"'))
  ck('technical guards remain active with module off',page.evaluate('rejected.probability_tb===null&&rejected.allow_autonomous_release===false'))
  page.evaluate('''async()=>{caseWorkspace.setView('single');caseWorkspace.captureSingle(dicomFile,rejected);await caseWorkspace.save();}''');page.wait_for_function('caseWorkspace.state.records.some(r=>r.saved&&r.filename==="rendered.png")')
  page.reload();page.wait_for_function('window.caseWorkspace && !caseWorkspace.state.loadingArchives')
  ck('DICOM provenance survives IndexedDB/reload',page.evaluate('caseWorkspace.state.records.some(r=>r.filename==="rendered.png"&&r.result.source_dicom.photometric==="MONOCHROME1"&&r.result.module_configuration.ood===false)'))
  page.evaluate('''async()=>{renderSingleResults({filename:'old.png',triage_action:'REFER_AMBIGUOUS_TO_DOCTOR',probability_tb:.93,probability_normal:.07,conformal_details:{conformal_set:['TB']},iqa_report:{quality_passed:true},ood_report:{available:false},allow_autonomous_release:false});await handleSingleFile(new File(['broken'],'invalid.dcm',{type:'application/dicom'}));}''')
  ck('failed DICOM conversion clears previous result',page.evaluate('currentResultData===null') and page.locator('#val-prob-tb').inner_text()=='N/A' and page.locator('#val-prob-norm').inner_text()=='N/A')
  ck('no model initialized',page.evaluate('ortSession===null'));browser.close()
 print(json.dumps({'passed':len(checks),'checks':checks},indent=2))
finally:server.terminate();server.wait()
