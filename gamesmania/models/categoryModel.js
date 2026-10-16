// models/categoryModel.js
// Model de CATEGORIAS persistido em SQLite (tabela "categorias").
// CRUD: create (inserir), getAll (listar), getById (procurar pelo id),
//       update (alterar), remove (apagar).

const db = require("../db/database");

const sql = {
  listar: db.prepare("SELECT * FROM categorias ORDER BY id"),
  porId: db.prepare("SELECT * FROM categorias WHERE id = ?"),
  inserir: db.prepare("INSERT INTO categorias (nome, descricao) VALUES (@nome, @descricao)"),
  alterar: db.prepare("UPDATE categorias SET nome = @nome, descricao = @descricao WHERE id = @id"),
  apagar: db.prepare("DELETE FROM categorias WHERE id = ?")
};

// LISTAR
function getAll() {
  return sql.listar.all();
}

// PROCURAR PELO ID (undefined se nao existir)
function getById(id) {
  return sql.porId.get(Number(id));
}

// INSERIR
function create({ nome, descricao }) {
  const info = sql.inserir.run({
    nome: String(nome || "").trim(),
    descricao: String(descricao || "").trim()
  });
  return getById(info.lastInsertRowid);
}

// ALTERAR (campos omitidos sao mantidos)
function update(id, { nome, descricao }) {
  const atual = getById(id);
  if (!atual) return null;
  sql.alterar.run({
    id: atual.id,
    nome: nome !== undefined ? String(nome).trim() : atual.nome,
    descricao: descricao !== undefined ? String(descricao).trim() : atual.descricao
  });
  return getById(id);
}

// APAGAR (true se removeu, false se o id nao existe)
function remove(id) {
  return sql.apagar.run(Number(id)).changes > 0;
}

module.exports = { getAll, getById, create, update, remove };
