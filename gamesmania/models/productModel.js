// models/productModel.js
// Model de PRODUTOS ("temas") persistido em SQLite (tabela "produtos").
// CRUD: create, getAll, getById, update, remove (+ getByCategoria para o filtro).

const db = require("../db/database");

const sql = {
  listar: db.prepare("SELECT * FROM produtos ORDER BY id"),
  porId: db.prepare("SELECT * FROM produtos WHERE id = ?"),
  porCategoria: db.prepare("SELECT * FROM produtos WHERE categoriaId = ? ORDER BY id"),
  inserir: db.prepare(
    `INSERT INTO produtos (nome, preco, categoriaId, imagem, descricaoCurta, descricaoCompleta)
     VALUES (@nome, @preco, @categoriaId, @imagem, @descricaoCurta, @descricaoCompleta)`
  ),
  alterar: db.prepare(
    `UPDATE produtos SET nome = @nome, preco = @preco, categoriaId = @categoriaId, imagem = @imagem,
       descricaoCurta = @descricaoCurta, descricaoCompleta = @descricaoCompleta
     WHERE id = @id`
  ),
  apagar: db.prepare("DELETE FROM produtos WHERE id = ?")
};

// LISTAR
function getAll() {
  return sql.listar.all();
}

// PROCURAR PELO ID
function getById(id) {
  return sql.porId.get(Number(id));
}

function getByCategoria(categoriaId) {
  return sql.porCategoria.all(Number(categoriaId));
}

// INSERIR
function create({ nome, preco, categoriaId, imagem, descricaoCurta, descricaoCompleta }) {
  const info = sql.inserir.run({
    nome: String(nome || "").trim(),
    preco: Number(preco) || 0,
    categoriaId: Number(categoriaId) || null,
    imagem: imagem && String(imagem).trim() ? String(imagem).trim() : "/imagens/produto-padrao.svg",
    descricaoCurta: String(descricaoCurta || "").trim(),
    descricaoCompleta: String(descricaoCompleta || descricaoCurta || "").trim()
  });
  return getById(info.lastInsertRowid);
}

// ALTERAR (campos omitidos sao mantidos)
function update(id, dados) {
  const atual = getById(id);
  if (!atual) return null;
  sql.alterar.run({
    id: atual.id,
    nome: dados.nome !== undefined ? String(dados.nome).trim() : atual.nome,
    preco: dados.preco !== undefined ? Number(dados.preco) || 0 : atual.preco,
    categoriaId: dados.categoriaId !== undefined ? Number(dados.categoriaId) || null : atual.categoriaId,
    imagem: dados.imagem !== undefined && String(dados.imagem).trim() ? String(dados.imagem).trim() : atual.imagem,
    descricaoCurta: dados.descricaoCurta !== undefined ? String(dados.descricaoCurta).trim() : atual.descricaoCurta,
    descricaoCompleta:
      dados.descricaoCompleta !== undefined ? String(dados.descricaoCompleta).trim() : atual.descricaoCompleta
  });
  return getById(id);
}

// APAGAR
function remove(id) {
  return sql.apagar.run(Number(id)).changes > 0;
}

module.exports = { getAll, getById, getByCategoria, create, update, remove };
