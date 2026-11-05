const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');

const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });

const db = new DatabaseSync(path.join(dataDir, 'duleo.db'));
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT NOT NULL UNIQUE,
    criado_em TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS contatos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    assunto TEXT,
    mensagem TEXT NOT NULL,
    nome_informado TEXT,
    email_informado TEXT,
    lido INTEGER NOT NULL DEFAULT 0,
    criado_em TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS orcamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    itens TEXT NOT NULL,
    observacoes TEXT,
    total_estimado REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'novo',
    origem TEXT NOT NULL DEFAULT 'site',
    nome_informado TEXT,
    email_informado TEXT,
    criado_em TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  );
`);

// Migração de bancos criados pela versão anterior (sem as colunas *_informado).
for (const tabela of ['contatos', 'orcamentos']) {
  const cols = db.prepare(`PRAGMA table_info(${tabela})`).all().map((c) => c.name); // nome fixo, não vem do usuário
  for (const col of ['nome_informado', 'email_informado']) {
    if (!cols.includes(col)) db.exec(`ALTER TABLE ${tabela} ADD COLUMN ${col} TEXT`);
  }
}

/**
 * Devolve o id do cliente pelo telefone, criando o cadastro se não existir.
 * NUNCA altera um cadastro existente: a rota é pública e qualquer pessoa pode
 * informar qualquer telefone. O nome/e-mail digitados ficam gravados no próprio
 * contato (nome_informado / email_informado) para o atendente conferir.
 */
function obterOuCriarCliente({ nome, email, telefone }) {
  db.prepare('INSERT INTO clientes (nome, email, telefone) VALUES (?, ?, ?) ON CONFLICT(telefone) DO NOTHING')
    .run(nome, email || null, telefone);
  return Number(db.prepare('SELECT id FROM clientes WHERE telefone = ?').get(telefone).id);
}

module.exports = { db, obterOuCriarCliente };
