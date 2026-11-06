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
  p.evaluate("""()=>{window.camFixture=new Float32Array(16);camFixture[5]=.001;window.h=generateHeatmapDataUrl(camFixture,64,64,.0023);}""")
  check('low score retains weak CAM',p.evaluate("h?.startsWith('data:image/png')"))
  check('rendering independent of score cutoff',p.evaluate("generateHeatmapDataUrl(camFixture,64,64,.0023)!==null && generateHeatmapDataUrl(camFixture,64,64,.99)!==null"))
  check('invalid CAM rejected',p.evaluate("generateHeatmapDataUrl([NaN,0,0,0],64,64,.9)===null"))
  check('zero map transparent',p.evaluate("""async()=>{const img=new Image();img.src=generateHeatmapDataUrl(new Float32Array(16),4,4,.0023);await img.decode();const c=document.createElement('canvas');c.width=c.height=4;const x=c.getContext('2d');x.drawImage(img,0,0);return x.getImageData(0,0,4,4).data.every((v,i)=>i%4!==3||v===0);}"""))
  p.evaluate("""async()=>{getOrtSession=async()=>({run:async()=>({logits:{data:new Float32Array([0,Math.log(.0023/.9977)*2.1161616])},cam:{data:camFixture}})});preprocessImageForONNX=()=>({});for(const k of ['iqa','ood','conformal'])moduleControls.set(k,false);window.actual=await runClientSideInference(new File(['x'],'test.png'),{naturalWidth:64,naturalHeight:64},{quality_passed:true});renderSingleResults({...actual,source_image:h});}""")
  check('real inference wrapper returns heatmap',p.evaluate("actual.hirescam_heatmap_base64?.startsWith('data:image/png')"))
  check('wrapper records disabled settings',p.evaluate('actual.module_configuration.conformal===false && actual.conformal_details.disabled===true'))
  check('result enables slider',p.locator('#slider-control').is_enabled())
  p.locator('#slider-control').fill('70');p.locator('#slider-control').dispatch_event('input');check('slider clips generated map','70%' in p.locator('#img-heat').evaluate('(e)=>e.style.clipPath'))
  b.close()
 print(json.dumps({'passed':len(checks),'checks':checks},indent=2))
finally:server.terminate();server.wait()
