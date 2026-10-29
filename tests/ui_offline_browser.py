"""Real service worker/offline UI checks. No model execution or image inference."""
import json
import os
from pathlib import Path
import socket
import subprocess
import time
import urllib.request
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]

def main():
    checks = []
    def check(name, ok):
        checks.append({'name': name, 'passed': bool(ok)})
        assert ok, name
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0)); port = sock.getsockname()[1]
    base = f'http://127.0.0.1:{port}'
    server = subprocess.Popen(['node', 'tb_pwa_offline_workstation/server.js'], cwd=ROOT,
        env={**os.environ, 'PORT': str(port)}, stdout=subprocess.DEVNULL)
    try:
        for _ in range(100):
            try:
                urllib.request.urlopen(base, timeout=.2).close(); break
            except OSError: time.sleep(.05)
        with sync_playwright() as pw:
            browser = pw.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
            context = browser.new_context()
            page = context.new_page(); page.set_default_timeout(60000)
            errors = []; page.on('pageerror', lambda e: errors.append(str(e)))
            page.goto(base + '/manifest.json')
            page.evaluate("caches.open('other-app').then(c=>c.put('/other-data',new Response('keep')))")
            page.goto(base)
            page.evaluate("navigator.serviceWorker.ready")
            page.wait_for_function('navigator.serviceWorker.controller !== null')
            page.evaluate('initSystemStatus()')
            check('offline readiness requires cached assets', 'Offline' in page.locator('#txt-status').inner_text())
            check('unrelated cache preserved', page.evaluate("caches.has('other-app')"))
            page.evaluate("fetch('/requirements.txt').catch(()=>{})")
            check('non-application resources not cached', page.evaluate("caches.open('tb-conformal-offline-v4.3.0-workflow').then(c=>c.keys()).then(a=>!a.some(r=>r.url.includes('requirements.txt')))"))
            context.new_cdp_session(page).send('Network.clearBrowserCache')
            context.set_offline(True)
            page.reload(); page.wait_for_function('window.caseWorkspace && !caseWorkspace.state.loadingArchives')
            check('new workflow loads on first offline reload', page.locator('#case-process').inner_text() == 'Proses daftar')
            page.evaluate('applyLanguage("en")')
            check('English available offline', page.locator('#case-process').inner_text() == 'Process shown')
            check('no automatic model session', page.evaluate('ortSession===null'))
            page.evaluate('''async()=>{
                const c=await caches.open('tb-conformal-offline-v4.3.0-workflow');
                await c.delete(new URL('./static/js/cases.js',document.baseURI).href);
                await initSystemStatus();
            }''')
            check('missing asset removes ready claim', page.locator('#txt-status').inner_text() in ['Online', 'Offline incomplete'])
            check('no JS errors', not errors)
            context.close(); browser.close()
    finally:
        server.terminate(); server.wait()
    print(json.dumps({'checks':checks}, indent=2))

if __name__ == '__main__': main()
