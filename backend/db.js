const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');

const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });

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
    criado_em TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  );
`);

function upsertCliente({ nome, email, telefone }) {
  const existente = db.prepare('SELECT id FROM clientes WHERE telefone = ?').get(telefone);
  if (existente) {
    db.prepare("UPDATE clientes SET nome = ?, email = COALESCE(NULLIF(?, ''), email) WHERE id = ?")
      .run(nome, email || '', existente.id);
    return existente.id;
  }
  return Number(
    db.prepare('INSERT INTO clientes (nome, email, telefone) VALUES (?, ?, ?)')
      .run(nome, email || null, telefone).lastInsertRowid
  );
}

module.exports = { db, upsertCliente };
