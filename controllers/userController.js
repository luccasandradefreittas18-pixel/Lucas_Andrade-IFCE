// controllers/userController.js
const userModel = require("../models/userModel");
const { wantsJson } = require("./negotiate");
const { usuarioAtual } = require("../middlewares/auth");

function ehAdmin(req) {
  const usuario = usuarioAtual(req);
  return Boolean(usuario && usuario.papel === "admin");
}

// GET /usuarios -> lista de usuarios cadastrados (area administrativa)
function index(req, res) {
  const usuarios = userModel.getAllPublico();
  if (wantsJson(req)) return res.json(usuarios);
  res.render("pages/users", { usuarios, mostrarTabela: true });
}

// GET /usuarios/novo -> formulario publico de cadastro ("Cadastre-se")
function newForm(req, res) {
  res.render("pages/users", {});
}

// GET /usuarios/:id/editar -> edicao (proprio usuario ou admin)
function editForm(req, res) {
  const logado = usuarioAtual(req);
  const usuarioEditado = userModel.getById(req.params.id);
  if (!usuarioEditado) {
    return res.status(404).render("pages/404", { mensagem: "Usuario nao encontrado." });
  }
  if (!ehAdmin(req) && logado.id !== usuarioEditado.id) {
    return res.status(403).render("pages/message", {
      titulo: "403",
      mensagem: "Voce so pode editar o seu proprio cadastro.",
      link: "/",
      textoLink: "Voltar para o inicio"
    });
  }
  res.render("pages/user-form", { usuarioEditado: userModel.publico(usuarioEditado) });
}

function validar({ nome, email, senha, confirmarSenha }, { exigirSenha = true } = {}) {
  if (!nome || !String(nome).trim()) return "O nome e obrigatorio.";
  if (!email || !String(email).trim()) return "O e-mail e obrigatorio.";
  if (exigirSenha) {
    if (!senha || String(senha).length < 6) return "A senha deve ter pelo menos 6 caracteres.";
    if (confirmarSenha !== undefined && senha !== confirmarSenha) return "As senhas nao coincidem.";
  }
  return null;
}

// POST /usuarios -> cria um usuario com os dados do formulario
function create(req, res) {
  const erro = validar(req.body);
  if (erro) return responderErro(req, res, erro, 400);

  if (userModel.getByEmail(req.body.email)) {
    return responderErro(req, res, "Este e-mail ja esta cadastrado.", 409);
  }

  // Somente um admin logado pode criar outro admin.
  const papel = ehAdmin(req) && req.body.papel === "admin" ? "admin" : "cliente";
  const novo = userModel.create({ ...req.body, papel });

  if (wantsJson(req)) return res.status(201).json(userModel.publico(novo));

  if (ehAdmin(req)) return res.redirect("/usuarios");

  // Cadastro publico: ja deixa o usuario logado.
  req.session.usuario = userModel.publico(novo);
  res.locals.usuario = req.session.usuario;
  res.render("pages/message", {
    titulo: "Cadastro concluido!",
    mensagem: `Bem-vindo, ${novo.nome}. Sua conta foi criada e voce ja esta conectado.`
  });
}

function responderErro(req, res, erro, status) {
  if (wantsJson(req)) return res.status(status).json({ erro });
  return res.status(status).render("pages/users", {
    usuarios: ehAdmin(req) ? userModel.getAllPublico() : [],
    erro,
    valores: req.body,
    mostrarTabela: ehAdmin(req)
  });
}

// PUT /usuarios/:id
function update(req, res) {
  const logado = usuarioAtual(req);
  const existente = userModel.getById(req.params.id);
  if (!existente) {
    if (wantsJson(req)) return res.status(404).json({ erro: "Usuario nao encontrado" });
    return res.status(404).render("pages/404", { mensagem: "Usuario nao encontrado." });
  }
  if (!ehAdmin(req) && logado.id !== existente.id) {
    if (wantsJson(req)) return res.status(403).json({ erro: "Sem permissao para editar este usuario." });
    return res.status(403).render("pages/message", {
      titulo: "403",
      mensagem: "Sem permissao para editar este usuario.",
      link: "/",
      textoLink: "Voltar para o inicio"
    });
  }

  const erro = validar({ ...existente, ...req.body }, { exigirSenha: Boolean(req.body.senha) });
  if (erro) {
    if (wantsJson(req)) return res.status(400).json({ erro });
    return res.status(400).render("pages/user-form", {
      usuarioEditado: { ...userModel.publico(existente), ...req.body },
      erro
    });
  }

  // Apenas admin pode alterar o papel de um usuario.
  const dados = { ...req.body };
  if (!ehAdmin(req)) delete dados.papel;

  const atualizado = userModel.update(req.params.id, dados);

  // Mantem a sessao coerente se o usuario editou a si mesmo.
  if (logado && logado.id === atualizado.id) {
    req.session.usuario = userModel.publico(atualizado);
  }

  if (wantsJson(req)) return res.json(userModel.publico(atualizado));
  res.redirect(ehAdmin(req) ? "/usuarios" : "/");
}

// DELETE /usuarios/:id
function destroy(req, res) {
  const logado = usuarioAtual(req);
  const alvo = userModel.getById(req.params.id);
  if (!alvo) {
    if (wantsJson(req)) return res.status(404).json({ erro: "Usuario nao encontrado" });
    return res.status(404).render("pages/404", { mensagem: "Usuario nao encontrado." });
  }

  const admins = userModel.getAll().filter((u) => u.papel === "admin");
  if (alvo.papel === "admin" && admins.length === 1) {
    const erro = "Nao e possivel excluir o unico administrador do sistema.";
    if (wantsJson(req)) return res.status(409).json({ erro });
    return res.status(409).render("pages/message", {
      titulo: "Acao bloqueada",
      mensagem: erro,
      link: "/usuarios",
      textoLink: "Voltar"
    });
  }

  userModel.remove(req.params.id);

  // Se o usuario excluiu a propria conta, encerra a sessao.
  if (logado && logado.id === alvo.id) {
    return req.session.destroy(() => {
      if (wantsJson(req)) return res.status(204).end();
      res.redirect("/");
    });
  }

  if (wantsJson(req)) return res.status(204).end();
  res.redirect("/usuarios");
}

module.exports = { index, newForm, editForm, create, update, destroy };
