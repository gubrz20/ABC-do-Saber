import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.webp': 'image/webp', '.zip': 'application/zip' };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep) || pathname.split('/').some(p => p.startsWith('.')) || /\.(?:sql|md|toml)$/.test(file)) {
      res.writeHead(404); return res.end('Não encontrado');
    }
    if (!(await stat(file)).isFile()) throw new Error('Not a file');
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache', 'Referrer-Policy': 'strict-origin-when-cross-origin' });
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end('Não encontrado'); }
});
server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log('ABC do saber: http://127.0.0.1:' + server.address().port));
