// models/contactModel.js
// Model das MENSAGENS do formulario de contato, persistido em SQLite
// (tabela "mensagens"). CRUD: create, getAll, getById, remove.
// (Mensagens recebidas nao sao editadas, entao nao ha "alterar".)

const db = require("../db/database");

const sql = {
  listar: db.prepare("SELECT * FROM mensagens ORDER BY id"),
  porId: db.prepare("SELECT * FROM mensagens WHERE id = ?"),
  inserir: db.prepare(
    `INSERT INTO mensagens (nome, email, assunto, mensagem, recebidoEm)
     VALUES (@nome, @email, @assunto, @mensagem, @recebidoEm)`
  ),
  apagar: db.prepare("DELETE FROM mensagens WHERE id = ?")
};

function getAll() {
  return sql.listar.all();
}

function getById(id) {
  return sql.porId.get(Number(id));
}

function create({ nome, email, assunto, mensagem }) {
  const info = sql.inserir.run({
    nome: String(nome || "").trim(),
    email: String(email || "").trim(),
    assunto: String(assunto || "").trim(),
    mensagem: String(mensagem || "").trim(),
    recebidoEm: new Date().toISOString()
  });
  return getById(info.lastInsertRowid);
}

function remove(id) {
  return sql.apagar.run(Number(id)).changes > 0;
}

module.exports = { getAll, getById, create, remove };
