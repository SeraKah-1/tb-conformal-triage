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
  for width in [390,1440]:
   p=b.new_page(viewport={'width':width,'height':900},service_workers='block');p.add_init_script("localStorage.setItem('tb_triage_disclaimer_accepted','true')");p.goto(f'http://127.0.0.1:{port}');p.wait_for_function('window.caseWorkspace && !caseWorkspace.state.loadingArchives')
   check(f'{width} single skip target visible',p.locator('.skip-link').get_attribute('href')=='#drop-zone' and p.locator('#drop-zone').is_visible())
   check(f'{width} unfocused skip clipped',p.locator('.skip-link').evaluate('(e)=>getComputedStyle(e).clipPath')=='inset(50%)')
   p.locator('.skip-link').focus();check(f'{width} keyboard skip revealed',p.locator('.skip-link').evaluate('(e)=>e.getBoundingClientRect().top')==10)
   p.evaluate("caseWorkspace.setView('queue')")
   check(f'{width} batch skip target',p.locator('.skip-link').get_attribute('href')=='#case-workspace')
   check(f'{width} compact inputs',p.locator('#case-search').evaluate('(e)=>e.getBoundingClientRect().height')<=55)
   p.evaluate('''async()=>{const bytes=await(await fetch('/samples/nitrd_apical_tb.png')).blob();caseWorkspace.addFiles([new File([bytes],'review.png',{type:'image/png'})]);const r=caseWorkspace.state.records[0];r.state='complete';r.result={filename:r.filename,triage_action:'REFER_AMBIGUOUS_TO_DOCTOR',probability_tb:.93,probability_normal:.07,conformal_details:{conformal_set:['TB']},ood_report:{available:false},iqa_report:{quality_passed:true},allow_autonomous_release:false};caseWorkspace.setLanguage('id');}''');p.locator('.case-open').click()
   check(f'{width} detail skip target',p.locator('.skip-link').get_attribute('href')=='#processing-workspace')
   check(f'{width} no-heat controls disabled',p.locator('#slider-control').is_disabled() and p.locator('#slider-divider').is_hidden())
   p.evaluate("setSliderMode('heat');onSliderMove(0)")
   check(f'{width} no-heat bypass remains original',p.locator('#slider-control').input_value()=='100' and p.locator('#btn-mode-orig').evaluate('(e)=>e.classList.contains("active")'))
   check(f'{width} back styled',p.locator('#case-viewer-back').evaluate('(e)=>getComputedStyle(e).borderRadius')!='0px')
   p.evaluate("() => {const r=caseWorkspace.state.records[0];r.result.hirescam_heatmap_base64=r.result.source_image||document.getElementById('img-base').src;renderSingleResults({...r.result,source_image:document.getElementById('img-base').src});}")
   check(f'{width} stored heat enables split',p.locator('#slider-control').is_enabled() and p.locator('#slider-divider').is_visible())
   p.evaluate("setSliderMode('orig')");check(f'{width} original mode has no fake divider',p.locator('#slider-control').is_enabled() and p.locator('#slider-divider').is_hidden())
   p.locator('#slider-control').fill('35');p.locator('#slider-control').dispatch_event('input');check(f'{width} dragging from original restores split',p.locator('#slider-divider').is_visible() and p.locator('#slider-control').input_value()=='35')
   p.locator('#slider-viewport').scroll_into_view_if_needed();box=p.locator('#slider-viewport').bounding_box();p.mouse.move(box['x']+box['width']*.2,box['y']+box['height']*.5);p.mouse.down();p.mouse.move(box['x']+box['width']*.7,box['y']+box['height']*.5);p.mouse.up();check(f'{width} pointer drag',65<=float(p.locator('#slider-control').input_value())<=75)
   if width==390:
    cdp=p.context.new_cdp_session(p);point={'x':box['x']+box['width']*.3,'y':box['y']+box['height']*.5};cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[point]});point['x']=box['x']+box['width']*.6;cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[point]});cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]});check('touch drag',55<=float(p.locator('#slider-control').input_value())<=65)
   check(f'{width} no next case disabled',p.locator('#case-detail-tools [data-action=next]').is_disabled())
   p.screenshot(path=f'/workspace/audit-tb/controls-20261106/desktop-{width}.png',full_page=True)
   check(f'{width} no horizontal overflow',p.evaluate('document.documentElement.scrollWidth<=innerWidth'))
   check(f'{width} no model run',p.evaluate('ortSession===null'))
   p.locator('#case-viewer-back').click();check(f'{width} back restores skip target',p.locator('.skip-link').get_attribute('href')=='#case-workspace' and p.locator('#case-workspace').is_visible() and p.locator('#case-viewer-back').is_hidden())
   p.evaluate("() => {const r=caseWorkspace.state.records[0];r.state='pending';r.result=null;caseWorkspace.open(r.id);}");check(f'{width} pending detail skip target visible',p.locator('.skip-link').get_attribute('href')=='#processing-workspace' and p.locator('#processing-workspace').is_visible());p.close()
  b.close()
 print(json.dumps({'passed':len(checks),'checks':checks},indent=2))
finally:server.terminate();server.wait()
