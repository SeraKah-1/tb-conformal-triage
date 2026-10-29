const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '../tb_pwa_offline_workstation');

function startServer(host) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env, PORT: '0' };
    delete env.HOST;
    if (host) env.HOST = host;
    const child = spawn(process.execPath, [path.join(root, 'server.js')], { env });
    let output = '';
    const timer = setTimeout(() => { child.kill(); reject(new Error('Server startup timeout: ' + output)); }, 5000);
    child.stderr.on('data', chunk => { output += chunk; });
    child.stdout.on('data', chunk => {
      output += chunk;
      const match = output.match(/Local Loopback\s+: http:\/\/127\.0\.0\.1:(\d+)/);
      if (match && output.includes('Press Ctrl+C')) {
        clearTimeout(timer);
        resolve({ child, port: Number(match[1]), output });
      }
    });
    child.once('error', err => { clearTimeout(timer); reject(err); });
    child.once('exit', code => { clearTimeout(timer); if (!output.includes('Press Ctrl+C')) reject(new Error('Server exit ' + code + ': ' + output)); });
  });
}

function request(port, target, method = 'GET', headers = {}) {
  return new Promise((resolve, reject) => {
    // Raw path preserves encoded traversal and malformed percent sequences.
    const req = http.request({ hostname: '127.0.0.1', port, path: target, method, headers }, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    req.end();
  });
}

test('default loopback server survives malformed requests and confines filesystem access', async t => {
  const server = await startServer();
  t.after(() => server.child.kill());
  assert.match(server.output, /Bind Address\s+: 127\.0\.0\.1/);
  assert.doesNotMatch(server.output, /Network Access/);
  for (const target of ['/%ZZ', '/%E0%A4%A', '/%00', '//example.com/index.html']) {
    assert.equal((await request(server.port, target)).status, 400, target);
  }
  for (const target of ['/../README.md', '/%2e%2e/README.md', '/%2e%2e%2fREADME.md', '/%2e%2e%5cREADME.md', '/assets/../../README.md']) {
    assert.equal((await request(server.port, target)).status, 403, target);
  }
  const index = await request(server.port, '/');
  assert.equal(index.status, 200);
  assert.match(index.headers['content-type'], /text\/html/);
  assert.match(index.body, /<!DOCTYPE html>/i);
  const js = await request(server.port, '/static/js/app.js?v=audit');
  assert.equal(js.status, 200);
  assert.match(js.headers['content-type'], /javascript/);
  const head = await request(server.port, '/index.html', 'HEAD');
  assert.equal(head.status, 200);
  assert.equal(head.body, '');
  assert.ok(Number(head.headers['content-length']) > 0);
  assert.equal((await request(server.port, '/missing-audit-fixture')).status, 404);
  assert.equal((await request(server.port, '/', 'POST')).status, 405);
  assert.equal((await request(server.port, '/', 'OPTIONS')).status, 204);
  assert.equal((await request(server.port, '/index.html', 'GET', { Host: '[invalid' })).status, 200);

  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'tb-server-test-'));
  const link = path.join(root, '.audit-external-' + process.pid);
  t.after(() => { fs.rmSync(link, { force: true }); fs.rmSync(temp, { recursive: true, force: true }); });
  fs.writeFileSync(path.join(temp, 'index.html'), 'outside root sentinel');
  fs.symlinkSync(temp, link, 'dir');
  assert.equal((await request(server.port, '/' + path.basename(link) + '/')).status, 403);
  assert.equal((await request(server.port, '/index.html')).status, 200);
});

test('explicit HOST permits container/LAN hosting', async t => {
  const server = await startServer('0.0.0.0');
  t.after(() => server.child.kill());
  assert.match(server.output, /Bind Address\s+: 0\.0\.0\.0/);
  assert.equal((await request(server.port, '/manifest.json')).status, 200);
});

test('Linux launcher resolves its own directory and does not open browser after failed startup', async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'tb-launcher-test-'));
  try {
    const cwdLog = path.join(temp, 'cwd');
    const openedLog = path.join(temp, 'opened');
    fs.writeFileSync(path.join(temp, 'node'), '#!/bin/sh\npwd > "$AUDIT_CWD_LOG"\nexit 1\n', { mode: 0o755 });
    fs.writeFileSync(path.join(temp, 'xdg-open'), '#!/bin/sh\ntouch "$AUDIT_OPENED_LOG"\n', { mode: 0o755 });
    const result = await new Promise((resolve, reject) => {
      const child = spawn('bash', [path.join(root, 'buka_aplikasi_offline.sh')], {
        cwd: temp,
        env: { ...process.env, PATH: temp + path.delimiter + process.env.PATH, AUDIT_CWD_LOG: cwdLog, AUDIT_OPENED_LOG: openedLog }
      });
      child.on('error', reject);
      child.on('exit', code => resolve(code));
    });
    assert.equal(result, 1);
    assert.equal(fs.readFileSync(cwdLog, 'utf8').trim(), root);
    assert.equal(fs.existsSync(openedLog), false);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});
