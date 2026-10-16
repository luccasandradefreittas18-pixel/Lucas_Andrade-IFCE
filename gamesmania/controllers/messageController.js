// controllers/messageController.js
// Camada de Controller para as mensagens recebidas pelo formulario de
// contato do site. So o admin pode ler/excluir ("solicitacoes do usuario").

const contactModel = require("../models/contactModel");
const { wantsJson } = require("./negotiate");

// GET /mensagens -> lista as mensagens recebidas (mais recentes primeiro)
function index(req, res) {
  const mensagens = [...contactModel.getAll()].reverse();
  if (wantsJson(req)) return res.json(mensagens);
  res.render("pages/messages-admin", { mensagens });
}

// GET /mensagens/:id -> procurar uma mensagem pelo id
function show(req, res) {
  const mensagem = contactModel.getById(req.params.id);
  if (!mensagem) {
    if (wantsJson(req)) return res.status(404).json({ erro: "Mensagem nao encontrada" });
    return res.status(404).render("pages/404", { mensagem: "Mensagem nao encontrada." });
  }
  if (wantsJson(req)) return res.json(mensagem);
  res.redirect("/mensagens");
}

// DELETE /mensagens/:id -> remove uma mensagem ja tratada
function destroy(req, res) {
  const removido = contactModel.remove(req.params.id);
  if (!removido) {
    if (wantsJson(req)) return res.status(404).json({ erro: "Mensagem nao encontrada" });
    return res.status(404).render("pages/404", { mensagem: "Mensagem nao encontrada." });
  }
  if (wantsJson(req)) return res.status(204).end();
  res.redirect("/mensagens");
}

module.exports = { index, show, destroy };
