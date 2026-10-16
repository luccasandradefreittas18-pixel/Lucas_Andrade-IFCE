// db/database.js
// Conexao unica com o banco SQLite + criacao do esquema (tabelas).
// O arquivo do banco fica em data/gamesmania.db (ou no caminho definido em
// DB_PATH; use ":memory:" para um banco temporario, util em testes).

const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const caminho = process.env.DB_PATH || path.join(__dirname, "..", "data", "gamesmania.db");
if (caminho !== ":memory:") {
  fs.mkdirSync(path.dirname(caminho), { recursive: true });
}

const db = new Database(caminho);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS categorias (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nome      TEXT NOT NULL,
    descricao TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS produtos (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    nome              TEXT NOT NULL,
    preco             REAL NOT NULL DEFAULT 0,
    categoriaId       INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    imagem            TEXT NOT NULL DEFAULT '/imagens/produto-padrao.svg',
    descricaoCurta    TEXT NOT NULL DEFAULT '',
    descricaoCompleta TEXT NOT NULL DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS usuarios (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nome       TEXT NOT NULL,
    endereco   TEXT NOT NULL DEFAULT '',
    email      TEXT NOT NULL UNIQUE COLLATE NOCASE,
    telefone   TEXT NOT NULL DEFAULT '',
    papel      TEXT NOT NULL DEFAULT 'cliente' CHECK (papel IN ('admin','cliente')),
    senhaSalt  TEXT NOT NULL,
    senhaHash  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS mensagens (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nome       TEXT NOT NULL,
    email      TEXT NOT NULL,
    assunto    TEXT NOT NULL,
    mensagem   TEXT NOT NULL,
    recebidoEm TEXT NOT NULL
  );
`);

module.exports = db;
