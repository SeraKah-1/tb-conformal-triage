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
  p=b.new_page(service_workers='allow');p.add_init_script("localStorage.setItem('tb_triage_disclaimer_accepted','true')");p.goto(f'http://127.0.0.1:{port}');p.wait_for_function('window.caseSettings && window.caseWorkspace')
  p.evaluate('caseSettings.open()');p.locator('#settings-offline-enabled').uncheck();p.wait_for_function("!document.getElementById('settings-offline-enabled').disabled")
  p.reload();p.wait_for_function('window.caseSettings');check('off persists',p.evaluate("localStorage.getItem('tb_offline_enabled')==='false'"));check('worker unregistered',p.evaluate('async()=>!(await navigator.serviceWorker.getRegistration())'))
  p.evaluate('caseSettings.open()');p.locator('#settings-offline-enabled').check();p.wait_for_function("!document.getElementById('settings-offline-enabled').disabled");check('worker registered',p.evaluate('async()=>!!(await navigator.serviceWorker.getRegistration())'))
  check('on persists',p.evaluate("localStorage.getItem('tb_offline_enabled')==='true'"))
  b.close()
 print(json.dumps({'passed':len(checks),'checks':checks},indent=2))
finally:server.terminate();server.wait()
