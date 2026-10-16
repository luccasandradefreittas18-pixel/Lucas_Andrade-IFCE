// models/userModel.js
// Model de USUARIOS persistido em SQLite (tabela "usuarios").
// CRUD: create, getAll, getById, update, remove (+ getByEmail e autenticar).
// A senha nunca e guardada em texto puro: scrypt (modulo crypto nativo) com
// um salt aleatorio por usuario.

const crypto = require("crypto");
const db = require("../db/database");

function gerarHash(senha, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(String(senha), salt, 64).toString("hex");
  return { salt, hash };
}

function conferirSenha(senha, usuario) {
  if (!usuario || !usuario.senhaHash || !usuario.senhaSalt) return false;
  const { hash } = gerarHash(senha, usuario.senhaSalt);
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(usuario.senhaHash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const sql = {
  listar: db.prepare("SELECT * FROM usuarios ORDER BY id"),
  porId: db.prepare("SELECT * FROM usuarios WHERE id = ?"),
  porEmail: db.prepare("SELECT * FROM usuarios WHERE email = ? COLLATE NOCASE"),
  inserir: db.prepare(
    `INSERT INTO usuarios (nome, endereco, email, telefone, papel, senhaSalt, senhaHash)
     VALUES (@nome, @endereco, @email, @telefone, @papel, @senhaSalt, @senhaHash)`
  ),
  alterar: db.prepare(
    `UPDATE usuarios SET nome = @nome, endereco = @endereco, email = @email, telefone = @telefone,
       papel = @papel, senhaSalt = @senhaSalt, senhaHash = @senhaHash
     WHERE id = @id`
  ),
  apagar: db.prepare("DELETE FROM usuarios WHERE id = ?")
};

// Versao segura para enviar ao cliente (sem hash/salt da senha).
function publico(usuario) {
  if (!usuario) return null;
  const { senhaHash, senhaSalt, ...resto } = usuario;
  return resto;
}

// LISTAR
function getAll() {
  return sql.listar.all();
}

function getAllPublico() {
  return getAll().map(publico);
}

// PROCURAR PELO ID
function getById(id) {
  return sql.porId.get(Number(id));
}

function getByEmail(email) {
  return sql.porEmail.get(String(email || "").trim());
}

// INSERIR
function create({ nome, endereco, email, telefone, senha, papel }) {
  const { salt, hash } = gerarHash(senha);
  const info = sql.inserir.run({
    nome: String(nome || "").trim(),
    endereco: String(endereco || "").trim(),
    email: String(email || "").trim(),
    telefone: String(telefone || "").trim(),
    papel: papel === "admin" ? "admin" : "cliente",
    senhaSalt: salt,
    senhaHash: hash
  });
  return getById(info.lastInsertRowid);
}

// ALTERAR (campos omitidos sao mantidos; senha so muda se for informada)
function update(id, dados) {
  const atual = getById(id);
  if (!atual) return null;
  const novaSenha = dados.senha ? gerarHash(dados.senha) : { salt: atual.senhaSalt, hash: atual.senhaHash };
  sql.alterar.run({
    id: atual.id,
    nome: dados.nome !== undefined ? String(dados.nome).trim() : atual.nome,
    endereco: dados.endereco !== undefined ? String(dados.endereco).trim() : atual.endereco,
    email: dados.email !== undefined ? String(dados.email).trim() : atual.email,
    telefone: dados.telefone !== undefined ? String(dados.telefone).trim() : atual.telefone,
    papel: dados.papel !== undefined ? (dados.papel === "admin" ? "admin" : "cliente") : atual.papel,
    senhaSalt: novaSenha.salt,
    senhaHash: novaSenha.hash
  });
  return getById(id);
}

// APAGAR
function remove(id) {
  return sql.apagar.run(Number(id)).changes > 0;
}

function autenticar(email, senha) {
  const usuario = getByEmail(email);
  if (!usuario) return null;
  return conferirSenha(senha, usuario) ? usuario : null;
}

module.exports = { getAll, getAllPublico, getById, getByEmail, create, update, remove, autenticar, publico };
