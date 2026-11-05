const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

try { process.loadEnvFile(path.join(__dirname, '.env')); } catch { /* .env opcional */ }

const { db, obterOuCriarCliente } = require('./db');

const PORT = Number(process.env.PORT) || 3000;
const TRUST_PROXY = process.env.TRUST_PROXY === '1'; // só ative atrás de um proxy reverso (nginx, Caddy...) que você controla
const SITE_DIR = path.join(__dirname, '..', 'dist');  // site gerado por `npm run build` (o mesmo publicado no GitHub Pages)
const ADMIN_DIR = path.join(__dirname, 'admin');      // painel: só existe quando o backend está rodando
const PUBLICO = /^\/(?:[\w-]+\.html|robots\.txt|sitemap\.xml|(?:assets|img|fonts)\/[\w./-]+)$/; // nada fora disso é servido
const MAX_BODY = 100 * 1024;
const STATUS_VALIDOS = ['novo', 'em_analise', 'respondido', 'fechado', 'cancelado'];

const SESSAO_MAX_MS = 2 * 3600_000;   // validade absoluta do token
const SESSAO_OCIOSA_MS = 30 * 60_000; // expira após 30 min sem uso

// ---------- senha do painel (hash scrypt, nunca texto puro) ----------
// Gere com: node gerar-hash.js   e cole o resultado em ADMIN_PASSWORD_HASH no .env
const ADMIN_HASH = (() => {
  const v = process.env.ADMIN_PASSWORD_HASH || '';
  const m = v.match(/^([0-9a-f]{32}):([0-9a-f]{128})$/i);
  return m ? { salt: Buffer.from(m[1], 'hex'), hash: Buffer.from(m[2], 'hex') } : null;
})();
const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

function senhaConfere(senha) {
  const calc = crypto.scryptSync(String(senha ?? '').slice(0, 256), ADMIN_HASH.salt, 64, SCRYPT);
  return crypto.timingSafeEqual(calc, ADMIN_HASH.hash);
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
};

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'same-origin',
  // Ignorado pelo navegador em HTTP; vale quando o site é servido por HTTPS (proxy com TLS).
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; " +
    "font-src 'self'; img-src 'self' data:; connect-src 'self'; " +
    "frame-src https://maps.google.com https://www.google.com; object-src 'none'; base-uri 'none'; " +
    "form-action 'self'; frame-ancestors 'none'",
};

// ---------- utilidades ----------
const fail = (msg, status = 400) => Object.assign(new Error(msg), { status });

function clientIp(req) {
  if (TRUST_PROXY) {
    // O último valor é o adicionado pelo SEU proxy; os anteriores podem ser forjados pelo cliente.
    const xff = String(req.headers['x-forwarded-for'] || '').split(',').map((s) => s.trim()).filter(Boolean);
    if (xff.length) return xff[xff.length - 1];
  }
  return req.socket.remoteAddress || 'desconhecido';
}

// Rate limiting com contador separado por rota e limpeza periódica.
const MAX_CHAVES = 50_000;
const hits = new Map(); // `${rota}|${ip}` -> { count, reset }
const LIMITES = {
  '/api/contatos': { limit: 5, windowMs: 10 * 60_000 },
  '/api/admin/login': { limit: 10, windowMs: 15 * 60_000 },
  admin: { limit: 120, windowMs: 60_000 },
};

function rateLimited(bucket, ip) {
  const { limit, windowMs } = LIMITES[bucket];
  const key = `${bucket}|${ip}`;
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.reset < now) {
    if (hits.size >= MAX_CHAVES) hits.delete(hits.keys().next().value); // descarta a mais antiga
    hits.set(key, { count: 1, reset: now + windowMs });
    return false;
  }
  return ++h.count > limit;
}

// Bloqueio progressivo do login: por IP e global (contra ataque distribuído).
const falhasIp = new Map(); // ip -> { n, ate }
const falhaGlobal = { n: 0, desde: Date.now(), ate: 0 };
const GLOBAL_MAX_FALHAS = 30, GLOBAL_JANELA_MS = 3600_000, GLOBAL_BLOQUEIO_MS = 15 * 60_000;

function loginBloqueado(ip) {
  const now = Date.now();
  if (falhaGlobal.ate > now) return Math.ceil((falhaGlobal.ate - now) / 1000);
  const f = falhasIp.get(ip);
  return f && f.ate > now ? Math.ceil((f.ate - now) / 1000) : 0;
}

function registrarFalha(ip) {
  const now = Date.now();
  const f = falhasIp.get(ip) || { n: 0, ate: 0 };
  f.n += 1;
  // A partir da 3ª falha: 2s, 4s, 8s... até 1 hora.
  if (f.n >= 3) f.ate = now + Math.min(2 ** (f.n - 2) * 1000, 3600_000);
  if (falhasIp.size >= MAX_CHAVES && !falhasIp.has(ip)) falhasIp.delete(falhasIp.keys().next().value);
  falhasIp.set(ip, f);

  if (now - falhaGlobal.desde > GLOBAL_JANELA_MS) { falhaGlobal.n = 0; falhaGlobal.desde = now; }
  if (++falhaGlobal.n >= GLOBAL_MAX_FALHAS) {
    falhaGlobal.ate = now + GLOBAL_BLOQUEIO_MS;
    falhaGlobal.n = 0; falhaGlobal.desde = now;
    console.warn(`[seguranca] ${GLOBAL_MAX_FALHAS} falhas de login em 1h: login bloqueado por 15 min.`);
  }
}

// Sessões: token aleatório de 256 bits, validade absoluta + expiração por inatividade.
const sessions = new Map(); // token -> { expira, ultimoUso }

function sessaoValida(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  const s = token && sessions.get(token);
  const now = Date.now();
  if (!s) return null;
  if (s.expira < now || s.ultimoUso + SESSAO_OCIOSA_MS < now) { sessions.delete(token); return null; }
  s.ultimoUso = now;
  return token;
}

setInterval(() => {
  const now = Date.now();
  for (const [k, h] of hits) if (h.reset < now) hits.delete(k);
  for (const [k, f] of falhasIp) if (f.ate < now - 24 * 3600_000) falhasIp.delete(k);
  for (const [k, s] of sessions) if (s.expira < now || s.ultimoUso + SESSAO_OCIOSA_MS < now) sessions.delete(k);
}, 60_000).unref();

function send(res, status, data, headers = {}) {
  const body = typeof data === 'string' || Buffer.isBuffer(data) ? data : JSON.stringify(data);
  res.writeHead(status, {
    ...securityHeaders,
    'Content-Type': typeof data === 'object' && !Buffer.isBuffer(data) ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(body);
}

function readJson(req) {
  // Só JSON: impede que formulários de outros sites (text/plain, sem preflight CORS) postem na API.
  if (!/^application\/json\s*(;|$)/i.test(req.headers['content-type'] || '')) {
    return Promise.reject(fail('Envie os dados como application/json.', 415));
  }
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(fail('Corpo muito grande.', 413)); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      try {
        const v = JSON.parse(Buffer.concat(chunks).toString() || '{}');
        if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error();
        resolve(v);
      } catch { reject(fail('JSON inválido.')); }
    });
    req.on('error', reject);
  });
}

// Remove caracteres de controle (exceto quebra de linha) e limita o tamanho.
const str = (v, max) => (typeof v === 'string' ? v.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '').trim().slice(0, max) : '');

function validarCliente(b) {
  const nome = str(b.nome, 120);
  const telefone = str(b.telefone, 30).replace(/\D/g, '');
  const email = str(b.email, 160);
  if (nome.length < 2) throw fail('Informe seu nome.');
  if (telefone.length < 10 || telefone.length > 13) throw fail('Informe um telefone válido com DDD.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw fail('E-mail inválido.');
  return { nome, telefone, email };
}

// ---------- rotas da API ----------
const routes = {
  'POST /api/contatos': async (req) => {
    const b = await readJson(req);
    // Campo-armadilha preenchido = robô: responde como sucesso, mas não grava nada.
    if (typeof b.empresa === 'string' && b.empresa.trim()) return [201, { ok: true }];
    const cliente = validarCliente(b);
    const mensagem = str(b.mensagem, 2000);
    if (mensagem.length < 3) throw fail('Escreva uma mensagem.');
    const clienteId = obterOuCriarCliente(cliente);
    const r = db.prepare('INSERT INTO contatos (cliente_id, assunto, mensagem, nome_informado, email_informado) VALUES (?, ?, ?, ?, ?)')
      .run(clienteId, str(b.assunto, 120), mensagem, cliente.nome, cliente.email || null);
    return [201, { ok: true, id: Number(r.lastInsertRowid) }];
  },

  // POST /api/orcamentos foi removida: o site não a usa e ela aceitava valores
  // (estimativa, origem) controlados pelo cliente. Os orçamentos antigos continuam no painel.

  'POST /api/admin/login': async (req, ip) => {
    const espera = loginBloqueado(ip);
    if (espera) throw fail(`Muitas tentativas. Tente novamente em ${espera} s.`, 429);
    const b = await readJson(req);
    if (!ADMIN_HASH) throw fail('Painel indisponível.', 503);
    if (!senhaConfere(b.senha)) {
      registrarFalha(ip);
      console.warn(`[seguranca] login falhou (ip ${ip})`);
      throw fail('Senha incorreta.', 401);
    }
    falhasIp.delete(ip);
    const token = crypto.randomBytes(32).toString('hex');
    const now = Date.now();
    sessions.set(token, { expira: now + SESSAO_MAX_MS, ultimoUso: now });
    return [200, { token, expiraEmSegundos: SESSAO_MAX_MS / 1000 }];
  },

  'POST /api/admin/logout': async (req, ip, token) => {
    sessions.delete(token);
    return [200, { ok: true }];
  },

  'GET /api/admin/orcamentos': async () => [200, db.prepare(`
    SELECT o.id, o.itens, o.observacoes, o.total_estimado, o.status, o.origem, o.criado_em,
           COALESCE(o.nome_informado, c.nome) AS nome, c.telefone, COALESCE(o.email_informado, c.email) AS email
    FROM orcamentos o JOIN clientes c ON c.id = o.cliente_id ORDER BY o.id DESC LIMIT 500`)
    .all().map((o) => ({ ...o, itens: JSON.parse(o.itens) }))],

  'GET /api/admin/contatos': async () => [200, db.prepare(`
    SELECT t.id, t.assunto, t.mensagem, t.lido, t.criado_em,
           COALESCE(t.nome_informado, c.nome) AS nome, c.telefone, COALESCE(t.email_informado, c.email) AS email
    FROM contatos t JOIN clientes c ON c.id = t.cliente_id ORDER BY t.id DESC LIMIT 500`).all()],

  'GET /api/admin/clientes': async () => [200, db.prepare(
    'SELECT id, nome, email, telefone, criado_em FROM clientes ORDER BY id DESC LIMIT 500').all()],
};

async function handleApi(req, res, pathname) {
  const ip = clientIp(req);
  const isAdmin = pathname.startsWith('/api/admin/') && pathname !== '/api/admin/login';

  const bucket = isAdmin ? 'admin' : LIMITES[pathname] ? pathname : null;
  if (bucket && rateLimited(bucket, ip)) throw fail('Muitas requisições. Tente em instantes.', 429);

  let token = null;
  if (isAdmin && !(token = sessaoValida(req))) throw fail('Não autorizado.', 401);

  const m = pathname.match(/^\/api\/admin\/(orcamentos|contatos)\/(\d{1,12})$/);
  if (m && req.method === 'PATCH') {
    const b = await readJson(req);
    const id = Number(m[2]);
    let r;
    if (m[1] === 'orcamentos') {
      if (!STATUS_VALIDOS.includes(b.status)) throw fail('Status inválido.');
      r = db.prepare('UPDATE orcamentos SET status = ? WHERE id = ?').run(b.status, id);
    } else {
      if (typeof b.lido !== 'boolean') throw fail('Valor inválido.');
      r = db.prepare('UPDATE contatos SET lido = ? WHERE id = ?').run(b.lido ? 1 : 0, id);
    }
    if (!r.changes) throw fail('Registro não encontrado.', 404);
    return send(res, 200, { ok: true });
  }

  const handler = routes[`${req.method} ${pathname}`];
  if (!handler) throw fail('Rota não encontrada.', 404);
  const [status, data] = await handler(req, ip, token);
  send(res, status, data);
}

// ---------- arquivos estáticos ----------
function serveStatic(req, res, pathname) {
  try { pathname = decodeURIComponent(pathname); } catch { return send(res, 400, 'Requisição inválida'); }
  if (pathname === '/') pathname = '/index.html';
  let base = SITE_DIR;
  if (pathname === '/admin' || pathname === '/admin/') { base = ADMIN_DIR; pathname = '/admin.html'; }
  else if (pathname === '/admin/admin.js' || pathname === '/admin/admin.css') { base = ADMIN_DIR; pathname = pathname.slice(6); }
  else if (!PUBLICO.test(pathname) || pathname.includes('..')) return send(res, 404, 'Página não encontrada');
  const file = path.normalize(path.join(base, pathname));
  if (!file.startsWith(base + path.sep)) return send(res, 403, 'Acesso negado');
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, 'Página não encontrada');
    const headers = { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' };
    if (base === ADMIN_DIR) { headers['X-Robots-Tag'] = 'noindex, nofollow'; headers['Cache-Control'] = 'no-store'; }
    else if (pathname.startsWith('/assets/')) headers['Cache-Control'] = 'public, max-age=31536000, immutable'; // nome tem hash
    else headers['Cache-Control'] = 'public, max-age=300';
    res.writeHead(200, { ...securityHeaders, ...headers });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, 'http://localhost');
    if (pathname.startsWith('/api/')) return await handleApi(req, res, pathname);
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Método não permitido');
    serveStatic(req, res, pathname);
  } catch (e) {
    const status = e.status || 500;
    if (!res.headersSent) send(res, status, { erro: e.status ? e.message : 'Erro interno do servidor.' });
    if (!e.status) console.error('[erro]', e); // detalhes só no log do servidor, nunca na resposta
  }
});
server.requestTimeout = 30_000;
server.headersTimeout = 15_000;

if (!fs.existsSync(path.join(SITE_DIR, 'index.html'))) {
  console.warn('ATENÇÃO: dist/ não encontrado. Rode "npm run build" na raiz do projeto antes de iniciar o servidor.');
}

server.listen(PORT, () => {
  console.log(`Duleo Vidros rodando em http://localhost:${PORT}  |  Admin: http://localhost:${PORT}/admin`);
  if (process.env.ADMIN_PASSWORD) {
    console.warn('ATENÇÃO: ADMIN_PASSWORD (texto puro) não é mais aceita. Rode "node gerar-hash.js" e use ADMIN_PASSWORD_HASH no .env.');
  }
  if (!ADMIN_HASH) console.warn('ATENÇÃO: ADMIN_PASSWORD_HASH ausente ou inválida: o login do painel está desativado.');
});
