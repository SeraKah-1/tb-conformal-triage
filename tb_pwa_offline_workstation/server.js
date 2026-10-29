// TB Conformal Triage PWA Offline Workstation - Local Development Server
// Zero-dependency native Node.js HTTP server with complete MIME type mapping

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = process.env.HOST || '127.0.0.1';
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.wasm': 'application/wasm',
  '.onnx': 'application/octet-stream',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.bin': 'application/octet-stream',
  '.txt': 'text/plain; charset=utf-8'
};

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

const server = http.createServer((req, res) => {
  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }

  // Decode only the request path, independent of the untrusted Host header.
  // Reject traversal before normalization (which would otherwise hide '..').
  let pathname;
  try {
    if (!req.url.startsWith('/') || req.url.startsWith('//')) throw new URIError('Invalid request target');
    pathname = decodeURIComponent(req.url.split('?')[0]);
    if (pathname.includes('\0')) throw new URIError('Invalid path');
  } catch (_) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('400 Bad Request');
    return;
  }
  const segments = pathname.replace(/\\/g, '/').split('/');
  if (segments.includes('..')) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.resolve(ROOT_DIR, '.' + pathname.replace(/\\/g, '/'));
  if (!isWithinRoot(filePath)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  // Check file exists
  fs.stat(filePath, (err, stats) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`404 Not Found: ${pathname}`);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Server Error');
      }
      return;
    }

    if (stats.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      fs.stat(indexPath, (idxErr, idxStats) => {
        if (!idxErr && idxStats.isFile()) {
          serveFile(indexPath, idxStats, req, res);
        } else {
          res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('403 Directory Listing Forbidden');
        }
      });
      return;
    }

    if (!stats.isFile()) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('403 Forbidden');
      return;
    }
    serveFile(filePath, stats, req, res);
  });
});

function isWithinRoot(filePath) {
  const relative = path.relative(ROOT_DIR, filePath);
  return relative === '' || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative));
}

function serveFile(filePath, stats, req, res) {
  // Lexical containment alone does not protect against symlinks outside root.
  fs.realpath(filePath, (err, realPath) => {
    if (err || !isWithinRoot(realPath)) {
      res.writeHead(err ? 404 : 403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(err ? '404 Not Found' : '403 Forbidden');
      return;
    }
    streamFile(realPath, stats, req, res);
  });
}

function streamFile(filePath, stats, req, res) {
  const ext = path.extname(filePath).toLowerCase();
  let contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // Special manifest MIME handling
  if (path.basename(filePath) === 'manifest.json') {
    contentType = 'application/manifest+json; charset=utf-8';
  }

  // Prevent caching for sw.js so service worker updates immediately
  if (path.basename(filePath) === 'sw.js') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', stats.size);
  res.setHeader('Accept-Ranges', 'bytes');

  if (req.method === 'HEAD') {
    res.writeHead(200);
    res.end();
    return;
  }

  const stream = fs.createReadStream(filePath);
  stream.on('error', (streamErr) => {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('500 Stream Error');
    } else {
      res.destroy(streamErr);
    }
  });
  res.writeHead(200);
  stream.pipe(res);
}

server.listen(PORT, HOST, () => {
  const ips = HOST === '0.0.0.0' || HOST === '::' ? getLocalIpAddresses() : [];
  const boundPort = server.address().port;
  console.log('================================================================');
  console.log('  TB CONFORMAL TRIAGE CLINICAL WORKSTATION - DEV SERVER READY   ');
  console.log('================================================================');
  console.log(`- Local Access     : http://localhost:${boundPort}/index.html`);
  console.log(`- Local Loopback   : http://127.0.0.1:${boundPort}/index.html`);
  for (const ip of ips) {
    console.log(`- Network Access   : http://${ip}:${boundPort}/index.html`);
  }
  console.log(`- Bind Address     : ${HOST}`);
  console.log(`- Serving Root     : ${ROOT_DIR}`);
  console.log('================================================================');
  console.log('Press Ctrl+C to terminate the development server.');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Error: Port ${PORT} is already in use. Please check running processes.`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
