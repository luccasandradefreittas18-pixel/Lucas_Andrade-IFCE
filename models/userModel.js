// models/userModel.js
// Camada de Model: armazenamento e manipulacao dos USUARIOS em memoria.
// A senha nunca e guardada em texto puro: usamos scrypt (modulo crypto nativo)
// com um salt aleatorio por usuario.

const crypto = require("crypto");

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

const primeiroAdmin = gerarHash("admin123");

let usuarios = [
  {
    id: 1,
    nome: "Lucas Andrade Freitas",
    endereco: "Rua Principal, 00 - Paraipaba/CE",
    email: "admin@gamesmania.com",
    telefone: "(85) 00000-0000",
    papel: "admin",
    senhaSalt: primeiroAdmin.salt,
    senhaHash: primeiroAdmin.hash
  }
];

let nextId = usuarios.length + 1;

// Versao segura para enviar ao cliente (sem hash/salt da senha).
function publico(usuario) {
  if (!usuario) return null;
  const { senhaHash, senhaSalt, ...resto } = usuario;
  return resto;
}

function getAll() {
  return usuarios;
}

function getAllPublico() {
  return usuarios.map(publico);
}

function getById(id) {
  return usuarios.find((u) => u.id === Number(id));
}

function getByEmail(email) {
  const alvo = String(email || "").trim().toLowerCase();
  return usuarios.find((u) => u.email.toLowerCase() === alvo);
}

function create({ nome, endereco, email, telefone, senha, papel }) {
  const { salt, hash } = gerarHash(senha);
  const novo = {
    id: nextId++,
    nome: String(nome || "").trim(),
    endereco: String(endereco || "").trim(),
    email: String(email || "").trim(),
    telefone: String(telefone || "").trim(),
    papel: papel === "admin" ? "admin" : "cliente",
    senhaSalt: salt,
    senhaHash: hash
  };
  usuarios.push(novo);
  return novo;
}

function update(id, dados) {
  const usuario = getById(id);
  if (!usuario) return null;
  if (dados.nome !== undefined) usuario.nome = String(dados.nome).trim();
  if (dados.endereco !== undefined) usuario.endereco = String(dados.endereco).trim();
  if (dados.email !== undefined) usuario.email = String(dados.email).trim();
  if (dados.telefone !== undefined) usuario.telefone = String(dados.telefone).trim();
  if (dados.papel !== undefined) usuario.papel = dados.papel === "admin" ? "admin" : "cliente";
  if (dados.senha) {
    const { salt, hash } = gerarHash(dados.senha);
    usuario.senhaSalt = salt;
    usuario.senhaHash = hash;
  }
  return usuario;
}

function remove(id) {
  const index = usuarios.findIndex((u) => u.id === Number(id));
  if (index === -1) return false;
  usuarios.splice(index, 1);
  return true;
}

function autenticar(email, senha) {
  const usuario = getByEmail(email);
  if (!usuario) return null;
  return conferirSenha(senha, usuario) ? usuario : null;
}

module.exports = {
  getAll,
  getAllPublico,
  getById,
  getByEmail,
  create,
  update,
  remove,
  autenticar,
  publico
};
