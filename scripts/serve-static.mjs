import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';

const root = resolve(process.cwd());
const port = Number(process.argv[2] || 8000);
const mime = {
  '.woff2': 'font/woff2',
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

function resolvePath(url) {
  const pathname = decodeURIComponent(new URL(url, 'http://localhost').pathname);
  const candidate = normalize(join(root, pathname === '/' ? 'index.html' : pathname));
  if (candidate !== root && !candidate.startsWith(root + sep)) return null;
  return candidate;
}

createServer(async (req, res) => {
  let filePath = resolvePath(req.url || '/');
  if (!filePath) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  try {
    if ((await stat(filePath)).isDirectory()) {
      const url = new URL(req.url, 'http://localhost');
      if (!url.pathname.endsWith('/')) {
        res.writeHead(301, { Location: url.pathname + '/' + url.search }).end();
        return;
      }
      filePath = join(filePath, 'index.html');
    }
    await readFile(filePath, { flag: 'r' });
    res.writeHead(200, { 'Content-Type': mime[extname(filePath).toLowerCase()] || 'application/octet-stream' });
    createReadStream(filePath).pipe(res);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Serving ${root} on http://127.0.0.1:${port}`);
});
