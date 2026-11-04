const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

try { process.loadEnvFile(path.join(__dirname, '.env')); } catch { /* .env opcional */ }

const { db, upsertCliente } = require('./db');

const PORT = Number(process.env.PORT) || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''; // sem senha definida, o login fica desativado
const SITE_DIR = path.join(__dirname, '..');          // site estático (o mesmo publicado no GitHub Pages)
const ADMIN_DIR = path.join(__dirname, 'admin');      // painel: só existe quando o backend está rodando
const PUBLICO = /^\/(?:[\w-]+\.html|(?:css|js|img)\/[\w./-]+)$/; // nada fora disso é servido (protege backend/, .env, .git)
const MAX_BODY = 100 * 1024;
const STATUS_VALIDOS = ['novo', 'em_analise', 'respondido', 'fechado', 'cancelado'];

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
};

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'same-origin',
  'Content-Security-Policy':
    "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-src https://maps.google.com https://www.google.com",
};

// ---------- utilidades ----------
const sessions = new Map(); // token -> expiração
const hits = new Map();     // ip -> { count, reset }

function rateLimited(ip, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || h.reset < now) { hits.set(ip, { count: 1, reset: now + windowMs }); return false; }
  return ++h.count > limit;
}

function send(res, status, data, headers = {}) {
  const body = typeof data === 'string' || Buffer.isBuffer(data) ? data : JSON.stringify(data);
  res.writeHead(status, {
    ...securityHeaders,
    'Content-Type': typeof data === 'object' && !Buffer.isBuffer(data) ? 'application/json; charset=utf-8' : 'text/plain',
    ...headers,
  });
  res.end(body);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(Object.assign(new Error('Corpo muito grande'), { status: 413 })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString() || '{}')); }
      catch { reject(Object.assign(new Error('JSON inválido'), { status: 400 })); }
    });
    req.on('error', reject);
  });
}

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const fail = (msg, status = 400) => Object.assign(new Error(msg), { status });

function validarCliente(b) {
  const nome = str(b.nome, 120);
  const telefone = str(b.telefone, 30).replace(/[^\d+]/g, '');
  const email = str(b.email, 160);
  if (nome.length < 2) throw fail('Informe seu nome.');
  if (telefone.replace(/\D/g, '').length < 10) throw fail('Informe um telefone válido com DDD.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw fail('E-mail inválido.');
  return { nome, telefone, email };
}

function autenticado(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  const exp = sessions.get(token);
  if (!exp || exp < Date.now()) { sessions.delete(token); return false; }
  return true;
}

function senhaConfere(senha) {
  const a = crypto.createHash('sha256').update(String(senha)).digest();
  const b = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest();
  return crypto.timingSafeEqual(a, b);
}

// ---------- rotas da API ----------
const routes = {
  'POST /api/contatos': async (req) => {
    const b = await readJson(req);
    const cliente = validarCliente(b);
    const mensagem = str(b.mensagem, 2000);
    if (mensagem.length < 3) throw fail('Escreva uma mensagem.');
    const clienteId = upsertCliente(cliente);
    const r = db.prepare('INSERT INTO contatos (cliente_id, assunto, mensagem) VALUES (?, ?, ?)')
      .run(clienteId, str(b.assunto, 120), mensagem);
    return [201, { ok: true, id: Number(r.lastInsertRowid) }];
  },

  'POST /api/orcamentos': async (req) => {
    const b = await readJson(req);
    const cliente = validarCliente(b);
    if (!Array.isArray(b.itens) || b.itens.length === 0 || b.itens.length > 30) throw fail('Adicione ao menos um item ao orçamento.');
    let total = 0;
    const itens = b.itens.map((i) => {
      const item = {
        produto: str(i.produto, 120), vidro: str(i.vidro, 80), cor: str(i.cor, 40), obs: str(i.obs, 200),
        largura: Number(i.largura), altura: Number(i.altura), quantidade: Number(i.quantidade),
        estimativa: Number(i.estimativa) || 0,
      };
      if (!item.produto) throw fail('Item sem produto.');
      if (![item.largura, item.altura].every((n) => n >= 0.1 && n <= 10)) throw fail('Medidas inválidas (0,1 a 10 m).');
      if (!Number.isInteger(item.quantidade) || item.quantidade < 1 || item.quantidade > 100) throw fail('Quantidade inválida.');
      total += item.estimativa;
      return item;
    });
    const clienteId = upsertCliente(cliente);
    const r = db.prepare('INSERT INTO orcamentos (cliente_id, itens, observacoes, total_estimado, origem) VALUES (?, ?, ?, ?, ?)')
      .run(clienteId, JSON.stringify(itens), str(b.observacoes, 1000), Math.round(total * 100) / 100,
        b.origem === 'whatsapp' ? 'whatsapp' : 'site');
    return [201, { ok: true, id: Number(r.lastInsertRowid) }];
  },

  'POST /api/admin/login': async (req) => {
    const b = await readJson(req);
    if (!ADMIN_PASSWORD) throw fail('Painel desativado: defina ADMIN_PASSWORD no backend/.env.', 503);
    if (!senhaConfere(b.senha)) throw fail('Senha incorreta.', 401);
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, Date.now() + 8 * 3600_000);
    return [200, { token }];
  },

  'GET /api/admin/orcamentos': async () => [200, db.prepare(`
    SELECT o.id, o.itens, o.observacoes, o.total_estimado, o.status, o.origem, o.criado_em,
           c.nome, c.telefone, c.email
    FROM orcamentos o JOIN clientes c ON c.id = o.cliente_id ORDER BY o.id DESC LIMIT 500`)
    .all().map((o) => ({ ...o, itens: JSON.parse(o.itens) }))],

  'GET /api/admin/contatos': async () => [200, db.prepare(`
    SELECT t.id, t.assunto, t.mensagem, t.lido, t.criado_em, c.nome, c.telefone, c.email
    FROM contatos t JOIN clientes c ON c.id = t.cliente_id ORDER BY t.id DESC LIMIT 500`).all()],

  'GET /api/admin/clientes': async () => [200, db.prepare('SELECT * FROM clientes ORDER BY id DESC LIMIT 500').all()],
};

async function handleApi(req, res, pathname) {
  const ip = req.socket.remoteAddress || 'x';
  if (req.method === 'POST' && rateLimited(ip, pathname === '/api/admin/login' ? 8 : 20)) throw fail('Muitas requisições. Tente em instantes.', 429);

  const isAdmin = pathname.startsWith('/api/admin/') && pathname !== '/api/admin/login';
  if (isAdmin && !autenticado(req)) throw fail('Não autorizado.', 401);

  const m = pathname.match(/^\/api\/admin\/(orcamentos|contatos)\/(\d+)$/);
  if (m && req.method === 'PATCH') {
    const b = await readJson(req);
    const id = Number(m[2]);
    if (m[1] === 'orcamentos') {
      if (!STATUS_VALIDOS.includes(b.status)) throw fail('Status inválido.');
      db.prepare('UPDATE orcamentos SET status = ? WHERE id = ?').run(b.status, id);
    } else {
      db.prepare('UPDATE contatos SET lido = ? WHERE id = ?').run(b.lido ? 1 : 0, id);
    }
    return send(res, 200, { ok: true });
  }

  const handler = routes[`${req.method} ${pathname}`];
  if (!handler) throw fail('Rota não encontrada.', 404);
  const [status, data] = await handler(req);
  send(res, status, data);
}

// ---------- arquivos estáticos ----------
function serveStatic(req, res, pathname) {
  pathname = decodeURIComponent(pathname);
  if (pathname === '/') pathname = '/index.html';
  let base = SITE_DIR;
  if (pathname === '/admin' || pathname === '/admin/') { base = ADMIN_DIR; pathname = '/admin.html'; }
  else if (pathname === '/admin/admin.js') { base = ADMIN_DIR; pathname = '/admin.js'; }
  else if (!PUBLICO.test(pathname) || pathname.includes('..')) return send(res, 404, 'Página não encontrada');
  const file = path.normalize(path.join(base, pathname));
  if (!file.startsWith(base + path.sep)) return send(res, 403, 'Acesso negado');
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, 'Página não encontrada');
    const headers = { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' };
    if (base === ADMIN_DIR) headers['X-Robots-Tag'] = 'noindex, nofollow';
    res.writeHead(200, { ...securityHeaders, ...headers });
    res.end(data);
  });
}

http.createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, 'http://localhost');
    if (pathname.startsWith('/api/')) return await handleApi(req, res, pathname);
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Método não permitido');
    serveStatic(req, res, pathname);
  } catch (e) {
    if (!res.headersSent) send(res, e.status || 500, { erro: e.status ? e.message : 'Erro interno do servidor.' });
    if (!e.status) console.error(e);
  }
}).listen(PORT, () => {
  console.log(`Duleo Vidros rodando em http://localhost:${PORT}  |  Admin: http://localhost:${PORT}/admin`);
  if (!ADMIN_PASSWORD) console.warn('ATENÇÃO: defina ADMIN_PASSWORD no arquivo .env. Sem ela o login do painel fica desativado.');
});
