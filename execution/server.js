/**
 * Layer 3: Server Local Nativo para Desenvolvimento e Demonstração
 * BurguerSync Ourinhos
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  if (reqUrl === '/') reqUrl = '/frontend/index.html';
  if (reqUrl === '/frontend' || reqUrl === '/frontend/') reqUrl = '/frontend/index.html';

  let filePath = path.join(rootDir, reqUrl);

  // Se não existir na raiz direta, tenta em /frontend
  if (!fs.existsSync(filePath)) {
    filePath = path.join(rootDir, 'frontend', reqUrl);
  }

  // Se ainda for diretório, busca index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found: ' + reqUrl);
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*'
  });

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}/frontend/index.html`;
  console.log(`🍔 ==============================================`);
  console.log(`🍔 BurguerSync Ourinhos - Servidor Local Ativo!`);
  console.log(`🍔 Acesse: ${url}`);
  console.log(`🍔 Pressione Ctrl+C para encerrar.`);
  console.log(`🍔 ==============================================`);

  // Abre navegador no Windows se executado diretamente
  if (process.platform === 'win32' && process.env.AUTO_OPEN !== 'false') {
    exec(`start ${url}`);
  }
});
