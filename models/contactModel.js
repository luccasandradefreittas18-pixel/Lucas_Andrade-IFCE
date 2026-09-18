// models/contactModel.js
// Armazena em memoria as mensagens recebidas pelo formulario de contato.

let mensagens = [];
let nextId = 1;

function getAll() {
  return mensagens;
}

function create({ nome, email, assunto, mensagem }) {
  const nova = {
    id: nextId++,
    nome: String(nome || "").trim(),
    email: String(email || "").trim(),
    assunto: String(assunto || "").trim(),
    mensagem: String(mensagem || "").trim(),
    recebidoEm: new Date().toISOString()
  };
  mensagens.push(nova);
  return nova;
}

module.exports = { getAll, create };
